/* ══════════════════════════════════════════════════════════════
   SYRINGE — 사이트 스크립트 (화면 설정 / 글 목록·글 보기 / 창 관리 / 시계)
   settings.json 과 posts/posts.json 을 불러온 다음 시작해요.
══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   SYRINGE — 스크립트
   (스킨 설정값 / 카드 정리 / 창 관리 / 플레이어 / 시계)
══════════════════════════════════════════════════════════════ */
window.SY_MAIN = function (SET, POSTS) {
  'use strict';
  var D = document, body = D.body;
  SET = SET || {}; POSTS = POSTS || [];
  var BLOG = './';
  var Q = new URLSearchParams(location.search), ROUTE = window.SY_ROUTE || 'home', CAT = Q.get('c') || '', SLUG = Q.get('p') || '';
  function sv(k, d){ var v = SET[k]; return (v === undefined || v === null || v === '') ? d : v; }
  /* '/assets/..' 처럼 / 로 시작하는 주소를 저장소 기준 상대 주소로 (github.io/저장소이름/ 에서도 깨지지 않게) */
  function rel(u){ u = String(u || '').trim(); return (u.charAt(0) === '/' && u.charAt(1) !== '/') ? u.slice(1) : u; }
  var isHome = body.id === 'tt-body-index';
  var mqDesk = window.matchMedia('(min-width:861px) and (min-height:600px)');
  function isDesk(){ return mqDesk.matches; }
  function $(s, r){ return (r || D).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); }

  var store = {
    get: function(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
    set: function(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
    del: function(k){ try { localStorage.removeItem(k); } catch(e){} }
  };
  function cleanTitle(s){
    return (s || '').replace(/\[OPEN\]/gi,'').replace(/\[CLOSE\]/gi,'')
      .replace(/\[PRICE[:\s]*[0-9,]+\]/gi,'').replace(/\[SUB:[^\]]+\]/gi,'').trim();
  }
  function pad(n, l){ n = String(n); while (n.length < l) n = '0' + n; return n; }

  /* ── 스킨 설정값 ── */
  var newDays = parseInt(sv('newDays', 3), 10) || 3;
  var thumbFallbackUrl = rel(sv('thumbFallback', ''));
  var showUncat = sv('showUncategorized', true) === false ? 'hide' : 'show';
  var priceLabel = sv('priceLabel', '금액');
  var xUrl = String(sv('xUrl', '')).trim();
  var sinceDate = String(sv('sinceDate', '2026-04-24')).trim();
  var infoScope = sv('infoScope', 'home');
  var ddayImage = rel(sv('ddayImage', ''));
  (function(){
    var pi = rel(sv('pureImg', '')), ui = rel(sv('uxiImg', '')), rs = D.documentElement.style;
    if (pi) rs.setProperty('--img-pure', "url('" + pi.replace(/'/g, '%27') + "')");
    if (ui) rs.setProperty('--img-uxi', "url('" + ui.replace(/'/g, '%27') + "')");
  })();
  var infoTitle = sv('infoTitle', '안내사항');
  var infoUrls = (SET.info || []).filter(Boolean);

  /* ════════ 시계 / 날짜 / D+ / ECG ════════ */
  var MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  function tick(){
    var d = new Date();
    var c = $('#syClock'); if (c) c.textContent = MON[d.getMonth()] + ' ' + pad(d.getDate(),2) + ' · ' + pad(d.getHours(),2) + ':' + pad(d.getMinutes(),2);
  }
  tick(); setInterval(tick, 15000);
  (function(){
    var d = new Date();
    $$('.sy-aegis').forEach(function(el){ el.textContent = MON[d.getMonth()] + ' ' + pad(d.getDate(),2) + ', ' + d.getFullYear(); });
    var t = new Date(); t.setHours(0,0,0,0);
    var s = new Date(sinceDate.replace(/-/g,'/')); s.setHours(0,0,0,0);
    if (!isNaN(s)) $$('.sy-dday').forEach(function(el){ el.textContent = 'D+' + (Math.round((t - s) / 864e5) + 1); });
    if (!isNaN(s)){
      var dn = Math.round((t - s) / 864e5) + 1, today = dn > 0 && dn % 100 === 0;
      var nx = Math.max(100, Math.ceil(dn / 100) * 100);
      var hn = $('#hpNext');
      if (hn){
        hn.textContent = today ? '♥ TODAY · D+' + dn : 'NEXT D+' + nx;
        hn.classList.toggle('is-today', today);
      }
      var ha = $('#hpArc'); if (ha) setTimeout(function(){ ha.style.strokeDasharray = (today ? 100 : Math.max(1, 100 - (nx - dn))).toFixed(1) + ' 100'; }, 200);
    }
    var hc = $('#hpCount'); if (hc) setTimeout(function(){ hc.textContent = $$('#syIcons .dico').filter(function(x){ return !x.hidden; }).length; }, 600);
    var p = 'M0 12';
    for (var i = 0; i < 4; i++){ var o = i * 150; p += ' H'+(o+38)+' L'+(o+44)+' 12 L'+(o+48)+' 4 L'+(o+54)+' 21 L'+(o+60)+' 2 L'+(o+66)+' 14 L'+(o+70)+' 12 H'+(o+110)+' L'+(o+114)+' 9 L'+(o+118)+' 12 H'+(o+150); }
    $$('svg.ecg').forEach(function(svg){ svg.innerHTML = '<path class="base" d="'+p+'"/><path d="'+p+'"/>'; });
    var k = $('#kakao-today-date');
    if (k){ var w = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']; k.textContent = d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 '+w[d.getDay()]; }
  })();

  /* ════════ NEW 판단 ════════ */
  function isNewPost(dateText){
    var m = (dateText || '').replace(/\s/g,'').match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})\.?/);
    if (!m) return false;
    var pd = new Date(+m[1], +m[2]-1, +m[3]); var today = new Date(); today.setHours(0,0,0,0);
    var diff = (today - pd) / 864e5;
    return diff >= 0 && diff < newDays;
  }

  /* ════════ 본문 인라인 색 정리 ════════ */
  var themeTextRgb = ['rgb(0,0,0)','rgb(26,26,26)','rgb(74,74,74)','rgb(44,40,37)','rgb(51,51,51)','rgb(68,68,68)','rgb(85,85,85)','rgb(102,102,102)'];
  function fixInlineColors(root){
    if (!root) return;
    $$('[style]', root).forEach(function(el){
      var bg = el.style.backgroundColor, fg = el.style.color;
      if (bg && /^(#fff(fff)?|white|rgb\(255,255,255\))$/i.test(bg.replace(/\s/g,''))) el.style.backgroundColor = 'transparent';
      if (fg && themeTextRgb.indexOf(fg.replace(/\s/g,'').toLowerCase()) !== -1) el.style.color = '';
    });
  }
  function cleanTagsFromTitles(){
    $$('.related-title, .another_category th a, .another_category td a').forEach(function(el){
      var raw = el.textContent || '', c = cleanTitle(raw);
      if (c !== raw.trim()) el.textContent = c;
    });
  }

  /* ════════ 카드: 날짜행 + 링크복사 ════════ */
  var shareSvg = '<svg class="ico"><use href="#i-share"/></svg>';
  function addDateRow(card){
    var dateEl = card.querySelector('p.card-date'), cardBody = card.querySelector('.card-body');
    if (!dateEl || !cardBody) return;
    var row = D.createElement('div'); row.className = 'card-date-row';
    var sp = D.createElement('span'); sp.className = 'card-date'; sp.textContent = dateEl.textContent;
    var btn = D.createElement('button'); btn.type = 'button'; btn.className = 'card-link-btn'; btn.title = '링크 복사'; btn.setAttribute('aria-label','링크 복사'); btn.innerHTML = shareSvg;
    var href = card.getAttribute('href') || '';
    btn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      copyText(card.href || href);
    });
    row.appendChild(sp); row.appendChild(btn);
    dateEl.parentNode.replaceChild(row, dateEl);
  }
  function addFallbackThumb(card){
    var tw = card.querySelector('.card-thumb-wrap');
    if (thumbFallbackUrl && tw && !tw.querySelector('.card-thumb') && !tw.querySelector('.card-protected-overlay')){
      var img = D.createElement('img'); img.className = 'card-thumb'; img.src = thumbFallbackUrl; img.alt = ''; img.loading = 'lazy'; tw.appendChild(img);
    }
  }
  function cutSummary(card){
    var s = card.querySelector('.card-summary');
    if (s && !card.classList.contains('ds-protected-card')){ var raw = s.textContent || ''; s.textContent = raw.length > 40 ? raw.slice(0, 40) + '…' : raw; }
  }
  function badge(wrap, cls, txt){ var b = D.createElement('span'); b.className = 'commission-badge ' + cls; b.textContent = txt; wrap.appendChild(b); }

  function initCards(){
    $$('.ds-card:not(.is-ready)').forEach(function(card){
      card.classList.add('is-ready');
      var nameEl = card.querySelector('.card-name'); if (!nameEl) return;
      var tw = card.querySelector('.card-thumb-wrap'), cb = card.querySelector('.card-body'), summ = card.querySelector('.card-summary');
      addFallbackThumb(card); cutSummary(card);
      var raw = nameEl.textContent || '';
      var isOpen = /\[OPEN\]/i.test(raw), isClose = /\[CLOSE\]/i.test(raw);
      var pm = raw.match(/\[PRICE[:\s]*([0-9,]+)\]/i), price = pm ? pm[1] : '';
      var sm = raw.match(/\[SUB:([^\]]+)\]/i), sub = sm ? sm[1].trim() : '';
      nameEl.textContent = cleanTitle(raw);
      if (sub && summ) summ.textContent = sub;
      var de = card.querySelector('.card-date'), hasNew = de && isNewPost(de.textContent);
      if ((isOpen || isClose || hasNew) && tw){
        var bw = D.createElement('div'); bw.className = 'card-badge-wrap';
        if (isOpen) badge(bw, 'open', 'OPEN'); else if (isClose){ badge(bw, 'close', 'CLOSE'); card.classList.add('is-closed'); }
        if (hasNew) badge(bw, 'new-post', 'NEW');
        tw.appendChild(bw);
      }
      addDateRow(card);
      if (price && cb){
        var n = parseInt(price.replace(/,/g,''), 10);
        var pr = D.createElement('div'); pr.className = 'card-price-row';
        pr.innerHTML = '<span class="card-price-label"></span><span class="card-price-value has-point"></span>';
        pr.firstChild.textContent = priceLabel; pr.lastChild.textContent = n.toLocaleString('ko-KR') + '원';
        cb.appendChild(pr);
      }
    });
  }
  function initNoticeCards(){
    $$('.ds-notice-card:not(.is-ready)').forEach(function(card){
      card.classList.add('is-ready');
      var nameEl = card.querySelector('.card-name'); if (!nameEl) return;
      addFallbackThumb(card); cutSummary(card);
      nameEl.textContent = cleanTitle(nameEl.textContent);
      var de = card.querySelector('.card-date'), tw = card.querySelector('.card-thumb-wrap');
      if (de && isNewPost(de.textContent) && tw){ var bw = D.createElement('div'); bw.className = 'card-badge-wrap'; badge(bw, 'new-post', 'NEW'); tw.appendChild(bw); }
      addDateRow(card);
    });
  }
  function initProtectedCards(){ $$('.ds-protected-card').forEach(addDateRow); }

  function catLabel(text, count){
    var p = D.createElement('p'); p.className = 'category-label';
    var t = D.createElement('span'); t.className = 'cl-tab'; t.textContent = text;
    var c = D.createElement('span'); c.className = 'cl-n'; c.textContent = pad(count, 2) + ' FILES';
    p.appendChild(t); p.appendChild(c); return p;
  }
  function numberCards(grid){
    $$('.sheet-card', grid).forEach(function(card, i){
      var tw = card.querySelector('.card-thumb-wrap'); if (!tw || tw.querySelector('.card-no')) return;
      var n = D.createElement('span'); n.className = 'card-no'; n.textContent = 'No.' + pad(i + 1, 2); tw.appendChild(n);
    });
  }

  /* 레이아웃 전환 */
  window.setLayout = function(mode){
    $$('.card-grid').forEach(function(g){ g.classList.toggle('layout-list', mode === 'list'); });
    var bg = $('#btn-grid'), bl = $('#btn-layout-list');
    if (bg) bg.classList.toggle('active', mode !== 'list');
    if (bl) bl.classList.toggle('active', mode === 'list');
    try { localStorage.setItem('ds-layout', mode); } catch(e){}
  };

  /* 카드 수집 → 카테고리별 섹션 */
  function catOrder(){
    return $$('#catList li a').map(function(a){ return (a.textContent || '').replace(/\(\d+\)\s*$/,'').trim(); }).filter(Boolean);
  }
  var newCategories = {};
  function buildSections(){
    var container = $('#card-container'); if (!container) return;
    var cards = $$('.ds-card, .ds-protected-card'); if (!cards.length) return;
    var isHomePath = false;
    var all = {}, sections = {}, order = [];
    cards.forEach(function(card){
      var cat = (card.getAttribute('data-category') || '').trim();
      var unc = !cat || cat === '카테고리 없음'; var key = unc ? '__미분류__' : cat;
      all[key] = 1;
      if (unc && showUncat === 'hide' && isHomePath) return;
      if (!sections[key]){ sections[key] = []; order.push(key); }
      sections[key].push(card);
    });
    var co = catOrder();
    order.sort(function(a, b){
      if (a === '__미분류__') return 1; if (b === '__미분류__') return -1;
      var ia = co.indexOf(a), ib = co.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'ko');
      if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib;
    });
    var tb = D.createElement('div'); tb.className = 'list-toolbar';
    tb.innerHTML = '<div class="toolbar-right"><button type="button" class="layout-btn active" id="btn-grid" onclick="setLayout(\'grid\')" title="그리드" aria-label="그리드"><svg class="ico"><use href="#i-tile"/></svg></button><button type="button" class="layout-btn" id="btn-layout-list" onclick="setLayout(\'list\')" title="리스트" aria-label="리스트"><svg class="ico"><use href="#i-list"/></svg></button></div>';
    container.appendChild(tb);
    var isCatPage = ROUTE === 'list' && !!CAT;
    var isAllCat = ROUTE === 'list' && !CAT;
    var showLabel = (Object.keys(all).length > 1 || isCatPage) && !isAllCat;
    if (isAllCat){
      var g = D.createElement('div'); g.className = 'card-grid';
      var cnt = 0; order.forEach(function(k){ sections[k].forEach(function(c){ g.appendChild(c); cnt++; }); });
      container.appendChild(catLabel('분류 전체보기', cnt)); container.appendChild(g); numberCards(g);
    } else {
      order.forEach(function(k){
        if (showLabel) container.appendChild(catLabel(k === '__미분류__' ? '미분류' : k, sections[k].length));
        var g = D.createElement('div'); g.className = 'card-grid';
        sections[k].forEach(function(c){ g.appendChild(c); });
        container.appendChild(g); numberCards(g);
      });
    }
    $$('.ds-card-staging').forEach(function(el){ el.parentNode.removeChild(el); });
    initCards();
    $$('.ds-card').forEach(function(card){
      var de = card.querySelector('.card-date'), cat = (card.getAttribute('data-category') || '').trim();
      if (cat && de && isNewPost(de.textContent)) newCategories[cat] = 1;
    });
  }
  function buildNoticeSection(){
    var container = $('#notice-card-container'); if (!container) return;
    var cards = $$('.ds-notice-card');
    if (!cards.length){ container.parentNode && container.parentNode.removeChild(container); return; }
    var g = D.createElement('div'); g.className = 'card-grid';
    cards.forEach(function(c){ g.appendChild(c); });
    container.appendChild(catLabel('공지사항', cards.length)); container.appendChild(g); numberCards(g);
    $$('.ds-notice-staging').forEach(function(el){ el.parentNode && el.parentNode.removeChild(el); });
    initNoticeCards();
  }
  function buildProtectedSection(){
    $$('.ds-protected-staging').forEach(function(el){ el.parentNode && el.parentNode.removeChild(el); });
    var c = $('#protected-card-container'); if (c) c.parentNode && c.parentNode.removeChild(c);
    initProtectedCards();
  }

  /* 카테고리 창 NEW 뱃지 */
  /* 카테고리 창 NEW 점 — 앱 스크립트(SY_APPS.markNew)가 처리 */
  function applyNewToCat(){ if (window.SY_APPS && SY_APPS.markNew) SY_APPS.markNew(); }

  /* 돌아가기 */
  (function(){
    if (ROUTE !== 'post'){
      try { sessionStorage.setItem('ds-back-url', location.href); } catch(e){}
    }
  })();
  window.dsGoBack = function(){
    var s = null; try { s = sessionStorage.getItem('ds-back-url'); } catch(e){}
    location.href = s || BLOG;
  };
  window.dsGoBackNotice = function(){ location.href = './?notice'; };

  /* 링크 복사 + 토스트 */
  function toast(msg){
    var t = $('#ds-toast');
    if (!t){ t = D.createElement('div'); t.id = 'ds-toast'; body.appendChild(t); }
    t.innerHTML = '<i class="ts-ic" aria-hidden="true">✦</i><span class="ts-tx"></span><i class="ts-ok" aria-hidden="true">✓</i>';
    t.querySelector('.ts-tx').textContent = String(msg || '').replace(/\s*✦\s*$/, '');
    t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
    clearTimeout(window._syToast); window._syToast = setTimeout(function(){ t.classList.remove('on'); }, 1900);
  }
  function copyText(s){
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(function(){ toast('링크가 복사되었습니다 ✦'); }, function(){ toast('복사 실패'); });
    else toast('복사를 지원하지 않는 브라우저예요');
  }
  window.copyPostLink = function(){ copyText(location.href); };

  /* ════════ 안내사항 (공지 기능) ════════ */
  function loadInfoSection(wrap, done){
    if (!wrap || !infoUrls.length) return;
    var v = infoUrls.map(function(slug){ var p = postBySlug(slug); return p ? { title: cleanTitle(p.title) || infoTitle, html: p.html || '', edit: p.slug } : null; }).filter(function(r){ return r && r.html; });
    var jobs = [Promise.resolve(v)];
    function editBtn(u){
      if (!u) return null; var a = D.createElement('a'); a.className = 'info-edit-btn'; a.href = '?p=' + encodeURIComponent(u); a.setAttribute('data-post', u); a.title = '수정';
      a.title = '글로 보기'; a.innerHTML = '<svg class="ico"><use href="#i-share"/></svg>'; return a;
    }
    Promise.all(jobs).then(function(res){
      var v = res[0]; if (!v.length) return;
      if (v.length === 1){
        var box = D.createElement('div'); box.className = 'info-box info-box-fetched'; box.innerHTML = v[0].html;
        var eb = editBtn(v[0].edit); if (eb) box.appendChild(eb);
        wrap.appendChild(box); fixInlineColors(box);
      } else {
        var bar = D.createElement('div'); bar.className = 'info-tab-bar';
        var tb = D.createElement('div'); tb.className = 'info-tab-box'; var cur = null;
        function setEdit(u){ if (cur){ cur.parentNode && cur.parentNode.removeChild(cur); cur = null; } var e = editBtn(u); if (e){ tb.appendChild(e); cur = e; } }
        v.forEach(function(it, i){
          var b = D.createElement('button'); b.type = 'button'; b.className = 'info-tab-btn' + (i ? '' : ' active'); b.textContent = it.title;
          b.addEventListener('click', function(){
            $$('.info-tab-btn', bar).forEach(function(x){ x.classList.remove('active'); });
            $$('.info-tab-content', tb).forEach(function(x){ x.classList.remove('active'); });
            b.classList.add('active'); $$('.info-tab-content', tb)[i].classList.add('active'); setEdit(it.edit);
          });
          bar.appendChild(b);
          var c = D.createElement('div'); c.className = 'info-tab-content info-box-fetched' + (i ? '' : ' active'); c.innerHTML = it.html; fixInlineColors(c); tb.appendChild(c);
        });
        setEdit(v[0].edit); wrap.appendChild(bar); wrap.appendChild(tb);
      }
      if (done) done();
    });
  }

  /* ════════════════════════════════════════
     창 관리자 (window manager)
  ════════════════════════════════════════ */
  var wins = {}, order = [], zTop = 100;
  var POS_KEY = 'sy-win-pos';
  var savedPos = store.get(POS_KEY) || {};
  function barH(){ return parseFloat(getComputedStyle(D.documentElement).getPropertyValue('--barH')) || 40; }
  function taskH(){ return parseFloat(getComputedStyle(D.documentElement).getPropertyValue('--taskH')) || 46; }

  $$('.win').forEach(function(w){ regWin(w); });
  function regWin(w){
    var id = w.getAttribute('data-win');
    if (w.hasAttribute('data-home') && !isHome){ w.parentNode.removeChild(w); return; }
    wins[id] = w; order.push(id);
    w.addEventListener('pointerdown', function(){ focusWin(id); w._sz = w.offsetWidth + 'x' + w.offsetHeight; }, true);
    w.addEventListener('pointerup', function(){ if (isDesk() && w._sz && w._sz !== w.offsetWidth + 'x' + w.offsetHeight) savePos(id); });
    var x = w.querySelector('.wx'), mn = w.querySelector('.wmin');
    if (x) x.addEventListener('click', function(e){ e.stopPropagation(); closeWin(id); });
    if (mn) mn.addEventListener('click', function(e){ e.stopPropagation(); minWin(id); });
    $$('.wx2', w).forEach(function(b){ b.addEventListener('click', function(e){ e.stopPropagation(); closeWin(id); }); });
    var grip = D.createElement('i'); grip.className = 'wgrip'; grip.setAttribute('aria-hidden', 'true'); w.appendChild(grip);
    gripify(w, grip, id);
    var bar = w.querySelector('.wbar');
    bar.addEventListener('dblclick', function(e){ if (!isDesk() && !e.target.closest('button')) w.classList.toggle('collapsed'); });
    dragify(w, bar, id);
  }

  function focusWin(id){
    var w = wins[id]; if (!w) return;
    order.forEach(function(k){ if (wins[k] !== w) wins[k].classList.remove('focus'); });
    w.classList.add('focus');
    if (isDesk()) w.style.zIndex = ++zTop;
    renderTabs();
  }
  function openWin(id, quiet){
    var w = wins[id]; if (!w) return;
    var wasOpen = w.classList.contains('open') && !w.classList.contains('min');
    if (!isDesk() && w.closest('.sy-float')) order.forEach(function(k){ if (k !== id && wins[k].closest('.sy-float')) wins[k].classList.remove('open'); });
    w.classList.add('open'); w.classList.remove('min', 'collapsed');
    if (id === 'cat') applyNewToCat();
    if (isDesk()){
      if (!w._placed) placeWin(id);
      if (!wasOpen && !quiet){ w.classList.remove('pop'); void w.offsetWidth; w.classList.add('pop'); }
    } else if (!quiet && !w.closest('.sy-float')){
      var y = w.getBoundingClientRect().top + window.pageYOffset - barH() - 10;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    focusWin(id); markIcons();
  }
  function closeWin(id){ var w = wins[id]; if (!w) return; w.classList.remove('open', 'min', 'focus'); renderTabs(); markIcons(); }
  function minWin(id){
    var w = wins[id]; if (!w) return;
    if (isDesk()) { w.classList.add('min'); w.classList.remove('focus'); }
    else if (w.closest('.sy-float')) w.classList.remove('open');
    else w.classList.toggle('collapsed');
    renderTabs(); markIcons();
  }
  function toggleWin(id){
    var w = wins[id]; if (!w) return;
    var open = w.classList.contains('open'), min = w.classList.contains('min');
    if (open && !min && w.classList.contains('focus') && (isDesk() || w.closest('.sy-float'))) minWin(id);
    else openWin(id);
  }
  window.syOpen = openWin;
  window.syRegWin = regWin;   /* PROMPT 보관함 창 (assets/js/vault.js) 이 창 관리자에 들어올 때 */

  function renderTabs(){
    var box = $('#tkTabs'); if (!box) return;
    box.innerHTML = '';
    order.forEach(function(id){
      var w = wins[id]; if (!w.classList.contains('open')) return;
      var b = D.createElement('button'); b.type = 'button';
      b.className = 'tk-tab' + (w.classList.contains('focus') && !w.classList.contains('min') ? ' on' : '') + (w.classList.contains('min') ? ' min' : '');
      b.innerHTML = '<i></i><span></span>'; b.lastChild.textContent = w.getAttribute('data-title') || id;
      b.addEventListener('click', function(){ toggleWin(id); });
      box.appendChild(b);
    });
    updateDnd();
  }
  /* 방해금지 : 글 창이 화면에 떠 있으면 알림을 멈추고 상단바에 달 표시 */
  function isReading(){ return order.some(function(k){ return k.indexOf('post-') === 0 && wins[k].classList.contains('open') && !wins[k].classList.contains('min'); }); }
  function updateDnd(){ var on = isReading(), m = $('#syDnd'); if (m) m.hidden = !on; D.documentElement.classList.toggle('sy-dnd-on', on); }
  function markIcons(){
    $$('.dico[data-open]').forEach(function(ic){ var w = wins[ic.getAttribute('data-open')]; ic.classList.toggle('on', !!(w && w.classList.contains('open') && !w.classList.contains('min'))); });
  }

  /* 위치 */
  function clampXY(w, x, y){
    var ww = w.offsetWidth, top = barH() + 4, bot = window.innerHeight - taskH() - 34;
    x = Math.max(-ww + 90, Math.min(window.innerWidth - 90, x));
    y = Math.max(top, Math.min(bot, y));
    return [x, y];
  }
  function setXY(w, x, y){ var p = clampXY(w, x, y); w.style.left = p[0] + 'px'; w.style.top = p[1] + 'px'; }
  function savePos(id){
    var w = wins[id]; if (!w) return;
    savedPos[id] = { x: w.offsetLeft, y: w.offsetTop, w: w.offsetWidth, h: w.style.height ? w.offsetHeight : 0 };
    store.set(POS_KEY, savedPos);
  }
  function applySaved(id){
    var w = wins[id], s = savedPos[id]; if (!w || !s) return false;
    if (s.w) w.style.width = Math.max(220, Math.min(window.innerWidth - 20, s.w)) + 'px';
    if (s.h) w.style.height = Math.max(120, Math.min(window.innerHeight - barH() - taskH() - 16, s.h)) + 'px';
    setXY(w, s.x, s.y); w._placed = true; return true;
  }
  var DEF = { profile:[0, 560], aol:[0, 900], cat:[0, 320], link:[1, 340], player:[1, 336], notice:[0, 400], memo:[0,320], kit:[0,420], chat:[0,400], radar:[0,600], dday:[0,330], web:[0,600], hub:[0,340] };
  function placeWin(id){
    var w = wins[id]; if (!w) return;
    if (applySaved(id)) return;
    var isPost = id.indexOf('post-') === 0 || id === 'vault';
    var d = DEF[id] || (id === 'vault' ? [0, Math.min(940, window.innerWidth - 60)] : isPost ? [0, Math.min(680, window.innerWidth - 60)] : id === 'list' ? [0, Math.min(660, window.innerWidth - 60)] : [0, 320]);
    w.style.width = d[1] + 'px';
    if (isPost || id === 'list') w.style.height = Math.min(isPost ? 760 : 620, window.innerHeight - barH() - taskH() - 40) + 'px';
        if (id === 'chat') w.style.height = Math.min(650, window.innerHeight - barH() - taskH() - 30) + 'px';
    var x, y;
    if (id === 'cat'){ x = 96; y = barH() + 10; }
    else if (id === 'link'){ x = window.innerWidth - d[1] - 24; y = barH() + 20; w.style.height = Math.min(560, window.innerHeight - barH() - taskH() - 40) + 'px'; }
    else if (id === 'player'){ x = window.innerWidth - d[1] - (wins.link && wins.link.classList.contains('open') ? d[1] + 40 : 24); y = window.innerHeight - taskH() - w.offsetHeight - 16; }
    else if (id === 'notice'){ x = Math.round((window.innerWidth - d[1]) / 2); y = Math.round(window.innerHeight * .22); }
    else if (id === 'radar'){ x = Math.max(110, window.innerWidth - d[1] - 40); y = barH() + 70; }
    else if (id === 'web'){ x = Math.max(110, Math.round((window.innerWidth - d[1]) / 2)); y = barH() + 24; w.style.height = Math.min(640, window.innerHeight - barH() - taskH() - 40) + 'px'; }
    else if (id === 'profile' || id === 'aol'){ x = Math.max(24, Math.round((window.innerWidth - d[1]) / 2)); y = barH() + 24; w.style.height = Math.min(id === 'aol' ? 620 : 700, window.innerHeight - barH() - taskH() - 40) + 'px'; }
    else if (id === 'hub'){ x = Math.max(110, window.innerWidth - d[1] - 60); y = barH() + 60; }
    else if (isPost){ var n = (w._n || 0) % 5; x = Math.max(24, Math.round((window.innerWidth - d[1]) / 2) - 60 + n * 30); y = barH() + 24 + n * 26; }
    else if (id === 'list'){ x = Math.max(24, Math.round((window.innerWidth - d[1]) / 2) - 120); y = barH() + 40; }
    else { x = 140 + (zTop % 6) * 26; y = barH() + 80 + (zTop % 6) * 22; }
    if (!w.style.height) w.style.height = Math.min(w.offsetHeight, window.innerHeight - barH() - taskH() - 30) + 'px';
    var hh = w.offsetHeight, lim = window.innerHeight - taskH() - 12; if (y + hh > lim) y = Math.max(barH() + 10, lim - hh);
    setXY(w, x, y); w._placed = true;
  }

  /* 홈 자동 배치 — 처음엔 몇 개만 깔끔하게 */
  function autoLayout(force){
    if (!isHome || !isDesk()) return;
    var hp = $('#syHero'), r = hp ? hp.getBoundingClientRect() : { top: barH() + 16 };
    var R = window.innerWidth - 24, B = window.innerHeight - taskH() - 14, T = Math.round(r.top);
    ['memo','kit','chat','radar','dday','notice'].forEach(function(id){ if (wins[id] && id !== 'dday') wins[id].classList.remove('open', 'min'); });
    var w = wins.dday;
    if (w){
      w.style.width = '320px'; w.style.height = ''; w.classList.add('open'); w.classList.remove('min');
      w.style.height = Math.min(w.offsetHeight, B - T) + 'px';
      var side = $('.hp-side'), sr = side ? side.getBoundingClientRect() : null, tb = $('.hp-tblock');
      var x = R - 320;
      /* 도면이 보이면 표제란 위쪽 오른편, 좁으면 오른쪽 열 가운데 */
      if (sr && sr.width < 560) x = Math.round(sr.left + (sr.width - 320) / 2);
      w.style.left = Math.max(8, x) + 'px'; w.style.top = T + 'px'; w._placed = true;
      if (tb && sr){ var room = B - tb.offsetHeight - 14 - T; if (T + w.offsetHeight > T + room && room >= 430) w.style.height = room + 'px'; }
    }
    if (!force) Object.keys(savedPos).forEach(function(id){ if (wins[id] && wins[id].classList.contains('open')) applySaved(id); });
    zTop = 100; if (w) w.style.zIndex = ++zTop;
    if (w) focusWin('dday');
    renderTabs(); markIcons();
  }

  /* 크기 조절 (오른쪽 아래 손잡이) */
  function gripify(w, grip, id){
    grip.addEventListener('pointerdown', function(e){
      if (!isDesk() || e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      var sx = e.clientX, sy = e.clientY, sw = w.offsetWidth, sh = w.offsetHeight, pid = e.pointerId;
      try { grip.setPointerCapture(pid); } catch(_){}
      w.classList.add('sizing');
      function mv(ev){
        w.style.width = Math.max(240, Math.min(window.innerWidth - w.offsetLeft - 8, sw + ev.clientX - sx)) + 'px';
        w.style.height = Math.max(160, Math.min(window.innerHeight - taskH() - w.offsetTop - 4, sh + ev.clientY - sy)) + 'px';
      }
      function up(){ grip.removeEventListener('pointermove', mv); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up); w.classList.remove('sizing'); savePos(id); }
      grip.addEventListener('pointermove', mv); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
    });
  }

  /* 드래그 */
  function dragify(w, bar, id){
    bar.addEventListener('pointerdown', function(e){
      if (!isDesk() || e.button !== 0 || e.target.closest('button, a')) return;
      var r = w.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, pid = e.pointerId;
      try { bar.setPointerCapture(pid); } catch(_){}
      w.classList.add('dragging'); e.preventDefault();
      function mv(ev){ setXY(w, ev.clientX - dx, ev.clientY - dy); }
      function up(){
        try { bar.releasePointerCapture(pid); } catch(_){}
        bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up);
        w.classList.remove('dragging'); savePos(id);
      }
      bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
    });
  }

  /* 클릭 위임 : data-open */
  D.addEventListener('click', function(e){
    var t = e.target.closest('[data-open]'); if (!t) return;
    e.preventDefault(); toggleWin(t.getAttribute('data-open'));
  });
  /* 모바일 : 시트 바깥 누르면 닫기 */
  D.addEventListener('pointerdown', function(e){
    if (isDesk()) return;
    if (e.target.closest('.sy-float .win, [data-open], .sy-task')) return;
    $$('.sy-float .win.open').forEach(function(w){ w.classList.remove('open'); });
    renderTabs();
  });
  D.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    var f = order.filter(function(k){ return wins[k].classList.contains('focus') && wins[k].classList.contains('open'); })[0];
    if (f && (isDesk() || wins[f].closest('.sy-float'))) closeWin(f);
  });
  var tkTop = $('#tkTop'); if (tkTop) tkTop.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  var rs = $('#syReset');
  if (rs && isHome){
    rs.hidden = false;
    rs.addEventListener('click', function(){ savedPos = {}; store.del(POS_KEY); order.forEach(function(k){ wins[k]._placed = false; wins[k].style.height = ''; }); autoLayout(true); toast('창을 다시 정렬했어요'); });
  }
  var rT;
  window.addEventListener('resize', function(){
    clearTimeout(rT); rT = setTimeout(function(){
      if (!isDesk()) return;
      order.forEach(function(k){ var w = wins[k]; if (w._placed) setXY(w, w.offsetLeft, w.offsetTop); });
    }, 120);
  });
  if (mqDesk.addEventListener) mqDesk.addEventListener('change', function(){ if (isDesk() && isHome) autoLayout(); });

  /* ════════ 글 · 목록을 창으로 열기 ════════ */
  function cardHTMLw(p, notice){
    return '<a class="sheet-card ' + (notice ? 'ds-notice-card' : 'ds-card') + '" href="?p=' + encodeURIComponent(p.slug) + '" data-post="' + esc(p.slug) + '"' + (notice ? ' data-notice="true"' : ' data-category="' + esc(p.category || '') + '"') + '>' +
      '<div class="card-thumb-wrap"><div class="card-thumb-placeholder"></div>' + thumbImg(p, 'card-thumb') + '</div>' +
      '<div class="card-body">' +
        '<div class="card-title-row"><span class="card-name">' + esc(notice ? p.title : tagTitle(p)) + '</span><span class="card-badge">' + esc(notice ? 'NOTICE' : (p.category || '미분류')) + '</span></div>' +
        '<p class="card-summary">' + esc(p.summary || '') + '</p>' +
        '<p class="card-date">' + esc(p.dateText || '') + '</p>' +
      '</div></a>';
  }
  /* Records 목록 창 : key = '' (전체) / 'notice' (공지) / 카테고리 이름 */
  function openList(key){
    var w = wins.list; if (!w) return;
    key = key || '';
    var notice = key === 'notice';
    var items = POSTS.filter(function(p){ return notice ? p.notice : (!p.notice && (!key || (p.category || '') === key) && (key || showUncat !== 'hide' || p.category)); });
    var title = notice ? 'Notice' : (key || 'Records');
    $('#lsName').textContent = notice ? 'Notice' : 'Records';
    $('#lsSub').textContent = notice ? '공지사항' : (key || '전체 기록');
    $('#lsPath').textContent = notice ? 'Notice' : (key || '전체');
    $('#lsCount').textContent = items.length + '개 기록';
    w.setAttribute('data-title', title); w.setAttribute('data-list-key', key);
    var body = $('#lsBody');
    if (!items.length){ body.innerHTML = '<p class="empty-note">' + (notice ? '공지사항이 없어요.' : '아직 이 폴더에 기록이 없어요.') + '</p>'; }
    else {
      body.innerHTML = '<div class="card-grid' + (store.get('ds-layout') === 'list' || (function(){ try { return localStorage.getItem('ds-layout') === 'list'; } catch(e){ return false; } })() ? ' layout-list' : '') + '">' + items.map(function(p){ return cardHTMLw(p, notice); }).join('') + '</div>';
      if (notice) initNoticeCards(); else initCards();
      numberCards($('.card-grid', body));
    }
    if (notice && window.SY_VAULT) window.SY_VAULT.mount(body);   /* 공지 맨 앞 PROMPT 잠금 박스 */
    $$('#catList li a').forEach(function(a){ a.classList.toggle('cur', !notice && a.getAttribute('data-list') === key); });
    var wb = $('.wbody', w); if (wb) wb.scrollTop = 0;
    openWin('list'); renderTabs();
  }
  /* 글 창 : 글마다 창 하나 (최대 5개까지 열림) */
  function postInner(p){
    var notice = !!p.notice, key = notice ? 'notice' : (p.category || '');
    var same = notice ? [] : POSTS.filter(function(r){ return r !== p && !r.notice && r.category && r.category === p.category; }).slice(0, 4);
    var label = '같은 카테고리 글';
    if (!notice && !same.length){ same = POSTS.filter(function(r){ return r !== p && !r.notice; }).slice(0, 3); label = '최근 글'; }
    var price = p.price ? '<span class="pw-price"><em>' + esc(priceLabel) + '</em><b>' + Number(p.price).toLocaleString('ko-KR') + '원</b></span>' : '';
    var state = p.status ? '<span class="commission-badge ' + (p.status === 'CLOSE' ? 'close' : 'open') + '">' + esc(p.status) + '</span>' : '';
    return '<article class="post-container">' +
      '<div class="post-top"><a class="post-back-btn" href="?' + (notice ? 'notice' : 'c=' + encodeURIComponent(key)) + '" data-list="' + esc(key) + '"><svg class="ico"><use href="#i-folder"/></svg>' + (notice ? 'NOTICE' : esc(key || 'RECORDS')) + '</a>' +
        '<span class="post-file">' + (notice ? 'NOTICE' : 'CLINICAL RECORD') + ' · FILE <b class="post-fileno">No.' + pad(p.no || 0, 4) + '</b></span></div>' +
      '<div class="post-meta"><a class="post-cat-pill" href="?' + (notice ? 'notice' : 'c=' + encodeURIComponent(key)) + '" data-list="' + esc(key) + '">' + esc(notice ? '공지사항' : (p.category || '미분류')) + '</a>' + state + '</div>' +
      '<h1 class="post-title">' + esc(cleanTitle(p.title)) + '</h1>' +
      (p.sub ? '<p class="post-subtitle">' + esc(p.sub) + '</p>' : '') +
      '<div class="post-meta-bottom"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span class="post-date">' + esc(p.dateText || '') + '</span>' + price + '</div>' +
        '<button class="post-share-btn" type="button" data-copy-post="' + esc(p.slug) + '" title="링크 복사" aria-label="링크 복사"><svg class="ico"><use href="#i-share"/></svg></button></div>' +
      '<div class="post-rules"></div>' +
      '<div class="post-body">' + (p.html || '') + '</div>' +
      '<div class="post-divider"></div>' +
      (same.length ? '<div class="post-related"><p class="post-related-label">' + esc(label) + '</p><div class="post-related-grid">' + same.map(function(r){
        return '<a class="related-card" href="?p=' + encodeURIComponent(r.slug) + '" data-post="' + esc(r.slug) + '"><div class="related-thumb-wrap">' + (r.thumbnail ? thumbImg(r, 'related-thumb') : '<div class="card-thumb-placeholder"></div>') + '</div>' +
          '<div class="related-body"><p class="related-title">' + esc(cleanTitle(r.title)) + '</p><p class="related-date">' + esc(r.dateText || '') + '</p></div></a>';
      }).join('') + '</div></div>' : '') +
      '</article>';
  }
  var postCount = 0;
  function openPost(slug){
    var p = postBySlug(slug); if (!p){ toast('글을 찾을 수 없어요'); return; }
    var id = 'post-' + p.slug, w = wins[id];
    if (!w){
      var opened = order.filter(function(k){ return k.indexOf('post-') === 0 && wins[k].classList.contains('open'); });
      if (opened.length >= 5) closeWin(opened[0]);
      w = D.createElement('section'); w.className = 'win app-post'; w.setAttribute('data-win', id);
      w.setAttribute('data-title', cleanTitle(p.title)); w.setAttribute('aria-label', cleanTitle(p.title));
      w._n = postCount++;
      w.innerHTML = '<header class="wbar"><span class="wno">#' + (p.no || '—') + '</span><b class="wname">' + (p.notice ? 'Notice' : 'Clinical Record') + '</b><small class="wsub"></small>' +
        '<span class="wbtns"><button type="button" class="wmin" aria-label="최소화"><svg><use href="#i-min"/></svg></button><button type="button" class="wx" aria-label="닫기"><svg><use href="#i-x"/></svg></button></span></header>' +
        '<div class="wbody"><div class="pw-in">' + postInner(p) + '</div></div>';
      $('.wsub', w).textContent = cleanTitle(p.title);
      ($('.sy-float') || body).appendChild(w);
      regWin(w); fixInlineColors($('.post-body', w));
    }
    openWin(id);
    var wb = $('.wbody', w); if (wb && !w._seen){ wb.scrollTop = 0; w._seen = 1; }
  }
  window.syOpenPost = openPost; window.syOpenList = openList;
  D.addEventListener('click', function(e){
    var c = e.target.closest('[data-copy-post]');
    if (c){ e.preventDefault(); e.stopPropagation(); copyText(shareUrl(c.getAttribute('data-copy-post'))); return; }
    if (e.target.closest('.card-link-btn')) return;
    var a = e.target.closest('[data-post]');
    if (a){ e.preventDefault(); openPost(a.getAttribute('data-post')); return; }
    var l = e.target.closest('[data-list]');
    if (l){ e.preventDefault(); openList(l.getAttribute('data-list')); }
  });

  /* ════════ 홈 앱들 ════════ */
  function isShown(id){ var w = wins[id]; return !!(w && w.classList.contains('open') && !w.classList.contains('min') && !D.hidden); }

  /* ── Sentinel Care : 위치 추적 + 심박 + 가이딩 필요도 ── */
  function trackerApp(){
    var map = $('#scMap'); if (!map || !map.getContext) return;
    var mx = map.getContext('2d');
    var C = { blue:'#2FA4DE', blue2:'#1E8FD6', deep:'#0D5A96', mint:'#2CC39E', ink:'#122B42', ink2:'#5B7185', ink3:'#97A8B6', warn:'#E9A23B', bad:'#E5484D' };
    var ZONES = ['의무실', '게이트', '훈련장', '라운지']; /* 북동 / 남동 / 남서 / 북서 */
    var EDGE = 300;
    function rnd(a, b){ return a + Math.random() * (b - a); }
    var P = { x:-.25, y:-.2, vx:0, vy:0, ang:1, trail:[], col:C.blue2, name:'퓨어' };
    var U = { x:.3, y:.25, vx:0, vy:0, ang:3, trail:[], col:C.mint, name:'유시' };
    var need = 24, guiding = false, lastGuide = null, lastState = '', bpmP = 70, bpmU = 78;
    function dist(){ return Math.hypot(P.x - U.x, P.y - U.y); }
    function zone(t){ var a = Math.atan2(t.x, -t.y); if (Math.hypot(t.x, t.y) < .12) return '본부'; return a >= 0 ? (a < Math.PI / 2 ? ZONES[0] : ZONES[1]) : (a > -Math.PI / 2 ? ZONES[3] : ZONES[2]); }
    function hhmm(d){ return pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2); }
    function hhmmss(){ var d = new Date(); return hhmm(d) + ':' + pad(d.getSeconds(), 2); }
    var logEl = $('#scLog');
    function log(msg, kind){
      var li = D.createElement('li'); if (kind) li.className = kind;
      li.innerHTML = '<time></time><span></span>'; li.firstChild.textContent = hhmmss(); li.lastChild.textContent = msg;
      logEl.insertBefore(li, logEl.firstChild); while (logEl.children.length > 20) logEl.removeChild(logEl.lastChild);
    }
    function wander(t, dt, sp, lim){
      t.ang += rnd(-1, 1) * dt * 1.4;
      t.vx += Math.cos(t.ang) * dt * sp; t.vy += Math.sin(t.ang) * dt * sp;
      var r = Math.hypot(t.x, t.y); if (r > lim){ t.vx -= t.x * dt * .5; t.vy -= t.y * dt * .5; }
      t.vx *= .98; t.vy *= .98;
    }
    function step(dt){
      if (guiding){
        P.vx += (U.x - P.x) * dt * 1.6; P.vy += (U.y - P.y) * dt * 1.6; P.vx *= .9; P.vy *= .9;
        U.vx *= .9; U.vy *= .9;
        if (dist() < .07){
          need = Math.max(6, need - dt * 9);
          if (need <= 6.5){ guiding = false; lastGuide = new Date(); $('#scLast').textContent = hhmm(lastGuide); log('가이딩 완료 · 유시 안정', 'ok'); syncBtn(); }
        }
      } else {
        wander(P, dt, .05, .7);
        wander(U, dt, .05 + need / 1400, .8);
        need = Math.min(100, need + dt * (.18 + dist() * 1.1));
      }
      if (U.drag){ U.vx = 0; U.vy = 0; }
      [P, U].forEach(function(t){
        if (t.drag) return;
        t.x += t.vx * dt; t.y += t.vy * dt;
        if (!t.tk || performance.now() - t.tk > 260){ t.tk = performance.now(); t.trail.push([t.x, t.y]); if (t.trail.length > 22) t.trail.shift(); }
      });
      var close = dist() < .1;
      bpmP += ((68 + (guiding ? 8 : 0) + (close ? 4 : 0)) - bpmP) * dt * .5;
      bpmU += ((70 + need * .42 - (close ? 6 : 0)) - bpmU) * dt * .5;
    }
    function stateOf(n){ return guiding ? 'guiding' : n < 40 ? 'ok' : n < 70 ? 'warn' : 'bad'; }
    var STATE_TXT = { ok:'안정', warn:'주의 · 수치 상승 중', bad:'가이딩 필요', guiding:'가이딩 중…' };
    var btn = $('#scGuide');
    function syncBtn(){ btn.disabled = guiding; btn.textContent = guiding ? '퓨어 이동 중…' : '퓨어에게 가이딩 요청'; }
    btn.addEventListener('click', function(){
      if (guiding) return; guiding = true; syncBtn();
      log('가이딩 요청 → 퓨어 출동 (' + zone(P) + ' → ' + zone(U) + ')', 'hi');
    });

    /* 지도 */
    var dpr = 1;
    function fitCanvas(cv, h){
      var r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      var W = Math.round(r.width), H = Math.round(h || r.height);
      if (cv.width !== W * dpr || cv.height !== H * dpr){ cv.width = W * dpr; cv.height = H * dpr; }
      return [W, H];
    }
    function drawMap(now){
      var s = fitCanvas(map), W = s[0], H = s[1]; if (!W) return;
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 10;
      mx.setTransform(dpr, 0, 0, dpr, 0, 0); mx.clearRect(0, 0, W, H);
      var g = mx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, '#fff'); g.addColorStop(1, '#ECF5FA');
      mx.fillStyle = g; mx.beginPath(); mx.arc(cx, cy, R, 0, 7); mx.fill();
      /* 구역 */
      mx.font = '700 9px Pretendard, system-ui, sans-serif'; mx.textAlign = 'center'; mx.fillStyle = 'rgba(91,113,133,.55)';
      var zp = [[.5, -.5], [.5, .5], [-.5, .5], [-.5, -.5]];
      ZONES.forEach(function(z, i){ mx.fillText(z, cx + zp[i][0] * R * .95, cy + zp[i][1] * R * .95 + 3); });
      /* 링 + 십자 */
      mx.lineWidth = 1;
      [.33, .66, 1].forEach(function(k, i){ mx.strokeStyle = i === 2 ? 'rgba(30,143,214,.45)' : 'rgba(47,164,222,.2)'; mx.setLineDash(i === 1 ? [3, 4] : []); mx.beginPath(); mx.arc(cx, cy, R * k, 0, 7); mx.stroke(); });
      mx.setLineDash([]); mx.strokeStyle = 'rgba(47,164,222,.25)'; mx.beginPath(); mx.moveTo(cx - R, cy); mx.lineTo(cx + R, cy); mx.moveTo(cx, cy - R); mx.lineTo(cx, cy + R); mx.stroke();
      /* 느린 스윕 */
      var a = (now / 4000 % 1) * Math.PI * 2 - Math.PI / 2;
      if (mx.createConicGradient){ var cg = mx.createConicGradient(a - Math.PI / 2, cx, cy); cg.addColorStop(0, 'rgba(47,164,222,0)'); cg.addColorStop(.24, 'rgba(47,164,222,.14)'); cg.addColorStop(.2501, 'rgba(47,164,222,0)'); cg.addColorStop(1, 'rgba(47,164,222,0)'); mx.fillStyle = cg; mx.beginPath(); mx.arc(cx, cy, R, 0, 7); mx.fill(); }
      /* 본부 */
      mx.fillStyle = C.deep; mx.fillRect(cx - 2.5, cy - 2.5, 5, 5);
      function px(t){ return [cx + t.x * R, cy + t.y * R]; }
      /* 연결선 */
      var p = px(P), u = px(U), d = dist();
      mx.strokeStyle = guiding ? C.blue2 : 'rgba(30,143,214,.4)'; mx.lineWidth = guiding ? 1.6 : 1; mx.setLineDash(guiding ? [] : [3, 3]);
      mx.beginPath(); mx.moveTo(p[0], p[1]); mx.lineTo(u[0], u[1]); mx.stroke(); mx.setLineDash([]);
      if (d < .07){ mx.font = '800 11px Pretendard, system-ui, sans-serif'; mx.fillStyle = C.blue2; mx.fillText('♥', (p[0] + u[0]) / 2, (p[1] + u[1]) / 2 - 8); }
      /* 궤적 + 점 */
      [P, U].forEach(function(t){
        mx.strokeStyle = t.col; mx.lineWidth = 1.2;
        for (var i = 1; i < t.trail.length; i++){ var a1 = px({ x:t.trail[i-1][0], y:t.trail[i-1][1] }), a2 = px({ x:t.trail[i][0], y:t.trail[i][1] }); mx.globalAlpha = i / t.trail.length * .45; mx.beginPath(); mx.moveTo(a1[0], a1[1]); mx.lineTo(a2[0], a2[1]); mx.stroke(); }
        mx.globalAlpha = 1;
        var q = px(t), pulse = (now / 1200) % 1;
        mx.strokeStyle = t.col; mx.globalAlpha = 1 - pulse; mx.beginPath(); mx.arc(q[0], q[1], 5 + pulse * 12, 0, 7); mx.stroke(); mx.globalAlpha = 1;
        mx.fillStyle = '#fff'; mx.beginPath(); mx.arc(q[0], q[1], 5.5, 0, 7); mx.fill();
        mx.fillStyle = t.col; mx.beginPath(); mx.arc(q[0], q[1], 3.8, 0, 7); mx.fill();
        mx.font = '800 10px Pretendard, system-ui, sans-serif'; mx.textAlign = 'left'; mx.fillStyle = C.ink;
        mx.fillText(t.name, q[0] + 9, q[1] + 3.5);
      });
    }
    /* 심전도 */
    var ecgs = [[$('#scP .sc-ecg'), function(){ return bpmP; }, C.blue2], [$('#scU .sc-ecg'), function(){ return bpmU; }, C.mint]];
    function ecgY(ph){
      if (ph < .08) return Math.sin(ph / .08 * Math.PI) * .12;
      if (ph < .16) return 0;
      if (ph < .19) return -(ph - .16) / .03 * .18;
      if (ph < .22) return -.18 + (ph - .19) / .03 * 1.18;
      if (ph < .26) return 1 - (ph - .22) / .04 * 1.3;
      if (ph < .29) return -.3 + (ph - .26) / .03 * .3;
      if (ph < .42) return 0;
      if (ph < .58) return Math.sin((ph - .42) / .16 * Math.PI) * .22;
      return 0;
    }
    function drawEcg(now){
      ecgs.forEach(function(e){
        var cv = e[0]; if (!cv) return; var s = fitCanvas(cv), W = s[0], H = s[1]; if (!W) return;
        var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
        c.strokeStyle = 'rgba(47,164,222,.1)'; c.lineWidth = 1; c.beginPath();
        for (var x = 0; x < W; x += 8){ c.moveTo(x + .5, 0); c.lineTo(x + .5, H); } c.stroke();
        var per = 60000 / e[1](), msPx = 9;
        c.strokeStyle = e[2]; c.lineWidth = 1.6; c.beginPath();
        for (x = 0; x <= W; x++){ var t = now - (W - x) * msPx, y = H * .62 - ecgY((t % per) / per) * H * .5; if (!x) c.moveTo(x, y); else c.lineTo(x, y); }
        c.stroke();
        c.fillStyle = e[2]; c.beginPath(); c.arc(W - 1, H * .62 - ecgY((now % per) / per) * H * .5, 2.4, 0, 7); c.fill();
      });
    }
    /* 숫자 */
    var arc = $('#scArc'), needEl = $('#scNeed'), stEl = $('#scState'), box = $('#w-radar .sc-need');
    var bP = $('#scP .sc-bpm b'), bU = $('#scU .sc-bpm b');
    function ui(){
      var st = stateOf(need);
      needEl.textContent = Math.round(need);
      arc.style.strokeDasharray = need.toFixed(1) + ' 100';
      box.setAttribute('data-st', st); stEl.textContent = STATE_TXT[st];
      if (st !== lastState){
        if (st === 'warn' && lastState === 'ok') log('가이딩 필요도 40% 넘음 · 주의', 'warn');
        if (st === 'bad') log('가이딩 필요도 70% 넘음 · 가이딩 권장', 'bad');
        lastState = st;
      }
      if (need >= 99.5 && !guiding && !alarmed){
        alarmed = true; log('⚠ 가이딩 필요도 100% · 폭주 위험', 'bad');
        if (window.SY_APPS) SY_APPS.notify({ app: 'radar', icon: 'care', title: 'Sentinel Care · 긴급', text: "센티넬 <b>'UXI'</b> 가이딩 필요도 100%! 지금 바로 가이딩이 필요해요", urgent: true, action: { label: '가이딩 요청', run: function(){ window.SY_CARE.guide(); } } });
      }
      if (need < 90) alarmed = false;
      bP.textContent = Math.round(bpmP); bU.textContent = Math.round(bpmU);
      $('#scDist').textContent = Math.round(dist() * EDGE) + 'm';
      var zp = zone(P), zu = zone(U);
      if (P.z && P.z !== zp) log('퓨어 → ' + zp); if (U.z && U.z !== zu) log('유시 → ' + zu);
      P.z = zp; U.z = zu;
      $('#scZoneP').textContent = zp; $('#scZoneU').textContent = zu;
      $('#scClock').textContent = hhmmss();
    }
    /* 지도에서 유시 끌어서 옮기기 */
    function mapGeo(){ var r = map.getBoundingClientRect(); var R = Math.min(r.width, r.height) / 2 - 10; return { r: r, cx: r.width / 2, cy: r.height / 2, R: R }; }
    map.addEventListener('pointerdown', function(e){
      var g = mapGeo(), x = e.clientX - g.r.left, y = e.clientY - g.r.top;
      var ux = g.cx + U.x * g.R, uy = g.cy + U.y * g.R;
      if (Math.hypot(x - ux, y - uy) > 22) return;
      e.preventDefault(); e.stopPropagation(); U.drag = true; map.classList.add('grab');
      try { map.setPointerCapture(e.pointerId); } catch(_){}
      var from = zone(U);
      function mv(ev){
        var nx = (ev.clientX - g.r.left - g.cx) / g.R, ny = (ev.clientY - g.r.top - g.cy) / g.R, d = Math.hypot(nx, ny);
        if (d > .9){ nx *= .9 / d; ny *= .9 / d; }
        U.x = nx; U.y = ny;
      }
      function up(){
        U.drag = false; map.classList.remove('grab');
        map.removeEventListener('pointermove', mv); map.removeEventListener('pointerup', up); map.removeEventListener('pointercancel', up);
        log('유시 위치 수동 이동 · ' + from + ' → ' + zone(U), 'hi'); U.trail = [];
      }
      map.addEventListener('pointermove', mv); map.addEventListener('pointerup', up); map.addEventListener('pointercancel', up);
    });
    map.addEventListener('pointermove', function(e){
      if (U.drag) return; var g = mapGeo(), x = e.clientX - g.r.left, y = e.clientY - g.r.top;
      map.classList.toggle('can', Math.hypot(x - (g.cx + U.x * g.R), y - (g.cy + U.y * g.R)) < 22);
    });
    /* 100% 경보 */
    var alarmed = false;
    window.SY_CARE = { guide: function(){ if (!guiding) btn.click(); } };
    log('모니터링 시작 · 퓨어 / 유시 신호 연결됨', 'ok');
    var last = performance.now(), lastUI = 0;
    function loop(now){
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      step(dt);
      if (isShown('radar')){
        drawMap(now); drawEcg(now);
        if (now - lastUI > 300){ lastUI = now; ui(); }
      }
      requestAnimationFrame(loop);
    }
    ui(); syncBtn(); requestAnimationFrame(loop);
  }

  function homeWidgets(){ trackerApp(); }

  /* ════════ 내부 페이지 창 제목 ════════ */
  function pageChrome(){
    var name = $('#docName'), sub = $('#docSub'), c1 = $('#crumb1'), c2 = $('#crumb2'), sep = $('#crumbSep'), no = $('#docNo');
    var post = $('.post-container');
    function setName(a, b){ name.innerHTML = ''; name.appendChild(D.createTextNode(a)); var i = D.createElement('i'); i.textContent = b; name.appendChild(i); }
    var cur = ROUTE === 'post' ? postBySlug(SLUG) : null, num = cur ? cur.no : 0;
    $$('.post-fileno').forEach(function(el){ el.textContent = num ? 'No.' + pad(num, 4) : 'No.————'; });
    if (post){
      var isNotice = !!(cur && cur.notice);
      var cat = (($('.post-cat-pill') || {}).textContent || '').trim();
      setName(isNotice ? 'Notice' : 'Clinical Record', ''); sub.textContent = cat;
      c1.textContent = isNotice ? 'NOTICE' : 'RECORDS'; if (cat && !isNotice){ c2.textContent = cat; sep.hidden = false; }
      no.textContent = num ? '#' + num : 'RX';
    } else if (ROUTE === 'notice'){
      setName('Notice', ''); c1.textContent = 'NOTICE';
    } else {
      setName('Records', ''); sub.textContent = CAT || '분류 전체보기';
      if (CAT){ c2.textContent = CAT; sep.hidden = false; }
    }
  }

  /* ════════ 다른 스크립트(앱들)에서 쓰는 연결 ════════ */
  window.SY = { open: openWin, close: closeWin, toggle: toggleWin, focus: focusWin, wins: wins, isShown: isShown, isReading: isReading, isDesk: isDesk, isHome: isHome,
    store: store, pad: pad, toast: toast, sinceDate: sinceDate, ddayImage: ddayImage, blog: BLOG, autoLayout: function(){ autoLayout(true); },
    $: $, $$: $$, barH: barH, taskH: taskH, cleanTitle: cleanTitle, isNewPost: isNewPost, renderTabs: renderTabs,
    route: ROUTE, cat: CAT, slug: SLUG, posts: POSTS, settings: SET, rel: rel };

  /* ════════ 화면 설정 반영 (settings.json) ════════ */
  function applySettings(){
    $$('[data-set]').forEach(function(el){ var v = SET[el.getAttribute('data-set')]; if (v !== undefined && v !== null && v !== '') el.textContent = v; });
    $$('[data-set-href]').forEach(function(el){ var v = SET[el.getAttribute('data-set-href')]; if (v) el.href = v; else if (el.getAttribute('href') === '#') el.hidden = true; });
    var rs = D.documentElement.style;
    if (SET.pointColor) rs.setProperty('--point', SET.pointColor);
    if (SET.newColor) rs.setProperty('--new', SET.newColor);
    if (SET.cardCols) rs.setProperty('--card-cols', SET.cardCols);
    rs.setProperty('--card-radius', SET.cardRadius === false ? '0px' : '8px');
    rs.setProperty('--post-img-radius', SET.postImgRadius === false ? '0px' : '8px');
    if (SET.fontScale) rs.setProperty('--font-scale', SET.fontScale);
    if (SET.showSummary === false) D.documentElement.classList.add('no-summary');
  }

  /* ════════ Records 창 : 카테고리 트리 (settings.json 의 categories) ════════ */
  function buildCats(){
    var ul = $('#catList'); if (!ul) return;
    var cats = (SET.categories && SET.categories.length) ? SET.categories : uniqueCats();
    function li(cls, href, icon, name, cat){
      var l = D.createElement('li'); l.className = cls;
      var a = D.createElement('a'); a.href = href; a.className = 'cat-modal-btn'; a.setAttribute('data-cat', cat); a.setAttribute('data-list', cat);
      a.innerHTML = '<span><svg class="ico"><use href="#i-' + esc(icon || 'folder') + '"/></svg></span>';
      a.firstChild.appendChild(D.createTextNode(name));
      l.appendChild(a); return l;
    }
    ul.innerHTML = '';
    ul.appendChild(li('root', '?c=', 'folder', sv('title', 'Syringe'), ''));
    cats.forEach(function(c){ if (c && c.name) ul.appendChild(li('sub', '?c=' + encodeURIComponent(c.name), c.icon, c.name, c.name)); });
  }
  function uniqueCats(){
    var seen = {}, out = [];
    POSTS.forEach(function(p){ if (!p.notice && p.category && !seen[p.category]){ seen[p.category] = 1; out.push({ name: p.category, icon: 'folder' }); } });
    return out;
  }

  /* ════════ 글 데이터 (posts/posts.json) ════════ */
  function esc(t){ var d = D.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  /* 글 찾기 : 주소(slug) → 파일 이름 → 예전 주소 순서로 (예전 링크 ?p=2026-10-14-200000 도 계속 열려요) */
  function postBySlug(s){
    s = String(s == null ? '' : s).replace(/^\/+|\/+$/g, ''); var l = s.toLowerCase(), i;
    for (i = 0; i < POSTS.length; i++) if (POSTS[i].slug === s || POSTS[i].slug === l) return POSTS[i];
    for (i = 0; i < POSTS.length; i++) if (POSTS[i].file === s || (POSTS[i].aliases || []).indexOf(l) >= 0 || (POSTS[i].aliases || []).indexOf(s) >= 0) return POSTS[i];
    return null;
  }
  /* 공유용 짧은 주소 : 도메인/banner (내 컴퓨터 미리보기에선 ?p= 방식) */
  function shareUrl(slug){
    var base = location.origin + location.pathname.replace(/[^\/]*$/, '');
    if (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) || location.protocol === 'file:') return base + '?p=' + encodeURIComponent(slug);
    return base + encodeURIComponent(slug);
  }
  function postUrl(p){ return './?p=' + encodeURIComponent(p.slug); }
  /* 카드 제목 : 관리자 화면의 상태/금액/부제목 칸을 [OPEN][PRICE:][SUB:] 태그로 바꿔서 기존 카드 정리 코드가 그대로 처리 */
  function tagTitle(p){
    return (p.status ? '[' + p.status + ']' : '') + (p.price ? '[PRICE:' + p.price + ']' : '') + (p.sub ? '[SUB:' + p.sub + ']' : '') + (p.title || '');
  }
  function thumbImg(p, cls){ return p.thumbnail ? '<img class="' + cls + '" src="' + esc(rel(p.thumbnail)) + '" alt="" loading="lazy">' : ''; }
  function cardHTML(p, notice){
    return '<div class="' + (notice ? 'ds-notice-staging' : 'ds-card-staging') + '">' +
      '<a class="sheet-card ' + (notice ? 'ds-notice-card' : 'ds-card') + '" href="' + postUrl(p) + '"' + (notice ? ' data-notice="true"' : ' data-category="' + esc(p.category || '') + '"') + '>' +
        '<div class="card-thumb-wrap"><div class="card-thumb-placeholder"></div>' + thumbImg(p, 'card-thumb') + '</div>' +
        '<div class="card-body">' +
          '<div class="card-title-row"><span class="card-name">' + esc(notice ? p.title : tagTitle(p)) + '</span><span class="card-badge">' + esc(notice ? 'NOTICE' : (p.category || '미분류')) + '</span></div>' +
          '<p class="card-summary">' + esc(p.summary || '') + '</p>' +
          '<p class="card-date">' + esc(p.dateText || '') + '</p>' +
        '</div>' +
      '</a></div>';
  }
  function relatedHTML(list, label){
    if (!list.length) return '';
    return '<div class="post-related"><p class="post-related-label">' + esc(label) + '</p><div class="post-related-grid">' +
      list.map(function(r){
        return '<a class="related-card" href="' + postUrl(r) + '"><div class="related-thumb-wrap">' + (r.thumbnail ? thumbImg(r, 'related-thumb') : '<div class="card-thumb-placeholder"></div>') + '</div>' +
          '<div class="related-body"><p class="related-title">' + esc(cleanTitle(r.title)) + '</p><p class="related-date">' + esc(r.dateText || '') + '</p></div></a>';
      }).join('') + '</div></div>';
  }
  function postHTML(p){
    var notice = !!p.notice, idT = notice ? 'notice-post-title' : 'post-title', idS = notice ? 'notice-post-subtitle' : 'post-subtitle';
    var catLink = notice ? './?notice' : './?c=' + encodeURIComponent(p.category || '');
    var same = notice ? [] : POSTS.filter(function(r){ return r !== p && !r.notice && r.category && r.category === p.category; }).slice(0, 4);
    var label = '같은 카테고리 글';
    if (!notice && !same.length){ same = POSTS.filter(function(r){ return r !== p && !r.notice; }).slice(0, 3); label = '최근 글'; }
    return '<article class="post-container">' +
      '<div class="post-top"><a class="post-back-btn" href="#" onclick="' + (notice ? 'dsGoBackNotice' : 'dsGoBack') + '(); return false;"><svg class="ico"><use href="#i-back"/></svg>BACK</a>' +
        '<span class="post-file">' + (notice ? 'NOTICE' : 'CLINICAL RECORD') + ' · FILE <b class="post-fileno">No.0000</b></span></div>' +
      '<div class="post-meta"><a class="post-cat-pill" href="' + catLink + '">' + esc(notice ? '공지사항' : (p.category || '미분류')) + '</a></div>' +
      '<h1 class="post-title" id="' + idT + '">' + esc(tagTitle(p)) + '</h1>' +
      '<p class="post-subtitle" id="' + idS + '"></p>' +
      '<div class="post-meta-bottom"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span class="post-date">' + esc(p.dateText || '') + '</span></div>' +
        '<button class="post-share-btn" type="button" onclick="copyPostLink()" title="링크 복사" aria-label="링크 복사"><svg class="ico"><use href="#i-share"/></svg></button></div>' +
      '<div class="post-rules"></div>' +
      '<div class="post-body">' + (p.html || '') + '</div>' +
      '<div class="post-divider"></div>' + relatedHTML(same, label) +
      '</article>';
  }
  function renderPage(){
    var cc = $('#card-container'), nc = $('#notice-card-container'), ps = $('#post-slot');
    var list = POSTS.filter(function(p){ return !p.notice; }), notes = POSTS.filter(function(p){ return p.notice; });
    if (ROUTE === 'list' && cc){
      var show = CAT ? list.filter(function(p){ return (p.category || '') === CAT; }) : list;
      cc.innerHTML = show.map(function(p){ return cardHTML(p, false); }).join('');
      if (!show.length) cc.innerHTML = '<p class="empty-note">아직 이 폴더에 기록이 없어요.</p>';
    }
    if (ROUTE === 'notice' && nc){
      nc.innerHTML = notes.map(function(p){ return cardHTML(p, true); }).join('');
      if (!notes.length) nc.innerHTML = '<p class="empty-note">공지사항이 없어요.</p>';
    }
    if (ROUTE === 'post' && ps){
      var p = postBySlug(SLUG);
      ps.innerHTML = p ? postHTML(p) : '<p class="empty-note">글을 찾을 수 없어요. <a href="./?c=">기록 전체 보기</a></p>';
    }
  }

  /* ════════ 초기화 ════════ */
  function init(){
    applySettings(); buildCats();
    if (!isHome){ buildSections(); buildNoticeSection(); buildProtectedSection(); pageChrome(); }
    try { if (localStorage.getItem('ds-layout') === 'list') window.setLayout('list'); } catch(e){}

    /* 제목 태그 정리 */
    [['post-title','post-subtitle'],['notice-post-title','notice-post-subtitle']].forEach(function(p){
      var t = D.getElementById(p[0]), s = D.getElementById(p[1]); if (!t) return;
      var raw = t.textContent || '', m = raw.match(/\[SUB:([^\]]+)\]/i);
      t.textContent = cleanTitle(raw); if (m && s) s.textContent = m[1].trim();
    });
    D.title = sv('title', 'Syringe');
    $$('.post-body').forEach(fixInlineColors);
    cleanTagsFromTitles();

    var cc = $('#catCount'); if (cc) cc.textContent = $$('#catList li').length + '개 항목';
    /* luvinfo */
    if (xUrl){ ['#sy-luv-link', '#dico-luv'].forEach(function(s){ var a = $(s); if (a){ a.href = xUrl; a.hidden = false; } }); }
    /* 공지 메뉴 — 공지글이 있을 때만 */
    var nl = $('#sy-notice-link'); if (nl) nl.hidden = !POSTS.some(function(p){ return p.notice; });

    if (window.SY_APPS) window.SY_APPS.init();
    if (isHome){
      homeWidgets();
      if (isDesk()) autoLayout();
      else openWin('dday', true);
      /* 주소로 들어온 경우 : ?p=글 / ?c=카테고리 / ?notice → 그 창 열기 */
      if (ROUTE === 'post' && SLUG) openPost(SLUG);
      else if (ROUTE === 'list') openList(CAT);
      else if (ROUTE === 'notice') openList('notice');
      else if (ROUTE === 'prompt' && window.SY_VAULT) window.SY_VAULT.open();   /* 퓨어.kr/prompt → PROMPT 보관함 */
      loadInfoSection($('#info-win'), function(){
        var di = $('#dico-notice'); if (di) di.hidden = false;
        wins.notice._placed = false; di && di.classList.add('has-new');
      });
    } else if (infoScope === 'all' && ROUTE !== 'notice'){
      var iw = D.createElement('div'); iw.className = 'info-wrap'; $('#info-inline').appendChild(iw); loadInfoSection(iw);
    }
    renderTabs();

    var mo = new MutationObserver(function(){
      $$('.txt_like, [id^="reaction-"]').forEach(function(el){ el.style.display = 'none'; });
      cleanTagsFromTitles();
    });
    mo.observe(body, { childList: true, subtree: true });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
};

/* ── 시작 : 설정 + 글 목록 불러오기 ── */
(function(){
  function j(u, d){ return fetch(u, { cache: 'no-cache' }).then(function(r){ return r.ok ? r.json() : d; }).catch(function(){ return d; }); }
  Promise.all([j('settings.json', {}), j('posts/posts.json', [])]).then(function(r){
    window.SY_SETTINGS = r[0] || {}; window.SY_POSTS = Array.isArray(r[1]) ? r[1] : [];
    var go = function(){ window.SY_MAIN(window.SY_SETTINGS, window.SY_POSTS); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  });
})();