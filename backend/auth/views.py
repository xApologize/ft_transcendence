from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponse, Http404
from django.utils.decorators import method_decorator
from django.views import View
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
import json
from user_profile.models import User
from utils.functions import first_token
from utils.functions import get_user_obj
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.http import JsonResponse
import base64
import qrcode
from io import BytesIO

@method_decorator(csrf_exempt, name='dispatch')
class Auth2FA(View):
    @token_validation
    def post(self, request):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)
        
        if not TOTPDevice.objects.filter(user=user, confirmed=False).exists():
            # Create a new TOTP device
            device = TOTPDevice.objects.create(
                user=user, 
                name='default',
                confirmed=False  # Will be set to True after verification
            )

            # Generate the QR code
            secret_key = base64.b32encode(device.bin_key).decode('utf-8')
            img = qrcode.make(device.config_url(), image_factory=qrcode.image.svg.SvgImage)
            stream = BytesIO()
            img.save(stream)

            return JsonResponse({
                'qr_code': stream.getvalue().decode('utf-8'),  # SVG data can be sent directly as a string
                'secret_key': secret_key,  # Optionally send the secret key to the user
            })

        else:
            return JsonResponse({'error': '2FA is already enabled or pending confirmation.'}, status=400)


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

<<<<<<< HEAD
        if check_password(password, user.password) is False:
            return JsonResponse({'error': 'Invalid credentials.'}, status=400)
=======
        if user.password != password:
            return JsonResponse(errorMessage, status=400)
>>>>>>> main
        else:
            user.status = "ONL"
            user.save()
            response: HttpResponse = JsonResponse({'success': 'Login successful.'})
            primary_key = User.objects.get(nickname=nickname).pk
            return first_token(response, primary_key)


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

class Token(View):
    @token_validation
    def get(self, request):
        return HttpResponse("Checkup if token valid")