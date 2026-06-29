from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import json


class DeafUser(AbstractUser):
    name = models.CharField(max_length=255, null=True, blank=True)
    profile_info = models.TextField(null=True, blank=True)
    profile_image = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class Video(models.Model):
    title = models.CharField(max_length=255)
    source_type = models.CharField(max_length=10, choices=[('local', 'Local'), ('youtube', 'YouTube')])
    video_url = models.TextField()
    youtube_id = models.CharField(max_length=50, null=True, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(DeafUser, on_delete=models.CASCADE, related_name='videos')

    def __str__(self):
        return self.title


class Conversion(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='conversions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    conversion_date = models.DateTimeField(auto_now_add=True)
    asl_video_url = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.video.title} - {self.status}"


class Library(models.Model):
    user = models.OneToOneField(DeafUser, on_delete=models.CASCADE, related_name='library')

    def __str__(self):
        return f"Library of {self.user.username}"


class LibraryItem(models.Model):
    library = models.ForeignKey(Library, on_delete=models.CASCADE, related_name='items')
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    course_name = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    # Avatar animation stored as JSON array of sign words
    avatar_data = models.TextField(null=True, blank=True)
    # When the user explicitly saved this item to their library
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent duplicate saves of the same video per library
        unique_together = ('library', 'video')
        ordering = ['-saved_at']
        indexes = [
            models.Index(fields=['library', '-saved_at']),
        ]

    def __str__(self):
        return f"{self.video.title} in {self.library.user.username}'s library"


class Playlist(models.Model):
    user = models.ForeignKey(DeafUser, on_delete=models.CASCADE, related_name='playlists')
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class PlaylistVideo(models.Model):
    """Many-to-many mapping between Playlist and LibraryItem (no video duplication)."""
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='playlist_videos')
    library_item = models.ForeignKey(LibraryItem, on_delete=models.CASCADE, related_name='playlist_entries')
    added_at = models.DateTimeField(auto_now_add=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('playlist', 'library_item')
        ordering = ['position', 'added_at']

    def __str__(self):
        return f"{self.library_item.video.title} in {self.playlist.name}"


class ExternalPlatformRequest(models.Model):
    platform_name = models.CharField(max_length=100)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='external_requests')
    request_date = models.DateTimeField(auto_now_add=True)
    conversion_status = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.platform_name} request for {self.video.title}"


# ─── Streaming Pipeline Models ────────────────────────────────────────────────

class StreamJob(models.Model):
    """
    Represents one streaming conversion job (one video URL).
    Tracks overall progress across all chunks.
    """
    SOURCE_CHOICES = [('youtube', 'YouTube'), ('local', 'Local')]
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('chunking',   'Chunking'),
        ('processing', 'Processing'),
        ('completed',  'Completed'),
        ('failed',     'Failed'),
    ]

    owner        = models.ForeignKey(
        'DeafUser', null=True, blank=True,
        on_delete=models.CASCADE, related_name='stream_jobs'
    )
    source_type  = models.CharField(max_length=10, choices=SOURCE_CHOICES)
    source_url   = models.TextField()
    youtube_id   = models.CharField(max_length=50, null=True, blank=True)
    title        = models.CharField(max_length=255, default='Untitled')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_chunks     = models.IntegerField(default=0)
    completed_chunks = models.IntegerField(default=0)
    error_message    = models.TextField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"StreamJob({self.id}) {self.title} [{self.status}]"

    @property
    def progress_pct(self):
        if self.total_chunks == 0:
            return 0
        return round(self.completed_chunks / self.total_chunks * 100)


class StreamChunk(models.Model):
    """
    One 15-20 second audio/video chunk within a StreamJob.
    Stores the resulting ASL sign-word list once processed.
    """
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('processing', 'Processing'),
        ('ready',      'Ready'),
        ('failed',     'Failed'),
    ]

    job          = models.ForeignKey(StreamJob, on_delete=models.CASCADE, related_name='chunks')
    chunk_index  = models.IntegerField()          # 0-based ordering
    start_time   = models.FloatField(default=0.0) # seconds into source video
    end_time     = models.FloatField(default=0.0)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    words        = models.TextField(null=True, blank=True)   # JSON list of sign words
    animation_data = models.TextField(null=True, blank=True) # JSON list of SyncEntry dicts
    transcript   = models.TextField(null=True, blank=True)   # raw transcript text
    error_message = models.TextField(null=True, blank=True)
    retry_count  = models.IntegerField(default=0)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['chunk_index']
        constraints = [
            models.UniqueConstraint(fields=['job', 'chunk_index'], name='unique_chunk_per_job')
        ]

    def __str__(self):
        return f"Chunk {self.chunk_index} of Job {self.job_id} [{self.status}]"

    def get_words(self):
        """Return words as Python list."""
        if not self.words:
            return []
        try:
            return json.loads(self.words)
        except Exception:
            return []

    def set_words(self, word_list):
        self.words = json.dumps(word_list)

    def get_animation_data(self):
        """Return animation_data as Python list."""
        if not self.animation_data:
            return []
        try:
            return json.loads(self.animation_data)
        except Exception:
            return []

    def set_animation_data(self, data):
        self.animation_data = json.dumps(data)
