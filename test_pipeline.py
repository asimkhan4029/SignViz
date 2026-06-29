import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'A2SL.settings')
django.setup()

from A2SL.sync_pipeline import WordSegment, process_words_to_signs, build_sync_sequence, render_avatar_video

words = [
    WordSegment("hello", 0.0, 1.0),
    WordSegment("superover", 1.0, 2.0)
]

try:
    signs = process_words_to_signs(words)
    print("Signs:", [s.word for s in signs])
    seq = build_sync_sequence(signs, 2.0)
    print("Seq length:", len(seq))
    render_avatar_video(seq, "test_output.mp4")
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
