from django.urls import path
from .views import get_notes, create_note, delete_note, search_notes, NoteUploadView

urlpatterns = [
    path('notes/', get_notes, name='get_notes'),
    path('notes/create/', create_note, name='create_note'),
    path('notes/delete/<int:note_id>/', delete_note, name='delete_note'),
    path('notes/search/', search_notes, name='search_notes'),  # New search endpoint
    path('notes/summarize/', NoteUploadView.as_view(), name='summarize_note'),  # New summarize endpoint
]