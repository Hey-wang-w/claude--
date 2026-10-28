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

/* ================= 7 药品的取用：倾倒液体 / 块状固体 / 滴加液体（错误操作真实发生，看后果） ================= */
S.take=(()=>{const cv=$('#cvTake');let t=0,mode=0,A=null,res=null,G=null;
  const P={inv:false,palm:false,touch:false},B={lay:false},D={pos:'in'};
  const DPOS={in:'伸入试管内',touch:'接触试管内壁',air:'垂直悬空在试管口正上方'};
  // 真实比例：试管直径约 1.8 cm（40 px），UT 为每厘米像素数；试剂瓶直径约 5.2 cm
  const UT=20/.9,BS=2.0,TUBE={mx:400,my:200,L:320,d:40,a:.62},TH=-2.0;
  const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
  const bottleIdle=()=>({x:760,y:540-96*BS,a:0});
  const bottlePour=()=>({x:TUBE.mx+(P.touch?8:78),y:TUBE.my+(P.touch?-6:-62),a:TH});
  /* 细口瓶：口在 (x,y)，按角度 a 倾斜；液体按重力方向画；hand 画在 +x 一侧；label 在 palm ? +x : -x */
  function bottleAt(ctx,x,y,a,{rem=1,stain=0,drip=0,stopper=null,held=false}={}){const s=BS,w=58*s,hh=96*s,nw=11*s;
    const path=()=>{ctx.beginPath();ctx.moveTo(-nw,0);ctx.lineTo(-nw,10*s);ctx.quadraticCurveTo(-w/2,14*s,-w/2,30*s);ctx.lineTo(-w/2,hh-6*s);ctx.quadraticCurveTo(-w/2,hh,-w/2+6*s,hh);ctx.lineTo(w/2-6*s,hh);ctx.quadraticCurveTo(w/2,hh,w/2,hh-6*s);ctx.lineTo(w/2,30*s);ctx.quadraticCurveTo(w/2,14*s,nw,10*s);ctx.lineTo(nw,0);};
    ctx.save();ctx.translate(x,y);ctx.rotate(a);if(held)drawHand(ctx,'bottle','back',0,hh*.8,0,UT);path();ctx.fillStyle=GL_F;ctx.fill();
    // 液体（世界坐标的水平液面）
    ctx.save();path();ctx.rotate(-a);ctx.translate(-x,-y);ctx.clip();const bx=x-Math.sin(a)*hh*.92,by=y+Math.cos(a)*hh*.92,tilt=Math.min(1,Math.abs(a)/1.6);
    const ly=lerp(by-rem*72*s,Math.min(y+6,by)-rem*30*s,tilt);ctx.fillStyle=SOL;ctx.fillRect(x-200,ly,400,400);ctx.restore();
    path();ctx.strokeStyle=GL_S;ctx.lineWidth=2.2;ctx.stroke();
    // 标签
    const sx=P.palm?1:-1;ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=1;const lx=sx>0?4*s:-w/2+3*s;ctx.fillRect(lx,33*s,w/2-7*s,24*s);ctx.strokeRect(lx,33*s,w/2-7*s,24*s);
    ctx.save();ctx.translate(lx+(w/2-7*s)/2,45*s);ctx.rotate(-a>1.2?Math.PI:0);hand(ctx,'试剂',0,0,{size:14});ctx.restore();
    if(stain>0&&!P.palm){ctx.fillStyle=`rgba(150,105,40,${.55*stain})`;ctx.beginPath();ctx.ellipse(-w/2+12*s,45*s,8*s,12*s*stain,0,0,TAU);ctx.fill();}
    if(drip>0){ctx.strokeStyle='rgba(120,180,225,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-nw-1,2*s);ctx.quadraticCurveTo(-w/2-2,20*s,-w/2-1,(14+drip*60)*s);ctx.stroke();}
    glassHi(ctx,w*.34,32*s,w*.34,hh-10*s,3,.6);
    if(held)drawHand(ctx,'bottle','front',0,hh*.8,0,UT);
    if(stopper)AP.stopper(ctx,0,2*s,s*.95,false);
    ctx.restore();}
  function drawPour(ctx,k){const T=TUBE;let bp=bottleIdle(),rem=1,vol=0,spill=0,stain=0,drip=0,stopOn=0,held=false;
    if(A){const a1=seg(k,0,.18),a2=seg(k,.2,.66),a3=seg(k,.68,.82),a4=seg(k,.84,1);const pp=bottlePour(),bi=bottleIdle();
      const mv=k<.67?a1:1-a3;held=mv>.02;bp={x:lerp(bi.x,pp.x,mv),y:lerp(bi.y,pp.y,mv),a:lerp(0,pp.a,mv)};rem=1-.55*a2;if(P.touch)vol=a2;else spill=a2;drip=k>.7?seg(k,.7,.84):0;stain=seg(k,.74,.86);stopOn=a4;}
    else if(res){rem=.45;if(P.touch)vol=1;else spill=1;drip=1;stain=1;stopOn=1;}
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,540,1000,8);ctx.fillStyle='rgba(28,26,23,.08)';ctx.fillRect(0,548,1000,40);
    // 洒出的液体
    if(spill>0){ctx.fillStyle='rgba(150,200,235,.6)';ctx.beginPath();ctx.ellipse(bottlePour().x-4,542,20+spill*80,4+spill*5,0,0,TAU);ctx.fill();}
    // 试管 + 液体
    const r=T.d/2,u=[-Math.sin(T.a),Math.cos(T.a)],low=T.my+u[1]*(T.L-r)+r;
    testTube(ctx,T.mx,T.my,T.L,T.d,T.a);if(vol>0){ctx.save();tubeClip(ctx,T.mx,T.my,T.L,T.d,T.a);ctx.fillStyle=SOL;ctx.fillRect(0,low-vol*62,1000,200);ctx.restore();testTube(ctx,T.mx,T.my,T.L,T.d,T.a,{col:'rgba(0,0,0,0)'});}
    // 液流
    if(A&&k>.2&&k<.66){const pp=bottlePour();ctx.strokeStyle=SOL;ctx.lineCap='round';ctx.lineWidth=5;ctx.beginPath();
      if(P.touch){const n=[Math.cos(T.a),Math.sin(T.a)];ctx.moveTo(pp.x,pp.y+4);ctx.lineTo(T.mx+n[0]*14,T.my+n[1]*14);ctx.lineTo(T.mx+n[0]*14+u[0]*(T.L-40),T.my+n[1]*14+u[1]*(T.L-40));}
      else{ctx.moveTo(pp.x-2,pp.y+4);for(let yy=pp.y;yy<540;yy+=10)ctx.lineTo(pp.x-2+Math.sin(yy*.08+t*20)*1.5,yy);}
      ctx.stroke();if(!P.touch)for(let i=0;i<5;i++){const p=(t*2.2+i/5)%1;drop(ctx,pp.x-2+(i-2)*14*p,540-34*Math.sin(p*Math.PI),3.4,SOL);}}
    // 瓶塞
    const sp=[890,540];if(stopOn<1){const bi=bottleIdle();const x=lerp(sp[0],bi.x,stopOn),y=lerp(sp[1],bi.y+2,stopOn);AP.stopper(ctx,x,y,BS*.95,stopOn>0?false:P.inv);
      if(!P.inv&&(A||res)){ctx.fillStyle='#6b4f2a';[[-8,-1],[-2,0],[5,-2],[9,0]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx,y+dy-(stopOn>0?0:0),1.8,0,TAU);ctx.fill();});}}
    bottleAt(ctx,bp.x,bp.y,bp.a,{rem,stain,drip,stopper:stopOn>=1,held});
    if(stopOn>=1&&!P.inv){const bi=bottleIdle();ctx.fillStyle='#6b4f2a';[[-8,0],[-2,1],[5,-1],[9,1]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(bi.x+dx,bi.y+4+dy,1.8,0,TAU);ctx.fill();});ctx.strokeStyle=BADC;ctx.lineWidth=2;ctx.beginPath();ctx.arc(bi.x,bi.y+2,24,0,TAU);ctx.stroke();}
    if(!A&&!res){caption(ctx,`瓶塞：${P.inv?'倒放':'正放'}`,900,470,890,522);caption(ctx,`标签：${P.palm?'朝向手心':'背对手心'}`,890,300,P.palm?790:735,410);caption(ctx,`瓶口：${P.touch?'紧挨试管口':'离开试管口'}`,580,150,T.mx+6,T.my-4);hand(ctx,'倾倒时右手从右侧握住瓶身',890,268,{size:14,col:DIM});}
  }
  function drawBlock(ctx,k){const c=[450,360],L=320,d=40;let a=B.lay?Math.PI/2:0,bs=null,crack=0,tw=null;
    const at=(a,sv)=>{const u=[-Math.sin(a),Math.cos(a)],m=[c[0]-u[0]*L/2,c[1]-u[1]*L/2];return[m[0]+u[0]*sv,m[1]+u[1]*sv];};
    if(B.lay){if(A){const a1=seg(k,0,.25),a2=seg(k,.32,.9);a=Math.PI/2*(1-a2);const sv=lerp(14,L-d/2-11,ease(a2));bs=at(a,sv);tw=k<.3?{x:lerp(760,at(Math.PI/2,14)[0]+6,a1),y:lerp(300,at(Math.PI/2,14)[1]-4,a1)}:{x:760,y:300};}
      else if(res){a=0;bs=at(0,L-d/2-11);tw={x:760,y:300};}else{bs=null;tw={x:760,y:300};}}
    else{const mouth=at(0,0);if(A){const a1=seg(k,0,.22),fall=seg(k,.24,.42);tw={x:lerp(760,mouth[0]+4,a1),y:lerp(300,mouth[1]-30,a1)};if(k<.24)bs=[tw.x-4,tw.y+6];else{const sv=-24+(L-d/2-11+24)*Math.pow(Math.min(1,(k-.24)/.18),2);bs=at(0,sv);}crack=k>.42?1:0;
        if(k>.42&&!A.hit){A.hit=1;sfx('boom');shake();}}
      else if(res){bs=at(0,L-d/2-11);crack=1;tw={x:760,y:300};}else tw={x:760,y:300};}
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,540,1000,8);
    testTube(ctx,...at(a,0),L,d,a);
    if(crack){const b=at(0,L-4);ctx.strokeStyle=INK;ctx.lineWidth=1.6;[[-.9,26],[-.3,34],[.25,30],[.8,24],[1.6,18],[2.4,20]].forEach(([ag,l])=>{ctx.beginPath();ctx.moveTo(b[0],b[1]-6);let px=b[0],py=b[1]-6;for(let i=1;i<=3;i++){px+=Math.cos(ag-Math.PI/2+(i%2?.3:-.3))*l/3;py+=Math.sin(ag-Math.PI/2+(i%2?.3:-.3))*l/3;ctx.lineTo(px,py);}ctx.stroke();});
      ctx.fillStyle='rgba(200,225,240,.9)';ctx.strokeStyle=GL_S;[[ -22,40,.4],[18,48,-.6],[2,58,.2]].forEach(([dx,dy,r])=>{ctx.save();ctx.translate(b[0]+dx,b[1]+dy);ctx.rotate(r);ctx.beginPath();ctx.moveTo(-6,-3);ctx.lineTo(6,-5);ctx.lineTo(3,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();});}
    if(bs)grain(ctx,bs[0],bs[1],10,4,'#8f8c86');
    if(tw){AP.tweezers(ctx,tw.x,tw.y,1.1,-.5);if(!bs&&!res){grain(ctx,tw.x-2,tw.y+6,10,4,'#8f8c86');}}
    if(!A&&!res)caption(ctx,`试管：${B.lay?'先横放':'直立'}（点试管切换）`,B.lay?520:600,B.lay?470:160,B.lay?560:470,B.lay?382:222);
    hand(ctx,'块状固体（用镊子夹取）',820,350,{size:16,col:DIM});}
  function drawDrop(ctx,k){const tx=430,tm=300,L=220,d=40;let pos=null,lvB=1,tint=0,dirty=(res||A)&&D.pos!=='air';
    const PS={air:[tx,tm-20,0],in:[tx,tm+70,0],touch:[tx+13,tm+40,.1]},home=[770,450,0];
    let p=home,dl=.6,drops=[];
    if(A){const a1=seg(k,0,.22),a3=seg(k,.62,.82);const tgt=PS[D.pos];p=k<.6?[lerp(home[0],tgt[0],a1),lerp(home[1],tgt[1],a1),lerp(0,tgt[2],a1)]:[lerp(tgt[0],home[0],a3),lerp(tgt[1],home[1],a3),lerp(tgt[2],0,a3)];
      dl=k<.6?.6-.35*seg(k,.25,.6):.25;if(k>.25&&k<.6){for(let i=0;i<3;i++){const q=((k-.25)/.35*3-i);if(q>0&&q<1)drops.push([p[0],lerp(p[1]+6,tm+L-40,q*q)]);}}
      tint=dirty?seg(k,.3,.5):0;lvB=seg(k,.85,1);}else if(res){tint=dirty?1:0;dl=.25;lvB=1;}
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,540,1000,8);AP.rack(ctx,tx,540,1.1);
    testTube(ctx,tx,tm,L,d,0,{lv:.3,col:SOL2});ctx.fillStyle=SOL2;[[-12,24],[11,36],[-10,52]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(tx+dx,tm+dy,2.4,0,TAU);ctx.fill();});
    drops.forEach(([x,y])=>drop(ctx,x,y,4,SOL));
    // 滴瓶
    const bcol=dirty&&lvB>0&&(A?k>.85:true)?`rgba(${Math.round(lerp(150,196,lvB))},${Math.round(lerp(200,170,lvB))},${Math.round(lerp(235,226,lvB))},.82)`:SOL;
    AP.bottle(ctx,770,540,1.3,{stopper:'off',lv:.7,col:bcol,label:'滴瓶',brown:false});
    AP.dropper(ctx,p[0],p[1],1.2,p[2],{lv:dl,col:tint>.5?SOL2:SOL});if(tint>0){ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(p[2]);ctx.fillStyle=`rgba(150,110,200,${.8*tint})`;ctx.beginPath();ctx.ellipse(0,-6,3.2,8,0,0,TAU);ctx.fill();ctx.restore();}
    if(!A&&!res){caption(ctx,`滴管：${DPOS[D.pos]}`,640,220,700,300);hand(ctx,'试管中已有另一种溶液',tx,tm-62,{size:15,col:DIM});}}
  function draw(){const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G=scene(w,h,1000,600,70);const k=A?Math.min(1,(t-A.t0)/A.dur):0;
    ctx.save();ctx.translate(G.ox,G.oy);ctx.scale(G.k,G.k);[drawPour,drawBlock,drawDrop][mode](ctx,k);ctx.restore();
    if(A&&k>=1){A=null;res=result();sfx(res.every(r=>r[0])?'ok':'bad');if(res.every(r=>r[0]))stampOn($('#cvTake').parentNode.parentNode,'规范',true,'50%','30%');}
    dragHints(ctx,ui,G,()=>({bottle:[TUBE.mx,TUBE.my,56,'瓶口紧挨试管口'],tw:[B.lay?610:450,B.lay?360:200,60,'送到试管口'],dp:[430,270,50,'放到试管口上方']}),t);
    if(res)resultCard(ctx,w-340,20,320,'操作结果',res);
    else if(!A)hand(ctx,['点瓶塞、试剂瓶、试管口切换做法，再点“开始操作”（也可以把试剂瓶拖到试管口）','点试管切换“直立 / 横放”，再点“开始操作”（也可以把镊子拖到试管口）','点滴管切换位置，或把滴管拖到想放的位置，再点“开始操作”'][mode],w/2,28,{size:17,col:DIM});}
  function result(){if(mode===0)return[[P.inv,P.inv?'瓶塞倒放：瓶塞不沾杂质':'瓶塞正放：沾上桌面的杂质，盖回后污染试剂'],[P.palm,P.palm?'标签朝向手心：残液没有流到标签上':'标签背对手心：残液流下，腐蚀标签'],[P.touch,P.touch?'瓶口紧挨试管口：液体沿试管内壁流入':'瓶口离开试管口：液体洒在桌上']];
    if(mode===1)return[[B.lay,B.lay?'先横放，把固体放在管口，再慢慢竖立：固体缓缓滑到底部':'把块状固体直接投入直立的试管：砸破试管底']];
    return[[D.pos==='air',D.pos==='air'?'垂直悬空在试管口正上方：滴管不被沾污':`${DPOS[D.pos]}：滴管被沾污，放回滴瓶后污染整瓶试剂`]];}
  function go(){if(A)return;stampOff(cv.parentNode.parentNode);res=null;A={t0:t,dur:mode===0?6:mode===1?4.2:4.6};sfx('whoosh');}
  function reset(){A=null;res=null;stampOff(cv.parentNode.parentNode);}
  const setMode=m=>{mode=m;reset();['#tkM0','#tkM1','#tkM2'].forEach((s,i)=>$(s).setAttribute('aria-pressed',String(i===m)));};
  [0,1,2].forEach(i=>$('#tkM'+i).onclick=()=>{setMode(i);sfx('click');});$('#tkGo').onclick=go;
  const S2=(x,y)=>G?G.toS(x,y):[x,y];
  const ui=canvasUI(cv,{tools:()=>{if(!G||A)return[];const T=[];const tc=(sx,sy,r,id,fn)=>{const[x,y]=G.toC(sx,sy);T.push({id,x,y,r:r*G.k,draw:(ctx,x,y,gh)=>{if(!gh)return;ctx.save();ctx.translate(x,y);ctx.scale(G.k,G.k);ctx.globalAlpha=.85;fn(ctx);ctx.restore();}});};
      if(mode===0&&!res)tc(760,440,90,'bottle',ctx=>bottleAt(ctx,0,-96,0));
      if(mode===1&&!res)tc(760,260,50,'tw',ctx=>AP.tweezers(ctx,0,40,1.1,-.5));
      if(mode===2&&!res)tc(770,330,46,'dp',ctx=>AP.dropper(ctx,0,40,1.2,0,{lv:.6,col:SOL}));
      return T;},
    hots:()=>{if(!G||A)return[];const H=[],hb=(x0,y0,x1,y1,act)=>H.push({hit:(x,y)=>{const[sx,sy]=S2(x,y);return sx>x0&&sx<x1&&sy>y0&&sy<y1;},act});
      if(res){hb(0,0,1000,600,()=>{reset();sfx('click');});return H;}
      if(mode===0){hb(855,505,925,545,()=>{P.inv=!P.inv;sfx('click');});hb(830,450,980,490,()=>{P.inv=!P.inv;sfx('click');});hb(800,275,990,345,()=>{P.palm=!P.palm;sfx('click');});
        hb(350,140,460,240,()=>{P.touch=!P.touch;sfx('click');});hb(480,130,690,170,()=>{P.touch=!P.touch;sfx('click');});}
      if(mode===1)hb(300,150,620,560,()=>{B.lay=!B.lay;sfx('click');});
      if(mode===2)hb(560,190,720,250,()=>{const o=['in','touch','air'];D.pos=o[(o.indexOf(D.pos)+1)%3];sfx('click');});
      return H;},
    onTap:id=>{if(id==='bottle'){P.palm=!P.palm;sfx('click');}else if(id==='dp'){const o=['in','touch','air'];D.pos=o[(o.indexOf(D.pos)+1)%3];sfx('click');}else go();},
    onDrop:(id,x,y)=>{const[sx,sy]=S2(x,y);
      if(id==='bottle'){const d=Math.hypot(sx-TUBE.mx,sy-TUBE.my);if(d>200)return false;P.touch=d<60;go();return true;}
      if(id==='tw'){if(Math.hypot(sx-(B.lay?610:450),sy-(B.lay?360:200))>170)return false;go();return true;}
      if(id==='dp'){if(Math.abs(sx-430)>90||sy<150||sy>520)return false;D.pos=sy<300?'air':Math.abs(sx-430)>10?'touch':'in';go();return true;}
      return false;}});
  const q=qPanel($('#tkQ'),QB.take,{src:'取用小测'});
  $('#tkReset').onclick=()=>{P.inv=false;P.palm=false;P.touch=false;B.lay=false;D.pos='in';setMode(0);q.reset();};
  notes('take','药品的取用',['固体：粉末用<mark>药匙或纸槽</mark>（一斜、二送、三直立）；块状用<mark>镊子</mark>（一横、二放、三慢竖）。','倾倒液体：瓶塞<mark>倒放</mark>，标签<mark>朝向手心</mark>，瓶口<mark>紧挨</mark>试管口。','滴加液体：胶头滴管<mark>垂直悬空</mark>在容器口正上方。','未说明用量：液体取 1～2 mL，固体盖满试管底部；剩余药品放入指定容器。'],
    '滴瓶上的滴管用后直接插回原瓶，不要冲洗。',
    (ctx,w,h)=>{const k=Math.min(w*.62/460,h*.78/420);ctx.save();ctx.translate(w*.02-190*k,h*.04-110*k);ctx.scale(k,k);const sv={...P};P.inv=true;P.palm=true;P.touch=true;
      testTube(ctx,TUBE.mx,TUBE.my,TUBE.L,TUBE.d,TUBE.a);const pp=bottlePour();bottleAt(ctx,pp.x,pp.y,pp.a,{rem:.6});Object.assign(P,sv);ctx.restore();
      hand(ctx,'瓶塞倒放 · 标签朝手心 · 瓶口紧挨',w*.33,h*.9,{size:15,col:PEN.red});
      const x=w*.82,m=h*.42,s=Math.min(w,h)/330;testTube(ctx,x,m,110*s,20*s,0,{lv:.3,col:SOL2});AP.dropper(ctx,x,m-12*s,.62*s,0,{lv:.5,col:SOL});hand(ctx,'垂直悬空',x,h*.9,{size:15,col:PEN.red});});
  return{tick(dt){t+=dt;draw();},enter(){}};})();
