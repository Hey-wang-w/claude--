/* ================= 8 提升：化学式侦探（由元素质量比推出原子个数比） ================= */
S.det=(()=>{const cv=$('#cvDet');let t=0,ci=0,rev=[],ds=0,stT=0,seq=[],done=false;// ds：推理已揭晓到第几步（点一次走一步）
  // [标题, 元素, 质量比, 答案, 额外条件]
  const CASES=[['案件 A：神秘的氮氧化物',['N','O'],[7,16],'NO2',''],['案件 B：红棕色的铁锈',['Fe','O'],[7,3],'Fe2O3',''],['案件 C：消毒液里的分子',['H','O'],[1,16],'H2O2','相对分子质量为 34']];
  const bar=$('#deBar');bar.innerHTML=CASES.map((c,i)=>`<button class="btn" data-c="${i}">${'ABC'[i]}</button>`).join('')+'<span class="sep"></span><button class="btn pri" id="deShow">看推理</button>';
  $$('[data-c]',bar).forEach(b=>b.onclick=()=>{ci=+b.dataset.c;reset1();sfx('whoosh');});
  const maxDs=()=>CASES[ci][4]?6:5;
  $('#deShow').onclick=()=>{if(!rev.every(Boolean)){rev=[1,1,1];sfx('pop');return;}if(ds<maxDs()){ds++;stT=0;sfx(ds===maxDs()?'ok':'pop');}};
  function reset1(){rev=[0,0,0];ds=0;seq=[];done=false;$$('[data-c]',bar).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.c===ci)));slots();setSt($('#deSt'),'','数字自动写成右下角小字。答对 +20（提升题）');$('#deTitle').textContent='写出它的化学式';}
  const TILES=['H','N','O','Fe','2','3','4'];
  $('#deTray').innerHTML=TILES.map(s=>`<button data-s="${s}" class="${/\d/.test(s)?'dg':''}">${s}</button>`).join('');
  $$('#deTray button').forEach(b=>b.onclick=()=>{if(done||seq.length>=8)return;seq.push(b.dataset.s);sfx('tick');slots();});
  function slots(){const box=$('#deSlots');box.innerHTML=seq.length?seq.map((s,i)=>`<span class="sl${/\d/.test(s)?' d':''}" data-i="${i}">${s}</span>`).join(''):'<span class="hint">点下面的符号和数字</span>';
    $$('.sl',box).forEach(x=>x.onclick=()=>{if(done)return;seq.splice(+x.dataset.i,1);slots();});}
  $('#deBack').onclick=()=>{if(done)return;seq.pop();slots();};
  $('#deSub').onclick=()=>{if(done)return;if(!seq.length){setSt($('#deSt'),'warn','先拼出化学式');return;}done=true;const c=CASES[ci],tm=TEAM.cur,ok=seq.join('')===c[3];
    if(ok){teamAdd(20,tm);sfx('win');burstAt($('#deSlots'),30,[CG,CA]);setSt($('#deSt'),'ok',`<b>${tname(tm)}破案 +20</b>　${fmB(c[3])}`);}
    else{sfx('bad');setSt($('#deSt'),'bad',`<b>${tname(tm)}推错了，不加分</b>　答案是 ${fmB(c[3])}，点“看推理”逐步看过程。`);}teamNext();};
  cv.addEventListener('pointerdown',e=>{const[x,y]=ptIn(cv,e);const k=(cv._clue||[]).findIndex(b=>x>b[0]&&x<b[0]+b[2]&&y>b[1]&&y<b[1]+b[3]);if(k>=0&&!rev[k]){rev[k]=1;sfx('pop');}});
  function tick(dt){t+=dt;stT+=dt;const{ctx,w,h}=fitS(cv);
    $('#deShow').textContent=!rev.every(Boolean)?'解锁全部线索':ds===0?'看推理（第 1 步）':ds<maxDs()?`下一步（第 ${ds+1} 步）`:'推理完毕';ctx.clearRect(0,0,w,h);const[title,E,R,ans,extra]=CASES[ci];
    glow(ctx,title,w/2,36,{size:26,col:CA,font:HAND,weight:400});
    // 线索卡
    const clues=[`这种物质只含 ${E.map(e=>ELN[e]).join('、')} 两种元素${extra?'，'+extra:''}`,`${ELN[E[0]]}、${ELN[E[1]]}元素的质量比为 ${R[0]} ∶ ${R[1]}`,`相对原子质量：${E[0]} = ${AM[E[0]]}，${E[1]} = ${AM[E[1]]}`];
    cv._clue=[];const cw=(w-80)/3;clues.forEach((s,i)=>{const x=30+i*(cw+10),y=70,hh=86;cv._clue.push([x,y,cw,hh]);hudBox(ctx,x,y,cw,hh,{col:rev[i]?CA:'rgba(255,176,0,.5)',fill:rev[i]?'rgba(40,28,0,.6)':'rgba(0,0,0,.4)',corner:10});
      txt(ctx,`线索 ${i+1}`,x+14,y+18,{size:13,weight:700,col:CA,align:'left'});
      if(rev[i]){const lines=s.length>18?[s.slice(0,Math.ceil(s.length/2)),s.slice(Math.ceil(s.length/2))]:[s];lines.forEach((l,k)=>txt(ctx,l,x+cw/2,y+46+k*24-(lines.length-1)*12,{size:16,weight:700}));}
      else{glow(ctx,'点击解锁',x+cw/2,y+50,{size:18,col:CA,blur:6+4*Math.sin(t*4)});}});
    // 推理过程：质量 ÷ 相对原子质量 = 原子个数比
    const y0=196;hudBox(ctx,30,y0,w-60,h-y0-80,{col:'rgba(63,216,255,.5)',fill:'rgba(0,0,0,.3)',corner:14});
    if(ds===0){const bh=h-y0-80,rcx=w/2,rcy=y0+bh*.44,R0=Math.min(120,bh*.34);
      // 雷达扫描：未知分子里的原子以“?”闪现
      ctx.save();ctx.strokeStyle='rgba(63,216,255,.3)';ctx.lineWidth=1.2;for(let k=1;k<=3;k++){ctx.beginPath();ctx.arc(rcx,rcy,R0*k/3,0,TAU);ctx.stroke();}
      line(ctx,rcx-R0,rcy,rcx+R0,rcy,{col:'rgba(63,216,255,.2)',w:1});line(ctx,rcx,rcy-R0,rcx,rcy+R0,{col:'rgba(63,216,255,.2)',w:1});
      const ang=t*1.6;if(ctx.createConicGradient){const cg=ctx.createConicGradient(ang-.9,rcx,rcy);cg.addColorStop(0,'rgba(57,255,136,0)');cg.addColorStop(.14,'rgba(57,255,136,.35)');cg.addColorStop(.1401,'rgba(57,255,136,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(rcx,rcy,R0,0,TAU);ctx.fill();}
      line(ctx,rcx,rcy,rcx+Math.cos(ang)*R0,rcy+Math.sin(ang)*R0,{col:CG,w:2,glowB:10});
      const nUn=rev.filter(Boolean).length;[[.3,.55],[1.9,.8],[3.2,.45],[4.4,.7],[5.4,.9]].forEach(([th,rr0],k)=>{const d=((ang-th)%TAU+TAU)%TAU,fade=Math.max(0,1-d/2.4),bx=rcx+Math.cos(th)*R0*rr0,by=rcy+Math.sin(th)*R0*rr0;
        ctx.globalAlpha=.15+.85*fade;ctx.fillStyle=k%2?'rgba(255,93,108,.8)':'rgba(63,169,255,.8)';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=14*fade;ctx.beginPath();ctx.arc(bx,by,12,0,TAU);ctx.fill();ctx.shadowBlur=0;txt(ctx,'?',bx,by+1,{size:15,weight:700,col:'#fff'});});
      ctx.restore();
      glow(ctx,`${E[0]} ∶ ${E[1]} = ? ∶ ?`,rcx,rcy+R0+34,{size:26,col:CA,blur:8});
      txt(ctx,nUn<3?`已解锁 ${nUn} / 3 条线索`:'想一想：知道了质量比，怎样得到原子个数比？想好后点“看推理”',rcx,rcy+R0+70,{size:16,weight:700,col:DIM});return;}
    const q=k=>k<ds-1?1:k===ds-1?clamp(stT/.6,0,1):0;const cxs=[w*.3,w*.7];
    E.forEach((e,i)=>{const x=cxs[i],a=q(0);ctx.save();ctx.globalAlpha=a;
      // 质量块
      const m=R[i],bw=Math.min(240,150+m*4);ctx.fillStyle=i?'rgba(255,93,108,.35)':'rgba(63,169,255,.35)';ctx.strokeStyle=i?RED:BLUE;ctx.lineWidth=2;rr(ctx,x-bw/2,y0+30,bw,40,8);ctx.fill();ctx.stroke();
      txt(ctx,`${ELN[e]}的质量：${m} 份`,x,y0+50,{size:17,weight:700});ctx.restore();
      ctx.save();ctx.globalAlpha=q(1);txt(ctx,`÷ ${AM[e]}（相对原子质量）`,x,y0+100,{size:17,weight:700,col:CA});arrow(ctx,x,y0+116,x,y0+150,{col:CA,w:2.5,head:10});ctx.restore();
      ctx.save();ctx.globalAlpha=q(2);const v=m/AM[e];glow(ctx,`${Number.isInteger(v)?v:`${m}/${AM[e]}`}`,x,y0+176,{size:28,col:INK,blur:6});ctx.restore();});
    const n0=R[0]/AM[E[0]],n1=R[1]/AM[E[1]];let a=n0,b=n1;const k0=Math.min(a,b);a/=k0;b/=k0;let mul=1;while(Math.abs(a*mul-Math.round(a*mul))>1e-6||Math.abs(b*mul-Math.round(b*mul))>1e-6)mul++;a=Math.round(a*mul);b=Math.round(b*mul);
    ctx.save();ctx.globalAlpha=q(3);glow(ctx,`原子个数比 ${E[0]} ∶ ${E[1]} = ${a} ∶ ${b}`,w/2,y0+236,{size:28,col:CG});
    // 原子球
    const tot=a+b,sx=w/2-(tot-1)*22;for(let k=0;k<tot;k++)atomBall(ctx,sx+k*44,y0+290,k<a?(E[0]==='H'?13:17):(E[1]==='H'?13:17),k<a?E[0]:E[1]);ctx.restore();
    if(extra){ctx.save();ctx.globalAlpha=q(4);const base=`${E[0]}${a>1?a:''}${E[1]}${b>1?b:''}`,m1=Mr(base);txt(ctx,`${base.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d])} 的相对分子质量 = ${m1}，而题目给的是 34 = ${m1} × ${34/m1}`,w/2,y0+342,{size:17,weight:700,col:CA});ctx.restore();}
    if(ds>=maxDs()){ctx.save();ctx.globalAlpha=q(extra?5:4);fmDraw(ctx,ans,w/2,h-118,48,{col:CG,glowB:16});ctx.restore();}}
  $('#deReset').onclick=()=>{ci=0;reset1();};
  reset1();
  notes('det','由元素质量比推化学式（提升）',['原子个数比 = <mark>各元素的质量 ÷ 各自的相对原子质量</mark> 之比。','化成最简整数比，就是化学式中的原子个数比。','如果还知道相对分子质量，用它确定分子中原子的实际个数。'],
    '质量比不是原子个数比：CuO 中 Cu∶O 质量比 4∶1，原子个数比是 1∶1。',
    (ctx,w,h)=>{txt(ctx,'S∶O 质量比 = 1∶1',w/2,32,{size:20,weight:700,col:PEN.ink});
      [[w*.3,'1 ÷ 32 = 1/32',PEN.blue],[w*.7,'1 ÷ 16 = 2/32',PEN.red]].forEach(([x,s,c])=>{txt(ctx,s,x,90,{size:20,weight:700,col:c});});
      hand(ctx,'1/32 ∶ 2/32 = 1 ∶ 2',w/2,150,{size:30,col:PEN.green});
      [[w/2-50,'S','#d4a514'],[w/2,'O','#e85d5d'],[w/2+50,'O','#e85d5d']].forEach(([x,e,c])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,210,20,0,TAU);ctx.fill();txt(ctx,e,x,211,{size:16,weight:700,col:'#fff'});});
      txt(ctx,'→  SO₂',w/2,270,{size:28,weight:700,col:PEN.ink});});
  return{tick,enter(){}};})();

/* ================= 9 竞赛：化学拔河（KayKit 角色经 Blender 渲染成逐帧精灵） ================= */
S.tug=(()=>{const cv=$('#cvTug');let t=0,qi=0,phase='ask',pick=null,pos=0,disp=0,winner=null,order=[],sweat=[],dust=[],pullT=-9,pullDir=0,pullN=1,shakeT=0,ropeY=null;
  const STEP=4,WIN=4;// 绳子中点每次移动 1 格，到达 ±4 格获胜
  const IMG={};Object.keys(SPR).forEach(k=>{const im=new Image();im.src=SPR[k];IMG[k]=im;});
  // 每个角色一个动画播放器
  const mk=(name,side,slot)=>({name,side,slot,st:'strain',f:0,ft:0,next:null,hold:false});
  let crew=[mk('Rogue','r',1),mk('Knight','r',0),mk('Mage','b',1),mk('Barbarian','b',0)];
  function play(c,st,then){c.st=st;c.f=0;c.ft=0;c.next=then||null;c.hold=false;}
  function teamPlay(side,st,then){crew.filter(c=>c.side===side).forEach(c=>play(c,st,then));}
  // 题库：[分值, 题干, 选项, 正确项, 解析]
  const Q=[
    [10,`葡萄糖 ${fmB('C6H12O6')} 的相对分子质量是`,['180','29','180 g','90'],0,'12×6 + 1×12 + 16×6 = 180，相对分子质量单位是“1”，不写 g。'],
    [10,`过氧化氢 ${fmB('H2O2')} 中氢、氧元素的质量比为`,['1∶1','1∶16','1∶32','1∶8'],1,'(1×2)∶(16×2) = 2∶32 = 1∶16；1∶1 是原子个数比，1∶32 漏乘了 H 的个数，1∶8 是水。'],
    [10,`关于乙醇 ${fmB('C2H5OH')}，下列说法正确的是`,['乙醇由 2 个碳原子、6 个氢原子和 1 个氧原子构成','乙醇的相对分子质量为 46 g','乙醇中碳元素的质量分数最大','乙醇中碳、氢、氧元素的质量比为 2∶6∶1'],2,'C、H、O 质量比 24∶6∶16，碳最大；1 个乙醇分子才含 9 个原子；相对分子质量不带 g。'],
    [10,'下列化肥中，氮元素的质量分数最大的是',[fmB('NH4NO3'),fmB('CO(NH2)2'),fmB('NH4HCO3'),fmB('(NH4)2SO4')],1,'尿素约 46.7%，硝酸铵 35%，硫酸铵约 21.2%，碳酸氢铵约 17.7%。'],
    [10,`碳酸钙 ${fmB('CaCO3')} 中钙、碳、氧三种元素的质量比为`,['1∶1∶3','10∶3∶12','40∶12∶16','10∶3∶4'],1,'40∶12∶(16×3) = 40∶12∶48 = 10∶3∶12。'],
    [10,'50 g 碳酸钙中含钙元素的质量为',['20 g','40 g','12 g','50 g'],0,'50 g × 40% = 20 g。'],
    [20,'【提升】某硫的氧化物中，硫、氧元素的质量比为 2∶3，它的化学式为',[fmB('SO2'),fmB('SO3'),fmB('S2O3'),fmB('SO')],1,'原子个数比 = 2/32 ∶ 3/16 = 1∶3，化学式为 SO₃。'],
    [10,'下列物质中，相对分子质量最大的是',[fmB('CO2'),fmB('H2O2'),fmB('C2H5OH'),fmB('SO2')],3,'CO₂ 44，H₂O₂ 34，C₂H₅OH 46，SO₂ 64。'],
    [10,`葡萄糖 ${fmB('C6H12O6')} 中碳元素的质量分数为`,['40%','6.7%','53.3%','25%'],0,'12×6 ÷ 180 × 100% = 40%。'],
    [10,'下列说法正确的是',['相对分子质量就是一个分子的实际质量','物质中元素的质量比等于原子个数比','相对分子质量的单位是“1”，一般不写','2H₂O 的相对分子质量是 36'],2,'相对分子质量是相对值；质量比要乘相对原子质量；H₂O 的相对分子质量是 18。'],
    [10,'需要补充 7 kg 氮元素，需要尿素的质量为',['15 kg','3.3 kg','7 kg','30 kg'],0,'7 kg ÷ (28/60) = 15 kg。'],
    [20,`【提升】某氧化物的化学式为 ${fmB('RO2')}，其中 R 元素的质量分数为 50%，R 的相对原子质量为`,['32','16','64','12'],0,'R 与 2 个 O 质量相等：R = 16×2 = 32。'],
    [10,`尿素 ${fmB('CO(NH2)2')} 中碳、氧元素的质量比为`,['1∶1','3∶4','4∶3','12∶32'],1,'12∶16 = 3∶4。'],
    [10,'某补钙剂每片含碳酸钙 0.5 g，每天服用 2 片，每天补充钙元素',['0.4 g','0.2 g','1 g','0.8 g'],0,'0.5 g × 2 × 40% = 0.4 g。'],
    [20,`【提升】${fmB('Fe2O3')} 和 ${fmB('Fe3O4')} 中，铁元素的质量分数`,['Fe₂O₃ 更大','Fe₃O₄ 更大','相等','无法比较'],1,'Fe₂O₃：112/160 = 70%；Fe₃O₄：168/232 ≈ 72.4%。也可比 Fe∶O 原子个数比：2∶3 < 3∶4。'],
    [10,`硫酸亚铁 ${fmB('FeSO4')} 中铁元素的质量分数约为`,['36.8%','56%','15.2%','63.2%'],0,'56 ÷ 152 × 100% ≈ 36.8%。']];
  const card=$('#tgCard'),tag=tm=>`<span class="teamTag ${tm}">${tname(tm)}</span>`;
  function reset(){qi=0;phase='ask';pick=null;pos=0;disp=0;winner=null;sweat=[];dust=[];crew.forEach(c=>play(c,'strain'));teamSet('r');ask();}
  function ask(){if(winner)return;if(qi>=Q.length)return finish(pos<0?'r':pos>0?'b':null);phase='ask';pick=null;const[p,q,O]=Q[qi];
    card.innerHTML=`<div class="qmeta">${tag(TEAM.cur)}<span class="tag ${p>10?'a':'c'}">第 ${qi+1} / ${Q.length} 题 · ${p} 分${p>10?' · 拉 2 格':''}</span></div><div class="qtext">${q}</div>
      <div class="opts">${O.map((o,k)=>`<button class="opt" data-v="${k}"><i>${'ABCD'[k]}</i><span>${o}</span></button>`).join('')}</div>
      <div class="row"><button class="btn pri sm" id="tgSub">提交</button></div><div class="status" id="tgSt">答对：本队把绳子往自己这边拉；答错：被对方拉过去 1 格。</div>`;
    $$('.opt',card).forEach(b=>b.onclick=()=>{if(phase!=='ask')return;pick=+b.dataset.v;$$('.opt',card).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
    $('#tgSub').onclick=submit;}
  function submit(){if(phase!=='ask')return;if(pick===null){setSt($('#tgSt'),'warn','请先选一个答案');return;}phase='pull';const[p,,,ans,ex]=Q[qi],tm=TEAM.cur,ok=pick===ans,oth=tm==='r'?'b':'r';
    $$('.opt',card).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===ans)x.classList.add('right');else if(v===pick)x.classList.add('wrong');});$('#tgSub').remove();
    const steps=ok?(p>10?2:1):1,toward=ok?tm:oth;pos+=(toward==='r'?-1:1)*steps;pos=clamp(pos,-WIN,WIN);
    pullT=t;pullDir=toward==='r'?-1:1;pullN=steps;shakeT=t;
    teamPlay(toward,'heave',c=>play(c,'strain'));teamPlay(toward==='r'?'b':'r','stumble',c=>play(c,'strain'));sfx('whoosh');setTimeout(()=>sfx(ok?'ok':'bad'),250);
    for(let i=0;i<14;i++)dust.push({x:0,y:0,side:toward==='r'?'b':'r',vx:(Math.random()-.2)*80,vy:-Math.random()*60,l:1});
    if(ok){teamAdd(p,tm);setSt($('#tgSt'),'ok',`<b>${tname(tm)}答对 +${p}，向本队拉 ${steps} 格！</b><br>${ex}`);}
    else{setSt($('#tgSt'),'bad',`<b>${tname(tm)}答错，不加分，被${tname(oth)}拉过去 1 格</b><br>${ex}`);}
    const nx=document.createElement('div');nx.className='row';nx.innerHTML=`<button class="btn pri sm">下一题</button>`;card.appendChild(nx);
    $('button',nx).onclick=()=>{qi++;teamSet(TEAM.cur==='r'?'b':'r');ask();sfx('whoosh');};
    if(Math.abs(pos)>=WIN)setTimeout(()=>finish(pos<0?'r':'b'),1100);}
  function finish(w){if(winner)return;winner=w||'tie';phase='end';
    if(w){teamPlay(w,'cheer');teamPlay(w==='r'?'b':'r','stumble',c=>play(c,'fall',c2=>{c2.hold=true;}));teamAdd(20,w);FX.confetti();sfx('win');stampOn($('[data-id="tug"] .stage'),`${tname(w)}获胜！+20`,true,'50%','22%');}
    card.innerHTML=`<div class="qmeta"><span class="tag a">比赛结束</span></div><div class="qtext" style="font-size:26px">${w?`${tag(w)} 赢得拔河！`:'两队势均力敌，平局！'}</div>
      <p class="hint">${w?'绳子中点到达本队的胜利线，额外 +20。':'题目答完时绳子中点在正中间。'}</p>
      <div class="tflist">${Q.map((q,i)=>i<=qi?`<div class="tf"><div>第 ${i+1} 题</div><b class="hint">${q[2][q[3]].replace(/<sub>(\d+)<\/sub>/g,(m,d)=>d.replace(/\d/g,x=>'₀₁₂₃₄₅₆₇₈₉'[x])).replace(/<[^>]+>/g,'')}</b></div>`:'').join('').slice(0,4000)}</div>`;}
  // 画一个角色：side='r' 面向右（原图方向），'b' 镜像；锚点是原点（地面）
  function drawChar(ctx,c,gx,gy,s,dt){const M=SMETA[c.name],S=M.st[c.st];c.ft+=dt*13;
    while(c.ft>=1){c.ft-=1;if(c.f<S.n-1)c.f++;else if(S.loop)c.f=0;else if(c.next&&!c.hold){const n=c.next;c.next=null;n(c);}}
    const fr=S.i+Math.min(c.f,S.n-1),sx=(fr%M.cols)*M.w,sy=Math.floor(fr/M.cols)*M.h,o=S.org[Math.min(c.f,S.n-1)],hd=S.hand[Math.min(c.f,S.n-1)];
    const im=IMG[c.name];ctx.save();ctx.translate(gx,gy);ctx.scale(c.side==='r'?s:-s,s);
    // 地面阴影
    ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(0,0,60,12,0,0,TAU);ctx.fill();
    if(im.complete&&im.naturalWidth)ctx.drawImage(im,sx,sy,M.w,M.h,-o[0],-o[1],M.w,M.h);ctx.restore();
    return{hand:[gx+(c.side==='r'?1:-1)*(hd[0]-o[0])*s,gy+(hd[1]-o[1])*s],head:[gx+(c.side==='r'?1:-1)*(-12)*s,gy-150*s]};}
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    disp=lerp(disp,pos,1-Math.exp(-dt*3.2));
    const cx=w/2,gy=h*.74,stepPx=Math.min(34,w/26),off=disp*stepPx,s=Math.min(.86,w/1060,h/760),cam=-off*.7,F=200*s,B=130*s;
    ctx.save();ctx.translate(cam,0);
    // 场地：透视网格地板 + 中线 + 两队胜利线
    ctx.save();const fg=ctx.createLinearGradient(0,gy-80,0,h);fg.addColorStop(0,'rgba(63,216,255,.02)');fg.addColorStop(1,'rgba(63,216,255,.12)');ctx.fillStyle=fg;ctx.fillRect(-300,gy-80,w+600,h-gy+80);
    ctx.strokeStyle='rgba(63,216,255,.18)';ctx.lineWidth=1;for(let i=-14;i<=14;i++){ctx.beginPath();ctx.moveTo(cx+i*stepPx,gy-80);ctx.lineTo(cx+i*stepPx*2.2,h);ctx.stroke();}
    for(let j=0;j<5;j++){const yy=gy-80+(h-gy+80)*Math.pow(j/5,1.5);ctx.beginPath();ctx.moveTo(-300,yy);ctx.lineTo(w+300,yy);ctx.stroke();}ctx.restore();
    [['r',-1,RED],['b',1,BLUE]].forEach(([tm,d,col])=>{const x=cx+d*WIN*stepPx;ctx.save();ctx.shadowColor=col;ctx.shadowBlur=14;line(ctx,x,gy-90,x,h-6,{col,w:3});ctx.restore();
      ctx.fillStyle=d<0?'rgba(255,93,108,.08)':'rgba(63,169,255,.08)';ctx.fillRect(d<0?-300:x,gy-80,d<0?x+300:w-x+300,h-gy+80);});
    line(ctx,cx,gy-90,cx,h-6,{col:'rgba(226,246,240,.5)',w:2,dash:[8,8]});
    // 刻度格
    for(let k=-WIN;k<=WIN;k++){const x=cx+k*stepPx;line(ctx,x,gy+40,x,gy+52,{col:k?'rgba(226,246,240,.35)':INK,w:2});}
    // 角色站位：前排离中线 130，后排 250（加上绳子偏移）
    const jit=t-pullT<.8?Math.sin(t*60)*3*(1-(t-pullT)/.8):0,ropeY0=gy-118*s;
    const P={};crew.forEach(c=>{const d=c.side==='r'?-1:1;P[c.name]=[cx+off+d*(F+c.slot*B),gy];});
    // 后排先画
    const hands={};[...crew].sort((a,b)=>b.slot-a.slot).forEach(c=>{const[gx,gy2]=P[c.name];const r=drawChar(ctx,c,gx+jit,gy2,s,dt);hands[c.name]=r;});
    // 绳子：从左后到右后，穿过每个人的手和中点标记
    // 绳子拉直放平：高度取正在拉绳的角色双手的平均高度（平滑过渡），整条绳水平
    // 比赛结束：大家松手，绳子落到地上
    if(winner){ropeY=ropeY==null?gy-5:lerp(ropeY,gy-5,1-Math.exp(-dt*4));}
    else{const hy=crew.filter(c=>c.st!=='fall'&&c.st!=='cheer').map(c=>hands[c.name].hand[1]);if(hy.length){const m=hy.reduce((a,b)=>a+b,0)/hy.length;ropeY=ropeY==null?m:lerp(ropeY,m,1-Math.exp(-dt*6));}}
    const ry=(ropeY??ropeY0)+(phase==='ask'&&!winner?Math.sin(t*9)*1:0),pts=[[hands.Rogue.hand[0]-110*s,ry],[hands.Mage.hand[0]+110*s,ry]];
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#6d5332';ctx.lineWidth=9;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
    ctx.strokeStyle='#c9a46a';ctx.lineWidth=6;ctx.stroke();ctx.setLineDash([5,7]);ctx.lineDashOffset=-off;ctx.strokeStyle='#8a6a3c';ctx.lineWidth=6;ctx.stroke();ctx.restore();
    // 中点标记：发光红蓝丝带
    const mx=cx+off,my=ry;ctx.save();ctx.shadowColor=CA;ctx.shadowBlur=18;ctx.fillStyle=CA;ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx-10,my+34);ctx.lineTo(mx+10,my+34);ctx.closePath();ctx.fill();ctx.restore();
    ctx.save();ctx.fillStyle=pos<0?RED:pos>0?BLUE:INK;ctx.beginPath();ctx.arc(mx,my,8,0,TAU);ctx.fill();ctx.restore();
    // 等待时的出力动效：汗珠、蒸汽、绳子颤动
    if(phase==='ask'&&!winner){if(Math.random()<dt*5){const c=crew[Math.floor(Math.random()*4)],hp=hands[c.name].head;sweat.push({x:hp[0]+(Math.random()-.5)*30,y:hp[1]+Math.random()*20,vx:(c.side==='r'?-1:1)*(20+Math.random()*30),vy:-60-Math.random()*40,l:1.1});}
      if(Math.random()<dt*3){const c=crew[Math.floor(Math.random()*4)],[gx]=P[c.name];dust.push({x:gx+(c.side==='r'?40:-40)*s,y:gy-4,vx:(c.side==='r'?1:-1)*(10+Math.random()*30),vy:-10-Math.random()*20,l:.8,side:null});}}
    sweat=sweat.filter(p=>{p.l-=dt;p.vy+=260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.l<=0)return false;ctx.save();ctx.globalAlpha=Math.min(1,p.l*1.5);ctx.fillStyle='#9fe6ff';ctx.shadowColor='#9fe6ff';ctx.shadowBlur=6;
      ctx.beginPath();ctx.moveTo(p.x,p.y-7);ctx.quadraticCurveTo(p.x+5,p.y,p.x,p.y+4);ctx.quadraticCurveTo(p.x-5,p.y,p.x,p.y-7);ctx.fill();ctx.restore();return true;});
    dust=dust.filter(p=>{p.l-=dt*.9;if(p.l<=0)return false;if(p.side){const tgt=crew.find(c=>c.side===p.side&&c.slot===0);const[gx]=P[tgt.name];if(p.x===0){p.x=gx;p.y=gy-4;}}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;ctx.save();ctx.globalAlpha=p.l*.5;ctx.fillStyle='#c9d3e3';ctx.beginPath();ctx.arc(p.x,p.y,10*(1.4-p.l),0,TAU);ctx.fill();ctx.restore();return true;});
    // 出力文字
    if(phase==='ask'&&!winner){[['r',-1],['b',1]].forEach(([tm,d])=>{const a=.6+.35*Math.sin(t*6+(d>0?1.5:0));ctx.save();ctx.globalAlpha=a;hand(ctx,'嘿——哟！',cx+off+d*(F+B*.5),gy-300*s,{size:24,col:tm==='r'?RED:BLUE});ctx.restore();});}
    // 拉动瞬间：速度线
    if(t-pullT<.6){const q=1-(t-pullT)/.6;for(let i=0;i<10;i++){const y=gy-200*s+i*22*s,x0=cx+off-pullDir*(120+i*13);ctx.save();ctx.globalAlpha=q*.7;line(ctx,x0,y,x0-pullDir*90*q,y,{col:pullDir<0?RED:BLUE,w:3,glowB:8});ctx.restore();}}
    // 拉动瞬间：中点上方弹出“拉！”
    if(t-pullT<1.1){const q=(t-pullT)/1.1,col=pullDir<0?RED:BLUE;ctx.save();ctx.globalAlpha=1-q*q;const sc=q<.15?q/.15*1.3:1.3-.3*Math.min(1,(q-.15)*4);ctx.translate(cx+off,ropeY0-70-q*50);ctx.scale(sc,sc);
      glow(ctx,pullN>1?'猛拉 2 格！':'拉！',0,0,{size:40,col,font:HAND,weight:400,blur:20});ctx.restore();}
    // 胜利线标签（贴底，避开角色）
    [['r',-1,RED],['b',1,BLUE]].forEach(([tm,d,col])=>{const x=cx+d*WIN*stepPx;hudBox(ctx,x-44,h-40,88,28,{col,fill:'rgba(3,7,10,.85)',corner:6,glowA:0});txt(ctx,`${tm==='r'?'红':'蓝'}队胜利线`,x,h-26,{size:13,weight:700,col});});
    ctx.restore();
    // 顶部比分牌（不随镜头移动）
    hudBox(ctx,cx-200,14,400,64,{col:CC,fill:'rgba(3,7,10,.85)',corner:14});glow(ctx,'红队',cx-130,46,{size:26,col:RED,font:HAND,weight:400});glow(ctx,'蓝队',cx+130,46,{size:26,col:BLUE,font:HAND,weight:400});
    glow(ctx,`${TEAM.sc.r} : ${TEAM.sc.b}`,cx,46,{size:30,col:INK,blur:8});
    // 进度：还差几格
    const lead=pos<0?'r':pos>0?'b':null;txt(ctx,winner?(winner==='tie'?'比赛结束 · 平局':`比赛结束 · ${tname(winner)}获胜`):lead?`${tname(lead)}领先 ${Math.abs(pos)} 格 · 再拉 ${WIN-Math.abs(pos)} 格获胜`:'势均力敌 · 先拉 4 格获胜',cx,96,{size:15,weight:700,col:lead==='r'?RED:lead==='b'?BLUE:DIM});
    if(winner&&winner!=='tie'){const col=winner==='r'?RED:BLUE;ctx.save();ctx.globalAlpha=.5+.3*Math.sin(t*4);glow(ctx,'WIN',cx+(winner==='r'?-1:1)*w*.3,150,{size:56,col,font:FNUM,blur:24});ctx.restore();}}
  $('#tgReset').onclick=()=>{stampOff($('[data-id="tug"] .stage'));reset();};
  reset();
  return{tick,enter(){if(phase==='ask'&&qi===0)teamSet('r');}};})();

/* ================= 10 小结 ================= */
S.sum=(()=>{
  const COL=[['相对分子质量',[['定义','化学式中各原子的相对原子质量的总和'],['算法','相对原子质量 × 原子个数，再相加；括号外的数字要乘进去'],['易错','单位是“1”，一般不写；指 1 个分子']]],
    ['元素质量比',[['算法','（相对原子质量 × 原子个数）之比'],['结果','化成最简整数比，元素顺序与题目一致'],['易错','质量比 ≠ 原子个数比（CO₂：1∶2 与 3∶8）']]],
    ['质量分数与元素质量',[['质量分数','相对原子质量 × 原子个数 ÷ 相对分子质量 × 100%'],['正算','元素质量 = 物质质量 × 质量分数'],['反算','物质质量 = 元素质量 ÷ 质量分数']]]];
  const g=$('#suGrid');g.innerHTML=COL.map(([h,L])=>`<div class="scol"><h4>${h}</h4>${L.map(([q,a])=>`<div class="sitem hide"><span class="q">${q}</span><span class="a">${a}</span></div>`).join('')}</div>`).join('');
  $$('.sitem',g).forEach(x=>x.onclick=()=>{x.classList.toggle('hide');sfx('pop');});
  $('#suAll').onclick=()=>{$$('.sitem',g).forEach((x,i)=>setTimeout(()=>x.classList.remove('hide'),i*90));sfx('whoosh');};
  $('#suHide').onclick=()=>{$$('.sitem',g).forEach(x=>x.classList.add('hide'));sfx('click');};
  return{enter(){const{r,b}=TEAM.sc;$('#suScore').innerHTML=`<span style="color:${RED}">红队 <b class="num" style="color:${RED}">${r}</b></span>　<span style="color:${BLUE}">蓝队 <b class="num" style="color:${BLUE}">${b}</b></span><div class="hint" style="font-size:16px;margin-top:4px">${r===b?'平分秋色！':(r>b?'红队':'蓝队')+'领先！'}</div>`;}};})();
