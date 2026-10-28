/* ================= 8 符号解码：点数字看意义 ================= */
S.sym=(()=>{const box=$('#syBoard');
  const d=(s,m,cls='')=>`<span class="dg ${cls}" data-m="${m}">${s}</span>`;
  const TILES=[
    [`${d('2','2 个氮原子（符号前面的数字：粒子个数）')}N`,'2N'],
    [`${d('3','3 个水分子')}H<sub>${d('2','1 个水分子中含有 2 个氢原子','s')}</sub>O`,'3H₂O'],
    [`O<sub>${d('2','1 个氧分子中含有 2 个氧原子','s')}</sub>`,'O₂'],
    [`Mg<sup>${d('2+','1 个镁离子带 2 个单位的正电荷','s')}</sup>`,'Mg²⁺'],
    [`${d('2','2 个铁离子')}Fe<sup>${d('3+','1 个铁离子带 3 个单位的正电荷','s')}</sup>`,'2Fe³⁺'],
    [`H<sub>2</sub><span class="vt">${d('+6','硫酸中硫元素的化合价为 +6（正上方：化合价）','v')}S</span>O<sub>${d('4','1 个硫酸分子中含有 4 个氧原子','s')}</sub>`,'H₂SO₄']];
  function render(){box.innerHTML=`<div class="symgrid">${TILES.map(([html,k],i)=>`<div class="symt" data-k="${i}"><div class="sym">${html}</div><div class="mean">点一个数字</div></div>`).join('')}</div>
      <div class="symkey"><b>位置口诀</b><span>前面 → 粒子个数</span><span>右下 → 一个分子中的原子数</span><span>右上 → 离子所带电荷</span><span>正上方 → 化合价</span></div>`;
    $$('.dg',box).forEach(e=>e.onclick=()=>{const t=e.closest('.symt');$$('.dg',t).forEach(x=>x.classList.remove('on'));e.classList.add('on');$('.mean',t).textContent=e.dataset.m;$('.mean',t).classList.add('on');sfx8('coin');});}
  const qp=qPanel($('#syQ'),QB.sym,{src:'符号的意义'});
  $('#syReset').onclick=()=>{render();qp.reset();};render();
  notes('sym','化学符号中数字的意义',['符号<mark>前面</mark>的数字：粒子个数（只有微观意义），如 2N、3H₂O。','<mark>右下角</mark>：1 个分子中所含该原子的个数，如 O₂。','<mark>右上角</mark>：1 个离子所带的电荷数，如 Mg²⁺（数字在前，正负号在后）。','<mark>正上方</mark>：元素的化合价（正负号在前，数字在后）。'],
    '元素只讲种类、不讲个数：“2N”是 2 个氮原子，不是 2 个氮元素。',
    (ctx,w,h)=>{const cx=w/2,cy=h/2;txt(ctx,'Mg',cx,cy,{size:64,weight:700,col:PEN.ink});
      const tag=(x,y,s,c,tx,ty)=>{txt(ctx,s,x,y,{size:28,weight:700,col:c});ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(x,y+(ty>y?18:-18));ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);};
      tag(cx-110,cy,'2',PEN.blue,cx-50,cy);txt(ctx,'个数',cx-110,cy+34,{size:15,weight:700,col:PEN.blue});
      tag(cx+80,cy-50,'2+',PEN.red,cx+44,cy-22);txt(ctx,'离子电荷',cx+120,cy-50,{size:15,weight:700,col:PEN.red});
      tag(cx,cy-110,'+2',PEN.green,cx,cy-40);txt(ctx,'化合价',cx+50,cy-110,{size:15,weight:700,col:PEN.green});
      tag(cx+80,cy+60,'2',PEN.gold,cx+44,cy+26);txt(ctx,'原子个数（如 O₂）',cx+80,cy+94,{size:15,weight:700,col:PEN.gold});});
  return{};})();

/* ================= 9 氮的“价—类”二维图：把物质卡放到对应的点 ================= */
S.vc=(()=>{const cv=$('#cvVc');let t=0,put={},pick=null,done=false;const G={};
  // 点：[名称, 类别列, 化合价]
  const PTS=[['A',0,0],['B',1,2],['C',1,4],['D',1,5],['E',2,-3],['F',2,5]],ANS={A:'N2',B:'NO',C:'NO2',D:'N2O5',E:'NH3',F:'HNO3'};
  const CATS=['单质','氧化物','其他化合物'],VAL=[-3,0,2,4,5];
  const tray=$('#vcTray');
  function renderTray(){const used=Object.values(put);tray.innerHTML=['NO2','NH3','N2','HNO3','N2O5','NO'].filter(f=>!used.includes(f)).map(f=>`<button class="mcard fm${pick===f?' sel':''}" data-f="${f}">${fm(f)}</button>`).join('')||'<span class="hint">都放好了，点“提交”</span>';
    $$('.mcard',tray).forEach(b=>{b.onclick=()=>{if(done)return;pick=pick===b.dataset.f?null:b.dataset.f;sfx8('select');renderTray();};
      DRAG.make(b,{drop:(tg,cx,cy)=>{if(done||tg!==cv||!G.pt)return false;const[x,y]=DRAG.cvPt(cv,cx,cy);const n=PTS.map(p=>p[0]).find(n=>Math.hypot(x-G.pt[n][0],y-G.pt[n][1])<46);if(!n)return false;put[n]=b.dataset.f;pick=null;sfx8('coin');renderTray();return true;}});});}
  const ui=canvasUI(cv,{hots:()=>G.pt?PTS.map(([n])=>({hit:(x,y)=>Math.hypot(x-G.pt[n][0],y-G.pt[n][1])<34,act:()=>{if(done)return;if(put[n]){delete put[n];sfx8('blip');}else if(pick){put[n]=pick;pick=null;sfx8('coin');}renderTray();}})):[]});
  $('#vcSub').onclick=()=>{if(done)return;if(Object.keys(put).length<PTS.length){FX.burst(innerWidth/2,innerHeight/2,6,[CA]);sfx('bad');return;}done=true;const tm=TEAM.cur,n=PTS.filter(([p])=>put[p]===ANS[p]).length;
    if(n===PTS.length){teamAdd(5,tm);sfx8('win');FX.confetti();}else{sfx8('jam');VARS.arm($('[data-id="vc"] .hd h2'),{v:QB.vcTask},'价—类二维图');}G.res={n,tm};teamNext();};
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const x0=w*.14,x1=w*.95,y0=96,y1=h-190,cw=(x1-x0)/3,vy=v=>y1-(v+4)*(y1-y0)/10;
    // 网格与坐标轴
    ctx.save();ctx.fillStyle='rgba(255,255,255,.85)';rr(ctx,x0,y0-20,x1-x0,y1-y0+20,10);ctx.fill();
    ctx.strokeStyle='#dbe3ee';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);VAL.forEach(v=>{ctx.beginPath();ctx.moveTo(x0,vy(v));ctx.lineTo(x1,vy(v));ctx.stroke();});for(let k=1;k<3;k++){ctx.beginPath();ctx.moveTo(x0+cw*k,y0-20);ctx.lineTo(x0+cw*k,y1);ctx.stroke();}ctx.setLineDash([]);
    ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x0,y0-36);ctx.lineTo(x0,y1);ctx.lineTo(x1+10,y1);ctx.stroke();
    ctx.fillStyle=INK;ctx.beginPath();ctx.moveTo(x0,y0-44);ctx.lineTo(x0-7,y0-30);ctx.lineTo(x0+7,y0-30);ctx.fill();ctx.beginPath();ctx.moveTo(x1+18,y1);ctx.lineTo(x1+4,y1-7);ctx.lineTo(x1+4,y1+7);ctx.fill();
    for(let v=-3;v<=5;v++){ctx.beginPath();ctx.moveTo(x0-(VAL.includes(v)?8:4),vy(v));ctx.lineTo(x0,vy(v));ctx.stroke();}ctx.restore();
    txt(ctx,'化合价',x0-12,y0-44,{size:16,col:DIM,weight:700,align:'right'});VAL.forEach(v=>txt(ctx,v>0?'+'+v:String(v),x0-16,vy(v),{size:18,weight:700,align:'right'}));
    CATS.forEach((c,k)=>pill(ctx,c,x0+cw*(k+.5),y1+30,{size:16,fill:['#dff1fb','#e6f7ef','#e9e3ff'][k]}));txt(ctx,'物质类别',x1+14,y1-18,{size:15,col:DIM,weight:700,align:'right'});
    G.pt={};PTS.forEach(([n,c,v])=>{const x=x0+cw*(c+.5)+(n==='B'?-46:n==='D'?40:n==='C'?-4:0),y=vy(v),f=put[n],ok=done&&f===ANS[n],bad=done&&f!==ANS[n];G.pt[n]=[x,y];
      if(!f){const k=(t*1.4+x*.01)%1;ctx.save();ctx.globalAlpha=1-k;ctx.strokeStyle='#ffb000';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,12+k*16,0,TAU);ctx.stroke();ctx.restore();}
      ctx.save();ctx.fillStyle=bad?'#e5484d':ok?'#1f9d6b':f?'#1f9fd6':'#ffd23f';ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y,f?13:11,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
      txt(ctx,n,x,y+1,{size:14,weight:900,col:f||!done?INK:'#fff'});
      if(f){sticker(ctx,x+20,y-20,92,40,{r:10,sh:3,fill:done?(ok?'#e6f7ef':'#fdeaea'):'#ffffff'});fmDraw(ctx,f,x+66,y,22,{col:done?(ok?'#1f9d6b':'#e5484d'):INK});}
      if(done&&f!==ANS[n])fmDraw(ctx,ANS[n],x+66,y+38,18,{col:'#1f9d6b'});});
    if(G.res){const{n,tm}=G.res;hand(ctx,n===PTS.length?`${tname(tm)}全部放对 +5`:`放对 ${n} / 6，不加分；绿色是正确答案`,w/2,32,{size:22,col:n===PTS.length?OKC:BADC});}
    else hand(ctx,pick?'点图上的点放进去':'把化学式卡片拖到图上的点（或先点卡片、再点点）',w/2,32,{size:21});}
  const qp=qPanel($('#vcQ'),QB.vc,{src:'化合价'});
  $('#vcReset').onclick=()=>{VARS.disarm($('[data-id="vc"] .hd h2'));put={};pick=null;done=false;G.res=null;renderTray();qp.reset();};
  renderTray();
  notes('vc','化合价与“价—类”二维图',['单质中元素的化合价为 <mark>0</mark>；化合物中正、负化合价的<mark>代数和为 0</mark>。','求化合价：已知的标出来，未知的设为 x，列式求解。','“价—类”图：纵坐标看化合价，横坐标看物质类别。'],
    '同一种元素可以有多种化合价：NH₃ 中 −3，N₂ 中 0，NO₂ 中 +4，HNO₃ 中 +5。',
    (ctx,w,h)=>{txt(ctx,'求 HNO₃ 中 N 的化合价',w/2,34,{size:20,weight:700,col:PEN.ink});hand(ctx,'(+1) + x + (−2)×3 = 0',w/2,100,{size:30,col:PEN.blue});hand(ctx,'x = +5',w/2,160,{size:36,col:PEN.red});
      penBox(ctx,40,210,w-80,90,PEN.green,[6,5]);txt(ctx,'单质：0　　化合物：代数和为 0',w/2,240,{size:17,weight:700,col:PEN.green});txt(ctx,'H 通常 +1，O 通常 −2',w/2,272,{size:17,weight:700,col:PEN.green});});
  return{tick};})();

/* ================= 10 标签计算：钙片（每片 2.5 g，含钙 0.8 g）+ 计算器 ================= */
S.lab=(()=>{const cv=$('#cvLab');let t=0,step=0,stT=0;
  $('#lbStep').onclick=()=>{if(step<4){step++;stT=0;sfx8('blip');}};$('#lbHide').onclick=()=>{step=0;sfx8('select');};
  function tablet(ctx,x,y,r,k){ctx.save();ctx.fillStyle='rgba(31,42,68,.15)';ctx.beginPath();ctx.ellipse(x+3,y+r*.55,r,r*.45,0,0,TAU);ctx.fill();
    const g=ctx.createRadialGradient(x-r*.3,y-r*.4,r*.1,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#dfe5ee');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,r,r*.62,0,0,TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
    ctx.strokeStyle='#b9c3d6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-r*.6,y);ctx.lineTo(x+r*.6,y);ctx.stroke();ctx.restore();}
  function tick(dt){t+=dt;stT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    // 药盒标签
    const bx=30,by=36,bw=w*.46,bh=h-230;sticker(ctx,bx,by,bw,bh,{r:16,sh:6});ctx.save();rr(ctx,bx,by,bw,bh,16);ctx.clip();ctx.fillStyle='#ff6fa8';ctx.fillRect(bx,by,bw,64);ctx.fillStyle='#ffd23f';ctx.fillRect(bx,by+64,bw,6);ctx.restore();
    ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(bx,by+70);ctx.lineTo(bx+bw,by+70);ctx.stroke();
    hand(ctx,'钙  片',bx+bw/2,by+34,{size:30,col:'#ffffff'});
    [['主要成分','碳酸钙（CaCO₃）'],['规格','每片质量 2.5 g'],['含量','每片含钙 0.8 g'],['用法','每日 1 片，嚼服']].forEach(([k,v],i)=>{const y=by+108+i*46;
      pill(ctx,k,bx+70,y,{size:14,fill:'#fff6d6'});txt(ctx,v,bx+128,y,{size:20,weight:700,align:'left'});});
    txt(ctx,'（钙元素只来自碳酸钙）',bx+bw/2,by+108+4*46-6,{size:15,col:DIM,weight:700});
    for(let k=0;k<4;k++)tablet(ctx,bx+bw*.2+k*bw*.2,by+bh-48+Math.sin(t*2+k)*2,26,k);
    // 提升题思路：点一步出一步
    const rx=w*.54,rw=w*.43;hand(ctx,'提升：钙片中碳酸钙的质量分数',rx,58,{size:22,col:'#ff6fa8',align:'left'});
    const SP=['① 找已知：每片钙片的质量、每片含钙的质量','② 由化学式求 CaCO₃ 中钙元素的质量分数 = Ca 的相对原子质量 ÷ CaCO₃ 的相对分子质量 × 100%','③ 碳酸钙的质量 = 钙元素的质量 ÷ 钙元素的质量分数','④ 碳酸钙的质量分数 = 碳酸钙的质量 ÷ 每片钙片的质量 × 100%'];
    let y=86;SP.forEach((s,i)=>{const lines=wrapLines(ctx,s,rw-36,`700 18px ${FNUM}`),bh=Math.max(58,lines.length*26+28);ctx.save();
      if(i<step){ctx.globalAlpha=i===step-1?Math.min(1,stT*3):1;sticker(ctx,rx,y,rw,bh,{r:12,sh:3,fill:i===3?'#e6f7ef':'#ffffff'});lines.forEach((ln,j)=>txt(ctx,ln,rx+18,y+bh/2+(j-(lines.length-1)/2)*26,{size:18,weight:700,align:'left',col:i===3?'#1f9d6b':INK}));}
      else{ctx.fillStyle='#eef3fa';rr(ctx,rx,y,rw,bh,12);ctx.fill();ctx.setLineDash([7,6]);ctx.strokeStyle=FAINT;ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);txt(ctx,`第 ${i+1} 步  ？`,rx+rw/2,y+bh/2,{size:18,col:FAINT,weight:700});}
      ctx.restore();y+=bh+16;});
    if(step===0)txt(ctx,'先自己算，再点“提升题思路：下一步”看思路',rx+rw/2,y+14,{size:15,col:DIM,weight:700});}
  const qp=qPanel($('#lbQ'),QB.lab,{src:'标签计算'});
  const calc=calcPad($('#lbCalc'),{onFill:v=>{if(!qp.fill(v)){return false;}}});
  $('#lbReset').onclick=()=>{step=0;qp.reset();calc.reset();};
  notes('lab','根据化学式的计算',['相对分子质量 = 各原子的相对原子质量 × 原子个数之和。','元素质量比 = （相对原子质量 × 原子个数）之比。','元素的质量分数 = 相对原子质量 × 原子个数 ÷ 相对分子质量 × 100%。','元素质量 = 物质质量 × 该元素的质量分数；反过来用除法。'],
    '纯度（提升）：先由元素质量求出纯物质的质量，再除以样品质量。',
    (ctx,w,h)=>{txt(ctx,'钙片：每片 2.5 g，含钙 0.8 g',w/2,34,{size:18,weight:700,col:PEN.ink});
      const box=(y,s,c)=>{penBox(ctx,50,y-22,w-100,44,c);txt(ctx,s,w/2,y,{size:17,weight:700,col:c});};
      box(100,'钙 0.8 g',PEN.red);arrow(ctx,w/2,124,w/2,154,{col:PEN.ink,w:2,head:9});txt(ctx,'÷ 40%',w/2+50,140,{size:15,weight:700,col:PEN.ink});
      box(180,'碳酸钙 2 g',PEN.blue);arrow(ctx,w/2,204,w/2,234,{col:PEN.ink,w:2,head:9});txt(ctx,'÷ 2.5 g',w/2+56,220,{size:15,weight:700,col:PEN.ink});
      box(260,'碳酸钙的质量分数 80%',PEN.green);});
  return{tick};})();

/* ================= 11 思维诊所：四种思维方法与常见陷阱（翻卡） ================= */
S.think=(()=>{const box=$('#thBoard');
  // 翻开后的例子不能和右侧小测重复（小测考的是 KMnO₄ 反例、水与过氧化氢等）
  const CARDS=[['比较','找相同点和不同点','蒸馏水和自来水都是无色透明的液体；自来水含可溶性杂质 → 混合物，蒸馏水 → 纯净物'],['归纳','从多个事实中找规律','H₂O、CO₂、MgO 都由两种元素组成且含氧 → 氧化物'],
    ['分析','把整体拆成部分来研究','电解水：分析生成物 H₂、O₂ 所含元素 → 推出水由氢、氧两种元素组成'],['推理','由已知推出结论（要找反例检验）','离子是带电的粒子 → 带电的粒子都是离子？✗ 反例：电子、质子']];
  function render(){box.innerHTML=`<div class="thgrid">${CARDS.map(([n,d,e],i)=>`<button class="thc" data-i="${i}"><div class="f"><b>${n}</b><span>${d}</span><i>点我翻开例子</i></div><div class="b"><b>${n}</b><span>${e}</span></div></button>`).join('')}</div>`;
    $$('.thc',box).forEach(b=>b.onclick=()=>{b.classList.toggle('on');sfx8('blip');});}
  const qp=qPanel($('#thQ'),QB.think,{src:'科学思维'});
  $('#thReset').onclick=()=>{render();qp.reset();};render();
  return{};})();
