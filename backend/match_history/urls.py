from django.urls import path
from match_history.views import MatchHistoryView

urlpatterns = [
    path('', MatchHistoryView.as_view(), name="users"),
]
