/* ================= 4 数字的意义：把数字拖到元素符号的左边、右下角、右上角 ================= */
S.digit=(()=>{const cv=$('#cvDigit');let t=0,base='H',coef=1,sub=1,chg='',warn='',warnT=0,popT=0;const G={};
  const BASES=['H','O','N','Cl','Na','Mg','H2O'];
  const NM={H:'氢',O:'氧',N:'氮',Cl:'氯',Na:'钠',Mg:'镁'};
  const GAS={H2:['氢气','氢分子'],O2:['氧气','氧分子'],N2:['氮气','氮分子'],Cl2:['氯气','氯分子'],O3:['臭氧','臭氧分子']};
  const ION={H:'+',Na:'+',Mg:'2+',Cl:'-',O:'2-'};const METAL=['Na','Mg'];
  const sym=()=>base==='H2O'?`${coef>1?coef:''}H2O`:`${coef>1?coef:''}${base}${sub>1?sub:''}${chg?'^'+chg:''}`;
  function setWarn(s){warn=s;warnT=3.2;sfx('bad');}
  function apply(slot,val){
    if(slot==='coef'){coef=+val;}
    else if(slot==='sub'){if(base==='H2O'){setWarn('水的化学式 H₂O 已经确定，右下角不能再改');return false;}
      if(chg){setWarn('本课只比较单个原子形成的离子，右上角有电荷时先清空它');return false;}
      if(METAL.includes(base)){setWarn(`${NM[base]}是金属，单质直接用元素符号 ${base} 表示，不写 ${base}₂`);return false;}
      if(!GAS[base+val]){setWarn(`不存在 ${base}${val==='2'?'₂':'₃'} 这种分子`);return false;}sub=+val;}
    else if(slot==='chg'){if(base==='H2O'){setWarn('水分子不带电，不写电荷');return false;}if(sub>1){setWarn('本课只比较单个原子形成的离子，先把右下角清空');return false;}
      const v=val.replace('−','-');if(ION[base]!==v){setWarn(`${NM[base]}离子应写作 ${base}${ION[base].replace('-','⁻').replace('+','⁺').replace('2','²')}`);return false;}chg=v;}
    popT=0;sfx('drop');return true;}
  function setBase(b){base=b;sub=1;chg='';popT=0;sfx('click');}
  function preset(s){const m=/^(\d?)(H2O|[A-Z][a-z]?)(\d?)(\^.+)?$/.exec(s);base=m[2];coef=m[1]?+m[1]:1;sub=m[3]?+m[3]:1;chg=m[4]?m[4].slice(1):'';popT=0;sfx('whoosh');}
  // 工具栏：教材“思考与讨论”的几个符号 + 离子
  const PRE=['H','2H','H2','2H2','2H2O','Mg^2+','2Mg^2+'];
  $('#diBar').innerHTML=PRE.map(s=>`<button class="btn" data-p="${s}"><span class="fm">${fm(s)}</span></button>`).join('')+'<span class="sep"></span><button class="btn" id="diClear">清空</button>';
  $$('#diBar [data-p]').forEach(b=>b.onclick=()=>preset(b.dataset.p));$('#diClear').onclick=()=>{coef=1;sub=1;chg='';popT=0;sfx('click');};
  $('#diReset').onclick=()=>{preset('H');$('#diRedo').click();};
  // 数字卡
  const TILES=[['2','2'],['3','3'],['+','+'],['2+','2+'],['−','-'],['2−','2-']];
  const tileXY=i=>[G.w*.5+(i-2.5)*78,G.ty];
  const slotAt=(x,y)=>['coef','sub','chg'].find(k=>G[k]&&x>G[k][0]-14&&x<G[k][0]+G[k][2]+14&&y>G[k][1]-14&&y<G[k][1]+G[k][3]+14);
  const ui=canvasUI(cv,{tools:()=>G.w?TILES.map(([lab,val],i)=>{const[x,y]=tileXY(i);return{id:val,x,y,r:30,draw:(c,x2,y2)=>{const isC=/[+-]/.test(val);sticker(c,x2-28,y2-26,56,52,12,isC?'#e9e3ff':'#fffbe6');txt(c,lab,x2,y2+1,{size:26,weight:700,col:isC?GRAPE:INK});}};}):[],
    hots:()=>G.w?[...BASES.map((b,i)=>({hit:(x,y)=>Math.abs(x-G.bx(i))<38&&Math.abs(y-G.by)<22,act:()=>setBase(b)})),
      ...['coef','sub','chg'].map(k=>({hit:(x,y)=>G[k]&&x>G[k][0]&&x<G[k][0]+G[k][2]&&y>G[k][1]&&y<G[k][1]+G[k][3],act:()=>{if(k==='coef')coef=1;if(k==='sub'&&base!=='H2O')sub=1;if(k==='chg')chg='';popT=0;sfx('click');}}))]:[],
    onDrop:(id,x,y)=>{const sl=slotAt(x,y);if(!sl)return false;const isC=/[+-]/.test(id);if(isC&&sl!=='chg'){setWarn('电荷要写在右上角');return true;}if(!isC&&sl==='chg'){setWarn('右上角写电荷，比如 2+、−');return true;}apply(sl,id);return true;},
    onTap:id=>{const isC=/[+-]/.test(id);if(isC)apply('chg',id);else if(coef===1)apply('coef',id);else apply('sub',id);}});
  function meaning(){const c=coef,L=[];let micro=c>1;
    if(base==='H2O'){if(c===1)L.push(['宏观','表示水这种物质；表示水由氢元素和氧元素组成'],['微观','表示 1 个水分子；1 个水分子由 2 个氢原子和 1 个氧原子构成']);
      else L.push(['微观',`表示 ${c} 个水分子`],['微观','右下角的 2：每个水分子中含有 2 个氢原子']);}
    else if(chg){const nm=NM[base]+'离子',q=chg.replace('-','');const n=q.length>1?q[0]:'1',sign=chg.includes('+')?'正':'负';micro=true;
      L.push(['微观',c===1?`表示 1 个${nm}`:`表示 ${c} 个${nm}`],['微观',`右上角的 ${chg.replace('-','−')}：1 个${nm}带 ${n} 个单位${sign}电荷`]);}
    else if(sub>1){const[g,m]=GAS[base+sub];if(c===1)L.push(['宏观',`表示${g}这种物质；${g}由${NM[base]}元素组成`],['微观',`表示 1 个${m}；1 个${m}由 ${sub} 个${NM[base]}原子构成`]);
      else L.push(['微观',`表示 ${c} 个${m}`],['微观',`右下角的 ${sub}：每个${m}由 ${sub} 个${NM[base]}原子构成`]);}
    else{if(c===1){L.push(['宏观',`表示${NM[base]}元素${METAL.includes(base)?`；还表示${NM[base]}这种物质`:''}`],['微观',`表示 1 个${NM[base]}原子`]);}else L.push(['微观',`表示 ${c} 个${NM[base]}原子`]);}
    return{L,micro};}
  function particle(ctx,x,y,u,k){if(base==='H2O'){drawMol(ctx,'H2O',x,y,u);return;}
    if(sub>1){drawMol(ctx,base+sub,x,y,u);return;}
    const r=u*.42*ATOM[base][2]*(chg?(chg.includes('+')?.85:1.18):1);atomBall(ctx,x,y,r,base);
    if(chg){const s=chg.replace('-','−');sticker(ctx,x+r*.55,y-r-14,s.length*13+18,26,9,'#e9e3ff');txt(ctx,s,x+r*.55+(s.length*13+18)/2,y-r-1,{size:16,weight:700,col:GRAPE});}}
  function tick(dt){t+=dt;popT+=dt;if(warnT>0)warnT-=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;
    // 选择元素
    G.by=34;G.bx=i=>w*.5+(i-3)*86;txt(ctx,'选一个：',G.bx(0)-70,G.by,{size:15,weight:700,col:'#55617f'});
    BASES.forEach((b,i)=>{const on=b===base,x=G.bx(i);sticker(ctx,x-36,G.by-20,72,40,12,on?SUN:'#ffffff');fmDraw(ctx,b,x,G.by-2,22);});
    // 符号与三个位置
    const sy=Math.max(200,h*.3),size=118,bw=fmDraw(ctx,base,0,0,size,{measure:true}),cx=w*.5,left=cx-bw/2,right=cx+bw/2;
    G.coef=[left-96,sy-56,80,96];G.sub=[right+6,sy+8,66,62];G.chg=[right+6,sy-104,84,58];
    const slot=(k,val,col,lab,ly)=>{const[x,y,ww,hh]=G[k];ctx.save();ctx.setLineDash([7,6]);ctx.lineWidth=2.5;ctx.strokeStyle=col;rr(ctx,x,y,ww,hh,12);ctx.stroke();ctx.restore();
      if(val){const pop=Math.min(1,popT*4);ctx.save();ctx.translate(x+ww/2,y+hh/2);ctx.scale(.6+.4*ease(pop),.6+.4*ease(pop));txt(ctx,val,0,2,{size:k==='coef'?size*.75:size*.5,weight:700,col});ctx.restore();}
      txt(ctx,lab,x+ww/2+(k==='coef'?0:60),ly,{size:14,weight:700,col,align:k==='coef'?'center':'left'});};
    fmDraw(ctx,base==='H2O'?'H2O':base,cx,sy,size);
    slot('coef',coef>1?String(coef):'',CORAL,'粒子个数',G.coef[1]+G.coef[3]+20);
    if(base!=='H2O'){G.sub[2]=66;slot('sub',sub>1?String(sub):'',TEAL,'',0);slot('chg',chg?chg.replace('-','−'):'',GRAPE,'',0);
      txt(ctx,'← 1 个离子所带电荷',G.chg[0]+G.chg[2]+12,G.chg[1]+G.chg[3]/2,{size:14,weight:700,col:GRAPE,align:'left'});
      txt(ctx,'← 1 个分子中的原子个数',G.sub[0]+G.sub[2]+12,G.sub[1]+G.sub[3]/2,{size:14,weight:700,col:TEAL,align:'left'});}
    // 数字卡托盘
    G.ty=sy+150;
    if(warnT>0){ctx.globalAlpha=Math.min(1,warnT);sticker(ctx,w/2-270,G.ty-62,540,36,12,'#fdeaea');txt(ctx,warn,w/2,G.ty-44,{size:16,weight:700,col:BADC});ctx.globalAlpha=1;}
    else txt(ctx,'把数字卡拖到虚线框里（也可以直接点数字卡）；点虚线框可以清空',w*.5,G.ty-44,{size:14,weight:700,col:'#55617f'});
    ui.draw(ctx);
    // 下方：左边微观示意，右边意义
    const py=G.ty+44,pb=h-80,ph=pb-py,lw=w*.4;sticker(ctx,24,py,w-48,ph,18,'#f7f9fd');
    ctx.save();ctx.strokeStyle='#c9d3e3';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(24+lw,py+14);ctx.lineTo(24+lw,pb-14);ctx.stroke();ctx.restore();
    txt(ctx,'微观示意',44,py+18,{size:13,weight:700,col:'#55617f',align:'left'});
    const u=Math.min(50,ph*.32),n=coef,gap=Math.min(150,(lw-40)/Math.max(n,1));
    if(u>8)for(let i=0;i<n;i++){const x=24+lw/2+(i-(n-1)/2)*gap,y=py+ph/2+8;ctx.save();const k=clamp(popT*3-i*.25,0,1);ctx.translate(x,y);ctx.scale(ease(k)||.001,ease(k)||.001);particle(ctx,0,0,u,i);ctx.restore();}
    const{L,micro}=meaning();const mx=24+lw+28,my=py+Math.min(48,ph*.28);
    const fw=fmDraw(ctx,sym(),mx,my,40,{align:'left',cols:{coef:CORAL,sub:TEAL,sup:GRAPE}});
    if(micro){sticker(ctx,mx+fw+22,my-16,132,32,10,SUN);txt(ctx,'只有微观意义',mx+fw+88,my,{size:15,weight:700});}
    const lh=Math.min(40,(pb-my-30)/2);
    L.forEach(([lv,s],i)=>{const y=my+44+i*lh;sticker(ctx,mx,y-13,48,26,8,lv==='宏观'?'#ffe0d6':'#dff1fb');txt(ctx,lv,mx+24,y,{size:13,weight:700});
      const parts=s.split('；');parts.forEach((ps,j)=>txt(ctx,ps+(j<parts.length-1?'；':''),mx+60,y+j*20-(parts.length-1)*10,{size:parts.length>1?15:17,weight:700,align:'left'}));});}
  // 右侧题目：标红的“2”表示什么
  const OPT=['粒子的个数','1 个分子中某原子的个数','1 个离子所带的电荷数'];
  const Q=[['<u>2</u>N',0],['N<sub><u>2</u></sub>',1],['<u>2</u>H<sub>2</sub>O',0],['2H<sub><u>2</u></sub>O',1],['O<sup><u>2</u>−</sup>',2]];
  const box=$('#diQ'),st=$('#diSt');let pick={},done=false;
  function render(){box.innerHTML=`<div class="qkey">${OPT.map((o,k)=>`<span><b>${'ABC'[k]}</b>${o}</span>`).join('')}</div>`+Q.map((q,i)=>`<div class="qrow" data-i="${i}"><span class="fm">${q[0]}</span><span class="cs">${OPT.map((o,k)=>`<button data-k="${k}" aria-pressed="${pick[i]===k}">${'ABC'[k]}</button>`).join('')}</span></div>`).join('');
    $$('.qrow',box).forEach(r=>{const i=+r.dataset.i;$$('button',r).forEach(b=>b.onclick=()=>{if(done)return;pick[i]=+b.dataset.k;sfx('click');render();});});}
  render();
  $('#diSub').onclick=()=>{if(done)return;if(Object.keys(pick).length<Q.length){setSt(st,'warn','每一行都要选');return;}done=true;const tm=TEAM.cur;let bad=0;
    $$('.qrow',box).forEach(r=>{const i=+r.dataset.i,ok=pick[i]===Q[i][1];if(!ok)bad++;r.classList.add(ok?'right':'wrong');$$('button',r)[Q[i][1]].classList.add('ans');});
    if(!bad){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全对 +5</b>　左边：个数；右下角：1 个分子中的原子个数；右上角：1 个离子所带电荷。`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}错 ${bad} 处，不加分</b>　绿色字母是正确答案。`);}teamNext();};
  $('#diRedo').onclick=()=>{pick={};done=false;render();setSt(st,'','全对 +5 分');};
  return{tick};})();

/* ================= 5 分子工坊：拖原子搭分子，化学式实时生成 ================= */
S.lab=(()=>{const cv=$('#cvLab');let t=0,mode='free',ci=0,bench=[],done=false;const G={};
  const EL=['C','H','O','N'];
  const KNOWN={'H2':['H2','氢气','氢分子'],'O2':['O2','氧气','氧分子'],'N2':['N2','氮气','氮分子'],'O3':['O3','臭氧','臭氧分子'],'H2O1':['H2O','水','水分子'],'H2O2':['H2O2','过氧化氢','过氧化氢分子'],
    'C1O2':['CO2','二氧化碳','二氧化碳分子'],'C1O1':['CO','一氧化碳','一氧化碳分子'],'H3N1':['NH3','氨气','氨分子']};
  const CHAL=[['水','H2O'],['二氧化碳','CO2'],['过氧化氢','H2O2'],['氨气','NH3']];
  const counts=()=>{const c={};bench.forEach(a=>c[a.e]=(c[a.e]||0)+1);return c;};
  const key=()=>{const c=counts();return Object.keys(c).sort().map(k=>k+c[k]).join('');};
  const known=()=>KNOWN[key()];
  const rawFm=()=>{const c=counts();return['C','H','N','O'].filter(k=>c[k]).map(k=>k+(c[k]>1?c[k]:'')).join('');};
  function add(e,x,y){if(bench.length>=9){setSt($('#laSt'),'warn','工作台最多放 9 个原子');return;}const a=G.bc?{e,x:x??G.bc[0]+(Math.random()-.5)*60,y:y??G.bc[1]+(Math.random()-.5)*60}:{e,x:0,y:0};a.tx=a.x;a.ty=a.y;bench.push(a);sfx('pop');layout();panel();}
  function layout(){if(!G.bc)return;const k=known(),[cx,cy]=G.bc;
    if(k&&MOL[k[0]]){const tpl=MOL[k[0]].a.map(([e,x,y])=>({e,x:cx+x*82,y:cy+y*82,used:false}));bench.forEach(a=>{const s=tpl.find(p=>p.e===a.e&&!p.used);s.used=true;a.tx=s.x;a.ty=s.y;});}
    else{bench.forEach((a,i)=>{const ang=i/bench.length*TAU-Math.PI/2,r=bench.length>1?Math.min(130,40+bench.length*14):0;a.tx=cx+Math.cos(ang)*r;a.ty=cy+Math.sin(ang)*r;});}}
  const ui=canvasUI(cv,{tools:()=>G.w?EL.map((e,i)=>({id:e,x:G.tx,y:G.ty(i),r:40,on:bench.length<9,draw:(c,x,y)=>atomBall(c,x,y,e==='H'?24:32,e)})):[],
    hots:()=>bench.map((a,i)=>({hit:(x,y)=>Math.hypot(x-a.x,y-a.y)<30,act:()=>{bench.splice(i,1);sfx('click');layout();panel();}})),
    onDrop:(id,x,y)=>{if(!G.bc||Math.hypot(x-G.bc[0],y-G.bc[1])>G.br+20)return false;add(id,x,y);return true;},
    onTap:id=>add(id)});
  function panel(){const body=$('#laBody'),st=$('#laSt'),k=known(),c=counts();
    if(mode==='free'){$('#laTitle').textContent='自由搭';
      body.innerHTML=`<div class="row" style="gap:6px;margin-bottom:6px">${EL.map(e=>`<span class="tag" style="background:${ATOM[e][0]};color:${e==='C'||e==='N'?'#fff':INK}">${e} × ${c[e]||0}</span>`).join('')}</div>`+
        (bench.length?(k?`<p style="font-size:20px;line-height:1.6">这是 <b class="hand" style="font-size:28px">${k[1]}</b>，化学式 ${fmB(k[0])}<br><span class="hint">1 个${k[2]}由${Object.keys(c).map(e=>`${c[e]} 个${ATOM[e][1]}原子`).join('和')}构成</span></p>`:`<p style="font-size:18px">${fmB(rawFm())} ——这不是我们学过的分子，换一种搭法试试。</p>`):'<p class="hint">工作台还是空的。</p>');
      setSt(st,'','把左边的原子拖到工作台上（也可以直接点原子）。点工作台上的原子可以拿走。');}
    else{const[name]=CHAL[ci];$('#laTitle').textContent=`搭建挑战 ${ci+1} / ${CHAL.length}`;
      body.innerHTML=`<p style="font-size:18px">请搭出 1 个 <b class="hand" style="font-size:34px;color:${CORAL}">${name}</b> 分子</p><div class="row" style="margin-top:8px"><button class="btn pri sm" id="laSub">提交</button><button class="btn sm" id="laNext">下一题</button></div>`;
      $('#laSub').onclick=submit;$('#laNext').onclick=()=>{ci=(ci+1)%CHAL.length;done=false;bench=[];stampOff($('[data-id="lab"] .stage'));panel();};
      if(!done)setSt(st,'',`搭好后点“提交”。答对 +5`);}}
  function submit(){if(done)return;const st=$('#laSt'),[name,f]=CHAL[ci],k=known(),tm=TEAM.cur;if(!bench.length){setSt(st,'warn','工作台还是空的');return;}done=true;
    if(k&&k[0]===f){teamAdd(5,tm);sfx('ok');FX.burst(innerWidth*.35,innerHeight*.45,40,[CORAL,SUN,TEAL]);stampOn($('[data-id="lab"] .stage'),'搭对了！',true,'78%','22%');setSt(st,'ok',`<b>${tname(tm)}搭对 +5</b>　${name}的化学式是 ${fmB(f)}。`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}没搭对，不加分</b>　${name}的化学式是 ${fmB(f)}：${fmTokens(f).filter(x=>x.t==='el').map((x,i,arr)=>{const tk=fmTokens(f);const j=tk.indexOf(x);const n=tk[j+1]&&tk[j+1].t==='sub'?tk[j+1].v:'1';return`${n} 个${ATOM[x.v][1]}原子`;}).join('、')}。`);}
    teamNext();}
  $('#laFree').onclick=()=>{mode='free';$('#laFree').setAttribute('aria-pressed','true');$('#laChal').setAttribute('aria-pressed','false');done=false;stampOff($('[data-id="lab"] .stage'));panel();sfx('click');};
  $('#laChal').onclick=()=>{mode='chal';$('#laChal').setAttribute('aria-pressed','true');$('#laFree').setAttribute('aria-pressed','false');bench=[];done=false;panel();sfx('click');};
  $('#laClear').onclick=()=>{bench=[];done=false;panel();sfx('click');};
  $('#laReset').onclick=()=>{bench=[];ci=0;done=false;$('#laFree').click();};
  panel();
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;
    // 原子托盘
    G.tx=88;G.ty=i=>110+i*((h-200)/4);sticker(ctx,28,40,120,h-130,20,'#ffffff');txt(ctx,'原子盒',88,66,{size:16,weight:700,col:'#55617f'});
    ui.draw(ctx);EL.forEach((e,i)=>txt(ctx,ATOM[e][1]+'原子',G.tx,G.ty(i)+48,{size:14,weight:700,col:'#55617f'}));
    // 工作台
    const bc=[w*.58,h*.52],br=Math.min(h*.36,w*.3);const first=!G.bc;G.bc=bc;G.br=br;if(first)layout();
    ctx.save();ctx.beginPath();ctx.arc(bc[0]+5,bc[1]+5,br,0,TAU);ctx.fillStyle=INK;ctx.fill();ctx.beginPath();ctx.arc(bc[0],bc[1],br,0,TAU);const g=ctx.createRadialGradient(bc[0],bc[1],br*.2,bc[0],bc[1],br);g.addColorStop(0,'#fffdf2');g.addColorStop(1,'#fff3c4');ctx.fillStyle=g;ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.stroke();
    ctx.setLineDash([8,8]);ctx.lineWidth=2;ctx.strokeStyle='rgba(31,42,68,.25)';ctx.beginPath();ctx.arc(bc[0],bc[1],br-18,t*.2,t*.2+TAU);ctx.stroke();ctx.restore();
    if(!bench.length)hand(ctx,'把原子拖到这里',bc[0],bc[1],{size:30,col:'rgba(31,42,68,.35)'});
    const k=known();bench.forEach(a=>{a.x=lerp(a.x,a.tx,1-Math.exp(-dt*7));a.y=lerp(a.y,a.ty,1-Math.exp(-dt*7));});
    if(k&&MOL[k[0]]){const settle=bench.every(a=>Math.hypot(a.x-a.tx,a.y-a.ty)<3);if(settle){drawMol(ctx,k[0],bc[0],bc[1],82);}else bench.forEach(a=>atomBall(ctx,a.x,a.y,82*.42*ATOM[a.e][2],a.e));
      if(settle&&!LOW){ctx.save();ctx.globalAlpha=.5+.3*Math.sin(t*4);ctx.strokeStyle=SUN;ctx.lineWidth=6;ctx.beginPath();ctx.arc(bc[0],bc[1],br-6,0,TAU);ctx.stroke();ctx.restore();}}
    else bench.forEach(a=>atomBall(ctx,a.x+Math.sin(t*3+a.tx)*2,a.y+Math.cos(t*2.6+a.ty)*2,82*.42*ATOM[a.e][2],a.e));
    // 化学式显示
    const fx=bc[0],fy=58;sticker(ctx,fx-170,fy-38,340,76,18,'#ffffff');
    if(!bench.length)txt(ctx,'化学式：?',fx,fy,{size:30,weight:700,col:'#8a95ad'});
    else{fmDraw(ctx,k?k[0]:rawFm(),fx,fy,46,{cols:{sub:TEAL},col:k?INK:'#8a95ad'});if(k)hand(ctx,k[1],fx+150,fy+52,{size:26,col:CORAL,align:'right'});}
  }
  return{tick};})();
