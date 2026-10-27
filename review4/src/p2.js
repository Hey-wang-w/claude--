/* ================= 5 电解水：水电解器虚拟实验（正极 O₂、负极 H₂，体积比 1∶2） ================= */
S.elec=(()=>{const cv=$('#cvElec');let t=0,on=false,vol=0,tool=0,fx=null,naT=-1,naStep=0;const G={};const LOG=[null,null];
  // vol：正极气体体积（mL，最多 10）；负极是它的 2 倍
  $('#elPow').onclick=()=>{on=!on;$('#elPow').textContent=on?'断开电源':'接通电源';sfx8(on?'charge':'blip');};
  const setTool=k=>{tool=tool===k?0:k;$('#elT1').setAttribute('aria-pressed',String(tool===1));$('#elT2').setAttribute('aria-pressed',String(tool===2));sfx8('select');};
  $('#elT1').onclick=()=>setTool(1);$('#elT2').onclick=()=>setTool(2);
  $('#elNaCl').onclick=()=>{if(naT<0){naT=0;naStep=0;}else if(naStep<3){naStep++;}else{naT=-1;}sfx8('blip');};
  function test(side){// side 0 = 正极（O₂），1 = 负极（H₂）
    const gas=side?vol*2:vol;if(gas<2){fx={side,k:'none',t:0};sfx('bad');return;}if(!tool){fx={side,k:'notool',t:0};sfx('bad');return;}
    const k=side===0?(tool===1?'relight':'brighter'):(tool===2?'burn':'out');fx={side,k,t:0};
    sfx8(k==='burn'?'fire':k==='relight'||k==='brighter'?'charge':'blip');
    LOG[side]={relight:'带火星的木条复燃 → 氧气',brighter:'燃着的木条燃烧更旺 → 氧气',burn:'气体燃烧，产生淡蓝色火焰 → 氢气',out:'带火星的木条没有复燃'}[k];}
  // 可拖动的木条（拖到玻璃管顶端的活塞处检验）；也可以先选按钮再点管口
  const TOOLS=()=>G.tray?[{id:1,x:G.tray[0][0],y:G.tray[0][1],r:46,draw:(c,x,y,dr)=>splint(c,x,y,1,dr)},{id:2,x:G.tray[1][0],y:G.tray[1][1],r:46,draw:(c,x,y,dr)=>splint(c,x,y,2,dr)}]:[];
  function splint(c,x,y,k,dr){c.save();c.translate(x,y);c.rotate(dr?-.5:-.15);c.fillStyle='#d9a066';c.strokeStyle='#7a4a24';c.lineWidth=1.5;rr(c,-46,-5,80,10,4);c.fill();c.stroke();
    if(k===1){const g=c.createRadialGradient(36,0,1,36,0,10);g.addColorStop(0,'#fff3c4');g.addColorStop(.4,'#ff7a1a');g.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g;c.beginPath();c.arc(36,0,10,0,TAU);c.fill();}
    else flame(c,40,2,.28,t);c.restore();if(!dr)txt(c,k===1?'带火星的木条':'燃着的木条',x-6,y+38,{size:14,weight:700,col:DIM});}
  const ui=canvasUI(cv,{tools:TOOLS,onTap:id=>setTool(id),onDrop:(id,x,y)=>{if(!G.tubes)return false;const s=G.tubes.findIndex(tb=>Math.abs(x-tb.x)<70&&y>tb.top-120&&y<tb.top+80);if(s<0)return false;tool=id;test(s);return true;},
    hots:()=>G.tubes?[0,1].map(s=>({hit:(x,y)=>Math.abs(x-G.tubes[s].x)<G.tubes[s].w&&y>G.tubes[s].top-50&&y<G.tubes[s].top+60,act:()=>test(s)})).concat([{hit:(x,y)=>G.pow&&Math.abs(x-G.pow.x)<G.pow.w/2&&Math.abs(y-G.pow.y)<G.pow.h/2,act:()=>$('#elPow').click()}]):[]});
  const bubs=[];
  function tick(dt){t+=dt;if(on&&vol<10)vol=Math.min(10,vol+dt*1.2);if(fx)fx.t+=dt;if(naT>=0)naT+=dt;
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const cx=w*.29,gap=Math.min(120,w*.11),tw=40,top=150,base=h-205,tubeH=base-top,scale=tubeH*.82/20;// 20 mL 对应的高度
    const tubes=[{x:cx-gap,lab:'正极',sign:'+',col:'#e5484d'},{x:cx+gap,lab:'负极',sign:'−',col:'#1f9fd6'}];
    // 中间储水管 + 球形漏斗（液面随气体增加而上升）
    const bulbY=top-34,midLv=base-tubeH*.55-vol*scale*1.1;
    ctx.save();ctx.beginPath();ctx.arc(cx,bulbY,34,0,TAU);ctx.fillStyle=GL_F;ctx.fill();ctx.save();ctx.clip();ctx.fillStyle=waterCol(0);ctx.fillRect(cx-40,Math.max(bulbY-34,midLv),80,80);ctx.restore();ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.stroke();
    rr(ctx,cx-10,bulbY+30,20,base-bulbY-30,4);ctx.fillStyle=GL_F;ctx.fill();ctx.fillStyle=waterCol(0);ctx.fillRect(cx-9,Math.max(bulbY+30,midLv),18,base-Math.max(bulbY+30,midLv));ctx.strokeStyle=GL_S;rr(ctx,cx-10,bulbY+30,20,base-bulbY-30,4);ctx.stroke();ctx.restore();
    // 底部连通管
    ctx.save();rr(ctx,cx-gap-tw/2,base-4,gap*2+tw,30,10);ctx.fillStyle=waterCol(0);ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.stroke();ctx.restore();
    tubes.forEach((tb,s)=>{const gas=s?vol*2:vol,gasH=gas*scale,x=tb.x-tw/2;
      ctx.save();rr(ctx,x,top,tw,tubeH,8);ctx.fillStyle='rgba(240,248,255,.6)';ctx.fill();ctx.save();rr(ctx,x,top,tw,tubeH,8);ctx.clip();ctx.fillStyle=waterCol(0);ctx.fillRect(x,top+gasH,tw,tubeH);
        ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,top+gasH);ctx.lineTo(x+tw,top+gasH);ctx.stroke();ctx.restore();
      ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;rr(ctx,x,top,tw,tubeH,8);ctx.stroke();glassHi(ctx,x+8,top+14,x+8,base-14,3,.8);
      // 刻度（从上往下读气体体积）
      ctx.strokeStyle=INK;ctx.lineWidth=1.4;for(let k=0;k<=20;k++){const yy=top+k*scale,sd=s?1:-1,x0=s?x+tw:x,len=k%5===0?12:6;ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(x0+sd*len,yy);ctx.stroke();if(k%5===0)txt(ctx,String(k),x0+sd*26,yy,{size:13,col:DIM,weight:700});}
      // 活塞
      ctx.fillStyle=metal(ctx,tb.x-6,0,tb.x+6,0);rr(ctx,tb.x-6,top-26,12,26,3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#ff7a5c';rr(ctx,tb.x-18,top-20,36,9,4);ctx.fill();ctx.stroke();
      // 电极
      ctx.fillStyle='#3a3f47';ctx.fillRect(tb.x-3,base-26,6,40);
      if(on&&Math.random()<dt*(s?16:8))bubs.push({x:tb.x+(Math.random()-.5)*10,y:base-26,s,r:2+Math.random()*2.5});
      // 导线 → 电源
      ctx.strokeStyle=tb.col;ctx.lineWidth=4;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(tb.x,base+14);ctx.lineTo(tb.x,base+64);ctx.lineTo(cx+(s?30:-30),base+64);ctx.stroke();
      tb.top=top;tb.gasH=gasH;});
    for(let i=bubs.length-1;i>=0;i--){const b=bubs[i],tb=tubes[b.s];b.y-=(60+b.r*10)*dt;b.x+=Math.sin(b.y*.1)*.3;if(b.y<tb.top+tb.gasH+b.r){bubs.splice(i,1);continue;}
      ctx.save();ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.stroke();ctx.restore();}
    // 电源
    const pw={x:cx,y:base+64,w:120,h:56};sticker(ctx,pw.x-60,pw.y-14,120,48,{r:10,fill:on?'#d6f5ef':'#ffffff',sh:4});
    ctx.fillStyle='#e5484d';ctx.beginPath();ctx.arc(pw.x-30,pw.y,7,0,TAU);ctx.fill();ctx.fillStyle='#1f2a44';ctx.beginPath();ctx.arc(pw.x+30,pw.y,7,0,TAU);ctx.fill();
    ctx.fillStyle=on?'#1fb39f':'#c9d3e3';ctx.beginPath();ctx.arc(pw.x,pw.y+14,6,0,TAU);ctx.fill();txt(ctx,'电源',pw.x,pw.y-1,{size:14,weight:700});
    tubes.forEach((tb,s)=>txt(ctx,`${tb.lab}（${tb.sign}）`,tb.x+(s?60:-60),base+44,{size:18,weight:700,col:tb.col}));
    tubes.forEach((tb,s)=>pill(ctx,`${(s?vol*2:vol).toFixed(1)} mL`,tb.x+(s?92:-92),top+40,{size:15,fill:'#ffffff'}));
    // 检验效果
    if(fx&&fx.t<2){const tb=tubes[fx.side],my=tb.top-32,q=fx.t;
      if(fx.k!=='none'&&fx.k!=='notool'){ctx.save();ctx.translate(tb.x+(fx.side?60:-60),my-8);ctx.rotate(fx.side?.25:Math.PI-.25);ctx.fillStyle='#d9a066';ctx.strokeStyle='#7a4a24';ctx.lineWidth=1.5;rr(ctx,-20,-5,80,10,4);ctx.fill();ctx.stroke();ctx.restore();
        const fxp=tb.x+(fx.side?3:-3),fyp=my-2;
        if(fx.k==='relight'||fx.k==='brighter')flame(ctx,fxp,fyp,.3+Math.min(.25,q*.5),t);
        else if(fx.k==='burn'){ctx.save();ctx.globalAlpha=Math.max(0,1-q*.6);const g=ctx.createRadialGradient(tb.x,my-8,2,tb.x,my-8,30);g.addColorStop(0,'rgba(160,200,255,.95)');g.addColorStop(1,'rgba(120,170,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(tb.x,my-8,30,0,TAU);ctx.fill();ctx.restore();}
        else{ctx.fillStyle='#7a7f88';ctx.beginPath();ctx.arc(fxp,fyp,4,0,TAU);ctx.fill();}}
      const msg={none:'气体太少，先通电一会儿',notool:'先选一种木条（拖到管口）',relight:'木条复燃！',brighter:'燃烧更旺！',burn:'气体燃烧，淡蓝色火焰',out:'木条没有复燃'}[fx.k];
      pill(ctx,msg,tb.x,top-78,{size:16,fill:'#fff6d6'});}
    // 右侧：实验记录 + 木条托盘
    const rx=w*.6,ry=24,rw=w*.37,rh=h*.5;sticker(ctx,rx,ry,rw,rh,{r:16,sh:5});
    hand(ctx,'实验记录',rx+rw/2,ry+32,{size:24});
    [['正极',vol,LOG[0],'#e5484d'],['负极',vol*2,LOG[1],'#1f9fd6']].forEach(([n,v,lg,c],k)=>{const y=ry+80+k*rh*.33;txt(ctx,`${n}：${v.toFixed(1)} mL`,rx+22,y,{size:20,col:c,align:'left',weight:700});
      wrapTxt(ctx,lg||'把木条拖到玻璃管顶端检验气体',rx+22,y+32,rw-44,26,{size:16,col:lg?'#1f9d6b':'#8a95ad'});});
    if(vol>=9.9&&LOG[0]&&LOG[1])txt(ctx,'V(正) ∶ V(负) ≈ 1 ∶ 2',rx+rw/2,ry+rh-30,{size:22,col:'#ff7a5c',weight:900});
    const ty0=ry+rh+70;G.tray=[[rx+rw*.3,ty0],[rx+rw*.75,ty0]];ctx.save();ctx.setLineDash([7,6]);ctx.strokeStyle=FAINT;ctx.lineWidth=2;rr(ctx,rx,ty0-44,rw,92,14);ctx.stroke();ctx.restore();
    ui.draw(ctx);[1,2].forEach(k=>{if(tool===k){const[x,y]=G.tray[k-1];ctx.save();ctx.strokeStyle='#ffd23f';ctx.lineWidth=4;rr(ctx,x-74,y-34,140,86,12);ctx.stroke();ctx.restore();}});
    G.tubes=tubes.map(tb=>({x:tb.x,w:tw,top:tb.top}));G.pow={x:pw.x,y:pw.y+10,w:120,h:48};
    // 提升：加了氯化钠
    if(naT>=0){const bx=w*.05,by=h*.05,bw=w*.9,bh=h*.76;sticker(ctx,bx,by,bw,bh,{r:18,fill:'#fffdf3',sh:6});
      hand(ctx,'提升：小红在水里加了氯化钠再通电……',w/2,by+44,{size:28,col:'#ff7a5c'});
      wrapTxt(ctx,'正极附近产生了黄绿色、有刺激性气味的气体——氯气（有毒）。',bx+40,by+96,bw-80,30,{size:20,col:'#6b8a00'});
      const QA=[['① 还能用这个实验说明水的组成吗？','不能。氯化钠参与了反应，生成了氯气，影响实验结果。'],['② 想增强水的导电性，应该加什么？','加少量硫酸钠或氢氧化钠，不能加氯化钠。'],['③ 实验中有氯气生成，要注意什么？','氯气有毒：注意通风，不要直接闻，做好尾气处理。']];
      QA.forEach(([q,a],k)=>{const y=by+164+k*92;txt(ctx,q,bx+40,y,{size:21,align:'left',weight:700});txt(ctx,k<naStep?a:'（点“提升”按钮揭晓）',bx+66,y+36,{size:19,col:k<naStep?'#1f9d6b':'#8a95ad',align:'left',weight:700});});}
    else if(!on&&vol===0)pill(ctx,'点“接通电源”（或点电源）开始电解',cx,top-100,{size:16,fill:'#fff6d6'});}
  const qp=qPanel($('#elQ'),QB.elec,{src:'电解水'});
  $('#elReset').onclick=()=>{on=false;vol=0;tool=0;fx=null;naT=-1;LOG[0]=LOG[1]=null;bubs.length=0;$('#elPow').textContent='接通电源';setTool(-1);tool=0;$('#elT1').setAttribute('aria-pressed','false');$('#elT2').setAttribute('aria-pressed','false');qp.reset();};
  notes('elec','电解水',['正极产生<mark>氧气</mark>（使带火星的木条复燃），负极产生<mark>氢气</mark>（燃烧，淡蓝色火焰）。','体积比 V(正) ∶ V(负) ≈ <mark>1 ∶ 2</mark>（正氧负氢，氢二氧一）。',`符号表达式：${EQ(F('H2O'),'通电',`${F('H2')} + ${F('O2')}`)}`,'结论：水由<mark>氢元素和氧元素</mark>组成。'],
    '加少量硫酸钠或氢氧化钠增强导电性；不能加氯化钠（会生成有毒的氯气）。',
    (ctx,w,h)=>{const cx=w/2,base=h-70;[[-60,'+','O₂',PEN.red,60],[60,'−','H₂',PEN.blue,120]].forEach(([dx,sg,gn,c,gh])=>{const x=cx+dx;ctx.strokeStyle=PEN.ink;ctx.lineWidth=2.5;ctx.strokeRect(x-16,base-200,32,200);
      ctx.fillStyle='rgba(29,78,216,.15)';ctx.fillRect(x-14,base-200+gh,28,200-gh);txt(ctx,gn,x,base-200+gh/2,{size:18,weight:700,col:c});txt(ctx,sg,x,base+22,{size:24,weight:700,col:c});});
      hand(ctx,'氢二氧一',cx,base+50,{size:26,col:PEN.green});});
  return{tick};})();
/* 画布里自动换行的文字 */
function wrapTxt(ctx,s,x,y,maxW,lh,{size=16,col=INK,font=FNUM,weight=700}={}){ctx.save();ctx.font=`${weight} ${size}px ${font}`;ctx.fillStyle=col;ctx.textAlign='left';ctx.textBaseline='middle';
  let line='',yy=y;for(const ch of s){if(ctx.measureText(line+ch).width>maxW){ctx.fillText(line,x,yy);line=ch;yy+=lh;}else line+=ch;}ctx.fillText(line,x,yy);ctx.restore();return yy;}

/* ================= 6 氢气档案：属性卡 + 验纯演示 ================= */
S.h2=(()=>{const cv=$('#cvH2');let t=0,demo=null;const G={},sp=[];
  // 两支收集好氢气的试管（管口向下），拖到酒精灯火焰上验纯；按钮会自动演示
  const home=k=>G.home?G.home[k]:[0,0];
  const TUBES=()=>G.home&&!demo?[0,1].map(k=>({id:k,x:home(k)[0],y:home(k)[1],r:60,draw:(c,x,y)=>tubeAt(c,x,y,k)})):[];
  function tubeAt(c,x,y,k){testTube(c,x,y+70,150,34,Math.PI,{gas:'rgba(235,245,255,.75)'});// 管口朝下：(x,y+70) 是管口
    c.save();c.fillStyle='#ffd9bb';c.strokeStyle=INK;c.lineWidth=1.6;rr(c,x-14,y+66,28,14,7);c.fill();c.stroke();c.restore();// 拇指堵住管口
    pill(c,k?'B：较纯':'A：不纯',x,y-102,{size:14,fill:k?'#e6f7ef':'#fdeaea'});}
  function start(pure){if(demo)return;demo={pure,t:0,snd:false,from:home(pure?1:0)};sfx8('blip');}
  $('#hyImp').onclick=()=>start(false);$('#hyPure').onclick=()=>start(true);
  const ui=canvasUI(cv,{tools:TUBES,onDrop:(id,x,y)=>{if(!G.flame)return false;const[fx,fy]=G.flame;if(Math.abs(x-fx)<90&&y>fy-260&&y<fy+40){demo={pure:id===1,t:.6,snd:false,from:[x,y]};return true;}return false;}});
  function tick(dt){t+=dt;if(demo)demo.t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    // 左：氢气档案卡
    const cx0=26,cw=w*.4,ch=h-120;sticker(ctx,cx0,24,cw,ch,{r:18,sh:6});hand(ctx,'氢气 H₂ 档案',cx0+cw/2,62,{size:26});
    const mx=cx0+cw/2,my=136+Math.sin(t*2.4)*4;ball(ctx,mx-17,my,28,'#cfe8f7',{lw:2.2});ball(ctx,mx+17,my,28,'#cfe8f7',{lw:2.2});
    ctx.fillStyle=INK;[[-20,-2],[20,-2]].forEach(([dx,dy])=>{ctx.beginPath();ctx.ellipse(mx+dx,my+dy,3.4,5,0,0,TAU);ctx.fill();});ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(mx,my+8,8,.15*Math.PI,.85*Math.PI);ctx.stroke();
    ctx.fillStyle='rgba(255,111,168,.45)';ctx.beginPath();ctx.ellipse(mx-34,my+10,7,4,0,0,TAU);ctx.ellipse(mx+34,my+10,7,4,0,0,TAU);ctx.fill();
    const props=[['密度','最小的气体'],['溶解性','难溶于水'],['颜色、气味','无色、无味'],['可燃性','燃烧产生淡蓝色火焰，生成水'],['收集方法','排水法；向下排空气法']];
    props.forEach(([k,v],i)=>{const y=212+i*(ch-210)/5;ctx.strokeStyle='#e3e9f2';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx0+24,y-16);ctx.lineTo(cx0+cw-24,y-16);ctx.stroke();
      txt(ctx,k,cx0+28,y+4,{size:15,col:DIM,weight:700,align:'left'});txt(ctx,v,cx0+28,y+30,{size:18,weight:700,align:'left'});});
    // 右：验纯演示区
    const ax=w*.46,aw=w-ax-20,lx=ax+aw*.36,ly=h-128;G.flame=[lx,ly-106*.95];G.home=[[ax+aw*.72,ly-300],[ax+aw*.9,ly-300]];
    hand(ctx,'点燃前一定要验纯',ax+aw/2,46,{size:26,col:'#ff6fa8'});
    let msg='把试管拖到火焰上方（管口向下）',mc=DIM;if(demo&&demo.t>1)msg=demo.pure?'“噗”的一声，声音很小 → 氢气较纯':'发出尖锐爆鸣声 → 氢气不纯，不能点燃！',mc=demo&&demo.t>1?(demo.pure?OKC:BADC):DIM;
    txt(ctx,msg,ax+aw/2,88,{size:18,weight:700,col:mc});
    lamp(ctx,lx,ly,.95,true,t);txt(ctx,'酒精灯',lx+92,ly-24,{size:15,col:DIM,weight:700});
    if(demo){const q=ease(Math.min(1,demo.t/.6)),tx=lerp(demo.from[0],lx,q),ty=lerp(demo.from[1],ly-250,q);
      if(demo.t>1&&!demo.snd){demo.snd=true;if(demo.pure){sfx('pop');for(let k=0;k<10;k++)sp.push({x:lx,y:ly-170,vx:(Math.random()-.5)*80,vy:-40-Math.random()*60,life:1,c:'#9fd8ff',r:4});}
        else{sfx8('hit');sfx('boom');shake();for(let k=0;k<40;k++){const a=Math.random()*TAU,v=80+Math.random()*220;sp.push({x:lx,y:ly-170,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,c:['#ffd23f','#ff9a1f','#ff7a5c','#ffffff'][k%4],r:3+Math.random()*4});}}}
      if(!demo.pure&&demo.t>1&&demo.t<1.5){const k=(demo.t-1)/.5;ctx.save();ctx.globalAlpha=1-k;const g=ctx.createRadialGradient(lx,ly-170,4,lx,ly-170,40+160*k);g.addColorStop(0,'rgba(255,240,180,.95)');g.addColorStop(.5,'rgba(255,160,60,.6)');g.addColorStop(1,'rgba(255,120,60,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,ly-170,40+160*k,0,TAU);ctx.fill();ctx.restore();}
      if(demo.pure&&demo.t>1&&demo.t<1.6){ctx.save();ctx.globalAlpha=1-(demo.t-1)/.6;const g=ctx.createRadialGradient(lx,ly-176,2,lx,ly-176,26);g.addColorStop(0,'rgba(170,205,255,.95)');g.addColorStop(1,'rgba(120,170,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,ly-176,26,0,TAU);ctx.fill();ctx.restore();}
      tubeAt(ctx,tx,ty,demo.pure?1:0);
      if(demo.t>1&&demo.t<2.2)pill(ctx,demo.pure?'噗':'砰！',lx+120,ly-250,{size:demo.pure?22:34,fill:demo.pure?'#dff1fb':'#ffe0d6',col:demo.pure?'#1f9fd6':'#e5484d'});
      if(demo.t>4)demo=null;}
    for(let i=sp.length-1;i>=0;i--){const p=sp[i];p.life-=dt*1.3;if(p.life<=0){sp.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;ctx.save();ctx.globalAlpha=p.life;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life+1,0,TAU);ctx.fill();ctx.restore();}
    ui.draw(ctx);}
  const qp=qPanel($('#hyQ'),QB.h2,{src:'氢气'});
  $('#hyReset').onclick=()=>{demo=null;sp.length=0;qp.reset();};
  return{tick};})();

/* ================= 7 微观分类站：微观图放进 单质 / 化合物 / 混合物 ================= */
S.cls=(()=>{const LEG='<i class="atm a"></i> 和 <i class="atm b"></i> 表示两种不同的原子。把微观图拖进分类框（或先点图、再点框）。';const CARDS=[[[['A2',6]],0],[[['AB',6]],1],[[['A2',3],['B2',3]],2],[[['B',8]],0],[[['AB2',5]],1],[[['A2',3],['AB',3]],2]];
  const BINS=['单质','化合物','混合物'];let put=CARDS.map(()=>-1),pick=-1,done=false;const st=$('#csSt'),bins=$('#csBins'),tray=$('#csTray');
  function render(){bins.innerHTML=BINS.map((b,k)=>`<div class="bin" data-b="${k}"><h4>${b}</h4><div class="bslots">${CARDS.map((c,i)=>put[i]===k?`<button class="mc in${done?(c[1]===k?' ok':' no'):''}" data-i="${i}"><canvas></canvas>${done&&c[1]!==k?`<em class="fixl">应为${BINS[c[1]]}</em>`:''}</button>`:'').join('')}</div></div>`).join('');
    tray.innerHTML=CARDS.map((c,i)=>put[i]<0?`<button class="mc${pick===i?' sel':''}" data-i="${i}"><canvas></canvas></button>`:'').join('')||'<span class="hint">都分好了，点“提交”</span>';
    $$('.mc',$('[data-id="cls"]')).forEach(b=>{const i=+b.dataset.i,c=b.querySelector('canvas');requestAnimationFrame(()=>{const{ctx,w,h}=fitS(c);drawMicro(ctx,4,4,w-8,h-8,CARDS[i][0],i+3,{frame:false});});
      b.onclick=e=>{e.stopPropagation();if(done)return;if(put[i]>=0){put[i]=-1;sfx8('blip');}else{pick=pick===i?-1:i;sfx8('select');}render();};
      DRAG.make(b,{drop:tg=>{if(done||!tg.classList.contains('bin'))return false;put[i]=+tg.dataset.b;pick=-1;sfx8('coin');render();return true;}});});
    $$('.bin',bins).forEach(b=>b.dataset.drop='1');$$('.bin',bins).forEach(b=>b.onclick=()=>{if(done||pick<0)return;put[pick]=+b.dataset.b;pick=-1;sfx8('coin');render();});}
  $('#csSub').onclick=()=>{if(done)return;if(put.some(x=>x<0)){setSt(st,'warn','还有微观图没有分类');return;}done=true;const tm=TEAM.cur,n=put.filter((b,i)=>b===CARDS[i][1]).length;render();
    if(n===CARDS.length){teamAdd(5,tm);sfx8('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部分对 +5</b>　看分子种类：一种分子是纯净物；再看分子里的原子：同种 → 单质，不同种 → 化合物。`);}
    else{sfx8('jam');setSt(st,'bad',`<b>${tname(tm)}分对 ${n} / ${CARDS.length}，不加分</b>　红框的放错了：先数有几种分子，再看分子由几种原子构成。`);VARS.arm(st,{v:QB.clsTask},'微观分类站');}teamNext();};
  const qp=qPanel($('#csQ'),QB.cls,{src:'物质分类'});
  $('#csReset').onclick=()=>{VARS.disarm(st);put=CARDS.map(()=>-1);pick=-1;done=false;render();setSt(st,'',LEG);qp.reset();};
  render();setSt(st,'',LEG);
  notes('cls','物质的分类',['混合物：由<mark>两种或两种以上</mark>物质混合而成；纯净物：只由<mark>一种</mark>物质组成。','单质：由同种元素组成的<mark>纯净物</mark>；化合物：由不同种元素组成的<mark>纯净物</mark>。','氧化物：由两种元素组成、其中一种是氧元素的<mark>化合物</mark>。','看微观图：先数<mark>分子种类</mark>，再看分子里<mark>原子种类</mark>。'],
    '含氧元素的化合物不一定是氧化物（如 KMnO₄）；由同种元素组成的物质不一定是单质（如 O₂ 和 O₃ 混合）。',
    (ctx,w,h)=>{const top=26;const box=(x,label,spec,seed)=>{drawMicro(ctx,x,top,110,90,spec,seed);txt(ctx,label,x+55,top+112,{size:16,weight:700,col:PEN.ink});};
      box(14,'单质',[['A2',5]],2);box(w/2-55,'化合物',[['AB',5]],4);box(w-124,'混合物',[['A2',3],['B2',3]],6);
      ctx.strokeStyle=PEN.ink;ctx.lineWidth=2;const y=top+150;ctx.strokeRect(30,y,w-60,150);txt(ctx,'物质',w/2,y+22,{size:18,weight:700,col:PEN.ink});
      ctx.strokeRect(40,y+40,(w-90)*.62,100);txt(ctx,'纯净物',40+(w-90)*.31,y+58,{size:16,weight:700,col:PEN.blue});ctx.strokeRect(50+(w-90)*.62,y+40,(w-90)*.38,100);txt(ctx,'混合物',50+(w-90)*.81,y+90,{size:16,weight:700,col:PEN.red});
      ctx.strokeRect(50,y+72,(w-90)*.28,58);txt(ctx,'单质',50+(w-90)*.14,y+100,{size:15,weight:700,col:PEN.green});ctx.strokeRect(58+(w-90)*.28,y+72,(w-90)*.32,58);txt(ctx,'化合物',58+(w-90)*.44,y+86,{size:15,weight:700,col:PEN.green});
      ctx.setLineDash([4,3]);ctx.strokeRect(66+(w-90)*.28,y+96,(w-90)*.26,28);ctx.setLineDash([]);txt(ctx,'氧化物',66+(w-90)*.41,y+110,{size:13,weight:700,col:PEN.gold});});
  return{};})();
