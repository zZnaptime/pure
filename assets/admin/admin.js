/* ══════════════════════════════════════════════════════════════
   SYRINGE — 글쓰기 화면 (admin.html)
   깃허브 저장소에 바로 저장해요. 저장 한 번 = 커밋 한 번 (글 + 첨부파일 같이).
   저장하면 GitHub Actions 가 글 목록을 다시 만들고 1~2분 뒤 사이트에 반영돼요.
══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var D = document, $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var KEY = 'sy-admin', CFG = {};
  try { CFG = JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){}

  function esc(t){ var d = D.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  var toastT;
  function toast(t, bad){ var el = $('#toast'); el.textContent = t; el.className = 'ad-toast on' + (bad ? ' bad' : ''); clearTimeout(toastT); toastT = setTimeout(function(){ el.className = 'ad-toast'; }, bad ? 5000 : 2600); }

  /* ════════ 깃허브 API ════════ */
  function enc(path){ return path.split('/').map(encodeURIComponent).join('/'); }
  function gh(path, opt){
    opt = opt || {};
    return fetch('https://api.github.com' + path, {
      method: opt.method || 'GET', cache: 'no-store',
      headers: Object.assign({ 'Authorization': 'Bearer ' + CFG.token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opt.body ? { 'Content-Type': 'application/json' } : {}, opt.headers || {}),
      body: opt.body ? JSON.stringify(opt.body) : undefined
    }).then(function(r){
      if (opt.raw) return r.ok ? r.text() : Promise.reject({ status: r.status, message: '파일을 못 불러왔어요 (' + r.status + ')' });
      return r.text().then(function(t){
        var j = null; try { j = t ? JSON.parse(t) : null; } catch(e){}
        if (!r.ok) return Promise.reject({ status: r.status, message: (j && j.message) || ('오류 ' + r.status) });
        return j;
      });
    });
  }
  function R(){ return '/repos/' + encodeURIComponent(CFG.owner) + '/' + encodeURIComponent(CFG.repo); }
  function raw(path){ return gh(R() + '/contents/' + enc(path) + '?ref=' + encodeURIComponent(CFG.branch), { raw: true, headers: { 'Accept': 'application/vnd.github.raw+json' } }); }
  function list(path){ return gh(R() + '/contents/' + enc(path) + '?ref=' + encodeURIComponent(CFG.branch)).catch(function(e){ if (e.status === 404) return []; throw e; }); }

  function u8b64(u8){ var s = '', C = 0x8000; for (var i = 0; i < u8.length; i += C) s += String.fromCharCode.apply(null, u8.subarray(i, i + C)); return btoa(s); }
  function textB64(t){ return u8b64(new TextEncoder().encode(t)); }
  function fileB64(f){ return f.arrayBuffer().then(function(b){ return u8b64(new Uint8Array(b)); }); }

  /* 여러 파일을 커밋 하나로 : entries = [{path, b64}] 또는 [{path, del:true}] */
  function commit(entries, message){
    var blobs = {};
    function attempt(n){
      var refSha, baseTree;
      return gh(R() + '/git/ref/heads/' + enc(CFG.branch)).then(function(ref){
        refSha = ref.object.sha;
        return gh(R() + '/git/commits/' + refSha);
      }).then(function(c){
        baseTree = c.tree.sha;
        return entries.reduce(function(p, e){
          return p.then(function(){
            if (e.del || blobs[e.path]) return;
            return gh(R() + '/git/blobs', { method: 'POST', body: { content: e.b64, encoding: 'base64' } }).then(function(b){ blobs[e.path] = b.sha; });
          });
        }, Promise.resolve());
      }).then(function(){
        return gh(R() + '/git/trees', { method: 'POST', body: { base_tree: baseTree, tree: entries.map(function(e){ return { path: e.path, mode: '100644', type: 'blob', sha: e.del ? null : blobs[e.path] }; }) } });
      }).then(function(t){
        return gh(R() + '/git/commits', { method: 'POST', body: { message: message, tree: t.sha, parents: [refSha] } });
      }).then(function(c){
        return gh(R() + '/git/refs/heads/' + enc(CFG.branch), { method: 'PATCH', body: { sha: c.sha, force: false } });
      }).catch(function(e){
        if (n < 3 && (e.status === 422 || e.status === 409)) return new Promise(function(ok){ setTimeout(ok, 1200); }).then(function(){ return attempt(n + 1); });
        throw e;
      });
    }
    return attempt(0);
  }

  /* ════════ 화면 전환 ════════ */
  function show(v){
    ['vLock', 'vLogin', 'vList', 'vEdit'].forEach(function(id){ $('#' + id).hidden = id !== v; });
    var guest = v === 'vLogin' || v === 'vLock';
    $('#adNav').hidden = guest; $('#adLogout').hidden = guest; $('#adSite').hidden = guest;
    D.body.setAttribute('data-view', v);
  }
  function route(){
    if (!CFG.token){
      /* 연결 화면은 주소 끝에 #setup 을 붙였을 때만. 그냥 들어온 사람에겐 출입금지 화면 */
      if (location.hash === '#setup'){ show('vLogin'); fillLogin(); } else show('vLock');
      return;
    }
    var h = location.hash || '#list';
    if (h === '#new'){ openEditor(null); }
    else if (h.indexOf('#edit/') === 0){ openEditor(decodeURIComponent(h.slice(6))); }
    else { loadList(); }
  }
  window.addEventListener('hashchange', function(){
    if (D.body.getAttribute('data-view') === 'vEdit' && dirty && !confirm('저장하지 않은 내용이 있어요. 나갈까요?')){ history.replaceState(null, '', lastHash); return; }
    route();
  });
  var lastHash = location.hash;
  window.addEventListener('beforeunload', function(e){ if (D.body.getAttribute('data-view') === 'vEdit' && dirty){ e.preventDefault(); e.returnValue = ''; } });

  /* ════════ 연결 ════════ */
  function fillLogin(){
    var h = location.hostname, m = h.match(/^([^.]+)\.github\.io$/i), seg = location.pathname.split('/').filter(Boolean)[0];
    $('#lgOwner').value = CFG.owner || (m ? m[1] : '');
    $('#lgRepo').value = CFG.repo || (m ? (seg && seg !== 'admin.html' ? seg : m[1] + '.github.io') : '');
    $('#lgBranch').value = CFG.branch || 'main';
  }
  $('#lgGo').addEventListener('click', function(){
    var c = { token: $('#lgToken').value.trim(), owner: $('#lgOwner').value.trim(), repo: $('#lgRepo').value.trim(), branch: $('#lgBranch').value.trim() || 'main' };
    var err = $('#lgErr'); err.textContent = '';
    if (!c.token || !c.owner || !c.repo){ err.textContent = '토큰 · 아이디 · 저장소 이름을 다 채워 주세요.'; return; }
    CFG = c; this.disabled = true; var b = this;
    gh(R()).then(function(r){
      if (r.permissions && !r.permissions.push){ throw { message: '이 토큰은 저장(쓰기) 권한이 없어요. Contents 를 Read and write 로 만들어 주세요.' }; }
      localStorage.setItem(KEY, JSON.stringify(CFG)); toast('연결됐어요!'); location.hash = '#list'; route();
    }).catch(function(e){
      CFG = {}; err.textContent = e.status === 401 ? '토큰이 맞지 않아요. 다시 복사해 주세요.' : e.status === 404 ? '저장소를 못 찾았어요. 아이디 · 저장소 이름 · 토큰의 저장소 선택을 확인해 주세요.' : (e.message || '연결 실패');
    }).then(function(){ b.disabled = false; });
  });
  $('#adLogout').addEventListener('click', function(){ if (!confirm('이 브라우저에서 연결을 해제할까요? (토큰이 지워져요)')) return; localStorage.removeItem(KEY); CFG = {}; location.hash = ''; route(); });

  /* ════════ 글 목록 ════════ */
  var POSTS = [], SETTINGS = {}, catFilter = '';
  function parseMd(t){
    t = String(t || '').replace(/\r\n/g, '\n');
    var m = t.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/), meta = {}, body = t;
    if (m){ try { meta = jsyaml.load(m[1]) || {}; } catch(e){ meta = {}; } body = m[2]; }
    return { meta: meta, body: body };
  }
  function dateStr(v){
    if (v instanceof Date && !isNaN(v)) return v.getUTCFullYear() + '-' + pad(v.getUTCMonth() + 1) + '-' + pad(v.getUTCDate()) + ' ' + pad(v.getUTCHours()) + ':' + pad(v.getUTCMinutes());
    return String(v || '').replace('T', ' ').slice(0, 16);
  }
  function loadSettings(){ return raw('settings.json').then(function(t){ SETTINGS = JSON.parse(t) || {}; }).catch(function(){ SETTINGS = SETTINGS || {}; }); }
  function categories(){
    var c = (SETTINGS.categories || []).map(function(x){ return x.name; });
    POSTS.forEach(function(p){ if (p.category && c.indexOf(p.category) < 0) c.push(p.category); });
    return c;
  }
  function loadList(){
    show('vList'); lastHash = location.hash;
    var rows = $('#lsRows'); rows.innerHTML = '<li class="ad-empty">불러오는 중…</li>';
    Promise.all([list('posts'), raw('posts/posts.json').then(JSON.parse).catch(function(){ return []; }), loadSettings()]).then(function(r){
      var files = (r[0] || []).filter(function(f){ return /\.md$/.test(f.name); }), built = {};
      (r[1] || []).forEach(function(p){ built[p.slug] = p; });
      POSTS = files.map(function(f){
        var slug = f.name.replace(/\.md$/, ''), b = built[slug];
        return b ? { slug: slug, title: b.title, date: b.date, category: b.category, notice: b.notice, song: !!b.song, draft: false } : { slug: slug, title: null, date: slug.slice(0, 10), pending: true };
      });
      renderList();
      /* 아직 목록에 없는 글 (임시저장 · 방금 올린 글) 은 파일을 직접 읽어서 제목 채우기 */
      var todo = POSTS.filter(function(p){ return p.pending; });
      return todo.reduce(function(pr, p){
        return pr.then(function(){
          return raw('posts/' + p.slug + '.md').then(function(t){
            var x = parseMd(t).meta; p.title = x.title || '(제목 없음)'; p.date = dateStr(x.date) || p.date; p.category = x.notice ? '' : (x.category || ''); p.notice = !!x.notice; p.draft = !!x.draft; p.song = !!x.song; p.pending = false; p.fresh = !x.draft;
          }).catch(function(){ p.title = p.slug; p.pending = false; });
        });
      }, Promise.resolve()).then(renderList);
    }).catch(function(e){
      rows.innerHTML = '<li class="ad-empty">목록을 못 불러왔어요: ' + esc(e.message || e) + (e.status === 401 ? '<br>토큰이 만료됐을 수 있어요. 오른쪽 위 연결 해제 → 다시 연결해 주세요.' : '') + '</li>';
    });
  }
  function renderList(){
    var q = ($('#lsQ').value || '').trim().toLowerCase();
    var cats = categories();
    $('#lsCats').innerHTML = ['', 'NOTICE'].concat(cats).map(function(c){
      return '<button type="button" data-c="' + esc(c) + '"' + (c === catFilter ? ' class="on"' : '') + '>' + (c ? esc(c) : '전체') + '</button>';
    }).join('');
    var arr = POSTS.slice().sort(function(a, b){ return String(b.date).localeCompare(String(a.date)); }).filter(function(p){
      if (catFilter === 'NOTICE' && !p.notice) return false;
      if (catFilter && catFilter !== 'NOTICE' && (p.notice || p.category !== catFilter)) return false;
      return !q || String(p.title || '').toLowerCase().indexOf(q) >= 0;
    });
    $('#lsCnt').textContent = POSTS.length;
    $('#lsRows').innerHTML = arr.length ? arr.map(function(p){
      return '<li><a class="r-main" href="#edit/' + encodeURIComponent(p.slug) + '">' +
        '<span class="r-cat">' + esc(p.notice ? 'NOTICE' : (p.category || '미분류')) + '</span>' +
        '<b>' + (p.title == null ? '<em class="r-load">불러오는 중…</em>' : esc(p.title)) + '</b>' +
        (p.song ? '<i class="r-tag song">♪</i>' : '') + (p.draft ? '<i class="r-tag draft">임시저장</i>' : '') + (p.fresh ? '<i class="r-tag fresh">반영 중</i>' : '') +
        '<time>' + esc(String(p.date || '').slice(0, 10)) + '</time></a>' +
        '<span class="r-act"><a href="./?p=' + encodeURIComponent(p.slug) + '" target="_blank" rel="noopener" title="사이트에서 보기">보기</a><button type="button" data-del="' + esc(p.slug) + '">삭제</button></span></li>';
    }).join('') : '<li class="ad-empty">' + (POSTS.length ? '찾는 글이 없어요.' : '아직 글이 없어요. 오른쪽 위 ＋ 새 글!') + '</li>';
  }
  $('#lsQ').addEventListener('input', renderList);
  $('#lsCats').addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; catFilter = b.getAttribute('data-c'); renderList(); });
  $('#lsRows').addEventListener('click', function(e){
    var b = e.target.closest('[data-del]'); if (!b) return;
    var slug = b.getAttribute('data-del'), p = POSTS.filter(function(x){ return x.slug === slug; })[0];
    if (!confirm('「' + ((p && p.title) || slug) + '」 글을 지울까요?\n(첨부한 사진·파일은 저장소에 남아요)')) return;
    b.disabled = true;
    commit([{ path: 'posts/' + slug + '.md', del: true }], '글 삭제: ' + ((p && p.title) || slug) + ' (Syringe 글쓰기)').then(function(){
      POSTS = POSTS.filter(function(x){ return x.slug !== slug; }); renderList(); toast('지웠어요. 1~2분 뒤 사이트에서도 사라져요.');
    }).catch(function(e){ b.disabled = false; toast('삭제 실패: ' + (e.message || e), true); });
  });

  /* ════════ 글쓰기 ════════ */
  var ED = $('#edBody'), HT = $('#edHtml'), TITLE = $('#edTitle'), CAT = $('#edCat');
  var cur = null, dirty = false, pend = {}, upN = 0, taken = null, mode = 'wys';
  function setDirty(v){ dirty = v; var db = $('#edDraft'); if (db) db.textContent = (cur && cur.path && cur.meta && !cur.meta.draft) ? '수정 저장' : '임시저장'; $('#edState').textContent = v ? '저장 안 됨' : (cur && cur.path ? '저장됨' : ''); $('#edState').className = 'ad-state' + (v ? ' dirty' : ''); }
  function nowStamp(){ var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()); }
  function nowDate(){ var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function autoGrow(){ TITLE.style.height = 'auto'; TITLE.style.height = TITLE.scrollHeight + 'px'; }

  /* 마크다운으로 쓴 예전 글을 편집기용 HTML 로 (간단 변환) */
  function mdToHtml(md){
    var out = [], para = [];
    function inline(s){
      s = esc(s);
      s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">');
      s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*\\])\*([^*]+)\*/g, '$1<i>$2</i>').replace(/~~([^~]+)~~/g, '<s>$1</s>').replace(/\\\*/g, '*');
      return s.replace(/&lt;(\/?(?:b|i|u|s|br|span|small|strong|em)[^&]*)&gt;/g, '<$1>');
    }
    function flush(){ if (para.length){ out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; } }
    String(md || '').replace(/\r\n/g, '\n').split('\n').forEach(function(l){
      var h = l.match(/^(#{1,4})\s+(.*)$/);
      if (/^\s*$/.test(l)){ flush(); }
      else if (/^\s*</.test(l)){ flush(); out.push(l); }
      else if (h){ flush(); var lv = Math.min(4, h[1].length + 1); out.push('<h' + lv + '>' + inline(h[2]) + '</h' + lv + '>'); }
      else if (/^\s*(---|\*\*\*)\s*$/.test(l)){ flush(); out.push('<hr>'); }
      else if (/^>\s?/.test(l)){ flush(); out.push('<blockquote><p>' + inline(l.replace(/^>\s?/, '')) + '</p></blockquote>'); }
      else para.push(l);
    });
    flush(); return out.join('\n');
  }

  function openEditor(slug){
    show('vEdit'); lastHash = location.hash;
    pend = {}; taken = null; thumbSel = null; dwInit = false; $('#dw').hidden = true; IB.hidden = true; setMode('wys');
    cur = { slug: slug, path: slug ? 'posts/' + slug + '.md' : null, meta: {} };
    ED.innerHTML = '<p><br></p>'; TITLE.value = ''; autoGrow(); musicFrom({}); $('#edState').textContent = slug ? '불러오는 중…' : '';
    var cats = function(){ CAT.innerHTML = '<option value="">카테고리</option>' + categories().map(function(c){ return '<option>' + esc(c) + '</option>'; }).join(''); };
    var ready = (SETTINGS.categories ? Promise.resolve() : loadSettings()).then(cats);
    if (!slug){
      ready.then(function(){
        var bk = backup.get('new');
        if (bk && confirm('저장 안 한 새 글이 남아 있어요. 이어서 쓸까요?')) fill(bk.meta, bk.html, true); else { backup.del('new'); setDirty(false); }
        TITLE.focus();
      });
      return;
    }
    Promise.all([ready, raw(cur.path), raw('posts/posts.json').then(JSON.parse).catch(function(){ return []; })]).then(function(r){
      var md = parseMd(r[1]), built = (r[2] || []).filter(function(p){ return p.slug === slug; })[0];
      var html = md.meta.format === 'html' ? md.body : (built && built.html) || mdToHtml(md.body);
      cur.meta = md.meta;
      var bk = backup.get(slug);
      if (bk && confirm('이 글에 저장 안 한 수정 내용이 남아 있어요. 이어서 쓸까요?')) fill(bk.meta, bk.html, true);
      else { backup.del(slug); fill(md.meta, html, false); }
    }).catch(function(e){ toast('글을 못 불러왔어요: ' + (e.message || e), true); location.hash = '#list'; });
  }
  function fill(meta, html, isDirty){
    cur.meta = Object.assign({}, cur.meta, meta);
    TITLE.value = meta.title || ''; autoGrow();
    if (meta.category && !$$('option', CAT).some(function(o){ return o.value === meta.category; })) CAT.insertAdjacentHTML('beforeend', '<option>' + esc(meta.category) + '</option>');
    CAT.value = meta.category || '';
    ED.innerHTML = html && html.trim() ? html : '<p><br></p>';
    prepBody();
    musicFrom(meta);
    setDirty(!!isDirty);
  }
  function prepBody(){
    $$('a.pb-attach', ED).forEach(function(a){ a.setAttribute('contenteditable', 'false'); });
    $$('img', ED).forEach(function(im){ im.setAttribute('draggable', 'false'); });
  }

  /* 브라우저 임시 보관 (창이 닫혀도 안 날아가게) */
  var backup = {
    k: function(id){ return 'sy-admin-bk:' + id; },
    get: function(id){ try { return JSON.parse(localStorage.getItem(this.k(id))); } catch(e){ return null; } },
    set: function(id, v){ try { localStorage.setItem(this.k(id), JSON.stringify(v)); } catch(e){} },
    del: function(id){ try { localStorage.removeItem(this.k(id)); } catch(e){} }
  };
  var bkT;
  function touch(){
    setDirty(true); clearTimeout(bkT);
    bkT = setTimeout(function(){
      if (!cur) return;
      var hasPending = $$('[data-up]', ED).length;
      backup.set(cur.slug || 'new', { meta: collectMeta(true), html: hasPending ? stripPending(bodyHtml()) : bodyHtml(), at: Date.now() });
    }, 800);
  }
  function stripPending(h){ var t = D.createElement('div'); t.innerHTML = h; $$('[data-up]', t).forEach(function(x){ var p = x.closest('p') || x; p.remove(); }); return t.innerHTML; }
  TITLE.addEventListener('input', function(){ autoGrow(); touch(); });
  TITLE.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); ED.focus(); } });
  CAT.addEventListener('change', touch);
  ED.addEventListener('input', touch);

  /* ── 편집 모드 (기본 / HTML) ── */
  function setMode(m){
    if (m === mode){ $('#tbMode').value = m; return; }
    if (m === 'html'){ HT.value = prettyHtml(ED.innerHTML); HT.hidden = false; ED.hidden = true; }
    else { ED.innerHTML = HT.value || '<p><br></p>'; prepBody(); HT.hidden = true; ED.hidden = false; }
    mode = m; $('#tbMode').value = m; D.body.classList.toggle('ad-htmlmode', m === 'html');
  }
  function prettyHtml(h){ return h.replace(/(<\/(p|h2|h3|h4|blockquote|ul|ol|table|details|div|figure)>)\s*/g, '$1\n').replace(/<hr>\s*/g, '<hr>\n').trim(); }
  $('#tbMode').addEventListener('change', function(){ setMode(this.value); });
  HT.addEventListener('input', touch);
  function bodyHtml(){ return mode === 'html' ? HT.value : ED.innerHTML; }

  /* ── 툴바 ── */
  var savedRange = null;
  function saveSel(){ var s = getSelection(); if (s.rangeCount && ED.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange(); }
  function restoreSel(){ ED.focus(); if (savedRange){ var s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); } }
  D.addEventListener('selectionchange', function(){ if (mode === 'wys') saveSel(); syncTb(); });
  function exec(c, v){ restoreSel(); try { D.execCommand('styleWithCSS', false, c === 'foreColor' || c === 'hiliteColor' || c === 'backColor'); } catch(e){} D.execCommand(c, false, v == null ? null : v); touch(); saveSel(); syncTb(); }
  function insertHTML(h){ restoreSel(); D.execCommand('insertHTML', false, h); prepBody(); touch(); saveSel(); }
  /* 사진 · 파일 · 표 같은 덩어리는 직접 끼워 넣기 (브라우저 기본 기능은 문단이 꼬여서) */
  function curBlock(){ var s = getSelection(), n = s.rangeCount ? s.anchorNode : null; if (!n || !ED.contains(n) || n === ED) return n === ED ? ED.childNodes[s.anchorOffset] || ED.lastChild : null; while (n && n.parentNode !== ED) n = n.parentNode; return n; }
  function isEmptyBlock(n){ return n && n.nodeType === 1 && /^(P|DIV|H2|H3|H4)$/.test(n.tagName) && !n.textContent.replace(/\u00a0/g, '').trim() && !n.querySelector('img,a,hr,table,iframe,video,audio'); }
  function insertBlocks(h){
    restoreSel();
    var t = D.createElement('div'); t.innerHTML = h; var nodes = Array.prototype.slice.call(t.childNodes); if (!nodes.length) return;
    var blk = curBlock();
    if (isEmptyBlock(blk)){ nodes.forEach(function(n){ ED.insertBefore(n, blk); }); blk.remove(); }
    else if (blk){ var nx = blk.nextSibling; nodes.forEach(function(n){ ED.insertBefore(n, nx); }); }
    else nodes.forEach(function(n){ ED.appendChild(n); });
    var last = nodes[nodes.length - 1], after = last.nextSibling, p;
    if (isEmptyBlock(after) && after.tagName === 'P') p = after; else { p = D.createElement('p'); p.innerHTML = '<br>'; ED.insertBefore(p, after); }
    var r = D.createRange(); r.setStart(p, 0); r.collapse(true); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); ED.focus();
    prepBody(); touch(); saveSel();
  }
  function syncTb(){
    if (mode !== 'wys' || !ED.contains((getSelection() || {}).anchorNode)) return;
    $$('#tb [data-cmd]').forEach(function(b){ var c = b.getAttribute('data-cmd'); if (/undo|redo|List/.test(c)) return; try { b.classList.toggle('on', D.queryCommandState(c)); } catch(e){} });
    var n = getSelection().anchorNode; n = n && (n.nodeType === 1 ? n : n.parentNode);
    var blk = n && n.closest && n.closest('h2,h3,h4,p,li,blockquote');
    var v = blk ? (blk.tagName === 'P' && blk.classList.contains('small') ? 'small' : /^H[234]$/.test(blk.tagName) ? blk.tagName.toLowerCase() : 'p') : 'p';
    $('#tb [data-act="block"]').value = v;
  }
  var tb = $('#tb');
  tb.addEventListener('mousedown', function(e){ if (e.target.closest('button')) e.preventDefault(); });
  tb.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    if (mode === 'html' && !b.matches('[data-act="music"]')){ toast('HTML 모드에선 직접 고쳐요. 기본모드로 바꾸면 버튼을 쓸 수 있어요.'); return; }
    var c = b.getAttribute('data-cmd'); if (c){ exec(c); return; }
    var a = b.getAttribute('data-act');
    if (a === 'image'){ saveSel(); $('#fImg').click(); }
    else if (a === 'file'){ saveSel(); $('#fAny').click(); }
    else if (a === 'music'){ $('#mu').hidden = false; $('#mu').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    else if (a === 'quote'){ var inQ = (function(){ var n = getSelection().anchorNode; n = n && (n.nodeType === 1 ? n : n.parentNode); return n && n.closest && n.closest('blockquote'); })(); exec('formatBlock', inQ ? '<p>' : '<blockquote>'); }
    else if (a === 'hr'){ insertBlocks('<hr>'); }
    else if (a === 'table'){ askTable(); }
    else if (a === 'link'){ askLink(); }
    else if (a === 'color' || a === 'bg'){ openSwatch(b, a); }
    else if (a === 'more'){ togglePop($('#popMore'), b); }
  });
  $('#tb [data-act="block"]').addEventListener('change', function(){
    var v = this.value;
    if (v === 'small'){ exec('formatBlock', '<p>'); var n = getSelection().anchorNode; n = n && (n.nodeType === 1 ? n : n.parentNode); var p = n && n.closest('p'); if (p && ED.contains(p)) p.className = 'small'; touch(); }
    else { exec('formatBlock', '<' + v + '>'); var n2 = getSelection().anchorNode; n2 = n2 && (n2.nodeType === 1 ? n2 : n2.parentNode); var p2 = n2 && n2.closest('p'); if (p2) p2.classList.remove('small'); }
  });
  ED.addEventListener('keydown', function(e){
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); save(true); }
  });
  D.addEventListener('keydown', function(e){ if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && D.body.getAttribute('data-view') === 'vEdit'){ e.preventDefault(); save(true); } });

  /* 팝업 */
  function togglePop(pop, btn){
    var open = pop.hidden; closePops(); if (!open) return;
    var r = btn.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(innerWidth - 220, r.left)) + 'px'; pop.style.top = (r.bottom + 6) + 'px'; pop.hidden = false;
  }
  function closePops(){ $$('.ad-pop').forEach(function(p){ p.hidden = true; }); }
  D.addEventListener('mousedown', function(e){ if (!e.target.closest('.ad-pop') && !e.target.closest('#tb')) closePops(); });
  var COLORS = ['', '#14324A', '#5E7387', '#9AB0C2', '#0D5A96', '#1E8FD6', '#2FA4DE', '#3FD0AC', '#E84E6A', '#F08A3C', '#E9B23B', '#8B6BD8', '#ffffff'];
  var BGS = ['', '#EAF6FD', '#DDF7EF', '#FFF3D6', '#FDE7EC', '#EFEAFE', '#F1F4F7', '#CDE9F7', '#14324A'];
  var swKind = 'color';
  function openSwatch(btn, kind){
    swKind = kind; var p = $('#popColor');
    p.innerHTML = (kind === 'color' ? COLORS : BGS).map(function(c){ return '<button type="button" data-c="' + c + '" title="' + (c || '기본') + '"' + (c ? ' style="background:' + c + '"' : ' class="none"') + '></button>'; }).join('');
    togglePop(p, btn);
  }
  $('#popColor').addEventListener('mousedown', function(e){ e.preventDefault(); });
  $('#popColor').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return; var c = b.getAttribute('data-c');
    if (swKind === 'color'){ exec('foreColor', c || '#26394B'); if (!c) cleanColor('color'); $('#tbFg').style.background = c || ''; }
    else { exec('hiliteColor', c || 'transparent'); if (!c) cleanColor('background-color'); $('#tbBg').style.background = c || ''; }
    closePops();
  });
  function cleanColor(prop){ $$('span[style], font', ED).forEach(function(s){ if (s.style && s.style.getPropertyValue(prop) && /^(rgb\(38, 57, 75\)|transparent|rgba\(0, 0, 0, 0\))$/.test(s.style.getPropertyValue(prop))) s.style.removeProperty(prop); if (s.tagName === 'SPAN' && !s.getAttribute('style')) s.replaceWith.apply(s, Array.prototype.slice.call(s.childNodes)); }); }
  $('#popMore').addEventListener('mousedown', function(e){ e.preventDefault(); });
  $('#popMore').addEventListener('click', function(e){
    var a = (e.target.closest('button') || {}).getAttribute && e.target.closest('button').getAttribute('data-act'); closePops();
    if (a === 'fold') insertBlocks('<details><summary>더보기</summary><p>접힌 내용을 여기에 써요.</p></details>');
    else if (a === 'htmlblock') askHtml();
    else if (a === 'clear') exec('removeFormat');
  });

  /* 입력창 */
  var mdCb = null;
  function modal(title, html, cb){ $('#mdT').textContent = title; $('#mdBody').innerHTML = html; mdCb = cb; $('#md').hidden = false; var f = $('#mdBody input, #mdBody textarea'); if (f) setTimeout(function(){ f.focus(); }, 30); }
  $('#mdNo').addEventListener('click', function(){ $('#md').hidden = true; });
  $('#mdOk').addEventListener('click', function(){ $('#md').hidden = true; if (mdCb) mdCb(); });
  $('#md').addEventListener('keydown', function(e){ if (e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); $('#mdOk').click(); } if (e.key === 'Escape') $('#md').hidden = true; });
  function askLink(){
    var sel = savedRange ? savedRange.toString() : '';
    modal('링크', '<label class="ad-f"><span>주소</span><input id="mdUrl" placeholder="https://"></label>' + (sel ? '' : '<label class="ad-f"><span>보일 글자</span><input id="mdTxt"></label>') + '<label class="ad-chk"><input type="checkbox" id="mdNew" checked><span>새 탭에서 열기</span></label>', function(){
      var u = $('#mdUrl').value.trim(); if (!u) return; if (!/^(https?:|mailto:|\/|\.|#|\?)/.test(u)) u = 'https://' + u;
      var nt = $('#mdNew').checked ? ' target="_blank" rel="noopener"' : '';
      if (sel){ exec('createLink', u); if (nt) $$('a[href="' + u.replace(/"/g, '\\"') + '"]', ED).forEach(function(a){ a.target = '_blank'; a.rel = 'noopener'; }); }
      else insertHTML('<a href="' + esc(u) + '"' + nt + '>' + esc(($('#mdTxt').value || u).trim()) + '</a>&nbsp;');
    });
  }
  function askTable(){
    modal('표', '<div class="ad-row2"><label class="ad-f"><span>줄</span><input id="mdR" type="number" value="3" min="1" max="30"></label><label class="ad-f"><span>칸</span><input id="mdC" type="number" value="3" min="1" max="10"></label></div>', function(){
      var r = Math.max(1, Math.min(30, +$('#mdR').value || 3)), c = Math.max(1, Math.min(10, +$('#mdC').value || 3)), h = '<table><tbody>';
      for (var i = 0; i < r; i++){ h += '<tr>'; for (var j = 0; j < c; j++) h += '<td><br></td>'; h += '</tr>'; }
      insertBlocks(h + '</tbody></table>');
    });
  }
  function askHtml(){
    modal('HTML 블록', '<label class="ad-f"><span>HTML 코드를 붙여넣어요 (iframe · 위젯 등)</span><textarea id="mdHtml" rows="8" spellcheck="false"></textarea></label>', function(){
      var h = $('#mdHtml').value.trim(); if (h) insertBlocks('<div class="html-block">' + h + '</div>');
    });
  }

  /* ── 붙여넣기 · 끌어다 놓기 ── */
  ED.addEventListener('paste', function(e){
    var cd = e.clipboardData; if (!cd) return;
    var files = Array.prototype.slice.call(cd.files || []);
    if (files.length){ e.preventDefault(); saveSel(); addFiles(files); return; }
    var html = cd.getData('text/html');
    if (html){ e.preventDefault(); insertHTML(cleanPaste(html)); return; }
  });
  function cleanPaste(h){
    var t = D.createElement('div'); t.innerHTML = h;
    $$('script,style,meta,link,title,iframe,object', t).forEach(function(x){ x.remove(); });
    $$('*', t).forEach(function(el){
      Array.prototype.slice.call(el.attributes).forEach(function(at){
        var n = at.name;
        if (n === 'style'){ var keep = []; ['text-align', 'color', 'background-color', 'font-weight', 'font-style', 'text-decoration'].forEach(function(p){ var v = el.style.getPropertyValue(p); if (v && !(p === 'color' && /rgb\((0|33|34|51), ?(0|33|34|51), ?(0|33|34|51)\)/.test(v)) && !(p === 'background-color' && /(transparent|rgba\(0, 0, 0, 0\)|rgb\(255, 255, 255\))/.test(v))) keep.push(p + ':' + v); }); if (keep.length) el.setAttribute('style', keep.join(';')); else el.removeAttribute('style'); }
        else if (!/^(href|src|alt|colspan|rowspan|target)$/.test(n)) el.removeAttribute(n);
      });
    });
    $$('span:not([style]),font', t).forEach(function(s){ s.replaceWith.apply(s, Array.prototype.slice.call(s.childNodes)); });
    return t.innerHTML;
  }
  ED.addEventListener('dragover', function(e){ if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') >= 0){ e.preventDefault(); ED.classList.add('drop'); } });
  ED.addEventListener('dragleave', function(){ ED.classList.remove('drop'); });
  ED.addEventListener('drop', function(e){
    ED.classList.remove('drop');
    var files = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []); if (!files.length) return;
    e.preventDefault();
    var r = D.caretRangeFromPoint ? D.caretRangeFromPoint(e.clientX, e.clientY) : null;
    if (r){ var s = getSelection(); s.removeAllRanges(); s.addRange(r); savedRange = r.cloneRange(); }
    addFiles(files);
  });
  $('#fImg').addEventListener('change', function(){ addFiles(Array.prototype.slice.call(this.files)); this.value = ''; });
  $('#fAny').addEventListener('change', function(){ addFiles(Array.prototype.slice.call(this.files), true); this.value = ''; });

  function newPending(f){ var id = 'u' + (++upN); pend[id] = { file: f, name: f.name, url: URL.createObjectURL(f) }; return id; }
  function size(n){ return n >= 1048576 ? (n / 1048576).toFixed(2) + 'MB' : n >= 1024 ? Math.round(n / 1024) + 'KB' : n + 'B'; }
  function addFiles(files, asFile){
    if (mode === 'html'){ toast('기본모드에서 넣어 주세요.'); return; }
    var h = '';
    files.forEach(function(f){
      var id = newPending(f);
      if (!asFile && /^image\//.test(f.type)) h += '<p><img src="' + pend[id].url + '" data-up="' + id + '" alt=""></p>';
      else h += '<p class="pb-filewrap"><a class="pb-attach" href="' + pend[id].url + '" data-up="' + id + '" data-size="' + size(f.size) + '" contenteditable="false">' + esc(f.name) + '</a></p>';
      if (f.size > 95 * 1048576) toast('「' + f.name + '」은 100MB 가 넘어서 깃허브에 못 올라가요.', true);
    });
    insertBlocks(h);
  }

  /* ── 사진 크기 · 정렬 ── */
  var selImg = null, IB = $('#imgBar');
  ED.addEventListener('click', function(e){
    var im = e.target.closest('img');
    $$('img.sel', ED).forEach(function(x){ x.classList.remove('sel'); });
    if (!im){ IB.hidden = true; selImg = null; return; }
    selImg = im; im.classList.add('sel'); placeBar();
  });
  function placeBar(){ if (!selImg) return; var r = selImg.getBoundingClientRect(), pr = $('#paper').getBoundingClientRect(); IB.hidden = false; IB.style.top = (r.top - pr.top + $('#paper').offsetTop - 44) + 'px'; IB.style.left = Math.max(0, r.left - pr.left + $('#paper').offsetLeft + r.width / 2 - IB.offsetWidth / 2) + 'px'; }
  window.addEventListener('resize', placeBar);
  IB.addEventListener('mousedown', function(e){ e.preventDefault(); });
  IB.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b || !selImg) return;
    if (b.hasAttribute('data-del')){ var p = selImg.closest('p'); if (p && p.textContent.trim() === '' && p.querySelectorAll('img').length === 1) p.remove(); else selImg.remove(); selImg = null; IB.hidden = true; touch(); return; }
    if (b.hasAttribute('data-w')){ var w = b.getAttribute('data-w'); if (w) selImg.style.width = w + '%'; else selImg.style.removeProperty('width'); }
    if (b.hasAttribute('data-al')){ var al = b.getAttribute('data-al'); selImg.style.marginLeft = al === 'left' ? '0' : 'auto'; selImg.style.marginRight = al === 'right' ? '0' : 'auto'; if (al === 'center'){ selImg.style.removeProperty('margin-left'); selImg.style.removeProperty('margin-right'); } }
    if (!selImg.getAttribute('style')) selImg.removeAttribute('style');
    touch(); setTimeout(placeBar, 20);
  });

  /* ════════ ♪ 노래 ════════ */
  var mu = { song: '', cover: '' };   /* 경로 또는 'up:u3' (아직 안 올린 파일) */
  function srcOf(v){ if (!v) return ''; if (v.indexOf('up:') === 0){ var p = pend[v.slice(3)]; return p ? p.url : ''; } return v.replace(/^\//, ''); }
  function musicFrom(m){
    mu.song = m.song || ''; mu.cover = m.songCover || '';
    $('#muTitle').value = m.songTitle || ''; $('#muArtist').value = m.artist || ''; $('#muLyrics').value = m.lyrics || '';
    $('#mu').hidden = !(m.song || m.lyrics);
    musicPaint();
  }
  function musicPaint(){
    var s = srcOf(mu.song), c = srcOf(mu.cover), a = $('#muAudio');
    $('#muName').textContent = mu.song ? (mu.song.indexOf('up:') === 0 ? pend[mu.song.slice(3)].name + ' (저장할 때 올라가요)' : mu.song.split('/').pop()) : '아직 음원이 없어요';
    if (s){ if (a.getAttribute('src') !== s) a.src = s; a.hidden = false; } else { a.removeAttribute('src'); a.hidden = true; }
    var cv = $('#muCover'); cv.style.backgroundImage = c ? 'url("' + c + '")' : ''; cv.classList.toggle('has', !!c);
    $('.tb-music').classList.toggle('on', !!mu.song);
  }
  $('#muPick').addEventListener('click', function(){ $('#fSong').click(); });
  $('#muCover').addEventListener('click', function(){ $('#fCover').click(); });
  $('#fSong').addEventListener('change', function(){ var f = this.files[0]; this.value = ''; if (!f) return; mu.song = 'up:' + newPending(f); if (!$('#muTitle').value) $('#muTitle').value = f.name.replace(/\.[^.]+$/, ''); musicPaint(); touch(); });
  $('#fCover').addEventListener('change', function(){ var f = this.files[0]; this.value = ''; if (!f) return; mu.cover = 'up:' + newPending(f); musicPaint(); touch(); });
  $('#muOff').addEventListener('click', function(){ if ((mu.song || $('#muLyrics').value) && !confirm('이 글에서 노래를 뺄까요? (음원 · 가사 칸이 비워져요)')) return; musicFrom({}); touch(); });
  ['#muTitle', '#muArtist', '#muLyrics'].forEach(function(s){ $(s).addEventListener('input', touch); });
  /* LRC 만들기 : 지금 재생 위치를 커서가 있는 줄 앞에 찍고 다음 줄로 */
  function lrcTime(t){ var m = Math.floor(t / 60), s = t - m * 60; return '[' + pad(m) + ':' + (s < 10 ? '0' : '') + s.toFixed(2) + ']'; }
  function stamp(){
    var ta = $('#muLyrics'), a = $('#muAudio'), v = ta.value, pos = ta.selectionStart;
    var ls = v.lastIndexOf('\n', pos - 1) + 1, le = v.indexOf('\n', pos); if (le < 0) le = v.length;
    var line = v.slice(ls, le).replace(/^(\[\d{1,2}:\d{1,2}(?:\.\d{1,3})?\])+/, '');
    var nl = lrcTime(a.currentTime || 0) + line;
    ta.value = v.slice(0, ls) + nl + v.slice(le);
    var next = ls + nl.length + 1; if (next > ta.value.length) next = ta.value.length;
    ta.focus(); ta.setSelectionRange(next, next); touch();
  }
  $('#muStamp').addEventListener('click', stamp);
  $('#muLyrics').addEventListener('keydown', function(e){ if (e.altKey && e.key === 'Enter'){ e.preventDefault(); stamp(); } });
  $('#muStrip').addEventListener('click', function(){ if (!confirm('가사 앞의 시간 표시를 전부 지울까요?')) return; $('#muLyrics').value = $('#muLyrics').value.replace(/^(\[\d{1,2}:\d{1,2}(?:\.\d{1,3})?\])+/gm, ''); touch(); });

  /* ════════ 발행 설정 ════════ */
  var thumbSel = null, dwInit = false;   /* thumbSel : null = 아직 안 건드림 / '' = 자동 / 경로 / 'up:id' */
  function openDrawer(){
    var m = cur.meta || {};
    if (!dwInit){ var d = dateStr(m.date) || nowDate(); $('#dwDate').value = d.replace(' ', 'T');
    $('#dwNotice').checked = !!m.notice; $('#dwSum').value = m.summary || ''; $('#dwSub').value = m.sub || '';
    $('#dwStatus').value = m.status ? String(m.status).toUpperCase() : ''; $('#dwPrice').value = m.price != null ? m.price : ''; }
    if (thumbSel === null || thumbSel === undefined) thumbSel = m.thumbnail || '';
    dwInit = true; paintThumbs(); $('#dw').hidden = false;
  }
  function paintThumbs(){
    var seen = {}, opts = [];
    $$('img', ED).forEach(function(im){ var v = im.getAttribute('data-up') ? 'up:' + im.getAttribute('data-up') : (im.getAttribute('src') || ''); if (v && !seen[v]){ seen[v] = 1; opts.push(v); } });
    if (mu.cover && !seen[mu.cover]){ seen[mu.cover] = 1; opts.push(mu.cover); }
    if (thumbSel && !seen[thumbSel]) opts.unshift(thumbSel);
    $('#dwThumbs').innerHTML = '<button type="button" data-t=""' + (!thumbSel ? ' class="on"' : '') + '><span>자동</span></button>' +
      opts.map(function(v){ return '<button type="button" data-t="' + esc(v) + '"' + (v === thumbSel ? ' class="on"' : '') + ' style="background-image:url(\'' + esc(srcOf(v)).replace(/'/g, '%27') + '\')"></button>'; }).join('') +
      '<button type="button" data-t="+" class="up"><span>＋ 올리기</span></button>';
  }
  $('#dwThumbs').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return; var v = b.getAttribute('data-t');
    if (v === '+'){ $('#fThumb').click(); return; }
    thumbSel = v; paintThumbs(); touch();
  });
  $('#fThumb').addEventListener('change', function(){ var f = this.files[0]; this.value = ''; if (!f) return; thumbSel = 'up:' + newPending(f); paintThumbs(); touch(); });
  $('#edPub').addEventListener('click', function(){ IB.hidden = true; $$('img.sel', ED).forEach(function(x){ x.classList.remove('sel'); }); selImg = null; openDrawer(); });
  $('#dwX').addEventListener('click', function(){ $('#dw').hidden = true; });
  $('#dw').addEventListener('click', function(e){ if (e.target === this) this.hidden = true; });
  $('#dwGo').addEventListener('click', function(){ save(false); });
  function published(){ return !!(cur && cur.path && cur.meta && !cur.meta.draft); }
  $('#edDraft').addEventListener('click', function(){ save(!published()); });

  /* ════════ 저장 ════════ */
  function collectMeta(forBackup){
    var m = Object.assign({}, cur.meta || {});
    m.title = TITLE.value.trim();
    m.category = CAT.value || '';
    if (dwInit){
      var dv = $('#dwDate').value; if (dv) m.date = dv.replace('T', ' ').slice(0, 16);
      m.notice = $('#dwNotice').checked; m.summary = $('#dwSum').value.trim(); m.sub = $('#dwSub').value.trim();
      m.status = $('#dwStatus').value; m.price = $('#dwPrice').value.replace(/[^0-9]/g, '');
    }
    if (thumbSel !== null && thumbSel !== undefined) m.thumbnail = thumbSel;
    m.song = mu.song; m.songCover = mu.cover; m.songTitle = $('#muTitle').value.trim(); m.artist = $('#muArtist').value.trim(); m.lyrics = $('#muLyrics').value.replace(/\s+$/, '');
    if (!m.date) m.date = nowDate();
    m.format = 'html';
    return m;
  }
  var ORDER = ['title', 'date', 'category', 'notice', 'thumbnail', 'summary', 'sub', 'status', 'price', 'center', 'song', 'songTitle', 'songCover', 'artist', 'lyrics', 'draft', 'format'];
  function yamlOf(m){
    var keys = ORDER.concat(Object.keys(m).filter(function(k){ return ORDER.indexOf(k) < 0 && k !== 'body'; }));
    return keys.map(function(k){
      var v = m[k];
      if (v === undefined || v === null || v === '' || (v === false && k !== 'draft')) return null;
      if (k === 'date') v = dateStr(v);
      if (typeof v === 'boolean') return k + ': ' + v;
      if (typeof v === 'number') return k + ': ' + v;
      if (k === 'price' && /^\d+$/.test(v)) return k + ': ' + v;
      if (typeof v === 'string') return k + ': ' + JSON.stringify(v);
      return k + ': ' + JSON.stringify(v);
    }).filter(Boolean).join('\n');
  }
  function safeName(n){
    n = String(n || 'file').normalize('NFC').replace(/\s+/g, '-').replace(/[#?%"'<>\\|*:]/g, '').replace(/-+/g, '-') || 'file';
    var dot = n.lastIndexOf('.'), base = dot > 0 ? n.slice(0, dot) : n, ext = dot > 0 ? n.slice(dot) : '', out = n, i = 2;
    while (taken[out.toLowerCase()]) out = base + '-' + (i++) + ext;
    taken[out.toLowerCase()] = 1; return out;
  }
  var busy = false;
  function save(asDraft, quiet){
    if (busy) return;
    if (mode === 'html') setMode('wys');
    var title = TITLE.value.trim();
    if (!title){ toast('제목을 써 주세요.', true); TITLE.focus(); return; }
    busy = true; $$('#edDraft, #edPub, #dwGo').forEach(function(b){ b.disabled = true; }); $('#edState').textContent = '저장 중…'; $('#edState').className = 'ad-state busy';
    var meta = collectMeta(); meta.draft = !!asDraft;
    var wrap = D.createElement('div'); wrap.innerHTML = ED.innerHTML;
    $$('img.sel', wrap).forEach(function(x){ x.classList.remove('sel'); if (!x.className) x.removeAttribute('class'); });
    $$('[contenteditable]', wrap).forEach(function(x){ x.removeAttribute('contenteditable'); });
    $$('[draggable]', wrap).forEach(function(x){ x.removeAttribute('draggable'); });
    $$('[data-size]', wrap).forEach(function(x){ x.removeAttribute('data-size'); });
    $$('[class=""],[style=""]', wrap).forEach(function(x){ if (x.getAttribute('class') === '') x.removeAttribute('class'); if (x.getAttribute('style') === '') x.removeAttribute('style'); });
    $$('#ad-caret', wrap).forEach(function(x){ x.remove(); });
    /* 사용 중인 첨부 모으기 */
    var used = {};
    $$('[data-up]', wrap).forEach(function(x){ used[x.getAttribute('data-up')] = 1; });
    ['song', 'songCover', 'thumbnail'].forEach(function(k){ if (meta[k] && String(meta[k]).indexOf('up:') === 0) used[meta[k].slice(3)] = 1; });
    var ids = Object.keys(used).filter(function(id){ return pend[id]; });
    var prep = taken ? Promise.resolve() : list('assets/uploads').then(function(fs){ taken = {}; (fs || []).forEach(function(f){ taken[f.name.toLowerCase()] = 1; }); });
    var files = [];
    prep.then(function(){
      return ids.reduce(function(p, id){
        return p.then(function(){
          var u = pend[id]; if (!u.path) u.path = 'assets/uploads/' + safeName(u.name);
          return fileB64(u.file).then(function(b){ files.push({ path: u.path, b64: b }); });
        });
      }, Promise.resolve());
    }).then(function(){
      function pth(id){ return pend[id] ? pend[id].path : ''; }
      $$('[data-up]', wrap).forEach(function(x){ var id = x.getAttribute('data-up'); x.setAttribute(x.tagName === 'IMG' ? 'src' : 'href', pth(id)); x.removeAttribute('data-up'); });
      ['song', 'songCover', 'thumbnail'].forEach(function(k){ if (meta[k] && String(meta[k]).indexOf('up:') === 0) meta[k] = pth(meta[k].slice(3)); });
      var html = wrap.innerHTML.replace(/(<p>(<br>)?<\/p>\s*)+$/, '').replace(/<p>(<br>)?<\/p>/g, '<p>&nbsp;</p>');
      var path = cur.path || ('posts/' + nowStamp() + '.md');
      var md = '---\n' + yamlOf(meta) + '\n---\n' + html + '\n';
      files.unshift({ path: path, b64: textB64(md) });
      return commit(files, (asDraft ? '임시저장: ' : '글 저장: ') + title + ' (Syringe 글쓰기)').then(function(){ return path; });
    }).then(function(path){
      /* 올린 파일은 편집기에서도 진짜 주소로 바꿔 두기 (다음 저장 때 또 올리지 않게) */
      ids.forEach(function(id){ $$('[data-up="' + id + '"]', ED).forEach(function(x){ x.setAttribute(x.tagName === 'IMG' ? 'src' : 'href', pend[id].path); x.removeAttribute('data-up'); }); });
      ['song', 'cover'].forEach(function(k){ if (mu[k].indexOf('up:') === 0 && pend[mu[k].slice(3)]) mu[k] = pend[mu[k].slice(3)].path; });
      if (thumbSel && thumbSel.indexOf('up:') === 0 && pend[thumbSel.slice(3)]) thumbSel = pend[thumbSel.slice(3)].path;
      musicPaint();
      var wasNew = !cur.path; cur.path = path; cur.slug = path.replace(/^posts\/|\.md$/g, ''); cur.meta = meta;
      backup.del('new'); backup.del(cur.slug);
      if (wasNew){ history.replaceState(null, '', '#edit/' + encodeURIComponent(cur.slug)); lastHash = location.hash; }
      setDirty(false); $('#dw').hidden = true;
      toast(asDraft ? '임시저장했어요. (홈엔 안 보여요)' : '저장했어요! 1~2분 뒤 사이트에 반영돼요.');
    }).catch(function(e){
      $('#edState').textContent = '저장 실패'; $('#edState').className = 'ad-state dirty';
      toast('저장 실패: ' + (e.message || e) + (e.status === 401 ? ' · 토큰을 다시 연결해 주세요.' : e.status === 413 || e.status === 422 ? ' · 파일이 너무 클 수 있어요.' : ''), true);
    }).then(function(){ busy = false; $$('#edDraft, #edPub, #dwGo').forEach(function(b){ b.disabled = false; }); });
  }

  /* 상단 메뉴 */
  $('#adNav').addEventListener('click', function(e){ var a = e.target.closest('a'); if (a && a.getAttribute('href') === location.hash){ e.preventDefault(); route(); } });

  route();
})();