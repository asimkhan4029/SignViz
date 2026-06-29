import urllib.request

req = urllib.request.Request(
    'http://localhost:8000/api/process_text',
    data=b'{"text": "superover"}',
    headers={'Content-Type': 'application/json'}
)

print(urllib.request.urlopen(req).read().decode())
