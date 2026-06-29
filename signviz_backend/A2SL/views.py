from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login,logout
from core.models import DeafUser, Video, Conversion, Library, LibraryItem, Playlist, PlaylistVideo
from core.forms import DeafUserCreationForm
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk
from django.contrib.auth import authenticate
from django.contrib.staticfiles import finders
from django.contrib.auth.decorators import login_required

def home_view(request):
	return render(request,'home.html')


def about_view(request):
	return render(request,'about.html')


def contact_view(request):
	return render(request,'contact.html')

@login_required(login_url="login")
def animation_view(request):
	if request.method == 'POST':
		text = request.POST.get('sen')
		#tokenizing the sentence
		text.lower()
		#tokenizing the sentence
		words = word_tokenize(text)

		tagged = nltk.pos_tag(words)
		tense = {}
		tense["future"] = len([word for word in tagged if word[1] == "MD"])
		tense["present"] = len([word for word in tagged if word[1] in ["VBP", "VBZ","VBG"]])
		tense["past"] = len([word for word in tagged if word[1] in ["VBD", "VBN"]])
		tense["present_continuous"] = len([word for word in tagged if word[1] in ["VBG"]])



		#stopwords that will be removed
		stop_words = set(["mightn't", 're', 'wasn', 'wouldn', 'be', 'has', 'that', 'does', 'shouldn', 'do', "you've",'off', 'for', "didn't", 'm', 'ain', 'haven', "weren't", 'are', "she's", "wasn't", 'its', "haven't", "wouldn't", 'don', 'weren', 's', "you'd", "don't", 'doesn', "hadn't", 'is', 'was', "that'll", "should've", 'a', 'then', 'the', 'mustn', 'i', 'nor', 'as', "it's", "needn't", 'd', 'am', 'have',  'hasn', 'o', "aren't", "you'll", "couldn't", "you're", "mustn't", 'didn', "doesn't", 'll', 'an', 'hadn', 'whom', 'y', "hasn't", 'itself', 'couldn', 'needn', "shan't", 'isn', 'been', 'such', 'shan', "shouldn't", 'aren', 'being', 'were', 'did', 'ma', 't', 'having', 'mightn', 've', "isn't", "won't"])



		#removing stopwords and applying lemmatizing nlp process to words
		lr = WordNetLemmatizer()
		from A2SL.sync_pipeline import find_animation
		filtered_text = []
		for w,p in zip(words,tagged):
			if w not in stop_words:
				if find_animation(w):
					filtered_text.append(w)
				else:
					if p[1]=='VBG' or p[1]=='VBD' or p[1]=='VBZ' or p[1]=='VBN' or p[1]=='NN':
						filtered_text.append(lr.lemmatize(w,pos='v'))
					elif p[1]=='JJ' or p[1]=='JJR' or p[1]=='JJS'or p[1]=='RBR' or p[1]=='RBS':
						filtered_text.append(lr.lemmatize(w,pos='a'))
					else:
						filtered_text.append(lr.lemmatize(w))


		#adding the specific word to specify tense
		words = filtered_text
		temp=[]
		for w in words:
			if w=='I':
				temp.append('Me')
			else:
				temp.append(w)
		words = temp
		probable_tense = max(tense,key=tense.get)

		if probable_tense == "past" and tense["past"]>=1:
			temp = ["Before"]
			temp = temp + words
			words = temp
		elif probable_tense == "future" and tense["future"]>=1:
			if "Will" not in words:
					temp = ["Will"]
					temp = temp + words
					words = temp
			else:
				pass
		elif probable_tense == "present":
			if tense["present_continuous"]>=1:
				temp = ["Now"]
				temp = temp + words
				words = temp


		from A2SL.sync_pipeline import find_animation

		filtered_text = []
		for w in words:
			match = find_animation(w)
			if match:
				filtered_text.append(match)
			else:
				for c in w:
					filtered_text.append(c)
		words = filtered_text


		return render(request,'animation.html',{'words':words,'text':text})
	else:
		return render(request,'animation.html')




def signup_view(request):
	if request.method == 'POST':
		form = DeafUserCreationForm(request.POST)
		if form.is_valid():
			user = form.save()
			# Initialize library for the new user
			Library.objects.get_or_create(user=user)
			login(request,user)
			# log the user in
			return redirect('animation')
	else:
		form = DeafUserCreationForm()
	return render(request,'signup.html',{'form':form})



def login_view(request):
	if request.method == 'POST':
		form = AuthenticationForm(data=request.POST)
		if form.is_valid():
			#log in user
			user = form.get_user()
			login(request,user)
			if 'next' in request.POST:
				return redirect(request.POST.get('next'))
			else:
				return redirect('animation')
	else:
		form = AuthenticationForm()
	return render(request,'login.html',{'form':form})


def logout_view(request):
	logout(request)
	return redirect("home")


from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse

@csrf_exempt
def process_text_into_words(text):
	# tokenizing the sentence
	text_lower = text.lower()
	words = word_tokenize(text_lower)

	tagged = nltk.pos_tag(words)
	tense = {}
	tense["future"] = len([word for word in tagged if word[1] == "MD"])
	tense["present"] = len([word for word in tagged if word[1] in ["VBP", "VBZ","VBG"]])
	tense["past"] = len([word for word in tagged if word[1] in ["VBD", "VBN"]])
	tense["present_continuous"] = len([word for word in tagged if word[1] in ["VBG"]])

	stop_words = set(["mightn't", 're', 'wasn', 'wouldn', 'be', 'has', 'that', 'does', 'shouldn', 'do', "you've",'off', 'for', "didn't", 'm', 'ain', 'haven', "weren't", 'are', "she's", "wasn't", 'its', "haven't", "wouldn't", 'don', 'weren', 's', "you'd", "don't", 'doesn', "hadn't", 'is', 'was', "that'll", "should've", 'a', 'then', 'the', 'mustn', 'i', 'nor', 'as', "it's", "needn't", 'd', 'am', 'have',  'hasn', 'o', "aren't", "you'll", "couldn't", "you're", "mustn't", 'didn', "doesn't", 'll', 'an', 'hadn', 'whom', 'y', "hasn't", 'itself', 'couldn', 'needn', "shan't", 'isn', 'been', 'such', 'shan', "shouldn't", 'aren', 'being', 'were', 'did', 'ma', 't', 'having', 'mightn', 've', "isn't", "won't"])

	lr = WordNetLemmatizer()
	from A2SL.sync_pipeline import find_animation
	filtered_text = []
	for w,p in zip(words,tagged):
		if w not in stop_words:
			if find_animation(w):
				filtered_text.append(w)
			else:
				if p[1]=='VBG' or p[1]=='VBD' or p[1]=='VBZ' or p[1]=='VBN' or p[1]=='NN':
					filtered_text.append(lr.lemmatize(w,pos='v'))
				elif p[1]=='JJ' or p[1]=='JJR' or p[1]=='JJS'or p[1]=='RBR' or p[1]=='RBS':
					filtered_text.append(lr.lemmatize(w,pos='a'))
				else:
					filtered_text.append(lr.lemmatize(w))

	words = filtered_text
	temp=[]
	for w in words:
		if w.upper() == 'I':
			temp.append('ME')
		else:
			# Capitalize to match file names
			temp.append(w.capitalize())
	words = temp

	# For empty arrays avoid max() error
	if tense:
		probable_tense = max(tense,key=tense.get)
	else:
		probable_tense = "present"

	if probable_tense == "past" and tense["past"]>=1:
		temp = ["Before"]
		temp = temp + words
		words = temp
	elif probable_tense == "future" and tense["future"]>=1:
		if "Will" not in words:
				temp = ["Will"]
				temp = temp + words
				words = temp
		else:
			pass
	elif probable_tense == "present":
		if tense["present_continuous"]>=1:
			temp = ["Now"]
			temp = temp + words
			words = temp

	from A2SL.sync_pipeline import find_animation

	filtered_text = []
	for w in words:
		match = find_animation(w)
		if match:
			filtered_text.append(match)
		else:
			for c in w:
				# To handle individual letters as characters
				filtered_text.append(c.upper())
	
	words = filtered_text
	return words


def process_text_into_word_pairs(text):
	"""
	Same as process_text_into_words but returns list of
	{'original': spoken_word, 'animation': dataset_word}
	so the frontend can show the original word in subtitles
	while playing the correct animation file.
	"""
	from A2SL.sync_pipeline import find_animation

	text_lower = text.lower()
	words = word_tokenize(text_lower)
	tagged = nltk.pos_tag(words)

	tense = {}
	tense["future"] = len([word for word in tagged if word[1] == "MD"])
	tense["present"] = len([word for word in tagged if word[1] in ["VBP", "VBZ","VBG"]])
	tense["past"] = len([word for word in tagged if word[1] in ["VBD", "VBN"]])
	tense["present_continuous"] = len([word for word in tagged if word[1] in ["VBG"]])

	stop_words = set(["mightn't", 're', 'wasn', 'wouldn', 'be', 'has', 'that', 'does', 'shouldn', 'do', "you've",'off', 'for', "didn't", 'm', 'ain', 'haven', "weren't", 'are', "she's", "wasn't", 'its', "haven't", "wouldn't", 'don', 'weren', 's', "you'd", "don't", 'doesn', "hadn't", 'is', 'was', "that'll", "should've", 'a', 'then', 'the', 'mustn', 'i', 'nor', 'as', "it's", "needn't", 'd', 'am', 'have',  'hasn', 'o', "aren't", "you'll", "couldn't", "you're", "mustn't", 'didn', "doesn't", 'll', 'an', 'hadn', 'whom', 'y', "hasn't", 'itself', 'couldn', 'needn', "shan't", 'isn', 'been', 'such', 'shan', "shouldn't", 'aren', 'being', 'were', 'did', 'ma', 't', 'having', 'mightn', 've', "isn't", "won't"])

	lr = WordNetLemmatizer()
	filtered_text = []
	for w, p in zip(words, tagged):
		if w not in stop_words:
			if find_animation(w):
				filtered_text.append(w)
			else:
				if p[1] in ('VBG','VBD','VBZ','VBN','NN'):
					filtered_text.append(lr.lemmatize(w, pos='v'))
				elif p[1] in ('JJ','JJR','JJS','RBR','RBS'):
					filtered_text.append(lr.lemmatize(w, pos='a'))
				else:
					filtered_text.append(lr.lemmatize(w))

	words = ['ME' if w.upper() == 'I' else w.capitalize() for w in filtered_text]

	if tense:
		probable_tense = max(tense, key=tense.get)
	else:
		probable_tense = "present"

	if probable_tense == "past" and tense["past"] >= 1:
		words = ["Before"] + words
	elif probable_tense == "future" and tense["future"] >= 1 and "Will" not in words:
		words = ["Will"] + words
	elif probable_tense == "present" and tense["present_continuous"] >= 1:
		words = ["Now"] + words

	pairs = []
	for w in words:
		match = find_animation(w)
		if match:
			pairs.append({'original': w, 'animation': match})
		else:
			for c in w:
				pairs.append({'original': c.upper(), 'animation': c.upper()})

	return pairs

@csrf_exempt
def api_process_text(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			text = data.get('text', '')
		except json.JSONDecodeError:
			return JsonResponse({'error': 'Invalid JSON'}, status=400)

		if not text:
			return JsonResponse({'words': [], 'text': ''})

		words = process_text_into_words(text)
		
		# Return words as list of videos/letters
		return JsonResponse({'words': words, 'text': text})
	else:
		return JsonResponse({'error': 'Method not allowed'}, status=405)

import tempfile
import os
from moviepy import VideoFileClip
import speech_recognition as sr
from A2SL.sync_pipeline import (
    transcribe_with_timestamps,
    process_words_to_signs,
    build_sync_sequence,
    render_avatar_video,
    run_full_pipeline,
)

def _extract_audio(video_path: str, audio_path: str):
    """Extract audio from video file to WAV."""
    clip = VideoFileClip(video_path)
    if clip.audio is None:
        clip.close()
        raise ValueError("The provided video file has no audio track.")
    clip.audio.write_audiofile(audio_path, codec='pcm_s16le', logger=None)
    clip.close()


def _pipeline_result_to_response(result: dict, video_obj, conv_obj) -> dict:
    """Convert pipeline result to API response dict and update DB records."""
    words = result["words"]
    sync_seq = result["sync_sequence"]

    if conv_obj:
        conv_obj.status = 'completed'
        conv_obj.asl_video_url = json.dumps(words)
        conv_obj.save()

    # Build word_pairs: {original, animation} for subtitle fix
    from A2SL.views import process_text_into_word_pairs
    raw_text = result.get('text', '')
    word_pairs = process_text_into_word_pairs(raw_text) if raw_text else [
        {'original': w, 'animation': w} for w in words
    ]

    return {
        'words':         words,
        'word_pairs':    word_pairs,
        'sync_sequence': sync_seq,
        'word_count':    result['word_count'],
        'duration':      result['duration'],
        'video_id':      video_obj.id if video_obj else None,
        'conversion_id': conv_obj.id if conv_obj else None,
    }

@csrf_exempt
def api_process_video(request):
	if request.method == 'POST':
		if 'video' not in request.FILES:
			return JsonResponse({'error': 'No video file provided'}, status=400)

		video_file = request.FILES['video']
		title = request.POST.get('title', video_file.name)

		# Create Video record
		video_obj = None
		conv_obj  = None
		if request.user.is_authenticated:
			video_obj = Video.objects.create(
				title=title,
				source_type='local',
				video_url=video_file.name,
				owner=request.user,
			)

		with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
			for chunk in video_file.chunks():
				tmp.write(chunk)
			temp_video_path = tmp.name

		temp_audio_path = temp_video_path.replace('.mp4', '.wav')

		try:
			if video_obj:
				conv_obj = Conversion.objects.create(video=video_obj, status='processing')

			# Extract audio
			_extract_audio(temp_video_path, temp_audio_path)

			# Run full synchronisation pipeline
			result = run_full_pipeline(
				audio_path=temp_audio_path,
				output_path=temp_video_path.replace('.mp4', '_avatar.mp4'),
			)

			response_data = _pipeline_result_to_response(result, video_obj, conv_obj)
			return JsonResponse(response_data)

		except ValueError as e:
			if conv_obj:
				conv_obj.status = 'failed'
				conv_obj.save()
			return JsonResponse({'error': str(e)}, status=400)
		except Exception as e:
			if conv_obj:
				conv_obj.status = 'failed'
				conv_obj.save()
			print(f"Error processing video: {e}")
			return JsonResponse({'error': f'Failed to process video: {str(e)}'}, status=500)
		finally:
			for p in [temp_video_path, temp_audio_path]:
				if os.path.exists(p):
					try: os.remove(p)
					except: pass
	else:
		return JsonResponse({'error': 'Method not allowed'}, status=405)

from pytubefix import YouTube

@csrf_exempt
def api_process_youtube(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			youtube_url = data.get('url', '')
			title = data.get('title', 'YouTube Video')
		except json.JSONDecodeError:
			return JsonResponse({'error': 'Invalid JSON'}, status=400)

		if not youtube_url:
			return JsonResponse({'error': 'No URL provided'}, status=400)

		yt_id = None
		if 'v=' in youtube_url:
			yt_id = youtube_url.split('v=')[-1].split('&')[0]
		elif 'youtu.be/' in youtube_url:
			yt_id = youtube_url.split('/')[-1]
		else:
			yt_id = youtube_url.split('/')[-1]

		# Create Video record
		video_obj = None
		conv_obj  = None
		if request.user.is_authenticated:
			video_obj = Video.objects.create(
				title=title,
				source_type='youtube',
				video_url=youtube_url,
				youtube_id=yt_id,
				owner=request.user,
			)

		temp_dir = tempfile.gettempdir()
		temp_video_filename = f"yt_{next(tempfile._get_candidate_names())}.mp4"
		temp_video_path = os.path.join(temp_dir, temp_video_filename)
		temp_audio_path = temp_video_path.replace('.mp4', '.wav')

		try:
			if video_obj:
				conv_obj = Conversion.objects.create(video=video_obj, status='processing')

			# Download YouTube video
			yt = YouTube(youtube_url)
			ys = yt.streams.get_lowest_resolution()
			ys.download(output_path=temp_dir, filename=temp_video_filename)

			# Extract audio
			_extract_audio(temp_video_path, temp_audio_path)

			# Run full synchronisation pipeline
			result = run_full_pipeline(
				audio_path=temp_audio_path,
				output_path=temp_video_path.replace('.mp4', '_avatar.mp4'),
			)

			response_data = _pipeline_result_to_response(result, video_obj, conv_obj)
			return JsonResponse(response_data)

		except ValueError as e:
			if conv_obj:
				conv_obj.status = 'failed'
				conv_obj.save()
			return JsonResponse({'error': str(e)}, status=400)
		except Exception as e:
			if conv_obj:
				conv_obj.status = 'failed'
				conv_obj.save()
			print(f"Error processing youtube video: {e}")
			return JsonResponse({'error': f'Failed to process youtube video: {str(e)}'}, status=500)
		finally:
			for p in [temp_video_path, temp_audio_path]:
				if os.path.exists(p):
					try: os.remove(p)
					except: pass
	else:
		return JsonResponse({'error': 'Method not allowed'}, status=405)



import cv2
import numpy as np
from rembg import remove, new_session
from django.http import FileResponse
import io

# Reuse a single rembg session for performance (loads model once)
_rembg_session = None

def get_rembg_session():
	global _rembg_session
	if _rembg_session is None:
		_rembg_session = new_session('u2net_human_seg')
	return _rembg_session

@csrf_exempt
def api_remove_bg(request):
	"""
	GET /api/remove_bg?word=Hello
	Processes the ASL video for the given word, removes the background
	frame-by-frame using rembg, and returns a transparent-background WebM video.
	Results are cached in a temp directory to avoid reprocessing.
	"""
	if request.method != 'GET':
		return JsonResponse({'error': 'Method not allowed'}, status=405)

	word = request.GET.get('word', '').strip()
	if not word:
		return JsonResponse({'error': 'No word provided'}, status=400)

	# Find the source video in static files — prefer .webm, fall back to .mp4
	source_path = finders.find(f'{word}.webm') or finders.find(f'{word}.mp4')
	if not source_path:
		return JsonResponse({'error': f'Video not found for word: {word}'}, status=404)

	# Cache processed videos in a dedicated temp folder
	cache_dir = os.path.join(tempfile.gettempdir(), 'a2sl_bg_removed')
	os.makedirs(cache_dir, exist_ok=True)
	cache_path = os.path.join(cache_dir, f'{word}_nobg.webm')

	# Return cached version if available
	if os.path.exists(cache_path):
		return FileResponse(open(cache_path, 'rb'), content_type='video/webm')

	try:
		session = get_rembg_session()

		cap = cv2.VideoCapture(source_path)
		fps = cap.get(cv2.CAP_PROP_FPS) or 25
		width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
		height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

		# Write to a temp file first, then move to cache
		tmp_out = cache_path + '.tmp.webm'
		fourcc = cv2.VideoWriter_fourcc(*'VP90')
		out = cv2.VideoWriter(tmp_out, fourcc, fps, (width, height))

		while True:
			ret, frame = cap.read()
			if not ret:
				break

			# rembg expects PIL or bytes; convert BGR frame to PNG bytes
			_, buf = cv2.imencode('.png', frame)
			png_bytes = buf.tobytes()

			# Remove background — returns RGBA PNG bytes
			result_bytes = remove(png_bytes, session=session)

			# Decode RGBA result
			result_arr = np.frombuffer(result_bytes, dtype=np.uint8)
			rgba = cv2.imdecode(result_arr, cv2.IMREAD_UNCHANGED)

			if rgba is None or rgba.shape[2] < 4:
				out.write(frame)
				continue

			# Composite signer over a dark (#0d1117) background
			alpha = rgba[:, :, 3:4].astype(np.float32) / 255.0
			rgb   = rgba[:, :, :3].astype(np.float32)
			bg    = np.full_like(rgb, [23, 17, 13], dtype=np.float32)  # BGR for #0d1117
			composited = (rgb * alpha + bg * (1 - alpha)).astype(np.uint8)

			out.write(composited)

		cap.release()
		out.release()

		# Move temp file to cache
		if os.path.exists(tmp_out):
			os.replace(tmp_out, cache_path)

		return FileResponse(open(cache_path, 'rb'), content_type='video/webm')

	except Exception as e:
		print(f'BG removal error for {word}: {e}')
		# Clean up partial output
		for p in [cache_path, cache_path + '.tmp.webm']:
			if os.path.exists(p):
				try: os.remove(p)
				except: pass
		return JsonResponse({'error': f'Background removal failed: {str(e)}'}, status=500)

@csrf_exempt
def api_get_library(request):
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	library, _ = Library.objects.get_or_create(user=request.user)
	items = LibraryItem.objects.filter(library=library).select_related('video').order_by('-saved_at')

	library_data = []
	for item in items:
		last_conv = Conversion.objects.filter(
			video=item.video, status='completed'
		).order_by('-conversion_date').first()

		# Prefer stored avatar_data on the item; fall back to conversion record
		avatar = []
		if item.avatar_data:
			try:
				avatar = json.loads(item.avatar_data)
			except Exception:
				avatar = []
		elif last_conv and last_conv.asl_video_url:
			try:
				avatar = json.loads(last_conv.asl_video_url)
			except Exception:
				avatar = []

		library_data.append({
			'id': item.id,
			'video_id': item.video.id,
			'title': item.video.title,
			'source_type': item.video.source_type,
			'source_url': item.video.video_url,
			'youtube_id': item.video.youtube_id,
			'course_name': item.course_name,
			'category': item.category,
			'avatar_data': avatar,
			'saved_at': item.saved_at.strftime('%Y-%m-%d'),
			'date': item.video.upload_date.strftime('%Y-%m-%d'),
		})

	return JsonResponse({'items': library_data})


@csrf_exempt
def api_save_video(request):
	"""
	POST /api/save-video/
	Save a processed video + its avatar animation to the user's library.
	Prevents duplicate entries for the same video URL per user.
	Body: { title, video_url, source_type, youtube_id, avatar_data, category }
	"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	if request.method != 'POST':
		return JsonResponse({'error': 'Method not allowed'}, status=405)

	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'error': 'Invalid JSON'}, status=400)

	title       = data.get('title', 'Untitled')
	video_url   = data.get('video_url', '')
	source_type = data.get('source_type', 'local')
	youtube_id  = data.get('youtube_id', None)
	avatar_data = data.get('avatar_data', [])   # list of sign words
	category    = data.get('category', 'Uncategorized')
	video_id    = data.get('video_id', None)    # if already created by process endpoint

	# Resolve or create the Video record
	if video_id:
		video_obj = Video.objects.filter(id=video_id, owner=request.user).first()
		if not video_obj:
			return JsonResponse({'error': 'Video not found'}, status=404)
	else:
		# Avoid duplicate Video rows for the same URL per user
		video_obj = Video.objects.filter(owner=request.user, video_url=video_url).first()
		if not video_obj:
			video_obj = Video.objects.create(
				title=title,
				source_type=source_type,
				video_url=video_url,
				youtube_id=youtube_id,
				owner=request.user,
			)

	library, _ = Library.objects.get_or_create(user=request.user)

	# get_or_create prevents duplicate LibraryItem for same video
	item, created = LibraryItem.objects.get_or_create(
		library=library,
		video=video_obj,
		defaults={
			'category': category,
			'avatar_data': json.dumps(avatar_data) if avatar_data else None,
		}
	)

	if not created:
		# Update avatar data if re-saving
		item.avatar_data = json.dumps(avatar_data) if avatar_data else item.avatar_data
		item.category = category
		item.save()

	return JsonResponse({
		'status': 'success',
		'created': created,
		'item_id': item.id,
		'video_id': video_obj.id,
	})


@csrf_exempt
def api_add_to_library(request):
	"""Legacy endpoint — kept for backward compatibility. Delegates to api_save_video logic."""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	if request.method != 'POST':
		return JsonResponse({'error': 'Method not allowed'}, status=405)

	try:
		data = json.loads(request.body)
		video_id    = data.get('video_id')
		course_name = data.get('course_name', '')
		category    = data.get('category', 'Uncategorized')
		avatar_data = data.get('avatar_data', [])
	except json.JSONDecodeError:
		return JsonResponse({'error': 'Invalid JSON'}, status=400)

	library, _ = Library.objects.get_or_create(user=request.user)
	video = Video.objects.filter(id=video_id).first()

	if not video:
		return JsonResponse({'error': 'Video not found'}, status=404)

	item, created = LibraryItem.objects.get_or_create(
		library=library,
		video=video,
		defaults={
			'course_name': course_name,
			'category': category,
			'avatar_data': json.dumps(avatar_data) if avatar_data else None,
		}
	)

	if not created:
		item.avatar_data = json.dumps(avatar_data) if avatar_data else item.avatar_data
		item.save()

	return JsonResponse({'status': 'success', 'item_id': item.id, 'created': created})


@csrf_exempt
def api_get_recents(request):
	"""
	GET /api/recents/
	Returns the 20 most recently saved library items for the logged-in user.
	"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	library, _ = Library.objects.get_or_create(user=request.user)
	items = LibraryItem.objects.filter(library=library).select_related('video').order_by('-saved_at')[:20]

	recents = []
	for item in items:
		avatar = []
		if item.avatar_data:
			try:
				avatar = json.loads(item.avatar_data)
			except Exception:
				avatar = []

		recents.append({
			'id': item.id,
			'video_id': item.video.id,
			'title': item.video.title,
			'source_type': item.video.source_type,
			'youtube_id': item.video.youtube_id,
			'source_url': item.video.video_url,
			'avatar_data': avatar,
			'category': item.category,
			'saved_at': item.saved_at.strftime('%Y-%m-%d'),
		})

	return JsonResponse({'recents': recents})


@csrf_exempt
def api_delete_from_library(request, item_id):
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	item = LibraryItem.objects.filter(id=item_id, library__user=request.user).first()
	if not item:
		return JsonResponse({'error': 'Item not found'}, status=404)

	item.delete()
	return JsonResponse({'status': 'success'})


# ─── Playlist APIs ────────────────────────────────────────────────────────────

@csrf_exempt
def api_get_playlists(request):
	"""GET /api/playlists/ — list all playlists for the user with video count."""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	playlists = Playlist.objects.filter(user=request.user).prefetch_related('playlist_videos')
	data = []
	for pl in playlists:
		data.append({
			'id': pl.id,
			'name': pl.name,
			'description': pl.description or '',
			'created_at': pl.created_at.strftime('%Y-%m-%d'),
			'video_count': pl.playlist_videos.count(),
		})
	return JsonResponse({'playlists': data})


@csrf_exempt
def api_create_playlist(request):
	"""POST /api/create-playlist/ — create a new playlist."""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	if request.method != 'POST':
		return JsonResponse({'error': 'Method not allowed'}, status=405)

	try:
		data = json.loads(request.body)
		name        = data.get('name', '').strip()
		description = data.get('description', '').strip()
	except json.JSONDecodeError:
		return JsonResponse({'error': 'Invalid JSON'}, status=400)

	if not name:
		return JsonResponse({'error': 'Playlist name is required'}, status=400)

	playlist = Playlist.objects.create(user=request.user, name=name, description=description)
	return JsonResponse({
		'status': 'success',
		'playlist': {
			'id': playlist.id,
			'name': playlist.name,
			'description': playlist.description or '',
			'created_at': playlist.created_at.strftime('%Y-%m-%d'),
			'video_count': 0,
		}
	})


@csrf_exempt
def api_delete_playlist(request, playlist_id):
	"""DELETE /api/playlists/<id>/delete/"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	playlist = Playlist.objects.filter(id=playlist_id, user=request.user).first()
	if not playlist:
		return JsonResponse({'error': 'Playlist not found'}, status=404)

	playlist.delete()
	return JsonResponse({'status': 'success'})


@csrf_exempt
def api_get_playlist_videos(request, playlist_id):
	"""GET /api/playlists/<id>/videos/ — get all videos in a playlist."""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	playlist = Playlist.objects.filter(id=playlist_id, user=request.user).first()
	if not playlist:
		return JsonResponse({'error': 'Playlist not found'}, status=404)

	entries = PlaylistVideo.objects.filter(playlist=playlist).select_related(
		'library_item__video'
	).order_by('position', 'added_at')

	videos = []
	for entry in entries:
		item = entry.library_item
		avatar = []
		if item.avatar_data:
			try:
				avatar = json.loads(item.avatar_data)
			except Exception:
				avatar = []
		videos.append({
			'playlist_video_id': entry.id,
			'item_id': item.id,
			'video_id': item.video.id,
			'title': item.video.title,
			'source_type': item.video.source_type,
			'youtube_id': item.video.youtube_id,
			'source_url': item.video.video_url,
			'avatar_data': avatar,
			'category': item.category,
			'saved_at': item.saved_at.strftime('%Y-%m-%d'),
			'position': entry.position,
		})

	return JsonResponse({'playlist_id': playlist_id, 'name': playlist.name, 'videos': videos})


@csrf_exempt
def api_add_to_playlist(request):
	"""
	POST /api/add-to-playlist/
	Body: { playlist_id, item_id }
	Links an existing LibraryItem to a playlist (no duplication).
	"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	if request.method != 'POST':
		return JsonResponse({'error': 'Method not allowed'}, status=405)

	try:
		data = json.loads(request.body)
		playlist_id = data.get('playlist_id')
		item_id     = data.get('item_id')
	except json.JSONDecodeError:
		return JsonResponse({'error': 'Invalid JSON'}, status=400)

	playlist = Playlist.objects.filter(id=playlist_id, user=request.user).first()
	if not playlist:
		return JsonResponse({'error': 'Playlist not found'}, status=404)

	item = LibraryItem.objects.filter(id=item_id, library__user=request.user).first()
	if not item:
		return JsonResponse({'error': 'Library item not found'}, status=404)

	# Determine next position
	last_pos = PlaylistVideo.objects.filter(playlist=playlist).order_by('-position').values_list('position', flat=True).first()
	next_pos = (last_pos or 0) + 1

	pv, created = PlaylistVideo.objects.get_or_create(
		playlist=playlist,
		library_item=item,
		defaults={'position': next_pos},
	)

	return JsonResponse({
		'status': 'success',
		'created': created,
		'playlist_video_id': pv.id,
	})


@csrf_exempt
def api_remove_from_playlist(request, playlist_id, item_id):
	"""DELETE /api/playlists/<playlist_id>/remove/<item_id>/"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	pv = PlaylistVideo.objects.filter(
		playlist_id=playlist_id,
		playlist__user=request.user,
		library_item_id=item_id,
	).first()

	if not pv:
		return JsonResponse({'error': 'Entry not found'}, status=404)

	pv.delete()
	return JsonResponse({'status': 'success'})

@csrf_exempt
def api_signup(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			# UserCreationForm expects 'password1' and 'password2'
			processed_data = {
				'username': data.get('username'),
				'email': data.get('email'),
				'name': data.get('name'),
				'password1': data.get('password'),
				'password2': data.get('confirm_password'),
				'profile_info': data.get('profile_info', '')
			}
			form = DeafUserCreationForm(processed_data)
			if form.is_valid():
				user = form.save()
				Library.objects.get_or_create(user=user)
				login(request, user)
				return JsonResponse({
					'status': 'success',
					'user': {
						'id': user.id,
						'username': user.username,
						'email': user.email,
						'name': user.name
					}
				})
			else:
				# Flatten errors for easier frontend handling
				errors = {f: e[0] for f, e in form.errors.items()}
				return JsonResponse({'status': 'error', 'errors': errors}, status=400)
		except Exception as e:
			return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
	return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def api_login(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username = data.get('username')
			password = data.get('password')
			
			user = authenticate(request, username=username, password=password)
			if user is not None:
				login(request, user)
				return JsonResponse({
					'status': 'success',
					'user': {
						'id': user.id,
						'username': user.username,
						'email': user.email,
						'name': user.name
					}
				})
			else:
				return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=401)
		except Exception as e:
			return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
	return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def api_logout(request):
	logout(request)
	return JsonResponse({'status': 'success'})

@csrf_exempt
def api_get_user(request):
	if request.user.is_authenticated:
		user = request.user
		# Build absolute URL for profile image if it exists
		photo_url = None
		if user.profile_image:
			try:
				photo_url = request.build_absolute_uri(user.profile_image.url)
			except Exception:
				photo_url = None
		return JsonResponse({
			'status': 'success',
			'user': {
				'id': user.id,
				'username': user.username,
				'email': user.email,
				'name': user.name,
				'photoUrl': photo_url,
			}
		})
	return JsonResponse({'status': 'error', 'message': 'Not authenticated'}, status=401)


# ─── Profile Update APIs ──────────────────────────────────────────────────────

@csrf_exempt
def api_update_profile(request):
	"""
	PATCH /api/update-profile/
	Body: { name }
	Updates the user's display name.
	"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	if request.method not in ('POST', 'PATCH', 'PUT'):
		return JsonResponse({'error': 'Method not allowed'}, status=405)

	try:
		data = json.loads(request.body)
	except (json.JSONDecodeError, Exception) as e:
		print(f"[update_profile] JSON parse error: {e}")
		return JsonResponse({'error': 'Invalid JSON'}, status=400)

	name = data.get('name', '').strip()
	if not name:
		return JsonResponse({'error': 'Name cannot be empty'}, status=400)

	try:
		user = request.user
		user.name = name
		user.save(update_fields=['name'])
		print(f"[update_profile] Updated name for {user.username} → '{name}'")
		return JsonResponse({
			'status': 'success',
			'user': {
				'id': user.id,
				'username': user.username,
				'email': user.email,
				'name': user.name,
				'photoUrl': request.build_absolute_uri(user.profile_image.url) if user.profile_image else None,
			}
		})
	except Exception as e:
		print(f"[update_profile] Error: {e}")
		return JsonResponse({'error': f'Failed to update profile: {str(e)}'}, status=500)


@csrf_exempt
def api_change_password(request):
	"""
	POST /api/change-password/
	Body: { current_password, new_password }
	Verifies current password then sets the new one using Django's set_password().
	"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	if request.method != 'POST':
		return JsonResponse({'error': 'Method not allowed'}, status=405)

	try:
		data = json.loads(request.body)
	except (json.JSONDecodeError, Exception) as e:
		print(f"[change_password] JSON parse error: {e}")
		return JsonResponse({'error': 'Invalid JSON'}, status=400)

	current_password = data.get('current_password', '')
	new_password     = data.get('new_password', '')

	if not current_password or not new_password:
		return JsonResponse({'error': 'Both current and new password are required'}, status=400)

	if len(new_password) < 6:
		return JsonResponse({'error': 'New password must be at least 6 characters'}, status=400)

	user = request.user

	# Verify current password
	if not user.check_password(current_password):
		print(f"[change_password] Wrong current password for {user.username}")
		return JsonResponse({'error': 'Current password is incorrect'}, status=400)

	try:
		user.set_password(new_password)
		user.save()
		# Re-authenticate so the session stays valid after password change
		from django.contrib.auth import update_session_auth_hash
		update_session_auth_hash(request, user)
		print(f"[change_password] Password changed for {user.username}")
		return JsonResponse({'status': 'success', 'message': 'Password updated successfully'})
	except Exception as e:
		print(f"[change_password] Error: {e}")
		return JsonResponse({'error': f'Failed to change password: {str(e)}'}, status=500)


@csrf_exempt
def api_upload_avatar(request):
	"""
	POST /api/upload-avatar/
	Multipart form: file field 'avatar'
	Saves the image to MEDIA_ROOT/avatars/ and returns the URL.
	"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Unauthorized'}, status=401)

	if request.method != 'POST':
		return JsonResponse({'error': 'Method not allowed'}, status=405)

	if 'avatar' not in request.FILES:
		return JsonResponse({'error': 'No file provided. Use field name "avatar"'}, status=400)

	avatar_file = request.FILES['avatar']

	# Basic validation
	allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
	if avatar_file.content_type not in allowed_types:
		return JsonResponse({'error': 'Invalid file type. Use JPEG, PNG or WebP'}, status=400)

	if avatar_file.size > 5 * 1024 * 1024:  # 5 MB limit
		return JsonResponse({'error': 'File too large. Maximum size is 5 MB'}, status=400)

	try:
		user = request.user
		# Delete old avatar to avoid orphaned files
		if user.profile_image:
			try:
				user.profile_image.delete(save=False)
			except Exception:
				pass

		user.profile_image = avatar_file
		user.save(update_fields=['profile_image'])

		photo_url = request.build_absolute_uri(user.profile_image.url)
		print(f"[upload_avatar] Avatar saved for {user.username}: {photo_url}")
		return JsonResponse({
			'status': 'success',
			'photoUrl': photo_url,
			'user': {
				'id': user.id,
				'username': user.username,
				'email': user.email,
				'name': user.name,
				'photoUrl': photo_url,
			}
		})
	except Exception as e:
		print(f"[upload_avatar] Error: {e}")
		return JsonResponse({'error': f'Failed to upload avatar: {str(e)}'}, status=500)
