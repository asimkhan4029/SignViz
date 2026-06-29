"""
synonym_views.py
================
API endpoints for the synonym matching system.

GET  /api/synonyms/resolve/?word=glad
     → { "input": "glad", "resolved": "Happy", "found": true }

GET  /api/synonyms/all/
     → { "synonyms": { "glad": "Happy", "joyful": "Happy", ... } }
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from A2SL.synonym_map import resolve_synonym, get_all_synonyms
from A2SL.sync_pipeline import find_animation


@csrf_exempt
def api_resolve_synonym(request):
    """Resolve a single word to its dataset animation name."""
    word = request.GET.get('word', '').strip()
    if not word:
        return JsonResponse({'error': 'word parameter required'}, status=400)

    resolved = find_animation(word)
    return JsonResponse({
        'input':    word,
        'resolved': resolved,
        'found':    resolved is not None,
    })


@csrf_exempt
def api_all_synonyms(request):
    """Return the full synonym → dataset_word table."""
    return JsonResponse({'synonyms': get_all_synonyms()})
