import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'A2SL.settings')
django.setup()

from A2SL.sync_pipeline import WordSegment, process_words_to_signs, build_sync_sequence, render_avatar_video

def main():
    # create a 60 second sequence
    words = []
    for i in range(60):
        words.append(WordSegment("hello", float(i), float(i+1)))

    try:
        signs = process_words_to_signs(words)
        print("Signs:", len(signs))
        seq = build_sync_sequence(signs)
        print("Seq length:", len(seq))
        render_avatar_video(seq, "test_output_60s.mp4")
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    import multiprocessing
    multiprocessing.freeze_support()
    main()
