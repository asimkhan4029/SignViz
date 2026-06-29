import os
import sys
import django
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'A2SL.settings')
django.setup()

from A2SL.sync_pipeline import run_full_pipeline

# Since run_full_pipeline takes an audio file, I can't easily mock it without creating an audio file.
# I'll just look at the code of build_sync_sequence and see what timestamps it generates.
