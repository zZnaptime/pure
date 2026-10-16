/* 클릭 반짝 + 효과음 (뉴인포수정2 그대로) */
/* =====================================================================
   CLICK FX — 클릭하면 반짝 (빛줄기 + 반짝이 별 + 링)
   - 끄고 싶으면 이 <script> 블록을 통째로 지우면 돼요
   - 크게 터뜨리고 싶은 버튼에는 data-fx-big 속성 추가
   ===================================================================== */
(function(){
'use strict';
const cv=document.createElement('canvas');
cv.setAttribute('aria-hidden','true');
cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:30000';
document.body.appendChild(cv);
const ctx=cv.getContext('2d');
let W=0,H=0;
function size(){ const D=Math.min(window.devicePixelRatio||1,2); W=innerWidth; H=innerHeight; cv.width=W*D; cv.height=H*D; ctx.setTransform(D,0,0,D,0,0); }
size(); addEventListener('resize',size);

const MINT='#6EE7C8', BLUE='#2FA4DE', SKY='#A9DCF5', EDGE='#1E8FD6', PALE='#F2FFFA';
const fx=[]; let raf=0, last=0;
const out=k=>1-Math.pow(1-k,3);
const back=k=>{ const c=2.2; return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2); };

function burst(x,y,s){
  s=s||1;
  fx.push({x,y,s,t:0,life:.52,rot:Math.random()*Math.PI/4,spin:(Math.random()<.5?-1:1)*.35,
    side:[0,1].map(i=>{ const a=-Math.PI/4+i*Math.PI+ (Math.random()-.5)*.6; return {a,d:(22+Math.random()*6)*s,r:(3.6+Math.random()*1.4)*s,delay:.05+i*.04}; })});
  if(!raf){ last=performance.now(); raf=requestAnimationFrame(loop); }
}
function star(r,q){
  ctx.beginPath();
  ctx.moveTo(0,-r); ctx.quadraticCurveTo(q,-q,r,0); ctx.quadraticCurveTo(q,q,0,r);
  ctx.quadraticCurveTo(-q,q,-r,0); ctx.quadraticCurveTo(-q,-q,0,-r); ctx.closePath();
}
function draw(f){
  const k=Math.min(1,f.t/f.life), s=f.s;
  ctx.save(); ctx.translate(f.x,f.y);

  // 링
  ctx.globalAlpha=(1-k)*.9;
  ctx.beginPath(); ctx.arc(0,0,Math.max(0,(6+30*out(k))*s),0,Math.PI*2);
  ctx.lineWidth=Math.max(.01,2*s*(1-k)); ctx.strokeStyle=SKY; ctx.stroke();

  // 빛줄기 8개 (긴 것 민트 / 짧은 것 블루)
  ctx.globalAlpha=1;
  for(let i=0;i<8;i++){
    const long=i%2===0, a=f.rot+i*Math.PI/4;
    const reach=(long?34:22)*s, len=(long?15:9)*s, w=(long?2.6:1.9)*s;
    const head=(8*s)+reach*out(k), tail=head-len*(1-k);
    if(head-tail<.5) continue;
    const mid=tail+(head-tail)*.35, ww=w*(1-k*.6);
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(tail,0); ctx.lineTo(mid,-ww); ctx.lineTo(head,0); ctx.lineTo(mid,ww); ctx.closePath();
    ctx.fillStyle=long?MINT:BLUE; ctx.fill();
    ctx.restore();
  }

  // 가운데 반짝이
  const sc=k<.35?back(k/.35):1-out((k-.35)/.65);
  const R=10*s*Math.max(0,sc);
  if(R>.4){
    ctx.save(); ctx.rotate(f.spin*k);
    star(R,R*.2); ctx.lineJoin='round'; ctx.lineWidth=Math.max(1.2,R*.16); ctx.strokeStyle=EDGE; ctx.stroke();
    ctx.fillStyle=PALE; ctx.fill(); ctx.restore();
  }
  // 작은 반짝이 2개
  f.side.forEach(o=>{
    const kk=Math.max(0,(f.t-o.delay)/(f.life-o.delay)); if(kk<=0||kk>=1) return;
    const ss=kk<.4?back(kk/.4):1-out((kk-.4)/.6), r=o.r*Math.max(0,ss); if(r<.3) return;
    ctx.save(); ctx.translate(Math.cos(o.a)*o.d,Math.sin(o.a)*o.d);
    star(r,r*.18); ctx.fillStyle=MINT; ctx.fill(); ctx.restore();
  });
  ctx.restore();
}
function loop(now){
  const dt=Math.max(0,Math.min(.05,(now-last)/1000)); last=now;
  ctx.clearRect(0,0,W,H);
  for(let i=fx.length-1;i>=0;i--){ const f=fx[i]; f.t+=dt; if(f.t>=f.life){ fx.splice(i,1); continue; } draw(f); }
  ctx.globalAlpha=1;
  if(fx.length) raf=requestAnimationFrame(loop); else { raf=0; ctx.clearRect(0,0,W,H); }
}


/* ---------- 클릭 효과음 ----------
   ✎ 설정
     on     : true = 켜기 / false = 끄기
     volume : 0 ~ 1 (기본 0.25)
     url    : mp3 링크를 넣으면 그 소리로 재생, 비우면 '딸칵' / '띠링' 합성음 사용 */
const SFX={ on:true, volume:0.15, url:'' };

let ac=null, pool=[], pi=0;
function getAC(){
  if(!ac){ const A=window.AudioContext||window.webkitAudioContext; if(!A) return null; ac=new A(); }
  if(ac.state==='suspended') ac.resume();
  return ac;
}
if(SFX.url){ for(let i=0;i<4;i++){ const a=new Audio(SFX.url); a.preload='auto'; pool.push(a); } }
let noiseBuf=null;
function getNoise(ctx){
  if(noiseBuf) return noiseBuf;
  const len=Math.floor(ctx.sampleRate*.05);
  noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate);
  const d=noiseBuf.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,4);
  return noiseBuf;
}
// '딸칵' — 한 번에 똑 끊어지는 짧은 클릭
function click(ctx,t,amp){
  // 똑 (짧은 마찰음 한 번)
  const n=ctx.createBufferSource(); n.buffer=getNoise(ctx);
  const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1800;
  const ng=ctx.createGain();
  ng.gain.setValueAtTime(amp,t);
  ng.gain.exponentialRampToValueAtTime(.0001,t+.012);
  n.connect(hp); hp.connect(ng); ng.connect(ctx.destination);
  n.start(t); n.stop(t+.02);
  // 딱 (아주 짧게 떨어지는 몸통음)
  const o=ctx.createOscillator(), g=ctx.createGain();
  o.type='triangle';
  o.frequency.setValueAtTime(1400*(1+(Math.random()-.5)*.1),t);
  o.frequency.exponentialRampToValueAtTime(500,t+.018);
  g.gain.setValueAtTime(amp*.55,t);
  g.gain.exponentialRampToValueAtTime(.0001,t+.022);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t+.03);
}
// '띠링' — 부드럽게 시작해서 잔잔하게 사라지는 종소리
function chime(ctx,t,freq,amp,dur){
  const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2600; lp.connect(ctx.destination);
  [[1,1],[2,.12]].forEach(([m,a])=>{
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(freq*m,t);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(amp*a,t+.025);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur/m);
    o.connect(g); g.connect(lp);
    o.start(t); o.stop(t+dur+.05);
  });
}
function playSfx(big){
  if(!SFX.on) return;
  if(SFX.url && pool.length){
    const a=pool[pi++%pool.length]; a.volume=SFX.volume;
    try{ a.currentTime=0; }catch(_){}
    a.play().catch(()=>{}); return;
  }
  const ctx=getAC(); if(!ctx) return;
  const t=ctx.currentTime+.005, v=SFX.volume;
  if(big){ chime(ctx,t,880,v*.22,.9); chime(ctx,t+.11,1318.5,v*.17,1.1); }  // 라 → 미 (잔잔한 5도)
  else click(ctx,t,v*.9);
}

// 드래그(3D 회전 등)는 제외하고, 제자리 클릭/탭에만 반응
let down=null;
addEventListener('pointerdown',e=>{ down=(e.button===0)?{x:e.clientX,y:e.clientY}:null; if(down && SFX.on && !SFX.url) getAC(); },true);
addEventListener('pointerup',e=>{
  if(!down) return;
  if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<8){
    const big=e.target && e.target.closest && e.target.closest('[data-fx-big]:not(:disabled)');
    burst(e.clientX,e.clientY,big?1.6:1);
    playSfx(!!big);
  }
  down=null;
},true);
// 알림 — 아주 작게 '똥-딩' (사용자가 한 번이라도 클릭해서 오디오가 깨어 있을 때만)
function notiSound(urgent){
  if(!SFX.on) return;
  const ctx=getAC(); if(!ctx) return;
  const go=()=>{
    const t=ctx.currentTime+.01, v=SFX.volume;
    if(urgent){ chime(ctx,t,987.77,v*.16,.55); chime(ctx,t+.13,987.77,v*.14,.6); chime(ctx,t+.26,1318.5,v*.13,.9); }
    else { chime(ctx,t,1174.66,v*.12,.6); chime(ctx,t+.09,1567.98,v*.09,.85); }
  };
  if(ctx.state==='running') go();
  else ctx.resume().then(()=>{ if(ctx.state==='running') go(); }).catch(()=>{});
}
window.SyringeFx={burst,sound:playSfx,noti:notiSound,SFX};
})();
