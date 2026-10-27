/* ================= 像素工具：对战用的低分辨率世界画布、像素粒子、8 位音效 =================
   角色精灵在 hero.js（LPC 素材图集）；舞台和题目里的示意图都用矢量画，不用像素。 */
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
