/* ================= 1 封面：三袋化肥的含氮量扫描（全班投票，第 6 页开奖） ================= */
const VOTES=[0,0,0];
const BAGS=[['尿素','CO(NH2)2','#e8f4ff',CG],['碳酸氢铵','NH4HCO3','#dceeff',CC],['硫酸铵','(NH4)2SO4','#fff1d6',CA]];
/* 画一袋化肥：缝口的编织袋 + 标签 */
function drawBag(ctx,x,y,w,h,[nm,f,body,col],{scan=-1,t=0,glowA=0}={}){ctx.save();
  if(glowA){ctx.shadowColor=col;ctx.shadowBlur=30*glowA;}
  ctx.beginPath();ctx.moveTo(x+w*.08,y+h*.08);ctx.quadraticCurveTo(x+w/2,y-h*.02,x+w*.92,y+h*.08);ctx.quadraticCurveTo(x+w*1.04,y+h*.55,x+w*.96,y+h);
  ctx.quadraticCurveTo(x+w/2,y+h*1.06,x+w*.04,y+h);ctx.quadraticCurveTo(x-w*.04,y+h*.55,x+w*.08,y+h*.08);ctx.closePath();
  const g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,shade(body,-.25));g.addColorStop(.45,body);g.addColorStop(1,shade(body,-.35));ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;
  // 编织纹理
  ctx.save();ctx.clip();ctx.globalAlpha=.08;ctx.strokeStyle='#000';ctx.lineWidth=1;for(let i=0;i<w;i+=6){ctx.beginPath();ctx.moveTo(x+i,y);ctx.lineTo(x+i,y+h);ctx.stroke();}
  for(let j=0;j<h;j+=6){ctx.beginPath();ctx.moveTo(x,y+j);ctx.lineTo(x+w,y+j);ctx.stroke();}ctx.restore();
  // 缝线
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+w*.1,y+h*.12);ctx.quadraticCurveTo(x+w/2,y+h*.04,x+w*.9,y+h*.12);ctx.stroke();ctx.setLineDash([]);
  // 标签
  const lx=x+w*.14,ly=y+h*.26,lw=w*.72,lh=h*.5;ctx.fillStyle='rgba(255,255,255,.92)';rr(ctx,lx,ly,lw,lh,8);ctx.fill();ctx.fillStyle=col;ctx.fillRect(lx,ly,lw,lh*.2);
  txt(ctx,'化肥',lx+lw/2,ly+lh*.1,{size:lh*.12,weight:700,col:'#0b1118'});hand(ctx,nm,lx+lw/2,ly+lh*.4,{size:Math.min(lw/nm.length*.9,lh*.24),col:'#0b1118'});
  fmDraw(ctx,f,lx+lw/2,ly+lh*.64,lh*.13,{col:'#26323a'});txt(ctx,'净重 50 kg',lx+lw/2,ly+lh*.88,{size:lh*.1,weight:700,col:'#55616a'});
  // 扫描光带
  if(scan>=0&&scan<=1){const sy=y+h*scan;ctx.save();ctx.globalCompositeOperation='lighter';const sg=ctx.createLinearGradient(0,sy-18,0,sy+18);sg.addColorStop(0,'rgba(57,255,136,0)');sg.addColorStop(.5,'rgba(57,255,136,.55)');sg.addColorStop(1,'rgba(57,255,136,0)');
    ctx.fillStyle=sg;ctx.fillRect(x-10,sy-18,w+20,36);ctx.fillStyle='rgba(180,255,210,.9)';ctx.fillRect(x-10,sy-1,w+20,2);ctx.restore();}
  ctx.restore();}
S.cover=(()=>{const cv=$('#cvCover');let t=0;const G={};
  const ui=canvasUI(cv,{hots:()=>G.w?[...BAGS.map((b,i)=>({hit:(x,y)=>Math.abs(x-G.bx(i))<G.bw/2&&y>G.by&&y<G.by+G.bh,act:()=>{VOTES[i]++;sfx('pop');burstAt(cv,6,[BAGS[i][3]]);}})),
      {hit:(x,y)=>x>G.w-110&&y>G.h-48,act:()=>{VOTES.fill(0);sfx('click');}}]:[]});
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;G.h=h;
    hudBox(ctx,4,4,w-8,h-8,{fill:'rgba(8,14,20,.75)',corner:26});
    // 网格地板
    ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle=CC;ctx.lineWidth=1;for(let i=-10;i<=10;i++){ctx.beginPath();ctx.moveTo(w/2+i*60,h*.62);ctx.lineTo(w/2+i*160,h);ctx.stroke();}
    for(let j=0;j<6;j++){const yy=h*.62+(h*.38)*Math.pow(j/6,1.6);ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(w,yy);ctx.stroke();}ctx.restore();
    glow(ctx,'含氮量分析仪',w/2,40,{size:28,col:CC,font:HAND,weight:400});
    txt(ctx,'哪袋化肥中氮元素的质量分数最高？全班投票：点袋子 +1',w/2,76,{size:16,weight:700,col:DIM});
    G.bw=Math.min(220,w/3.5,(h-300)/1.25);G.bh=G.bw*1.25;G.by=Math.max(100,100+(h-150-(G.bh+170))/2);G.bx=i=>w/2+(i-1)*(G.bw+Math.min(46,w*.04));
    BAGS.forEach((b,i)=>{const x=G.bx(i)-G.bw/2,ph=(t*.45+i*.33)%1.6;drawBag(ctx,x,G.by+Math.sin(t*1.4+i)*3,G.bw,G.bh,b,{scan:ph<=1?ph:-1,t});
      // 读数：问号闪烁 + 进度条（不给假数字，第 6 页开奖）
      const ry=G.by+G.bh+46;hudBox(ctx,G.bx(i)-80,ry-24,160,48,{col:b[3],fill:'rgba(3,7,10,.85)',corner:10});
      ctx.save();ctx.globalAlpha=.55+.45*Math.abs(Math.sin(t*3+i));glow(ctx,'N  ??.?%',G.bx(i),ry,{size:24,col:b[3]});ctx.restore();
      const pq=(t*.35+i*.27)%1;ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(G.bx(i)-70,ry+16,140,3);ctx.fillStyle=b[3];ctx.fillRect(G.bx(i)-70,ry+16,140*pq,3);
      txt(ctx,'算出来才能揭晓',G.bx(i),ry+40,{size:13,weight:700,col:FAINT});
      // 票数
      const vy=ry+78;txt(ctx,'票数',G.bx(i)-50,vy,{size:14,weight:700,col:DIM});glow(ctx,String(VOTES[i]),G.bx(i)+20,vy,{size:30,col:INK,blur:8});});
    hudBox(ctx,w-104,h-44,94,32,{col:DIM,fill:'rgba(0,0,0,.4)',corner:8,glowA:0});txt(ctx,'票数清零',w-57,h-28,{size:14,weight:700,col:DIM});}
  return{tick};})();

/* ================= 2 相对分子质量：分子秤 ================= */
S.mr=(()=>{const cv=$('#cvMr');let t=0,cur='CO2',pan=[],fly=[],think=false,disp=0,doneT=-1,auto=null,warn='',warnT=0;const G={};
  const MOLS=['O2','H2O','CO2','CH4','CO(NH2)2','(NH4)2SO4'];// 不放右侧练习里的物质
  const NAME={O2:'氧气',H2O:'水',CO2:'二氧化碳',CH4:'甲烷','CO(NH2)2':'尿素','(NH4)2SO4':'硫酸铵'};
  const WTS=['H','C','N','O','S'];
  const need=()=>new Map(comp(cur));
  const have=()=>{const m=new Map();pan.forEach(e=>m.set(e,(m.get(e)||0)+1));return m;};
  const sum=()=>pan.reduce((a,e)=>a+AM[e],0);
  const complete=()=>{const n=need(),h=have();return[...n].every(([e,c])=>h.get(e)===c)&&[...h.keys()].every(e=>n.has(e));};
  function add(e,from){if(pan.length+fly.length>=24)return;const n=need(),h=have(),inFly=fly.filter(f=>f.e===e).length;
    if(!n.has(e)){warn=`${cur.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d])} 里没有 ${e} 原子`;warnT=2.4;sfx('bad');return;}
    if((h.get(e)||0)+inFly>=n.get(e)){warn=`${ELN[e]}原子已经放够 ${n.get(e)} 个了`;warnT=2.4;sfx('bad');return;}
    fly.push({e,x:from[0],y:from[1],t:0});sfx('pop');}
  function setMol(f){cur=f;pan=[];fly=[];doneT=-1;stop();sfx('click');}
  function stop(){if(auto){clearInterval(auto);auto=null;}}
  $('#mrAuto').onclick=()=>{stop();pan=[];fly=[];doneT=-1;const list=[];comp(cur).forEach(([e,n])=>{for(let i=0;i<n;i++)list.push(e);});let k=0;
    auto=setInterval(()=>{if(k>=list.length){stop();return;}const e=list[k++];add(e,G.wpos?G.wpos(WTS.indexOf(e)):[0,0]);},260);};
  $('#mrClear').onclick=()=>{stop();pan=[];fly=[];doneT=-1;sfx('click');};
  $('#mrThink').onclick=()=>{think=!think;$('#mrThink').setAttribute('aria-pressed',String(think));sfx('whoosh');};
  const ui=canvasUI(cv,{tools:()=>G.w&&!think?WTS.map((e,i)=>{const[x,y]=G.wpos(i);return{id:e,x,y,r:30,draw:(c,x2,y2)=>{atomBall(c,x2,y2,e==='H'?18:24,e);}};}):[],
    hots:()=>G.w&&!think?[...MOLS.map((f,i)=>({hit:(x,y)=>Math.abs(x-G.cx(i))<G.cw/2&&Math.abs(y-32)<20,act:()=>setMol(f)})),
      {hit:(x,y)=>Math.hypot((x-G.px)/G.pr,(y-G.py)/(G.pr*.35))<1.2,act:()=>{if(pan.length){pan.pop();doneT=-1;sfx('click');}}}]:[{hit:()=>true,act:()=>{think=false;$('#mrThink').setAttribute('aria-pressed','false');}}],
    onDrop:(id,x,y)=>{if(Math.abs(x-G.px)<G.pr*1.3&&y>G.py-170&&y<G.py+60){add(id,[x,y]);return true;}return false;},
    onTap:id=>add(id,G.wpos(WTS.indexOf(id)))});
  function tick(dt){t+=dt;if(warnT>0)warnT-=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;G.h=h;
    // 顶部：物质卡片
    G.cw=Math.min(130,(w-40)/MOLS.length-8);G.cx=i=>w/2+(i-(MOLS.length-1)/2)*(G.cw+8);
    MOLS.forEach((f,i)=>{const on=f===cur;hudBox(ctx,G.cx(i)-G.cw/2,12,G.cw,40,{col:on?CG:'rgba(63,216,255,.5)',fill:on?'rgba(57,255,136,.14)':'rgba(0,0,0,.35)',corner:8,glowA:on?1:0});fmDraw(ctx,f,G.cx(i),32,f.length>6?16:19,{col:on?CG:INK});});
    // 左：砝码架
    G.wpos=i=>[70,150+i*((h-235)/(WTS.length-.4))];
    hudBox(ctx,22,78,96,h-150,{col:'rgba(63,216,255,.6)',fill:'rgba(0,0,0,.3)',corner:12});txt(ctx,'原子砝码',70,100,{size:14,weight:700,col:DIM});
    ui.draw(ctx);WTS.forEach((e,i)=>{const[x,y]=G.wpos(i);glow(ctx,String(AM[e]),x,y+38,{size:16,col:CA,blur:6});});
    // 中：电子秤
    G.pr=Math.min(200,w*.19,h*.3);G.px=Math.max(130+G.pr*1.15,w*.43);G.py=h*.5;
    const S=sum(),complete_=complete();if(complete_&&doneT<0&&!fly.length){doneT=0;sfx('ok');burstAt(cv,24,[CG,CC]);}if(doneT>=0)doneT+=dt;
    disp=lerp(disp,S,1-Math.exp(-dt*8));if(Math.abs(disp-S)<.05)disp=S;
    // 秤体
    const bx=G.px-G.pr*1.1,by=G.py+G.pr*.28+26,bw=G.pr*2.2,bh=112,okc=complete_?CG:CC;
    // 全息投影柱：从秤盘边缘升起的光幕 + 上升的扫描环
    ctx.save();ctx.globalCompositeOperation='lighter';const hg=ctx.createLinearGradient(0,G.py-190,0,G.py);hg.addColorStop(0,'rgba(63,216,255,0)');hg.addColorStop(1,complete_?'rgba(57,255,136,.22)':'rgba(63,216,255,.16)');
    ctx.fillStyle=hg;ctx.beginPath();ctx.moveTo(G.px-G.pr,G.py);ctx.lineTo(G.px-G.pr*.82,G.py-190);ctx.lineTo(G.px+G.pr*.82,G.py-190);ctx.lineTo(G.px+G.pr,G.py);ctx.closePath();ctx.fill();
    for(let k=0;k<3;k++){const q=(t*.45+k/3)%1,yy=G.py-q*190,rx=G.pr*(1-q*.18);ctx.globalAlpha=(1-q)*.7;ctx.strokeStyle=okc;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(G.px,yy,rx,rx*.28,0,0,TAU);ctx.stroke();}
    ctx.globalAlpha=1;for(let k=0;k<14;k++){const a=k/14*TAU+t*.3,q=(t*.6+k*.37)%1;ctx.fillStyle=okc;ctx.globalAlpha=(1-q)*.8;ctx.beginPath();ctx.arc(G.px+Math.cos(a)*G.pr*.9,G.py+Math.sin(a)*G.pr*.25-q*170,1.8,0,TAU);ctx.fill();}ctx.restore();
    // 秤体：斜面机身 + 指示灯 + 底脚
    ctx.save();const bg=ctx.createLinearGradient(0,by,0,by+bh);bg.addColorStop(0,'#223241');bg.addColorStop(1,'#0a1016');ctx.fillStyle=bg;
    ctx.beginPath();ctx.moveTo(bx+24,by);ctx.lineTo(bx+bw-24,by);ctx.lineTo(bx+bw,by+bh);ctx.lineTo(bx,by+bh);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(63,216,255,.55)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#05090d';[bx+30,bx+bw-50].forEach(x=>{rr(ctx,x,by+bh,20,10,3);ctx.fill();});ctx.restore();
    [0,1,2].forEach(k=>{const on=k===0||(k===1&&pan.length>0)||(k===2&&complete_);ctx.save();ctx.fillStyle=on?[CC,CA,CG][k]:'#26323a';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=on?10:0;ctx.beginPath();ctx.arc(bx+bw-56+k*16,by+bh-18,4.5,0,TAU);ctx.fill();ctx.restore();});
    txt(ctx,['ON','LOAD','OK'].join('   '),bx+bw-40,by+bh-34,{size:9,weight:700,col:FAINT});
    // 读数屏
    const lx=G.px-130,ly=by+24;ctx.fillStyle='#020507';rr(ctx,lx,ly,260,62,8);ctx.fill();ctx.strokeStyle=complete_?CG:CA;ctx.lineWidth=1.5;ctx.stroke();
    ctx.save();ctx.globalAlpha=.06;glow(ctx,'888.8',lx+236,ly+33,{size:42,col:CA,align:'right',blur:0});ctx.restore();
    glow(ctx,(Math.round(disp*10)/10).toString(),lx+236,ly+33,{size:42,col:complete_?CG:CA,align:'right'});txt(ctx,'M',lx+18,ly+31,{size:18,weight:700,col:DIM,align:'left'});txt(ctx,'r',lx+33,ly+39,{size:12,weight:700,col:DIM,align:'left'});
    // 托盘
    line(ctx,G.px,G.py+G.pr*.28,G.px,by,{col:'rgba(63,216,255,.55)',w:8});
    ctx.save();const pg=ctx.createRadialGradient(G.px,G.py,4,G.px,G.py,G.pr);pg.addColorStop(0,'rgba(63,216,255,.28)');pg.addColorStop(1,'rgba(63,216,255,.06)');ctx.fillStyle=pg;ctx.strokeStyle=complete_?CG:'rgba(63,216,255,.85)';ctx.lineWidth=2.5;ctx.shadowColor=okc;ctx.shadowBlur=16;ctx.beginPath();ctx.ellipse(G.px,G.py,G.pr,G.pr*.28,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;ctx.strokeStyle='rgba(63,216,255,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(G.px,G.py,G.pr*.7,G.pr*.19,0,0,TAU);ctx.stroke();ctx.restore();
    // 秤盘上的原子：按放入顺序堆成小山
    const pos=k=>{const per=Math.max(5,Math.floor(G.pr*1.6/34)),row=Math.floor(k/per),col=k%per,n=Math.min(per,pan.length-row*per);return[G.px+(col-(n-1)/2)*34+(row%2?8:0),G.py-14-row*28];};
    pan.forEach((e,k)=>{const[x,y]=pos(k);atomBall(ctx,x,y,e==='H'?12:16,e);});
    fly=fly.filter(f=>{f.t+=dt*2.6;const k=pan.length,[tx,ty]=pos(k),q=ease(Math.min(1,f.t)),x=lerp(f.x,tx,q),y=lerp(f.y,ty,q)-Math.sin(q*Math.PI)*90;atomBall(ctx,x,y,f.e==='H'?12:16,f.e);
      if(f.t>=1){pan.push(f.e);sfx('drop');return false;}return true;});
    // 算式
    const ex=comp(cur).map(([e,n])=>{const c=have().get(e)||0;return n>1?`${AM[e]}×${c}`:c?`${AM[e]}`:'0';}).join(' + ');
    if(pan.length||fly.length)hand(ctx,`${ex} = ${S}`,G.px,by+bh+34,{size:26,col:complete_?CG:INK});else txt(ctx,'秤盘是空的：放上原子开始称量',G.px,by+bh+34,{size:16,weight:700,col:FAINT});
    // 右：目标清单
    const rx=w*.8,ry=110;hudBox(ctx,rx-120,ry-34,240,Math.max(200,comp(cur).length*44+170),{col:'rgba(63,216,255,.6)',fill:'rgba(0,0,0,.35)',corner:12});
    txt(ctx,NAME[cur],rx,ry-12,{size:15,weight:700,col:DIM});fmDraw(ctx,cur,rx,ry+28,cur.length>6?30:40,{col:INK,glowB:6});
    comp(cur).forEach(([e,n],i)=>{const c=have().get(e)||0,y=ry+86+i*44,ok=c===n;atomBall(ctx,rx-80,y,13,e);txt(ctx,`${ELN[e]}原子`,rx-60,y,{size:16,weight:700,align:'left'});
      glow(ctx,`${c} / ${n}`,rx+92,y,{size:20,col:ok?CG:CA,align:'right',blur:ok?10:4});});
    const yy=ry+86+comp(cur).length*44;
    if(doneT>=0){const q=Math.min(1,doneT*3);ctx.save();ctx.globalAlpha=q;glow(ctx,`Mr = ${Mr(cur)}`,rx,yy+10,{size:30,col:CG,font:FNUM});ctx.restore();}
    else txt(ctx,'拖原子砝码到秤盘（或直接点）',rx,yy+10,{size:13,weight:700,col:DIM});
    if(warnT>0){ctx.save();ctx.globalAlpha=Math.min(1,warnT);hudBox(ctx,G.px-200,82,400,40,{col:BADC,fill:'rgba(40,6,10,.9)',corner:8});txt(ctx,warn,G.px,102,{size:16,weight:700,col:BADC});ctx.restore();}
    else if(pan.length)txt(ctx,'点秤盘可以拿走最后放上的原子',G.px,102,{size:13,weight:700,col:FAINT});
    // 想一想
    if(think){ctx.save();ctx.fillStyle='rgba(3,6,9,.86)';ctx.fillRect(0,0,w,h);ctx.restore();const cx=w/2,cy=h/2-30;hudBox(ctx,cx-380,cy-190,760,410,{col:CA,fill:'rgba(14,12,4,.92)',corner:22});
      glow(ctx,'想一想：元素符号右下角的数字如何处理？',cx,cy-150,{size:24,col:CA,font:HAND,weight:400});
      fmDraw(ctx,'H2O',cx-200,cy-70,56,{col:INK,cols:{sub:CG}});arrow(ctx,cx-150,cy-30,cx-150,cy,{col:CG,w:2.5,head:10});
      txt(ctx,'右下角的 2 = 1 个分子中有 2 个氢原子',cx-150,cy+22,{size:17,weight:700,col:CG});
      hand(ctx,'1 × 2 + 16 = 18',cx+170,cy-62,{size:34,col:CA});txt(ctx,'相对原子质量 × 原子个数，再相加',cx+170,cy-14,{size:17,weight:700,col:INK});
      line(ctx,cx-340,cy+60,cx+340,cy+60,{col:'rgba(255,176,0,.35)',w:1.5,dash:[6,6]});
      fmDraw(ctx,'CO(NH2)2',cx-200,cy+110,40,{col:INK,cols:{sub:CG}});hand(ctx,'12 + 16 + (14 + 1×2)×2 = 60',cx+150,cy+110,{size:26,col:CA});
      txt(ctx,'括号外的数字：括号里每种原子都要乘上它',cx,cy+156,{size:16,weight:700,col:DIM});
      txt(ctx,'相对分子质量的单位是“1”，一般不写，不是“g”。点任意处关闭',cx,cy+192,{size:15,weight:700,col:FAINT});}}
  const kp=kpQuiz($('#mrKp'),[
    {q:`乙醇 ${fmB('C2H5OH')} 的相对分子质量`,ans:46,why:'12×2 + 1×6 + 16 = 46（H 一共 5+1 = 6 个）'},
    {q:`过氧化氢 ${fmB('H2O2')} 的相对分子质量`,ans:34,why:'1×2 + 16×2 = 34'},
    {q:`碳酸钙 ${fmB('CaCO3')} 的相对分子质量`,ans:100,why:'40 + 12 + 16×3 = 100'},
    {q:`硫酸亚铁 ${fmB('FeSO4')} 的相对分子质量`,ans:152,why:'56 + 32 + 16×4 = 152'},
    {q:`氯化钠 ${fmB('NaCl')} 的相对分子质量（Cl 取 35.5）`,ans:58.5,why:'23 + 35.5 = 58.5'}]);
  $('#mrReset').onclick=()=>{setMol('CO2');think=false;$('#mrThink').setAttribute('aria-pressed','false');kp.reset();};
  notes('mr','相对分子质量',['化学式中各原子的<mark>相对原子质量的总和</mark>，就是相对分子质量（符号 M<sub>r</sub>）。','元素符号右下角的数字是原子个数：<mark>相对原子质量 × 原子个数</mark>，再相加。','括号外的数字要乘括号里的每一种原子。','相对分子质量的单位是“1”，一般<mark>不写</mark>。'],
    '不能写成“44 g”；2H₂O 表示 2 个水分子，水的相对分子质量仍是 18。',
    (ctx,w,h)=>{txt(ctx,'CO₂ 的相对分子质量',w/2,26,{size:18,weight:700,col:PEN.ink});
      const cy=110;[[w/2-70,'O'],[w/2,'C'],[w/2+70,'O']].forEach(([x,e])=>{ctx.fillStyle=e==='C'?'#5b6878':'#e85d5d';ctx.beginPath();ctx.arc(x,cy,26,0,TAU);ctx.fill();txt(ctx,e,x,cy+1,{size:20,weight:700,col:'#fff'});txt(ctx,String(AM[e]),x,cy+48,{size:18,weight:700,col:PEN.gold});});
      ctx.strokeStyle=PEN.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w/2-110,cy+76);ctx.lineTo(w/2+110,cy+76);ctx.stroke();
      hand(ctx,'12 + 16 × 2 = 44',w/2,cy+112,{size:30,col:PEN.blue});
      penBox(ctx,30,cy+150,w-60,90,PEN.green,[6,5]);txt(ctx,'CO(NH₂)₂：12 + 16 + (14 + 1×2)×2',w/2,cy+180,{size:17,weight:700,col:PEN.green});txt(ctx,'= 60（括号外的 2 乘进去）',w/2,cy+212,{size:17,weight:700,col:PEN.green});});
  return{tick,leave(){stop();}};})();
