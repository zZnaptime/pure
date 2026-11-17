/* BGM 관리 — assets/js/bgm-config.js 를 고쳐서 커밋해요
   · 재생 방식 (쓰기 · 자동 재생 · 다른 음악이 끝나면 다시) · 처음 볼륨
   · 시즌별 곡 (mp3 올리기 → assets/bgm/<시즌>.mp3) · 칩에 보일 곡 이름
   · LP 라벨 (색 / 이미지 · 십자 표시 · 시즌마다 따로) */
(function(){
  'use strict';
  var D = document, PATH = 'assets/js/bgm-config.js';
  var A = function(){ return window.SY_ADMIN; };
  var NAMES = { base: '기본', winter: '겨울 · 연말', summer: '여름' };
  var SUB = { base: '시즌 테마 꺼져 있을 때', winter: '겨울 테마 기간', summer: '여름 테마 기간' };
  var root, S = { conf: null, dirty: false, busy: false, files: {}, urls: {}, prev: null };
  function $(s, r){ return (r || D).querySelector(s); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function u8b64(u8){ var s = '', C = 0x8000; for (var i = 0; i < u8.length; i += C) s += String.fromCharCode.apply(null, u8.subarray(i, i + C)); return btoa(s); }
  function textB64(t){ return u8b64(new TextEncoder().encode(t)); }
  function setDirty(v){ S.dirty = v; var st = $('#bgState'); if (st) st.textContent = v ? '저장 안 됨' : ''; }
  function norm(c){
    c.v = +c.v || 1; c.on = c.on !== false; c.auto = c.auto !== false; c.resume = c.resume !== false; c.vol = Math.max(0, Math.min(100, +(c.vol == null ? 40 : c.vol)));
    c.tracks = c.tracks || {}; c.labels = c.labels || {};
    ['base', 'winter', 'summer'].forEach(function(k){
      c.tracks[k] = Object.assign({ src: '', title: '', artist: '' }, c.tracks[k] || {});
      c.labels[k] = Object.assign({ type: 'color', color: '#2FA4DE', image: '', cross: true }, c.labels[k] || {});
    });
    c.perSeason = !!c.perSeason;
    return c;
  }
  function parse(txt){ var a = txt.indexOf('{'), b = txt.lastIndexOf('}'); return norm(JSON.parse(txt.slice(a, b + 1))); }
  function build(c){
    return '/* BGM 설정 — 관리 화면의 \'BGM\' 에서 바꿔요 (직접 고쳐도 돼요)\n' +
      '   on : BGM 쓰기 · auto : 입장 버튼 누르면 자동 재생 · resume : Player / 글 음악이 멈추면 BGM 다시\n' +
      '   vol : 처음 볼륨 (0~100)\n' +
      '   tracks : 시즌별 곡 (base = 시즌 테마 꺼져 있을 때 · 비워 두면 base 곡)\n' +
      '   labels : LP 라벨 (type "color" | "image") · perSeason : true 면 시즌마다 따로 */\n' +
      'window.SY_BGM_CONF = ' + JSON.stringify({ v: c.v, on: c.on, auto: c.auto, resume: c.resume, vol: c.vol, tracks: c.tracks, perSeason: c.perSeason, labels: c.labels }, null, 2) + ';\n';
  }
  /* 사이트 쪽 주소 (미리보기용) */
  function siteUrl(p){ if (!p) return ''; if (/^(https?:|data:|blob:)/.test(p)) return p; return S.urls[p] || ('./' + p.replace(/^\.?\//, '')); }

  function disc(l){
    var img = l.type === 'image' && l.image ? siteUrl(l.image) : '', id = 'bgc' + Math.random().toString(36).slice(2, 8);
    return '<svg viewBox="-100 -100 200 200" class="bg-disc" aria-hidden="true"><defs><clipPath id="' + id + '"><circle r="40"/></clipPath></defs><circle r="98" fill="#0E1A26"/>' +
      '<circle r="86" fill="none" stroke="rgba(255,255,255,.08)"/><circle r="70" fill="none" stroke="rgba(255,255,255,.08)"/><path d="M-70 -50A86 86 0 0 1 -20 -84" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="6" stroke-linecap="round"/>' +
      '<circle r="40" fill="' + esc(l.color || '#2FA4DE') + '"/>' +
      (img ? '<image href="' + esc(img) + '" x="-40" y="-40" width="80" height="80" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + ')"/>' : '') +
      (l.cross !== false ? '<rect x="-6" y="-22" width="12" height="44" rx="2" fill="#fff"/><rect x="-22" y="-6" width="44" height="12" rx="2" fill="#fff"/>' : '') +
      '<circle r="4" fill="#0E1A26"/></svg>';
  }

  function render(){
    var c = S.conf;
    var sw = ['#2FA4DE', '#1C86C2', '#8FDCFB', '#0E0F12', '#B8E85A', '#F2B8C6', '#FFFFFF'];
    var labKeys = c.perSeason ? ['base', 'winter', 'summer'] : ['base'];
    root.innerHTML =
      '<div class="pm-box"><h2>재생 방식</h2>' +
        chk('on', 'BGM 쓰기', '끄면 상단바 BGM 칩도 사이트에서 사라져요', c.on) +
        chk('auto', '입장 버튼 누르면 자동 재생', '브라우저 규칙상 방문자가 한 번 눌러야 소리가 나서, 입장 버튼(또는 첫 클릭) 때 시작해요', c.auto) +
        chk('resume', 'Player · 글 음악이 끝나면 BGM 다시', '끄면 다른 음악이 멈춘 뒤에도 BGM은 조용히 있어요', c.resume) +
        '<label class="ad-f bg-vol"><span>처음 볼륨 <b data-volv>' + c.vol + '%</b></span><input type="range" min="0" max="100" data-k="vol" value="' + c.vol + '"><small>방문자가 바꾼 볼륨은 그 사람 브라우저에 따로 기억돼요</small></label>' +
      '</div>' +
      '<div class="pm-box"><h2>곡 정하기 <small>지금 켜진 시즌의 곡이 나와요 · 비워 두면 기본 곡</small></h2>' +
        ['base', 'winter', 'summer'].map(function(k){
          var t = c.tracks[k], pend = S.files['track:' + k];
          return '<div class="bg-row">' +
            '<div class="bg-name"><b>' + NAMES[k] + '</b><small>' + SUB[k] + '</small></div>' +
            '<label class="ad-f"><span>파일 또는 주소</span><input data-t="' + k + ':src" value="' + esc(t.src) + '" placeholder="assets/bgm/' + k + '.mp3"></label>' +
            '<label class="ad-f"><span>곡 이름 (칩에 보여요)</span><input data-t="' + k + ':title" value="' + esc(t.title) + '" placeholder="곡 제목"></label>' +
            '<label class="ad-f"><span>아티스트</span><input data-t="' + k + ':artist" value="' + esc(t.artist) + '" placeholder="(비워도 돼요)"></label>' +
            '<div class="bg-acts"><button type="button" class="ad-btn" data-up="track:' + k + '">mp3 올리기</button>' +
            '<button type="button" class="ad-btn bg-pv" data-pv="' + k + '"' + (t.src ? '' : ' disabled') + '>' + (S.prev && S.prev.k === k ? '■ 멈춤' : '▶ 듣기') + '</button></div>' +
            (pend ? '<p class="bg-pend">새 파일 · ' + esc(pend.name) + ' (' + (pend.size / 1048576).toFixed(1) + 'MB) → 저장하면 올라가요</p>' : '') +
            '</div>';
        }).join('') +
      '</div>' +
      '<div class="pm-box"><h2>LP 라벨 <small>십자 뒤 원 · 상단 칩 · 떠 있는 LP · 모바일 시트에 같이 보여요</small></h2>' +
        '<label class="ss-chk bg-per"><input type="checkbox" data-k="perSeason"' + (c.perSeason ? ' checked' : '') + '><span>시즌마다 따로 (기본 · 겨울 · 여름)</span></label>' +
        labKeys.map(function(k){
          var l = c.labels[k], pend = S.files['label:' + k];
          return '<div class="bg-lab">' + disc(l) + '<div class="bg-lf">' +
            (c.perSeason ? '<b class="bg-lt">' + NAMES[k] + '</b>' : '') +
            '<div class="bg-seg" role="radiogroup"><label><input type="radio" name="lt-' + k + '" data-l="' + k + ':type" value="color"' + (l.type !== 'image' ? ' checked' : '') + '><span>색</span></label><label><input type="radio" name="lt-' + k + '" data-l="' + k + ':type" value="image"' + (l.type === 'image' ? ' checked' : '') + '><span>이미지</span></label></div>' +
            '<div class="bg-sw">' + sw.map(function(x){ return '<button type="button" data-sw="' + k + ':' + x + '" style="background:' + x + '" class="' + (String(l.color).toUpperCase() === x ? 'on' : '') + '" aria-label="' + x + '"></button>'; }).join('') +
              '<input type="color" data-l="' + k + ':color" value="' + esc(/^#[0-9a-f]{6}$/i.test(l.color) ? l.color : '#2FA4DE') + '" aria-label="색 직접 고르기"></div>' +
            (l.type === 'image' ? '<div class="bg-img"><button type="button" class="ad-btn" data-up="label:' + k + '">이미지 올리기</button><small>' + (pend ? '새 이미지 · 저장하면 올라가요' : (l.image ? esc(l.image) : '정사각형 추천 · 512px 로 줄여서 저장돼요')) + '</small></div>' : '') +
            '<label class="ss-chk"><input type="checkbox" data-l="' + k + ':cross"' + (l.cross !== false ? ' checked' : '') + '><span>십자 표시</span></label>' +
          '</div></div>';
        }).join('') +
      '</div>' +
      '<div class="pm-box"><h2>미리보기 <small>저장하고 1~2분 뒤 사이트에서 확인할 수 있어요</small></h2><div class="ss-prev">' +
        '<a class="ad-btn" href="./?season=off" target="_blank" rel="noopener">기본으로 보기 ↗</a><a class="ad-btn" href="./?season=winter" target="_blank" rel="noopener">겨울로 보기 ↗</a><a class="ad-btn" href="./?season=summer" target="_blank" rel="noopener">여름으로 보기 ↗</a><a class="ad-btn" href="./?season=auto" target="_blank" rel="noopener">원래대로 ↗</a></div></div>';
    $('#bgFoot').hidden = false;
  }
  function chk(k, t, d, on){ return '<label class="bg-tg"><input type="checkbox" data-k="' + k + '"' + (on ? ' checked' : '') + '><span><b>' + t + '</b><small>' + d + '</small></span></label>'; }

  /* 파일 고르기 */
  function pick(accept){
    return new Promise(function(ok){
      var f = D.createElement('input'); f.type = 'file'; f.accept = accept;
      f.addEventListener('change', function(){ ok(f.files && f.files[0]); }); f.click();
    });
  }
  function shrink(file){
    return new Promise(function(ok, no){
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function(){
        var M = 512, s = Math.min(1, M / Math.max(img.width, img.height)), w = Math.round(img.width * s), h = Math.round(img.height * s);
        var cv = D.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
        var d = cv.toDataURL('image/webp', .9), ext = 'webp';
        if (d.indexOf('data:image/webp') !== 0){ d = cv.toDataURL('image/png'); ext = 'png'; }
        URL.revokeObjectURL(url); ok({ b64: d.split(',')[1], ext: ext, url: d });
      };
      img.onerror = function(){ URL.revokeObjectURL(url); no(new Error('이미지를 못 읽었어요')); };
      img.src = url;
    });
  }
  function upload(key){
    var parts = key.split(':'), kind = parts[0], k = parts[1];
    if (kind === 'track'){
      pick('audio/*,.mp3,.m4a,.ogg').then(function(f){
        if (!f) return;
        if (f.size > 40 * 1048576){ A().toast('40MB 보다 작은 파일로 올려 주세요'); return; }
        var ext = (f.name.match(/\.(mp3|m4a|ogg|wav)$/i) || [, 'mp3'])[1].toLowerCase(), path = 'assets/bgm/' + k + '.' + ext;
        f.arrayBuffer().then(function(buf){
          S.files[key] = { path: path, b64: u8b64(new Uint8Array(buf)), name: f.name, size: f.size };
          S.urls[path] = URL.createObjectURL(f);
          S.conf.tracks[k].src = path;
          if (!S.conf.tracks[k].title) S.conf.tracks[k].title = f.name.replace(/\.[^.]+$/, '');
          setDirty(true); render();
        });
      });
    } else {
      pick('image/*').then(function(f){
        if (!f) return;
        shrink(f).then(function(r){
          var path = 'assets/bgm/label-' + k + '.' + r.ext;
          S.files[key] = { path: path, b64: r.b64, name: f.name, size: r.b64.length * .75 };
          S.urls[path] = r.url; S.conf.labels[k].image = path; S.conf.labels[k].type = 'image';
          setDirty(true); render();
        }).catch(function(e){ A().toast(e.message); });
      });
    }
  }
  function preview(k){
    if (S.prev){ S.prev.a.pause(); var was = S.prev.k; S.prev = null; if (was === k){ render(); return; } }
    var src = siteUrl(S.conf.tracks[k].src); if (!src) return;
    var a = new Audio(src); a.volume = S.conf.vol / 100;
    a.play().then(function(){ S.prev = { a: a, k: k }; render(); }).catch(function(){ A().toast('재생할 수 없어요 · 저장 전 주소라면 저장 뒤에 들어 보세요'); });
    a.addEventListener('ended', function(){ S.prev = null; render(); });
  }

  function load(){
    root.innerHTML = '<p class="ad-empty">불러오는 중…</p>';
    A().raw(PATH).then(function(t){ S.conf = parse(t); S.files = {}; setDirty(false); render(); })
      .catch(function(e){
        if (e && e.status === 404){ S.conf = norm({}); S.files = {}; setDirty(true); render(); A().toast('설정 파일이 아직 없어서 새로 만들어요 · 저장하면 생겨요'); return; }
        root.innerHTML = '<p class="ad-empty">설정 파일을 못 불러왔어요 (' + esc(e && e.message || e) + ')</p>';
      });
  }
  function save(){
    if (S.busy || !S.conf) return;
    S.busy = true; $('#bgSave').disabled = true; $('#bgState').textContent = '저장 중…';
    S.conf.v = (S.conf.v || 1) + 1;
    var entries = Object.keys(S.files).map(function(k){ return { path: S.files[k].path, b64: S.files[k].b64 }; });
    entries.push({ path: PATH, b64: textB64(build(S.conf)) });
    A().commit(entries, 'BGM 설정 변경 (Syringe 관리)').then(function(){
      S.files = {}; setDirty(false); A().toast('저장했어요 · 1~2분 뒤 사이트에 반영돼요'); render();
    }).catch(function(e){ S.conf.v--; $('#bgState').textContent = '저장 실패'; A().toast('저장 실패 : ' + (e && e.message || e)); })
      .then(function(){ S.busy = false; $('#bgSave').disabled = false; });
  }

  function init(){
    root = $('#bgRoot'); if (!root) return;
    root.addEventListener('change', function(e){
      var t = e.target, k = t.getAttribute('data-k'), tk = t.getAttribute('data-t'), lk = t.getAttribute('data-l');
      if (k){ S.conf[k] = k === 'vol' ? +t.value : t.checked; setDirty(true); render(); return; }
      if (tk){ var p = tk.split(':'); S.conf.tracks[p[0]][p[1]] = t.value.trim(); setDirty(true); if (p[1] === 'src') render(); return; }
      if (lk){ var q = lk.split(':'), l = S.conf.labels[q[0]]; l[q[1]] = q[1] === 'cross' ? t.checked : t.value; setDirty(true); render(); }
    });
    root.addEventListener('input', function(e){
      var t = e.target;
      if (t.getAttribute('data-k') === 'vol'){ var v = $('[data-volv]', root); if (v) v.textContent = t.value + '%'; }
      if (t.type === 'color'){ var q = t.getAttribute('data-l').split(':'); S.conf.labels[q[0]].color = t.value.toUpperCase(); setDirty(true); var d = t.closest('.bg-lab').querySelector('.bg-disc'); if (d) d.outerHTML = disc(S.conf.labels[q[0]]); }
    });
    root.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-up')) upload(b.getAttribute('data-up'));
      else if (b.hasAttribute('data-pv')) preview(b.getAttribute('data-pv'));
      else if (b.hasAttribute('data-sw')){ var p = b.getAttribute('data-sw').split(':'); S.conf.labels[p[0]].color = p[1]; setDirty(true); render(); }
    });
    $('#bgSave').addEventListener('click', save);
  }
  window.SY_BGM_ADMIN = { enter: function(){ if (!root) init(); load(); }, dirty: function(){ return S.dirty; } };
  function boot(){ if (!root) init(); if (location.hash === '#bgm' && D.body.getAttribute('data-view') === 'vBgm' && !S.conf) load(); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
