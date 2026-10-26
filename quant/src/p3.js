/* 画 Mr（r 写成下标） */
function mrLab(ctx,x,y,size,rest,{col=INK,align='left',glowB=0}={}){ctx.save();if(glowB){ctx.shadowColor=col;ctx.shadowBlur=glowB;}ctx.textBaseline='middle';ctx.fillStyle=col;
  ctx.font=`700 ${size}px ${FNUM}`;const wM=ctx.measureText('M').width;ctx.font=`700 ${size*.6}px ${FNUM}`;const wr=ctx.measureText('r').width;ctx.font=`700 ${size}px ${FNUM}`;const wR=ctx.measureText(rest).width,W=wM+wr+2+wR;
  let x0=align==='center'?x-W/2:align==='right'?x-W:x;ctx.textAlign='left';ctx.fillText('M',x0,y);ctx.font=`700 ${size*.6}px ${FNUM}`;ctx.fillText('r',x0+wM+1,y+size*.22);ctx.font=`700 ${size}px ${FNUM}`;ctx.fillText(rest,x0+wM+wr+2,y);ctx.restore();return W;}

/* ================= 5 元素质量分数：质量饼图 + 教材例题 ================= */
S.pct=(()=>{const cv=$('#cvPct');let t=0,cur='(NH4)2SO4',sel=0,mode='pie',step=0,selT=0,stepT=0,ps=0,psT=0;const G={};
  // 前 2 个是讲解例子，后 5 个对应右侧练习（尿素留到第 6 页）；计算过程点“下一步”才逐步出现
  const MOLS=['(NH4)2SO4','CO2','CaCO3','Fe2O3','SO2','NH4NO3','H2O'],NEX=2,SEL0={SO2:1};
  const NAME={H2O:'水',CO2:'二氧化碳',CaCO3:'碳酸钙',Fe2O3:'氧化铁',SO2:'二氧化硫',NH4NO3:'硝酸铵','(NH4)2SO4':'硫酸铵'};
  const SEEN={};const seen=()=>SEEN[cur]||(SEEN[cur]={mr:false,el:new Set()});
  const cols=[CA,CC,CG,CM,CV];
  function setMol(f){cur=f;sel=SEL0[f]||0;selT=0;ps=0;psT=0;sfx('click');}
  function pick(k){sel=k;selT=0;ps=seen().el.has(k)?3:0;psT=0;sfx('pop');}
  function setMode(m){mode=m;$('#pcPie').setAttribute('aria-pressed',String(m==='pie'));$('#pcEx').setAttribute('aria-pressed',String(m==='ex'));if(m==='ex'){step=0;stepT=0;}sfx('whoosh');}
  $('#pcPie').onclick=()=>setMode('pie');$('#pcEx').onclick=()=>setMode('ex');
  $('#pcStep').onclick=()=>{if(mode==='ex'){step=step>=5?0:step+1;stepT=0;sfx(step?'pop':'click');}else{if(ps<3){ps++;psT=0;if(ps>=1)seen().mr=true;if(ps===3){seen().el.add(sel);burstAt(cv,16,[cols[sel%5]]);}sfx(ps===3?'ok':'pop');}else pick((sel+1)%comp(cur).length);}};
  const ui=canvasUI(cv,{hots:()=>G.w&&mode==='pie'?[...MOLS.map((f,i)=>({hit:(x,y)=>Math.abs(x-G.cx(i))<G.cw/2&&Math.abs(y-32)<20,act:()=>setMol(f)})),
      {hit:(x,y)=>{const d=Math.hypot(x-G.ox,y-G.oy);return d>G.R*.55&&d<G.R*1.1;},act:(x,y)=>{let a=Math.atan2(y-G.oy,x-G.ox)+Math.PI/2;if(a<0)a+=TAU;const k=G.slices.findIndex(s=>a>=s[0]&&a<s[1]);if(k>=0)pick(k);}},
      {hit:(x,y)=>x>G.w*.56&&y>96&&y<G.h-104,act:()=>$('#pcStep').click()}]:[]});
  function tick(dt){t+=dt;selT+=dt;stepT+=dt;psT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;G.h=h;
    $('#pcStep').textContent=mode==='ex'?'下一步':ps<3?'下一步':'换一种元素';
    if(mode==='ex'){drawEx(ctx,w,h);return;}
    molTabs(ctx,G,MOLS,cur,NEX,w,{maxW:124});
    const P=comp(cur),M=Mr(cur);G.ox=w*.3;G.oy=h*.52;G.R=Math.min(190,h*.32);
    // 饼图（环形），选中的一块向外弹出
    let a0=0;G.slices=[];const grow=ease(Math.min(1,selT*2.5));
    P.forEach(([e,n],i)=>{const m=AM[e]*n,da=m/M*TAU,a1=a0+da,on=i===sel,off=on?14*grow:0,mid=a0+da/2-Math.PI/2;G.slices.push([a0,a1]);
      ctx.save();ctx.translate(Math.cos(mid)*off,Math.sin(mid)*off);ctx.shadowColor=cols[i%5];ctx.shadowBlur=on?24:6;ctx.fillStyle=on?cols[i%5]:shade(cols[i%5],-.35);
      ctx.beginPath();ctx.arc(G.ox,G.oy,G.R,a0-Math.PI/2,a1-Math.PI/2);ctx.arc(G.ox,G.oy,G.R*.58,a1-Math.PI/2,a0-Math.PI/2,true);ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.strokeStyle=BGC;ctx.lineWidth=3;ctx.stroke();
      const lx=G.ox+Math.cos(mid)*G.R*.79,ly=G.oy+Math.sin(mid)*G.R*.79;if(da>.25)txt(ctx,e,lx,ly,{size:20,weight:700,col:'#081018'});ctx.restore();a0=a1;});
    // 中心：Mr（点“下一步”后才显示）
    const SN=seen();txt(ctx,NAME[cur],G.ox,G.oy-28,{size:15,weight:700,col:DIM});mrLab(ctx,G.ox,G.oy+8,30,SN.mr?` = ${M}`:' = ?',{col:SN.mr?INK:CA,align:'center',glowB:8});
    // 扫描环
    ctx.save();ctx.strokeStyle='rgba(63,216,255,.35)';ctx.setLineDash([4,10]);ctx.lineDashOffset=-t*20;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(G.ox,G.oy,G.R+26,0,TAU);ctx.stroke();ctx.restore();
    txt(ctx,'点饼图的一块选元素，点“下一步”逐步揭晓',G.ox,G.oy+G.R+56,{size:14,weight:700,col:FAINT});
    // 右：计算过程（逐步出现，没出现的位置显示“?”）
    const[e,n]=P[sel],m=AM[e]*n,pc=m/M*100,rx=w*.58,c=cols[sel%5],fa=k=>ps>k?1:ps===k?Math.min(1,psT*2.5):0;
    hudBox(ctx,rx-20,96,w-rx-10,h-200,{col:c,fill:'rgba(0,0,0,.35)',corner:14});
    txt(ctx,`${ELN[e]}元素的质量分数`,rx,130,{size:22,weight:700,col:c,align:'left'});
    const qm=(x,y,size,al='left')=>{ctx.save();ctx.globalAlpha=.55+.45*Math.abs(Math.sin(t*3));glow(ctx,'?',x,y,{size,col:CA,align:al,blur:10});ctx.restore();};
    const fy=220,fx=rx+10,fname=`(${cur.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d])})`;txt(ctx,'=',fx,fy,{size:28,weight:700,align:'left'});
    const num=n>1?`${AM[e]} × ${n}`:`${AM[e]}`;ctx.font=`700 26px ${FNUM}`;const nw=Math.max(ctx.measureText(num).width,mrLab(ctx,0,-999,24,fname,{col:'rgba(0,0,0,0)'}))+20;
    line(ctx,fx+30,fy,fx+30+nw,fy,{col:INK,w:2});txt(ctx,'× 100%',fx+40+nw,fy,{size:24,weight:700,col:INK,align:'left'});
    if(ps>=1){ctx.save();ctx.globalAlpha=fa(0);txt(ctx,num,fx+30+nw/2,fy-24,{size:26,weight:700,col:c});mrLab(ctx,fx+30+nw/2,fy+24,24,fname,{col:INK,align:'center'});ctx.restore();}
    else{txt(ctx,`${e} 的相对原子质量 × 原子个数`,fx+30+nw/2,fy-24,{size:14,weight:700,col:DIM});mrLab(ctx,fx+30+nw/2,fy+24,20,fname,{col:DIM,align:'center'});}
    if(ps>=2){ctx.save();ctx.globalAlpha=fa(1);txt(ctx,`= ${m} / ${M} × 100%`,fx,fy+80,{size:24,weight:700,col:INK,align:'left'});ctx.restore();}else if(ps===1)qm(fx+20,fy+80,26);
    if(ps>=3){ctx.save();ctx.globalAlpha=fa(2);const sc=1+.25*(1-ease(Math.min(1,psT*2)));ctx.translate(fx,fy+140);ctx.scale(sc,sc);glow(ctx,`= ${fmt1(pc)}%`,0,0,{size:44,col:c,align:'left'});ctx.restore();
      if(Math.abs(pc*10-Math.round(pc*10))>1e-6)txt(ctx,'除不尽时保留一位小数',fx,fy+190,{size:14,weight:700,col:FAINT,align:'left'});}
    else if(ps===2){txt(ctx,'=',fx,fy+140,{size:44,weight:700,col:c,align:'left'});qm(fx+44,fy+140,44);}
    txt(ctx,['先想：要用哪两个量？点“下一步”','代入数据，算出来了吗？点“下一步”','最后一步：算出百分数，点“下一步”',''][ps],fx,h-160,{size:14,weight:700,col:DIM,align:'left'});
    // 图例：揭晓过的元素才显示百分数
    P.forEach(([e2,n2],i)=>{const lx=rx+i*((w-rx-30)/P.length);atomBall(ctx,lx+10,h-120,10,e2,{glowA:.4});txt(ctx,SN.el.has(i)?`${fmt1(AM[e2]*n2/M*100)}%`:'?%',lx+26,h-120,{size:15,weight:700,col:i===sel?cols[i%5]:DIM,align:'left'});});}
  // 教材例题：逐行出现，像终端输出
  function drawEx(ctx,w,h){const x0=60,lines=[
      ['题目','计算化肥硫酸铵 (NH₄)₂SO₄ 中氮元素的质量分数（保留一位小数）',DIM],
      ['① 先算相对分子质量','(14 + 1×4)×2 + 32 + 16×4 = 132',CC],
      ['② 写出公式','N 的质量分数 = N 的相对原子质量 × N 的原子数 ÷ (NH₄)₂SO₄ 的相对分子质量 × 100%',INK],
      ['③ 代入数据','= 14 × 2 ÷ 132 × 100%',CA],
      ['④ 算出结果','≈ 21.2%',CG]];
    hudBox(ctx,30,20,w-60,h-110,{col:'rgba(57,255,136,.55)',fill:'rgba(2,8,5,.7)',corner:18});
    glow(ctx,'教材例题 · 分步演示',x0,56,{size:22,col:CG,align:'left',font:HAND,weight:400});
    const rh=(h-250)/5;lines.forEach(([cap,body,c],i)=>{if(i>step)return;const y=100+i*rh,fresh=i===step,n=fresh?Math.floor(Math.min(1,stepT*1.5)*body.length):body.length;
      txt(ctx,'> '+cap,x0,y+10,{size:16,weight:700,col:DIM,align:'left'});
      if(i===4){glow(ctx,body.slice(0,n),x0+20,y+rh*.55,{size:44,col:c,align:'left'});}
      else txt(ctx,body.slice(0,n)+(fresh&&n<body.length&&Math.sin(t*12)>0?'▌':''),x0+20,y+rh*.55,{size:i===2?20:26,weight:700,col:c,align:'left'});});
    if(step===0)txt(ctx,'点“下一步”逐步演示',w/2,h-120,{size:16,weight:700,col:FAINT});
    if(step>=4){// 饼图小图标
      const ox=w-170,oy=h-210,R=70;[[28,CC],[104,DIM]].reduce((a0,[m,c])=>{const a1=a0+m/132*TAU;ctx.save();ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=c===CC?14:0;ctx.beginPath();ctx.moveTo(ox,oy);ctx.arc(ox,oy,R,a0-Math.PI/2,a1-Math.PI/2);ctx.closePath();ctx.fill();ctx.restore();return a1;},0);
      txt(ctx,'N 占 21.2%',ox,oy+R+24,{size:15,weight:700,col:CC});}
    if(step>=5)txt(ctx,'答：硫酸铵中氮元素的质量分数约为 21.2%',x0+20,h-116,{size:20,weight:700,col:CG,align:'left'});}
  const kp=kpQuiz($('#pcKp'),[
    {q:`碳酸钙 ${fmB('CaCO3')} 中钙元素的质量分数`,ans:40,unit:'%',tol:.05,why:'40 ÷ 100 × 100% = 40%'},
    {q:`氧化铁 ${fmB('Fe2O3')} 中铁元素的质量分数`,ans:70,unit:'%',tol:.05,why:'56×2 ÷ 160 × 100% = 70%'},
    {q:`二氧化硫 ${fmB('SO2')} 中氧元素的质量分数`,ans:50,unit:'%',tol:.05,why:'16×2 ÷ 64 × 100% = 50%'},
    {q:`硝酸铵 ${fmB('NH4NO3')} 中氮元素的质量分数`,ans:35,unit:'%',tol:.05,why:'14×2 ÷ 80 × 100% = 35%（两个 N 都要算）'},
    {q:`水 ${fmB('H2O')} 中氢元素的质量分数（保留一位小数）`,ans:11.1,unit:'%',tol:.05,dp:1,why:'1×2 ÷ 18 × 100% ≈ 11.1%'}]);
  $('#pcReset').onclick=()=>{for(const k in SEEN)delete SEEN[k];setMol('(NH4)2SO4');setMode('pie');kp.reset();};
  notes('pct','计算物质中某元素的质量分数',['某元素的质量分数 = <mark>该元素的质量与组成物质的元素总质量之比</mark>。','某元素的质量分数 = <mark>相对原子质量 × 原子个数 ÷ 相对分子质量 × 100%</mark>。','结果写成百分数，除不尽时按要求保留小数。'],
    '分子里同种原子有几个，就要乘几：(NH₄)₂SO₄ 中 N 有 2 个。',
    (ctx,w,h)=>{const ox=w*.3,oy=h*.44,R=92;[[12,'#5b6878','C 27.3%'],[32,'#e85d5d','O 72.7%']].reduce((a0,[m,c,l])=>{const a1=a0+m/44*TAU;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(ox,oy);ctx.arc(ox,oy,R,a0-Math.PI/2,a1-Math.PI/2);ctx.closePath();ctx.fill();
        const mid=(a0+a1)/2-Math.PI/2,[e,pc]=l.split(' ');txt(ctx,e,ox+Math.cos(mid)*R*.6,oy+Math.sin(mid)*R*.6-9,{size:17,weight:700,col:'#fff'});txt(ctx,pc,ox+Math.cos(mid)*R*.6,oy+Math.sin(mid)*R*.6+10,{size:14,weight:700,col:'#fff'});return a1;},0);
      txt(ctx,'CO₂ 的相对分子质量 = 44',ox,oy+R+34,{size:16,weight:700,col:PEN.ink});
      txt(ctx,'C 的质量分数',w*.78,oy-70,{size:16,weight:700,col:PEN.ink});
      txt(ctx,'12',w*.78,oy-30,{size:26,weight:700,col:PEN.gold});ctx.strokeStyle=PEN.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.66,oy-8);ctx.lineTo(w*.9,oy-8);ctx.stroke();
      txt(ctx,'44',w*.78,oy+16,{size:26,weight:700,col:PEN.ink});txt(ctx,'× 100% ≈ 27.3%',w*.78,oy+56,{size:20,weight:700,col:PEN.red});});
  return{tick};})();

/* ================= 6 揭晓：三袋化肥含氮量开奖 ================= */
S.fert=(()=>{const cv=$('#cvFert');let t=0,go=false,gT=0,lastTk=0,fin=false;const G={},sp=[];
  const judged=[0,0,0],PC=[28/60*100,14/79*100,28/132*100],KG=PC.map(p=>50*p/100),EXP=['14×2 ÷ 60','14 ÷ 79','14×2 ÷ 132'];
  $('#feGo').onclick=()=>{if(go&&!fin)return;go=true;fin=false;gT=0;lastTk=0;sfx('whoosh');};
  function tick(dt){t+=dt;if(go)gT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    hudBox(ctx,4,4,w-8,h-8,{fill:'rgba(8,14,20,.6)',corner:24});
    glow(ctx,go?'氮元素的质量分数 · 开奖':'先算一算，再开奖',w/2,38,{size:26,col:CC,font:HAND,weight:400});
    const top=78,bot=h-96,rh=(bot-top)/3,bh=Math.min(rh*.86,150),bw=bh/1.25,lx=28,tx=lx+bw+150,tr=w-46,best=0;
    const X=p=>tx+(tr-tx)*p/60;
    // 刻度
    for(let p=0;p<=60;p+=10){line(ctx,X(p),top,X(p),bot,{col:p?'rgba(63,216,255,.14)':'rgba(63,216,255,.45)',w:p?1:2,dash:p?[4,6]:null});txt(ctx,p+'%',X(p),bot+16,{size:13,weight:700,col:FAINT});}
    // 开奖鼓点
    const roll=go&&gT<2.8;if(roll&&gT-lastTk>.09){lastTk=gT;sfx('tick');}
    if(go&&gT>=2.8&&!fin){fin=true;sfx('win');FX.confetti();burstAt(cv,40,[CG,CA,CC]);}
    BAGS.forEach((b,i)=>{const cy=top+rh*(i+.5),q=go?ease(clamp((gT-i*.3)/2.2,0,1)):0,val=PC[i]*q,win=fin&&i===best;
      if(win){ctx.save();ctx.globalAlpha=.16+.08*Math.sin(t*4);ctx.fillStyle=CG;rr(ctx,lx-8,cy-rh/2+4,w-lx*2+16-20,rh-8,14);ctx.fill();ctx.restore();}
      drawBag(ctx,lx,cy-bh/2,bw,bh,b,{glowA:win?(.6+.4*Math.sin(t*5)):0});
      txt(ctx,b[0],lx+bw+16,cy-26,{size:20,weight:700,col:INK,align:'left'});
      if(judged[i]&&!fin){const ok=judged[i]===1;ctx.fillStyle=ok?'rgba(57,255,136,.18)':'rgba(255,93,108,.18)';rr(ctx,lx+bw+16,cy+24,64,22,6);ctx.fill();txt(ctx,ok?'✓ 已算对':'✗ 再看看',lx+bw+48,cy+35,{size:12,weight:700,col:ok?CG:BADC});}
      txt(ctx,'投票',lx+bw+16,cy+6,{size:13,weight:700,col:FAINT,align:'left'});glow(ctx,String(VOTES[i]),lx+bw+56,cy+6,{size:24,col:b[3],align:'left',blur:6});
      if(fin)txt(ctx,EXP[i],lx+bw+16,cy+36,{size:14,weight:700,col:DIM,align:'left'});
      // 轨道
      const th=Math.min(34,rh*.3);ctx.fillStyle='rgba(255,255,255,.05)';rr(ctx,tx,cy-th/2,tr-tx,th,th/2);ctx.fill();
      if(!go){const sx=tx+((t*.4+i*.3)%1)*(tr-tx);const sg=ctx.createLinearGradient(sx-80,0,sx,0);sg.addColorStop(0,'rgba(63,216,255,0)');sg.addColorStop(1,'rgba(63,216,255,.35)');ctx.fillStyle=sg;ctx.fillRect(Math.max(tx,sx-80),cy-th/2,Math.min(80,sx-tx),th);
        ctx.save();ctx.globalAlpha=.55+.45*Math.abs(Math.sin(t*3+i));glow(ctx,'??.?%',tr-6,cy-th/2-16,{size:22,col:b[3],align:'right'});ctx.restore();return;}
      const ex=X(val);ctx.save();const g=ctx.createLinearGradient(tx,0,ex,0);g.addColorStop(0,shade(b[3],-.55));g.addColorStop(1,b[3]);ctx.fillStyle=g;ctx.shadowColor=b[3];ctx.shadowBlur=20;rr(ctx,tx,cy-th/2,Math.max(th,ex-tx),th,th/2);ctx.fill();ctx.restore();
      // 前沿火花
      if(q<1&&q>0){for(let k=0;k<3;k++)sp.push({x:ex,y:cy+(Math.random()-.5)*th,vx:-60-Math.random()*120,vy:(Math.random()-.5)*80,l:.6,c:b[3]});
        ctx.save();ctx.globalCompositeOperation='lighter';const rg=ctx.createRadialGradient(ex,cy,0,ex,cy,th*1.4);rg.addColorStop(0,'rgba(255,255,255,.9)');rg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(ex,cy,th*1.4,0,TAU);ctx.fill();ctx.restore();}
      glow(ctx,`${fmt1(val)}%`,ex+14,cy,{size:win?34:28,col:b[3],align:'left'});
      if(fin)txt(ctx,`50 kg 含氮约 ${fmt1(KG[i])} kg`,tr-4,cy+th/2+18,{size:14,weight:700,col:DIM,align:'right'});
      if(win){const s=1+.08*Math.sin(t*5);ctx.save();ctx.translate(lx+bw/2,cy-bh/2-4);ctx.scale(s,s);ctx.fillStyle=CA;ctx.shadowColor=CA;ctx.shadowBlur=18;
        ctx.beginPath();ctx.moveTo(-20,8);ctx.lineTo(-20,-10);ctx.lineTo(-10,0);ctx.lineTo(0,-16);ctx.lineTo(10,0);ctx.lineTo(20,-10);ctx.lineTo(20,8);ctx.closePath();ctx.fill();ctx.restore();}});
    // 火花粒子
    ctx.save();ctx.globalCompositeOperation='lighter';for(let k=sp.length-1;k>=0;k--){const p=sp[k];p.l-=dt;if(p.l<=0){sp.splice(k,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.globalAlpha=p.l/.6;ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,3,3);}ctx.restore();
    if(fin){const v=VOTES[0],tot=VOTES.reduce((a,b)=>a+b,0);txt(ctx,tot?`全班 ${tot} 票中，有 ${v} 票猜中尿素`:'尿素中氮元素的质量分数最高',w/2,66,{size:16,weight:700,col:CG});}}
  // 三种化肥都算；数字除不尽，键盘带计算器（+ − × ÷ =）
  const kp=kpQuiz($('#feKp'),[
    {q:`尿素 ${fmB('CO(NH2)2')} 中氮元素的质量分数（保留一位小数）`,ans:46.7,unit:'%',tol:.06,dp:1,bag:0,why:'14×2 ÷ 60 × 100% ≈ 46.7%'},
    {q:`碳酸氢铵 ${fmB('NH4HCO3')} 中氮元素的质量分数（保留一位小数）`,ans:17.7,unit:'%',tol:.06,dp:1,bag:1,why:'14 ÷ 79 × 100% ≈ 17.7%'},
    {q:`硫酸铵 ${fmB('(NH4)2SO4')} 中氮元素的质量分数（保留一位小数）`,ans:21.2,unit:'%',tol:.06,dp:1,bag:2,why:'14×2 ÷ 132 × 100% ≈ 21.2%（教材例题）'},
    {q:'一袋 50 kg 的尿素中含氮元素约多少千克？（保留一位小数）',ans:23.3,unit:'kg',tol:.06,dp:1,why:'50 kg × 28/60 ≈ 23.3 kg'}],
    {wide:true,onJudge:(ok,it)=>{if(it&&it.bag!=null)judged[it.bag]=ok?1:2;}});
  const calc=calcPad($('#feCalc'),{onFill:v=>{if(!kp.fill(v)){setSt($('[data-id="fert"] .status'),'warn','这题已经提交了，点“下一题”再填');return false;}}});
  $('#feReset').onclick=()=>{go=false;fin=false;gT=0;sp.length=0;judged.fill(0);kp.reset();calc.reset();};
  return{tick};})();

/* ================= 7 物质质量 ⇄ 元素质量：质量转换器 ================= */
S.mass=(()=>{const cv=$('#cvMass');let t=0,dir=1,ci=0,amt=null,parts=[],drag=false,rv=0,rvT=0;const G={};// rv：0 都没揭晓，1 揭晓质量分数，2 揭晓结果
  // [情景, 物质名, 化学式, 元素, 物质质量, 单位]
  const CASES=[['钙片','碳酸钙','CaCO3','Ca',2.5,'g'],['尿素','尿素','CO(NH2)2','N',30,'kg'],['赤铁矿炼铁','氧化铁','Fe2O3','Fe',100,'t'],['补铁剂','硫酸亚铁','FeSO4','Fe',152,'mg']];
  const frac=c=>{const m=new Map(comp(c[2]));return AM[c[3]]*m.get(c[3])/Mr(c[2]);};
  const fmtN=x=>String(Math.round(x*1000)/1000);
  function reveal(k){const n=Math.min(2,k??rv+1);if(n>rv){rv=n;rvT=0;sfx(rv===2?'ok':'pop');if(rv===2)burstAt(cv,14,[CA,CG]);}}
  function setDir(d){dir=d;rv=0;$('#maFwd').setAttribute('aria-pressed',String(d===1));$('#maBack').setAttribute('aria-pressed',String(d===-1));amt=null;sfx('whoosh');}
  $('#maFwd').onclick=()=>setDir(1);$('#maBack').onclick=()=>setDir(-1);$('#maStep').onclick=()=>reveal();
  cv.addEventListener('pointerdown',e=>{const[x,y]=ptIn(cv,e);if(G.sl&&Math.abs(y-G.sl.y)<26&&x>G.sl.x-14&&x<G.sl.x+G.sl.w+14){drag=true;setAmt(x);try{cv.setPointerCapture(e.pointerId);}catch(_){}}});
  cv.addEventListener('pointermove',e=>{if(!drag)return;const[x]=ptIn(cv,e);setAmt(x);});
  cv.addEventListener('pointerup',()=>{drag=false;});
  function setAmt(x){const c=CASES[ci],max=c[4]*2,v=clamp((x-G.sl.x)/G.sl.w,0,1)*max,step=c[4]/10,old=amt;amt=Math.max(step,Math.round(v/step)*step);if(amt!==old&&rv>1)rv=1;}
  const ui=canvasUI(cv,{hots:()=>G.w?[...CASES.map((c,i)=>({hit:(x,y)=>Math.abs(x-G.cx(i))<G.cw/2&&Math.abs(y-32)<20,act:()=>{ci=i;amt=null;rv=0;sfx('click');}})),
    {hit:(x,y)=>G.mx&&Math.abs(x-G.mx)<G.mw/2&&Math.abs(y-G.cy)<G.mh/2+30,act:()=>reveal(1)},{hit:(x,y)=>G.rx&&Math.abs(x-G.rx)<G.tw/2&&Math.abs(y-G.cy)<G.th/2,act:()=>reveal(rv<1?1:2)}]:[]});
  function tick(dt){t+=dt;rvT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;const c=CASES[ci],f=frac(c);
    $('#maStep').textContent=rv<1?'揭晓质量分数':rv<2?'揭晓结果':'已揭晓';
    G.cw=Math.min(170,(w-40)/CASES.length-10);G.cx=i=>w/2+(i-(CASES.length-1)/2)*(G.cw+10);
    CASES.forEach((k,i)=>{const on=i===ci;hudBox(ctx,G.cx(i)-G.cw/2,12,G.cw,40,{col:on?CG:'rgba(63,216,255,.5)',fill:on?'rgba(57,255,136,.14)':'rgba(0,0,0,.35)',corner:8,glowA:on?1:0});txt(ctx,k[0],G.cx(i),32,{size:17,weight:700,col:on?CG:INK});});
    const subM=amt??c[4],elM=subM*f;const inV=dir===1?subM:elM,outV=dir===1?elM:subM;
    // 情景条：把题目里的“说明书”画出来
    const SC=[[`钙片说明书：每片含碳酸钙 ${fmtN(subM)} g`,`要补充 ${fmtN(elM)} g 钙元素，需要多少碳酸钙？`],[`一袋尿素 ${fmtN(subM)} kg，含氮元素多少？`,`需要 ${fmtN(elM)} kg 氮元素，要施多少尿素？`],
      [`${fmtN(subM)} t 氧化铁理论上能炼出多少铁？`,`要炼出 ${fmtN(elM)} t 铁，需要多少氧化铁？`],[`补铁剂说明书：每片含硫酸亚铁 ${fmtN(subM)} mg`,`要补充 ${fmtN(elM)} mg 铁元素，需要多少硫酸亚铁？`]][ci][dir===1?0:1];
    const sw=Math.min(620,w-60);hudBox(ctx,w/2-sw/2,68,sw,46,{col:dir===1?CC:CA,fill:'rgba(3,7,10,.8)',corner:10});
    ctx.fillStyle=dir===1?CC:CA;rr(ctx,w/2-sw/2+10,79,52,24,6);ctx.fill();txt(ctx,dir===1?'正算':'反算',w/2-sw/2+36,91,{size:13,weight:700,col:'#04121a'});
    txt(ctx,SC,w/2+30,91,{size:17,weight:700,col:INK});
    // 三个部件：左罐（输入）→ 转换器 → 右罐（输出）
    const th=Math.min(250,h*.4),cy=Math.max(150+th/2,h*.48),lx=w*.17,rx=w*.83,tw=Math.min(190,w*.2);
    const inLab=dir===1?`${c[1]}（${c[2].replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d])}）`:`${ELN[c[3]]}元素`,outLab=dir===1?`${ELN[c[3]]}元素`:`${c[1]}`;
    const tank=(x,lab,val,col,fillR,hide)=>{if(hide)fillR=0;hudBox(ctx,x-tw/2,cy-th/2,tw,th,{col,fill:'rgba(0,0,0,.4)',corner:14});
      const lv=th*.8*clamp(fillR,0,1),x0=x-tw/2+12,x1=x+tw/2-12,yb=cy+th*.4,ys=yb-lv;ctx.save();const g=ctx.createLinearGradient(0,ys,0,yb);g.addColorStop(0,col);g.addColorStop(1,shade(col,-.6));ctx.globalAlpha=.6;ctx.fillStyle=g;
      // 液面波浪
      ctx.beginPath();ctx.moveTo(x0,yb);for(let k=0;k<=24;k++){const xx=lerp(x0,x1,k/24);ctx.lineTo(xx,ys+Math.sin(t*3+k*.7+x*.01)*3);}ctx.lineTo(x1,yb);ctx.closePath();ctx.fill();
      // 气泡
      ctx.globalAlpha=.5;ctx.fillStyle='#fff';for(let k=0;k<6;k++){const q=(t*.35+k*.17+x*.001)%1,bx=x0+((k*37)%100)/100*(x1-x0),by=yb-q*lv;if(lv>10){ctx.beginPath();ctx.arc(bx+Math.sin(t*2+k)*3,by,2+k%3,0,TAU);ctx.fill();}}ctx.restore();
      // 刻度
      for(let k=1;k<5;k++){const yy=yb-th*.8*k/4;line(ctx,x+tw/2-10,yy,x+tw/2-22,yy,{col:'rgba(226,246,240,.35)',w:1.5});}
      txt(ctx,lab,x,cy-th/2-20,{size:17,weight:700,col});
      if(hide){ctx.save();ctx.globalAlpha=.55+.45*Math.abs(Math.sin(t*3));glow(ctx,`? ${c[5]}`,x,cy,{size:34,col:CA,blur:12});ctx.restore();txt(ctx,'点我揭晓',x,cy+40,{size:13,weight:700,col:FAINT});}
      else glow(ctx,`${fmtN(val)} ${c[5]}`,x,cy,{size:30,col:INK,blur:10});};
    G.rx=rx;G.tw=tw;G.th=th;G.cy=cy;const grow=rv>=2?ease(Math.min(1,rvT*1.4)):0;
    tank(lx,inLab,inV,dir===1?CC:CA,dir===1?subM/(c[4]*2):elM/(c[4]*2*f));tank(rx,outLab,outV,dir===1?CA:CC,(dir===1?elM/(c[4]*2*f):subM/(c[4]*2))*grow,rv<2);
    // 转换器
    const mx=w/2,mw=Math.min(260,w*.26),mh=150;G.mx=mx;G.mw=mw;G.mh=mh;hudBox(ctx,mx-mw/2,cy-mh/2,mw,mh,{col:CG,fill:'rgba(4,20,12,.85)',corner:18});
    ctx.save();ctx.translate(mx,cy-mh/2-28);ctx.rotate(t*1.5);ctx.strokeStyle=CG;ctx.lineWidth=3;for(let k=0;k<8;k++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(22,0);ctx.stroke();}ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.stroke();ctx.restore();
    glow(ctx,dir===1?'× 质量分数':'÷ 质量分数',mx,cy-32,{size:22,col:CG,font:HAND,weight:400});
    const m=new Map(comp(c[2])),fs=Math.abs(f*100-Math.round(f*100))<1e-6?`${Math.round(f*100)}%`:`${AM[c[3]]*m.get(c[3])}/${Mr(c[2])}`;
    if(rv>=1){ctx.save();ctx.globalAlpha=rv===1?Math.min(1,rvT*2.5):1;txt(ctx,`${c[3]} 的质量分数 = ${AM[c[3]]}${m.get(c[3])>1?'×'+m.get(c[3]):''} ÷ ${Mr(c[2])}`,mx,cy+8,{size:15,weight:700,col:INK});glow(ctx,fs,mx,cy+44,{size:24,col:CA});ctx.restore();}
    else{txt(ctx,`${c[3]} 的质量分数 = ?`,mx,cy+8,{size:15,weight:700,col:INK});ctx.save();ctx.globalAlpha=.55+.45*Math.abs(Math.sin(t*3));glow(ctx,'?',mx,cy+44,{size:28,col:CA});ctx.restore();txt(ctx,'先自己算，再点这里揭晓',mx,cy+mh/2+18,{size:12,weight:700,col:FAINT});}
    // 流动的粒子
    if(parts.length<26&&Math.random()<.5)parts.push({p:0,y:(Math.random()-.5)*60,s:.4+Math.random()*.4});
    parts=parts.filter(p=>{p.p+=dt*p.s;if(p.p>1||(rv<2&&p.p>.5))return false;const x=lerp(lx+tw/2,rx-tw/2,p.p),inM=x>mx-mw/2&&x<mx+mw/2;if(inM)return true;const col=x<mx?(dir===1?CC:CA):(dir===1?CA:CC);
      ctx.save();ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,cy+p.y*.6,x<mx?4:2.6,0,TAU);ctx.fill();ctx.restore();return true;});
    arrow(ctx,lx+tw/2+8,cy+th/2+26,rx-tw/2-8,cy+th/2+26,{col:'rgba(63,216,255,.5)',w:2,head:10});
    // 算式
    const fy=cy+th/2+70;
    const fr=rv>=1?`${AM[c[3]]*m.get(c[3])}/${Mr(c[2])}`:'?',res=rv>=2?`${fmtN(dir===1?elM:subM)} ${c[5]}`:'?';
    hand(ctx,dir===1?`${fmtN(subM)} ${c[5]} × ${fr} = ${res}`:`${fmtN(elM)} ${c[5]} ÷ ${fr} = ${res}`,w/2,fy,{size:28,col:INK});
    // 滑块
    G.sl={x:w*.25,w:w*.5,y:h-96};const r=(amt??c[4])/(c[4]*2);line(ctx,G.sl.x,G.sl.y,G.sl.x+G.sl.w,G.sl.y,{col:'rgba(63,216,255,.35)',w:6});line(ctx,G.sl.x,G.sl.y,G.sl.x+G.sl.w*r,G.sl.y,{col:CC,w:6,glowB:8});
    ctx.save();ctx.fillStyle='#fff';ctx.shadowColor=CC;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(G.sl.x+G.sl.w*r,G.sl.y,11,0,TAU);ctx.fill();ctx.restore();
    txt(ctx,'拖动滑块改变物质的质量',w/2,G.sl.y-24,{size:13,weight:700,col:FAINT});}
  const kp=kpQuiz($('#maKp'),[
    {q:`某钙片每片含碳酸钙 ${fmB('CaCO3')} 1.25 g，每片含钙元素多少克？`,ans:.5,unit:'g',tol:.001,why:'1.25 g × 40/100 = 0.5 g'},
    {q:`150 kg 尿素 ${fmB('CO(NH2)2')} 中含氮元素多少千克？`,ans:70,unit:'kg',tol:.01,why:'150 kg × 28/60 = 70 kg'},
    {q:'某人每天需补充钙元素 0.6 g，若全部由碳酸钙提供，需要碳酸钙多少克？',ans:1.5,unit:'g',tol:.001,why:'0.6 g ÷ 40% = 1.5 g（反算：元素质量 ÷ 质量分数）'},
    {q:`要炼出 56 t 铁，理论上需要氧化铁 ${fmB('Fe2O3')} 多少吨？`,ans:80,unit:'t',tol:.01,why:'56 t ÷ 70% = 80 t'},
    {q:`某补铁剂每片含硫酸亚铁 ${fmB('FeSO4')} 304 mg，每片含铁元素多少毫克？`,ans:112,unit:'mg',tol:.01,why:'304 mg × 56/152 = 112 mg'}]);
  $('#maReset').onclick=()=>{ci=0;amt=null;setDir(1);rv=0;kp.reset();};
  notes('mass','物质质量与元素质量的换算',['<mark>元素质量 = 物质质量 × 该元素的质量分数</mark>。','反过来：<mark>物质质量 = 元素质量 ÷ 该元素的质量分数</mark>。','药品、食品的标签常用质量分数表示成分。'],
    '分清已知的是“物质的质量”还是“元素的质量”，再决定乘还是除。',
    (ctx,w,h)=>{const y=110;penBox(ctx,20,y-40,110,80,PEN.blue);txt(ctx,'物质质量',75,y,{size:17,weight:700,col:PEN.blue});penBox(ctx,w-130,y-40,110,80,PEN.red);txt(ctx,'元素质量',w-75,y,{size:17,weight:700,col:PEN.red});
      ctx.strokeStyle=PEN.ink;ctx.lineWidth=2;[[y-16,'× 质量分数',1],[y+28,'÷ 质量分数',-1]].forEach(([yy,l,d])=>{ctx.beginPath();ctx.moveTo(140,yy);ctx.lineTo(w-140,yy);ctx.stroke();const xe=d>0?w-140:140;ctx.beginPath();ctx.moveTo(xe,yy);ctx.lineTo(xe-d*10,yy-6);ctx.lineTo(xe-d*10,yy+6);ctx.closePath();ctx.fillStyle=PEN.ink;ctx.fill();txt(ctx,l,w/2,yy-12,{size:15,weight:700,col:d>0?PEN.green:PEN.gold});});
      txt(ctx,'例：钙片每片含 CaCO₃ 2.5 g',w/2,210,{size:17,weight:700,col:PEN.ink});hand(ctx,'2.5 g × 40% = 1 g（钙）',w/2,250,{size:24,col:PEN.blue});
      txt(ctx,'需补钙 0.8 g → 0.8 g ÷ 40% = 2 g',w/2,300,{size:17,weight:700,col:PEN.gold});});
  return{tick};})();
