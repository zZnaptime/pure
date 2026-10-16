/* ══════════════════════════════════════════════════════════════
   SYRINGE — 노래 글 플레이어
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

  var DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';

  /* ── 본문 꾸미기 : 가운데 정렬 + 파일 링크를 다운로드 카드로 ── */
  var FILE_RE = /\.(gif|png|jpe?g|webp|zip|rar|7z|pdf|psd|clip|txt|mp3|wav|m4a|mp4|ttf|otf)(\?.*)?$/i;
  var FOLDER = '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor"/></svg>';
  function size(n){ return n >= 1048576 ? (n / 1048576).toFixed(2) + 'MB' : n >= 1024 ? Math.round(n / 1024) + 'KB' : n + 'B'; }
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
          '<small class="sg-k">TRACK · ' + esc(p.category || 'MUSIC') + '</small>' +
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