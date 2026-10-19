/* ================= 6 单质的化学式：先按物质类别分拣，提交后揭晓写法 ================= */
S.elem=(()=>{
  const CARDS=[['氦气','He',0],['氖气','Ne',0],['氩气','Ar',0],['铁','Fe',1],['铜','Cu',1],['铝','Al',1],['碳','C',1],['硫','S',1],['磷','P',1],['氧气','O2',2],['氮气','N2',2],['氢气','H2',2]];
  const BINS=[['稀有气体','如氦气、氖气',`由原子直接构成，用<b>元素符号</b>表示，如 ${fmB('He')}`],
    ['金属和固态非金属','如铁、碳',`习惯上用<b>元素符号</b>表示，如 ${fmB('Fe')}、${fmB('C')}`],
    ['气态非金属','如氧气、氮气',`在元素符号<b>右下角</b>写上 1 个分子中所含的原子数，如 ${fmB('O2')}`]];
  const tray=$('#elTray'),bins=$('#elBins'),st=$('#elSt'),fe=$('#elFe');let sel=null,done=false;
  const order=[3,9,0,7,4,10,1,6,11,5,2,8];
  bins.innerHTML=BINS.map(([n,eg,r],k)=>`<div class="bin" data-k="${k}"><h4>${n}<small>${eg}</small></h4><div class="rule hide"><span>${r}</span></div><div class="drop"></div></div>`).join('');
  function deal(){tray.innerHTML=order.map(i=>{const[n,f,c]=CARDS[i];return`<div class="ecard" data-c="${c}" data-f="${f}"><span class="nm">${n}</span><span class="fm">?</span></div>`;}).join('');
    $$('.drop',bins).forEach(d=>d.innerHTML='');$$('.ecard',tray).forEach(wire);}
  function place(card,host){if(done||!host)return;card.classList.remove('sel');sel=null;host.appendChild(card);sfx('drop');$$('.bin',bins).forEach(b=>b.classList.remove('over'));}
  function wire(card){domDrag(card,{onDrop:(el,under)=>{const b=under&&under.closest('.bin');if(b)place(el,$('.drop',b));else if(under&&under.closest('#elTray'))place(el,tray);},
    onTap:el=>{if(done)return;if(sel===el){el.classList.remove('sel');sel=null;return;}if(sel)sel.classList.remove('sel');sel=el;el.classList.add('sel');sfx('click');
      $$('.bin',bins).forEach(b=>b.classList.add('over'));}});}
  $$('.bin',bins).forEach(b=>b.addEventListener('click',e=>{if(sel&&!e.target.closest('.ecard'))place(sel,$('.drop',b));}));
  tray.addEventListener('click',e=>{if(sel&&!e.target.closest('.ecard')&&sel.parentElement!==tray)place(sel,tray);});
  $('#elSub').onclick=()=>{if(done)return;if($$('.ecard',tray).length){setSt(st,'warn',`还有 ${$$('.ecard',tray).length} 张卡片没放好`);return;}done=true;const tm=TEAM.cur;let bad=0;
    if(sel){sel.classList.remove('sel');sel=null;}$$('.bin',bins).forEach(b=>b.classList.remove('over'));
    $$('.bin',bins).forEach((b,k)=>{$$('.ecard',b).forEach((c,i)=>{const ok=+c.dataset.c===k;if(!ok)bad++;c.classList.add(ok?'right':'wrong');
      setTimeout(()=>{$('.fm',c).innerHTML=fm(c.dataset.f);c.animate([{transform:'rotateY(90deg)'},{transform:'none'}],{duration:350});},150+i*90);});
      setTimeout(()=>$('.rule',b).classList.remove('hide'),300+k*250);});
    if(!bad){teamAdd(5,tm);sfx('ok');setTimeout(()=>FX.confetti(),500);setSt(st,'ok',`<b>${tname(tm)}全对 +5</b>　看每一类的写法：只有气态非金属单质要写右下角的数字。`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}放错 ${bad} 张，不加分</b>　红色卡片放错了类别，对照规则再想一想。`);}
    fe.hidden=false;teamNext();};
  $$('[data-rv]',fe).forEach(x=>x.onclick=()=>{x.classList.remove('hide');sfx('pop');});
  function redo(){done=false;sel=null;deal();$$('.rule',bins).forEach(r=>r.classList.add('hide'));$$('.bin',bins).forEach(b=>b.classList.remove('over'));
    fe.hidden=true;$$('[data-rv]',fe).forEach(x=>x.classList.add('hide'));setSt(st,'','全对 +5 分');}
  $('#elRedo').onclick=redo;$('#elReset').onclick=redo;
  deal();
  return{};})();

/* ================= 7 化合物：三条书写规则 + 从右往左读 + 按名称拼化学式 ================= */
S.comp=(()=>{
  // 规则卡动画：每个记号 [html, 起点%, 终点%, 终点透明度]
  const RULES=[
    ['氧化物','氧元素写在<b>右边</b>，另一种元素写在左边',[['O<sub>2</sub>',38,55],['C',62,42]]],
    ['金属 + 非金属','一般<b>金属在左</b>、非金属在右',[['Cl',38,58],['Na',62,42]]],
    ['数字','原子个数为 1 时<b>省略不写</b>',[['C',36,42],['<sub>1</sub>',44,46,0],['O<sub>2</sub>',56,55]]]];
  const rc=$('#coRules');
  rc.innerHTML=RULES.map(([h,cap,tk],i)=>`<div class="rcard" data-i="${i}"><h4><b>${i+1}</b>${h}</h4><div class="demo">${tk.map(([s,a])=>`<span class="tok" style="left:${a}%">${s}</span>`).join('')}</div><div class="cap">${cap}</div></div>`).join('');
  function playRule(i){const card=$$('.rcard',rc)[i],toks=$$('.tok',card),R=RULES[i][2];
    toks.forEach((t,k)=>{t.style.transition='none';t.style.left=R[k][1]+'%';t.style.opacity=1;t.style.color='';});void card.offsetWidth;
    setTimeout(()=>toks.forEach((t,k)=>{t.style.transition='';t.style.left=R[k][2]+'%';if(R[k][3]===0)t.style.opacity=0;else t.style.color=k===0&&i<2?CORAL:'';}),350);
    setTimeout(()=>{sfx('pop');burstAt($('.demo',card),8,[SUN,TEAL]);},1100);}
  $$('.rcard',rc).forEach((c,i)=>c.onclick=()=>playRule(i));
  $('#coRuleAll').onclick=()=>{RULES.forEach((_,i)=>setTimeout(()=>playRule(i),i*1300));sfx('whoosh');};
  // 读法转换器
  const RD=['NaCl','CO2','SO2','Fe3O4','P2O5','MgO','HgO','KCl'];let cur='NaCl',run=0;
  const parts=f=>{const tk=fmTokens(f),out=[];tk.forEach(t=>{if(t.t==='el')out.push({e:t.v,n:1});else if(t.t==='sub')out[out.length-1].n=+t.v;});return out;};
  $('#coChips').innerHTML=RD.map(f=>`<button class="btn" data-f="${f}"><span class="fm">${fm(f)}</span></button>`).join('');
  $$('#coChips .btn').forEach(b=>b.onclick=()=>{cur=b.dataset.f;read();});
  function read(){const id=++run,P=parts(cur);$$('#coChips .btn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.f===cur)));
    $('#coFm').innerHTML=P.map(p=>`<span class="el">${p.e}${p.n>1?`<sub>${p.n}</sub>`:''}</span>`).join('')+'<svg class="arrow" viewBox="0 0 400 20" preserveAspectRatio="none"><path d="M392 10H14" stroke="#ff7a5c" stroke-width="4" stroke-dasharray="10 8" fill="none"/><path d="M4 10l16-8v16z" fill="#ff7a5c"/></svg>';
    const say=[],[A,B]=P;const push=(s,c)=>say.push(`<span class="${c}">${s}</span>`);
    if(B.n>1)push(CN[B.n],'n');push(ATOM[B.e][1],'e');push('化','');if(A.n>1)push(CN[A.n],'n');push(ATOM[A.e][1],'e');
    $('#coSay').innerHTML=say.join('');const sp=$$('#coSay span'),els=$$('#coFm .el');sfx('whoosh');
    // 先读右边的元素（连同它的个数），再读“化”，最后读左边的元素
    const nB=B.n>1?2:1,steps=[[1,0,nB],[null,nB,nB+1],[0,nB+1,sp.length]];
    steps.forEach(([hot,a,b],k)=>setTimeout(()=>{if(id!==run)return;els.forEach((e,j)=>e.classList.toggle('hot',j===hot));for(let i=a;i<b;i++)sp[i].classList.add('on');sfx(k===2?'ok':'pop');
      if(k===2)setTimeout(()=>{if(id===run)els.forEach(e=>e.classList.remove('hot'));},700);},500+k*750));}
  $('#coPlay').onclick=read;
  // 按名称拼化学式
  const TG=[['五氧化二磷','P2O5'],['二氧化硫','SO2'],['四氧化三铁','Fe3O4'],['氯化钾','KCl'],['氧化镁','MgO']];
  const TILES=['P','O','S','Fe','K','Cl','Mg','2','3','4','5'];let ti=0,seq=[],cdone=false;const cst=$('#coSt');
  $('#coTray').innerHTML=TILES.map(s=>`<button data-s="${s}" class="${/\d/.test(s)?'dg':''}">${s}</button>`).join('');
  $$('#coTray button').forEach(b=>b.onclick=()=>{if(cdone)return;if(seq.length>=8)return;seq.push(b.dataset.s);sfx('click');slots();});
  function slots(){const box=$('#coSlots');box.innerHTML=seq.length?seq.map((s,i)=>`<span class="sl${/\d/.test(s)?' d':''}" data-i="${i}">${s}</span>`).join(''):'<span class="hint">点下面的符号和数字</span>';
    $$('.sl',box).forEach(x=>x.onclick=()=>{if(cdone)return;seq.splice(+x.dataset.i,1);sfx('click');slots();});}
  function target(){$('#coTarget').textContent=TG[ti][0];seq=[];cdone=false;slots();setSt(cst,'','点符号和数字拼出化学式（数字自动写成右下角的小字）。答对 +5');}
  $('#coBack').onclick=()=>{if(cdone)return;seq.pop();sfx('click');slots();};
  $('#coNext').onclick=()=>{ti=(ti+1)%TG.length;target();};
  $('#coSub').onclick=()=>{if(cdone)return;if(!seq.length){setSt(cst,'warn','还没有拼');return;}cdone=true;const tm=TEAM.cur,[n,f]=TG[ti],got=seq.join('');
    if(got===f){teamAdd(5,tm);sfx('ok');burstAt($('#coSlots'),24,[CORAL,SUN,TEAL]);setSt(cst,'ok',`<b>${tname(tm)}拼对 +5</b>　${n}：${fmB(f)}。点“换一题”继续。`);}
    else{sfx('bad');setSt(cst,'bad',`<b>${tname(tm)}拼错，不加分</b>　${n}的化学式是 ${fmB(f)}：倒着读名称，“${n.includes('氧')?'氧化':'化'}”后面的元素写在左边。`);}
    teamNext();};
  // 要记住的化学式
  const MEMO=[['高锰酸钾','KMnO4'],['锰酸钾','K2MnO4'],['二氧化锰','MnO2'],['四氧化三铁','Fe3O4'],['五氧化二磷','P2O5'],['氧化汞','HgO']];
  $('#coMemo').innerHTML=MEMO.map(([n,f])=>`<button class="hide"><span>${n}</span>${fmB(f)}</button>`).join('');
  $$('#coMemo button').forEach(b=>b.onclick=()=>{b.classList.toggle('hide');sfx('pop');});
  $('#coReset').onclick=()=>{ti=0;target();cur='NaCl';run++;$('#coSay').innerHTML='';read();$$('#coMemo button').forEach(b=>b.classList.add('hide'));};
  target();
  let first=true;
  return{enter(){if(first){first=false;setTimeout(read,400);setTimeout(()=>$('#coRuleAll').click(),200);}}};})();

/* ================= 8 书写诊所：找出化学式的“病因” ================= */
S.clinic=(()=>{
  const P=[
    ['铜','Cu2','Cu',['金属由原子直接构成，直接用元素符号表示','数字应该写在左边，写成 2Cu','没有病，铜原子总是两两成对'],0],
    ['二氧化碳','O2C','CO2',['应写成 C₂O，数字跟着碳','两种元素的先后顺序可以随意','氧化物中氧元素应写在右边'],2],
    ['氯化钠','ClNa','NaCl',['应写成 Na₂Cl₂，要标出个数','一般金属元素写在左边、非金属写在右边','没有病，化学式从左往右读就是氯化钠'],1],
    ['氧化镁','Mg1O1','MgO',['没有病，把 1 写出来更清楚','应写成 OMg，氧要写在左边','原子个数为 1 时省略不写'],2],
    ['氦气','He2','He',['稀有气体由原子直接构成，用元素符号表示','没有病，和氧气 O₂ 一样写法','应写成 2He'],0],
    ['氮气','n2','N2',['应写成 N，气体不写数字','元素符号的第一个字母要大写','没有病，大小写都可以'],1]];
  const grid=$('#clGrid'),opts=$('#clOpts'),sub=$('#clSub'),st=$('#clSt');let cur=-1,pick=null;const state=P.map(()=>0);
  function render(){grid.innerHTML=P.map(([n,bad,good],i)=>{const s=state[i];return`<div class="patient${s===1?' cured':s===2?' failed':''}${i===cur?' sel':''}" data-i="${i}"><span class="who">${i+1} 号 · 我是${n}</span><span class="band"></span>
      <span class="fm" style="${s?'text-decoration:line-through;text-decoration-thickness:3px;font-size:40px;opacity:.55':''}">${fm(bad)}</span><span class="face">${s===1?'康复啦！':s===2?'误诊了…':'哎哟，我写错了'}</span><span class="fix">${s?'正确写法：'+fmB(good):''}</span></div>`;}).join('');
    $$('.patient',grid).forEach(p=>p.onclick=()=>{const i=+p.dataset.i;if(state[i])return;cur=i;pick=null;sfx('pop');render();ask();});}
  function ask(){if(cur<0){$('#clTitle').textContent='先点一位“病号”';opts.innerHTML='';sub.disabled=true;return;}const[n,bad,,O]=P[cur];
    $('#clTitle').innerHTML=`${cur+1} 号：${n}写成了 ${fmB(bad)}`;
    opts.innerHTML=O.map((o,k)=>`<button class="opt" data-v="${k}"><i>${'ABC'[k]}</i><span>${o}</span></button>`).join('');sub.disabled=false;
    $$('.opt',opts).forEach(b=>b.onclick=()=>{pick=+b.dataset.v;$$('.opt',opts).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
    setSt(st,'',`${tname(TEAM.cur)}诊断：选出病因后提交。`);}
  sub.onclick=()=>{if(cur<0)return;if(pick===null){setSt(st,'warn','请先选出病因');return;}const i=cur,[n,,good,,ans]=P[i],tm=TEAM.cur;
    $$('.opt',opts).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===ans)x.classList.add('right');else if(v===pick)x.classList.add('wrong');});sub.disabled=true;
    if(pick===ans){state[i]=1;teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}诊断正确 +5</b>　${n}的化学式是 ${fmB(good)}。`);}
    else{state[i]=2;sfx('bad');setSt(st,'bad',`<b>${tname(tm)}误诊，不加分</b>　绿框才是病因，${n}应写作 ${fmB(good)}。`);}
    cur=-1;render();const el=$$('.patient',grid)[i];if(state[i]===1)burstAt(el,26,[TEAL,SUN,CORAL]);
    teamNext();if(state.every(Boolean)){setTimeout(()=>{FX.confetti();sfx('win');setSt(st,'ok',`6 位病号都看完了！康复 ${state.filter(x=>x===1).length} 位。`);},900);}};
  $('#clReset').onclick=()=>{state.fill(0);cur=-1;pick=null;render();ask();setSt(st,'','红蓝两队轮流接诊，诊断正确 +5，病号康复。');};
  render();
  return{};})();
