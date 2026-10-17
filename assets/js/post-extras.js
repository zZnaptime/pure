/* ══════════════════════════════════════════════════════════════
   SYRINGE — 글 창 꾸미기 (post-extras.js) : 노래 플레이어 · 파일 카드 · 가운데 정렬
   관리자 화면에서 글에 '음원(mp3)'을 넣으면, 그 글 창 맨 위에 플레이어 + 가사가 나와요.
   - 재생 / 일시정지 / 구간 이동 / mp3 다운로드
   - 가사에 [00:12.30] 같은 시간이 붙어 있으면 노래에 맞춰 줄이 하이라이트돼요
   - 이 노래를 틀면 음악 앱 노래는 멈추고, 음악 앱을 틀면 이 노래가 멈춰요
   - 글 창을 닫으면 노래도 멈춰요
══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var D = document;
  function S(){ return window.SY || {}; }
  function esc(t){ var d = D.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  function tf(s){ s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function rel(u){ u = String(u || '').trim(); return u.charAt(0) === '/' && u.charAt(1) !== '/' ? u.slice(1) : u; }
  function post(slug){ var P = S().posts || []; for (var i = 0; i < P.length; i++) if (P[i].slug === slug) return P[i]; return null; }

  /* ── 가사 : [mm:ss.xx] 가 있으면 싱크 가사 ── */
  function parseLyrics(t){
    if (!t || !String(t).trim()) return { synced: false, lines: [] };
    
    var lines = String(t || '').replace(/\r/g, '').split('\n'), out = [], synced = false;
    lines.forEach(function(l){
      var tags = [], m, re = /\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\]/g;
      while ((m = re.exec(l))) tags.push(+m[1] * 60 + parseFloat(m[2]));
      var txt = l.replace(/\[[^\]]*\]/g, '').trim();
      if (tags.length){ synced = true; tags.forEach(function(s){ out.push({ t: s, x: txt }); }); }
      else if (!/^\[[a-z]+:/i.test(l)) out.push({ t: null, x: txt });
    });
    if (synced) out = out.filter(function(o){ return o.t != null; }).sort(function(a, b){ return a.t - b.t; });
    return { synced: synced, lines: out };
  }

  var DL = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';

  /* ── 본문 꾸미기 : 가운데 정렬 + 파일 링크를 다운로드 카드로 ── */
  var FILE_RE = /\.(gif|png|jpe?g|webp|zip|rar|7z|pdf|psd|clip|txt|mp3|wav|m4a|mp4|ttf|otf)(\?.*)?$/i;
  var FOLDER = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor"/></svg>';
  function size(n){ return n >= 1048576 ? (n / 1048576).toFixed(2) + 'MB' : n >= 1024 ? Math.round(n / 1024) + 'KB' : n + 'B'; }
  /* 파일 카드 모양 (CSS 를 따로 안 넣어도 깨지지 않게 여기서 넣어 줌) */
  (function(){
    if (D.getElementById('sy-pbfile-css')) return;
    var st = D.createElement('style'); st.id = 'sy-pbfile-css';
    st.textContent =
      '.post-body p.pb-filewrap{margin:1em auto;max-width:440px}' +
      '.post-body a.pb-file{display:flex;align-items:center;gap:14px;max-width:440px;margin:0 auto;padding:16px 20px;border:1px solid var(--line,#DCE8F1);border-radius:10px;background:#fff;color:var(--ink,#14324A) !important;text-decoration:none !important;text-align:left;transition:border-color .2s,box-shadow .2s}' +
      '.post-body a.pb-file:hover{border-color:var(--blue2,#1E8FD6);box-shadow:0 6px 18px -10px rgba(30,143,214,.45)}' +
      '.post-body .pb-fi{flex:none;width:28px;height:28px;color:#2A2F36}' +
      '.post-body .pb-fi svg,.post-body .pb-fd svg{width:100% !important;height:100% !important;display:block;margin:0 !important}' +
      '.post-body .pb-fn{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}' +
      '.post-body .pb-fn b{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.post-body .pb-fn small{font-size:10.5px;color:var(--ink3,#8A9DAE)}' +
      '.post-body .pb-fd{flex:none;width:20px;height:20px;color:var(--ink2,#3A5570)}' +
      '.post-body a.pb-file:hover .pb-fd{color:var(--blue2,#1E8FD6)}';
    D.head.appendChild(st);
  })();
  function enhance(w, p){
    var body = w.querySelector('.post-body'); if (!body) return;
    if (p.center) body.classList.add('pb-center');
    Array.prototype.forEach.call(body.querySelectorAll('a[href]'), function(a){
      var href = a.getAttribute('href') || '';
      if (a.querySelector('img') || (!a.classList.contains('pb-attach') && (!/(^|\/)assets\/uploads\//.test(href) || !FILE_RE.test(href)))) return;
      var name = (a.textContent || '').trim() || decodeURIComponent(href.split('/').pop().split('?')[0]);
      a.className = 'pb-file'; a.setAttribute('download', decodeURIComponent(href.split('/').pop().split('?')[0]));
      a.innerHTML = '<i class="pb-fi">' + FOLDER + '</i><span class="pb-fn"><b>' + esc(name) + '</b><small>&nbsp;</small></span><i class="pb-fd">' + DL + '</i>';
      /* 단락에 링크만 있으면 단락째 카드로 */
      var par = a.parentNode; if (par && par.tagName === 'P' && par.textContent.trim() === a.textContent.trim()) par.classList.add('pb-filewrap');
      try { fetch(href, { method: 'HEAD' }).then(function(r){ var n = +r.headers.get('content-length'); if (n) a.querySelector('small').textContent = size(n); }).catch(function(){}); } catch(e){}
    });
  }

  function build(w){
    if (w._song) return; w._song = 1;
    var slug = (w.getAttribute('data-win') || '').replace(/^post-/, ''), p = post(slug);
    if (p) enhance(w, p);
    if (!p || !p.song) return;
    var src = rel(p.song), cover = rel(p.songCover || p.thumbnail || ''), title = p.songTitle || (S().cleanTitle ? S().cleanTitle(p.title) : p.title);
    var fname = (src.split('/').pop() || 'song.mp3').split('?')[0];
    var L = parseLyrics(p.lyrics);
    var box = D.createElement('div'); box.className = 'sg';
    box.innerHTML =
      '<div class="sg-card">' +
        '<div class="sg-cv">' + (cover ? '<img src="' + esc(cover) + '" alt="">' : '<span>♪</span>') + '</div>' +
        '<div class="sg-main">' +
          '<small class="sg-k">' + esc(p.album || 'TRACK') + '</small>' +
          '<b class="sg-tt">' + esc(title) + '</b>' +
          '<span class="sg-ar">' + esc(p.artist || '') + '</span>' +
          '<div class="sg-ctrl">' +
            '<button type="button" class="sg-play" aria-label="재생">' + PLAY + '</button>' +
            '<input type="range" class="sg-seek" min="0" max="1000" value="0" step="1" aria-label="재생 위치">' +
            '<span class="sg-t">0:00 / 0:00</span>' +
            '<a class="sg-dl" href="' + esc(src) + '" download="' + esc(fname) + '" title="mp3 다운로드" aria-label="mp3 다운로드">' + DL + '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      (L.lines.length ? '<div class="sg-lyr' + (L.synced ? ' sync' : '') + '"><p class="sg-cap">LYRICS</p><div class="sg-ls">' +
        L.lines.map(function(o, i){ return '<p data-i="' + i + '"' + (o.t != null ? ' data-t="' + o.t + '"' : '') + '>' + (esc(o.x) || '&nbsp;') + '</p>'; }).join('') +
      '</div></div>' : '') +
      '<audio preload="metadata" src="' + esc(src) + '"></audio>';
    var anchor = w.querySelector('.post-rules') || w.querySelector('.post-body');
    if (anchor) anchor.parentNode.insertBefore(box, anchor); else return;

    /* 카드 색 : 앨범 커버 색을 뽑아서 따라감 (커버 없으면 화이트 무채색) */
    var card = box.querySelector('.sg-card');
    if (cover){
      card.classList.add('has-art'); card.style.setProperty('--sg-img', 'url("' + cover.replace(/"/g, '%22') + '")');
      var im = new Image(); im.onload = function(){
        try {
          var c = D.createElement('canvas'); c.width = c.height = 24; var g = c.getContext('2d'); g.drawImage(im, 0, 0, 24, 24);
          var d = g.getImageData(0, 0, 24, 24).data, r = 0, gg = 0, b = 0, n = 0;
          for (var i = 0; i < d.length; i += 4){
            var mx = Math.max(d[i], d[i+1], d[i+2]), mn = Math.min(d[i], d[i+1], d[i+2]), wgt = 1 + (mx - mn) / 40;  /* 채도 높은 색에 가중치 */
            r += d[i] * wgt; gg += d[i+1] * wgt; b += d[i+2] * wgt; n += wgt;
          }
          r /= n; gg /= n; b /= n;
          var k = Math.min(1, 70 / Math.max(1, (r + gg + b) / 3));  /* 너무 밝으면 어둡게 눌러서 흰 글씨가 보이게 */
          card.style.setProperty('--sg-c', 'rgb(' + Math.round(r * k) + ',' + Math.round(gg * k) + ',' + Math.round(b * k) + ')');
          card.style.setProperty('--sg-a', 'rgb(' + Math.round(r + (255 - r) * .55) + ',' + Math.round(gg + (255 - gg) * .55) + ',' + Math.round(b + (255 - b) * .55) + ')');
        } catch(e){}
      };
      im.src = cover;
    } else card.classList.add('mono');

    var au = box.querySelector('audio'), btn = box.querySelector('.sg-play'), seek = box.querySelector('.sg-seek'), tt = box.querySelector('.sg-t');
    var ls = box.querySelector('.sg-ls'), rows = ls ? Array.prototype.slice.call(ls.children) : [], cur = -1, drag = false;
    function paint(){
      var d = au.duration || 0, c = au.currentTime || 0;
      if (!drag){ seek.value = d ? Math.round(c / d * 1000) : 0; }
      seek.style.setProperty('--v', (seek.value / 10) + '%');
      tt.textContent = tf(c) + ' / ' + tf(d);
      if (L.synced && rows.length){
        var k = -1; for (var i = 0; i < L.lines.length; i++){ if (L.lines[i].t <= c + .15) k = i; else break; }
        if (k !== cur){
          if (rows[cur]) rows[cur].classList.remove('on'); cur = k;
          if (rows[k]){ rows[k].classList.add('on'); ls.scrollTo({ top: rows[k].offsetTop - ls.clientHeight / 2 + rows[k].offsetHeight / 2, behavior: 'smooth' }); }
        }
      }
    }
    function state(){ var on = !au.paused; btn.innerHTML = on ? PAUSE : PLAY; btn.setAttribute('aria-label', on ? '일시정지' : '재생'); box.classList.toggle('playing', on); }
    btn.addEventListener('click', function(){ if (au.paused) au.play().catch(function(){}); else au.pause(); });
    au.addEventListener('play', state); au.addEventListener('pause', state); au.addEventListener('ended', function(){ state(); paint(); });
    au.addEventListener('timeupdate', paint); au.addEventListener('loadedmetadata', paint);
    seek.addEventListener('input', function(){ drag = true; seek.style.setProperty('--v', (seek.value / 10) + '%'); if (au.duration) tt.textContent = tf(au.duration * seek.value / 1000) + ' / ' + tf(au.duration); });
    seek.addEventListener('change', function(){ if (au.duration) au.currentTime = au.duration * seek.value / 1000; drag = false; paint(); });
    if (ls) ls.addEventListener('click', function(e){ var r = e.target.closest('p[data-t]'); if (r){ au.currentTime = +r.getAttribute('data-t'); if (au.paused) au.play().catch(function(){}); } });
    /* 글 창을 닫으면 멈춤 */
    new MutationObserver(function(){ if (!w.classList.contains('open') && !au.paused) au.pause(); }).observe(w, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── 사진 크게 보기 : 글 안 사진을 누르면 화면 가득 (← → 로 넘기기 · ESC / 바깥 클릭으로 닫기) ── */
  (function(){
    var css = D.createElement('style');
    css.textContent =
      '.sy-lb{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(9,20,32,.86);backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .22s}' +
      '.sy-lb.on{opacity:1;pointer-events:auto}' +
      '.sy-lb img{max-width:calc(100vw - 120px);max-height:calc(100vh - 110px);border-radius:10px;box-shadow:0 20px 60px -10px rgba(0,0,0,.6);transform:scale(.96);transition:transform .25s cubic-bezier(.2,.9,.25,1);cursor:zoom-out;user-select:none;-webkit-user-drag:none}' +
      '.sy-lb.on img{transform:none}' +
      '.sy-lb button{position:absolute;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;transition:background .15s}' +
      '.sy-lb button:hover{background:rgba(255,255,255,.24)}' +
      '.sy-lb .x{top:16px;right:16px;width:40px;height:40px;font-size:22px}' +
      '.sy-lb .pv,.sy-lb .nx{top:50%;width:46px;height:46px;margin-top:-23px;font-size:24px}' +
      '.sy-lb .pv{left:18px}.sy-lb .nx{right:18px}' +
      '.sy-lb .ct{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.8);font:700 12px Pretendard,sans-serif;letter-spacing:.06em}' +
      '.sy-lb.one .pv,.sy-lb.one .nx,.sy-lb.one .ct{display:none}' +
      '@media (max-width:640px){.sy-lb img{max-width:100vw;max-height:calc(100vh - 120px);border-radius:0}.sy-lb .pv,.sy-lb .nx{display:none}}';
    D.head.appendChild(css);
    var lb = D.createElement('div'); lb.className = 'sy-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', '사진 크게 보기');
    lb.innerHTML = '<img alt=""><button type="button" class="x" aria-label="닫기">×</button><button type="button" class="pv" aria-label="이전">‹</button><button type="button" class="nx" aria-label="다음">›</button><span class="ct"></span>';
    D.body.appendChild(lb);
    var big = lb.querySelector('img'), list = [], idx = 0, sx = null;
    function paint(){ var im = list[idx]; big.src = im.currentSrc || im.src; big.alt = im.alt || ''; lb.querySelector('.ct').textContent = (idx + 1) + ' / ' + list.length; lb.classList.toggle('one', list.length < 2); }
    function open(im){ var body = im.closest('.post-body'); list = Array.prototype.filter.call(body.querySelectorAll('img'), function(x){ return !x.closest('a'); }); idx = Math.max(0, list.indexOf(im)); paint(); lb.classList.add('on'); }
    function close(){ lb.classList.remove('on'); }
    function go(d){ if (list.length < 2) return; idx = (idx + d + list.length) % list.length; paint(); }
    D.addEventListener('click', function(e){
      var im = e.target.closest && e.target.closest('.post-body img');
      if (!im || im.closest('a') || im.closest('.sg')) return;
      e.preventDefault(); e.stopPropagation(); open(im);
    }, true);
    lb.addEventListener('click', function(e){
      if (e.target.classList.contains('pv')) go(-1); else if (e.target.classList.contains('nx')) go(1); else close();
    });
    D.addEventListener('keydown', function(e){ if (!lb.classList.contains('on')) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); });
    lb.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function(e){ if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50){ go(dx < 0 ? 1 : -1); } });
  })();

  /* 한 번에 한 곡만 : 어떤 소리가 재생되면 나머지는 멈춤 (음악 앱 포함) */
  D.addEventListener('play', function(e){
    if (!e.target || e.target.tagName !== 'AUDIO') return;
    Array.prototype.forEach.call(D.querySelectorAll('audio'), function(a){ if (a !== e.target && !a.paused) a.pause(); });
  }, true);

  /* 글 창이 새로 생기면 플레이어 붙이기 */
  function scan(root){
    if (root.matches && root.matches('.win.app-post')) build(root);
    if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('.win.app-post'), build);
  }
  new MutationObserver(function(ms){ ms.forEach(function(m){ m.addedNodes.forEach(function(n){ if (n.nodeType === 1) scan(n); }); }); }).observe(D.body, { childList: true, subtree: true });
  scan(D.body);
})();