/* SEASON · SUMMER — 여름 장식을 붙여요 (season.js 가 기간에 맞춰 불러와요)
   · 홈 포스터 : 위쪽 물결 띠 · 올라오는 탄산 · 얼음 · 라임 · 병뚜껑 다이얼 · 여름 날짜
   · 앱 패널 : 아래쪽이 물 · 아이콘은 가만히, 가끔 기포만 뽀글
   · 입장화면 : 소다 주사기(기포) · 하프톤 해 · 햇살 별 · 라임 · 얼음 · 탄산
   · 흐르는 띠 문구 · 클릭 효과(해)
   · 이 파일은 시즌일 때만 불러와져요. 문구는 아래 RIBBON / CHIP 에서 바꿀 수 있어요 */
(function(){
  'use strict';
  var D = document;
  var RIBBON = '✦ HELLO SUMMER ✦ STAY HYDRATED ✦ ARCH MEDICAL CENTER · SUMMER WARD ✦ PURE × UXI ✦ RUNNING AWAY IS NOT ALLOWED ';
  var CHIP = 'LIME SODA ✦ SERVE COLD';
  window.SY_SEASON_FX = 'sun';             /* fx.js : 클릭하면 해 */

  function $(s, r){ return (r || D).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function div(cls, html){ var e = D.createElement('div'); e.className = cls; e.setAttribute('aria-hidden', 'true'); if (html) e.innerHTML = html; return e; }
  function star(n, r1, r2, c){ c = c || 0; var s = ''; for (var i = 0; i < n * 2; i++){ var a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; s += (i ? 'L' : 'M') + (c + Math.cos(a) * r).toFixed(1) + ' ' + (c + Math.sin(a) * r).toFixed(1); } return s + 'Z'; }
  var seed = 11; function rnd(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  var LIME = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#8FCF3A"/><circle cx="50" cy="50" r="40" fill="#EEFBCB"/><g fill="#C2EC6A"><path d="M50 50L50 14A36 36 0 0 1 75 24Z"/><path d="M50 50L79 29A36 36 0 0 1 86 55Z"/><path d="M50 50L85 60A36 36 0 0 1 72 81Z"/><path d="M50 50L67 84A36 36 0 0 1 40 85Z"/><path d="M50 50L35 83A36 36 0 0 1 17 64Z"/><path d="M50 50L15 59A36 36 0 0 1 17 33Z"/><path d="M50 50L20 28A36 36 0 0 1 45 14Z"/></g><circle cx="50" cy="50" r="5" fill="#EEFBCB"/></svg>';

  /* 올라오는 탄산 */
  function fizz(host, n, maxR){
    var h = '';
    for (var i = 0; i < n; i++){
      var r = (2 + rnd() * (maxR || 5)).toFixed(1);
      h += '<i style="left:' + (rnd() * 100).toFixed(1) + '%;width:' + r + 'px;height:' + r + 'px;animation-duration:' + (5 + rnd() * 6).toFixed(1) + 's;animation-delay:' + (-rnd() * 11).toFixed(1) + 's"></i>';
    }
    host.appendChild(div('ss-fizz', h));
  }
  function ice(host, list){
    list.forEach(function(c, i){ var e = div('ss-ice i' + i); e.style.cssText = 'left:' + c[0] + '%;top:' + c[1] + '%;width:' + c[2] + 'px;height:' + c[2] + 'px;--r:' + c[3] + 'deg;animation-duration:' + (3 + i * .5) + 's'; host.appendChild(e); });
  }

  /* 여름 병동 며칠째 (시즌 시작일부터) */
  function summerDay(){
    var conf = window.SY_SEASON_CONF || {}, s = (conf.seasons || []).filter(function(x){ return x.id === 'summer'; })[0];
    var m = String(s && s.from || '07-01').match(/^(\d{1,2})-(\d{1,2})$/), now = new Date(); now.setHours(0, 0, 0, 0);
    var st = new Date(now.getFullYear(), m ? +m[1] - 1 : 6, m ? +m[2] : 1);
    if (st > now) st.setFullYear(st.getFullYear() - 1);
    return Math.round((now - st) / 864e5) + 1;
  }

  function home(){
    var p = $('#sy-home .hp-poster');
    if (!p || p.querySelector('.ss-wave')) return;
    p.insertBefore(div('ss-wave', '<i class="b"></i><i class="f"></i>'), p.firstChild);
    fizz(p, 60, 5);
    ice(p, [[7, 16, 64, -14], [18, 10, 42, 18], [84, 46, 54, 8], [92, 18, 38, -22], [24, 58, 34, 12]]);
    var lm = div('ss-lime', LIME); p.appendChild(lm);
    var dial = $('.hp-dial', p);
    if (dial) dial.insertAdjacentHTML('afterbegin', '<svg class="ss-crown" viewBox="-100 -100 200 200" aria-hidden="true"><path d="' + star(21, 96, 88) + '"/></svg>');
    var x = div('ss-day', '<svg viewBox="-20 -20 40 40"><path d="' + star(8, 19, 10) + '"/></svg><small>SUMMER WARD</small><b>DAY ' + summerDay() + '</b>');
    p.appendChild(x);
    var pair = $('.hp-pair', p);
    if (pair && !pair.querySelector('.ss-chip')){ var c = D.createElement('span'); c.className = 'ss-chip'; c.textContent = CHIP; pair.appendChild(c); }

    var apps = $('#sy-home .hp-apps');
    if (apps && !apps.querySelector('.ss-water')){
      apps.insertBefore(div('ss-water', '<i></i>'), apps.firstChild);
      $$('.dico .ic', apps).forEach(function(ic, i){
        [0, 1].forEach(function(k){
          if ((i + k) % 3 === 0) return;      /* 몇 개만 */
          var b = D.createElement('i'), r = 4 + ((i + k) % 3) * 1.5, dur = 3.4 + ((i * 7 + k * 3) % 5) * .6;
          b.className = 'ss-bub'; b.setAttribute('aria-hidden', 'true');
          b.style.cssText = 'left:' + (26 + ((i * 11 + k * 17) % 46)) + '%;width:' + r + 'px;height:' + r + 'px;animation-duration:' + dur.toFixed(1) + 's;animation-delay:' + (-((i * 1.7 + k * 2.3) % dur)).toFixed(1) + 's';
          ic.appendChild(b);
        });
      });
    }
  }

  function boot(){
    var b = $('#syBoot'); if (!b) return;
    var panel = $('.bt-panel', b), sc = $('.bt-scope', b);
    if (panel && !panel.querySelector('.ss-fizz')) fizz(panel, 50, 5);
    if (sc && !sc.querySelector('.ss-comp')){
      sc.insertBefore(div('ss-comp',
        '<i class="ss-ht"></i>' +
        '<svg class="ss-bigsun" viewBox="0 0 200 200" aria-hidden="true"><defs><pattern id="ssHt" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.5" fill="#fff" fill-opacity=".75"/></pattern></defs><path d="' + star(12, 98, 62, 100) + '" fill="#8FDCFB"/><path d="' + star(12, 98, 62, 100) + '" fill="url(#ssHt)"/><circle cx="100" cy="100" r="40" fill="#fff" fill-opacity=".9"/></svg>' +
        '<span class="ss-blime">' + LIME + '</span><i class="ss-bice"></i>' +
        [[-6, 8, 4.4, 'c'], [96, 18, 3.2, 's'], [100, 80, 3.6, 'c'], [-8, 46, 2.8, 's'], [62, -6, 2.6, 'c'], [44, 104, 3.4, 's']].map(function(m){
          var d = m[3] === 'c' ? 'M8 2h4v6h6v4h-6v6H8v-6H2V8h6z' : 'M10 0l2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z';
          return '<svg class="ss-mk" viewBox="0 0 20 20" aria-hidden="true" style="left:' + m[0] + '%;top:' + m[1] + '%;width:' + m[2] + '%;height:' + m[2] + '%"><path d="' + d + '"/></svg>';
        }).join('')), sc.firstChild);
    }
    /* 주사기 약 → 소다 : 점무늬 대신 올라가는 기포 */
    var svg = $('.ix-syr', b), dots = $('#ixLiqD', b);
    if (svg && dots && !$('#ssBubP', svg)){
      var defs = $('defs', svg);
      defs.insertAdjacentHTML('beforeend', '<pattern id="ssBubP" width="44" height="66" patternUnits="userSpaceOnUse"><g fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="1.6"><circle cx="8" cy="54" r="4"/><circle cx="26" cy="38" r="2.6"/><circle cx="36" cy="58" r="3.2"/><circle cx="16" cy="18" r="3"/><circle cx="34" cy="10" r="2"/></g><animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 -66" dur="3s" repeatCount="indefinite"/></pattern>');
      dots.setAttribute('fill', 'url(#ssBubP)'); dots.removeAttribute('mask'); dots.setAttribute('opacity', '1');
    }
  }

  function ribbons(){
    var t = RIBBON;
    $$('.hp-ribbon span, .boot .bt-ribbon span').forEach(function(s){ if (s.getAttribute('data-ss')) return; s.setAttribute('data-ss', '1'); s.textContent = t + t + ' '; });
  }

  function run(){ try { home(); boot(); ribbons(); } catch (e) { if (window.console) console.warn('[season-summer]', e); } }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', run); else run();
})();
