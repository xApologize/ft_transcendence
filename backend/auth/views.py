from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from utils.decorators import token_validation
import json
from user_profile.models import User
from utils.functions import add_double_jwt, first_token, decrypt_user_id
from django.shortcuts import get_object_or_404

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
        access_jwt_token = request.headers.get("jwt-access")
        if access_jwt_token is None:
            return HttpResponse("Couldn't locate access jwt", status=401)
        decrypt_result: int = decrypt_user_id(access_jwt_token)
        if decrypt_result > 0:
            user = get_object_or_404(User, id=decrypt_result)
            # Check if status is not OFF ?
            user.status = "OFF"
            user.save()
            response : HttpResponse = HttpResponse('Logout Sucessful', status=200)
            response.delete_cookie('refresh_jwt')
            return response
        return HttpResponse('User not found', status=404)

        # login_data = json.loads(request.body)
        # nickname = login_data.get('username', '')
        # if not nickname:
        #     return JsonResponse({'error': 'No nickname given'}, status=400)
        # try:
        #     user = User.objects.get(nickname=nickname)
        # except User.DoesNotExist:
        #     return JsonResponse({'error': 'User not found in the database.'}, status=404)
        # user.status = "OFF"
        # user.save()
        # return JsonResponse({'success': 'Logout successful.'})

@method_decorator(csrf_exempt, name='dispatch')
class Token(View):
    @token_validation
    def get(self, request):
        return HttpResponse("Checkup if token valid")