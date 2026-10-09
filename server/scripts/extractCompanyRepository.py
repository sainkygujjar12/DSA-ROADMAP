"""Extract company problem links from a pinned repository ZIP (requires pypdf).
Usage: python extractCompanyRepository.py source.zip output.json
Only reads top-level company PDFs; ignores generic lists and nested documents.
"""
import io
import json
import re
import sys
from pathlib import PurePosixPath
from zipfile import ZipFile
from pypdf import PdfReader

companies = {}
with ZipFile(sys.argv[1]) as archive:
    root = PurePosixPath(archive.namelist()[0]).parts[0]
    commit = root.removeprefix('Leetcode_company_frequency-')
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('Use a GitHub archive pinned to a full commit SHA')
    for filename in sorted(archive.namelist()):
        path = PurePosixPath(filename)
        if len(path.parts) != 2:
            continue
        match = re.fullmatch(r'(.+?)\s*- LeetCode(?: alltime)?\.pdf', path.name)
        if not match or path.name.startswith(('100 ', 'All Problems')):
            continue
        name = re.sub(r'\s+(?:1year|6months)$', '', match[1])
        name = {'Facebook': 'Meta'}.get(name, name)
        entry = companies.setdefault(name, {'name': name, 'files': [], 'slugs': []})
        entry['files'].append(path.name)
        reader = PdfReader(io.BytesIO(archive.read(filename)))
        for page in reader.pages:
            for annotation in page.get('/Annots', []):
                action = annotation.get_object().get('/A')
                if not action:
                    continue
                uri = str(action.get_object().get('/URI', ''))
                problem = re.fullmatch(r'https?://leetcode.com/problems/([a-z0-9-]+)/?(?:\?.*)?', uri)
                if problem and problem[1] not in entry['slugs']:
                    entry['slugs'].append(problem[1])
        if not entry['slugs']:
            raise ValueError(f'No question links extracted: {filename}')
with open(sys.argv[2], 'w') as output:
    entries = [dict(entry, slug=re.sub(r'[^a-z0-9]+', '-', entry['name'].lower()).strip('-'))
               for entry in companies.values()]
    json.dump({
        'repository': 'https://github.com/xizhang20181005/Leetcode_company_frequency',
        'commit': commit,
        'snapshotYear': 2019,
        'companies': entries,
    }, output, indent=2)
    output.write('\n')
print(f'Extracted {len(companies)} companies, {len(set(s for c in companies.values() for s in c["slugs"]))} unique problems')
