import urllib.request, re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

urls = re.findall(r'src=\"(https://images\.unsplash\.com/[^\"]+)\"', html)
passed = []
for url in urls:
    try:
        urllib.request.urlopen(url)
        passed.append(url)
    except Exception as e:
        pass
print('PASSED URLS:')
for p in passed:
    print(p)
