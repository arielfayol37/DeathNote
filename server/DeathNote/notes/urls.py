from django.urls import path
from .views import chat, download_apk, get_notes, create_note, delete_note, search_notes, download_app, NoteUploadView

urlpatterns = [
    path('chat', chat, name='chat'),
    path('download', download_apk, name='download_apk'),
    path('download/<str:app_name>', download_app, name='download_app'),
    path('notes/', get_notes, name='get_notes'),
    path('notes/create/', create_note, name='create_note'),
    path('notes/delete/<int:note_id>/', delete_note, name='delete_note'),
    path('notes/search/', search_notes, name='search_notes'),  # New search endpoint
    path('notes/summarize/', NoteUploadView.as_view(), name='summarize_note'),  # New summarize endpoint
]