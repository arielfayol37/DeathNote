from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('download_fayol_resume', views.download_resume, name='download_fayol_resume'),
] 