from django.db import models

# Create your models here.
class Note(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    embeddings = models.JSONField(default=list)  # Store vector embeddings
    timestamp = models.DateTimeField(auto_now_add=True)  # Timestamp when note is created

    def __str__(self):
        return f"{self.title} - {self.timestamp}"