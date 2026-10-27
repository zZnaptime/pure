"""
posts/*.md  →  posts/posts.json

글 파일(마크다운)을 읽어서 홈이 쓰는 글 목록 파일을 만들어요.
깃허브에 글을 올리면 GitHub Actions 가 자동으로 실행하니까 직접 돌릴 필요는 없어요.
(내 컴퓨터에서 미리 보고 싶을 때만:  pip install markdown pyyaml  →  python tools/build_posts.py)

글 주소
  - 글마다 url(주소) 칸이 있으면 그걸 써요  →  도메인/banner  ·  도메인/?p=banner
  - 비어 있으면 발행 순서대로 번호를 붙이고 글 파일에 적어 둬요 (한 번 붙으면 안 바뀜)  →  도메인/18
  - 예전 주소(?p=2026-10-14-200000 같은 파일 이름, 바꾸기 전 주소)도 계속 열려요

--pages 로 실행하면 (GitHub Actions 에서만) 배포용 파일을 추가로 만들어요. 저장소에는 안 남아요.
  - 도메인/주소/index.html : 짧은 주소 → 홈의 그 글 창으로 연결 + 링크 미리보기 카드
  - index.html 의 미리보기 카드 태그를 홈 설정 값으로 채우기
  - 404.html : 없는 주소로 들어왔을 때 화면
"""
import os, re, sys, json, datetime, html as H
import yaml, markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, 'posts')
OUT = os.path.join(POSTS, 'posts.json')
FM = re.compile(r'^---\s*\n(.*?)\n---\s*\n?(.*)$', re.S)
DEFAULT_OG = 'assets/images/og-card.png'
# 글 주소로 못 쓰는 이름 (원래 있는 폴더 · 파일과 겹치면 안 돼요)
RESERVED = {'index', '404', 'admin', 'assets', 'posts', 'profiles', 'tools', 'vault', 'prompt', 'api', 'p', 'c', 'notice',
            'records', 'readme', 'cname', 'settings', 'jsconfig', 'favicon', 'robots', 'sitemap', 'github'}


def to_date(v, fallback):
    if isinstance(v, datetime.datetime):
        return v
    if isinstance(v, datetime.date):
        return datetime.datetime(v.year, v.month, v.day)
    s = str(v or '').strip().replace('T', ' ')
    for f in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%Y-%m-%d', '%Y.%m.%d'):
        try:
            return datetime.datetime.strptime(s[:len(datetime.datetime.now().strftime(f))], f)
        except Exception:
            pass
    return fallback


def rel(u):
    """'/assets/uploads/a.png' → 'assets/uploads/a.png' (저장소 이름이 주소에 붙어도 안 깨지게)"""
    u = str(u or '').strip()
    return u[1:] if u.startswith('/') and not u.startswith('//') else u


def norm_url(v):
    """주소는 영어 소문자 · 숫자 · - 만 (띄어쓰기는 -)"""
    v = str(v if v is not None else '').strip().lower()
    v = re.sub(r'[\s_]+', '-', v)
    v = re.sub(r'[^a-z0-9-]', '', v)
    return re.sub(r'-{2,}', '-', v).strip('-')


def reserved_names():
    names = set(RESERVED)
    for n in os.listdir(ROOT):
        names.add(n.lower())
        names.add(os.path.splitext(n)[0].lower())
    return names


def set_front(path, key, value):
    """글 파일 맨 위 정보(--- 사이)에 key: "value" 한 줄 넣기 (이미 있으면 바꾸기 · 없으면 title 바로 아래)"""
    raw = open(path, encoding='utf-8').read().replace('\r\n', '\n')
    line = '%s: %s' % (key, json.dumps(value, ensure_ascii=False))
    if not raw.startswith('---\n') or raw.find('\n---', 4) < 0:
        raw = '---\n' + line + '\n---\n' + raw
    else:
        end = raw.find('\n---', 4)
        lines = raw[4:end].split('\n')
        idx = next((i for i, l in enumerate(lines) if re.match(r'^%s\s*:' % re.escape(key), l)), None)
        if idx is not None:
            lines[idx] = line
        else:
            t = next((i for i, l in enumerate(lines) if re.match(r'^title\s*:', l)), -1)
            lines.insert(t + 1, line)
        raw = '---\n' + '\n'.join(lines) + raw[end:]
    open(path, 'w', encoding='utf-8').write(raw)


def text_of(html_src):
    t = re.sub(r'<[^>]+>', ' ', html_src)
    return re.sub(r'\s+', ' ', H.unescape(t)).strip()


def main():
    items = []
    taken = {}            # 주소 → 파일 이름
    reserved = reserved_names()
    need_number = []
    for fn in sorted(os.listdir(POSTS)):
        if not fn.endswith('.md'):
            continue
        raw = open(os.path.join(POSTS, fn), encoding='utf-8').read().replace('\r\n', '\n')
        m = FM.match(raw)
        meta, body = (yaml.safe_load(m.group(1)) or {}, m.group(2)) if m else ({}, raw)
        if meta.get('draft'):
            continue
        slug = fn[:-3]
        url = norm_url(meta.get('url'))
        if url and (url in reserved or url in taken):
            print('  ! %s : 주소 "%s" 는 쓸 수 없어서 번호로 바꿔요 (%s)' % (fn, url, '예약된 이름' if url in reserved else '다른 글과 겹침'))
            url = ''
        if url:
            taken[url] = slug
        aliases = [slug] + [a for a in (norm_url(x) for x in (meta.get('aliases') or []) if x is not None) if a and a != url]
        mt = re.match(r'(\d{4})-(\d{2})-(\d{2})', slug)
        fb = datetime.datetime(int(mt.group(1)), int(mt.group(2)), int(mt.group(3))) if mt else datetime.datetime.fromtimestamp(os.path.getmtime(os.path.join(POSTS, fn)))
        d = to_date(meta.get('date'), fb)
        if str(meta.get('format') or '').lower() == 'html':
            body_html = body.strip()          # 글쓰기 화면(admin.html)에서 쓴 글은 HTML 그대로
        else:
            body_html = markdown.markdown(body, extensions=['extra', 'sane_lists', 'nl2br'])
        body_html = re.sub(r'(src|href)="/(?!/)', r'\1="', body_html)
        thumb = rel(meta.get('thumbnail'))
        if not thumb:
            im = re.search(r'<img[^>]+src="([^"]+)"', body_html)
            thumb = im.group(1) if im else ''
        summary = str(meta.get('summary') or '').strip() or text_of(body_html)[:110]
        price = meta.get('price')
        items.append({
            'slug': url,
            'file': slug,
            'aliases': aliases,
            'title': str(meta.get('title') or '제목 없음'),
            'date': d.strftime('%Y-%m-%d %H:%M'),
            'dateText': '%d. %d. %d.' % (d.year, d.month, d.day),
            'category': '' if meta.get('notice') else str(meta.get('category') or ''),
            'notice': bool(meta.get('notice')),
            'thumbnail': thumb,
            'summary': summary,
            'sub': str(meta.get('sub') or ''),
            'status': str(meta.get('status') or '').upper() if meta.get('status') else '',
            'price': re.sub(r'[^0-9]', '', str(price)) if price not in (None, '') else '',
            'center': bool(meta.get('center')),
            'song': rel(meta.get('song')),
            'songTitle': str(meta.get('songTitle') or ''),
            'songCover': rel(meta.get('songCover')),
            'artist': str(meta.get('artist') or ''),
            'album': str(meta.get('album') or ''),
            'songNoDl': bool(meta.get('songNoDl')),
            'lyrics': str(meta.get('lyrics') or ''),
            'html': body_html,
        })
    items.sort(key=lambda x: x['date'])
    for i, it in enumerate(items):
        it['no'] = i + 1          # 파일 번호 (오래된 글부터 1번)

    # 주소가 없는 글 : 지금까지 쓴 번호 다음부터 차례로 번호를 붙이고 글 파일에 적어 둬요 (다음부터 고정)
    nums = [int(u) for u in taken if u.isdigit()]
    nxt = (max(nums) if nums else 0) + 1
    for it in items:
        if not it['slug']:
            while str(nxt) in taken or str(nxt) in reserved:
                nxt += 1
            it['slug'] = str(nxt)
            taken[it['slug']] = it['file']
            set_front(os.path.join(POSTS, it['file'] + '.md'), 'url', it['slug'])
            print('  + %s → 주소 %s' % (it['file'], it['slug']))
            nxt += 1
    items.reverse()               # 최신 글이 위로
    json.dump(items, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('posts.json : %d개' % len(items))
    if '--pages' in sys.argv:
        make_pages(items)


# ════════ 배포용 파일 (GitHub Actions 에서만) ════════
def site_base():
    """https://도메인/  (CNAME 이 없으면 깃허브 기본 주소)"""
    cn = os.path.join(ROOT, 'CNAME')
    if os.path.exists(cn):
        d = open(cn, encoding='utf-8').read().strip().splitlines()
        if d and d[0].strip():
            return 'https://' + d[0].strip().rstrip('/') + '/'
    repo = os.environ.get('GITHUB_REPOSITORY', '')
    if '/' in repo:
        owner, name = repo.split('/', 1)
        return 'https://%s.github.io/' % owner if name.lower() == owner.lower() + '.github.io' else 'https://%s.github.io/%s/' % (owner, name)
    return '/'


def abs_url(base, u):
    u = str(u or '').strip()
    if not u:
        return ''
    if re.match(r'^(https?:)?//', u):
        return u
    return base + rel(u)


def og_tags(title, desc, image, url, site):
    e = lambda t: H.escape(str(t or ''), quote=True)
    t = [
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="%s">' % e(site),
        '<meta property="og:title" content="%s">' % e(title),
        '<meta property="og:description" content="%s">' % e(desc),
        '<meta property="og:url" content="%s">' % e(url),
        '<meta name="description" content="%s">' % e(desc),
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % e(title),
        '<meta name="twitter:description" content="%s">' % e(desc),
    ]
    if image:
        t += ['<meta property="og:image" content="%s">' % e(image), '<meta name="twitter:image" content="%s">' % e(image)]
    return '\n  '.join(t)


def clean_title(t):
    return re.sub(r'\s*\[(OPEN|CLOSE|PRICE:[^\]]*|SUB:[^\]]*)\]\s*', ' ', str(t or ''), flags=re.I).strip()


def make_pages(items):
    base = site_base()
    try:
        st = json.load(open(os.path.join(ROOT, 'settings.json'), encoding='utf-8'))
    except Exception:
        st = {}
    site = st.get('title') or 'Syringe'
    desc = (st.get('ogDescription') or st.get('heroSub') or site).strip()
    og_img = abs_url(base, st.get('ogImage') or DEFAULT_OG)

    # ① index.html 미리보기 카드
    ip = os.path.join(ROOT, 'index.html')
    html = open(ip, encoding='utf-8').read()
    block = '<!-- og -->\n  ' + og_tags(site, desc, og_img, base, site) + '\n  <!-- /og -->'
    if '<!-- og -->' in html and '<!-- /og -->' in html:
        html = re.sub(r'<!-- og -->.*?<!-- /og -->', lambda m: block, html, count=1, flags=re.S)
    else:
        html = html.replace('</head>', '  ' + block + '\n</head>', 1)
    open(ip, 'w', encoding='utf-8').write(html)

    # ② 글마다 짧은 주소 페이지
    made = 0
    for it in items:
        title = clean_title(it['title']) + ' · ' + site
        d = (it.get('sub') or it.get('summary') or desc)[:150]
        img = abs_url(base, it.get('thumbnail')) or og_img
        for name in [it['slug']] + it.get('aliases', []):
            if not name or name in RESERVED:
                continue
            folder = os.path.join(ROOT, name)
            if os.path.exists(folder) and not os.path.exists(os.path.join(folder, '.sy-short')):
                continue                      # 원래 있는 폴더는 건드리지 않아요
            os.makedirs(folder, exist_ok=True)
            open(os.path.join(folder, '.sy-short'), 'w').write('')
            target = '../?p=' + it['slug']
            open(os.path.join(folder, 'index.html'), 'w', encoding='utf-8').write(REDIRECT % {
                'og': og_tags(title, d, img, base + it['slug'], site),
                'title': H.escape(title), 'target': H.escape(target, quote=True), 'target_js': json.dumps(target), 'canon': H.escape(base + it['slug'], quote=True)})
            made += 1
    # ③ 404
    open(os.path.join(ROOT, '404.html'), 'w', encoding='utf-8').write(NOT_FOUND % {'base': H.escape(base, quote=True), 'site': H.escape(site)})
    print('짧은 주소 페이지 : %d개 · 미리보기 카드 : %s' % (made, og_img))


REDIRECT = """<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>%(title)s</title>
  %(og)s
  <link rel="canonical" href="%(canon)s">
  <meta http-equiv="refresh" content="0;url=%(target)s">
  <script>location.replace(%(target_js)s + location.hash);</script>
  <style>html,body{margin:0;height:100%%;background:#F3F8FC}</style>
</head>
<body><noscript><a href="%(target)s">글 보러 가기</a></noscript></body>
</html>
"""

NOT_FOUND = """<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>없는 페이지 · %(site)s</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    *{box-sizing:border-box}
    html,body{margin:0;height:100%%;font-family:Pretendard,system-ui,sans-serif;letter-spacing:-.02em;color:#14324A;
      background:linear-gradient(rgba(30,143,214,.06) 1px,transparent 1px) 0 0/36px 36px,linear-gradient(90deg,rgba(30,143,214,.06) 1px,transparent 1px) 0 0/36px 36px,linear-gradient(160deg,#fff,#EAF4FB)}
    main{min-height:100%%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px}
    i{width:68px;height:68px;border-radius:21px;display:grid;place-items:center;background:linear-gradient(180deg,#fff,#E9EFF4);box-shadow:inset 0 0 0 1.5px #CBD8E3,0 16px 30px -14px rgba(20,50,74,.35);margin-bottom:22px}
    i svg{width:40px;height:40px;fill:#1E8FD6}
    small{font-weight:800;font-size:12px;letter-spacing:.24em;color:#1E8FD6}
    h1{margin:8px 0 10px;font-weight:900;font-size:34px;letter-spacing:-.04em}
    p{margin:0 0 26px;color:#7F98AC;font-size:14px;line-height:1.7}
    a{display:inline-grid;place-items:center;height:44px;padding:0 24px;border-radius:12px;background:#14324A;color:#fff;font-weight:800;font-size:14px;text-decoration:none}
    a:hover{background:#0D5A96}
  </style>
</head>
<body>
<main>
  <i><svg viewBox="0 0 32 32"><path d="M13 7.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 19 7.5V13h5.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H19v5.5a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5V19H7.5A1.5 1.5 0 0 1 6 17.5v-3A1.5 1.5 0 0 1 7.5 13H13z"/></svg></i>
  <small>404 · NOT FOUND</small>
  <h1>없는 기록입니다</h1>
  <p>삭제되었거나 주소가 바뀐 글입니다.</p>
  <a href="%(base)s">홈으로 돌아가기</a>
</main>
</body>
</html>
"""


if __name__ == '__main__':
    main()