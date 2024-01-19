from django.urls import path
from match_history.views import MatchHistoryView, MatchTournament

urlpatterns = [
    path('', MatchHistoryView.as_view(), name="matchHistory"),
    path('tournament/', MatchTournament.as_view(), name='tournamentMatch'),
]
