/* 시즌 테마 관리 — assets/js/season-config.js 를 고쳐서 커밋해요
   · 켜는 방식 : 자동(기간대로) / 끄기 / 특정 시즌 지금 켜기
   · 시즌별 기간 (월-일) · 사용 여부 · 파비콘 바꾸기
   · 새 시즌(봄 · 기념일 …)은 css / js 파일이 같이 있어야 해서 파일을 추가할 때 목록에도 넣어 줘요 */
(function(){
  'use strict';
  var D = document, PATH = 'assets/js/season-config.js';
  var A = function(){ return window.SY_ADMIN; };
  var root, S = { conf: null, dirty: false, busy: false };
  function $(s, r){ return (r || D).querySelector(s); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(s){ var m = String(s || '').match(/^(\d{1,2})-(\d{1,2})$/); if (!m) return -1; var M = +m[1], d = +m[2]; return (M >= 1 && M <= 12 && d >= 1 && d <= 31) ? M * 100 + d : -1; }
  function inRange(s, t){ var a = num(s.from), b = num(s.to); if (a < 0 || b < 0) return false; return a <= b ? (t >= a && t <= b) : (t >= a || t <= b); }
  function today(){ var d = new Date(); return (d.getMonth() + 1) * 100 + d.getDate(); }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function activeNow(c){
    if (c.mode === 'off') return null;
    if (c.mode !== 'auto') return c.seasons.filter(function(s){ return s.id === c.mode; })[0] || null;
    var t = today(); return c.seasons.filter(function(s){ return s.on !== false && inRange(s, t); })[0] || null;
  }
  function parse(txt){
    var a = txt.indexOf('{'), b = txt.lastIndexOf('}');
    var c = JSON.parse(txt.slice(a, b + 1));
    c.seasons = Array.isArray(c.seasons) ? c.seasons : []; c.mode = c.mode || 'auto'; c.v = +c.v || 1;
    return c;
  }
  function build(c){
    return '/* 시즌 테마 설정 — 관리 화면의 \'시즌 테마\' 에서 바꿔요 (직접 고쳐도 돼요)\n' +
      '   mode : "auto" = 아래 기간대로 저절로 · "off" = 끄기 · 시즌 id (예: "winter") = 기간 상관없이 지금 켜기\n' +
      '   seasons : 시즌마다 assets/css/season-<id>.css 와 assets/js/season-<id>.js 가 짝으로 있어요\n' +
      '   from / to : "월-일" (해를 넘겨도 돼요 · 예: 11-17 ~ 01-05) */\n' +
      'window.SY_SEASON_CONF = ' + JSON.stringify({ v: c.v, mode: c.mode, seasons: c.seasons }, null, 2) + ';\n';
  }
  function b64(t){ var u = new TextEncoder().encode(t), s = ''; for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
  function setDirty(v){ S.dirty = v; var st = $('#ssState'); if (st) st.textContent = v ? '저장 안 됨' : ''; }

  function render(){
    var c = S.conf, act = activeNow(c), t = today();
    var modes = [['auto', '자동', '기간대로 저절로 켜지고 꺼져요'], ['off', '끄기', '시즌 테마를 쓰지 않아요']].concat(c.seasons.map(function(s){ return [s.id, s.name + ' 지금 켜기', '기간 상관없이 바로 켜요']; }));
    root.innerHTML =
      '<div class="ss-now ' + (act ? 'on' : '') + '"><i></i><div><small>오늘 ' + pad(Math.floor(t / 100)) + '-' + pad(t % 100) + ' 기준</small><b>' + (act ? esc(act.name) + ' 테마가 켜져 있어요' : '기본 테마예요 (시즌 테마 꺼짐)') + '</b></div></div>' +
      '<div class="pm-box"><h2>켜는 방식</h2><div class="ss-modes" role="radiogroup">' + modes.map(function(m){
        return '<label class="ss-mode"><input type="radio" name="ssMode" value="' + esc(m[0]) + '"' + (c.mode === m[0] ? ' checked' : '') + '><span><b>' + esc(m[1]) + '</b><small>' + esc(m[2]) + '</small></span></label>';
      }).join('') + '</div></div>' +
      '<div class="pm-box"><h2>시즌 기간 <small>월-일 · 해를 넘겨도 돼요 (예: 11-17 ~ 01-05)</small></h2>' + c.seasons.map(function(s, i){
        var ok = num(s.from) > 0 && num(s.to) > 0;
        return '<div class="ss-row">' +
          '<div class="ss-name"><b>' + esc(s.name) + '</b><small>' + esc(s.id) + (act && act.id === s.id ? ' · <em>지금 켜짐</em>' : '') + '</small></div>' +
          '<label class="ad-f"><span>시작</span><input data-s="' + i + ':from" value="' + esc(s.from) + '" placeholder="12-01" inputmode="numeric" maxlength="5"></label>' +
          '<label class="ad-f"><span>끝</span><input data-s="' + i + ':to" value="' + esc(s.to) + '" placeholder="01-05" inputmode="numeric" maxlength="5"></label>' +
          '<label class="ss-chk"><input type="checkbox" data-s="' + i + ':on"' + (s.on !== false ? ' checked' : '') + '><span>자동 사용</span></label>' +
          '<label class="ss-chk"><input type="checkbox" data-s="' + i + ':favicon"' + (s.favicon ? ' checked' : '') + '><span>파비콘도 바꾸기</span></label>' +
          (ok ? '' : '<p class="ss-err">날짜는 12-01 처럼 월-일 로 적어 주세요</p>') +
          '</div>';
      }).join('') + '</div>' +
      '<div class="pm-box"><h2>미리보기 <small>내 브라우저 탭에서만 바뀌어요 · 다른 사람에겐 영향 없어요</small></h2><div class="ss-prev">' +
        c.seasons.map(function(s){ return '<a class="ad-btn" href="./?season=' + encodeURIComponent(s.id) + '" target="_blank" rel="noopener">' + esc(s.name) + ' 보기 ↗</a>'; }).join('') +
        '<a class="ad-btn" href="./?season=off" target="_blank" rel="noopener">기본 테마 보기 ↗</a><a class="ad-btn" href="./?season=auto" target="_blank" rel="noopener">원래대로 ↗</a></div></div>';
    $('#ssFoot').hidden = false;
  }

  function load(){
    root.innerHTML = '<p class="ad-empty">불러오는 중…</p>';
    A().raw(PATH).then(function(t){ S.conf = parse(t); setDirty(false); render(); })
      .catch(function(e){ root.innerHTML = '<p class="ad-empty">설정 파일을 못 불러왔어요 (' + esc(e && e.message || e) + ')<br>assets/js/season-config.js 가 저장소에 있는지 확인해 주세요.</p>'; });
  }
  function save(){
    if (S.busy || !S.conf) return;
    var bad = S.conf.seasons.some(function(s){ return num(s.from) < 0 || num(s.to) < 0; });
    if (bad){ A().toast('날짜 형식을 확인해 주세요 (예: 12-01)'); return; }
    S.busy = true; $('#ssSave').disabled = true; $('#ssState').textContent = '저장 중…';
    S.conf.v = (S.conf.v || 1) + 1;   /* 캐시 새로고침용 번호 */
    A().commit([{ path: PATH, b64: b64(build(S.conf)) }], '시즌 테마 설정 변경 (Syringe 관리)').then(function(){
      setDirty(false); A().toast('저장했어요 · 1~2분 뒤 사이트에 반영돼요'); render();
    }).catch(function(e){ S.conf.v--; $('#ssState').textContent = '저장 실패'; A().toast('저장 실패 : ' + (e && e.message || e)); })
      .then(function(){ S.busy = false; $('#ssSave').disabled = false; });
  }

  function init(){
    root = $('#ssRoot'); if (!root) return;
    root.addEventListener('change', function(e){
      var t = e.target;
      if (t.name === 'ssMode'){ S.conf.mode = t.value; setDirty(true); render(); return; }
      var k = t.getAttribute('data-s'); if (!k) return; k = k.split(':');
      var s = S.conf.seasons[+k[0]];
      if (k[1] === 'on' || k[1] === 'favicon') s[k[1]] = t.checked;
      else { var v = t.value.trim().replace(/[./\s]+/g, '-'); var m = v.match(/^(\d{1,2})-(\d{1,2})$/); s[k[1]] = m ? pad(+m[1]) + '-' + pad(+m[2]) : v; }
      setDirty(true); render();
    });
    $('#ssSave').addEventListener('click', save);
  }
  window.SY_SEASON_ADMIN = { enter: function(){ if (!root) init(); load(); }, dirty: function(){ return S.dirty; } };
  function boot(){ if (!root) init(); if (location.hash === '#season' && D.body.getAttribute('data-view') === 'vSeason' && !S.conf) load(); }   /* #season 으로 바로 들어왔을 때 */
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
