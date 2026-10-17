/* ══════════════════════════════════════════════════════════════
   SYRINGE — ARCH of LEGENDS (유시가 하는 게임 · 클라이언트 + 미니게임 '의무실 방어전')

   ✎ 캐릭터 이미지 : png 를 assets/images 에 올리고 아래 주소를 적으면 그 그림으로 나와요.
     (비우면 홈 설정의 퓨어/유시 프로필 이미지 → 그것도 없으면 기본 동그라미)
     정사각형 · 배경 투명 png 추천 (256×256 정도면 충분해요)
══════════════════════════════════════════════════════════════ */
window.SY_AOL = window.SY_AOL || {
  uxiImg: 'assets/images/aol-uxi.png',            /* 예: 'assets/images/aol-uxi.png' */
  pureImg: 'assets/images/aol-pure.png',           /* 예: 'assets/images/aol-pure.png' */
  patch: '14.20',

  /* ── 오른쪽 위 내 프로필 (img 비우면 메신저 유시 사진) ── */
  me: { name: '명령하지마라', level: 168, img: 'assets/images/aol-profile-uxi.png' },   /* 예: img: 'assets/images/aol-me.png' */

  /* ── 재화 (gp = 금색 동전, rp = 민트 보석) ── */
  money: { gp: '4,240', rp: '520' },

  /* ── 소셜 친구 목록 ──
     state : 'on' 온라인(초록) / 'game' 게임 중(파랑) / 'off' 오프라인(흐리게)
     img   : 사진 주소. 비우면 이름 첫 글자 동그라미
             (avatar: 'pure' / 'uxi' 는 메신저 사진을 빌려 쓰는 것 — img 를 적으면 img 가 우선) */
  friends: [
    { name: '무리하지마', img: 'assets/images/aol-profile-pure.png', state: 'on', text: '의무실 · 게임 대기 중' },
    { name: '얼음군주산타님', img: 'assets/images/santa.png', state: 'game', text: '게임 중 · 12:25' },
    { name: '아이기스불주먹', img: 'assets/images/veronica.png', state: 'game', text: '게임 중 · 12:25' },
    { name: 'GGOcode', emoji: '💻', state: 'game', text: '게임 중 · 10:01' },
    { name: 'GGOcandy', emoji: '🍬', state: 'game', text: '게임 중 · 10:01' },
    { name: '바보온달', emoji: '💙', state: 'on', text: '온라인' },
    { name: '평강공주', emoji: '💗', state: 'on', text: '온라인' },
    { name: 'zzunsiki', img: 'assets/images/zzun.png', state: 'off', text: '오프라인' },
    { name: 'romdrom', img: 'assets/images/drom.png', state: 'off', text: '오프라인' },
    { name: '정의의 사도', img: 'assets/images/jf.jpg', state: 'off', text: '오프라인' },
    { name: '고기먹고싶다', emoji: '🌿', state: 'off', text: '오프라인' },
    { name: '연청아123', emoji: '💧', state: 'off', text: '오프라인' },
    { name: 'Demon', emoji: '😈', state: 'off', text: '오프라인' },
    { name: 'Cherry', emoji: '🍒', state: 'off', text: '오프라인' },
    { name: 'Ritsu', emoji: '🎸', state: 'off', text: '오프라인' },
    { name: 'Miyu', emoji: '🎨', state: 'off', text: '오프라인' },
    { name: '여동이', emoji: '🍒', state: 'off', text: '오프라인' }
  ]
};

(function(){
  'use strict';
  var D = document;
  function $(s, r){ return (r || D).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(t){ var d = D.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  function S(){ return window.SY || {}; }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function dist(a, b){ var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  var LS = { get: function(k, d){ try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch(e){ return d; } }, set: function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };
  var HKEY = 'sy-aol-history';
  var CFG = window.SY_AOL || {};

  /* ════════ 클라이언트 ════════ */
  function clientHTML(){
    var me = CFG.me || {}, mo = CFG.money || {};
    function bg(u){ return ' style="background-image:url(\'' + esc(String(u).replace(/'/g, '%27')) + '\')"'; }
    var fr = (CFG.friends || []).map(function(f){
      var av = f.img ? '<i class="k-pf"' + bg(f.img) + '></i>' : f.avatar ? '<i class="k-pf p-' + esc(f.avatar) + '"></i>' : f.emoji ? '<i class="ac-ini emo">' + esc(f.emoji) + '</i>' : '<i class="ac-ini">' + esc((f.name || '?').charAt(0)) + '</i>';
      return '<li class="' + esc(f.state || 'off') + '">' + av + '<span><b>' + esc(f.name) + '</b><small>' + esc(f.text || '') + '</small></span></li>';
    }).join('');
    var on = (CFG.friends || []).filter(function(f){ return f.state !== 'off'; }).length;
    return '' +
    '<div class="ac-screen" data-s="client">' +
      '<nav class="ac-nav">' +
        '<button type="button" class="ac-play" data-act="play"><span>PLAY</span></button>' +
        '<span class="ac-tabs"><button type="button" class="on">홈</button><button type="button" data-act="stats">전적</button><button type="button" class="off" title="준비 중">챔피언</button><button type="button" class="off" title="준비 중">상점</button></span>' +
        '<span class="ac-cur"><i class="gp"></i>' + esc(mo.gp == null ? '0' : mo.gp) + '<i class="rp"></i>' + esc(mo.rp == null ? '0' : mo.rp) + '</span>' +
        '<span class="ac-me">' + (me.img ? '<i class="k-pf"' + bg(me.img) + '></i>' : '<i class="k-pf p-uxi"></i>') + '<span><b>' + esc(me.name || 'UXI') + '</b><small>Lv. ' + esc(me.level || CFG.uxiLevel || 1) + '</small></span></span>' +
      '</nav>' +
      '<div class="ac-body">' +
        '<div class="ac-main">' +
          '<div class="ac-hero">' +
            '<span class="ac-kicker">NEW GAME MODE · PATCH ' + esc(CFG.patch || '') + '</span>' +
            '<b class="ac-title">의무실 방어전</b>' +
            '<span class="ac-en">INFIRMARY DEFENSE</span>' +
            '<p>몰려오는 바이러스를 막고 의무실을 지키자.</p>' +
            '<button type="button" class="ac-go" data-act="play">지금 플레이 ›</button>' +
            '<div class="ac-art" aria-hidden="true"><i class="ar1"></i><i class="ar2"></i><i class="ar3"></i><span>✦</span></div>' +
          '</div>' +
          '<div class="ac-recent"><p class="ac-cap">최근 전적 <em>의무실 방어전</em></p><ul id="acHist"></ul></div>' +
        '</div>' +
        '<aside class="ac-social"><p class="ac-cap">소셜 <em>' + on + ' / ' + (CFG.friends || []).length + '</em></p><ul>' + fr + '</ul></aside>' +
      '</div>' +
    '</div>' +
    /* 매칭 */
    '<div class="ac-queue" hidden><div class="aq-box"><span class="aq-ring"><b id="aqT">0:00</b></span><p class="aq-t">게임 찾는 중</p><p class="aq-s">일반 · 의무실 방어전</p><button type="button" class="aq-x" data-act="cancel">취소</button></div></div>' +
    '<div class="ac-found" hidden><div class="aq-box found"><p class="aq-k">MATCH FOUND</p><p class="aq-t">매치를 찾았습니다!</p><button type="button" class="aq-ok" data-act="accept">수락</button><button type="button" class="aq-no" data-act="cancel">거절</button><span class="aq-bar"><i id="aqBar"></i></span></div></div>' +
    /* 로딩 */
    '<div class="ac-load" hidden>' +
      '<div class="al-cards">' +
        '<div class="al-card uxi"><div class="al-pic" data-who="uxi"></div><b>명령하지마라</b><small>SENTINEL · 암살자</small><span class="al-pb"><i></i></span></div>' +
        '<div class="al-card pure"><div class="al-pic" data-who="pure"></div><b>무리하지마</b><small>GUIDE · 서포터</small><span class="al-pb"><i></i></span></div>' +
      '</div>' +
      '<p class="al-tip">TIP · 서포터 근처에 있으면 체력이 회복됩니다.</p>' +
    '</div>' +
    /* 게임 */
    '<div class="ac-game" hidden>' +
      '<canvas id="agCv" width="960" height="540"></canvas>' +
      '<div class="ag-top"><span class="ag-score"><b id="agK">0</b>/<b id="agDth">0</b> · CS <b id="agCs">0</b> · <i class="gp"></i><b id="agGold">0</b></span><span class="ag-wave" id="agWave">WAVE 1/6</span><span class="ag-time" id="agTime">00:00</span></div>' +
      '<div class="ag-banner" id="agBan"></div>' +
      '<div class="ag-hud">' +
        '<div class="ag-port"><div class="al-pic" data-who="uxi"></div><em id="agLv">1</em></div>' +
        '<div class="ag-mid">' +
          '<div class="ag-skills">' +
            '<button type="button" data-sk="q"><i>Q</i><span>저격</span><b class="ag-cd"></b></button>' +
            '<button type="button" data-sk="w"><i>W</i><span>돌진</span><b class="ag-cd"></b></button>' +
            '<button type="button" data-sk="e"><i>E</i><span>과부하</span><b class="ag-cd"></b></button>' +
            '<button type="button" data-sk="r" class="lock"><i>R</i><span>가이드 링크</span><b class="ag-cd"></b></button>' +
          '</div>' +
          '<div class="ag-hp"><i id="agHpF"></i><b id="agHpT">0 / 0</b></div>' +
          '<div class="ag-xp"><i id="agXpF"></i></div>' +
        '</div>' +
        '<button type="button" class="ag-quit" data-act="quit" title="항복">항복</button>' +
      '</div>' +
      '<div class="ag-dead" id="agDead" hidden>부활까지 <b>5</b>초</div>' +
      '<div class="ag-end" hidden><p class="ag-res" id="agRes">VICTORY</p><div class="ag-stat" id="agStat"></div><div class="ag-btns"><button type="button" data-act="again">다시 하기</button><button type="button" data-act="home">클라이언트로</button></div></div>' +
      '<p class="ag-help">클릭 · 이동/공격 &nbsp;|&nbsp; Q 저격 · W 돌진 · E 과부하 · R 가이드 링크</p>' +
    '</div>';
  }

  /* ════════ 이미지 ════════ */
  var IMG = {};
  function imgUrl(who){
    var c = who === 'uxi' ? CFG.uxiImg : CFG.pureImg;
    if (c) return c;
    var st = S().settings || {}, u = who === 'uxi' ? st.uxiImg : st.pureImg;
    return u ? (S().rel ? S().rel(u) : u) : '';
  }
  function loadImgs(){
    ['uxi', 'pure'].forEach(function(k){
      var u = imgUrl(k); if (!u || IMG[k]) return;
      var im = new Image(); im.onload = function(){ IMG[k] = im; }; im.src = u;
    });
    $$('.al-pic').forEach(function(el){
      var u = imgUrl(el.getAttribute('data-who'));
      if (u) el.style.backgroundImage = "url('" + u.replace(/'/g, '%27') + "')"; else el.classList.add('none');
    });
  }

  /* ════════ 게임 ════════ */
  var W = 960, H = 540, LANE = { y1: 150, y2: 390 };
  var NEX = { x: 72, y: 270, r: 34, hp: 1500, max: 1500 }, TOWER = { x: 200, y: 270, cd: 0, range: 230 };
  var G = null, root, cv, cx, raf = 0, last = 0, keyOn = false;

  function newGame(){
    G = {
      t: 0, wave: 0, waveT: 3, spawnQ: [], spawnT: 0, over: false, ban: [],
      hero: { x: 150, y: 300, r: 17, hp: 520, max: 520, lv: 1, xp: 0, spd: 190, range: 250, dmg: 26, atk: 0, aspd: .85, dest: null, tgt: null, dead: 0, inv: 0, over: 0, name: '명령하지마라' },
      pure: { x: 110, y: 330, r: 15, hp: 420, max: 420, heal: 1.5, shot: 0, dead: 0, name: '무리하지마' },
      en: [], pj: [], fx: [], txt: [],
      cd: { q: 0, w: 0, e: 0, r: 0 }, CDMAX: { q: 5, w: 9, e: 14, r: 45 },
      st: { k: 0, d: 0, cs: 0, gold: 0, dmg: 0 }, mouse: { x: 600, y: 270 }
    };
    NEX.hp = NEX.max;
  }
  var WAVES = 6;
  function startWave(){
    G.wave++;
    var n = G.wave, q = [];
    for (var i = 0; i < 3 + n; i++) q.push('m');
    for (var j = 0; j < Math.floor(n / 2) + (n > 2 ? 1 : 0); j++) q.splice(Math.floor(Math.random() * q.length), 0, 'r');
    if (n === WAVES) q.push('boss');
    G.spawnQ = q; G.spawnT = 0;
    banner(n === WAVES ? '최종 웨이브 · 버그 보스 출현!' : 'WAVE ' + n + ' · 바이러스가 몰려와요');
  }
  function spawn(type){
    var n = G.wave, y = LANE.y1 + 30 + Math.random() * (LANE.y2 - LANE.y1 - 60);
    var e = { x: W + 20, y: y, type: type, atk: 0, stun: 0, hit: 0 };
    if (type === 'm'){ e.r = 13; e.max = 70 + n * 22; e.spd = 52 + n * 3; e.dmg = 14 + n * 2; e.rng = 0; e.gold = 21; e.xp = 32; }
    else if (type === 'r'){ e.r = 12; e.max = 55 + n * 16; e.spd = 46; e.dmg = 12 + n * 2; e.rng = 150; e.gold = 26; e.xp = 38; }
    else { e.r = 30; e.max = 1400; e.spd = 34; e.dmg = 46; e.rng = 0; e.gold = 300; e.xp = 260; e.boss = 1; }
    e.hp = e.max; G.en.push(e);
  }
  function banner(t){ G.ban.push({ t: t, life: 2.4 }); var b = $('#agBan'); if (b){ b.textContent = t; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); } }
  function floatTxt(x, y, t, c, big){ G.txt.push({ x: x, y: y, t: t, c: c, life: 1, big: big }); }
  function burst(x, y, c, n){ for (var i = 0; i < (n || 8); i++){ var a = Math.random() * 6.28, s = 40 + Math.random() * 120; G.fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .5 + Math.random() * .3, c: c, r: 2 + Math.random() * 2 }); } }

  function xpNeed(lv){ return 70 + lv * 45; }
  function gainXp(v){
    var h = G.hero; if (h.lv >= 18) return; h.xp += v;
    while (h.xp >= xpNeed(h.lv) && h.lv < 18){
      h.xp -= xpNeed(h.lv); h.lv++; h.max += 62; h.hp = Math.min(h.max, h.hp + 120); h.dmg += 5; G.pure.max += 30; G.pure.hp += 30;
      floatTxt(h.x, h.y - 46, 'LEVEL UP', '#6EE7C8', 1); burst(h.x, h.y, '#6EE7C8', 14);
      if (h.lv === 3) banner('가이드 링크(R) 사용 가능!');
    }
  }
  function hurt(t, v, src){
    if (t.dead || (t.inv && t.inv > 0)) return;
    t.hp -= v; t.hit = .12;
    if (t === G.hero || t === G.pure) floatTxt(t.x + (Math.random() * 16 - 8), t.y - 30, '-' + Math.round(v), '#FF8A8A');
    else { floatTxt(t.x + (Math.random() * 16 - 8), t.y - 26, Math.round(v), src === 'q' ? '#9FE8FF' : '#FFFFFF', src === 'q'); G.st.dmg += v; }
    if (t.hp <= 0){
      t.hp = 0;
      if (t === G.hero){ t.dead = 6 + G.wave; G.st.d++; t.tgt = null; t.dest = null; banner('UXI 가 쓰러졌어요'); burst(t.x, t.y, '#FF8A8A', 18); }
      else if (t === G.pure){ t.dead = 8; banner('PURE 가 잠시 물러났어요'); burst(t.x, t.y, '#BFE6F8', 14); }
      else {
        t.gone = 1; burst(t.x, t.y, t.boss ? '#F5C76A' : '#B98BFF', t.boss ? 30 : 10);
        if (src !== 'tower'){ G.st.cs++; G.st.gold += t.gold; G.st.k += t.boss ? 1 : 0; floatTxt(t.x, t.y - 34, '+' + t.gold, '#F5C76A'); }
        else G.st.gold += Math.round(t.gold / 3);
        gainXp(src === 'tower' ? Math.round(t.xp / 2) : t.xp);
        if (t.boss) banner('버그 보스 처치! ✦');
      }
    }
  }
  function shoot(from, tgt, dmg, opt){
    opt = opt || {};
    var a = Math.atan2(tgt.y - from.y, tgt.x - from.x), sp = opt.sp || 620;
    G.pj.push({ x: from.x, y: from.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg: dmg, side: opt.side || 'ally', tgt: opt.home ? tgt : null, life: opt.life || 1.2, kind: opt.kind || 'aa', hitSet: [], sp: sp });
  }
  function nearestEnemy(p, maxD){
    var b = null, bd = maxD || 1e9;
    G.en.forEach(function(e){ if (e.gone) return; var d = dist(p, e); if (d < bd){ bd = d; b = e; } });
    return b;
  }
  function moveTo(o, tx, ty, sp, dt){
    var dx = tx - o.x, dy = ty - o.y, d = Math.sqrt(dx * dx + dy * dy); if (d < 2) return true;
    var s = Math.min(d, sp * dt); o.x += dx / d * s; o.y += dy / d * s;
    o.x = clamp(o.x, 20, W - 20); o.y = clamp(o.y, LANE.y1 - 60, LANE.y2 + 60); return false;
  }

  /* ── 스킬 ── */
  function useSkill(k){
    if (!G || G.over) return; var h = G.hero; if (h.dead) return;
    if (G.cd[k] > 0) return;
    if (k === 'r' && h.lv < 3){ banner('R 은 레벨 3부터 쓸 수 있어요'); return; }
    var m = G.mouse;
    if (!keyOn){ var ne = nearestEnemy(h, 600); if (ne) m = { x: ne.x, y: ne.y }; }
    var a = Math.atan2(m.y - h.y, m.x - h.x);
    if (k === 'q'){
      G.pj.push({ x: h.x, y: h.y, vx: Math.cos(a) * 760, vy: Math.sin(a) * 760, dmg: 60 + h.lv * 14, side: 'ally', life: .72, kind: 'q', hitSet: [], pierce: 1 });
      burst(h.x, h.y, '#9FE8FF', 6);
    } else if (k === 'w'){
      var dx = Math.cos(a) * 170, dy = Math.sin(a) * 170;
      for (var i = 0; i < 6; i++) G.fx.push({ x: h.x + dx * i / 6, y: h.y + dy * i / 6, vx: 0, vy: 0, life: .35, c: '#6EE7C8', r: 10 - i, ring: 1 });
      h.x = clamp(h.x + dx, 20, W - 20); h.y = clamp(h.y + dy, LANE.y1 - 60, LANE.y2 + 60); h.dest = null; h.inv = .35;
    } else if (k === 'e'){
      h.over = 4; floatTxt(h.x, h.y - 46, 'OVERCLOCK', '#F5C76A', 1);
    } else if (k === 'r'){
      var heal = Math.round(h.max * .45); h.hp = Math.min(h.max, h.hp + heal); floatTxt(h.x, h.y - 46, '+' + heal, '#6EE7C8', 1);
      G.fx.push({ x: h.x, y: h.y, vx: 0, vy: 0, life: .8, c: '#6EE7C8', r: 30, wave: 1 });
      G.en.forEach(function(e){ if (!e.gone && dist(e, h) < 230){ e.stun = 1.6; hurt(e, 40 + h.lv * 6, 'r'); } });
      if (!G.pure.dead) G.fx.push({ x: G.pure.x, y: G.pure.y, tx: h, life: .8, beam: 1, c: '#BFFFF0' });
      banner('GUIDE LINK ✦ 퓨어의 가이딩!');
    }
    G.cd[k] = G.CDMAX[k];
  }

  /* ── 업데이트 ── */
  function update(dt){
    var h = G.hero, p = G.pure; G.t += dt;
    Object.keys(G.cd).forEach(function(k){ G.cd[k] = Math.max(0, G.cd[k] - dt); });
    /* 웨이브 */
    if (!G.spawnQ.length && !G.en.some(function(e){ return !e.gone; })){
      if (G.wave >= WAVES){ end(true); return; }
      G.waveT -= dt; if (G.waveT <= 0){ startWave(); G.waveT = 7; }
    }
    if (G.spawnQ.length){ G.spawnT -= dt; if (G.spawnT <= 0){ spawn(G.spawnQ.shift()); G.spawnT = .9; } }
    /* 영웅 */
    if (h.dead > 0){
      h.dead -= dt;
      if (h.dead <= 0){ h.dead = 0; h.hp = h.max; h.x = 140; h.y = 270; h.inv = 1.2; banner('UXI 부활!'); }
    } else {
      h.inv = Math.max(0, h.inv - dt); h.over = Math.max(0, h.over - dt); h.atk = Math.max(0, h.atk - dt); h.hit = Math.max(0, (h.hit || 0) - dt);
      if (h.tgt && h.tgt.gone) h.tgt = null;
      if (!h.tgt && !h.dest){ var ne = nearestEnemy(h, h.range + 30); if (ne) h.tgt = ne; }
      if (h.tgt){
        if (dist(h, h.tgt) > h.range){ moveTo(h, h.tgt.x, h.tgt.y, h.spd, dt); }
        else if (h.atk <= 0){ shoot(h, h.tgt, h.dmg, { home: 1, sp: 700 }); h.atk = 1 / (h.aspd * (h.over > 0 ? 2.1 : 1)); }
      } else if (h.dest){ if (moveTo(h, h.dest.x, h.dest.y, h.spd, dt)) h.dest = null; }
      /* 의무실 근처 회복 */
      if (dist(h, NEX) < 120 && h.hp < h.max) h.hp = Math.min(h.max, h.hp + 40 * dt);
    }
    /* 퓨어 */
    if (p.dead > 0){ p.dead -= dt; if (p.dead <= 0){ p.dead = 0; p.hp = p.max; p.x = 110; p.y = 300; } }
    else {
      p.hit = Math.max(0, (p.hit || 0) - dt);
      var fx = h.dead ? 110 : h.x - 46, fy = h.dead ? 300 : h.y + 34;
      if (dist(p, { x: fx, y: fy }) > 12) moveTo(p, fx, fy, 175, dt);
      p.heal -= dt; p.shot -= dt;
      if (!h.dead && p.heal <= 0 && h.hp < h.max * .88 && dist(p, h) < 220){
        var hv = 26 + h.lv * 6; h.hp = Math.min(h.max, h.hp + hv); p.heal = 3.2;
        G.fx.push({ x: p.x, y: p.y, tx: h, life: .45, beam: 1, c: '#BFFFF0' }); floatTxt(h.x + 10, h.y - 40, '+' + hv, '#6EE7C8');
      }
      if (p.shot <= 0){ var pe = nearestEnemy(p, 190); if (pe){ shoot(p, pe, 9 + h.lv * 2, { home: 1, sp: 520, kind: 'pure' }); p.shot = 1.3; } }
      if (p.hp < p.max) p.hp = Math.min(p.max, p.hp + 4 * dt);
    }
    /* 타워 */
    TOWER.cd -= dt;
    if (TOWER.cd <= 0){ var te = nearestEnemy(TOWER, TOWER.range); if (te){ hurt(te, 34 + G.wave * 6, 'tower'); G.fx.push({ x: TOWER.x, y: TOWER.y - 30, tx: te, life: .2, beam: 1, c: '#9FE8FF', thin: 1 }); TOWER.cd = 1.15; } }
    /* 적 */
    G.en.forEach(function(e){
      if (e.gone) return; e.hit = Math.max(0, e.hit - dt); e.atk = Math.max(0, e.atk - dt);
      if (e.stun > 0){ e.stun -= dt; return; }
      var tg = null;
      if (!h.dead && dist(e, h) < (e.rng ? e.rng + 20 : 110)) tg = h;
      else if (!p.dead && dist(e, p) < (e.rng ? e.rng : 90)) tg = p;
      if (!tg) tg = NEX;
      var reach = e.rng ? e.rng : (e.r + (tg.r || 30) + 4);
      if (dist(e, tg) > reach){ moveTo(e, tg.x, tg.y, e.spd, dt); }
      else if (e.atk <= 0){
        if (e.rng){ shoot(e, tg, e.dmg, { side: 'enemy', home: 1, sp: 380, kind: 'virus', life: 1.4 }); }
        else if (tg === NEX){ NEX.hp -= e.dmg; burst(NEX.x + 20, NEX.y, '#FF8A8A', 4); }
        else hurt(tg, e.dmg);
        e.atk = e.boss ? 1.4 : 1.1;
      }
    });
    G.en = G.en.filter(function(e){ return !e.gone; });
    if (NEX.hp <= 0){ NEX.hp = 0; end(false); return; }
    /* 투사체 */
    G.pj.forEach(function(q){
      q.life -= dt;
      if (q.tgt){
        if (q.tgt.gone || q.tgt.dead){ q.life = 0; return; }
        var a = Math.atan2(q.tgt.y - q.y, q.tgt.x - q.x); q.vx = Math.cos(a) * q.sp; q.vy = Math.sin(a) * q.sp;
      }
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.side === 'ally'){
        G.en.forEach(function(e){
          if (e.gone || q.life <= 0 || q.hitSet.indexOf(e) > -1) return;
          if (dist(q, e) < e.r + 6){ hurt(e, q.dmg, q.kind); q.hitSet.push(e); burst(q.x, q.y, q.kind === 'q' ? '#9FE8FF' : '#FFFFFF', 4); if (!q.pierce) q.life = 0; }
        });
      } else {
        [h, p].forEach(function(t){ if (q.life > 0 && !t.dead && dist(q, t) < t.r + 5){ hurt(t, q.dmg); q.life = 0; } });
        if (q.life > 0 && dist(q, NEX) < NEX.r){ NEX.hp -= q.dmg; q.life = 0; }
      }
    });
    G.pj = G.pj.filter(function(q){ return q.life > 0 && q.x > -40 && q.x < W + 40 && q.y > -40 && q.y < H + 40; });
    G.fx.forEach(function(f){ f.life -= dt; if (f.vx !== undefined){ f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= .92; f.vy *= .92; } });
    G.fx = G.fx.filter(function(f){ return f.life > 0; });
    G.txt.forEach(function(t){ t.life -= dt; t.y -= 30 * dt; });
    G.txt = G.txt.filter(function(t){ return t.life > 0; });
  }

  /* ── 그리기 ── */
  function bar(x, y, w, hp, max, col, lv, name){
    var bw = w, bh = 8;
    cx.fillStyle = 'rgba(4,10,18,.85)'; cx.fillRect(x - bw / 2 - 1, y - 1, bw + 2, bh + 2);
    cx.fillStyle = '#1A2A38'; cx.fillRect(x - bw / 2, y, bw, bh);
    cx.fillStyle = col; cx.fillRect(x - bw / 2, y, bw * clamp(hp / max, 0, 1), bh);
    cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fillRect(x - bw / 2, y, bw * clamp(hp / max, 0, 1), 2);
    cx.strokeStyle = 'rgba(0,0,0,.55)'; cx.lineWidth = 1;
    for (var s = 100; s < max; s += 100){ var sx = x - bw / 2 + bw * s / max; cx.beginPath(); cx.moveTo(sx + .5, y); cx.lineTo(sx + .5, y + (s % 500 ? 4 : bh)); cx.stroke(); }
    if (lv){
      cx.fillStyle = 'rgba(4,10,18,.92)'; cx.fillRect(x - bw / 2 - 16, y - 3, 15, 14);
      cx.strokeStyle = '#C9A55A'; cx.strokeRect(x - bw / 2 - 15.5, y - 2.5, 14, 13);
      cx.fillStyle = '#F2E2B8'; cx.font = '800 9px Pretendard, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(lv, x - bw / 2 - 8.5, y + 4.5);
    }
    if (name){ cx.fillStyle = 'rgba(255,255,255,.9)'; cx.font = '800 10px Pretendard, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic'; cx.fillText(name, x, y - 4); }
  }
  function unit(u, who, ring){
    var r = u.r + 5;
    cx.save();
    cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(u.x, u.y + r - 2, r * .9, r * .32, 0, 0, 6.28); cx.fill();
    cx.strokeStyle = ring; cx.lineWidth = 2; cx.globalAlpha = .7; cx.beginPath(); cx.ellipse(u.x, u.y + r - 2, r, r * .36, 0, 0, 6.28); cx.stroke(); cx.globalAlpha = 1;
    var im = IMG[who];
    if (im){
      var s = r * 2.6; cx.drawImage(im, u.x - s / 2, u.y - s * .78, s, s);
    } else {
      var g = cx.createRadialGradient(u.x - r * .3, u.y - r * .5, 2, u.x, u.y - 4, r * 1.2);
      if (who === 'uxi'){ g.addColorStop(0, '#5A6B7E'); g.addColorStop(1, '#16222F'); } else { g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#A9DCF5'); }
      cx.fillStyle = g; cx.beginPath(); cx.arc(u.x, u.y - 4, r, 0, 6.28); cx.fill();
      cx.strokeStyle = ring; cx.lineWidth = 2.5; cx.stroke();
      cx.fillStyle = who === 'uxi' ? '#6EE7C8' : '#1E8FD6'; cx.font = '900 ' + Math.round(r * .95) + 'px Pretendard, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(who === 'uxi' ? 'U' : 'P', u.x, u.y - 3);
    }
    if (u.hit > 0){ cx.globalAlpha = .45; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(u.x, u.y - 4, r, 0, 6.28); cx.fill(); cx.globalAlpha = 1; }
    cx.restore();
  }
  function draw(){
    var h = G.hero, p = G.pure;
    /* 바닥 */
    var g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#081420'); g.addColorStop(1, '#0B1D2C'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.fillStyle = '#10283B'; cx.fillRect(0, LANE.y1, W, LANE.y2 - LANE.y1);
    cx.strokeStyle = 'rgba(110,231,200,.06)'; cx.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 40){ cx.beginPath(); cx.moveTo(gx + .5, 0); cx.lineTo(gx + .5, H); cx.stroke(); }
    for (var gy = 0; gy < H; gy += 40){ cx.beginPath(); cx.moveTo(0, gy + .5); cx.lineTo(W, gy + .5); cx.stroke(); }
    cx.strokeStyle = 'rgba(110,231,200,.35)'; cx.setLineDash([10, 8]); cx.beginPath(); cx.moveTo(0, LANE.y1); cx.lineTo(W, LANE.y1); cx.moveTo(0, LANE.y2); cx.lineTo(W, LANE.y2); cx.stroke(); cx.setLineDash([]);
    cx.fillStyle = 'rgba(110,231,200,.05)'; cx.font = '900 64px Pretendard, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('SENTINEL RIFT', W / 2 + 60, 270);
    /* 적 게이트 */
    cx.fillStyle = 'rgba(185,139,255,.12)'; cx.fillRect(W - 40, LANE.y1, 40, LANE.y2 - LANE.y1);
    cx.strokeStyle = 'rgba(185,139,255,.6)'; cx.beginPath(); cx.moveTo(W - 40, LANE.y1); cx.lineTo(W - 40, LANE.y2); cx.stroke();
    /* 의무실(넥서스) */
    cx.save(); cx.translate(NEX.x, NEX.y);
    cx.fillStyle = 'rgba(110,231,200,.12)'; cx.beginPath(); cx.arc(0, 0, 120, 0, 6.28); cx.fill();
    cx.rotate(G.t * .4); cx.fillStyle = '#123A4F'; cx.strokeStyle = '#6EE7C8'; cx.lineWidth = 3;
    cx.beginPath(); for (var k = 0; k < 6; k++){ var a = k * Math.PI / 3; cx.lineTo(Math.cos(a) * NEX.r, Math.sin(a) * NEX.r); } cx.closePath(); cx.fill(); cx.stroke();
    cx.rotate(-G.t * .4); cx.fillStyle = '#fff'; cx.fillRect(-5, -15, 10, 30); cx.fillRect(-15, -5, 30, 10); cx.fillStyle = '#6EE7C8'; cx.fillRect(-5, -5, 10, 10);
    cx.restore();
    bar(NEX.x, NEX.y - 58, 90, NEX.hp, NEX.max, '#3FCB8B', 0, 'INFIRMARY');
    /* 타워 */
    cx.fillStyle = '#16405A'; cx.fillRect(TOWER.x - 12, TOWER.y - 34, 24, 44); cx.fillStyle = '#9FE8FF'; cx.beginPath(); cx.arc(TOWER.x, TOWER.y - 38, 8, 0, 6.28); cx.fill();
    cx.strokeStyle = 'rgba(159,232,255,.12)'; cx.beginPath(); cx.arc(TOWER.x, TOWER.y, TOWER.range, 0, 6.28); cx.stroke();
    /* 이동 표시 */
    if (h.dest && !h.dead){ cx.strokeStyle = '#6EE7C8'; cx.lineWidth = 2; cx.beginPath(); cx.arc(h.dest.x, h.dest.y, 8 + Math.sin(G.t * 10) * 2, 0, 6.28); cx.stroke(); }
    /* 적 */
    G.en.forEach(function(e){
      cx.save();
      cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(e.x, e.y + e.r, e.r, e.r * .35, 0, 0, 6.28); cx.fill();
      var col = e.boss ? '#F5C76A' : e.type === 'r' ? '#E58BFF' : '#B98BFF';
      cx.fillStyle = col; cx.beginPath();
      var sp = e.boss ? 10 : 7;
      for (var i = 0; i < sp * 2; i++){ var a = i * Math.PI / sp + G.t * (e.boss ? .6 : 1.4), rr = i % 2 ? e.r : e.r * .78; cx.lineTo(e.x + Math.cos(a) * rr, e.y + Math.sin(a) * rr); }
      cx.closePath(); cx.fill();
      cx.fillStyle = 'rgba(20,10,40,.7)'; cx.beginPath(); cx.arc(e.x - e.r * .28, e.y - e.r * .1, e.r * .16, 0, 6.28); cx.arc(e.x + e.r * .28, e.y - e.r * .1, e.r * .16, 0, 6.28); cx.fill();
      if (e.hit > 0){ cx.globalAlpha = .5; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, 6.28); cx.fill(); cx.globalAlpha = 1; }
      if (e.stun > 0){ cx.fillStyle = '#F5C76A'; cx.font = '800 11px Pretendard'; cx.textAlign = 'center'; cx.fillText('✦✦', e.x, e.y - e.r - 14); }
      cx.restore();
      bar(e.x, e.y - e.r - 12, e.boss ? 90 : 36, e.hp, e.max, '#E5484D', 0, e.boss ? 'BUG BOSS' : '');
      if (h.tgt === e){ cx.strokeStyle = 'rgba(255,90,90,.9)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(e.x, e.y, e.r + 6, 0, 6.28); cx.stroke(); }
    });
    /* 퓨어 / 유시 */
    if (!p.dead){ unit(p, 'pure', '#9FE8FF'); bar(p.x, p.y - p.r - 30, 58, p.hp, p.max, '#4DB3E6', h.lv, '무리하지마'); }
    if (!h.dead){
      if (h.inv > 0){ cx.globalAlpha = .55; }
      unit(h, 'uxi', h.over > 0 ? '#F5C76A' : '#6EE7C8'); cx.globalAlpha = 1;
      bar(h.x, h.y - h.r - 32, 66, h.hp, h.max, '#3FCB6B', h.lv, '명령하지마라');
    }
    /* 투사체 */
    G.pj.forEach(function(q){
      cx.save();
      if (q.kind === 'q'){ cx.strokeStyle = '#9FE8FF'; cx.lineWidth = 4; cx.shadowColor = '#9FE8FF'; cx.shadowBlur = 12; cx.beginPath(); cx.moveTo(q.x, q.y); cx.lineTo(q.x - q.vx * .035, q.y - q.vy * .035); cx.stroke(); }
      else { cx.fillStyle = q.side === 'enemy' ? '#E58BFF' : q.kind === 'pure' ? '#BFE6F8' : '#6EE7C8'; cx.beginPath(); cx.arc(q.x, q.y, q.side === 'enemy' ? 4 : 3.5, 0, 6.28); cx.fill(); }
      cx.restore();
    });
    /* 이펙트 */
    G.fx.forEach(function(f){
      cx.save(); cx.globalAlpha = clamp(f.life * 2, 0, 1);
      if (f.beam){ cx.strokeStyle = f.c; cx.lineWidth = f.thin ? 2 : 4; cx.shadowColor = f.c; cx.shadowBlur = 10; cx.beginPath(); cx.moveTo(f.x, f.y); cx.lineTo(f.tx.x, f.tx.y - 6); cx.stroke(); }
      else if (f.wave){ cx.strokeStyle = f.c; cx.lineWidth = 3; cx.beginPath(); cx.arc(f.x, f.y, 230 * (1 - f.life / .8) + 10, 0, 6.28); cx.stroke(); }
      else if (f.ring){ cx.strokeStyle = f.c; cx.lineWidth = 2; cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 6.28); cx.stroke(); }
      else { cx.fillStyle = f.c; cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 6.28); cx.fill(); }
      cx.restore();
    });
    G.txt.forEach(function(t){
      cx.globalAlpha = clamp(t.life * 1.6, 0, 1); cx.fillStyle = t.c; cx.font = '900 ' + (t.big ? 15 : 12) + 'px Pretendard, sans-serif'; cx.textAlign = 'center';
      cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.lineWidth = 3; cx.strokeText(t.t, t.x, t.y); cx.fillText(t.t, t.x, t.y); cx.globalAlpha = 1;
    });
  }
  function hud(){
    var h = G.hero;
    $('#agK').textContent = G.st.k; $('#agDth').textContent = G.st.d; $('#agCs').textContent = G.st.cs; $('#agGold').textContent = G.st.gold.toLocaleString('ko-KR');
    $('#agWave').textContent = 'WAVE ' + Math.max(1, G.wave) + '/' + WAVES;
    $('#agTime').textContent = pad(Math.floor(G.t / 60)) + ':' + pad(Math.floor(G.t % 60));
    $('#agLv').textContent = h.lv;
    $('#agHpF').style.width = (h.hp / h.max * 100) + '%'; $('#agHpT').textContent = Math.ceil(h.hp) + ' / ' + h.max;
    $('#agXpF').style.width = (h.lv >= 18 ? 100 : h.xp / xpNeed(h.lv) * 100) + '%';
    $$('.ag-skills button', root).forEach(function(b){
      var k = b.getAttribute('data-sk'), c = G.cd[k], m = G.CDMAX[k];
      b.style.setProperty('--cd', (c / m).toFixed(3)); b.querySelector('.ag-cd').textContent = c > 0 ? Math.ceil(c) : '';
      if (k === 'r') b.classList.toggle('lock', h.lv < 3);
    });
    var dd = $('#agDead'); dd.hidden = !(h.dead > 0); if (h.dead > 0) dd.querySelector('b').textContent = Math.ceil(h.dead);
  }
  function loop(now){
    raf = requestAnimationFrame(loop);
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!G || G.over) return;
    if (D.hidden || !(S().isShown && S().isShown('aol'))) return;
    update(dt); if (G && !G.over){ draw(); hud(); }
  }
  function end(win){
    G.over = true; draw(); hud();
    var e = $('.ag-end', root); e.hidden = false; e.classList.toggle('lose', !win);
    $('#agRes').textContent = win ? 'VICTORY' : 'DEFEAT';
    var t = pad(Math.floor(G.t / 60)) + ':' + pad(Math.floor(G.t % 60));
    $('#agStat').innerHTML = '<span><em>KDA</em><b>' + G.st.k + ' / ' + G.st.d + '</b></span><span><em>CS</em><b>' + G.st.cs + '</b></span><span><em>골드</em><b>' + G.st.gold.toLocaleString('ko-KR') + '</b></span><span><em>레벨</em><b>' + G.hero.lv + '</b></span><span><em>시간</em><b>' + t + '</b></span><span><em>웨이브</em><b>' + G.wave + '/' + WAVES + '</b></span>';
    var hist = LS.get(HKEY, []); hist.unshift({ w: win ? 1 : 0, k: G.st.k, d: G.st.d, cs: G.st.cs, lv: G.hero.lv, t: t, wave: G.wave, at: Date.now() }); LS.set(HKEY, hist.slice(0, 6));
    renderHist();
    if (window.SyringeFx && SyringeFx.sound) try { SyringeFx.sound(true); } catch(_){}
  }
  function renderHist(){
    var ul = $('#acHist'); if (!ul) return;
    var hist = LS.get(HKEY, []);
    if (!hist.length){ ul.innerHTML = '<li class="none">아직 전적이 없어요. 게임을 플레이하세요.</li>'; return; }
    ul.innerHTML = hist.map(function(g){
      var d = new Date(g.at), ds = (d.getMonth() + 1) + '.' + d.getDate();
      return '<li class="' + (g.w ? 'win' : 'lose') + '"><b>' + (g.w ? '승리' : '패배') + '</b><i class="al-pic sm" data-who="uxi"></i><span>' + g.k + ' / ' + g.d + ' · CS ' + g.cs + '</span><em>Lv.' + g.lv + ' · ' + g.t + ' · ' + ds + '</em></li>';
    }).join('');
    loadImgs();
  }

  /* ════════ 화면 전환 ════════ */
  var qTimer = 0, fTimer = 0;
  function screen(name){
    $$('.ac-screen, .ac-queue, .ac-found, .ac-load, .ac-game', root).forEach(function(el){ el.hidden = true; });
    if (name === 'client'){ $('.ac-screen', root).hidden = false; }
    if (name === 'queue'){ $('.ac-screen', root).hidden = false; $('.ac-queue', root).hidden = false; }
    if (name === 'found'){ $('.ac-screen', root).hidden = false; $('.ac-found', root).hidden = false; }
    if (name === 'load') $('.ac-load', root).hidden = false;
    if (name === 'game') $('.ac-game', root).hidden = false;
    root.setAttribute('data-screen', name);
  }
  function queue(){
    screen('queue'); var st = Date.now(), wait = 2200 + Math.random() * 1800;
    clearInterval(qTimer);
    qTimer = setInterval(function(){
      var s = Math.floor((Date.now() - st) / 1000); $('#aqT').textContent = Math.floor(s / 60) + ':' + pad(s % 60);
      if (Date.now() - st > wait){ clearInterval(qTimer); found(); }
    }, 200);
  }
  function found(){
    screen('found'); var bar = $('#aqBar'), st = Date.now();
    /* 👇 기본 띠링 소리 대신 원하는 mp3 파일 재생 */
    try { 
      var qSnd = new Audio('assets/images/q.mp3');
      qSnd.volume = 0.5;
      qSnd.play(); 
    } catch(_){}
    clearInterval(fTimer);
    fTimer = setInterval(function(){ var k = (Date.now() - st) / 10000; bar.style.width = (100 - k * 100) + '%'; if (k >= 1){ clearInterval(fTimer); screen('client'); } }, 50);
  }
  function load(){
    clearInterval(fTimer); screen('load'); loadImgs();
    var bars = $$('.al-pb i', root), st = Date.now();
    (function f(){ var k = Math.min(1, (Date.now() - st) / 1600); bars.forEach(function(b, i){ b.style.width = Math.min(100, k * (i ? 112 : 100)) + '%'; }); if (k < 1) requestAnimationFrame(f); else play(); })();
  }
  function fit(){
    var g = $('.ac-game', root); if (!g || g.hidden) return;
    var w = g.clientWidth, h = g.clientHeight; if (!w || !h) return;
    var k = Math.min(w / W, h / H); cv.style.width = Math.floor(W * k) + 'px'; cv.style.height = Math.floor(H * k) + 'px';
  }
  function play(){
    newGame(); screen('game'); fit(); $('.ag-end', root).hidden = true; loadImgs(); last = performance.now();
    if (!raf) raf = requestAnimationFrame(loop);
    banner('의무실 방어전 시작 · 첫 웨이브가 다가옵니다...');
  }

  /* ════════ 입력 ════════ */
  function toWorld(e){
    var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
    return { x: (t.clientX - r.left) / r.width * W, y: (t.clientY - r.top) / r.height * H };
  }
  function command(pt){
    if (!G || G.over) return; var h = G.hero; if (h.dead) return;
    var hit = null; G.en.forEach(function(e){ if (!hit && dist(pt, e) < e.r + 14) hit = e; });
    if (hit){ h.tgt = hit; h.dest = null; }
    else { h.tgt = null; h.dest = { x: clamp(pt.x, 20, W - 20), y: clamp(pt.y, LANE.y1 - 60, LANE.y2 + 60) }; }
  }
  function bindInput(){
    cv.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    cv.addEventListener('pointerdown', function(e){ e.preventDefault(); keyOn = e.pointerType === 'mouse'; command(toWorld(e)); });
    cv.addEventListener('pointermove', function(e){ if (G) G.mouse = toWorld(e); });
    D.addEventListener('keydown', function(e){
      if (!G || G.over || root.getAttribute('data-screen') !== 'game') return;
      if (!(S().isShown && S().isShown('aol'))) return;
      if (/input|textarea/i.test((e.target.tagName || ''))) return;
      var k = (e.key || '').toLowerCase();
      var map = { q: 'q', w: 'w', e: 'e', r: 'r', 'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r' };
      if (map[k]){ e.preventDefault(); keyOn = true; useSkill(map[k]); }
    });
    root.addEventListener('click', function(e){
      var sk = e.target.closest('[data-sk]'); if (sk){ keyOn = false; useSkill(sk.getAttribute('data-sk')); return; }
      var a = e.target.closest('[data-act]'); if (!a) return;
      var act = a.getAttribute('data-act');
      if (act === 'play') queue();
      else if (act === 'cancel'){ clearInterval(qTimer); clearInterval(fTimer); screen('client'); }
      else if (act === 'accept') load();
      else if (act === 'again') load();
      else if (act === 'home' || act === 'quit'){ if (G && !G.over && act === 'quit'){ end(false); return; } screen('client'); }
      else if (act === 'stats'){ if (S().open){ S().open('web'); setTimeout(function(){ var t = D.querySelector('#wbTabs [data-t="game"]'); if (t) t.click(); }, 60); } }
    });
  }

  function init(){
    root = $('#aol'); if (!root) return;
    root.innerHTML = clientHTML();
    cv = $('#agCv', root); cx = cv.getContext('2d');
    bindInput(); renderHist(); screen('client');
    if (window.ResizeObserver) new ResizeObserver(fit).observe(root); else window.addEventListener('resize', fit);
    var w = $('#w-aol');
    if (w) new MutationObserver(function(){ loadImgs(); }).observe(w, { attributes: true, attributeFilter: ['class'] });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 0); }); else setTimeout(init, 0);
})();