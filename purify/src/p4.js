/* ================= 11 硬水和软水 ================= */
S.hard=(()=>{const cv=$('#cvHard');let t=0,hardI=0;const st=$('#haSt');
  /* 每支试管单独记录：soap 滴入进度、shk 振荡计时、done 已振荡、foam 泡沫量 */
  let soap,shk,done,foam,G={};
  function bind(){single($('#haOpts'),$('#haSub'),$('#haSt'),hardI,{ok:'泡沫少、浮渣多的是硬水。',bad:`泡沫少、浮渣多的${hardI?'乙':'甲'}试管才是硬水。`});$$('#haOpts .opt').forEach(b=>b.disabled=true);$('#haSub').disabled=true;}
  function ui2(){$('#haSoap').disabled=soap.every(v=>v>0);$('#haShake').disabled=!soap.some((v,i)=>v>0&&!done[i]);}
  function reset(){hardI=Math.random()<.5?0:1;soap=[0,0];shk=[0,0];done=[false,false];foam=[0,0];$$('#haOpts .opt').forEach(b=>b.classList.remove('right','wrong'));bind();ui2();
    setSt(st,'','把肥皂水滴瓶拖到试管上（或点“滴入肥皂水”），再点试管振荡。');}
  const addSoap=i=>{if(soap[i]>0)return;soap[i]=.001;sfx('drop');ui2();};
  const shake=i=>{if(!soap[i]){setSt(st,'warn',`${i?'乙':'甲'}试管还没滴肥皂水`);sfx('bad');return;}if(done[i]||shk[i]>0)return;shk[i]=1.4;sfx('whoosh');ui2();};
  $('#haSoap').onclick=()=>{[0,1].forEach(addSoap);};
  $('#haShake').onclick=()=>{[0,1].forEach(i=>{if(soap[i]&&!done[i])shake(i);});};
  $('#haReset').onclick=()=>{reset();sfx('click');};reset();
  const ui=canvasUI(cv,{tools:()=>G.w?[{id:'soap',x:G.w*.47,y:G.top-6,r:34,on:soap.some(v=>!v),draw:(c,x,y,d)=>dropperIcon(c,x,y,'肥皂水','#e7eef2',{tilt:d?-.3:0})}]:[],
    hots:()=>G.w?[0,1].map(i=>({hit:(x,y)=>Math.abs(x-G.xs[i])<G.r+16&&y>G.top&&y<G.bot,act:()=>shake(i)})):[],
    onDrop:(id,x,y)=>{const i=[0,1].find(k=>Math.abs(x-G.xs[k])<G.r+30&&y>G.top-60&&y<G.bot);if(i===undefined)return false;addSoap(i);return true;}});
  function tubeAt(ctx,x,top,bot,r,isHard,sp,f,sk,t){ctx.save();const ang=sk>0?Math.sin(t*28)*.12:0;ctx.translate(x,top);ctx.rotate(ang);ctx.translate(-x,-top);
    const path=()=>{ctx.beginPath();ctx.moveTo(x-r,top);ctx.lineTo(x-r,bot-r);ctx.arc(x,bot-r,r,Math.PI,0,true);ctx.lineTo(x+r,top);};
    path();ctx.fillStyle='rgba(230,242,248,.35)';ctx.fill();ctx.save();path();ctx.clip();const ly=lerp(bot,top,.55);
    ctx.fillStyle=sp>=1?'rgba(214,232,240,.78)':waterCol(0,{a:1.2});ctx.fillRect(x-r,ly,r*2,bot-ly);
    if(f>0){const fh=isHard?14:130,R=rng(isHard?3:7),n=isHard?12:120;for(let i=0;i<n;i++){const bx=x-r+R()*r*2,by=ly-R()*fh*f,br=3+R()*(isHard?3:6);ctx.fillStyle='rgba(255,255,255,.92)';ctx.strokeStyle='rgba(150,180,200,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx,by,br,0,TAU);ctx.fill();ctx.stroke();}
      if(isHard){const R2=rng(5);for(let i=0;i<16;i++){ctx.globalAlpha=f;ctx.fillStyle='rgba(236,232,214,.95)';ctx.strokeStyle='rgba(170,160,130,.7)';const bx=x-r+4+R2()*(r*2-8),by=ly+4+R2()*22+Math.sin(t*2+i)*1.5;ctx.beginPath();ctx.ellipse(bx,by,4+R2()*3,2+R2()*1.5,R2()*3,0,TAU);ctx.fill();ctx.stroke();}ctx.globalAlpha=1;}}
    ctx.restore();path();ctx.strokeStyle=GL_S;ctx.lineWidth=2.2;ctx.stroke();ctx.beginPath();ctx.ellipse(x,top,r+2,5,0,0,TAU);ctx.stroke();glassHi(ctx,x+r*.5,top+14,x+r*.5,bot-22,3,.75);ctx.restore();
    if(sp>0&&sp<1)drop(ctx,x,lerp(top-40,top+60,sp),5,'rgba(230,236,240,.95)');}
  function tick(dt){t+=dt;
    [0,1].forEach(i=>{if(soap[i]>0&&soap[i]<1){soap[i]=Math.min(1,soap[i]+dt*1.2);if(soap[i]>=1)ui2();}
      if(shk[i]>0){shk[i]=Math.max(0,shk[i]-dt);if(shk[i]===0){done[i]=true;ui2();if(done[0]&&done[1]){$$('#haOpts .opt').forEach(b=>b.disabled=false);$('#haSub').disabled=false;setSt(st,'warn','观察泡沫和浮渣，判断哪支是硬水，再提交');}}}
      foam[i]=done[i]?Math.min(1,foam[i]+dt*1.5):0;});
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const top=h*.2,bot=h*.76,r=Math.min(40,w*.04),xs=[w*.32,w*.62];Object.assign(G,{w,top,bot,r,xs});
    ctx.fillStyle='#b98e5c';rr(ctx,w*.18,bot-30,w*.58,26,4);ctx.fill();ctx.fillStyle='#a37a4a';rr(ctx,w*.18,top+120,w*.58,18,4);ctx.fill();ctx.fillStyle='#8c6438';ctx.fillRect(w*.19,top+120,12,bot-top-100);ctx.fillRect(w*.75-12,top+120,12,bot-top-100);
    xs.forEach((x,i)=>{tubeAt(ctx,x,top,bot-10,r,i===hardI,soap[i],foam[i],shk[i],t);hand(ctx,i?'乙':'甲',x,bot+30,{size:34,col:CIN});
      if(soap[i]>=1&&!done[i]&&shk[i]===0)trayHint(ctx,x,top-16,'点我振荡');});
    if(done[0]&&done[1]){const ly=lerp(bot,top,.55),xh=xs[hardI],xs2=xs[1-hardI];callout(ctx,xs2+r,ly-60,xs2+r+80,top+40,'泡沫多',{col:NAVY,size:17});callout(ctx,xh+r,ly+12,xh+r+80,ly+60,'泡沫少、浮渣多',{col:CIN,size:17});}
    hand(ctx,'两支试管中各盛有等量的水样（一支硬水，一支软水）',w*.47,30,{size:24,col:'#4a4f5c'});
    ui.draw(ctx);if(soap.some(v=>!v))trayHint(ctx,w*.47,top+40,'拖到试管上');}
  return{tick};})();

/* ================= 12 竞赛：净水密室逃脱 ================= */
S.escape=(()=>{const cv=$('#cvEscape'),card=$('#esCard');let t=0;
  const ROOMS=['沉降','过滤','吸附','消毒','蒸馏与硬水'];
  const Q=[
    {r:0,q:'用明矾净水时，明矾所起的作用是',o:['杀灭水中的细菌','使水中悬浮的杂质沉降','除去水中的异味','把硬水变成软水'],a:1,e:'明矾溶于水后生成胶状物，吸附悬浮杂质使其沉降；它不能杀菌，也不能软化水。'},
    {r:0,q:'取一杯浑浊的河水静置一段时间，下列说法正确的是',o:['上层的水变成了纯水','除去了所有不溶性杂质','较大的颗粒沉到了杯底','水中的色素被除去'],a:2,e:'静置只能使较大的不溶性颗粒沉降，细小颗粒、可溶性杂质仍留在水中。'},
    {r:1,q:'过滤操作中，下列做法正确的是',o:['用玻璃棒在漏斗中搅拌，加快过滤','滤纸边缘高出漏斗边缘','漏斗下端管口紧靠烧杯内壁','液面高于滤纸边缘'],a:2,e:'过滤时不能搅拌（会戳破滤纸）；要做到“二低”：滤纸边缘低于漏斗边缘，液面低于滤纸边缘。'},
    {r:1,q:'过氧化氢在二氧化锰催化下分解后，要回收不溶于水的二氧化锰，应采用的方法是',o:['蒸发','过滤','吸附','消毒'],a:1,e:'二氧化锰不溶于水，用过滤把不溶性固体与液体分开。'},
    {r:1,hard:1,q:'右图是某同学的过滤操作。图中缺少的一种仪器及其作用是',fig:'rig',o:['玻璃棒，引流','玻璃棒，搅拌','铁圈，支撑漏斗','滤纸，吸附色素'],a:0,e:'倾倒液体时要用玻璃棒引流，液体沿玻璃棒流入漏斗，防止液体溅出或冲破滤纸。'},
    {r:2,q:'许多家用净水器中装有活性炭，主要利用了活性炭的',o:['可燃性','吸附性','能溶于水','能杀菌'],a:1,e:'活性炭疏松多孔，具有吸附性，可除去色素和异味。'},
    {r:2,q:'下列关于活性炭净水的说法，错误的是',o:['能除去水中的色素和异味','活性炭疏松多孔','吸附过程发生了化学变化','也能滤去部分不溶性杂质'],a:2,e:'吸附过程没有生成新物质，属于物理变化。'},
    {r:3,q:'自来水厂净水的下列环节中，发生化学变化的是',o:['沉淀','过滤','活性炭吸附','投药消毒'],a:3,e:'投药消毒时消毒剂与细菌等发生反应，生成了新物质，是化学变化。'},
    {r:3,hard:1,q:'把学校池塘里的水净化成可饮用的水，步骤有：①活性炭吸附 ②过滤 ③加明矾静置 ④投药消毒。合理的顺序是',o:['③②①④','②③①④','③①②④','④③②①'],a:0,e:'先沉降除去大颗粒，再过滤、吸附，最后消毒杀菌——与自来水厂的流程一致。'},
    {r:4,q:'制取蒸馏水时，在烧瓶中加入几粒沸石的目的是',o:['加快水的蒸发','防止加热时暴沸','吸附水中的杂质','使水软化'],a:1,e:'沸石（或碎瓷片）能防止加热时液体暴沸。'},
    {r:4,hard:1,q:'用右图装置制取蒸馏水，下列说法错误的是',fig:'dist',o:['冷凝管中的冷水从下口进、上口出','开始馏出的液体要收集起来','烧瓶中加入沸石可防止暴沸','收集到的蒸馏水是纯净物'],a:1,e:'开始馏出的液体可能含有杂质，应该弃去。'},
    {r:4,q:'取等量的甲、乙两种水样，各加入等量肥皂水振荡：甲中泡沫很少、浮渣较多，乙中泡沫丰富。下列判断正确的是',o:['甲是软水','乙是硬水','甲是硬水','两者都是纯净物'],a:2,e:'泡沫少、浮渣多的是硬水；泡沫多、浮渣少的是软水。'}];
  let qi=0,res=[],pick=null,judged=false,openT=0,openRoom=-1,win=false,winT=0,lastRoom=0;
  const roomOf=i=>Q[i].r,inRoom=r=>Q.map((q,i)=>i).filter(i=>Q[i].r===r);
  function reset(){qi=0;res=[];pick=null;judged=false;openT=0;openRoom=-1;win=false;winT=0;lastRoom=0;render();}
  $('#esReset').onclick=()=>{reset();sfx('click');};
  function render(){if(win){const r=TEAM.sc.r,b=TEAM.sc.b;card.innerHTML=`<div class="qmeta"><span class="tag y">逃脱成功</span></div><p class="hand" style="font-size:44px;line-height:1.2">净水厂大门打开了！</p>
      <p class="qtext">全班闯过 5 间密室。本节积分：<b class="kr">红队 ${r}</b> ： <b class="k">蓝队 ${b}</b></p><p class="hand" style="font-size:36px;color:${r===b?'#d9a62e':r>b?'#c4492f':'#2f6fb0'}">${r===b?'两队打平，都是净水高手！':(r>b?'红队':'蓝队')+'获胜！'}</p>
      <div class="row"><button class="btn pri" data-go="next">进入小结 →</button><button class="btn" id="esAgain">再玩一次</button></div>`;
      $('[data-go]',card).onclick=()=>$('#btnNext').click();$('#esAgain').onclick=reset;return;}
    const q=Q[qi],tm=TEAM.cur,pts=q.hard?20:10;
    card.innerHTML=`<div class="qmeta"><span class="teamTag ${tm}">${tname(tm)}答题</span><span class="tag n">密室 ${q.r+1} · ${ROOMS[q.r]}</span><span class="tag p">第 ${qi+1} / ${Q.length} 题</span>${q.hard?'<span class="tag c">提升 · 双倍</span>':''}<span class="hint" style="margin-left:auto">答对 +${pts}</span></div>
      <div style="display:grid;grid-template-columns:${q.fig?'minmax(0,1fr) 230px':'1fr'};gap:12px;align-items:start"><p class="qtext">${q.q}（　）</p>${q.fig?`<canvas id="esFig" style="width:230px;height:${q.fig==='dist'?170:220}px;border:1px solid #e3dccd;border-radius:6px;background:#fff"></canvas>`:''}</div>
      <div class="opts">${q.o.map((o,i)=>`<button class="opt" data-v="${i}"><i>${'ABCD'[i]}</i>${o}</button>`).join('')}</div>
      <div class="row"><button class="btn pri" id="esSub">提交</button><button class="btn" id="esNext" hidden>下一题 →</button></div><div class="status qex" id="esSt">选好后提交；答对点亮本队颜色的锁芯</div>`;
    pick=null;judged=false;
    $$('.opt',card).forEach(b=>b.onclick=()=>{if(judged)return;pick=+b.dataset.v;$$('.opt',card).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
    $('#esSub').onclick=submit;$('#esNext').onclick=next;
    if(q.fig)requestAnimationFrame(()=>{const c=$('#esFig');if(!c)return;const{ctx,w,h}=fitS(c);ctx.clearRect(0,0,w,h);if(q.fig==='rig'){const k=Math.min(w/600,h/600);filterRig(ctx,(w-600*k)/2,(h-600*k)/2,k,{rod:false,pour:true,flow:1,lv:.5,fil:.2,t:.4});}
      else{const k=Math.min(w/1000,h/640);drawDistill(ctx,(w-1000*k)/2,(h-640*k)/2,k,{water:1,stones:true,lit:true,cap:false,temp:100,vol:5,first:false,boil:1,cool:true,drip:true,labels:false,t:.3});}});}
  function submit(){if(judged)return;const st=$('#esSt');if(pick===null){setSt(st,'warn','请先选择一个答案');return;}judged=true;const q=Q[qi],tm=TEAM.cur,ok=pick===q.a,pts=q.hard?20:10;
    $$('.opt',card).forEach(x=>{const v=+x.dataset.v;x.disabled=true;if(v===q.a)x.classList.add('right');else if(v===pick)x.classList.add('wrong');});
    res[qi]=ok?tm:'x';if(ok){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}答对 +${pts}</b>　${q.e}`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}答错，不加分</b>　正确答案 ${'ABCD'[q.a]}。${q.e}`);}
    const r=q.r,done=inRoom(r).every(i=>res[i]);if(done){openRoom=r;openT=0;setTimeout(()=>{sfx('boom');},350);setTimeout(()=>sfx('win'),900);}
    teamNext();$('#esSub').hidden=true;$('#esNext').hidden=false;$('#esNext').textContent=qi===Q.length-1?'打开大门 →':done?'进入下一间密室 →':'下一题 →';}
  function next(){if(qi===Q.length-1){win=true;winT=0;FX.confetti();sfx('win');render();return;}qi++;sfx('whoosh');render();}
  reset();
  function door(ctx,x,y,w,h,open,lab,cur,pins,t){// 门洞
    ctx.save();ctx.fillStyle='#2b2620';rr(ctx,x-8,y-8,w+16,h+8,8);ctx.fill();
    if(open>0){const g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'rgba(255,240,190,1)');g.addColorStop(1,'rgba(255,214,130,1)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
      if(!LOW){ctx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){ctx.fillStyle=`rgba(255,220,140,${.07*open})`;ctx.beginPath();ctx.moveTo(x+w*.1,y+h*.05+i*h*.15);ctx.lineTo(x+w*1.9+i*20,y+h*1.3);ctx.lineTo(x+w*1.6+i*20,y+h*1.3);ctx.closePath();ctx.fill();}ctx.globalCompositeOperation='source-over';}}
    // 门板（绕左侧铰链旋转，用宽度压缩表现透视）
    const dw=w*(1-.82*ease(open));ctx.fillStyle=cur?'#6b4a2f':'#5a4330';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dw,y+open*h*.05);ctx.lineTo(x+dw,y+h-open*h*.05);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=2;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x+dw*i/4,y+open*h*.05*i/4+4);ctx.lineTo(x+dw*i/4,y+h-open*h*.05*i/4-4);ctx.stroke();}
    ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x+4,y+4,dw*.12,h-8);
    // 锁
    if(open<.3){const lx=x+w*.5,ly=y+h*.5,lr=Math.min(w*.3,46);const up=clamp(open/.3,0,1)*lr*.5;
      ctx.strokeStyle='#c9ccd2';ctx.lineWidth=lr*.22;ctx.beginPath();ctx.arc(lx,ly-lr*.55-up,lr*.55,Math.PI,0);ctx.stroke();
      rr(ctx,lx-lr,ly-lr*.55,lr*2,lr*1.5,lr*.25);ctx.fillStyle=metal(ctx,lx-lr,0,lx+lr,0);ctx.fill();ctx.strokeStyle='#5a5f68';ctx.lineWidth=2;ctx.stroke();
      const n=pins.length;pins.forEach((p,i)=>{const px=lx-lr*.6+(n>1?i*lr*1.2/(n-1):lr*.6),py=ly+lr*.2;ctx.beginPath();ctx.arc(px,py,lr*.17,0,TAU);ctx.fillStyle=p==='r'?'#c4492f':p==='b'?'#2f6fb0':p==='x'?'#9a9ca3':'#2c2f36';ctx.fill();if(p==='r'||p==='b'){ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.5;ctx.stroke();}});}
    ctx.restore();
    hand(ctx,lab,x+w/2,y+h+30,{size:cur?30:22,col:cur?CIN:'#4a4f5c'});}
  const SHORT=['沉降','过滤','吸附','消毒','蒸馏'];
  function bigLock(ctx,cx,cy,L,pins,open,col){ctx.save();const up=ease(clamp(open*1.6,0,1))*L*.55,rot=ease(clamp(open*1.6-.4,0,1))*.5;
    ctx.save();ctx.translate(cx+L*.5,cy-L*.55);ctx.rotate(-rot);ctx.translate(-(cx+L*.5),-(cy-L*.55));ctx.strokeStyle=metal(ctx,cx-L,0,cx+L,0);ctx.lineWidth=L*.2;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(cx-L*.5,cy-L*.5-up);ctx.arc(cx,cy-L*.55-up,L*.5,Math.PI,0);ctx.lineTo(cx+L*.5,cy-L*.3-up*.2);ctx.stroke();ctx.restore();
    const g=ctx.createLinearGradient(cx-L,cy-L*.6,cx+L,cy+L*.8);g.addColorStop(0,'#f2cf73');g.addColorStop(.5,'#d9a62e');g.addColorStop(1,'#9c7215');rr(ctx,cx-L,cy-L*.55,L*2,L*1.45,L*.22);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#7b5a12';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.25)';rr(ctx,cx-L*.86,cy-L*.45,L*1.72,L*.18,L*.09);ctx.fill();
    const n=pins.length;pins.forEach((p,i)=>{const px=cx+(i-(n-1)/2)*L*.56,py=cy+L*.32;ctx.beginPath();ctx.arc(px,py,L*.19,0,TAU);ctx.fillStyle='#3a2c10';ctx.fill();ctx.beginPath();ctx.arc(px,py,L*.15,0,TAU);ctx.fillStyle=p==='r'?'#c4492f':p==='b'?'#2f6fb0':p==='x'?'#8d8f96':'#2a2116';ctx.fill();
      if(p==='r'||p==='b'){ctx.globalCompositeOperation='lighter';glow(ctx,px,py,L*.4,p==='r'?'#c4492f':'#2f6fb0',.6);ctx.globalCompositeOperation='source-over';}});
    ctx.fillStyle='#3a2c10';ctx.beginPath();ctx.arc(cx,cy-L*.08,L*.12,0,TAU);ctx.fill();ctx.fillRect(cx-L*.05,cy-L*.08,L*.1,L*.22);
    if(open>0&&open<1&&!LOW){ctx.globalCompositeOperation='lighter';glow(ctx,cx,cy,L*2.4*open,'#f2cf73',.5*(1-open));ctx.globalCompositeOperation='source-over';}
    ctx.restore();}
  function tick(dt){t+=dt;if(openRoom>=0)openT=Math.min(1,openT+dt*.9);if(win)winT=Math.min(1,winT+dt*.6);
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const wy=24,wh=h-96;ctx.fillStyle='#efe7d8';ctx.fillRect(20,wy,w-40,wh);ctx.strokeStyle='rgba(120,95,60,.16)';ctx.lineWidth=1;for(let y=wy;y<wy+wh;y+=28){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(w-20,y);ctx.stroke();const off=((y-wy)/28)%2?0:40;for(let x=20+off;x<w-20;x+=80){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+28);ctx.stroke();}}
    ctx.fillStyle='#c9b796';ctx.fillRect(20,wy+wh,w-40,16);
    const cur=win?5:Q[qi].r;const n=5,gw=(w-80)/(n+1.3),dwid=gw*.74,dh=Math.min(wh*.5,dwid*2.1),dy=wy+wh-dh-4;
    // 当前密室的大锁
    const lr=cur<5?cur:4,lockOpen=openRoom===lr?openT:(inRoom(lr).every(i=>res[i])?1:0),L=Math.min(80,(dy-wy-130)/2.6);
    const lx=(w-gw*.3)/2,lyy=wy+52+L*1.5;
    hand(ctx,win?'全部密室已打开！':`密室 ${lr+1} · ${ROOMS[lr]}`,lx,wy+34,{size:34,col:win?MOSS:INK});
    if(!win){bigLock(ctx,lx,lyy,L,inRoom(lr).map(i=>res[i]||''),lockOpen,'');
      const left=inRoom(lr).filter(i=>!res[i]).length;txt(ctx,lockOpen>=1||left===0?'咔哒！锁打开了':`还有 ${left} 道题，答完开锁`,lx,lyy+L*1.25,{size:17,weight:700,col:lockOpen?MOSS:'#4a4f5c'});}
    else{mdiDraw(ctx,'trophy',lx,lyy,L*2,'#d9a62e');}
    for(let r=0;r<n;r++){const x=40+gw*r+(gw-dwid)/2;const pins=inRoom(r).map(i=>res[i]||'');const done=inRoom(r).every(i=>res[i]);const op=done?(r===openRoom?ease(openT):1):0;door(ctx,x,dy,dwid,dh,op,`${r+1} ${SHORT[r]}`,r===cur,pins,t);}
    const gx=40+gw*n+8,gwid=gw*1.3-16,gh=Math.min(wh*.66,gwid*1.7),gy=wy+wh-gh;ctx.fillStyle='#2b2620';rr(ctx,gx-10,gy-10,gwid+20,gh+10,12);ctx.fill();
    if(winT>0){const g=ctx.createLinearGradient(0,gy,0,gy+gh);g.addColorStop(0,'#bfe3f2');g.addColorStop(1,'#e9f6fb');ctx.fillStyle=g;ctx.fillRect(gx,gy,gwid,gh);mdiDraw(ctx,'water-check',gx+gwid/2,gy+gh*.42,gwid*.55,'#2f6fb0');hand(ctx,'净水厂',gx+gwid/2,gy+gh*.75,{size:28,col:NAVY});}
    const hw=gwid/2*(1-.85*ease(winT));ctx.fillStyle='#3d4752';ctx.fillRect(gx,gy,hw,gh);ctx.fillRect(gx+gwid-hw,gy,hw,gh);ctx.strokeStyle='#5f6b78';ctx.lineWidth=3;for(let i=0;i<5;i++){const yy=gy+gh*(i+.5)/5;ctx.beginPath();ctx.moveTo(gx,yy);ctx.lineTo(gx+hw,yy);ctx.moveTo(gx+gwid-hw,yy);ctx.lineTo(gx+gwid,yy);ctx.stroke();}
    if(winT<.05)mdiDraw(ctx,'lock',gx+gwid/2,gy+gh*.5,46,'#d9a62e');
    hand(ctx,'大门',gx+gwid/2,gy+gh+30,{size:24,col:win?MOSS:'#4a4f5c'});
    const cx2=cur<5?40+gw*cur+gw/2:gx+gwid/2,bob=Math.sin(t*4)*5,yy=dy-58+bob;mdiDraw(ctx,'water',cx2,yy,52,'#2f7fb0');ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx2-6,yy+5,3,0,TAU);ctx.arc(cx2+6,yy+5,3,0,TAU);ctx.fill();
    const k2=res.filter(x=>x==='r'||x==='b').length;txt(ctx,`已点亮锁芯 ${k2} / ${Q.length}　·　已答 ${res.filter(Boolean).length} 题`,w-36,wy+22,{size:14,col:'#6f7480',weight:700,align:'right'});
    [['r','红队'],['b','蓝队'],['x','答错']].forEach(([k,s2],i)=>{const x=w-250+i*76,y=wy+46;ctx.fillStyle=k==='r'?'#c4492f':k==='b'?'#2f6fb0':'#9a9ca3';ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.fill();txt(ctx,s2,x+11,y,{size:13,align:'left',col:'#4a4f5c'});});}
  return{tick};})();

/* ================= 13 小结 ================= */
S.sum=(()=>{const tab=$('#suTab');
  const ROWS=[['沉降','较大的不溶性颗粒（明矾促进沉降）','物理变化',1],['过滤','不溶性杂质','物理变化',2],['吸附','色素、异味（活性炭）','物理变化',3],['消毒','细菌等微生物','化学变化',0],['蒸馏','几乎所有杂质 → 纯净物','物理变化',4]];
  tab.innerHTML=`<tr><th>方法</th><th>主要除去</th><th>变化类型</th><th>净化程度</th></tr>`+ROWS.map(r=>`<tr><td class="m">${r[0]}</td><td class="cv hide">${r[1]}</td><td class="cv hide">${r[2]}</td><td>${r[3]?`<span class="purity">${Array.from({length:4},(_,i)=>`<i style="height:${8+i*5}px;opacity:${i<r[3]?1:.15}"></i>`).join('')}</span>`:'<span class="hint">（杀菌，不比较）</span>'}</td></tr>`).join('');
  $$('.cv',tab).forEach(c=>c.onclick=()=>{c.classList.toggle('hide');sfx('pop');});
  $('#suAll').onclick=()=>{$$('.cv',tab).forEach(c=>c.classList.remove('hide'));sfx('whoosh');};$('#suHide').onclick=()=>{$$('.cv',tab).forEach(c=>c.classList.add('hide'));sfx('click');};
  const cv=$('#cvSum');let t=0;
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);if(h<60)return;const st=['沉降','过滤','吸附','蒸馏'],tb=[.6,.25,.1,0],n=4,sw=w/(n+.6),sh=Math.min(32,(h-110)/n);
    hand(ctx,'净化程度阶梯',16,22,{size:26,align:'left',col:NAVY});
    for(let i=0;i<n;i++){const x=20+i*sw,y=h-10-(i+1)*sh;ctx.fillStyle='#e9e1d0';ctx.fillRect(x,y,sw-6,h-10-y);ctx.strokeStyle='#b7ab92';ctx.lineWidth=1.5;ctx.strokeRect(x,y,sw-6,h-10-y);
      const bh=Math.min(sh*1.8,58);beaker(ctx,x+sw*.28,y-2,44,bh,{lv:.7,col:waterCol(tb[i])});hand(ctx,st[i],x+sw*.55,y-22,{size:26,align:'left'});}
    hand(ctx,'越往上越纯 →',w-24,22,{size:24,align:'right',col:CIN});}
  return{tick,enter(){const r=TEAM.sc.r,b=TEAM.sc.b;$('#suScore').innerHTML=`<span style="color:#c4492f">红队 ${r}</span>　:　<span style="color:#2f6fb0">蓝队 ${b}</span><div style="font-size:24px;color:#4a4f5c">${r===b?'平局，握手言和！':(r>b?'红队':'蓝队')+'领先，继续保持！'}</div>`;}};})();
