from django.db import models

# Create your models here.

class Skill(models.Model):
    name = models.CharField(max_length=50)
    proficiency = models.CharField(max_length=50, blank=False)  # e.g., Beginner, Intermediate, Expert

    def __str__(self):
        return self.name

class Project(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    link = models.URLField(blank=True)
    image = models.ImageField(upload_to='projects/', blank=False)
    skills = models.ManyToManyField(Skill, blank=False)

    def __str__(self):
        return self.title

class Experience(models.Model):
    title = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=False)
    link = models.URLField(blank=True)
    image = models.ImageField(upload_to='experiences/', blank=True)
    skills = models.ManyToManyField(Skill, blank=False)

    def __str__(self):
        return f"{self.title} at {self.company}"

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=False)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name}"

class Award(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateField()
    link = models.URLField(blank=True)
    image = models.ImageField(upload_to='awards/', blank=True)

    def __str__(self):
        return self.title
