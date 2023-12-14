from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponse, Http404, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
import json
from user_profile.models import User
from utils.functions import first_token
from utils.functions import get_user_obj
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

        # Retrieve the confirmed TOTP device for this user
        device = TOTPDevice.objects.filter(user=user).first()
        if device:
            # If the OTP token is valid, disable 2FA
            TOTPDevice.objects.filter(user=user).delete()  # Delete all TOTP devices
            # user.two_factor_auth = False  # Update the user model
            # user.save()
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

        otp_token = request.POST.get('otp_token')
        if not otp_token:
            return JsonResponse({'error': 'OTP token is required.'}, status=400)

        # Retrieve the unconfirmed TOTP device for this user
        device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
        if not device:
            return JsonResponse({'error': 'You have no pending 2FA confirmation.'}, status=400)
        if device.verify_token(otp_token):
            # If the OTP token is valid, confirm the device
            device.confirmed = True
            device.save()
            return JsonResponse({'success': '2FA has been enabled and confirmed.'})

        # OTP verification failed
        return JsonResponse({'error': 'Invalid OTP.'}, status=400)


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
        else:
            user.status = "ONL"
            user.save()
            response: HttpResponse = JsonResponse({'success': 'Login successful.'})
            primary_key = User.objects.get(nickname=nickname).pk
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