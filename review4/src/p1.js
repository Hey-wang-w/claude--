/* ================= 1 封面：两名像素角色对峙（舞台用矢量画） ================= */
S.cover=(()=>{const cv=$('#cvCover');let t=0,drops=[];
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const gy=Math.round(h*.7);
    // 上升的小水滴
    if(Math.random()<dt*3)drops.push({x:w*.08+Math.random()*w*.84,y:h+10,v:30+Math.random()*40,r:4+Math.random()*5});
    drops=drops.filter(d=>{d.y-=d.v*dt;ctx.save();ctx.globalAlpha=Math.min(1,(d.y-h*.05)/(h*.3));drop(ctx,d.x,d.y,d.r,'rgba(92,184,240,.75)');ctx.restore();return d.y>-20;});
    // 擂台：黄色贴纸平台
    sticker(ctx,w*.06,gy,w*.88,28,{r:14,fill:'#ffd23f',sh:6});ctx.fillStyle='rgba(255,255,255,.55)';rr(ctx,w*.08,gy+5,w*.84,5,3);ctx.fill();
    const s=Math.max(3,Math.floor(Math.min(w/150,h/140)));
    [['fire',w*.28],['water',w*.72]].forEach(([k,x])=>{ctx.fillStyle='rgba(31,42,68,.18)';ctx.beginPath();ctx.ellipse(x,gy+1,15*s,3.2*s,0,0,TAU);ctx.fill();});
    drawHeroIdle(ctx,'fire',t,w*.28,gy,s);drawHeroIdle(ctx,'water',t+.4,w*.72,gy,s);
    // VS
    const k=1+.06*Math.sin(t*5);ctx.save();ctx.translate(w*.5,gy-h*.22);ctx.scale(k,k);ctx.rotate(-.08);ctx.font=`900 ${Math.round(h*.13)}px ${FNUM}`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.lineJoin='round';ctx.lineWidth=12;ctx.strokeStyle=INK;ctx.strokeText('VS',6,6);ctx.fillStyle=INK;ctx.fillText('VS',6,6);ctx.strokeText('VS',0,0);ctx.fillStyle='#ff6fa8';ctx.fillText('VS',0,0);ctx.restore();
    pill(ctx,'红队 · 炎刃',w*.28,gy+58,{size:20,fill:'#ffe0d6'});pill(ctx,'蓝队 · 澜音',w*.72,gy+58,{size:20,fill:'#dff1fb'});}
  return{tick,enter(){sfx8('coin');}};})();

/* ================= 2 知识地图：知识卡放回空格 ================= */
S.map=(()=>{
  // [课题, 分支, 前半句, 答案, 后半句]
  const NODES=[[0,'水资源','可利用的淡水','很少',''],[0,'爱护水资源','节约用水；','防治水体污染',''],[0,'水的净化','净化程度最高：','蒸馏',''],[0,'硬水与软水','用','肥皂水','区分'],
    [1,'电解水','正氧负氢，体积比（正∶负）','1∶2',''],[1,'水的组成','水由','氢元素和氧元素','组成'],[1,'氢气','点燃前一定要','检验纯度',''],[1,'物质分类','由不同种元素组成的纯净物：','化合物',''],
    [2,'化学式',`${fmB('2H')} 表示`,'2 个氢原子',''],[2,'化合价','化合物中正、负化合价的','代数和为 0',''],[2,'相对分子质量','化学式中各原子的','相对原子质量的总和',''],[2,'元素质量分数','相对原子质量×原子个数÷','相对分子质量','×100%']];
  const DECOY=['氢气和氧气','2∶1','过滤','单质'];
  const TOP=['1-1 水资源及其利用','1-2 水的组成','1-3 物质组成的表示'],TC=['#1f9fd6','#1fb39f','#ffd23f'];
  let fill=[],pick=null,done=false,cards=[];const grid=$('#mpGrid'),tray=$('#mpTray'),st=$('#mpSt');
  function deal(){cards=[...NODES.map(n=>n[3]),...DECOY].sort(()=>Math.random()-.5);fill=NODES.map(()=>null);pick=null;done=false;render();setSt(st,'','把卡片拖进空格（或先点卡片、再点空格）；点已填的空格可取回。有 4 张是干扰卡。');}
  function render(){grid.innerHTML=TOP.map((tp,k)=>`<div class="mcol" style="--tc:${TC[k]}"><h4>${tp}</h4>${NODES.map((n,i)=>n[0]!==k?'':`<div class="mnode"><b>${n[1]}</b><span>${n[2]}<button class="slot${fill[i]!==null?' on':''}${done?(fill[i]===n[3]?' ok':' no'):''}" data-i="${i}">${fill[i]??'　　'}</button>${n[4]}</span>${done&&fill[i]!==n[3]?`<em class="fix">${n[3]}</em>`:''}</div>`).join('')}</div>`).join('');
    const used=fill.filter(x=>x!==null);const left=cards.slice();used.forEach(u=>{const j=left.indexOf(u);if(j>=0)left.splice(j,1);});
    tray.innerHTML=left.map((c,j)=>`<button class="mcard${pick===c?' sel':''}" data-c="${c}">${c}</button>`).join('');
    $$('.mcard',tray).forEach(b=>{b.onclick=()=>{if(done)return;pick=pick===b.dataset.c?null:b.dataset.c;sfx8('select');render();};
      DRAG.make(b,{drop:tg=>{if(done||!tg.classList.contains('slot'))return false;const i=+tg.dataset.i;fill[i]=b.dataset.c;pick=null;sfx8('coin');render();return true;}});});
    $$('.slot',grid).forEach(b=>{b.dataset.drop='1';b.onclick=()=>{if(done)return;const i=+b.dataset.i;if(fill[i]!==null){fill[i]=null;sfx8('blip');}else if(pick){fill[i]=pick;pick=null;sfx8('coin');}render();};});}
  $('#mpSub').onclick=()=>{if(done)return;if(fill.some(x=>x===null)){setSt(st,'warn',`还有 ${fill.filter(x=>x===null).length} 个空格没填`);return;}done=true;const tm=TEAM.cur,n=fill.filter((x,i)=>x===NODES[i][3]).length;render();
    if(n===NODES.length){teamAdd(5,tm);sfx8('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部放对 +5</b>　四张干扰卡：“氢气和氧气”“2∶1”“过滤”“单质”。`);}
    else{sfx8('jam');setSt(st,'bad',`<b>${tname(tm)}放对 ${n} / ${NODES.length}，不加分</b>　红框处的正确答案写在下面。`);VARS.arm(st,{v:QB.map},'知识地图');}teamNext();};
  $('#mpReset').onclick=()=>{VARS.disarm(st);deal();};deal();
  return{};})();

/* ================= 3 水资源：100 份水逐层拆开 ================= */
S.res=(()=>{const cv=$('#cvRes');let t=0,lv=0,lvT=0;
  const LV=[['地球上的水，看成 100 份',''],['海水约 96.5 份，淡水只有约 2.5 份','咸水湖等约 1 份'],['淡水里大部分是冰川和永久积雪，难以利用','可利用的淡水不到总水量的 1%'],['我国：水资源总量居世界第 6 位','人均水量约为世界人均的 1/4，分布南多北少']];
  $('#rsNext').onclick=()=>{if(lv<3){lv++;lvT=0;sfx8('blip');}};$('#rsBack').onclick=()=>{lv=0;lvT=0;sfx8('select');};
  // 小人图标（人均）
  function person(ctx,x,y,s,fill){ctx.save();ctx.lineWidth=2.2;ctx.strokeStyle=INK;ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y-s*1.25,s*.42,0,TAU);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-s*.55,y);ctx.quadraticCurveTo(x-s*.6,y-s*.75,x,y-s*.78);ctx.quadraticCurveTo(x+s*.6,y-s*.75,x+s*.55,y);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  function tick(dt){t+=dt;lvT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const q=Math.min(1,lvT*1.6);
    hand(ctx,LV[lv][0],w/2,44,{size:26,col:INK});if(LV[lv][1])txt(ctx,LV[lv][1],w/2,80,{size:18,col:DIM,weight:700});
    const top=112,bot=h-86;
    if(lv<=1){// 10×10 方块，每块 = 1 份
      const cell=Math.floor(Math.min((w*.56)/10,(bot-top)/10)),gx=lv?w*.36:w/2,x0=Math.round(gx-cell*5),y0=Math.round((top+bot)/2-cell*5);
      for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=x0+c*cell,y=y0+r*cell;let col='#5cb8f0';
        if(lv>=1){if(i>=97)col='#bfe9ff';else if(i===96)col='#8fb0d8';else col='#2a6fc4';}
        const k=lv>=1&&i>=96?Math.min(1,Math.max(0,lvT*3-(i-96)*.3)):1;ctx.save();ctx.fillStyle=col;rr(ctx,x+2,y+2,cell-4,cell-4,Math.max(3,cell*.18));ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.35)';rr(ctx,x+4,y+4+Math.max(0,Math.sin(t*2.4+i*.35))*1.5,cell-8,Math.max(2,cell*.12),2);ctx.fill();ctx.restore();}
      ctx.save();ctx.strokeStyle=INK;ctx.lineWidth=2.5;rr(ctx,x0-6,y0-6,cell*10+12,cell*10+12,12);ctx.stroke();ctx.restore();
      if(lv>=1){const lx=x0+cell*10+44;[['#2a6fc4','海水','约 96.5 份'],['#8fb0d8','咸水湖等','约 1 份'],['#bfe9ff','淡水','约 2.5 份']].forEach(([c,n,v],k)=>{const y=y0+cell*2+k*cell*2.6;
        ctx.fillStyle=c;rr(ctx,lx,y-14,28,28,6);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();txt(ctx,n,lx+42,y-6,{size:20,weight:700,align:'left'});txt(ctx,v,lx+42,y+18,{size:16,col:DIM,weight:700,align:'left'});});}}
    else if(lv===2){// 淡水放大：横向条
      const bx=w*.1,bw=w*.8,by=(top+bot)/2-30,bh=60,ice=bw*.69*q,rest=bw*.31*q;
      sticker(ctx,bx-6,by-6,bw+12,bh+12,{r:16,sh:5});ctx.save();rr(ctx,bx,by,bw,bh,10);ctx.clip();
      ctx.fillStyle='#e6f3fb';ctx.fillRect(bx,by,ice,bh);for(let k=0;k<14;k++){const x=bx+((k*53+t*12)%Math.max(1,ice));ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.moveTo(x,by+bh*.3);ctx.lineTo(x+8,by+bh*.55);ctx.lineTo(x,by+bh*.8);ctx.lineTo(x-8,by+bh*.55);ctx.fill();}
      ctx.fillStyle='#5cb8f0';ctx.fillRect(bx+ice,by,rest,bh);ctx.fillStyle='#1fb39f';ctx.fillRect(bx+ice,by,rest*.12,bh);ctx.restore();
      if(q>=1){txt(ctx,'冰川、永久积雪等（难以利用）',bx+ice/2,by+bh+40,{size:20,weight:700});
        callout(ctx,bx+ice+rest*.06,by-4,bx+ice+rest*.06,by-46,'其中可利用的只是一小部分',{col:'#1f9d6b',size:19});}}
    else{// 我国：人均 1/4、南多北少
      const cy=(top+bot)/2+40,cx=w*.27;for(let k=0;k<4;k++)person(ctx,cx-90+k*60,cy,40,k===0?'#5cb8f0':'#ffffff');
      txt(ctx,'人均水量 ≈ 世界人均的 1/4',cx,cy+50,{size:20,weight:700,col:'#e69500'});txt(ctx,'（世界人均 = 4 个小人，我国 = 1 个）',cx,cy+80,{size:15,col:DIM,weight:700});
      [['北方',w*.62,.25],['南方',w*.82,.8]].forEach(([n,x,lvq])=>{beaker(ctx,x,cy+20,120,180,{lv:lvq*q*.92,col:'rgba(92,184,240,.75)'});txt(ctx,n,x,cy+48,{size:20,weight:700});});
      txt(ctx,'分布：南多北少',w*.72,cy-196,{size:20,weight:700,col:'#1f9fd6'});}
    txt(ctx,`第 ${lv+1} / 4 层`,w-64,h-32,{size:15,col:FAINT,weight:700});}
  function callout(ctx,x,y,tx,ty,s,{col=INK,size=17}={}){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,4,0,TAU);ctx.fill();
    txt(ctx,s,tx,ty-14,{size,col,weight:700});ctx.restore();}
  const qp=qPanel($('#rsQ'),QB.res,{src:'水资源'});
  $('#rsReset').onclick=()=>{lv=0;lvT=0;qp.reset();};
  return{tick};})();

/* ================= 4 净水工厂：按顺序装流水线，再看水一站站变清 ================= */
S.pure=(()=>{const cv=$('#cvPure');let t=0,slots=[null,null,null,null,null],stack=[],done=false,ok=false,flowT=-1,bad=-1;const G={};
  const ST=[['加絮凝剂','明矾使悬浮杂质凝聚'],['沉降','较大颗粒沉到底部'],['过滤','除去不溶性杂质'],['吸附','吸附色素、异味'],['投药消毒','杀菌（化学变化）']];
  const tray=$('#puTray');
  function place(i,k){if(done)return;const j=slots.indexOf(k);if(j>=0)slots[j]=null;if(slots[i]!=null)stack=stack.filter(x=>x!==slots[i]);slots[i]=k;stack=stack.filter(x=>x!==k);stack.push(k);sfx8('coin');renderTray();}
  function renderTray(){const order=[3,0,4,2,1].filter(i=>!slots.includes(i));
    tray.innerHTML=order.map(i=>`<button class="mcard" data-i="${i}">${ST[i][0]}</button>`).join('')||'<span class="hint">都装好了，点“提交流程”</span>';
    $$('.mcard',tray).forEach(b=>{const k=+b.dataset.i;b.onclick=()=>{const e=slots.indexOf(null);if(e>=0)place(e,k);};
      DRAG.make(b,{drop:(tg,cx,cy)=>{if(tg!==cv||!G.xs)return false;const[x]=DRAG.cvPt(cv,cx,cy);let best=-1,bd=1e9;G.xs.forEach((gx,i)=>{const d=Math.abs(gx-x);if(d<bd){bd=d;best=i;}});if(best<0||bd>G.bw)return false;place(best,k);return true;}});});}
  $('#puUndo').onclick=()=>{if(done||!stack.length)return;const k=stack.pop();slots[slots.indexOf(k)]=null;sfx8('blip');renderTray();};
  canvasUI(cv,{hots:()=>G.xs&&!done?G.xs.map((gx,i)=>({hit:(x,y)=>slots[i]!=null&&Math.abs(x-gx)<G.bw/2&&y>G.ty&&y<G.ty+G.th,act:()=>{const k=slots[i];slots[i]=null;stack=stack.filter(x=>x!==k);sfx8('blip');renderTray();}})):[]});
  $('#puSub').onclick=()=>{if(done)return;if(slots.includes(null)){FX.burst(innerWidth/2,innerHeight/2,6,[CA]);sfx('bad');return;}done=true;bad=slots.findIndex((v,i)=>v!==i);ok=bad<0;flowT=0;const tm=TEAM.cur;
    if(ok){teamAdd(5,tm);sfx8('win');}else{sfx8('jam');VARS.arm($('[data-id="pure"] .hd h2'),{v:QB.pureTask},'净水流水线');}
    setTimeout(()=>{if(ok)FX.confetti();},3200);teamNext();};
  // 流到第 i 个位置（0 取水口，1–5 工位，6 用户）时水的浑浊度和色素
  const TURB=[1,.85,.5,.1,0,0,0],TINT=[.35,.35,.35,.35,0,0,0];
  function decor(ctx,k,x,y,w,h,wet,lvTop){const cx=x+w/2,bot=y+h-6,R=rng(k*31+7);
    if(k===0){// 絮凝剂（明矾）：上方药瓶滴入，水中出现絮状团块
      ctx.save();ctx.fillStyle='#ffffff';rr(ctx,cx-19,y-50,38,34,7);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#c9d3e3';rr(ctx,cx-8,y-60,16,10,3);ctx.fill();ctx.stroke();txt(ctx,'明矾',cx,y-33,{size:13,weight:700});ctx.restore();
      if(wet){for(let j=0;j<2;j++){const dy=((t*80+j*30)%46);drop(ctx,cx,y-12+dy,3,'rgba(255,255,255,.95)');}for(let j=0;j<6;j++){const fx=x+12+R()*(w-24),fy=lvTop+14+((R()*(h-40)+t*10)%Math.max(10,bot-lvTop-24));grain(ctx,fx,fy,5+R()*3,j+3,'#9a7a4a');}}}
    else if(k===1){if(wet){const m=Math.min(18,6+t*4);ctx.save();ctx.fillStyle='#8a6a43';ctx.beginPath();ctx.moveTo(x+4,bot);for(let i=0;i<=12;i++)ctx.lineTo(x+4+(w-8)*i/12,bot-m*(.75+.25*Math.sin(i*1.9)));ctx.lineTo(x+w-4,bot);ctx.fill();ctx.restore();
        for(let j=0;j<5;j++)grain(ctx,x+10+R()*(w-20),lvTop+20+((t*16+j*40)%Math.max(10,bot-lvTop-40)),3+R()*2,j,'#8a6a43');}}
    else if(k===2){// 过滤层：上层细沙、下层小石子
      const sy=y+h*.55;ctx.save();ctx.fillStyle='#e8cf8f';ctx.fillRect(x+4,sy,w-8,16);ctx.fillStyle='#b8995a';for(let i=0;i<26;i++)ctx.fillRect(x+6+R()*(w-12),sy+2+R()*12,2,2);
      for(let i=0;i<7;i++)ball(ctx,x+10+i*((w-20)/6),sy+24,6,'#9aa3b5',{lw:1});ctx.restore();if(wet)for(let j=0;j<4;j++)grain(ctx,x+10+j*(w-20)/3,sy-4,3,j,'#8a6a43');}
    else if(k===3){// 活性炭层：黑色颗粒；色素分子被吸住
      const sy=y+h*.5;for(let i=0;i<14;i++)grain(ctx,x+8+(i%7)*((w-16)/6),sy+(i>6?12:2),6,i,'#2e3239');
      if(wet&&t%2<1.2)for(let j=0;j<3;j++){const p=Math.min(1,(t%2)/1.2);pigmentMol(ctx,x+14+j*(w-28)/2,lvTop+20+(sy-lvTop-20)*p,4);}}
    else if(k===4){// 消毒剂：药瓶滴入，细菌被杀灭
      ctx.save();ctx.fillStyle='#e6f7ef';rr(ctx,cx-19,y-50,38,34,7);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#1fb39f';rr(ctx,cx-8,y-60,16,10,3);ctx.fill();ctx.stroke();txt(ctx,'消毒剂',cx,y-33,{size:12,weight:700});ctx.restore();
      if(wet){for(let j=0;j<2;j++){const dy=((t*80+j*30)%46);drop(ctx,cx,y-12+dy,3,'rgba(31,179,159,.9)');}const fade=Math.max(0,1-flowT*.15);ctx.save();ctx.globalAlpha=fade;for(let j=0;j<3;j++)bacterium(ctx,x+16+j*(w-32)/2,lvTop+30+j*16,14,j,t);ctx.restore();}}}
  function tick(dt){t+=dt;if(flowT>=0)flowT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const n=7,mx=18,step=(w-mx*2)/n,bw=Math.min(118,step*.74),ty=150,th=Math.max(200,h-ty-230),py=ty+th-26;
    G.xs=[1,2,3,4,5].map(i=>mx+i*step+step/2);G.bw=bw;G.ty=ty;G.th=th;
    hand(ctx,done?(ok?'流程正确！水一站站变清了':'顺序不对：红框处装错了'):'把下面的工序卡片拖到水箱上（或点卡片按顺序装入）',w/2,40,{size:22,col:done?(ok?OKC:BADC):INK});
    const reach=flowT<0?-1:Math.min(n,flowT*1.3);
    // 管道：只连接相邻水箱（画在水箱之间）
    for(let i=0;i<n-1;i++){const x1=mx+i*step+step/2+bw/2,cu=mx+(i+1)*step+step/2,pts=i===n-2?[[x1,py],[cu-60,py],[cu-60,ty+29],[cu-50,ty+29]]:[[x1,py],[cu-bw/2,py]];
      ctx.save();ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=14;ctx.beginPath();pts.forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.strokeStyle='#dfe7f2';ctx.lineWidth=9;ctx.stroke();ctx.restore();
      if(reach>i+.5)stream(ctx,pts,waterCol(TURB[i],{tint:TINT[i]}),6,t);}
    for(let i=0;i<n;i++){const cx=mx+i*step+step/2,x=cx-bw/2;const isWrong=done&&!ok&&i>=1&&i<=5&&slots[i-1]!==i-1;const k=i>=1&&i<=5?slots[i-1]:null;
      const lim=ok?i:Math.min(i,bad>=0?bad:i),turb=TURB[lim],tint=TINT[lim];const lvl=reach>=i?Math.min(1,(reach-i)*1.3):0;
      if(i===0){// 取水口：河水
        ctx.save();rr(ctx,x,ty,bw,th,14);ctx.fillStyle=GL_F;ctx.fill();ctx.clip();ctx.fillStyle=waterCol(1,{tint:.35});ctx.fillRect(x,ty+30,bw,th);for(let j=0;j<7;j++)grain(ctx,x+12+(j*29)%(bw-20),ty+60+(j*37)%(th-80),4+j%3,j);
          bacterium(ctx,x+bw*.35,ty+th*.55,14,.4,t);odorMol(ctx,x+bw*.7,ty+th*.45,4,t);ctx.restore();ctx.save();rr(ctx,x,ty,bw,th,14);ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.stroke();ctx.restore();
        pill(ctx,'取水口',cx,ty-74,{size:16,fill:'#e8eef8'});continue;}
      if(i===n-1){// 用户：水龙头 + 水杯
        ctx.save();ctx.fillStyle=metal(ctx,0,ty+20,0,ty+40);rr(ctx,cx-50,ty+20,70,18,6);ctx.fill();rr(ctx,cx+6,ty+20,18,48,6);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;rr(ctx,cx-50,ty+20,70,18,6);ctx.stroke();rr(ctx,cx+6,ty+20,18,48,6);ctx.stroke();ctx.restore();
        if(lvl>0)stream(ctx,[[cx+15,ty+70],[cx+15,ty+th-60]],'rgba(92,184,240,.9)',5,t);
        beaker(ctx,cx+15,ty+th,74,90,{lv:lvl*.7,col:waterCol(TURB[ok?6:Math.min(6,bad)],{tint:TINT[ok?6:Math.min(6,bad)]})});pill(ctx,'用户',cx,ty-74,{size:16,fill:'#e8eef8'});continue;}
      // 工位水箱
      const empty=k==null;ctx.save();rr(ctx,x,ty,bw,th,14);ctx.fillStyle=isWrong?'#fdeaea':empty?'rgba(255,255,255,.7)':GL_F;ctx.fill();
      if(lvl>0){ctx.save();rr(ctx,x,ty,bw,th,14);ctx.clip();const top=ty+th*(1-.82*lvl);ctx.fillStyle=waterCol(turb,{tint});ctx.fillRect(x,top,bw,th);ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=2;ctx.beginPath();for(let xx=0;xx<=bw;xx+=6)ctx.lineTo(x+xx,top+Math.sin(xx*.15+t*3)*1.5);ctx.stroke();ctx.restore();}
      if(empty){ctx.setLineDash([8,7]);ctx.strokeStyle=FAINT;ctx.lineWidth=2.5;rr(ctx,x,ty,bw,th,14);ctx.stroke();ctx.setLineDash([]);txt(ctx,'拖到这里',cx,ty+th/2,{size:15,col:FAINT,weight:700});}
      else{decor(ctx,k,x,ty,bw,th,lvl>0&&(ok||bad<0||i-1<bad),ty+th*(1-.82*Math.max(lvl,.01)));ctx.strokeStyle=isWrong?BADC:GL_S;ctx.lineWidth=isWrong?4:2.4;rr(ctx,x,ty,bw,th,14);ctx.stroke();glassHi(ctx,x+bw-12,ty+16,x+bw-12,ty+th-16,4,.7);}
      ctx.restore();
      pill(ctx,empty?`第 ${i} 步`:ST[k][0],cx,ty-74,{size:16,fill:empty?'#ffffff':isWrong?'#fdeaea':'#fff6d6',col:empty?FAINT:INK});
      if(done&&!ok&&slots[i-1]!==i-1)txt(ctx,'应为：'+ST[i-1][0],cx,ty+th+26,{size:16,col:BADC,weight:700});
      if(done&&ok&&reach>=i)txt(ctx,ST[i-1][1],cx,ty+th+26,{size:13.5,col:DIM,weight:700});}
    if(done&&ok&&reach>=n)txt(ctx,'得到的自来水仍含可溶性杂质，是混合物',w/2,ty+th+62,{size:18,col:'#1f7fd6',weight:700});}
  const qp=qPanel($('#puQ'),QB.pure,{src:'水的净化'});
  $('#puReset').onclick=()=>{VARS.disarm($('[data-id="pure"] .hd h2'));slots=[null,null,null,null,null];stack=[];done=false;ok=false;flowT=-1;bad=-1;renderTray();qp.reset();};
  renderTray();
  notes('pure','水的净化',['自来水厂：取水 → 加絮凝剂 → 沉降 → 过滤 → 吸附 → 投药消毒 → 配水。','过滤：一贴二低三靠，玻璃棒<mark>引流</mark>。','活性炭<mark>吸附</mark>色素和异味（物理变化）；投药消毒是<mark>化学变化</mark>。','净化程度：沉降 &lt; 过滤 &lt; 吸附 &lt; <mark>蒸馏</mark>；用<mark>肥皂水</mark>区分硬水和软水。'],
    '滤液浑浊：滤纸破损、液面高于滤纸边缘、烧杯不干净 → 查明原因后重新过滤。',
    (ctx,w,h)=>{const cx=w/2,top=40;ctx.strokeStyle=PEN.ink;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx-70,top);ctx.lineTo(cx+70,top);ctx.lineTo(cx+10,top+90);ctx.lineTo(cx+10,top+150);ctx.lineTo(cx-10,top+150);ctx.lineTo(cx-10,top+90);ctx.closePath();ctx.stroke();
      ctx.strokeStyle=PEN.blue;ctx.beginPath();ctx.moveTo(cx-60,top+6);ctx.lineTo(cx+60,top+6);ctx.lineTo(cx,top+80);ctx.closePath();ctx.stroke();
      ctx.strokeStyle=PEN.red;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-120,top-30);ctx.lineTo(cx-40,top+30);ctx.stroke();txt(ctx,'玻璃棒引流',cx-120,top-44,{size:16,weight:700,col:PEN.red});
      txt(ctx,'一贴：滤纸紧贴漏斗内壁',cx,top+180,{size:15,weight:700,col:PEN.ink});txt(ctx,'二低：滤纸边缘低于漏斗口，液面低于滤纸边缘',cx,top+206,{size:15,weight:700,col:PEN.ink});
      txt(ctx,'三靠：烧杯靠玻璃棒，玻璃棒靠三层滤纸，漏斗下端靠烧杯内壁',cx,top+232,{size:14,weight:700,col:PEN.ink});});
  return{tick};})();
