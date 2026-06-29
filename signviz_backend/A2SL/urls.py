from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from . import streaming_views
from . import synonym_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('about/', views.about_view, name='about'),
    path('contact/', views.contact_view, name='contact'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('signup/', views.signup_view, name='signup'),
    path('animation/', views.animation_view, name='animation'),
    path('', views.home_view, name='home'),

    # ── Processing (legacy — kept for backward compat) ───────────────────────
    path('api/process_text', views.api_process_text, name='api_process_text'),
    path('api/process_video', views.api_process_video, name='api_process_video'),
    path('api/process_youtube', views.api_process_youtube, name='api_process_youtube'),
    path('api/remove_bg', views.api_remove_bg, name='api_remove_bg'),

    # ── Streaming Pipeline ───────────────────────────────────────────────────
    path('api/stream/start/', streaming_views.api_stream_start, name='api_stream_start'),
    path('api/stream/<int:job_id>/status/', streaming_views.api_stream_status, name='api_stream_status'),
    path('api/stream/<int:job_id>/chunk/<int:chunk_index>/', streaming_views.api_stream_chunk, name='api_stream_chunk'),
    path('api/stream/<int:job_id>/ready-chunks/', streaming_views.api_stream_ready_chunks, name='api_stream_ready_chunks'),
    path('api/stream/<int:job_id>/cancel/', streaming_views.api_stream_cancel, name='api_stream_cancel'),

    # ── Synonym Matching ─────────────────────────────────────────────────────
    path('api/synonyms/resolve/', synonym_views.api_resolve_synonym, name='api_resolve_synonym'),
    path('api/synonyms/all/', synonym_views.api_all_synonyms, name='api_all_synonyms'),

    # ── Auth ─────────────────────────────────────────────────────────────────
    path('api/signup', views.api_signup, name='api_signup'),
    path('api/login', views.api_login, name='api_login'),
    path('api/logout', views.api_logout, name='api_logout'),
    path('api/user', views.api_get_user, name='api_get_user'),

    # ── Profile Settings ──────────────────────────────────────────────────────
    path('api/update-profile/', views.api_update_profile, name='api_update_profile'),
    path('api/change-password/', views.api_change_password, name='api_change_password'),
    path('api/upload-avatar/', views.api_upload_avatar, name='api_upload_avatar'),

    # ── Library ──────────────────────────────────────────────────────────────
    path('api/library', views.api_get_library, name='api_get_library'),
    path('api/library/add', views.api_add_to_library, name='api_add_to_library'),
    path('api/library/delete/<int:item_id>', views.api_delete_from_library, name='api_delete_from_library'),

    # ── Save Video ───────────────────────────────────────────────────────────
    path('api/save-video/', views.api_save_video, name='api_save_video'),

    # ── Recents ──────────────────────────────────────────────────────────────
    path('api/recents/', views.api_get_recents, name='api_get_recents'),

    # ── Playlists ─────────────────────────────────────────────────────────────
    path('api/playlists/', views.api_get_playlists, name='api_get_playlists'),
    path('api/create-playlist/', views.api_create_playlist, name='api_create_playlist'),
    path('api/playlists/<int:playlist_id>/delete/', views.api_delete_playlist, name='api_delete_playlist'),
    path('api/playlists/<int:playlist_id>/videos/', views.api_get_playlist_videos, name='api_get_playlist_videos'),
    path('api/add-to-playlist/', views.api_add_to_playlist, name='api_add_to_playlist'),
    path('api/playlists/<int:playlist_id>/remove/<int:item_id>/', views.api_remove_from_playlist, name='api_remove_from_playlist'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
