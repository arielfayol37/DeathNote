import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Note
from .serializers import NoteSerializer
from .utils import get_title, get_embedding  # Import your embedding function
import whisper 

transcription_model = whisper.load_model(name="large", device="cuda")

def cosine_similarity(vec1, vec2):
    """Compute the cosine similarity between two vectors"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)

    if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
        return 0  # Avoid division by zero

    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

@api_view(['GET'])
def search_notes(request):
    """Search notes based on content similarity using embeddings"""
    query = request.query_params.get('q', '')
    if not query:
        return Response({'error': 'Query parameter "q" is required'}, status=status.HTTP_400_BAD_REQUEST)

    query_embedding = get_embedding(query)  # Convert query to embedding
    notes = Note.objects.all()

    # Compute similarity for each note
    ranked_notes = [
        (note, cosine_similarity(query_embedding, note.embeddings))
        for note in notes
    ]

    # Sort notes by similarity score (highest first)
    ranked_notes.sort(key=lambda x: x[1], reverse=True)

    # Serialize and return only relevant notes (e.g., similarity > 0.5)
    relevant_notes = [note for note, score in ranked_notes if score > 0.5]
    serializer = NoteSerializer(relevant_notes, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def get_notes(request):
    """Retrieve all saved notes"""
    notes = Note.objects.all().order_by('-id')
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_note(request):
    """Create a new note with automatic title and embeddings"""
    content = request.data.get('content', '')
    if not content:
        return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)

    title = get_title(content)  # Generate title using your function
    embedding = get_embedding(content)  # Generate embedding

    note = Note.objects.create(title=title, content=content, embeddings=embedding)
    serializer = NoteSerializer(note)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def delete_note(request, note_id):
    """Delete a note by ID"""
    try:
        note = Note.objects.get(id=note_id)
        note.delete()
        return Response({'message': 'Note deleted'}, status=status.HTTP_204_NO_CONTENT)
    except Note.DoesNotExist:
        return Response({'error': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
