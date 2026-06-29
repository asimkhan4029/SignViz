#!/bin/bash
# Start the full SignViz streaming stack
# Run from signviz_backend/

echo "Starting Redis..."
redis-server --daemonize yes

echo "Running migrations..."
python manage.py migrate

echo "Starting Celery worker (4 concurrent tasks)..."
celery -A A2SL.celery_app worker \
  --loglevel=info \
  --concurrency=4 \
  --queues=celery \
  --detach \
  --logfile=celery.log \
  --pidfile=celery.pid

echo "Starting Django dev server..."
python manage.py runserver 0.0.0.0:8000
