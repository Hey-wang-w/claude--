/* ================= 像素引擎：原创 Q 版角色（炎刃 / 澜音）+ 像素化 + 技能特效 =================
   做法：先在 64×72 的小画布上用矢量形状画角色（可以自由摆姿势），再把每个像素吸附到角色调色板、去掉半透明、加深色描边，
   得到干净的像素画；按“状态 + 帧号”缓存。舞台用 320×180 的低分辨率世界画布，整体放大显示，特效也都是像素颗粒。 */
const PXW=64,PXH=72,FOOT=[30,70];
const HEROES={
  fire:{name:'炎刃',skill:'烈焰斩',ult:'爆炎·千重斩',team:'r',
    pal:{hair:'#ff5a36',hair2:'#b8261c',hairHi:'#ffb08a',skin:'#ffd9bb',skin2:'#e9a67f',eye:'#ff9a1f',eyeD:'#5a1a10',cloth:'#d83a3a',cloth2:'#8e1f2b',trim:'#ffd23f',pants:'#2b2340',boot:'#6b3a1f',blade:'#fff3c4',blade2:'#ff9a1f',hilt:'#ffd23f',band:'#ff2f4f',white:'#ffffff',mouth:'#9b2b2b'}},
  water:{name:'澜音',skill:'潮汐弹',ult:'沧澜·万水归一',team:'b',
    pal:{hair:'#4da3ff',hair2:'#2558c4',hairHi:'#b5e2ff',skin:'#ffe1c8',skin2:'#eab08d',eye:'#36e2ff',eyeD:'#103a5a',cloth:'#eef6ff',cloth2:'#9fc4ea',trim:'#2558c4',pants:'#1c2f6e',boot:'#2b3f86',orb:'#36e2ff',orb2:'#e9fdff',staff:'#c58b4a',staff2:'#7a4a24',gem:'#7df9ff',white:'#ffffff',mouth:'#b0475a'}}};
const OUTLINE=[26,15,46];
const hex2=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
/* ---------- 姿势：由状态和时间算出关节参数 ---------- */
function heroPose(kind,st,t){const P={dx:0,dy:0,lean:0,armA:.55,armB:.25,legs:0,eyes:'open',mouth:'n',glow:.35,wave:t*3,rot:0,flash:0,wpn:0};
  const blink=(t%3.2)>3.05;
  if(st==='idle'){P.dy=Math.round(Math.sin(t*4)*1);P.eyes=blink?'blink':'open';P.armA=(kind==='water'?1.05:.55)+Math.sin(t*4)*.06;P.glow=.35+.25*Math.sin(t*6);}
  else if(st==='attack'){if(t<.28){const q=t/.28;P.lean=-2*q;P.armA=.55+2.2*q;P.wpn=q;P.glow=.4+.6*q;P.mouth='grit';P.legs=1;}
    else if(t<.5){const q=(t-.28)/.22;P.lean=-2+6*q;P.armA=2.75-1.2*q;P.wpn=1+q;P.glow=1;P.mouth='open';P.legs=1;}
    else{const q=Math.min(1,(t-.5)/.4);P.lean=4-4*q;P.armA=1.55-1*q;P.wpn=2-2*q;P.glow=1-.6*q;P.legs=q<.6?1:0;}}
  else if(st==='hit'){const q=Math.min(1,t/.5);P.dx=-Math.round(6*(1-q));P.lean=-3*(1-q);P.eyes=t<.35?'x':'shut';P.mouth='o';P.flash=t<.12||(t>.2&&t<.28)?1:0;P.armA=.2;}
  else if(st==='jam'){// 蓄力 → 技能卡壳冒烟 → 绊倒仰面摔倒 → 躺一会 → 爬起
    if(t<.5){const q=t/.5;P.armA=.55+2*q;P.wpn=q;P.glow=.4+.6*q*(Math.sin(t*60)>0?1:.3);P.mouth='grit';P.legs=1;}
    else if(t<.75){const q=(t-.5)/.25;P.armA=2.55-.6*q;P.eyes='swirl';P.mouth='o';P.glow=0;P.lean=-2*q;}
    else if(t<1.05){const q=(t-.75)/.3;P.rot=-Math.PI/2*ease(q);P.eyes='swirl';P.mouth='o';P.armA=2;P.armB=2.4;P.legs=2;P.dy=-Math.round(Math.sin(q*Math.PI)*4);}
    else if(t<1.9){P.rot=-Math.PI/2;P.eyes='swirl';P.mouth='o';P.armA=2.2;P.armB=2.6;P.legs=2;P.dy=t<1.2?-Math.round(Math.sin((t-1.05)/.15*Math.PI)*2):0;}
    else{const q=Math.min(1,(t-1.9)/.4);P.rot=-Math.PI/2*(1-ease(q));P.eyes='shut';P.armA=1.2;P.legs=q<1?2:0;}}
  else if(st==='win'){P.dy=-Math.round(Math.abs(Math.sin(t*5))*6);P.armA=2.9;P.armB=2.5;P.eyes='happy';P.mouth='open';P.glow=.8;P.wpn=1.2;}
  else if(st==='ko'){const q=Math.min(1,t/.5);P.rot=-Math.PI/2*ease(q);P.eyes='x';P.mouth='o';P.armA=2.4;P.armB=2.8;P.legs=2;P.glow=0;P.dy=-Math.round(Math.sin(q*Math.PI)*5);}
  return P;}
/* ---------- 矢量木偶（面朝右） ---------- */
function drawPuppet(g,kind,P){const H=HEROES[kind],c=H.pal,fire=kind==='fire';g.save();g.translate(P.dx,P.dy);
  const sx=31+P.lean,sy=44,hx=32+P.lean*1.2,hy=27;
  const fillE=(x,y,rx,ry,col,rot=0)=>{g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,rot,0,Math.PI*2);g.fill();};
  const poly=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
  const limb=(x1,y1,x2,y2,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();};
  const hand=(a,sx0,sy0,L=10)=>[sx0+Math.sin(a)*L,sy0+Math.cos(a)*L];
  // 背后：头发尾 / 披风
  const wv=Math.sin(P.wave)*1.5;
  if(fire){poly([[hx-6,hy-6],[hx-22,hy-2+wv],[hx-14,hy+2],[hx-20,hy+8+wv],[hx-8,hy+6]],c.hair2);
    poly([[hx-9,hy-6],[hx-24,hy-12+wv],[hx-18,hy-4]],c.band);poly([[hx-9,hy-4],[hx-22,hy+3+wv],[hx-16,hy-1]],c.band);}
  else{poly([[sx-8,sy-2],[sx-16,sy+18+wv],[sx-2,sy+16],[sx+4,sy]],c.pants);// 披风
    fillE(hx-6,hy+12,11,17,c.hair2);fillE(hx-12,hy+20+wv,6,11,c.hair2,.3);poly([[hx-12,hy+26],[hx-18,hy+38+wv],[hx-8,hy+34]],c.hair2);}
  // 后臂
  const [bx,by]=hand(-P.armB+0.15,sx-5,sy+1,9);limb(sx-5,sy+1,bx,by,5,fire?c.cloth2:c.cloth2);fillE(bx,by,2.4,2.4,c.skin2);
  // 腿
  const lg=P.legs===1?[[-5,0],[6,-1]]:P.legs===2?[[-6,-3],[7,-4]]:[[-3,0],[3,0]];
  lg.forEach(([ox,oy],i)=>{const x=sx+ox,y=57;limb(sx+(i?2:-2),55,x,66+oy,5,c.pants);fillE(x+1.5,68+oy,4,2.6,c.boot);});
  // 身体
  if(fire){poly([[sx-8,sy-2],[sx+8,sy-2],[sx+9,sy+13],[sx-9,sy+13]],c.cloth);poly([[sx-9,sy+8],[sx+9,sy+8],[sx+9,sy+10],[sx-9,sy+10]],c.cloth2);
    poly([[sx-2,sy-2],[sx+3,sy-2],[sx+1,sy+5]],c.white);poly([[sx-9,sy+12],[sx+9,sy+12],[sx+10,sy+14],[sx-10,sy+14]],c.trim);}
  else{poly([[sx-7,sy-2],[sx+7,sy-2],[sx+7,sy+8],[sx-7,sy+8]],c.cloth);poly([[sx-7,sy+7],[sx+7,sy+7],[sx+12,sy+16],[sx-12,sy+16]],c.trim);
    poly([[sx-12,sy+15],[sx+12,sy+15],[sx+12,sy+17],[sx-12,sy+17]],c.cloth2);fillE(sx+1,sy+1,2.2,2.2,c.gem);}
  // 头
  fillE(hx+1,hy+2,12.5,12,c.skin);fillE(hx+5,hy+8,7,5,c.skin2);fillE(hx+3,hy+3,11,9.5,c.skin);
  // 头发（前额 + 顶）
  if(fire){poly([[hx-13,hy+2],[hx-12,hy-10],[hx-4,hy-16],[hx+2,hy-20],[hx+4,hy-14],[hx+10,hy-17],[hx+9,hy-11],[hx+15,hy-9],[hx+12,hy-4],[hx+14,hy+1],[hx+7,hy-3],[hx+5,hy+1],[hx+1,hy-4],[hx-3,hy+1],[hx-6,hy-3],[hx-10,hy+4]],c.hair);
    poly([[hx-2,hy-17],[hx+2,hy-20],[hx+4,hy-14],[hx,hy-12]],c.hairHi);poly([[hx-11,hy-5],[hx+13,hy-6],[hx+13,hy-4],[hx-11,hy-3]],c.band);}
  else{poly([[hx-13,hy+6],[hx-13,hy-8],[hx-5,hy-15],[hx+5,hy-15],[hx+13,hy-8],[hx+14,hy+2],[hx+8,hy-4],[hx+5,hy+1],[hx+2,hy-5],[hx-2,hy+1],[hx-6,hy-4],[hx-9,hy+8]],c.hair);
    poly([[hx-3,hy-13],[hx+5,hy-13],[hx+2,hy-10]],c.hairHi);fillE(hx+10,hy-9,3.2,3.2,c.gem);fillE(hx+10,hy-10,1.2,1.2,c.white);
    poly([[hx+12,hy-2],[hx+15,hy+12+wv*.5],[hx+11,hy+10]],c.hair2);}
  // 脸：眼睛、嘴
  const ex=[hx+1,hy+4],ef=[hx+8.5,hy+4];
  const eye=([x,y],w)=>{if(P.eyes==='open'){g.fillStyle=c.eyeD;g.fillRect(x-w/2,y-4,w,8);g.fillStyle=c.eye;g.fillRect(x-w/2+.5,y,w-1,3.5);g.fillStyle=c.white;g.fillRect(x-w/2+.5,y-3.5,2,2);}
    else if(P.eyes==='happy'){limb(x-w/2,y+1,x,y-1.5,1.4,c.eyeD);limb(x,y-1.5,x+w/2,y+1,1.4,c.eyeD);}
    else if(P.eyes==='x'){limb(x-2,y-2,x+2,y+2,1.4,c.eyeD);limb(x-2,y+2,x+2,y-2,1.4,c.eyeD);}
    else if(P.eyes==='swirl'){g.strokeStyle=c.eyeD;g.lineWidth=1.2;g.beginPath();g.arc(x,y,2.3,0,Math.PI*1.6);g.stroke();}
    else{limb(x-w/2,y+1,x+w/2,y+1,1.4,c.eyeD);}};
  eye(ex,4);eye(ef,5);
  g.fillStyle=c.mouth;if(P.mouth==='open'||P.mouth==='o')fillE(hx+6,hy+10,P.mouth==='o'?1.6:2.2,P.mouth==='o'?1.6:1.4,c.mouth);else if(P.mouth==='grit'){g.fillRect(hx+4,hy+9.5,4,1.5);}else g.fillRect(hx+5,hy+10,3,1);
  fillE(hx+11,hy+7,1.6,1,'#ff9aa8');// 腮红
  // 前臂 + 武器
  const [fx,fy]=hand(P.armA,sx+5,sy+1,10);
  if(fire){// 剑：idle 斜向前下，蓄力举过头，挥砍水平
    const wa=-.3+P.wpn*1.15;const L=22,ux=Math.cos(-wa),uy=Math.sin(-wa);
    g.save();g.globalAlpha=Math.min(1,P.glow);g.strokeStyle=c.blade2;g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(fx+ux*3,fy+uy*3);g.lineTo(fx+ux*L,fy+uy*L);g.stroke();g.restore();
    limb(fx+ux*2,fy+uy*2,fx+ux*L,fy+uy*L,3,c.blade);limb(fx-uy*3,fy+ux*3,fx+uy*3,fy-ux*3,2,c.hilt);}
  else{// 法杖：竖握，顶端水球
    const wa=Math.PI/2-.12-P.wpn*.55;const ux=Math.cos(-wa),uy=Math.sin(-wa);
    limb(fx-ux*10,fy-uy*10,fx+ux*28,fy+uy*28,2.4,c.staff);const ox=fx+ux*31,oy=fy+uy*31;
    g.save();g.globalAlpha=.35+P.glow*.6;fillE(ox,oy,6.5,6.5,c.orb);g.restore();fillE(ox,oy,4,4,c.orb);fillE(ox-1.2,oy-1.4,1.6,1.6,c.orb2);}
  limb(sx+5,sy+1,fx,fy,5,fire?c.cloth:c.cloth2);fillE(fx,fy,2.5,2.5,c.skin);
  g.restore();}
/* ---------- 像素化：吸附调色板 + 去半透明 + 描边；按状态与帧号缓存 ---------- */
const PIXCACHE=new Map();
function heroSprite(kind,st,t,fps=12){const P=heroPose(kind,st,t);const key=kind+st+Math.round(t*fps)+'|'+P.flash;
  if(PIXCACHE.has(key))return PIXCACHE.get(key);
  const v=document.createElement('canvas');v.width=PXW;v.height=PXH;const g=v.getContext('2d');drawPuppet(g,kind,P);
  const pal=Object.values(HEROES[kind].pal).map(hex2),img=g.getImageData(0,0,PXW,PXH),d=img.data,on=new Uint8Array(PXW*PXH);
  for(let i=0;i<PXW*PXH;i++){const a=d[4*i+3];if(a<120){d[4*i+3]=0;continue;}on[i]=1;let best=0,bd=1e9;const r=d[4*i],gg=d[4*i+1],b=d[4*i+2];
    for(let k=0;k<pal.length;k++){const p=pal[k],dd=(p[0]-r)**2+(p[1]-gg)**2+(p[2]-b)**2;if(dd<bd){bd=dd;best=k;}}
    const p=P.flash?[255,255,255]:pal[best];d[4*i]=p[0];d[4*i+1]=p[1];d[4*i+2]=p[2];d[4*i+3]=255;}
  for(let y=0;y<PXH;y++)for(let x=0;x<PXW;x++){const i=y*PXW+x;if(on[i])continue;
    if((x>0&&on[i-1])||(x<PXW-1&&on[i+1])||(y>0&&on[i-PXW])||(y<PXH-1&&on[i+PXW])){d[4*i]=OUTLINE[0];d[4*i+1]=OUTLINE[1];d[4*i+2]=OUTLINE[2];d[4*i+3]=255;}}
  g.putImageData(img,0,0);
  // 旋转（摔倒）：最近邻旋转后仍是像素画
  // 绕脚底旋转到 96×96 的画布（仰面摔倒时身体朝后躺）
  let out=v,ox=FOOT[0],oy=FOOT[1];if(P.rot){out=document.createElement('canvas');out.width=110;out.height=96;const o=out.getContext('2d');o.imageSmoothingEnabled=false;
    ox=80;oy=90;o.translate(ox,oy);o.rotate(P.rot);o.drawImage(v,-FOOT[0],-FOOT[1]);}
  const res={cv:out,ox,oy};if(PIXCACHE.size>900)PIXCACHE.clear();PIXCACHE.set(key,res);return res;}
/* 画到任意画布：x,y 是脚底位置；flip 时面朝左；scale 为放大倍数（整数最清晰） */
function drawHero(ctx,kind,st,t,x,y,scale,flip=false){const s=heroSprite(kind,st,t);ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));ctx.scale(flip?-scale:scale,scale);ctx.drawImage(s.cv,-s.ox,-s.oy);ctx.restore();}
/* ---------- 像素世界画布：320×180，整体放大 ---------- */
function pixWorld(W=320,H=180){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;return{cv,g,W,H};}
function blitWorld(ctx,world,w,h){const s=Math.min(w/world.W,h/world.H),dw=world.W*s,dh=world.H*s;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(world.cv,(w-dw)/2,(h-dh)/2,dw,dh);ctx.restore();return{s,ox:(w-dw)/2,oy:(h-dh)/2};}
/* 像素小工具 */
const pr=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function pdisc(g,cx,cy,r,c){g.fillStyle=c;r=Math.max(0,r);for(let y=-Math.ceil(r);y<=Math.ceil(r);y++){const hw=Math.floor(Math.sqrt(Math.max(0,r*r-y*y)+.25));if(r*r-y*y>=0)g.fillRect(Math.round(cx)-hw,Math.round(cy)+y,hw*2+1,1);}}
function pring(g,cx,cy,r,c,th=1){g.fillStyle=c;const n=Math.max(12,Math.round(r*7));for(let k=0;k<n;k++){const a=k/n*Math.PI*2;g.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),th,th);}}
/* 像素粒子系统（在世界坐标里） */
function pixParticles(){const ps=[];return{ps,add(p){ps.push(Object.assign({vx:0,vy:0,g:0,life:1,dec:1.5,s:1,c:'#ffffff'},p));},
  step(dt,g){for(let i=ps.length-1;i>=0;i--){const p=ps[i];p.life-=p.dec*dt;if(p.life<=0){ps.splice(i,1);continue;}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    const s=p.shrink?Math.max(1,Math.round(p.s*p.life)):p.s;g.globalAlpha=p.fade?Math.min(1,p.life*1.6):1;pr(g,p.x,p.y,s,s,typeof p.c==='function'?p.c(p.life):p.c);}g.globalAlpha=1;},clear(){ps.length=0;}};}
/* ---------- 微观示意图：○ 和 ● 两种原子；spec=[['A2',3],['B',2]]（A=○，B=●），按种子固定排布 ---------- */
const MICRO={A:[[0,0]],B:[[0,0]],A2:[[-1,0],[1,0]],B2:[[-1,0],[1,0]],AB:[[-1,0],[1,0]],AB2:[[0,0],[-1.6,.9],[1.6,.9]],A2B:[[0,0],[-1.6,.9],[1.6,.9]],A3:[[-1.2,.6],[1.2,.6],[0,-1.2]]};
const MICROK={A:'A',B:'B',A2:'AA',B2:'BB',AB:'AB',AB2:'ABB',A2B:'BAA',A3:'AAA'};
function drawMicro(ctx,x,y,w,h,spec,seed=1,{frame=true,r=0}={}){const R=r||Math.max(5,Math.min(w,h)/13),rnd=rng(seed*7919+13);
  if(frame){ctx.save();ctx.fillStyle='#ffffff';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#1f2a44';ctx.lineWidth=3;ctx.strokeRect(x+1.5,y+1.5,w-3,h-3);ctx.restore();}
  const mols=[];spec.forEach(([k,n])=>{for(let i=0;i<n;i++)mols.push(k);});
  for(let i=mols.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[mols[i],mols[j]]=[mols[j],mols[i]];}
  const cols=Math.ceil(Math.sqrt(mols.length*w/h)),rows=Math.ceil(mols.length/cols),cw=w/cols,ch=h/rows;
  mols.forEach((k,i)=>{const cx=x+cw*(i%cols+.5)+(rnd()-.5)*cw*.12,cy=y+ch*(Math.floor(i/cols)+.5)+(rnd()-.5)*ch*.12,rot=rnd()*Math.PI;
    MICRO[k].forEach(([dx,dy],j)=>{const ax=cx+(dx*Math.cos(rot)-dy*Math.sin(rot))*R*.95,ay=cy+(dx*Math.sin(rot)+dy*Math.cos(rot))*R*.95,big=MICROK[k][j]==='A';
      ctx.beginPath();ctx.arc(ax,ay,big?R:R*.8,0,Math.PI*2);ctx.fillStyle=big?'#ffffff':'#1a0f2e';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#1a0f2e';ctx.stroke();});});}
const microPic=(spec,seed=1)=>(ctx,w,h)=>{const s=Math.min(h-8,w*.5);drawMicro(ctx,(w-s*1.4)/2,4,s*1.4,s,spec,seed);};

/* ---------- 8 位芯片音效（方波 / 三角波 / 噪声） ---------- */
function sfx8(type){if(!SND.on)return;try{SND.ctx=SND.ctx||new(window.AudioContext||window.webkitAudioContext)();const a=SND.ctx;if(a.state==='suspended')a.resume();const t=a.currentTime;
  const sq=(f,d,v=.06,dl=0,f2,typ='square')=>{const o=a.createOscillator(),g=a.createGain();o.type=typ;o.frequency.setValueAtTime(f,t+dl);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dl+d);
    g.gain.setValueAtTime(v,t+dl);g.gain.setValueAtTime(v,t+dl+d*.7);g.gain.exponentialRampToValueAtTime(.0001,t+dl+d);o.connect(g).connect(a.destination);o.start(t+dl);o.stop(t+dl+d+.02);};
  const nz=(d,v=.2,dl=0,lp=3000)=>{const b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),ch=b.getChannelData(0);let last=0;for(let i=0;i<ch.length;i++){if(i%6===0)last=Math.random()*2-1;ch[i]=last*Math.pow(1-i/ch.length,1.5);}
    const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=lp;g.gain.value=v;s.connect(f).connect(g).connect(a.destination);s.start(t+dl);};
  ({coin:()=>{sq(988,.08,.05);sq(1319,.25,.05,.08);},
    start:()=>[523,659,784,1047,784,1047].forEach((f,i)=>sq(f,.1,.05,i*.09)),
    fight:()=>{nz(.25,.25,0,1800);sq(196,.35,.07,0,98);sq(392,.2,.05,.25);sq(523,.4,.05,.4);},
    slash:()=>{nz(.3,.22,0,4000);sq(880,.25,.04,0,220,'sawtooth');},
    fire:()=>{nz(.5,.28,0,1200);sq(300,.4,.05,0,80,'sawtooth');},
    water:()=>{[660,880,1175,1568].forEach((f,i)=>sq(f,.08,.035,i*.05,f*.7,'triangle'));nz(.35,.12,.15,2500);},
    splash:()=>{nz(.45,.25,0,2200);[1200,900,700].forEach((f,i)=>sq(f,.1,.03,.05+i*.06,f*.6,'triangle'));},
    hit:()=>{nz(.18,.35,0,2500);sq(150,.18,.08,0,60);},
    jam:()=>{[0,1,2,3].forEach(i=>sq(i%2?220:180,.06,.04,i*.07));nz(.3,.12,.3,900);sq(400,.35,.05,.35,90,'sawtooth');},
    fall:()=>{sq(600,.35,.05,0,120,'triangle');nz(.2,.3,.35,700);},
    ko:()=>{sq(392,.25,.06,0);sq(330,.25,.06,.25);sq(262,.25,.06,.5);sq(196,.6,.07,.75,98);},
    win:()=>[523,659,784,1047,988,1047,1319].forEach((f,i)=>sq(f,i===6?.5:.11,.05,i*.1)),
    charge:()=>sq(200,.5,.04,0,900),
    select:()=>sq(660,.06,.04),
    blip:()=>sq(1320,.05,.035)})[type]?.();}catch(e){}}
/* 低分辨率舞台：画布按 P 倍像素放大；先在 g 上画像素，再 flush() 放大到画布，最后在 ctx 上写清晰文字 */
function pxStage(cv,P=4){const{ctx,w,h}=fitS(cv);const W=Math.ceil(w/P),H=Math.ceil(h/P);if(!cv._pw||cv._pw.W!==W||cv._pw.H!==H)cv._pw=pixWorld(W,H);
  const wd=cv._pw;wd.g.clearRect(0,0,W,H);ctx.clearRect(0,0,w,h);return{ctx,w,h,g:wd.g,W,H,P,flush(){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(wd.cv,0,0,W*P,H*P);ctx.restore();}};}
/* 像素面板（在低分辨率世界里）：粗边 + 阶梯角 */
function pbox(g,x,y,w,h,fill,edge,{notch=2,shadow=true}={}){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
  if(shadow){g.fillStyle='rgba(31,42,68,.85)';g.fillRect(x+1,y+1,w,h);}
  g.fillStyle=edge;g.fillRect(x+notch,y,w-2*notch,h);g.fillRect(x,y+notch,w,h-2*notch);g.fillRect(x+1,y+1,w-2,h-2);
  g.fillStyle=fill;g.fillRect(x+notch+1,y+1,w-2*notch-2,h-2);g.fillRect(x+1,y+notch+1,w-2,h-2*notch-2);g.fillRect(x+2,y+2,w-4,h-4);}
/* 清晰的“像素感”文字：硬投影，不发光 */
function ptxt(ctx,s,x,y,{size=18,col=INK,sh='#ffffff',align='center',font=HAND,weight=400,base='middle',d=2}={}){ctx.save();ctx.font=`${weight} ${size}px ${font}`;ctx.textAlign=align;ctx.textBaseline=base;
  if(sh){ctx.fillStyle=sh;ctx.fillText(s,x+d,y+d);}ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
