from django.urls import path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('download_fayol_resume', views.download_resume, name='download_fayol_resume'),
    path('view_pdf/<str:paper_title>', views.download_pdf, name='download_pdf'),
    path('sitemap.xml', TemplateView.as_view(template_name='portfolio/sitemap.xml', content_type='application/xml'), name='sitemap'),
] 