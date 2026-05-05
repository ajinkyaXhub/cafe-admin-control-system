import urllib.request, re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

urls = re.findall(r'src=\"(https://images\.unsplash\.com/[^\"]+)\"', html)
for url in urls:
    try:
        urllib.request.urlopen(url)
    except Exception as e:
        print('FAIL:', url)
