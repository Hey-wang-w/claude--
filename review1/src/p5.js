/* ================= 13 竞赛：实验室寻宝（答对挖格子：宝箱、金宝箱、线索、隐患、空格） =================
   答对 +10（提升题 +20，并多挖 1 格）；宝箱 +5 并得仪器卡，金宝箱 +10，线索 +5，隐患要答对安全题才 +5；红队先答，两队交替，提升题两队各两道。 */
S.hunt=(()=>{const cv=$('#cvHunt'),card=$('#htCard');let t=0,G=null,qi=0,phase='ask',digs=0,digger='r',tiles=[],trapN=0,last=null,ended=false,cards={r:[],b:[]},flash=null;
  const COLS=5,ROWS=4,INSTR=['tube','beaker','cylinder','conical','flask','funnel','jar','dish'],INM={tube:'试管',beaker:'烧杯',cylinder:'量筒',conical:'锥形瓶',flask:'烧瓶',funnel:'漏斗',jar:'集气瓶',dish:'蒸发皿'};
  const CLUE=['外焰温度最高','俯视读数偏大','液体不超过 1/3','灯帽盖灭酒精灯'];
  const DIMS={tube:[130,30],beaker:[110,96],cylinder:[160,64],conical:[126,96],flask:[132,86],funnel:[120,84],jar:[114,92],dish:[44,124]};
  function deal(){const bag=[...Array(6).fill('chest'),'gold','gold',...Array(4).fill('clue'),...Array(4).fill('trap'),...Array(4).fill('empty')].sort(()=>Math.random()-.5);
    let ci=0,ii=0,ti=0;const ins=INSTR.slice().sort(()=>Math.random()-.5),trapSign=['corr','gas','toxic','self'];
    tiles=bag.map((k,i)=>({k,open:0,t0:0,ins:k==='chest'?ins[ii++%ins.length]:null,clue:k==='clue'?CLUE[ci++]:null,sign:k==='trap'?trapSign[ti++]:null,by:null}));}
  function drawInstr(ctx,k,x,y,hh){const[H,W]=DIMS[k],s=Math.min(hh/H,hh*.9/W);if(k==='tube')AP.tube(ctx,x,y,s);else if(k==='dish')AP.dish(ctx,x,y,s);else AP[k](ctx,x,y,s);}
  function chest(ctx,x,y,s,gold,open){ctx.save();ctx.translate(x,y);ctx.scale(s,s);const wood=gold?'#c99a2e':'#9a6a3a',dk=gold?'#8a6514':'#5e3f22';
    if(open){ctx.fillStyle='rgba(255,220,120,.55)';ctx.beginPath();ctx.ellipse(0,-22,34,16,0,0,TAU);ctx.fill();}
    ctx.fillStyle=wood;ctx.strokeStyle=INK;ctx.lineWidth=1.6;rr(ctx,-30,-20,60,32,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=shade(wood,.15);ctx.beginPath();if(open){ctx.moveTo(-30,-20);ctx.lineTo(-26,-44);ctx.lineTo(26,-44);ctx.lineTo(30,-20);}else{ctx.moveTo(-30,-20);ctx.quadraticCurveTo(0,-40,30,-20);}ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=dk;ctx.fillRect(-4,-24,8,14);ctx.fillStyle='#e8c860';ctx.fillRect(-30,-6,60,4);ctx.restore();}
  function layout(w,h){const top=54,bot=96,gw=w-40,gh=h-top-bot,cw=gw/COLS,ch=gh/ROWS;return{x0:20,y0:top,cw,ch};}
  function draw(){const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const L=G=layout(w,h);
    // 平面图底纹
    ctx.fillStyle='#efe7d6';ctx.fillRect(L.x0-6,L.y0-6,L.cw*COLS+12,L.ch*ROWS+12);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.strokeRect(L.x0-6,L.y0-6,L.cw*COLS+12,L.ch*ROWS+12);
    tiles.forEach((tl,i)=>{const c=i%COLS,r=(i/COLS)|0,x=L.x0+c*L.cw,y=L.y0+r*L.ch,cx=x+L.cw/2,cy=y+L.ch/2,s=Math.min(L.cw,L.ch)/120;
      ctx.fillStyle='#f8f3e8';ctx.strokeStyle='rgba(28,26,23,.25)';ctx.lineWidth=1;ctx.fillRect(x+4,y+4,L.cw-8,L.ch-8);ctx.strokeRect(x+4,y+4,L.cw-8,L.ch-8);
      const op=tl.open?clamp((t-tl.t0)/.6,0,1):0;
      if(op>0){ctx.save();ctx.globalAlpha=op;const iy=cy+10*s;
        if(tl.k==='chest'||tl.k==='gold'){chest(ctx,cx,iy+10*s,s*1.1,tl.k==='gold',true);if(tl.ins)drawInstr(ctx,tl.ins,cx,iy-20*s,46*s);txt(ctx,tl.k==='gold'?'金宝箱 +10':`宝箱 +5 · ${INM[tl.ins]}`,cx,y+L.ch-18,{size:Math.max(12,13*s),weight:700,col:tl.k==='gold'?CA:INK});}
        else if(tl.k==='clue'){hand(ctx,'线索 +5',cx,y+22*s+6,{size:15*s,col:CC});const ls=wrapLines(ctx,tl.clue,L.cw-24,`700 ${Math.round(15*s)}px ${FNUM}`);ls.forEach((l,j)=>txt(ctx,l,cx,cy+(j-(ls.length-1)/2)*18*s+6*s,{size:15*s,weight:700}));}
        else if(tl.k==='trap'){const im=SIGNIMG[tl.sign],sz=Math.min(L.cw,L.ch)*.5;if(im.complete)ctx.drawImage(im,cx-sz/2,cy-sz/2-8*s,sz,sz);txt(ctx,'安全隐患',cx,y+L.ch-18,{size:Math.max(12,13*s),weight:700,col:BADC});}
        else{hand(ctx,'空',cx,cy,{size:26*s,col:FAINT});}
        if(tl.by){ctx.fillStyle=tl.by==='r'?RED:BLUE;ctx.fillRect(x+4,y+4,L.cw-8,5);}
        ctx.restore();}
      if(op<1){// 盖板：向上滑开、渐隐
        ctx.save();ctx.globalAlpha=1-op;ctx.translate(0,-op*L.ch*.4);ctx.fillStyle=phase==='dig'?'#fffdf8':'#fbf7ee';ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.fillRect(x+8,y+8,L.cw-16,L.ch-16);ctx.strokeRect(x+8,y+8,L.cw-16,L.ch-16);
        txt(ctx,`${'ABCDE'[c]}${r+1}`,x+20,y+24,{size:13,weight:800,col:CM,align:'left'});hand(ctx,'?',cx,cy+4,{size:40*s,col:phase==='dig'?CA:'rgba(28,26,23,.25)'});
        if(phase==='dig'){ctx.strokeStyle=CA;ctx.lineWidth=2+Math.sin(t*6);ctx.strokeRect(x+11,y+11,L.cw-22,L.ch-22);}ctx.restore();}});
    // 顶部：比分与可挖格数
    txt(ctx,`红队 ${TEAM.sc.r}`,w-260,26,{size:20,weight:800,col:RED,align:'left'});txt(ctx,`蓝队 ${TEAM.sc.b}`,w-140,26,{size:20,weight:800,col:BLUE,align:'left'});
    if(phase==='dig')hand(ctx,`${tname(digger)}可以挖 ${digs} 格`,w/2,26,{size:20,col:digger==='r'?RED:BLUE});
    // 底部：仪器卡收藏
    const by=h-86;['r','b'].forEach((tm,j)=>{const x0=20+j*(w-40)/2,ww=(w-40)/2-10;ctx.fillStyle='#fffdf8';ctx.strokeStyle=tm==='r'?RED:BLUE;ctx.lineWidth=1.6;ctx.fillRect(x0,by,ww,74);ctx.strokeRect(x0,by,ww,74);
      txt(ctx,`${tname(tm)}仪器卡`,x0+12,by+16,{size:13,weight:800,col:tm==='r'?RED:BLUE,align:'left'});cards[tm].forEach((k,i)=>{drawInstr(ctx,k,x0+30+i*46,by+70,48);});
      if(!cards[tm].length)txt(ctx,'还没有',x0+ww/2,by+44,{size:14,col:FAINT});});
    if(flash&&t-flash.t0<1.6){const a=1-(t-flash.t0)/1.6;ctx.save();ctx.globalAlpha=a;hand(ctx,flash.s,w/2,h/2-(1-a)*40,{size:40,col:flash.c});ctx.restore();}
    if(ended){ctx.fillStyle='rgba(243,238,228,.9)';ctx.fillRect(0,0,w,h);const r=TEAM.sc.r,b=TEAM.sc.b;hand(ctx,'寻宝结束',w/2,h*.3,{size:46});
      hand(ctx,r===b?'两队平分秋色！':`${r>b?'红队':'蓝队'}获胜！`,w/2,h*.45,{size:40,col:r===b?CA:r>b?RED:BLUE});txt(ctx,`红队 ${r}　·　蓝队 ${b}`,w/2,h*.57,{size:24,weight:800});
      txt(ctx,`仪器卡：红队 ${cards.r.length} 张，蓝队 ${cards.b.length} 张`,w/2,h*.65,{size:18,col:DIM});}}
  function dig(i){const tl=tiles[i];if(phase!=='dig'||tl.open)return;tl.open=1;tl.t0=t;tl.by=digger;digs--;sfx('pop');
    const c=i%COLS,r=(i/COLS)|0,rc=cv.getBoundingClientRect(),k=rc.width/cv.offsetWidth||1;const px=rc.left+(G.x0+(c+.5)*G.cw)*k,py=rc.top+(G.y0+(r+.5)*G.ch)*k;
    if(tl.k==='chest'){teamAdd(5,digger);cards[digger].push(tl.ins);FX.burst(px,py,30,[CA,'#e8c860']);sfx('win');flash={s:`+5 · ${INM[tl.ins]}`,c:CA,t0:t};}
    else if(tl.k==='gold'){teamAdd(10,digger);FX.burst(px,py,50,[CA,'#e8c860','#fff2b0']);FX.confetti();sfx('win');flash={s:'金宝箱 +10',c:CA,t0:t};}
    else if(tl.k==='clue'){teamAdd(5,digger);sfx('ok');flash={s:'线索 +5',c:CC,t0:t};}
    else if(tl.k==='trap'){sfx('bad');shake();flash={s:'安全隐患！',c:BADC,t0:t};trap();return;}
    else{sfx('click');flash={s:'空格',c:FAINT,t0:t};}
    if(tiles.every(x=>x.open))digs=0;if(digs<=0){phase='ready';}panel();}
  function trap(){phase='trap';const back=TEAM.cur,q=QB.trap[trapN++%QB.trap.length];teamSet(digger);
    card.innerHTML=`<div class="qmeta"><span class="teamTag ${digger}">${tname(digger)}</span><b class="hint">踩到安全隐患：答对才能继续寻宝，+5</b></div><div class="qhost"></div><div class="row"><button class="btn" id="htNext" disabled>继续</button></div>`;
    qView($('.qhost',card),q,{pts:5,onJudge:()=>{teamSet(back);if(tiles.every(x=>x.open))digs=0;phase=digs>0?'dig':'ready';panel();}});}
  function panel(){if(ended)return;const q=QB.hunt[qi];
    if(phase==='dig'){$('.digtip',card)?.remove();const d=document.createElement('div');d.className='digtip';d.textContent=`${tname(digger)}答对！在平面图上点 ${digs} 个格子挖宝`;card.appendChild(d);$('#htNext')&&($('#htNext').disabled=true);return;}
    if(phase==='ready'){$('.digtip',card)?.remove();const nb=$('#htNext');nb.disabled=false;nb.textContent=qi<QB.hunt.length-1?'下一题':'看结果';nb.onclick=()=>{qi++;sfx('whoosh');ask();};}}
  function ask(){if(qi>=QB.hunt.length){end();return;}const q=QB.hunt[qi],tm=TEAM.cur,pts=q.pts||10;phase='ask';
    card.innerHTML=`<div class="qmeta"><span class="teamTag ${tm}">${tname(tm)}</span><b>第 ${qi+1} / ${QB.hunt.length} 题</b>${pts===20?'<span class="tag">提升 · 挖 2 格</span>':''}</div><div class="qhost"></div><div class="row"><button class="btn" id="htNext" disabled>${qi<QB.hunt.length-1?'下一题':'看结果'}</button></div>`;
    qView($('.qhost',card),Object.assign({},q,{q:q.q.replace('【提升】','')}),{pts,vbtn:'after',vsrc:`寻宝第 ${qi+1} 题`,onJudge:ok=>{if(ok&&tiles.some(x=>!x.open)){digs=pts===20?2:1;digger=tm;phase='dig';panel();}else phase='ready';
        if(phase==='ready')panel();}});}
  function end(){ended=true;phase='end';sfx('win');FX.confetti();const r=TEAM.sc.r,b=TEAM.sc.b;
    card.innerHTML=`<div class="qmeta"><b>寻宝结束</b></div><p class="qtext">${r===b?'两队平分秋色！':(r>b?'红队':'蓝队')+'获胜！'}</p><p>红队 <b class="cm">${r}</b> 分，蓝队 <b style="color:var(--blue)">${b}</b> 分。</p><p class="hint">答错的题可以点题号回顾，或到小结页的“错题回顾”里做变式。</p>`;}
  canvasUI(cv,{hots:()=>!G?[]:tiles.map((tl,i)=>({on:phase==='dig'&&!tl.open,hit:(x,y)=>{const c=i%COLS,r=(i/COLS)|0;return x>G.x0+c*G.cw&&x<G.x0+(c+1)*G.cw&&y>G.y0+r*G.ch&&y<G.y0+(r+1)*G.ch;},act:()=>dig(i)}))});
  function restart(){qi=0;digs=0;trapN=0;ended=false;cards={r:[],b:[]};flash=null;deal();teamSet('r');ask();}
  $('#htReset').onclick=()=>{restart();sfx('click');};deal();let started=false;
  return{tick(dt){t+=dt;draw();},enter(){if(!started){started=true;teamSet('r');ask();}}};})();

/* ================= 14 小结：易错点清单 + 错题回顾（变式完成情况） ================= */
S.sum=(()=>{const g=$('#suGrid');
  const COL=[['化学研究与变化',[['化学','在分子、原子层次上研究物质的组成、结构、性质、转化及应用'],['变化','本质区别：有没有生成其他物质'],['性质','“能燃烧”是性质，“燃烧了”是变化'],['现象','“石灰水变浑浊”是现象，“生成二氧化碳”是结论']]],
    ['仪器与基本操作',[['加热','试管、蒸发皿、燃烧匙直接加热；烧杯、烧瓶、锥形瓶垫陶土网'],['量筒','俯视读数偏大，仰视读数偏小'],['倾倒','瓶塞倒放，标签朝向手心，瓶口紧挨试管口'],['加热液体','不超过 1/3，约 45°，先预热，外焰，管口不对人']]],
    ['安全与探究',[['酒精灯','火柴点燃，灯帽盖灭；酒精不超过 2/3'],['意外','酒精着火用湿抹布盖灭；烫伤用大量冷水冲洗；药液溅进眼睛用水冲洗，不能揉'],['气密性','先浸导管再握容器；有气泡、松手后有水柱'],['蜡烛','外焰温度最高；燃烧生成水和二氧化碳']]]];
  function render(hide=true){g.innerHTML=COL.map(([hd,items],k)=>`<div class="scol"><h4><i>0${k+1}</i>${hd}</h4>${items.map(([q,a])=>`<div class="sitem${hide?' hide':''}"><span class="q">${q}</span><span class="a">${a}</span></div>`).join('')}</div>`).join('');
    $$('.sitem',g).forEach(x=>x.onclick=()=>{x.classList.toggle('hide');sfx('click');});}
  $('#suAll').onclick=()=>{$$('.sitem',g).forEach((x,i)=>setTimeout(()=>x.classList.remove('hide'),i*70));sfx('whoosh');};
  $('#suHide').onclick=()=>{$$('.sitem',g).forEach(x=>x.classList.add('hide'));sfx('click');};
  render();
  return{enter(){const r=TEAM.sc.r,b=TEAM.sc.b;$('#suScore').innerHTML=`<span class="cm">红队 ${r}</span>　<span style="color:var(--blue);font-weight:700">蓝队 ${b}</span><br><small class="hint">${r===b?'平分秋色！':(r>b?'红队':'蓝队')+'领先'}</small>`;
    const L=VARS.log;$('#suLog').innerHTML=L.length?L.map(e=>`<div class="vrow"><b>${e.src}</b><span>${e.ok.size} / ${e.q.v.length} 道变式做对</span><button class="btn sm">再练</button></div>`).join(''):'<p class="hint">本节还没有答错的题，或者答错后还没做变式。</p>';
    $$('#suLog .vrow button').forEach((b,i)=>b.onclick=()=>VARS.open(L[i].q,L[i].src));}};})();
