/* ================= 8 吸附与消毒 ================= */
S.carbon=(()=>{const cv=$('#cvCarbon');let t=0,ink=0,carb=0,carbT=0;const R=rng(23);
  const grains=Array.from({length:46},()=>({x:R(),y:-R()*.3,vy:0,r:3+R()*4,a:R()*6}));
  // 孔道：从表面伸入内部的折线
  const chunk=[];for(let a=0;a<TAU;a+=TAU/22){const r=1+.13*Math.sin(a*3+1)+.08*Math.cos(a*5)+(R()-.5)*.1;chunk.push([Math.cos(a)*r,Math.sin(a)*r*.86]);}
  const pores=[];for(let i=0;i<9;i++){const a=i/9*TAU+.3,p=[[Math.cos(a)*.98,Math.sin(a)*.84]];let x=p[0][0],y=p[0][1];for(let k=0;k<4;k++){x*=.7;y*=.7;x+=(R()-.5)*.18;y+=(R()-.5)*.18;p.push([x,y]);}pores.push(p);
    const b=p[2];pores.push([b,[b[0]+(R()-.5)*.4,b[1]+(R()-.5)*.4]]);}
  const sites=[];pores.forEach(p=>{for(let k=0;k<p.length-1;k++)for(let q=0;q<3;q++){const f=(q+.5)/3;sites.push([lerp(p[k][0],p[k+1][0],f),lerp(p[k][1],p[k+1][1],f)]);}});
  const mol=Array.from({length:34},(_,i)=>({x:(R()-.5)*3,y:(R()-.5)*2.2,vx:0,vy:0,c:i%3===0?'#8d5fb0':'#d24a54',s:Math.floor(R()*sites.length),stuck:false}));
  $('#caAdd').onclick=()=>{if(ink>0)return;ink=.001;$('#caAdd').disabled=true;sfx('drop');};
  /* 直接操作：把红墨水滴瓶、活性炭瓶拖进烧杯 */
  const Gc={};const inBk=(x,y)=>Gc.cx&&Math.abs(x-Gc.cx)<Gc.bw/2+30&&y>Gc.by-Gc.bh-70&&y<Gc.by;
  const ui=canvasUI(cv,{tools:()=>Gc.cx?[{id:'ink',x:Gc.cx-60,y:Gc.by-Gc.bh-58,r:34,on:!ink,draw:(c,x,y,d)=>dropperIcon(c,x,y,'红墨水','#d24a54',{tilt:d?-.4:0})},
      {id:'carb',x:Gc.cx+60,y:Gc.by-Gc.bh-58,r:34,on:!carb,draw:(c,x,y,d)=>jarIcon(c,x,y,'活性炭','#2b2b2e',{tilt:d?-.6:0})}]:[],
    onDrop:(id,x,y)=>{if(!inBk(x,y))return false;$(id==='ink'?'#caAdd':'#caCarb').click();return true;}});
  $('#caCarb').onclick=()=>{if(ink===0){$('#caAdd').click();}if(carb)return;carb=1;carbT=0;$('#caCarb').disabled=true;sfx('pop');};
  $('#caReset').onclick=()=>{ink=0;carb=0;carbT=0;$('#caAdd').disabled=false;$('#caCarb').disabled=false;grains.forEach(g=>{g.y=-Math.random()*.3;g.vy=0;});mol.forEach(m=>{m.stuck=false;m.x=(Math.random()-.5)*3;m.y=(Math.random()-.5)*2.2;});sfx('click');};
  // 物理 / 化学 分类
  const ROWS=[['静置沉淀','p'],['过滤','p'],['活性炭吸附','p'],['投药消毒','c'],['蒸馏','p']];const pick={};let done=false;const box=$('#caSort'),st=$('#caSt');
  function render(){box.innerHTML=ROWS.map((r,i)=>`<div class="srow"><span>${r[0]}</span><button class="btn" data-r="${i}" data-v="p" aria-pressed="${pick[i]==='p'}">物理变化</button><button class="btn" data-r="${i}" data-v="c" aria-pressed="${pick[i]==='c'}">化学变化</button></div>`).join('');
    $$('[data-r]',box).forEach(b=>b.onclick=()=>{if(done)return;pick[b.dataset.r]=b.dataset.v;sfx('click');render();});}
  render();
  $('#caSub').onclick=()=>{if(done)return;if(Object.keys(pick).length<ROWS.length){setSt(st,'warn','每一行都要选一个');return;}done=true;const tm=TEAM.cur;let bad=0;
    $$('.srow',box).forEach((row,i)=>{const ok=pick[i]===ROWS[i][1];if(!ok)bad++;const right=$(`[data-v="${ROWS[i][1]}"]`,row);right.style.background=ok?'#e5f2e8':'#fbe8e2';right.style.borderColor=ok?MOSS:CIN;});
    if(!bad){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +5</b>　只有投药消毒生成了新物质。`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}错 ${bad} 处，不加分</b>　着色的是正确答案：只有<b>投药消毒</b>是化学变化。`);}teamNext();};
  $('#caRedo').onclick=()=>{for(const k in pick)delete pick[k];done=false;render();setSt(st,'','全对 +5 分');};
  function tick(dt){t+=dt;if(ink>0)ink=Math.min(1,ink+dt*.8);if(carb){carbT+=dt;}
    const tint=ink*(carb?clamp(1-(carbT-1.2)/5,0,1)*.9+.1*clamp(1-(carbT-1.2)/5,0,1):1);
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    // 左：烧杯
    const cx=w*.25,by=h-130,bw=Math.min(240,w*.26),bh=Math.min(300,h*.5),top=by-bh*.75,l=cx-bw/2;Object.assign(Gc,{cx,by,bw,bh});
    beaker(ctx,cx,by,bw,bh,{lv:.75,col:waterCol(.05,{tint:tint*.85}),ticks:5});
    if(ink>0&&ink<1){ctx.save();beakerPath(ctx,cx,by,bw,bh);ctx.clip();for(let i=0;i<6;i++){const g=ctx.createRadialGradient(cx+Math.sin(i*2)*30,top+ink*bh*.6*(i/6+.3),2,cx,top+40,60);g.addColorStop(0,'rgba(200,40,60,.5)');g.addColorStop(1,'rgba(200,40,60,0)');ctx.fillStyle=g;ctx.fillRect(l,top,bw,bh);}ctx.restore();}
    if(carb){ctx.save();beakerPath(ctx,cx,by,bw,bh);ctx.clip();grains.forEach(g=>{if(g.y<.97){g.vy+=dt*.25;g.y=Math.min(.97,g.y+g.vy*dt*.6);}const x=l+10+g.x*(bw-20),y=lerp(top-10,by-6,g.y);
      ctx.fillStyle='#2a2a2d';ctx.beginPath();for(let a=0;a<TAU;a+=1.2)ctx.lineTo(x+Math.cos(a+g.a)*g.r*(1+.3*Math.sin(a*3)),y+Math.sin(a+g.a)*g.r);ctx.fill();});ctx.restore();}
    hand(ctx,ink?(carb?(tint<.15?'红色褪去了':'活性炭吸附中…'):'滴入红墨水的水'):'一杯清水',cx,by+36,{size:26});
    // 右：放大的活性炭
    const mx=w*.64,my=h*.43,mr=Math.min(h*.35,w*.25);
    ctx.save();ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.fillStyle='#f4f9fb';ctx.fill();ctx.clip();ctx.fillStyle=waterCol(.04,{tint:tint*.5});ctx.fillRect(mx-mr,my-mr,mr*2,mr*2);
    const cs=mr*.52;
    if(carb){ctx.save();ctx.translate(mx,my);ctx.beginPath();chunk.forEach(([x,y],i)=>i?ctx.lineTo(x*cs,y*cs):ctx.moveTo(x*cs,y*cs));ctx.closePath();const g=ctx.createRadialGradient(-cs*.3,-cs*.3,cs*.1,0,0,cs*1.1);g.addColorStop(0,'#4a4b50');g.addColorStop(1,'#1d1d20');ctx.fillStyle=g;ctx.fill();
      ctx.lineCap='round';ctx.lineJoin='round';pores.forEach((p,i)=>{ctx.strokeStyle='#cfe6ee';ctx.lineWidth=(i%2?5:10)*mr/220;ctx.beginPath();p.forEach(([x,y],k)=>k?ctx.lineTo(x*cs,y*cs):ctx.moveTo(x*cs,y*cs));ctx.stroke();});ctx.restore();}
    mol.forEach(m=>{if(carb&&!m.stuck){const[sx,sy]=sites[m.s];const dx=sx-m.x,dy=sy-m.y,d=Math.hypot(dx,dy);if(carbT>1.2){m.x+=dx*Math.min(1,dt*.9);m.y+=dy*Math.min(1,dt*.9);if(d<.03)m.stuck=true;}}
      if(!m.stuck&&(!carb||carbT<1.2)){m.x+=(Math.random()-.5)*dt*1.2;m.y+=(Math.random()-.5)*dt*1.2;m.x=clamp(m.x,-1.7,1.7);m.y=clamp(m.y,-1.6,1.6);}
      if(!ink)return;const x=mx+m.x*cs,y=my+m.y*cs;ctx.fillStyle=m.c;ctx.beginPath();ctx.arc(x,y,5.5*mr/220,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.arc(x-1.5,y-1.5,1.6,0,TAU);ctx.fill();});
    ctx.restore();ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.lineWidth=9;ctx.strokeStyle='#2c2f36';ctx.stroke();
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle='#2c2f36';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx+bw*.3,by-30);ctx.lineTo(mx-mr*.9,my+mr*.45);ctx.stroke();ctx.restore();
    if(carb){hand(ctx,'活性炭：疏松多孔，表面积很大',mx,my+mr+28,{size:24,col:INK});if(carbT>2)hand(ctx,'色素、异味分子被吸附在孔道表面',mx,my+mr+58,{size:24,col:CIN});}
    else hand(ctx,ink?'色素分子在水中自由运动，点“加入活性炭”':'',mx,my+mr+30,{size:22,col:'#4a4f5c'});
    if(!ink){hand(ctx,'放大镜',mx,my-56,{size:30,col:NAVY});txt(ctx,'① 把红墨水拖进烧杯',mx,my-6,{size:18,weight:700});txt(ctx,'② 再把活性炭拖进烧杯',mx,my+26,{size:18,weight:700});txt(ctx,'（也可以点下方按钮）观察颜色变化和微观过程',mx,my+60,{size:15,col:'#6f7480'});}
    ui.draw(ctx);if(!carb)trayHint(ctx,Gc.cx,Gc.by-Gc.bh-14,'拖进烧杯');
    if(ink){[['#d24a54','色素分子'],['#8d5fb0','异味分子']].forEach(([c,s],i)=>{const x=40,y=30+i*26;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.fill();txt(ctx,s,x+12,y,{size:14,align:'left',weight:700});});}
  }
  return{tick};})();

/* ================= 9 自制简易净水器 ================= */
S.bottle=(()=>{const cv=$('#cvBottle');let t=0,order=[],judged=false,pour=0,front=0,out=0;
  const LY=[{n:'小卵石',d:'除去较大的不溶性颗粒',c:'#9b8f80'},{n:'石英砂',d:'除去较小的不溶性颗粒',c:'#e2cfa3'},{n:'活性炭',d:'吸附色素和异味',c:'#2b2b2e'},{n:'蓬松棉',d:'阻挡细小颗粒，防止活性炭漏出',c:'#f6f4ee'}];
  const RIGHT=[3,2,1,0];// 从瓶口（下）往上
  const show=[1,3,0,2];const box=$('#boLayers'),st=$('#boSt');
  function sw(c,n,cvs){const{ctx,w,h}=fitS(cvs);ctx.fillStyle=c;ctx.fillRect(0,0,w,h);const R=rng(n+3);for(let i=0;i<24;i++){ctx.fillStyle=n===0?`rgba(80,70,60,${.3+R()*.4})`:n===1?'rgba(170,140,90,.5)':n===2?'rgba(90,90,96,.8)':'rgba(220,215,200,.9)';ctx.beginPath();ctx.arc(R()*w,R()*h,n===0?3+R()*3:1+R()*1.5,0,TAU);ctx.fill();}}
  function render(){box.innerHTML=show.map(i=>`<button class="layer" data-i="${i}"><canvas></canvas><span>${LY[i].n}<small>${LY[i].d}</small></span><em>${order.includes(i)?order.indexOf(i)+1:''}</em></button>`).join('');
    $$('.layer',box).forEach(b=>{requestAnimationFrame(()=>sw(LY[+b.dataset.i].c,+b.dataset.i,$('canvas',b)));b.onclick=()=>{if(judged)return;const i=+b.dataset.i;if(order.includes(i)){order=order.slice(0,order.indexOf(i));}else order.push(i);sfx('drop');render();};});}
  render();
  $('#boSub').onclick=()=>{if(judged)return;if(order.length<4){setSt(st,'warn','4 种材料都要装进去');return;}judged=true;const tm=TEAM.cur;const ok=order.every((v,i)=>v===RIGHT[i]);
    if(ok){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}正确 +5</b>　自上而下：小卵石 → 石英砂 → 活性炭 → 蓬松棉。点“倒入浑浊河水”试试！`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}顺序不对，不加分</b>　已改为正确装填：先粗后细，活性炭在下，蓬松棉垫底。`);order=RIGHT.slice();render();}
    teamNext();$('#boPour').disabled=false;};
  $('#boPour').onclick=()=>{if(pour)return;pour=.001;front=0;out=0;$('#boPour').disabled=true;sfx('whoosh');};
  $('#boReset').onclick=()=>{order=[];judged=false;pour=0;front=0;out=0;$('#boPour').disabled=true;render();setSt(st,'','瓶口朝下，水从上往下流。正确 +5 分');stampOff($('[data-id="bottle"] .stage'));};
  const Gb={};canvasUI(cv,{hots:()=>Gb.cx?[{hit:(x,y)=>Math.abs(x-Gb.cx)<Gb.bw&&y>Gb.top-30&&y<Gb.bodyB,act:()=>{if(!$('#boPour').disabled)$('#boPour').click();}}]:[]});
  function tick(dt){t+=dt;if(pour){pour+=dt;front=Math.min(1,front+dt*.16);if(front>=1)out=Math.min(1,out+dt*.12);if(out>=1&&pour<99){pour=99;stampOn($('[data-id="bottle"] .stage'),'仍含可溶性杂质',false,'72%','22%');}}
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const cx=w*.44,top=46,bodyB=h*.5,nb=bodyB+64,bw=Math.min(190,w*.2),nw=26;
    Object.assign(Gb,{cx,top,bodyB,bw});
    const half=y=>y<bodyB?bw:y<nb-24?lerp(bw,nw,smooth(bodyB,nb-24,y)):nw;
    const path=()=>{ctx.beginPath();ctx.moveTo(cx-bw,top);for(let y=top;y<=nb;y+=4)ctx.lineTo(cx-half(y),y);ctx.lineTo(cx-nw,nb+18);ctx.lineTo(cx+nw,nb+18);for(let y=nb;y>=top;y-=4)ctx.lineTo(cx+half(y),y);};
    // 支架与接水烧杯
    stand(ctx,cx-bw-70,h-80,top+20,bw*2+150,cx-bw-110);ctx.strokeStyle='#3a3f47';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx-bw-70,bodyB+20);ctx.lineTo(cx-half(bodyB+20),bodyB+20);ctx.stroke();
    const bkH=Math.max(90,h-nb-130);beaker(ctx,cx,h-98,170,bkH,{lv:out*.6,col:waterCol(.05),ticks:4});
    path();ctx.fillStyle='rgba(225,238,246,.25)';ctx.fill();
    // 填料：自下而上
    ctx.save();path();ctx.clip();const H=[66,58,58,66];let y0=nb+18;const bands=[];
    order.forEach((li,k)=>{const hh=k===0?H[0]+18:H[k];const y1=y0-hh;bands.push([li,y1,y0]);const R=rng(li*11+5);ctx.fillStyle=LY[li].c;ctx.fillRect(cx-bw,y1,bw*2,hh);
      const n=li===0?60:li===1?400:li===2?220:90;for(let i=0;i<n;i++){const x=cx-bw+R()*bw*2,y=y1+R()*hh;if(li===0){ctx.fillStyle=`hsl(${25+R()*20},${10+R()*15}%,${45+R()*25}%)`;ctx.beginPath();ctx.ellipse(x,y,7+R()*7,5+R()*4,R()*3,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.18)';ctx.stroke();}
        else if(li===1){ctx.fillStyle=R()<.5?'#c9b384':'#f1e3bf';ctx.fillRect(x,y,2,2);}else if(li===2){ctx.fillStyle=R()<.5?'#45464c':'#151517';ctx.beginPath();ctx.arc(x,y,2+R()*2.5,0,TAU);ctx.fill();}
        else{ctx.strokeStyle='rgba(205,200,186,.9)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,4+R()*6,R()*6,R()*6+2);ctx.stroke();}}
      ctx.strokeStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.moveTo(cx-bw,y1);ctx.lineTo(cx+bw,y1);ctx.stroke();y0=y1;});
    // 水流通过
    if(pour){const surf=Math.min(y0,top+40),fy=lerp(surf,nb+18,front);
      bands.forEach(([li,a,b])=>{if(fy<=a)return;const k=order.indexOf(li),turb=[.08,.12,.3,.6][k]??.6;ctx.fillStyle=waterCol(turb,{a:.55,tint:0});ctx.fillRect(cx-bw,a,bw*2,Math.min(b,fy)-a);});
      ctx.fillStyle=waterCol(.9,{a:.95});ctx.fillRect(cx-bw,surf-(pour<99?28:16),bw*2,y0-surf+(pour<99?28:16));}
    ctx.restore();path();ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.stroke();glassHi(ctx,cx+bw*.78,top+20,cx+bw*.78,bodyB-20,5,.6);
    ctx.strokeStyle=GL_S;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,top,bw,10,0,0,TAU);ctx.stroke();
    if(pour&&pour<99){tiltBeaker(ctx,cx-bw*.2,top-14,-1.1,96,120,.5,waterCol(.9,{a:.95}));stream(ctx,[[cx-bw*.2,top-14],[cx-bw*.25,top+30]],waterCol(.9,{a:.95}),6,t);}
    if(front>=1){const ph=(t*2)%1;drop(ctx,cx,lerp(nb+24,h-98-bkH*out*.6-6,ph*ph),4,waterCol(.06,{a:1.4}));}
    // 标注
    bands.forEach(([li,a,b])=>{callout(ctx,cx+bw-10,(a+b)/2,cx+bw+60,(a+b)/2,LY[li].n,{col:INK,size:17,align:'left'});});
    if(!order.length)hand(ctx,'← 在右侧按“从瓶底往上”的顺序点击材料',cx+bw+30,h*.4,{size:24,align:'left',col:'#6f7480'});
    txt(ctx,'瓶口朝下',cx-nw-14,nb+10,{size:14,align:'right',col:'#6f7480',weight:700});
  }
  return{tick};})();

/* ================= 10 制取蒸馏水（蒸馏烧瓶 + 温度计 + 冷凝管 + 锥形瓶） ================= */
/* 基准坐标 1000×640；s = {water,stones,lit,cap,temp,vol,first,bump,boil,cool,drip,escape,t} */
function drawDistill(ctx,ox,oy,k,s){const t=s.t||0;ctx.save();ctx.translate(ox,oy);ctx.scale(k,k);
  const fcx=250,fcy=332,FR=72,nw=14,neckTop=150,armY=196,meshY=406;
  const C0=[366,262],C1=[706,404],dx=C1[0]-C0[0],dy=C1[1]-C0[1],CL=Math.hypot(dx,dy),ux=dx/CL,uy=dy/CL,nx=-uy,ny=ux;
  const at=(f,off=0)=>[C0[0]+dx*f+nx*off,C0[1]+dy*f+ny*off];
  // 右侧铁架台（在冷凝管后面）
  stand(ctx,560,612,140,190,470);
  // 左侧铁架台
  stand(ctx,110,612,80,300,50);
  ctx.strokeStyle='#3a3f47';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(110,236);ctx.lineTo(fcx-nw-6,236);ctx.stroke();rr(ctx,101,226,18,20,3);ctx.fillStyle=metal(ctx,101,0,119,0,true);ctx.fill();
  ctx.fillStyle='#55504a';rr(ctx,fcx-nw-10,226,8,22,2);ctx.fill();rr(ctx,fcx+nw+2,226,8,22,2);ctx.fill();
  ctx.strokeStyle='#3a3f47';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(110,meshY+8);ctx.lineTo(fcx-66,meshY+8);ctx.stroke();ctx.beginPath();ctx.ellipse(fcx,meshY+8,66,10,0,0,TAU);ctx.stroke();
  ctx.fillStyle='#ece9e1';ctx.fillRect(fcx-96,meshY,192,7);ctx.fillStyle='#c9c3b6';ctx.fillRect(fcx-42,meshY,84,7);ctx.strokeStyle='#8f8a80';ctx.lineWidth=1;ctx.strokeRect(fcx-96,meshY,192,7);
  lamp(ctx,fcx,594,1.0,s.lit,t,s.cap);// 酒精灯放在铁架台底座铁板上
  if(s.lit){const g=ctx.createRadialGradient(fcx,meshY+4,4,fcx,meshY+4,60);g.addColorStop(0,'rgba(255,150,60,.55)');g.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=g;ctx.fillRect(fcx-70,meshY-20,140,40);}
  // 支管（烧瓶 → 冷凝管）
  const arm=new Path2D(`M${fcx+nw} ${armY} L${C0[0]+ux*8} ${C0[1]+uy*8}`);
  ctx.save();ctx.lineCap='round';ctx.strokeStyle=GL_S;ctx.lineWidth=11;ctx.stroke(arm);ctx.strokeStyle='rgba(236,246,251,.95)';ctx.lineWidth=7;ctx.stroke(arm);ctx.restore();
  // 烧瓶
  const a0=Math.asin(nw/FR);const flask=()=>{ctx.beginPath();ctx.moveTo(fcx-nw,neckTop);ctx.lineTo(fcx-nw,fcy-FR*Math.cos(a0));ctx.arc(fcx,fcy,FR,-Math.PI/2-a0,-Math.PI/2+a0,true);ctx.lineTo(fcx+nw,neckTop);};
  flask();ctx.fillStyle=GL_F;ctx.fill();
  const lvH=s.water*FR*.776*(1-(s.vol||0)/90);
  if(s.water>0){ctx.save();flask();ctx.clip();const ly=fcy+FR-lvH,boil=s.boil||0;
    ctx.fillStyle=waterCol(.05,{a:1.1});ctx.fillRect(fcx-FR,ly,FR*2,lvH+4);ctx.fillStyle=`rgba(214,180,90,${Math.min(.35,(s.vol||0)/40)})`;ctx.fillRect(fcx-FR,ly,FR*2,lvH+4);
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.beginPath();for(let x=fcx-FR;x<=fcx+FR;x+=4)ctx.lineTo(x,ly+Math.sin(x*.2+t*14)*boil*2.2);ctx.stroke();
    if(s.stones){const R=rng(9);for(let i=0;i<5;i++){const x=fcx-30+i*14+R()*5,y=fcy+FR-6-R()*3;ctx.fillStyle='#f3f1ea';ctx.strokeStyle='#a9a395';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-5,y+3);ctx.lineTo(x-3,y-4);ctx.lineTo(x+4,y-3);ctx.lineTo(x+5,y+3);ctx.closePath();ctx.fill();ctx.stroke();}}
    const nb=Math.floor((s.stones?24:6)*boil);for(let i=0;i<nb;i++){const ph=((t*(s.stones?1.4:.6)+i*.137)%1),bx=s.stones?fcx-30+(i%5)*14+Math.sin(i*3+t*5)*4:fcx+Math.sin(i*7.3)*FR*.6;const yy=lerp(fcy+FR-8,ly+3,ph);ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(bx,yy,(s.stones?2:3.5)+ph*3,0,TAU);ctx.stroke();}
    if(s.bump>0){const b=s.bump;for(let i=0;i<7;i++){const bx=fcx+Math.sin(i*2.3)*FR*.5,by=fcy+FR-14-((i*.31+t*2.2)%1)*lvH*1.3,br=(10+i%3*8)*b;ctx.fillStyle='rgba(255,255,255,.3)';ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,br,0,TAU);ctx.fill();ctx.stroke();}
      ctx.fillStyle=waterCol(.05,{a:1.1});ctx.beginPath();ctx.moveTo(fcx-FR,ly);for(let x=fcx-FR;x<=fcx+FR;x+=6)ctx.lineTo(x,ly-b*(30+18*Math.sin(x*.15+t*30)));ctx.lineTo(fcx+FR,ly+4);ctx.closePath();ctx.fill();}
    ctx.restore();}
  if(s.bump>0){for(let i=0;i<12;i++){const a=(i/11-.5)*.5,d=s.bump*(120+i*8);ctx.fillStyle=waterCol(.1,{a:1.3});ctx.beginPath();ctx.arc(fcx+Math.sin(a)*d*.15,fcy-FR-d*.5,3+i%3,0,TAU);ctx.fill();}}
  flask();ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.stroke();glassHi(ctx,fcx-FR*.62,fcy-FR*.35,fcx-FR*.7,fcy+FR*.2,4,.7);glassHi(ctx,fcx-nw+4,neckTop+12,fcx-nw+4,fcy-FR+10,2.5,.75);
  // 胶塞 + 温度计（水银球位于支管口处）
  ctx.fillStyle='#2c2b2e';ctx.beginPath();ctx.moveTo(fcx-nw-4,neckTop-22);ctx.lineTo(fcx+nw+4,neckTop-22);ctx.lineTo(fcx+nw-1,neckTop+10);ctx.lineTo(fcx-nw+1,neckTop+10);ctx.closePath();ctx.fill();
  const thT=40,thB=armY+4;rr(ctx,fcx-5,thT,10,thB-thT,5);ctx.fillStyle='rgba(240,248,252,.95)';ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=1.5;ctx.stroke();
  for(let i=0;i<10;i++){ctx.strokeStyle='rgba(60,70,80,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(fcx+5,thT+10+i*9);ctx.lineTo(fcx+(i%5?2:-1),thT+10+i*9);ctx.stroke();}
  const tt=clamp(((s.temp||20)-0)/110,0,1),colTop=lerp(thB-14,thT+8,tt);ctx.fillStyle='#d23b35';ctx.fillRect(fcx-1.6,colTop,3.2,thB-8-colTop);ctx.beginPath();ctx.ellipse(fcx,thB-6,4.5,7,0,0,TAU);ctx.fill();
  // 冷凝管（局部坐标：x 沿管轴，y>0 为下侧）：玻璃外套两端收口，内管贯穿；冷水下口进、上口出
  const jf0=.07,jf1=.86,JR=18,IR=6,ang=Math.atan2(dy,dx),x0=jf0*CL,x1=jf1*CL,nxo=x0+34,nxi=x1-34;
  const inP=at(nxi/CL,JR+22),outP=at(nxo/CL,-JR-22);
  ctx.save();ctx.translate(C0[0],C0[1]);ctx.rotate(ang);
  const jacket=()=>{ctx.beginPath();ctx.moveTo(x0,-IR-1.5);ctx.bezierCurveTo(x0+4,-JR,x0+10,-JR,x0+18,-JR);ctx.lineTo(x1-18,-JR);ctx.bezierCurveTo(x1-10,-JR,x1-4,-JR,x1,-IR-1.5);ctx.lineTo(x1,IR+1.5);ctx.bezierCurveTo(x1-4,JR,x1-10,JR,x1-18,JR);ctx.lineTo(x0+18,JR);ctx.bezierCurveTo(x0+10,JR,x0+4,JR,x0,IR+1.5);ctx.closePath();};
  const nub=(x,sd)=>{ctx.beginPath();ctx.rect(x-5,sd>0?JR-2:-JR-20,10,22);};
  const hose=(pts,water)=>{ctx.lineCap='round';ctx.lineJoin='round';const pth=()=>{ctx.beginPath();ctx.moveTo(...pts[0]);ctx.bezierCurveTo(...pts[1],...pts[2],...pts[3]);};
    pth();ctx.strokeStyle='#6e2b1f';ctx.lineWidth=13;ctx.stroke();pth();ctx.strokeStyle='#9c4532';ctx.lineWidth=9;ctx.stroke();
    if(water){pth();ctx.setLineDash([8,10]);ctx.lineDashOffset=water*t*40;ctx.strokeStyle='rgba(170,220,245,.95)';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);}
    pth();ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.translate(0,-2.5);ctx.stroke();ctx.translate(0,2.5);};
  // 橡胶管：进水管从下方接入下口，出水管从上口引出
  hose([[nxi,JR+20],[nxi+6,JR+70],[nxi-30,JR+100],[nxi-70,JR+128]],s.cool?1:0);
  hose([[nxo,-JR-20],[nxo-4,-JR-70],[nxo+40,-JR-90],[nxo+70,-JR-118]],s.cool?-1:0);
  // 进出水口小管（带接头）
  [[nxi,1],[nxo,-1]].forEach(([x,sd])=>{nub(x,sd);ctx.fillStyle='rgba(225,240,248,.85)';ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=1.6;ctx.stroke();
    ctx.fillStyle='#7d3527';rr(ctx,x-7,sd>0?JR+10:-JR-22,14,12,3);ctx.fill();});
  // 外套管（玻璃 + 冷水）
  jacket();let g=ctx.createLinearGradient(0,-JR,0,JR);
  if(s.cool){g.addColorStop(0,'rgba(120,185,225,.75)');g.addColorStop(.35,'rgba(185,225,245,.6)');g.addColorStop(1,'rgba(110,175,220,.8)');}
  else{g.addColorStop(0,'rgba(190,212,228,.55)');g.addColorStop(.35,'rgba(245,250,253,.3)');g.addColorStop(1,'rgba(180,205,222,.6)');}
  ctx.fillStyle=g;ctx.fill();
  if(s.cool){ctx.save();jacket();ctx.clip();const span=x1-x0;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2.2;
    for(let k=0;k<12;k++){const x=x1-((t*45+k*span/6)%span),y=(k%2?1:-1)*(IR+6);ctx.beginPath();ctx.moveTo(x+5,y-4);ctx.lineTo(x,y);ctx.lineTo(x+5,y+4);ctx.stroke();}ctx.restore();}
  jacket();ctx.strokeStyle=GL_S;ctx.lineWidth=2.2;ctx.stroke();
  // 内管
  ctx.beginPath();ctx.rect(-6,-IR,CL+12,IR*2);g=ctx.createLinearGradient(0,-IR,0,IR);g.addColorStop(0,'rgba(200,220,232,.9)');g.addColorStop(.4,'rgba(250,253,255,.95)');g.addColorStop(1,'rgba(190,212,226,.9)');ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle=GL_S;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-6,-IR);ctx.lineTo(CL+6,-IR);ctx.moveTo(-6,IR);ctx.lineTo(CL+6,IR);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0+20,-JR+4);ctx.lineTo(x1-20,-JR+4);ctx.stroke();ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(4,-IR+2);ctx.lineTo(CL-4,-IR+2);ctx.stroke();
  // 水流方向箭头（管外）
  if(s.cool){ctx.fillStyle='#2f6fb0';const arr=(x,y,a)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-6,-6);ctx.lineTo(-6,6);ctx.closePath();ctx.fill();ctx.restore();};
    arr(nxi-84,JR+138,-.61);arr(nxo+82,-JR-130,-.75);}
  ctx.restore();
  if(s.boil>.6&&s.lit){ctx.save();ctx.setLineDash([3,14]);ctx.lineDashOffset=-t*110;ctx.strokeStyle='#ffffff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(fcx,armY-4);ctx.lineTo(fcx+nw,armY);ctx.lineTo(...at(0));ctx.lineTo(...at(s.cool?.45:1));ctx.stroke();ctx.restore();
    if(s.cool)for(let i=0;i<5;i++){const f=.5+((t*.35+i*.11)%.5);const p=at(f,IR-2.5);ctx.fillStyle='rgba(120,180,210,.9)';ctx.beginPath();ctx.arc(p[0],p[1],2.4,0,TAU);ctx.fill();}}
  // 冷凝管夹（右侧铁架台）
  const cp=at(.57);ctx.strokeStyle='#3a3f47';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(560,cp[1]);ctx.lineTo(cp[0],cp[1]);ctx.stroke();ctx.fillStyle='#55504a';ctx.save();ctx.translate(cp[0],cp[1]);ctx.rotate(Math.atan2(dy,dx));rr(ctx,-10,-JR-5,20,8,2);ctx.fill();rr(ctx,-10,JR-3,20,8,2);ctx.fill();ctx.restore();
  rr(ctx,551,cp[1]-10,18,20,3);ctx.fillStyle=metal(ctx,551,0,569,0,true);ctx.fill();
  // 胶塞（冷凝管两端）
  [[at(.02),0],[at(.985),0]].forEach(([p])=>{ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(Math.atan2(dy,dx));ctx.fillStyle='#2c2b2e';rr(ctx,-8,-11,16,22,3);ctx.fill();ctx.restore();});
  // 牛角管 + 锥形瓶
  const fx=790,fb=612,fh=150,fw=150,mouthY=fb-fh,mw=34;
  const cone=()=>{ctx.beginPath();ctx.moveTo(fx-mw/2,mouthY);ctx.lineTo(fx-mw/2,mouthY+30);ctx.lineTo(fx-fw/2,fb-8);ctx.quadraticCurveTo(fx-fw/2,fb,fx-fw/2+10,fb);ctx.lineTo(fx+fw/2-10,fb);ctx.quadraticCurveTo(fx+fw/2,fb,fx+fw/2,fb-8);ctx.lineTo(fx+mw/2,mouthY+30);ctx.lineTo(fx+mw/2,mouthY);};
  cone();ctx.fillStyle=GL_F;ctx.fill();
  const vol=s.vol||0;if(vol>0){ctx.save();cone();ctx.clip();const ly=fb-4-Math.min(1,vol/15)*58;ctx.fillStyle=waterCol(0,{a:1.3});ctx.fillRect(fx-fw/2,ly,fw,fb-ly);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx-fw/2,ly);ctx.lineTo(fx+fw/2,ly);ctx.stroke();ctx.restore();
    if(s.drip){const ph=(t*2.2)%1;drop(ctx,fx,lerp(mouthY+28,ly-4,ph*ph),3.5,waterCol(0,{a:1.6}));}}
  cone();ctx.strokeStyle=GL_S;ctx.lineWidth=2.2;ctx.stroke();glassHi(ctx,fx+fw*.28,fb-20,fx+mw*.3,mouthY+40,3,.7);
  const ad=new Path2D(`M${C1[0]-ux*4} ${C1[1]-uy*4} L${C1[0]+ux*34} ${C1[1]+uy*34} Q${fx} ${C1[1]+uy*34+10} ${fx} ${mouthY+26}`);
  ctx.save();ctx.lineCap='round';ctx.strokeStyle=GL_S;ctx.lineWidth=16;ctx.stroke(ad);ctx.strokeStyle='rgba(236,246,251,.97)';ctx.lineWidth=12;ctx.stroke(ad);ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.translate(-3,-2);ctx.stroke(ad);ctx.restore();
  if(s.escape&&!LOW){for(let i=0;i<6;i++){const ph=(t*.5+i/6)%1;ctx.fillStyle=`rgba(255,255,255,${.7*(1-ph)})`;ctx.beginPath();ctx.arc(fx+Math.sin(t*2+i)*14,mouthY-ph*90,8+ph*16,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(150,170,190,${.4*(1-ph)})`;ctx.stroke();}}
  // 标注
  if(s.labels!==false){const lab=(p,tx,ty,str,col)=>callout(ctx,p[0],p[1],tx,ty,str,{col,size:15});
    lab(inP,inP[0]+70,inP[1]+50,'冷水进（下口）','#2f6fb0');lab(outP,outP[0]+120,outP[1]-20,'水出（上口）','#2f6fb0');
    lab([fcx+5,thT+20],fcx+70,thT,'温度计',INK);lab([fcx,armY],fcx-110,armY-40,'水银球在支管口处',INK);lab(at(.3,JR),at(.3)[0]-10,at(.3)[1]+110,'冷凝管',INK);lab([fx+fw*.3,fb-30],fx+fw*.5+10,fb-90,'锥形瓶',INK);lab([fcx-FR*.8,fcy+20],fcx-130,fcy+60,'沸石防暴沸',INK);}
  // 进水管末端接水龙头（可点击通水）
  const he=[nxi-70,JR+128],tap=[C0[0]+he[0]*Math.cos(ang)-he[1]*Math.sin(ang),C0[1]+he[0]*Math.sin(ang)+he[1]*Math.cos(ang)];
  ctx.save();ctx.translate(tap[0]-14,tap[1]+4);rr(ctx,-22,-14,30,22,4);ctx.fillStyle=metal(ctx,-22,0,8,0);ctx.fill();rr(ctx,-28,-20,10,34,3);ctx.fillStyle=metal(ctx,-28,0,-18,0,true);ctx.fill();
  ctx.fillStyle=s.cool?'#2f6fb0':'#c4492f';rr(ctx,-14,-26,14,8,3);ctx.fill();ctx.restore();
  ctx.restore();return{flask:[fcx,fcy,FR],tap:[tap[0]-20,tap[1]],cone:[790,540]};}

S.distill=(()=>{const cv=$('#cvDist');let t=0;const host=$('[data-id="distill"] .stage');
  let s,log,paid=false,bumpT=0,super_=0,msgT=0;
  const LOG=['加水约 1/3 体积','加入几粒沸石','先通冷凝水（下进上出）','加热至沸腾','弃去开始馏出的液体','收集约 10 mL 后停止加热'];
  function reset(){s={water:0,stones:false,lit:false,cap:true,temp:20,vol:0,first:true,bump:0,boil:0,cool:false,drip:false,escape:false,t:0,dumped:false,stopped:false,bumped:false};log=LOG.map(()=>0);paid=false;bumpT=0;super_=0;msgT=0;renderLog();stampOff(host);
    setSt($('#diSt'),'','可以点下方按钮，也可以直接动手：把自来水、沸石拖进烧瓶，点水龙头通冷凝水，点酒精灯点火。');ui();}
  function renderLog(){$('#diLog').innerHTML=LOG.map((x,i)=>`<li class="${log[i]===1?'ok':log[i]===2?'ng':''}"><em>${log[i]===1?'✓':log[i]===2?'✗':i+1}</em><span>${x}</span></li>`).join('');}
  function ui(){$('#diWater').disabled=s.water>0||s.waterA;$('#diStone').disabled=s.stones;$('#diCool').disabled=s.cool;$('#diFire').disabled=s.lit;$('#diDump').disabled=!s.vol;$('#diStop').disabled=!s.lit;}
  const st=$('#diSt');
  $('#diWater').onclick=()=>{s.waterA=1;sfx('drop');log[0]=1;renderLog();setSt(st,'','烧瓶中加入约 1/3 体积的自来水。');ui();};
  $('#diStone').onclick=()=>{if(s.temp>50){sfx('bad');setSt(st,'bad','<b>液体温度很高，不能直接补加沸石！</b>要停止加热，等液体冷却后再加。');return;}s.stones=true;sfx('pop');log[1]=1;renderLog();setSt(st,'ok','加入几粒沸石（或碎瓷片），作用：<b>防止暴沸</b>。');ui();};
  $('#diCool').onclick=()=>{s.cool=true;s.escape=false;sfx('whoosh');if(!log[2])log[2]=s.lit?2:1;renderLog();setSt(st,s.lit?'warn':'ok',s.lit?'冷凝水通上了。注意：应该<b>先通冷凝水，再加热</b>。':'冷凝水从<b>下口进、上口出</b>，冷水充满冷凝管，冷凝效果好。');ui();};
  $('#diFire').onclick=()=>{if(!s.water){sfx('bad');setSt(st,'bad','烧瓶里还没有水，不能空烧！先 ① 加水。');return;}
    if(s.bumped&&!s.stones){sfx('bad');setSt(st,'bad','暴沸过一次了！先等液体冷却，再 ② 补加沸石。');return;}
    s.lit=true;s.cap=false;s.stopped=false;stampOff(host);sfx('whoosh');if(!s.cool&&!log[2]){log[2]=2;renderLog();}
    setSt(st,'warn',!s.cool?'还没通冷凝水就加热了，注意观察锥形瓶……':s.stones?'用酒精灯外焰加热，观察温度计和烧瓶中的现象……':'没加沸石就开始加热了，注意观察……');ui();};
  $('#diDump').onclick=()=>{if(s.vol<=0)return;const early=!s.dumped;s.vol=0;s.first=false;s.dumped=true;log[4]=1;renderLog();sfx('drop');
    setSt(st,'ok',early?'<b>弃去开始馏出的液体</b>：它可能溶有易挥发的杂质。换上洁净的锥形瓶继续收集。':'倒掉了，重新收集。');ui();};
  $('#diStop').onclick=()=>{s.lit=false;s.cap=true;s.stopped=true;sfx('click');
    if(s.vol>=8&&s.dumped)log[5]=1;else if(s.boil>.5||s.vol>0)log[5]=2;if(!s.dumped&&s.vol>0)log[4]=2;renderLog();
    if(log.every(v=>v===1)){if(!paid){teamAdd(5);paid=true;}sfx('win');FX.confetti();stampOn(host,'蒸馏水 ✓',true,'80%','30%');setSt(st,'ok',`<b>实验成功！</b>用灯帽盖灭酒精灯，稍后再停止通冷凝水。收集到的蒸馏水是<b>纯净物</b>。${tname(TEAM.cur)} +5`);}
    else if(s.vol>0&&!s.dumped)setSt(st,'bad','<b>没有弃去开始馏出的液体</b>，收集到的水可能含杂质。点“重新实验”再做一次。');
    else if(log[2]===2)setSt(st,'bad','操作顺序有误：应<b>先通冷凝水，再加热</b>。点“重新实验”按正确顺序再做一次。');
    else if(s.vol<8&&!s.bumped)setSt(st,'warn','用灯帽盖灭酒精灯。收集的蒸馏水还不够 10 mL，可以重新点燃继续。');
    else setSt(st,'','用灯帽盖灭酒精灯。');ui();};
  $('#diReset').onclick=()=>{reset();sfx('click');};
  reset();
  /* 直接操作：自来水、沸石拖进烧瓶；点水龙头、酒精灯、锥形瓶 */
  const Gd={};const toB=(x,y)=>[(x-Gd.ox)/Gd.k,(y-Gd.oy)/Gd.k];const sc=(x,y)=>[Gd.ox+x*Gd.k,Gd.oy+y*Gd.k];
  const cui=canvasUI(cv,{tools:()=>Gd.k?[{id:'water',...xy(905,105),r:36,on:!s.water&&!s.waterA,draw:(c,x,y,d)=>cupIcon(c,x,y-18,'自来水',waterCol(.05,{a:1.2}))},
      {id:'stone',...xy(905,205),r:36,on:!s.stones,draw:(c,x,y,d)=>dishIcon(c,x,y,'沸石')}]:[],
    hots:()=>Gd.k?[{hit:(x,y)=>{const[bx,by]=toB(x,y);return Math.abs(bx-250)<70&&by>470&&by<615;},act:()=>$(s.lit?'#diStop':'#diFire').click()},
      {hit:(x,y)=>{const[bx,by]=toB(x,y);return Math.hypot(bx-Gd.geo.tap[0],by-Gd.geo.tap[1])<40;},act:()=>{if(!s.cool)$('#diCool').click();}},
      {hit:(x,y)=>{const[bx,by]=toB(x,y);return Math.abs(bx-790)<75&&by>460&&by<615&&s.vol>0;},act:()=>$('#diDump').click()}]:[],
    onDrop:(id,x,y)=>{const[bx,by]=toB(x,y);if(Math.hypot(bx-250,by-332)>140)return false;$(id==='water'?'#diWater':'#diStone').click();return true;}});
  function xy(bx,by){const[x,y]=sc(bx,by);return{x,y};}
  function tick(dt){t+=dt;s.t=t;if(s.waterA){s.water=Math.min(1,s.water+dt*1.2);if(s.water>=1){s.waterA=0;ui();}}
    if(s.lit){const target=s.stones?100:103;s.temp=Math.min(target,s.temp+dt*(s.temp<90?14:5));}else s.temp=Math.max(20,s.temp-dt*(s.temp>60?8:4));
    s.boil=s.lit?smooth(85,100,s.temp):Math.max(0,s.boil-dt*1.5);
    if(s.lit&&s.temp>=100&&!s.stones&&!s.bumped){super_+=dt;s.boil=.15;if(super_>1.3){s.bumped=true;bumpT=1;s.lit=false;s.cap=true;s.stopped=true;shake();flash('#c4492f');sfx('boom');stampOn(host,'暴沸！',false,'30%','24%');log[1]=2;renderLog();
        setSt(st,'bad','<b>发生暴沸！</b>液体突然剧烈沸腾、冲出，非常危险（已紧急熄灭酒精灯）。<br>原因：没有加沸石。要<b>冷却后补加沸石</b>，再重新加热。');ui();}}
    if(bumpT>0){bumpT=Math.max(0,bumpT-dt*.8);s.bump=Math.sin((1-bumpT)*Math.PI);}else s.bump=0;
    const boiling=s.lit&&s.temp>=100&&s.stones;s.escape=boiling&&!s.cool;
    if(boiling){if(!log[3]){log[3]=1;renderLog();if(s.cool)setSt(st,'','水沸腾，温度计示数约 100 ℃。水蒸气在冷凝管中<b>冷凝</b>成水，流入锥形瓶。注意：<b>开始馏出的液体要弃去</b>。');}
      if(!s.cool&&msgT>=0&&msgT<5){setSt(st,'bad','没通冷凝水：水蒸气得不到冷却，大部分从锥形瓶口<b>逸出</b>，几乎收集不到水！点“通冷凝水”。');msgT=5;}
      s.vol=Math.min(15,s.vol+dt*(s.cool?.55:.04));s.drip=s.cool;
      if(s.cool&&s.dumped&&s.vol>=10&&msgT<99){setSt(st,'warn','已收集约 10 mL 蒸馏水，可以 ⑥ 停止加热了。');msgT=99;}
      if(s.cool&&!s.dumped&&s.vol>=3.5&&msgT>-1&&msgT<99){setSt(st,'warn','开始馏出的液体还没弃去哦！（点 ⑤）');msgT=-1;}}
    else s.drip=false;
    if(!$('#diDump').disabled!==!!s.vol)ui();
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const k=Math.min((w-50)/930,(h-84)/640),ox=(w-930*k)/2-40*k,oy=8;const geo=drawDistill(ctx,ox,oy,k,s);Object.assign(Gd,{ox,oy,k,geo});
    const B=(x,y)=>[ox+x*k,oy+y*k];
    if(!s.cool){const[tx,ty]=B(...geo.tap);trayHint(ctx,tx,ty+34,'点水龙头通水');}
    if(s.water>=1&&!s.lit&&!s.stopped){const[lx,ly]=B(370,520);trayHint(ctx,lx,ly,'← 点酒精灯点火');}
    if(s.lit){const[lx,ly]=B(370,520);trayHint(ctx,lx,ly,'← 点酒精灯可熄灭');}
    cui.draw(ctx);if(!s.water||!s.stones){const[hx,hy]=B(905,262);trayHint(ctx,hx,hy,'拖进烧瓶');}
    if(s.vol>0&&s.first){const p=[ox+(790+10)*k,oy+600*k];callout(ctx,p[0]+20*k,p[1],Math.min(w-130,ox+840*k),oy+410*k,'初馏液 · 应弃去',{col:CIN,size:15,align:'left'});}
    const T=Math.round(s.temp);if($('#diTemp').textContent!=T)$('#diTemp').textContent=T;const V=s.vol.toFixed(1);if($('#diVol').textContent!==V)$('#diVol').textContent=V;const C2=s.cool?'已通':'未通';if($('#diCold').textContent!==C2)$('#diCold').textContent=C2;}
  return{tick};})();
