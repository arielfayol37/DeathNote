from django.urls import path
from .views import index, download_pdf, get_employees, get_lawnmowers, lawnmower_data, employee_stat

urlpatterns = [
    path('', index, name='home'),
    path('papers/download/<str:paper_title>', download_pdf, name="download_pdf"),
    path('lawnmower/employees', get_employees, name='lawnmower_employees'),
    path('lawnmower/lawnmowers', get_lawnmowers, name='lawnmower_lawnmowers'),
    path('lawnmower', lawnmower_data, name='lawnmower_data'),
    path("lawnmower/employee_stat/<int:employee_id>", employee_stat, name="employee_stat"),
]