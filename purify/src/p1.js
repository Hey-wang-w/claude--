/* ================= 共用小工具 ================= */
const P2D={};
function mdiDraw(ctx,k,x,y,size,col){const m=MDI[k];if(!m)return;P2D[k]=P2D[k]||new Path2D(m[0]);ctx.save();ctx.translate(x-size/2,y-size/2);ctx.scale(size/24,size/24);ctx.fillStyle=col;ctx.fill(P2D[k]);ctx.restore();}
function setSt(el,cls,html){el.className='status'+(cls?' '+cls:'');el.innerHTML=html;}
function stampOn(host,text,ok=false,x='50%',y='40%'){let s=host.querySelector('.stamp');if(!s){s=document.createElement('div');s.className='stamp';host.appendChild(s);}
  s.textContent=text;s.classList.toggle('ok',ok);s.style.left=x;s.style.top=y;s.style.translate='-50% -50%';s.classList.remove('on');void s.offsetWidth;s.classList.add('on');sfx('stamp');}
function stampOff(host){const s=host.querySelector('.stamp');if(s)s.classList.remove('on');}
const rng=seed=>{let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647;};};
/* 单选题：opts 容器 + 提交按钮 + 状态栏 */
function single(box,sub,st,ans,{pts=5,ok='',bad='',onDone}={}){let pick=null,done=false;
  $$('.opt',box).forEach(b=>b.onclick=()=>{if(done)return;pick=+b.dataset.v;$$('.opt',box).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
  sub.onclick=()=>{if(done)return;if(pick===null){setSt(st,'warn','请先选择一个答案');return;}done=true;const tm=TEAM.cur;
    $$('.opt',box).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===ans)x.classList.add('right');else if(v===pick)x.classList.add('wrong');});
    if(pick===ans){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}答对 +${pts}</b>　${ok}`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}答错，不加分</b>　${bad}`);}
    teamNext();onDone&&onDone(pick===ans);};
  return{reset(){pick=null;done=false;$$('.opt',box).forEach(x=>{x.disabled=false;x.classList.remove('right','wrong');x.setAttribute('aria-pressed','false');});}};}

/* ================= 1 封面：一杯浑浊河水 ================= */
S.cover=(()=>{const cv=$('#cvCover');let t=0,sel=-1,selT=0;const R=rng(11);
  const ps=Array.from({length:150},()=>({x:R(),y:R(),r:R()<.25?2.2+R()*2.2:.8+R()*1.3,ph:R()*6,c:R()<.5?'#7a5b37':'#a3855a'}));
  const bac=Array.from({length:7},()=>({x:R(),y:R(),a:R()*6,l:14+R()*8}));
  const info=[['泥沙','不溶性杂质 · 可沉降、过滤除去'],['色素、异味','可溶性杂质 · 可用活性炭吸附'],['细菌等微生物','需要消毒杀灭'],['可溶性钙、镁化合物','过滤、吸附都除不掉']];
  $$('#covChips .imp').forEach(b=>b.onclick=()=>{sel=+b.dataset.k;selT=0;b.classList.add('done');sfx('pop');burstAt(b,12,[CIN,MUST]);});
  function tick(dt){t+=dt;selT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const cx=w*.4,by=h-150,bw=Math.min(330,w*.52),bh=Math.min(430,h-150),l=cx-bw/2,top=by-bh*.78;
    ctx.fillStyle='rgba(60,40,10,.12)';ctx.beginPath();ctx.ellipse(cx,by+6,bw*.6,12,0,0,TAU);ctx.fill();
    beaker(ctx,cx,by,bw,bh,{lv:.78,col:waterCol(sel===1?.7:.78,{tint:sel===1?.12:0}),col2:waterCol(.95),ticks:6,sed:12});
    ctx.save();beakerPath(ctx,cx,by,bw,bh);ctx.clip();
    ps.forEach(p=>{const x=l+8+p.x*(bw-16)+Math.sin(t*.6+p.ph)*4,y=top+10+p.y*(by-top-24)+Math.cos(t*.5+p.ph)*3;ctx.fillStyle=p.c;ctx.globalAlpha=sel===0?1:.75;ctx.beginPath();ctx.arc(x,y,p.r*(sel===0?1.35:1),0,TAU);ctx.fill();});
    ctx.globalAlpha=1;
    if(sel===1){for(let i=0;i<5;i++){const yy=top+40+i*55,g=ctx.createRadialGradient(cx+Math.sin(t+i)*60,yy,4,cx+Math.sin(t+i)*60,yy,90);g.addColorStop(0,'rgba(205,140,60,.35)');g.addColorStop(1,'rgba(205,140,60,0)');ctx.fillStyle=g;ctx.fillRect(l,yy-90,bw,180);}}
    ctx.restore();
    // 水面波纹
    ctx.save();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.beginPath();for(let x=l+3;x<=l+bw-3;x+=6)ctx.lineTo(x,top+Math.sin(x*.05+t*2)*1.6);ctx.stroke();ctx.restore();
    // 放大镜
    const mx=Math.min(w-104,cx+bw*.5+110),my=Math.max(118,top-10),mr=96;
    ctx.save();ctx.strokeStyle='rgba(40,40,46,.85)';ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(mx-mr*.72,my+mr*.72);ctx.lineTo(mx-mr*1.12,my+mr*1.12);ctx.stroke();
    ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.fillStyle='#fdfcf8';ctx.fill();ctx.save();ctx.clip();ctx.fillStyle=waterCol(.25);ctx.fillRect(mx-mr,my-mr,mr*2,mr*2);
    if(sel===-1){hand(ctx,'点下方标签',mx,my-12,{size:24,col:'#3a4a5a'});hand(ctx,'看看水里有什么',mx,my+20,{size:22,col:'#3a4a5a'});}
    else if(sel===0){for(let i=0;i<9;i++){const a=i*.7+t*.2,rr2=10+i*7;ctx.fillStyle=i%2?'#7a5b37':'#9b7b4e';ctx.beginPath();ctx.ellipse(mx+Math.cos(a)*rr2*1.3,my+Math.sin(a)*rr2,7+i%3*4,5+i%2*3,a,0,TAU);ctx.fill();}}
    else if(sel===1){ctx.fillStyle='rgba(214,170,70,.25)';ctx.fillRect(mx-mr,my-mr,2*mr,2*mr);for(let i=0;i<10;i++){const a=i*2.4+t*.4,d=18+(i*13)%58,x=mx+Math.cos(a)*d,y=my+Math.sin(a*1.1)*d*.8;i%2?odorMol(ctx,x,y,7,t+i):pigmentMol(ctx,x,y,7);}}
    else if(sel===2){bac.forEach((b,i)=>{b.a+=dt*(.3+i*.05);const x=mx+(b.x-.5)*mr*1.4+Math.cos(b.a)*8,y=my+(b.y-.5)*mr*1.4+Math.sin(b.a)*8;ctx.save();ctx.translate(x,y);ctx.rotate(b.a);rr(ctx,-b.l/2,-5,b.l,10,5);ctx.fillStyle='#6fae86';ctx.fill();ctx.strokeStyle='#2f6a49';ctx.lineWidth=1.5;ctx.stroke();
      ctx.strokeStyle='#2f6a49';ctx.beginPath();ctx.moveTo(b.l/2,0);ctx.quadraticCurveTo(b.l/2+6,Math.sin(t*12+i)*5,b.l/2+12,0);ctx.stroke();ctx.restore();});}
    else{for(let i=0;i<8;i++){const a=i*.8+t*.3,d=22+(i*17)%55,x=mx+Math.cos(a)*d,y=my+Math.sin(a)*d*.85;ionDot(ctx,x,y,14,i%2?'Mg²⁺':'Ca²⁺');}}
    ctx.restore();ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.lineWidth=9;ctx.strokeStyle='#2c2f36';ctx.stroke();ctx.lineWidth=2;ctx.strokeStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(mx,my,mr-7,3.6,4.6);ctx.stroke();ctx.restore();
    if(sel>=0){const a=clamp(selT*3,0,1);ctx.globalAlpha=a;const lx2=Math.min(mx,w-140);hand(ctx,info[sel][0],lx2,my+mr+34,{size:28,col:CIN});txt(ctx,info[sel][1],lx2,my+mr+64,{size:15,col:'#4a4f5c'});ctx.globalAlpha=1;}
    hand(ctx,'浑浊的河水',cx,by+34,{size:26,col:'#4a4f5c'});
  }
  return{tick};})();

/* ================= 2 自来水厂净水流程 ================= */
S.plant=(()=>{const cv=$('#cvPlant');let t=0,step=0,front=0;
  const ST=[
    {n:'取水口',d:'从江河、湖泊或水库中取水，水中含泥沙、色素、细菌等杂质。',x:.075},
    {n:'加絮凝剂',d:'加入明矾等絮凝剂，生成胶状物吸附悬浮杂质。',x:.2},
    {n:'反应沉淀池',d:'絮状物越聚越大，沉到池底——沉降。',x:.335},
    {n:'过滤池',d:'水流过砂层、砾石层，除去不溶性杂质——过滤。',x:.48},
    {n:'活性炭吸附池',d:'活性炭疏松多孔，吸附色素和异味——吸附。',x:.625},
    {n:'清水池 · 投药消毒',d:'投入消毒剂杀灭细菌等微生物——消毒（化学变化）。',x:.77},
    {n:'配水泵 → 用户',d:'自来水经管网送到千家万户。它仍含可溶性杂质，是混合物。',x:.915}];
  const TURB=[.92,.85,.42,.18,.07,.04,.04];
  const seqItems=[['过滤池','除去不溶性杂质',2],['投药消毒','杀灭细菌',4],['反应沉淀池','加絮凝剂，沉降',1],['活性炭吸附池','除色素异味',3]];
  let order=[],judged=false;const box=$('#plSeq'),st=$('#plSt');
  function renderSeq(){box.innerHTML=seqItems.map((s,i)=>`<button class="seqc${order.includes(i)?' on':''}" data-i="${i}"><em>${order.includes(i)?order.indexOf(i)+1:''}</em>${s[0]}<small>${s[1]}</small></button>`).join('');
    $$('.seqc',box).forEach(b=>b.onclick=()=>{if(judged)return;const i=+b.dataset.i;if(order.includes(i))order=order.filter(x=>x!==i);else order.push(i);sfx('click');renderSeq();});}
  $('#plSub').onclick=()=>{if(judged)return;if(order.length<4){setSt(st,'warn','还没排完，请把 4 项都排上序号');return;}judged=true;const tm=TEAM.cur;let all=true;
    $$('.seqc',box).forEach(b=>{const i=+b.dataset.i,ok=order.indexOf(i)+1===seqItems[i][2];all=all&&ok;b.classList.add(ok?'right':'wrong');if(!ok)b.querySelector('em').textContent=seqItems[i][2];});
    if(all){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +5</b>　沉淀 → 过滤 → 吸附 → 消毒`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}有误，不加分</b>　红框里已改为正确序号：沉淀 → 过滤 → 吸附 → 消毒`);}teamNext();};
  $('#plRedo').onclick=()=>{order=[];judged=false;renderSeq();setSt(st,'','排好后提交，正确 +5 分');};
  renderSeq();
  const go=d=>{step=clamp(step+d,0,ST.length-1);sfx(d>0?'whoosh':'click');upd();};
  function upd(){$('#plPrev').disabled=step===0;$('#plNext').disabled=step===ST.length-1;$('#plHint').textContent=`第 ${step+1} 站 / 共 ${ST.length} 站 · 可直接点水池`;}
  const Gp={};canvasUI(cv,{hots:()=>Gp.w?ST.map((s2,i)=>({hit:(x,y)=>Math.abs(x-s2.x*Gp.w)<Gp.tw/2+16&&y>Gp.G-150&&y<Gp.G+Gp.d+80,act:()=>{if(i===step)return;step=i;sfx('whoosh');upd();}})):[]});
  $('#plNext').onclick=()=>go(1);$('#plPrev').onclick=()=>go(-1);$('#plReset').onclick=()=>{step=0;front=0;upd();};upd();
  /* 每一站之后水中还剩的杂质：0 泥沙大颗粒 1 细小不溶物 2 色素异味 3 细菌 4 钙镁化合物 */
  const LEFT=[[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,1],[0,0,1,1,1],[0,0,0,1,1],[0,0,0,0,1],[0,0,0,0,1]];
  const ROWS=[['泥沙等较大颗粒',2,'沉淀'],['细小的不溶性杂质',3,'过滤'],['色素、异味（可溶）',4,'吸附'],['细菌等微生物',5,'消毒'],['钙、镁化合物（可溶）',99,'']];
  const strike=ROWS.map(()=>0);
  function impurities(ctx,l,top,w,hh,lf,t,seed,dying=0){const R=rng(seed);
    if(lf[1]){for(let k=0;k<(lf[0]?9:5);k++){const x=l+8+R()*(w-16),y=top+8+((R()*hh+t*(lf[0]?10:3))%(hh-16));grain(ctx,x,y,lf[0]&&k%2?5.5:2.6,k+seed);}}
    if(lf[2]){for(let k=0;k<3;k++){const x=l+14+R()*(w-28),y=top+16+R()*(hh-30)+Math.sin(t+k)*3;k%2?odorMol(ctx,x,y,4.5,t+k):pigmentMol(ctx,x,y,4.5);}}
    if(lf[3]||dying>0){for(let k=0;k<3;k++){const x=l+16+((R()*w+t*11)%(w-32)),y=top+14+R()*(hh*.6);ctx.save();ctx.globalAlpha=lf[3]?1:dying;bacterium(ctx,x,y,15,Math.sin(t+k)*.6+k,lf[3]?t+k:0,lf[3]?'#5f9e74':'#9a9ca3');
      if(!lf[3]){ctx.strokeStyle=CIN;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-6,y-6);ctx.lineTo(x+6,y+6);ctx.moveTo(x+6,y-6);ctx.lineTo(x-6,y+6);ctx.stroke();}ctx.restore();}}
    if(lf[4]){for(let k=0;k<3;k++){const x=l+12+R()*(w-24),y=top+12+R()*(hh-24)+Math.cos(t*.8+k)*3;ionDot(ctx,x,y,6.5);}}}
  function tank(ctx,x,G,w,d,st,t,on,dying){const l=x-w/2,lf=LEFT[st],turb=TURB[st];
    ctx.save();ctx.shadowColor='rgba(60,40,10,.18)';ctx.shadowBlur=10;ctx.shadowOffsetY=4;ctx.fillStyle='#cfc8bb';rr(ctx,l-10,G-18,w+20,d+28,6);ctx.fill();ctx.restore();
    ctx.fillStyle='#b7ae9f';ctx.fillRect(l-10,G-18,w+20,6);ctx.fillStyle='#e9e4da';ctx.fillRect(l,G-12,w,d+12);
    if(!on)return;
    const wy=G-6;ctx.save();ctx.beginPath();ctx.rect(l,wy,w,d+6);ctx.clip();
    ctx.fillStyle=waterCol(turb,{a:1.05,yel:lf[2]?.55:0});ctx.fillRect(l,wy,w,d+6);let hh=d;
    if(st===2){ctx.fillStyle='#7d6040';ctx.beginPath();ctx.moveTo(l,G+d);for(let k=0;k<=8;k++)ctx.lineTo(l+w*k/8,G+d-16-4*Math.sin(k*1.9));ctx.lineTo(l+w,G+d);ctx.fill();for(let k=0;k<7;k++)grain(ctx,l+8+k*(w-16)/6,G+d-10,5,k+40);hh=d-20;}
    if(st===3){const ly=[[.55,'#d8c49a',3],[.72,'#b5a27c',5],[.86,'#8f8170',8]];ly.forEach(([f,c,r])=>{ctx.fillStyle=c;ctx.fillRect(l,G+d*f,w,d*.18);ctx.fillStyle='rgba(0,0,0,.12)';for(let q=0;q<w/(r*2.2);q++){ctx.beginPath();ctx.arc(l+q*r*2.2+r,G+d*f+d*.09+(q%2)*3,r*.8,0,TAU);ctx.fill();}});hh=d*.55;}
    if(st===4){ctx.fillStyle='#2b2b2e';ctx.fillRect(l,G+d*.5,w,d*.5);ctx.fillStyle='#45464b';for(let q=0;q<26;q++){ctx.beginPath();ctx.arc(l+((q*29)%w),G+d*.55+((q*17)%(d*.42)),3+q%3,0,TAU);ctx.fill();}
      for(let q=0;q<4;q++){const x2=l+14+q*(w-28)/3,y2=G+d*.5+4;q%2?odorMol(ctx,x2,y2,3.5,0):pigmentMol(ctx,x2,y2,3.5);}hh=d*.5;}
    if(st===5){const ds=dying;// 消毒剂滴入池中 → 扩散 → 细菌被杀灭
      const cr=w*1.1*smooth(0,.45,ds);if(cr>1){const gx=l+w*.28,gg=ctx.createRadialGradient(gx,wy+6,2,gx,wy+6,cr);gg.addColorStop(0,`rgba(63,125,90,${.32*(1-smooth(.7,1,ds))})`);gg.addColorStop(1,'rgba(63,125,90,0)');ctx.fillStyle=gg;ctx.fillRect(l,wy,w,d+6);}
      impurities(ctx,l,wy,w,hh,ds<.45?[0,0,0,1,1]:lf,t,st*7+3,ds<.45?0:clamp(1-(ds-.45)/.45,0,1));}
    else impurities(ctx,l,wy,w,hh,st===2?[0,1,1,1,1]:lf,t,st*7+3,0);
    ctx.restore();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.beginPath();for(let xx=l;xx<=l+w;xx+=5)ctx.lineTo(xx,wy+Math.sin(xx*.08+t*2)*1.3);ctx.stroke();}
  let disT=0;
  function tick(dt){t+=dt;front=lerp(front,step,1-Math.exp(-dt*2.2));const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const fr=Math.round(front);
    if(fr>=5)disT=Math.min(1,disT+dt*.32);else disT=0;
    const G=Math.max(h*.56,372),d=Math.min(160,h-G-150),tw=Math.min(130,w*.118);Object.assign(Gp,{w,G,d,tw});
    ctx.fillStyle='rgba(176,150,110,.22)';ctx.fillRect(0,G+8,w,h-G-70);ctx.strokeStyle='rgba(120,95,60,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,G+8);ctx.lineTo(w,G+8);ctx.stroke();
    const py=G+d*.32;ctx.fillStyle=metal(ctx,0,py-9,0,py+9);ctx.fillRect(ST[0].x*w,py-9,(ST[6].x-ST[0].x)*w,18);
    const fx=lerp(ST[0].x,ST[6].x,front/6)*w,span=(ST[6].x-ST[0].x)*w;
    for(let k=0;k<40;k++){const xx=ST[0].x*w+((k*36+t*90)%span);if(xx>fx)continue;const seg=clamp(Math.floor((xx/w-ST[0].x)/((ST[6].x-ST[0].x)/6)),0,6);
      if(seg<2)grain(ctx,xx,py,4,k);else{ctx.fillStyle=seg<4?'rgba(222,178,90,.95)':'rgba(150,205,230,.95)';ctx.beginPath();ctx.arc(xx,py,3.5,0,TAU);ctx.fill();}}
    // 河流
    ctx.save();const rw=ST[0].x*w+tw*.5;ctx.beginPath();ctx.moveTo(0,G+8);for(let xx=0;xx<=rw;xx+=6)ctx.lineTo(xx,G+8+Math.sin(xx*.05+t*1.6)*3);ctx.lineTo(rw,h-70);ctx.lineTo(0,h-70);ctx.closePath();ctx.fillStyle=waterCol(.9,{a:1.1});ctx.fill();ctx.clip();
    impurities(ctx,0,G+14,rw,h-G-90,LEFT[0],t,5);ctx.restore();
    mdiDraw(ctx,'water-pump',ST[0].x*w,G-30,46,'#5a6270');
    for(let k=2;k<=5;k++)tank(ctx,ST[k].x*w,G,tw,d,k,t,front>k-.4,k===5?disT:0);
    const dose=(x,col,lab,on,toY)=>{ctx.fillStyle=metal(ctx,x-4,0,x+4,0);ctx.fillRect(x-3,G-100,6,toY-G+100);ctx.save();ctx.shadowColor='rgba(60,40,10,.2)';ctx.shadowBlur=8;ctx.shadowOffsetY=3;rr(ctx,x-28,G-152,56,60,9);ctx.fillStyle='#fff';ctx.fill();ctx.restore();rr(ctx,x-28,G-152,56,60,9);ctx.strokeStyle='#5a6270';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=col;rr(ctx,x-23,G-128,46,30,5);ctx.fill();txt(ctx,lab,x,G-113,{size:13,col:'#fff',weight:700});
      if(on){const ph=(t*1.5)%1;drop(ctx,x,lerp(toY+2,toY+18,ph),4,col);}};
    dose(ST[1].x*w,'#8c7ab8','明矾',front>.6,py-26);dose(ST[5].x*w-tw*.22,'#3f7d5a','消毒剂',front>4.6,G-30);
    // 用户：房子 + 一杯自来水（仍有钙镁离子）
    const ux=ST[6].x*w;mdiDraw(ctx,'home-city-outline',ux,G-40,64,'#1f4e79');
    if(front>5.5){beaker(ctx,ux,G+d-10,58,74,{lv:.7,col:waterCol(.03)});ionDot(ctx,ux-10,G+d-36,6);ionDot(ctx,ux+11,G+d-24,6);}
    ST.forEach((s2,i)=>{const x=s2.x*w,on=i<=fr,cur=i===step;const y=G+d+44;ctx.save();ctx.globalAlpha=on?1:.45;
      ctx.fillStyle=cur?CIN:'#fff';ctx.strokeStyle=cur?CIN:'#9aa3ad';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,13,0,TAU);ctx.fill();ctx.stroke();txt(ctx,String(i+1),x,y+1,{size:14,col:cur?'#fff':'#4a4f5c',weight:700,font:BODY});
      const nm=s2.n.split(' · ')[0].replace(' → 用户','');txt(ctx,nm,x,y+30,{size:15,weight:700,col:cur?CIN:'#23262f'});ctx.restore();});
    // 说明卡
    const s=ST[step],pw=Math.min(330,w*.36),cw=Math.min(560,w-pw-80),cx0=26,cy0=20;ctx.save();ctx.fillStyle='rgba(255,255,255,.95)';ctx.shadowColor='rgba(60,40,10,.18)';ctx.shadowBlur=14;ctx.shadowOffsetY=6;rr(ctx,cx0,cy0,cw,104,8);ctx.fill();ctx.restore();
    ctx.fillStyle=CIN;ctx.fillRect(cx0,cy0,6,104);hand(ctx,`${step+1}. ${s.n}`,cx0+22,cy0+34,{size:32,align:'left',col:'#23262f'});
    ctx.save();ctx.font=`500 16px ${BODY}`;const words=[...s.d];let line='',ly=cy0+70;for(const ch of words){if(ctx.measureText(line+ch).width>cw-40){txt(ctx,line,cx0+22,ly,{size:16,align:'left',col:'#4a4f5c'});line=ch;ly+=22;}else line+=ch;}txt(ctx,line,cx0+22,ly,{size:16,align:'left',col:'#4a4f5c'});ctx.restore();
    // 剩余杂质清单
    const px=w-pw-24,py0=18,rh=27;ctx.save();ctx.shadowColor='rgba(60,40,10,.16)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;rr(ctx,px,py0,pw,46+rh*5,8);ctx.fillStyle='rgba(255,255,255,.95)';ctx.fill();ctx.restore();
    hand(ctx,'水里还剩哪些杂质？',px+14,py0+22,{size:23,align:'left',col:NAVY});
    ROWS.forEach(([nm,at,by],r)=>{const y=py0+52+r*rh,gone=fr>=at&&(r!==3||fr>5||disT>.75),last=r===4;strike[r]=gone?Math.min(1,strike[r]+dt*2.5):0;
      if(last&&fr>=6){ctx.fillStyle='rgba(196,73,47,.1)';rr(ctx,px+6,y-12,pw-12,24,5);ctx.fill();}
      const ix=px+24;if(r<2)grain(ctx,ix,y,r?3:6,r+7);else if(r===2){pigmentMol(ctx,ix-5,y,4);odorMol(ctx,ix+7,y+2,3.5,t);}else if(r===3)bacterium(ctx,ix,y,16,0,t);else ionDot(ctx,ix,y,7.5);
      txt(ctx,nm,ix+20,y,{size:15,align:'left',col:gone?'#9a9ca3':'#23262f',weight:700});
      if(gone){ctx.save();ctx.strokeStyle=MOSS;ctx.lineWidth=2;ctx.font=`700 15px ${BODY}`;const tw2=ctx.measureText(nm).width;ctx.beginPath();ctx.moveTo(ix+18,y);ctx.lineTo(ix+18+tw2*strike[r],y);ctx.stroke();ctx.restore();txt(ctx,`✓ ${by}`,px+pw-14,y,{size:14,align:'right',col:MOSS,weight:700});}
      else if(last&&fr>=6){txt(ctx,'仍存在！',px+pw-14,y,{size:14,align:'right',col:CIN,weight:700});}
      else txt(ctx,'存在',px+pw-14,y,{size:13,align:'right',col:'#9a9ca3',weight:700});});
    const hx=s.x*w;ctx.save();ctx.strokeStyle=CIN;ctx.lineWidth=2;ctx.setLineDash([6,5]);rr(ctx,hx-tw*.5-22,G-162,tw+44,d+230,10);ctx.stroke();ctx.restore();
  }
  return{tick};})();

/* ================= 3 沉降：静置 vs 明矾 ================= */
S.alum=(()=>{const cv=$('#cvAlum');let t=0,vt=0,waiting=0,alum=false,stir=0,floc=0,zoom=false;let A,B;
  const R=rng(5);
  function mk(){const a=[];for(let i=0;i<170;i++){const big=R()<.3;a.push({x:R(),y:.05+R()*.92,r:big?2.4+R()*1.8:.9+R()*1.1,big,f:-1,vy:0,down:false});}return a;}
  let flocs=[];
  function reset(){A=mk();B=mk();alum=false;stir=0;floc=0;vt=0;waiting=0;flocs=[];$('#alAdd').disabled=false;$('#alWait').textContent='静置 3 分钟';}
  reset();
  $('#alReset').onclick=()=>{reset();sfx('click');};
  $('#alAdd').onclick=()=>{alum=true;$('#alAdd').disabled=true;sfx('drop');flocs=Array.from({length:16},()=>({x:.1+R()*.8,y:.15+R()*.7,n:0,r:3,vy:0}));};
  $('#alStir').onclick=()=>{stir=1.6;sfx('whoosh');};
  $('#alWait').onclick=()=>{if(waiting>0)return;waiting=6;vt=0;sfx('tick');};
  $('#alZoom').onclick=e=>{zoom=!zoom;e.currentTarget.setAttribute('aria-pressed',String(zoom));sfx('click');};
  /* 直接操作：把明矾瓶拖进乙杯；点烧杯搅拌；点计时器静置 */
  const Gm={};
  const ui=canvasUI(cv,{tools:()=>Gm.w?[{id:'alum',x:Gm.w-70,y:74,r:36,on:!alum,draw:(c,x,y,d)=>jarIcon(c,x,y,'明矾','#e9e4f2',{tilt:d?-.5:0})}]:[],
    hots:()=>Gm.w?[{hit:(x,y)=>Math.abs(x-Gm.bx)<Gm.bw/2&&y>Gm.by-Gm.bh&&y<Gm.by,act:()=>$('#alStir').click()},{hit:(x,y)=>Math.abs(x-Gm.ax)<Gm.bw/2&&y>Gm.by-Gm.bh&&y<Gm.by,act:()=>$('#alStir').click()},{hit:(x,y)=>Math.hypot(x-Gm.cx,y-Gm.cy)<34,act:()=>$('#alWait').click()}]:[],
    onDrop:(id,x,y)=>{if(Math.abs(x-Gm.bx)<Gm.bw/2+30&&y>Gm.by-Gm.bh-60&&y<Gm.by){$('#alAdd').click();return true;}return false;}});
  const q=single($('#alOpts'),$('#alSub'),$('#alSt'),1,{ok:'明矾生成的胶状物把细小颗粒聚成大絮团，沉得快。',bad:'正确答案是 B：加明矾的右杯更澄清。'});
  function sim(P,dt,vdt,isB){
    for(const p of P){if(p.down)continue;
      if(stir>0){const a=Math.atan2(p.y-.55,p.x-.5)+dt*2.2*(stir/1.6);const r=Math.hypot(p.x-.5,p.y-.55);p.x=.5+Math.cos(a)*r;p.y=.55+Math.sin(a)*r;}
      p.x+=(Math.random()-.5)*.0016;p.y+=(Math.random()-.5)*.0012;
      if(isB&&alum&&p.f<0&&Math.random()<dt*(stir>0?2.4:waiting>0?.9:.05)){const f=flocs[Math.floor(Math.random()*flocs.length)];p.f=flocs.indexOf(f);f.n++;f.r=3+Math.sqrt(f.n)*2.6;}
      if(p.f<0){const v=p.big?.0045:.00012;p.y+=v*vdt;}
      if(p.y>.985){p.y=.985;p.down=true;}p.x=clamp(p.x,.02,.98);p.y=Math.max(.04,p.y);}
    if(isB)for(const f of flocs){if(f.down)continue;if(stir>0){const a=Math.atan2(f.y-.55,f.x-.5)+dt*2.2*(stir/1.6);const r=Math.hypot(f.x-.5,f.y-.55);f.x=.5+Math.cos(a)*r;f.y=.55+Math.sin(a)*r;}
      f.y+=.00012*f.r*f.r*.18*vdt+(Math.random()-.5)*.001;if(f.y>.96){f.y=.96;f.down=true;}
      P.forEach(p=>{if(p.f>=0&&flocs[p.f]===f){p.x=f.x+Math.cos(p.r*97)*f.r*.004;p.y=f.y+Math.sin(p.r*61)*f.r*.004;if(f.down)p.down=true;}});}
  }
  function turb(P){let n=0;for(const p of P)if(!p.down&&p.f<0&&p.y<.85)n++;return n/P.length;}
  function cup(ctx,cx,by,bw,bh,P,isB,lab){const l=cx-bw/2,top=by-bh*.8,tb=turb(P);
    beaker(ctx,cx,by,bw,bh,{lv:.8,col:waterCol(Math.min(1,tb*1.25)),col2:waterCol(Math.min(1,tb*1.25+.1)),ticks:5});
    ctx.save();beakerPath(ctx,cx,by,bw,bh);ctx.clip();const H=by-top-6;
    // 沉积层
    const nd=P.filter(p=>p.down).length/P.length;ctx.fillStyle='#7a5c3c';ctx.beginPath();ctx.moveTo(l,by);for(let k=0;k<=10;k++)ctx.lineTo(l+bw*k/10,by-4-nd*26-2*Math.sin(k*1.8));ctx.lineTo(l+bw,by);ctx.fill();
    if(isB)flocs.forEach(f=>{if(f.n<2||f.down)return;const x=l+6+f.x*(bw-12),y=top+4+f.y*H;ctx.fillStyle='rgba(240,236,222,.55)';ctx.beginPath();ctx.arc(x,y,f.r*1.15,0,TAU);ctx.fill();});
    P.forEach(p=>{if(p.down)return;const x=l+6+p.x*(bw-12),y=top+4+p.y*H;ctx.fillStyle=p.f>=0?'#6b4f30':'#8a6a43';ctx.beginPath();ctx.arc(x,y,p.r,0,TAU);ctx.fill();});
    ctx.restore();hand(ctx,lab,cx,by+34,{size:26});
    return tb;}
  function tick(dt){t+=dt;let vdt=0;if(waiting>0){waiting-=dt;vdt=dt*30;vt=Math.min(180,vt+dt*30);if(waiting<=0){waiting=0;$('#alWait').textContent='再静置 3 分钟';sfx('ok');}}
    if(stir>0)stir=Math.max(0,stir-dt);
    sim(A,dt,vdt,false);sim(B,dt,vdt,true);
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const bw=Math.min(270,w*.25),bh=Math.min(400,h*.64),by=h-118;
    Object.assign(Gm,{w,ax:w*.2,bx:w*.53,by,bw,bh,cx:w*.365,cy:56});
    const ta=cup(ctx,w*.2,by,bw,bh,A,false,'甲：只静置'),tb=cup(ctx,w*.53,by,bw,bh,B,true,alum?'乙：加了明矾':'乙：待加明矾');
    if(stir>0){ctx.save();rod(ctx,w*.53+30,by-bh-50,w*.53+Math.sin(t*14)*30,by-30,7);ctx.restore();}
    // 计时
    ctx.save();const cx=w*.365,cy=56;ctx.beginPath();ctx.arc(cx,cy,30,0,TAU);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,30,-Math.PI/2,-Math.PI/2+TAU*vt/180);ctx.closePath();ctx.fillStyle='rgba(196,73,47,.25)';ctx.fill();
    txt(ctx,`${Math.floor(vt/60)}:${String(Math.floor(vt%60)).padStart(2,'0')}`,cx,cy+48,{size:18,weight:700,font:BODY});txt(ctx,waiting>0?'快进中…':'静置时间',cx,cy+72,{size:13,col:'#6f7480'});ctx.restore();
    // 浑浊度
    [[w*.2,ta],[w*.53,tb]].forEach(([x,v])=>{const y=by-bh-36;rr(ctx,x-70,y,140,12,6);ctx.fillStyle='#ece6da';ctx.fill();rr(ctx,x-70,y,140*clamp(v*1.25,0,1),12,6);ctx.fillStyle=waterCol(clamp(v*1.25,0,1),{a:1.4});ctx.fill();txt(ctx,'浑浊度',x-76,y+6,{size:13,align:'right',col:'#6f7480',weight:700});});
    if(zoom){const mr=Math.min(118,w*.12),mx=w-mr-26,my=by-bh*.55;ctx.save();ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.fillStyle='#f6fbfd';ctx.fill();ctx.clip();ctx.fillStyle=waterCol(.18);ctx.fillRect(mx-mr,my-mr,2*mr,2*mr);
      if(alum){for(let i=0;i<3;i++){const fx=mx+(i-1)*52,fy=my+Math.sin(t+i)*10+(i===1?-10:12);ctx.fillStyle='rgba(235,232,214,.85)';ctx.beginPath();for(let a=0;a<TAU;a+=.4){const rr3=26+5*Math.sin(a*3+t+i);ctx.lineTo(fx+Math.cos(a)*rr3,fy+Math.sin(a)*rr3);}ctx.fill();ctx.strokeStyle='rgba(180,170,140,.8)';ctx.stroke();
        for(let k=0;k<7;k++){ctx.fillStyle='#7a5b37';ctx.beginPath();ctx.arc(fx+Math.cos(k*.9)*16,fy+Math.sin(k*1.3)*14,3.4,0,TAU);ctx.fill();}}
        }
      else{for(let k=0;k<26;k++){ctx.fillStyle='#7a5b37';ctx.beginPath();ctx.arc(mx+Math.sin(k*7.1+t*1.3)*mr*.75,my+Math.cos(k*3.3+t*1.1)*mr*.7,3,0,TAU);ctx.fill();}}
      ctx.restore();ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.lineWidth=8;ctx.strokeStyle='#2c2f36';ctx.stroke();hand(ctx,alum?'胶状物吸附细小颗粒':'细小颗粒悬浮，难以沉降',mx,my+mr+30,{size:24,col:CIN});
      ctx.strokeStyle='#2c2f36';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(w*.53+bw*.3,by-bh*.5);ctx.lineTo(mx-mr,my);ctx.stroke();ctx.setLineDash([]);}
    ui.draw(ctx);if(!alum)trayHint(ctx,w-70,128,'拖进乙杯');else trayHint(ctx,w-70,128,'点烧杯可搅拌');
  }
  return{tick,leave(){waiting=0;}};})();

/* ================= 4 过滤：器材 ================= */
S.kit=(()=>{
  const G=`<defs><linearGradient id="kgM" x1="0" x2="1"><stop offset="0" stop-color="#7d838c"/><stop offset=".4" stop-color="#e8ebef"/><stop offset=".7" stop-color="#9aa0a9"/><stop offset="1" stop-color="#666c75"/></linearGradient>
    <linearGradient id="kgD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c5159"/><stop offset="1" stop-color="#1e2126"/></linearGradient>
    <linearGradient id="kgG" x1="0" x2="1"><stop offset="0" stop-color="rgba(190,215,232,.55)"/><stop offset=".25" stop-color="rgba(245,251,255,.25)"/><stop offset=".8" stop-color="rgba(220,236,246,.2)"/><stop offset="1" stop-color="rgba(170,200,222,.55)"/></linearGradient></defs>`;
  const GS='stroke="rgba(66,92,118,.8)" stroke-width="2.2" fill="url(#kgG)"';
  const TOOLS=[
    {n:'铁架台',sub:'（带铁圈）',use:'固定并支撑漏斗',svg:`<svg viewBox="0 0 200 320">${G}<ellipse cx="100" cy="306" rx="90" ry="8" fill="rgba(60,40,10,.12)"/><rect x="18" y="284" width="168" height="20" rx="4" fill="url(#kgD)"/><rect x="40" y="30" width="10" height="256" fill="url(#kgM)"/><circle cx="45" cy="30" r="5" fill="#9aa0a9"/>
      <rect x="34" y="118" width="22" height="20" rx="3" fill="url(#kgD)"/><path d="M56 128 H96" stroke="#3a3f47" stroke-width="5"/><ellipse cx="136" cy="128" rx="42" ry="9" fill="none" stroke="#3a3f47" stroke-width="5"/></svg>`},
    {n:'漏斗',sub:'',use:'放入滤纸进行过滤；下端尖嘴靠烧杯内壁',svg:`<svg viewBox="0 0 200 320"><ellipse cx="100" cy="60" rx="74" ry="15" ${GS}/><path d="M26 60 L93 168 V292 L107 302 V168 L174 60" ${GS}/><path d="M44 72 L90 150" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/><path d="M97 180 V284" stroke="#fff" stroke-width="2" opacity=".8"/></svg>`},
    {n:'滤纸',sub:'（圆形）',use:'截留不溶性固体；折成圆锥形放入漏斗',svg:`<svg viewBox="0 0 200 320"><circle cx="100" cy="190" r="82" fill="#fdfdf8" stroke="#bcb4a0" stroke-width="2"/><path d="M18 190 H182 M100 108 V272" stroke="#d9d2bf" stroke-width="1.5" stroke-dasharray="5 4"/><circle cx="100" cy="190" r="82" fill="none" stroke="rgba(0,0,0,.04)" stroke-width="10"/></svg>`},
    {n:'烧杯',sub:'',cnt:'× 2',use:'一个盛泥沙水，一个承接滤液',svg:`<svg viewBox="0 0 200 320"><path d="M38 116 Q46 120 46 128 V286 Q46 298 58 298 H150 Q162 298 162 286 V124 Q162 118 168 116" ${GS}/><path d="M46 200 H162 V286 Q162 298 150 298 H58 Q46 298 46 286Z" fill="rgba(156,123,78,.55)"/>
      <path d="M56 152 H70 M56 176 H64 M56 200 H70 M56 224 H64 M56 248 H70" stroke="rgba(66,92,118,.6)" stroke-width="1.5"/><path d="M146 134 V282" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>`},
    {n:'玻璃棒',sub:'',use:'引流：使液体沿玻璃棒缓缓流入漏斗',svg:`<svg viewBox="0 0 200 320"><path d="M70 40 L132 300" stroke="rgba(80,106,130,.85)" stroke-width="10" stroke-linecap="round"/><path d="M70 40 L132 300" stroke="#eef6fb" stroke-width="6" stroke-linecap="round"/><path d="M69 44 L130 296" stroke="#fff" stroke-width="1.6"/></svg>`}];
  const kit=$('#kit');kit.innerHTML=TOOLS.map((o,i)=>`<button class="tool" data-i="${i}">${o.cnt?`<span class="cnt">${o.cnt}</span>`:''}${o.svg}<span class="nm">${o.n}<small class="hint">${o.sub}</small></span><span class="use">${o.use}</span></button>`).join('');
  $$('.tool',kit).forEach(b=>b.onclick=()=>{b.classList.toggle('on');sfx('pop');});
  $('#kitReset').onclick=()=>{$$('.tool',kit).forEach(b=>b.classList.remove('on'));$('#kitRedo').click();sfx('click');};
  $('#kitAll').onclick=()=>{$$('.tool',kit).forEach(b=>b.classList.add('on'));sfx('whoosh');};
  const MIX=[['浑浊河水中的泥沙','',1],['白糖水中的白糖','',0],['二氧化锰和水','回收二氧化锰',1],['酒精和水','',0],['豆浆中的豆渣','',1],['海水中的食盐','',0]];
  let sel=new Set(),done=false;const box=$('#kitMix'),st=$('#kitSt');
  function render(){box.innerHTML=MIX.map((m,i)=>`<button class="mixc" data-i="${i}" aria-pressed="${sel.has(i)}">${m[0]}${m[1]?`<small>${m[1]}</small>`:''}</button>`).join('');
    $$('.mixc',box).forEach(b=>b.onclick=()=>{if(done)return;const i=+b.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);sfx('click');render();});}
  render();
  $('#kitSub').onclick=()=>{if(done)return;if(!sel.size){setSt(st,'warn','请至少选一项');return;}done=true;const tm=TEAM.cur;let miss=0,extra=0;
    $$('.mixc',box).forEach(b=>{const i=+b.dataset.i,a=MIX[i][2]===1,s=sel.has(i);if(a&&s)b.classList.add('right');else if(a&&!s){b.classList.add('miss');miss++;}else if(!a&&s){b.classList.add('wrong');extra++;}});
    if(!miss&&!extra){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +5</b>　过滤分离的是<b>不溶性固体</b>和液体。`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}不加分</b>　${miss?`漏选 ${miss} 项（黄框）`:''}${miss&&extra?'，':''}${extra?`多选 ${extra} 项（红框）`:''}。白糖、酒精、食盐都溶于水，过滤分不开。`);}teamNext();};
  $('#kitRedo').onclick=()=>{sel.clear();done=false;render();setSt(st,'','全对 +5 分');};
  return{};})();
