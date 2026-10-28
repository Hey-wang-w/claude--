/* ================= 10 气密性：手握试管 → 导管口冒气泡；松手 → 导管内形成水柱；漏气装置两者都没有 ================= */
S.air=(()=>{const cv=$('#cvAir');let t=0,G=null,hold=false,leak=false,T=0,Tpk=0,esc=0,bubs=[],seen={bub:0,col:0,leakHold:0};
  const UA=20/.9,TX=330,TM=200,TL=320,TD=40,GY=TM+225,BX=830,BY=540,BW=200,BH=108*BW/92,WL=BY-BH*.72,END=[BX-10,BY-50];
  const R=rng(11),gas=Array.from({length:22},()=>({x:R(),y:R(),vx:R()-.5,vy:R()-.5}));
  function step(dt){const T0=T;T=hold?Math.min(1,T+dt*.45):Math.max(0,T-dt*.3);const dT=T-T0;
    if(dT>0){Tpk=Math.max(Tpk,T);if(!leak){esc=Math.min(1,esc+dT);if(Math.random()<dT*60*.5)bubs.push({x:END[0]+(Math.random()-.5)*6,y:END[1],r:3+Math.random()*4,v:60+Math.random()*40});seen.bub=1;}else seen.leakHold=1;}
    if(!hold&&T<Tpk-.15&&!leak&&esc>.3)seen.col=1;
    bubs.forEach(b=>{b.y-=b.v*dt;b.x+=Math.sin(b.y*.1)*.4;});bubs=bubs.filter(b=>b.y>WL+4);
    gas.forEach(p=>{const sp=(.25+T*.9)*dt;p.x+=p.vx*sp;p.y+=p.vy*sp;if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;p.x=clamp(p.x,0,1);p.y=clamp(p.y,0,1);});}
  function draw(dt){step(dt);const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G=scene(w,h,1000,600,70);ctx.save();ctx.translate(G.ox,G.oy);ctx.scale(G.k,G.k);
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,BY,1000,8);
    // 铁架台
    ctx.fillStyle=IRON;ctx.fillRect(120,BY-14,170,14);ctx.fillRect(150,120,10,BY-134);ctx.fillRect(155,TM+60,TX-155-TD/2,8);ctx.fillStyle='#8d939c';rr(ctx,TX-TD/2-12,TM+52,TD+24,24,4);ctx.fill();
    // 试管（内部的气体粒子：手温越高，运动越快、越分散）
    if(hold)drawHand(ctx,'tube','back',TX,GY,0,UA);testTube(ctx,TX,TM,TL,TD,0);ctx.save();tubeClip(ctx,TX,TM,TL,TD,0);gas.forEach(p=>{ctx.fillStyle='rgba(47,93,124,.55)';ctx.beginPath();ctx.arc(TX-TD/2+6+p.x*(TD-12),TM+26+p.y*(TL-50),3.2,0,TAU);ctx.fill();});ctx.restore();
    // 橡胶塞 + 导管
    const gap=leak?7:0;ctx.fillStyle='#4a4644';ctx.beginPath();ctx.moveTo(TX-TD/2-4,TM-24-gap);ctx.lineTo(TX+TD/2+4,TM-24-gap);ctx.lineTo(TX+TD/2-3+gap*.4,TM+16-gap);ctx.lineTo(TX-TD/2+3-gap*.4,TM+16-gap);ctx.closePath();ctx.fill();
    if(leak){caption(ctx,'橡胶塞没塞紧',TX-120,TM-60,TX-TD/2,TM+6,{col:BADC,size:16});if(hold&&T<1){ctx.strokeStyle='rgba(47,93,124,.6)';ctx.lineWidth=1.6;for(let i=0;i<3;i++){const p=(t*1.5+i/3)%1;ctx.globalAlpha=1-p;ctx.beginPath();ctx.moveTo(TX+TD/2+2,TM+8);ctx.quadraticCurveTo(TX+TD/2+14+p*20,TM-4-p*20,TX+TD/2+30+p*30,TM-10-p*30);ctx.stroke();}ctx.globalAlpha=1;}}
    const pipe=[[TX,TM+10],[TX,TM-80],[BX-10,TM-80],[BX-10,END[1]]];ctx.lineJoin='round';ctx.strokeStyle=GL_S;ctx.lineWidth=12;ctx.beginPath();pipe.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y-gap));ctx.stroke();ctx.strokeStyle='#f3f7fa';ctx.lineWidth=8;ctx.stroke();
    // 烧杯里的水
    AP.beaker(ctx,BX,BY,BW/92,{lv:.72,col:'rgba(150,200,235,.55)'});
    // 水柱
    const col=leak?0:esc*clamp((Tpk-T)/Math.max(.01,Tpk),0,1)*90*(hold?0:1);if(col>1){ctx.strokeStyle='rgba(80,150,210,.95)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(BX-10,WL);ctx.lineTo(BX-10,WL-col);ctx.stroke();if(seen.col&&!hold)caption(ctx,'水柱',BX+70,WL-col-10,BX-6,WL-col+6,{col:CC,size:16});}
    // 再画一次导管口附近，保证水柱在玻璃里
    ctx.strokeStyle=GL_S;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(BX-16,TM-80);ctx.lineTo(BX-16,END[1]);ctx.moveTo(BX-4,TM-74);ctx.lineTo(BX-4,END[1]);ctx.stroke();
    bubs.forEach(b=>{ctx.strokeStyle='rgba(255,255,255,.95)';ctx.fillStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.stroke();});
    // 手
    if(hold){const g=ctx.createRadialGradient(TX,GY,10,TX,GY,90);g.addColorStop(0,`rgba(235,120,60,${.25*T})`);g.addColorStop(1,'rgba(235,120,60,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(TX,GY,90,0,TAU);ctx.fill();drawHand(ctx,'tube','front',TX,GY,0,UA);}
    // 温度条
    ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.fillRect(40,150,22,200);ctx.strokeRect(40,150,22,200);ctx.fillStyle=CM;ctx.fillRect(43,347-194*T,16,194*T);hand(ctx,'气体温度',51,130,{size:15,col:DIM});
    ctx.restore();
    const rows=[];if(leak){if(seen.leakHold)rows.push([false,'手握试管，导管口没有气泡'],[false,'装置漏气，要重新塞紧橡胶塞再检查']);}
    else{if(seen.bub)rows.push([true,'手握试管：气体受热膨胀，导管口有气泡冒出']);if(seen.col)rows.push([true,'松开手：气体冷却收缩，导管内形成一段水柱'],[true,'说明装置气密性良好']);}
    if(rows.length)resultCard(ctx,w-380,20,360,leak?'检查结果：漏气':'检查结果',rows);
    else hand(ctx,'导管一端已浸入水中；点试管或“手握试管”，用手紧握试管外壁',w/2,28,{size:17,col:DIM});
    $('#arHold').disabled=hold;$('#arLet').disabled=!hold;}
  const setHold=v=>{if(hold===v)return;hold=v;if(v){Tpk=Math.max(T,Tpk);}sfx(v?'pop':'click');};
  $('#arHold').onclick=()=>setHold(true);$('#arLet').onclick=()=>setHold(false);
  function restart(){hold=false;T=0;Tpk=0;esc=0;bubs=[];seen={bub:0,col:0,leakHold:0};}
  $('#arLeak').onclick=()=>{leak=!leak;$('#arLeak').setAttribute('aria-pressed',String(leak));$('#arLeak').textContent=leak?'换回不漏气的装置':'换成漏气的装置';restart();sfx('click');};
  canvasUI(cv,{hots:()=>!G?[]:[{hit:(x,y)=>{const[sx,sy]=G.toS(x,y);return Math.abs(sx-TX)<40&&sy>TM&&sy<TM+TL;},act:()=>setHold(!hold)}]});
  const q=qPanel($('#arQ'),QB.air,{src:'气密性小测'});
  $('#arReset').onclick=()=>{leak=false;$('#arLeak').setAttribute('aria-pressed','false');$('#arLeak').textContent='换成漏气的装置';restart();q.reset();};
  notes('air','检查装置的气密性',['步骤：先把导管一端<mark>浸入水中</mark>，再用手<mark>紧握</mark>容器外壁。','现象：导管口<mark>有气泡冒出</mark>；松开手后，导管内形成<mark>一段水柱</mark> → 装置不漏气。','原理：气体受热膨胀、遇冷收缩。','制取气体时：先检查气密性，再装药品。'],
    '先握试管、后浸导管，受热膨胀的气体已经跑掉，就看不到气泡了。',
    (ctx,w,h)=>{const x=w*.25,y=h*.2;ctx.strokeStyle=PEN.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-16,y);ctx.lineTo(x-16,y+h*.55);ctx.arc(x,y+h*.55,16,Math.PI,0,true);ctx.lineTo(x+16,y);ctx.stroke();
      ctx.fillStyle=PEN.dim;ctx.fillRect(x-19,y-14,38,16);ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x,y-30);ctx.lineTo(w*.72,y-30);ctx.lineTo(w*.72,h*.8);ctx.stroke();
      ctx.strokeRect(w*.6,h*.55,w*.25,h*.35);ctx.strokeStyle=PEN.blue;ctx.beginPath();ctx.moveTo(w*.6,h*.62);ctx.lineTo(w*.85,h*.62);ctx.stroke();
      [[0,0],[6,-14],[-4,-26]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(w*.72+dx,h*.78+dy,4,0,TAU);ctx.stroke();});hand(ctx,'有气泡',w*.86,h*.42,{size:15,col:PEN.red});hand(ctx,'手握',x-34,y+h*.3,{size:15,col:PEN.red,align:'right'});});
  return{tick(dt){t+=dt;draw(dt);}};})();

/* ================= 11 操作诊所：点出有错误的操作，提交后看后果 ================= */
S.clinic=(()=>{const grid=$('#clGrid'),st=$('#clSt'),VB=varBtn($('#clSub'),QB.clTask,'操作诊所');let mark={},done=false;
  const CARD=[['drop','用过的胶头滴管平放在实验台上',1,'残留液体倒流进胶帽，腐蚀胶帽、污染试剂。'],['fill','向燃着的酒精灯里添加酒精',1,'酒精洒出，极易引起失火。'],['heat','给试管里的液体加热，液体约占容积的 2/3',1,'液体沸腾时容易喷出伤人；应不超过 1/3。'],
    ['block','把块状固体直接投入直立的试管',1,'固体砸破试管底；应先横放，再慢慢竖立。'],['smell','闻气体的气味：用手在瓶口轻轻扇动',0,'正确：使极少量气体飘进鼻孔。'],['rack','洗净的试管倒放在试管架上',0,'正确：便于晾干，防止落灰。']];
  const pics={drop:(ctx,w,h)=>{ctx.fillStyle='#e9e1d0';ctx.fillRect(0,h-16,w,6);const y=h-26,x0=w*.16;ctx.save();ctx.translate(x0,y);ctx.rotate(Math.PI/2);AP.dropper(ctx,0,0,1.55,0);ctx.restore();
      ctx.fillStyle=SOL;rr(ctx,x0+70,y-3,38,6,3);ctx.fill();drop(ctx,x0+122,y-1,3,SOL);caption(ctx,'残液流向胶帽',w*.62,h*.3,x0+110,y-4,{col:CM,size:14});},
    fill:(ctx,w,h)=>{const lx=w*.36,ly=h-8,neck=[lx+3,ly-94*.62],P=[w*.58,h*.3];lamp(ctx,lx,ly,.62,true,.4);// 烧杯盛酒精，倾斜着往燃着的灯里倒
      ctx.strokeStyle='rgba(185,215,235,.95)';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(P[0],P[1]+2);ctx.quadraticCurveTo(P[0]-8,neck[1]-30,neck[0]+8,neck[1]-4);ctx.stroke();
      ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(-1.95);AP.beaker(ctx,26,62,.56,{lv:0});ctx.restore();ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(-1.95);ctx.fillStyle='rgba(185,215,235,.85)';ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,22);ctx.lineTo(16,20);ctx.closePath();ctx.fill();ctx.restore();hand(ctx,'酒精',P[0]+64,P[1]+22,{size:14,col:DIM});},
    heat:(ctx,w,h)=>{lamp(ctx,w*.42,h-8,.55,true,.2);const bx=w*.42,byy=h-8-107*.55-30;ctx.save();ctx.translate(bx-Math.SQRT1_2*150,byy-Math.SQRT1_2*150);testTube(ctx,0,0,150,24,-Math.PI/4);ctx.restore();ctx.save();tubeClip(ctx,bx-Math.SQRT1_2*150,byy-Math.SQRT1_2*150,150,24,-Math.PI/4);ctx.fillStyle=SOL;ctx.fillRect(0,byy-70,w,200);ctx.restore();testTube(ctx,bx-Math.SQRT1_2*150,byy-Math.SQRT1_2*150,150,24,-Math.PI/4,{col:'rgba(0,0,0,0)'});},
    block:(ctx,w,h)=>{testTube(ctx,w*.45,h*.22,h*.7,30,0);grain(ctx,w*.45,h*.42,8,4,'#8f8c86');ctx.strokeStyle=CM;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.45,h*.5);ctx.lineTo(w*.45,h*.7);ctx.stroke();ctx.beginPath();ctx.moveTo(w*.45-5,h*.65);ctx.lineTo(w*.45,h*.72);ctx.lineTo(w*.45+5,h*.65);ctx.stroke();AP.tweezers(ctx,w*.47,h*.12,.55,.6,.35);},
    smell:(ctx,w,h)=>{const mx=w*.28,my=h-8-96*.9;AP.bottle(ctx,mx,h-8,.9,{stopper:'off',lv:.5,label:false});ctx.strokeStyle=CC;ctx.lineWidth=1.8;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(mx-4+i*4,my-4);ctx.bezierCurveTo(mx+8+i*6,my-26-i*6,mx+w*.2,my-10-i*10,mx+w*.4,my-40-i*12);ctx.stroke();}
      const hx=mx+w*.24,hy=my-18,uu=Math.min(w,h)/48;openHand(ctx,hx,hy,-.6,uu);ctx.strokeStyle='rgba(47,93,124,.6)';ctx.lineWidth=2;[0,1].forEach(i=>{ctx.beginPath();ctx.arc(hx,hy,uu*10+i*8,-2.9,-2.2);ctx.stroke();});
      hand(ctx,'扇向鼻孔',mx+w*.56,my-62,{size:15,col:CC});},
    rack:(ctx,w,h)=>{AP.rack(ctx,w/2,h-8,.95);[-2,-1,0,1,2].forEach(i=>{if(i===0)return;testTube(ctx,w/2+i*30,h-10,74,18,Math.PI);});}};
  function render(){grid.innerHTML=CARD.map(([k,cap,bad,res],i)=>`<button class="opc${mark[k]?' x':''}${done?' done '+((!!mark[k])===!!bad?'good':'bad'):''}" data-k="${k}"><canvas></canvas><span class="mark">${bad?'有错':'有错'}</span><div class="cap"><i>0${i+1}</i>${cap}</div><div class="res"><b>${bad?'✗ 错误':'✓ 正确'}</b>${res}</div></button>`).join('');
    $$('.opc',grid).forEach(b=>{paintStatic($('canvas',b),pics[b.dataset.k]);b.onclick=()=>{if(done)return;mark[b.dataset.k]=!mark[b.dataset.k];sfx(mark[b.dataset.k]?'stamp':'click');render();};});}
  $('#clSub').onclick=()=>{if(done)return;done=true;const tm=TEAM.cur,n=CARD.filter(c=>!!mark[c[0]]===!!c[2]).length;render();
    if(n===CARD.length){teamAdd(5,tm);sfx('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}诊断全对 +5</b>　4 处错误都找到了，2 个正确操作也没误判。`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}判断对 ${n} / 6，不加分</b>　红底卡片判断错了，看卡片下方的说明。点“变式练习”巩固。`);VB.hot(true);VARS.arm(st,VB.o,'操作诊所');}teamNext();};
  $('#clReset').onclick=()=>{VARS.disarm(st);VB.hot(false);mark={};done=false;render();setSt(st,'','点出有错误的操作（再点取消），选好后提交。');q.reset();};
  render();const q=qPanel($('#clQ'),QB.clinic,{src:'规范小测'});
  return{};})();

/* ================= 12 蜡烛探究：五个操作，现象填进记录表（只写现象和直接结论） ================= */
S.candle=(()=>{const cv=$('#cvCandle');let t=0,G=null,A=null,lit=true,rec={},wax=0,stick=0,mist=0,lime=0;
  const CX=330,CB=540,CS=1.2,CH=140,FT=CB-CH*CS-10*CS;// FT：火焰底部
  const ROWS=[['water','切一块石蜡放入水中','石蜡浮在水面上，不溶解'],['match','火柴梗平放入火焰约 1 s','接触外焰的部分最先变黑'],['dry','火焰上方罩干冷烧杯','烧杯内壁出现水雾'],['lime','罩内壁涂澄清石灰水的烧杯','石灰水变浑浊'],['out','吹灭蜡烛，点燃白烟','冒出白烟；白烟被点燃，蜡烛重新燃烧']];
  function run(k){if(A)return;if((k==='match'||k==='dry'||k==='lime'||k==='out')&&!lit)return;A={k,t0:t,dur:{water:2.2,match:3,dry:3.2,lime:3.2,out:4.6}[k]};sfx('whoosh');}
  function finish(k){rec[k]=1;if(k==='water')wax=1;if(k==='match')stick=1;if(k==='dry')mist=1;if(k==='lime')lime=1;sfx('ok');A=null;}
  /* 倒扣的烧杯：fog 水雾；lime=true 时内壁涂着澄清石灰水（透明薄层），turb 为变浑浊的程度（乳白色、带白色颗粒） */
  function invBeaker(ctx,x,yTop,{fog=0,lime=false,turb=0}={}){ctx.save();ctx.translate(x,yTop);ctx.rotate(Math.PI);beaker(ctx,0,0,110,130,{});
    if(lime){ctx.save();beakerPath(ctx,0,0,110,130);ctx.clip();
      ctx.strokeStyle=`rgba(150,200,235,${.45*(1-turb)})`;ctx.lineWidth=14;beakerPath(ctx,0,0,110,130);ctx.stroke();// 澄清石灰水薄层
      if(turb>0){const gm=ctx.createLinearGradient(0,-130,0,0);gm.addColorStop(0,`rgba(232,234,236,${.75*turb})`);gm.addColorStop(1,`rgba(218,221,224,${.92*turb})`);ctx.fillStyle=gm;beakerPath(ctx,0,0,110,130);ctx.fill();// 整个内壁蒙上一层乳白
        ctx.strokeStyle=`rgba(250,250,250,${turb})`;ctx.lineWidth=26;beakerPath(ctx,0,0,110,130);ctx.stroke();
        ctx.strokeStyle=`rgba(150,156,163,${.8*turb})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-46,-118);ctx.lineTo(-46,-6);ctx.lineTo(46,-6);ctx.lineTo(46,-118);ctx.stroke();
        const R=rng(9);ctx.fillStyle=`rgba(170,176,182,${.9*turb})`;for(let i=0;i<70;i++){const sd=R();let xx,yy;if(sd<.36){xx=-54+R()*9;yy=-128+R()*122;}else if(sd<.72){xx=45+R()*9;yy=-128+R()*122;}else{xx=-50+R()*100;yy=-8+R()*7;}ctx.beginPath();ctx.arc(xx,yy,1+R()*1.6,0,TAU);ctx.fill();}}
      ctx.restore();}
    if(fog>0){const R=rng(3);ctx.fillStyle=`rgba(255,255,255,${.8*fog})`;for(let i=0;i<60;i++){const xx=-50+R()*100,yy=-125+R()*110;if(Math.abs(xx)>40||yy>-118){ctx.beginPath();ctx.arc(xx,yy,1+R()*2,0,TAU);ctx.fill();}}}
    ctx.restore();}
  /* 白烟：从灯芯升起的几缕烟丝，越往上越散、越淡 */
  function smokeWisp(ctx,x,y,a,t){if(a<=0)return;ctx.save();ctx.lineCap='round';
    for(let j=0;j<4;j++){let px=x,py=y;for(let i=1;i<=24;i++){const h=i/24,nx=x+Math.sin(h*5+t*2.2+j*1.7)*(4+h*26)+(j-1.5)*h*10,ny=y-h*160;
        ctx.strokeStyle=`rgba(140,140,140,${a*.42*(1-h)})`;ctx.lineWidth=4+h*7;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();
        ctx.strokeStyle=`rgba(255,255,255,${a*.7*(1-h)})`;ctx.lineWidth=2+h*4;ctx.stroke();px=nx;py=ny;}}ctx.restore();}
  function draw(){const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G=scene(w,h,1000,600,70);const k=A?Math.min(1,(t-A.t0)/A.dur):0;ctx.save();ctx.translate(G.ox,G.oy);ctx.scale(G.k,G.k);
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,CB,620,8);
    // 水槽（烧杯）+ 石蜡
    AP.beaker(ctx,110,CB,1.15,{lv:.55,col:'rgba(150,200,235,.5)'});const wl=CB-108*1.15*.55;
    if(A&&A.k==='water'){const p=seg(k,0,.5),bob=Math.sin(k*20)*(1-k)*6;const y=k<.5?lerp(330,wl+12,p*p):wl-4+bob;ctx.fillStyle='#f6f1e2';ctx.strokeStyle=INK;ctx.lineWidth=1;rr(ctx,96,y-8,28,14,2);ctx.fill();ctx.stroke();}
    else if(wax){ctx.fillStyle='#f6f1e2';ctx.strokeStyle=INK;ctx.lineWidth=1;rr(ctx,96,wl-12,28,14,2);ctx.fill();ctx.stroke();}
    hand(ctx,'水',110,CB-30,{size:15,col:CC});if(!wax&&!(A&&A.k==='water')){ctx.fillStyle='#f6f1e2';ctx.strokeStyle=INK;ctx.lineWidth=1;rr(ctx,96,293,28,14,2);ctx.fill();ctx.stroke();hand(ctx,'石蜡块',110,272,{size:14,col:DIM});}
    // 蜡烛
    const outK=A&&A.k==='out'?k:0,blown=outK>.15&&outK<.72,relit=outK>=.72;const showLit=lit&&!blown;
    AP.candle(ctx,CX,CB,CS,{h:CH,lit:showLit,t,smoke:0});smokeWisp(ctx,CX,FT-4,blown?Math.min(1,(outK-.15)*4):0,t);
    if(A&&A.k==='out'){if(outK<.2){ctx.strokeStyle=CC;ctx.lineWidth=2.2;for(let i=0;i<3;i++){const p=(t*2+i/3)%1;ctx.globalAlpha=1-p;ctx.beginPath();ctx.moveTo(470-p*90,FT-30+i*12);ctx.quadraticCurveTo(450-p*90,FT-40+i*12,430-p*90,FT-30+i*12);ctx.stroke();}ctx.globalAlpha=1;}
      if(outK>.4&&outK<.78){const p=outK<.72?seg(outK,.4,.6):1-seg(outK,.72,.78);AP.matchAt(ctx,lerp(560,CX+8,p),lerp(FT-150,FT-70,p),1.1,Math.PI-.45,true,t);}// 火柴头伸进白烟
      if(outK>.6&&outK<.72){const p=seg(outK,.6,.7);flame(ctx,CX,lerp(FT-70,FT,p),.25,t);}}// 火焰顺着白烟落到灯芯
    // 火柴梗
    if(A&&A.k==='match'){const p=seg(k,0,.25),q2=seg(k,.7,.9);const y=FT-44,x=lerp(560,CX-50,p)+q2*230;ctx.fillStyle='#e7c38d';ctx.strokeStyle='#8a6a43';ctx.lineWidth=1;ctx.fillRect(x,y-3,100,6);ctx.strokeRect(x,y-3,100,6);
      if(k>.3){const c=seg(k,.3,.65);ctx.fillStyle=`rgba(40,30,25,${.85*c})`;ctx.fillRect(CX-26-x+x,y-3,13,6);ctx.fillRect(CX+13,y-3,13,6);ctx.fillStyle=`rgba(40,30,25,${.3*c})`;ctx.fillRect(CX-13,y-3,26,6);}}
    if(stick&&!(A&&A.k==='match')){ctx.save();ctx.translate(560,150);ctx.fillStyle='#e7c38d';ctx.strokeStyle='#8a6a43';ctx.lineWidth=1;ctx.fillRect(-60,-6,120,12);ctx.strokeRect(-60,-6,120,12);ctx.fillStyle='rgba(40,30,25,.88)';ctx.fillRect(-36,-6,16,12);ctx.fillRect(20,-6,16,12);ctx.fillStyle='rgba(40,30,25,.3)';ctx.fillRect(-20,-6,40,12);
      caption(ctx,'外焰处',-28,-34,-28,-8,{col:CM,size:14});caption(ctx,'焰心处',0,34,0,8,{col:CC,size:14});caption(ctx,'外焰处',28,-34,28,-8,{col:CM,size:14});ctx.restore();}
    // 烧杯
    if(A&&(A.k==='dry'||A.k==='lime')){const p=seg(k,0,.25),q2=seg(k,.8,1),y=lerp(120,FT-70,p)-q2*100,x=lerp(520,CX,p);const e=seg(k,.3,.75);invBeaker(ctx,x,y-130,A.k==='dry'?{fog:e}:{lime:true,turb:e});}
    else{if(mist)invBeaker(ctx,140,46,{fog:1});if(lime)invBeaker(ctx,268,46,{lime:true,turb:1});if(mist)hand(ctx,'干冷烧杯：水雾',140,196,{size:14,col:DIM});if(lime)hand(ctx,'石灰水：浑浊',268,196,{size:14,col:DIM});}
    // 记录表
    const X=640,Y=40,W=340;ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=1.5;let yy=Y+44;const lines=ROWS.map(r=>({r,ls:rec[r[0]]?wrapLines(ctx,r[2],W-24,'600 15px '+FNUM):['??']}));
    const Ht=44+lines.reduce((a,l)=>a+30+l.ls.length*21+8,0);ctx.fillRect(X,Y,W,Ht);ctx.strokeRect(X,Y,W,Ht);ctx.fillStyle=INK;ctx.fillRect(X,Y,W,4);hand(ctx,'探究记录',X+14,Y+24,{size:20,align:'left'});
    lines.forEach(({r,ls},i)=>{ctx.strokeStyle='rgba(28,26,23,.2)';ctx.beginPath();ctx.moveTo(X+10,yy-4);ctx.lineTo(X+W-10,yy-4);ctx.stroke();txt(ctx,`${i+1}. ${r[1]}`,X+12,yy+12,{size:14,weight:700,col:DIM,align:'left'});
      ls.forEach((s,j)=>txt(ctx,s,X+12,yy+34+j*21,{size:15,weight:600,col:rec[r[0]]?INK:FAINT,align:'left'}));yy+=30+ls.length*21+8;});
    ctx.restore();
    if(A&&k>=1){if(A.k==='out')lit=true;finish(A.k);}
    if(!A&&!Object.keys(rec).length)hand(ctx,'点下方按钮，或直接点蜡烛火焰（吹灭）、石蜡块（放入水中）',w/2,26,{size:17,col:DIM});
    dragHints(ctx,ui,G,{water:[110,CB-70,60,'放入水中']},t);
    ['#cnMatch','#cnDry','#cnLime','#cnOut','#cnWater'].forEach(s=>$(s).disabled=!!A);}
  $('#cnWater').onclick=()=>run('water');$('#cnMatch').onclick=()=>run('match');$('#cnDry').onclick=()=>run('dry');$('#cnLime').onclick=()=>run('lime');$('#cnOut').onclick=()=>run('out');
  const ui=canvasUI(cv,{tools:()=>{if(!G||A)return[];const T=[],tl=(id,sx,sy,r,fn)=>{const[x,y]=G.toC(sx,sy);T.push({id,x,y,r:r*G.k,draw:(ctx,x,y,gh)=>{if(!gh)return;ctx.save();ctx.translate(x,y);ctx.scale(G.k,G.k);fn(ctx);ctx.restore();}});};
      if(!wax)tl('water',110,300,30,ctx=>{ctx.fillStyle='#f6f1e2';ctx.strokeStyle=INK;rr(ctx,-14,-7,28,14,2);ctx.fill();ctx.stroke();});return T;},
    hots:()=>!G?[]:[{hit:(x,y)=>{const[sx,sy]=G.toS(x,y);return Math.abs(sx-CX)<36&&sy>FT-90&&sy<FT+10;},act:()=>run('out')}],
    onTap:id=>run(id),onDrop:(id,x,y)=>{const[sx,sy]=G.toS(x,y);if(id==='water'&&Math.abs(sx-110)<80&&sy>300){run('water');return true;}return false;}});
  const q=qPanel($('#cnQ'),QB.candle,{src:'探究小测'});
  $('#cnReset').onclick=()=>{A=null;lit=true;rec={};wax=0;stick=0;mist=0;lime=0;q.reset();};
  notes('candle','对蜡烛及其燃烧的探究',['石蜡浮在水面上 → 密度比水<mark>小</mark>，<mark>难溶于水</mark>。','火焰分为外焰、内焰、焰心三层，<mark>外焰温度最高</mark>。','干冷烧杯内壁出现水雾 → 生成了<mark>水</mark>；石灰水变浑浊 → 生成了<mark>二氧化碳</mark>。','熄灭后有白烟，白烟能被点燃。'],
    '描述现象说“出现水雾”“变浑浊”；“生成水、二氧化碳”是结论。',
    (ctx,w,h)=>{const s=Math.min(w/260,h/300);AP.candle(ctx,w*.32,h*.96,.9*s,{h:110,lit:true,t:.3});const fy=h*.96-(110+10)*.9*s;
      [['外焰',-60,PEN.red],['内焰',-36,PEN.gold],['焰心',-12,PEN.blue]].forEach(([n,dy,col],i)=>{const y=fy+dy*.9*s;ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(w*.32+5,y);ctx.lineTo(w*.62,y-i*3);ctx.stroke();hand(ctx,n,w*.7,y-i*3,{size:16,col});});});
  return{tick(dt){t+=dt;draw();}};})();
