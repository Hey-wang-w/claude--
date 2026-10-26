/* ================= 9 竞赛：拆弹倒计时（两队各一颗炸弹、各自计时；答对剪一根线，答错扣 30 秒） ================= */
S.bomb=(()=>{const cv=$('#cvBomb');let t=0,idx=0,phase='ask',pick=null,running=false,mins=4,clock,cut,out,got,order,cutT={r:-9,b:-9},hitT={r:-9,b:-9};
  const vl=(top,sym)=>`<span class="fm"><span class="vl"><i>${top}</i><b>${sym}</b></span></span>`;
  // [分值, 题干, 选项, 正确项, 解析]
  const Q=[
    [10,'下列符号能表示“氧化铝中铝元素显 +3 价”的是',[fmB('Al2{+3}O3'),`<span class="fm"><span class="vl"><i>3+</i><b>Al</b></span><sub>2</sub>O<sub>3</sub></span>`,fmB('Al^3+'),fmB('2Al^3+')],0,'化合价标在元素符号正上方，正负号在前、数字在后；Al³⁺ 是铝离子。'],
    [10,`高铁酸钾（${fmB('K2FeO4')}）是一种净水剂，其中铁元素的化合价为`,['+2','+3','+6','+8'],2,'(+1)×2 + x + (−2)×4 = 0，x = +6。'],
    [10,`二氧化氯（${fmB('ClO2')}）是一种消毒剂，其中氯元素的化合价为`,['−1','+2','+4','+5'],2,'x + (−2)×2 = 0，x = +4。表 4-3 里没有氯的 +4 价，要靠计算才知道。'],
    [10,`下列含氮物质中，氮元素的化合价由低到高排列正确的是<br>① ${fmB('NH3')}　② ${fmB('N2')}　③ ${fmB('NO2')}　④ ${fmB('HNO3')}`,['①②③④','②①③④','④③②①','①③②④'],0,'NH₃ 中 −3，N₂ 中 0（单质），NO₂ 中 +4，HNO₃ 中 +5。'],
    [10,`硅酸钠的化学式为 ${fmB('Na2SiOx')}，其中硅元素显 +4 价，则 x 为`,['1','2','3','4'],2,'(+1)×2 + (+4) + (−2)×x = 0，x = 3。'],
    [10,'下列物质中，硫元素化合价最高的是',[fmB('H2S'),fmB('S'),fmB('SO2'),fmB('Na2SO4')],3,'H₂S 中 −2；S 是单质为 0；SO₂ 中 +4；Na₂SO₄ 中 +6。'],
    [10,'氢氧化铁的化学式书写正确的是',[fmB('Fe(OH)3'),fmB('FeOH3'),fmB('Fe(OH)2'),fmB('Fe3OH')],0,'Fe 显 +3 价，OH 显 −1 价，需要 3 个 OH；根不止 1 个要加括号。'],
    [20,'【提升】第三周期某元素原子的最外层有 6 个电子，它的最高正价和最低负价分别为',['+6、−2','+2、−6','+6、−6','−2、+2'],0,'最高正价 = 最外层电子数 = +6；最低负价 = 6 − 8 = −2。'],
    [10,'关于符号中数字“2”的意义，下列说法正确的是',[`${fmB('Mg{+2}O')} 中的“2”表示镁离子带 2 个单位正电荷`,`${fmB('Ca^2+')} 中的“2”表示钙元素的化合价为 +2`,`${fmB('H2O')} 中的“2”表示 1 个水分子中含有 2 个氢原子`,`${fmB('2H')} 中的“2”表示 2 个氢元素`],2,'正上方的数字是化合价；右上角是离子所带电荷；元素只讲种类、不讲个数。'],
    [10,'下列化学式书写正确的是',[fmB('MgCl'),fmB('AlO'),fmB('KCl'),fmB('CaOH')],2,'MgCl₂、Al₂O₃、Ca(OH)₂ 才正确；KCl 中 (+1) + (−1) = 0。'],
    [10,'下列关于化合价的说法正确的是',['单质中元素的化合价为 0','金属元素在化合物中可以显负价','非金属元素在化合物中只显负价','化合物中正、负化合价的代数和不一定为 0'],0,'金属元素在化合物中显正价；非金属元素也可显正价（如 CO₂ 中的 C）；化合物中代数和一定为 0。'],
    [10,'已知镁显 +2 价、硝酸根显 −1 价，硝酸镁的化学式为',[fmB('MgNO3'),fmB('Mg(NO3)2'),fmB('Mg2NO3'),fmB('MgN2O6')],1,'需要 2 个 NO₃，原子团不止 1 个要加括号：Mg(NO₃)₂。'],
    [10,`${fmB('Fe2(SO4)3')} 的正确读法是`,['硫酸亚铁','硫酸铁','三硫酸二铁','硫化铁'],1,'SO₄ 为 −2 价，可算出 Fe 为 +3 价，读作“某酸某”：硫酸铁；+2 价的铁才读“亚铁”。'],
    [10,'由 +3 价的铁和 −2 价的氧组成的化合物，化学式与读法都正确的是',[`${fmB('FeO')}　氧化铁`,`${fmB('Fe2O3')}　氧化铁`,`${fmB('Fe3O2')}　氧化亚铁`,`${fmB('Fe2O3')}　氧化亚铁`],1,'3 和 2 的最小公倍数是 6：Fe 2 个、O 3 个；+3 价的铁读“铁”。'],
    [20,'【提升】X 原子最外层有 2 个电子，Y 原子最外层有 7 个电子，它们形成的化合物的化学式可能是',[fmB('XY'),fmB('XY2'),fmB('X2Y'),fmB('X2Y7')],1,'X 供给 2 个电子显 +2 价，Y 需要 1 个电子显 −1 价，化学式为 XY₂。'],
    [10,`硝酸铵（${fmB('NH4NO3')}）中氮元素的化合价`,['都是 +5','都是 −3','分别为 −3 和 +5','分别为 +3 和 −5'],2,'铵根 NH₄ 为 +1 价：x + (+1)×4 = +1，x = −3；硝酸根 NO₃ 为 −1 价：y + (−2)×3 = −1，y = +5。'],
    [10,'下列关于化合价与离子符号的说法正确的是',['化合价标在元素符号的右上角','离子所带电荷的“1”不能省略','同种元素的化合价与它的离子所带电荷，数值相等、正负相同','化合价的正负号写在数字后面'],2,'化合价标在正上方、符号在前、“1”不省略；离子电荷写在右上角、数字在前、“1”省略。'],
    [10,`金属元素 R 的原子 ${shellSvg(13,[2,8,3])} 与氧结合，形成的化合物的化学式为`,[fmB('RO'),fmB('R2O3'),fmB('R3O2'),fmB('RO3')],1,'R 最外层 3 个电子，供给 3 个，显 +3 价；O 显 −2 价。最小公倍数 6：R 2 个，O 3 个。'],
    [20,`【提升】关于 ${fmB('Ca3(PO4)2')}，下列说法正确的是`,['磷元素显 +5 价，读作磷酸钙','磷元素显 +5 价，读作磷化钙','磷元素显 +3 价，读作磷酸钙','磷元素显 −3 价，读作磷酸钙'],0,'磷酸根 PO₄ 为 −3 价：x + (−2)×4 = −3，x = +5；含酸根读“某酸某”。'],
    [20,`【提升】硫代硫酸钠（${fmB('Na2S2O3')}）中硫元素的化合价为`,['+2','+4','+6','−2'],0,'(+1)×2 + 2x + (−2)×3 = 0，2x = +4，x = +2。别忘了乘硫原子的个数 2。']];
  const WIRES=6;
  const card=$('#boCard'),other=tm=>tm==='r'?'b':'r';let practice=false,FXS={r:null,b:null};
  const tag=tm=>`<span class="teamTag ${tm}">${tname(tm)}</span>`,fmt=s=>{s=Math.max(0,Math.ceil(s));return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
  function reset(){idx=0;phase='ask';pick=null;running=false;practice=false;clock={r:mins*60,b:mins*60};cut={r:0,b:0};out={r:null,b:null};got={r:0,b:0};order=[];FXS={r:null,b:null};$('#boGo').textContent='开始计时';teamSet('r');ask();}
  function ask(){if(idx>=Q.length||(out.r&&out.b&&!practice))return finish();if(out[TEAM.cur]&&!practice)teamSet(other(TEAM.cur));phase='ask';pick=null;const[p,q,O]=Q[idx];
    card.innerHTML=`<div class="qmeta">${tag(TEAM.cur)}<span class="tag ${p>10?'y':'b'}">第 ${idx+1} / ${Q.length} 题 · ${p} 分</span><span class="hint">${practice?'加时练习':running?'计时中':'计时暂停'}</span></div><div class="qtext">${q}</div>
      <div class="opts">${O.map((o,k)=>`<button class="opt" data-v="${k}"><i>${'ABCD'[k]}</i><span>${o}</span></button>`).join('')}</div>
      <div class="row"><button class="btn pri sm" id="boSub">提交</button></div><div class="status" id="boSt">${practice?'加时练习：答对照常加分。':'答对剪断一根线；答错本队炸弹扣 30 秒。'}</div>`;
    $$('.opt',card).forEach(b=>b.onclick=()=>{if(phase!=='ask')return;pick=+b.dataset.v;$$('.opt',card).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
    $('#boSub').onclick=submit;}
  function submit(){if(phase!=='ask')return;if(pick===null){setSt($('#boSt'),'warn','请先选一个答案');return;}phase='rev';const[p,,,ans,ex]=Q[idx],tm=TEAM.cur,ok=pick===ans;
    $$('.opt',card).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===ans)x.classList.add('right');else if(v===pick)x.classList.add('wrong');});$('#boSub').remove();
    let msg;if(ok){teamAdd(p,tm);got[tm]+=p;sfx('ok');msg=`<b>${tname(tm)}答对 +${p}</b>`;
        if(!practice&&!out[tm]){cut[tm]++;cutT[tm]=t;msg+=`，剪断第 ${cut[tm]} 根线！`;
          if(cut[tm]>=WIRES){out[tm]='ok';order.push(tm);FXS[tm]={k:'ok',t0:t+.35,parts:[]};setTimeout(()=>{teamAdd(20,tm);got[tm]+=20;FX.confetti();sfx('win');},450);msg+=' 炸弹拆除成功，+20！';}}}
      else{sfx('bad');msg=`<b>${tname(tm)}答错，不加分</b>`;if(!practice&&!out[tm]){clock[tm]-=30;hitT[tm]=t;flash();msg+='，炸弹扣 30 秒';if(clock[tm]<=0)boom(tm);}}
    setSt($('#boSt'),ok?'ok':'bad',`${msg}<br>${ex}`);
    const nx=document.createElement('div');nx.className='row';nx.innerHTML=`<button class="btn pri sm">下一题</button>`;card.appendChild(nx);$('button',nx).onclick=next;}
  function next(){idx++;teamSet(other(TEAM.cur));ask();sfx('whoosh');}
  // 爆炸：火球、冲击波、碎片、火花、浓烟，之后炸弹外壳烧焦、持续冒烟
  function boom(tm){if(out[tm])return;clock[tm]=0;out[tm]='boom';shake();setTimeout(shake,180);sfx('boom');
    const parts=[],R=Math.random;
    for(let i=0;i<26;i++){const a=R()*TAU,v=280+R()*520;parts.push({k:'deb',x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v-180,rot:R()*TAU,vr:(R()-.5)*14,s:6+R()*14,c:i%3?'#2b2420':WC[i%WC.length],l:1.8+R()*.8});}
    for(let i=0;i<80;i++){const a=R()*TAU,v=200+R()*900;parts.push({k:'spk',x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.35+R()*.6,c:R()<.5?'#fff3b0':'#ffb347'});}
    for(let i=0;i<16;i++){const a=R()*TAU,v=20+R()*70;parts.push({k:'smk',x:Math.cos(a)*30,y:Math.sin(a)*30,vx:Math.cos(a)*v,vy:-30-R()*50,r:18+R()*16,l:2.6+R()*1.4,g:R()*.3});}
    FXS[tm]={k:'boom',t0:t,parts};
    if(phase==='ask'&&TEAM.cur===tm){phase='rev';card.insertAdjacentHTML('beforeend','<div class="row"><button class="btn pri sm" id="boNx">换另一队答题</button></div>');$('#boNx').onclick=()=>{teamSet(other(tm));ask();};$$('.opt',card).forEach(x=>x.disabled=true);}}
  function finish(){phase='end';running=false;$('#boGo').textContent='开始计时';
    const score=tm=>(out[tm]==='ok'?100-order.indexOf(tm):0)*10+cut[tm];const r=score('r'),b=score('b'),w=r===b?'':r>b?'r':'b',left=Q.length-idx;
    card.innerHTML=`<div class="qmeta"><span class="tag y">比赛结束</span></div><div class="qtext" style="font-size:26px">${w?`${tag(w)} 获胜！`:'两队打成平手！'}</div>
      <div class="tflist">${['r','b'].map(tm=>`<div class="tf"><div>${tag(tm)}　剪断 <b class="fm">${cut[tm]}</b> 根线　剩余 <b class="fm">${fmt(clock[tm])}</b></div><b>${out[tm]==='ok'?'拆除成功':out[tm]==='boom'?'爆炸':'未拆完'}　本轮 +${got[tm]}</b></div>`).join('')}</div>
      <p class="hint">胜负：先拆除成功的队获胜；都没拆完时，比剪断的线数。</p>${left>0?`<div class="row"><button class="btn pri sm" id="boMore">继续答剩下的 ${left} 题（加时练习，答对照常加分）</button></div>`:''}`;
    if(left>0)$('#boMore').onclick=()=>{practice=true;phase='ask';ask();sfx('whoosh');};FX.confetti();sfx('win');}
  $('#boGo').onclick=()=>{if(phase==='end'||practice)return;running=!running;$('#boGo').textContent=running?'暂停':'继续计时';const h=$('.qmeta .hint',card);if(h)h.textContent=running?'计时中':'计时暂停';sfx('click');};
  $$('[data-id="bomb"] .ctlbar [data-min]').forEach(b=>b.onclick=()=>{mins=+b.dataset.min;$$('[data-id="bomb"] .ctlbar [data-min]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(!running&&idx===0&&phase==='ask'){clock={r:mins*60,b:mins*60};}sfx('click');});
  $('#boReset').onclick=reset;
  const WC=[CP,CB,CY,CG,CO,CL];
  // 漫画式爆炸字：锯齿星形底 + 文字，弹出后轻微抖动
  function burstText(ctx,x,y,s,text,fill,stroke,tc){ctx.save();ctx.translate(x,y);ctx.rotate(-.12);ctx.scale(s,s);ctx.beginPath();for(let i=0;i<32;i++){const a=i/32*TAU,r=i%2?62:104+((i*37)%5)*6;ctx.lineTo(Math.cos(a)*r*1.35,Math.sin(a)*r*.82);}
    ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=6;ctx.strokeStyle=stroke;ctx.stroke();ctx.font=`900 56px ${FNUM}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=10;ctx.strokeStyle='#fff';ctx.strokeText(text,0,2);ctx.fillStyle=tc;ctx.fillText(text,0,2);ctx.restore();}
  function drawBomb(ctx,cx,top,w,h,tm){const on=TEAM.cur===tm&&phase!=='end'&&!out[tm]&&!practice,col=tm==='r'?CP:CB,bw=Math.min(w*.8,380),bh=Math.max(260,Math.min(h-150,440)),x=cx-bw/2,y=top+60,F=FXS[tm],e=F?t-F.t0:0;
    const burnt=out[tm]==='boom'&&e>.12,safe=out[tm]==='ok'&&F&&e>0;
    hand(ctx,`${tname(tm)}的炸弹`,cx,top+24,{size:30,col});if(on){chalkRect(ctx,cx+92,top+10,84,30,{col:CY,w:2});txt(ctx,'答题中',cx+134,top+25,{size:15,weight:700,col:CY});}
    const shakeX=t-hitT[tm]<.5?Math.sin(t*80)*4*(1-(t-hitT[tm])*2):0;ctx.save();ctx.translate(shakeX,0);
    // 外壳与引信
    if(burnt){ctx.save();ctx.fillStyle='#120d0b';rr(ctx,x,y,bw,bh,18);ctx.fill();ctx.strokeStyle='#4a3f38';ctx.lineWidth=3;ctx.stroke();
      ctx.strokeStyle='#5a4a40';ctx.lineWidth=2;[[.2,0,.35,.3,.28,.55],[.8,0,.66,.25,.74,.5],[.5,1,.45,.7,.55,.52],[0,.6,.18,.66,.3,.8]].forEach(([a1,b1,a2,b2,a3,b3])=>{ctx.beginPath();ctx.moveTo(x+a1*bw,y+b1*bh);ctx.lineTo(x+a2*bw,y+b2*bh);ctx.lineTo(x+a3*bw,y+b3*bh);ctx.stroke();});
      const g=ctx.createRadialGradient(cx,y+bh/2,10,cx,y+bh/2,bw*.7);g.addColorStop(0,'rgba(255,120,40,.25)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x,y,bw,bh);ctx.restore();}
    else{chalkRect(ctx,x,y,bw,bh,{col:safe?CG:on?col:'rgba(241,238,228,.6)',w:on||safe?3.5:2.5,fill:'rgba(12,22,18,.6)',r:18});
      const fx=x+bw-30,fy=y;ctx.save();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(fx,fy);ctx.quadraticCurveTo(fx+6,fy-30,fx+40,fy-34);ctx.stroke();ctx.restore();
      if(!out[tm]){const sp=clock[tm]<30?1:.4;for(let i=0;i<8;i++){const a=Math.random()*TAU,r=4+Math.random()*14*sp;ctx.globalAlpha=.85;ctx.fillStyle=i%2?CY:CO;ctx.fillRect(fx+40+Math.cos(a)*r,fy-34+Math.sin(a)*r,3,3);}ctx.globalAlpha=1;}}
    // 计时屏
    const lw=bw*.7,lh=Math.min(84,bh*.22),lx=cx-lw/2,ly=y+18;ctx.fillStyle='rgba(0,0,0,.5)';rr(ctx,lx,ly,lw,lh,10);ctx.fill();chalkRect(ctx,lx,ly,lw,lh,{col:safe?CG:'rgba(241,238,228,.5)',w:2});
    const warn=clock[tm]<30&&!out[tm];
    if(burnt){ctx.save();ctx.globalAlpha=.5+.5*(Math.sin(t*23)>0?1:.2);txt(ctx,'--:--',cx,ly+lh/2+2,{size:lh*.6,weight:700,col:BADC});ctx.restore();ctx.save();ctx.strokeStyle='rgba(241,238,228,.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(lx+lw*.3,ly);ctx.lineTo(lx+lw*.45,ly+lh*.5);ctx.lineTo(lx+lw*.38,ly+lh);ctx.moveTo(lx+lw*.45,ly+lh*.5);ctx.lineTo(lx+lw*.7,ly+lh*.35);ctx.stroke();ctx.restore();}
    else if(safe){const g=.6+.4*Math.sin(t*4);ctx.save();ctx.shadowColor=CG;ctx.shadowBlur=18*g;txt(ctx,'SAFE',cx,ly+lh/2+2,{size:lh*.62,weight:700,col:CG});ctx.restore();}
    else txt(ctx,fmt(clock[tm]),cx,ly+lh/2+2,{size:lh*.62,weight:700,col:warn&&Math.sin(t*10)>0?BADC:CY});
    // 导线
    const wy0=ly+lh+26,gap=(y+bh-26-wy0)/(WIRES-1),tx1=x+40,tx2=x+bw-40;
    for(let i=0;i<WIRES;i++){const yy=wy0+i*gap,c=burnt?'#3a3330':WC[i],isCut=i<cut[tm];
      ctx.fillStyle=burnt?'#3a3330':INK;[tx1,tx2].forEach(xx=>{ctx.beginPath();ctx.arc(xx,yy,6,0,TAU);ctx.fill();});
      if(!isCut&&!burnt){ctx.save();ctx.strokeStyle=c;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(tx1,yy);ctx.bezierCurveTo(cx-40,yy-gap*.6,cx+40,yy+gap*.6,tx2,yy);ctx.stroke();ctx.restore();}
      else{const k=isCut&&i===cut[tm]-1?clamp((t-cutT[tm])*3,0,1):1,d=10+k*14;ctx.save();ctx.strokeStyle=c;ctx.lineWidth=5;ctx.lineCap='round';ctx.globalAlpha=burnt?.9:.75;
        ctx.beginPath();ctx.moveTo(tx1,yy);ctx.quadraticCurveTo(cx-60,yy+k*16,cx-d,yy+k*22);ctx.stroke();ctx.beginPath();ctx.moveTo(tx2,yy);ctx.quadraticCurveTo(cx+60,yy+k*16,cx+d,yy+k*22);ctx.stroke();ctx.restore();
        if(isCut&&i===cut[tm]-1&&t-cutT[tm]<.6)for(let j=0;j<10;j++){ctx.fillStyle=j%2?CY:'#fff';ctx.fillRect(cx+(Math.random()-.5)*44,yy+(Math.random()-.5)*30,3,3);}}}
    ctx.restore();
    // 拆除成功：绿色光环向外扩散 + 星光
    if(safe){const q=clamp(e/1.2,0,1);if(q<1){ctx.save();ctx.globalAlpha=1-q;ctx.strokeStyle=CG;ctx.lineWidth=8*(1-q)+1;ctx.beginPath();ctx.arc(cx,y+bh/2,40+q*bw*.8,0,TAU);ctx.stroke();ctx.restore();
        for(let i=0;i<14;i++){const a=i/14*TAU+e,r=60+q*bw*.6;ctx.save();ctx.globalAlpha=1-q;ctx.fillStyle=i%2?CG:CY;ctx.translate(cx+Math.cos(a)*r,y+bh/2+Math.sin(a)*r);ctx.rotate(e*4);ctx.fillRect(-4,-4,8,8);ctx.restore();}}
      hand(ctx,'拆除成功 +20 ✓',cx,y+bh+36,{size:32,col:CG});}
    else if(burnt)hand(ctx,`炸弹爆炸了（剪断 ${cut[tm]} / ${WIRES} 根）`,cx,y+bh+36,{size:26,col:BADC});
    else txt(ctx,`已剪断 ${cut[tm]} / ${WIRES} 根`,cx,y+bh+30,{size:18,weight:700,col:DIM});
    // 爆炸特效
    if(out[tm]==='boom'&&F){const ox=cx,oy=y+bh/2,dt=1/60;
      if(e<.14){ctx.save();ctx.globalAlpha=.85*(1-e/.14);ctx.fillStyle='#fff8e0';ctx.fillRect(cx-w/2,0,w,h+80);ctx.restore();}
      if(e<1.5){const q=Math.min(1,e/.32),R0=q*bw*.8,al=1-Math.max(0,(e-.32)/1.18);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al;
        const g=ctx.createRadialGradient(ox,oy,0,ox,oy,R0+1);g.addColorStop(0,'#ffffff');g.addColorStop(.2,'#fff3b0');g.addColorStop(.45,'#ffb347');g.addColorStop(.72,'#ff5a36');g.addColorStop(1,'rgba(120,20,10,0)');
        ctx.fillStyle=g;ctx.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,rr2=R0*(.82+.18*Math.sin(a*7+e*9));ctx.lineTo(ox+Math.cos(a)*rr2,oy+Math.sin(a)*rr2);}ctx.fill();ctx.restore();}
      if(e<.9){const q=e/.9;ctx.save();ctx.globalAlpha=(1-q)*.9;ctx.strokeStyle='#fff';ctx.lineWidth=12*(1-q)+1;ctx.beginPath();ctx.arc(ox,oy,q*bw*1.15,0,TAU);ctx.stroke();ctx.restore();}
      F.parts.forEach(p=>{if(p.k==='deb'){if(e>p.l)return;p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.rot+=p.vr*dt;ctx.save();ctx.globalAlpha=Math.min(1,(p.l-e)*2);ctx.translate(ox+p.x,oy+p.y);ctx.rotate(p.rot);
          ctx.fillStyle=p.c;ctx.beginPath();ctx.moveTo(-p.s,-p.s*.5);ctx.lineTo(p.s*.8,-p.s*.7);ctx.lineTo(p.s,p.s*.4);ctx.lineTo(-p.s*.5,p.s*.6);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,180,90,.6)';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();}
        else if(p.k==='spk'){if(e>p.l)return;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.95;p.vy=p.vy*.95+300*dt;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-e/p.l;ctx.strokeStyle=p.c;ctx.lineWidth=2.5;ctx.lineCap='round';
          ctx.beginPath();ctx.moveTo(ox+p.x,oy+p.y);ctx.lineTo(ox+p.x-p.vx*.03,oy+p.y-p.vy*.03);ctx.stroke();ctx.restore();}
        else{if(e<.25)return;const age=e-.25;if(age>p.l){p.x=(Math.random()-.5)*bw*.5;p.y=bh*.1;p.r=10+Math.random()*10;p.l=age+2.5+Math.random();p.born=age;}const a2=age-(p.born||0);
          p.x+=p.vx*dt*.4;p.y+=p.vy*dt;const rr2=p.r+a2*24;ctx.save();ctx.globalAlpha=Math.max(0,.42*(1-a2/((p.l-(p.born||0))||1)));const g=ctx.createRadialGradient(ox+p.x,oy+p.y,0,ox+p.x,oy+p.y,rr2);g.addColorStop(0,`rgba(${90+p.g*60|0},${86+p.g*50|0},${80+p.g*40|0},1)`);g.addColorStop(1,'rgba(60,60,60,0)');
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(ox+p.x,oy+p.y,rr2,0,TAU);ctx.fill();ctx.restore();}});
      if(e>.08&&e<3.4){const q=clamp((e-.08)/.3,0,1),s2=q<1?ease(q)*1.18:1+.03*Math.sin(t*12)*Math.exp(-(e-.4));ctx.save();ctx.globalAlpha=clamp((3.4-e)/.6,0,1);burstText(ctx,ox,oy-10,s2*Math.min(1,bw/380),'BOOM!','#ffd23f','#e5484d','#c81e1e');ctx.restore();}}}
  function tick(dt){t+=dt;if(running&&phase==='ask'&&!practice&&!out[TEAM.cur]){clock[TEAM.cur]-=dt;if(clock[TEAM.cur]<=0)boom(TEAM.cur);}
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);ctx.save();ctx.strokeStyle='rgba(241,238,228,.2)';ctx.lineWidth=2;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(w/2,40);ctx.lineTo(w/2,h-90);ctx.stroke();ctx.restore();
    drawBomb(ctx,w*.25,10,w/2,h-80,'r');drawBomb(ctx,w*.75,10,w/2,h-80,'b');}
  reset();if(location.hash==='#test')window.__vb={boom,win:tm=>{cut[tm]=WIRES;out[tm]='ok';FXS[tm]={k:'ok',t0:t,parts:[]};}};
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
