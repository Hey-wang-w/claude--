/* ================= 4 化合价歌谣：跟读、挖空挑战、规律探究；快问快答 ================= */
S.song=(()=>{
  const LY=['一价氢氯钾钠银，二价氧钙钡镁锌，','三铝四硅五氮磷，二三铁、二四碳，','二四六硫都齐全，铜汞二价最常见，','单质零价永不变！','负一硝酸氢氧根，负二硫酸碳酸根；','负三记住磷酸根，正一价的是铵根。'];
  const NEG={'0,3':1,'0,10':1,'2,0':1};// 歌谣里标红的负价：氯、氧、“二四六硫”的二
  const NUM='一二三四五六零';
  const lyr=$('#soLyr');let play=null,hole=false,p3=false;
  lyr.innerHTML=LY.map((l,i)=>`<div class="ln${i===4?' sec':''}">${[...l].map((c,j)=>`<span data-k="${i},${j}" class="${NEG[i+','+j]?'neg':''}">${c}</span>`).join('')}</div>`).join('');
  const spans=$$('span',lyr);
  function stop(){if(play){clearTimeout(play);play=null;}spans.forEach(s=>s.classList.remove('now'));$('#soPlay').textContent='跟读';}
  function sing(){stop();spans.forEach(s=>s.classList.remove('done'));let i=0;$('#soPlay').textContent='停止';
    const step=()=>{if(i>=spans.length){stop();sfx('win');return;}spans.forEach(s=>s.classList.remove('now'));const s=spans[i];const c=s.textContent;
      if(!/[，。；！、]/.test(c)){s.classList.add('now');s.classList.add('done');sfx('tick');}
      i++;play=setTimeout(step,/[，。；！]/.test(c)?420:/、/.test(c)?200:360);};step();}
  $('#soPlay').onclick=()=>{if(p3)toggleP3();if(play){stop();return;}sing();};
  function setHole(on){hole=on;$('#soHole').setAttribute('aria-pressed',String(on));spans.forEach(s=>{const n=NUM.includes(s.textContent);s.classList.toggle('hole',on&&n);s.classList.remove('show');});}
  spans.forEach(s=>s.onclick=()=>{if(s.classList.contains('hole')){s.classList.add('show');sfx('pop');burstAt(s,6,[CY,CG]);}});
  $('#soHole').onclick=()=>{if(p3)toggleP3();stop();setHole(!hole);sfx('click');};
  // 提升：第三周期元素的最外层电子数与化合价
  const P3=[['Na',1,'+1','—'],['Mg',2,'+2','—'],['Al',3,'+3','—'],['Si',4,'+4','−4'],['P',5,'+5','−3'],['S',6,'+6','−2'],['Cl',7,'+7','−1']];
  const tbl=$('#soTbl');
  tbl.innerHTML=`<tr><th>元素</th>${P3.map(r=>`<th>${r[0]}</th>`).join('')}</tr>`+[['最外层电子数',1],['最高正价',2],['最低负价',3]].map(([n,c])=>`<tr><th>${n}</th>${P3.map(r=>`<td class="cell hide">${r[c]}</td>`).join('')}</tr>`).join('');
  const law=$('#soLaw');
  $$('td.cell',tbl).forEach(td=>td.onclick=()=>{td.classList.remove('hide');sfx('pop');if(!$$('td.cell.hide',tbl).length)law.classList.add('on');});
  law.onclick=()=>{$$('td.cell',tbl).forEach(td=>td.classList.remove('hide'));law.classList.add('on');sfx('whoosh');};
  law.style.cursor='pointer';
  function toggleP3(){p3=!p3;stop();$('#soSong').hidden=p3;$('#soP3').hidden=!p3;$('#soP3Btn').textContent=p3?'返回歌谣':'提升：规律探究';$('#soP3Btn').setAttribute('aria-pressed',String(p3));
    if(p3)law.classList.toggle('on',!$$('td.cell.hide',tbl).length);sfx('whoosh');}
  $('#soP3Btn').onclick=toggleP3;
  // 快问快答：一组 5 张，全部选完再提交
  const POOL=[['K','钾',0],['Na','钠',0],['Ag','银',0],['H','氢',0],['Ca','钙',1],['Ba','钡',1],['Mg','镁',1],['Zn','锌',1],['Al','铝',2],['O','氧（化合物中）',4],
    ['OH','氢氧根',3],['NO3','硝酸根',3],['SO4','硫酸根',4],['CO3','碳酸根',4],['NH4','铵根',0],['PO4','磷酸根',5]];
  const OPT=['+1','+2','+3','−1','−2','−3'];
  const box=$('#soFlash'),st=$('#soSt');let set=[],cur=0,pick=[],done=false;
  function deal(){const a=POOL.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}set=a.slice(0,5);cur=0;pick=[];done=false;render();setSt(st,'','一组 5 张，全部选完再提交；全对 +5');}
  function render(){const c=set[Math.min(cur,4)];
    if(done){box.innerHTML=`<div class="tflist">${set.map((c,i)=>`<div class="tf ${pick[i]===c[2]?'right':'wrong'}"><div>${fmB(c[0])} <span class="hint">${c[1]}</span></div><b class="fm" style="color:var(--cy)">${OPT[c[2]]}${pick[i]!==c[2]?` <span class="hint">（选了 ${OPT[pick[i]]}）</span>`:''}</b></div>`).join('')}</div>`;return;}
    box.innerHTML=`<div class="prog5">${set.map((_,i)=>`<i class="${i<cur?'ok':i===cur?'cur':''}"></i>`).join('')}</div>`+
      (cur<5?`<div class="big"><span class="fm">${fm(c[0])}</span><small>${c[1]}的化合价是？</small></div><div class="vals" style="grid-template-columns:repeat(3,minmax(0,1fr))">${OPT.map((o,k)=>`<button data-k="${k}">${o}</button>`).join('')}</div>`
        :`<div class="big" style="font-size:22px"><small>5 张都选好了，点“提交”看结果</small></div><div class="row" style="justify-content:center">${set.map((c,i)=>`<span class="tag y">${fm(c[0])} ${OPT[pick[i]]}</span>`).join('')}</div>`);
    $$('.vals button',box).forEach(b=>b.onclick=()=>{pick[cur]=+b.dataset.k;b.setAttribute('aria-pressed','true');sfx('click');setTimeout(()=>{cur++;render();},180);});}
  $('#soSub').onclick=()=>{if(done)return;if(cur<5){setSt(st,'warn',`还有 ${5-cur} 张没选`);return;}done=true;const tm=TEAM.cur,bad=set.filter((c,i)=>pick[i]!==c[2]).length;render();
    if(!bad){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +5</b>`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}错 ${bad} 张，不加分</b>　黄色是正确的化合价。`);}teamNext();};
  $('#soRedo').onclick=()=>{deal();sfx('whoosh');};
  $('#soReset').onclick=()=>{if(p3)toggleP3();stop();setHole(false);spans.forEach(s=>s.classList.remove('done'));$$('td.cell',tbl).forEach(td=>td.classList.add('hide'));law.classList.remove('on');deal();};
  deal();
  notes('song','常见元素和根的化合价（教材表 4-3）',['金属元素与非金属元素化合时，<mark>金属元素显正价，非金属元素显负价</mark>。','一些元素在不同物质中可显<mark>不同的化合价</mark>：Fe 有 +2、+3；Cu 有 +1、+2；S 有 −2、+4、+6；N、Cl 也有多种化合价。',
    '在单质里，元素的化合价为 <mark>0</mark>。',`常见的根：${fmB('OH^-')}、${fmB('NO3^-')} 为 −1 价；${fmB('SO4^2-')}、${fmB('CO3^2-')} 为 −2 价；${fmB('PO4^3-')} 为 −3 价；${fmB('NH4^+')} 为 <mark>+1</mark> 价。`],
    '铵根 NH₄ 显 +1 价，是常见的根里唯一显正价的；非金属元素在化合物里不一定显负价（如 CO₂ 中 C 为 +4 价）。');
  return{leave(){stop();}};})();

/* ================= 5 原子团（根）：作为一个整体；括号与读法 ================= */
S.group=(()=>{const cv=$('#cvGroup');let t=0,cur='OH',cntT=-1;
  // [根, 名称, 化合价, 中心原子与周围原子, 例子, 例子读法, 要点]
  const G={OH:['氢氧根','−1',['O',['H']],'Ca(OH)2','氢氧化钙','含 OH 的读作“氢氧化某”；OH 不止 1 个，要加括号'],
    NO3:['硝酸根','−1',['N',['O','O','O']],'Cu(NO3)2','硝酸铜','含酸根的读作“某酸某”'],
    SO4:['硫酸根','−2',['S',['O','O','O','O']],'Al2(SO4)3','硫酸铝','原子团不止 1 个时，用括号括起来，个数写在括号右下角'],
    CO3:['碳酸根','−2',['C',['O','O','O']],'Na2CO3','碳酸钠','原子团只有 1 个时，不加括号'],
    PO4:['磷酸根','−3',['P',['O','O','O','O']],'Ca3(PO4)2','磷酸钙','含酸根的读作“某酸某”'],
    NH4:['铵根','+1',['N',['H','H','H','H']],'NH4Cl','氯化铵','铵根像金属一样写在左边，读作“某化铵”“某酸铵”']};
  const ION={OH:'OH^-',NO3:'NO3^-',SO4:'SO4^2-',CO3:'CO3^2-',PO4:'PO4^3-',NH4:'NH4^+'};
  const COLS=[CP,CB,CY,CG,CO,CL];
  $('#grStk').innerHTML=Object.keys(G).map((k,i)=>`<button class="gs" data-k="${k}" style="color:${COLS[i]}"><span class="fm">${fm(ION[k])}</span><small>${G[k][0]} ${G[k][1]} 价</small></button>`).join('');
  $$('#grStk .gs').forEach(b=>b.onclick=()=>{cur=b.dataset.k;cntT=-1;mark();sfx('pop');});
  const mark=()=>$$('#grStk .gs').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===cur)));mark();
  // 数原子：展开括号
  function count(f){const out={};const re=/\(([^)]*)\)(\d*)|([A-Z][a-z]?)(\d*)/g;let m;const add=(e,n)=>out[e]=(out[e]||0)+n;
    while((m=re.exec(f))){if(m[1]!==undefined){const k=+(m[2]||1);const r=/([A-Z][a-z]?)(\d*)/g;let q;while((q=r.exec(m[1])))add(q[1],(+(q[2]||1))*k);}else add(m[3],+(m[4]||1));}return out;}
  // 把例子拆成“单元”：左边的金属（或铵根）与右边的根
  function units(f){const m=/^(NH4|[A-Z][a-z]?)(\d*)(?:\((.+)\)(\d+)|(.+))$/.exec(f);if(!m)return null;return{a:m[1],na:+(m[2]||1),b:m[3]||m[5],nb:+(m[4]||1)};}
  $('#grCount').onclick=()=>{cntT=0;sfx('whoosh');};
  function tick(dt){t+=dt;if(cntT>=0)cntT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const g=G[cur],ci=Object.keys(G).indexOf(cur),col=COLS[ci];
    // 左：根的结构
    const lx=w*.2,ly=h*.42,[c0,arr]=g[2];
    ctx.save();ctx.setLineDash([9,7]);ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(lx,ly,arr.length===1?78:96,arr.length===1?64:96,0,0,TAU);ctx.stroke();ctx.restore();
    arr.forEach((e,i)=>{const a=-Math.PI/2+i/arr.length*TAU+(arr.length===1?Math.PI/2:0),R=arr.length===1?52:58,x=lx+Math.cos(a)*R,y=ly+Math.sin(a)*R;chalkLine(ctx,lx,ly,x,y,{col:INK,w:2.5,seed:i+2});chalkAtom(ctx,x,y,e==='H'?16:20,e,{seed:i+5});});
    chalkAtom(ctx,lx,ly,26,c0,{seed:1});
    fmDraw(ctx,ION[cur],lx,ly+140,40,{col});hand(ctx,`${g[0]}　${g[1]} 价`,lx,ly+186,{size:24,col});
    hand(ctx,'作为一个整体参加反应',lx,ly-128,{size:22,col:DIM});
    // 右：例子
    const u=units(g[3]),rx=w*.66,ry=h*.36;fmDraw(ctx,g[3],rx,ry-h*.2,62,{col:INK});hand(ctx,g[4],rx,ry-h*.2+56,{size:32,col:CY});
    const list=[];for(let i=0;i<u.na;i++)list.push([u.a,u.a.length>2||u.a==='NH4']);for(let i=0;i<u.nb;i++)list.push([u.b,u.b.length>1&&!/^[A-Z][a-z]?$/.test(u.b)]);
    const n=list.length,gap=Math.min(118,(w*.6)/n),uy=ry+h*.14;
    list.forEach(([s,grp],i)=>{const x=rx+(i-(n-1)/2)*gap;if(grp){ctx.save();ctx.setLineDash([6,5]);ctx.strokeStyle=s===cur?col:INK;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(x,uy,gap*.44,34,0,0,TAU);ctx.stroke();ctx.restore();fmDraw(ctx,s,x,uy,24,{col:s===cur?col:INK});}
      else chalkAtom(ctx,x,uy,24,s,{seed:i+20});});
    // 数一数
    const cnt=count(g[3]),keys=Object.keys(cnt),by=uy+78;
    if(cntT>=0){keys.forEach((e,i)=>{const q=clamp(cntT*1.6-i*.5,0,1);if(q<=0)return;ctx.globalAlpha=q;const x=rx+(i-(keys.length-1)/2)*120;chalkRect(ctx,x-52,by-24,104,48,{col:col,seed:i+30});txt(ctx,`${e}：${cnt[e]} 个`,x,by,{size:20,weight:700});ctx.globalAlpha=1;});
      const sum=keys.reduce((a,e)=>a+cnt[e],0);if(cntT>keys.length*.6+.6)hand(ctx,`1 个“${g[3].replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d])}”共 ${sum} 个原子`,rx,by+52,{size:22,col:CG});}
    else txt(ctx,'点“数一数原子”，看括号外的数字怎样乘进去',rx,by,{size:15,weight:700,col:DIM});
    hand(ctx,g[5],w/2,h-18,{size:20,col:CY,base:'bottom'});}
  // 连一连
  const PAIRS=[['Ba(OH)2','氢氧化钡'],['K2CO3','碳酸钾'],['ZnSO4','硫酸锌'],['NH4NO3','硝酸铵'],['AgNO3','硝酸银']];
  const NAMES=[2,4,0,3,1];// 右栏名称的打乱顺序
  const mb=$('#grMatch'),st=$('#grSt');let selL=null,link={},done=false;
  function render(){mb.innerHTML=`<div class="colx">${PAIRS.map((p,i)=>`<button data-l="${i}" class="${link[i]!==undefined?'paired':''}" aria-pressed="${selL===i}">${link[i]!==undefined?`<i>${i+1}</i>`:''}${fmB(p[0])}</button>`).join('')}</div>`+
      `<div class="colx">${NAMES.map(j=>{const by=Object.keys(link).find(k=>link[k]===j);return`<button data-r="${j}" class="${by!==undefined?'paired':''}">${by!==undefined?`<i>${+by+1}</i>`:''}${PAIRS[j][1]}</button>`;}).join('')}</div>`;
    $$('[data-l]',mb).forEach(b=>b.onclick=()=>{if(done)return;selL=+b.dataset.l;sfx('click');render();});
    $$('[data-r]',mb).forEach(b=>b.onclick=()=>{if(done||selL===null)return;const j=+b.dataset.r;Object.keys(link).forEach(k=>{if(link[k]===j)delete link[k];});link[selL]=j;selL=null;sfx('drop');render();});
    if(done)$$('[data-l]',mb).forEach(b=>{const i=+b.dataset.l;b.classList.add(link[i]===i?'right':'wrong');});}
  $('#grSub').onclick=()=>{if(done)return;if(Object.keys(link).length<PAIRS.length){setSt(st,'warn','每个化学式都要连上名称');return;}done=true;const tm=TEAM.cur,bad=PAIRS.filter((_,i)=>link[i]!==i).length;render();
    if(!bad){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +5</b>　含 OH 读“氢氧化某”，含酸根读“某酸某”，含铵根读“某化铵 / 某酸铵”。`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}连错 ${bad} 个，不加分</b>　正确：${PAIRS.map(p=>`${fmB(p[0])} ${p[1]}`).join('；')}`);}teamNext();};
  $('#grRedo').onclick=()=>{link={};selL=null;done=false;render();setSt(st,'','全对 +5 分');};
  $('#grReset').onclick=()=>{cur='OH';cntT=-1;mark();$('#grRedo').click();};
  render();
  notes('group','原子团（根）',['有些物质中的一些带电荷的原子团，常作为<mark>一个整体</mark>参加反应，这样的原子团叫作<mark>根</mark>。','根也有化合价，如 OH⁻ 为 −1 价：根的化合价与它所带的电荷<mark>数值相等、正负相同</mark>。',
    `化学式里同一种根不止 1 个时，用<mark>括号</mark>括起来，个数写在括号右下角：${fmB('Ca(OH)2')}、${fmB('Al2(SO4)3')}；只有 1 个时不加括号：${fmB('CaCO3')}。`,'读法：含 OH 读作“<mark>氢氧化某</mark>”；含酸根读作“<mark>某酸某</mark>”；含铵根读作“某化铵”“某酸铵”。'],
    `${fmB('Ca(OH)2')} 不能写成 CaOH₂ 或 CaO₂H₂：括号外的 2 表示 2 个 OH。`);
  return{tick};})();
