/* BGM — 상단바 LP 칩 · (데스크톱) 끌어서 옮기는 LP · (모바일) 아래에서 올라오는 시트
   · 설정 : assets/js/bgm-config.js (관리 화면 'BGM')
   · 브라우저는 방문자가 한 번 누르기 전엔 소리를 막아요 → 입장 버튼(또는 화면 첫 클릭)을 누르는 순간 서서히 시작
   · 사이트 안의 다른 음악(Player 앱 · 글 속 음악)이 나오면 BGM은 조용히 멈추고, 칩 · LP가 그 노래를 가리켜요
     그 음악이 끝나거나 다른 데서 멈추면 BGM이 멈췄던 자리부터 다시 (설정 resume)
   · 방문자가 끄면 그 브라우저에서는 다음에도 꺼진 채로 시작해요 */
(function(){
  'use strict';
  var C = window.SY_BGM_CONF || {};
  if (C.on === false) return;
  var D = document, H = D.documentElement;
  var LS = {
    get: function(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
    set: function(k, v){ try { localStorage.setItem(k, v); } catch(e){} },
    del: function(k){ try { localStorage.removeItem(k); } catch(e){} }
  };
  function $(s, r){ return (r || D).querySelector(s); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mq(){ return window.matchMedia('(min-width:861px) and (min-height:600px)').matches; }

  /* ── 지금 시즌의 곡 · 라벨 ── */
  var sm = (H.className.match(/\bseason-([\w-]+)/) || [])[1] || 'base';
  var TR = C.tracks || {}, LB = C.labels || {};
  var track = (TR[sm] && TR[sm].src) ? TR[sm] : (TR.base && TR.base.src ? TR.base : null);
  var label = (C.perSeason && LB[sm]) ? LB[sm] : (LB.base || { type: 'color', color: '#2FA4DE', cross: true });

  /* ── 오디오 ── */
  var au = track ? new Audio() : null;
  if (au){ au.loop = true; au.preload = 'none'; au.src = track.src; }
  var VOL = +(LS.get('sy-bgm-vol') || C.vol || 40);
  var st = { started: false, want: LS.get('sy-bgm-off') !== '1', ext: null, fadeT: 0, chipPaused: false };
  if (au){ au.volume = 0; au.addEventListener('play', function(){ ui(); }); au.addEventListener('pause', function(){ ui(); }); }

  function fade(to, ms, done){
    if (!au) return; clearInterval(st.fadeT);
    var from = au.volume, t0 = Date.now(); to = Math.max(0, Math.min(1, to));
    st.fadeT = setInterval(function(){
      var k = Math.min(1, (Date.now() - t0) / ms); au.volume = from + (to - from) * k;
      if (k >= 1){ clearInterval(st.fadeT); if (done) done(); }
    }, 40);
  }
  function bgmPlay(ms){
    if (!au || st.ext) return;
    var p = au.play(); if (p && p.catch) p.catch(function(){ ui(); });
    st.out = false; fade(VOL / 100, ms || 1600); ui();
  }
  function bgmPause(ms){ if (!au || au.paused) return; st.out = true; ui(); fade(0, ms || 700, function(){ au.pause(); st.out = false; ui(); }); }
  function bgmOn(){ return !!au && !au.paused && !st.out && !st.ext; }

  /* 처음 시작 : 입장 버튼 / 화면 첫 클릭 */
  function start(){
    if (st.started) return; st.started = true;
    D.removeEventListener('pointerdown', gate, true); D.removeEventListener('keydown', gate, true);
    if (C.auto !== false && st.want) bgmPlay(2200);
    ui();
  }
  function gate(e){
    var b = $('#syBoot');
    if (b && !b.hidden && !b.classList.contains('ready')) return;   /* 로딩 중엔 기다렸다가 ENTER 에서 */
    /* LP · 시트의 재생 버튼을 처음 누른 거면 그 버튼이 알아서 틀어요 */
    if (e && e.target && e.target.closest && e.target.closest('.bl-disc, .bl-grip, .bl-pp, .bs-pp, .bs-auto')) { st.started = true; D.removeEventListener('pointerdown', gate, true); D.removeEventListener('keydown', gate, true); return; }
    start();
  }
  D.addEventListener('pointerdown', gate, true); D.addEventListener('keydown', gate, true);

  /* ── 다른 음악 감지 (Player 앱 · 글 속 음악 · 그 밖의 audio / video) ── */
  function media(){ return Array.prototype.slice.call(D.querySelectorAll('audio, video')); }
  D.addEventListener('play', function(e){
    var t = e.target; if (!t || t === au || !(t instanceof HTMLMediaElement)) return;
    st.ext = t; st.chipPaused = false;
    if (au && !au.paused){ st.out = true; fade(0, 600, function(){ st.out = false; if (st.ext) au.pause(); ui(); }); }
    ui();
  }, true);
  function extStop(e){
    var t = e.target; if (!t || t !== st.ext) return;
    var other = media().filter(function(m){ return m !== au && !m.paused; })[0];
    if (other){ st.ext = other; ui(); return; }
    st.ext = null;
    if (C.resume !== false && st.want && !st.chipPaused && st.started) setTimeout(function(){ if (!st.ext) bgmPlay(1800); }, 300);
    st.chipPaused = false; ui();
  }
  D.addEventListener('pause', extStop, true); D.addEventListener('ended', extStop, true);

  /* 지금 가리키는 노래 정보 */
  function info(){
    var x = st.ext;
    if (x && !x.paused){
      if (x.id === 'sy-audio'){
        var cv = $('#plCover'), src = cv && cv.getAttribute('src');
        return { kind: 'PLAYER', title: ($('#plTitle') || {}).textContent || '—', artist: ($('#plArtist') || {}).textContent || '', cover: src && !/^data:/.test(src) ? src : '', player: true, on: true };
      }
      var w = x.closest && x.closest('.win'), nm = w && w.querySelector('.wname, .wbar b');
      return { kind: 'MUSIC', title: (nm && nm.textContent.trim()) || '글 속 음악', artist: '', cover: '', on: true };
    }
    return { kind: 'BGM', title: track ? (track.title || 'BGM') : 'BGM 없음', artist: track ? (track.artist || '') : '관리 화면에서 곡을 넣어 주세요', cover: '', on: bgmOn() };
  }

  /* ── LP 그림 ── */
  var uid = 0;
  function disc(cover){
    var id = 'bgmL' + (++uid), img = cover || (label.type === 'image' && label.image ? label.image : ''), cross = cover ? false : label.cross !== false;
    return '<svg class="bgm-disc" viewBox="-100 -100 200 200" aria-hidden="true">' +
      '<defs><clipPath id="' + id + '"><circle r="40"/></clipPath></defs>' +
      '<circle r="98" fill="#0E1A26"/><circle r="88" class="gv"/><circle r="76" class="gv"/><circle r="64" class="gv"/>' +
      '<path d="M-70 -50A86 86 0 0 1 -20 -84" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="6" stroke-linecap="round"/>' +
      (img ? '<g clip-path="url(#' + id + ')"><rect x="-40" y="-40" width="80" height="80" fill="' + esc(label.color || '#2FA4DE') + '"/><image href="' + esc(img) + '" x="-40" y="-40" width="80" height="80" preserveAspectRatio="xMidYMid slice"/></g>'
           : '<circle r="40" fill="' + esc(label.color || '#2FA4DE') + '"/>') +
      (cross ? '<rect x="-6" y="-22" width="12" height="44" rx="2" fill="#fff"/><rect x="-22" y="-6" width="44" height="12" rx="2" fill="#fff"/>' : '') +
      '<circle r="4" fill="#0E1A26"/></svg>';
  }
  var I_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var I_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  var I_VOL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/></svg>';

  /* ── 재생 / 멈춤 (칩 · LP · 시트 공통) ── */
  function toggle(){
    if (!st.started){ st.started = true; D.removeEventListener('pointerdown', gate, true); D.removeEventListener('keydown', gate, true); }
    var x = st.ext;
    if (x && !x.paused){ st.chipPaused = true; x.pause(); return; }      /* 다른 음악 멈춤 → 조용히 (BGM 다시 안 틀어요) */
    if (bgmOn()){ st.want = false; LS.set('sy-bgm-off', '1'); bgmPause(500); return; }
    if (!au) return;
    st.want = true; LS.del('sy-bgm-off'); st.ext = null; bgmPlay(900);
  }
  function setVol(v){
    VOL = Math.max(0, Math.min(100, +v)); LS.set('sy-bgm-vol', VOL);
    if (au && !au.paused){ clearInterval(st.fadeT); au.volume = VOL / 100; }
  }
  function openPlayer(){ var b = D.querySelector('[data-open="player"]'); if (b) b.click(); }

  /* ── 화면 요소 만들기 ── */
  var chip, lp, sheet;
  function build(){
    var bar = $('.sy-bar'); if (!bar) return;
    chip = D.createElement('button'); chip.type = 'button'; chip.className = 'bgm-chip';
    chip.innerHTML = '<span class="bc-disc"></span><span class="bc-k"></span><span class="bc-t"></span><span class="bc-eq" aria-hidden="true"><i></i><i></i><i></i></span>';
    bar.insertBefore(chip, $('.sy-tray', bar));
    chip.addEventListener('click', function(){
      if (mq()){ var on = !lp.classList.contains('show'); lp.classList.toggle('show', on); LS.set('sy-bgm-lp', on ? '1' : '0'); if (on) place(); ui(); }
      else openSheet(true);
    });

    /* 데스크톱 : 끌어서 옮기는 LP */
    lp = D.createElement('div'); lp.className = 'bgm-lp';
    lp.innerHTML = '<span class="bl-grip" aria-hidden="true"><i></i>DRAG</span><button type="button" class="bl-disc" aria-label="BGM 재생 / 멈춤"></button>' +
      '<div class="bl-pan"><small class="bl-k"></small><b class="bl-t"></b><div class="bl-row"><button type="button" class="bl-pp"></button>' + I_VOL +
      '<input type="range" class="bl-vol" min="0" max="100" aria-label="볼륨"><button type="button" class="bl-lyr">가사 보기</button></div></div>';
    D.body.appendChild(lp);
    if (LS.get('sy-bgm-lp') !== '0') lp.classList.add('show');
    var dd = null;
    lp.addEventListener('pointerdown', function(e){
      if (e.button || e.target.closest('.bl-pan')) return;
      var r = lp.getBoundingClientRect(); dd = { x: e.clientX, y: e.clientY, ox: r.left, oy: r.top, mv: false };
      try { lp.setPointerCapture(e.pointerId); } catch(_){}
    });
    lp.addEventListener('pointermove', function(e){
      if (!dd) return; var dx = e.clientX - dd.x, dy = e.clientY - dd.y;
      if (!dd.mv && Math.abs(dx) + Math.abs(dy) < 6) return;
      dd.mv = true; lp.classList.add('drag'); pos(dd.ox + dx, dd.oy + dy);
    });
    function up(e){
      if (!dd) return; var moved = dd.mv; dd = null; lp.classList.remove('drag');
      if (moved){ var r = lp.getBoundingClientRect(); LS.set('sy-bgm-pos', JSON.stringify({ x: r.left / innerWidth, y: r.top / innerHeight })); }
      else if (e.type === 'pointerup' && e.target.closest('.bl-disc, .bl-grip')) toggle();
    }
    lp.addEventListener('pointerup', up); lp.addEventListener('pointercancel', up);
    $('.bl-disc', lp).addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
    $('.bl-pp', lp).addEventListener('click', toggle);
    $('.bl-lyr', lp).addEventListener('click', openPlayer);
    var vv = $('.bl-vol', lp); vv.value = VOL; vv.style.setProperty('--v', VOL + '%');
    vv.addEventListener('input', function(){ this.style.setProperty('--v', this.value + '%'); setVol(this.value); var s2 = sheet && $('.bs-vol', sheet); if (s2){ s2.value = this.value; s2.style.setProperty('--v', this.value + '%'); } });
    addEventListener('resize', function(){ if (lp.classList.contains('show')) place(); });

    /* 모바일 : 시트 */
    sheet = D.createElement('div'); sheet.className = 'bgm-sheet'; sheet.hidden = true;
    sheet.innerHTML = '<div class="bs-dim"></div><section class="bs-in" role="dialog" aria-label="BGM"><i class="bs-hd" aria-hidden="true"></i>' +
      '<div class="bs-top"><span class="bs-disc"></span><div class="bs-tx"><small class="bs-k"></small><b class="bs-t"></b><span class="bs-a"></span></div><button type="button" class="bs-pp"></button></div>' +
      '<div class="bs-row">' + I_VOL + '<input type="range" class="bs-vol" min="0" max="100" aria-label="볼륨"></div>' +
      '<div class="bs-btns"><button type="button" class="bs-lyr">가사 보기 · Player 열기</button><button type="button" class="bs-auto"></button></div></section>';
    D.body.appendChild(sheet);
    $('.bs-dim', sheet).addEventListener('click', function(){ openSheet(false); });
    $('.bs-pp', sheet).addEventListener('click', toggle);
    $('.bs-lyr', sheet).addEventListener('click', function(){ openSheet(false); openPlayer(); });
    $('.bs-auto', sheet).addEventListener('click', function(){
      st.want = !st.want; if (st.want) LS.del('sy-bgm-off'); else LS.set('sy-bgm-off', '1'); ui();
    });
    var sv = $('.bs-vol', sheet); sv.value = VOL; sv.style.setProperty('--v', VOL + '%');
    sv.addEventListener('input', function(){ this.style.setProperty('--v', this.value + '%'); setVol(this.value); vv.value = this.value; vv.style.setProperty('--v', this.value + '%'); });
    D.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !sheet.hidden) openSheet(false); });
    ui();
  }
  function openSheet(on){
    if (on){ sheet.hidden = false; requestAnimationFrame(function(){ sheet.classList.add('on'); }); ui(); }
    else { sheet.classList.remove('on'); setTimeout(function(){ if (!sheet.classList.contains('on')) sheet.hidden = true; }, 280); }
  }
  /* LP 위치 : 저장한 자리 (화면 비율) · 처음엔 오른쪽 아래 쪽 */
  function pos(x, y){
    var w = lp.offsetWidth || 130, h = lp.offsetHeight || 130, top = 64, bot = 84;
    /* 컨트롤이 늘 LP 오른쪽에 펼쳐지도록, 펼친 너비만큼은 오른쪽 끝에서 띄워 둬요 (방향이 뒤집히지 않게) */
    var pan = lp.querySelector('.bl-pan'), full = 96 + ((pan && pan.offsetWidth) || 230);
    x = Math.max(8, Math.min(innerWidth - full - 12, x)); y = Math.max(top, Math.min(innerHeight - h - bot, y));
    lp.style.left = x + 'px'; lp.style.top = y + 'px';
  }
  function place(){
    var p = null; try { p = JSON.parse(LS.get('sy-bgm-pos') || 'null'); } catch(e){}
    if (p) pos(p.x * innerWidth, p.y * innerHeight); else pos(innerWidth * .58, innerHeight * .62);
  }

  /* ── 화면 갱신 ── */
  var lastDisc = '';
  function ui(){
    if (!chip) return;
    var n = info(), on = n.on, dk = n.cover + '|' + n.kind;
    if (dk !== lastDisc){
      lastDisc = dk; var d = disc(n.cover);
      $('.bc-disc', chip).innerHTML = d; $('.bl-disc', lp).innerHTML = d; $('.bs-disc', sheet).innerHTML = d;
    }
    [chip, lp, sheet].forEach(function(el){ el.classList.toggle('is-on', !!on); el.classList.toggle('is-ext', n.kind !== 'BGM'); });
    var empty = !au && n.kind === 'BGM';   /* 곡이 없고 다른 음악도 없으면 칩 · LP 숨김 */
    chip.hidden = empty; lp.classList.toggle('is-empty', empty); if (empty) openSheet(false);
    $('.bc-k', chip).textContent = n.kind; $('.bc-t', chip).textContent = n.title;
    chip.setAttribute('aria-label', n.kind + ' · ' + n.title + (mq() ? ' · LP 꺼내기 / 넣기' : ' · 열기'));
    chip.setAttribute('aria-pressed', lp.classList.contains('show') ? 'true' : 'false');
    var kTxt = n.kind === 'BGM' ? 'NOW · ' + (sm === 'base' ? '기본' : ({ winter: '겨울', summer: '여름' }[sm] || sm)) + ' BGM' : 'NOW · ' + n.kind;
    $('.bl-k', lp).textContent = kTxt; $('.bl-t', lp).textContent = n.title;
    $('.bs-k', sheet).textContent = kTxt; $('.bs-t', sheet).textContent = n.title; $('.bs-a', sheet).textContent = n.artist;
    [$('.bl-pp', lp), $('.bs-pp', sheet)].forEach(function(b){ b.innerHTML = on ? I_PAUSE : I_PLAY; b.setAttribute('aria-label', on ? '멈춤' : '재생'); b.disabled = !au && !n.on; });
    $('.bl-lyr', lp).hidden = !n.player; $('.bs-lyr', sheet).hidden = !n.player;
    var ab = $('.bs-auto', sheet); ab.textContent = '들어올 때 자동 재생 · ' + (st.want ? '켜짐' : '꺼짐'); ab.classList.toggle('off', !st.want); ab.hidden = !au;
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', build); else build();
  window.SY_BGM = { toggle: toggle, play: function(){ st.want = true; bgmPlay(900); }, pause: function(){ bgmPause(500); }, state: function(){ return { started: st.started, on: bgmOn(), ext: !!st.ext, track: track && track.src, season: sm }; } };
})();