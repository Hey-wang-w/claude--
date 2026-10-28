/* ================= 仪器绘图库（矢量）：常见仪器、蜡烛、火柴（危险化学品标志不自绘，用 signs.js 里从教材提取的原图） =================
   约定：AP.xxx(ctx,x,y,s,o) 以“底部中点”(x,y) 定位，s 为缩放（s=1 时高约 120 px）；玻璃用 GL_F 填充 + GL_S 描边 + 高光。 */
const PORC='#f7f4ee',PORC2='#d9d2c4',IRON='#3d4048',WOOD='#c9965a';
function glassPath(ctx,pts){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));}
function glassStroke(ctx,lw=2.2){ctx.strokeStyle=GL_S;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.stroke();}
/* 液体：在当前路径的裁剪区里从 ly 往下涂 */
function fillLiquid(ctx,pathFn,x0,x1,ly,yb,col){ctx.save();pathFn();ctx.clip();ctx.fillStyle=col;ctx.fillRect(x0,ly,x1-x0,yb-ly+4);ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x0,ly+.8);ctx.lineTo(x1,ly+.8);ctx.stroke();ctx.restore();}
const AP={
  /* 试管 */
  tube(ctx,x,y,s=1,o={}){testTube(ctx,x,y-130*s,130*s,26*s,0,{lv:o.lv||0,col:o.col||waterCol(0)});},
  /* 烧杯 */
  beaker(ctx,x,y,s=1,o={}){beaker(ctx,x,y,92*s,108*s,{lv:o.lv||0,col:o.col||waterCol(0)});
    ctx.save();ctx.strokeStyle='rgba(52,74,104,.6)';ctx.lineWidth=1.2;for(let i=1;i<=4;i++){const yy=y-108*s*.82*i/4;ctx.beginPath();ctx.moveTo(x-46*s+5,yy);ctx.lineTo(x-46*s+(i%2?13:19)*s,yy);ctx.stroke();}ctx.restore();},
  /* 蒸发皿（瓷） */
  dish(ctx,x,y,s=1){ctx.save();const w=104*s,d=34*s,top=y-d;ctx.beginPath();ctx.moveTo(x-w/2,top);ctx.quadraticCurveTo(x-w*.42,y,x,y);ctx.quadraticCurveTo(x+w*.42,y,x+w/2,top);ctx.closePath();
    const g=ctx.createLinearGradient(0,top,0,y);g.addColorStop(0,PORC);g.addColorStop(1,PORC2);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();
    ctx.beginPath();ctx.ellipse(x,top,w/2,6*s,0,0,TAU);ctx.fillStyle='#ebe5d8';ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x+w/2-4*s,top-2*s);ctx.lineTo(x+w/2+8*s,top-5*s);ctx.stroke();ctx.restore();},
  /* 燃烧匙（照教材图 1-9 实物）：一根长铁杆，下端弯折，末端是一个小匙（匙口朝上） */
  spoon(ctx,x,y,s=1){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';const cx=x-6*s,by=y-10*s;
    ctx.strokeStyle='#5c6068';ctx.lineWidth=3.6*s;ctx.beginPath();ctx.moveTo(x+8*s,y-124*s);ctx.lineTo(x+8*s,by-4*s);ctx.quadraticCurveTo(x+8*s,by+2*s,x+2*s,by+2*s);ctx.lineTo(cx+8*s,by+2*s);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.2*s;ctx.beginPath();ctx.moveTo(x+7*s,y-122*s);ctx.lineTo(x+7*s,by-6*s);ctx.stroke();
    // 小匙：侧面看是一个浅杯，口沿是椭圆
    ctx.beginPath();ctx.moveTo(cx-10*s,by-6*s);ctx.lineTo(cx-8*s,by+5*s);ctx.quadraticCurveTo(cx,by+9*s,cx+8*s,by+5*s);ctx.lineTo(cx+10*s,by-6*s);ctx.closePath();
    const g=ctx.createLinearGradient(cx-10*s,0,cx+10*s,0);g.addColorStop(0,'#7d6248');g.addColorStop(.45,'#b08a5e');g.addColorStop(1,'#6a523b');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    ctx.beginPath();ctx.ellipse(cx,by-6*s,10*s,3*s,0,0,TAU);ctx.fillStyle='#4a3a2b';ctx.fill();ctx.stroke();ctx.restore();},
  /* 圆底烧瓶 */
  flask(ctx,x,y,s=1,o={}){const R=40*s,cy=y-R-2*s,nw=11*s,top=y-128*s,a=Math.asin(nw/R);
    const path=()=>{ctx.beginPath();ctx.moveTo(x-nw-3*s,top);ctx.lineTo(x-nw,top+4*s);ctx.lineTo(x-nw,cy-R*Math.cos(a));ctx.arc(x,cy,R,-Math.PI/2-a,-Math.PI/2+a,true);ctx.lineTo(x+nw,top+4*s);ctx.lineTo(x+nw+3*s,top);};
    ctx.save();path();ctx.fillStyle=GL_F;ctx.fill();if(o.lv)fillLiquid(ctx,path,x-R,x+R,cy+R*(1-2*o.lv),y,o.col||waterCol(0));path();glassStroke(ctx);glassHi(ctx,x-R*.55,cy-R*.35,x-R*.62,cy+R*.25,3,.8);ctx.restore();},
  /* 锥形瓶 */
  conical(ctx,x,y,s=1,o={}){const bw=46*s,nw=12*s,top=y-124*s,sh=y-72*s;
    const path=()=>{glassPath(ctx,[[x-nw-3*s,top],[x-nw,top+4*s],[x-nw,sh],[x-bw,y-6*s],[x-bw+6*s,y],[x+bw-6*s,y],[x+bw,y-6*s],[x+nw,sh],[x+nw,top+4*s],[x+nw+3*s,top]]);};
    ctx.save();path();ctx.fillStyle=GL_F;ctx.fill();if(o.lv)fillLiquid(ctx,path,x-bw,x+bw,y-60*s*o.lv,y,o.col||waterCol(0));path();glassStroke(ctx);glassHi(ctx,x+bw*.5,y-34*s,x+nw*.6,sh+6*s,3,.75);ctx.restore();},
  /* 量筒（刻度 0–n mL） */
  cylinder(ctx,x,y,s=1,o={}){const w=30*s,h=150*s,top=y-h-6*s,by=y-10*s;
    ctx.save();ctx.fillStyle='rgba(222,236,246,.5)';ctx.strokeStyle=GL_S;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-30*s,y);ctx.lineTo(x+30*s,y);ctx.lineTo(x+24*s,by);ctx.lineTo(x-24*s,by);ctx.closePath();ctx.fill();ctx.stroke();
    const path=()=>{glassPath(ctx,[[x-w/2-5*s,top-3*s],[x-w/2,top+4*s],[x-w/2,by],[x+w/2,by],[x+w/2,top]]);};
    path();ctx.fillStyle=GL_F;ctx.fill();if(o.lv)fillLiquid(ctx,path,x-w/2,x+w/2,by-(h-14*s)*o.lv,by,o.col||waterCol(0));path();glassStroke(ctx,2);
    ctx.strokeStyle='rgba(52,74,104,.75)';ctx.lineWidth=1;for(let i=1;i<=10;i++){const yy=by-(h-14*s)*i/10;ctx.beginPath();ctx.moveTo(x-w/2,yy);ctx.lineTo(x-w/2+(i%5?6:11)*s,yy);ctx.stroke();}
    glassHi(ctx,x+w*.28,top+10*s,x+w*.28,by-8*s,2.4,.8);ctx.restore();},
  /* 集气瓶 + 玻璃片 */
  jar(ctx,x,y,s=1,o={}){const w=70*s,h=104*s,top=y-h,nw=26*s;
    const path=()=>{ctx.beginPath();ctx.moveTo(x-nw,top);ctx.lineTo(x-nw,top+8*s);ctx.quadraticCurveTo(x-w/2,top+12*s,x-w/2,top+26*s);ctx.lineTo(x-w/2,y-6*s);ctx.quadraticCurveTo(x-w/2,y,x-w/2+6*s,y);ctx.lineTo(x+w/2-6*s,y);ctx.quadraticCurveTo(x+w/2,y,x+w/2,y-6*s);ctx.lineTo(x+w/2,top+26*s);ctx.quadraticCurveTo(x+w/2,top+12*s,x+nw,top+8*s);ctx.lineTo(x+nw,top);};
    ctx.save();path();ctx.fillStyle=GL_F;ctx.fill();if(o.lv)fillLiquid(ctx,path,x-w/2,x+w/2,y-h*o.lv,y,o.col||waterCol(0));path();glassStroke(ctx);
    ctx.fillStyle='rgba(200,214,226,.8)';ctx.fillRect(x-nw-2*s,top-1,nw*2+4*s,4*s);// 磨砂瓶口
    if(o.plate!==false){ctx.fillStyle='rgba(210,230,242,.85)';ctx.fillRect(x-nw-10*s,top-6*s,nw*2+20*s,5*s);ctx.strokeStyle=GL_S;ctx.lineWidth=1.2;ctx.strokeRect(x-nw-10*s,top-6*s,nw*2+20*s,5*s);}
    glassHi(ctx,x+w*.32,top+30*s,x+w*.32,y-12*s,3,.75);ctx.restore();},
  /* 漏斗 */
  funnel(ctx,x,y,s=1){const R=40*s,top=y-118*s,cy=top+48*s;ctx.save();
    ctx.beginPath();ctx.moveTo(x-R,top);ctx.lineTo(x-5*s,cy);ctx.lineTo(x-4*s,y-6*s);ctx.lineTo(x+1*s,y);ctx.lineTo(x+4*s,y-8*s);ctx.lineTo(x+5*s,cy);ctx.lineTo(x+R,top);
    ctx.fillStyle=GL_F;ctx.fill();glassStroke(ctx);ctx.beginPath();ctx.ellipse(x,top,R,5*s,0,0,TAU);ctx.strokeStyle=GL_S;ctx.lineWidth=1.6;ctx.stroke();glassHi(ctx,x+R*.5,top+8*s,x+10*s,cy-6*s,2.4,.75);ctx.restore();},
  /* 胶头滴管：(x,y) 是管尖；ang=0 竖直向下 */
  dropper(ctx,x,y,s=1,ang=0,o={}){ctx.save();ctx.translate(x,y);ctx.rotate(ang);
    ctx.beginPath();ctx.moveTo(-1.5*s,0);ctx.lineTo(-4*s,-70*s);ctx.lineTo(4*s,-70*s);ctx.lineTo(1.5*s,0);ctx.closePath();ctx.fillStyle=GL_F;ctx.fill();glassStroke(ctx,1.6);
    if(o.lv){ctx.fillStyle=o.col||waterCol(0);ctx.beginPath();ctx.moveTo(-1.5*s,0);ctx.lineTo(-2.6*s,-o.lv*40*s);ctx.lineTo(2.6*s,-o.lv*40*s);ctx.lineTo(1.5*s,0);ctx.fill();}
    ctx.beginPath();ctx.moveTo(-6*s,-70*s);ctx.lineTo(-7*s,-82*s);ctx.bezierCurveTo(-11*s,-104*s,11*s,-104*s,7*s,-82*s);ctx.lineTo(6*s,-70*s);ctx.closePath();
    const g=ctx.createLinearGradient(-9*s,0,9*s,0);g.addColorStop(0,'#c0392b');g.addColorStop(.4,'#e05a47');g.addColorStop(1,'#8e2a1f');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();ctx.restore();},
  /* 细口瓶（液体）/ 广口瓶（固体）；o.stopper: 'on' | 'off'（不画）；o.label 文字 */
  bottle(ctx,x,y,s=1,o={}){const wide=!!o.wide,w=58*s,h=96*s,top=y-h,nw=(wide?22:11)*s;
    const path=()=>{ctx.beginPath();ctx.moveTo(x-nw,top);ctx.lineTo(x-nw,top+10*s);ctx.quadraticCurveTo(x-w/2,top+14*s,x-w/2,top+30*s);ctx.lineTo(x-w/2,y-6*s);ctx.quadraticCurveTo(x-w/2,y,x-w/2+6*s,y);ctx.lineTo(x+w/2-6*s,y);ctx.quadraticCurveTo(x+w/2,y,x+w/2,y-6*s);ctx.lineTo(x+w/2,top+30*s);ctx.quadraticCurveTo(x+w/2,top+14*s,x+nw,top+10*s);ctx.lineTo(x+nw,top);};
    ctx.save();path();ctx.fillStyle=o.brown?'rgba(150,95,40,.35)':GL_F;ctx.fill();
    if(o.lv)fillLiquid(ctx,path,x-w/2,x+w/2,y-(h-34*s)*o.lv,y,o.col||waterCol(0));
    if(o.solid){ctx.save();path();ctx.clip();const R=rng(17);for(let i=0;i<26;i++){grain(ctx,x-w/2+6*s+R()*(w-12*s),y-4*s-R()*28*s,3.4*s,i,o.solid);}ctx.restore();}
    path();glassStroke(ctx);
    if(o.label!==false){ctx.fillStyle='#fffdf8';ctx.fillRect(x-w/2+5*s,top+40*s,w-10*s,28*s);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.strokeRect(x-w/2+5*s,top+40*s,w-10*s,28*s);
      if(o.label)txt(ctx,o.label,x,top+54*s,{size:Math.max(10,12*s),weight:700});}
    if(o.stopper!=='off'){ctx.fillStyle='rgba(200,214,226,.95)';rr(ctx,x-nw-3*s,top-12*s,nw*2+6*s,13*s,3*s);ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=1.4;ctx.stroke();}
    glassHi(ctx,x+w*.34,top+32*s,x+w*.34,y-10*s,3,.7);ctx.restore();},
  /* 瓶塞：倒放 / 正放（正放时塞子底部接触桌面） */
  stopper(ctx,x,y,s=1,inverted=true){ctx.save();ctx.fillStyle='rgba(200,214,226,.95)';ctx.strokeStyle=GL_S;ctx.lineWidth=1.4;
    if(inverted){rr(ctx,x-14*s,y-8*s,28*s,8*s,3*s);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-9*s,y-8*s);ctx.lineTo(x-7*s,y-20*s);ctx.lineTo(x+7*s,y-20*s);ctx.lineTo(x+9*s,y-8*s);ctx.closePath();ctx.fill();ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(x-7*s,y);ctx.lineTo(x-9*s,y-12*s);ctx.lineTo(x+9*s,y-12*s);ctx.lineTo(x+7*s,y);ctx.closePath();ctx.fill();ctx.stroke();rr(ctx,x-14*s,y-20*s,28*s,8*s,3*s);ctx.fill();ctx.stroke();}
    ctx.restore();},
  /* 试管架 */
  rack(ctx,x,y,s=1){ctx.save();ctx.fillStyle=WOOD;ctx.strokeStyle=INK;ctx.lineWidth=1.4;rr(ctx,x-80*s,y-10*s,160*s,10*s,2);ctx.fill();ctx.stroke();rr(ctx,x-80*s,y-70*s,160*s,10*s,2);ctx.fill();ctx.stroke();
    [[-74,1],[74,1]].forEach(([dx])=>{ctx.fillRect(x+dx*s-3*s,y-70*s,6*s,62*s);ctx.strokeRect(x+dx*s-3*s,y-70*s,6*s,62*s);});ctx.restore();},
  /* 试管夹（木制，照实物）：长柄在前、短柄在后，两片木条由钢丝弹簧夹住；前端夹口有半圆槽，夹住试管。
     (x,y) 为夹口中心（试管轴线上），沿 ang 方向是柄；u 为每厘米像素数；全长约 18 cm、宽约 1.5 cm。tubeR：被夹试管的半径（px） */
  holder(ctx,x,y,u=20,ang=0,tubeR=18){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.lineJoin='round';
    const w0=-tubeR-.35*u,wood=(c1,c2)=>{const g=ctx.createLinearGradient(0,-.8*u,0,.8*u);g.addColorStop(0,c1);g.addColorStop(1,c2);return g;};
    // 短柄（在后面）：从夹口到约 11 cm，弹簧后面略微张开
    ctx.save();ctx.translate(5.6*u,0);ctx.rotate(-.05);ctx.translate(-5.6*u,0);
    ctx.beginPath();ctx.moveTo(w0+.2*u,-1.05*u);ctx.lineTo(11*u,-1.0*u);ctx.quadraticCurveTo(11.5*u,-.75*u,11*u,-.45*u);ctx.lineTo(w0+.2*u,-.35*u);ctx.closePath();
    ctx.fillStyle=wood('#c48b4e','#9d6a35');ctx.fill();ctx.strokeStyle='#5e3d1e';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
    // 长柄（在前面）：夹口处宽、向柄端略收，柄端圆头
    ctx.beginPath();ctx.moveTo(w0,-.78*u);ctx.lineTo(18*u,-.62*u);ctx.quadraticCurveTo(18.6*u,0,18*u,.62*u);ctx.lineTo(w0,.78*u);ctx.quadraticCurveTo(w0-.45*u,0,w0,-.78*u);ctx.closePath();
    ctx.fillStyle=wood('#e3b47a','#c18a4f');ctx.fill();ctx.strokeStyle='#5e3d1e';ctx.lineWidth=1.3;ctx.stroke();
    ctx.strokeStyle='rgba(110,70,30,.28)';ctx.lineWidth=1;[[-.35,.2],[.05,-.1],[.38,.15]].forEach(([dy,k])=>{ctx.beginPath();ctx.moveTo(1.2*u,dy*u);ctx.bezierCurveTo(6*u,(dy+k*.3)*u,11*u,(dy-k*.3)*u,17*u,dy*u);ctx.stroke();});// 木纹
    ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(w0+.3*u,-.6*u);ctx.lineTo(17.6*u,-.47*u);ctx.stroke();
    // 夹口的半圆槽：试管从槽中穿过（槽边的弧线）
    ctx.strokeStyle='#5e3d1e';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-tubeR,-.78*u);ctx.quadraticCurveTo(0,-.5*u,tubeR,-.78*u);ctx.moveTo(-tubeR,.78*u);ctx.quadraticCurveTo(0,.5*u,tubeR,.78*u);ctx.stroke();
    // 钢丝弹簧夹：一圈箍住两片木条，后面绕成弹簧，两条钢丝沿柄伸出
    const sx=5.6*u,steel='#6f7782';ctx.strokeStyle=steel;ctx.lineWidth=Math.max(1.6,.16*u);ctx.lineCap='round';
    ctx.beginPath();ctx.ellipse(sx,-.1*u,.42*u,1.2*u,0,0,TAU);ctx.stroke();
    for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(sx+.75*u+i*.32*u,-1.45*u,.22*u,.3*u,0,0,TAU);ctx.stroke();}
    ctx.beginPath();ctx.moveTo(sx+1.5*u,-1.4*u);ctx.lineTo(9.5*u,-1.15*u);ctx.moveTo(sx+.3*u,.95*u);ctx.lineTo(9*u,.7*u);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(sx-.08*u,-.15*u,.3*u,1.05*u,0,Math.PI*1.1,Math.PI*1.5);ctx.stroke();
    ctx.restore();},
  /* 镊子（不锈钢，照实物）：两片钢片在尾部焊在一起，前端收窄成尖，中部有防滑纹；(x,y) 为尖端，ang=0 时尖端朝下；open 张开程度 0～1 */
  tweezers(ctx,x,y,s=1,ang=0,open=.25){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.lineJoin='round';
    const L=118*s,leg=(sg)=>{const sp=sg*(1.2+open*7)*s;ctx.beginPath();ctx.moveTo(sp,0);ctx.lineTo(sp+sg*2.6*s,-.22*L);ctx.lineTo(sg*5.2*s,-.95*L);ctx.lineTo(sg*1.2*s,-L);ctx.lineTo(sp+sg*.6*s,-.25*L);ctx.lineTo(sp-sg*.6*s,-2*s);ctx.closePath();
      const g=ctx.createLinearGradient(-6*s,0,6*s,0);g.addColorStop(0,'#9aa2ab');g.addColorStop(.5,'#e3e7eb');g.addColorStop(1,'#8b939c');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#4b525b';ctx.lineWidth=1;ctx.stroke();
      ctx.strokeStyle='rgba(60,66,74,.55)';for(let i=0;i<6;i++){const yy=-(.48+i*.035)*L,xx=sg*(3.4+open*3)*s;ctx.beginPath();ctx.moveTo(xx-sg*1.6*s,yy);ctx.lineTo(xx+sg*1.6*s,yy);ctx.stroke();}};
    leg(-1);leg(1);ctx.fillStyle='#8b939c';rr(ctx,-6*s,-L-3*s,12*s,6*s,3*s);ctx.fill();ctx.strokeStyle='#4b525b';ctx.stroke();ctx.restore();},
  /* 药匙 */
  /* 药匙（不锈钢，照实物）：扁平长柄，两端各有一个匙，一大一小；(x,y) 为大匙的匙尖，ang=0 时柄朝上 */
  spatula(ctx,x,y,s=1,ang=0){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.lineJoin='round';
    const g=ctx.createLinearGradient(-6*s,0,6*s,0);g.addColorStop(0,'#9aa2ab');g.addColorStop(.5,'#e6e9ec');g.addColorStop(1,'#8b939c');
    ctx.fillStyle=g;ctx.strokeStyle='#4b525b';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-2.4*s,-16*s);ctx.lineTo(-2*s,-84*s);ctx.lineTo(2*s,-84*s);ctx.lineTo(2.4*s,-16*s);ctx.closePath();ctx.fill();ctx.stroke();// 柄
    ctx.beginPath();ctx.ellipse(0,-7*s,7*s,10*s,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(60,66,74,.25)';ctx.beginPath();ctx.ellipse(0,-6*s,4.5*s,7*s,0,0,TAU);ctx.fill();// 大匙
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,-89*s,4*s,6*s,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();},// 小匙
  /* 火柴（ang 为倾角；lit 时头部有火焰） */
  match(ctx,x,y,s=1,ang=0,lit=false,t=0,burnt=0){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle='#e7c38d';ctx.strokeStyle='#8a6a43';ctx.lineWidth=1;rr(ctx,0,-2.5*s,70*s,5*s,1.5);ctx.fill();ctx.stroke();
    if(burnt){ctx.fillStyle='#2b2724';ctx.fillRect(70*s-burnt*30*s,-2.5*s,burnt*30*s,5*s);}
    else{ctx.fillStyle='#b5432a';ctx.beginPath();ctx.ellipse(72*s,0,6*s,4.5*s,0,0,TAU);ctx.fill();}
    if(lit){ctx.rotate(-ang);flame(ctx,Math.cos(ang)*74*s,Math.sin(ang)*74*s,.3*s,t);}ctx.restore();},
  /* 按火柴头的位置画火柴：(hx,hy) 为火柴头，ang 为火柴从柄指向火柴头的方向（点火时火柴头朝向灯芯 / 白烟） */
  matchAt(ctx,hx,hy,s=1,ang=Math.PI,lit=true,t=0){const L=72*s;AP.match(ctx,hx-Math.cos(ang)*L,hy-Math.sin(ang)*L,s,ang,lit,t);},
  /* 蜡烛（h 为蜡烛身高度） */
  candle(ctx,x,y,s=1,{h=110,lit=true,t=0,smoke=0}={}){ctx.save();const w=26*s,top=y-h*s;const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#efe6d4');g.addColorStop(.45,'#fffaf0');g.addColorStop(1,'#d8ccb4');
    ctx.fillStyle=g;ctx.strokeStyle=INK;ctx.lineWidth=1.4;rr(ctx,x-w/2,top,w,h*s,3*s);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-w/2+2,top+3*s);ctx.quadraticCurveTo(x,top+9*s,x+w/2-2,top+3*s);ctx.strokeStyle='rgba(28,26,23,.25)';ctx.stroke();
    ctx.strokeStyle='#2b2724';ctx.lineWidth=2.2*s;ctx.beginPath();ctx.moveTo(x,top+2*s);ctx.quadraticCurveTo(x+1.5*s,top-5*s,x,top-10*s);ctx.stroke();
    ctx.fillStyle='#d9cbb0';ctx.beginPath();ctx.ellipse(x,y+2*s,w*.95,4*s,0,0,TAU);ctx.fill();ctx.restore();
    if(lit)candleFlame(ctx,x,top-9*s,s,t);
    if(smoke>0){ctx.save();for(let i=0;i<14;i++){const k=(i/14+t*.35)%1,yy=top-12*s-k*120*s,xx=x+Math.sin(k*9+i)*6*s*(1+k*2);ctx.globalAlpha=smoke*(1-k)*.55;ctx.fillStyle='#f2f2f2';ctx.strokeStyle='rgba(120,120,120,.35)';ctx.beginPath();ctx.arc(xx,yy,(3+k*8)*s,0,TAU);ctx.fill();ctx.stroke();}ctx.restore();}}
};
/* 蜡烛火焰：外焰、内焰、焰心三层（底部略带蓝色） */
function candleFlame(ctx,x,y,s=1,t=0){const f=1+.05*Math.sin(t*19)+.03*Math.sin(t*31),sw=Math.sin(t*7)*1.5*s;ctx.save();ctx.translate(x,y);ctx.scale(s,s*f);
  const glw=ctx.createRadialGradient(0,-22,2,0,-22,56);glw.addColorStop(0,'rgba(255,200,110,.35)');glw.addColorStop(1,'rgba(255,200,110,0)');ctx.fillStyle=glw;ctx.beginPath();ctx.arc(0,-22,56,0,TAU);ctx.fill();
  const shape=(w,h,dx,y0=0)=>{ctx.beginPath();ctx.moveTo(-w,y0);ctx.bezierCurveTo(-w*1.15,y0-h*.45,-w*.35+dx*.5,y0-h*.8,dx,y0-h);ctx.bezierCurveTo(w*.35+dx*.5,y0-h*.8,w*1.15,y0-h*.45,w,y0);ctx.quadraticCurveTo(0,y0+w*.7,-w,y0);};
  shape(13,64,sw,2);ctx.fillStyle='rgba(255,170,60,.85)';ctx.fill();// 外焰
  shape(9,46,sw*.7,0);ctx.fillStyle='rgba(255,226,140,.95)';ctx.fill();// 内焰
  shape(4.5,18,0,0);ctx.fillStyle='rgba(120,150,240,.9)';ctx.fill();// 焰心（较暗、偏蓝）
  ctx.restore();}

/* 拖动时的放置目标：虚线圈 + 说明 */
function dropZone(ctx,x,y,r,lab,t){ctx.save();ctx.strokeStyle=CA;ctx.lineWidth=2.4;ctx.setLineDash([8,6]);ctx.lineDashOffset=-t*30;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(184,134,47,.1)';ctx.fill();if(lab)hand(ctx,lab,x,y-r-14,{size:16,col:CA});ctx.restore();}
/* ---------- 手（2D 扁平风格，与仪器同一比例）：u 为该场景每厘米像素数 ----------
   握法按真实尺寸计算：手指粗约 1.7 cm、长 7～10 cm，绕在“仪器半径 + 半个指粗”的圆上，绕过的角度 = 指长 ÷ 半径。
   绕过半圈以上（细的试管、试管夹柄）→ 握拢：指尖转到仪器背后，拇指压在食指上；
   不到半圈（粗的试剂瓶）→ 握不拢：指尖停在仪器正面（看得到指甲），拇指在仪器背后（透过玻璃可见）。
   局部坐标：仪器轴线沿 y（管口在 -y，与 testTube 的 ang 一致），手从 +x 一侧握住；flip 时从 -x 一侧。分 back / front 两层画。 */
const SKIN='#f3d4bb',SKIN_D='#e2b799',SKIN_L='#a2694c',CUFF='#fbfaf6';
let HLW=1.3;// 手的描边粗细（小图标时随比例变细）
function capS(ctx,x1,y1,x2,y2,w,fill=SKIN){ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=SKIN_L;ctx.lineWidth=w+2*HLW;ctx.stroke();ctx.strokeStyle=fill;ctx.lineWidth=w;ctx.stroke();}
const FING=[[-2.62,1.72,8.7],[-.87,1.8,9.7],[.9,1.7,9.0],[2.55,1.5,7.3]];// [y 位置, 粗, 长]（cm），食指在上
function gripHand(ctx,layer,x,y,ang,R,u,flip=false){HLW=Math.min(1.3,u*.3);ctx.save();ctx.translate(x,y);ctx.rotate(ang);if(flip)ctx.scale(-1,1);
  const xk=R+.55*u,closed=FING.every(([,t,L])=>L/(R/u+t/2)>=Math.PI);
  if(layer==='back'){if(!closed){capS(ctx,xk+.6*u,-3.35*u,-R*.45,-3.75*u,2.0*u,SKIN_D);}ctx.restore();return;}
  // 前臂 + 白大褂袖口
  ctx.fillStyle=SKIN;ctx.strokeStyle=SKIN_L;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(R+6.6*u,-2.1*u);ctx.lineTo(R+10.6*u,-2.3*u);ctx.lineTo(R+10.6*u,2.7*u);ctx.lineTo(R+6.6*u,2.6*u);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=CUFF;rr(ctx,R+10*u,-2.9*u,3.4*u,6.2*u,.6*u);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(R+10.9*u,-2.9*u);ctx.lineTo(R+10.9*u,3.3*u);ctx.strokeStyle='rgba(162,105,76,.35)';ctx.stroke();
  // 四指：从指根（手背左缘）绕向仪器另一侧
  FING.slice().reverse().forEach(([fy,ft,L])=>{const t=ft*u,Rf=R+t/2,th=L*u/Rf,cy=fy*u;
    const xe=th>=Math.PI?-(R+t*.62):Rf*Math.cos(th);capS(ctx,xk+.4*u,cy,xe,cy+.12*t,t);
    ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(xk,cy-t*.3);ctx.lineTo(xe+t*.4,cy-t*.24);ctx.stroke();
    if(th>=Math.PI){ctx.fillStyle=SKIN_D;ctx.beginPath();ctx.ellipse(xe-t*.08,cy+.12*t,t*.26,t*.4,0,0,TAU);ctx.fill();}// 指尖转到仪器背后
    else{ctx.fillStyle='#fbe9df';ctx.strokeStyle='rgba(162,105,76,.7)';ctx.lineWidth=1;rr(ctx,xe-t*.18,cy-t*.24,t*.62,t*.48,t*.2);ctx.fill();ctx.stroke();}// 指甲
    [.5,.78].forEach(k=>{const a=k*L*u/Rf;if(a<Math.PI){const cx=Rf*Math.cos(a);if(cx>xe+t*.45&&cx<xk-t*.2){ctx.strokeStyle='rgba(162,105,76,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx,cy-t*.32);ctx.quadraticCurveTo(cx-t*.12,cy,cx,cy+t*.32);ctx.stroke();}}});});
  // 手背：指根一排最宽，向腕部收窄
  ctx.fillStyle=SKIN;ctx.strokeStyle=SKIN_L;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(xk,-3.55*u);ctx.bezierCurveTo(R+3*u,-3.9*u,R+5.4*u,-2.9*u,R+7*u,-2.15*u);ctx.lineTo(R+7*u,2.65*u);
  ctx.bezierCurveTo(R+5*u,3.2*u,R+3*u,3.5*u,xk,3.35*u);ctx.bezierCurveTo(xk-.5*u,1.2*u,xk-.5*u,-1.2*u,xk,-3.55*u);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(162,105,76,.35)';ctx.lineWidth=1.2;FING.forEach(([fy])=>{ctx.beginPath();ctx.arc(xk+.9*u,fy*u,.45*u,Math.PI*.6,Math.PI*1.4);ctx.stroke();});
  // 拇指：握拢时压在食指上
  if(closed){capS(ctx,xk+1.6*u,-3.3*u,-R*.1-.2*u,-2.55*u,2.0*u);ctx.fillStyle='#fbe9df';ctx.strokeStyle='rgba(162,105,76,.7)';ctx.lineWidth=1;rr(ctx,-R*.1-.5*u,-3.0*u,1.1*u,.85*u,.3*u);ctx.fill();ctx.stroke();}
  ctx.restore();}
/* 张开的手（掌心朝外、手指向上）：扇闻气味、意外事故图示 */
function openHand(ctx,x,y,ang,u){HLW=Math.min(1.3,u*.3);ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.fillStyle=SKIN;ctx.strokeStyle=SKIN_L;ctx.lineWidth=HLW*1.2;ctx.beginPath();ctx.moveTo(-2.3*u,4.2*u);ctx.lineTo(-2.4*u,9*u);ctx.lineTo(2.4*u,9*u);ctx.lineTo(2.3*u,4.2*u);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=CUFF;rr(ctx,-3*u,7.6*u,6*u,2.6*u,.5*u);ctx.fill();ctx.stroke();
  capS(ctx,-3.2*u,1.6*u,-5.4*u,-1.4*u,2.1*u);capS(ctx,-5.4*u,-1.4*u,-6.2*u,-3.6*u,1.9*u);// 拇指
  [[-2.75,1.7,8.0,-.07],[-.92,1.8,8.9,-.02],[.92,1.7,8.3,.03],[2.65,1.5,6.6,.09]].forEach(([fx,ft,L,a])=>{const x0=fx*u,y0=-3.2*u;capS(ctx,x0,y0,x0+Math.sin(a)*L*u,y0-Math.cos(a)*L*u,ft*u);});
  ctx.fillStyle=SKIN;ctx.strokeStyle=SKIN_L;ctx.lineWidth=HLW*1.2;ctx.beginPath();ctx.moveTo(-3.8*u,-3.4*u);ctx.bezierCurveTo(-1.5*u,-4.3*u,1.6*u,-4.2*u,3.6*u,-3.3*u);ctx.bezierCurveTo(4.1*u,0,3.6*u,3.4*u,2.3*u,4.6*u);ctx.lineTo(-2.4*u,4.6*u);ctx.bezierCurveTo(-3.6*u,3.2*u,-4.2*u,0,-3.8*u,-3.4*u);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(162,105,76,.4)';ctx.lineWidth=HLW;ctx.beginPath();ctx.moveTo(-2.6*u,1.4*u);ctx.quadraticCurveTo(-.5*u,3.2*u,1.6*u,1.6*u);ctx.moveTo(-1.6*u,-1.6*u);ctx.quadraticCurveTo(.8*u,-.6*u,3*u,-1.8*u);ctx.stroke();ctx.restore();}
/* 场景里统一的调用：key 决定仪器半径（cm）：试管 0.9、试剂瓶 2.6、试管夹柄 0.85；'open' 为张开的手 */
function drawHand(ctx,key,layer,x,y,ang,u,flip=false){if(key==='open'){if(layer==='front')openHand(ctx,x,y,ang,u);return;}gripHand(ctx,layer,x,y,ang,{tube:.9,bottle:2.6,handle:.85}[key]*u,u,flip);}
