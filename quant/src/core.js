/* ================= 公共工具：画布、HUD 绘图、相对原子质量与化学式解析、判分（含数字键盘）、直接操作、弹出笔记 ================= */
const HAND='"ZCOOL KuaiLe","Noto Sans SC",sans-serif',FNUM='"Noto Sans SC",sans-serif';
const INK='#e2f6f0',DIM='#8aa5a0',FAINT='#56706c',CG='#39ff88',CC='#3fd8ff',CA='#ffb000',CM='#ff4fd8',CV='#a98bff',RED='#ff5d6c',BLUE='#3fa9ff',OKC='#39ff88',BADC='#ff5d6c',BGC='#080c11';
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

/* ---------- 单选、判断、多行选择 ---------- */
function single(box,sub,st,ans,{pts=5,ok='',bad='',onDone}={}){let pick=null,done=false;
  $$('.opt',box).forEach(b=>b.onclick=()=>{if(done)return;pick=+b.dataset.v;$$('.opt',box).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
  sub.onclick=()=>{if(done)return;if(pick===null){setSt(st,'warn','请先选择一个答案');return;}done=true;const tm=TEAM.cur;
    $$('.opt',box).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===ans)x.classList.add('right');else if(v===pick)x.classList.add('wrong');});
    if(pick===ans){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}答对 +${pts}</b>　${ok}`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}答错，不加分</b>　${bad}`);}
    teamNext();onDone&&onDone(pick===ans);};}
function tfGroup(box,sub,redo,st,items,{pts=5}={}){let pick={},done=false;
  function render(){box.innerHTML=items.map((it,i)=>`<div class="tf" data-i="${i}"><div>${it[0]}<small hidden>${it[2]||''}</small></div><span class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn" data-v="1" aria-pressed="${pick[i]===1}">对</button><button class="btn" data-v="0" aria-pressed="${pick[i]===0}">错</button></span></div>`).join('');
    $$('.tf',box).forEach(row=>{const i=+row.dataset.i;$$('button',row).forEach(b=>b.onclick=()=>{if(done)return;pick[i]=+b.dataset.v;sfx('click');render();});});}
  render();
  sub.onclick=()=>{if(done)return;if(Object.keys(pick).length<items.length){setSt(st,'warn','每一句都要判断哦');return;}done=true;const tm=TEAM.cur;let bad=0;
    $$('.tf',box).forEach(row=>{const i=+row.dataset.i,ok=(pick[i]===1)===items[i][1];if(!ok)bad++;row.classList.add(ok?'right':'wrong');const sm=$('small',row);if(sm.textContent)sm.hidden=false;});
    if(!bad){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +${pts}</b>`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}错 ${bad} 句，不加分</b>　看每句下面的解析。`);}teamNext();};
  redo.onclick=()=>{pick={};done=false;render();setSt(st,'',`全对 +${pts} 分`);};
  return{reset:()=>redo.onclick()};}

/* 物质选项卡：前 nEx 个是老师讲解的例子（“例”），后面是和右侧练习对应的物质（“练”），两组之间留空隙 */
function molTabs(ctx,G,list,cur,nEx,w,{y=12,maxW=130}={}){const gap=nEx&&nEx<list.length?22:0;G.cw=Math.min(maxW,(w-40-gap)/list.length-8);
  const tot=list.length*(G.cw+8)-8+gap,x0=w/2-tot/2;G.cx=i=>x0+i*(G.cw+8)+(i>=nEx?gap:0)+G.cw/2;
  if(gap){const xd=x0+nEx*(G.cw+8)-8+gap/2;line(ctx,xd,y+4,xd,y+36,{col:'rgba(226,246,240,.25)',w:1.5,dash:[3,4]});}
  list.forEach((f,i)=>{const on=f===cur,ex=i<nEx;hudBox(ctx,G.cx(i)-G.cw/2,y,G.cw,40,{col:on?CG:'rgba(63,216,255,.5)',fill:on?'rgba(57,255,136,.14)':'rgba(0,0,0,.35)',corner:8,glowA:on?1:0});
    fmDraw(ctx,f,G.cx(i)+9,y+20,f.length>6?16:19,{col:on?CG:INK});
    const bx=G.cx(i)-G.cw/2+4,by=y+4;ctx.fillStyle=ex?CA:'rgba(63,216,255,.85)';rr(ctx,bx,by,18,16,4);ctx.fill();txt(ctx,ex?'例':'练',bx+9,by+8.5,{size:11,weight:700,col:'#04121a'});});}
/* ---------- 数字键盘计算题：items=[{q, ans, kind:'num'|'ratio', unit, tol, why}]，一题一题做，每题提交后判分、换队
   calc:true 时键盘带 + − × ÷ ( ) =，可以当计算器用：按“=”算出结果，再改成要求的位数提交 ---------- */
function calcEval(s){const e=s.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-');if(!/^[0-9.+\-*/() ]+$/.test(e))return NaN;
  try{const v=Function('"use strict";return ('+e+')')();return typeof v==='number'&&isFinite(v)?v:NaN;}catch(_){return NaN;}}
const calcFmt=v=>String(Math.round(v*10000)/10000);
function kpQuiz(box,items,{pts=5,onJudge,calc=false}={}){let i=0,val='',done=false,res=[],hist='';
  const OPS=/[+−×÷()]/;
  // 比值：等比例就算对（不是最简比时提示看题目要求）
  const ratioOK=(s,ans)=>{const p=s.split('∶').filter(x=>x!=='').map(Number);if(p.length!==ans.length||p.some(x=>!(x>0)))return 'bad';
    if(p.every((x,k)=>Math.abs(x-ans[k])<1e-9))return 'ok';const k0=p[0]/ans[0];return p.every((x,k)=>Math.abs(x/ans[k]-k0)<1e-6)?'notmin':'bad';};
  const KEYS=it=>calc?['7','8','9','÷','⌫','4','5','6','×','C','1','2','3','−','(','0','.','=','+',')']
    :['7','8','9','⌫','4','5','6','C','1','2','3',it.kind==='ratio'?'∶':'%','0','.','',''];
  function render(){const it=items[i];box.innerHTML=`<div class="kprog">${items.map((_,k)=>`<i class="${res[k]===true?'ok':res[k]===false?'no':k===i?'cur':''}"></i>`).join('')}</div>
      <div class="kq">${it.q}</div><div class="kscreen${done?(res[i]?' right':' wrong'):''}">${calc&&hist&&!done?`<em class="khist">${hist}</em>`:''}<span>${val||'&nbsp;'}</span>${done?'':'<span class="cur"></span>'}${it.unit?`<span class="unit">${it.unit}</span>`:''}</div>
      <div class="kkeys${calc?' c5':''}">${KEYS(it).map(k=>k?`<button data-k="${k}" class="${/[⌫C∶%]/.test(k)?'fn':/[+−×÷()=]/.test(k)?'op':''}">${k==='⌫'?'退格':k==='C'?'清空':k}</button>`:'<span></span>').join('')}</div>
      <div class="row"><button class="btn pri sm" data-a="sub">提交</button><button class="btn sm" data-a="next">${i<items.length-1?'下一题':'从头再做'}</button>${calc?'<span class="hint">计算器：+ − × ÷ = 算完再按要求取舍</span>':''}</div>`;
    $$('.kkeys button',box).forEach(b=>b.onclick=()=>{if(done)return;const k=b.dataset.k;
      if(k==='⌫')val=val.slice(0,-1);else if(k==='C'){val='';hist='';}
      else if(k==='='){const v=calcEval(val);if(isNaN(v)){setSt(box.parentElement.querySelector('.status'),'warn','算式不完整，检查一下括号和运算符');return;}hist=val+' =';val=calcFmt(v);}
      else if(k==='%'){if(!val.endsWith('%'))val+='%';}
      else if(val.length<(calc?28:12)&&!val.endsWith('%'))val+=k;sfx('tick');render();});
    $('[data-a="sub"]',box).onclick=submit;$('[data-a="next"]',box).onclick=()=>{if(i<items.length-1)i++;else{i=0;res=[];}val='';hist='';done=false;render();onJudge&&onJudge(null);sfx('whoosh');};}
  function submit(){if(done)return;const it=items[i],st=box.parentElement.querySelector('.status');if(!val){setSt(st,'warn','先用键盘输入答案');return;}
    if(calc&&OPS.test(val)){const v=calcEval(val);if(isNaN(v)){setSt(st,'warn','算式不完整，检查一下括号和运算符');return;}hist=val+' =';val=calcFmt(v);}
    let ok,msg='';
    if(it.kind==='ratio'){const r=ratioOK(val,it.ans);ok=r!=='bad';if(r==='notmin')msg=`比值正确。<b>注意看题目要求</b>：若要求最简整数比，应写成 ${it.ans.join(' ∶ ')}。`;}
    else{const v=parseFloat(val.replace('%',''));ok=Math.abs(v-it.ans)<=(it.tol??1e-9);if(!ok&&it.unit==='%'&&Math.abs(v-it.ans*100)<.5)msg='注意：答案写成百分数。';}
    done=true;res[i]=ok;const tm=TEAM.cur;
    if(ok){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}答对 +${pts}</b>　${msg}${it.why}`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}答错，不加分</b>　${msg}${it.why}`);}
    teamNext();render();onJudge&&onJudge(ok,it,i);}
  render();return{reset(){i=0;val='';hist='';done=false;res=[];render();},get i(){return i;}};}

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
