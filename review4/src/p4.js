/* ================= 12 竞赛：街机对战（答对放技能攻击对方；答错技能卡壳、摔倒） ================= */
S.fight=(()=>{const cv=$('#cvFight'),world=pixWorld(320,180),g=world.g,parts=pixParticles();let t=0,bgc=null;
  const HP=60,GY=150,POS={r:86,b:234},KIND={r:'fire',b:'water'};
  const F={r:{st:'idle',t:0,hp:HP,disp:HP},b:{st:'idle',t:1.3,hp:HP,disp:HP}};
  let qi=0,phase='ask',proj=null,banner=null,pops=[],shakeT=0,flashT=0,winner=null,curTm='r',order=[];const card=$('#fgCard');
  const Q=QB.fight,tag=tm=>`<span class="teamTag ${tm}">${tname(tm)}</span>`;
  /* 静态背景：晴天色带、像素太阳与云、薄荷色山丘、湖面、砂岩擂台、两侧旗杆（贴纸配色） */
  const SKY='#cfe8f7',FLOOR='#f3e2b8';
  function paintBG(){bgc=document.createElement('canvas');bgc.width=320;bgc.height=180;const b=bgc.getContext('2d');
    ['#cfe8f7','#d8edf9','#e1f2fb','#eaf6fd','#f1f9fe','#f6fbff'].forEach((c,i)=>{b.fillStyle=c;b.fillRect(0,i*18,320,18);});
    // 太阳：描边圆 + 光芒
    const disc=(cx,cy,r,c)=>{b.fillStyle=c;for(let y=-r;y<=r;y++){const hw=Math.floor(Math.sqrt(r*r-y*y));b.fillRect(cx-hw,cy+y,hw*2+1,1);}};
    disc(262,36,15,'#1f2a44');disc(262,36,14,'#ffd23f');disc(258,32,5,'#fff3c4');
    b.fillStyle='#ffb000';[[0,-21],[0,21],[-21,0],[21,0],[-15,-15],[15,-15],[-15,15],[15,15]].forEach(([dx,dy])=>b.fillRect(262+dx-1,36+dy-1,3,3));
    // 云
    const cloud=(x,y)=>{const B=[[0,6,6],[9,3,8],[19,6,6],[12,8,6]];B.forEach(([dx,dy,r])=>disc(x+dx,y+dy,r+1,'#1f2a44'));b.fillStyle='#1f2a44';b.fillRect(x-1,y+7,22,6);B.forEach(([dx,dy,r])=>disc(x+dx,y+dy,r,'#ffffff'));b.fillStyle='#ffffff';b.fillRect(x,y+7,20,5);b.fillStyle='#e1f2fb';b.fillRect(x+1,y+10,18,2);};
    cloud(64,50);cloud(176,40);
    const mt=(base,amp,col,edge,s)=>{for(let x=0;x<320;x++){const y=Math.round(base-Math.abs(Math.sin(x*.025+s)*amp+Math.sin(x*.07+s*2)*amp*.4));b.fillStyle=edge;b.fillRect(x,y,1,1);b.fillStyle=col;b.fillRect(x,y+1,1,base+30-y);}};
    mt(112,24,'#9fe0cf','#1f2a44',1);mt(118,14,'#63c7b2','#1f2a44',3);
    b.fillStyle='#1f2a44';b.fillRect(0,117,320,1);b.fillStyle='#7cc8f0';b.fillRect(0,118,320,22);b.fillStyle='#5cb8f0';for(let y=121;y<140;y+=4)b.fillRect(0,y,320,1);
    // 擂台（砂岩砖）
    b.fillStyle=FLOOR;b.fillRect(0,140,320,40);b.fillStyle='#e3cc97';for(let y=140;y<180;y+=8){b.fillRect(0,y+7,320,1);for(let x=((y/8)%2?8:0);x<320;x+=16)b.fillRect(x,y,1,8);}
    b.fillStyle='#1f2a44';b.fillRect(0,139,320,2);b.fillStyle='#ffd23f';b.fillRect(0,141,320,2);
    [20,300].forEach(x=>{b.fillStyle='#1f2a44';b.fillRect(x-2,84,4,56);b.fillStyle='#ffffff';b.fillRect(x-1,85,2,54);});}
  function bgAnim(){// 湖面波光、云影漂移、旗帜飘动
    for(let k=0;k<5;k++){const x=((k*71+t*12)%340)-10,y=122+(k%3)*5;pr(g,x,y,8,1,'#ffffff');}
    [[20,'#ff7a5c',1],[300,'#1f9fd6',-1]].forEach(([x,c,d])=>{for(let i=0;i<14;i++){const yy=86+Math.round(Math.sin(t*6+i*.6)*1.5);const hh=Math.max(1,8-Math.floor(i/2));pr(g,x+d*(2+i)-(d<0?1:0),yy+(8-hh)/2,1,hh,c);}});}
  function hand(tm){const f=F[tm],dir=tm==='r'?1:-1;return[POS[tm]+dir*24,GY-34];}
  /* 判分后：答对 → 放技能；答错 → 卡壳摔倒 */
  function act(tm,ok,ult){const op=tm==='r'?'b':'r';phase='anim';
    if(ok){F[tm].st='attack';F[tm].t=0;sfx8(ult?'charge':'slash');
      setTimeout(()=>{const[hx,hy]=hand(tm);proj={tm,op,x:hx,y:hy,dir:tm==='r'?1:-1,kind:KIND[tm],ult,t:0};sfx8(KIND[tm]==='fire'?'fire':'water');if(ult){banner={txt:`必杀！${HEROES[KIND[tm]].ult}`,t:0,col:tm==='r'?'#e5484d':'#1f9fd6'};flashT=.25;}},300);}
    else{F[tm].st='jam';F[tm].t=0;sfx8('charge');setTimeout(()=>{sfx8('jam');const[hx,hy]=hand(tm);for(let k=0;k<16;k++)parts.add({x:hx,y:hy-8,vx:(Math.random()-.5)*30,vy:-10-Math.random()*20,dec:.8,c:k%2?'#8a95ad':'#8a95ad',s:3,shrink:true});pops.push({txt:'卡壳！',tm,t:0,col:'#e69500'});},500);
      setTimeout(()=>sfx8('fall'),760);setTimeout(()=>{if(phase==='anim')phase='ask';showNext();},2300);}}
  function impact(p){const d=F[p.op],dmg=p.ult?20:10;d.hp=Math.max(0,d.hp-dmg);d.st='hit';d.t=0;shakeT=p.ult?.5:.3;flashT=Math.max(flashT,.08);sfx8('hit');if(p.kind==='water')sfx8('splash');
    pops.push({txt:`-${dmg}`,tm:p.op,t:0,col:'#e5484d',big:p.ult});
    const n=p.ult?60:30;for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,v=30+Math.random()*(p.ult?110:70);
      parts.add(p.kind==='fire'?{x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,g:60,dec:1.3,c:['#ffffff','#e69500','#ff9a1f','#e5484d'][k%4],s:2,shrink:true}
        :{x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,g:160,dec:1,c:['#ffffff','#b8f6ff','#1f9fd6','#2a62c9'][k%4],s:2,shrink:true});}
    if(d.hp<=0){setTimeout(()=>end(p.tm,true),500);}else setTimeout(()=>{if(phase==='anim')phase='ask';showNext();},700);}
  function end(w,ko=true){if(winner)return;winner=w||'draw';phase='end';const l=w?(w==='r'?'b':'r'):null;
    if(w){F[w].st='win';F[w].t=0;if(ko){F[l].st='ko';F[l].t=0;}teamAdd(20,w);sfx8(ko?'ko':'win');setTimeout(()=>{sfx8('win');FX.confetti();},900);banner={txt:ko?'K.O.':'判定胜',t:0,col:'#ffd23f',big:true,end:true};}
    else{banner={txt:'平局',t:0,col:'#ffd23f',big:true,end:true};}
    card.innerHTML=`<div class="qmeta"><span class="tag">比赛结束</span></div><div class="qtext" style="font-size:26px">${w?`${tag(w)} 获胜！`:'两队打成平手！'}</div>
      <p class="hint">${w?(ko?`${HEROES[KIND[w]].name}把对手打倒，额外 +20。`:`题目答完，${HEROES[KIND[w]].name}血量领先，判定获胜，额外 +20。`):'题目答完时血量相同。'}</p>
      <div class="fres">${order.map(([i,ok,tm])=>`<span class="${ok?'ok':'no'} ${tm}"><b>${i+1}</b>${ok?'命中':'卡壳'}</span>`).join('')}</div><p class="hint">答错的题已记入小结页“错题回顾”，可以再练变式。</p>`;}
  function ask(){if(winner)return;if(qi>=Q.length){const r=F.r.hp,b=F.b.hp;end(r>b?'r':b>r?'b':null,false);return;}phase='ask';curTm=TEAM.cur;const q=Q[qi],ult=(q.pts||10)>10;
    card.innerHTML=`<div class="qmeta">${tag(curTm)}<span class="tag ${ult?'m':'c'}">第 ${qi+1} / ${Q.length} 题 · ${q.pts||10} 分${ult?' · 必杀技':''}</span><span class="hint">${HEROES[KIND[curTm]].name}出招</span></div><div class="fq"></div>`;
    const my=qi,v=qView($('.fq',card),q,{pts:q.pts||10,head:'',onJudge:(ok)=>{order.push([my,ok,curTm]);if(!ok)VARS.arm(v.stem,q,`对战 第 ${my+1} 题`);act(curTm,ok,ult);}});}
  function showNext(){if(winner||phase!=='ask'||$('.fnext',card))return;const r=document.createElement('div');r.className='row fnext';r.innerHTML='<button class="btn pri sm">下一题 ▶</button>';card.appendChild(r);
    $('button',r).onclick=()=>{qi++;ask();sfx8('select');};}
  function reset(){qi=0;phase='ask';proj=null;banner={txt:'ROUND 1 · FIGHT!',t:0,col:'#ffd23f',big:true};pops=[];winner=null;order=[];parts.clear();
    ['r','b'].forEach(k=>{F[k].st='idle';F[k].hp=HP;F[k].disp=HP;});teamSet('r');stampOff($('[data-id="fight"] .stage'));ask();}
  function step(dt){['r','b'].forEach(k=>{const f=F[k];f.t+=dt;f.disp=lerp(f.disp,f.hp,1-Math.exp(-dt*5));
      if(f.st==='attack'&&f.t>.95){f.st='idle';f.t=0;}if(f.st==='hit'&&f.t>.6){f.st=f.hp<=0?'ko':'idle';f.t=0;}if(f.st==='jam'&&f.t>2.3){f.st='idle';f.t=0;}});
    if(proj){proj.t+=dt;proj.x+=proj.dir*(proj.ult?200:240)*dt;const tx=POS[proj.op];
      // 拖尾
      for(let k=0;k<(proj.ult?6:3);k++)parts.add(proj.kind==='fire'?{x:proj.x-proj.dir*4,y:proj.y+(Math.random()-.5)*14,vx:-proj.dir*20,vy:(Math.random()-.5)*10,dec:2,c:['#e69500','#ff9a1f','#e5484d'][k%3],s:2,shrink:true}
        :{x:proj.x-proj.dir*4+(Math.random()-.5)*6,y:proj.y+(Math.random()-.5)*12,vx:-proj.dir*14,vy:20,g:80,dec:1.6,c:['#b8f6ff','#1f9fd6'][k%2],s:1});
      if((proj.dir>0&&proj.x>=tx-8)||(proj.dir<0&&proj.x<=tx+8)){const p=proj;proj=null;impact(p);}}}
  function drawProj(p){const s=p.ult?1.6:1,x=Math.round(p.x),y=Math.round(p.y);
    if(p.kind==='fire'){// 新月形烈焰斩
      for(let i=-10;i<=10;i++){const yy=y+Math.round(i*s),cx=x+Math.round(p.dir*(10-Math.abs(i)*.7)*s*.8);const len=Math.round((7-Math.abs(i)*.35)*s);
        pr(g,p.dir>0?cx-len:cx,yy,len,1,'#e5484d');pr(g,p.dir>0?cx-len*.6:cx,yy,Math.max(1,len*.6),1,'#ff9a1f');pr(g,p.dir>0?cx-len*.3:cx,yy,Math.max(1,len*.3),1,'#fff3c4');}}
    else{pdisc(g,x,y,7*s,'#2a62c9');pdisc(g,x,y,5.5*s,'#1f9fd6');pdisc(g,x-2,y-2,2*s,'#e9fdff');const a=p.t*14;for(let k=0;k<3;k++){const aa=a+k*2.1;pr(g,x+Math.cos(aa)*10*s,y+Math.sin(aa)*10*s,2,2,'#b8f6ff');}}}
  function tick(dt){t+=dt;step(dt);if(!bgc)paintBG();
    g.drawImage(bgc,0,0);bgAnim();
    // 当前出招方脚下光圈
    if(phase==='ask'&&!winner){const x=POS[curTm],c=curTm==='r'?'#e5484d':'#1f9fd6';for(let k=0;k<3;k++){const q=((t*1.2+k/3)%1);g.globalAlpha=1-q;pring(g,x,GY+1,10+q*16,c);}g.globalAlpha=1;}
    // 阴影 + 角色
    ['r','b'].forEach(k=>{pr(g,POS[k]-14,GY,28,2,'rgba(31,42,68,.25)');});
    ['r','b'].forEach(k=>{const f=F[k];drawHero(g,KIND[k],f.st,f.t,POS[k],GY,1,k==='b');});
    if(proj)drawProj(proj);parts.step(dt,g);
    // 血条（像素）
    [['r',8,1],['b',312,-1]].forEach(([k,x0,dir])=>{const f=F[k],bw=120,x=dir>0?x0:x0-bw;pbox(g,x-2,6,bw+4,10,'#ffffff','#1f2a44',{notch:1,shadow:false});
      const v=Math.round(bw*f.disp/HP),hv=Math.round(bw*f.hp/HP);pr(g,dir>0?x:x+bw-v,8,v,6,'#e69500');pr(g,dir>0?x:x+bw-hv,8,hv,6,f.hp>20?'#1f9d6b':'#e5484d');pr(g,dir>0?x:x+bw-hv,8,hv,1,'#d8ffd8');});
    // 画到屏幕
    const{ctx,w,h}=fitS(cv);ctx.fillStyle=SKY;ctx.fillRect(0,0,w,h/2);ctx.fillStyle=FLOOR;ctx.fillRect(0,h/2,w,h/2);let sx=0,sy=0;if(shakeT>0){shakeT-=dt;sx=(Math.random()-.5)*14;sy=(Math.random()-.5)*10;}
    ctx.save();ctx.translate(sx,sy);const m=blitWorld(ctx,world,w,h);ctx.restore();const X=x=>m.ox+x*m.s,Y=y=>m.oy+y*m.s;
    if(flashT>0){flashT-=dt;ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(0,0,w,h);}
    // 名牌、提示
    ptxt(ctx,`红队 · ${HEROES.fire.name}`,X(8),Y(22)+12,{size:18,col:'#e5484d',align:'left'});ptxt(ctx,`${HEROES.water.name} · 蓝队`,X(312),Y(22)+12,{size:18,col:'#1f9fd6',align:'right'});
    ptxt(ctx,`${Math.ceil(F.r.hp)}`,X(133),Y(11),{size:15,col:'#1f2a44',sh:null,font:FNUM,weight:900,align:'left'});ptxt(ctx,`${Math.ceil(F.b.hp)}`,X(187),Y(11),{size:15,col:'#1f2a44',sh:null,font:FNUM,weight:900,align:'right'});
    ptxt(ctx,`${TEAM.sc.r} : ${TEAM.sc.b}`,w/2,Y(26),{size:24,col:'#1f2a44',font:FNUM,weight:900});
    if(phase==='ask'&&!winner){const x=X(POS[curTm]),y=Y(GY-80)+Math.sin(t*6)*4;ptxt(ctx,'▼ 答题中',x,y,{size:18,col:curTm==='r'?'#e5484d':'#1f9fd6'});}
    // 伤害数字、卡壳字
    pops=pops.filter(p=>{p.t+=dt;if(p.t>1.2)return false;const x=X(POS[p.tm]),y=Y(GY-70)-p.t*50;ctx.save();ctx.globalAlpha=Math.min(1,(1.2-p.t)*3);ptxt(ctx,p.txt,x,y,{size:p.big?46:p.txt.length>2?28:36,col:p.col,sh:'#1f2a44',font:p.txt.startsWith('-')?FNUM:HAND,weight:900,d:3});ctx.restore();return true;});
    // 横幅
    if(banner){banner.t+=dt;const q=banner.t,dur=banner.big?2.2:1.6;if(q>dur&&!banner.end)banner=null;else{const sc=q<.2?.4+q*3:1;ctx.save();ctx.translate(w/2,h*.42);ctx.scale(sc,sc);
      ptxt(ctx,banner.txt,0,0,{size:banner.big?84:40,col:banner.col,sh:'#1f2a44',font:banner.txt.match(/[A-Z.]/)?FNUM:HAND,weight:900,d:6});ctx.restore();
      if(banner.end&&winner!=='draw'&&q>1.2)ptxt(ctx,`${tname(winner)} WIN!`,w/2,h*.42+70,{size:34,col:winner==='r'?'#e5484d':'#1f9fd6',font:FNUM,weight:900,d:4});}}}
  $('#fgReset').onclick=reset;
  let first=true;
  return{tick,enter(){if(first){first=false;reset();sfx8('fight');}}};})();

/* ================= 13 小结：易错点清单 + 错题回顾（变式完成情况） ================= */
S.sum=(()=>{const g=$('#suGrid');
  const COL=[['1-1 水资源及其利用','#1f9fd6',[['水资源','总量多但可利用的淡水少；我国人均约为世界的 1/4'],['过滤','玻璃棒引流；滤液浑浊要查明原因再过滤'],['活性炭','吸附色素和异味，是物理变化；不能杀菌'],['硬水软水','用肥皂水区分：泡沫多、浮渣少的是软水']]],
    ['1-2 水的组成','#1f9d6b',[['电解水','正氧负氢，V(正)∶V(负) ≈ 1∶2'],['结论','水由氢元素和氧元素组成（不是由氢气和氧气组成）'],['氢气','点燃前一定要验纯；密度最小、难溶于水'],['分类','氧化物：两种元素、其中一种是氧元素的化合物']]],
    ['1-3 物质组成的表示','#e69500',[['数字位置','前：个数；右下：原子数；右上：电荷；正上方：化合价'],['化合价','化合物中正、负化合价的代数和为 0；单质为 0'],['质量比','可以不化简，但题目要求最简比时要约分'],['纯度','先由元素质量求纯物质质量，再除以样品质量']]]];
  function render(hideAll=true){g.innerHTML=COL.map(([h,c,items])=>`<div class="scol" style="--tc:${c}"><h4>${h}</h4>${items.map(([q,a])=>`<div class="sitem${hideAll?' hide':''}"><span class="q">${q}</span><span class="a">${a}</span></div>`).join('')}</div>`).join('');
    $$('.sitem',g).forEach(x=>x.onclick=()=>{x.classList.toggle('hide');sfx8('blip');});}
  $('#suAll').onclick=()=>{$$('.sitem',g).forEach((x,i)=>setTimeout(()=>x.classList.remove('hide'),i*80));sfx8('start');};
  $('#suHide').onclick=()=>{$$('.sitem',g).forEach(x=>x.classList.add('hide'));sfx8('blip');};
  render();
  return{enter(){const r=TEAM.sc.r,b=TEAM.sc.b;$('#suScore').innerHTML=`<span class="cm">红队 ${r}</span>　<span style="color:var(--blue);font-weight:700">蓝队 ${b}</span><br><small class="hint">${r===b?'平分秋色！':(r>b?'红队':'蓝队')+'领先'}</small>`;
    const L=VARS.log;$('#suLog').innerHTML=L.length?L.map(e=>`<div class="vrow"><b>${e.src}</b><span>${e.ok.size} / ${e.q.v.length} 道变式做对</span><button class="btn sm">再练</button></div>`).join(''):'<p class="hint">本节还没有答错的题，或者答错后还没做变式。</p>';
    $$('#suLog .vrow button').forEach((b,i)=>b.onclick=()=>VARS.open(L[i].q,L[i].src));}};})();
