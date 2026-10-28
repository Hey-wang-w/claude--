/* ================= 通用：拖放任务旁的“变式练习”按钮（随时可点；答错后变红闪动） ================= */
function varBtn(sub,vq,src){const o={v:vq},b=document.createElement('button');b.className='btn vbtn2';b.textContent='变式练习';b.title='3 道变式练习（不计分）';sub.before(b);
  b.onclick=()=>VARS.open(o,src);return{o,hot(on){b.classList.toggle('hot',on);}};}
/* ================= 通用：分拣台（卡片拖进展柜，或先点卡片、再点展柜；提交后判分） ================= */
function sorter({binsEl,trayEl,st,sub,reset,bins,cards,ex=false,draw=null,info=null,src,vq,hint,okMsg=''}){
  let place={},pick=null,done=false,order=cards.slice();const VB=varBtn(sub,vq,src);
  const sh=()=>{order=cards.slice().sort(()=>Math.random()-.5);};
  function card(c,inBin){const ok=done&&place[c.id]===c.b,no=done&&!ok,cls=`${pick===c.id?' sel':''}${ok?' ok':''}${no?' no':''}`;
    if(ex)return`<button class="xcard${inBin?' in':''}${cls}" data-c="${c.id}"><canvas></canvas><span>${c.t}</span>${no?`<em class="fixl">应放：${bins[c.b].h}</em>`:''}</button>`;
    return`<button class="mcard${cls}" data-c="${c.id}">${c.t}${done&&c.why?`<em class="why">${c.why}</em>`:''}${no?`<em class="fixl">应放：${bins[c.b].h}</em>`:''}</button>`;}
  function render(){
    binsEl.innerHTML=bins.map((b,k)=>`<div class="bin" data-drop="1" data-b="${k}"><h4>${b.h}<small>${b.s||''}</small></h4><div class="bslots">${order.filter(c=>place[c.id]===k).map(c=>card(c,true)).join('')}</div></div>`).join('');
    trayEl.innerHTML=order.filter(c=>place[c.id]==null).map(c=>card(c,false)).join('')||'<span class="hint">卡片都放好了，检查后点“提交”。</span>';
    if(ex)$$('.xcard',binsEl.parentNode).forEach(el=>{const c=cards.find(x=>x.id===el.dataset.c);paintStatic($('canvas',el),(ctx,w,h)=>draw(c,ctx,w,h));});
    $$('[data-c]',binsEl.parentNode).forEach(el=>{const c=cards.find(x=>x.id===el.dataset.c);
      el.onclick=e=>{e.stopPropagation();if(info)setSt(st,'',info(c));if(done)return;
        if(place[c.id]!=null){place[c.id]=null;pick=null;sfx('click');render();return;}
        pick=pick===c.id?null:c.id;sfx('click');render();};
      DRAG.make(el,{drop:tg=>{const b=tg.closest&&tg.closest('.bin');if(!b||done)return false;place[c.id]=+b.dataset.b;pick=null;sfx('drop');render();return true;}});});
    $$('.bin',binsEl).forEach(b=>b.onclick=()=>{if(done||!pick)return;place[pick]=+b.dataset.b;pick=null;sfx('drop');render();});}
  sub.onclick=()=>{if(done)return;const left=cards.filter(c=>place[c.id]==null).length;if(left){setSt(st,'warn',`还有 ${left} 张卡片没放`);sfx('bad');return;}
    done=true;pick=null;const tm=TEAM.cur,n=cards.filter(c=>place[c.id]===c.b).length;render();
    if(n===cards.length){teamAdd(5,tm);sfx('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部放对 +5</b>　${okMsg}`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}放对 ${n} / ${cards.length}，不加分</b>　红框卡片下面写着应放的位置。点“变式练习”巩固。`);VB.hot(true);VARS.arm(st,VB.o,src);}
    teamNext();};
  function restart(){VARS.disarm(st);VB.hot(false);place={};pick=null;done=false;sh();render();setSt(st,'',hint);}
  reset.onclick=restart;restart();
  return{restart};}

/* ================= 1 封面：展台上的玻璃仪器静物，聚光灯与浮尘 ================= */
S.cover=(()=>{const cv=$('#cvCover');let t=0;const R=rng(5),dust=Array.from({length:34},()=>({x:R(),y:R(),v:.01+R()*.02,r:.6+R()*1.6,p:R()*6}));
  function draw(){const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const cx=w*.5,base=h*.72,s=Math.min(w/620,h/640)*1.15;
    // 聚光灯光锥
    const g=ctx.createLinearGradient(0,0,0,base);g.addColorStop(0,'rgba(255,236,190,.55)');g.addColorStop(1,'rgba(255,236,190,.08)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx-40*s,0);ctx.lineTo(cx+40*s,0);ctx.lineTo(cx+250*s,base);ctx.lineTo(cx-250*s,base);ctx.closePath();ctx.fill();
    dust.forEach(d=>{d.y-=d.v*.016;if(d.y<0)d.y=1;const yy=d.y*base,half=40*s+(210*s)*(yy/base),xx=cx+(d.x*2-1)*half;ctx.globalAlpha=.35+.3*Math.sin(t*1.3+d.p);ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.arc(xx,yy,d.r,0,TAU);ctx.fill();});ctx.globalAlpha=1;
    // 展台
    ctx.fillStyle='rgba(28,26,23,.12)';ctx.beginPath();ctx.ellipse(cx,base+4,270*s,18*s,0,0,TAU);ctx.fill();
    ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.fillRect(cx-250*s,base,500*s,h-base);ctx.strokeRect(cx-250*s,base,500*s,h-base+2);
    ctx.fillStyle=INK;ctx.fillRect(cx-262*s,base-8*s,524*s,10*s);
    // 静物
    AP.rack(ctx,cx-185*s,base-8*s,.8*s);[-1,0,1].forEach((k,i)=>testTube(ctx,cx-185*s+k*40*s,base-150*s,124*s,22*s,0,{lv:[.35,.2,.5][i],col:['rgba(120,180,230,.75)','rgba(240,190,90,.75)','rgba(150,205,160,.75)'][i]}));
    AP.conical(ctx,cx+75*s,base-8*s,1.25*s,{lv:.6,col:'rgba(120,180,230,.7)'});
    AP.beaker(ctx,cx+190*s,base-8*s,.9*s,{lv:.45,col:'rgba(240,190,90,.55)'});
    lamp(ctx,cx-50*s,base-8*s,.62*s,true,t);
    // 展签
    ctx.save();ctx.translate(cx+160*s,base+44*s);ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.fillRect(-80*s,-24*s,160*s,52*s);ctx.strokeRect(-80*s,-24*s,160*s,52*s);
    txt(ctx,'藏品 No.01',0,-8*s,{size:12*s,col:CM,weight:700});hand(ctx,'化学实验仪器',0,12*s,{size:17*s});ctx.restore();}
  return{tick(dt){t+=dt;draw();}};})();

/* ================= 2 导览图：知识卡放回空格 ================= */
S.map=(()=>{
  // [展厅, 条目, 前半句, 答案, 后半句]
  const NODES=[[0,'化学','在分子、原子层次上研究物质的','组成、结构、性质、转化及应用',''],[0,'化学变化','基本特征：','有新物质生成',''],[0,'化学性质','在','化学变化','中表现出来的性质'],[0,'物理性质','颜色、状态、气味、','密度','、熔点、沸点等'],
    [1,'科学探究','问题和假设 →（实验等方法）→','证据','→ 结论'],[1,'加热','用酒精灯的','外焰','加热'],[1,'量筒读数','视线与凹液面的','最低处','保持水平'],[1,'液体用量','未说明用量时取','1～2 mL',''],
    [2,'闻气味','不把鼻孔凑到容器口，要','用手扇闻',''],[2,'加热液体','液体不超过试管容积的','1/3',''],[2,'熄灭酒精灯','用','灯帽盖灭','，不可用嘴吹'],[2,'酒精洒出着火','立即用','湿抹布盖灭','']];
  const DECOY=['内焰','2/3','用嘴吹灭'];
  const TOP=['化学研究什么','实验与探究','安全与规范'];
  let fill=[],pick=null,done=false,cards=[];const grid=$('#mpGrid'),tray=$('#mpTray'),st=$('#mpSt'),VB=varBtn($('#mpSub'),QB.mapTask,'导览图');
  function deal(){VARS.disarm(st);VB.hot(false);cards=[...NODES.map(n=>n[3]),...DECOY].sort(()=>Math.random()-.5);fill=NODES.map(()=>null);pick=null;done=false;render();setSt(st,'','把卡片拖进空格（或先点卡片、再点空格）；点已填的空格可取回。有 3 张是干扰卡。');}
  function render(){grid.innerHTML=TOP.map((tp,k)=>`<div class="mcol"><h4><i>0${k+1}</i>${tp}</h4>${NODES.map((n,i)=>n[0]!==k?'':`<div class="mnode"><b>${n[1]}</b><span>${n[2]}<button class="slot${fill[i]!==null?' on':''}${done?(fill[i]===n[3]?' ok':' no'):''}" data-i="${i}">${fill[i]??'　　'}</button>${n[4]}${done&&fill[i]!==n[3]?` <em class="fix">${n[3]}</em>`:''}</span></div>`).join('')}</div>`).join('');
    const left=cards.slice();fill.filter(x=>x!==null).forEach(u=>{const j=left.indexOf(u);if(j>=0)left.splice(j,1);});
    tray.innerHTML=left.map(c=>`<button class="mcard${pick===c?' sel':''}" data-c="${c}">${c}</button>`).join('');
    $$('.mcard',tray).forEach(b=>{b.onclick=()=>{if(done)return;pick=pick===b.dataset.c?null:b.dataset.c;sfx('click');render();};
      DRAG.make(b,{drop:tg=>{if(done||!tg.classList.contains('slot'))return false;const i=+tg.dataset.i;fill[i]=b.dataset.c;pick=null;sfx('drop');render();return true;}});});
    $$('.slot',grid).forEach(b=>{b.dataset.drop='1';b.onclick=()=>{if(done)return;const i=+b.dataset.i;if(fill[i]!==null){fill[i]=null;sfx('click');}else if(pick){fill[i]=pick;pick=null;sfx('drop');}render();};});}
  $('#mpSub').onclick=()=>{if(done)return;if(fill.some(x=>x===null)){setSt(st,'warn',`还有 ${fill.filter(x=>x===null).length} 个空格没填`);sfx('bad');return;}
    done=true;const tm=TEAM.cur,n=fill.filter((x,i)=>x===NODES[i][3]).length;render();
    if(n===NODES.length){teamAdd(5,tm);sfx('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部放对 +5</b>　干扰卡：“内焰”“2/3”（酒精灯内酒精的上限）“用嘴吹灭”。`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}放对 ${n} / ${NODES.length}，不加分</b>　红框处的正确答案写在旁边。点“变式练习”巩固。`);VB.hot(true);VARS.arm(st,VB.o,'导览图');}teamNext();};
  $('#mpReset').onclick=deal;deal();
  return{};})();

/* ================= 3 变化分拣：物理变化 / 化学变化 ================= */
S.change=(()=>{
  const C=[['纺纱织布',0,'只改变形状'],['海水晒盐',0,'水蒸发，盐析出'],['打磨铜镜',0,'只改变表面形状'],['灯泡通电发光',0,'发光放热，但没有新物质'],['玻璃破碎',0,'只改变形状'],
    ['粮食酿醋',1,'生成了醋（新物质）'],['木材烧成木炭',1,'新物质：木炭等'],['火药爆炸',1,'新物质：气体等'],['铁锅生锈',1,'新物质：铁锈'],['牛奶变酸',1,'生成了新物质']].map(([t,b,why],i)=>({id:'c'+i,t,b,why}));
  sorter({binsEl:$('#chBins'),trayEl:$('#chTray'),st:$('#chSt'),sub:$('#chSub'),reset:$('#chReset'),cards:C,src:'变化分拣',vq:QB.chTask,
    bins:[{h:'物理变化',s:'没有生成其他物质'},{h:'化学变化',s:'生成其他物质'}],hint:'把变化卡片拖进展柜（或先点卡片、再点展柜）。判断依据：有没有生成新物质。',okMsg:'注意“灯泡通电发光”：有发光放热，却没有新物质。'});
  const q=qPanel($('#chQ'),QB.change,{src:'变化小测'});$('#chReset').addEventListener('click',()=>q.reset());
  notes('change','物理变化与化学变化',['<mark>物理变化</mark>：没有生成其他物质的变化。','<mark>化学变化</mark>：生成其他物质的变化，又叫化学反应。','化学变化的基本特征：<mark>有其他物质生成</mark>；常伴随发光、放热、变色、放出气体、生成沉淀等现象。','化学变化中<mark>一定同时发生</mark>物理变化（如蜡烛燃烧时石蜡先熔化）。'],
    '有发光、放热、变色、气体产生的变化不一定是化学变化 → 看有没有新物质。',
    (ctx,w,h)=>{const L=(s,x,y,o={})=>hand(ctx,s,x,y,Object.assign({col:PEN.ink,size:18},o));
      L('水',w*.18,h*.16,{col:PEN.blue});arrow(ctx,w*.28,h*.16,w*.52,h*.16,{col:PEN.ink,w:2,head:9});L('水蒸气',w*.66,h*.16,{col:PEN.blue});
      L('状态变了，还是水',w*.42,h*.3,{size:15,col:PEN.dim});L('物理变化',w*.42,h*.42,{col:PEN.blue,size:20});
      ctx.strokeStyle=PEN.dim;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(w*.06,h*.52);ctx.lineTo(w*.94,h*.52);ctx.stroke();ctx.setLineDash([]);
      L('石蜡',w*.14,h*.66,{col:PEN.red});L('+ 氧气',w*.32,h*.66,{col:PEN.red});arrow(ctx,w*.43,h*.66,w*.58,h*.66,{col:PEN.ink,w:2,head:9});hand(ctx,'点燃',w*.505,h*.6,{size:13,col:PEN.dim});
      L('二氧化碳 + 水',w*.78,h*.66,{col:PEN.red});L('生成了新物质',w*.5,h*.8,{size:15,col:PEN.dim});L('化学变化',w*.5,h*.92,{col:PEN.red,size:20});});
  return{};})();

/* ================= 4 性质与变化：四个展柜 ================= */
S.prop=(()=>{
  const C=[['铜具有良好的导电性',0],['氧气是无色无味的气体',0],['木炭能在空气中燃烧',1],['二氧化碳能使澄清石灰水变浑浊',1],
    ['水加热后变成水蒸气',2],['铜丝被弯成螺旋状',2],['木炭在空气中燃烧，生成二氧化碳',3],['向澄清石灰水中通入二氧化碳，石灰水变浑浊',3]].map(([t,b],i)=>({id:'p'+i,t,b}));
  sorter({binsEl:$('#prBins'),trayEl:$('#prTray'),st:$('#prSt'),sub:$('#prSub'),reset:$('#prReset'),cards:C,src:'性质与变化',vq:QB.prTask,
    bins:[{h:'物理性质',s:'不需化学变化就表现'},{h:'化学性质',s:'化学变化中表现'},{h:'物理变化',s:'正在 / 已经发生'},{h:'化学变化',s:'正在 / 已经发生'}],
    hint:'把句子拖进四个展柜。提示：“能、会、易、可以”多描述性质；正在或已经发生的是变化。',okMsg:'“能使石灰水变浑浊”是性质，“通入后变浑浊”是变化。'});
  const q=qPanel($('#prQ'),QB.prop,{src:'性质小测'});$('#prReset').addEventListener('click',()=>q.reset());
  notes('prop','性质与变化',['<mark>物理性质</mark>：不需要发生化学变化就表现出来的性质，如颜色、状态、气味、密度、熔点、沸点、硬度、导电性。','<mark>化学性质</mark>：在化学变化中表现出来的性质，如可燃性、助燃性。','描述<mark>性质</mark>常带“能、会、易、可以、具有”；描述<mark>变化</mark>是正在或已经发生的过程。','性质决定用途，用途反映性质。'],
    '“木炭能燃烧”是化学性质，“木炭燃烧了”是化学变化。',
    (ctx,w,h)=>{const x0=w*.2,x1=w*.96,y0=h*.14,y1=h*.88,mx=(x0+x1)/2,my=(y0+y1)/2;penBox(ctx,x0,y0,x1-x0,y1-y0);
      ctx.strokeStyle=PEN.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(mx,y0);ctx.lineTo(mx,y1);ctx.moveTo(x0,my);ctx.lineTo(x1,my);ctx.stroke();
      hand(ctx,'物理',(x0+mx)/2,y0-14,{size:16,col:PEN.blue});hand(ctx,'化学',(mx+x1)/2,y0-14,{size:16,col:PEN.red});
      [['性质',(y0+my)/2],['变化',(my+y1)/2]].forEach(([s,y])=>hand(ctx,s,x0-2,y,{size:15,col:PEN.dim,align:'right'}));
      const c=(s,x,y,col)=>hand(ctx,s,x,y,{size:15,col});c('铜能导电',(x0+mx)/2,(y0+my)/2,PEN.blue);c('木炭能燃烧',(mx+x1)/2,(y0+my)/2,PEN.red);c('冰融化了',(x0+mx)/2,(my+y1)/2,PEN.blue);c('木炭燃烧了',(mx+x1)/2,(my+y1)/2,PEN.red);});
  return{};})();
