# validator/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/validate/', views.validate, name='validate'),
    path('api/idea/<int:idea_id>/', views.get_idea, name='api_get_idea'),
    path('report/', views.report, name='report'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/idea/<int:idea_id>/', views.view_idea, name='view_idea'),
]