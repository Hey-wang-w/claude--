/* ================= 13 竞赛：实验室寻宝（答对挖格子：萌宠加分，垃圾惩罚） =================
   答对 +10（提升题 +20，并多挖 1 格）；红队先答，两队交替，提升题两队各两道。
   20 个格子随机藏着：萌宠（小猫、小狗 +5，仓鼠、兔子 +8，企鹅 +10，稀有熊猫 +20，超稀有招财金猫 +30 = 普通的 6 倍）；
   垃圾（便便：本队 −10；臭袜子：扔给对方，对方 −5；香蕉皮：滑倒，本队下一次挖宝跳过）。 */
S.hunt=(()=>{const cv=$('#cvHunt'),card=$('#htCard');let t=0,G=null,qi=0,phase='ask',digs=0,digger='r',tiles=[],ended=false,pets={r:[],b:[]},skip={r:false,b:false},flash=null;
  const COLS=5,ROWS=4;
  const PET={cat:['小猫',5,'#f2b36b'],dog:['小狗',5,'#c98d5b'],hamster:['仓鼠',8,'#f3c58f'],rabbit:['兔子',8,'#f6f1ea'],penguin:['企鹅',10,'#2f3a4a'],panda:['熊猫',20,'#ffffff'],gold:['招财金猫',30,'#f2c230']};
  const TRASH={poop:['便便','本队 −10'],sock:['臭袜子','对方 −5'],banana:['香蕉皮','下次跳过']};
  function deal(){const bag=[...Array(4).fill('cat'),...Array(3).fill('dog'),'hamster','hamster','rabbit','rabbit','penguin','panda','gold','poop','poop','sock','sock','banana','banana'];
    for(let i=bag.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[bag[i],bag[j]]=[bag[j],bag[i]];}tiles=bag.map(k=>({k,open:0,t0:0,by:null}));}
  /* 萌宠头像（矢量、圆润可爱） */
  function drawPet(ctx,k,x,y,r){const c=PET[k][2],ink='#3a2c24';ctx.save();ctx.translate(x,y);if(k==='rabbit'){ctx.translate(0,r*.3);r*=.82;}// 兔耳长，整体下移、略缩，不顶出格子
    ctx.lineWidth=Math.max(1.4,r*.05);ctx.strokeStyle=ink;
    const ear=(ex,ey,w,h,a,fill)=>{ctx.save();ctx.translate(ex,ey);ctx.rotate(a);ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(0,0,w,h,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();};
    if(k==='cat'||k==='gold'){[[-1],[1]].forEach(([sx])=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(sx*r*.85,-r*.25);ctx.lineTo(sx*r*.62,-r*1.08);ctx.lineTo(sx*r*.18,-r*.7);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#f7a8a8';ctx.beginPath();ctx.moveTo(sx*r*.7,-r*.42);ctx.lineTo(sx*r*.6,-r*.85);ctx.lineTo(sx*r*.34,-r*.62);ctx.closePath();ctx.fill();});}
    if(k==='dog'){ear(-r*.82,-r*.05,r*.28,r*.55,.35,'#8a5a36');ear(r*.82,-r*.05,r*.28,r*.55,-.35,'#8a5a36');}
    if(k==='hamster'){ear(-r*.62,-r*.72,r*.24,r*.22,0,c);ear(r*.62,-r*.72,r*.24,r*.22,0,c);}
    if(k==='rabbit'){ear(-r*.38,-r*1.2,r*.2,r*.62,-.12,c);ear(r*.38,-r*1.2,r*.2,r*.62,.12,c);ctx.fillStyle='#f7b6c2';[[-.38,-.12],[.38,.12]].forEach(([dx,a])=>{ctx.save();ctx.translate(dx*r,-r*1.2);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,r*.09,r*.42,0,0,TAU);ctx.fill();ctx.restore();});}
    if(k==='panda'){ear(-r*.72,-r*.72,r*.28,r*.28,0,'#2b2b2b');ear(r*.72,-r*.72,r*.28,r*.28,0,'#2b2b2b');}
    // 脸
    const g=ctx.createRadialGradient(-r*.3,-r*.35,r*.1,0,0,r*1.05);g.addColorStop(0,shade(c,.35));g.addColorStop(1,c);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,r,r*.9,0,0,TAU);ctx.fill();ctx.stroke();
    if(k==='penguin'){ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(0,r*.14,r*.72,r*.62,0,0,TAU);ctx.fill();}
    if(k==='panda'){ctx.fillStyle='#2b2b2b';[[-1],[1]].forEach(([sx])=>{ctx.save();ctx.translate(sx*r*.36,-r*.04);ctx.rotate(sx*.5);ctx.beginPath();ctx.ellipse(0,0,r*.2,r*.28,0,0,TAU);ctx.fill();ctx.restore();});}
    if(k==='hamster'){ctx.fillStyle='#fff3e4';ctx.beginPath();ctx.ellipse(0,r*.35,r*.55,r*.38,0,0,TAU);ctx.fill();}
    if(k==='gold'){ctx.strokeStyle='#b8862f';ctx.lineWidth=r*.08;ctx.beginPath();ctx.arc(0,-r*.1,r*.92,Math.PI*1.15,Math.PI*1.85);ctx.stroke();ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.4,r*.05);}
    // 眼睛、腮红、鼻子、嘴
    const ey=k==='penguin'?-r*.08:-r*.06;[[-1],[1]].forEach(([sx])=>{ctx.fillStyle=k==='panda'?'#ffffff':'#2a1e18';ctx.beginPath();ctx.ellipse(sx*r*.36,ey,r*.11,r*.14,0,0,TAU);ctx.fill();if(k==='panda'){ctx.fillStyle='#2a1e18';ctx.beginPath();ctx.arc(sx*r*.36,ey,r*.08,0,TAU);ctx.fill();}
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx*r*.36-r*.03,ey-r*.05,r*.04,0,TAU);ctx.fill();ctx.fillStyle='rgba(245,130,140,.55)';ctx.beginPath();ctx.ellipse(sx*r*.58,r*.24,r*.14,r*.08,0,0,TAU);ctx.fill();});
    if(k==='penguin'){ctx.fillStyle='#f2a93b';ctx.beginPath();ctx.moveTo(-r*.14,r*.12);ctx.lineTo(r*.14,r*.12);ctx.lineTo(0,r*.32);ctx.closePath();ctx.fill();ctx.stroke();}
    else{ctx.fillStyle=k==='dog'?'#3a2c24':'#e77f8c';ctx.beginPath();ctx.ellipse(0,r*.16,r*.09,r*.06,0,0,TAU);ctx.fill();ctx.lineWidth=Math.max(1.2,r*.04);ctx.beginPath();ctx.moveTo(-r*.14,r*.28);ctx.quadraticCurveTo(-r*.07,r*.36,0,r*.24);ctx.quadraticCurveTo(r*.07,r*.36,r*.14,r*.28);ctx.stroke();}
    if(k==='cat'||k==='gold'){ctx.lineWidth=1;[[-1],[1]].forEach(([sx])=>{[-.06,.06].forEach(dy=>{ctx.beginPath();ctx.moveTo(sx*r*.5,r*(.2+dy));ctx.lineTo(sx*r*.92,r*(.14+dy*2));ctx.stroke();});});}
    if(k==='gold'){ctx.fillStyle='#ffe27a';ctx.strokeStyle='#b8862f';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(r*.72,r*.78,r*.26,0,TAU);ctx.fill();ctx.stroke();txt(ctx,'福',r*.72,r*.79,{size:r*.3,weight:900,col:'#b5432a'});
      for(let i=0;i<4;i++){const a=t*1.5+i*1.57,R2=r*1.25;ctx.fillStyle='rgba(255,215,90,.9)';const sx=Math.cos(a)*R2,sy=Math.sin(a)*R2*.9;ctx.beginPath();for(let q=0;q<8;q++){const rr2=q%2?r*.05:r*.14,aa=q*Math.PI/4;ctx.lineTo(sx+Math.cos(aa)*rr2,sy+Math.sin(aa)*rr2);}ctx.closePath();ctx.fill();}}
    ctx.restore();}
  /* 垃圾 */
  function drawTrash(ctx,k,x,y,r){ctx.save();ctx.translate(x,y);ctx.lineWidth=Math.max(1.4,r*.05);ctx.strokeStyle='#3a2a1c';
    if(k==='poop'){[[0,r*.45,r*.85,r*.32],[0,r*.08,r*.65,r*.28],[0,-r*.26,r*.44,r*.24]].forEach(([dx,dy,w,h])=>{const g=ctx.createLinearGradient(0,dy-h,0,dy+h);g.addColorStop(0,'#a8743f');g.addColorStop(1,'#6e4521');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(dx,dy,w,h,0,0,TAU);ctx.fill();ctx.stroke();});
      ctx.beginPath();ctx.moveTo(-r*.1,-r*.5);ctx.quadraticCurveTo(r*.1,-r*.75,r*.02,-r*.82);ctx.stroke();
      ctx.strokeStyle='rgba(110,150,60,.8)';ctx.lineWidth=2;[-1,1].forEach(sx=>{ctx.beginPath();ctx.moveTo(sx*r*.7,-r*.2);ctx.bezierCurveTo(sx*r*.9,-r*.45,sx*r*.6,-r*.6,sx*r*.85,-r*.85);ctx.stroke();});}
    else if(k==='sock'){ctx.fillStyle='#f2f0ea';ctx.beginPath();ctx.moveTo(-r*.3,-r*.9);ctx.lineTo(r*.25,-r*.9);ctx.lineTo(r*.25,r*.25);ctx.quadraticCurveTo(r*.3,r*.7,r*.85,r*.62);ctx.quadraticCurveTo(r*1.05,r*.95,r*.6,r*.98);ctx.lineTo(-r*.05,r*.98);ctx.quadraticCurveTo(-r*.38,r*.95,-r*.32,r*.5);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#c0503a';[-.75,-.55].forEach(yy=>ctx.fillRect(-r*.29,r*yy,r*.53,r*.1));ctx.fillStyle='#b5a99a';ctx.beginPath();ctx.ellipse(r*.55,r*.82,r*.12,r*.08,0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(110,150,60,.85)';ctx.lineWidth=2;[0,1,2].forEach(i=>{ctx.beginPath();ctx.moveTo(-r*.6+i*r*.35,-r*.95);ctx.bezierCurveTo(-r*.75+i*r*.35,-r*1.15,-r*.45+i*r*.35,-r*1.2,-r*.6+i*r*.35,-r*1.4);ctx.stroke();});}
    else{// 香蕉皮：顶上是果柄，三条果皮向下摊开在地上（外黄内白，尖端褐色）
      ctx.fillStyle='rgba(60,40,20,.12)';ctx.beginPath();ctx.ellipse(0,r*.78,r*1.05,r*.16,0,0,TAU);ctx.fill();
      const strip=(ex,ey,cx1,cy1,in_)=>{ctx.fillStyle=in_?'#fbf0c2':'#f4d03f';ctx.beginPath();ctx.moveTo(-r*.2,-r*.1);ctx.quadraticCurveTo(cx1-r*.16,cy1,ex,ey);ctx.quadraticCurveTo(ex+r*.12,ey+r*.1,ex+r*.2,ey-r*.02);ctx.quadraticCurveTo(cx1+r*.2,cy1-r*.1,r*.2,-r*.1);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#6b4a1f';ctx.beginPath();ctx.ellipse(ex+r*.1,ey+r*.03,r*.08,r*.05,0,0,TAU);ctx.fill();};
      strip(-r*1.0,r*.66,-r*.6,r*.05,false);strip(r*.72,r*.62,r*.55,r*.08,false);strip(-r*.12,r*.74,-r*.05,r*.4,true);
      ctx.fillStyle='#f4d03f';ctx.beginPath();ctx.moveTo(-r*.24,-r*.04);ctx.quadraticCurveTo(-r*.26,-r*.62,0,-r*.74);ctx.quadraticCurveTo(r*.26,-r*.62,r*.24,-r*.04);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#6b4a1f';rr(ctx,-r*.07,-r*.95,r*.14,r*.24,r*.04);ctx.fill();ctx.fillStyle='rgba(107,74,31,.55)';[[-.08,-.4],[.1,-.25],[-.55,.35],[.45,.3]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(dx*r,dy*r,r*.035,0,TAU);ctx.fill();});}
    ctx.restore();}
  function layout(w,h){const top=54,bot=96,gw=w-40,gh=h-top-bot,cw=gw/COLS,ch=gh/ROWS;return{x0:20,y0:top,cw,ch};}
  function draw(){const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const L=G=layout(w,h);
    ctx.fillStyle='#efe7d6';ctx.fillRect(L.x0-6,L.y0-6,L.cw*COLS+12,L.ch*ROWS+12);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.strokeRect(L.x0-6,L.y0-6,L.cw*COLS+12,L.ch*ROWS+12);
    tiles.forEach((tl,i)=>{const c=i%COLS,r=(i/COLS)|0,x=L.x0+c*L.cw,y=L.y0+r*L.ch,cx=x+L.cw/2,cy=y+L.ch/2,s=Math.min(L.cw,L.ch)/120;
      const pet=PET[tl.k],rare=tl.k==='panda'||tl.k==='gold';
      ctx.fillStyle=tl.open&&pet&&rare?'#fff6da':tl.open&&!pet?'#f1ebe1':'#f8f3e8';ctx.strokeStyle='rgba(28,26,23,.25)';ctx.lineWidth=1;ctx.fillRect(x+4,y+4,L.cw-8,L.ch-8);ctx.strokeRect(x+4,y+4,L.cw-8,L.ch-8);
      const op=tl.open?clamp((t-tl.t0)/.6,0,1):0;
      if(op>0){ctx.save();ctx.globalAlpha=op;const pop=1+.25*Math.sin(Math.min(1,(t-tl.t0)/.5)*Math.PI);const R=Math.min(L.cw,L.ch)*.24*pop;
        if(pet){if(rare){ctx.fillStyle='rgba(255,215,90,.35)';ctx.beginPath();ctx.arc(cx,cy-8*s,R*1.5,0,TAU);ctx.fill();}drawPet(ctx,tl.k,cx,cy-8*s,R);
          txt(ctx,`${pet[0]} +${pet[1]}`,cx,y+L.ch-18,{size:Math.max(12,14*s),weight:800,col:rare?'#b5432a':INK});if(rare)txt(ctx,tl.k==='gold'?'超稀有 ×6':'稀有 ×4',x+L.cw-14,y+20,{size:12,weight:800,col:CA,align:'right'});}
        else{drawTrash(ctx,tl.k,cx,cy-(tl.k==='banana'?14:6)*s,R*(tl.k==='banana'?1.3:.9));txt(ctx,`${TRASH[tl.k][0]} ${TRASH[tl.k][1]}`,cx,y+L.ch-18,{size:Math.max(12,14*s),weight:800,col:BADC});}
        if(tl.by){ctx.fillStyle=tl.by==='r'?RED:BLUE;ctx.fillRect(x+4,y+4,L.cw-8,5);}
        ctx.restore();}
      if(op<1){ctx.save();ctx.globalAlpha=1-op;ctx.translate(0,-op*L.ch*.4);ctx.fillStyle=phase==='dig'?'#fffdf8':'#fbf7ee';ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.fillRect(x+8,y+8,L.cw-16,L.ch-16);ctx.strokeRect(x+8,y+8,L.cw-16,L.ch-16);
        txt(ctx,`${'ABCDE'[c]}${r+1}`,x+20,y+24,{size:13,weight:800,col:CM,align:'left'});hand(ctx,'?',cx,cy+4,{size:40*s,col:phase==='dig'?CA:'rgba(28,26,23,.25)'});
        if(phase==='dig'){ctx.strokeStyle=CA;ctx.lineWidth=2+Math.sin(t*6);ctx.strokeRect(x+11,y+11,L.cw-22,L.ch-22);}ctx.restore();}});
    txt(ctx,`红队 ${TEAM.sc.r}`,w-260,26,{size:20,weight:800,col:RED,align:'left'});txt(ctx,`蓝队 ${TEAM.sc.b}`,w-140,26,{size:20,weight:800,col:BLUE,align:'left'});
    if(phase==='dig')hand(ctx,`${tname(digger)}可以挖 ${digs} 格`,w/2,26,{size:20,col:digger==='r'?RED:BLUE});
    // 底部：两队的萌宠 + 中间图例
    const by=h-86,cw3=(w-40)/3;['r','b'].forEach((tm,j)=>{const x0=j?20+cw3*2+6:20,ww=cw3-6;ctx.fillStyle='#fffdf8';ctx.strokeStyle=tm==='r'?RED:BLUE;ctx.lineWidth=1.6;ctx.fillRect(x0,by,ww,74);ctx.strokeRect(x0,by,ww,74);
      txt(ctx,`${tname(tm)}的萌宠`,x0+12,by+16,{size:13,weight:800,col:tm==='r'?RED:BLUE,align:'left'});const n=pets[tm].length,step=Math.min(38,(ww-30)/Math.max(1,n));pets[tm].forEach((k,i)=>drawPet(ctx,k,x0+28+i*step,by+48,15));
      if(!n)txt(ctx,'还没有',x0+ww/2,by+44,{size:14,col:FAINT});if(skip[tm])txt(ctx,'踩了香蕉皮：下次挖宝跳过',x0+ww-10,by+16,{size:12,weight:800,col:BADC,align:'right'});});
    {const x0=20+cw3+3,ww=cw3-6;ctx.fillStyle='#fbf7ee';ctx.strokeStyle='rgba(28,26,23,.3)';ctx.lineWidth=1;ctx.fillRect(x0,by,ww,74);ctx.strokeRect(x0,by,ww,74);
      txt(ctx,'萌宠 +5～+30（熊猫 +20、招财金猫 +30）',x0+ww/2,by+20,{size:12,weight:700});txt(ctx,'便便 本队 −10　臭袜子 对方 −5',x0+ww/2,by+40,{size:12,weight:700,col:BADC});txt(ctx,'香蕉皮 下次挖宝跳过',x0+ww/2,by+58,{size:12,weight:700,col:BADC});}
    if(flash&&t-flash.t0<1.8){const a=1-(t-flash.t0)/1.8;ctx.save();ctx.globalAlpha=a;hand(ctx,flash.s,w/2,h/2-(1-a)*40,{size:38,col:flash.c});ctx.restore();}
    if(ended){ctx.fillStyle='rgba(243,238,228,.92)';ctx.fillRect(0,0,w,h);const r=TEAM.sc.r,b=TEAM.sc.b;hand(ctx,'寻宝结束',w/2,h*.26,{size:46});
      hand(ctx,r===b?'两队平分秋色！':`${r>b?'红队':'蓝队'}获胜！`,w/2,h*.4,{size:40,col:r===b?CA:r>b?RED:BLUE});txt(ctx,`红队 ${r}　·　蓝队 ${b}`,w/2,h*.52,{size:24,weight:800});
      ['r','b'].forEach((tm,j)=>{pets[tm].forEach((k,i)=>drawPet(ctx,k,w/2+(j?60:-60)+(j?1:-1)*i*34,h*.66,14));});}}
  function dig(i){const tl=tiles[i];if(phase!=='dig'||tl.open)return;tl.open=1;tl.t0=t;tl.by=digger;digs--;
    const c=i%COLS,r=(i/COLS)|0,rc=cv.getBoundingClientRect(),k=rc.width/cv.offsetWidth||1;const px=rc.left+(G.x0+(c+.5)*G.cw)*k,py=rc.top+(G.y0+(r+.5)*G.ch)*k;const other=digger==='r'?'b':'r';
    if(PET[tl.k]){const[nm,pt]=PET[tl.k];teamAdd(pt,digger);pets[digger].push(tl.k);const rare=pt>=20;FX.burst(px,py,rare?60:28,rare?[CA,'#ffe27a','#fff2b0']:[CA,'#f7a8a8']);if(rare)FX.confetti();sfx('win');flash={s:`${nm} +${pt}${rare?'！':''}`,c:rare?'#b5432a':CA,t0:t};}
    else if(tl.k==='poop'){teamAdd(-10,digger);sfx('bad');shake();flash={s:`${tname(digger)}踩到便便 −10`,c:BADC,t0:t};}
    else if(tl.k==='sock'){teamAdd(-5,other);sfx('zap');flash={s:`臭袜子扔给${tname(other)}：−5`,c:BADC,t0:t};}
    else{sfx('bad');flash={s:`${tname(digger)}踩到香蕉皮，滑倒了！`,c:BADC,t0:t};if(digs>0)digs=0;else skip[digger]=true;}
    if(tiles.every(x=>x.open))digs=0;if(digs<=0){phase='ready';}panel();}
  function panel(){if(ended)return;const q=QB.hunt[qi];
    if(phase==='dig'){$('.digtip',card)?.remove();const d=document.createElement('div');d.className='digtip';d.textContent=`${tname(digger)}答对！在平面图上点 ${digs} 个格子挖宝`;card.appendChild(d);$('#htNext')&&($('#htNext').disabled=true);return;}
    if(phase==='ready'){$('.digtip',card)?.remove();const nb=$('#htNext');nb.disabled=false;nb.textContent=qi<QB.hunt.length-1?'下一题':'看结果';nb.onclick=()=>{qi++;sfx('whoosh');ask();};}}
  function ask(){if(qi>=QB.hunt.length){end();return;}const q=QB.hunt[qi],tm=TEAM.cur,pts=q.pts||10;phase='ask';
    card.innerHTML=`<div class="qmeta"><span class="teamTag ${tm}">${tname(tm)}</span><b>第 ${qi+1} / ${QB.hunt.length} 题</b>${pts===20?'<span class="tag">提升 · 挖 2 格</span>':''}</div><div class="qhost"></div><div class="row"><button class="btn" id="htNext" disabled>${qi<QB.hunt.length-1?'下一题':'看结果'}</button></div>`;
    qView($('.qhost',card),Object.assign({},q,{q:q.q.replace('【提升】','')}),{pts,vbtn:'after',vsrc:`寻宝第 ${qi+1} 题`,onJudge:ok=>{if(ok&&tiles.some(x=>!x.open)){if(skip[tm]){skip[tm]=false;phase='ready';flash={s:`${tname(tm)}上次踩了香蕉皮，这次不能挖宝`,c:BADC,t0:t};}else{digs=pts===20?2:1;digger=tm;phase='dig';panel();}}else phase='ready';
        if(phase==='ready')panel();}});}
  function end(){ended=true;phase='end';sfx('win');FX.confetti();const r=TEAM.sc.r,b=TEAM.sc.b;
    card.innerHTML=`<div class="qmeta"><b>寻宝结束</b></div><p class="qtext">${r===b?'两队平分秋色！':(r>b?'红队':'蓝队')+'获胜！'}</p><p>红队 <b class="cm">${r}</b> 分，蓝队 <b style="color:var(--blue)">${b}</b> 分。</p><p class="hint">答错的题可以点题号回顾，或到小结页的“错题回顾”里做变式。</p>`;}
  canvasUI(cv,{hots:()=>!G?[]:tiles.map((tl,i)=>({on:phase==='dig'&&!tl.open,hit:(x,y)=>{const c=i%COLS,r=(i/COLS)|0;return x>G.x0+c*G.cw&&x<G.x0+(c+1)*G.cw&&y>G.y0+r*G.ch&&y<G.y0+(r+1)*G.ch;},act:()=>dig(i)}))});
  function restart(){qi=0;digs=0;ended=false;pets={r:[],b:[]};skip={r:false,b:false};flash=null;deal();teamSet('r');ask();}
  $('#htReset').onclick=()=>{restart();sfx('click');};deal();let started=false;
  return{tick(dt){t+=dt;draw();},enter(){if(!started){started=true;teamSet('r');ask();}}};})();

/* ================= 14 小结：易错点清单 + 错题回顾（变式完成情况） ================= */
S.sum=(()=>{const g=$('#suGrid');
  const COL=[['化学研究与变化',[['化学','在分子、原子层次上研究物质的组成、结构、性质、转化及应用'],['变化','本质区别：有没有生成其他物质'],['性质','“能燃烧”是性质，“燃烧了”是变化'],['现象','“石灰水变浑浊”是现象，“生成二氧化碳”是结论']]],
    ['仪器与基本操作',[['加热','试管、蒸发皿、燃烧匙直接加热；烧杯、烧瓶、锥形瓶垫陶土网'],['量筒','俯视读数偏大，仰视读数偏小'],['倾倒','瓶塞倒放，标签朝向手心，瓶口紧挨试管口'],['加热液体','不超过 1/3，约 45°，先预热，外焰，管口不对人']]],
    ['安全与探究',[['酒精灯','火柴点燃，灯帽盖灭；酒精不超过 2/3'],['意外','酒精着火用湿抹布盖灭；烫伤用大量冷水冲洗；药液溅进眼睛用水冲洗，不能揉'],['气密性','先浸导管再握容器；有气泡、松手后有水柱'],['蜡烛','外焰温度最高；燃烧生成水和二氧化碳']]]];
  function render(hide=true){g.innerHTML=COL.map(([hd,items],k)=>`<div class="scol"><h4><i>0${k+1}</i>${hd}</h4>${items.map(([q,a])=>`<div class="sitem${hide?' hide':''}"><span class="q">${q}</span><span class="a">${a}</span></div>`).join('')}</div>`).join('');
    $$('.sitem',g).forEach(x=>x.onclick=()=>{x.classList.toggle('hide');sfx('click');});}
  $('#suAll').onclick=()=>{$$('.sitem',g).forEach((x,i)=>setTimeout(()=>x.classList.remove('hide'),i*70));sfx('whoosh');};
  $('#suHide').onclick=()=>{$$('.sitem',g).forEach(x=>x.classList.add('hide'));sfx('click');};
  render();
  return{enter(){const r=TEAM.sc.r,b=TEAM.sc.b;$('#suScore').innerHTML=`<span class="cm">红队 ${r}</span>　<span style="color:var(--blue);font-weight:700">蓝队 ${b}</span><br><small class="hint">${r===b?'平分秋色！':(r>b?'红队':'蓝队')+'领先'}</small>`;
    const L=VARS.log;$('#suLog').innerHTML=L.length?L.map(e=>`<div class="vrow"><b>${e.src}</b><span>${e.ok.size} / ${e.q.v.length} 道变式做对</span><button class="btn sm">再练</button></div>`).join(''):'<p class="hint">本节还没有答错的题，或者答错后还没做变式。</p>';
    $$('#suLog .vrow button').forEach((b,i)=>b.onclick=()=>VARS.open(L[i].q,L[i].src));}};})();
