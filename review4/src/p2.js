/* ================= 5 电解水：水电解器虚拟实验（正极 O₂、负极 H₂，体积比 1∶2） ================= */
S.elec=(()=>{const cv=$('#cvElec');let t=0,on=false,vol=0,tool=0,fx=null,naT=-1,naStep=0;const G={};const LOG=[null,null];const bub=pixParticles();
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
  const ui=canvasUI(cv,{hots:()=>G.tubes?[0,1].map(s=>({hit:(x,y)=>Math.abs(x-G.tubes[s].x)<G.tubes[s].w&&y>G.tubes[s].top-40&&y<G.tubes[s].top+60,act:()=>test(s)})).concat([{hit:(x,y)=>G.pow&&Math.abs(x-G.pow.x)<G.pow.w/2&&Math.abs(y-G.pow.y)<G.pow.h/2,act:()=>$('#elPow').click()}]):[]});
  function tick(dt){t+=dt;if(on&&vol<10)vol=Math.min(10,vol+dt*1.2);if(fx)fx.t+=dt;if(naT>=0)naT+=dt;
    const{ctx,w,h,g,W,H,P,flush}=pxStage(cv,4);
    const cx=Math.round(W*.3),base=Math.round(H*.66),tubeH=Math.round(H*.44),tw=10,gap=30;
    const tubes=[{x:cx-gap,lab:'正极',sign:'+'},{x:cx+gap,lab:'负极',sign:'−'}];
    // 底座与连通管
    pbox(g,cx-gap-18,base,gap*2+36,8,'#ffd23f','#1f2a44',{shadow:false});pr(g,cx-gap,base-5,gap*2,5,'#1f2a44');pr(g,cx-gap+1,base-4,gap*2-2,3,'#7cc8f0');
    // 中间储水管（液面随气体增加而上升）
    const midTop=base-tubeH-8,midLv=Math.round(base-tubeH*.45-vol*1.4);pr(g,cx-5,midTop,10,base-midTop,'#1f2a44');pr(g,cx-4,midTop,8,base-midTop-1,'#eef6ff');pr(g,cx-4,midLv,8,base-midLv-1,'#7cc8f0');pr(g,cx-4,midLv,8,1,'#ffffff');
    pdisc(g,cx,midTop-6,9,'#1f2a44');pdisc(g,cx,midTop-6,8,'#eef6ff');pdisc(g,cx,midTop-4,6,'#7cc8f0');
    tubes.forEach((tb,s)=>{const gas=s?vol*2:vol,gasH=Math.round(gas/20*tubeH*.8),top=base-tubeH,x=tb.x-tw/2;
      pr(g,x-1,top,tw+2,tubeH,'#1f2a44');pr(g,x,top,tw,tubeH,'#ffffff');
      pr(g,x,top+gasH,tw,tubeH-gasH,'#7cc8f0');pr(g,x,top+gasH,tw,1,'#1f9fd6');pr(g,x+1,top+2,1,tubeH-4,'rgba(255,255,255,.8)');
      for(let k=1;k<=10;k++){const yy=top+Math.round(k*2/20*tubeH*.8);pr(g,s?x+tw+1:x-1-(k%5===0?3:2),yy,k%5===0?3:2,1,'#55617f');}
      // 活塞
      pr(g,tb.x-1,top-7,3,7,'#1f2a44');pr(g,tb.x-5,top-5,11,3,'#ff7a5c');
      // 电极
      pr(g,tb.x-1,base-13,3,12,'#3a3a3a');
      if(on&&Math.random()<dt*(s?14:7))bub.add({x:tb.x-2+Math.random()*4,y:base-13,vy:-(20+Math.random()*14),dec:.9,c:'#ffffff',s:1});
      // 导线 → 电源
      const py=base+20;pr(g,tb.x,base+8,1,py-base-8,s?'#1f9fd6':'#e5484d');pr(g,Math.min(tb.x,cx),py,Math.abs(cx-tb.x)+1,1,s?'#1f9fd6':'#e5484d');
      tb.top=top;tb.gasH=gasH;});
    bub.ps.forEach(p=>{const tb=tubes[p.x>cx?1:0];if(p.y<tb.top+tb.gasH+1)p.life=0;});bub.step(dt,g);
    // 电源（学生电源）
    const pw={x:cx,y:base+22,w:34,h:12};pbox(g,pw.x-17,pw.y-4,34,12,on?'#d6f5ef':'#ffffff','#1f2a44',{notch:1,shadow:false});pr(g,pw.x-13,pw.y,4,4,'#e5484d');pr(g,pw.x+9,pw.y,4,4,'#1f9fd6');pr(g,pw.x-3,pw.y,6,4,on?'#1f9d6b':'#8a95ad');
    // 检验效果
    if(fx&&fx.t<1.6){const tb=tubes[fx.side],fy=tb.top-12,q=fx.t;
      if(fx.k!=='none'&&fx.k!=='notool'){const sx=fx.side?tb.x+4:tb.x-26,tip=fx.side?tb.x+2:tb.x-3;pr(g,sx,fy-2,22,2,'#c58b4a');// 木条（从外侧伸向管口）
        if(fx.k==='relight'||fx.k==='brighter'){for(let k=0;k<10;k++)pr(g,tip+Math.random()*5,fy-4-Math.random()*10*Math.min(1,q*3),2,2,['#ffd23f','#ff9a1f','#e5484d'][k%3]);}
        else if(fx.k==='burn'){for(let k=0;k<12;k++)pr(g,tb.x-3+Math.random()*7,fy-2-Math.random()*12,2,2,['#9fd8ff','#5cb8f0','#1f7fd6'][k%3]);}
        else{pr(g,tb.x+3,fy-3,2,2,'#5a5a5a');}}}
    flush();
    const T=s=>tubes[s];G.tubes=tubes.map(tb=>({x:tb.x*P,w:tw*P,top:tb.top*P}));G.pow={x:pw.x*P,y:(pw.y+2)*P,w:34*P,h:14*P};
    tubes.forEach((tb,s)=>{ptxt(ctx,`${tb.lab}（${tb.sign}）`,tb.x*P+(s?78:-78),(base+12)*P,{size:20,col:s?'#1f9fd6':'#e5484d'});
      ptxt(ctx,`${(s?vol*2:vol).toFixed(1)} mL`,tb.x*P+(s?72:-72),(tb.top+10)*P,{size:18,col:'#1f2a44',font:FNUM,weight:700});});
    ptxt(ctx,'电源',(pw.x-24)*P,(pw.y+2)*P,{size:18,col:'#55617f'});
    if(fx&&fx.t<1.6){const s=fx.side,msg={none:'气体太少，先通电一会儿',notool:'先在下方选择一种木条',relight:'木条复燃！',brighter:'燃烧更旺！',burn:'气体燃烧，淡蓝色火焰',out:'木条没有复燃'}[fx.k];ptxt(ctx,msg,T(s).x*P+(s?50:-50),(T(s).top-30)*P,{size:20,col:'#e69500'});}
    // 右侧记录卡
    const rx=w*.6,ry=h*.12,rw=w*.36,rh=h*.56;ctx.save();ctx.fillStyle='#1f2a44';rr(ctx,rx+5,ry+5,rw,rh,16);ctx.fill();ctx.fillStyle='#ffffff';rr(ctx,rx,ry,rw,rh,16);ctx.fill();ctx.strokeStyle='#1f2a44';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();
    ptxt(ctx,'实验记录',rx+rw/2,ry+30,{size:24,col:'#1f2a44',sh:null});
    [['正极',vol,LOG[0],'#e5484d'],['负极',vol*2,LOG[1],'#1f9fd6']].forEach(([n,v,lg,c],k)=>{const y=ry+80+k*rh*.34;ptxt(ctx,`${n}：${v.toFixed(1)} mL`,rx+22,y,{size:20,col:c,align:'left',font:FNUM,weight:700,sh:null});
      wrapTxt(ctx,lg||'点玻璃管顶端的活塞检验气体',rx+22,y+32,rw-44,26,{size:17,col:lg?'#1f9d6b':'#8a95ad'});});
    if(vol>=9.9&&LOG[0]&&LOG[1])ptxt(ctx,'V(正) ∶ V(负) ≈ 1 ∶ 2',rx+rw/2,ry+rh-34,{size:22,col:'#ff7a5c',font:FNUM,weight:900,sh:null});
    // 提升：加了氯化钠
    if(naT>=0){const bx=w*.06,by=h*.08,bw=w*.88,bh=h*.74;ctx.save();ctx.fillStyle='#1f2a44';rr(ctx,bx+6,by+6,bw,bh,18);ctx.fill();ctx.fillStyle='#fffdf3';rr(ctx,bx,by,bw,bh,18);ctx.fill();ctx.strokeStyle='#1f2a44';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();
      ptxt(ctx,'提升：小红在水里加了氯化钠再通电……',w/2,by+40,{size:28,col:'#ff7a5c',sh:null});
      wrapTxt(ctx,'正极附近产生了黄绿色、有刺激性气味的气体——氯气（有毒）。',bx+34,by+92,bw-68,30,{size:20,col:'#6b8a00'});
      const QA=[['① 还能用这个实验说明水的组成吗？','不能。氯化钠参与了反应，生成了氯气，影响实验结果。'],['② 想增强水的导电性，应该加什么？','加少量硫酸钠或氢氧化钠，不能加氯化钠。'],['③ 实验中有氯气生成，要注意什么？','氯气有毒：注意通风，不要直接闻，做好尾气处理。']];
      QA.forEach(([q,a],k)=>{const y=by+160+k*88;ptxt(ctx,q,bx+34,y,{size:21,col:'#1f2a44',align:'left',font:FNUM,weight:700,sh:null});ptxt(ctx,k<naStep?a:'（点“提升”按钮揭晓）',bx+60,y+34,{size:19,col:k<naStep?'#1f9d6b':'#8a95ad',align:'left',font:FNUM,weight:700,sh:null});});}
    else if(!on&&vol===0)ptxt(ctx,'点电源（或“接通电源”）开始电解',cx*P,h*.07,{size:20,col:'#55617f'});}
  const qp=qPanel($('#elQ'),QB.elec,{src:'电解水'});
  $('#elReset').onclick=()=>{on=false;vol=0;tool=0;fx=null;naT=-1;LOG[0]=LOG[1]=null;bub.clear();$('#elPow').textContent='接通电源';setTool(-1);tool=0;$('#elT1').setAttribute('aria-pressed','false');$('#elT2').setAttribute('aria-pressed','false');qp.reset();};
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
S.h2=(()=>{const cv=$('#cvH2');let t=0,demo=null;const sp=pixParticles();
  $('#hyImp').onclick=()=>{demo={pure:false,t:0,snd:false};sfx8('blip');};$('#hyPure').onclick=()=>{demo={pure:true,t:0,snd:false};sfx8('blip');};
  function tick(dt){t+=dt;if(demo)demo.t+=dt;const{ctx,w,h,g,W,H,P,flush}=pxStage(cv,4);
    // 左：氢气角色卡
    const cx=Math.round(W*.25),cy=Math.round(H*.32);pbox(g,cx-34,cy-24,68,H*.82-cy+24,'#f7f9fd','#1f2a44');
    const bob=Math.round(Math.sin(t*3));pdisc(g,cx-6,cy+bob,9,'#1f2a44');pdisc(g,cx+6,cy+bob,9,'#1f2a44');pdisc(g,cx-6,cy+bob,8,'#cfe8f7');pdisc(g,cx+6,cy+bob,8,'#cfe8f7');pr(g,cx-10,cy-5+bob,3,2,'#ffffff');pr(g,cx+2,cy-5+bob,3,2,'#ffffff');
    pr(g,cx-8,cy-2+bob,2,3,'#1f2a44');pr(g,cx+6,cy-2+bob,2,3,'#1f2a44');pr(g,cx-2,cy+3+bob,4,1,'#e5484d');pr(g,cx-10,cy+1+bob,2,1,'#ff9aa8');pr(g,cx+9,cy+1+bob,2,1,'#ff9aa8');
    // 右：验纯（试管口向下靠近酒精灯火焰）
    const lx=Math.round(W*.66),ly=Math.round(H*.74);
    pdisc(g,lx,ly+4,15,'#1f2a44');pdisc(g,lx,ly+4,14,'#eef6ff');pr(g,lx-16,ly+5,32,14,'#ffffff');pr(g,lx-15,ly+10,30,8,'#fbe9a8');pr(g,lx-16,ly+18,32,2,'#1f2a44');pr(g,lx-16,ly+4,1,15,'#1f2a44');pr(g,lx+15,ly+4,1,15,'#1f2a44');// 灯身
    pr(g,lx-5,ly-12,10,6,'#1f2a44');pr(g,lx-4,ly-11,8,5,'#8a95ad');pr(g,lx-1,ly-16,2,4,'#3a3a3a');// 灯帽座 + 灯芯
    const fl=Math.round(Math.sin(t*18)*1.2);pr(g,lx-4,ly-26-fl,8,10+fl,'#ffb000');pr(g,lx-3,ly-30-fl,6,6,'#ff7a5c');pr(g,lx-2,ly-21,4,5,'#fff3c4');pr(g,lx-1,ly-33-fl,2,3,'#ff7a5c');
    let tx=lx+40,ty=ly-56;if(demo){const q=Math.min(1,demo.t/1);tx=lx+40-40*ease(q);ty=ly-56+18*ease(q);}
    pr(g,tx-6,ty-44,13,45,'#1f2a44');pr(g,tx-5,ty-44,11,44,'#eef6ff');pr(g,tx-3,ty-41,2,36,'#ffffff');pr(g,tx+6,ty-36,8,6,'#ffd9bb');pr(g,tx+6,ty-36,8,1,'#1f2a44');pr(g,tx+6,ty-31,8,1,'#1f2a44');// 试管（管口向下）+ 拇指
    if(demo&&demo.t>1&&!demo.snd){demo.snd=true;if(demo.pure){sfx('pop');for(let k=0;k<10;k++)sp.add({x:tx,y:ty,vx:(Math.random()-.5)*24,vy:-10-Math.random()*12,dec:1.4,c:'#9fd8ff',s:2});}
      else{sfx8('hit');sfx('boom');shake();for(let k=0;k<46;k++){const a=Math.random()*Math.PI*2,v=30+Math.random()*70;sp.add({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,dec:1.3,c:['#ffd23f','#ff9a1f','#ff7a5c','#ffffff'][k%4],s:3,shrink:true});}}}
    if(demo&&!demo.pure&&demo.t>1&&demo.t<1.6){const q=(demo.t-1)/.6,r=8+q*40;pring(g,tx,ty,r,'#ff7a5c',2);pring(g,tx,ty,r*.7,'#ffd23f',2);}
    if(demo&&!demo.pure&&demo.t>1&&demo.t<1.15){g.fillStyle='rgba(255,210,63,.35)';g.fillRect(0,0,W,H);}
    sp.step(dt,g);flush();
    const props=[['密度','最小的气体'],['溶解性','难溶于水'],['颜色气味','无色无味'],['可燃性','燃烧：淡蓝色火焰，生成水'],['收集','排水法 ✓  向下排空气法 ✓']];
    ptxt(ctx,'氢气 H₂ 档案',cx*P,(cy-16)*P,{size:24,col:'#1f2a44',sh:null});
    props.forEach(([k,v],i)=>{const y=(cy+16)*P+i*46;ptxt(ctx,k,(cx-30)*P,y,{size:16,col:'#55617f',align:'left',font:FNUM,weight:700,sh:null});ptxt(ctx,v,(cx-30)*P,y+22,{size:17,col:'#1f2a44',align:'left',font:FNUM,weight:700,sh:null});});
    ptxt(ctx,'点燃前一定要验纯',lx*P,(H*.09)*P,{size:24,col:'#ff6fa8'});
    if(demo&&!demo.pure&&demo.t>1&&demo.t<2.2){const k=Math.min(1,(demo.t-1)*5);ptxt(ctx,'砰！',(tx+26)*P,(ty-30)*P,{size:Math.round(30+30*k),col:'#ff7a5c',sh:'#1f2a44',d:3,font:FNUM,weight:900});}
    if(demo&&demo.t>1){ptxt(ctx,demo.pure?'“噗”——声音很小：氢气较纯':'尖锐爆鸣声！氢气不纯',lx*P,(H*.18)*P,{size:22,col:demo.pure?'#1f9d6b':'#e5484d'});}
    else ptxt(ctx,'收集一试管氢气，管口向下，移近火焰',lx*P,(H*.18)*P,{size:17,col:'#55617f',font:FNUM,weight:700,sh:null});}
  const qp=qPanel($('#hyQ'),QB.h2,{src:'氢气'});
  $('#hyReset').onclick=()=>{demo=null;sp.clear();qp.reset();};
  return{tick};})();

/* ================= 7 微观分类站：微观图放进 单质 / 化合物 / 混合物 ================= */
S.cls=(()=>{const CARDS=[[[['A2',6]],0],[[['AB',6]],1],[[['A2',3],['B2',3]],2],[[['B',8]],0],[[['AB2',5]],1],[[['A2',3],['AB',3]],2]];
  const BINS=['单质','化合物','混合物'];let put=CARDS.map(()=>-1),pick=-1,done=false;const st=$('#csSt'),bins=$('#csBins'),tray=$('#csTray');
  function render(){bins.innerHTML=BINS.map((b,k)=>`<div class="bin" data-b="${k}"><h4>${b}</h4><div class="bslots">${CARDS.map((c,i)=>put[i]===k?`<button class="mc in${done?(c[1]===k?' ok':' no'):''}" data-i="${i}"><canvas></canvas>${done&&c[1]!==k?`<em class="fixl">应为${BINS[c[1]]}</em>`:''}</button>`:'').join('')}</div></div>`).join('');
    tray.innerHTML=CARDS.map((c,i)=>put[i]<0?`<button class="mc${pick===i?' sel':''}" data-i="${i}"><canvas></canvas></button>`:'').join('')||'<span class="hint">都分好了，点“提交”</span>';
    $$('.mc',$('[data-id="cls"]')).forEach(b=>{const i=+b.dataset.i,c=b.querySelector('canvas');requestAnimationFrame(()=>{const{ctx,w,h}=fitS(c);drawMicro(ctx,4,4,w-8,h-8,CARDS[i][0],i+3,{frame:false});});
      b.onclick=e=>{e.stopPropagation();if(done)return;if(put[i]>=0){put[i]=-1;sfx8('blip');}else{pick=pick===i?-1:i;sfx8('select');}render();};});
    $$('.bin',bins).forEach(b=>b.onclick=()=>{if(done||pick<0)return;put[pick]=+b.dataset.b;pick=-1;sfx8('coin');render();});}
  $('#csSub').onclick=()=>{if(done)return;if(put.some(x=>x<0)){setSt(st,'warn','还有微观图没有分类');return;}done=true;const tm=TEAM.cur,n=put.filter((b,i)=>b===CARDS[i][1]).length;render();
    if(n===CARDS.length){teamAdd(5,tm);sfx8('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部分对 +5</b>　看分子种类：一种分子是纯净物；再看分子里的原子：同种 → 单质，不同种 → 化合物。`);}
    else{sfx8('jam');setSt(st,'bad',`<b>${tname(tm)}分对 ${n} / ${CARDS.length}，不加分</b>　红框的放错了：先数有几种分子，再看分子由几种原子构成。`);VARS.arm(st,{v:QB.clsTask},'微观分类站');}teamNext();};
  const qp=qPanel($('#csQ'),QB.cls,{src:'物质分类'});
  $('#csReset').onclick=()=>{VARS.disarm(st);put=CARDS.map(()=>-1);pick=-1;done=false;render();setSt(st,'','○ 和 ● 表示两种不同的原子。先点图，再点分类框。');qp.reset();};
  render();
  notes('cls','物质的分类',['混合物：由<mark>两种或两种以上</mark>物质混合而成；纯净物：只由<mark>一种</mark>物质组成。','单质：由同种元素组成的<mark>纯净物</mark>；化合物：由不同种元素组成的<mark>纯净物</mark>。','氧化物：由两种元素组成、其中一种是氧元素的<mark>化合物</mark>。','看微观图：先数<mark>分子种类</mark>，再看分子里<mark>原子种类</mark>。'],
    '含氧元素的化合物不一定是氧化物（如 KMnO₄）；由同种元素组成的物质不一定是单质（如 O₂ 和 O₃ 混合）。',
    (ctx,w,h)=>{const top=26;const box=(x,label,spec,seed)=>{drawMicro(ctx,x,top,110,90,spec,seed);txt(ctx,label,x+55,top+112,{size:16,weight:700,col:PEN.ink});};
      box(14,'单质',[['A2',5]],2);box(w/2-55,'化合物',[['AB',5]],4);box(w-124,'混合物',[['A2',3],['B2',3]],6);
      ctx.strokeStyle=PEN.ink;ctx.lineWidth=2;const y=top+150;ctx.strokeRect(30,y,w-60,150);txt(ctx,'物质',w/2,y+22,{size:18,weight:700,col:PEN.ink});
      ctx.strokeRect(40,y+40,(w-90)*.62,100);txt(ctx,'纯净物',40+(w-90)*.31,y+58,{size:16,weight:700,col:PEN.blue});ctx.strokeRect(50+(w-90)*.62,y+40,(w-90)*.38,100);txt(ctx,'混合物',50+(w-90)*.81,y+90,{size:16,weight:700,col:PEN.red});
      ctx.strokeRect(50,y+72,(w-90)*.28,58);txt(ctx,'单质',50+(w-90)*.14,y+100,{size:15,weight:700,col:PEN.green});ctx.strokeRect(58+(w-90)*.28,y+72,(w-90)*.32,58);txt(ctx,'化合物',58+(w-90)*.44,y+86,{size:15,weight:700,col:PEN.green});
      ctx.setLineDash([4,3]);ctx.strokeRect(66+(w-90)*.28,y+96,(w-90)*.26,28);ctx.setLineDash([]);txt(ctx,'氧化物',66+(w-90)*.41,y+110,{size:13,weight:700,col:PEN.gold});});
  return{};})();
