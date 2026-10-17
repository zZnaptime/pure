/* ══════════════════════════════════════════════════════════════
   SYRINGE — 페어 프로필 (PURE 밝은 단말기 / UXI 어두운 단말기)

   ✎ 프로필 문서는 profiles 폴더의 html 파일이에요.
     - 문서를 더 넣고 싶으면 html 파일을 profiles 폴더에 올리고
       아래 docs 에 { title: '탭 이름', src: 'profiles/파일이름.html' } 를 추가하면 돼요.
     - html 은 단말기 화면 안(iframe)에 그대로 보여서, 그 파일의 스타일이 사이트를 망가뜨리지 않아요.
══════════════════════════════════════════════════════════════ */
window.SY_PROFILES = window.SY_PROFILES || [
  {
    id: 'pure', name: 'PURE', sub: 'A-CLASS GUIDE', theme: 'light', avatar: 'pure', code: 'P-1103',
    docs: [
      { title: 'PROFILE', src: 'profiles/pure.html' },
      { title: 'GALLERY', src: 'profiles/pure-gallery.html' }
    ],
    /* ♪ 테마송 : 노래 글 파일 이름을 post 에 적으면 탭 옆에 버튼이 생겨요. 비우면 숨김 */
    songs: [
      { title: 'BGM', post: '2026-10-17-110734' },
      { title: 'CHARACTER SONG', post: '2026-10-17-111906' }
    ]
  },
  {
    id: 'uxi', name: 'UXI', sub: 'S-CLASS SENTINEL', theme: 'dark', avatar: 'uxi', code: 'U-0424',
    docs: [
      { title: 'PROFILE', src: 'profiles/uxi.html' },
      { title: 'GALLERY', src: 'profiles/uxi-gallery.html' }
    ],
    /* ♪ 테마송 : 노래 글 파일 이름을 post 에 적으면 탭 옆에 버튼이 생겨요. 비우면 숨김 */
    songs: [
      { title: 'BGM', post: '2026-10-17-110936' },
      { title: 'CHARACTER SONG', post: '2026-10-17-112806' }
    ]
  }
];

(function(){
  'use strict';
  var D = document;
  function $(s, r){ return (r || D).querySelector(s); }
  function esc(t){ var d = D.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  function pad(n){ return (n < 10 ? '0' : '') + n; }

  function init(){
    var w = $('#w-profile'), P = window.SY_PROFILES || [];
    if (!w || !P.length) return;
    var dev = $('#pfDev', w), who = $('#pfWho', w), tabs = $('#pfTabs', w), frame = $('#pfFrame', w),
        docLab = $('#pfDoc', w), code = $('#pfCode', w), ext = $('#pfExt', w), boot = $('#pfBoot', w);
    var cur = 0, doc = 0, KEY = 'sy-profile-last';
    var songs = D.createElement('div'); songs.className = 'pf-songs'; songs.hidden = true; tabs.parentNode.insertBefore(songs, ext);
    try { var last = JSON.parse(localStorage.getItem(KEY)); if (last){ cur = Math.min(P.length - 1, last.p || 0); doc = last.d || 0; } } catch(e){}

    who.innerHTML = P.map(function(p, i){
      return '<button type="button" data-i="' + i + '"><i class="k-pf p-' + esc(p.avatar || p.id) + '"></i><span><b>' + esc(p.name) + '</b><small>' + esc(p.sub || '') + '</small></span></button>';
    }).join('');

    function show(pi, di, quiet){
      cur = pi; var p = P[cur]; doc = Math.max(0, Math.min((p.docs || []).length - 1, di || 0));
      dev.setAttribute('data-theme', p.theme === 'dark' ? 'dark' : 'light');
      Array.prototype.forEach.call(who.children, function(b, i){ b.classList.toggle('on', i === cur); });
      tabs.innerHTML = (p.docs || []).map(function(d, i){
        return '<button type="button" data-d="' + i + '"' + (i === doc ? ' class="on"' : '') + '><em>' + pad(i + 1) + '</em>' + esc(d.title || 'FILE') + '</button>';
      }).join('');
      var sg = (p.songs || []).filter(function(x){ return x && x.post; });
      songs.innerHTML = sg.map(function(x){ return '<button type="button" class="pf-song" data-post="' + esc(x.post) + '" title="노래 글 열기"><i>♪</i>' + esc(x.title || 'THEME') + '</button>'; }).join('');
      songs.hidden = !sg.length;
      var d = (p.docs || [])[doc];
      code.textContent = p.code || p.name;
      docLab.textContent = 'FILE ' + pad(doc + 1) + ' / ' + pad((p.docs || []).length);
      if (d){
        if (!quiet){ boot.classList.remove('run'); void boot.offsetWidth; boot.classList.add('run'); }
        if (frame.getAttribute('src') !== d.src) frame.setAttribute('src', d.src);
        ext.href = d.src; ext.hidden = false;
      } else { frame.removeAttribute('src'); ext.hidden = true; }
      try { localStorage.setItem(KEY, JSON.stringify({ p: cur, d: doc })); } catch(e){}
    }
    who.addEventListener('click', function(e){ var b = e.target.closest('button[data-i]'); if (b) show(+b.getAttribute('data-i'), 0); });
    tabs.addEventListener('click', function(e){ var b = e.target.closest('button[data-d]'); if (b) show(cur, +b.getAttribute('data-d')); });
    
    /* 문서(iframe) 안 스크롤바를 단말기 색에 맞춰 넣어 줌 (PURE 화이트 / UXI 블랙) */
    var SB = {
      light: { th: '#B9D3E6', hv: '#2FA4DE', tr: '#EEF5FA' },
      dark:  { th: '#2A4258', hv: '#5BB8F0', tr: '#0B1724' }
    };
    function paint(){
      try {
        var d = frame.contentDocument; if (!d || !d.documentElement) return;
        var c = SB[dev.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'];
        var s = d.getElementById('sy-sb') || d.createElement('style'); s.id = 'sy-sb';
        s.textContent = 'html,body,*{scrollbar-width:thin !important;scrollbar-color:' + c.th + ' ' + c.tr + ' !important}' +
          '::-webkit-scrollbar{width:8px !important;height:8px !important}::-webkit-scrollbar-track{background:' + c.tr + ' !important}' +
          '::-webkit-scrollbar-thumb{background:' + c.th + ' !important;border-radius:8px;border:2px solid ' + c.tr + '}' +
          '::-webkit-scrollbar-thumb:hover{background:' + c.hv + ' !important}::-webkit-scrollbar-button{display:none !important}';
        (d.head || d.documentElement).appendChild(s);
      } catch(e){}
    }
    frame.addEventListener('load', paint);
    setInterval(function(){ if (w.classList.contains('open')) paint(); }, 1500);
    
    /* 창을 처음 열 때 문서 불러오기 (홈 로딩을 가볍게) */
    var loaded = false;
    function maybeLoad(){ if (!loaded && w.classList.contains('open')){ loaded = true; show(cur, doc); } }
    new MutationObserver(maybeLoad).observe(w, { attributes: true, attributeFilter: ['class'] });
    maybeLoad();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 0); }); else setTimeout(init, 0);
})();
