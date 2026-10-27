/* ================= 1 封面：街机标题画面 ================= */
S.cover=(()=>{const cv=$('#cvCover');let t=0,drops=[];
  function tick(dt){t+=dt;const{ctx,w,h,g,W,H,P,flush}=pxStage(cv,4);
    // 浮空石台 + 水面倒影
    const gy=Math.round(H*.72);pr(g,W*.06,gy,W*.88,3,'#1f2a44');pr(g,W*.07,gy+3,W*.86,5,'#ffd23f');pr(g,W*.09,gy+8,W*.82,3,'#f0b400');
    for(let x=Math.round(W*.08);x<W*.92;x+=6)pr(g,x,gy,1,3,'#1f2a44');
    // 上升的水滴
    if(Math.random()<dt*6)drops.push({x:Math.random()*W,y:H+4,v:8+Math.random()*16,s:Math.random()<.3?2:1});
    drops=drops.filter(d=>{d.y-=d.v*dt;pr(g,d.x,d.y,d.s,d.s+1,'#5cc8f0');if(d.s>1)pr(g,d.x,d.y-1,1,1,'#ffffff');return d.y>-4;});
    flush();
    // 两名角色（世界坐标 × P）
    const s=Math.max(3,Math.floor(Math.min(w/150,h/110)));const fy=gy*P;
    drawHero(ctx,'fire','idle',t,w*.27,fy,s,false);drawHero(ctx,'water','idle',t+.4,w*.73,fy,s,true);
    // VS 闪烁 + 名牌
    const k=(Math.sin(t*6)>0);ptxt(ctx,'VS',w*.5,fy-h*.22,{size:Math.round(h*.14),col:k?'#ffd23f':'#ff6fa8',sh:'#1f2a44',font:FNUM,weight:900,d:5});
    [['fire','红队 · 炎刃',w*.27,'#e5484d'],['water','蓝队 · 澜音',w*.73,'#1f9fd6']].forEach(([_,n,x,c])=>{ptxt(ctx,n,x,fy+P*16,{size:26,col:c});});
    if((t%1.2)<.8)ptxt(ctx,'PRESS START',w*.5,h-30,{size:20,col:'#55617f',font:FNUM,weight:900});}
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
  function deal(){cards=[...NODES.map(n=>n[3]),...DECOY].sort(()=>Math.random()-.5);fill=NODES.map(()=>null);pick=null;done=false;render();setSt(st,'','先点卡片，再点空格；点已填的空格可取回。有 4 张是干扰卡。');}
  function render(){grid.innerHTML=TOP.map((tp,k)=>`<div class="mcol" style="--tc:${TC[k]}"><h4>${tp}</h4>${NODES.map((n,i)=>n[0]!==k?'':`<div class="mnode"><b>${n[1]}</b><span>${n[2]}<button class="slot${fill[i]!==null?' on':''}${done?(fill[i]===n[3]?' ok':' no'):''}" data-i="${i}">${fill[i]??'　　'}</button>${n[4]}</span>${done&&fill[i]!==n[3]?`<em class="fix">${n[3]}</em>`:''}</div>`).join('')}</div>`).join('');
    const used=fill.filter(x=>x!==null);const left=cards.slice();used.forEach(u=>{const j=left.indexOf(u);if(j>=0)left.splice(j,1);});
    tray.innerHTML=left.map((c,j)=>`<button class="mcard${pick===c?' sel':''}" data-c="${c}">${c}</button>`).join('');
    $$('.mcard',tray).forEach(b=>b.onclick=()=>{if(done)return;pick=pick===b.dataset.c?null:b.dataset.c;sfx8('select');render();});
    $$('.slot',grid).forEach(b=>b.onclick=()=>{if(done)return;const i=+b.dataset.i;if(fill[i]!==null){fill[i]=null;sfx8('blip');}else if(pick){fill[i]=pick;pick=null;sfx8('coin');}render();});}
  $('#mpSub').onclick=()=>{if(done)return;if(fill.some(x=>x===null)){setSt(st,'warn',`还有 ${fill.filter(x=>x===null).length} 个空格没填`);return;}done=true;const tm=TEAM.cur,n=fill.filter((x,i)=>x===NODES[i][3]).length;render();
    if(n===NODES.length){teamAdd(5,tm);sfx8('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部放对 +5</b>　四张干扰卡：“氢气和氧气”“2∶1”“过滤”“单质”。`);}
    else{sfx8('jam');setSt(st,'bad',`<b>${tname(tm)}放对 ${n} / ${NODES.length}，不加分</b>　红框处的正确答案写在下面。`);VARS.arm(st,{v:QB.map},'知识地图');}teamNext();};
  $('#mpReset').onclick=()=>{VARS.disarm(st);deal();};deal();
  return{};})();

/* ================= 3 水资源：100 份水逐层拆开 ================= */
S.res=(()=>{const cv=$('#cvRes');let t=0,lv=0,lvT=0;
  const LV=[['地球上的水，看成 100 份',''],['海水约 96.5 份，淡水只有约 2.5 份','咸水湖等约 1 份'],['淡水里大部分是冰川和永久积雪，难以利用','可利用的淡水不到总水量的 1%'],['我国：水资源总量居世界第 6 位','人均水量约为世界人均的 1/4，分布南多北少']];
  $('#rsNext').onclick=()=>{if(lv<3){lv++;lvT=0;sfx8('blip');}};$('#rsBack').onclick=()=>{lv=0;lvT=0;sfx8('select');};
  function tick(dt){t+=dt;lvT+=dt;const{ctx,w,h,g,W,H,P,flush}=pxStage(cv,4);
    const titleY=12;
    if(lv<=1){// 10×10 方块，每块 = 1 份
      const cell=Math.floor(Math.min((W-20)/10,(H-56)/10)),x0=Math.round(W/2-cell*5),y0=Math.round(H/2-cell*5)+4;
      for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=x0+c*cell,y=y0+r*cell;
        let col='#36a0ff',hi='#7dc8ff';if(lv>=1){if(i>=97){col='#5cc8f0';hi='#e9fdff';}else if(i===96){col='#2f5a9e';hi='#4f7ec8';}else{col='#1d3f9a';hi='#2f5ec8';}}
        const wv=Math.round(Math.sin(t*3+i*.4));pr(g,x+1,y+1,cell-2,cell-2,col);pr(g,x+1,y+1+Math.max(0,wv),cell-2,1,hi);}
      // 半块：96.5 份海水，标注
      flush();if(lv>=1){ptxt(ctx,'■ 海水',x0*P-70,(y0+2*cell)*P,{size:18,col:'#4f8bff'});ptxt(ctx,'■ 淡水',(x0+10*cell)*P+64,(y0+9.5*cell)*P,{size:18,col:'#5cc8f0'});ptxt(ctx,'■ 咸水湖等',(x0+10*cell)*P+80,(y0+8.5*cell)*P,{size:16,col:'#7ea6e8'});}}
    else if(lv===2){// 淡水放大：横向能量条
      const bx=Math.round(W*.12),bw=Math.round(W*.76),by=Math.round(H*.42),bh=14,q=Math.min(1,lvT*1.5);
      pbox(g,bx-3,by-3,bw+6,bh+6,'#ffffff','#1f2a44');const ice=Math.round(bw*.696*q);pr(g,bx,by,ice,bh,'#cfe8f7');pr(g,bx,by,ice,2,'#ffffff');
      pr(g,bx+ice,by,Math.round(bw*.304*q),bh,'#1f9d6b');pr(g,bx+ice,by,Math.round(bw*.304*q),2,'#b8ffb8');
      for(let k=0;k<6;k++){const x=bx+((t*20+k*40)%ice);pr(g,x,by+4+(k%3)*3,2,2,'#9fc4ea');}
      flush();ptxt(ctx,'冰川、永久积雪等（难以利用）',(bx+ice/2)*P,(by+bh+10)*P,{size:18,col:'#1f2a44',sh:null});ptxt(ctx,'其余（可利用的只是一小部分）',(bx+ice+bw*.15)*P,(by-8)*P,{size:22,col:'#1f9d6b'});}
    else{// 我国：人均 1/4、南多北少
      const cx=W*.3,cy=H*.52;for(let k=0;k<4;k++){const on=k===0;pbox(g,cx-34+k*18,cy-8,15,22,on?'#1f9fd6':'#e8eef8','#1f2a44',{notch:1});}
      // 南多北少：两只水箱（示意，不标数值）
      const q=Math.min(1,lvT*1.2),tanks=[['北方',W*.62,.3],['南方',W*.8,.85]];const tb=Math.round(H*.74),th=Math.round(H*.44);
      tanks.forEach(([n,x,lvq])=>{pbox(g,x-13,tb-th,26,th,'#ffffff','#1f2a44',{notch:1,shadow:false});const hh=Math.round((th-4)*lvq*q);pr(g,x-11,tb-2-hh,22,hh,'#7cc8f0');
        for(let k=0;k<22;k+=4)pr(g,x-11+k,tb-2-hh+Math.round(Math.sin(t*4+k*.5+x)),3,1,'#ffffff');});
      flush();ptxt(ctx,'人均 ≈ 世界人均的 1/4',cx*P,(cy+24)*P,{size:20,col:'#e69500'});tanks.forEach(([n,x])=>ptxt(ctx,n,x*P,(tb+8)*P,{size:20,col:'#1f2a44',sh:null}));
      ptxt(ctx,'分布：南多北少',W*.71*P,(tb-th-10)*P,{size:20,col:'#1f9fd6',sh:null});}
    ptxt(ctx,LV[lv][0],w/2,titleY*P+6,{size:24,col:'#e69500'});if(LV[lv][1])ptxt(ctx,LV[lv][1],w/2,titleY*P+40,{size:17,col:'#55617f',font:FNUM,weight:700,sh:null});
    ptxt(ctx,`第 ${lv+1} / 4 层`,w-70,h-28,{size:15,col:'#8a95ad',font:FNUM,weight:700,sh:null});}
  const qp=qPanel($('#rsQ'),QB.res,{src:'水资源'});
  $('#rsReset').onclick=()=>{lv=0;lvT=0;qp.reset();};
  return{tick};})();

/* ================= 4 净水工厂：按顺序装流水线，再看水一站站变清 ================= */
S.pure=(()=>{const cv=$('#cvPure');let t=0,seq=[],done=false,ok=false,flowT=-1,bad=-1;
  const ST=[['加絮凝剂','明矾吸附悬浮杂质'],['沉降','较大颗粒沉到底部'],['过滤','除去不溶性杂质'],['吸附','吸附色素、异味'],['投药消毒','杀菌（化学变化）']];
  const tray=$('#puTray');
  function renderTray(){const left=ST.map((s,i)=>i).filter(i=>!seq.includes(i));const order=[3,0,4,2,1].filter(i=>left.includes(i));
    tray.innerHTML=order.map(i=>`<button class="mcard" data-i="${i}">${ST[i][0]}</button>`).join('')||'<span class="hint">都装好了，点“提交流程”</span>';
    $$('.mcard',tray).forEach(b=>b.onclick=()=>{if(done)return;seq.push(+b.dataset.i);sfx8('coin');renderTray();});}
  $('#puUndo').onclick=()=>{if(done||!seq.length)return;seq.pop();sfx8('blip');renderTray();};
  $('#puSub').onclick=()=>{if(done)return;if(seq.length<5){FX.burst(innerWidth/2,innerHeight/2,6,[CA]);sfx('bad');return;}done=true;bad=seq.findIndex((v,i)=>v!==i);ok=bad<0;flowT=0;const tm=TEAM.cur;
    if(ok){teamAdd(5,tm);sfx8('win');}else{sfx8('jam');VARS.arm($('[data-id="pure"] .hd h2'),{v:QB.pureTask},'净水流水线');}
    setTimeout(()=>{if(ok)FX.confetti();},2600);teamNext();};
  // 每一站水的颜色（浑浊 → 清澈）
  const WC=['#8a6a3c','#8a6a3c','#9a8a5c','#7ab0c0','#6ad0f0','#1f9fd6','#1f9fd6'];
  function deco(g,k,x,ty,bw,th,wet){const cx=x+bw/2,bot=ty+th-3;
    if(k===0){pr(g,cx-3,ty-11,6,8,'#b9c3d6');pr(g,cx-1,ty-13,2,2,'#55617f');pr(g,cx-2,ty-8,4,2,'#ffffff');// 絮凝剂瓶
      if(wet){for(let j=0;j<2;j++)pr(g,cx,ty-2+((t*18+j*6)%12),1,2,'#b9c3d6');for(let j=0;j<4;j++){const fx=x+4+((j*9+Math.floor(t*3))%(bw-8)),fy=ty+8+((j*7+t*4)%(th-14));pr(g,fx,fy,3,2,'#6b4a22');pr(g,fx+1,fy-1,1,1,'#9a7a4a');}}}
    else if(k===1){if(wet){const m=Math.min(4,1+Math.floor(t))||1;pr(g,x+3,bot-m+1,bw-6,m,'#5a3a1a');for(let j=0;j<5;j++)pr(g,x+4+j*((bw-8)/5),bot-m+((j*3)%2),2,1,'#7a5a2a');
        for(let j=0;j<3;j++)pr(g,x+5+j*7,ty+6+((t*6+j*9)%(th-12)),2,2,'#6b4a22');}}
    else if(k===2){const sy=ty+Math.round(th*.55);pr(g,x+3,sy,bw-6,4,'#d9b36c');for(let j=0;j<bw-8;j+=3)pr(g,x+4+j,sy+1+(j%2),1,1,'#a8813f');pr(g,x+3,sy+4,bw-6,3,'#8c8c9c');for(let j=0;j<bw-8;j+=4)pr(g,x+4+j,sy+5,2,1,'#5c5c6c');
      if(wet)for(let j=0;j<3;j++)pr(g,x+5+j*8,sy-2,2,2,'#6b4a22');}
    else if(k===3){const sy=ty+Math.round(th*.5);pr(g,x+3,sy,bw-6,6,'#1e1e26');for(let j=0;j<bw-8;j+=3)pr(g,x+4+j,sy+1+(j%3),1,1,'#5a5a6a');
      if(wet)for(let j=0;j<3;j++){const yy=sy-3-((t*10+j*4)%8);pr(g,x+6+j*6,yy,2,1,'#c08a2a');}}
    else if(k===4){pr(g,cx-3,ty-11,6,8,'#b8ffb8');pr(g,cx-1,ty-13,2,2,'#1f9d6b');pr(g,cx-2,ty-8,4,1,'#ffffff');
      if(wet){for(let j=0;j<2;j++)pr(g,cx,ty-2+((t*18+j*6)%12),1,2,'#b8ffb8');for(let j=0;j<4;j++){const bx=x+5+j*((bw-10)/4),yy=bot-((t*14+j*5)%(th-6));pr(g,bx,yy,1,1,'#ffffff');}}}}
  function tick(dt){t+=dt;if(flowT>=0)flowT+=dt;const{ctx,w,h,g,W,H,P,flush}=pxStage(cv,4);
    const n=7,x0=6,step=(W-12)/n,bw=Math.round(step*.78),th=Math.round(H*.34),ty=Math.round(H*.3),py=ty+th-8;
    // 管道（贴着水箱底部）
    pr(g,x0,py,W-12,4,'#c9d3e3');pr(g,x0,py,W-12,1,'#1f2a44');
    const reach=flowT<0?-1:Math.min(n,flowT*1.6);
    for(let i=0;i<n;i++){const x=Math.round(x0+i*step+(step-bw)/2);
      const isWrong=done&&!ok&&i>=1&&i<=5&&seq[i-1]!==i-1;const filled=i===0||i===n-1||seq[i-1]!=null;
      // 水流到这一站后的颜色
      const wc=reach>=i?(ok?WC[i]:WC[Math.min(i,bad>=0?bad:i)]):null;const lvl=reach>=i?Math.min(1,(reach-i)*1.6):0;
      if(i===0){// 取水口：河水
        pbox(g,x,ty,bw,th,'#ffffff','#55617f');const hh=th-10;pr(g,x+2,ty+th-2-hh,bw-4,hh,'#8a6a3c');
        for(let j=0;j<bw-6;j+=2)pr(g,x+3+j,ty+th-2-hh+Math.round(Math.sin(t*4+j*.6)),2,1,'#b89a6a');for(let j=0;j<5;j++)pr(g,x+4+((j*7+Math.floor(t*4))%(bw-8)),ty+th-6-j*3,2,2,'#5a3a1a');continue;}
      if(i===n-1){// 用户：水龙头 + 杯子
        pr(g,x+3,ty+4,bw-10,4,'#55617f');pr(g,x+bw-9,ty+4,4,9,'#55617f');pr(g,x+bw-10,ty+12,6,2,'#b9c3d6');pr(g,x+2,py-1,bw-4,5,'#c9d3e3');
        pbox(g,x+bw/2-8,ty+th-20,16,16,'#ffffff','#b9c3d6',{notch:1,shadow:false});
        if(lvl>0){pr(g,x+bw-8,ty+14,2,th-34,'#1f9fd6');const hh=Math.round(12*lvl);pr(g,x+bw/2-6,ty+th-6-hh,12,hh,'#1f9fd6');pr(g,x+bw/2-6,ty+th-6-hh,12,1,'#ffffff');}continue;}
      pbox(g,x,ty,bw,th,isWrong?'#fdeaea':filled?'#f7f9fd':'#ffffff',isWrong?'#e5484d':filled?'#1f2a44':'#c9d3e3');
      if(!filled){for(let j=0;j<3;j++)pr(g,x+bw/2-4+j*3,ty+th/2,1,1,'#c9d3e3');}
      if(lvl>0){const hh=Math.round((th-6)*lvl);pr(g,x+3,ty+th-3-hh,bw-6,hh,wc);pr(g,x+3,ty+th-3-hh,bw-6,1,'#ffffff');}
      if(filled)deco(g,seq[i-1],x,ty,bw,th,lvl>0&&(ok||bad<0||i-1<bad));
      // 流动的水珠
      if(reach>i&&reach<n)for(let j=0;j<2;j++)pr(g,x+bw+((t*30+j*5)%Math.max(2,step-bw)),py+1,2,2,WC[Math.min(i+1,6)]);}
    // 取水口到第一站之间的水珠
    if(reach>0&&reach<n)pr(g,x0+bw+((t*30)%Math.max(2,step-bw)),py+1,2,2,WC[1]);
    flush();
    for(let i=0;i<n;i++){const x=(x0+i*step+step/2)*P,label=i===0?'取水口':i===n-1?'用户':seq[i-1]!=null?ST[seq[i-1]][0]:'?';
      ptxt(ctx,label,x,(ty-20)*P,{size:label.length>3?17:19,col:i===0||i===n-1?'#55617f':label==='?'?'#8a95ad':'#e69500'});
      if(i>=1&&i<=5){ptxt(ctx,String(i),x,(ty+th+8)*P,{size:16,col:'#8a95ad',font:FNUM,weight:700,sh:null});
        if(done&&!ok&&seq[i-1]!==i-1)ptxt(ctx,'应为：'+ST[i-1][0],x,(ty+th+15)*P,{size:15,col:'#e5484d',font:FNUM,weight:700,sh:null});
        if(done&&ok&&reach>=i)ptxt(ctx,ST[i-1][1],x,(ty+th+15)*P,{size:13,col:'#55617f',font:FNUM,weight:700,sh:null});}}
    ptxt(ctx,done?(ok?'流程正确！水一站站变清了':'顺序不对：红框处装错了'):'把下面的工序按顺序装进流水线',w/2,30,{size:22,col:done?(ok?'#1f9d6b':'#e5484d'):'#e69500'});
    if(done&&ok&&reach>=n)ptxt(ctx,'得到的自来水仍含可溶性杂质，是混合物',w/2,(ty+th+24)*P,{size:18,col:'#5cc8f0',font:FNUM,weight:700,sh:null});}
  const qp=qPanel($('#puQ'),QB.pure,{src:'水的净化'});
  $('#puReset').onclick=()=>{VARS.disarm($('[data-id="pure"] .hd h2'));seq=[];done=false;ok=false;flowT=-1;bad=-1;renderTray();qp.reset();};
  renderTray();
  notes('pure','水的净化',['自来水厂：取水 → 加絮凝剂 → 沉降 → 过滤 → 吸附 → 投药消毒 → 配水。','过滤：一贴二低三靠，玻璃棒<mark>引流</mark>。','活性炭<mark>吸附</mark>色素和异味（物理变化）；投药消毒是<mark>化学变化</mark>。','净化程度：沉降 &lt; 过滤 &lt; 吸附 &lt; <mark>蒸馏</mark>；用<mark>肥皂水</mark>区分硬水和软水。'],
    '滤液浑浊：滤纸破损、液面高于滤纸边缘、烧杯不干净 → 查明原因后重新过滤。',
    (ctx,w,h)=>{const cx=w/2,top=40;ctx.strokeStyle=PEN.ink;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx-70,top);ctx.lineTo(cx+70,top);ctx.lineTo(cx+10,top+90);ctx.lineTo(cx+10,top+150);ctx.lineTo(cx-10,top+150);ctx.lineTo(cx-10,top+90);ctx.closePath();ctx.stroke();
      ctx.strokeStyle=PEN.blue;ctx.beginPath();ctx.moveTo(cx-60,top+6);ctx.lineTo(cx+60,top+6);ctx.lineTo(cx,top+80);ctx.closePath();ctx.stroke();
      ctx.strokeStyle=PEN.red;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-120,top-30);ctx.lineTo(cx-40,top+30);ctx.stroke();txt(ctx,'玻璃棒引流',cx-120,top-44,{size:16,weight:700,col:PEN.red});
      txt(ctx,'一贴：滤纸紧贴漏斗内壁',cx,top+180,{size:15,weight:700,col:PEN.ink});txt(ctx,'二低：滤纸边缘低于漏斗口，液面低于滤纸边缘',cx,top+206,{size:15,weight:700,col:PEN.ink});
      txt(ctx,'三靠：烧杯靠玻璃棒，玻璃棒靠三层滤纸，漏斗下端靠烧杯内壁',cx,top+232,{size:14,weight:700,col:PEN.ink});});
  return{tick};})();
