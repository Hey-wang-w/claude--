/* ================= 9 竞赛：拆弹倒计时（两队各一颗炸弹、各自计时；答对剪一根线，答错扣 30 秒） ================= */
S.bomb=(()=>{const cv=$('#cvBomb');let t=0,idx=0,phase='ask',pick=null,running=false,mins=4,clock,cut,out,got,order,cutT={r:-9,b:-9},hitT={r:-9,b:-9};
  const vl=(top,sym)=>`<span class="fm"><span class="vl"><i>${top}</i><b>${sym}</b></span></span>`;
  // [分值, 题干, 选项, 正确项, 解析]
  const Q=[
    [10,'下列符号能表示“氧化铝中铝元素显 +3 价”的是',[fmB('Al2{+3}O3'),`<span class="fm"><span class="vl"><i>3+</i><b>Al</b></span><sub>2</sub>O<sub>3</sub></span>`,fmB('Al^3+'),fmB('2Al^3+')],0,'化合价标在元素符号正上方，正负号在前、数字在后；Al³⁺ 是铝离子。'],
    [10,`高铁酸钾（${fmB('K2FeO4')}）是一种净水剂，其中铁元素的化合价为`,['+2','+3','+6','+8'],2,'(+1)×2 + x + (−2)×4 = 0，x = +6。'],
    [10,`下列含氮物质中，氮元素的化合价由低到高排列正确的是<br>① ${fmB('NH3')}　② ${fmB('N2')}　③ ${fmB('NO2')}　④ ${fmB('HNO3')}`,['①②③④','②①③④','④③②①','①③②④'],0,'NH₃ 中 −3，N₂ 中 0（单质），NO₂ 中 +4，HNO₃ 中 +5。'],
    [10,`硅酸钠的化学式为 ${fmB('Na2SiOx')}，其中硅元素显 +4 价，则 x 为`,['1','2','3','4'],2,'(+1)×2 + (+4) + (−2)×x = 0，x = 3。'],
    [10,'氢氧化铁的化学式书写正确的是',[fmB('Fe(OH)3'),fmB('FeOH3'),fmB('Fe(OH)2'),fmB('Fe3OH')],0,'Fe 显 +3 价，OH 显 −1 价，需要 3 个 OH；根不止 1 个要加括号。'],
    [10,'关于符号中数字“2”的意义，下列说法正确的是',[`${fmB('Mg{+2}O')} 中的“2”表示镁离子带 2 个单位正电荷`,`${fmB('Ca^2+')} 中的“2”表示钙元素的化合价为 +2`,`${fmB('H2O')} 中的“2”表示 1 个水分子中含有 2 个氢原子`,`${fmB('2H')} 中的“2”表示 2 个氢元素`],2,'正上方的数字是化合价；右上角是离子所带电荷；元素只讲种类、不讲个数。'],
    [10,'下列关于化合价的说法正确的是',['单质中元素的化合价为 0','金属元素在化合物中可以显负价','非金属元素在化合物中只显负价','化合物中正、负化合价的代数和不一定为 0'],0,'金属元素在化合物中显正价；非金属元素也可显正价（如 CO₂ 中的 C）；化合物中代数和一定为 0。'],
    [10,`${fmB('Fe2(SO4)3')} 的正确读法是`,['硫酸亚铁','硫酸铁','三硫酸二铁','硫化铁'],1,'SO₄ 为 −2 价，可算出 Fe 为 +3 价，读作“某酸某”：硫酸铁；+2 价的铁才读“亚铁”。'],
    [10,`硝酸铵（${fmB('NH4NO3')}）中氮元素的化合价`,['都是 +5','都是 −3','分别为 −3 和 +5','分别为 +3 和 −5'],2,'铵根 NH₄ 为 +1 价：x + (+1)×4 = +1，x = −3；硝酸根 NO₃ 为 −1 价：y + (−2)×3 = −1，y = +5。'],
    [10,`金属元素 R 的原子 ${shellSvg(13,[2,8,3])} 与氧结合，形成的化合物的化学式为`,[fmB('RO'),fmB('R2O3'),fmB('R3O2'),fmB('RO3')],1,'R 最外层 3 个电子，供给 3 个，显 +3 价；O 显 −2 价。最小公倍数 6：R 2 个，O 3 个。'],
    [20,'【提升】第三周期某元素原子的最外层有 6 个电子，它的最高正价和最低负价分别为',['+6、−2','+2、−6','+6、−6','−2、+2'],0,'最高正价 = 最外层电子数 = +6；最低负价 = 6 − 8 = −2。'],
    [20,`【提升】关于 ${fmB('Ca3(PO4)2')}，下列说法正确的是`,['磷元素显 +5 价，读作磷酸钙','磷元素显 +5 价，读作磷化钙','磷元素显 +3 价，读作磷酸钙','磷元素显 −3 价，读作磷酸钙'],0,'磷酸根 PO₄ 为 −3 价：x + (−2)×4 = −3，x = +5；含酸根读“某酸某”。']];
  const card=$('#boCard'),stage=$('[data-id="bomb"] .stage'),other=tm=>tm==='r'?'b':'r';
  const tag=tm=>`<span class="teamTag ${tm}">${tname(tm)}</span>`,fmt=s=>{s=Math.max(0,Math.ceil(s));return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
  function reset(){idx=0;phase='ask';pick=null;running=false;clock={r:mins*60,b:mins*60};cut={r:0,b:0};out={r:null,b:null};got={r:0,b:0};order=[];$('#boGo').textContent='开始计时';stampOff(stage);teamSet('r');ask();}
  function ask(){if(idx>=Q.length||(out.r&&out.b))return finish();if(out[TEAM.cur])teamSet(other(TEAM.cur));phase='ask';pick=null;const[p,q,O]=Q[idx];
    card.innerHTML=`<div class="qmeta">${tag(TEAM.cur)}<span class="tag ${p>10?'y':'b'}">第 ${idx+1} / ${Q.length} 题 · ${p} 分</span><span class="hint">${running?'计时中':'计时暂停'}</span></div><div class="qtext">${q}</div>
      <div class="opts">${O.map((o,k)=>`<button class="opt" data-v="${k}"><i>${'ABCD'[k]}</i><span>${o}</span></button>`).join('')}</div>
      <div class="row"><button class="btn pri sm" id="boSub">提交</button></div><div class="status" id="boSt">答对剪断一根线；答错本队炸弹扣 30 秒。</div>`;
    $$('.opt',card).forEach(b=>b.onclick=()=>{if(phase!=='ask')return;pick=+b.dataset.v;$$('.opt',card).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
    $('#boSub').onclick=submit;}
  function submit(){if(phase!=='ask')return;if(pick===null){setSt($('#boSt'),'warn','请先选一个答案');return;}phase='rev';const[p,,,ans,ex]=Q[idx],tm=TEAM.cur,ok=pick===ans;
    $$('.opt',card).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===ans)x.classList.add('right');else if(v===pick)x.classList.add('wrong');});$('#boSub').remove();
    let msg;if(ok){teamAdd(p,tm);got[tm]+=p;cut[tm]++;cutT[tm]=t;sfx('ok');msg=`<b>${tname(tm)}答对 +${p}，剪断第 ${cut[tm]} 根线！</b>`;
        if(cut[tm]>=5){out[tm]='ok';order.push(tm);setTimeout(()=>{teamAdd(20,tm);got[tm]+=20;stampOn(stage,`${tname(tm)}拆弹成功 +20`,true,tm==='r'?'25%':'75%','45%');FX.confetti();sfx('win');},500);msg+=' 炸弹拆除成功！';}}
      else{clock[tm]-=30;hitT[tm]=t;sfx('bad');flash();msg=`<b>${tname(tm)}答错，不加分，炸弹扣 30 秒</b>`;if(clock[tm]<=0)boom(tm);}
    setSt($('#boSt'),ok?'ok':'bad',`${msg}<br>${ex}`);
    const nx=document.createElement('div');nx.className='row';nx.innerHTML=`<button class="btn pri sm">下一题</button>`;card.appendChild(nx);$('button',nx).onclick=next;}
  function next(){idx++;teamSet(other(TEAM.cur));ask();sfx('whoosh');}
  function boom(tm){if(out[tm])return;clock[tm]=0;out[tm]='boom';shake();sfx('boom');stampOn(stage,`${tname(tm)}的炸弹爆炸了`,false,tm==='r'?'25%':'75%','45%');
    if(phase==='ask'){phase='rev';card.insertAdjacentHTML('beforeend','<div class="row"><button class="btn pri sm" id="boNx">换另一队答题</button></div>');$('#boNx').onclick=()=>{teamSet(other(tm));ask();};$$('.opt',card).forEach(x=>x.disabled=true);}}
  function finish(){phase='end';running=false;$('#boGo').textContent='开始计时';
    const score=tm=>(out[tm]==='ok'?100-order.indexOf(tm):0)*10+cut[tm];const r=score('r'),b=score('b'),w=r===b?'':r>b?'r':'b';
    card.innerHTML=`<div class="qmeta"><span class="tag y">比赛结束</span></div><div class="qtext" style="font-size:26px">${w?`${tag(w)} 获胜！`:'两队打成平手！'}</div>
      <div class="tflist">${['r','b'].map(tm=>`<div class="tf"><div>${tag(tm)}　剪断 <b class="fm">${cut[tm]}</b> 根线　剩余 <b class="fm">${fmt(clock[tm])}</b></div><b>${out[tm]==='ok'?'拆除成功':out[tm]==='boom'?'爆炸':'未拆完'}　本轮 +${got[tm]}</b></div>`).join('')}</div>
      <p class="hint">胜负：先拆除成功的队获胜；都没拆完时，比剪断的线数。</p>`;FX.confetti();sfx('win');}
  $('#boGo').onclick=()=>{if(phase==='end')return;running=!running;$('#boGo').textContent=running?'暂停':'继续计时';const h=$('.qmeta .hint',card);if(h)h.textContent=running?'计时中':'计时暂停';sfx('click');};
  $$('[data-id="bomb"] .ctlbar [data-min]').forEach(b=>b.onclick=()=>{mins=+b.dataset.min;$$('[data-id="bomb"] .ctlbar [data-min]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(!running&&idx===0&&phase==='ask'){clock={r:mins*60,b:mins*60};}sfx('click');});
  $('#boReset').onclick=reset;
  const WC=[CP,CB,CY,CG,CO];
  function drawBomb(ctx,cx,top,w,h,tm){const on=TEAM.cur===tm&&phase!=='end'&&!out[tm],col=tm==='r'?CP:CB,bw=Math.min(w*.8,380),bh=Math.max(260,Math.min(h-150,440)),x=cx-bw/2,y=top+60;
    hand(ctx,`${tname(tm)}的炸弹`,cx,top+24,{size:30,col});if(on){chalkRect(ctx,cx+92,top+10,84,30,{col:CY,w:2,seed:8});txt(ctx,'答题中',cx+134,top+25,{size:15,weight:700,col:CY});}
    const shakeX=t-hitT[tm]<.5?Math.sin(t*80)*4*(1-(t-hitT[tm])*2):0;ctx.save();ctx.translate(shakeX,0);
    // 外壳与引信
    chalkRect(ctx,x,y,bw,bh,{col:on?col:'rgba(241,238,228,.6)',w:on?3.5:2.5,fill:'rgba(12,22,18,.6)',r:18,seed:tm==='r'?1:2});
    const fx=x+bw-30,fy=y;chalkPath(ctx,[[fx,fy],[fx+16,fy-26],[fx+40,fy-34]],{col:INK,w:3,seed:5});
    if(!out[tm]){const sp=clock[tm]<30?1:.4;for(let i=0;i<6;i++){const a=Math.random()*TAU,r=4+Math.random()*12*sp;ctx.globalAlpha=.8;ctx.fillStyle=i%2?CY:CO;ctx.fillRect(fx+40+Math.cos(a)*r,fy-34+Math.sin(a)*r,3,3);}ctx.globalAlpha=1;}
    // 计时屏
    const lw=bw*.7,lh=Math.min(84,bh*.22),lx=cx-lw/2,ly=y+18;ctx.fillStyle='rgba(0,0,0,.45)';rr(ctx,lx,ly,lw,lh,10);ctx.fill();chalkRect(ctx,lx,ly,lw,lh,{col:'rgba(241,238,228,.5)',w:2,seed:7});
    const warn=clock[tm]<30&&!out[tm];txt(ctx,out[tm]==='ok'?'SAFE':fmt(clock[tm]),cx,ly+lh/2+2,{size:lh*.62,weight:700,col:out[tm]==='ok'?CG:warn&&Math.sin(t*10)>0?BADC:CY});
    // 五根线
    const wy0=ly+lh+24,gap=(y+bh-24-wy0)/4,tx1=x+40,tx2=x+bw-40;
    for(let i=0;i<5;i++){const yy=wy0+i*gap,c=WC[i],isCut=i<cut[tm];chalkCircle(ctx,tx1,yy,6,{col:INK,fill:INK,w:1.5,seed:i});chalkCircle(ctx,tx2,yy,6,{col:INK,fill:INK,w:1.5,seed:i+9});
      if(!isCut){ctx.save();ctx.strokeStyle=c;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(tx1,yy);ctx.bezierCurveTo(cx-40,yy-gap*.6,cx+40,yy+gap*.6,tx2,yy);ctx.stroke();ctx.restore();}
      else{const k=i===cut[tm]-1?clamp((t-cutT[tm])*3,0,1):1,d=10+k*14;ctx.save();ctx.strokeStyle=c;ctx.lineWidth=5;ctx.lineCap='round';ctx.globalAlpha=.75;
        ctx.beginPath();ctx.moveTo(tx1,yy);ctx.quadraticCurveTo(cx-60,yy+k*16,cx-d,yy+k*22);ctx.stroke();ctx.beginPath();ctx.moveTo(tx2,yy);ctx.quadraticCurveTo(cx+60,yy+k*16,cx+d,yy+k*22);ctx.stroke();ctx.restore();
        if(i===cut[tm]-1&&t-cutT[tm]<.6)for(let j=0;j<8;j++){ctx.fillStyle=CY;ctx.fillRect(cx+(Math.random()-.5)*40,yy+(Math.random()-.5)*30,3,3);}}}
    ctx.restore();
    if(out[tm]==='boom'){ctx.save();ctx.globalAlpha=.9;for(let i=0;i<14;i++){const a=i/14*TAU,r1=40,r2=120+(i%2)*50;chalkLine(ctx,cx+Math.cos(a)*r1,y+bh/2+Math.sin(a)*r1,cx+Math.cos(a)*r2,y+bh/2+Math.sin(a)*r2,{col:i%2?CO:CP,w:4,seed:i});}
      hand(ctx,'BOOM!',cx,y+bh/2,{size:64,col:BADC});ctx.restore();}
    if(out[tm]==='ok')hand(ctx,'拆除成功 ✓',cx,y+bh+36,{size:34,col:CG});
    else txt(ctx,`已剪断 ${cut[tm]} / 5 根`,cx,y+bh+30,{size:18,weight:700,col:DIM});}
  function tick(dt){t+=dt;if(running&&phase==='ask'&&!out[TEAM.cur]){clock[TEAM.cur]-=dt;if(clock[TEAM.cur]<=0)boom(TEAM.cur);}
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);drawBomb(ctx,w*.25,10,w/2,h-80,'r');drawBomb(ctx,w*.75,10,w/2,h-80,'b');chalkLine(ctx,w/2,40,w/2,h-90,{col:'rgba(241,238,228,.25)',w:2,seed:3});}
  reset();
  return{tick,enter(){if(phase==='ask'&&idx===0)teamSet('r');}};})();

/* ================= 10 小结 ================= */
S.sum=(()=>{const vl=(top,sym)=>`<span class="fm"><span class="vl"><i>${top}</i><b>${sym}</b></span></span>`;
  const COL=[['化合价从哪来',[['供需','供给 n 个电子 → +n 价；需要 n 个电子 → −n 价'],['规则','化合物里，正、负化合价的代数和为 0；单质里元素的化合价为 0'],['规律','金属与非金属化合时，金属显正价、非金属显负价；一种元素可有多种化合价']]],
    ['怎样表示',[['化合价',`标在正上方，正负号在前，“1”不省略：${vl('+2','Mg')}、${vl('+1','Na')}`],['离子',`写在右上角，数字在前，“1”省略：${fmB('Mg^2+')}、${fmB('Na^+')}`],['根',`OH、NO₃ −1；SO₄、CO₃ −2；PO₄ −3；NH₄ +1`]]],
    ['怎样运用',[['求化合价',`代数和为 0 列式：${fmB('KMnO4')} 中 Mn 为 +7`],['写化学式','正左负右 → 最小公倍数 → 个数 → 写右下角 → 检查'],['读法','某化某、氢氧化某、某酸某；+2 价的铁读“亚铁”']]]];
  const g=$('#suGrid');g.innerHTML=COL.map(([h,L])=>`<div class="scol"><h4>${h}</h4>${L.map(([q,a])=>`<div class="sitem hide"><span class="q">${q}</span><span class="a">${a}</span></div>`).join('')}</div>`).join('');
  $$('.sitem',g).forEach(x=>x.onclick=()=>{x.classList.toggle('hide');sfx('pop');});
  $('#suAll').onclick=()=>{$$('.sitem',g).forEach((x,i)=>setTimeout(()=>x.classList.remove('hide'),i*90));sfx('whoosh');};
  $('#suHide').onclick=()=>{$$('.sitem',g).forEach(x=>x.classList.add('hide'));sfx('click');};
  return{enter(){const{r,b}=TEAM.sc;$('#suScore').innerHTML=`<span style="color:${CP}">红队 <b class="fm">${r}</b></span>　<span style="color:${CB}">蓝队 <b class="fm">${b}</b></span><div class="hint" style="font-size:16px;margin-top:4px">${r===b?'平分秋色！':(r>b?'红队':'蓝队')+'领先！'}</div>`;}};})();
