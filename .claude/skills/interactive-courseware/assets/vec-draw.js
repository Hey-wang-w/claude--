/* ================= 矢量绘图库：贴纸卡片、玻璃仪器、酒精灯与火焰、微观示意图（实心小球） =================
   舞台和题目里的图一律用矢量画（清晰、不费眼）；只有对战角色用像素精灵。
   玻璃仪器、酒精灯、火焰、杂质图形取自技能库 assets/lab-draw.js。 */
const GL_S='rgba(52,74,104,.85)',GL_F='rgba(222,236,246,.28)';
function waterCol(turb,{tint=0,a=1,yel=0}={}){
  const c0=[150,205,235],c1=[156,123,78],c2=[214,74,84],c3=[214,170,70];
  let c=c0.map((v,i)=>lerp(v,c1[i],turb));c=c.map((v,i)=>lerp(v,c2[i],tint));c=c.map((v,i)=>lerp(v,c3[i],yel*(1-turb)));
  const al=(.55+turb*.4+tint*.3)*a;return`rgba(${c.map(Math.round).join(',')},${Math.min(.95,al)})`;}
function glassHi(ctx,x1,y1,x2,y2,w=4,a=.75){ctx.save();ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
function metal(ctx,x1,y1,x2,y2,dark=false){const g=ctx.createLinearGradient(x1,y1,x2,y2);if(dark){g.addColorStop(0,'#5a5f68');g.addColorStop(.45,'#2e3239');g.addColorStop(1,'#1c1f24');}else{g.addColorStop(0,'#8d939c');g.addColorStop(.35,'#e6e9ee');g.addColorStop(.6,'#a2a8b1');g.addColorStop(1,'#6b717a');}return g;}
/* 贴纸卡片：圆角白卡 + 深色描边 + 错位硬投影 */
function sticker(ctx,x,y,w,h,{r=16,fill='#ffffff',lw=2.5,sh=5,ink=INK}={}){ctx.save();if(sh){ctx.fillStyle=ink;rr(ctx,x+sh,y+sh,w,h,r);ctx.fill();}
  ctx.fillStyle=fill;rr(ctx,x,y,w,h,r);ctx.fill();ctx.lineWidth=lw;ctx.strokeStyle=ink;ctx.stroke();ctx.restore();}
/* 圆角药丸标签 */
function pill(ctx,s,x,y,{size=17,fill='#ffffff',col=INK,font=BODY,weight=700,pad=12,lw=2}={}){ctx.save();ctx.font=`${weight} ${size}px ${font}`;const w=ctx.measureText(s).width+pad*2,h=size+12;
  ctx.fillStyle=INK;rr(ctx,x-w/2+2,y-h/2+2,w,h,h/2);ctx.fill();ctx.fillStyle=fill;rr(ctx,x-w/2,y-h/2,w,h,h/2);ctx.fill();ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();
  ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,x,y+1);ctx.restore();return w;}
/* 烧杯：cx 中心，by 杯底，w 宽，h 高；o.lv 液面占比，o.col 液体色 */
function beakerPath(ctx,cx,by,w,h){const l=cx-w/2,r=cx+w/2,t=by-h,rad=Math.min(10,w*.08);
  ctx.beginPath();ctx.moveTo(l-6,t-3);ctx.quadraticCurveTo(l,t,l,t+8);ctx.lineTo(l,by-rad);ctx.quadraticCurveTo(l,by,l+rad,by);ctx.lineTo(r-rad,by);ctx.quadraticCurveTo(r,by,r,by-rad);ctx.lineTo(r,t+4);ctx.quadraticCurveTo(r,t,r+4,t-2);}
function beaker(ctx,cx,by,w,h,o={}){const l=cx-w/2,t=by-h,lv=o.lv||0;
  ctx.save();beakerPath(ctx,cx,by,w,h);ctx.fillStyle=GL_F;ctx.fill();
  if(lv>0){ctx.save();beakerPath(ctx,cx,by,w,h);ctx.clip();const ly=by-h*lv;ctx.fillStyle=o.col||waterCol(0);ctx.fillRect(l-8,ly,w+16,by-ly+2);
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(l+2,ly+1);ctx.lineTo(l+w-2,ly+1);ctx.stroke();ctx.restore();}
  beakerPath(ctx,cx,by,w,h);ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.stroke();
  glassHi(ctx,l+w*.84,t+16,l+w*.84,by-14,Math.max(3,w*.035),.75);ctx.restore();}
/* 试管：管口中心 (mx,my)，朝向角 ang（0 = 管口朝上），长 L、管径 d；lv 液面占比；mouthDown 时管口朝下（验纯） */
function testTube(ctx,mx,my,L,d,ang=0,{lv=0,col=waterCol(0),gas=null}={}){ctx.save();ctx.translate(mx,my);ctx.rotate(ang);
  const r=d/2,path=()=>{ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(-r,L-r);ctx.arc(0,L-r,r,Math.PI,0,true);ctx.lineTo(r,0);};
  path();ctx.fillStyle=gas||GL_F;ctx.fill();
  if(lv>0){ctx.save();path();ctx.clip();ctx.fillStyle=col;ctx.fillRect(-r-2,L*(1-lv),d+4,L*lv+2);ctx.restore();}
  path();ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.stroke();
  ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r-3,1);ctx.lineTo(-r+1,1);ctx.moveTo(r-1,1);ctx.lineTo(r+3,1);ctx.stroke();// 卷边管口
  glassHi(ctx,-r*.45,6,-r*.45,L-r*1.2,Math.max(2,r*.28),.85);glassHi(ctx,r*.5,L*.25,r*.5,L*.45,1.6,.55);
  ctx.restore();}
/* 酒精灯：cx 中心，by 底，s 缩放，lit 是否点燃 */
function lamp(ctx,cx,by,s,lit,t,capOn=false){ctx.save();ctx.translate(cx,by);ctx.scale(s,s);
  ctx.fillStyle='rgba(31,42,68,.12)';ctx.beginPath();ctx.ellipse(0,4,62,8,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.moveTo(-58,0);ctx.bezierCurveTo(-66,-40,-48,-74,-16,-80);ctx.lineTo(16,-80);ctx.bezierCurveTo(48,-74,66,-40,58,0);ctx.closePath();
  const g=ctx.createLinearGradient(-60,0,60,0);g.addColorStop(0,'rgba(200,225,238,.75)');g.addColorStop(.3,'rgba(240,250,255,.55)');g.addColorStop(1,'rgba(170,200,220,.75)');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.stroke();
  ctx.save();ctx.clip();ctx.fillStyle='rgba(120,190,225,.5)';ctx.fillRect(-70,-38,140,40);ctx.restore();
  glassHi(ctx,-40,-50,-46,-14,4,.75);
  rr(ctx,-14,-94,28,16,3);ctx.fillStyle=metal(ctx,-14,0,14,0);ctx.fill();ctx.strokeStyle='rgba(31,42,68,.5)';ctx.lineWidth=1;ctx.stroke();
  ctx.strokeStyle='#efe6cf';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,-94);ctx.lineTo(0,-104);ctx.stroke();ctx.strokeStyle='#2a2a2a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-103);ctx.lineTo(0,-107);ctx.stroke();
  if(capOn){ctx.beginPath();ctx.moveTo(-20,-90);ctx.lineTo(-17,-128);ctx.quadraticCurveTo(0,-140,17,-128);ctx.lineTo(20,-90);ctx.closePath();ctx.fillStyle='rgba(210,230,240,.6)';ctx.fill();ctx.strokeStyle=GL_S;ctx.stroke();}
  if(lit)flame(ctx,0,-106,1,t);ctx.restore();}
function flame(ctx,x,y,k,t){const f=1+.06*Math.sin(t*23)+.04*Math.sin(t*37),sw=Math.sin(t*9)*2.5;ctx.save();ctx.translate(x,y);ctx.scale(k,k*f);
  const glw=ctx.createRadialGradient(0,-30,4,0,-30,70);glw.addColorStop(0,'rgba(255,190,90,.35)');glw.addColorStop(1,'rgba(255,190,90,0)');ctx.fillStyle=glw;ctx.beginPath();ctx.arc(0,-30,70,0,TAU);ctx.fill();
  const shape=(w,h,dx)=>{ctx.beginPath();ctx.moveTo(-w,0);ctx.bezierCurveTo(-w*1.1,-h*.4,-w*.4+dx*.5,-h*.75,dx,-h);ctx.bezierCurveTo(w*.4+dx*.5,-h*.75,w*1.1,-h*.4,w,0);ctx.quadraticCurveTo(0,w*.5,-w,0);};
  let g=ctx.createLinearGradient(0,0,0,-78);g.addColorStop(0,'rgba(255,150,40,.95)');g.addColorStop(.6,'rgba(255,190,80,.8)');g.addColorStop(1,'rgba(255,230,160,0)');shape(15,78,sw);ctx.fillStyle=g;ctx.fill();
  g=ctx.createLinearGradient(0,0,0,-48);g.addColorStop(0,'rgba(255,245,200,.95)');g.addColorStop(1,'rgba(255,215,110,.2)');shape(9,48,sw*.6);ctx.fillStyle=g;ctx.fill();
  g=ctx.createLinearGradient(0,0,0,-22);g.addColorStop(0,'rgba(70,120,255,.85)');g.addColorStop(1,'rgba(120,160,255,0)');shape(6,22,0);ctx.fillStyle=g;ctx.fill();ctx.restore();}
function drop(ctx,x,y,r,col){ctx.save();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-r*1.8);ctx.bezierCurveTo(x+r*.9,y-r*.6,x+r,y+r*.2,x,y+r);ctx.bezierCurveTo(x-r,y+r*.2,x-r*.9,y-r*.6,x,y-r*1.8);ctx.fill();ctx.fillStyle='rgba(255,255,255,.65)';ctx.beginPath();ctx.arc(x-r*.3,y-r*.1,r*.25,0,TAU);ctx.fill();ctx.restore();}
function grain(ctx,x,y,r,seed=1,col='#8a6a43'){const R=rng(seed*97+13);ctx.save();ctx.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU,r2=r*(.7+.35*R());ctx.lineTo(x+Math.cos(a)*r2,y+Math.sin(a)*r2*.85);}ctx.closePath();
  const g=ctx.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r*1.1);g.addColorStop(0,shade(col,.35));g.addColorStop(1,shade(col,-.35));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=shade(col,-.5);ctx.lineWidth=.8;ctx.stroke();ctx.restore();}
function bacterium(ctx,x,y,L,ang,t,col='#5f9e74'){const W=L*.42;ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.strokeStyle=shade(col,-.45);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(L/2,0);for(let k=0;k<=10;k++)ctx.lineTo(L/2+k*1.6,Math.sin(k*1.2+t*14)*W*.35);ctx.stroke();
  rr(ctx,-L/2,-W/2,L,W,W/2);const g=ctx.createLinearGradient(0,-W/2,0,W/2);g.addColorStop(0,shade(col,.4));g.addColorStop(1,shade(col,-.25));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=shade(col,-.45);ctx.lineWidth=1.2;ctx.stroke();ctx.restore();}
function pigmentMol(ctx,x,y,r=5){ctx.save();ctx.fillStyle='#d9902f';ctx.strokeStyle='#8f5a14';ctx.lineWidth=1;[[0,0],[r*1.1,r*.5],[r*.2,r*1.15]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx-r*.4,y+dy-r*.5,r*.72,0,TAU);ctx.fill();ctx.stroke();});ctx.restore();}
function odorMol(ctx,x,y,r=5,t=0){ctx.save();ctx.fillStyle='#8d5fb0';ctx.strokeStyle='#5b3478';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(141,95,176,.85)';ctx.lineWidth=1.3;[-1,1].forEach(sd=>{ctx.beginPath();for(let k=0;k<=8;k++){const yy=y-r-2-k*1.4,xx=x+sd*r*.55+Math.sin(k*.9+t*6)*1.6;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();});ctx.restore();}
/* 实心小球（带高光）：用于微观示意图和氢分子 */
function ball(ctx,x,y,r,base,{ink=INK,lw=1.6}={}){ctx.save();const g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,shade(base,.55));g.addColorStop(.55,base);g.addColorStop(1,shade(base,-.35));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.lineWidth=lw;ctx.strokeStyle=ink;ctx.stroke();ctx.restore();}
/* ---------- 微观示意图：○（浅色小球）和 ●（深色小球）两种原子；spec=[['A2',3],['B',2]]，按种子固定排布 ---------- */
const MICRO={A:[[0,0]],B:[[0,0]],A2:[[-1,0],[1,0]],B2:[[-1,0],[1,0]],AB:[[-1,0],[1,0]],AB2:[[0,0],[-1.55,.95],[1.55,.95]],A2B:[[0,0],[-1.55,.95],[1.55,.95]],A3:[[-1.1,.6],[1.1,.6],[0,-1.2]]};
const MICROK={A:'A',B:'B',A2:'AA',B2:'BB',AB:'AB',AB2:'ABB',A2B:'BAA',A3:'AAA'};
const MCOL={A:'#f2f4f8',B:'#3b4f7a'};
function drawMicro(ctx,x,y,w,h,spec,seed=1,{frame=true,r=0}={}){const R=r||Math.max(6,Math.min(w,h)/12),rnd=rng(seed*7919+13);
  if(frame){ctx.save();ctx.fillStyle='#ffffff';rr(ctx,x,y,w,h,10);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();ctx.restore();}
  const mols=[];spec.forEach(([k,n])=>{for(let i=0;i<n;i++)mols.push(k);});
  for(let i=mols.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[mols[i],mols[j]]=[mols[j],mols[i]];}
  const cols=Math.ceil(Math.sqrt(mols.length*w/h)),rows=Math.ceil(mols.length/cols),cw=w/cols,ch=h/rows;
  mols.forEach((k,i)=>{const cx=x+cw*(i%cols+.5)+(rnd()-.5)*cw*.1,cy=y+ch*(Math.floor(i/cols)+.5)+(rnd()-.5)*ch*.1,rot=rnd()*Math.PI;
    const pts=MICRO[k].map(([dx,dy],j)=>({x:cx+(dx*Math.cos(rot)-dy*Math.sin(rot))*R*.92,y:cy+(dx*Math.sin(rot)+dy*Math.cos(rot))*R*.92,a:MICROK[k][j]}));
    pts.sort((p,q)=>p.y-q.y).forEach(p=>ball(ctx,p.x,p.y,p.a==='A'?R:R*.9,MCOL[p.a]));});}
const microPic=(spec,seed=1)=>(ctx,w,h)=>{const s=Math.min(h-8,w*.5);drawMicro(ctx,(w-s*1.4)/2,4,s*1.4,s,spec,seed);};
/* 水流：沿折线画，带流动的高光虚线 */
function stream(ctx,pts,col,w,t){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  ctx.setLineDash([6,14]);ctx.lineDashOffset=-t*80;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=Math.max(1,w*.35);ctx.stroke();ctx.restore();}
/* 静态小画布（微观图卡片、题目配图）：只画一次的画布按“版面尺寸 × 当前缩放 × 设备像素比（至少 2 倍）”绘制，
   窗口大小变化（如进入全屏）后自动重画——否则先在小窗口里画好的图放大后会发虚，要点一下才清晰。 */
const STATIC=new Set();
function paintStatic(cv,fn){cv._paint=fn;STATIC.add(cv);const w=cv.offsetWidth,h=cv.offsetHeight;if(!w||!h){requestAnimationFrame(()=>paintStatic(cv,fn));return;}
  const app=$('#app'),k=(app.getBoundingClientRect().width/app.offsetWidth)||1,dpr=Math.max(2,(window.devicePixelRatio||1)*k);
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);fn(ctx,w,h);}
addEventListener('resize',()=>{clearTimeout(paintStatic._t);paintStatic._t=setTimeout(()=>{STATIC.forEach(cv=>{if(!cv.isConnected){STATIC.delete(cv);return;}paintStatic(cv,cv._paint);});},150);});
/* 按宽度把文字拆成多行（文本框高度随行数自适应用） */
function wrapLines(ctx,s,maxW,font){ctx.save();ctx.font=font;const out=[];let line='';for(const ch of s){if(line&&ctx.measureText(line+ch).width>maxW){out.push(line);line=ch;}else line+=ch;}if(line)out.push(line);ctx.restore();return out;}
