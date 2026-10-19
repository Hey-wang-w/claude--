/* ================= 公共工具：画布、文字、判分、化学式排版、分子模型、直接操作 ================= */
const HAND='"ZCOOL KuaiLe","Noto Sans SC",sans-serif',FNUM='"Noto Sans SC",sans-serif';
const INK='#1f2a44',CORAL='#ff7a5c',TEAL='#1fb39f',GRAPE='#8a6cff',SUN='#ffd23f',SKY='#1f9fd6',OKC='#1f9d6b',BADC='#e5484d';
/* 画布：坐标用版面像素（不受整体缩放影响），清晰度按真实屏幕像素 */
function fitS(cv){
  const r=cv.getBoundingClientRect(),w=Math.max(1,cv.offsetWidth),h=Math.max(1,cv.offsetHeight),s=r.width/w||1;
  const dpr=Math.min(LOW?1:2,window.devicePixelRatio||1)*s;const W=Math.round(w*dpr),H=Math.round(h*dpr);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w,h,s};
}
const ptIn=(cv,e)=>{const r=cv.getBoundingClientRect(),s=r.width/cv.offsetWidth||1;return[(e.clientX-r.left)/s,(e.clientY-r.top)/s];};
const txt=(ctx,s,x,y,o={})=>label(ctx,s,x,y,Object.assign({col:INK,font:FNUM,weight:500},o));
const hand=(ctx,s,x,y,o={})=>label(ctx,s,x,y,Object.assign({col:INK,font:HAND,weight:400},o));
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);}
const rng=seed=>{let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647;};};
function setSt(el,cls,html){el.className='status'+(cls?' '+cls:'');el.innerHTML=html;}
function stampOn(host,text,ok=false,x='50%',y='40%'){let s=host.querySelector(':scope>.stamp');if(!s){s=document.createElement('div');s.className='stamp';host.appendChild(s);}
  s.textContent=text;s.classList.toggle('ok',ok);s.style.left=x;s.style.top=y;s.style.translate='-50% -50%';s.classList.remove('on');void s.offsetWidth;s.classList.add('on');sfx('stamp');}
function stampOff(host){const s=host.querySelector(':scope>.stamp');if(s)s.classList.remove('on');}
const sticker=(ctx,x,y,w,h,r,fill)=>{ctx.save();rr(ctx,x+4,y+4,w,h,r);ctx.fillStyle=INK;ctx.fill();rr(ctx,x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=INK;ctx.stroke();ctx.restore();};

/* ---------- 化学式排版：'C15H22O5'、'2H2O'、'Mg^2+'、'O^2-' ---------- */
function fmTokens(s){const out=[];let m=/^(\d+)/.exec(s);if(m){out.push({t:'coef',v:m[1]});s=s.slice(m[1].length);}
  const re=/([A-Z][a-z]?)(\d*)|\^(\d*[+-])|([a-z]+)(\d*)/g;let k;
  while((k=re.exec(s))){if(k[1]){out.push({t:'el',v:k[1]});if(k[2])out.push({t:'sub',v:k[2]});}else if(k[3]){out.push({t:'sup',v:k[3].replace('-','−')});}else{out.push({t:'el',v:k[4]});if(k[5])out.push({t:'sub',v:k[5]});}}
  return out;}
const fm=s=>fmTokens(s).map(t=>t.t==='sub'?`<sub>${t.v}</sub>`:t.t==='sup'?`<sup>${t.v}</sup>`:t.v).join('');
const fmB=(s,cls='fm')=>`<b class="${cls}">${fm(s)}</b>`;
/* 画布上画化学式：返回总宽度；colors 可给系数 / 下标 / 电荷单独上色 */
function fmDraw(ctx,s,x,y,size,{align='center',col=INK,cols={},measure=false,weight=700}={}){
  const toks=fmTokens(s);ctx.save();ctx.textBaseline='alphabetic';ctx.textAlign='left';
  const part=t=>{const sm=t.t==='sub'||t.t==='sup';ctx.font=`${weight} ${sm?size*.6:size}px ${FNUM}`;return ctx.measureText(t.v).width+(sm?1:0);};
  const W=toks.reduce((a,t)=>a+part(t),0);if(measure){ctx.restore();return W;}
  let cx=align==='center'?x-W/2:align==='right'?x-W:x;
  toks.forEach(t=>{const w=part(t);ctx.fillStyle=cols[t.t]||col;const dy=t.t==='sub'?size*.22:t.t==='sup'?-size*.48:0;ctx.fillText(t.v,cx,y+dy+size*.35);cx+=w;});
  ctx.restore();return W;}

/* ---------- 原子与分子模型（贴纸风：粗墨线 + 高光） ---------- */
const ATOM={H:['#ffffff','氢',.62],C:['#3d4352','碳',1],O:['#ff5a4e','氧',.95],N:['#3d7bff','氮',.95],Cl:['#3cc46a','氯',1.08],Na:['#8a6cff','钠',1.1],Mg:['#a6afc2','镁',1.05],
  Fe:['#d98a4e','铁',1.05],P:['#ff9f1c','磷',1.02],S:['#ffd23f','硫',1.02],K:['#b06cff','钾',1.15],Mn:['#9e7bd9','锰',1.05],He:['#6fe3ff','氦',.7],Ne:['#ff8fb8','氖',.75],
  Ar:['#7ed6f0','氩',.85],Hg:['#b8c2d6','汞',1.1],Cu:['#e08a5a','铜',1.02],Al:['#c2cad8','铝',1.02]};
function atomBall(ctx,x,y,r,el,{alpha=1,lab=true,hi=false}={}){if(!(r>1))return;const a=ATOM[el]||['#cccccc',el,1];ctx.save();ctx.globalAlpha=alpha;
  if(hi){ctx.fillStyle='rgba(255,210,63,.55)';ctx.beginPath();ctx.arc(x,y,r+8,0,TAU);ctx.fill();}
  const g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,shade(a[0],.55));g.addColorStop(.55,a[0]);g.addColorStop(1,shade(a[0],-.22));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.lineWidth=Math.max(1.5,r*.09);ctx.strokeStyle=INK;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.ellipse(x-r*.35,y-r*.42,r*.22,r*.13,-.6,0,TAU);ctx.fill();
  if(lab&&r>=11)txt(ctx,el,x,y+1,{size:Math.max(10,r*.72),weight:700,col:el==='C'||el==='N'||el==='K'||el==='Na'?'#ffffff':INK});
  ctx.restore();}
/* 分子模板：原子相对坐标（键长约 1）与化学键 */
const MOL={
  H2:{a:[['H',-.5,0],['H',.5,0]],b:[[0,1]]},
  O2:{a:[['O',-.55,0],['O',.55,0]],b:[[0,1,2]]},
  N2:{a:[['N',-.55,0],['N',.55,0]],b:[[0,1,3]]},
  H2O:{a:[['O',0,-.18],['H',-.78,.42],['H',.78,.42]],b:[[0,1],[0,2]]},
  CO2:{a:[['O',-1.05,0],['C',0,0],['O',1.05,0]],b:[[0,1,2],[1,2,2]]},
  CO:{a:[['C',-.55,0],['O',.55,0]],b:[[0,1,3]]},
  HCl:{a:[['H',-.6,0],['Cl',.62,0]],b:[[0,1]]},
  H2O2:{a:[['H',-1.35,.5],['O',-.5,0],['O',.5,0],['H',1.35,-.5]],b:[[0,1],[1,2],[2,3]]},
  NH3:{a:[['N',0,-.28],['H',-.85,.38],['H',.85,.38],['H',0,.82]],b:[[0,1],[0,2],[0,3]]},
  O3:{a:[['O',-.9,.35],['O',0,-.2],['O',.9,.35]],b:[[0,1,2],[1,2]]},
  HgO:{a:[['Hg',-.6,0],['O',.6,0]],b:[[0,1]]}};
function drawMol(ctx,key,cx,cy,unit,{alpha=1,rot=0,lab=true}={}){const M=MOL[key];if(!M)return;const P=M.a.map(([e,x,y])=>[e,cx+(x*Math.cos(rot)-y*Math.sin(rot))*unit,cy+(x*Math.sin(rot)+y*Math.cos(rot))*unit]);
  ctx.save();ctx.globalAlpha=alpha;M.b.forEach(([i,j,n=1])=>{const[,x1,y1]=P[i],[,x2,y2]=P[j],L=Math.hypot(x2-x1,y2-y1),nx=-(y2-y1)/L,ny=(x2-x1)/L;
    for(let k=0;k<n;k++){const o=(k-(n-1)/2)*unit*.16;ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=unit*.16+3;ctx.beginPath();ctx.moveTo(x1+nx*o,y1+ny*o);ctx.lineTo(x2+nx*o,y2+ny*o);ctx.stroke();
      ctx.strokeStyle='#c9d3e3';ctx.lineWidth=unit*.16;ctx.stroke();}});ctx.restore();
  P.forEach(([e,x,y])=>atomBall(ctx,x,y,unit*.42*ATOM[e][2],e,{alpha,lab}));}

/* ---------- 单选题：选项容器 + 提交 + 状态栏 ---------- */
function single(box,sub,st,ans,{pts=5,ok='',bad='',onDone}={}){let pick=null,done=false;
  $$('.opt',box).forEach(b=>b.onclick=()=>{if(done)return;pick=+b.dataset.v;$$('.opt',box).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
  sub.onclick=()=>{if(done)return;if(pick===null){setSt(st,'warn','请先选择一个答案');return;}done=true;const tm=TEAM.cur;
    $$('.opt',box).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===ans)x.classList.add('right');else if(v===pick)x.classList.add('wrong');});
    if(pick===ans){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}答对 +${pts}</b>　${ok}`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}答错，不加分</b>　${bad}`);}
    teamNext();onDone&&onDone(pick===ans);};}
/* 判断题组：items=[[句子,对错,解析]]，全部选完后提交，全对加分 */
function tfGroup(box,sub,redo,st,items,{pts=5}={}){let pick={},done=false;
  function render(){box.innerHTML=items.map((it,i)=>`<div class="tf" data-i="${i}"><div>${it[0]}<small hidden>${it[2]||''}</small></div><span class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn" data-v="1" aria-pressed="${pick[i]===1}">对</button><button class="btn" data-v="0" aria-pressed="${pick[i]===0}">错</button></span></div>`).join('');
    $$('.tf',box).forEach(row=>{const i=+row.dataset.i;$$('button',row).forEach(b=>b.onclick=()=>{if(done)return;pick[i]=+b.dataset.v;sfx('click');render();});});}
  render();
  sub.onclick=()=>{if(done)return;if(Object.keys(pick).length<items.length){setSt(st,'warn','每一句都要判断哦');return;}done=true;const tm=TEAM.cur;let bad=0;
    $$('.tf',box).forEach(row=>{const i=+row.dataset.i,ok=(pick[i]===1)===items[i][1];if(!ok)bad++;row.classList.add(ok?'right':'wrong');const sm=$('small',row);if(sm.textContent)sm.hidden=false;});
    if(!bad){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +${pts}</b>`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}错 ${bad} 句，不加分</b>　看每句下面的解析。`);}teamNext();};
  redo.onclick=()=>{pick={};done=false;render();setSt(st,'',`全对 +${pts} 分`);};}

/* ---------- 画布直接操作（触屏 / 鼠标通用） ----------
   tools(): [{id,x,y,r,on,draw}] 可拖动；hots(): [{hit,act}] 可点击；onDrop(id,x,y) 返回 true 表示放到了有效位置。 */
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
      if(dr){ctx.save();ctx.shadowColor='rgba(31,42,68,.35)';ctx.shadowBlur=12;ctx.shadowOffsetY=8;t.draw(ctx,ui.drag.x-ui.drag.dx,ui.drag.y-ui.drag.dy,true);ctx.restore();}});};
  return ui;}
/* DOM 拖拽（触屏 / 鼠标通用）：el 跟随手指移动，松手时回调落点下的元素 */
function domDrag(el,{onDrop,onTap}){let st=null;
  el.addEventListener('pointerdown',e=>{st={x:e.clientX,y:e.clientY,moved:false};try{el.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
  el.addEventListener('pointermove',e=>{if(!st)return;const dx=(e.clientX-st.x)/SCALE,dy=(e.clientY-st.y)/SCALE;if(!st.moved&&Math.hypot(dx,dy)<6)return;
    if(!st.moved){st.moved=true;el.style.zIndex=50;el.style.position='relative';el.style.pointerEvents='none';el.classList.add('lift');}
    el.style.transform=`translate(${dx}px,${dy}px) rotate(-3deg)`;el.style.boxShadow='8px 10px 0 rgba(31,42,68,.35)';});
  const fin=e=>{if(!st)return;const m=st.moved;st=null;el.style.transform='';el.style.boxShadow='';el.style.zIndex='';el.style.pointerEvents='';
    if(!m){onTap&&onTap(el);return;}const under=document.elementFromPoint(e.clientX,e.clientY);onDrop&&onDrop(el,under);};
  el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',()=>{st=null;el.style.transform='';el.style.pointerEvents='';});}
const CN=['','一','二','三','四','五','六','七','八','九','十'];
