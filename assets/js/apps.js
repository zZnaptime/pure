/* ══════════════════════════════════════════════════════════════
   SYRINGE — 앱 스크립트 (커버 / 알림 / 시작 메뉴 / 메신저 / D-DAY / 메드킷 / 메모 / 플레이어 / 인터넷 / 링크 허브)
══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   SYRINGE — 앱 스크립트 (접속 커버 / 알림 / 시작 메뉴 / 메신저 /
   D-DAY / 메디컬 키트 / 메모 / 플레이어 / 인터넷 / 링크 허브 / NEW 점)
══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var D = document;
  function $(s, r){ return (r || D).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function pad(n, l){ n = String(n); while (n.length < l) n = '0' + n; return n; }
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
  function esc(t){ var d = D.createElement('div'); d.textContent = t == null ? '' : t; return d.innerHTML; }
  var LS = { get: function(k, d){ try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch(e){ return d; } }, set: function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };
  var SS = { get: function(k){ try { return sessionStorage.getItem(k); } catch(e){ return null; } }, set: function(k, v){ try { sessionStorage.setItem(k, v); } catch(e){} }, del: function(k){ try { sessionStorage.removeItem(k); } catch(e){} } };
  function S(){ return window.SY || {}; }
  function ddayN(){ var s = new Date((S().sinceDate || '2026-04-24').replace(/-/g, '/')); s.setHours(0,0,0,0); var t = new Date(); t.setHours(0,0,0,0); return Math.round((t - s) / 864e5) + 1; }
  function fill(t){ return String(t || '').replace(/\{dday\}/g, ddayN()); }
  function hhmm(d){ d = d || new Date(); var h = d.getHours(); return (h < 12 ? '오전 ' : '오후 ') + ((h % 12) || 12) + ':' + pad(d.getMinutes(), 2); }
  function onMobile(){ return !(S().isDesk && S().isDesk()); }

  /* ════════ 접속 커버 ════════ */
  var boot = { el: null, running: false };
  function showBoot(){
    var b = $('#syBoot'); if (!b || boot.running) return;
    boot.running = true; b.classList.remove('leave', 'ready', 'inject', 'in'); b.hidden = false; D.documentElement.classList.add('booting');
    /* 첫 화면부터 덮여 있던 커버(sy-preboot)를 그대로 이어받기 : 다시 페이드인하지 않아요 */
    if (D.documentElement.classList.contains('sy-preboot')){ b.classList.add('in'); D.documentElement.classList.remove('sy-preboot'); }
    void b.offsetWidth; requestAnimationFrame(function(){ requestAnimationFrame(function(){ b.classList.add('in'); }); });
    var tg = $('.bt-ticks', b);
    if (tg && !tg.childNodes.length){ var h = ''; for (var i = 0; i < 90; i++){ var a = i * 4 * Math.PI / 180, M = i % 5 === 0, r1 = 106, r2 = M ? 99 : 102; h += '<line class="tk' + (M ? ' M' : '') + '" x1="' + (Math.sin(a) * r1).toFixed(2) + '" y1="' + (-Math.cos(a) * r1).toFixed(2) + '" x2="' + (Math.sin(a) * r2).toFixed(2) + '" y2="' + (-Math.cos(a) * r2).toFixed(2) + '"/>'; } tg.innerHTML = h; }
    var liq = $('#ixLiq'), liqD = $('#ixLiqD'), pl = $('#ixPl'), pct = $('#btPct'), msg = $('#btMsg'), btn = $('#btEnter'), lbl = $('#btLbl'), st8 = $('#btState'), dots = $$('#btDots i'), bar = $('#btBar'), arc = $('.bt-arc', b);
    var MSG = [[0, 'READING CHART'], [28, 'SYMPTOM: LOVE'], [58, 'NO CURE FOUND'], [86, 'PRESCRIBING…'], [100, 'HOLD STILL ♡']];
    /* 로딩 아래 ✦ 5개 : 단계(MSG)마다 하나씩 차올라요. 마지막 ✦ 는 100% 에서 반짝 */
    var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5C12.9 8 16 11.1 22.5 12 16 12.9 12.9 16 12 22.5 11.1 16 8 12.9 1.5 12 8 11.1 11.1 8 12 1.5Z"/></svg>';
    dots.forEach(function(d){ if (!d.querySelector('svg')) d.innerHTML = '<span class="st-b">' + STAR + '</span><span class="st-f">' + STAR + '</span>'; });
    var STEP = MSG.map(function(m){ return m[0]; });
    btn.disabled = true; lbl.textContent = 'LOADING'; st8.textContent = 'STAND BY';
    function setP(p, keepUi){
      var w = 270 * p / 100; liq.setAttribute('width', w); liqD.setAttribute('width', w); pl.setAttribute('transform', 'translate(' + w + ' 0)');
      if (keepUi) return;
      pct.textContent = Math.round(p); if (bar) bar.style.width = p + '%'; if (arc) arc.style.strokeDasharray = p.toFixed(2) + ' 100';
      dots.forEach(function(d, i){
        var a = i * 20, z = a + 20, f = Math.max(0, Math.min(1, (p - a) / (z - a)));
        d.style.setProperty('--f', f.toFixed(3)); d.classList.toggle('on', f >= 1);
      });
      for (var i = MSG.length - 1; i >= 0; i--) if (p >= MSG[i][0]){ msg.textContent = MSG[i][1]; break; }
    }
    setP(0);
    var st = performance.now() + 450, DUR = 2600;
    (function f(now){
      var k = Math.max(0, Math.min(1, (now - st) / DUR)), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setP(e * 100);
      if (k < 1) requestAnimationFrame(f);
      else { btn.disabled = false; lbl.textContent = 'ENTER'; st8.textContent = 'READY'; b.classList.add('ready'); try { btn.focus({ preventScroll: true }); } catch(_){} }
    })(performance.now());
    btn.onclick = function(){
      if (btn.disabled) return; btn.disabled = true; lbl.textContent = 'ADMITTED'; st8.textContent = 'WELCOME'; b.classList.add('inject');
      var s2 = performance.now();
      (function g(now){
        var k = Math.min(1, (now - s2) / 620), e = 1 - Math.pow(1 - k, 3); setP(100 * (1 - e), true);
        if (k < 1) requestAnimationFrame(g);
        else setTimeout(function(){
          b.classList.add('leave'); b.classList.remove('in'); SS.set('sy-booted', '1');
          setTimeout(function(){ b.hidden = true; b.classList.remove('inject', 'leave', 'ready'); D.documentElement.classList.remove('booting'); boot.running = false; }, 1050);
        }, 380);
      })(s2);
    };
  }
  function initBoot(){
    var logo = $('#syLogo');
    if (logo) logo.addEventListener('click', function(e){
      e.preventDefault();
      if (S().isHome){ showBoot(); } else { SS.set('sy-boot-force', '1'); location.href = S().blog || '/'; }
    });
    if (S().isHome && (!SS.get('sy-booted') || SS.get('sy-boot-force'))){ SS.del('sy-boot-force'); showBoot(); }
    var sb = $('#stBoot'); if (sb) sb.addEventListener('click', function(){ closeStart(); if (S().isHome) showBoot(); else { SS.set('sy-boot-force', '1'); location.href = S().blog || '/'; } });
  }

  /* ════════ 알림 팝업 ════════ */
  var NICON = { pure: '<i class="k-pf p-pure"></i>', uxi: '<i class="k-pf p-uxi"></i>', care: '<i class="ni ni-care"><svg class="ico"><use href="#i-radar"/></svg></i>', heart: '<i class="ni ni-heart"><svg class="ico"><use href="#i-heart"/></svg></i>', kit: '<i class="ni ni-kit"><svg class="ico"><use href="#i-syringe"/></svg></i>', web: '<i class="ni ni-web"><svg class="ico"><use href="#i-globe"/></svg></i>', music: '<i class="ni ni-music"><svg class="ico"><use href="#i-music"/></svg></i>', game: '<i class="ni ni-game"><svg class="ico"><use href="#i-sword"/></svg></i>' };
  function notify(n){
    var wrap = $('#syNoti'); if (!wrap) return;
    if (!$('#syBoot') || !$('#syBoot').hidden){ setTimeout(function(){ notify(n); }, 3000); return; }
    var el = D.createElement('div'); el.className = 'noti' + (n.urgent ? ' urgent' : ''); el.setAttribute('role', 'status');
    el.innerHTML = '<span class="n-ic">' + (NICON[n.icon] || NICON.heart) + '</span><span class="n-tx"><span class="n-top"><b></b><time>지금</time></span><span class="n-msg"></span></span><button type="button" class="n-x" aria-label="닫기">×</button>' + (n.action ? '<button type="button" class="n-act"></button>' : '');
    el.querySelector('.n-top b').textContent = n.title; el.querySelector('.n-msg').innerHTML = esc(fill(n.text)).replace(/&lt;(\/?)b&gt;/g, '<$1b>').replace(/&lt;br\s*\/?&gt;/gi, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<u class="fk-link">$1</u>');
    if (n.action) el.querySelector('.n-act').textContent = n.action.label;
    var gone = false;
    function close(){ if (gone) return; gone = true; el.classList.add('out'); setTimeout(function(){ el.remove(); }, 350); }
    el.addEventListener('click', function(e){
      if (e.target.closest('.n-x')){ close(); return; }
      if (e.target.closest('.n-act')){ n.action.run(); close(); if (n.app && S().open) S().open(n.app); return; }
      if (n.app && S().open) S().open(n.app); close();
    });
    /* 모바일 : 위로 밀어서 닫기 */
    var sy = null; el.addEventListener('touchstart', function(e){ sy = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchmove', function(e){ if (sy == null) return; var dy = e.touches[0].clientY - sy; if (dy < 0) el.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
    el.addEventListener('touchend', function(){ var m = /-?\d+/.exec(el.style.transform || ''); if (m && +m[0] < -30) close(); else el.style.transform = ''; sy = null; });
    if (wrap.children.length >= 3) wrap.firstElementChild.remove();
    wrap.appendChild(el); requestAnimationFrame(function(){ el.classList.add('in'); });
    setTimeout(close, n.urgent ? 12000 : 6500);
    try { if (window.SyringeFx && SyringeFx.noti) SyringeFx.noti(!!n.urgent); } catch(_){}
    if (n.app === 'chat' && n.icon === 'pure') chat.push('pure', n.title || 'PURE', fill(n.text).replace(/<\/?b>/g, ''));
  }
  function initNoti(){
    var C = window.SY_NOTI; if (!C || !S().isHome || !C.list || !C.list.length) return;
    var bag = [];
    function next(){ if (!bag.length) bag = C.list.slice().sort(function(){ return Math.random() - .5; }); return bag.pop(); }
    function loop(delay){
      setTimeout(function(){
        if (!D.hidden && $('#syBoot').hidden) notify(next());
        loop(rnd(C.every[0], C.every[1]) * 1000);
      }, delay);
    }
    loop((C.first || 12) * 1000);
  }

  /* ════════ 시작 메뉴 ════════ */
  function openStart(){ var m = $('#syStart'); m.hidden = false; requestAnimationFrame(function(){ m.classList.add('on'); }); $('#tkStart').setAttribute('aria-expanded', 'true'); }
  function closeStart(){ var m = $('#syStart'); if (!m || m.hidden) return; m.classList.remove('on'); $('#tkStart').setAttribute('aria-expanded', 'false'); setTimeout(function(){ if (!m.classList.contains('on')) m.hidden = true; }, 220); }
  function initStart(){
    var b = $('#tkStart'), m = $('#syStart'); if (!b || !m) return;
    b.addEventListener('click', function(e){ e.stopPropagation(); if (m.hidden) openStart(); else closeStart(); });
    D.addEventListener('pointerdown', function(e){ if (!m.hidden && !e.target.closest('#syStart, #tkStart')) closeStart(); });
    D.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeStart(); });
    m.addEventListener('click', function(e){ if (e.target.closest('[data-open], .st-list a')) setTimeout(closeStart, 30); });
    var t = $('#stTile'); if (t) t.addEventListener('click', function(){ closeStart(); if (S().isHome && S().isDesk()) S().autoLayout(); else if (S().toast) S().toast('창 정렬은 PC 홈 화면에서 돼요'); });
  }

  /* ════════ Records : 새 글 있는 폴더에 점 ════════ */
  function markNew(){
    var set = {}, P = S().posts || [];
    P.forEach(function(p){ if (!p.notice && p.category && S().isNewPost && S().isNewPost(p.dateText)) set[p.category] = 1; });
    var any = false;
    $$('#catList li a').forEach(function(a){
      var name = (a.textContent || '').replace(/\(\d+\)\s*$/, '').trim(), on = !!set[name];
      a.classList.toggle('has-new', on); if (on) any = true;
      if (S().route === 'list' && a.getAttribute('data-cat') === (S().cat || '')) a.classList.add('cur');
    });
    $$('[data-open="cat"]').forEach(function(x){ x.classList.toggle('has-new', any); });
  }

  /* ════════ 메신저 ════════ */
  var chat = (function(){
    var CFG = window.SY_CHAT || { rooms: [] }, rooms = CFG.rooms || [], cur = null, unread = LS.get('sy-chat-unread', null);
    var body, log, list, form, inp;
    if (!unread){ unread = {}; rooms.forEach(function(r, i){ unread[r.id] = i === 0 ? 0 : Math.min(2, (r.log || []).length); }); }
    function saveU(){ LS.set('sy-chat-unread', unread); }
    function hist(id){ return LS.get('sy-chat-' + id, []); }
    function addHist(id, m){ var h = hist(id); h.push(m); if (h.length > 40) h = h.slice(-40); LS.set('sy-chat-' + id, h); }
    function room(id){ for (var i = 0; i < rooms.length; i++) if (rooms[i].id === id) return rooms[i]; return null; }
    function msgs(r){ return (r.log || []).concat(hist(r.id)); }
    function avatarOf(r, name){
      if (name === 'me') return '<i class="k-pf p-uxi"></i>';
      var m = (r.members || []).filter(function(x){ return x.name === name; })[0] || { name: name, avatar: '' };
      if (m.avatar === 'pure') return '<i class="k-pf p-pure"></i>';
      if (m.avatar === 'uxi') return '<i class="k-pf p-uxi"></i>';
      if (m.avatar) return '<i class="k-pf" style="background-image:url(\'' + esc(m.avatar) + '\')"></i>';
      var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
      return '<i class="k-pf k-ini" style="--h:' + (190 + h % 40) + '">' + esc(name.charAt(0)) + '</i>';
    }
    function roomAv(r){ var ms = r.members || []; if (ms.length > 1) return '<span class="ra multi">' + avatarOf(r, ms[0].name) + avatarOf(r, ms[1].name) + '</span>'; return '<span class="ra">' + avatarOf(r, ms[0] ? ms[0].name : r.name) + '</span>'; }
    function headAv(r){ var ms = r.members || []; return '<span class="ra multi">' + avatarOf(r, ms[0] ? ms[0].name : r.name) + avatarOf(r, 'me') + '</span>'; }
    function menuCard(r){
      if (!r.menu) return;
      var who = (r.members && r.members[0]) ? r.members[0].name : r.name;
      var row = D.createElement('div'); row.className = 'k-row other menu-row'; row.setAttribute('data-from', '__menu');
      row.innerHTML = avatarOf(r, who).replace('<i class="k-pf', '<i class="k-pf k-av') + '<div class="k-ct"><span class="k-nm">' + esc(who) + '</span><div class="k-card"><b>📋 키워드 목록</b><small>선택하면 자동으로 답해드려요</small><div class="kc-list"></div></div></div>';
      var L = row.querySelector('.kc-list');
      r.menu.forEach(function(it){ var bt = D.createElement('button'); bt.type = 'button'; bt.innerHTML = '<b></b><span></span><i>›</i>'; bt.children[0].textContent = it.k; bt.children[1].textContent = it.d || ''; bt.addEventListener('click', function(){ send(it.k); }); L.appendChild(bt); });
      log.appendChild(row); body.scrollTop = body.scrollHeight;
    }
    function chips(r){
      var c = $('#chChips'); if (!c) return; c.innerHTML = ''; c.hidden = !(r && r.menu);
      if (r && r.menu) r.menu.forEach(function(it){ var bt = D.createElement('button'); bt.type = 'button'; bt.textContent = '#' + it.k; bt.addEventListener('click', function(){ send(it.k); }); c.appendChild(bt); });
    }
    function renderList(){
      list.innerHTML = '';
      rooms.forEach(function(r){
        var ms = msgs(r), last = ms[ms.length - 1] || {}, li = D.createElement('li');
        li.innerHTML = roomAv(r) + '<span class="rt"><b>' + esc(r.name) + '</b><small>' + esc(fill(last.text || '').replace(/<br\s*\/?>/gi, ' ')) + '</small></span><span class="rm"><time>' + esc(last.time || '') + '</time>' + (unread[r.id] ? '<em>' + unread[r.id] + '</em>' : '') + '</span>';
        li.addEventListener('click', function(){ openRoom(r.id); });
        list.appendChild(li);
      });
      var tot = 0; Object.keys(unread).forEach(function(k){ tot += unread[k] || 0; });
      $$('[data-open="chat"]').forEach(function(x){ var ic = x.querySelector('.ic') || x; ic.setAttribute('data-badge', tot || ''); });
      var f = D.createElement('li'); f.className = 'rf'; f.innerHTML = '<button type="button">대화 기록 지우기</button>';
      f.querySelector('button').addEventListener('click', function(e){ e.stopPropagation(); rooms.forEach(function(r){ LS.set('sy-chat-' + r.id, []); }); renderList(); });
      list.appendChild(f);
    }
    function head(r){
      $('#chBack').hidden = !r; $('#chAv').innerHTML = r ? headAv(r) : '<span class="ra"><i class="k-pf k-ini" style="--h:200">✚</i></span>';
      $('#chName').textContent = r ? r.name : 'ARCHtalk'; $('#chSub').textContent = r ? (r.sub || '') : '대화 ' + rooms.length;
    }
    function bubble(r, m){
      var who = m.from === 'me' ? 'me' : 'other', last = log.lastElementChild;
      var b = D.createElement('div'); b.className = 'k-msg' + (m.fresh ? ' pop' : ''); b.innerHTML = esc(fill(m.text).replace(/<br\s*\/?>/gi, '\n')).replace(/(https?:\/\/[^\s<]+)/g, '<u class="fk-link">$1</u>'); b.style.whiteSpace = 'pre-line'; if (m.unread) b.setAttribute('data-u', '1');
      if (last && last.classList.contains('k-row') && last.getAttribute('data-from') === m.from){ last.querySelector('.k-ct').appendChild(b); }
      else {
        var row = D.createElement('div'); row.className = 'k-row ' + who; row.setAttribute('data-from', m.from);
        row.innerHTML = avatarOf(r, m.from).replace('<i class="k-pf', '<i class="k-pf k-av') + '<div class="k-ct"><span class="k-nm">' + esc(who === 'me' ? (CFG.me || '유시') : m.from) + '</span></div>';
        row.querySelector('.k-ct').appendChild(b); log.appendChild(row);
      }
      if (m.time){ var t = D.createElement('time'); t.className = 'k-time'; t.textContent = m.time; var ct = log.lastElementChild.querySelector('.k-ct'); var old = ct.querySelector('.k-time'); if (old) old.remove(); ct.appendChild(t); }
    }
    function openRoom(id){
      var r = room(id); if (!r) return; cur = r; unread[id] = 0; saveU();
      head(r); list.hidden = true; log.hidden = false; form.hidden = false; log.innerHTML = '<div class="chat-div"><span>' + esc(new Date().getFullYear() + '년 ' + (new Date().getMonth() + 1) + '월 ' + new Date().getDate() + '일') + '</span></div>';
      msgs(r).forEach(function(m){ bubble(r, m); });
      menuCard(r); chips(r);
      body.scrollTop = body.scrollHeight; renderList();
    }
    function back(){ cur = null; head(null); list.hidden = false; log.hidden = true; form.hidden = true; chips(null); renderList(); body.scrollTop = 0; }
    function replyFor(r, t){
      var ks = r.keywords || [];
      for (var i = 0; i < ks.length; i++) for (var j = 0; j < ks[i].k.length; j++) if (t.indexOf(ks[i].k[j]) > -1) return pick(ks[i].r);
      return pick(r.replies || ['…']);
    }
    function push(id, from, text){
      var r = room(id); if (!r) return; var m = { from: from, text: text, time: hhmm() };
      addHist(id, m);
      var inRoom = cur && cur.id === id, shown = inRoom && S().isShown && S().isShown('chat');
      /* 지금 열려 있는 방이면 창이 닫혀/최소화돼 있어도 말풍선은 바로 붙여 둠 (다시 열었을 때 바로 보이게) */
      if (inRoom){ m.fresh = shown ? 1 : 0; bubble(r, m); body.scrollTop = body.scrollHeight; }
      if (!shown){ unread[id] = (unread[id] || 0) + 1; saveU(); }
      renderList();
    }
    function send(text){
      var r = cur; if (!r) return;
      var m = { from: 'me', text: text, time: hhmm(), unread: 1, fresh: 1 };
      bubble(r, m); body.scrollTop = body.scrollHeight;
      var saved = { from: 'me', text: text, time: m.time }; addHist(r.id, saved);
            var rep = replyFor(r, text), who = (rep && rep.from) || pick((r.members || [{ name: r.name }]).map(function(x){ return x.name; }));
      setTimeout(function(){
        if (cur !== r) return;
        $$('.k-msg[data-u]', log).forEach(function(x){ x.removeAttribute('data-u'); });
        var t = D.createElement('div'); t.className = 'k-row other typing';
        t.innerHTML = avatarOf(r, who) + '<div class="k-ct"><div class="k-msg dots"><i></i><i></i><i></i></div></div>';
        setTimeout(function(){ if (cur !== r) return; log.appendChild(t); body.scrollTop = body.scrollHeight; }, 350);
        setTimeout(function(){
          t.remove();
          if (r.menu && /도움말|키워드|명령어|help/i.test(text)){ menuCard(r); return; }
          push(r.id, who, fill(rep && rep.text != null ? rep.text : rep));
        }, 1300 + Math.random() * 1300);
      }, 700 + Math.random() * 1400);
    }
    function init(){
      body = $('#chatBody'); log = $('#chatLog'); list = $('#chRooms'); form = $('#chatForm'); inp = $('#chatIn');
      if (!body || !rooms.length) return;
      $('#chBack').addEventListener('click', back);
      form.addEventListener('submit', function(e){ e.preventDefault(); var v = inp.value.trim(); if (!v) return; inp.value = ''; send(v); });
      var plus = $('.ch-plus', form); if (plus) plus.addEventListener('click', function(){ send(pick(CFG.stickers || ['💉'])); });
      openRoom(rooms[0].id);
      /* 메신저 창을 다시 열면 보고 있던 방은 읽음 처리 + 맨 아래로 */
      var w = $('#w-chat');
      if (w && window.MutationObserver) new MutationObserver(function(){
        if (!cur || !(S().isShown && S().isShown('chat'))) return;
        if (unread[cur.id]){ unread[cur.id] = 0; saveU(); renderList(); }
        body.scrollTop = body.scrollHeight;
      }).observe(w, { attributes: true, attributeFilter: ['class'] });
    }
    return { init: init, push: push };
  })();

  /* ════════ D-DAY ════════ */
  function ddayApp(){
    var w = $('#w-dday'); if (!w) return;
    var s = new Date((S().sinceDate || '2026-04-24').replace(/-/g, '/')); if (isNaN(s)) return; s.setHours(0,0,0,0);
    var n = ddayN(), goal = (Math.floor(n / 100) + 1) * 100, left = goal - n, gd = new Date(s.getTime() + (goal - 1) * 864e5);
    function fd(d){ return d.getFullYear() + '.' + pad(d.getMonth() + 1, 2) + '.' + pad(d.getDate(), 2); }
    $('.dd-since', w).textContent = fd(s); $('.dd-goal', w).textContent = 'D+' + goal; $('.dd-left', w).textContent = left + '일 남음';
    $('.dd-goal-date', w).textContent = fd(gd);
    var pct = Math.round((n % 100) / 100 * 100); $('.dd-pct', w).textContent = pct + '%'; $('.dd-prog', w).style.width = pct + '%';
    var el = $('.dd-n', w), done = false;
    function countUp(){ if (done) return; done = true; var st = performance.now(); (function f(now){ var k = Math.min(1, (now - st) / 1100); k = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(n * k); if (k < 1) requestAnimationFrame(f); })(st); }
    el.textContent = n;
    if (S().isShown && S().isShown('dday')) countUp(); else new MutationObserver(function(){ if (S().isShown('dday')) countUp(); }).observe(w, { attributes: true, attributeFilter: ['class'] });
    var img = $('#ddImg'), src = S().ddayImage;
    if (src && img){ img.src = src; img.hidden = false; var ph = $('.dd-ph', w); if (ph) ph.hidden = true; }
    var memo = $('.dd-memo', w); if (memo && !memo.textContent.trim()) memo.textContent = '200일엔 뭘 할까?';
    $('#ddFlip').addEventListener('click', function(){ this.classList.toggle('flip'); });
  }

  /* ════════ 메디컬 키트 + 조제실 ════════ */
  function kitApp(){
    var w = $('#w-kit'); if (!w) return;
    var liq = $('#kLiqR'), liqD = $('#kLiqD'), pl = $('#kPl'), vEl = $('#kitVol'), bar = $('#kitBar'), msg = $('#tankMsg'), syr = $('#objSyr'), vial = $('.o-vial', w);
    var vol = 5, busy = false, FULL = 268;
    function setVol(v){ vol = v; var x = FULL * v / 5; liq.setAttribute('width', Math.max(0, x)); liqD.setAttribute('width', Math.max(0, x)); pl.setAttribute('transform', 'translate(' + x.toFixed(2) + ' 0)'); vEl.textContent = v.toFixed(2); bar.style.width = Math.max(2, v / 5 * 100) + '%'; }
    function tween(a, b, ms, done){ var st = performance.now(); (function f(now){ var k = Math.min(1, (now - st) / ms), e = 1 - Math.pow(1 - k, 3); setVol(a + (b - a) * e); if (k < 1) requestAnimationFrame(f); else if (done) done(); })(st); }
    setVol(5);
    syr.addEventListener('click', function(){
      if (busy) return; busy = true; syr.classList.add('show');
      tween(vol, Math.max(0, vol - 1), 520, function(){
        if (vol <= 0.001){
          msg.textContent = 'EMPTY · 약병에서 다시 채우는 중…'; vial.classList.add('pour'); syr.classList.remove('show'); syr.classList.add('refill');
          setTimeout(function(){ tween(0, 5, 1500, function(){ vial.classList.remove('pour'); syr.classList.remove('refill'); msg.textContent = 'REFILLED · 5.00 mL ✦'; busy = false; }); }, 380);
        } else { msg.textContent = 'INJECT · ' + vol.toFixed(2) + ' mL 남음'; setTimeout(function(){ syr.classList.remove('show'); }, 900); busy = false; }
      });
    });
    $$('.tank .obj', w).forEach(function(o){ o.addEventListener('touchstart', function(){ o.classList.add('show'); setTimeout(function(){ o.classList.remove('show'); }, 1400); }, { passive: true }); });
    var prs = $('#kitPrs'); setInterval(function(){ if (prs && S().isShown && S().isShown('kit')) prs.textContent = Math.round(99 + Math.random() * 4); }, 1500);

    /* 조제실 */
    var PILL = { A: ['진정', '#E9F1F6'], B: ['각성', '#F5C76A'], C: ['캡슐', '#2FA4DE'], D: ['물약', '#8FD3F2'] };
    var PSVG = {
      A: '<svg viewBox="0 0 40 40" fill="none"><ellipse cx="20" cy="22" rx="16" ry="15.5" fill="#C9DAE6"/><circle cx="20" cy="19.5" r="15.5" fill="url(#kTabA)"/><circle cx="20" cy="19.5" r="12" stroke="#E2ECF3" stroke-width="1.1"/><path d="M9 19.5H31" stroke="#D3E2EC" stroke-width="1.6" stroke-linecap="round"/><path d="M10.5 13a11 11 0 0 1 8-5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
      B: '<svg viewBox="0 0 40 40" fill="none"><g transform="rotate(-24 20 20)"><ellipse cx="20" cy="22" rx="17" ry="11.5" fill="#D99A2B" opacity=".55"/><ellipse cx="20" cy="20" rx="17" ry="11.5" fill="url(#kTabB)"/><ellipse cx="20" cy="20" rx="13" ry="8" stroke="#FFF2CF" stroke-width="1" opacity=".8"/><path d="M8.5 16a13 8 0 0 1 9-4.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".85"/></g></svg>',
      C: '<svg viewBox="0 0 40 40" fill="none"><g transform="rotate(-35 20 20)"><path d="M11 13H20V27H11A7 7 0 0 1 11 13Z" fill="url(#kCapB)"/><path d="M20 13H29A7 7 0 0 1 29 27H20Z" fill="url(#kWhite)" stroke="#C9DEEC" stroke-width=".9"/><rect x="19" y="12.6" width="2.2" height="14.8" rx=".8" fill="#EAF4FA" stroke="#C9DEEC" stroke-width=".7"/><rect x="7" y="15.2" width="10" height="2.2" rx="1.1" fill="#fff" opacity=".6"/><rect x="22.5" y="15.2" width="6" height="2.2" rx="1.1" fill="#fff"/></g></svg>',
      D: '<svg viewBox="0 0 40 40" fill="none"><path d="M20 4C20 4 9 17 9 24.5A11 11 0 0 0 31 24.5C31 17 20 4 20 4Z" fill="url(#kTabD)"/><path d="M20 4C20 4 9 17 9 24.5A11 11 0 0 0 31 24.5C31 17 20 4 20 4Z" fill="url(#kDot)" mask="url(#kMV)" opacity=".5"/><path d="M14 23a6.5 6.5 0 0 1 3-6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>'
    };
    $$('#labPills button').forEach(function(b){ var p = b.getAttribute('data-pill'), t = $('.pt', b); if (t && PSVG[p]) t.innerHTML = PSVG[p]; });
    /* 레시피 34종 : [이름, 설명, 색] — 알약 조합(정렬된 키)으로 판정 */
    var REC = {
      A: ['진정 정제 한 알', '가벼운 진정 효과. 유시 하품 1회 관측', '#E3EEF5'],
      B: ['각성 정제 한 알', '커피 한 잔 분량. 퓨어 몰래 마신 것과 같음', '#F5C76A'],
      C: ['비타민 캡슐', '평범하게 건강해짐. 무난 그 자체', '#7CC4EC'],
      D: ['생수 한 모금', '그냥 물이에요. 그래도 마셔요 💧', '#BFE6F8'],
      AA: ['숙면 패치', '오늘 밤은 꿈도 안 꿀 예정', '#C7D8EE'],
      AB: ['충돌 처방', '정반대 약을 섞었어요… 부작용: 퓨어 잔소리 3시간', '#E5848A'],
      AC: ['안정 캡슐', '심박수 안정. 센티넬 폭주 위험 −20%', '#9FD0EE'],
      AD: ['캐모마일 티', '따뜻하게 우려낸 허브티. 퓨어가 직접 타줌 ☕', '#D9E8C4'],
      BB: ['이중 각성제', '눈이 저절로 떠져요. 랭크 게임 5판 연속 가능', '#F2B84B'],
      BC: ['집중 캡슐', '가이딩 연습 효율 +30%', '#5FB4E3'],
      BD: ['아이스 아메리카노', '의무실 자판기 부동의 1위 메뉴', '#B98A5E'],
      CC: ['캡슐 더블', '약통이 덜그럭거린다. 효과는… 두 배?', '#2FA4DE'],
      CD: ['사랑의 묘약…?', '퓨어가 수상하게 웃는다', '#F09CB8'],
      DD: ['링거 반 팩', '수분 50% 충전 완료', '#A6DDF6'],
      AAA: ['강력 진정제', '유시 30분 안에 기절 확정 😴', '#B9D4EE'],
      AAB: ['반쯤 잠든 각성제', '눈은 떴는데 정신은 아직 침대에 있음', '#DCCFA4'],
      AAC: ['장기 수면 캡슐', '알람 7개로도 못 일어남. 퓨어가 직접 깨우러 옴', '#A9C3E6'],
      AAD: ['수면 유도제', '오늘은 새벽 5시 전에 잔다... 아마도.', '#A9C8EC'],
      ABB: ['카페인 역류', '잠은 쏟아지는데 심장은 뛴다. 최악의 조합', '#E79A6B'],
      ABC: ['밸런스 조절제', '각성과 진정이 딱 반반. 센티넬 컨디션 안정 ✓', '#8FCFC4'],
      ABD: ['미지근한 라떼', '애매하다... 퓨어 표정도 애매해짐', '#D8C3A5'],
      ACC: ['가이딩 보조제', '결속률 +12% ♥', '#6EC9E8'],
      ACD: ['회복 링거', '체력 완충! 의무실 퇴원 허가 ✚', '#7FD6C2'],
      ADD: ['수면 수액', '링거 꽂자마자 꿀잠. 3번 침대 예약됨', '#9EC9EA'],
      BBB: ['밤샘 각성제', '새벽 4시까지 게임 가능… 퓨어가 압수 예정', '#F5C76A'],
      BBC: ['폭주 캡슐', '경고! 센티넬 폭주 직전. 가이드 호출 필요 🚨', '#F07C6C'],
      BBD: ['프로틴 셰이크', '헬스장 직행. 일단 뛰자!', '#E9C98F'],
      BCC: ['시험기간 생존 키트', '밤을 새워도 멀쩡한 척 가능', '#4C9FD6'],
      BCD: ['에너지 드링크', '유시 텐션 MAX ⚡', '#F2B84B'],
      BDD: ['레몬 탄산수', '톡 쏘는 맛. 기분 전환 완료', '#E8E59A'],
      CCC: ['정체불명 캡슐', '효능 불명. 퓨어가 몰래 사탕으로 바꿔둠 🍬', '#2F8FD6'],
      CCD: ['캡슐 젤리', '말랑말랑. 퓨어가 간식으로 건네줌', '#86C8F0'],
      CDD: ['비타민 워터', '건강한 척하기 딱 좋은 음료', '#9BDCF2'],
      DDD: ['수분 보충액', '물 좀 마시라는 뜻이야 💧', '#8FD3F2']
    };
    var KEYS = Object.keys(REC), TOTAL = KEYS.length;
    var slots = [], slotEls = $$('#labSlots i'), liqG = $('#labLiqG'), lq = $('#labLiq'), out = $('#labOut'), vialEl = $('#labVial');
    var dex = LS.get('sy-lab-dex', []); if (!Array.isArray(dex)) dex = [];
    function dexUi(){ var d = $('#labDex b'); if (d) d.textContent = dex.length; }
    dexUi();
    var today = new Date(), seed = today.getFullYear() * 400 + today.getMonth() * 31 + today.getDate();
    var TRI = KEYS.filter(function(k){ return k.length === 3; });
    var mission = TRI[seed % TRI.length], doneKey = 'sy-mission-' + seed;
    $('#labMission').textContent = REC[mission][0] + (LS.get(doneKey, 0) ? ' ✓' : '');
    function mixColor(a){
      if (!a.length) return '#BFE6F8';
      var r = 0, g = 0, b = 0;
      a.forEach(function(p){ var h = PILL[p][1]; r += parseInt(h.substr(1, 2), 16); g += parseInt(h.substr(3, 2), 16); b += parseInt(h.substr(5, 2), 16); });
      function c(v){ v = Math.round(v / a.length); return (v < 16 ? '0' : '') + v.toString(16); }
      return '#' + c(r) + c(g) + c(b);
    }
    function level(n, full){ var h = full ? 58 : n / 3 * 52; liqG.style.transform = 'translateY(' + (132 - h).toFixed(1) + 'px)'; }
    function say(html, sw, cls){ out.className = 'lab-out' + (cls ? ' ' + cls : ''); out.innerHTML = '<span class="lo-sw"></span><p>' + html + '</p>'; if (sw) $('.lo-sw', out).style.setProperty('--sw', sw); }
    function draw(){
      slotEls.forEach(function(el, i){ el.innerHTML = slots[i] ? PSVG[slots[i]] : ''; });
      level(slots.length); lq.setAttribute('fill', mixColor(slots));
    }
    function add(p){
      if (slots.length >= 3){ say('플라스크가 가득 찼어요. 조제하거나 비워주세요.'); vialEl.classList.remove('shake'); void vialEl.offsetWidth; vialEl.classList.add('shake'); return; }
      slots.push(p); draw(); say(esc(PILL[p][0]) + ' 투입 · ' + slots.length + '/3', PILL[p][1]);
    }
    $$('#labPills button').forEach(function(b){
      b.addEventListener('click', function(){ add(b.getAttribute('data-pill')); });
      b.addEventListener('dragstart', function(e){ e.dataTransfer.setData('text/plain', b.getAttribute('data-pill')); vialEl.classList.add('drop'); });
      b.addEventListener('dragend', function(){ vialEl.classList.remove('drop'); });
    });
    vialEl.addEventListener('dragover', function(e){ e.preventDefault(); });
    vialEl.addEventListener('drop', function(e){ e.preventDefault(); vialEl.classList.remove('drop'); var p = e.dataTransfer.getData('text/plain'); if (PILL[p]) add(p); });
    $('#labMix').addEventListener('click', function(){
      if (!slots.length){ say('먼저 알약을 넣어주세요.'); return; }
      var k = slots.slice().sort().join(''), r = REC[k];
      vialEl.classList.remove('mix'); void vialEl.offsetWidth; vialEl.classList.add('mix');
      lq.setAttribute('fill', r[2]); level(3, true);
      setTimeout(function(){
        var ok = k === mission, isNew = dex.indexOf(k) < 0;
        if (isNew){ dex.push(k); LS.set('sy-lab-dex', dex); dexUi(); }
        say('<b>' + esc(r[0]) + (isNew ? '<em class="tg nw">NEW</em>' : '') + (ok ? '<em class="tg ok">미션 성공 ✦</em>' : '') + '</b>' + esc(r[1]) + (dex.length === TOTAL && isNew ? ' — 도감 완성! 🎉' : ''), r[2], 'res');
        if (ok){ LS.set(doneKey, 1); $('#labMission').textContent = REC[mission][0] + ' ✓'; }
        slots = []; slotEls.forEach(function(el){ el.innerHTML = ''; });
        setTimeout(function(){ if (!slots.length){ level(0); lq.setAttribute('fill', '#BFE6F8'); } }, 1600);
      }, 700);
    });
    $('#labClear').addEventListener('click', function(){ slots = []; draw(); say('플라스크를 비웠어요.'); });
  }

  /* ════════ 메모 (탭 / 체크) ════════ */
  function memoApp(){
    var w = $('#w-memo'); if (!w) return;
    var tabs = $$('#mTabs button'), pages = $$('.m-page', w), i = 0, chk = LS.get('sy-memo-check', {});
    function go(n){ i = (n + pages.length) % pages.length; tabs.forEach(function(t, k){ t.classList.toggle('on', k === i); }); pages.forEach(function(p, k){ p.classList.toggle('on', k === i); }); $('#mPage').textContent = (i + 1) + ' / ' + pages.length; }
    tabs.forEach(function(t, k){ t.addEventListener('click', function(){ go(k); }); });
    $('#mPrev').addEventListener('click', function(){ go(i - 1); }); $('#mNext').addEventListener('click', function(){ go(i + 1); });
    $$('.m-check li', w).forEach(function(li){
      var k = li.getAttribute('data-k'); if (k && k in chk) li.classList.toggle('done', !!chk[k]);
      li.setAttribute('role', 'checkbox'); li.tabIndex = 0;
      function tog(){ li.classList.toggle('done'); if (k){ chk[k] = li.classList.contains('done') ? 1 : 0; LS.set('sy-memo-check', chk); } li.setAttribute('aria-checked', li.classList.contains('done')); }
      li.setAttribute('aria-checked', li.classList.contains('done'));
      li.addEventListener('click', tog); li.addEventListener('keydown', function(e){ if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); tog(); } });
    });
    go(0);
  }

  /* ════════ 플레이어 (가사 싱크 / 비주얼라이저 / 곡별 색) ════════ */
  function playerApp(){
    var TR = window.SY_TRACKS || [], au = $('#sy-audio'), w = $('#w-player'); if (!au || !w) return;
    if (!TR.length){ var np0 = $('#tkNp'); if (np0) np0.hidden = true; return; }
    var ti = 0, loaded = -1, lyr = [], li = -1, shuffle = false, rep = 0; /* 0 끔 1 전체 2 한곡 */
    function fmt(s){ if (!isFinite(s)) return '0:00'; var m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }
    function setRange(el, v){ if (el){ el.value = v; el.style.setProperty('--v', v + '%'); } }
    function parseLrc(t){
      var out = []; String(t || '').split(/\r?\n/).forEach(function(line){
        var re = /\[(\d+):(\d+(?:\.\d+)?)\]/g, m, txt = line.replace(re, '').trim(), any = false;
        while ((m = re.exec(line))){ any = true; out.push({ t: +m[1] * 60 + +m[2], x: txt }); }
        if (!any && line.trim()) out.push({ t: 0, x: line.trim() });
      });
      return out.sort(function(a, b){ return a.t - b.t; });
    }
    function setLyr(i){
      li = i; var p = $$('#plLyr p');
      var get = function(k){ return lyr[k] ? lyr[k].x : ''; };
      p[0].textContent = get(i - 1); p[1].textContent = i >= 0 ? get(i) : (lyr.length ? '♪' : '가사가 없어요'); p[2].textContent = get(i + 1);
      var box = $('#plLyr'); box.classList.remove('tick'); void box.offsetWidth; box.classList.add('tick');
    }
    var rp = $('#plRing'), rdot = $('#plDot'), rlen = 0;
    var pcv = $('#plCover'); if (pcv) pcv.addEventListener('error', function(){ if (!/^data:/.test(pcv.src)) $('#plCd').classList.add('no-img'); }); if (pcv) pcv.addEventListener('load', function(){ if (!/^data:/.test(pcv.src)) $('#plCd').classList.remove('no-img'); });
    function ring(k){
      if (!rp) return; k = Math.max(0, Math.min(1, k || 0));
      rp.style.strokeDasharray = (k * 100).toFixed(2) + ' 100';
      try { if (!rlen) rlen = rp.getTotalLength(); var pt = rp.getPointAtLength(rlen * k); rdot.style.left = 'calc(-7px + (100% + 14px) * ' + (pt.x / 100).toFixed(4) + ')'; rdot.style.top = 'calc(-7px + (100% + 14px) * ' + (pt.y / 100).toFixed(4) + ')'; } catch(_){}
      rdot.classList.toggle('on', k > 0.001);
    }
    function setPlaying(p){ $$('#plCd, #tkNp, #w-player').forEach(function(el){ el.classList.toggle('is-playing', p); }); }
    function show(i){
      var t = TR[i]; if (!t) return;
      $('#plTitle').textContent = t.title || '—'; $('#plArtist').textContent = t.artist || ''; $('#npTitle').textContent = t.title || '—';
      if (t.cover){ $('#plCover').src = t.cover; $('#npAv').src = t.cover; $('#plBg').src = t.cover; }
      $('#plCd').classList.toggle('no-img', !t.cover);
      w.style.setProperty('--pc', t.color || '#132A40'); var np = $('#tkNp'); if (np) np.style.setProperty('--pc', t.color || '#122B42');
      $$('#plList li').forEach(function(x, k){ x.classList.toggle('on', k === i); });
      lyr = parseLrc(t.lrc); setLyr(-1);
    }
    function load(i, play){
      ti = (i + TR.length) % TR.length; show(ti);
      if (loaded !== ti){ au.src = TR[ti].url; loaded = ti; setRange($('#plSeek'), 0); ring(0); }
      if (play){ var pr = au.play(); if (pr && pr.catch) pr.catch(function(){}); }
    }
    function nextIdx(d){ if (shuffle && TR.length > 1){ var n; do { n = Math.floor(Math.random() * TR.length); } while (n === ti); return n; } return ti + d; }
    function toggle(){ if (loaded === -1){ load(ti, true); return; } if (au.paused){ var pr = au.play(); if (pr && pr.catch) pr.catch(function(){}); } else au.pause(); }
    var list = $('#plList'); list.innerHTML = '';
    TR.forEach(function(t, i){
      var li2 = D.createElement('li'), b = D.createElement('button'); b.type = 'button';
      b.innerHTML = '<small></small><span></span><em></em>'; b.children[0].textContent = pad(i + 1, 2); b.children[1].textContent = t.title || ''; b.children[2].textContent = t.artist || '';
      b.style.setProperty('--tc', t.color || '#2FA4DE');
      b.addEventListener('click', function(){ load(i, true); }); li2.appendChild(b); list.appendChild(li2);
    });
    show(0);
    var vol = LS.get('sy-vol', 50); au.volume = vol / 100; setRange($('#plVol'), vol);
    au.addEventListener('play', function(){ setPlaying(true); });
    au.addEventListener('pause', function(){ setPlaying(false); });
    au.addEventListener('ended', function(){ if (rep === 2){ au.currentTime = 0; au.play(); return; } if (rep === 0 && !shuffle && ti === TR.length - 1){ setPlaying(false); return; } setTimeout(function(){ load(nextIdx(1), true); }, 600); });
    au.addEventListener('timeupdate', function(){
      $('#plCur').textContent = fmt(au.currentTime); $('#plDur').textContent = fmt(au.duration);
      if (au.duration) setRange($('#plSeek'), (au.currentTime / au.duration * 100).toFixed(1));
      ring(au.duration ? au.currentTime / au.duration : 0);
      var k = -1; for (var i = 0; i < lyr.length; i++) if (au.currentTime + .15 >= lyr[i].t) k = i;
      if (k !== li) setLyr(k);
    });
    $('#plPlay').addEventListener('click', toggle);
    $('#npPlay').addEventListener('click', function(e){ e.stopPropagation(); toggle(); });
    $('#plPrev').addEventListener('click', function(){ if (au.currentTime > 3){ au.currentTime = 0; return; } load(nextIdx(-1), true); });
    $('#plNext').addEventListener('click', function(){ load(nextIdx(1), true); });
    $('#plShuf').addEventListener('click', function(){ shuffle = !shuffle; this.classList.toggle('on', shuffle); });
    $('#plRep').addEventListener('click', function(){ rep = (rep + 1) % 3; this.classList.toggle('on', rep > 0); this.classList.toggle('one', rep === 2); });
    $('#plSeek').addEventListener('input', function(){ this.style.setProperty('--v', this.value + '%'); if (au.duration) au.currentTime = au.duration * this.value / 100; ring(this.value / 100); });
    $('#plVol').addEventListener('input', function(){ this.style.setProperty('--v', this.value + '%'); au.volume = this.value / 100; LS.set('sy-vol', +this.value); });

    /* 비주얼라이저 (재생 중일 때 리듬에 맞춰 움직이는 막대) — 얇은 막대 · 가운데 기준 위아래 대칭 */
    var cv = $('#plViz'), cx = cv.getContext('2d'), BAR = 3, GAP = 3, N = 0, val = [], tgt = [];
    var lastT = 0;
    (function f(now){
      requestAnimationFrame(f);
      if (!S().isShown || !S().isShown('player')) return;
      var dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect(), W = Math.round(r.width), H = Math.round(r.height);
      if (!W || !H) return; if (cv.width !== W * dpr || cv.height !== H * dpr){ cv.width = W * dpr; cv.height = H * dpr; }
      var n = Math.max(12, Math.floor((W + GAP) / (BAR + GAP)));
      if (n !== N){ N = n; while (val.length < N){ val.push(.1); tgt.push(.1); } val.length = tgt.length = N; }
      var playing = !au.paused;
      if (now - lastT > 110){
        lastT = now; var beat = playing ? (Math.sin(now / 230) * .5 + .5) : 0;
        for (var i = 0; i < N; i++){
          var p = i / (N - 1), env = Math.sin(p * Math.PI) * .6 + .2, bass = Math.abs(p - .5) < .12 ? .3 * beat : 0;
          tgt[i] = playing ? Math.min(1, env * (.3 + Math.random() * .8) + bass) : .1 + Math.sin(now / 900 + i * .45) * .04;
        }
      }
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      var total = N * BAR + (N - 1) * GAP, x0 = (W - total) / 2;
      for (var i = 0; i < N; i++){
        val[i] += (tgt[i] - val[i]) * .22; var h = Math.max(BAR, val[i] * H);
        cx.fillStyle = 'rgba(255,255,255,' + (.4 + val[i] * .55) + ')';
        var x = x0 + i * (BAR + GAP), y = (H - h) / 2;
        if (cx.roundRect){ cx.beginPath(); cx.roundRect(x, y, BAR, h, BAR / 2); cx.fill(); } else cx.fillRect(x, y, BAR, h);
      }
    })(0);
  }

  /* ════════ 인터넷 (OTT / 게임 전적) ════════ */
  function webApp(){
    var W = window.SY_WEB, w = $('#w-web'); if (!W || !w) return;
    var ott = $('#wbOtt'), gg = $('#wbGame'), URL = { ott: ['Pureflix.tv', '/browse/pure'], game: ['arch.gg', '/summoner/명령하지마라-YEON'] };
    function sec(t){ var p = String(t).split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0); }
    function tf(s){ s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + pad(r, 2); }
    function poster(s, cls){ return s.poster ? '<img class="' + cls + '" src="' + esc(s.poster) + '" alt="">' : '<span class="' + cls + ' ph">' + esc(s.title.charAt(0)) + '</span>'; }
    var O = W.ott, cur = 0, playing = null;
    function renderOtt(){
      var h = O.shows[cur], p = sec(h.watched) / sec(h.total) * 100;
      ott.innerHTML = '<div class="ot-bar"><b>' + esc(O.name) + '</b><nav><span class="on">홈</span><span>시리즈</span><span>영화</span><span>내가 찜한</span></nav><i class="ot-pf p-pure k-pf"></i></div>' +
        '<div class="ot-hero">' + poster(h, 'ot-bg') + '<div class="ot-shade"></div><div class="ot-info"><small>' + esc(h.tag || '') + '</small><b>' + esc(h.title) + '</b><span>' + esc(h.ep) + '</span>' +
        '<div class="ot-prog"><i style="width:' + p.toFixed(1) + '%"></i></div><div class="ot-time"><span class="ot-w">' + esc(h.watched) + '</span> / ' + esc(h.total) + '</div>' +
        '<div class="ot-btns"><button type="button" class="ot-play">' + (playing ? '❚❚ 일시정지' : '▶ 이어보기') + '</button><button type="button" class="ot-more">＋ 찜</button></div></div></div>' +
        '<p class="ot-cap">' + esc(O.user) + ' 님이 시청 중인 콘텐츠</p><div class="ot-row">' + O.shows.map(function(s, i){
          var q = sec(s.watched) / sec(s.total) * 100;
          return '<button type="button" class="ot-card' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + poster(s, 'ot-th') + '<span class="ot-cp"><i style="width:' + q.toFixed(1) + '%"></i></span><b>' + esc(s.title) + '</b><small>' + esc(s.ep) + ' · ' + esc(s.watched) + ' / ' + esc(s.total) + '</small></button>';
        }).join('') + '</div>';
      $$('.ot-card', ott).forEach(function(c){ c.addEventListener('click', function(){ cur = +c.getAttribute('data-i'); stop(); renderOtt(); }); });
      $('.ot-play', ott).addEventListener('click', function(){ if (playing) stop(); else start(); renderOtt(); });
    }
    function stop(){ if (playing){ clearInterval(playing); playing = null; } }
    function start(){
      playing = setInterval(function(){
        var s = O.shows[cur], t = sec(s.watched) + 1; if (t >= sec(s.total)) { stop(); renderOtt(); return; }
        s.watched = tf(t); var e = $('.ot-w', ott), pr = $('.ot-prog i', ott); if (e) e.textContent = s.watched; if (pr) pr.style.width = (t / sec(s.total) * 100) + '%';
      }, 1000);
    }
    var G = W.game;
    function renderGame(){
      var tot = G.win + G.lose, wr = Math.round(G.win / tot * 100);
      gg.innerHTML = '<div class="gg-bar"><b>ARCH<span>.GG</span></b><span class="gg-search">' + esc(G.user) + '</span></div>' +
        '<div class="gg-prof"><i class="k-pf p-uxi gg-av"></i><div class="gg-name"><b>' + esc(G.user) + '</b><small>주 포지션 · ' + esc(G.main) + '</small><button type="button" class="gg-upd">전적 갱신</button></div>' +
        '<div class="gg-tier"><span class="gg-emb"><i></i></span><div><b>' + esc(G.tier) + '</b><small>' + G.lp + ' LP</small></div></div>' +
        '<div class="gg-wr" style="--wr:' + wr + '"><span><b>' + wr + '%</b><small>' + G.win + '승 ' + G.lose + '패</small></span></div></div>' +
        '<p class="gg-cap">최근 게임</p><ul class="gg-list">' + G.matches.map(function(m){
          return '<li class="' + (m.res === 'W' ? 'w' : 'l') + '"><span class="gg-res"><b>' + (m.res === 'W' ? '승리' : '패배') + '</b><small>' + esc(m.mode) + '</small><small>' + esc(m.time) + '</small></span><span class="gg-ch"><i>' + esc(m.char.charAt(0)) + '</i>' + esc(m.char) + '</span><span class="gg-kda"><b>' + esc(m.kda) + '</b><small>K / D / A</small></span><span class="gg-ago">' + esc(m.ago) + '</span></li>';
        }).join('') + '</ul>' +
        (G.guide ? '<div class="gg-guide"><small>추천 공략</small><b>' + esc(G.guide.title) + '</b><p>' + esc(G.guide.body) + '</p><span>by ' + esc(G.guide.by) + ' · 조회 ' + esc(G.guide.views) + '</span></div>' : '');
      $('.gg-upd', gg).addEventListener('click', function(){
        var b = this; b.classList.add('ing'); b.textContent = '갱신 중…';
        setTimeout(function(){
          var win = Math.random() < .62; G.matches.unshift({ res: win ? 'W' : 'L', mode: '솔로 랭크', char: pick(['센티넬', '탱커', '암살자']), kda: Math.round(rnd(2, 15)) + ' / ' + Math.round(rnd(0, 7)) + ' / ' + Math.round(rnd(2, 18)), time: Math.round(rnd(19, 35)) + '분', ago: '방금 전' });
          G.matches = G.matches.slice(0, 6); if (win){ G.win++; G.lp += 21; } else { G.lose++; G.lp -= 17; }
          renderGame();
        }, 1100);
      });
    }
    function tab(t){
      $$('#wbTabs .wb-tab').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-t') === t); });
      ott.classList.toggle('on', t === 'ott'); gg.classList.toggle('on', t === 'game');
      $('#wbUrl').textContent = URL[t][0]; $('#wbPath').textContent = URL[t][1]; w.setAttribute('data-site', t);
      $('.wbody', w).scrollTop = 0;
    }
    $$('#wbTabs .wb-tab').forEach(function(b){ b.addEventListener('click', function(){ tab(b.getAttribute('data-t')); }); });
    $('#wbReload').addEventListener('click', function(){ var b = $('.wbody', w); b.classList.add('reload'); setTimeout(function(){ b.classList.remove('reload'); }, 500); });
    renderOtt(); renderGame(); tab('ott');
  }

  /* ════════ 링크 허브 ════════ */
  function hubApp(){
    var H = window.SY_HUB || [], box = $('#hubList'); if (!box) return;
    box.innerHTML = H.map(function(h, i){
      var ext = h.url && h.url !== '#';
      return '<a class="hb-item" href="' + esc(h.url || '#') + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + (h.img ? '<span class="hb-ic img"><img src="' + esc(h.img) + '" alt="" loading="lazy"></span>' : '<span class="hb-ic">' + esc(h.icon || '✚') + '</span>') + '<span class="hb-t"><small>' + pad(i + 1, 2) + '</small><b>' + esc(h.name) + '</b><em>' + esc(h.sub || '') + '</em></span><span class="hb-go">↗</span></a>';
    }).join('');
    $('#hubCount').textContent = H.length + ' LINKS';
    $$('.hb-item', box).forEach(function(a){ if (a.getAttribute('href') === '#') a.addEventListener('click', function(e){ e.preventDefault(); if (S().toast) S().toast('SY_HUB에 주소를 넣어주세요'); }); });
  }

  window.SY_APPS = {
    notify: notify, markNew: markNew, boot: showBoot,
    init: function(){
      try { initStart(); } catch(e){ console.warn(e); }
      try { markNew(); } catch(e){ console.warn(e); }
      try { playerApp(); } catch(e){ console.warn(e); }
      try { webApp(); } catch(e){ console.warn(e); }
      try { hubApp(); } catch(e){ console.warn(e); }
      if (S().isHome){
        try { chat.init(); } catch(e){ console.warn(e); }
        try { ddayApp(); } catch(e){ console.warn(e); }
        try { kitApp(); } catch(e){ console.warn(e); }
        try { memoApp(); } catch(e){ console.warn(e); }
      }
      try { initBoot(); } catch(e){ console.warn(e); }
      try { initNoti(); } catch(e){ console.warn(e); }
    }
  };
})();

/* 메신저·알림 속 가짜 링크 밑줄 (https:// 로 시작하는 글자) */
(function(){
  function wrap(el){
    if (!el || el.querySelector('.fk-link') || !/https?:\/\//.test(el.textContent)) return;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), list = [], n;
    while ((n = w.nextNode())) if (/https?:\/\//.test(n.nodeValue)) list.push(n);
    list.forEach(function(t){
      var f = document.createDocumentFragment(), parts = t.nodeValue.split(/(https?:\/\/[^\s<]+)/);
      parts.forEach(function(s, i){
        if (!s) return;
        if (i % 2){ var u = document.createElement('u'); u.className = 'fk-link'; u.textContent = s; f.appendChild(u); }
        else f.appendChild(document.createTextNode(s));
      });
      t.parentNode.replaceChild(f, t);
    });
  }
  function scan(root){ (root.querySelectorAll ? root.querySelectorAll('.k-msg, .n-msg') : []).forEach(wrap); if (root.matches && root.matches('.k-msg, .n-msg')) wrap(root); }
  new MutationObserver(function(ms){ ms.forEach(function(m){ m.addedNodes.forEach(function(x){ if (x.nodeType === 1) scan(x); }); }); }).observe(document.body, { childList: true, subtree: true });
  scan(document.body);
})();

/* 우클릭 방지 */
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});