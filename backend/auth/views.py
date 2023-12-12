from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponse, Http404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
import json
from user_profile.models import User
from utils.functions import add_double_jwt, first_token, decrypt_user_id
from utils.functions import get_user_obj


@method_decorator(csrf_exempt, name='dispatch')
class Login(View):
    def post(self, request):
        login_data = json.loads(request.body)
        nickname = login_data.get('nickname', '')
        password = login_data.get('password', '')
 
        if not nickname or not password:
            return JsonResponse({'error': 'Both nickname and password are required.'}, status=400)

        try:
            user = User.objects.get(nickname=nickname)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found in the database.'}, status=404)

        if user.password != password:
            return JsonResponse({'error': 'Invalid credentials.'}, status=400)
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