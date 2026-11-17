/* SEASON · WINTER — 겨울 장식을 붙여요 (season.js 가 기간에 맞춰 불러와요)
   · 홈 포스터 : 레이스 눈 · 내리는 눈 · 눈 결정 · 다이얼 꾸밈 · 크리스마스 카운트다운
   · 앱 패널 : 은색 가랜드 줄 (앱은 css 로 오너먼트가 돼요)
   · 입장화면 : 내리는 눈 · 하프톤 · 눈 결정 · 별 도형
   · 흐르는 띠 문구 · 클릭 효과(눈 결정)
   · 이 파일은 시즌일 때만 불러와져요. 문구는 아래 RIBBON 에서 바꿀 수 있어요 */
(function(){
  'use strict';
  var D = document;
  var RIBBON = '✦ MERRY CHRISTMAS ✦ HAPPY NEW YEAR {Y} ✦ ARCH MEDICAL CENTER · WINTER WARD ✦ PURE × UXI ✦ RUNNING AWAY IS NOT ALLOWED ';
  window.SY_SEASON_FX = 'snow';            /* fx.js : 클릭하면 눈 결정 */

  var NS = 'http://www.w3.org/2000/svg';
  var FLAKE = 'M20 3v34M5 11.5l30 17M5 28.5l30-17M20 9l-4-4M20 9l4-4M20 31l-4 4M20 31l4 4';
  var SPARK = 'M0 -6l1.4 4.6L6 0l-4.6 1.4L0 6l-1.4-4.6L-6 0l4.6-1.4z';
  function $(s, r){ return (r || D).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function div(cls, html){ var e = D.createElement('div'); e.className = cls; e.setAttribute('aria-hidden', 'true'); if (html) e.innerHTML = html; return e; }
  function svg(cls, vb, inner){ return '<svg class="' + cls + '" viewBox="' + vb + '" aria-hidden="true">' + inner + '</svg>'; }
  function starPath(n, r1, r2){ var s = ''; for (var i = 0; i < n * 2; i++){ var a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; s += (i ? 'L' : 'M') + (100 + Math.cos(a) * r).toFixed(1) + ' ' + (100 + Math.sin(a) * r).toFixed(1); } return s + 'Z'; }

  var seed = 7; function rnd(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function snow(host, n, maxR){
    var h = '';
    for (var i = 0; i < n; i++){
      var r = (1.6 + rnd() * (maxR || 3.6)).toFixed(1);
      h += '<i style="left:' + (rnd() * 100).toFixed(1) + '%;width:' + r + 'px;height:' + r + 'px;opacity:' + (.5 + rnd() * .5).toFixed(2) + ';animation-duration:' + (7 + rnd() * 8).toFixed(1) + 's;animation-delay:' + (-rnd() * 14).toFixed(1) + 's"></i>';
    }
    host.appendChild(div('sw-snow', h));
  }

  /* 크리스마스 · 새해 카운트다운 */
  function countdown(){
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    var day = function(Y, M, Dd){ return Math.round((new Date(Y, M - 1, Dd) - now) / 864e5); };
    if (m === 12 && d < 25) return ['CHRISTMAS IN', 'D-' + day(y, 12, 25)];
    if (m === 12 && d === 25) return ['MERRY', 'CHRISTMAS'];
    if (m === 12) return ['NEW YEAR IN', 'D-' + day(y + 1, 1, 1)];
    if (m === 1 && d <= 7) return ['HAPPY NEW YEAR', String(y)];
    return ['CHRISTMAS IN', 'D-' + day(m >= 12 ? y : y, 12, 25)];
  }
  function year(){ var n = new Date(); return n.getMonth() === 0 ? n.getFullYear() : n.getFullYear() + 1; }

  function home(){
    var p = $('#sy-home .hp-poster');
    if (!p || p.querySelector('.sw-lace')) return;
    p.insertBefore(div('sw-lace'), p.firstChild);
    snow(p, 46, 3.6);
    [[6, 18, 30], [22, 30, 20], [40, 14, 16], [58, 40, 18], [76, 62, 26], [12, 58, 22]].forEach(function(c, i){
      p.insertAdjacentHTML('beforeend', '<svg class="sw-crys" viewBox="0 0 40 40" aria-hidden="true" style="left:' + c[0] + '%;top:' + c[1] + '%;width:' + c[2] + 'px;height:' + c[2] + 'px;animation-duration:' + (14 + i * 3) + 's"><path d="' + FLAKE + '"/></svg>');
    });
    var dial = $('.hp-dial', p);
    if (dial){
      dial.insertBefore(div('sw-dial-ht'), dial.firstChild);
      dial.insertAdjacentHTML('afterbegin', svg('sw-dial-ring', '-100 -100 200 200', '<circle r="98"/><path transform="translate(0 -98)" d="' + SPARK + '"/><path transform="translate(84 50) scale(.7)" d="' + SPARK + '"/><path transform="translate(-88 42) scale(.55)" d="' + SPARK + '"/>'));
      var cd = countdown(), x = div('sw-xmas', svg('', '0 0 40 40', '<path d="' + FLAKE + '"/>') + '<small>' + cd[0] + '</small><b>' + cd[1] + '</b>');
      p.appendChild(x);
    }
    var apps = $('#sy-home .hp-apps');
    if (apps && !apps.querySelector('.sw-garland')) apps.insertAdjacentHTML('afterbegin', '<svg class="sw-garland" viewBox="0 0 800 26" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4Q200 30 400 12T800 4"/></svg>');
  }

  function boot(){
    var b = $('#syBoot'); if (!b) return;
    var panel = $('.bt-panel', b), sc = $('.bt-scope', b);
    if (panel && !panel.querySelector('.sw-snow')) snow(panel, 40, 3.4);
    if (sc && !sc.querySelector('.sw-comp')){
      var cross = 'M8 2h4v6h6v4h-6v6H8v-6H2V8h6z', st = 'M10 0l2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z';
      var mk = [[-6, 8, 5, cross], [96, 18, 3.4, st], [100, 86, 4, cross], [-8, 44, 3, st], [70, -6, 2.6, cross], [46, 104, 3.6, st]].map(function(m){
        return '<svg class="sw-mk" viewBox="0 0 20 20" aria-hidden="true" style="left:' + m[0] + '%;top:' + m[1] + '%;width:' + m[2] + '%;height:' + m[2] + '%"><path d="' + m[3] + '"/></svg>';
      }).join('');
      var comp = div('sw-comp',
        '<i class="sw-ht"></i>' +
        svg('sw-flake', '0 0 200 200', '<path d="M100 10v180M22 55l156 90M22 145l156-90M100 40l-16-16M100 40l16-16M100 160l-16 16M100 160l16 16M48 70l-22 4M48 70l-6-22M152 130l22-4M152 130l6 22M48 130l-6 22M48 130l-22-4M152 70l6-22M152 70l22 4M100 75l21 12v26l-21 12-21-12V87z"/>') +
        svg('sw-star4', '0 0 200 200', '<defs><pattern id="swHt" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.5" fill="#fff" fill-opacity=".75"/></pattern></defs><path d="M100 0C108 62 138 92 200 100C138 108 108 138 100 200C92 138 62 108 0 100C62 92 92 62 100 0Z" fill="#8FDCFB"/><path d="M100 0C108 62 138 92 200 100C138 108 108 138 100 200C92 138 62 108 0 100C62 92 92 62 100 0Z" fill="url(#swHt)"/>') +
        svg('sw-oct', '0 0 200 200', '<path d="' + starPath(8, 98, 70) + '" fill="#fff" fill-opacity=".95"/>') +
        svg('sw-hept', '0 0 200 200', '<path d="' + starPath(7, 90, 52) + '"/>') + mk);
      sc.insertBefore(comp, sc.firstChild);
    }
  }

  function ribbons(){
    var t = RIBBON.replace('{Y}', year());
    $$('.hp-ribbon span, .boot .bt-ribbon span').forEach(function(s){ if (s.getAttribute('data-sw')) return; s.setAttribute('data-sw', '1'); s.textContent = t + t + ' '; });
  }

  function run(){ try { home(); boot(); ribbons(); } catch (e) { if (window.console) console.warn('[season-winter]', e); } }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', run); else run();
})();
