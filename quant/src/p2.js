/* ================= 3 易错诊所：在算式里点出错误 ================= */
S.diag=(()=>{
  // [病例名, 前缀, tokens [文字, 0=没错 1=错误 2=根本错误, 批改], 病因, 正确写法说明]
  const C=[
    ['小明算 CO₂',`${fmB('CO2')} 的相对分子质量 =`,[['12',0],['+',0],['16×2',0],['=',0],['44',0],['g',2,'删去']],'单位','相对分子质量的单位是“1”，一般不写：CO₂ 的相对分子质量 = 12 + 16×2 = <span class="num">44</span>'],
    ['小红算 Ca(OH)₂',`${fmB('Ca(OH)2')} 的相对分子质量 =`,[['40',0],['+',0],['16 + 1×2',2,'(16 + 1)×2'],['=',0],['58',1,'74']],'括号','括号外的 2 要乘 O 和 H：40 + (16 + 1)×2 = <span class="num">74</span>'],
    ['小刚算 H₂O₂',`${fmB('H2O2')} 的相对分子质量 =`,[['1×2',0],['+',0],['16',2,'16×2'],['=',0],['18',1,'34']],'下标','O 的右下角是 2，要乘 2：1×2 + 16×2 = <span class="num">34</span>'],
    ['小丽算 2H₂O',`${fmB('2H2O')} 的`,[['相对分子质量',2,'相对分子质量总和'],['=',0],['2×(1×2+16)',0],['=',0],['36',0]],'概念','相对分子质量指 <b>1 个分子</b>：H₂O 的相对分子质量是 <span class="num">18</span>；36 是 2 个水分子的相对分子质量<b>总和</b>'],
    ['小军算 CO(NH₂)₂',`${fmB('CO(NH2)2')} 的相对分子质量 =`,[['12',0],['+',0],['16',0],['+',0],['14 + 1×2',2,'(14 + 1×2)×2'],['=',0],['44',1,'60']],'括号','括号外的 2 要乘括号里的 N 和 H：12 + 16 + (14 + 1×2)×2 = <span class="num">60</span>']];
  let ci=0,sel=new Set(),state=C.map(()=>0),fresh=false;const st=$('#dgSt');
  function tabs(){$('#dgTabs').innerHTML=C.map((c,i)=>`<button data-i="${i}" aria-pressed="${i===ci}" class="${state[i]===1?'ok':state[i]===2?'no':''}"><i>${state[i]===1?'✓':state[i]===2?'✗':i+1}</i>${c[0]}</button>`).join('');
    $$('#dgTabs button').forEach(b=>b.onclick=()=>{ci=+b.dataset.i;sel.clear();fresh=false;show();sfx('click');});}
  function show(){const[nm,pre,tk,cause,fix]=C[ci],done=state[ci];tabs();
    const nd=state.filter(Boolean).length,nok=state.filter(v=>v===1).length;
    $('#dgCase').innerHTML=`<div class="dhead"><span class="av">${nm[1]}</span><div><div class="who">${nm.slice(0,2)}的草稿</div><div class="hint">病例 ${ci+1} / ${C.length}</div></div>
        <span class="dchip ${done?'c':''}">病因：${done?cause:'？'}</span><span class="dchip ${done===1?'ok':done===2?'no':'wait'}">${done===1?'确诊':done===2?'误诊':'待诊断'}</span></div>
      <div class="dpaper${done?'':' scan'}">${done?`<div class="dstamp ${done===1?'ok':'no'}">${done===1?'确诊':'误诊'}</div>`:''}
        <div class="dline${fresh&&done===2?' shk':''}"><span class="eq pre">${pre}</span>${tk.map(([s,b,c],k)=>s==='='||s==='+'?`<span class="eq">${s}</span>`:`<span class="tk${sel.has(k)?' sel':''}${done&&b?' bad':''}${done&&c==='删去'?' del':''}" data-k="${k}">${s}${done&&c?`<em class="corr" style="--d:${k*.12}s">${c}</em>`:''}</span>`).join('')}</div>
        <div class="dfix">${done?`<b class="kg">正确：</b>${fix}`:'<span class="dtip">点出错误的部分（可以点多处），再提交</span>'}</div></div>
      <div class="dfoot"><span>诊断进度</span><div class="dbar">${C.map((c,i)=>`<i class="${state[i]===1?'ok':state[i]===2?'no':i===ci?'cur':''}"></i>`).join('')}</div><span class="num">${nok} / ${nd} 确诊</span></div>`;
    $$('#dgCase .tk').forEach(e=>e.onclick=()=>{if(state[ci])return;const k=+e.dataset.k;sel.has(k)?sel.delete(k):sel.add(k);sfx('tick');fresh=false;show();});
    fresh=false;if(!done)setSt(st,'','找对 +5');}
  $('#dgSub').onclick=()=>{if(state[ci])return;if(!sel.size){setSt(st,'warn','先点出错误的部分');return;}const tk=C[ci][2],tm=TEAM.cur;
    const ok=[...sel].every(k=>tk[k][1]>0)&&[...sel].some(k=>tk[k][1]===2);state[ci]=ok?1:2;fresh=true;
    if(ok){teamAdd(5,tm);sfx('ok');burstAt($('#dgCase'),20,[CG,CC]);setSt(st,'ok',`<b>${tname(tm)}找对了 +5</b>`);}
    else{sfx('bad');shake();setSt(st,'bad',`<b>${tname(tm)}没找准，不加分</b>　红框是出错的地方，绿字是批改。`);}setTimeout(()=>sfx('stamp'),350);teamNext();show();};
  $('#dgNext').onclick=()=>{ci=(ci+1)%C.length;sel.clear();fresh=false;show();sfx('whoosh');};
  $('#dgReset').onclick=()=>{ci=0;sel.clear();state=C.map(()=>0);show();};
  show();
  notes('diag','计算相对分子质量的易错点',['相对分子质量的单位是“1”，<mark>一般不写</mark>，不能写“g”。','右下角的数字要<mark>乘进去</mark>；括号外的数字乘括号里的<mark>每一种</mark>原子。','相对分子质量指 <mark>1 个分子</mark>；化学式前面的系数表示分子个数，不参与相对分子质量的计算。'],'',
    (ctx,w,h)=>{const y0=40;[['44 g','44',PEN.red],['40+16+1×2','40+(16+1)×2',PEN.red],['1×2+16','1×2+16×2',PEN.red]].forEach(([bad,good,c],i)=>{const y=y0+i*100;
        txt(ctx,bad,w*.28,y+20,{size:22,weight:700,col:PEN.dim});ctx.strokeStyle=c;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.28-70,y+20);ctx.lineTo(w*.28+70,y+20);ctx.stroke();
        ctx.strokeStyle=PEN.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.5-16,y+20);ctx.lineTo(w*.5+16,y+20);ctx.lineTo(w*.5+8,y+12);ctx.moveTo(w*.5+16,y+20);ctx.lineTo(w*.5+8,y+28);ctx.stroke();
        txt(ctx,good,w*.76,y+20,{size:22,weight:700,col:PEN.green});});
      txt(ctx,'单位  ·  括号  ·  下标',w/2,h-24,{size:18,weight:700,col:PEN.blue});});
  return{};})();

/* ================= 4 元素质量比：个数比 vs 质量比 ================= */
S.ratio=(()=>{const cv=$('#cvRatio');let t=0,cur='CO2',stage=0,stT=0;const G={};
  const MOLS=['CO2','H2O2','H2O','SO2','Fe2O3','C2H5OH','CO(NH2)2'],NEX=2;// 前 2 个是讲解例子，后 5 个对应右侧练习
  const NAME={CO2:'二氧化碳',H2O:'水',H2O2:'过氧化氢',SO2:'二氧化硫',Fe2O3:'氧化铁',C2H5OH:'乙醇','CO(NH2)2':'尿素'};
  const ORDER={C2H5OH:['C','H','O'],'CO(NH2)2':['C','O','N','H']};
  const parts=()=>{const m=new Map(comp(cur));return(ORDER[cur]||[...m.keys()]).map(e=>[e,m.get(e)]);};
  const ratioStr=a=>a.join(' ∶ ');
  function setMol(f){cur=f;stage=0;stT=0;sfx('click');}
  $('#raGo').onclick=()=>{if(stage<1){stage=1;stT=0;sfx('whoosh');}};
  $('#raSimp').onclick=()=>{if(stage<1){stage=1;}stage=2;stT=0;sfx('pop');};
  const ui=canvasUI(cv,{hots:()=>G.w?MOLS.map((f,i)=>({hit:(x,y)=>Math.abs(x-G.cx(i))<G.cw/2&&Math.abs(y-32)<20,act:()=>setMol(f)})):[]});
  function tick(dt){t+=dt;stT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;
    molTabs(ctx,G,MOLS,cur,NEX,w,{maxW:124});
    const P=parts(),cols=[CC,CA,CG,CM],nE=P.length;
    // 标题
    fmDraw(ctx,cur,w/2,96,44,{col:INK,glowB:8});txt(ctx,NAME[cur],w/2+fmDraw(ctx,cur,0,0,44,{measure:true})/2+44,96,{size:16,weight:700,col:DIM});
    // 第一行：原子个数比
    const y1=168,x0=60;hudBox(ctx,x0-20,y1-34,w-2*x0+40,118,{col:'rgba(63,216,255,.45)',fill:'rgba(0,0,0,.28)',corner:12});
    txt(ctx,'原子个数比',x0,y1-14,{size:15,weight:700,col:CC,align:'left'});
    const colW=(w-2*x0-260)/nE;
    P.forEach(([e,n],i)=>{const cx=x0+200+colW*(i+.5),rad=e==='H'?13:17,gap=rad*2+5,show=Math.min(n,8);
      for(let k=0;k<show;k++)atomBall(ctx,cx+(k-(show-1)/2)*gap*Math.min(1,(colW-20)/(show*gap)),y1+14,rad,e,{glowA:.4});
      txt(ctx,`${ELN[e]}：${n} 个`,cx,y1+52,{size:15,weight:700,col:DIM});});
    glow(ctx,ratioStr(P.map(p=>p[1])),x0+100,y1+30,{size:30,col:CC,align:'center'});
    // 第二行：质量比
    const y2=y1+150;hudBox(ctx,x0-20,y2-34,w-2*x0+40,h-y2-50,{col:'rgba(255,176,0,.5)',fill:'rgba(0,0,0,.28)',corner:12});
    txt(ctx,'元素质量比',x0,y2-14,{size:15,weight:700,col:CA,align:'left'});
    const tot=P.reduce((a,[e,n])=>a+AM[e]*n,0),maxM=Math.max(...P.map(([e,n])=>AM[e]*n)),barW=w-2*x0-260;
    if(stage===0){txt(ctx,'点“算质量”：相对原子质量 × 原子个数',w/2,y2+70,{size:20,weight:700,col:DIM});}
    else{const grow=ease(Math.min(1,(stage===1?stT:1)/1.1));
      P.forEach(([e,n],i)=>{const m=AM[e]*n,y=y2+18+i*Math.min(56,(h-y2-200)/Math.max(1,nE-1)),bw=Math.max(6,barW*m/maxM*grow);
        txt(ctx,ELN[e],x0+40,y,{size:18,weight:700,col:cols[i%4]});
        ctx.save();ctx.shadowColor=cols[i%4];ctx.shadowBlur=10;const g=ctx.createLinearGradient(x0+70,0,x0+70+bw,0);g.addColorStop(0,shade(cols[i%4],-.35));g.addColorStop(1,cols[i%4]);ctx.fillStyle=g;rr(ctx,x0+70,y-12,bw,24,6);ctx.fill();ctx.restore();
        // 刻度：每个原子一段
        ctx.save();ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=1.5;for(let k=1;k<n;k++){const xx=x0+70+bw*k/n;ctx.beginPath();ctx.moveTo(xx,y-12);ctx.lineTo(xx,y+12);ctx.stroke();}ctx.restore();
        txt(ctx,n>1?`${AM[e]}×${n} = ${m}`:`${AM[e]}`,x0+80+bw,y,{size:17,weight:700,col:INK,align:'left'});});
      const raw=P.map(([e,n])=>AM[e]*n),g=raw.reduce((a,b)=>gcd(a,b)),simp=raw.map(x=>x/g),yr=h-150;
      glow(ctx,ratioStr(raw),stage===2?w*.32:w/2,yr,{size:34,col:CA});
      if(stage===2){const q=ease(Math.min(1,stT/.8));ctx.save();ctx.globalAlpha=q;arrow(ctx,w*.32+ratioStr(raw).length*9+20,yr,w*.62-60,yr,{col:CG,w:3,head:12});txt(ctx,`÷ ${g}`,w*.47+20,yr-24,{size:16,weight:700,col:CG});
        glow(ctx,ratioStr(simp),w*.72,yr,{size:40,col:CG});ctx.restore();
        if(stT>.9){const ab=P.map(p=>p[1]);const ns=`个数比 ${ratioStr(ab)}　≠　质量比 ${ratioStr(simp)}`;hudBox(ctx,w/2-170,yr+28,340,34,{col:CM,fill:'rgba(30,6,30,.6)',corner:8,glowA:0});txt(ctx,ns,w/2,yr+45,{size:17,weight:700,col:INK});}}
      else txt(ctx,'点“约成最简比”',w/2,yr+40,{size:14,weight:700,col:FAINT});}}
  const kp=kpQuiz($('#raKp'),[
    {q:`水 ${fmB('H2O')} 中，氢元素与氧元素的质量比`,kind:'ratio',ans:[1,8],why:'(1×2) ∶ 16 = 2 ∶ 16 = 1 ∶ 8'},
    {q:`二氧化硫 ${fmB('SO2')} 中，硫元素与氧元素的质量比`,kind:'ratio',ans:[1,1],why:'32 ∶ (16×2) = 32 ∶ 32 = 1 ∶ 1（原子个数比却是 1 ∶ 2）'},
    {q:`氧化铁 ${fmB('Fe2O3')} 中，铁元素与氧元素的质量比`,kind:'ratio',ans:[7,3],why:'(56×2) ∶ (16×3) = 112 ∶ 48 = 7 ∶ 3'},
    {q:`乙醇 ${fmB('C2H5OH')} 中，碳、氢、氧三种元素的质量比`,kind:'ratio',ans:[12,3,8],why:'(12×2) ∶ (1×6) ∶ 16 = 24 ∶ 6 ∶ 16 = 12 ∶ 3 ∶ 8'},
    {q:`尿素 ${fmB('CO(NH2)2')} 中，氮元素与氢元素的质量比`,kind:'ratio',ans:[7,1],why:'(14×2) ∶ (1×4) = 28 ∶ 4 = 7 ∶ 1'}]);
  $('#raReset').onclick=()=>{setMol('CO2');kp.reset();};
  notes('ratio','计算物质组成元素的质量比',['元素质量比 = <mark>（相对原子质量 × 原子个数）之比</mark>。','结果一般化成<mark>最简整数比</mark>（2∶32 和 1∶16 是同一个比，按题目要求作答）。','元素的顺序要和题目要求一致。'],
    '原子个数比 ≠ 元素质量比：CO₂ 中 C、O 原子个数比 1∶2，质量比 3∶8。',
    (ctx,w,h)=>{txt(ctx,'CO₂',w/2,30,{size:26,weight:700,col:PEN.ink});
      txt(ctx,'原子个数比',70,86,{size:15,weight:700,col:PEN.blue,align:'left'});[[0,'C'],[1,'O'],[2,'O']].forEach(([i,e])=>{ctx.fillStyle=e==='C'?'#5b6878':'#e85d5d';ctx.beginPath();ctx.arc(200+i*44,86,16,0,TAU);ctx.fill();});txt(ctx,'1 ∶ 2',w-50,86,{size:20,weight:700,col:PEN.blue});
      txt(ctx,'质量',70,150,{size:15,weight:700,col:PEN.red,align:'left'});ctx.fillStyle='#5b6878';ctx.fillRect(130,138,12*4,24);ctx.fillStyle='#e85d5d';ctx.fillRect(130,174,32*4,24);
      txt(ctx,'C：12',130+48+8,150,{size:15,weight:700,col:PEN.ink,align:'left'});txt(ctx,'O：16×2 = 32',130+128+8,186,{size:15,weight:700,col:PEN.ink,align:'left'});
      hand(ctx,'12 ∶ 32 = 3 ∶ 8',w/2,250,{size:30,col:PEN.red});penBox(ctx,40,280,w-80,48,PEN.green,[6,5]);txt(ctx,'题目要求最简整数比时要约分',w/2,304,{size:17,weight:700,col:PEN.green});});
  return{tick};})();
