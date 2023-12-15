from django.http import JsonResponse, HttpResponse, Http404, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
import json
from user_profile.models import User
from utils.functions import first_token
from utils.functions import get_user_obj, generate_2fa_token, decrypt_user_id
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.http import JsonResponse
import base64, qrcode
from io import BytesIO
from base64 import b64encode

@method_decorator(csrf_exempt, name='dispatch')
class Create2FA(View):
    @token_validation
    def post(self, request):
        try:
            user = get_user_obj(request)
            if "demo-user" == user.nickname or "demo-user2" == user.nickname:
                return HttpResponseBadRequest('Demo user cannot enable 2FA.') # 400
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)

        # Check if a TOTP device exists for the user
        device = TOTPDevice.objects.filter(user=user).first()
        device_info = ""

        if device and device.confirmed:
            return HttpResponseBadRequest("2FA is already enabled and confirmed.")

        if not device:
            # Create a new TOTP device if none exists
            device = TOTPDevice.objects.create(
                user=user,
                name='default',
                confirmed=False
            )
        device_info = "Enter the code on your Auth app to confirm 2FA on your account"


        # Generate QR code for the device
        secret_key = base64.b32encode(device.bin_key).decode('utf-8')
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(device.config_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        stream = BytesIO()
        img.save(stream, format="PNG")
        stream.seek(0)
        qr_code_base64 = b64encode(stream.getvalue()).decode('utf-8')

        return JsonResponse({
            'qr_code': f"data:image/png;base64,{qr_code_base64}",
            'secret_key': secret_key,
            'confirm': device.confirmed,
            'info': device_info  # Include information about the device's status
        })

    @token_validation
    def delete(self, request):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)

        # otp_token = request.POST.get('otp_token')
        # if not otp_token:
        #     return JsonResponse({'error': 'OTP token is required.'}, status=400)

        device = TOTPDevice.objects.filter(user=user).first()
        if device:
            TOTPDevice.objects.filter(user=user).delete()  # Delete all TOTP devices
            user.two_factor_auth = False
            user.save()
            return JsonResponse({'success': '2FA has been disabled.'})

        return JsonResponse({'error': 'There is no 2FA on this account.'}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class Confirm2FA(View):
    @token_validation
    def post(self, request):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)

        try:
            data = json.loads(request.body)
            otp_token = data.get('otp_token')
            if not otp_token:
                return JsonResponse({'error': 'Please enter a code.'}, status=400)
            elif len(otp_token) != 6 and not otp_token.isdigit():
                return JsonResponse({'error': 'Invalid code.'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)

        device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
        if not device:
            return JsonResponse({'error': 'You have no pending 2FA confirmation.'}, status=400)
        if device.verify_token(otp_token):
            user.two_factor_auth = True
            user.save()
            device.confirmed = True
            device.save()
            return JsonResponse({'success': '2FA has been enabled and confirmed.'})

        return JsonResponse({'error': 'Invalid Code.'}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class Login(View):
    def post(self, request):
        errorMessage = {"error": "Invalid credentials."}
        login_data = json.loads(request.body)
        nickname = login_data.get('nickname', '')
        password = login_data.get('password', '')
 
        if not nickname or not password:
            return JsonResponse({'error': 'Both nickname and password are required.'}, status=400)

        try:
            user = User.objects.get(nickname=nickname)
        except User.DoesNotExist:
            return JsonResponse(errorMessage, status=400)

        if user.password != password:
            return JsonResponse(errorMessage, status=400)
        if user.two_factor_auth == True:
            response = JsonResponse({'2fa_required': True})
            temp_token = generate_2fa_token(user.id)
            response.set_cookie('2fa_token', temp_token, httponly=True, secure=True, max_age=300)
            return response
        else:
            user.status = "ONL"
            user.save()
            response: HttpResponse = JsonResponse({'success': 'Login successful.'})
            primary_key = User.objects.get(nickname=nickname).pk
            return first_token(response, primary_key)


@method_decorator(csrf_exempt, name='dispatch')
class Login2FA(View):
    def post(self, request):
        errorTime = {'error': '2FA verification time expired. Please try again.'}
        errorCode = {'error': 'Invalid 2FA Code.'}
        token = request.COOKIES.get('2fa_token')
        if not token:
            return JsonResponse(errorTime, status=404)
    
        user_id = decrypt_user_id(token)
        # Put more specific error message?
        if (user_id == -1):
            return JsonResponse(errorTime, status=404)
        elif (user_id == -2):
            return JsonResponse(errorTime, status=404)
    
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        
        otp_token = data.get('otp_token')
        if not otp_token:
            return JsonResponse({'error': 'Please enter 2FA Code.'}, status=400)
        elif otp_token.isdigit() == False or len(otp_token) != 6:
            return JsonResponse(errorCode, status=400)
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'This account does not exist.'}, status=404)
        
        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        if not device:
            return JsonResponse({'error': '2FA device not found or not confirmed.'}, status=404)
        
        if not device.verify_token(otp_token):
            return JsonResponse(errorCode, status=400)
        else:
            user.status = "ONL"
            user.save()
            response: HttpResponse = JsonResponse({'success': 'Login successful.'})
            primary_key = User.objects.get(nickname=user.nickname).pk
            return first_token(response, primary_key)
            
        
@method_decorator(csrf_exempt, name='dispatch')
class Logout(View):
    @token_validation
    def post(self, request):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)
        # Check if status is not OFF ?
        user.status = "OFF"
        user.save()
        response : HttpResponse = HttpResponse('Logout Sucessful', status=200)
        response.delete_cookie('refresh_jwt')
        return response

@method_decorator(csrf_exempt, name='dispatch')
class Token(View):
    @token_validation
    def get(self, request):
        return HttpResponse("Checkup if token valid")