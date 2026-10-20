/* ================= 3 化合价从哪来：供给电子与需要电子（只用“供给”“需要”两个说法） ================= */
S.elec=(()=>{const cv=$('#cvElec');let t=0,pi=0,na=1,nb=1,phase='set',animT=0,moves=[],res=null;const G={};
  // [符号, 核电荷数, 电子层排布, 名称]
  const A={Na:[11,[2,8,1],'钠'],Mg:[12,[2,8,2],'镁'],Al:[13,[2,8,3],'铝'],H:[1,[1],'氢'],Cl:[17,[2,8,7],'氯'],O:[8,[2,6],'氧']};
  const PAIRS=[['Na','Cl'],['Mg','Cl'],['Mg','O'],['Al','O'],['H','Cl'],['H','O']];
  const give=e=>A[e][1][A[e][1].length-1],need=e=>8-A[e][1][A[e][1].length-1];
  function reset(){phase='set';animT=0;moves=[];res=null;}
  function setPair(i){pi=i;na=1;nb=1;reset();sfx('click');}
  // 配对：供给方的最外层电子依次飞到需要方的空位
  function pair(){if(phase==='anim')return;reset();const[a,b]=PAIRS[pi],S=na*give(a),N=nb*need(b);let k=0;
    for(let i=0;i<na;i++)for(let j=0;j<give(a);j++){const to=Math.floor(k/need(b));if(to<nb)moves.push({fa:i,fe:j,tb:to,ts:k%need(b)});k++;}
    res={S,N,ok:S===N};phase='anim';animT=0;sfx('whoosh');}
  $('#elGo').onclick=()=>{if(p3)toggleP3();pair();};
  // 原子的位置与外层电子位置
  const col=(side,n)=>{const x=side?G.w*.73:G.w*.27,top=150,bot=G.h-150,gap=(bot-top)/n;return[...Array(n)].map((_,i)=>[x,top+gap*(i+.5)]);};
  const R=(e,n)=>Math.min(70,(G.h-300)/(2*n)-4)*(e==='H'?.72:1);
  function outerPos(e,cx,cy,r,i,tot){const a=-Math.PI/2+i/tot*TAU;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r];}
  function atom(ctx,e,cx,cy,r,{given=0,got=0,showGive=false,showNeed=false}){const[Z,sh]=A[e],L=sh.length,outer=sh[L-1];
    // 原子核与内层
    for(let i=0;i<L-1;i++){const rr=r*(.42+.58*(i+1)/L);ctx.save();ctx.globalAlpha=.35;chalkCircle(ctx,cx,cy,rr,{col:INK,w:1.5,seed:i+3});ctx.restore();}
    chalkCircle(ctx,cx,cy,r*.3,{col:INK,w:2,fill:'rgba(255,158,181,.25)',seed:1});txt(ctx,`+${Z}`,cx,cy+1,{size:Math.max(11,r*.24),weight:700});
    chalkCircle(ctx,cx,cy,r,{col:CB,w:2,seed:2});
    // 最外层：自己的电子（供给出去的画成虚线圈）+ 需要方的空位
    const tot=e==='H'?1:8;
    for(let i=0;i<outer;i++){const[x,y]=outerPos(e,cx,cy,r,i,tot);if(i<given){ctx.save();ctx.setLineDash([3,3]);ctx.strokeStyle=CY;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.stroke();ctx.restore();}
      else{ctx.fillStyle=showGive?CY:INK;ctx.beginPath();ctx.arc(x,y,5.5,0,TAU);ctx.fill();}}
    if(showNeed)for(let i=outer;i<8;i++){const[x,y]=outerPos(e,cx,cy,r,i,8);if(i-outer<got){ctx.fillStyle=CY;ctx.beginPath();ctx.arc(x,y,5.5,0,TAU);ctx.fill();}
      else{ctx.save();ctx.setLineDash([3,3]);ctx.strokeStyle=CP;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.stroke();ctx.restore();}}
    hand(ctx,e,cx-r-34,cy,{size:30,col:INK});}
  const ui=canvasUI(cv,{hots:()=>G.w&&!p3?[...PAIRS.map((p,i)=>({hit:(x,y)=>Math.abs(x-G.cx(i))<64&&Math.abs(y-34)<20,act:()=>setPair(i)})),
      ...[[0,-1],[0,1],[1,-1],[1,1]].map(([side,d])=>({hit:(x,y)=>{const bx=(side?G.w*.73:G.w*.27)+(d<0?70:110);return Math.abs(x-bx)<18&&Math.abs(y-92)<18;},
        act:()=>{if(phase==='anim')return;if(side)nb=clamp(nb+d,1,3);else na=clamp(na+d,1,3);reset();sfx('click');}}))]:[]});
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;G.h=h;if(p3)return;const[a,b]=PAIRS[pi];
    G.cx=i=>w/2+(i-2.5)*140;
    PAIRS.forEach(([x,y],i)=>{const on=i===pi;chalkRect(ctx,G.cx(i)-62,14,124,40,{col:on?CY:'rgba(241,238,228,.5)',w:on?3:2,fill:on?'rgba(255,226,122,.16)':null,seed:i+1});txt(ctx,`${x} + ${y}`,G.cx(i),34,{size:18,weight:700});});
    // 两栏标题与个数
    [[a,na,0,'供给电子',CY],[b,nb,1,'需要电子',CP]].forEach(([e,n,side,lab,c])=>{const x=side?w*.73:w*.27;hand(ctx,lab,x-80,92,{size:24,col:c,align:'right'});
      fmDraw(ctx,`${e}`,x-20,92,28,{col:INK});txt(ctx,`× ${n}`,x+30,92,{size:22,weight:700});
      [[70,'−'],[110,'+']].forEach(([dx,s])=>{chalkCircle(ctx,x+dx,92,15,{col:INK,w:2,seed:dx});txt(ctx,s,x+dx,93,{size:20,weight:700});});
      txt(ctx,side?`每个${A[e][2]}原子需要 ${need(e)} 个`:`每个${A[e][2]}原子供给 ${give(e)} 个`,x,124,{size:15,weight:700,col:DIM});});
    // 原子
    const PA=col(0,na),PB=col(1,nb),ra=R(a,na),rb=R(b,nb);
    if(phase==='anim'){animT+=dt;if(animT>moves.length*.28+.9&&phase==='anim'){phase='done';if(res.ok){sfx('ok');burstAt(cv,20,[CY,CG]);}else sfx('bad');}}
    const doneK=phase==='set'?0:moves.filter((m,k)=>animT>k*.28+.6).length;
    const givenBy=i=>moves.filter((m,k)=>k<doneK&&m.fa===i).length,gotBy=j=>moves.filter((m,k)=>k<doneK&&m.tb===j).length;
    const showGive=phase!=='set'&&res&&res.S>0;
    PA.forEach(([x,y],i)=>atom(ctx,a,x,y,ra,{given:givenBy(i),showGive:phase==='set'||true}));
    PB.forEach(([x,y],j)=>atom(ctx,b,x,y,rb,{got:gotBy(j),showNeed:true}));
    // 飞行中的电子
    if(phase==='anim')moves.forEach((m,k)=>{const q=clamp((animT-k*.28)/.6,0,1);if(q<=0||q>=1)return;const[ax,ay]=PA[m.fa],[bx,by]=PB[m.tb];
      const[x1,y1]=outerPos(a,ax,ay,ra,m.fe,a==='H'?1:8),[x2,y2]=outerPos(b,bx,by,rb,A[b][1][A[b][1].length-1]+m.ts,8),e=ease(q);
      const x=lerp(x1,x2,e),y=lerp(y1,y2,e)-Math.sin(q*Math.PI)*40;ctx.fillStyle=CY;ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.fill();ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(x,y,12,0,TAU);ctx.fill();ctx.globalAlpha=1;});
    // 结果
    const by=h-96;
    if(phase==='done'){const{S,N,ok}=res;
      if(ok){const g=gcd(na,nb),f=`${a}${na/g>1?na/g:''}${b}${nb/g>1?nb/g:''}`;
        PA.forEach(([x,y])=>txt(ctx,`+${give(a)}`,x+ra+30,y-ra+6,{size:28,weight:700,col:CY}));PB.forEach(([x,y])=>txt(ctx,`−${need(b)}`,x+rb+30,y-rb+6,{size:28,weight:700,col:CP}));
        hand(ctx,`供给 ${S} 个 = 需要 ${N} 个`,w*.3,by,{size:28,col:CG});fmDraw(ctx,f,w*.62,by,40,{col:CY});
        txt(ctx,`${A[a][2]} +${give(a)} 价　${A[b][2]} −${need(b)} 价`,w*.82,by,{size:18,weight:700,col:INK});
        if(g>1)txt(ctx,`（${na}∶${nb} 化成最简比 ${na/g}∶${nb/g}）`,w*.62,by+34,{size:14,weight:700,col:DIM});}
      else hand(ctx,S>N?`供给 ${S} 个 > 需要 ${N} 个：再加一个${A[b][2]}原子试试`:`供给 ${S} 个 < 需要 ${N} 个：再加一个${A[a][2]}原子试试`,w/2,by,{size:26,col:CP});}
    else if(phase==='set')hand(ctx,'调好两种原子的个数，点“配对”',w/2,by,{size:26,col:DIM});
    // 中间的电子流向箭头
    const ax=w/2,ay=(150+h-150)/2,on=phase!=='set';chalkPath(ctx,[[ax-60,ay],[ax+60,ay]],{col:on?CY:'rgba(241,238,228,.35)',w:3,seed:11});chalkPath(ctx,[[ax+44,ay-12],[ax+60,ay],[ax+44,ay+12]],{col:on?CY:'rgba(241,238,228,.35)',w:3,seed:12});
    hand(ctx,'电子',ax,ay-26,{size:22,col:on?CY:DIM});}
  // 提升：第三周期
  let p3=false;const P3=[['Na',1,'+1','—'],['Mg',2,'+2','—'],['Al',3,'+3','—'],['Si',4,'+4','−4'],['P',5,'+5','−3'],['S',6,'+6','−2'],['Cl',7,'+7','−1']];
  const tbl=$('#elTbl'),law=$('#elLaw');
  tbl.innerHTML=`<tr><th>元素</th>${P3.map(r=>`<th>${r[0]}</th>`).join('')}</tr>`+[['最外层电子数',1],['最多供给 → 最高正价',2],['需要 → 最低负价',3]].map(([n,c])=>`<tr><th>${n}</th>${P3.map(r=>`<td class="cell hide">${r[c]}</td>`).join('')}</tr>`).join('');
  $$('td.cell',tbl).forEach(td=>td.onclick=()=>{td.classList.remove('hide');sfx('pop');if(!$$('td.cell.hide',tbl).length)law.classList.add('on');});
  law.style.cursor='pointer';law.onclick=()=>{$$('td.cell',tbl).forEach(td=>td.classList.remove('hide'));law.classList.add('on');sfx('whoosh');};
  function toggleP3(){p3=!p3;$('#elMain').hidden=p3;$('#elP3').hidden=!p3;$('#elP3Btn').setAttribute('aria-pressed',String(p3));$('#elP3Btn').textContent=p3?'返回配对':'提升：第三周期';sfx('whoosh');}
  $('#elP3Btn').onclick=toggleP3;
  // 右侧：看结构判化合价
  const quiz=rowQuiz($('#elQ'),$('#elSub'),$('#elRedo'),$('#elSt'),[
    [`<b class="fm">Na</b> ${shellSvg(11,[2,8,1])}`,['+1','−1','+8'],0],[`<b class="fm">Al</b> ${shellSvg(13,[2,8,3])}`,['+3','−3','−5'],0],
    [`<b class="fm">O</b> ${shellSvg(8,[2,6])}<span class="hint"> 与金属化合</span>`,['+6','−2','+2'],1],[`<b class="fm">Cl</b> ${shellSvg(17,[2,8,7])}<span class="hint"> 与金属化合</span>`,['+7','−1','+1'],1],
    ['镁与氯结合，Mg∶Cl',['1∶1','1∶2','2∶1'],1]],{okMsg:'供给几个显正几价，需要几个显负几价。'});
  $('#elReset').onclick=()=>{if(p3)toggleP3();setPair(0);$$('td.cell',tbl).forEach(td=>td.classList.add('hide'));law.classList.remove('on');quiz.reset();};
  notes('elec','化合价从哪来',['化合价是元素的原子在形成化合物时表现出来的一种性质。','原子化合时，有的原子<mark>供给</mark>电子，有的原子<mark>需要</mark>电子。','供给 n 个电子 → <mark>+n 价</mark>；需要 n 个电子 → <mark>−n 价</mark>。','供给总数 = 需要总数 → 正、负化合价的<mark>代数和为 0</mark>。'],
    '铁、铜、锰等元素的化合价不能只看最外层电子数（如 Fe 有 +2、+3 价），以后再学。',
    (ctx,w,h)=>{const y1=h*.2;
      shellDraw(ctx,24,y1,11,[2,8,1],{size:1.5,hiLast:PEN.red});hand(ctx,'Na',46,y1-42,{size:22,col:PEN.ink});
      shellDraw(ctx,w-170,y1,17,[2,8,7],{size:1.5,hiLast:PEN.blue});hand(ctx,'Cl',w-134,y1-42,{size:22,col:PEN.ink});
      chalkPath(ctx,[[128,y1+30],[w/2,y1+52],[w-176,y1+30]],{col:PEN.gold,w:2.5,seed:2});chalkPath(ctx,[[w-192,y1+22],[w-176,y1+30],[w-190,y1+42]],{col:PEN.gold,w:2.5,seed:3});
      txt(ctx,'1 个电子',w/2,y1+70,{size:14,weight:700,col:PEN.gold});
      txt(ctx,'供给 1 个 → +1',90,y1+100,{size:17,weight:700,col:PEN.red});txt(ctx,'需要 1 个 → −1',w-100,y1+100,{size:17,weight:700,col:PEN.blue});
      chalkLine(ctx,20,h*.56,w-20,h*.56,{col:'rgba(42,42,36,.2)',w:1.5,seed:5});
      hand(ctx,'Mg 供给 2 个',w*.27,h*.66,{size:20,col:PEN.red});hand(ctx,'每个 Cl 需要 1 个',w*.7,h*.66,{size:20,col:PEN.blue});
      fmDraw(ctx,'Mg{+2}Cl2{-1}',w/2,h*.82,36,{col:PEN.ink,cols:{val:PEN.red}});hand(ctx,'(+2) + (−1)×2 = 0',w/2,h*.95,{size:20,col:PEN.green});});
  return{tick,leave(){}};})();
