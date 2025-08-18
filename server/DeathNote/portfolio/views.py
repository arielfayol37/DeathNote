from django.shortcuts import render
from .models import Project, Experience, Skill, Award
from django.utils import timezone
import os
from django.http import FileResponse

# Create your views here.

def home(request):
    about_me = (
        "AI Engineer + researcher passionate about technology, "
        "problem-solving, and ultimately inventing solutions to real-world problems. Hit me up at fayol.ateufackzeudom@valpo.edu"
    )
    projects = Project.objects.all().order_by('-priority')
    experiences = Experience.objects.all().order_by('-start_date')
    skills = Skill.objects.all()
    awards = Award.objects.all().order_by('-date')

    context = {
        'about_me': about_me,
        'projects': projects,
        'skills': skills,
        'experiences': experiences,
        'awards': awards,
        'now': timezone.now(),
    }
    return render(request, 'portfolio/index.html', context)

def download_pdf(request, paper_title):
    """Download a PDF file"""
    pdf_path = os.path.join('static', 'pdfs', paper_title + ".pdf")
    return FileResponse(open(pdf_path, 'rb'), as_attachment=False, content_type='application/pdf')

def download_resume(request):
    """Download a PDF file"""
    pdf_path = os.path.join('static', 'pdfs', "fayol_resume.pdf")
    return FileResponse(open(pdf_path, 'rb'), as_attachment=False, content_type='application/pdf')