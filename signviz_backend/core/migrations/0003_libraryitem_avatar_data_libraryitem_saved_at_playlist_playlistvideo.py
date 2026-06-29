from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_deafuser_name'),
    ]

    operations = [
        # Add avatar_data to LibraryItem
        migrations.AddField(
            model_name='libraryitem',
            name='avatar_data',
            field=models.TextField(blank=True, null=True),
        ),
        # Add saved_at to LibraryItem
        migrations.AddField(
            model_name='libraryitem',
            name='saved_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        # Add unique_together constraint to LibraryItem
        migrations.AlterUniqueTogether(
            name='libraryitem',
            unique_together={('library', 'video')},
        ),
        # Add ordering and index to LibraryItem
        migrations.AlterModelOptions(
            name='libraryitem',
            options={'ordering': ['-saved_at']},
        ),
        migrations.AddIndex(
            model_name='libraryitem',
            index=models.Index(fields=['library', '-saved_at'], name='core_librar_library_saved_idx'),
        ),
        # Create Playlist model
        migrations.CreateModel(
            name='Playlist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='playlists',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        # Create PlaylistVideo model
        migrations.CreateModel(
            name='PlaylistVideo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('position', models.PositiveIntegerField(default=0)),
                ('playlist', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='playlist_videos',
                    to='core.playlist',
                )),
                ('library_item', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='playlist_entries',
                    to='core.libraryitem',
                )),
            ],
            options={
                'ordering': ['position', 'added_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='playlistvideo',
            unique_together={('playlist', 'library_item')},
        ),
    ]
