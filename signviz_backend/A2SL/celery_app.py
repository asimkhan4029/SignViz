"""
Celery application for SignViz streaming pipeline.
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'A2SL.settings')

app = Celery('signviz')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
