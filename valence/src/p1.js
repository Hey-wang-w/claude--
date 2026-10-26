/* ================= 1 封面：粉笔推演“HO ✗ → H₂O ✓” ================= */
S.cover=(()=>{const cv=$('#cvCover');let t=0,k=0,dust=[],rang=false,bad=false;
  // [错误写法, 错误的原子, 错误算式, 正确写法, 正确的原子, 正确算式]
  const EX=[['HO',[['H',1],['O',-2]],'(+1) + (−2) = −1','H2O',[['H',1],['H',1],['O',-2]],'(+1)×2 + (−2) = 0'],
    ['H2Cl',[['H',1],['H',1],['Cl',-1]],'(+1)×2 + (−1) = +1','HCl',[['H',1],['Cl',-1]],'(+1) + (−1) = 0'],
    ['AlO',[['Al',3],['O',-2]],'(+3) + (−2) = +1','Al2O3',[['Al',3],['Al',3],['O',-2],['O',-2],['O',-2]],'(+3)×2 + (−2)×3 = 0']];
  const T=9;cv.addEventListener('pointerdown',()=>{k=(k+1)%EX.length;t=0;rang=false;bad=false;sfx('whoosh');});
  const vs=v=>(v>0?'+':'−')+Math.abs(v);
  function scene(ctx,w,y0,f,atoms,eq,p,ok,show){// p：书写进度 0..1
    const fy=y0+70;ctx.save();ctx.globalAlpha=show;
    // 化学式（逐字写出）
    const full=fmDraw(ctx,f,0,0,72,{measure:true});ctx.save();ctx.beginPath();ctx.rect(w/2-full/2-10,fy-90,(full+20)*clamp(p*2.2,0,1),140);ctx.clip();fmDraw(ctx,f,w/2,fy,72,{col:INK});ctx.restore();
    // 粒子与化合价
    const n=atoms.length,gap=Math.min(92,(w-120)/n),ay=fy+105;
    atoms.forEach(([e,v],i)=>{const q=clamp(p*3-.6-i*.12,0,1);if(q<=0)return;const x=w/2+(i-(n-1)/2)*gap;ctx.save();ctx.globalAlpha=show*q;
      chalkAtom(ctx,x,ay,e==='H'?22:28,e,{seed:i+1});txt(ctx,vs(v),x,ay+52,{size:22,weight:700,col:v>0?CY:CP});ctx.restore();});
    // 算式（逐字写出）
    const m=Math.floor(clamp(p*2.4-1.1,0,1)*eq.length);if(m>0)hand(ctx,eq.slice(0,m),w/2,ay+112,{size:34,col:INK});
    if(p>=1){if(ok){chalkCircle(ctx,w/2+full/2+46,fy-22,24,{col:CG,w:4,seed:9});hand(ctx,'✓',w/2+full/2+46,fy-20,{size:34,col:CG});}
      else{chalkLine(ctx,w/2-full/2-16,fy-50,w/2+full/2+16,fy+10,{col:CP,w:5,seed:4});chalkLine(ctx,w/2-full/2-16,fy+10,w/2+full/2+16,fy-50,{col:CP,w:5,seed:5});hand(ctx,'≠ 0',w/2,ay+160,{size:30,col:CP});}}
    ctx.restore();return{px:w/2-full/2+(full)*clamp(p*2.2,0,1),py:fy};}
  function tick(dt){t+=dt;if(t>T){t=0;k=(k+1)%EX.length;rang=false;bad=false;}const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const e=EX[k];
    hand(ctx,'试一试：原子能这样结合吗？',w/2,46,{size:28,col:CB});
    const pw=clamp(t/2.6,0,1),pr=clamp((t-4)/2.6,0,1);let pen=null;
    if(t<4.2){const fade=t>3.6?1-(t-3.6)/.6:1;pen=scene(ctx,w,90,e[0],e[1],e[2],pw,false,fade);}
    else{pen=scene(ctx,w,90,e[3],e[4],e[5],pr,true,1);if(pr>=1&&!rang){rang=true;sfx('ok');}}
    if(t<4.2&&pw>=1&&!bad){bad=true;sfx('bad');}if(t<.05){rang=false;bad=false;}
    // 粉笔灰
    if(!LOW&&pen&&((pw>0&&pw<1&&t<4)||(pr>0&&pr<1))&&Math.random()<.6)dust.push({x:pen.px,y:pen.py+Math.random()*20-10,vx:(Math.random()-.5)*20,vy:20+Math.random()*30,l:1});
    dust=dust.filter(d=>{d.x+=d.vx*dt;d.y+=d.vy*dt;d.l-=dt*1.2;if(d.l<=0)return false;ctx.globalAlpha=d.l*.6;ctx.fillStyle=INK;ctx.fillRect(d.x,d.y,2,2);ctx.globalAlpha=1;return true;});
    hand(ctx,'化合物里，正、负化合价的代数和为 0',w/2,h-70,{size:26,col:t>6.3&&t>4.2?CY:'rgba(241,238,228,.35)'});
    txt(ctx,'点黑板换一个例子',w/2,h-30,{size:14,weight:700,col:DIM});}
  return{tick,enter(){t=0;}};})();

/* ================= 2 原子个数比与化合价 ================= */
S.ratio=(()=>{
  const D=[['HCl','HCl','H{+1}Cl{-1}','(+1)×1 + (−1)×1 = 0','1∶1',['H','Cl']],['H2O','H2O','H2{+1}O{-2}','(+1)×2 + (−2)×1 = 0','2∶1',['H','O']],
    ['CO2','CO2','C{+4}O2{-2}','(+4)×1 + (−2)×2 = 0','1∶2',['C','O']],['Fe2O3','Fe2O3','Fe2{+3}O3{-2}','(+3)×2 + (−2)×3 = 0','2∶3',['Fe','O']]];
  const cols=$('#raCols');let shown=false,answered=false;
  cols.innerHTML=D.map(([f],i)=>`<div class="rc" data-i="${i}"><span class="fm">${fm(f)}</span><canvas></canvas><span class="ans"></span><span class="eq"></span></div>`).join('');
  function draw(){$$('.rc',cols).forEach((c,i)=>{const cv=$('canvas',c);const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,u=Math.min(w,h);
      if(i===0){chalkAtom(ctx,cx-u*.13,cy,u*.12,'H',{seed:1});chalkAtom(ctx,cx+u*.12,cy,u*.17,'Cl',{seed:2});}
      else if(i===1){chalkAtom(ctx,cx,cy-u*.06,u*.16,'O',{seed:3});chalkAtom(ctx,cx-u*.2,cy+u*.12,u*.11,'H',{seed:4});chalkAtom(ctx,cx+u*.2,cy+u*.12,u*.11,'H',{seed:5});}
      else if(i===2){chalkAtom(ctx,cx-u*.27,cy,u*.14,'O',{seed:6});chalkAtom(ctx,cx,cy,u*.14,'C',{seed:7});chalkAtom(ctx,cx+u*.27,cy,u*.14,'O',{seed:8});}
      else{// 氧化铁由离子构成：画一小片按 2∶3 排列的离子
        const P=[['Fe','O','O','Fe','O'],['O','Fe','O','O','Fe']],g=Math.min(u*.19,w/5.6);
        P.forEach((row,r)=>row.forEach((e,j)=>chalkAtom(ctx,cx+(j-2)*g,cy+(r-.5)*g*1.05,e==='Fe'?g*.42:g*.36,e,{seed:r*5+j+10})));
        txt(ctx,'离子按 2∶3 排列（示意）',cx,h-10,{size:12,weight:700,col:DIM});}});}
  const RO=[['1∶1','1∶2','2∶1'],['1∶1','2∶1','1∶2'],['1∶1','1∶2','2∶1'],['1∶1','3∶2','2∶3']];
  const AN=[0,1,1,2];
  const quiz=rowQuiz($('#raQ'),$('#raSub'),$('#raRedo'),$('#raSt'),D.map((d,i)=>[`${fmB(d[0])} <span class="hint">${d[5][0]}∶${d[5][1]}</span>`,RO[i],AN[i]]),{okMsg:'个数比不都是 1∶1。'});
  const sub0=$('#raSub').onclick;$('#raSub').onclick=()=>{sub0();if($$('#raQ .qrow.right,#raQ .qrow.wrong').length){answered=true;fill();}};
  function fill(){$$('.rc',cols).forEach((c,i)=>{$('.ans',c).textContent=answered||shown?`${D[i][5][0]}∶${D[i][5][1]} = ${D[i][4]}`:'';
      $('.fm',c).innerHTML=fm(D[i][0]);$('.eq',c).textContent='';});$('#raRule').classList.toggle('on',answered);requestAnimationFrame(draw);}
  $('#raReset').onclick=()=>{shown=false;answered=false;quiz.reset();fill();};
  fill();
  return{enter(){requestAnimationFrame(draw);}};})();

/* ================= 3 化合价的表示方法：把数字卡拖到正上方或右上角 ================= */
S.mark=(()=>{const cv=$('#cvMark');let t=0,base='Mg',val='',ion='',warn='',warnT=0,popT=0;const G={};
  const E={Mg:['镁','+2','2+'],Na:['钠','+1','+'],Al:['铝','+3','3+'],Cl:['氯','−1','−'],O:['氧','−2','2−']};
  const BASES=Object.keys(E);
  const VT=['+1','+2','+3','−1','−2'],IT=['+','2+','3+','−','2−'];
  const isVal=s=>VT.includes(s);
  function setWarn(s){warn=s;warnT=3.4;sfx('bad');}
  function put(slot,s){const[nm,v,io]=E[base];
    if(slot==='top'){if(!isVal(s)){setWarn('化合价标在元素符号正上方：正负号在前、数字在后，“1”不能省略');return;}if(s!==v){setWarn(`${nm}的常见化合价是 ${v} 价`);return;}val=s;}
    else{if(isVal(s)){setWarn('离子符号写在右上角：数字在前、正负号在后，“1”省略不写');return;}if(s!==io){setWarn(`${nm}离子应写作 ${base}${io.replace('−','⁻').replace('+','⁺').replace('2','²').replace('3','³')}`);return;}ion=s;}
    popT=0;sfx('drop');}
  $('#maBar').innerHTML=BASES.map(b=>`<button class="btn" data-b="${b}"><span class="fm">${b}</span></button>`).join('')+'<span class="sep"></span><button class="btn" id="maClear">清空</button>';
  $$('#maBar [data-b]').forEach(b=>b.onclick=()=>{base=b.dataset.b;val='';ion='';popT=0;sfx('click');bar();});
  const bar=()=>$$('#maBar [data-b]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.b===base)));
  $('#maClear').onclick=()=>{val='';ion='';sfx('click');};bar();
  const tiles=()=>G.w?[...VT,...IT].map((s,i)=>{const x=G.w/2+(i-4.5)*80,y=G.ty;return{id:s,x,y,r:32,draw:(c,x2,y2)=>{const vv=isVal(s);chalkRect(c,x2-30,y2-25,60,50,{col:vv?CY:CB,w:2.5,fill:'rgba(27,47,38,.95)',seed:i+3});txt(c,s,x2,y2+1,{size:24,weight:700,col:vv?CY:CB});}};}):[];
  const inBox=(b,x,y,pad=14)=>b&&x>b[0]-pad&&x<b[0]+b[2]+pad&&y>b[1]-pad&&y<b[1]+b[3]+pad;
  const ui=canvasUI(cv,{tools:tiles,hots:()=>G.w?[{hit:(x,y)=>inBox(G.top,x,y,0),act:()=>{val='';sfx('click');}},{hit:(x,y)=>inBox(G.cor,x,y,0),act:()=>{ion='';sfx('click');}}]:[],
    onDrop:(id,x,y)=>{if(inBox(G.top,x,y)){put('top',id);return true;}if(inBox(G.cor,x,y)){put('cor',id);return true;}return false;},
    onTap:id=>put(isVal(id)?'top':'cor',id)});
  function tick(dt){t+=dt;popT+=dt;if(warnT>0)warnT-=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;const[nm,v,io]=E[base];
    const sy=Math.max(210,h*.33),size=130,bw=fmDraw(ctx,base,0,0,size,{measure:true}),cx=w*.42,right=cx+bw/2;
    G.top=[cx-62,sy-205,124,70];G.cor=[right+8,sy-112,96,58];
    fmDraw(ctx,base,cx,sy,size);
    const slot=(b,s,col)=>{ctx.save();ctx.setLineDash([8,7]);ctx.lineWidth=2.5;ctx.strokeStyle=col;rr(ctx,b[0],b[1],b[2],b[3],12);ctx.stroke();ctx.restore();
      if(s){const q=ease(Math.min(1,popT*4));ctx.save();ctx.translate(b[0]+b[2]/2,b[1]+b[3]/2);ctx.scale(.6+.4*q,.6+.4*q);txt(ctx,s,0,2,{size:46,weight:700,col});ctx.restore();}};
    slot(G.top,val,CY);slot(G.cor,ion,CB);
    hand(ctx,'化合价：标在正上方',G.top[0]-16,G.top[1]+G.top[3]/2,{size:22,col:CY,align:'right'});
    hand(ctx,'离子：写在右上角',G.cor[0]+G.cor[2]+14,G.cor[1]+G.cor[3]/2,{size:22,col:CB,align:'left'});
    // 意义
    const my=sy+96;if(val)txt(ctx,`${nm}元素的化合价为 ${v} 价`,cx-30,my,{size:18,weight:700,col:CY,align:'right'});
    if(ion){const n=io.replace(/[+−]/,'')||'1';txt(ctx,`${nm}离子：1 个${nm}离子带 ${n} 个单位${io.includes('+')?'正':'负'}电荷`,cx+10,my,{size:18,weight:700,col:CB,align:'left'});}
    // 数字卡
    G.ty=my+78;if(warnT>0){ctx.globalAlpha=Math.min(1,warnT);chalkRect(ctx,w/2-330,G.ty-62,660,36,{col:BADC,fill:'rgba(60,20,24,.85)',seed:2});txt(ctx,warn,w/2,G.ty-44,{size:16,weight:700,col:BADC});ctx.globalAlpha=1;}
    else txt(ctx,'黄色卡是化合价，蓝色卡是离子电荷：拖到虚线框里（也可以直接点卡片）；点虚线框可以清空',w/2,G.ty-44,{size:14,weight:700,col:DIM});
    ui.draw(ctx);
    // 对比表
    const ty0=G.ty+50,rows=[['','化合价','离子符号'],['写在哪里','元素符号正上方','元素符号右上角'],['正负号与数字','正负号在前，数字在后','数字在前，正负号在后'],['数字“1”','不能省略','省略不写']],
      cw=[150,(w-130-150)/2,(w-130-150)/2],x0=65,rh=Math.min(40,(h-84-ty0)/4);
    rows.forEach((r,i)=>{let x=x0;r.forEach((c,j)=>{const y=ty0+i*rh;if(i===0||j===0)txt(ctx,c,x+cw[j]/2,y+rh/2,{size:i===0?20:16,weight:700,col:i===0?(j===1?CY:j===2?CB:INK):DIM,font:i===0?HAND:FNUM});
        else txt(ctx,c,x+cw[j]/2,y+rh/2,{size:17,weight:700,col:j===1?CY:CB});x+=cw[j];});
      if(i)chalkLine(ctx,x0,ty0+i*rh,x0+cw[0]+cw[1]+cw[2],ty0+i*rh,{col:'rgba(241,238,228,.35)',w:1.5,seed:i});});
    chalkLine(ctx,x0+cw[0],ty0,x0+cw[0],ty0+rh*4,{col:'rgba(241,238,228,.35)',w:1.5,seed:7});chalkLine(ctx,x0+cw[0]+cw[1],ty0,x0+cw[0]+cw[1],ty0+rh*4,{col:'rgba(241,238,228,.35)',w:1.5,seed:8});
  }
  const vlH=(top,sym)=>`<span class="fm"><span class="vl"><i>${top}</i><b>${sym}</b></span></span>`;
  const quiz=rowQuiz($('#maQ'),$('#maSub'),$('#maRedo'),$('#maSt'),[
    [vlH('+2','Mg'),['化合价','离子','写法错'],0],[fmB('Mg^2+'),['化合价','离子','写法错'],1],[vlH('2+','Mg'),['化合价','离子','写法错'],2],
    [vlH('+','Na'),['化合价','离子','写法错'],2],[fmB('Cl^-'),['化合价','离子','写法错'],1],[`${fmB('H2O{-2}')} <span class="hint">（O 上的 −2）</span>`,['化合价','离子','写法错'],0]],
    {okMsg:'化合价：正上方、符号在前、“1”不省略；离子：右上角、数字在前、“1”省略。'});
  $('#maReset').onclick=()=>{base='Mg';val='';ion='';bar();quiz.reset();};
  notes('mark','化合价的表示方法',[`化合价标在元素符号<mark>正上方</mark>：<mark>正负号在前、数字在后</mark>，“1”不省略。`,
    `离子符号的电荷写在<mark>右上角</mark>：<mark>数字在前、正负号在后</mark>，“1”省略。`,'同种元素的化合价与它的离子所带电荷：<mark>数值相等、正负相同</mark>。'],
    `${fmB('Mg^2+')} 表示镁离子，不表示镁元素的化合价。`,
    (ctx,w,h)=>{const L=(s,x,y,o={})=>txt(ctx,s,x,y,Object.assign({size:16,weight:700,col:PEN.ink},o)),my=h*.56,a=w*.25,b=w*.72;
      hand(ctx,'化合价',a,h*.08,{size:26,col:PEN.red});hand(ctx,'离子符号',b,h*.08,{size:26,col:PEN.blue});
      fmDraw(ctx,'Mg',a,my,60,{col:PEN.ink});txt(ctx,'+2',a,my-62,{size:30,weight:700,col:PEN.red});
      L('正上方',a-40,my-128,{col:PEN.red});arrow(ctx,a-30,my-116,a-8,my-84,{col:PEN.red,w:2,head:9});
      const mw=fmDraw(ctx,'Mg',0,0,60,{measure:true});fmDraw(ctx,'Mg^2+',b-14,my,60,{col:PEN.ink,cols:{sup:PEN.blue}});
      const sx=b-14+mw/2+14;L('右上角',sx+40,my-128,{col:PEN.blue});arrow(ctx,sx+34,my-116,sx+12,my-56,{col:PEN.blue,w:2,head:9});
      L('符号在前，“1”不省',a,my+56);L('数字在前，“1”省略',b,my+56);
      ctx.save();ctx.strokeStyle='rgba(42,42,36,.3)';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(w/2,h*.15);ctx.lineTo(w/2,h*.8);ctx.stroke();ctx.restore();
      hand(ctx,'数值相等  正负相同',w/2,h*.92,{size:24,col:PEN.green});});
  return{tick};})();
