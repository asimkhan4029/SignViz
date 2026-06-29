from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_deafuser_profile_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='StreamJob',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_type', models.CharField(choices=[('youtube', 'YouTube'), ('local', 'Local')], max_length=10)),
                ('source_url', models.TextField()),
                ('youtube_id', models.CharField(blank=True, max_length=50, null=True)),
                ('title', models.CharField(default='Untitled', max_length=255)),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('chunking', 'Chunking'),
                        ('processing', 'Processing'),
                        ('completed', 'Completed'),
                        ('failed', 'Failed'),
                    ],
                    default='pending',
                    max_length=20,
                )),
                ('total_chunks', models.IntegerField(default=0)),
                ('completed_chunks', models.IntegerField(default=0)),
                ('error_message', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(
                    null=True,
                    blank=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='stream_jobs',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='StreamChunk',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chunk_index', models.IntegerField()),
                ('start_time', models.FloatField(default=0.0)),
                ('end_time', models.FloatField(default=0.0)),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('processing', 'Processing'),
                        ('ready', 'Ready'),
                        ('failed', 'Failed'),
                    ],
                    default='pending',
                    max_length=20,
                )),
                ('words', models.TextField(blank=True, null=True)),   # JSON list of sign words
                ('transcript', models.TextField(blank=True, null=True)),
                ('error_message', models.TextField(blank=True, null=True)),
                ('retry_count', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('job', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='chunks',
                    to='core.streamjob',
                )),
            ],
            options={'ordering': ['chunk_index']},
        ),
        migrations.AddConstraint(
            model_name='streamchunk',
            constraint=models.UniqueConstraint(
                fields=['job', 'chunk_index'],
                name='unique_chunk_per_job',
            ),
        ),
    ]
