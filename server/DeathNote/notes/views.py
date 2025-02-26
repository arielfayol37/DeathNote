import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Note
from .serializers import NoteSerializer
from .utils import get_title, get_embedding, handle_uploaded_file, describe_image, transcribe_audio, parse_entry
import whisper 
from rest_framework.views import APIView
import json

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


class NoteUploadView(APIView):
    """
    Expects a multipart/form-data POST with:
      - noteData (JSON string) containing:
            {
              "timestamp": "1677158025412",
              "items": [
                { "type": "text", "text": "Hello..." },
                { "type": "image", "fieldName": "file_0" },
                { "type": "audio", "fieldName": "file_1", "duration": 3.21 },
                ...
              ]
            }
      - file_0, file_1, ... (UploadedFiles) 
    """

    def post(self, request):

        # 1) Extract the noteData JSON from the form
        note_data_str = request.data.get('noteData')
        if not note_data_str:
            return Response({"error": "Missing noteData field"}, status=status.HTTP_400_BAD_REQUEST)

        note_data = json.loads(note_data_str)
        items = note_data.get('items', [])
        timestamp = note_data.get('timestamp', None)

        # 2) Pre-process items into a list of results, preserving order
        results = [None] * len(items)  # Placeholder for results in original order

        # Process all text items first
        for i, item in enumerate(items):
            if item.get('type') == 'text':
                text = item.get('text', '')
                results[i] = text + "\n\n"

        # Process all image items in one batch
        image_indices = [i for i, item in enumerate(items) if item.get('type') == 'image']
        for i in image_indices:
            item = items[i]
            field_name = item.get('fieldName')
            if field_name not in request.FILES:
                results[i] = ""  # Handle missing file gracefully
                continue
            uploaded_file = request.FILES[field_name]
            saved_path = handle_uploaded_file(uploaded_file)
            image_text = describe_image(saved_path)
            results[i] = "<image description start> " + image_text + "<image description end>\n\n"

        # Process all audio items in one batch
        audio_indices = [i for i, item in enumerate(items) if item.get('type') == 'audio']
        for i in audio_indices:
            item = items[i]
            field_name = item.get('fieldName')
            if field_name not in request.FILES:
                results[i] = ""  # Handle missing file gracefully
                continue
            uploaded_file = request.FILES[field_name]
            saved_path = handle_uploaded_file(uploaded_file)
            audio_text = transcribe_audio(transcription_model, saved_path)
            results[i] = "<audio transcription start>" + audio_text + "<audio transcription end>\n\n"

        # Combine results in original order
        raw_text = "".join(r if r is not None else "" for r in results)
        title, summary = parse_entry(raw_text)
        # 3) Return a success response
        return Response({
            "summary": summary,
            "timestamp": timestamp,
            "raw_text": raw_text.strip(),
            "title": title,
        }, status=status.HTTP_200_OK)

