/* ══════════════════════════════════════════════════════════════
   SYRINGE — 프롬프트 관리 (admin.html#prompts)

   · 보관함 비밀번호로 vault/vault.json 을 풀어서 고치고, 저장할 때 다시 잠가서 올려요.
   · 사진도 암호화해서 vault/img/무작위이름.bin 으로 올라가요.
   · 비밀번호 변경 = 새 키로 전부 다시 잠그기 (사진 포함). 이전 사진 파일은 지워요.
   · 비밀번호 · 푼 내용은 이 탭의 메모리에만 있어요. 새로고침하면 다시 잠겨요.
══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var D = document, A = window.SY_ADMIN;
  if (!A || !window.SYV) return;
  function $(s, r){ return (r || D).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  var esc = A.esc, toast = A.toast;
  var VAULT = 'vault/vault.json', IMG = function(id){ return 'vault/img/' + id + '.bin'; };
  var MAX_SIDE = 1400;

  /* 상태 : 전부 메모리 */
  var S = { key: null, kdf: null, data: null, weak: false, savedIds: {}, urls: {}, plain: {}, pend: {}, pn: 0,
            view: 'list', pi: -1, dirty: false, busy: false, missing: false, fileSlot: null, pasteSlot: null };
  var root = $('#pmRoot'), foot = $('#pmFoot');

  /* ════════ 도우미 ════════ */
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function setDirty(v){ S.dirty = v; var st = $('#pmState'); st.textContent = S.busy ? '저장 중…' : v ? '저장 안 됨' : '저장됨'; st.className = 'ad-state' + (S.busy ? ' busy' : v ? ' dirty' : ''); }
  function normalize(d){
    d = d || {}; d.v = 1;
    d.genres = Array.isArray(d.genres) ? d.genres : [];
    d.pairs = Array.isArray(d.pairs) ? d.pairs : [];
    d.pairs.forEach(function(p){
      p.id = p.id || SYV.randId(); p.chars = Array.isArray(p.chars) ? p.chars : []; p.outfits = Array.isArray(p.outfits) ? p.outfits : [];
      p.tags = Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map(function(t){ return t.trim(); }).filter(Boolean);
      p.outfits.forEach(function(o){ o.parts = Array.isArray(o.parts) ? o.parts : []; while (o.parts.length < p.chars.length) o.parts.push({ top: '', bottom: '', shoes: '' }); });
    });
    return d;
  }
  function refsOf(d){
    var out = [];
    d.pairs.forEach(function(p){ if (p.img && p.img.id) out.push(p.img); p.outfits.forEach(function(o){ if (o.img && o.img.id) out.push(o.img); }); });
    return out;
  }
  function idSet(d){ var s = {}; refsOf(d).forEach(function(r){ if (r.id.indexOf('new:') !== 0) s[r.id] = 1; }); return s; }
  function textB64(t){ return SYV.b64(new TextEncoder().encode(t)); }
  function wipe(){
    Object.keys(S.urls).forEach(function(k){ try { URL.revokeObjectURL(S.urls[k]); } catch(e){} });
    Object.keys(S.pend).forEach(function(k){ try { URL.revokeObjectURL(S.pend[k].url); } catch(e){} });
    S.key = null; S.kdf = null; S.data = null; S.urls = {}; S.plain = {}; S.pend = {}; S.savedIds = {}; S.view = 'list'; S.pi = -1; S.weak = false;
    setDirty(false);
  }

  /* ════════ 사진 ════════ */
  function plainOf(id){
    if (S.plain[id]) return Promise.resolve(S.plain[id]);
    var key = S.key;
    return A.rawBin(IMG(id)).then(function(b){ return SYV.decBytes(key, b); }).then(function(p){ S.plain[id] = p; return p; });
  }
  function urlOf(ref){
    if (!ref || !ref.id) return Promise.resolve('');
    if (ref.id.indexOf('new:') === 0){ var p = S.pend[ref.id.slice(4)]; return Promise.resolve(p ? p.url : ''); }
    if (S.urls[ref.id]) return Promise.resolve(S.urls[ref.id]);
    return plainOf(ref.id).then(function(p){ var u = URL.createObjectURL(new Blob([p], { type: ref.type || 'image/png' })); S.urls[ref.id] = u; return u; }).catch(function(){ return ''; });
  }
  function paintImgs(){
    $$('[data-pimg]', root).forEach(function(el){
      var id = el.getAttribute('data-pimg'), type = el.getAttribute('data-ptype');
      if (!id){ el.classList.add('none'); return; }
      urlOf({ id: id, type: type }).then(function(u){ if (el.getAttribute('data-pimg') !== id) return; if (u){ el.style.backgroundImage = 'url("' + u + '")'; el.classList.remove('none', 'load'); } else el.classList.add('none'); });
    });
  }
  /* 큰 사진은 줄여서 (긴 변 1400px) */
  function prepImage(file){
    if (!file || !/^image\//.test(file.type)) return Promise.reject(new Error('사진 파일이 아니에요.'));
    var keep = function(){ return file.arrayBuffer().then(function(b){ return { bytes: new Uint8Array(b), type: file.type }; }); };
    if (!window.createImageBitmap || /gif|svg/.test(file.type)) return keep();
    return createImageBitmap(file).then(function(bm){
      var big = Math.max(bm.width, bm.height);
      if (big <= MAX_SIDE && file.size < 1.5 * 1048576) return keep();
      var sc = Math.min(1, MAX_SIDE / big), cv = D.createElement('canvas');
      cv.width = Math.round(bm.width * sc); cv.height = Math.round(bm.height * sc);
      cv.getContext('2d').drawImage(bm, 0, 0, cv.width, cv.height);
      return new Promise(function(ok){ cv.toBlob(function(b){ ok(b); }, 'image/webp', .92); }).then(function(b){
        if (b && b.type === 'image/webp') return b;
        return new Promise(function(ok){ cv.toBlob(function(x){ ok(x); }, 'image/png'); });
      }).then(function(b){ return b.arrayBuffer().then(function(ab){ return { bytes: new Uint8Array(ab), type: b.type }; }); });
    }, keep);
  }
  function setSlot(slot, file){
    return prepImage(file).then(function(r){
      var k = 'p' + (++S.pn); S.pend[k] = { bytes: r.bytes, type: r.type, url: URL.createObjectURL(new Blob([r.bytes], { type: r.type })) };
      var ref = { id: 'new:' + k, type: r.type };
      var p = S.data.pairs[S.pi]; if (!p) return;
      if (slot === 'pair') p.img = ref; else { var o = p.outfits[+slot.slice(2)]; if (o) o.img = ref; }
      setDirty(true); renderEdit(true);
    }).catch(function(e){ toast(e.message || '사진을 못 넣었어요.', true); });
  }

  /* ════════ 불러오기 · 잠금 ════════ */
  function enter(){
    if (S.key){ render(); return; }
    foot.hidden = true;
    root.innerHTML = '<section class="pm-lock"><p class="ad-empty">보관함 확인 중…</p></section>';
    A.raw(VAULT).then(function(t){ S.missing = false; S.file = JSON.parse(t); lockView(); })
      .catch(function(e){ if (e && e.status === 404){ S.missing = true; lockView(); } else root.innerHTML = '<section class="pm-lock"><p class="ad-empty">보관함을 못 불러왔어요: ' + esc(e.message || e) + '</p></section>'; });
  }
  function lockView(){
    foot.hidden = true;
    root.innerHTML = '<section class="pm-lock">' +
      '<i class="pm-lk"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></i>' +
      '<h1>프롬프트 보관함</h1>' +
      (S.missing
        ? '<p>아직 보관함이 없어요. 새 비밀번호를 정하면 만들어져요.</p>' +
          '<label class="ad-f"><span>새 비밀번호</span><input type="password" id="pmNew1" autocomplete="new-password"></label>' +
          '<label class="ad-f"><span>한 번 더</span><input type="password" id="pmNew2" autocomplete="new-password"></label>' +
          '<button type="button" class="ad-btn pri wide" id="pmCreate">보관함 만들기</button>'
        : '<p>사이트에서 쓰는 보관함 비밀번호를 넣어 주세요.<br><small>깃허브 토큰과는 다른 비밀번호예요.</small></p>' +
          '<form id="pmUnlockF" autocomplete="off"><label class="ad-f"><span>보관함 비밀번호</span><input type="password" id="pmPw" autocomplete="off"></label>' +
          '<button type="submit" class="ad-btn pri wide" id="pmUnlock">열기</button></form>') +
      '<p class="ad-err" id="pmErr"></p></section>';
    var f = $('#pmPw') || $('#pmNew1'); if (f) setTimeout(function(){ f.focus(); }, 30);
  }
  function unlock(){
    var pw = $('#pmPw').value, b = $('#pmUnlock'), err = $('#pmErr');
    if (!pw) return;
    b.disabled = true; b.textContent = '여는 중…'; err.textContent = '';
    /* 혹시 다른 곳에서 바뀌었을 수 있으니 최신 파일로 */
    A.raw(VAULT).then(function(t){ return SYV.open(JSON.parse(t), pw); }).then(function(o){
      S.key = o.key; S.kdf = o.kdf; S.data = normalize(o.data); S.savedIds = idSet(S.data); S.weak = pw === '0000' || pw.length < 8;
      setDirty(false); S.view = 'list'; render();
    }).catch(function(e){ b.disabled = false; b.textContent = '열기'; err.textContent = e.message || '열지 못했어요.'; $('#pmPw').value = ''; $('#pmPw').focus(); });
  }
  function create(){
    var a = $('#pmNew1').value, c = $('#pmNew2').value, err = $('#pmErr');
    if (a.length < 8){ err.textContent = '비밀번호는 8자 이상으로 해 주세요.'; return; }
    if (a !== c){ err.textContent = '두 칸이 서로 달라요.'; return; }
    var b = $('#pmCreate'); b.disabled = true;
    var data = { v: 1, genres: [], pairs: [] };
    SYV.newKey(a).then(function(k){ S.key = k.key; S.kdf = k.kdf; return SYV.seal(data, k.key, k.kdf); }).then(function(file){
      return A.commit([{ path: VAULT, b64: textB64(JSON.stringify(file) + '\n') }], '프롬프트 보관함 만들기 (Syringe 관리)');
    }).then(function(){ S.data = normalize(data); S.savedIds = {}; S.missing = false; setDirty(false); render(); toast('보관함을 만들었어요.'); })
      .catch(function(e){ S.key = null; b.disabled = false; err.textContent = '만들지 못했어요: ' + (e.message || e); });
  }
  function lock(){
    if (S.dirty && !confirm('저장하지 않은 내용이 있어요. 버리고 잠글까요?')) return;
    wipe(); enter();
  }

  /* ════════ 화면 ════════ */
  function render(){
    foot.hidden = !S.key;
    if (!S.key) return lockView();
    if (S.view === 'edit' && S.data.pairs[S.pi]) renderEdit(); else { S.view = 'list'; renderList(); }
  }
  function warnHTML(){
    return S.weak ? '<div class="pm-warn"><b>비밀번호가 약해요.</b> 지금 비밀번호는 쉽게 뚫릴 수 있어요. 실제 프롬프트를 넣기 전에 <button type="button" data-act="pw">비밀번호 변경</button>으로 8자 이상 (추천: 단어 여러 개를 이은 긴 문장) 으로 바꿔 주세요.</div>' : '';
  }
  function renderList(){
    var d = S.data;
    root.innerHTML = '<section class="pm-list">' +
      '<div class="pm-head"><h1>프롬프트 관리 <em>' + d.pairs.length + '</em></h1>' +
        '<div class="pm-tools"><button type="button" class="ad-btn pri" data-act="add">＋ 페어 추가</button><button type="button" class="ad-btn" data-act="genre">장르 관리</button><button type="button" class="ad-btn" data-act="pw">비밀번호 변경</button><button type="button" class="ad-btn" data-act="lock">잠그기</button></div></div>' +
      warnHTML() +
      (d.pairs.length ? '<div class="pm-grid">' + d.pairs.map(function(p, i){
        return '<article class="pm-card">' +
          '<div class="pm-ctop">' + (p.genre ? '<span class="pm-genre">' + esc(p.genre) + '</span>' : '<span></span>') +
            '<span class="pm-cbtn"><button type="button" data-mv="' + i + ':-1" title="앞으로"' + (i ? '' : ' disabled') + '>←</button><button type="button" data-mv="' + i + ':1" title="뒤로"' + (i < d.pairs.length - 1 ? '' : ' disabled') + '>→</button><button type="button" data-edit="' + i + '" title="고치기">✎</button><button type="button" data-del="' + i + '" title="지우기" class="del">×</button></span></div>' +
          '<button type="button" class="pm-cimg load" data-edit="' + i + '" data-pimg="' + esc(p.img && p.img.id || '') + '" data-ptype="' + esc(p.img && p.img.type || '') + '"></button>' +
          '<div class="pm-cmeta"><small>' + esc(p.sub || '') + '</small><b>' + esc(p.name || '(이름 없음)') + '</b><span>' + p.chars.length + '명 · 의상 ' + p.outfits.length + '벌' + (p.tags.length ? ' · #' + p.tags.map(esc).join(' #') : '') + '</span></div>' +
        '</article>';
      }).join('') + '</div>' : '<p class="ad-empty">아직 페어가 없어요. <b>＋ 페어 추가</b>로 시작해요.</p>') +
    '</section>';
    paintImgs();
  }
  function genreOptions(cur){
    var gs = S.data.genres.slice(); if (cur && gs.indexOf(cur) < 0) gs.push(cur);
    return '<option value="">(장르 없음)</option>' + gs.map(function(g){ return '<option' + (g === cur ? ' selected' : '') + '>' + esc(g) + '</option>'; }).join('');
  }
  function slotHTML(slot, ref, label){
    return '<div class="pm-slot" data-slot="' + slot + '">' +
      '<span class="pm-thumb load" data-pimg="' + esc(ref && ref.id || '') + '" data-ptype="' + esc(ref && ref.type || '') + '"></span>' +
      '<div class="pm-sbtn"><button type="button" class="ad-btn" data-pick="' + slot + '">파일 선택</button><button type="button" class="ad-btn" data-paste="' + slot + '">붙여넣기</button>' + (ref && ref.id ? '<button type="button" class="ad-btn" data-unimg="' + slot + '">빼기</button>' : '') +
      '<small>' + esc(label) + ' · 끌어다 놓아도 돼요</small></div></div>';
  }
  function renderEdit(keepScroll){
    var y = window.pageYOffset, p = S.data.pairs[S.pi];
    var chars = p.chars.map(function(c, ci){
      return '<div class="pm-char"><div class="pm-row"><label class="ad-f"><span>캐릭터 ' + (ci + 1) + ' 이름</span><input data-c="' + ci + ':name" value="' + esc(c.name) + '" placeholder="예: 퓨어"></label>' +
        '<button type="button" class="ad-btn pm-x" data-delc="' + ci + '">삭제</button></div>' +
        '<label class="ad-f"><span>기본 프롬프트 <small>· 의상과 상관없이 늘 들어가는 부분</small></span><textarea rows="4" data-c="' + ci + ':base" placeholder="boy, short hair, black hair, …">' + esc(c.base) + '</textarea></label></div>';
    }).join('');
    var outs = p.outfits.map(function(o, oi){
      return '<div class="pm-out">' +
        '<div class="pm-row"><label class="ad-f"><span>의상 이름</span><input data-o="' + oi + ':name" value="' + esc(o.name) + '" placeholder="예: 사복"></label>' +
          '<label class="ad-f"><span>작은 설명</span><input data-o="' + oi + ':sub" value="' + esc(o.sub) + '" placeholder="예: 캐주얼"></label>' +
          '<span class="pm-obtn"><button type="button" class="ad-btn" data-omv="' + oi + ':-1" title="위로"' + (oi ? '' : ' disabled') + '>↑</button><button type="button" class="ad-btn" data-omv="' + oi + ':1" title="아래로"' + (oi < p.outfits.length - 1 ? '' : ' disabled') + '>↓</button><button type="button" class="ad-btn pm-x" data-delo="' + oi + '">삭제</button></span></div>' +
        p.chars.map(function(c, ci){
          var pt = o.parts[ci] || {};
          return '<p class="pm-who">' + esc(c.name || ('캐릭터 ' + (ci + 1))) + ' 의상</p>' +
            [['top', '상의'], ['bottom', '하의'], ['shoes', '신발']].map(function(k){
              return '<label class="pm-part"><span>' + k[1] + '</span><input data-p="' + oi + ':' + ci + ':' + k[0] + '" value="' + esc(pt[k[0]]) + '"></label>';
            }).join('');
        }).join('') +
        slotHTML('o:' + oi, o.img, '이 의상 사진 (선택 · 없으면 대표 사진)') +
      '</div>';
    }).join('');
    root.innerHTML = '<section class="pm-edit">' +
      '<div class="pm-head"><button type="button" class="ad-btn" data-act="back">← 목록</button><h1>' + esc(p.name || '새 페어') + '</h1>' +
        '<div class="pm-tools"><button type="button" class="ad-btn pm-x" data-del="' + S.pi + '">페어 삭제</button></div></div>' +
      warnHTML() +
      '<div class="pm-box"><h2>기본 정보</h2>' +
        '<div class="ad-row2"><label class="ad-f"><span>페어 이름 <small>· 크게 보이는 이름</small></span><input data-f="name" value="' + esc(p.name) + '" placeholder="PURE X UXI"></label>' +
        '<label class="ad-f"><span>부제 <small>· 이름 위 작은 글씨</small></span><input data-f="sub" value="' + esc(p.sub) + '" placeholder="퓨어 × 유시"></label></div>' +
        '<div class="ad-row2"><label class="ad-f"><span>장르 <small>· 장르 관리에서 추가</small></span><select data-f="genre">' + genreOptions(p.genre) + '</select></label>' +
        '<label class="ad-f"><span>태그 <small>· 쉼표로 구분</small></span><input data-f="tags" value="' + esc(p.tags.join(', ')) + '" placeholder="가이드버스, 센티넬"></label></div>' +
        slotHTML('pair', p.img, '대표 사진 (의상을 고르지 않았을 때)') +
      '</div>' +
      '<div class="pm-box"><h2>캐릭터 <small>' + p.chars.length + '명</small></h2>' + chars +
        '<button type="button" class="ad-btn pm-add" data-act="addc">＋ 캐릭터 추가</button></div>' +
      '<div class="pm-box"><h2>의상 <small>' + p.outfits.length + '벌 · 사이트에서 전체 / 상반신만(상의) / 신발 없이(상의+하의)로 골라요</small></h2>' + outs +
        '<button type="button" class="ad-btn pm-add" data-act="addo">＋ 의상 추가</button></div>' +
    '</section>';
    paintImgs();
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }

  /* ════════ 입력 ════════ */
  root.addEventListener('input', function(e){
    var t = e.target, p = S.data && S.data.pairs[S.pi]; if (!p) return;
    var a;
    if ((a = t.getAttribute('data-f'))){ if (a === 'tags') p.tags = t.value.split(',').map(function(x){ return x.trim(); }).filter(Boolean); else p[a] = t.value; }
    else if ((a = t.getAttribute('data-c'))){ a = a.split(':'); p.chars[+a[0]][a[1]] = t.value; }
    else if ((a = t.getAttribute('data-o'))){ a = a.split(':'); p.outfits[+a[0]][a[1]] = t.value; }
    else if ((a = t.getAttribute('data-p'))){ a = a.split(':'); var o = p.outfits[+a[0]]; o.parts[+a[1]] = o.parts[+a[1]] || {}; o.parts[+a[1]][a[2]] = t.value; }
    else return;
    setDirty(true);
  });
  root.addEventListener('change', function(e){ if (e.target.getAttribute('data-f') === 'genre'){ S.data.pairs[S.pi].genre = e.target.value; setDirty(true); } });
  root.addEventListener('submit', function(e){ if (e.target.id === 'pmUnlockF'){ e.preventDefault(); unlock(); } });
  root.addEventListener('click', function(e){
    var t = e.target.closest('button'); if (!t || t.disabled) return;
    var d = S.data, p = d && d.pairs[S.pi], a, v;
    if (t.id === 'pmCreate') return create();
    if ((a = t.getAttribute('data-act'))){
      if (a === 'lock') return lock();
      if (a === 'add'){ d.pairs.push({ id: SYV.randId(), name: '', sub: '', genre: d.genres[0] || '', tags: [], img: null, chars: [{ name: '', base: '' }, { name: '', base: '' }], outfits: [] }); S.pi = d.pairs.length - 1; S.view = 'edit'; setDirty(true); return renderEdit(); }
      if (a === 'back'){ S.view = 'list'; S.pi = -1; return renderList(); }
      if (a === 'addc'){ p.chars.push({ name: '', base: '' }); p.outfits.forEach(function(o){ o.parts.push({ top: '', bottom: '', shoes: '' }); }); setDirty(true); return renderEdit(true); }
      if (a === 'addo'){ p.outfits.push({ name: '', sub: '', img: null, parts: p.chars.map(function(){ return { top: '', bottom: '', shoes: '' }; }) }); setDirty(true); renderEdit(true); var last = $$('.pm-out', root).pop(); if (last){ last.scrollIntoView({ block: 'center' }); var i = $('input', last); if (i) i.focus(); } return; }
      if (a === 'genre') return genres();
      if (a === 'pw') return changePw();
    }
    if ((v = t.getAttribute('data-edit')) !== null){ S.pi = +v; S.view = 'edit'; return renderEdit(); }
    if ((v = t.getAttribute('data-mv')) !== null){ v = v.split(':'); var i = +v[0], j = i + (+v[1]); var x = d.pairs.splice(i, 1)[0]; d.pairs.splice(j, 0, x); setDirty(true); return renderList(); }
    if ((v = t.getAttribute('data-del')) !== null){
      var q = d.pairs[+v]; if (!confirm('「' + (q.name || '이름 없는 페어') + '」 페어를 지울까요?\n(저장을 눌러야 실제로 지워져요)')) return;
      d.pairs.splice(+v, 1); S.view = 'list'; S.pi = -1; setDirty(true); return renderList();
    }
    if ((v = t.getAttribute('data-delc')) !== null){
      if (!confirm('이 캐릭터와 의상 칸의 이 캐릭터 내용을 지울까요?')) return;
      p.chars.splice(+v, 1); p.outfits.forEach(function(o){ o.parts.splice(+v, 1); }); setDirty(true); return renderEdit(true);
    }
    if ((v = t.getAttribute('data-delo')) !== null){ if (!confirm('이 의상을 지울까요?')) return; p.outfits.splice(+v, 1); setDirty(true); return renderEdit(true); }
    if ((v = t.getAttribute('data-omv')) !== null){ v = v.split(':'); var oi = +v[0], oj = oi + (+v[1]); var ox = p.outfits.splice(oi, 1)[0]; p.outfits.splice(oj, 0, ox); setDirty(true); return renderEdit(true); }
    if ((v = t.getAttribute('data-pick')) !== null){ S.fileSlot = v; $('#pmFile').click(); return; }
    if ((v = t.getAttribute('data-unimg')) !== null){ if (v === 'pair') p.img = null; else p.outfits[+v.slice(2)].img = null; setDirty(true); return renderEdit(true); }
    if ((v = t.getAttribute('data-paste')) !== null){ return pasteInto(v); }
  });
  $('#pmFile').addEventListener('change', function(){ var f = this.files[0]; this.value = ''; if (f && S.fileSlot) setSlot(S.fileSlot, f); });
  /* 끌어다 놓기 */
  root.addEventListener('dragover', function(e){ var s = e.target.closest('.pm-slot'); if (s && e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') >= 0){ e.preventDefault(); s.classList.add('drop'); } });
  root.addEventListener('dragleave', function(e){ var s = e.target.closest('.pm-slot'); if (s) s.classList.remove('drop'); });
  root.addEventListener('drop', function(e){ var s = e.target.closest('.pm-slot'); if (!s) return; e.preventDefault(); s.classList.remove('drop'); var f = e.dataTransfer.files[0]; if (f) setSlot(s.getAttribute('data-slot'), f); });
  /* 붙여넣기 : 클립보드 읽기가 막힌 브라우저는 Ctrl+V 로 */
  function pasteInto(slot){
    S.pasteSlot = slot;
    if (navigator.clipboard && navigator.clipboard.read){
      navigator.clipboard.read().then(function(items){
        for (var i = 0; i < items.length; i++){
          var tp = items[i].types.filter(function(x){ return /^image\//.test(x); })[0];
          if (tp) return items[i].getType(tp).then(function(b){ S.pasteSlot = null; return setSlot(slot, new File([b], 'paste', { type: tp })); });
        }
        toast('클립보드에 사진이 없어요. 사진을 복사한 뒤 다시 눌러 주세요.', true);
      }).catch(function(){ toast('지금 Ctrl+V (⌘+V) 를 누르면 이 칸에 들어가요.'); });
    } else toast('지금 Ctrl+V (⌘+V) 를 누르면 이 칸에 들어가요.');
  }
  D.addEventListener('paste', function(e){
    if (D.body.getAttribute('data-view') !== 'vPrompt' || !S.pasteSlot || S.view !== 'edit') return;
    var f = Array.prototype.slice.call((e.clipboardData && e.clipboardData.files) || []).filter(function(x){ return /^image\//.test(x.type); })[0];
    if (!f) return; e.preventDefault(); var s = S.pasteSlot; S.pasteSlot = null; setSlot(s, f);
  });

  /* ════════ 장르 · 비밀번호 ════════ */
  function genres(){
    A.modal('장르 관리', '<label class="ad-f"><span>한 줄에 하나씩 · 위에서부터 사이트 순서</span><textarea id="pmGen" rows="7" placeholder="ARCH">' + esc(S.data.genres.join('\n')) + '</textarea></label>', function(){
      var g = $('#pmGen').value.split('\n').map(function(x){ return x.trim(); }).filter(function(x, i, a){ return x && a.indexOf(x) === i; });
      S.data.genres = g; setDirty(true); render(); toast('장르를 바꿨어요. 저장을 눌러야 반영돼요.');
    });
  }
  function changePw(){
    if (S.busy) return;
    A.modal('보관함 비밀번호 변경', '<p class="pm-mnote">바꾸면 모든 프롬프트와 사진을 새 비밀번호로 다시 잠가서 저장해요. 지금 고친 내용도 같이 저장돼요.<br>8자 이상 · 단어 여러 개를 이은 긴 문장을 추천해요.</p>' +
      '<label class="ad-f"><span>새 비밀번호</span><input type="password" id="pmP1" autocomplete="new-password"></label>' +
      '<label class="ad-f"><span>한 번 더</span><input type="password" id="pmP2" autocomplete="new-password"></label>', function(){
      var a = $('#pmP1').value, c = $('#pmP2').value;
      if (a.length < 8){ toast('비밀번호는 8자 이상으로 해 주세요.', true); return; }
      if (a !== c){ toast('두 칸이 서로 달라요.', true); return; }
      rekey(a);
    });
  }

  /* ════════ 저장 ════════ */
  function startBusy(){ S.busy = true; setDirty(S.dirty); $('#pmSave').disabled = true; }
  function endBusy(){ S.busy = false; setDirty(S.dirty); $('#pmSave').disabled = false; }
  /* 새 사진 암호화 → 올릴 목록 */
  function packImages(data, key, all){
    var entries = [], map = {};
    return refsOf(data).reduce(function(pr, ref){
      return pr.then(function(){
        var isNew = ref.id.indexOf('new:') === 0; if (!isNew && !all) return;
        var src = isNew ? Promise.resolve(S.pend[ref.id.slice(4)].bytes) : plainOf(ref.id);
        return src.then(function(bytes){
          var nid = SYV.randId();
          return SYV.encBytes(key, bytes).then(function(ct){ entries.push({ path: IMG(nid), b64: SYV.b64(ct) }); map[nid] = { from: ref.id, bytes: bytes }; ref.id = nid; });
        });
      });
    }, Promise.resolve()).then(function(){ return { entries: entries, map: map }; });
  }
  function afterSave(data, map){
    /* 미리보기 주소 · 원본 바이트를 새 이름으로 옮기기 */
    Object.keys(map).forEach(function(nid){
      var from = map[nid].from;
      if (from.indexOf('new:') === 0){ var pd = S.pend[from.slice(4)]; if (pd){ S.urls[nid] = pd.url; delete S.pend[from.slice(4)]; } }
      else if (S.urls[from]){ S.urls[nid] = S.urls[from]; delete S.urls[from]; }
      S.plain[nid] = map[nid].bytes;
    });
    S.data = data; S.savedIds = idSet(data);
  }
  function save(){
    if (!S.key || S.busy) return;
    if (!S.dirty){ toast('바뀐 내용이 없어요.'); return; }
    startBusy();
    var data = clone(S.data), key = S.key, kdf = S.kdf, pk;
    packImages(data, key, false).then(function(r){
      pk = r; var now = idSet(data);
      Object.keys(S.savedIds).forEach(function(id){ if (!now[id]) pk.entries.push({ path: IMG(id), del: true }); });
      return SYV.seal(data, key, kdf);
    }).then(function(file){
      pk.entries.unshift({ path: VAULT, b64: textB64(JSON.stringify(file) + '\n') });
      return A.commit(pk.entries, '프롬프트 보관함 갱신 (Syringe 관리)');
    }).then(function(){
      afterSave(data, pk.map); S.dirty = false; endBusy(); render();
      toast('저장했어요! 1~2분 뒤 사이트에 반영돼요.');
    }).catch(function(e){ endBusy(); toast('저장 실패: ' + (e.message || e) + (e.status === 401 ? ' · 토큰을 다시 연결해 주세요.' : ''), true); });
  }
  function rekey(pw){
    if (!S.key || S.busy) return;
    startBusy(); toast('새 비밀번호로 다시 잠그는 중… 사진이 많으면 조금 걸려요.');
    var data = clone(S.data), nk, pk, old = Object.keys(S.savedIds);
    SYV.newKey(pw).then(function(k){ nk = k; return packImages(data, k.key, true); }).then(function(r){
      pk = r; old.forEach(function(id){ pk.entries.push({ path: IMG(id), del: true }); });
      return SYV.seal(data, nk.key, nk.kdf);
    }).then(function(file){
      pk.entries.unshift({ path: VAULT, b64: textB64(JSON.stringify(file) + '\n') });
      return A.commit(pk.entries, '프롬프트 보관함 갱신 (Syringe 관리)');
    }).then(function(){
      S.key = nk.key; S.kdf = nk.kdf; afterSave(data, pk.map); S.weak = false; S.dirty = false; endBusy(); render();
      toast('비밀번호를 바꿨어요. 1~2분 뒤 사이트도 새 비밀번호로 열려요.');
    }).catch(function(e){ endBusy(); toast('비밀번호 변경 실패 (아무것도 안 바뀌었어요): ' + (e.message || e), true); });
  }
  $('#pmSave').addEventListener('click', save);
  D.addEventListener('keydown', function(e){ if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && D.body.getAttribute('data-view') === 'vPrompt'){ e.preventDefault(); save(); } });
  window.addEventListener('beforeunload', function(e){ if (S.dirty){ e.preventDefault(); e.returnValue = ''; } });

  window.SY_PROMPT = { enter: enter, dirty: function(){ return !!S.dirty; } };
  if (D.body.getAttribute('data-view') === 'vPrompt') enter();
})();
