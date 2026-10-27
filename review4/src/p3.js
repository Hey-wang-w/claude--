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
    $$('.mcard',tray).forEach(b=>b.onclick=()=>{if(done)return;pick=pick===b.dataset.f?null:b.dataset.f;sfx8('select');renderTray();});}
  const ui=canvasUI(cv,{hots:()=>G.pt?PTS.map(([n])=>({hit:(x,y)=>Math.hypot(x-G.pt[n][0],y-G.pt[n][1])<34,act:()=>{if(done)return;if(put[n]){delete put[n];sfx8('blip');}else if(pick){put[n]=pick;pick=null;sfx8('coin');}renderTray();}})):[]});
  $('#vcSub').onclick=()=>{if(done)return;if(Object.keys(put).length<PTS.length){FX.burst(innerWidth/2,innerHeight/2,6,[CA]);sfx('bad');return;}done=true;const tm=TEAM.cur,n=PTS.filter(([p])=>put[p]===ANS[p]).length;
    if(n===PTS.length){teamAdd(5,tm);sfx8('win');FX.confetti();}else{sfx8('jam');VARS.arm($('[data-id="vc"] .hd h2'),{v:QB.vcTask},'价—类二维图');}G.res={n,tm};teamNext();};
  function tick(dt){t+=dt;const{ctx,w,h,g,W,H,P,flush}=pxStage(cv,4);
    const x0=Math.round(W*.16),x1=Math.round(W*.94),y0=Math.round(H*.13),y1=Math.round(H*.66),cw=(x1-x0)/3,vy=v=>y1-(v+4)*(y1-y0)/10;
    pr(g,x0,y0,1,y1-y0,'#55617f');pr(g,x0,y1,x1-x0,1,'#55617f');
    for(let v=-3;v<=5;v++){const y=Math.round(vy(v)),on=VAL.includes(v);if(on)for(let x=x0+2;x<x1;x+=4)pr(g,x,y,2,1,'#c9d3e3');pr(g,x0-(on?3:2),y,on?3:2,1,'#55617f');}
    for(let k=1;k<3;k++)for(let y=y0;y<y1;y+=4)pr(g,Math.round(x0+cw*k),y,1,2,'#c9d3e3');
    G.pt={};PTS.forEach(([n,c,v])=>{const x=Math.round(x0+cw*(c+.5)+(n==='B'?-10:n==='D'?10:0)),y=Math.round(vy(v)),f=put[n],ok=done&&f===ANS[n],bad=done&&f!==ANS[n];
      G.pt[n]=[x*P,y*P];pdisc(g,x,y,f?6:4,bad?'#e5484d':ok?'#1f9d6b':f?'#1f9fd6':'#e69500');pdisc(g,x,y,f?4:2,'#ffffff');
      if(!f&&Math.sin(t*5+x)>0)pring(g,x,y,7,'#e69500');});
    flush();
    ptxt(ctx,'化合价',x0*P-10,y0*P-28,{size:16,col:'#55617f',align:'right'});VAL.forEach(v=>ptxt(ctx,v>0?'+'+v:String(v),x0*P-14,vy(v)*P,{size:17,col:'#e69500',align:'right',font:FNUM,weight:700}));
    CATS.forEach((c,k)=>ptxt(ctx,c,(x0+cw*(k+.5))*P-(k===2?40:0),y1*P+22,{size:18,col:'#1f9fd6'}));ptxt(ctx,'物质类别 →',x1*P,y1*P+20,{size:15,col:'#55617f',align:'right'});
    PTS.forEach(([n])=>{const[x,y]=G.pt[n],f=put[n];ptxt(ctx,n,x-26,y-22,{size:17,col:'#e69500',font:FNUM,weight:700});
      if(f)fmDraw(ctx,f,x+32,y-2,22,{align:'left',col:done?(f===ANS[n]?'#1f9d6b':'#e5484d'):'#1f2a44'});
      if(done&&f!==ANS[n])fmDraw(ctx,ANS[n],x+32,y+24,18,{align:'left',col:'#1f9d6b'});});
    if(G.res){const{n,tm}=G.res;ptxt(ctx,n===PTS.length?`${tname(tm)}全部放对 +5`:`放对 ${n} / 6，不加分；绿色是正确答案`,w/2,h*.05,{size:20,col:n===PTS.length?'#1f9d6b':'#e5484d'});}
    else ptxt(ctx,pick?`把 ${pick.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d])} 放到哪个点？`:'先选下面的化学式，再点图上的点',w/2,h*.05,{size:18,col:'#55617f',font:FNUM,weight:700,sh:null});}
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
  function tick(dt){t+=dt;stT+=dt;const{ctx,w,h,g,W,H,P,flush}=pxStage(cv,4);
    // 药盒（像素）
    const bx=Math.round(W*.06),by=Math.round(H*.12),bw=Math.round(W*.42),bh=Math.round(H*.62);
    pbox(g,bx,by,bw,bh,'#ffffff','#1f2a44');pr(g,bx+3,by+3,bw-6,10,'#ff6fa8');pr(g,bx+3,by+13,bw-6,2,'#e69500');
    for(let k=0;k<5;k++){const px=bx+8+k*((bw-16)/5),py=by+bh-16+Math.round(Math.sin(t*3+k)*1);pdisc(g,px+5,py,5,'#1f2a44');pdisc(g,px+5,py,4,'#ffffff');pr(g,px+2,py,7,1,'#c9d3e3');}
    flush();
    const lx=(bx+6)*P,ly=(by+22)*P;ptxt(ctx,'钙片',(bx+bw/2)*P,(by+8)*P,{size:26,col:'#ffffff',sh:'#1f2a44'});
    [['【主要成分】','碳酸钙（CaCO₃）'],['【规格】','每片质量 2.5 g'],['【含量】','每片含钙 0.8 g'],['【用法】','每日 1 片，嚼服']].forEach(([k,v],i)=>{ptxt(ctx,k+v,lx,ly+8+i*46,{size:20,col:'#1f2a44',align:'left',font:FNUM,weight:700,sh:null});});
    ptxt(ctx,'钙元素只来自碳酸钙',(bx+bw/2)*P,ly+8+4*46,{size:16,col:'#8a95ad',font:FNUM,weight:700,sh:null});
    // 提升题思路：点一步出一步
    const rx=w*.56,ry=h*.12;ptxt(ctx,'提升：钙片中碳酸钙的质量分数',rx,ry,{size:20,col:'#e69500',align:'left'});
    const SP=['① 每片含钙 0.8 g',`② ${'CaCO₃'} 中钙的质量分数：40 ÷ 100 × 100% = 40%`,'③ 碳酸钙质量 = 0.8 g ÷ 40% = 2 g','④ 质量分数 = 2 g ÷ 2.5 g × 100% = 80%'];
    SP.forEach((s,i)=>{const y=ry+56+i*72;if(i<step){ctx.save();ctx.globalAlpha=i===step-1?Math.min(1,stT*3):1;wrapTxt(ctx,s,rx,y,w*.4,26,{size:19,col:i===3?'#1f9d6b':'#1f2a44'});ctx.restore();}
      else{ctx.save();ctx.fillStyle='#eef3fa';rr(ctx,rx,y-18,w*.4,38,10);ctx.fill();ctx.setLineDash([6,5]);ctx.strokeStyle='#8a95ad';ctx.lineWidth=2;ctx.stroke();ctx.restore();ptxt(ctx,`第 ${i+1} 步  ？`,rx+w*.2,y+1,{size:18,col:'#8a95ad',font:FNUM,weight:700,sh:null});}});
    if(step===0)ptxt(ctx,'先自己算，再点“下一步”看思路',rx,ry+56+4*72,{size:15,col:'#55617f',align:'left',font:FNUM,weight:700,sh:null});}
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
  const CARDS=[['比较','找相同点和不同点','水和过氧化氢组成元素相同，化学性质却不同 → 分子构成不同'],['归纳','从多个事实中找规律','H₂O、CO₂、MgO 都由两种元素组成且含氧 → 氧化物'],
    ['分析','把整体拆成部分来研究','净水：分析杂质成分 → 找性质差异 → 选分离方法'],['推理','由已知推出结论（要找反例检验）','含氧元素的化合物都是氧化物？✗ 反例：KMnO₄']];
  function render(){box.innerHTML=`<div class="thgrid">${CARDS.map(([n,d,e],i)=>`<button class="thc" data-i="${i}"><div class="f"><b>${n}</b><span>${d}</span><i>点我翻开例子</i></div><div class="b"><b>${n}</b><span>${e}</span></div></button>`).join('')}</div>`;
    $$('.thc',box).forEach(b=>b.onclick=()=>{b.classList.toggle('on');sfx8('blip');});}
  const qp=qPanel($('#thQ'),QB.think,{src:'科学思维'});
  $('#thReset').onclick=()=>{render();qp.reset();};render();
  return{};})();
