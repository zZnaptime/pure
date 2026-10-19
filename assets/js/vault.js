/* ══════════════════════════════════════════════════════════════
   SYRINGE — PROMPT 보관함 (사이트 쪽)

   · Notice 목록 맨 앞에 잠긴 상자가 생겨요. 누르면 비밀번호 창.
   · 비밀번호를 넣은 순간에만 vault/vault.json(암호문)을 받아 브라우저 안에서 풀어요.
     푼 내용과 키는 이 창의 메모리에만 있고, 창을 닫거나 [LOCK]을 누르면 지워져요.
   · 페어 · 프롬프트 · 사진은 관리 화면(admin.html → 프롬프트 관리)에서 고쳐요.
══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var D = document;
  function $(s, r){ return (r || D).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(t){ var d = D.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  function pad(n){ return (n < 10 ? '0' : '') + n; }

  var I_LOCK = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 15v2.2"/></svg>';
  var I_OPEN = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 7.6-1.7"/><path d="M12 15v2.2"/></svg>';
  var I_BACK = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>';
  var I_COPY = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
  /* 표정 칩 : ON = 웃는 얼굴 / OFF = -.- 무표정 */
  var I_FACE_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle class="f" cx="9" cy="10" r="1.2"/><circle class="f" cx="15" cy="10" r="1.2"/><path d="M8.2 14.2a4.6 4.6 0 0 0 7.6 0"/></svg>';
  var I_FACE_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M7.6 10.4h2.8M13.6 10.4h2.8"/><circle class="f" cx="12" cy="15.4" r=".9"/></svg>';
  var I_CLIP = '<svg class="vt-clip" viewBox="0 0 24 60" aria-hidden="true"><path d="M8 40V10a5 5 0 0 1 10 0v34a7 7 0 0 1-14 0V16"/></svg>';
  var MODES = [['full', '전체'], ['upper', '상반신만'], ['noshoes', '신발 없이']];

  /* 메모리에만 두는 상태 */
  var S = { look: {}, noface: {}, key: null, data: null, urls: {}, view: 'lock', pi: -1, oi: -1, mode: 'full', genre: '', q: '', fails: 0, until: 0, big: false };
  var win = null;

  /* ════════ Notice 목록 : 잠긴 상자 ════════ */
  function boxSVG(){
    return '<svg class="vb-svg" viewBox="0 0 220 180" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="vbFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17598C"/><stop offset="1" stop-color="#0B3254"/></linearGradient>' +
        '<linearGradient id="vbTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3C8FCB"/><stop offset="1" stop-color="#1E6EA8"/></linearGradient>' +
        '<linearGradient id="vbLid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2479B5"/><stop offset="1" stop-color="#155B90"/></linearGradient>' +
        '<linearGradient id="vbLock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CFE6F5"/></linearGradient>' +
        '<pattern id="vbDots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".9" fill="#fff" opacity=".18"/></pattern>' +
      '</defs>' +
      '<ellipse class="vb-shadow" cx="110" cy="166" rx="84" ry="8"/>' +
      '<path d="M44 46 H176 L190 66 H30 Z" fill="url(#vbTop)"/>' +
      '<rect x="30" y="64" width="160" height="94" rx="9" fill="url(#vbFront)"/>' +
      '<rect x="30" y="64" width="160" height="94" rx="9" fill="url(#vbDots)"/>' +
      '<rect x="26" y="60" width="168" height="20" rx="6" fill="url(#vbLid)"/>' +
      '<rect x="26" y="60" width="168" height="3" rx="1.5" fill="#fff" opacity=".28"/>' +
      '<g fill="#CDE9F7" opacity=".55"><path d="M30 140v9a9 9 0 0 0 9 9h9v-6h-7a5 5 0 0 1-5-5v-7z"/><path d="M190 140v9a9 9 0 0 1-9 9h-9v-6h7a5 5 0 0 0 5-5v-7z"/></g>' +
      '<g fill="#8FC3E6"><circle cx="38" cy="70" r="1.6"/><circle cx="182" cy="70" r="1.6"/><circle cx="38" cy="150" r="1.6"/><circle cx="182" cy="150" r="1.6"/></g>' +
      '<rect x="98" y="72" width="24" height="22" rx="4" fill="#CFE5F3"/><rect x="104" y="78" width="12" height="4" rx="2" fill="#0B3254" opacity=".5"/>' +
      '<g class="vb-tape" transform="rotate(-7 110 70)"><path d="M10 60 l5 4 -5 4 5 4 -5 4 H210 l-5 -4 5 -4 -5 -4 5 -4 Z" fill="#6EE7C8"/><path d="M10 60 H210" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>' +
        '<text x="110" y="73.6" text-anchor="middle">✦ PROMPT ✦</text></g>' +
      '<g class="vb-lock">' +
        '<path class="vb-shk" d="M100 108 V98 a10 10 0 0 1 20 0 V108" fill="none" stroke="#E8F3FA" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="90" y="104" width="40" height="32" rx="8" fill="url(#vbLock)"/>' +
        '<rect x="90" y="104" width="40" height="32" rx="8" fill="none" stroke="#0B3254" stroke-opacity=".15"/>' +
        '<circle cx="110" cy="117" r="3.6" fill="#0D5A96"/><rect x="108.6" y="118" width="2.8" height="8" rx="1.4" fill="#0D5A96"/>' +
      '</g>' +
      '<g class="vb-pin"><rect x="84" y="142" width="52" height="11" rx="5.5" fill="#072038"/>' +
        '<circle cx="96" cy="147.5" r="2.4"/><circle cx="105" cy="147.5" r="2.4"/><circle cx="114" cy="147.5" r="2.4"/><circle cx="123" cy="147.5" r="2.4"/></g>' +
    '</svg>';
  }
  function mount(body){
    if (!body) return;
    var grid = $('.card-grid', body);
    if (!grid){ grid = D.createElement('div'); grid.className = 'card-grid'; body.insertBefore(grid, body.firstChild); }
    if ($('.vault-card', grid)) return;
    var b = D.createElement('button'); b.type = 'button'; b.className = 'sheet-card vault-card' + (S.key ? ' open' : '');
    b.setAttribute('aria-label', 'PROMPT 보관함 열기 (비밀번호 필요)');
    b.innerHTML = '<span class="vb-scene">' + boxSVG() + '</span>';
    b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); open(); });
    grid.insertBefore(b, grid.firstChild);
  }
  function syncCards(){
    $$('.vault-card').forEach(function(c){ c.classList.toggle('open', !!S.key); });
  }

  /* ════════ 창 ════════ */
  function ensureWin(){
    if (win) return win;
    win = D.createElement('section');
    win.className = 'win app-vault'; win.setAttribute('data-win', 'vault'); win.setAttribute('data-title', 'Prompt'); win.setAttribute('aria-label', '프롬프트 보관함');
    /* 창 = 서류철. 위로 튀어나온 탭(.wbar)을 잡고 끌면 창이 움직여요 */
    win.innerHTML = '<header class="wbar vt-tab" title="끌어서 옮기기"><span class="vt-ic">' + I_LOCK + '</span><b>PROMPT</b><i id="vtTabSub">CONFIDENTIAL</i></header>' +
      '<div class="vt-folder">' +
        '<div class="vt-ctl"><span class="vt-label" id="vtLabel">ARCH CLINIC · RESTRICTED FILE</span>' +
          '<button type="button" class="vt-btn vt-lockbtn" data-lock aria-label="잠그기" title="잠그기" disabled>' + I_LOCK + '</button>' +
          '<button type="button" class="vt-btn wx" aria-label="닫기" title="닫기"><svg viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6"/></svg></button></div>' +
        '<div class="wbody"><div class="vt-stack"><div class="vt-paper" id="vtRoot"></div></div></div>' +
      '</div>';
    ($('.sy-float') || D.body).appendChild(win);
    if (window.syRegWin) window.syRegWin(win);
    /* 창을 닫으면 (최소화 말고) 바로 잠그기 */
    new MutationObserver(function(){ if (!win.classList.contains('open') && S.key) lock(); }).observe(win, { attributes: true, attributeFilter: ['class'] });
    win.addEventListener('click', onClick);
    win.addEventListener('change', onChange);
    win.addEventListener('input', onInput);
    win.addEventListener('submit', onSubmit);
    return win;
  }
  function open(){
    ensureWin();
    if (!S.key) S.view = 'lock';
    render();
    if (window.syOpen) window.syOpen('vault');
    if (!S.key) setTimeout(function(){ var i = $('#vlPw', win); if (i) i.focus(); }, 60);
  }
  function setHead(){
    if (!win) return;
    win.classList.toggle('unlocked', !!S.key);
    win.setAttribute('data-view', S.key ? S.view : 'lock');
    $('.vt-ic', win).innerHTML = S.key ? I_OPEN : I_LOCK;
    var p = S.data && S.pi >= 0 ? S.data.pairs[S.pi] : null;
    $('#vtTabSub', win).textContent = !S.key ? 'CONFIDENTIAL' : p ? (p.genre || 'FILE') : pad(S.data.pairs.length) + ' FILES';
    $('#vtLabel', win).textContent = !S.key ? 'ARCH CLINIC · RESTRICTED FILE' : p ? 'SUBJECT · ' + (p.name || 'PAIR') : 'ARCH CLINIC · PAIR INDEX';
    var lb = $('.vt-lockbtn', win); lb.disabled = !S.key; lb.innerHTML = S.key ? I_OPEN : I_LOCK; lb.title = S.key ? '잠그기' : '잠겨 있어요';
  }

  /* ════════ 잠금 · 해제 ════════ */
  function lock(){
    Object.keys(S.urls).forEach(function(k){ try { URL.revokeObjectURL(S.urls[k]); } catch(e){} });
    S.key = null; S.data = null; S.urls = {}; S.view = 'lock'; S.pi = -1; S.oi = -1; S.mode = 'full'; S.genre = ''; S.q = ''; S.big = false; S.look = {}; S.noface = {};
    syncCards();
    if (win) render();
  }
  function unlock(pw){
    var now = Date.now();
    if (S.until > now){ return Promise.reject(new Error(Math.ceil((S.until - now) / 1000) + '초 뒤에 다시 시도해 주세요.')); }
    if (!window.SYV) return Promise.reject(new Error('보관함 모듈을 못 불러왔어요.'));
    return fetch('vault/vault.json?t=' + now, { cache: 'no-store' }).then(function(r){
      if (!r.ok) throw new Error('보관함 파일을 못 찾았어요.');
      return r.json();
    }).then(function(f){ return SYV.open(f, pw); }).then(function(o){
      S.key = o.key; S.data = normalize(o.data); S.fails = 0; S.view = 'list';
      syncCards();
    }, function(e){
      if (e && e.bad){ S.fails++; if (S.fails >= 5){ S.until = Date.now() + 30000; S.fails = 0; } }
      throw e;
    });
  }
  function normalize(d){
    d = d || {}; d.pairs = Array.isArray(d.pairs) ? d.pairs : []; d.genres = Array.isArray(d.genres) ? d.genres : [];
    d.labels = Array.isArray(d.labels) ? d.labels : ['MAIN', 'SUB', 'DIP'];
    d.pairs.forEach(function(p){ p.chars = Array.isArray(p.chars) ? p.chars : []; p.outfits = Array.isArray(p.outfits) ? p.outfits : []; p.tags = Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map(function(t){ return t.trim(); }).filter(Boolean); });
    /* 외형 : 캐릭터 한 명에 기본 프롬프트 여러 개 (예전 데이터는 base 하나 → 외형 1개) */
    d.pairs.forEach(function(p){ p.chars.forEach(function(c){ if (!Array.isArray(c.looks) || !c.looks.length) c.looks = [{ name: '', base: c.base || '' }]; }); });
    return d;
  }

  /* 사진 : 필요할 때만 받아서 풀기 */
  function imgUrl(ref){
    if (!ref || !ref.id) return Promise.resolve('');
    if (S.urls[ref.id]) return Promise.resolve(S.urls[ref.id]);
    var key = S.key;
    return fetch('vault/img/' + encodeURIComponent(ref.id) + '.bin').then(function(r){ if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(function(b){ return SYV.decBytes(key, b); })
      .then(function(p){ if (key !== S.key) return ''; var u = URL.createObjectURL(new Blob([p], { type: ref.type || 'image/png' })); S.urls[ref.id] = u; return u; })
      .catch(function(){ return ''; });
  }
  function paintImgs(){
    $$('[data-vimg]', win).forEach(function(box){
      var id = box.getAttribute('data-vimg'), type = box.getAttribute('data-vtype');
      if (!id){ box.innerHTML = '<span class="vi-ph none"></span>'; return; }
      imgUrl({ id: id, type: type }).then(function(u){
        if (box.getAttribute('data-vimg') !== id) return;
        box.innerHTML = u ? '<img alt="" src="' + u + '">' : '<span class="vi-ph none"></span>';
      });
    });
  }
  function imgBox(cls, ref){ return '<span class="' + cls + '" data-vimg="' + esc(ref && ref.id || '') + '" data-vtype="' + esc(ref && ref.type || '') + '"><span class="vi-ph' + (ref && ref.id ? '' : ' none') + '"></span></span>'; }

  /* ════════ 프롬프트 조립 ════════ */
  function clean(s){ return String(s || '').trim(); }
  /* 라벨 : 관리 화면 라벨 목록에서 위에 있을수록 진하게 (0 MAIN · 1 SUB · 2 DIP · 3 그 밖) */
  function labelHTML(cls, l){ if (!l) return ''; var i = S.data.labels.indexOf(l); return '<span class="' + cls + '" data-rank="' + (i < 0 ? 3 : Math.min(i, 3)) + '">' + esc(l) + '</span>'; }
  /* 표정 제거 : 관리 화면 '표정 프롬프트' 칸에 적은 글(한 줄에 하나)을 기본 프롬프트에서 그대로 찾아 빼요 */
  function stripFace(base, face){
    var out = String(base || '');
    String(face || '').split('\n').map(clean).filter(Boolean).forEach(function(f){
      var g = f.replace(/,\s*$/, ''), i = out.indexOf(f);
      if (i < 0 && g){ i = out.indexOf(g); f = g; }
      if (i >= 0) out = out.slice(0, i) + out.slice(i + f.length);
    });
    return out.replace(/[ \t]*,[ \t]*(,[ \t]*)+/g, ', ').replace(/^[ \t,]+/gm, '').replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+$/gm, '').trim();
  }
  function hasFace(lk){ return !!clean(lk && lk.face); }
  function promptOf(p, ci){
    var c = p.chars[ci] || {}, looks = c.looks || [{ base: c.base }], lk = looks[S.look[ci] || 0] || looks[0], base = clean(lk.base);
    if (S.noface[ci] && hasFace(lk)) base = stripFace(base, lk.face);
    var o = S.oi >= 0 ? p.outfits[S.oi] : null;
    if (!o) return base;
    var part = (o.parts || [])[ci] || {};
    var bits = [clean(part.top)];
    if (S.mode !== 'upper') bits.push(clean(part.bottom));
    if (S.mode === 'full') bits.push(clean(part.shoes));
    var wear = bits.filter(Boolean).join(' ');
    return wear ? (base ? base + '\n\n' + wear : wear) : base;
  }

  /* ════════ 화면 ════════ */
  function render(){
    if (!win) return;
    unzoom();
    var root = $('#vtRoot', win), h = '';
    if (!S.key) h = lockHTML();
    else if (S.view === 'pair' && S.data.pairs[S.pi]) h = pairHTML(S.data.pairs[S.pi]);
    else { S.view = 'list'; S.pi = -1; h = listHTML(); }
    root.innerHTML = h;
    setHead();
    if (S.key) paintImgs();
    var wb = $('.wbody', win); if (wb) wb.scrollTop = 0;
  }
  function lockHTML(){
    return '<div class="vt-lock" id="vtLock">' + I_CLIP +
      '<span class="vt-stamp">RESTRICTED</span>' +
      '<p class="vt-docno"><span>ARCH CLINIC · ACCESS FORM</span><span>Nº PR-' + new Date().getFullYear() + '</span></p>' +
      '<div class="vl-mid">' +
        '<div class="vl-emb"><span>' + I_LOCK + '</span></div>' +
        '<h2 class="vl-t">PROMPT</h2>' +
        '<p class="vl-s"><b>프롬프트 보관함</b>입니다.<br>접근 코드를 입력하세요.</p>' +
        '<form class="vl-f" id="vlForm" autocomplete="off"><label for="vlPw">ACCESS CODE</label><div class="vl-row"><input id="vlPw" type="password" placeholder="PASSWORD" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"><button type="submit" id="vlGo">UNLOCK</button></div></form>' +
        '<p class="vl-err" id="vlErr" role="alert"></p>' +
      '</div>' +
      '<p class="vt-foot"><span>CLASSIFIED — AUTHORIZED PERSONNEL ONLY</span><span>ARCH MEDICAL CENTER</span></p>' +
    '</div>';
  }
  function listHTML(){
    var d = S.data, gs = d.genres.slice();
    d.pairs.forEach(function(p){ if (p.genre && gs.indexOf(p.genre) < 0) gs.push(p.genre); });
    if (S.genre && gs.indexOf(S.genre) < 0) S.genre = '';
    var q = S.q.trim().toLowerCase();
    var arr = d.pairs.map(function(p, i){ return [p, i]; }).filter(function(x){
      var p = x[0]; if (S.genre && p.genre !== S.genre) return false;
      if (!q) return true;
      return [p.name, p.sub, p.genre].concat(p.tags, p.chars.map(function(c){ return c.name; })).join(' ').toLowerCase().indexOf(q) >= 0;
    });
    var cards = arr.map(function(x){
      var p = x[0];
      return '<button type="button" class="vp-card" data-pair="' + x[1] + '">' +
        '<span class="vp-tape" aria-hidden="true"></span>' +
        '<span class="vp-photo">' + imgBox('vp-img', p.img) + labelHTML('vp-label', p.label) + '</span>' +
        '<span class="vp-meta"><em>Nº ' + pad(x[1] + 1) + (p.genre ? ' · ' + esc(p.genre) : '') + '</em><b>' + esc(p.name || '이름 없음') + '</b>' + (p.sub ? '<small>' + esc(p.sub) + '</small>' : '') + '</span>' +
      '</button>';
    }).join('');
    return '<div class="vt-list">' + I_CLIP +
      '<p class="vt-docno"><span>INDEX · PAIR FILES</span><span>' + pad(d.pairs.length) + ' FILES</span></p>' +
      '<div class="vt-bar"><div class="vt-chips">' + [''].concat(gs).map(function(g){ return '<button type="button" data-genre="' + esc(g) + '"' + (g === S.genre ? ' class="on"' : '') + '>' + (g ? esc(g) : 'ALL') + '</button>'; }).join('') + '</div>' +
        '<input type="search" class="vt-q" id="vtQ" placeholder="페어 · 태그 검색" value="' + esc(S.q) + '"></div>' +
      (cards ? '<div class="vt-grid">' + cards + '</div>' : '<p class="vt-empty">' + (d.pairs.length ? '찾는 페어가 없어요.' : '아직 등록된 페어가 없습니다.') + '</p>') +
    '</div>';
  }
  function pairHTML(p){
    var o = S.oi >= 0 ? p.outfits[S.oi] : null;
    var img = (o && o.img && o.img.id) ? o.img : p.img;
    var tabs = '<div class="vd-tabs" role="tablist" aria-label="의상">' +
      '<button type="button" role="tab" data-outfit="-1" aria-selected="' + (S.oi < 0) + '"' + (S.oi < 0 ? ' class="on"' : '') + '>BASE<small>기본</small></button>' +
      p.outfits.map(function(x, i){
        return '<button type="button" role="tab" data-outfit="' + i + '" aria-selected="' + (i === S.oi) + '"' + (i === S.oi ? ' class="on"' : '') + '>' + esc(x.name || ('의상 ' + (i + 1))) + (x.sub ? '<small>' + esc(x.sub) + '</small>' : '') + '</button>';
      }).join('') + '</div>';
    var mode = o ? '<div class="vd-mode" role="radiogroup" aria-label="범위">' + MODES.map(function(m){
      return '<label><input type="radio" name="vdMode" value="' + m[0] + '"' + (S.mode === m[0] ? ' checked' : '') + '><span>' + m[1] + '</span></label>';
    }).join('') + '</div>' : '';
    var chars = p.chars.map(function(c, ci){
      return '<section class="vd-ch"><header><em>' + pad(ci + 1) + '</em><b>' + esc(c.name || ('캐릭터 ' + (ci + 1))) + '</b>' +
        (function(){
          var looks = c.looks || [], cur = looks[S.look[ci] || 0] || looks[0];
          if (!hasFace(cur)) return '';
          var off = !!S.noface[ci];
          return '<button type="button" class="vd-face' + (off ? ' off' : '') + '" data-face="' + ci + '" aria-pressed="' + !off + '" title="' + (off ? '클릭 → 표정 넣기' : '클릭 → 표정 빼기') + '">' + (off ? I_FACE_OFF : I_FACE_ON) + '<span>표정 ' + (off ? 'OFF' : 'ON') + '</span></button>';
        })() +
        '<button type="button" class="vd-copy" data-copy="' + ci + '">' + I_COPY + '<span>COPY</span></button></header>' +
        (function(){
          var looks = c.looks || [], many = looks.length > 1;
          if (!many) return '';
          return '<div class="vd-looks">' +
            (many ? '<span>LOOK</span>' + looks.map(function(l, li){
              var on = (S.look[ci] || 0) === li;
              return '<button type="button" data-look="' + ci + ':' + li + '" aria-pressed="' + on + '"' + (on ? ' class="on"' : '') + '>' + esc(l.name || (li ? '외형 ' + (li + 1) : '기본')) + '</button>';
            }).join('') : '') +
          '</div>';
        })() +
        '<div class="vd-txt" id="vdTxt' + ci + '">' + esc(promptOf(p, ci)) + '</div></section>';
    }).join('');
    return '<div class="vt-detail">' + I_CLIP +
      '<div class="vd-top"><button type="button" class="vd-back" data-back>' + I_BACK + 'INDEX</button><span class="vd-path">SUBJECT FILE Nº ' + pad(S.pi + 1) + '</span></div>' +
      '<div class="vd-head">' +
        '<div class="vd-id">' +
          (p.genre ? '<span class="vd-genre">' + esc(p.genre) + '</span>' : '') + labelHTML('vd-label', p.label) +
          '<h2 class="vd-name">' + esc(p.name || '') + '</h2>' + (p.sub ? '<p class="vd-sub">' + esc(p.sub) + '</p>' : '') +
          (p.tags.length ? '<div class="vd-tags">' + p.tags.map(function(t){ return '<i>#' + esc(t) + '</i>'; }).join('') + '</div>' : '') +
          '<dl class="vd-facts"><div><dt>SUBJECTS</dt><dd>' + pad(p.chars.length) + '</dd></div><div><dt>OUTFITS</dt><dd>' + pad(p.outfits.length) + '</dd></div><div><dt>WEARING</dt><dd>' + esc(o ? (o.name || '의상 ' + (S.oi + 1)) : 'NONE') + '</dd></div></dl>' +
        '</div>' +
        '<button type="button" class="vd-photo" data-zoom title="사진 크게 보기">' + imgBox('vd-img', img) + '<span class="vd-cap">' + esc(o ? (o.name || '') + (o.sub ? ' · ' + o.sub : '') : 'BASE') + '</span></button>' +
      '</div>' +
      '<div class="vd-sec"><span>OUTFIT</span><i></i></div>' +
      '<div class="vd-ctrl">' + tabs + mode + '</div>' +
      '<div class="vd-chars' + (p.chars.length > 1 ? ' two' : '') + '">' + (chars || '<p class="vt-empty">캐릭터 프롬프트가 없어요.</p>') + '</div>' +
    '</div>';
  }
  /* 사진 크게 보기 : 레이아웃은 그대로 두고, 서류철 안을 덮는 어둑한 하프톤 막 위에 꽉 차게 */
  function zoom(btn){
    var im = $('.vd-img img', btn); if (!im) return;
    unzoom();
    var z = D.createElement('div'); z.className = 'vt-zoom'; z.setAttribute('data-unzoom', ''); z.setAttribute('role', 'dialog'); z.setAttribute('aria-label', '사진 크게 보기');
    var cap = $('.vd-cap', btn);
    z.innerHTML = '<img alt="" src="' + im.getAttribute('src') + '">' + (cap && cap.textContent ? '<span class="vz-cap">' + esc(cap.textContent) + '</span>' : '') +
      '<button type="button" class="vz-x" aria-label="닫기"><svg viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6"/></svg></button>';
    $('.vt-folder', win).appendChild(z);
    requestAnimationFrame(function(){ z.classList.add('on'); });
    try { $('.vz-x', z).focus({ preventScroll: true }); } catch(x){}
  }
  function unzoom(){ if (!win) return; $$('.vt-zoom', win).forEach(function(z){ z.parentNode.removeChild(z); }); }
  D.addEventListener('keydown', function(e){ if (e.key === 'Escape' && win && $('.vt-zoom', win)){ e.stopPropagation(); unzoom(); } }, true);

  /* 의상 · 범위만 바뀔 때 : 다시 그리되 스크롤은 그대로 */
  function refreshPair(){
    var p = S.data.pairs[S.pi]; if (!p) return render();
    var wb = $('.wbody', win), y = wb.scrollTop;
    $('#vtRoot', win).innerHTML = pairHTML(p);
    setHead(); paintImgs();
    wb.scrollTop = y;
  }

  /* ════════ 이벤트 ════════ */
  function onSubmit(e){
    if (e.target.id !== 'vlForm') return;
    e.preventDefault();
    var inp = $('#vlPw', win), btn = $('#vlGo', win), err = $('#vlErr', win), pw = inp.value;
    if (!pw){ inp.focus(); return; }
    btn.disabled = true; inp.disabled = true; err.className = 'vl-busy'; err.textContent = 'DECRYPTING…';
    unlock(pw).then(function(){ render(); }).catch(function(x){
      inp.value = ''; inp.disabled = false; btn.disabled = false; err.className = 'vl-err'; err.textContent = (x && x.message) || '열지 못했어요.';
      var l = $('#vtLock', win); l.classList.remove('shake'); void l.offsetWidth; l.classList.add('shake'); inp.focus();
    });
  }
  function onClick(e){
    var t;
    if ((t = e.target.closest('[data-lock]'))){ lock(); return; }
    if ((t = e.target.closest('[data-genre]'))){ S.genre = t.getAttribute('data-genre'); render(); return; }
    if ((t = e.target.closest('[data-pair]'))){ S.pi = +t.getAttribute('data-pair'); S.oi = -1; S.mode = 'full'; S.big = false; S.look = {}; S.noface = {}; S.view = 'pair'; render(); return; }
    if ((t = e.target.closest('[data-back]'))){ S.view = 'list'; S.pi = -1; render(); return; }
    if ((t = e.target.closest('[data-outfit]'))){ S.oi = +t.getAttribute('data-outfit'); if (S.oi < 0) S.mode = 'full'; refreshPair(); return; }
    if ((t = e.target.closest('[data-face]'))){ var fi = +t.getAttribute('data-face'); S.noface[fi] = !S.noface[fi]; refreshPair(); var fb = $('[data-face="' + fi + '"]', win); if (fb) fb.focus(); return; }
    if ((t = e.target.closest('[data-look]'))){ var lv = t.getAttribute('data-look').split(':'); S.look[+lv[0]] = +lv[1]; refreshPair(); return; }
    if ((t = e.target.closest('[data-unzoom]'))){ unzoom(); return; }
    if ((t = e.target.closest('[data-zoom]'))){ zoom(t); return; }
    if ((t = e.target.closest('[data-copy]'))){ copy(t); }
  }
  function onChange(e){
    if (e.target.name === 'vdMode'){ S.mode = e.target.value; refreshPair(); var r = $('input[name="vdMode"]:checked', win); if (r) r.focus(); } }
  var qT;
  function onInput(e){
    if (e.target.id !== 'vtQ') return;
    S.q = e.target.value; clearTimeout(qT);
    qT = setTimeout(function(){ var pos = e.target.selectionStart; render(); var q = $('#vtQ', win); if (q){ q.focus(); try { q.setSelectionRange(pos, pos); } catch(x){} } }, 180);
  }
  function copy(btn){
    var box = $('#vdTxt' + btn.getAttribute('data-copy'), win); if (!box) return;
    var text = box.textContent, lab = $('span', btn);
    function ok(){ btn.classList.add('ok'); lab.textContent = 'COPIED'; setTimeout(function(){ btn.classList.remove('ok'); lab.textContent = 'COPY'; }, 1400); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
    function fallback(){
      var ta = D.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      D.body.appendChild(ta); ta.select(); try { D.execCommand('copy'); ok(); } catch(x){} D.body.removeChild(ta);
    }
  }

  window.SY_VAULT = { mount: mount, open: open, lock: lock };
})();