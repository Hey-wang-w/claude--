/* ================= 1 封面：青蒿素分子（15 C + 22 H + 5 O，可拖动旋转） ================= */
S.cover=(()=>{const cv=$('#cvCover');let t=0,yaw=0,pitch=-.25,auto=true,sel=null,selT=0;
  // 生成一个原子数与 C15H22O5 一致的立体骨架（示意，不是精确的晶体结构）。
  // 每个原子有 4 个正四面体方向的“槽位”（键角 109.5°），新原子和氢原子只放进空槽位：C/O 键长 1.5、C–H 1.1；
  // 不成键的重原子相距大于 2.4，H 与 H 大于 1.7、与重原子大于 2.0，旋转时球和键不会挤在一起。
  const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  function build(seed,HD=2.4,HH=1.7,HX=2.0){const R=rng(seed);
    const nrm=v=>{const L=Math.hypot(...v);return v.map(x=>x/L);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    // 沿 d 方向成键的新原子：除了指回 -d 的槽位，另外三个与 -d 成 109.5°，绕键轴随机扭转
    const slotsFrom=d=>{const a=Math.abs(d[0])<.9?[1,0,0]:[0,1,0],e1=nrm(cross(d,a)),e2=cross(d,e1),ph=R()*TAU;
      return[0,1,2].map(k=>{const f=ph+k*TAU/3;return d.map((x,i)=>x/3+.9428*(Math.cos(f)*e1[i]+Math.sin(f)*e2[i]));});};
    const r0=nrm([R()-.5,R()-.5,R()-.5]);const A=[{e:'C',p:[0,0,0],par:-1,free:[r0,...slotsFrom(r0.map(x=>-x))]}];let tries=0;
    while(A.length<20&&tries<3000){tries++;const i=Math.floor(R()*A.length),a=A[i];if(a.free.length<=1)continue;
      const si=Math.floor(R()*a.free.length),d=a.free[si],p=a.p.map((x,k)=>x+d[k]*1.5);
      if(A.every((b,j)=>j===i||dist(b.p,p)>HD)){a.free.splice(si,1);A.push({e:'C',p,par:i,free:slotsFrom(d)});}}
    if(A.length<20)return null;
    const deg=i=>4-A[i].free.length;
    let o=0;for(let i=1;i<20&&o<5;i++)if(deg(i)<=2&&R()<.45){A[i].e='O';o++;}for(let i=1;i<20&&o<5;i++)if(A[i].e==='C'&&deg(i)<=2){A[i].e='O';o++;}
    if(o<5)return null;
    const atoms=A.map(a=>({e:a.e,p:a.p})),bonds=A.slice(1).map((a,k)=>[a.par,k+1]);let hc=0;
    // 每次在所有碳的空槽位里挑离其他原子最远的一个放 H
    while(hc<22){let best=null;A.forEach((a,i)=>{if(a.e!=='C')return;a.free.forEach((d,si)=>{const p=a.p.map((x,k)=>x+d[k]*1.1);let m=1e9;
        atoms.forEach((b,j)=>{if(j!==i)m=Math.min(m,dist(b.p,p)/(b.e==='H'?HH:HX));});if(!best||m>best.m)best={m,i,si,p};});});
      if(!best||best.m<1)return null;A[best.i].free.splice(best.si,1);atoms.push({e:'H',p:best.p});bonds.push([best.i,atoms.length-1]);hc++;}
    return{atoms,bonds};}
  // 在一批随机骨架里挑最紧凑的一个（青蒿素本身是多环的紧凑分子）
  const rg=M=>{const c=[0,1,2].map(i=>M.atoms.reduce((a,x)=>a+x.p[i],0)/M.atoms.length);return Math.max(...M.atoms.map(a=>dist(a.p,c)));};
  let M=null;for(let sd=20;sd<220;sd++){const m=build(sd);if(m&&(!M||rg(m)<rg(M)))M=m;}const{atoms,bonds}=M;
  const cen=[0,1,2].map(i=>atoms.reduce((a,x)=>a+x.p[i],0)/atoms.length);atoms.forEach(a=>a.p=a.p.map((x,i)=>x-cen[i]));
  const ext=Math.max(...atoms.map(a=>Math.hypot(...a.p)));
  const CNT={C:atoms.filter(a=>a.e==='C').length,H:atoms.filter(a=>a.e==='H').length,O:atoms.filter(a=>a.e==='O').length};
  // 图例芯片
  const lg=$('#covLegend');lg.innerHTML=[['C','碳'],['H','氢'],['O','氧']].map(([e,n])=>`<button class="elchip" data-e="${e}"><i style="background:${ATOM[e][0]};color:${e==='C'?'#fff':INK}">${e}</i>${n}原子</button>`).join('')+`<button class="elchip" data-e="all"><i style="background:${SUN}">∑</i>全部</button>`;
  $$('.elchip',lg).forEach(b=>b.onclick=()=>{sel=sel===b.dataset.e?null:b.dataset.e;selT=0;$$('.elchip',lg).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.e===sel)));sfx('pop');});
  // 拖动旋转
  let drag=null;cv.addEventListener('pointerdown',e=>{drag=ptIn(cv,e);auto=false;try{cv.setPointerCapture(e.pointerId);}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!drag)return;const p=ptIn(cv,e);yaw+=(p[0]-drag[0])*.01;pitch=clamp(pitch+(p[1]-drag[1])*.01,-1.3,1.3);drag=p;});
  cv.addEventListener('pointerup',()=>{drag=null;setTimeout(()=>auto=true,2500);});
  function tick(dt){t+=dt;selT+=dt;if(auto)yaw+=dt*.35;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const top=88,bot=h-100,cx=w/2,cy=(top+bot)/2,sc=Math.min((bot-top)/2,w/2-40)/(ext*1.06+.5),cyw=Math.cos(yaw),syw=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    const P=atoms.map(a=>{const[x,y,z]=a.p;const x1=x*cyw+z*syw,z1=-x*syw+z*cyw,y1=y*cp-z1*sp,z2=y*sp+z1*cp;const f=5/(5+z2/ext*1.6);return{e:a.e,x:cx+x1*sc*f,y:cy+y1*sc*f,z:z2,f};});
    // 背景光晕
    const g=ctx.createRadialGradient(cx,cy,10,cx,cy,Math.min(w,h)*.5);g.addColorStop(0,'rgba(255,210,63,.22)');g.addColorStop(1,'rgba(255,210,63,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    const on=e=>!sel||sel==='all'||sel===e;
    // 深度排序绘制（画家算法）：z 越大离观察者越远，先画远的。化学键从两端球面起止，切成短段各自排序，
    // 键与原子交错时只在很小的范围内交换先后，旋转时不会整根跳到前面或后面。
    const RW=e=>e==='H'?.3:.45,big=sel&&sel!=='all';
    const proj=q=>{const[x,y,z]=q;const x1=x*cyw+z*syw,z1=-x*syw+z*cyw,y1=y*cp-z1*sp,z2=y*sp+z1*cp;const f=5/(5+z2/ext*1.6);return[cx+x1*sc*f,cy+y1*sc*f,z2,f];};
    const items=P.map((p,i)=>({z:p.z,i}));const SEG=8;
    bonds.forEach(([i,j])=>{const A=atoms[i].p,B=atoms[j].p,L=dist(A,B),u=B.map((x,k)=>(x-A[k])/L),s0=RW(atoms[i].e)*.85,s1=L-RW(atoms[j].e)*.85;
      for(let k=0;k<SEG;k++){const t0=s0+(s1-s0)*k/SEG,t1=s0+(s1-s0)*(k+1)/SEG,q0=proj(A.map((x,m)=>x+u[m]*t0)),q1=proj(A.map((x,m)=>x+u[m]*t1));
        items.push({z:(q0[2]+q1[2])/2,s:[q0,q1],al:on(atoms[i].e)&&on(atoms[j].e)?1:.18});}});
    ctx.lineCap='butt';
    items.sort((a,b)=>b.z-a.z).forEach(it=>{
      if(it.s){const[q0,q1]=it.s,fw=(q0[3]+q1[3])/2*sc/40,dx=q1[0]-q0[0],dy=q1[1]-q0[1],L=Math.hypot(dx,dy)||1,ex=dx/L*.6,ey=dy/L*.6;ctx.globalAlpha=it.al;
        ctx.beginPath();ctx.moveTo(q0[0]-ex,q0[1]-ey);ctx.lineTo(q1[0]+ex,q1[1]+ey);ctx.strokeStyle=INK;ctx.lineWidth=7*fw;ctx.stroke();ctx.strokeStyle='#c9d3e3';ctx.lineWidth=4*fw;ctx.stroke();ctx.globalAlpha=1;}
      else{const p=P[it.i];atomBall(ctx,p.x,p.y,RW(p.e)*sc*p.f*(big&&on(p.e)?1.08:1),p.e,{alpha:on(p.e)?1:.18,lab:p.e!=='H',hi:big&&on(p.e)});}});
    // 化学式与计数
    fmDraw(ctx,'C15H22O5',cx,52,46,{cols:{sub:TEAL}});
    if(sel){const n=sel==='all'?CNT.C+CNT.H+CNT.O:CNT[sel],k=Math.min(n,Math.floor(selT*28));const name=sel==='all'?'1 个分子共有':`1 个分子中${ATOM[sel][1]}原子`;
      sticker(ctx,w-230,96,206,92,16,'#fffbe6');txt(ctx,name,w-127,124,{size:15,weight:700,col:'#55617f'});txt(ctx,`${k} 个`,w-127,160,{size:34,weight:700,col:sel==='all'?CORAL:INK});}
    else txt(ctx,'拖动可以旋转 · 点下方元素数一数',cx,h-74,{size:14,weight:700,col:'#55617f'});}
  return{tick};})();

/* ================= 2 什么是化学式：化学式卡片墙 ================= */
S.what=(()=>{
  const CARDS=[['H2O','水','H2O'],['O2','氧气','O2'],['H2','氢气','H2'],['CO2','二氧化碳','CO2'],['HCl','氯化氢','HCl'],['Fe3O4','四氧化三铁','Fe:O = 3:4'],['HgO','氧化汞','HgO'],['NaCl','氯化钠','Na⁺:Cl⁻ = 1:1']];
  const box=$('#whCards');box.innerHTML=CARDS.map(([f,n,m],i)=>`<div class="fc" data-i="${i}"><div class="f"><span class="fm">${fm(f)}</span><small>点我翻面</small></div><div class="b"><span class="nm">${n}</span><canvas></canvas></div></div>`).join('');
  function drawBack(card){const i=+card.dataset.i,[f,,m]=CARDS[i],cv=$('canvas',card);requestAnimationFrame(()=>{const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
      if(MOL[m])drawMol(ctx,m,w/2,h/2,Math.min(26,h*.42));else txt(ctx,m.replace(':','∶').replace(':','∶'),w/2,h/2,{size:20,weight:700,col:'#55617f'});});}
  $$('.fc',box).forEach(c=>c.onclick=()=>{c.classList.toggle('open');if(c.classList.contains('open'))drawBack(c);sfx('pop');});
  $('#whAll').onclick=()=>{$$('.fc',box).forEach(c=>{c.classList.add('open');drawBack(c);});sfx('whoosh');};
  $('#whHide').onclick=()=>{$$('.fc',box).forEach(c=>c.classList.remove('open'));sfx('click');};
  tfGroup($('#whTF'),$('#whSub'),$('#whRedo'),$('#whSt'),[
    ['每种纯净物的组成是固定的，表示它的化学式只有一个',true,'每种纯净物的组成固定不变，化学式只有一个。'],
    ['化学式可以根据自己的想象来书写',false,'物质的组成是通过实验测定的，化学式必须依据实验结果书写。'],
    [`${fmB('H2O')} 既表示水这种物质，也表示水的组成`,true,''],
    ['混合物也可以用一个化学式来表示',false,'混合物没有固定的组成，不能用一个化学式表示。']]);
  $('#whReset').onclick=()=>{$('#whHide').click();$('#whRedo').click();};
  return{};})();

/* ================= 3 化学式的意义：解码器（按教材图 4-19 布局） ================= */
S.mean=(()=>{
  const D={
    H2O:{n:'水',m:'H2O',t:['表示水由氢元素和氧元素组成','表示 1 个水分子由 2 个氢原子和 1 个氧原子构成','表示水这种物质','表示 1 个水分子']},
    CO2:{n:'二氧化碳',m:'CO2',t:['表示二氧化碳由碳元素和氧元素组成','表示 1 个二氧化碳分子由 1 个碳原子和 2 个氧原子构成','表示二氧化碳这种物质','表示 1 个二氧化碳分子']},
    NH3:{n:'氨气',m:'NH3',t:['表示氨气由氮元素和氢元素组成','表示 1 个氨分子由 1 个氮原子和 3 个氢原子构成','表示氨气这种物质','表示 1 个氨分子']},
    C15H22O5:{n:'青蒿素',m:null,t:['表示青蒿素由碳、氢、氧三种元素组成','表示 1 个青蒿素分子由 15 个碳原子、22 个氢原子和 5 个氧原子构成','表示青蒿素这种物质','表示 1 个青蒿素分子']},
    NaCl:{n:'氯化钠',m:'lattice',ion:true,t:['表示氯化钠由钠元素和氯元素组成','表示氯化钠由钠离子和氯离子构成','表示氯化钠这种物质',`表示 ${fm('Na^+')} 与 ${fm('Cl^-')} 的个数比为 1∶1（最简比）`]}};
  let cur='H2O',t=0;const grid=$('#meGrid'),cv=$('#cvMean');
  $('#meChips').innerHTML=Object.keys(D).map(k=>`<button class="btn" data-k="${k}"><span class="fm">${fm(k)}</span></button>`).join('');
  $$('#meChips .btn').forEach(b=>b.onclick=()=>{cur=b.dataset.k;show();sfx('whoosh');});
  $$('.bub',grid).forEach(b=>{const k=+b.dataset.k;b.style.gridArea=[ '1/1','1/3','2/1','2/3'][k];b.onclick=()=>{b.classList.remove('hide');sfx('pop');burstAt(b,10,[CORAL,SUN]);lines();};});
  function show(){const d=D[cur];$('#meFm').innerHTML=fm(cur);$('#meFm').style.fontSize=cur.length>6?'44px':'64px';$('#meNm').textContent=d.n;
    $$('.bub',grid).forEach(b=>{b.classList.add('hide');$('.txt',b).innerHTML=d.t[+b.dataset.k];});
    $$('#meChips .btn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===cur)));
    let bn=$('.banner',grid);if(d.ion){if(!bn){bn=document.createElement('div');bn.className='banner';grid.appendChild(bn);}bn.textContent='由离子构成：NaCl 不表示 1 个分子';}else if(bn)bn.remove();
    requestAnimationFrame(lines);}
  function lines(){const svg=$('#meLines'),core=$('#meCore');if(!core.offsetWidth)return;const cx=core.offsetLeft+core.offsetWidth/2,cy=core.offsetTop+core.offsetHeight/2,R=core.offsetWidth/2;
    svg.innerHTML='<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1f2a44"/></marker></defs>'+
      $$('.bub',grid).map(b=>{const bx=b.offsetLeft+b.offsetWidth/2,by=b.offsetTop+b.offsetHeight/2,a=Math.atan2(by-cy,bx-cx),x1=cx+Math.cos(a)*(R+6),y1=cy+Math.sin(a)*(R+6);
        const ex=bx<cx?b.offsetLeft+b.offsetWidth+4:b.offsetLeft-4,ey=by;const hid=b.classList.contains('hide');
        return`<line x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}" stroke="#1f2a44" stroke-width="${hid?2:3}" stroke-dasharray="${hid?'6 6':''}" marker-end="url(#ah)" opacity="${hid?.45:1}"/>`;}).join('');}
  $('#meAll').onclick=()=>{$$('.bub',grid).forEach(b=>b.classList.remove('hide'));sfx('whoosh');lines();};
  $('#meHide').onclick=()=>{$$('.bub',grid).forEach(b=>b.classList.add('hide'));sfx('click');lines();};
  tfGroup($('#meTF'),$('#meSub'),$('#meRedo'),$('#meSt'),[
    ['水由氢元素和氧元素组成',true,''],
    ['水由 2 个氢原子和 1 个氧原子构成',false,'物质不能用“几个原子”描述：应说 1 个水分子由 2 个氢原子和 1 个氧原子构成。'],
    [`${fmB('NaCl')} 表示 1 个氯化钠分子`,false,'氯化钠由钠离子和氯离子构成，不存在氯化钠分子；NaCl 表示两种离子的个数比为 1∶1。'],
    ['1 个二氧化碳分子中含有 1 个氧分子',false,'分子由原子构成：1 个二氧化碳分子中含有 2 个氧原子，不含氧分子。'],
    ['青蒿素由 15 个碳元素、22 个氢元素和 5 个氧元素组成',false,'元素只讲种类、不讲个数：青蒿素由碳、氢、氧三种元素组成。'],
    ['1 个青蒿素分子中碳、氢、氧原子的个数比为 15∶22∶5',true,'']]);
  $('#meReset').onclick=()=>{cur='H2O';show();$('#meRedo').click();};
  show();
  function tick(dt){t+=dt;const d=D[cur];const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    if(d.m==='lattice'){const n=4,m=3,u=Math.min(w/(n+1),h/(m+1));for(let i=0;i<n;i++)for(let j=0;j<m;j++){const na=(i+j)%2===0,x=w/2+(i-(n-1)/2)*u,y=h/2+(j-(m-1)/2)*u+Math.sin(t*2+i+j)*1.5;
        atomBall(ctx,x,y,na?u*.3:u*.42,na?'Na':'Cl',{lab:false});txt(ctx,na?'+':'−',x,y+1,{size:u*.32,weight:700,col:'#fff'});}}
    else if(d.m)drawMol(ctx,d.m,w/2,h/2,Math.min(h*.42,w*.2),{rot:Math.sin(t*.8)*.15});
    else{[['C',15],['H',22],['O',5]].forEach(([e,c],i)=>{const x=w/2+(i-1)*w*.3;atomBall(ctx,x,h/2-6,16,e);txt(ctx,'×'+c,x,h/2+26,{size:16,weight:700});});}}
  return{tick,enter(){requestAnimationFrame(lines);}};})();
