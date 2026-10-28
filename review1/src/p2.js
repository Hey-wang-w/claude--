/* ================= 公共：画布场景（1000×600 的场景坐标，按画布等比缩放居中） ================= */
function scene(w,h,W=1000,H=600,pad=0){const k=Math.min(w/W,(h-pad)/H),ox=(w-W*k)/2,oy=(h-pad-H*k)/2;return{k,ox,oy,toS:(x,y)=>[(x-ox)/k,(y-oy)/k],toC:(x,y)=>[ox+x*k,oy+y*k]};}
/* 结果卡：标题 + 若干条 ✓/✗，文字按宽度换行、卡片高度自适应 */
function resultCard(ctx,x,y,w,title,rows){const f='600 16px '+FNUM,lh=23;const L=rows.map(r=>({ok:r[0],ls:wrapLines(ctx,r[1],w-50,f)}));
  const H=44+L.reduce((a,r)=>a+r.ls.length*lh+8,0);ctx.save();ctx.fillStyle='rgba(255,253,248,.97)';ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.fillRect(x,y,w,H);ctx.strokeRect(x,y,w,H);
  ctx.fillStyle=INK;ctx.fillRect(x,y,w,4);hand(ctx,title,x+16,y+24,{size:19,align:'left'});let yy=y+50;
  L.forEach(r=>{txt(ctx,r.ok?'✓':'✗',x+22,yy+lh/2-2,{size:19,weight:900,col:r.ok?OKC:BADC});r.ls.forEach((s,i)=>txt(ctx,s,x+40,yy+i*lh+lh/2-2,{size:16,weight:600,align:'left',col:r.ok?INK:BADC}));yy+=r.ls.length*lh+8;});ctx.restore();return H;}
/* 手写说明 + 引线 */
function caption(ctx,s,x,y,tx,ty,{col=CC,size=17,align='center'}={}){ctx.save();if(tx!=null){ctx.strokeStyle=col;ctx.lineWidth=1.3;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(x,y+(ty>y?12:-12));ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=col;ctx.beginPath();ctx.arc(tx,ty,3,0,TAU);ctx.fill();}
  hand(ctx,s,x,y,{size,col,align});ctx.restore();}
/* 场景坐标下的试管路径（用于按重力方向画液面） */
function tubeClip(ctx,mx,my,L,d,ang){const r=d/2;ctx.save();ctx.translate(mx,my);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(-r+1.5,0);ctx.lineTo(-r+1.5,L-r);ctx.arc(0,L-r,r-1.5,Math.PI,0,true);ctx.lineTo(r-1.5,0);ctx.closePath();ctx.restore();ctx.clip();}
/* 拖动时：画放置目标 + 跟手的影子（zones：{工具 id:[场景 x, y, 半径, 说明]}） */
function dragHints(ctx,ui,G,zones,t){if(!ui||!G)return;if(ui.drag&&ui.drag.moved){const z=typeof zones==='function'?zones()[ui.drag.id]:zones[ui.drag.id];if(z){const[x,y]=G.toC(z[0],z[1]);dropZone(ctx,x,y,z[2]*G.k,z[3],t);}}ui.draw(ctx);}
function seg(k,a,b){const x=clamp((k-a)/(b-a),0,1);return x*x*(3-2*x);}
const SOL='rgba(150,200,235,.8)',SOL2='rgba(196,170,226,.85)';

/* ================= 5 仪器博物馆：可直接加热 / 垫陶土网 / 不能加热 ================= */
S.museum=(()=>{
  const DIM={tube:[130,30],dish:[44,124],spoon:[126,40],beaker:[110,96],flask:[132,86],conical:[126,96],cylinder:[160,64],jar:[114,92],funnel:[120,84]};
  const C=[['tube','试管',0,'少量试剂的反应容器，常温或加热时使用；可直接加热。'],['dish','蒸发皿',0,'用于蒸发液体（瓷质）；可直接加热。'],['spoon','燃烧匙',0,'盛放少量固体进行燃烧实验；可直接加热。'],
    ['beaker','烧杯',1,'较多量试剂的反应容器，也可配制溶液；加热时垫陶土网。'],['flask','烧瓶',1,'较多量液体的反应容器；加热时垫陶土网。'],['conical','锥形瓶',1,'反应容器，便于振荡；加热时垫陶土网。'],
    ['cylinder','量筒',2,'量取液体体积；不能加热，不能作反应容器。'],['jar','集气瓶',2,'收集或储存少量气体；不能加热。'],['funnel','漏斗',2,'过滤，或向小口容器中添加液体；不能加热。']].map(([k,t,b,inf])=>({id:k,k,t,b,inf}));
  const draw=(c,ctx,w,h)=>{const[H,W]=DIM[c.k],s=Math.min((h-14)/H,(w-18)/W),x=w/2,y=h-6;
    ctx.fillStyle='rgba(28,26,23,.08)';ctx.beginPath();ctx.ellipse(x,y,Math.min(w*.4,W*s*.6),4,0,0,TAU);ctx.fill();
    if(c.k==='tube')AP.tube(ctx,x,y,s);else if(c.k==='dish')AP.dish(ctx,x,y-4*s,s);else AP[c.k](ctx,x,y,s);};
  sorter({binsEl:$('#muBins'),trayEl:$('#muTray'),st:$('#muSt'),sub:$('#muSub'),reset:$('#muReset'),cards:C,ex:true,draw,src:'仪器博物馆',vq:QB.muTask,
    info:c=>`<b>展签 · ${c.t}</b>　${c.inf}`,bins:[{h:'可直接加热',s:'展区 A'},{h:'垫陶土网加热',s:'展区 B'},{h:'不能加热',s:'展区 C'}],
    hint:'把展品拖进对应的展区（或先点展品、再点展区）；点展品可以看它的展签。',okMsg:'烧杯、烧瓶、锥形瓶底面积大，垫陶土网使其受热均匀。'});
  const q=qPanel($('#muQ'),QB.museum,{src:'仪器小测'});$('#muReset').addEventListener('click',()=>q.reset());
  notes('museum','常见仪器与加热',['<mark>可直接加热</mark>：试管、蒸发皿、燃烧匙。','<mark>垫陶土网加热</mark>：烧杯、烧瓶、锥形瓶（使其受热均匀）。','<mark>不能加热</mark>：量筒、集气瓶、漏斗等。','量筒只能量取液体体积，不能作反应容器。'],
    '加热烧杯不垫陶土网，会受热不均匀而炸裂。',
    (ctx,w,h)=>{const g=[['直接加热',PEN.red,['tube','dish']],['垫陶土网',PEN.gold,['beaker','conical']],['不能加热',PEN.blue,['cylinder','funnel']]];
      g.forEach(([nm,col,ks],i)=>{const y0=h*(.06+i*.32),hh=h*.28;hand(ctx,nm,w*.02,y0+hh/2,{size:16,col,align:'left'});
        ks.forEach((k,j)=>{const[H,W]=DIM[k],s=Math.min((hh-6)/H,(w*.24)/W),x=w*(.52+j*.28),y=y0+hh;if(k==='tube')AP.tube(ctx,x,y,s);else if(k==='dish')AP.dish(ctx,x,y-2,s);else AP[k](ctx,x,y,s);});});});
  return{};})();

/* ================= 6 实验室安全：教材图 1-11 的危险化学品标志 + 意外事故处理 ================= */
S.safety=(()=>{const st=$('#sfSt');
  const SIG=['boom','gas','solid','self','toxic','corr'];
  const ACC=[['fire','酒精在桌上燃烧','立即用湿抹布盖灭'],['eye','药液溅进眼睛','立即用水冲洗，切不可用手揉'],['skin','药液沾到皮肤上','立即用较多的水冲洗'],['burn','被烫伤','立即用大量冷水冲洗受伤处']];
  let fill={},pick=null,done=false,cards=[];const VB=varBtn($('#sfSub'),QB.sfTask,'实验室安全');
  function accIcon(k){return(ctx,w0,h0)=>{const z=Math.min(w0,h0)/64;ctx.translate((w0-64*z)/2,(h0-64*z)/2);ctx.scale(z,z);const w=64,h=64,x=w/2,y=h/2;
    if(k==='fire'){ctx.fillStyle='#c9a77c';ctx.fillRect(2,h-10,w-4,4);ctx.save();ctx.translate(x-10,h-14);ctx.rotate(-1.4);lamp(ctx,0,0,.28,false,0);ctx.restore();ctx.fillStyle='rgba(150,200,235,.5)';ctx.beginPath();ctx.ellipse(x+12,h-10,20,3,0,0,TAU);ctx.fill();flame(ctx,x+18,h-10,.42,.4);flame(ctx,x+4,h-10,.3,1.3);flame(ctx,x+28,h-10,.26,2.2);}
    else if(k==='burn'){AP.beaker(ctx,x-4,h-6,.36,{lv:.55,col:'rgba(150,200,235,.8)'});ctx.strokeStyle=CM;ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-10+i*10,y-6);ctx.quadraticCurveTo(x-14+i*10,y-14,x-10+i*10,y-20);ctx.quadraticCurveTo(x-6+i*10,y-26,x-10+i*10,y-30);ctx.stroke();}}
    else if(k==='eye'){ctx.save();ctx.translate(x,y+6);ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-22,0);ctx.quadraticCurveTo(0,-17,22,0);ctx.quadraticCurveTo(0,17,-22,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#5b4632';ctx.beginPath();ctx.arc(0,0,7.5,0,TAU);ctx.fill();ctx.fillStyle=INK;ctx.beginPath();ctx.arc(0,0,3.6,0,TAU);ctx.fill();ctx.restore();drop(ctx,x+14,y-16,4.4,'rgba(150,200,235,.95)');drop(ctx,x+4,y-24,3.4,'rgba(150,200,235,.95)');}
    else{ctx.save();ctx.translate(x-4,y-2);ctx.rotate(-2.0);AP.bottle(ctx,0,40,.42,{stopper:'off',lv:.5,label:false});ctx.restore();[0,1,2].forEach(i=>drop(ctx,x-14+i*3,y+8+i*9,3.2,'rgba(150,200,235,.95)'));}};}
  function deal(){VARS.disarm(st);VB.hot(false);cards=[...SIG.map(k=>HAZ[k]),...ACC.map(a=>a[2])].sort(()=>Math.random()-.5);fill={};pick=null;done=false;render();setSt(st,'','把名称拖到标志下面，把处理方法拖到对应的意外事故旁（也可以先点卡片、再点空格）。');}
  const slot=(key,ans,wide)=>`<button class="slot${wide?' wide':''}${fill[key]!=null?' on':''}${done?(fill[key]===ans?' ok':' no'):''}" data-k="${key}" data-drop="1">${fill[key]??'　'}</button>${done&&fill[key]!==ans?`<em class="fix">${ans}</em>`:''}`;
  function render(){
    $('#sfSigns').innerHTML=SIG.map(k=>`<div class="sign"><img src="${SIGN_SRC[k]}" alt="危险化学品标志" draggable="false">${slot(k,HAZ[k])}</div>`).join('');
    $('#sfAccs').innerHTML=ACC.map(([k,nm,ans])=>`<div class="acc"><canvas data-a="${k}"></canvas><b>${nm}</b>${slot(k,ans,true)}</div>`).join('');
    $$('#sfAccs canvas').forEach(c=>paintStatic(c,accIcon(c.dataset.a)));
    const left=cards.slice();Object.values(fill).forEach(u=>{const j=left.indexOf(u);if(j>=0)left.splice(j,1);});
    $('#sfTray').innerHTML=left.map(c=>`<button class="mcard${pick===c?' sel':''}" data-c="${c}">${c}</button>`).join('');
    $$('#sfTray .mcard').forEach(b=>{b.onclick=()=>{if(done)return;pick=pick===b.dataset.c?null:b.dataset.c;sfx('click');render();};
      DRAG.make(b,{drop:tg=>{if(done||!tg.classList.contains('slot'))return false;fill[tg.dataset.k]=b.dataset.c;pick=null;sfx('drop');render();return true;}});});
    $$('.safew .slot').forEach(b=>b.onclick=()=>{if(done)return;const k=b.dataset.k;if(fill[k]!=null){delete fill[k];sfx('click');}else if(pick){fill[k]=pick;pick=null;sfx('drop');}render();});}
  $('#sfSub').onclick=()=>{if(done)return;const n0=SIG.length+ACC.length,f=Object.keys(fill).length;if(f<n0){setSt(st,'warn',`还有 ${n0-f} 个空格没填`);sfx('bad');return;}
    done=true;const tm=TEAM.cur,n=SIG.filter(k=>fill[k]===HAZ[k]).length+ACC.filter(a=>fill[a[0]]===a[2]).length;render();
    if(n===n0){teamAdd(5,tm);sfx('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部正确 +5</b>　烫伤用冷水冲，酒精着火用湿抹布盖。`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}对了 ${n} / ${n0}，不加分</b>　绿色小字是正确答案。点“变式练习”巩固。`);VB.hot(true);VARS.arm(st,VB.o,'实验室安全');}teamNext();};
  $('#sfReset').onclick=deal;deal();
  const q=qPanel($('#sfQ'),QB.safety,{src:'安全小测'});$('#sfReset').addEventListener('click',()=>q.reset());
  notes('safety','实验室安全',['取用药品“三不”：不能用手接触药品，不要把鼻孔凑到容器口闻气味，不得尝任何药品的味道。','剩余药品不能放回原瓶，不要随意丢弃，不要拿出实验室，要放入<mark>指定的容器</mark>。','酒精在桌上燃烧 → <mark>湿抹布盖灭</mark>；烫伤 → 大量冷水冲洗。','药液溅进眼睛 → 立即<mark>用水冲洗</mark>，切不可用手揉；药液沾到皮肤 → 用<mark>较多的水</mark>冲洗。'],
    '酒精着火不能用水浇，要用湿抹布盖灭。',
    (ctx,w,h)=>{const sz=Math.min(w/3.3,h/2.6);SIG.forEach((k,i)=>{const x=w*(.18+(i%3)*.32),y=h*(i<3?.06:.52);const im=SIGNIMG[k];if(im.complete)ctx.drawImage(im,x-sz/2,y,sz,sz);hand(ctx,HAZ[k],x,y+sz+12,{size:13,col:PEN.ink});});});
  return{};})();

/* 演示后的“找错误”检查项（舞台右上角）：aspects=[{k,lab,bad,why}]，getE() 返回本次演示的错误 {k:true/false}；选出做错的几处，提交判分 +5 */
function errPanel(box,{aspects,getE,onReplay}){let pick=new Set(),phase='hidden';
  function render(){const a=aspects(),E=getE(),done=phase==='judged';
    box.innerHTML=`<h5>这次演示，哪几处做错了？</h5><div class="fopts">${a.map(x=>{const sel=pick.has(x.k),err=E[x.k];const cls=done?(sel===err?' ok':' no'):'';
      return`<button class="fopt${sel?' sel':''}${cls}" data-k="${x.k}"><b>${x.lab}</b>${done?`<em>${err?'✗ '+x.bad+'：'+x.why:'✓ 这一步做对了'}</em>`:''}</button>`;}).join('')}</div>
      <div class="row"><button class="btn sm" data-a="replay">重播</button><button class="btn pri sm" data-a="sub"${done?' disabled':''}>提交</button></div><div class="status">${done?'':'可以多选；看不清就点“重播”。'}</div>`;
    $$('.fopt',box).forEach(b=>b.onclick=()=>{if(phase!=='ask')return;const k=b.dataset.k;pick.has(k)?pick.delete(k):pick.add(k);sfx('click');render();});
    $('[data-a="replay"]',box).onclick=()=>{box.hidden=true;onReplay();};
    $('[data-a="sub"]',box).onclick=()=>{if(phase!=='ask')return;const a=aspects(),E=getE(),tm=TEAM.cur,ok=a.every(x=>pick.has(x.k)===!!E[x.k]);phase='judged';render();const st=$('.status',box);
      if(ok){teamAdd(5,tm);sfx('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部找对 +5</b>`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}没有全部找对，不加分</b>　红框是这次做错的地方。`);}teamNext();};}
  return{show(){pick=new Set();phase='ask';box.hidden=false;render();},back(){box.hidden=false;render();},reset(){phase='hidden';pick=new Set();box.hidden=true;},get judged(){return phase==='judged';}};}
/* ================= 7 药品的取用：自动演示一段（随机带几处错误）的完整操作，学生找出做错的地方 =================
   演示过程中不出任何文字提示；演示完弹出检查项，学生选出做错的几处，提交判分（+5），再标出错误位置和后果。“看正确操作”播放规范做法。 */
S.take=(()=>{const cv=$('#cvTake'),box=$('#tkFind');let t=0,mode=0,A=null,G=null,E=null,phase='idle',pick=new Set();
  // 真实比例：试管直径约 1.8 cm（40 px），UT 为每厘米像素数；试剂瓶直径约 5.2 cm
  const UT=20/.9,BS=2.0,SS=2.4,TUBE={mx:300,my:200,L:320,d:40},TH=-2.0,TABLE=540;
  const ASP=[
    [{k:'stop',lab:'瓶塞的放法',bad:'瓶塞正放在桌上',why:'瓶塞沾上桌面的杂质，塞回去会污染试剂；应倒放'},
     {k:'label',lab:'标签的朝向',bad:'标签没有朝向手心',why:'残液沿瓶外壁流下，腐蚀标签；应朝向手心'},
     {k:'mouth',lab:'瓶口与试管口',bad:'瓶口没有紧挨试管口',why:'液体洒到桌上；瓶口应紧挨试管口'},
     {k:'tilt',lab:'试管的拿法',bad:'试管竖直，没有倾斜',why:'液体直接冲下，容易溅出；试管应略倾斜'}],
    [{k:'tube',lab:'试管的放法',bad:'试管直立，固体直接投入',why:'固体落下砸破试管底；应先横放，放在管口再慢慢竖立'},
     {k:'tool',lab:'取用固体的仪器',bad:'用药匙取块状固体',why:'块状固体用镊子夹取，药匙用来取粉末'}],
    [{k:'pos',lab:'滴加时滴管的位置',bad:'滴管伸入试管内',why:'滴管被沾污，放回滴瓶会污染整瓶试剂；应垂直悬空在试管口正上方'},
     {k:'after',lab:'滴管用后的处理',bad:'用后平放在桌面上',why:'残液倒流，腐蚀胶帽；滴瓶上的滴管用后应插回原瓶'}]];
  const DUR=[8,6,7];
  function randErr(){const a=ASP[mode];let e;do{e={};a.forEach(x=>e[x.k]=Math.random()<.5);}while(!a.some(x=>e[x.k]));return e;}
  const noErr=()=>{const e={};ASP[mode].forEach(x=>e[x.k]=false);return e;};
  const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
  /* ---------- 倾倒液体 ---------- */
  const tubeA=e=>e&&e.tilt?.04:.62;
  const bottleIdle=()=>({x:570,y:TABLE-96*BS,a:0});
  const bottlePour=e=>({x:TUBE.mx+(e.mouth?48:8),y:TUBE.my+(e.mouth?-44:-6),a:TH});
  /* 细口瓶：口在 (x,y)，按 a 倾斜；液体按重力画；握瓶的手在 +x 一侧（手心一侧）；标签在 lab=+1（手心一侧）或 -1；残液流在倾倒时的下侧（-x） */
  function bottleAt(ctx,x,y,a,{rem=1,lab=1,drip=0,stopper=null,dirt=false,held=false}={}){const s=BS,w=58*s,hh=96*s,nw=11*s;
    const path=()=>{ctx.beginPath();ctx.moveTo(-nw,0);ctx.lineTo(-nw,10*s);ctx.quadraticCurveTo(-w/2,14*s,-w/2,30*s);ctx.lineTo(-w/2,hh-6*s);ctx.quadraticCurveTo(-w/2,hh,-w/2+6*s,hh);ctx.lineTo(w/2-6*s,hh);ctx.quadraticCurveTo(w/2,hh,w/2,hh-6*s);ctx.lineTo(w/2,30*s);ctx.quadraticCurveTo(w/2,14*s,nw,10*s);ctx.lineTo(nw,0);};
    ctx.save();ctx.translate(x,y);ctx.rotate(a);if(held)drawHand(ctx,'bottle','back',0,hh*.8,0,UT);path();ctx.fillStyle=GL_F;ctx.fill();
    ctx.save();path();ctx.rotate(-a);ctx.translate(-x,-y);ctx.clip();const by=y+Math.cos(a)*hh*.92,tilt=Math.min(1,Math.abs(a)/1.6);
    const ly=lerp(by-rem*72*s,Math.min(y+6,by)-rem*30*s,tilt);ctx.fillStyle=SOL;ctx.fillRect(x-300,ly,600,600);ctx.restore();
    path();ctx.strokeStyle=GL_S;ctx.lineWidth=2.2;ctx.stroke();
    // 标签
    const lx=lab>0?4*s:-w/2+3*s,lw=w/2-7*s;ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.fillRect(lx,40*s,lw,26*s);ctx.strokeRect(lx,40*s,lw,26*s);
    ctx.save();ctx.translate(lx+lw/2,53*s);ctx.rotate(-a>1.2?Math.PI:0);hand(ctx,'试剂',0,0,{size:14});ctx.restore();
    // 残液：贴着瓶外壁从瓶口沿下侧（-x）往下流；流过标签时把标签腐蚀变色
    if(drip>0){const L=lab<0?drip*58*s:drip*16*s;ctx.save();path();ctx.clip();ctx.strokeStyle='rgba(110,170,215,.75)';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-nw+3,4*s);ctx.quadraticCurveTo(-w/2+4,14*s,-w/2+6,Math.min(hh-8*s,(14*s+L)));ctx.stroke();ctx.restore();
      if(lab<0&&drip>.55){const k=(drip-.55)/.45;ctx.fillStyle=`rgba(150,105,40,${.55*k})`;ctx.beginPath();ctx.ellipse(-w/2+12*s,52*s,7*s,12*s*k,0,0,TAU);ctx.fill();}}
    glassHi(ctx,w*.34,32*s,w*.34,hh-10*s,3,.6);
    if(held)drawHand(ctx,'bottle','front',0,hh*.8,0,UT);
    if(stopper){AP.stopper(ctx,0,12*SS,SS,false);if(dirt){ctx.fillStyle='#6b4f2a';[[-9,4],[-3,8],[4,3],[9,7]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(dx,dy,2,0,TAU);ctx.fill();});}}
    ctx.restore();}
  function drawPour(ctx,k){const e=E||noErr(),T=TUBE,a0=tubeA(E),bi=bottleIdle(),SP=[680,TABLE],pp=bottlePour(e);
    let bp=bi,rem=1,vol=0,spill=0,drip=0,held=false,stop={on:true};
    if(A||phase!=='idle'){const kk=A?k:1;
      const s1=seg(kk,0,.08),s2=seg(kk,.08,.14),mv=kk<.66?seg(kk,.16,.3):1-seg(kk,.66,.78),pr=seg(kk,.32,.62),dr=seg(kk,.6,.86),b1=seg(kk,.86,.93),b2=seg(kk,.93,1);
      held=mv>.02;bp={x:lerp(bi.x,pp.x,mv),y:lerp(bi.y,pp.y,mv),a:lerp(0,pp.a,mv)};rem=1-.5*pr;if(e.mouth)spill=pr;else vol=pr;drip=dr;
      // 瓶塞：拔出 → 放到桌上（正放 / 倒放）→ 拿回 → 塞紧
      const top=[bi.x,bi.y-110];
      if(kk<.14){stop={on:false,x:kk<.08?bi.x:lerp(top[0],SP[0],s2),y:kk<.08?lerp(bi.y+12*SS,top[1],s1):lerp(top[1],SP[1],s2)-Math.sin(s2*Math.PI)*40,inv:false};}
      else if(kk<.86)stop={on:false,x:SP[0],y:SP[1],inv:!e.stop};
      else if(kk<1){stop={on:false,x:kk<.93?lerp(SP[0],top[0],b1):top[0],y:kk<.93?lerp(SP[1],top[1],b1)-Math.sin(b1*Math.PI)*40:lerp(top[1],bi.y+12*SS,b2),inv:false};}
      else stop={on:true};}
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,TABLE,1000,8);
    if(spill>0){ctx.fillStyle='rgba(150,200,235,.6)';ctx.beginPath();ctx.ellipse(pp.x-4,TABLE+2,20+spill*80,4+spill*5,0,0,TAU);ctx.fill();}
    const r=T.d/2,u=[-Math.sin(a0),Math.cos(a0)],low=T.my+u[1]*(T.L-r)+r;
    testTube(ctx,T.mx,T.my,T.L,T.d,a0);if(vol>0){ctx.save();tubeClip(ctx,T.mx,T.my,T.L,T.d,a0);ctx.fillStyle=SOL;ctx.fillRect(0,low-vol*62,1000,200);ctx.restore();testTube(ctx,T.mx,T.my,T.L,T.d,a0,{col:'rgba(0,0,0,0)'});}
    if(A&&k>.32&&k<.62){ctx.strokeStyle=SOL;ctx.lineCap='round';ctx.lineWidth=5;ctx.beginPath();
      if(!e.mouth){const n=[Math.cos(a0),Math.sin(a0)];ctx.moveTo(pp.x,pp.y+4);ctx.lineTo(T.mx+n[0]*14,T.my+n[1]*14);ctx.lineTo(T.mx+n[0]*14+u[0]*(T.L-40),T.my+n[1]*14+u[1]*(T.L-40));}
      else{ctx.moveTo(pp.x-2,pp.y+4);for(let yy=pp.y;yy<TABLE;yy+=10)ctx.lineTo(pp.x-2+Math.sin(yy*.08+t*20)*1.5,yy);}
      ctx.stroke();if(e.mouth)for(let i=0;i<5;i++){const p=(t*2.2+i/5)%1;drop(ctx,pp.x-2+(i-2)*14*p,TABLE-34*Math.sin(p*Math.PI),3.4,SOL);}
      if(e.tilt&&!e.mouth){for(let i=0;i<4;i++){const p=(t*2.6+i/4)%1;drop(ctx,T.mx+(i-1.5)*16*p,T.my-24*Math.sin(p*Math.PI)+p*30,3,SOL);}}}
    const dirty=e.stop&&(A?k>.14:phase!=='idle');
    if(!stop.on){AP.stopper(ctx,stop.x,stop.y,SS,stop.inv);if(dirty){ctx.fillStyle='#6b4f2a';const by=stop.inv?stop.y-20*SS:stop.y;[[-9,1],[-3,-1],[4,1],[9,-1]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(stop.x+dx,by+dy-1,2,0,TAU);ctx.fill();});}}
    bottleAt(ctx,bp.x,bp.y,bp.a,{rem,lab:e.label?-1:1,drip,stopper:stop.on,dirt:dirty,held});
    if(phase==='judged')marks(ctx,[['stop',bi.x,bi.y+4,30],['label',bi.x-38,bi.y+104,40],['mouth',pp.x,TABLE,70],['tilt',T.mx,T.my+160,60]]);}
  /* ---------- 块状固体 ---------- */
  function drawBlock(ctx,k){const e=E||noErr(),c=[300,360],L=320,d=40,lay=!e.tube;let a=lay?Math.PI/2:0,bs=null,crack=0,tool=null;
    const at=(a,sv)=>{const u=[-Math.sin(a),Math.cos(a)],m=[c[0]-u[0]*L/2,c[1]-u[1]*L/2];return[m[0]+u[0]*sv,m[1]+u[1]*sv];};
    const rest={x:600,y:300,ang:lay?Math.PI/2+.06:0};
    const kk=A?k:phase!=='idle'?1:0;
    if(lay){// 横放：工具沿试管轴线从管口送入 → 松开 → 退出 → 试管慢慢竖立，固体滑到底
      const m0=at(Math.PI/2,0),tip=[m0[0]-14,m0[1]],s1=seg(kk,0,.25),s2=seg(kk,.3,.42),rot=seg(kk,.45,.95);
      const tx=kk<.3?lerp(rest.x,tip[0],s1):lerp(tip[0],rest.x,s2);tool={x:tx,y:lerp(rest.y,tip[1],kk<.3?s1:1-s2),ang:Math.PI/2+.06,hold:kk<.27};
      a=Math.PI/2*(1-rot);bs=kk<.27?null:at(a,lerp(18,L-d/2-11,ease(rot)));}
    else{// 直立：工具从管口正上方竖直放下固体 → 固体自由落下
      const m0=at(0,0),s1=seg(kk,0,.25),fall=kk<.3?0:Math.min(1,(kk-.3)/.18);
      tool={x:lerp(rest.x,m0[0],s1),y:lerp(rest.y,m0[1]-6,s1),ang:0,hold:kk<.3};if(kk>=.5)tool={x:lerp(m0[0],rest.x,seg(kk,.5,.7)),y:lerp(m0[1]-6,rest.y,seg(kk,.5,.7)),ang:0,hold:false};
      if(kk>=.3)bs=at(0,lerp(-4,L-d/2-11,fall*fall));crack=kk>.48?1:0;if(A&&k>.48&&!A.hit){A.hit=1;sfx('boom');shake();}}
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,TABLE,1000,8);
    testTube(ctx,...at(a,0),L,d,a);
    if(crack){const b=at(0,L-4);ctx.strokeStyle=INK;ctx.lineWidth=1.6;[[-.9,26],[-.3,34],[.25,30],[.8,24],[1.6,18],[2.4,20]].forEach(([ag,l])=>{ctx.beginPath();ctx.moveTo(b[0],b[1]-6);let px=b[0],py=b[1]-6;for(let i=1;i<=3;i++){px+=Math.cos(ag-Math.PI/2+(i%2?.3:-.3))*l/3;py+=Math.sin(ag-Math.PI/2+(i%2?.3:-.3))*l/3;ctx.lineTo(px,py);}ctx.stroke();});
      ctx.fillStyle='rgba(200,225,240,.9)';ctx.strokeStyle=GL_S;[[-22,30,.4],[18,26,-.6],[2,34,.2]].forEach(([dx,dy,r])=>{ctx.save();ctx.translate(b[0]+dx,Math.min(TABLE-4,b[1]+dy));ctx.rotate(r);ctx.beginPath();ctx.moveTo(-6,-3);ctx.lineTo(6,-5);ctx.lineTo(3,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();});}
    if(bs)grain(ctx,bs[0],bs[1],10,4,'#8f8c86');
    if(tool){if(e.tool){AP.spatula(ctx,tool.x,tool.y,1.2,tool.ang);if(tool.hold){const p=[tool.x+Math.sin(tool.ang)*6,tool.y-Math.cos(tool.ang)*6];grain(ctx,p[0],p[1],9,4,'#8f8c86');}}
      else{AP.tweezers(ctx,tool.x,tool.y,1.1,tool.ang,tool.hold?.12:.3);if(tool.hold)grain(ctx,tool.x,tool.y,9,4,'#8f8c86');}}
    if(phase==='judged')marks(ctx,[['tube',c[0],c[1]+L/2-10,50],['tool',rest.x,rest.y-50,60]]);}
  /* ---------- 滴加液体 ---------- */
  function drawDrop(ctx,k){const e=E||noErr(),tx=300,tm=300,L=220,d=40,BX=560,top=200;
    const home=[BX,450,0],tgt=e.pos?[tx,tm+70,0]:[tx,tm-20,0],flat=[40,TABLE-14,Math.PI/2];
    const kk=A?k:phase!=='idle'?1:0;let p=home,dl=.6,drops=[],tint=0,back=0;
    if(kk>0){const q1=seg(kk,0,.1),q2=seg(kk,.1,.2),q3=seg(kk,.2,.3),q5=seg(kk,.55,.62),q6=seg(kk,.62,.75),q7=seg(kk,.75,.88);
      if(kk<.1)p=[BX,lerp(home[1],top,q1),0];else if(kk<.2)p=[lerp(BX,tx,q2),top,0];else if(kk<.55)p=[tx,lerp(top,tgt[1],q3),0];
      else if(kk<.62)p=[tx,lerp(tgt[1],top,q5),0];
      else if(e.after){p=kk<.75?[lerp(tx,flat[0],q6),lerp(top,flat[1]-40,q6),0]:[flat[0],lerp(flat[1]-40,flat[1],q7),lerp(0,flat[2],q7)];back=seg(kk,.86,1);}
      else{p=kk<.75?[lerp(tx,BX,q6),top,0]:[BX,lerp(top,home[1],q7),0];}
      dl=kk<.3?.6:kk<.55?.6-.35*seg(kk,.3,.55):.25;
      if(A&&kk>.3&&kk<.55){for(let i=0;i<3;i++){const f=((kk-.3)/.25*3-i);if(f>0&&f<1)drops.push([tx,lerp(tgt[1]+6,tm+L-40,f*f)]);}}
      tint=e.pos?seg(kk,.32,.5):0;}
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,TABLE,1000,8);AP.rack(ctx,tx,TABLE,1.1);
    testTube(ctx,tx,tm,L,d,0,{lv:.3,col:SOL2});
    drops.forEach(([x,y])=>drop(ctx,x,y,4,SOL));
    const back2=!e.after&&e.pos&&(kk>=.88);const bcol=back2?SOL2:SOL;
    AP.bottle(ctx,BX,TABLE,1.3,{stopper:'off',lv:.7,col:bcol,label:'滴瓶'});
    AP.dropper(ctx,p[0],p[1],1.2,p[2],{lv:dl,col:tint>.5?SOL2:SOL});
    if(tint>0){ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(p[2]);ctx.fillStyle=`rgba(150,110,200,${.8*tint})`;ctx.beginPath();ctx.ellipse(0,-6,3.2,8,0,0,TAU);ctx.fill();ctx.restore();}
    if(back>0){ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(p[2]);ctx.fillStyle=`rgba(110,170,215,${.85*back})`;ctx.beginPath();ctx.ellipse(0,-88*1.2,6,8*back,0,0,TAU);ctx.fill();ctx.restore();}
    if(phase==='judged')marks(ctx,[['pos',tx,tm+40,60],['after',e.after?flat[0]+50:BX,e.after?TABLE-10:420,70]]);}
  /* 判分后在画面上圈出做错的地方 */
  function marks(ctx,list){list.forEach(([k,x,y,r])=>{if(!E||!E[k])return;ctx.save();ctx.strokeStyle=BADC;ctx.lineWidth=3;ctx.setLineDash([9,6]);ctx.beginPath();ctx.ellipse(x,y,r,r*.8,0,0,TAU);ctx.stroke();ctx.restore();});}
  function draw(){const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G=scene(w,h,1000,600,70);const k=A?Math.min(1,(t-A.t0)/A.dur):0;
    ctx.save();ctx.translate(G.ox,G.oy);ctx.scale(G.k,G.k);[drawPour,drawBlock,drawDrop][mode](ctx,k);ctx.restore();
    if(A&&k>=1){const ok=A.ok;A=null;if(ok){phase='correct';stampOn(cv.parentNode.parentNode,'规范',true,'50%','24%');sfx('ok');}else{phase='ask';showAsk();}}
    if(phase==='idle'&&!A)hand(ctx,'点“播放演示”看一段操作，再找出做错的地方',w/2,28,{size:17,col:DIM});}
  /* 检查项（舞台右上角）：选出做错的几处，提交判分 */
  function showAsk(){pick=new Set();box.hidden=false;renderAsk();}
  function renderAsk(){const a=ASP[mode],done=phase==='judged';
    box.innerHTML=`<h5>这次演示，哪几处做错了？</h5><div class="fopts">${a.map(x=>{const sel=pick.has(x.k),err=E[x.k];const cls=done?(sel===err?' ok':' no'):'';
      return`<button class="fopt${sel?' sel':''}${cls}" data-k="${x.k}"><b>${x.lab}</b>${done?`<em>${err?'✗ '+x.bad+'：'+x.why:'✓ 这一步做对了'}</em>`:''}</button>`;}).join('')}</div>
      <div class="row"><button class="btn sm" data-a="replay">重播</button><button class="btn pri sm" data-a="sub"${done?' disabled':''}>提交</button></div><div class="status" id="tkSt">${done?'':'可以多选；看不清就点“重播”。'}</div>`;
    $$('.fopt',box).forEach(b=>b.onclick=()=>{if(phase!=='ask')return;const k=b.dataset.k;pick.has(k)?pick.delete(k):pick.add(k);sfx('click');renderAsk();});
    $('[data-a="replay"]',box).onclick=()=>{if(A)return;const keep=phase;A={t0:t,dur:DUR[mode],ok:false,keep};box.hidden=true;sfx('whoosh');};
    $('[data-a="sub"]',box).onclick=judge;}
  function judge(){if(phase!=='ask')return;const a=ASP[mode],tm=TEAM.cur,ok=a.every(x=>pick.has(x.k)===E[x.k]);phase='judged';renderAsk();const st=$('#tkSt');
    if(ok){teamAdd(5,tm);sfx('win');FX.confetti();setSt(st,'ok',`<b>${tname(tm)}全部找对 +5</b>`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}没有全部找对，不加分</b>　红框是这次做错的地方。`);}teamNext();}
  function play(newOne=true){if(A)return;stampOff(cv.parentNode.parentNode);box.hidden=true;if(newOne){E=randErr();phase='play';}A={t0:t,dur:DUR[mode],ok:false};sfx('whoosh');}
  function playOk(){if(A)return;stampOff(cv.parentNode.parentNode);box.hidden=true;E=noErr();phase='play';A={t0:t,dur:DUR[mode],ok:true};sfx('whoosh');}
  // 重播结束后回到原来的作答状态
  const _draw=draw;draw=function(){const k=A?Math.min(1,(t-A.t0)/A.dur):0;if(A&&A.keep&&k>=1){const kp=A.keep;A=null;phase=kp;box.hidden=false;renderAsk();}_draw();};
  function reset(){A=null;E=null;phase='idle';box.hidden=true;stampOff(cv.parentNode.parentNode);}
  const setMode=m=>{mode=m;reset();['#tkM0','#tkM1','#tkM2'].forEach((s,i)=>$(s).setAttribute('aria-pressed',String(i===m)));};
  [0,1,2].forEach(i=>$('#tkM'+i).onclick=()=>{setMode(i);sfx('click');});$('#tkGo').onclick=()=>play(true);$('#tkOk').onclick=playOk;
  const q=qPanel($('#tkQ'),QB.take,{src:'取用小测'});
  $('#tkReset').onclick=()=>{setMode(0);q.reset();};
  notes('take','药品的取用',['固体：粉末用<mark>药匙或纸槽</mark>（一斜、二送、三直立）；块状用<mark>镊子</mark>（一横、二放、三慢竖）。','倾倒液体：瓶塞<mark>倒放</mark>，标签<mark>朝向手心</mark>，瓶口<mark>紧挨</mark>试管口，试管略倾斜。','滴加液体：胶头滴管<mark>垂直悬空</mark>在容器口正上方；滴瓶上的滴管用后插回原瓶。','未说明用量：液体取 1～2 mL，固体盖满试管底部；剩余药品放入指定容器。'],
    '滴瓶上的滴管用后直接插回原瓶，不要冲洗。',
    (ctx,w,h)=>{const k=Math.min(w*.62/460,h*.78/420);ctx.save();ctx.translate(w*.02-190*k,h*.04-110*k);ctx.scale(k,k);const e=noErr();
      testTube(ctx,TUBE.mx,TUBE.my,TUBE.L,TUBE.d,.62);const pp=bottlePour({mouth:false});bottleAt(ctx,pp.x,pp.y,pp.a,{rem:.6,lab:1});ctx.restore();
      hand(ctx,'瓶塞倒放 · 标签朝手心 · 瓶口紧挨',w*.33,h*.9,{size:15,col:PEN.red});
      const x=w*.82,m=h*.42,s=Math.min(w,h)/330;testTube(ctx,x,m,110*s,20*s,0,{lv:.3,col:SOL2});AP.dropper(ctx,x,m-12*s,.62*s,0,{lv:.5,col:SOL});hand(ctx,'垂直悬空',x,h*.9,{size:15,col:PEN.red});});
  return{tick(dt){t+=dt;draw();},enter(){}};})();
