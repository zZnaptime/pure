/* 시즌 테마 스위치 — season-config.js 를 보고 오늘 켤 시즌을 골라요
   · 켜지면 <html> 에 season-<id> 클래스 + season-<id>.css / season-<id>.js 를 불러와요
   · 미리보기 : 주소 끝에 ?season=winter (그 시즌 켜기) · ?season=off (끄기) · ?season=auto (원래대로)
     → 그 탭에서만 기억돼요 (다른 사람에겐 영향 없음)
   · index.html <head> 에서 season-config.js 바로 다음에 불러야 깜빡임 없이 적용돼요 */
(function(){
  var C = window.SY_SEASON_CONF || {}, D = document, de = D.documentElement;
  var list = Array.isArray(C.seasons) ? C.seasons : [];
  function num(s){ var m = String(s || '').match(/(\d{1,2})\D+(\d{1,2})/); return m ? (+m[1]) * 100 + (+m[2]) : -1; }
  function inRange(s, t){ var a = num(s.from), b = num(s.to); if (a < 0 || b < 0) return false; return a <= b ? (t >= a && t <= b) : (t >= a || t <= b); }
  function find(id){ for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  var mode = C.mode || 'auto';
  try {
    var q = new URLSearchParams(location.search).get('season');
    if (q !== null){ if (q === 'auto' || q === '') sessionStorage.removeItem('sy-season'); else sessionStorage.setItem('sy-season', q); }
    var keep = sessionStorage.getItem('sy-season'); if (keep) mode = keep;
  } catch (e) {}

  var s = null;
  if (mode === 'auto'){ var d = new Date(), t = (d.getMonth() + 1) * 100 + d.getDate(); for (var i = 0; i < list.length; i++) if (list[i].on !== false && inRange(list[i], t)){ s = list[i]; break; } }
  else if (mode !== 'off') s = find(mode);

  window.SY_SEASON = s ? s.id : '';
  if (!s || !/^[a-z0-9-]+$/.test(s.id)) return;

  var v = C.v ? '?v=' + C.v : '';
  de.classList.add('season-' + s.id);
  D.write('<link rel="stylesheet" href="assets/css/season-' + s.id + '.css' + v + '">');
  var js = D.createElement('script'); js.src = 'assets/js/season-' + s.id + '.js' + v; js.async = false; D.head.appendChild(js);
  if (s.favicon){ var ic = D.querySelector('link[rel="icon"]'); if (ic) ic.href = 'assets/images/favicon-' + s.id + '.svg'; }
})();
