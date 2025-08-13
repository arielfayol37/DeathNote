from django.shortcuts import render
from .models import Project, Experience, Skill, Award

# Create your views here.

def home(request):
    about_me = (
        "Engineer + researcher passionate about technology, "
        "problem-solving, and ultimately inventing solutions to real-world problems. Hit me up at arielfayol1@gmail.com"
    )
    projects = Project.objects.all()[:3]  # Show top 3 projects
    experiences = Experience.objects.all().order_by('-start_date')
    skills = Skill.objects.all()
    awards = Award.objects.all().order_by('-date')

    context = {
        'about_me': about_me,
        'projects': projects,
        'experiences': experiences,
        'skills': skills,
        'awards': awards,
    }
    return render(request, 'portfolio/index.html', context)
