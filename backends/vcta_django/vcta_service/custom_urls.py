from django.conf.urls import url

from . import custom_views

app_name = 'vcta_service_custom'
urlpatterns = [
    url(r'^dashboard/$', custom_views.Dashboard.as_view(), name='dashboard'),
    url(r'^membershiprequests/$', custom_views.TeamRequests.as_view(), name='teamrequests'),
    url(r'^membershiprequests/team/(?P<pk>\d+)$', custom_views.TeamRequestsForTeam.as_view(),
        name='teamrequestsforteam'),
    url(r'^membershiprequests/team/accept/(?P<pk>\d+)$', custom_views.AcceptTeamRequest.as_view(),
        name='acceptteamrequest'),
    url(r'^scoreboard/$', custom_views.Scoreboard.as_view(), name='scoreboard'),
    url(r'^trip/(?P<pk>\d+)$', custom_views.Trip.as_view(), name='trip'),
    url(r'^user/(?P<pk>\d+)$', custom_views.UserDetails.as_view(), name='userdetails'),
    url(r'^team/(?P<pk>\d+)$', custom_views.TeamDetails.as_view(), name='teamdetails'),
]
