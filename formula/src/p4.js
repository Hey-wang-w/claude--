/* ================= 9 竞赛：化学式宾果（答对占格，连成一线额外加分） ================= */
S.bingo=(()=>{
  // [格子上的化学式, 分值, 题目, 选项, 正确项, 解析]
  const Q=[
    ['O2',10,`${fmB('O2')} 中的“2”表示什么？`,['2 个氧原子','1 个氧分子中含有 2 个氧原子','2 个氧元素','2 个氧分子'],1,'右下角的数字表示 1 个分子中所含该原子的个数。'],
    ['2N',10,`${fmB('2N')} 表示什么？`,['2 个氮原子','氮气','2 个氮分子','2 个氮元素'],0,'元素符号前面加数字只表示原子个数，只有微观意义；元素不讲个数。'],
    ['Fe3O4',10,`${fmB('Fe3O4')} 应该怎样读？`,['三铁化四氧','三氧化四铁','四氧化三铁','氧化铁'],2,'从右往左读，并读出原子个数：四氧化三铁。'],
    ['NaCl',10,`关于 ${fmB('NaCl')}，下列说法正确的是`,['表示 1 个氯化钠分子','氯化钠由钠原子和氯原子构成','读作“钠化氯”','氯化钠由钠离子和氯离子构成'],3,'氯化钠由离子构成，NaCl 表示钠离子和氯离子个数比为 1∶1；读作氯化钠。'],
    ['C6H8O6',20,`维生素 C 的化学式为 ${fmB('C6H8O6')}，下列说法正确的是`,['维生素 C 由 6 个碳原子、8 个氢原子和 6 个氧原子构成','1 个维生素 C 分子中含有 20 个原子','维生素 C 中含有 3 个元素','1 个维生素 C 分子中含有 4 个氢分子'],1,'6 + 8 + 6 = 20。物质由分子构成，不能说“由几个原子构成”；元素不讲个数；分子中不含其他分子。'],
    ['P2O5',10,'下列化学式的书写和读法都正确的是',[`${fmB('O5P2')}　五氧化二磷`,`${fmB('P2O5')}　五氧化二磷`,`${fmB('P2O5')}　二磷化五氧`,`${fmB('p2O5')}　五氧化二磷`],1,'氧化物中氧写在右边；从右往左读；元素符号第一个字母大写。'],
    ['He',10,'氦气的化学式是',[fmB('He2'),fmB('2He'),fmB('He'),fmB('HE')],2,'稀有气体由原子直接构成，用元素符号表示；第二个字母小写。'],
    ['Mg^2+',10,`${fmB('Mg^2+')} 中的“2”表示什么？`,['2 个镁离子','1 个镁离子带 2 个单位正电荷','2 个镁原子','1 个镁离子中含有 2 个镁原子'],1,'右上角的数字表示 1 个离子所带的电荷数。'],
    ['H2O2',20,`过氧化氢的化学式为 ${fmB('H2O2')}，下列说法正确的是`,['过氧化氢由氢气和氧气组成','过氧化氢由氢元素和氧元素组成','过氧化氢由 2 个氢原子和 2 个氧原子构成','1 个过氧化氢分子中含有 1 个氧分子'],1,'纯净物中不含氢气、氧气；物质的组成用元素描述，构成用分子描述。']];
  const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const grid=$('#biGrid'),card=$('#biCard');let own=Q.map(()=>''),cur=-1,pick=null,got={r:0,b:0},lines=[];
  function cells(){grid.innerHTML=Q.map(([f,p],i)=>{const o=own[i];return`<div class="cell${o?' '+o:''}${i===cur?' cur':''}${lines.some(l=>l.includes(i))?' win':''}" data-i="${i}">
      <span class="pt tag ${p>10?'y':'s'}">${p} 分</span><span class="fm">${fm(f)}</span>${o==='r'||o==='b'?`<span class="own">${tname(o)}</span>`:o==='x'?'<span class="own" style="color:#8a95ad">答错作废</span>':''}</div>`;}).join('');
    $$('.cell',grid).forEach(c=>c.onclick=()=>{const i=+c.dataset.i;if(own[i])return;cur=i;pick=null;sfx('pop');cells();ask();});}
  const tag=tm=>`<span class="teamTag ${tm}">${tname(tm)}</span>`;
  function idle(){if(own.every(Boolean))return finish();card.innerHTML=`<div class="qmeta">${tag(TEAM.cur)}<span class="hint">选格子</span></div>
      <div class="qtext">请 <b>${tname(TEAM.cur)}</b> 在左边选一个格子答题。</div>
      <div class="hint" style="line-height:1.8">· 答对占领格子，得格子上的分数；答错格子作废，不加分。<br>· 同一队占领的格子连成一条线（横、竖、斜）就喊“宾果！”，额外 +20。<br>· 两队轮流选格子。</div>`;}
  function ask(){const[,p,q,O]=Q[cur];
    card.innerHTML=`<div class="qmeta">${tag(TEAM.cur)}<span class="tag ${p>10?'y':'s'}">${p} 分${p>10?' · 提升':''}</span></div><div class="qtext">${q}</div>
      <div class="opts">${O.map((o,k)=>`<button class="opt" data-v="${k}"><i>${'ABCD'[k]}</i><span>${o}</span></button>`).join('')}</div>
      <div class="row"><button class="btn pri sm" id="biSub">提交</button></div><div class="status" id="biSt">选好后提交。</div>`;
    $$('.opt',card).forEach(b=>b.onclick=()=>{if(pick===-1)return;pick=+b.dataset.v;$$('.opt',card).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
    $('#biSub').onclick=submit;}
  function submit(){if(pick===null){setSt($('#biSt'),'warn','请先选一个答案');return;}if(pick===-1)return;const i=cur,[,p,,,ans,ex]=Q[i],tm=TEAM.cur,mine=pick,ok=mine===ans;pick=-1;
    $$('.opt',card).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===ans)x.classList.add('right');else if(v===mine)x.classList.add('wrong');});
    $('#biSub').remove();own[i]=ok?tm:'x';cur=-1;let bonus=0;
    if(ok){teamAdd(p,tm);got[tm]+=p;sfx('ok');
      LINES.forEach(l=>{if(l.includes(i)&&l.every(k=>own[k]===tm)){lines.push(l);bonus+=20;}});}
    else{sfx('bad');flash();}
    cells();const el=$$('.cell',grid)[i];
    if(ok)burstAt(el,24,[tm==='r'?CORAL:SKY,SUN]);
    if(bonus){setTimeout(()=>{teamAdd(bonus,tm);got[tm]+=bonus;stampOn($('[data-id="bingo"] .stage'),'宾果！',true,'50%','50%');FX.confetti();sfx('win');},500);}
    setSt($('#biSt'),ok?'ok':'bad',`<b>${ok?`${tname(tm)}答对 +${p}${bonus?`，连线宾果 +${bonus}`:''}`:`${tname(tm)}答错，格子作废`}</b><br>${ex}`);
    const nx=document.createElement('div');nx.className='row';nx.innerHTML=`<button class="btn pri sm">${own.every(Boolean)?'看结果':'下一队选格子'}</button>`;card.appendChild(nx);
    teamNext();$('button',nx).onclick=()=>{stampOff($('[data-id="bingo"] .stage'));idle();};}
  function finish(){const w=got.r===got.b?'':got.r>got.b?'r':'b';
    card.innerHTML=`<div class="qmeta"><span class="tag y">宾果结束</span></div><div class="qtext" style="font-size:24px">${w?`${tag(w)} 赢得本轮宾果！`:'两队打成平手！'}</div>
      <div class="row" style="gap:16px;font-size:20px"><span>${tag('r')} 本轮 <b class="fm">${got.r}</b> 分</span><span>${tag('b')} 本轮 <b class="fm">${got.b}</b> 分</span></div>
      <p class="hint">连成的线：${lines.length} 条。灰色格子是答错作废的题，可以一起再讲一讲。</p>`;FX.confetti();sfx('win');}
  function reset(){own=Q.map(()=>'');cur=-1;pick=null;got={r:0,b:0};lines=[];stampOff($('[data-id="bingo"] .stage'));cells();idle();}
  $('#biReset').onclick=reset;reset();
  return{enter(){if(cur<0&&!own.every(Boolean))idle();}};})();

/* ================= 10 小结 ================= */
S.sum=(()=>{
  const COL=[['化学式的意义',[['宏观',`表示一种物质，如 ${fmB('H2O')} 表示水`],['宏观','表示物质的元素组成：水由氢元素和氧元素组成'],['微观','表示该物质的 1 个分子'],['微观','表示 1 个分子的构成：1 个水分子由 2 个氢原子和 1 个氧原子构成']]],
    ['数字的位置',[['前面',`粒子个数，如 ${fmB('2H')}、${fmB('2H2O')}；只有微观意义`],['右下角',`1 个分子中某原子的个数，如 ${fmB('H2')} 中的 2`],['右上角',`1 个离子所带的电荷数，如 ${fmB('Mg^2+')} 中的 2`]]],
    ['书写与读法',[['单质',`金属、固态非金属、稀有气体用元素符号；氧气等写作 ${fmB('O2')}`],['化合物','氧化物中氧在右；一般金属在左、非金属在右；个数为 1 省略'],['读法',`从右往左读“某化某”，必要时读出个数：${fmB('Fe3O4')} 四氧化三铁`]]]];
  const g=$('#suGrid');g.innerHTML=COL.map(([h,L])=>`<div class="scol"><h4>${h}</h4>${L.map(([q,a])=>`<div class="sitem hide"><span class="q">${q}</span><span class="a">${a}</span></div>`).join('')}</div>`).join('');
  $$('.sitem',g).forEach(x=>x.onclick=()=>{x.classList.toggle('hide');sfx('pop');});
  $('#suAll').onclick=()=>{$$('.sitem',g).forEach((x,i)=>setTimeout(()=>x.classList.remove('hide'),i*90));sfx('whoosh');};
  $('#suHide').onclick=()=>{$$('.sitem',g).forEach(x=>x.classList.add('hide'));sfx('click');};
  return{enter(){const{r,b}=TEAM.sc;$('#suScore').innerHTML=`<span style="color:${CORAL}">红队 <b class="fm">${r}</b></span>　<span style="color:${SKY}">蓝队 <b class="fm">${b}</b></span><div class="hint" style="font-size:16px;margin-top:4px">${r===b?'平分秋色！':(r>b?'红队':'蓝队')+'领先，继续加油！'}</div>`;}};})();
