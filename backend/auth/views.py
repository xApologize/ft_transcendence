from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from utils.decorators import token_validation
import json
from user_profile.models import User
from utils.functions import add_double_jwt

@method_decorator(csrf_exempt, name='dispatch')
class Login(View):
    def post(self, request):
        login_data = json.loads(request.body)
        nickname = login_data.get('username', '')
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
            return add_double_jwt(response, primary_key)

@method_decorator(csrf_exempt, name='dispatch')
class Logout(View):
    def post(self, request):
        login_data = json.loads(request.body)
        nickname = login_data.get('username', '')
        if not nickname:
            return JsonResponse({'error': 'No nickname given'}, status=400)
        try:
            user = User.objects.get(nickname=nickname)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found in the database.'}, status=404)
        user.status = "OFF"
        user.save()
        return JsonResponse({'success': 'Logout successful.'})