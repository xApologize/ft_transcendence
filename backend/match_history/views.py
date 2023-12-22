from .models import MatchHistory
from django.http import JsonResponse, HttpResponse, Http404, HttpResponseBadRequest, HttpRequest
from django.views import View
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
import json
from django.contrib.auth.hashers import check_password
from user_profile.models import User
from utils.functions import first_token
from utils.functions import get_user_obj, generate_2fa_token, decrypt_user_id
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.http import JsonResponse
import base64, qrcode
from io import BytesIO
from base64 import b64encode

# Create your views here.
class MatchHistoryView(View):
    @token_validation
    def post(self, request: HttpRequest):
        pass
    def get(self, request: HttpRequest):
        pass