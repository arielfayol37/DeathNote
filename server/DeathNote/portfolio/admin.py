from django.contrib import admin
from .models import Skill, Project, Experience, ContactMessage, Award, Certificate

# Register your models here.

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'proficiency')
    search_fields = ('name',)
    list_filter = ('proficiency',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'demo_type', 'priority')
    list_filter = ('type', 'demo_type', 'priority')
    search_fields = ('title', 'description')
    filter_horizontal = ('skills',)
    list_editable = ('priority',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'type', 'priority')
        }),
        ('Media & Links', {
            'fields': ('image', 'link', 'demo_url', 'demo_type', 'paper_url')
        }),
        ('Skills', {
            'fields': ('skills',)
        }),
    )

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'start_date', 'end_date')
    list_filter = ('start_date', 'end_date')
    search_fields = ('title', 'company', 'description')
    filter_horizontal = ('skills',)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'sent_at')
    list_filter = ('sent_at',)
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('sent_at',)

@admin.register(Award)
class AwardAdmin(admin.ModelAdmin):
    list_display = ('title', 'date')
    list_filter = ('date',)
    search_fields = ('title', 'description')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('title', 'issuer', 'date')
    list_filter = ('date', 'issuer')
    search_fields = ('title', 'issuer', 'description')
