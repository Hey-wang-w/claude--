/* ================= 公共工具：画布、面板绘图、相对原子质量与化学式解析、计算器、直接操作、弹出笔记（沿用定量认识课） ================= */
const HAND='"ZCOOL KuaiLe","Noto Sans SC",sans-serif',FNUM='"Noto Sans SC",sans-serif';
const INK='#1f2a44',DIM='#55617f',FAINT='#8a95ad',CG='#1fb39f',CC='#1f9fd6',CA='#e69500',CM='#ff6fa8',CV='#8a6cff',RED='#ff7a5c',BLUE='#1f9fd6',OKC='#1f9d6b',BADC='#e5484d',BGC='#f3f6fb';
/* 画布：坐标用版面像素（不受整体缩放影响），清晰度按真实屏幕像素 */
function fitS(cv){
  const r=cv.getBoundingClientRect(),w=Math.max(1,cv.offsetWidth),h=Math.max(1,cv.offsetHeight),s=r.width/w||1;
  const dpr=Math.min(LOW?1:2,window.devicePixelRatio||1)*s;const W=Math.round(w*dpr),H=Math.round(h*dpr);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w,h,s};
}
const ptIn=(cv,e)=>{const r=cv.getBoundingClientRect(),s=r.width/cv.offsetWidth||1;return[(e.clientX-r.left)/s,(e.clientY-r.top)/s];};
const txt=(ctx,s,x,y,o={})=>{const A=ctx.globalAlpha;label(ctx,s,x,y,Object.assign({col:INK,font:FNUM,weight:500,a:A},o));ctx.globalAlpha=A;};
const hand=(ctx,s,x,y,o={})=>{const A=ctx.globalAlpha;label(ctx,s,x,y,Object.assign({col:INK,font:HAND,weight:400,a:A},o));ctx.globalAlpha=A;};
/* 发光文字：数字读数、标题 */
function glow(ctx,s,x,y,{size=20,col=CA,align='center',weight=700,font=FNUM,blur=12,base='middle'}={}){ctx.save();ctx.shadowColor=col;ctx.shadowBlur=blur;label(ctx,s,x,y,{size,col,align,weight,font,base,a:ctx.globalAlpha});ctx.restore();}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);}
const rng=seed=>{let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647;};};
function setSt(el,cls,html){el.className='status'+(cls?' '+cls:'');el.innerHTML=html;}
function stampOn(host,text,ok=false,x='50%',y='40%'){let s=host.querySelector(':scope>.stamp');if(!s){s=document.createElement('div');s.className='stamp';host.appendChild(s);}
  s.textContent=text;s.classList.toggle('ok',ok);s.style.left=x;s.style.top=y;s.style.translate='-50% -50%';s.classList.remove('on');void s.offsetWidth;s.classList.add('on');sfx('stamp');}
function stampOff(host){const s=host.querySelector(':scope>.stamp');if(s)s.classList.remove('on');}
/* HUD 面板：半透明底 + 细边 + 四角括号 */
function hudBox(ctx,x,y,w,h,{col=CC,fill='rgba(10,18,26,.82)',r=10,a=ctx.globalAlpha,lw=1.5,corner=14,glowA=.6}={}){ctx.save();ctx.globalAlpha=a;
  if(fill){ctx.fillStyle=fill;rr(ctx,x,y,w,h,r);ctx.fill();}
  ctx.strokeStyle=col;ctx.globalAlpha=a*.45;ctx.lineWidth=lw;rr(ctx,x,y,w,h,r);ctx.stroke();
  ctx.globalAlpha=a;ctx.lineWidth=2.2;ctx.shadowColor=col;ctx.shadowBlur=8*glowA;ctx.lineCap='round';const c=Math.min(corner,w/3,h/3);
  [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([px,py,sx,sy])=>{ctx.beginPath();ctx.moveTo(px+sx*c,py);ctx.lineTo(px,py);ctx.lineTo(px,py+sy*c);ctx.stroke();});ctx.restore();}
function line(ctx,x1,y1,x2,y2,{col=CC,w=2,a=ctx.globalAlpha,dash=null,glowB=0}={}){ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';if(dash)ctx.setLineDash(dash);if(glowB){ctx.shadowColor=col;ctx.shadowBlur=glowB;}ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
/* 箭头：直线或弧线，实心三角形箭头 */
function arrowQ(ctx,x1,y1,qx,qy,x2,y2,{col=INK,w=3,head=12,a=ctx.globalAlpha}={}){const ang=Math.atan2(y2-qy,x2-qx);ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(qx,qy,x2-Math.cos(ang)*head*.8,y2-Math.sin(ang)*head*.8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-Math.cos(ang-.42)*head,y2-Math.sin(ang-.42)*head);ctx.lineTo(x2-Math.cos(ang+.42)*head,y2-Math.sin(ang+.42)*head);ctx.closePath();ctx.fill();ctx.restore();}
function arrow(ctx,x1,y1,x2,y2,o={}){const{bend=0}=o,mx=(x1+x2)/2,my=(y1+y2)/2,L=Math.hypot(x2-x1,y2-y1)||1;arrowQ(ctx,x1,y1,mx-(y2-y1)/L*bend,my+(x2-x1)/L*bend,x2,y2,o);}

/* ---------- 相对原子质量（教材附录取值）与元素名称 ---------- */
const AM={H:1,C:12,N:14,O:16,Na:23,Mg:24,Al:27,S:32,Cl:35.5,K:39,Ca:40,Fe:56,Cu:64,Zn:65,P:31};
const ELN={H:'氢',C:'碳',N:'氮',O:'氧',Na:'钠',Mg:'镁',Al:'铝',S:'硫',Cl:'氯',K:'钾',Ca:'钙',Fe:'铁',Cu:'铜',Zn:'锌',P:'磷'};
const ACOL={H:'#e8f1ff',C:'#6b7a8f',N:'#3fa9ff',O:'#ff5d6c',Na:'#a98bff',Mg:'#9ee6b8',Al:'#c9d3e3',S:'#ffd23f',Cl:'#39ff88',K:'#c78bff',Ca:'#ffb000',Fe:'#ff8a3d',Cu:'#e07b50',Zn:'#8fb3c9',P:'#ff9f1c'};
/* 解析化学式（支持括号）：返回 [[元素, 原子数], …]，按首次出现顺序 */
function comp(f){let i=0;function grp(){const m=new Map();while(i<f.length&&f[i]!==')'){let sub;if(f[i]==='('){i++;sub=grp();i++;}else{const r=/^[A-Z][a-z]?/.exec(f.slice(i));i+=r[0].length;sub=new Map([[r[0],1]]);}
      const d=/^\d+/.exec(f.slice(i));const n=d?+d[0]:1;if(d)i+=d[0].length;sub.forEach((v,k)=>m.set(k,(m.get(k)||0)+v*n));}return m;}
  return[...grp()];}
const Mr=f=>Math.round(comp(f).reduce((a,[e,n])=>a+AM[e]*n,0)*10)/10;
const fmt1=x=>(Math.round(x*10)/10).toFixed(1).replace(/\.0$/,'');
/* “12×1+16×2”式的计算式 */
const mrExpr=f=>comp(f).map(([e,n])=>n>1?`${AM[e]}×${n}`:`${AM[e]}`).join(' + ');

/* ---------- 化学式排版：'CO(NH2)2'、'(NH4)2SO4'、'SO4^2-' ---------- */
function fmTokens(s){const out=[];let m=/^(\d+)/.exec(s);if(m){out.push({t:'coef',v:m[1]});s=s.slice(m[1].length);}
  const re=/([A-Z][a-z]?)(\d*)|\^(\d*[+-])|(\()|\)(\d*)/g;let k;
  while((k=re.exec(s))){if(k[1]){out.push({t:'el',v:k[1]});if(k[2])out.push({t:'sub',v:k[2]});}else if(k[3]){out.push({t:'sup',v:k[3].replace('-','−')});}
    else if(k[4]){out.push({t:'el',v:'('});}else if(k[0][0]===')'){out.push({t:'el',v:')'});if(k[5])out.push({t:'sub',v:k[5]});}}
  return out;}
const fm=s=>fmTokens(s).map(t=>t.t==='sub'?`<sub>${t.v}</sub>`:t.t==='sup'?`<sup>${t.v}</sup>`:t.v).join('');
const fmB=(s,cls='fm')=>`<b class="${cls}">${fm(s)}</b>`;
function fmDraw(ctx,s,x,y,size,{align='center',col=INK,cols={},measure=false,weight=700,glowB=0}={}){
  const toks=fmTokens(s);ctx.save();ctx.textBaseline='alphabetic';ctx.textAlign='left';if(glowB){ctx.shadowColor=col;ctx.shadowBlur=glowB;}
  const part=t=>{const sm=t.t==='sub'||t.t==='sup';ctx.font=`${weight} ${sm?size*.6:size}px ${FNUM}`;return ctx.measureText(t.v).width+(sm?1:0);};
  const W=toks.reduce((a,t)=>a+part(t),0);if(measure){ctx.restore();return W;}
  let cx=align==='center'?x-W/2:align==='right'?x-W:x;
  toks.forEach(t=>{const w=part(t);ctx.fillStyle=(t.t==='el'&&cols[t.v])||cols[t.t]||col;const dy=t.t==='sub'?size*.22:t.t==='sup'?-size*.48:0;ctx.fillText(t.v,cx,y+dy+size*.35);cx+=w;});
  ctx.restore();return W;}
/* 发光原子球 */
function atomBall(ctx,x,y,r,el,{a=ctx.globalAlpha,lab=true,glowA=.6}={}){const c=ACOL[el]||'#cccccc';ctx.save();ctx.globalAlpha=a;
  if(glowA){ctx.shadowColor=c;ctx.shadowBlur=r*.9*glowA;}
  const g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,shade(c,.6));g.addColorStop(.5,c);g.addColorStop(1,shade(c,-.45));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(x-r*.35,y-r*.42,r*.24,r*.13,-.6,0,TAU);ctx.fill();
  if(lab&&r>=10)txt(ctx,el,x,y+1,{size:Math.max(10,r*(el.length>1?.62:.75)),weight:700,col:['C','N','Na','K','Fe','Cu'].includes(el)?'#ffffff':'#0b1118'});ctx.restore();}

/* ---------- 计算器求值（题目卡里的数字作答见 quiz.js） ---------- */
function calcEval(s){const e=s.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-');if(!/^[0-9.+\-*/() ]+$/.test(e))return NaN;
  try{const v=Function('"use strict";return ('+e+')')();return typeof v==='number'&&isFinite(v)?v:NaN;}catch(_){return NaN;}}
const calcFmt=v=>String(Math.round(v*10000)/10000);
/* ---------- 计算器（独立面板）：+ − × ÷ ( ) =，“填入答案”把结果交给题目卡 ---------- */
function calcPad(box,{onFill}={}){let ex='',hist='',res=null;
  function render(){box.innerHTML=`<div class="ctop"><b><span class="ico">${icon('calculator-variant-outline','')}</span>计算器</b><button class="btn sm" data-a="fill">填入答案 ↑</button></div>
      <div class="cscreen"><em>${hist||'算完按题目要求取舍，再填入'}</em><span>${ex||'0'}</span></div>
      <div class="ckeys">${['7','8','9','÷','⌫','4','5','6','×','C','1','2','3','−','(','0','.','=','+',')'].map(k=>`<button data-k="${k}" class="${/[⌫C]/.test(k)?'fn':/[+−×÷()]/.test(k)?'op':k==='='?'eq':''}">${k==='⌫'?'退格':k==='C'?'清空':k}</button>`).join('')}</div>
`;
    $$('.ckeys button',box).forEach(b=>b.onclick=()=>{const k=b.dataset.k;
      if(k==='⌫')ex=ex.slice(0,-1);else if(k==='C'){ex='';hist='';res=null;}
      else if(k==='='){const v=calcEval(ex);if(isNaN(v)){hist='算式不完整';sfx('bad');render();return;}hist=ex+' =';ex=calcFmt(v);res=v;}
      else if(ex.length<30){if(res!==null&&/[0-9.(]/.test(k)&&hist.endsWith('=')){ex='';hist='';}res=null;ex+=k;}
      sfx('tick');render();});
    $('[data-a="fill"]',box).onclick=()=>{const v=/[+−×÷()]/.test(ex)?calcEval(ex):parseFloat(ex);if(isNaN(v)){sfx('bad');return;}
      if(onFill&&onFill(calcFmt(v))!==false)sfx('pop');};}
  render();return{reset(){ex='';hist='';res=null;render();}};}

/* ---------- 画布直接操作（触屏 / 鼠标通用） ---------- */
function canvasUI(cv,{tools=()=>[],hots=()=>[],onDrop=()=>false,onTap=null}={}){
  const ui={drag:null};let down=null;
  const toolAt=(x,y)=>tools().find(t=>t.on!==false&&Math.hypot(x-t.x,y-t.y)<t.r);
  const hotAt=(x,y)=>hots().find(h=>h.on!==false&&h.hit(x,y));
  cv.addEventListener('pointerdown',e=>{const[x,y]=ptIn(cv,e);down=[x,y];const t=toolAt(x,y);
    if(t){ui.drag={id:t.id,x,y,dx:x-t.x,dy:y-t.y,moved:false,t};try{cv.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();return;}
    const h=hotAt(x,y);if(h){h.act(x,y);}});
  cv.addEventListener('pointermove',e=>{const[x,y]=ptIn(cv,e);if(ui.drag){if(Math.hypot(x-down[0],y-down[1])>6)ui.drag.moved=true;ui.drag.x=x;ui.drag.y=y;return;}
    cv.style.cursor=toolAt(x,y)?'grab':hotAt(x,y)?'pointer':'default';});
  const end=e=>{if(!ui.drag)return;const d=ui.drag;ui.drag=null;const[x,y]=ptIn(cv,e);
    if(!d.moved){if(onTap)onTap(d.id);return;}if(!onDrop(d.id,x,y))sfx('click');};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',()=>{ui.drag=null;});
  ui.draw=ctx=>{tools().forEach(t=>{const dr=ui.drag&&ui.drag.id===t.id&&ui.drag.moved;
      ctx.save();if(t.on===false)ctx.globalAlpha=.3;t.draw(ctx,t.x,t.y,false);ctx.restore();
      if(dr){ctx.save();ctx.shadowColor='rgba(63,216,255,.6)';ctx.shadowBlur=18;t.draw(ctx,ui.drag.x-ui.drag.dx,ui.drag.y-ui.drag.dy,true);ctx.restore();}});};
  return ui;}

/* ---------- 弹出笔记：页眉“笔记”按钮，带插图的横线纸；点 ×、空白处、Esc、翻页都会关闭 ---------- */
const NOTEPOPS=[];
function notes(id,title,items,warn,fig){const slide=$(`[data-id="${id}"]`),stage=$('.stage',slide),tools=$('.hd .tools',slide);
  const pop=document.createElement('div');pop.className='notepop';
  pop.innerHTML=`<div class="card${fig?' wfig':''}"><button class="x" aria-label="关闭">×</button><h4>${title}</h4><div class="nb"><div><ol>${items.map(s=>`<li>${s}</li>`).join('')}</ol>${warn?`<div class="warn"><b>易错：</b>${warn}</div>`:''}</div>${fig?'<canvas class="nfig"></canvas>':''}</div></div>`;
  stage.appendChild(pop);const btn=document.createElement('button');btn.className='btn sm note';btn.textContent='笔记';tools.insertBefore(btn,tools.firstChild);
  const cv=$('canvas.nfig',pop);
  const draw=()=>{if(!fig||!cv)return;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);fig(ctx,w,h);};
  const open=()=>{pop.classList.add('on');btn.setAttribute('aria-pressed','true');requestAnimationFrame(draw);setTimeout(draw,350);sfx('whoosh');};
  const close=()=>{pop.classList.remove('on');btn.setAttribute('aria-pressed','false');};
  btn.onclick=()=>pop.classList.contains('on')?close():open();$('.x',pop).onclick=close;pop.addEventListener('click',e=>{if(e.target===pop)close();});
  new MutationObserver(()=>{if(!slide.classList.contains('active'))close();}).observe(slide,{attributes:true,attributeFilter:['class']});
  NOTEPOPS.push(close);return{close};}
addEventListener('keydown',e=>{if(e.key==='Escape')NOTEPOPS.forEach(f=>f());});
/* 笔记插图的“墨水”颜色（笔记纸是浅色） */
const PEN={ink:'#22261f',red:'#c2410c',blue:'#1d4ed8',green:'#15803d',gold:'#b45309',dim:'#6b6b5e',teal:'#0f766e'};
function penBox(ctx,x,y,w,h,col=PEN.ink,dash=null){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.8;if(dash)ctx.setLineDash(dash);rr(ctx,x,y,w,h,8);ctx.stroke();ctx.restore();}
const CN=['','一','二','三','四','五','六','七','八','九','十'];
const gcd=(a,b)=>b?gcd(b,a%b):a;
const sb=s=>String(s).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
