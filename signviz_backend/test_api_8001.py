import urllib.request
import json

req = urllib.request.Request(
    'http://localhost:8001/api/process_youtube',
    data=json.dumps({"url": "https://www.youtube.com/watch?v=v4t0E3S1N1k", "title": "test"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    resp = urllib.request.urlopen(req)
    print(resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
