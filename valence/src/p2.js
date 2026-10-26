/* ================= 5 化合价歌谣：跟读、随机挖空、接龙排序、化合价归队；快问快答 ================= */
S.song=(()=>{
  const LY=['一价氢氯钾钠银，二价氧钙钡镁锌，','三铝四硅五氮磷，二三铁、二四碳，','二四六硫都齐全，铜汞二价最常见，','单质零价永不变！','负一硝酸氢氧根，负二硫酸碳酸根；','负三记住磷酸根，正一价的是铵根。'];
  const NEG={'0,3':1,'0,10':1,'2,0':1};// 歌谣里标红的负价：氯、氧、“二四六硫”的二
  const NUM='一二三四五六零';
  const lyr=$('#soLyr');let play=null,mode='read';
  lyr.innerHTML=LY.map((l,i)=>`<div class="ln${i===4?' sec':''}">${[...l].map((c,j)=>`<span data-k="${i},${j}" class="${NEG[i+','+j]?'neg':''}">${c}</span>`).join('')}</div>`).join('');
  const spans=$$('span',lyr);
  function stop(){if(play){clearTimeout(play);play=null;}spans.forEach(s=>s.classList.remove('now'));if(mode==='read')$('#soAct').textContent='开始跟读';}
  function sing(){stop();spans.forEach(s=>s.classList.remove('done'));let i=0;$('#soAct').textContent='停止';
    const step=()=>{if(i>=spans.length){stop();sfx('win');return;}spans.forEach(s=>s.classList.remove('now'));const s=spans[i];const c=s.textContent;
      if(!/[，。；！、]/.test(c)){s.classList.add('now');s.classList.add('done');sfx('tick');}
      i++;play=setTimeout(step,/[，。；！]/.test(c)?420:/、/.test(c)?200:360);};step();}
  // 随机挖空：数字、元素名、根名里随机挖 9 个，每次不同
  const KEYS=[...'一二三四五六零氢氯钾钠银氧钙钡镁锌铝硅氮磷铁碳硫铜汞铵'];
  const cand=spans.filter(s=>KEYS.includes(s.textContent));
  function holes(){spans.forEach(s=>{s.classList.remove('hole','show','done');});const a=cand.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    a.slice(0,9).forEach(s=>s.classList.add('hole'));sfx('whoosh');}
  spans.forEach(s=>s.onclick=()=>{if(s.classList.contains('hole')&&!s.classList.contains('show')){s.classList.add('show');sfx('pop');burstAt(s,6,[CY,CG]);}});
  // 接龙排序：11 个半句打乱，按顺序点
  const HALF=LY.flatMap(l=>l.split(/[，；！。]/).filter(Boolean));let oNext=0;
  function order(){oNext=0;const idx=HALF.map((_,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]];}
    $('#soOL').innerHTML=HALF.map((h,i)=>`<span class="oslot" data-i="${i}">${i+1}</span>`).join('');
    $('#soOP').innerHTML=idx.map(i=>`<button class="ocard" data-i="${i}">${HALF[i]}</button>`).join('');
    $$('#soOP .ocard').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(i===oNext){const sl=$$('#soOL .oslot')[i];sl.textContent=HALF[i];sl.classList.add('ok');b.classList.add('used');b.disabled=true;oNext++;sfx('pop');burstAt(sl,8,[CY,CG]);
        if(oNext===HALF.length){FX.confetti();sfx('win');}}
      else{b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');sfx('bad');}});}
  // 化合价归队：拖卡片进格子，点“检查”
  const SORT=[['K',1],['Na',1],['Ag',1],['H',1],['NH4',1],['Ca',2],['Ba',2],['Mg',2],['Zn',2],['Al',3],['Cl',-1],['OH',-1],['NO3',-1],['O',-2],['SO4',-2],['CO3',-2],['PO4',-3]];
  const BINV=[1,2,3,-1,-2,-3],vs=v=>(v>0?'+':'−')+Math.abs(v);let sel=null,checked=false;
  $('#soSB').innerHTML=BINV.map(v=>`<div class="sbin ${v>0?'pos':'neg'}" data-v="${v}"><b>${vs(v)}</b><div class="sdrop"></div></div>`).join('');
  function sortDeal(){checked=false;sel=null;const a=SORT.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    $$('#soSB .sdrop').forEach(d=>d.innerHTML='');$('#soST').innerHTML=a.map(([e,v])=>`<span class="schip" data-v="${v}">${fm(e)}</span>`).join('');
    $$('#soST .schip').forEach(c=>domDrag(c,{onDrop:(el,under)=>{const b=under&&under.closest('.sbin');if(b)put(el,$('.sdrop',b));else if(under&&under.closest('#soST'))put(el,$('#soST'));},
      onTap:el=>{if(checked)return;if(sel)sel.classList.remove('sel');sel=sel===el?null:el;if(sel)sel.classList.add('sel');sfx('click');}}));}
  function put(el,host){if(checked)return;el.classList.remove('sel','right','wrong');sel=null;host.appendChild(el);sfx('drop');}
  $$('#soSB .sbin').forEach(b=>b.addEventListener('click',e=>{if(sel&&!e.target.closest('.schip'))put(sel,$('.sdrop',b));}));
  function sortCheck(){const left=$$('#soST .schip').length;if(left){$('#soSort .sotip').textContent=`还有 ${left} 张没放`;sfx('bad');return;}checked=true;let bad=0;
    $$('#soSB .sbin').forEach(b=>$$('.schip',b).forEach(c=>{const ok=c.dataset.v===b.dataset.v;if(!ok)bad++;c.classList.add(ok?'right':'wrong');}));
    $('#soSort .sotip').textContent=bad?`放错 ${bad} 张（红色），再想一想歌谣`:'全部正确！';sfx(bad?'bad':'win');if(!bad)FX.confetti();}
  // 模式切换：工具栏右侧的主按钮随模式变化
  const ACT={read:'开始跟读',hole:'换一批',order:'重新打乱',sort:'检查'};
  const TIP={read:'跟着高亮一起读',hole:'点虚线框揭晓；点“换一批”重新挖空'};
  function setMode(m){stop();mode=m;$$('#soBar [data-m]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.m===m)));$('#soAct').textContent=ACT[m];
    $('#soSong').hidden=!(m==='read'||m==='hole');$('#soOrder').hidden=m!=='order';$('#soSort').hidden=m!=='sort';$('#soTip').textContent=TIP[m]||'';
    spans.forEach(s=>s.classList.remove('hole','show','done'));if(m==='hole')holes();if(m==='order')order();if(m==='sort'){sortDeal();$('#soSort .sotip').textContent='把元素和根拖进对应的化合价（也可以先点卡片、再点格子），放好后点“检查”';}sfx('click');}
  $$('#soBar [data-m]').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
  $('#soAct').onclick=()=>{if(mode==='read'){if(play){stop();return;}sing();}else if(mode==='hole')holes();else if(mode==='order')order();else if(checked){sortDeal();$('#soAct').textContent='检查';}else{sortCheck();if(checked)$('#soAct').textContent='再来一次';}};
  $('#soTip').textContent=TIP.read;
  // 快问快答：一组 5 张，全部选完再提交
  const POOL=[['K','钾',0],['Na','钠',0],['Ag','银',0],['H','氢',0],['Ca','钙',1],['Ba','钡',1],['Mg','镁',1],['Zn','锌',1],['Al','铝',2],['O','氧（化合物中）',4],
    ['OH','氢氧根',3],['NO3','硝酸根',3],['SO4','硫酸根',4],['CO3','碳酸根',4],['NH4','铵根',0],['PO4','磷酸根',5]];
  const OPT=['+1','+2','+3','−1','−2','−3'];
  const box=$('#soFlash'),st=$('#soSt');let set=[],cur=0,pick=[],done=false;
  function deal(){clearTimeout(box._t);delete box.dataset.lock;const a=POOL.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}set=a.slice(0,5);cur=0;pick=[];done=false;render();setSt(st,'','一组 5 张，全部选完再提交；全对 +5');}
  function render(){const c=set[Math.min(cur,4)];
    if(done){box.innerHTML=`<div class="tflist">${set.map((c,i)=>`<div class="tf ${pick[i]===c[2]?'right':'wrong'}"><div>${fmB(c[0])} <span class="hint">${c[1]}</span></div><b class="fm" style="color:var(--cy)">${OPT[c[2]]}${pick[i]!==c[2]?` <span class="hint">（选了 ${OPT[pick[i]]}）</span>`:''}</b></div>`).join('')}</div>`;return;}
    box.innerHTML=`<div class="prog5">${set.map((_,i)=>`<i class="${i<cur?'ok':i===cur?'cur':''}"></i>`).join('')}</div>`+
      (cur<5?`<div class="big"><span class="fm">${fm(c[0])}</span><small>${c[1]}的化合价是？</small></div><div class="vals" style="grid-template-columns:repeat(3,minmax(0,1fr))">${OPT.map((o,k)=>`<button data-k="${k}">${o}</button>`).join('')}</div>`
        :`<div class="big" style="font-size:22px"><small>5 张都选好了，点“提交”看结果</small></div><div class="row" style="justify-content:center">${set.map((c,i)=>`<span class="tag y">${fm(c[0])} ${OPT[pick[i]]}</span>`).join('')}</div>`);
    $$('.vals button',box).forEach(b=>b.onclick=()=>{if(box.dataset.lock)return;box.dataset.lock='1';pick[cur]=+b.dataset.k;b.setAttribute('aria-pressed','true');sfx('click');box._t=setTimeout(()=>{delete box.dataset.lock;cur++;render();},180);});}// 加锁：连点两下不会跳过下一张
  $('#soSub').onclick=()=>{if(done)return;if(cur<5){setSt(st,'warn',`还有 ${5-cur} 张没选`);return;}done=true;const tm=TEAM.cur,bad=set.filter((c,i)=>pick[i]!==c[2]).length;render();
    if(!bad){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +5</b>`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}错 ${bad} 张，不加分</b>　黄色是正确的化合价。`);}teamNext();};
  $('#soRedo').onclick=()=>{deal();sfx('whoosh');};
  $('#soReset').onclick=()=>{setMode('read');deal();};
  deal();
  notes('song','常见元素和根的化合价',['金属元素与非金属元素化合时，<mark>金属元素显正价</mark>，<mark>非金属元素显负价</mark>。','一些元素可显<mark>不同的化合价</mark>：Fe 有 +2、+3，Cu 有 +1、+2，S 有 −2、+4、+6。','在<mark>单质</mark>里，元素的化合价为 <mark>0</mark>。'],
    '铵根 NH₄ 显 +1 价，是常见的根里唯一显正价的。',
    (ctx,w,h)=>{const R=[['+1',PEN.red,'K Na Ag H','NH₄'],['+2',PEN.red,'Ca Ba Mg Zn',''],['+3',PEN.red,'Al',''],['−1',PEN.blue,'Cl','OH NO₃'],['−2',PEN.blue,'O','SO₄ CO₃'],['−3',PEN.blue,'','PO₄']];
      hand(ctx,'元素',w*.45,22,{size:20,col:PEN.dim});hand(ctx,'根',w*.82,22,{size:20,col:PEN.dim});
      R.forEach(([v,c,el,rt],i)=>{const y=58+i*(h-70)/6;chalkCircle(ctx,34,y,22,{col:c,w:2.5,seed:i+1});txt(ctx,v,34,y+1,{size:20,weight:700,col:c});
        txt(ctx,el,w*.45,y,{size:20,weight:700,col:PEN.ink});txt(ctx,rt,w*.82,y,{size:20,weight:700,col:PEN.gold});
        chalkLine(ctx,64,y+(h-70)/12,w-10,y+(h-70)/12,{col:'rgba(42,42,36,.18)',w:1.2,seed:i+9});});});
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
  notes('group','原子团（根）',['常作为<mark>一个整体</mark>参加反应的原子团，叫作<mark>根</mark>。','根也有化合价：与它所带的电荷<mark>数值相等、正负相同</mark>，如 OH⁻ 为 −1 价。',
    `同一种根不止 1 个时加<mark>括号</mark>，个数写在括号右下角：${fmB('Ca(OH)2')}。`,'读法：含 OH 读“<mark>氢氧化某</mark>”，含酸根读“<mark>某酸某</mark>”。'],
    `${fmB('Ca(OH)2')} 不能写成 CaOH₂ 或 CaO₂H₂。`,
    (ctx,w,h)=>{fmDraw(ctx,'Ca(OH)2',w/2,62,52,{col:PEN.ink,cols:{sub:PEN.red}});hand(ctx,'氢氧化钙',w/2,112,{size:24,col:PEN.green});
      const y=190;chalkCircle(ctx,64,y,26,{col:PEN.ink,w:2,seed:1});txt(ctx,'Ca',64,y+1,{size:18,weight:700,col:PEN.ink});txt(ctx,'+2',64,y-40,{size:18,weight:700,col:PEN.red});
      [0,1].forEach(k=>{const x=170+k*110;ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=PEN.blue;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,46,30,0,0,TAU);ctx.stroke();ctx.restore();
        fmDraw(ctx,'OH',x,y,24,{col:PEN.blue});txt(ctx,'−1',x,y-44,{size:18,weight:700,col:PEN.blue});});
      hand(ctx,'2 个 OH 是 2 个整体',w/2,y+62,{size:20,col:PEN.blue});hand(ctx,'(+2) + (−1)×2 = 0',w/2,y+100,{size:20,col:PEN.green});});
  return{tick};})();
