from django.http import JsonResponse, HttpResponse, Http404, HttpResponseBadRequest
from django.views import View
from utils.decorators import token_validation, verify_cookies
from django.core.exceptions import PermissionDenied
import json, random
from django.contrib.auth.hashers import check_password
from user_profile.models import User
from utils.functions import first_token, checkInputUser, get_user_obj, decrypt_user_id
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
            if not checkInputUser(data, ['otp_token']):
                return JsonResponse({'error': 'Invalid JSON.'}, status=400)
            otp_token = data.get('otp_token')
            if not otp_token:
                return JsonResponse({'error': 'Please enter a code.'}, status=400)
            elif len(otp_token) != 6 and not otp_token.isdigit():
                return JsonResponse({'error': 'Invalid Code.'}, status=400)
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
    @verify_cookies
    def post(self, request):
        errorMessage = {"error": "Invalid credentials."}
        login_data = json.loads(request.body)
        if not checkInputUser(login_data, ['nickname', 'password']):
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
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
            if not checkInputUser(data, ['otp_token']): # NEW
                return JsonResponse({'error': 'Invalid JSON.'}, status=400)
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
        
        if user.status == "ONL":
            return JsonResponse({'error': 'This account is already logged in.'}, status=409)

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

class LogoutSocket(View):
    @token_validation
    def post(self, request):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=401)
        # Check if status is not OFF ?
        # user.status = "OFF"
        # user.save()
        response : HttpResponse = HttpResponse('Logout Sucessful', status=200)
        return response

class Token(View):
    @token_validation
    def get(self, request):
        return HttpResponse("Checkup if token valid")
    

# Utiliser pip install request ou garder lib dégueulasse ?
class RemoteAuthToken(View):
    @verify_cookies
    def post(self, request):
        code = request.GET.get('code')
        if not code:
            return JsonResponse({'error': 'Missing authorization code'}, status=400)

        access_token = self.get_access_token(code)
        if access_token:
            user_info = self.get_user_info(access_token)
            if user_info:
                return self.handle_user(user_info)
        return JsonResponse({'error': 'Invalid authorization code'}, status=400)

    def get_access_token(self, code):
        token_url = 'https://api.intra.42.fr/oauth/token'
        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.AUTH42_CLIENT,
            'client_secret': settings.AUTH42_SECRET,
            'code': code,
            'redirect_uri': settings.AUTH42_REDIRECT_URI,
        }
        data = urllib.parse.urlencode(data).encode('ascii')
        req = urllib.request.Request(token_url, data)
        try:
            with urllib.request.urlopen(req) as response:
                response_data = json.loads(response.read())
                return response_data.get('access_token')
        except urllib.error.URLError as e:
            print('Error fetching access token:', e)
        return None

    def get_user_info(self, access_token):
        user_info_url = 'https://api.intra.42.fr/v2/me'
        headers = {'Authorization': f'Bearer {access_token}'}
        req = urllib.request.Request(user_info_url, headers=headers)
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read())
        except urllib.error.URLError as e:
            print('Error fetching user info:', e)
        return None

    def handle_user(self, user_info):
        intra_id = user_info.get('id')
        try:
            user = User.objects.get(intra_id=intra_id)
            return self.authenticate_user(user)
        except User.DoesNotExist:
            return self.create_user(user_info)

    def authenticate_user(self, user):
        response = JsonResponse({'success': 'Login successful.'})
        if user.two_factor_auth:
            return handle_2fa_login(user)
        if user.status == "ONL":
            return JsonResponse({'error': 'This account is already logged in.'}, status=409)
        return first_token(response, user.pk)

    def create_user(self, user_info):
        avatar_url = user_info.get('image', {}).get('versions', {}).get('large', '')
        try:
            avatar_data = urllib.request.urlopen(avatar_url).read()
        except Exception as e:
            return JsonResponse({'error': 'downloading avatar: ' + str(e)})

        nickname = user_info.get('login')
        email = user_info.get('email')
        intra_id = user_info.get('id')

        nickname = self.get_unique_nickname(nickname)
        user = User.objects.create(
            intra_id=intra_id,
            nickname=nickname,
            email=email,
            account_creation_method='intra'
        )
        new_file_name = f"user_{user.pk}.jpg"
        user.avatar.save(new_file_name, ContentFile(avatar_data))
        response = JsonResponse({'success': 'Login successful.'})
        return first_token(response, user.pk)
    def get_unique_nickname(self, nickname):
        unique_nickname = nickname
        while User.objects.filter(nickname=unique_nickname).exists():
            unique_nickname = f"{nickname}{random.randint(1, 9999)}"
        return unique_nickname
