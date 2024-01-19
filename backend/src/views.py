from django.views import View
from django.conf import settings
from django.http import HttpResponse, HttpRequest, JsonResponse

class InitLoginPage(View):
    def get(self, request: HttpRequest):
        link = settings.AUTH42_LINK
        return JsonResponse({'intra_link': link})