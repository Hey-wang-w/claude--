/* ================= 公共工具：画布、粉笔线条、化学式排版（含化合价标注、原子团括号）、判分、直接操作、弹出笔记 ================= */
const HAND='"ZCOOL KuaiLe","Noto Sans SC",sans-serif',FNUM='"Noto Sans SC",sans-serif';
const INK='#f1eee4',DIM='#b9c4b8',BOARD='#1b2f26',CY='#ffe27a',CP='#ff9eb5',CB='#8fd3ff',CG='#a8e6a1',CO='#ffb36b',CL='#c7b8ff',OKC='#a8e6a1',BADC='#ff8f8f';
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

/* ---------- 粉笔笔触：同一条线画两三遍、略有抖动和透明度变化，看起来像粉笔 ---------- */
function chalkPath(ctx,pts,{col=INK,w=3,a=.9,seed=1,closed=false}={}){const R=rng(seed*7919+13);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;
  for(let pass=0;pass<2;pass++){ctx.globalAlpha=a*(pass?.45:.9);ctx.lineWidth=w*(pass?1.5:1);ctx.beginPath();
    pts.forEach(([x,y],i)=>{const jx=(R()-.5)*1.4,jy=(R()-.5)*1.4;i?ctx.lineTo(x+jx,y+jy):ctx.moveTo(x+jx,y+jy);});if(closed)ctx.closePath();ctx.stroke();}
  ctx.restore();}
function chalkLine(ctx,x1,y1,x2,y2,o={}){const n=Math.max(2,Math.round(Math.hypot(x2-x1,y2-y1)/18)),p=[];for(let i=0;i<=n;i++)p.push([lerp(x1,x2,i/n),lerp(y1,y2,i/n)]);chalkPath(ctx,p,o);}
function chalkRect(ctx,x,y,w,h,o={}){const{fill=null,r=10}=o;if(fill){ctx.save();ctx.fillStyle=fill;rr(ctx,x,y,w,h,r);ctx.fill();ctx.restore();}
  const p=[];const seg=(x1,y1,x2,y2)=>{const n=Math.max(2,Math.round(Math.hypot(x2-x1,y2-y1)/22));for(let i=0;i<n;i++)p.push([lerp(x1,x2,i/n),lerp(y1,y2,i/n)]);};
  seg(x+r,y,x+w-r,y);seg(x+w,y+r,x+w,y+h-r);seg(x+w-r,y+h,x+r,y+h);seg(x,y+h-r,x,y+r);p.push(p[0]);chalkPath(ctx,p,o);}
function chalkCircle(ctx,x,y,r,o={}){const{fill=null}=o;if(fill){ctx.save();ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.restore();}
  const n=Math.max(12,Math.round(r/2.5)),p=[];for(let i=0;i<=n;i++){const a=i/n*TAU;p.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}chalkPath(ctx,p,o);}
/* 粉笔“原子”：彩色粉笔涂满的圆 + 白色轮廓 + 元素符号 */
const ACOL={H:'#f1eee4',O:'#ff9eb5',C:'#b9c4b8',N:'#8fd3ff',Cl:'#a8e6a1',Na:'#c7b8ff',Mg:'#ffd59e',Fe:'#ffb36b',Ca:'#ffe27a',K:'#d9b8ff',Al:'#cfd8dc',S:'#ffe27a',P:'#ffb36b'};
function chalkAtom(ctx,x,y,r,el,{a=1,seed=3}={}){ctx.save();ctx.globalAlpha=a;const c=ACOL[el]||'#dddddd';
  const g=ctx.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r);g.addColorStop(0,c);g.addColorStop(1,shade(c,-.25));ctx.globalAlpha=a*.88;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  ctx.globalAlpha=a;chalkCircle(ctx,x,y,r,{w:2,col:INK,seed});txt(ctx,el,x,y+1,{size:Math.max(11,r*.72),weight:700,col:'#1f3328'});ctx.restore();}

/* ---------- 化学式排版：'Na2CO3'、'Ca(OH)2'、'SO4^2-'、化合价写成 'Na2C{+4}O3' ---------- */
function fmTokens(s){const out=[];let m=/^(\d+)/.exec(s);if(m){out.push({t:'coef',v:m[1]});s=s.slice(m[1].length);}
  const re=/([A-Z][a-z]?)(\d*)|\^(\d*[+-])|\{([+-]?\d+)\}|(\()|\)(\d*)|([a-z]+)(\d*)|(\d+)/g;let k;
  while((k=re.exec(s))){if(k[1]){out.push({t:'el',v:k[1]});if(k[2])out.push({t:'sub',v:k[2]});}
    else if(k[3]){out.push({t:'sup',v:k[3].replace('-','−')});}
    else if(k[4]!==undefined){out.push({t:'val',v:k[4].replace('-','−')});}
    else if(k[5]){out.push({t:'el',v:'('});}
    else if(k[6]!==undefined&&k[0][0]===')'){out.push({t:'el',v:')'});if(k[6])out.push({t:'sub',v:k[6]});}
    else if(k[7]){out.push({t:'el',v:k[7]});if(k[8])out.push({t:'sub',v:k[8]});}
    else if(k[9])out.push({t:'sub',v:k[9]});}
  return out;}
function fm(s){const toks=fmTokens(s),parts=[];let lastEl=-1;
  toks.forEach(t=>{if(t.t==='val'){if(lastEl>=0)parts[lastEl]=`<span class="vl"><i>${t.v}</i><b>${parts[lastEl]}</b></span>`;return;}
    if(t.t==='el'){lastEl=parts.length;parts.push(t.v);}else parts.push(t.t==='sub'?`<sub>${t.v}</sub>`:t.t==='sup'?`<sup>${t.v}</sup>`:t.v);});
  return parts.join('');}
const fmB=(s,cls='fm')=>`<b class="${cls}">${fm(s)}</b>`;
/* 画布上画化学式：返回总宽度；cols 可给系数 / 下标 / 电荷 / 化合价单独上色 */
function fmDraw(ctx,s,x,y,size,{align='center',col=INK,cols={},measure=false,weight=700}={}){
  const toks=fmTokens(s);ctx.save();ctx.textBaseline='alphabetic';ctx.textAlign='left';
  const part=t=>{if(t.t==='val')return 0;const sm=t.t==='sub'||t.t==='sup';ctx.font=`${weight} ${sm?size*.6:size}px ${FNUM}`;return ctx.measureText(t.v).width+(sm?1:0);};
  const W=toks.reduce((a,t)=>a+part(t),0);if(measure){ctx.restore();return W;}
  let cx=align==='center'?x-W/2:align==='right'?x-W:x,last=null;
  toks.forEach(t=>{if(t.t==='val'){if(last){ctx.font=`${weight} ${size*.5}px ${FNUM}`;ctx.fillStyle=cols.val||CY;ctx.textAlign='center';ctx.fillText(t.v,last[0]+last[1]/2,y-size*.62);ctx.textAlign='left';}return;}
    const w=part(t);ctx.fillStyle=cols[t.t]||col;const dy=t.t==='sub'?size*.22:t.t==='sup'?-size*.48:0;ctx.fillText(t.v,cx,y+dy+size*.35);if(t.t==='el')last=[cx,w];cx+=w;});
  ctx.restore();return W;}

/* ---------- 单选题与判断题组 ---------- */
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
  redo.onclick=()=>{pick={};done=false;render();setSt(st,'',`全对 +${pts} 分`);};}
/* 多行选择（每行选一个）：rows=[[题干html, 选项数组, 正确下标]]，全选完提交，全对加分 */
function rowQuiz(box,sub,redo,st,rows,{pts=5,okMsg='',keyHtml=''}={}){let pick={},done=false;
  function render(){box.innerHTML=keyHtml+rows.map((q,i)=>`<div class="qrow" data-i="${i}"><span>${q[0]}</span><span class="cs">${q[1].map((o,k)=>`<button data-k="${k}" aria-pressed="${pick[i]===k}">${o}</button>`).join('')}</span></div>`).join('');
    $$('.qrow',box).forEach(r=>{const i=+r.dataset.i;$$('button',r).forEach(b=>b.onclick=()=>{if(done)return;pick[i]=+b.dataset.k;sfx('click');render();});});}
  render();
  sub.onclick=()=>{if(done)return;if(Object.keys(pick).length<rows.length){setSt(st,'warn','每一行都要选');return;}done=true;const tm=TEAM.cur;let bad=0;
    $$('.qrow',box).forEach(r=>{const i=+r.dataset.i,ok=pick[i]===rows[i][2];if(!ok)bad++;r.classList.add(ok?'right':'wrong');$$('button',r)[rows[i][2]].classList.add('ans');});
    if(!bad){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +${pts}</b>　${okMsg}`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}错 ${bad} 处，不加分</b>　绿色的是正确答案。`);}teamNext();};
  redo.onclick=()=>{pick={};done=false;render();setSt(st,'',`全对 +${pts} 分`);};
  return{reset:()=>redo.onclick()};}

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
      if(dr){ctx.save();ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=14;ctx.shadowOffsetY=8;t.draw(ctx,ui.drag.x-ui.drag.dx,ui.drag.y-ui.drag.dy,true);ctx.restore();}});};
  return ui;}
/* DOM 拖拽：el 跟随手指移动，松手时回调落点下的元素 */
function domDrag(el,{onDrop,onTap}){let st=null;
  el.addEventListener('pointerdown',e=>{st={x:e.clientX,y:e.clientY,moved:false};try{el.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
  el.addEventListener('pointermove',e=>{if(!st)return;const dx=(e.clientX-st.x)/SCALE,dy=(e.clientY-st.y)/SCALE;if(!st.moved&&Math.hypot(dx,dy)<6)return;
    if(!st.moved){st.moved=true;el.style.zIndex=50;el.style.position='relative';el.style.pointerEvents='none';}
    el.style.transform=`translate(${dx}px,${dy}px) rotate(-3deg)`;});
  const fin=e=>{if(!st)return;const m=st.moved;st=null;el.style.transform='';el.style.zIndex='';el.style.pointerEvents='';
    if(!m){onTap&&onTap(el);return;}const under=document.elementFromPoint(e.clientX,e.clientY);onDrop&&onDrop(el,under);};
  el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',()=>{st=null;el.style.transform='';el.style.pointerEvents='';});}

/* ---------- 弹出笔记：页眉“笔记”按钮（重新开始前面），点开是一张带插图的横线笔记纸；点 ×、空白处、Esc、翻页都会关闭 ----------
   fig(ctx,w,h)：在笔记纸右侧画插图（深色墨水 + 彩笔），用来配合文字的图图画画 */
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
/* 笔记插图用的“墨水”颜色（笔记纸是浅色） */
const PEN={ink:'#2a2a24',red:'#c2410c',blue:'#1d4ed8',green:'#15803d',gold:'#b45309',dim:'#6b6b5e'};
/* 原子结构示意图（教材画法：圆圈 + 核电荷数，弧线 + 电子数），可画在画布或生成内联 SVG */
function shellDraw(ctx,x,y,Z,shells,{col=PEN.ink,size=1,hiLast=null}={}){const r=13*size;ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
  txt(ctx,`+${Z}`,x,y+1,{size:11*size,weight:700,col});
  shells.forEach((n,i)=>{const ax=x+r+10*size+i*16*size;ctx.beginPath();ctx.arc(ax-8*size,y,15*size,-0.9,0.9);ctx.strokeStyle=col;ctx.stroke();
    txt(ctx,String(n),ax+7*size,y-12*size,{size:11*size,weight:700,col:i===shells.length-1&&hiLast?hiLast:col});});ctx.restore();}
function shellSvg(Z,shells){const W=34+shells.length*15;let s=`<svg class="shsv" viewBox="0 0 ${W} 30" width="${W*1.1}" height="33"><circle cx="13" cy="17" r="11" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="13" y="21" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">+${Z}</text>`;
  shells.forEach((n,i)=>{const ax=30+i*15;s+=`<path d="M${ax-2} 6 Q${ax+6} 17 ${ax-2} 28" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="${ax+6}" y="11" font-size="9.5" font-weight="700" fill="currentColor">${n}</text>`;});
  return s+'</svg>';}
const CN=['','一','二','三','四','五','六','七','八','九','十'];
const gcd=(a,b)=>b?gcd(b,a%b):a;
