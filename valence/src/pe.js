/* ================= 3 化合价从哪来：供给电子与需要电子（只用“供给”“需要”两个说法） ================= */
S.elec=(()=>{const cv=$('#cvElec');let t=0,pi=0,na=1,nb=1,phase='set',animT=0,jT=0,moves=[],res=null,hit=false;const G={};
  // [符号, 核电荷数, 电子层排布, 名称]
  const A={Na:[11,[2,8,1],'钠'],Mg:[12,[2,8,2],'镁'],Al:[13,[2,8,3],'铝'],H:[1,[1],'氢'],Cl:[17,[2,8,7],'氯'],O:[8,[2,6],'氧']};
  const PAIRS=[['Na','Cl'],['Mg','Cl'],['Mg','O'],['Al','O'],['H','Cl'],['H','O']];
  const give=e=>A[e][1][A[e][1].length-1],need=e=>8-A[e][1][A[e][1].length-1];
  function reset(){phase='set';animT=0;jT=0;moves=[];res=null;hit=false;}
  function setPair(i){pi=i;na=1;nb=1;reset();sfx('click');}
  // 配对：① 供给方的最外层电子依次飞到需要方的空位；② 供给 = 需要时粒子靠拢结合，不相等时撞上后弹回
  function pair(){if(phase==='anim'||phase==='join'||phase==='bounce')return;reset();const[a,b]=PAIRS[pi],S=na*give(a),N=nb*need(b);let k=0;
    for(let i=0;i<na;i++)for(let j=0;j<give(a);j++){const to=Math.floor(k/need(b));if(to<nb)moves.push({fa:i,fe:j,tb:to,ts:k%need(b)});k++;}
    res={S,N,ok:S===N};phase='anim';animT=0;sfx('whoosh');}
  $('#elGo').onclick=pair;
  const R=(e,n)=>Math.min(70,(G.h-300)/(2*n)-4)*(e==='H'?.72:1);
  function outerPos(cx,cy,r,i,tot){const a=-Math.PI/2+i/tot*TAU;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r];}
  // k：靠拢程度（0 = 原位，1 = 结合在一起）
  function place(side,i,n,r,k){const top=150,bot=G.h-150,gap=(bot-top)/n,x0=side?G.w*.73:G.w*.27,y0=top+gap*(i+.5);
    const cx=G.w/2,cy=(top+bot)/2,x1=side?cx+r*.86:cx-r*.86,y1=cy+(i-(n-1)/2)*2*r*.94;return[lerp(x0,x1,k),lerp(y0,y1,k)];}
  function atom(ctx,e,cx,cy,r,{given=0,got=0,showNeed=false,blinkGive=false,blinkNeed=false,glow=0}){const[Z,sh]=A[e],L=sh.length,outer=sh[L-1];
    if(glow>0){const g=ctx.createRadialGradient(cx,cy,r*.6,cx,cy,r*1.35);g.addColorStop(0,`rgba(255,226,122,${.25*glow})`);g.addColorStop(1,'rgba(255,226,122,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r*1.35,0,TAU);ctx.fill();}
    ctx.fillStyle='rgba(27,47,38,.92)';ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();
    for(let i=0;i<L-1;i++){const rr=r*(.42+.58*(i+1)/L);ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,rr,0,TAU);ctx.stroke();ctx.restore();}
    chalkCircle(ctx,cx,cy,r*.3,{col:INK,w:2,fill:'rgba(255,158,181,.25)'});txt(ctx,`+${Z}`,cx,cy+1,{size:Math.max(11,r*.24),weight:700});
    chalkCircle(ctx,cx,cy,r,{col:CB,w:2});
    const tot=e==='H'?1:8,bl=.35+.65*Math.abs(Math.sin(t*6));
    for(let i=0;i<outer;i++){const[x,y]=outerPos(cx,cy,r,i,tot);if(i<given){ctx.save();ctx.setLineDash([3,3]);ctx.strokeStyle=CY;ctx.globalAlpha=.6;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.stroke();ctx.restore();}
      else{const b=blinkGive;if(b){ctx.save();ctx.globalAlpha=bl;ctx.fillStyle=CO;ctx.beginPath();ctx.arc(x,y,11,0,TAU);ctx.fill();ctx.restore();}ctx.fillStyle=b?CO:INK;ctx.beginPath();ctx.arc(x,y,5.5,0,TAU);ctx.fill();}}
    if(showNeed)for(let i=outer;i<8;i++){const[x,y]=outerPos(cx,cy,r,i,8);if(i-outer<got){ctx.fillStyle=CY;ctx.beginPath();ctx.arc(x,y,5.5,0,TAU);ctx.fill();}
      else{ctx.save();ctx.setLineDash([3,3]);ctx.strokeStyle=CP;ctx.lineWidth=blinkNeed?2.5:1.5;ctx.globalAlpha=blinkNeed?bl:1;ctx.beginPath();ctx.arc(x,y,blinkNeed?8:6,0,TAU);ctx.stroke();ctx.restore();}}}
  const ui=canvasUI(cv,{hots:()=>G.w?[...PAIRS.map((p,i)=>({hit:(x,y)=>Math.abs(x-G.cx(i))<64&&Math.abs(y-34)<20,act:()=>setPair(i)})),
      ...[[0,-1],[0,1],[1,-1],[1,1]].map(([side,d])=>({hit:(x,y)=>{const bx=(side?G.w*.73:G.w*.27)+(d<0?70:110);return Math.abs(x-bx)<18&&Math.abs(y-92)<18;},
        act:()=>{if(phase==='anim'||phase==='join'||phase==='bounce')return;if(side)nb=clamp(nb+d,1,3);else na=clamp(na+d,1,3);reset();sfx('click');}}))]:[]});
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;G.h=h;const[a,b]=PAIRS[pi];
    G.cx=i=>w/2+(i-2.5)*140;
    PAIRS.forEach(([x,y],i)=>{const on=i===pi;chalkRect(ctx,G.cx(i)-62,14,124,40,{col:on?CY:'rgba(241,238,228,.5)',w:on?3:2,fill:on?'rgba(255,226,122,.16)':null});txt(ctx,`${x} + ${y}`,G.cx(i),34,{size:18,weight:700});});
    [[a,na,0,'供给电子',CY],[b,nb,1,'需要电子',CP]].forEach(([e,n,side,lab,c])=>{const x=side?w*.73:w*.27;hand(ctx,lab,x-80,92,{size:24,col:c,align:'right'});
      fmDraw(ctx,`${e}`,x-20,92,28,{col:INK});txt(ctx,`× ${n}`,x+30,92,{size:22,weight:700});
      [[70,'−'],[110,'+']].forEach(([dx,s])=>{chalkCircle(ctx,x+dx,92,15,{col:INK,w:2});txt(ctx,s,x+dx,93,{size:20,weight:700});});
      txt(ctx,side?`最外层 ${give(e)} 个，每个${A[e][2]}原子需要 ${need(e)} 个`:`最外层 ${give(e)} 个，每个${A[e][2]}原子供给 ${give(e)} 个`,x,124,{size:15,weight:700,col:DIM});});
    // 时间线
    const tA=moves.length*.28+.7;
    if(phase==='anim'){animT+=dt;if(animT>tA){phase=res.ok?'join':'bounce';jT=0;}}
    else if(phase==='join'){jT+=dt;if(jT>1.1){phase='done';sfx('ok');}}
    else if(phase==='bounce'){jT+=dt;if(jT>.45&&!hit){hit=true;sfx('bad');shake();}if(jT>2){phase='done';}}
    let k=0;if(phase==='join')k=ease(clamp(jT/.9,0,1));else if(phase==='done'&&res&&res.ok)k=1;
    else if(phase==='bounce'){k=jT<.45?Math.pow(jT/.45,2)*.9:.9*Math.exp(-(jT-.45)*3.2)*Math.abs(Math.cos((jT-.45)*7));}
    const sc=lerp(1,.86,k),ra=R(a,na)*sc,rb=R(b,nb)*sc;
    const PA=[...Array(na)].map((_,i)=>place(0,i,na,ra,k)),PB=[...Array(nb)].map((_,j)=>place(1,j,nb,rb,k));
    const doneK=phase==='set'?0:moves.filter((m,i)=>animT>i*.28+.6).length;
    const givenBy=i=>moves.filter((m,q)=>q<doneK&&m.fa===i).length,gotBy=j=>moves.filter((m,q)=>q<doneK&&m.tb===j).length;
    const failDone=(phase==='bounce'&&jT>.45)||(phase==='done'&&res&&!res.ok),okDone=phase==='done'&&res&&res.ok;
    // 电子流向箭头（结合后隐藏）
    if(k<.05&&!okDone&&!failDone){const ax=w/2,ay=(150+h-150)/2,on=phase!=='set';arrow(ctx,ax-60,ay,ax+60,ay,{col:on?CY:'rgba(241,238,228,.35)',w:3,head:14});hand(ctx,'电子',ax,ay-26,{size:22,col:on?CY:DIM});}
    // 结合成功：粒子外围出现一圈光环
    const glow=okDone?(.6+.4*Math.sin(t*3)):phase==='join'?clamp((jT-.6)*3,0,1):0;
    if(glow>0){const cx=w/2,cy=(150+h-150)/2,RR=Math.max(ra*na,rb*nb)*1.05+Math.max(ra,rb);ctx.save();ctx.globalAlpha=glow*.8;ctx.setLineDash([10,8]);ctx.lineDashOffset=-t*30;ctx.strokeStyle=CY;ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(cx,cy,ra+rb+30,RR,0,0,TAU);ctx.stroke();ctx.restore();}
    PA.forEach(([x,y],i)=>atom(ctx,a,x,y,ra,{given:givenBy(i),blinkGive:failDone&&givenBy(i)<give(a),glow}));
    PB.forEach(([x,y],j)=>atom(ctx,b,x,y,rb,{got:gotBy(j),showNeed:true,blinkNeed:failDone&&gotBy(j)<need(b),glow}));
    hand(ctx,a,PA[0][0]-ra-34*(1-k)-6,PA[0][1]-(k>.5?ra+14:0),{size:30,col:INK});hand(ctx,b,PB[0][0]+(k>.5?rb+28:-rb-34),PB[0][1]-(k>.5?rb+14:0),{size:30,col:INK});
    // 碰撞：中间出现红色 ×
    if(phase==='bounce'&&jT>.45&&jT<1.6){const q=1-(jT-.45)/1.15,cx=w/2,cy=(150+h-150)/2;ctx.save();ctx.globalAlpha=q;ctx.strokeStyle=BADC;ctx.lineWidth=8;ctx.lineCap='round';
      const s2=26+(1-q)*10;ctx.beginPath();ctx.moveTo(cx-s2,cy-s2);ctx.lineTo(cx+s2,cy+s2);ctx.moveTo(cx+s2,cy-s2);ctx.lineTo(cx-s2,cy+s2);ctx.stroke();ctx.restore();}
    // 飞行中的电子
    if(phase==='anim')moves.forEach((m,q)=>{const p=clamp((animT-q*.28)/.6,0,1);if(p<=0||p>=1)return;const[ax,ay]=PA[m.fa],[bx,by]=PB[m.tb];
      const[x1,y1]=outerPos(ax,ay,ra,m.fe,a==='H'?1:8),[x2,y2]=outerPos(bx,by,rb,A[b][1][A[b][1].length-1]+m.ts,8),e=ease(p);
      const x=lerp(x1,x2,e),y=lerp(y1,y2,e)-Math.sin(p*Math.PI)*40;ctx.fillStyle=CY;ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.fill();ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(x,y,12,0,TAU);ctx.fill();ctx.globalAlpha=1;});
    // 化合价标在粒子旁边（结合后）
    if(okDone||phase==='join'&&jT>.8){PA.forEach(([x,y])=>txt(ctx,`+${give(a)}`,x-ra*.72,y-ra*.72,{size:22,weight:700,col:CY,stroke:BOARD}));PB.forEach(([x,y])=>txt(ctx,`−${need(b)}`,x+rb*.72,y-rb*.72,{size:22,weight:700,col:CP,stroke:BOARD}));}
    // 结果
    const by=h-96;
    if(okDone){const{S,N}=res,g=gcd(na,nb),f=`${a}${na/g>1?na/g:''}${b}${nb/g>1?nb/g:''}`;
      hand(ctx,`供给 ${S} 个 = 需要 ${N} 个，结合成功`,w*.3,by,{size:26,col:CG});fmDraw(ctx,f,w*.62,by,40,{col:CY});
      txt(ctx,`${A[a][2]} +${give(a)} 价　${A[b][2]} −${need(b)} 价`,w*.82,by,{size:18,weight:700,col:INK});
      if(g>1)txt(ctx,`（${na}∶${nb} 化成最简比 ${na/g}∶${nb/g}）`,w*.62,by+34,{size:14,weight:700,col:DIM});}
    else if(failDone){const{S,N}=res;hand(ctx,S>N?`供给 ${S} 个 > 需要 ${N} 个，还剩 ${S-N} 个电子没有原子需要，结合失败`:`供给 ${S} 个 < 需要 ${N} 个，还缺 ${N-S} 个电子，结合失败`,w/2,by-30,{size:24,col:CP});
      txt(ctx,S>N?`再加一个${A[b][2]}原子试试`:`再加一个${A[a][2]}原子试试`,w/2,by+2,{size:16,weight:700,col:DIM});}
    else if(phase==='set')hand(ctx,'调好两种原子的个数，点“配对”',w/2,by,{size:26,col:DIM});}
  // 右侧：看结构判化合价（2×2 原子卡片 + 一道个数比）
  const card=(e,z,sh)=>`<span class="ac"><b class="fm">${e}</b>${shellSvg(z,sh,{size:1.2,hi:'#ffe27a'})}</span>`;
  const quiz=rowQuiz($('#elQ'),$('#elSub'),$('#elRedo'),$('#elSt'),[
    [card('Na',11,[2,8,1]),['+1','−1','+8'],0],[card('Al',13,[2,8,3]),['+3','−3','−5'],0],
    [card('O',8,[2,6]),['+6','−2','+2'],1],[card('Cl',17,[2,8,7]),['+7','−1','+1'],1],
    ['镁与氯结合，Mg∶Cl =',['1∶1','1∶2','2∶1'],1]],{okMsg:'供给几个显正几价，需要几个显负几价。'});
  $('#elReset').onclick=()=>{setPair(0);quiz.reset();};
  notes('elec','化合价从哪来',['化合价是元素的原子在形成化合物时表现出来的一种性质。','原子化合时，有的原子<mark>供给</mark>电子，有的原子<mark>需要</mark>电子。','供给 n 个电子 → <mark>+n 价</mark>；需要 n 个电子 → <mark>−n 价</mark>。','供给总数 = 需要总数 → 正、负化合价的<mark>代数和为 0</mark>。'],
    '铁、铜、锰等元素的化合价不能只看最外层电子数（如 Fe 有 +2、+3 价），以后再学。',
    (ctx,w,h)=>{const y1=h*.27,s1=1.25,ax=34,bx=w-128,G=shellGeom(3,s1);
      shellDraw(ctx,ax,y1,11,[2,8,1],{size:s1,hiLast:PEN.red});shellDraw(ctx,bx,y1,17,[2,8,7],{size:s1,hiLast:PEN.blue});
      hand(ctx,'Na',ax+G.w/2-10,y1+52,{size:24,col:PEN.ink});hand(ctx,'Cl',bx+G.w/2-10,y1+52,{size:24,col:PEN.ink});
      arrow(ctx,ax+G.arcs[2],y1-26,bx+G.arcs[2]-4,y1-26,{col:PEN.gold,w:2.5,bend:46,head:13});
      txt(ctx,'1 个电子',(ax+bx+2*G.arcs[2])/2,y1-82,{size:15,weight:700,col:PEN.gold});
      txt(ctx,'供给 1 个 → +1',ax+G.w/2,y1+88,{size:17,weight:700,col:PEN.red});txt(ctx,'需要 1 个 → −1',bx+G.w/2,y1+88,{size:17,weight:700,col:PEN.blue});
      ctx.save();ctx.strokeStyle='rgba(42,42,36,.18)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(20,h*.6);ctx.lineTo(w-20,h*.6);ctx.stroke();ctx.restore();
      txt(ctx,'Mg 供给 2 个',w*.27,h*.68,{size:17,weight:700,col:PEN.red});txt(ctx,'每个 Cl 需要 1 个',w*.72,h*.68,{size:17,weight:700,col:PEN.blue});
      fmDraw(ctx,'Mg{+2}Cl2{-1}',w/2,h*.83,36,{col:PEN.ink,cols:{val:PEN.red}});txt(ctx,'(+2) + (−1)×2 = 0',w/2,h*.95,{size:17,weight:700,col:PEN.green});});
  return{tick,leave(){}};})();
