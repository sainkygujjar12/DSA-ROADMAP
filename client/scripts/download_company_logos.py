"""Cache company website icons locally; no runtime third-party logo requests."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DOMAINS = json.loads((ROOT / 'src/data/companyLogoDomains.json').read_text())
OUTPUT = ROOT / 'public/company-logos'
OUTPUT.mkdir(exist_ok=True)

def download(item):
    slug, domain = item
    url = f'https://www.google.com/s2/favicons?domain={domain}&sz=128'
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=25) as response:
            data = response.read()
        if not data.startswith(b'\x89PNG\r\n\x1a\n'):
            raise ValueError('Expected PNG')
        (OUTPUT / f'{slug}.png').write_bytes(data)
        return slug, hashlib.sha256(data).hexdigest()
    except Exception as error:
        return slug, f'ERROR: {type(error).__name__}'

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        results = dict(pool.map(download, DOMAINS.items()))
    print(json.dumps(results, indent=2))
