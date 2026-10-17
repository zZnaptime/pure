"""
posts/*.md  →  posts/posts.json

글 파일(마크다운)을 읽어서 홈이 쓰는 글 목록 파일을 만들어요.
깃허브에 글을 올리면 GitHub Actions 가 자동으로 실행하니까 직접 돌릴 필요는 없어요.
(내 컴퓨터에서 미리 보고 싶을 때만:  pip install markdown pyyaml  →  python tools/build_posts.py)
"""
import os, re, json, datetime, html as H
import yaml, markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, 'posts')
OUT = os.path.join(POSTS, 'posts.json')
FM = re.compile(r'^---\s*\n(.*?)\n---\s*\n?(.*)$', re.S)


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


def text_of(html_src):
    t = re.sub(r'<[^>]+>', ' ', html_src)
    return re.sub(r'\s+', ' ', H.unescape(t)).strip()


def main():
    items = []
    for fn in sorted(os.listdir(POSTS)):
        if not fn.endswith('.md'):
            continue
        raw = open(os.path.join(POSTS, fn), encoding='utf-8').read().replace('\r\n', '\n')
        m = FM.match(raw)
        meta, body = (yaml.safe_load(m.group(1)) or {}, m.group(2)) if m else ({}, raw)
        if meta.get('draft'):
            continue
        slug = fn[:-3]
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
            'slug': slug,
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
    items.reverse()               # 최신 글이 위로
    json.dump(items, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('posts.json : %d개' % len(items))


if __name__ == '__main__':
    main()