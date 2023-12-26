from django.http import JsonResponse, HttpResponse, Http404, HttpResponseBadRequest
from django.views import View
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
import json
from django.contrib.auth.hashers import check_password
from user_profile.models import User
from utils.functions import first_token
from utils.functions import get_user_obj, generate_2fa_token, decrypt_user_id
from django_otp.plugins.otp_totp.models import TOTPDevice
import base64, qrcode
from io import BytesIO
from base64 import b64encode
from django.conf import settings
from django.core.files.base import ContentFile
import urllib.parse
import urllib.request
from .utils import handle_2fa_login

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
            'info': device_info
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

        if check_password(password, user.password) is False:
            return JsonResponse(errorMessage, status=400)
        elif user.two_factor_auth == True:
            return handle_2fa_login(user)
            # response = JsonResponse({'2fa_required': True})
            # temp_token = generate_2fa_token(user.id)
            # response.set_cookie('2fa_token', temp_token, httponly=True, secure=True, max_age=300)
        elif user.status == "ONL":
            return JsonResponse({'error': 'This account is already logged in.'}, status=409)
        else:
            response: HttpResponse = JsonResponse({'success': 'Login successful.'})
            primary_key = User.objects.get(nickname=nickname).pk
            return first_token(response, primary_key)


class Login2FA(View):
    def post(self, request):
        errorTime = {'error': '2FA verification time expired. Please try again.'}
        errorCode = {'error': 'Invalid 2FA Code.'}
        token = request.COOKIES.get('2fa_token')
        if not token:
            return JsonResponse(errorTime, status=404)
    
        user_id = decrypt_user_id(token)
        if user_id in [-1, -2]:
            response : HttpResponse = JsonResponse(errorTime, 404)
            response.delete_cookie('2fa_token')
            return response
    
        try:
            data = json.loads(request.body)
            otp_token = data.get('otp_token')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        
        if not otp_token or not otp_token.isdigit() or len(otp_token) != 6:
            return JsonResponse({'error': 'Invalid 2FA Code.'}, status=400)
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            response : HttpResponse = JsonResponse({'error': 'This account does not exist.'}, 404)
            response.delete_cookie('2fa_token')
            return response
        
        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        if not device:
            response : HttpResponse = JsonResponse({'error': '2FA device not found or not confirmed.'}, 404)
            response.delete_cookie('2fa_token')
            return response
        
        if user.status == "ONL":
            return JsonResponse({'error': 'This account is already logged in.'}, status=409)
        elif device.verify_token(otp_token):
            response: HttpResponse = JsonResponse({'success': 'Login successful.'})
            response.delete_cookie('2fa_token')
            primary_key = User.objects.get(nickname=user.nickname).pk
            return first_token(response, primary_key)
        else:
            return JsonResponse(errorCode, status=400)
            
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
        # user.status = "OFF"
        # user.save()
        response : HttpResponse = HttpResponse('Logout Sucessful', status=200)
        response.delete_cookie('refresh_jwt')
        return response

class Token(View):
    @token_validation
    def get(self, request):
        return HttpResponse("Checkup if token valid")
    

# Utiliser pip install request ou garder lib dégueulasse ?
class RemoteAuthToken(View):
    def post(self, request):
        code = request.GET.get('code')

        if not code:
            return JsonResponse({'error': 'Missing authorization code'}, status=400)

        token_url = 'https://api.intra.42.fr/oauth/token'
        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.AUTH42_CLIENT,
            'client_secret': settings.AUTH42_SECRET,
            'code': code,
            'redirect_uri': 'https://localhost/callback',
        }

        data = urllib.parse.urlencode(data)
        data = data.encode('ascii')
        req = urllib.request.Request(token_url, data)
        try:
            with urllib.request.urlopen(req) as response:
                response_data = json.loads(response.read())
                access_token = response_data.get('access_token')

                if access_token:
                    user_info_url = 'https://api.intra.42.fr/v2/me'
                    headers = {'Authorization': f'Bearer {access_token}'}
                    req = urllib.request.Request(user_info_url, headers=headers)

                    with urllib.request.urlopen(req) as response:
                        user_info = json.loads(response.read())
                        intra_id = user_info.get('id')

                        try:
                            user = User.objects.get(intra_id=intra_id)
                            response: HttpResponse = JsonResponse({'success': 'Login successful.'})
                            if user.two_factor_auth == True:
                                return handle_2fa_login(user)
                            return first_token(response, user.pk)
                        except User.DoesNotExist:
                            avatar_url = user_info.get('image', {}).get('versions', {}).get('large', '')
                            try:
                                avatar_response = urllib.request.urlopen(avatar_url)
                                avatar_data = avatar_response.read()
                            except Exception as e:
                                return HttpResponseBadRequest('Error downloading avatar: ' + str(e))
                            user = User.objects.create(
                                intra_id=intra_id,
                                nickname=user_info.get('login'),
                                email=user_info.get('email'),
                                account_creation_method='intra'
                            )
                            new_file_name = f"user_{user.pk}.jpg"
                            user.avatar.save(new_file_name, ContentFile(avatar_data))
                            response: HttpResponse = JsonResponse({'success': 'Login successful.'})
                            return first_token(response, user.pk)


        except urllib.error.URLError as e:
            return JsonResponse({'error': str(e.reason)}, status=400)
        return JsonResponse({'error': 'Invalid authorization code'}, status=400)