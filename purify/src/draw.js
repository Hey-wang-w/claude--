/* ================= 绘图库：画布（按版面像素绘制）、玻璃仪器、液体、火焰、过滤装置 ================= */
const HAND='"ZCOOL KuaiLe","Noto Sans SC",sans-serif';
const INK='#23262f',NAVY='#1f4e79',CIN='#c4492f',MOSS='#3f7d5a',MUST='#d9a62e',MUD='#8a6a43';
/* 画布：坐标用版面像素（不受整体缩放影响），清晰度按真实屏幕像素 */
function fitS(cv){
  const r=cv.getBoundingClientRect(),w=Math.max(1,cv.offsetWidth),h=Math.max(1,cv.offsetHeight),s=r.width/w||1;
  const dpr=Math.min(LOW?1:2,window.devicePixelRatio||1)*s;const W=Math.round(w*dpr),H=Math.round(h*dpr);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w,h,s};
}
const ptIn=(cv,e)=>{const r=cv.getBoundingClientRect(),s=r.width/cv.offsetWidth||1;return[(e.clientX-r.left)/s,(e.clientY-r.top)/s];};
const txt=(ctx,s,x,y,o={})=>label(ctx,s,x,y,Object.assign({col:INK,font:BODY,weight:500},o));
const hand=(ctx,s,x,y,o={})=>label(ctx,s,x,y,Object.assign({col:INK,font:HAND,weight:400},o));
/* 水的颜色：turb 0=澄清 1=浑浊；tint 色素（红） */
function waterCol(turb,{tint=0,a=1,yel=0}={}){
  const c0=[196,228,240],c1=[156,123,78],c2=[214,74,84],c3=[214,170,70];
  let c=c0.map((v,i)=>lerp(v,c1[i],turb));c=c.map((v,i)=>lerp(v,c2[i],tint));c=c.map((v,i)=>lerp(v,c3[i],yel*(1-turb)));
  const al=(.42+turb*.5+tint*.35+yel*.25*(1-turb))*a;return`rgba(${c.map(Math.round).join(',')},${Math.min(.95,al)})`;
}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);}
const GL_S='rgba(66,92,118,.78)',GL_F='rgba(222,236,246,.22)';
function glassHi(ctx,x1,y1,x2,y2,w=4,a=.75){ctx.save();ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
/* 烧杯：cx 中心，by 杯底，w 宽，h 高；o.lv 液面占比，o.col 液体色 */
function beakerPath(ctx,cx,by,w,h){const l=cx-w/2,r=cx+w/2,t=by-h,rad=Math.min(10,w*.08);
  ctx.beginPath();ctx.moveTo(l-6,t-3);ctx.quadraticCurveTo(l,t,l,t+8);ctx.lineTo(l,by-rad);ctx.quadraticCurveTo(l,by,l+rad,by);ctx.lineTo(r-rad,by);ctx.quadraticCurveTo(r,by,r,by-rad);ctx.lineTo(r,t+4);ctx.quadraticCurveTo(r,t,r+4,t-2);}
function beaker(ctx,cx,by,w,h,o={}){
  const l=cx-w/2,t=by-h,lv=o.lv||0;
  ctx.save();beakerPath(ctx,cx,by,w,h);ctx.fillStyle=GL_F;ctx.fill();
  if(lv>0){ctx.save();beakerPath(ctx,cx,by,w,h);ctx.clip();const ly=by-h*lv;
    const g=ctx.createLinearGradient(0,ly,0,by);g.addColorStop(0,o.col||waterCol(0));g.addColorStop(1,o.col2||o.col||waterCol(0));ctx.fillStyle=g;ctx.fillRect(l-8,ly,w+16,by-ly+2);
    ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(l+2,ly+1);ctx.lineTo(l+w-2,ly+1);ctx.stroke();
    if(o.sed){ctx.fillStyle='#7d6040';const sh=o.sed;ctx.beginPath();ctx.moveTo(l,by);ctx.lineTo(l,by-sh*.7);for(let i=0;i<=10;i++)ctx.lineTo(l+w*i/10,by-sh*(.8+.2*Math.sin(i*1.7)));ctx.lineTo(l+w,by);ctx.fill();}
    ctx.restore();}
  if(o.ticks){ctx.strokeStyle='rgba(66,92,118,.55)';ctx.lineWidth=1.2;for(let i=1;i<=o.ticks;i++){const y=by-h*.85*i/o.ticks;ctx.beginPath();ctx.moveTo(l+6,y);ctx.lineTo(l+(i%2?16:24),y);ctx.stroke();}}
  beakerPath(ctx,cx,by,w,h);ctx.strokeStyle=GL_S;ctx.lineWidth=2.2;ctx.stroke();
  glassHi(ctx,l+w*.84,t+16,l+w*.84,by-14,Math.max(3,w*.035),.7);glassHi(ctx,l+w*.92,t+26,l+w*.92,t+h*.45,2,.5);
  ctx.restore();
}
/* 玻璃棒 */
function rod(ctx,x1,y1,x2,y2,w=7){ctx.save();ctx.lineCap='round';ctx.strokeStyle='rgba(80,106,130,.85)';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.strokeStyle='rgba(232,244,250,.95)';ctx.lineWidth=w-3;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.4;const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;ctx.beginPath();ctx.moveTo(x1+nx*1.2,y1+ny*1.2);ctx.lineTo(x2+nx*1.2,y2+ny*1.2);ctx.stroke();ctx.restore();}
/* 金属渐变 */
function metal(ctx,x1,y1,x2,y2,dark=false){const g=ctx.createLinearGradient(x1,y1,x2,y2);if(dark){g.addColorStop(0,'#5a5f68');g.addColorStop(.45,'#2e3239');g.addColorStop(1,'#1c1f24');}else{g.addColorStop(0,'#8d939c');g.addColorStop(.35,'#e6e9ee');g.addColorStop(.6,'#a2a8b1');g.addColorStop(1,'#6b717a');}return g;}
/* 铁架台：底座 + 立杆 */
function stand(ctx,px,by,top,bw=230,bx=null){bx=bx??px-30;ctx.save();
  ctx.fillStyle='rgba(60,40,10,.12)';ctx.beginPath();ctx.ellipse(bx+bw/2,by+6,bw*.55,8,0,0,TAU);ctx.fill();
  rr(ctx,bx,by-18,bw,18,4);ctx.fillStyle=metal(ctx,0,by-18,0,by,true);ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(bx+4,by-17,bw-8,2);
  ctx.fillStyle=metal(ctx,px-5,0,px+5,0);ctx.fillRect(px-5,top,10,by-18-top);ctx.beginPath();ctx.arc(px,top,5,Math.PI,0);ctx.fill();ctx.restore();}
/* 铁圈（从立杆伸出），rx 圈半径 */
function ironRing(ctx,px,y,cx,rx,front){ctx.save();ctx.lineWidth=5;ctx.strokeStyle='#3a3f47';
  if(!front){ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(cx-rx,y);ctx.stroke();rr(ctx,px-9,y-9,18,18,3);ctx.fillStyle=metal(ctx,px-9,0,px+9,0,true);ctx.fill();
    ctx.beginPath();ctx.ellipse(cx,y,rx,rx*.2,0,Math.PI,TAU);ctx.stroke();}
  else{ctx.beginPath();ctx.ellipse(cx,y,rx,rx*.2,0,0,Math.PI);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(cx,y-1.5,rx,rx*.2,0,.3,Math.PI-.3);ctx.stroke();}
  ctx.restore();}
/* 酒精灯：cx 中心，by 底，s 缩放，lit 是否点燃 */
function lamp(ctx,cx,by,s,lit,t,capOn=false){ctx.save();ctx.translate(cx,by);ctx.scale(s,s);
  ctx.fillStyle='rgba(60,40,10,.12)';ctx.beginPath();ctx.ellipse(0,4,62,8,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.moveTo(-58,0);ctx.bezierCurveTo(-66,-40,-48,-74,-16,-80);ctx.lineTo(16,-80);ctx.bezierCurveTo(48,-74,66,-40,58,0);ctx.closePath();
  const g=ctx.createLinearGradient(-60,0,60,0);g.addColorStop(0,'rgba(200,225,238,.55)');g.addColorStop(.3,'rgba(240,250,255,.35)');g.addColorStop(1,'rgba(170,200,220,.55)');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=2;ctx.stroke();
  ctx.save();ctx.clip();ctx.fillStyle='rgba(150,200,225,.45)';ctx.fillRect(-70,-38,140,40);ctx.restore();
  glassHi(ctx,-40,-50,-46,-14,4,.65);
  rr(ctx,-14,-94,28,16,3);ctx.fillStyle=metal(ctx,-14,0,14,0);ctx.fill();
  ctx.strokeStyle='#efe6cf';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,-94);ctx.lineTo(0,-104);ctx.stroke();ctx.strokeStyle='#2a2a2a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-103);ctx.lineTo(0,-107);ctx.stroke();
  if(capOn){ctx.beginPath();ctx.moveTo(-20,-90);ctx.lineTo(-17,-128);ctx.quadraticCurveTo(0,-140,17,-128);ctx.lineTo(20,-90);ctx.closePath();ctx.fillStyle='rgba(210,230,240,.5)';ctx.fill();ctx.strokeStyle=GL_S;ctx.stroke();}
  if(lit)flame(ctx,0,-106,1,t);
  ctx.restore();}
function flame(ctx,x,y,k,t){const f=1+.06*Math.sin(t*23)+.04*Math.sin(t*37),sw=Math.sin(t*9)*2.5;ctx.save();ctx.translate(x,y);ctx.scale(k,k*f);ctx.globalCompositeOperation='source-over';
  const glw=ctx.createRadialGradient(0,-30,4,0,-30,70);glw.addColorStop(0,'rgba(255,190,90,.35)');glw.addColorStop(1,'rgba(255,190,90,0)');ctx.fillStyle=glw;ctx.beginPath();ctx.arc(0,-30,70,0,TAU);ctx.fill();
  const shape=(w,h,dx)=>{ctx.beginPath();ctx.moveTo(-w,0);ctx.bezierCurveTo(-w*1.1,-h*.4,-w*.4+dx*.5,-h*.75,dx,-h);ctx.bezierCurveTo(w*.4+dx*.5,-h*.75,w*1.1,-h*.4,w,0);ctx.quadraticCurveTo(0,w*.5,-w,0);};
  let g=ctx.createLinearGradient(0,0,0,-78);g.addColorStop(0,'rgba(255,170,60,.85)');g.addColorStop(.6,'rgba(255,200,90,.7)');g.addColorStop(1,'rgba(255,230,160,0)');shape(15,78,sw);ctx.fillStyle=g;ctx.fill();
  g=ctx.createLinearGradient(0,0,0,-48);g.addColorStop(0,'rgba(255,245,200,.95)');g.addColorStop(1,'rgba(255,215,110,.2)');shape(9,48,sw*.6);ctx.fillStyle=g;ctx.fill();
  g=ctx.createLinearGradient(0,0,0,-22);g.addColorStop(0,'rgba(70,120,255,.85)');g.addColorStop(1,'rgba(120,160,255,0)');shape(6,22,0);ctx.fillStyle=g;ctx.fill();
  ctx.restore();}
/* 漏斗几何（基准：rim 圆口中心 cx,ry，半径 R，锥高 ch，颈长 sl） */
function funnelGeo(cx,ry,R=70,ch=96,sl=150,sr=7){return{cx,ry,R,ch,sl,sr,cy:ry+ch,sy:ry+ch+sl};}
function funnelBack(ctx,F){ctx.save();ctx.beginPath();ctx.ellipse(F.cx,F.ry,F.R,F.R*.2,0,0,TAU);ctx.fillStyle='rgba(214,232,244,.35)';ctx.fill();ctx.restore();}
function funnelBody(ctx,F){const{cx,ry,R,cy,sy,sr}=F;ctx.save();
  ctx.beginPath();ctx.moveTo(cx-R,ry);ctx.lineTo(cx-sr,cy);ctx.lineTo(cx-sr,sy-6);ctx.lineTo(cx+sr,sy+6);ctx.lineTo(cx+sr,cy);ctx.lineTo(cx+R,ry);ctx.fillStyle=GL_F;ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=2.2;ctx.stroke();
  ctx.beginPath();ctx.ellipse(cx,ry,R,R*.2,0,0,TAU);ctx.stroke();
  glassHi(ctx,cx-R*.72,ry+8,cx-sr*1.6,cy-6,3.5,.7);glassHi(ctx,cx-sr*.3,cy+8,cx-sr*.3,sy-14,2,.75);
  ctx.restore();}
/* 滤纸圆锥：top 为滤纸上沿 y（与漏斗内壁贴合），wetK 润湿程度 */
function paperCone(ctx,F,top,{wet=1,mud=0,bubbles=0,t=0,tear=false}={}){const{cx,ry,R,cy}=F;const k=(cy-top)/(cy-ry),rw=R*k*.985,bot=cy-12;
  ctx.save();ctx.beginPath();ctx.moveTo(cx-rw,top);ctx.lineTo(cx,bot);ctx.lineTo(cx+rw,top);ctx.ellipse(cx,top,rw,rw*.2,0,0,Math.PI,false);ctx.closePath();
  ctx.fillStyle=wet>.5?'rgba(236,232,220,.62)':'rgba(250,249,243,.8)';ctx.fill();ctx.strokeStyle='rgba(140,128,104,.85)';ctx.lineWidth=1.6;ctx.stroke();
  // 三层一侧（右半边）：更厚、更不透明，并画出层边
  const fx0=cx+rw*.04,fy0=top+rw*.2;ctx.beginPath();ctx.moveTo(fx0,fy0);ctx.lineTo(cx,bot);ctx.lineTo(cx+rw,top);ctx.ellipse(cx,top,rw,rw*.2,0,0,Math.atan2(1,0)-.04,false);ctx.closePath();
  const pg=ctx.createLinearGradient(cx,0,cx+rw,0);pg.addColorStop(0,wet>.5?'rgba(196,184,152,.96)':'rgba(232,226,208,.98)');pg.addColorStop(1,wet>.5?'rgba(214,204,178,.96)':'rgba(242,238,224,.98)');ctx.fillStyle=pg;ctx.fill();
  ctx.strokeStyle='rgba(128,114,86,.9)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(fx0,fy0);ctx.lineTo(cx,bot);ctx.stroke();
  ctx.strokeStyle='rgba(128,114,86,.45)';ctx.lineWidth=1;[[.42,.185],[.72,.14]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(cx+rw*a,top+rw*b);ctx.lineTo(cx+1,bot-2);ctx.stroke();});
  ctx.beginPath();ctx.ellipse(cx,top,rw,rw*.2,0,0,TAU);ctx.strokeStyle='rgba(150,140,120,.8)';ctx.stroke();
  if(mud>0){ctx.save();ctx.beginPath();ctx.moveTo(cx-rw*.62,top+(bot-top)*.38);ctx.lineTo(cx,bot);ctx.lineTo(cx+rw*.62,top+(bot-top)*.38);ctx.closePath();ctx.clip();
    ctx.fillStyle=`rgba(120,92,58,${.55*mud})`;ctx.fillRect(cx-rw,top,rw*2,bot-top);for(let i=0;i<30;i++){ctx.fillStyle=`rgba(95,70,40,${.6*mud})`;ctx.beginPath();ctx.arc(cx+(((i*37)%60)-30)/30*rw*.5,bot-((i*53)%100)/100*(bot-top)*.55,1.5+(i%3),0,TAU);ctx.fill();}ctx.restore();}
  if(bubbles>0){for(let i=0;i<5;i++){const yy=top+(bot-top)*(.25+i*.13),xx=cx+(i%2?-1:1)*rw*(1-(yy-top)/(bot-top))*.86;ctx.globalAlpha=bubbles;ctx.strokeStyle='rgba(90,120,150,.8)';ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.ellipse(xx,yy,5+i%2*2,4,0,0,TAU);ctx.fill();ctx.stroke();}ctx.globalAlpha=1;}
  if(tear){ctx.strokeStyle=CIN;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-6,bot-30);ctx.lineTo(cx+2,bot-20);ctx.lineTo(cx-4,bot-12);ctx.stroke();}
  ctx.restore();return{rw,bot};}
/* 漏斗中的液体（液面 y=ly） */
function funnelLiquid(ctx,F,ly,col){const{cx,ry,R,cy}=F;const k=(cy-ly)/(cy-ry),rw=R*k*.97;ctx.save();ctx.beginPath();ctx.moveTo(cx-rw,ly);ctx.lineTo(cx,cy-10);ctx.lineTo(cx+rw,ly);ctx.closePath();ctx.fillStyle=col;ctx.fill();
  ctx.beginPath();ctx.ellipse(cx,ly,rw,rw*.2,0,0,TAU);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();return rw;}
/* 倾斜的烧杯（倒液），lip 为杯嘴坐标 */
function tiltBeaker(ctx,lx,ly,ang,w,h,lv,col){ctx.save();ctx.translate(lx,ly);ctx.rotate(ang);ctx.translate(w/2+6,h);
  // 在旋转坐标系中画烧杯（杯嘴在左上角 (−w/2−6, −h)）
  const by=0,cx=0,l=-w/2,t=-h;
  beakerPath(ctx,cx,by,w,h);ctx.fillStyle=GL_F;ctx.fill();
  if(lv>0){ctx.save();beakerPath(ctx,cx,by,w,h);ctx.clip();ctx.rotate(-ang);const pts=[[l,t],[l+w,t],[l,by],[l+w,by]].map(([x,y])=>[x*Math.cos(ang)-y*Math.sin(ang),x*Math.sin(ang)+y*Math.cos(ang)]);
    const ymax=Math.max(...pts.map(p=>p[1])),ymin=Math.min(...pts.map(p=>p[1]));const surf=lerp(ymax,ymin,lv);ctx.fillStyle=col;ctx.fillRect(-w*2,surf,w*4,ymax-surf+4);ctx.restore();}
  beakerPath(ctx,cx,by,w,h);ctx.strokeStyle=GL_S;ctx.lineWidth=2.2;ctx.stroke();glassHi(ctx,l+w*.84,t+16,l+w*.84,by-14,3,.7);
  ctx.restore();}
/* 液流（贝塞尔路径上的细流 + 流动亮点） */
function stream(ctx,pts,col,w,t){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  ctx.setLineDash([6,14]);ctx.lineDashOffset=-t*80;ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=Math.max(1,w*.35);ctx.stroke();ctx.restore();}
function drop(ctx,x,y,r,col){ctx.save();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-r*1.8);ctx.bezierCurveTo(x+r*.9,y-r*.6,x+r,y+r*.2,x,y+r);ctx.bezierCurveTo(x-r,y+r*.2,x-r*.9,y-r*.6,x,y-r*1.8);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.arc(x-r*.3,y-r*.1,r*.25,0,TAU);ctx.fill();ctx.restore();}
/* 泥沙颗粒：不规则多边形 + 明暗 */
function grain(ctx,x,y,r,seed=1,col='#8a6a43'){const R=rng(seed*97+13);ctx.save();ctx.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU,rr2=r*(.7+.35*R());ctx.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2*.85);}ctx.closePath();
  const g=ctx.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r*1.1);g.addColorStop(0,shade(col,.35));g.addColorStop(1,shade(col,-.35));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=shade(col,-.5);ctx.lineWidth=.8;ctx.stroke();ctx.restore();}
/* 细菌：杆菌 + 鞭毛 */
function bacterium(ctx,x,y,L,ang,t,col='#5f9e74'){const W=L*.42;ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.strokeStyle=shade(col,-.45);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(L/2,0);for(let k=0;k<=10;k++)ctx.lineTo(L/2+k*1.6,Math.sin(k*1.2+t*14)*W*.35);ctx.stroke();
  rr(ctx,-L/2,-W/2,L,W,W/2);const g=ctx.createLinearGradient(0,-W/2,0,W/2);g.addColorStop(0,shade(col,.4));g.addColorStop(1,shade(col,-.25));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=shade(col,-.45);ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle=shade(col,-.4);[-.25,0,.22].forEach(f=>{ctx.beginPath();ctx.arc(f*L,(f*7%1)*W*.2,W*.12,0,TAU);ctx.fill();});ctx.restore();}
/* 可溶性杂质：色素分子（琥珀色三联环）、异味分子（紫色 + 气味线）、钙镁离子 */
function pigmentMol(ctx,x,y,r=5){ctx.save();ctx.fillStyle='#d9902f';ctx.strokeStyle='#8f5a14';ctx.lineWidth=1;[[0,0],[r*1.1,r*.5],[r*.2,r*1.15]].forEach(([dx2,dy2])=>{ctx.beginPath();ctx.arc(x+dx2-r*.4,y+dy2-r*.5,r*.72,0,TAU);ctx.fill();ctx.stroke();});ctx.restore();}
function odorMol(ctx,x,y,r=5,t=0){ctx.save();ctx.fillStyle='#8d5fb0';ctx.strokeStyle='#5b3478';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(141,95,176,.85)';ctx.lineWidth=1.3;[-1,1].forEach(sd=>{ctx.beginPath();for(let k=0;k<=8;k++){const yy=y-r-2-k*1.4,xx=x+sd*r*.55+Math.sin(k*.9+t*6)*1.6;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();});ctx.restore();}
function ionDot(ctx,x,y,r=7,lab=''){ctx.save();const g=ctx.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);g.addColorStop(0,'#c3d8ef');g.addColorStop(1,'#4f7fb3');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle='#2f5f93';ctx.lineWidth=1;ctx.stroke();
  if(lab)txt(ctx,lab,x,y+.5,{size:Math.max(8,r*.8),col:'#fff',weight:700});else txt(ctx,'2+',x,y+.5,{size:Math.max(7,r*.95),col:'#fff',weight:700});ctx.restore();}
/* 引线标注 */
function callout(ctx,x,y,tx,ty,s,{col=INK,size=17,align=null,bg=true,font=BODY,weight=700}={}){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,3.2,0,TAU);ctx.fill();
  align=align||(tx<x?'right':'left');ctx.font=`${weight} ${size}px ${font}`;const m=ctx.measureText(s).width,px=align==='right'?tx-6-m:tx+6;
  if(bg){ctx.fillStyle='rgba(251,249,244,.92)';rr(ctx,px-5,ty-size*.75,m+10,size*1.5,4);ctx.fill();}
  ctx.fillStyle=col;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(s,px,ty);ctx.restore();}

/* ================= 过滤装置（基准坐标 600×600，由 o 控制各处对错） =================
   o: {rod,rodSingle,pour,lipTouch,tipAway,liquidHigh,paperHigh,flow,lv,turb,fil,filTurb,mud,labels,t,tear} */
function filterRig(ctx,ox,oy,k,o){
  const t=o.t||0;ctx.save();ctx.translate(ox,oy);ctx.scale(k,k);
  const px=110,base=572,F=funnelGeo(300,176,96,128,140,8);
  const bw=128,bh=168,bcx=o.tipAway?300:300-(bw/2-F.sr-2),bby=base-18;
  stand(ctx,px,base,70,250,40);
  ironRing(ctx,px,195,300,82,false);
  const fil=o.fil||0;ctx.save();ctx.globalAlpha=o.balpha??1;beaker(ctx,bcx,bby,bw,bh,{lv:fil*.55,col:waterCol(o.filTurb??0.06),ticks:4});ctx.restore();
  funnelBack(ctx,F);
  const ptop=o.paperHigh?F.ry-16:F.ry+16;
  // 液体先画（在滤纸内部）
  const lv=o.lv||0;let ly=null;
  if(lv>0){ly=o.liquidHigh?F.ry+3:lerp(F.cy-14,ptop+30,lv);}
  const pc=paperCone(ctx,F,ptop,{wet:1,mud:o.mud||0,tear:o.tear});
  if(ly!==null){funnelLiquid(ctx,F,ly,waterCol(o.turb??.8,{a:o.liquidHigh?.62:.9}));
    if(o.liquidHigh){const mc=waterCol(o.turb??.8,{a:1.25});ctx.save();
      // 浑水从滤纸与漏斗壁之间的缝隙流下
      [-1,1].forEach(sd=>{ctx.strokeStyle=mc;ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(F.cx+sd*pc.rw*1.0,ptop+2);ctx.lineTo(F.cx+sd*(F.sr+1),F.cy-2);ctx.stroke();
        ctx.setLineDash([7,7]);ctx.lineDashOffset=-t*40;ctx.strokeStyle='#5e4325';ctx.lineWidth=3.5;ctx.stroke();ctx.setLineDash([]);});
      ctx.strokeStyle=mc;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(F.cx,F.cy-4);ctx.lineTo(F.cx,F.sy);ctx.stroke();
      // 被淹没的滤纸边缘（透过液体可见）
      ctx.strokeStyle='#ffffff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(F.cx,ptop,pc.rw,pc.rw*.2,0,0,TAU);ctx.stroke();ctx.strokeStyle='rgba(120,100,70,.8)';ctx.lineWidth=1;ctx.stroke();ctx.restore();}}
  funnelBody(ctx,F);
  ironRing(ctx,px,195,300,82,true);
  // 漏斗下端与烧杯内壁
  const tipX=F.cx+F.sr,tipY=F.sy+6;
  // 滤液沿内壁流下 / 滴落
  if(o.flow>0){const fc=waterCol(o.filTurb??0.06,{a:1});
    if(!o.tipAway){ctx.save();ctx.strokeStyle=fc;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.lineTo(tipX+.5,bby-bh*fil*.55);ctx.lineWidth=2;ctx.moveTo(tipX+1,tipY-4);ctx.lineTo(tipX+1,tipY+2);ctx.stroke();ctx.restore();}
    else{const ph=(t*1.6)%1;drop(ctx,F.cx,lerp(tipY+6,bby-bh*fil*.55-4,ph*ph),4,fc);if(ph>.85&&!LOW){ctx.strokeStyle='rgba(120,160,190,.7)';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(F.cx,bby-bh*fil*.55,10*(ph-.8)*6,2.5,0,0,TAU);ctx.stroke();}}}
  // 玻璃棒与倾倒烧杯
  const rodTip=o.rodSingle?[F.cx-pc.rw*.42,ptop+48]:[F.cx+pc.rw*.4,ptop+50];
  const rodTop=[rodTip[0]-70,rodTip[1]-240];
  if(o.rod)rod(ctx,rodTop[0],rodTop[1],rodTip[0],rodTip[1],8);
  if(o.pour){const lip=o.rod?(o.lipTouch===false?[rodTop[0]+60,rodTop[1]+30]:[lerp(rodTop[0],rodTip[0],.28)+5,lerp(rodTop[1],rodTip[1],.28)]):[F.cx+48,F.ry-95];
    const pc2=waterCol(o.turb??.8,{a:.92});
    if(o.flow>0){if(o.rod&&o.lipTouch!==false)stream(ctx,[lip,[rodTip[0]+3,rodTip[1]-4]],pc2,5,t);
      else{stream(ctx,[lip,[lip[0]-6,lip[1]+40],[o.rod?rodTip[0]:F.cx+12,(ly??F.cy-14)]],pc2,6,t);
        if(!LOW&&!o.rod){for(let i=0;i<4;i++){const a=t*6+i*1.6;ctx.fillStyle=pc2;ctx.beginPath();ctx.arc(F.cx+12+Math.cos(a)*16,(ly??F.cy)-6-Math.abs(Math.sin(a))*14,2.5,0,TAU);ctx.fill();}}}}
    tiltBeaker(ctx,lip[0],lip[1],-.8,96,128,o.pourLv??.5,pc2);}
  // 标注
  const L=o.labels;
  if(L){if(L.includes('一贴'))callout(ctx,F.cx-pc.rw*.7,ptop+30,F.cx-200,ptop+10,'一贴：滤纸紧贴漏斗内壁',{col:NAVY});
    if(L.includes('二低')){ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle=CIN;ctx.lineWidth=1.5;[[F.ry,'漏斗边缘',-9],[ptop,'滤纸边缘',9]].forEach(([y,s,dy])=>{ctx.beginPath();ctx.moveTo(F.cx-F.R-20,y);ctx.lineTo(F.cx-F.R-110,y);ctx.stroke();txt(ctx,s,F.cx-F.R-116,y+dy,{align:'right',size:15,col:CIN,weight:700});});
      if(ly!==null){ctx.strokeStyle='#2f6fb0';ctx.beginPath();ctx.moveTo(F.cx-F.R-20,ly);ctx.lineTo(F.cx-F.R-110,ly);ctx.stroke();txt(ctx,'液面',F.cx-F.R-116,ly+4,{align:'right',size:15,col:'#2f6fb0',weight:700});}ctx.restore();
      hand(ctx,'二低',F.cx-F.R-150,(ly??ptop+30)+44,{size:32,col:CIN});}
    if(L.includes('三靠')){callout(ctx,lerp(rodTop[0],rodTip[0],.28)+5,lerp(rodTop[1],rodTip[1],.28),540,rodTop[1]+40,'① 烧杯口靠玻璃棒',{col:MOSS});
      callout(ctx,rodTip[0],rodTip[1],545,ptop+66,'② 玻璃棒靠三层滤纸',{col:MOSS});
      callout(ctx,tipX,tipY-6,545,tipY-30,'③ 漏斗下端靠烧杯内壁',{col:MOSS});}}
  ctx.restore();
  return{F,ptop,rodTip,rodTop,tip:[tipX,tipY],map:(x,y)=>[ox+x*k,oy+y*k],inv:(x,y)=>[(x-ox)/k,(y-oy)/k]};
}
/* ================= 画布直接操作：拖动仪器 / 点击仪器 =================
   tools(): [{id,x,y,r,on,draw(ctx,x,y,drag)}] 可拖动的东西；hots(): [{hit(x,y),on,act()}] 可点击的区域；
   onDrop(id,x,y) 返回 true 表示放到了有效位置。按钮与直接操作调用同一套函数。 */
function canvasUI(cv,{tools=()=>[],hots=()=>[],onDrop=()=>false}){
  const ui={drag:null,hover:null};
  const toolAt=(x,y)=>tools().find(t=>t.on!==false&&Math.hypot(x-t.x,y-t.y)<t.r);
  const hotAt=(x,y)=>hots().find(h=>h.on!==false&&h.hit(x,y));
  cv.addEventListener('pointerdown',e=>{const[x,y]=ptIn(cv,e);const t=toolAt(x,y);
    if(t){ui.drag={id:t.id,x,y,dx:x-t.x,dy:y-t.y};try{cv.setPointerCapture(e.pointerId);}catch(_){}sfx('pop');e.preventDefault();return;}
    const h=hotAt(x,y);if(h){h.act();}});
  cv.addEventListener('pointermove',e=>{const[x,y]=ptIn(cv,e);if(ui.drag){ui.drag.x=x;ui.drag.y=y;return;}
    cv.style.cursor=toolAt(x,y)?'grab':hotAt(x,y)?'pointer':'default';});
  const end=e=>{if(!ui.drag)return;const d=ui.drag;ui.drag=null;const[x,y]=ptIn(cv,e);if(!onDrop(d.id,x,y))sfx('click');};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',()=>{ui.drag=null;});
  ui.draw=ctx=>{tools().forEach(t=>{const dr=ui.drag&&ui.drag.id===t.id;if(t.on===false&&!dr){ctx.save();ctx.globalAlpha=.28;t.draw(ctx,t.x,t.y,false);ctx.restore();return;}
      if(dr){ctx.save();ctx.globalAlpha=.25;t.draw(ctx,t.x,t.y,false);ctx.restore();ctx.save();ctx.shadowColor='rgba(40,30,10,.3)';ctx.shadowBlur=14;ctx.shadowOffsetY=8;t.draw(ctx,ui.drag.x-ui.drag.dx,ui.drag.y-ui.drag.dy,true);ctx.restore();}
      else{t.draw(ctx,t.x,t.y,false);if(!LOW){ctx.save();ctx.strokeStyle='rgba(31,78,121,.35)';ctx.setLineDash([4,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,TAU);ctx.stroke();ctx.restore();}}});};
  return ui;}
/* 小仪器图形：试剂瓶（粉末 / 颗粒）、滴瓶、小烧杯、表面皿 */
function jarIcon(ctx,x,y,lab,fill,{tilt=0,s=1}={}){ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(s,s);
  rr(ctx,-20,-14,40,46,7);ctx.fillStyle='rgba(225,238,246,.55)';ctx.fill();ctx.save();rr(ctx,-20,-14,40,46,7);ctx.clip();ctx.fillStyle=fill;ctx.fillRect(-20,6,40,30);ctx.restore();
  rr(ctx,-20,-14,40,46,7);ctx.strokeStyle=GL_S;ctx.lineWidth=1.6;ctx.stroke();rr(ctx,-12,-24,24,11,3);ctx.fillStyle='#5a5f68';ctx.fill();
  rr(ctx,-17,-6,34,14,3);ctx.fillStyle='#fffdf6';ctx.fill();ctx.strokeStyle='#b8ad94';ctx.lineWidth=1;ctx.stroke();txt(ctx,lab,0,1,{size:10.5,weight:700,col:'#23262f'});ctx.restore();}
function dropperIcon(ctx,x,y,lab,liq,{tilt=0,s=1}={}){ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(s,s);
  rr(ctx,-16,-8,32,40,8);ctx.fillStyle='rgba(225,238,246,.55)';ctx.fill();ctx.save();rr(ctx,-16,-8,32,40,8);ctx.clip();ctx.fillStyle=liq;ctx.fillRect(-16,8,32,26);ctx.restore();rr(ctx,-16,-8,32,40,8);ctx.strokeStyle=GL_S;ctx.lineWidth=1.6;ctx.stroke();
  ctx.fillStyle='#3d3f45';rr(ctx,-7,-30,14,22,6);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(-4,-27,3,16);
  rr(ctx,-14,0,28,12,3);ctx.fillStyle='#fffdf6';ctx.fill();txt(ctx,lab,0,6,{size:10,weight:700,col:'#23262f'});ctx.restore();}
function dishIcon(ctx,x,y,lab){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.ellipse(0,6,30,9,0,0,Math.PI);ctx.lineTo(-30,6);ctx.fillStyle='rgba(225,238,246,.7)';ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=1.5;ctx.stroke();
  const R=rng(4);for(let i=0;i<6;i++){const cx=-16+i*6.5,cy=4+R()*3;ctx.fillStyle='#f3f1ea';ctx.strokeStyle='#a9a395';ctx.beginPath();ctx.moveTo(cx-4,cy+2);ctx.lineTo(cx-2,cy-3);ctx.lineTo(cx+3,cy-2);ctx.lineTo(cx+4,cy+2);ctx.closePath();ctx.fill();ctx.stroke();}
  txt(ctx,lab,0,30,{size:12,weight:700,col:'#4a4f5c'});ctx.restore();}
function cupIcon(ctx,x,y,lab,col){beaker(ctx,x,y+24,46,52,{lv:.62,col});txt(ctx,lab,x,y+40,{size:12,weight:700,col:'#4a4f5c'});}
function trayHint(ctx,x,y,s){txt(ctx,s,x,y,{size:13,weight:700,col:'#6f7480'});}
