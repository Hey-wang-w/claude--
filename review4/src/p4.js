/* ================= 12 竞赛：街机对战（答对放技能攻击对方；答错技能卡壳、摔倒） =================
   世界画布 256×144，角色是 LPC 像素精灵（hero.js），1 个世界像素放大约 3 倍显示。
   每名角色 3 种普通招式轮流使出，提升题放必杀技；招式的特效都是像素粒子和像素图形。 */
S.fight=(()=>{const W=256,H=144,cv=$('#cvFight'),world=pixWorld(W,H),g=world.g,parts=pixParticles();let t=0,bgc=null;
  const HP=80,GY=124,POS={r:66,b:190},KIND={r:'fire',b:'water'},DIR={r:1,b:-1};
  const F={};let qi=0,phase='ask',fx=[],banner=null,pops=[],shakeT=0,flashT=0,winner=null,curTm='r',order=[],mvIdx={r:0,b:0};const card=$('#fgCard');
  const Q=QB.fight,tag=tm=>`<span class="teamTag ${tm}">${tname(tm)}</span>`,op=tm=>tm==='r'?'b':'r';
  const SKY='#d8edf9',FLOOR='#f3e2b8';
  /* ---------- 静态背景：晴天、太阳、白云、山丘、湖面、砂岩擂台、两侧旗杆 ---------- */
  function paintBG(){bgc=document.createElement('canvas');bgc.width=W;bgc.height=H;const b=bgc.getContext('2d');
    ['#cfe8f7','#d8edf9','#e1f2fb','#eaf6fd','#f1f9fe'].forEach((c,i)=>{b.fillStyle=c;b.fillRect(0,i*18,W,18);});
    const disc=(cx,cy,r,c)=>{b.fillStyle=c;for(let y=-r;y<=r;y++){const hw=Math.floor(Math.sqrt(r*r-y*y));b.fillRect(cx-hw,cy+y,hw*2+1,1);}};
    disc(128,44,11,'#1f2a44');disc(128,44,10,'#ffd23f');disc(125,41,4,'#fff3c4');
    b.fillStyle='#ffb000';[[0,-16],[0,16],[-16,0],[16,0],[-11,-11],[11,-11],[-11,11],[11,11]].forEach(([dx,dy])=>b.fillRect(128+dx-1,44+dy-1,2,2));
    const cloud=(x,y)=>{const B=[[0,6,5],[8,3,7],[17,6,5],[10,8,5]];B.forEach(([dx,dy,r])=>disc(x+dx,y+dy,r+1,'#1f2a44'));b.fillStyle='#1f2a44';b.fillRect(x-1,y+6,20,6);B.forEach(([dx,dy,r])=>disc(x+dx,y+dy,r,'#ffffff'));b.fillStyle='#ffffff';b.fillRect(x,y+6,18,5);b.fillStyle='#e1f2fb';b.fillRect(x+1,y+9,16,2);};
    cloud(88,32);cloud(150,50);
    const mt=(base,amp,col,s)=>{for(let x=0;x<W;x++){const y=Math.round(base-Math.abs(Math.sin(x*.03+s)*amp+Math.sin(x*.08+s*2)*amp*.4));b.fillStyle='#1f2a44';b.fillRect(x,y,1,1);b.fillStyle=col;b.fillRect(x,y+1,1,base+30-y);}};
    mt(90,20,'#9fe0cf',1);mt(95,12,'#63c7b2',3);
    b.fillStyle='#1f2a44';b.fillRect(0,94,W,1);b.fillStyle='#7cc8f0';b.fillRect(0,95,W,16);b.fillStyle='#5cb8f0';for(let y=98;y<111;y+=4)b.fillRect(0,y,W,1);
    b.fillStyle=FLOOR;b.fillRect(0,111,W,33);b.fillStyle='#e3cc97';for(let y=113;y<H;y+=8){b.fillRect(0,y+7,W,1);for(let x=((y>>3)%2?8:0);x<W;x+=16)b.fillRect(x,y,1,8);}
    b.fillStyle='#1f2a44';b.fillRect(0,110,W,2);b.fillStyle='#ffd23f';b.fillRect(0,112,W,1);
    [14,242].forEach(x=>{b.fillStyle='#1f2a44';b.fillRect(x-2,62,4,49);b.fillStyle='#ffffff';b.fillRect(x-1,63,2,47);});}
  function bgAnim(){for(let k=0;k<5;k++){const x=((k*61+t*10)%(W+20))-10,y=99+(k%3)*4;pr(g,x,y,7,1,'#ffffff');}
    [[14,'#ff7a5c',1],[242,'#1f9fd6',-1]].forEach(([x,c,d])=>{for(let i=0;i<12;i++){const yy=64+Math.round(Math.sin(t*6+i*.6)*1.4);const hh=Math.max(1,7-Math.floor(i/2));pr(g,x+d*(2+i)-(d<0?1:0),yy+(7-hh)/2,1,hh,c);}});}
  /* ---------- 角色状态 ---------- */
  const hand=tm=>[POS[tm]+DIR[tm]*18,GY-30];
  function setA(tm,type,o={}){F[tm].a=Object.assign({type,t:0,fired:false},o);}
  function frameOf(tm){const f=F[tm],a=f.a,k=KIND[tm];
    if(a.type==='move'){const m=a.m;if(m.pre){const pn=heroFrames(k,m.pre),pt=pn/10;if(a.t<pt){const q=a.t/pt;return{anim:m.pre,fr:Math.floor(a.t*10),dy:-Math.round(Math.sin(q*Math.PI)*22)};}
        return{anim:m.anim,fr:Math.floor((a.t-pt)*m.fps)};}return{anim:m.anim,fr:Math.floor(a.t*m.fps)};}
    if(a.type==='jam'){const m=HEROES[k].moves[0],n=heroFrames(k,'hurt');
      if(a.t<.45)return{anim:m.anim,fr:Math.min(2,Math.floor(a.t*m.fps)),jx:a.t>.25?(Math.random()-.5)*3:0};
      if(a.t<1.05)return{anim:'hurt',fr:Math.floor((a.t-.45)*10)};if(a.t<1.75)return{anim:'hurt',fr:n-1};return{anim:'hurt',fr:Math.max(0,n-1-Math.floor((a.t-1.75)*10))};}
    if(a.type==='ko')return{anim:'hurt',fr:Math.min(heroFrames(k,'hurt')-1,Math.floor(a.t*9))};
    if(a.type==='win'){const n=heroFrames(k,'win');return{anim:'win',fr:Math.min(n-1,Math.floor(a.t*5))};}
    return null;}
  /* ---------- 招式特效 ---------- */
  const FIRE=['#fff3c4','#ffd23f','#ff9a1f','#ff5a36','#e5484d'],AQUA=['#ffffff','#b8f6ff','#5cc8f0','#1f9fd6','#2558c4'];
  function burst(x,y,n,cols,sp=70,gr=60,s=2){for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,v=20+Math.random()*sp;parts.add({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,g:gr,dec:1.3,c:cols[k%cols.length],s,shrink:true});}}
  function spawnFx(tm,m){const o=op(tm),d=DIR[tm],[hx,hy]=hand(tm),tx=POS[o],ult=!!m.ult,dmg=ult?20:10;let hitDone=false;
    const hit=(x,y)=>{if(hitDone)return;hitDone=true;impact(tm,o,dmg,x,y,KIND[tm]);};
    const P={crescent:{x:hx,y:hy-4,up(dt){this.x+=d*230*dt;for(let k=0;k<3;k++)parts.add({x:this.x-d*6,y:this.y+(Math.random()-.5)*16,vx:-d*30,vy:(Math.random()-.5)*12,dec:2.2,c:FIRE[1+k],s:2,shrink:true});if(d*(this.x-tx)>-6){hit(this.x,this.y);return false;}return true;},
          dr(){const x=Math.round(this.x),y=Math.round(this.y);for(let i=-12;i<=12;i++){const cx=x+Math.round(d*(11-Math.abs(i)*.7)),len=Math.round(8-Math.abs(i)*.4);pr(g,d>0?cx-len:cx,y+i,len,1,'#e5484d');pr(g,d>0?cx-len*.6:cx,y+i,Math.max(1,len*.6),1,'#ff9a1f');pr(g,d>0?cx-len*.25:cx,y+i,Math.max(1,len*.25),1,'#fff3c4');}}},
      wheel:{x:hx,y:GY-9,a:0,up(dt){this.x+=d*170*dt;this.a+=dt*18*d;if(Math.random()<.8)parts.add({x:this.x,y:GY-2,vx:-d*20,vy:-10,dec:1.8,c:FIRE[2+(Math.random()*3|0)],s:2,shrink:true});if(d*(this.x-tx)>-4){hit(this.x,this.y);return false;}return true;},
          dr(){const x=this.x,y=this.y;pring(g,x,y,9,'#e5484d',2);pring(g,x,y,7,'#ff9a1f',1);for(let k=0;k<6;k++){const a=this.a+k*Math.PI/3;for(let r=0;r<8;r+=2)pr(g,x+Math.cos(a)*r,y+Math.sin(a)*r,2,2,k%2?'#ffd23f':'#ff5a36');}pdisc(g,x,y,2,'#fff3c4');}},
      triple:{t:0,balls:[],up(dt){this.t+=dt;if(this.balls.length<3&&this.t>this.balls.length*.14)this.balls.push({x:hx,y:hy-10+this.balls.length*8,on:true});
          this.balls.forEach((b,i)=>{if(!b.on)return;b.x+=d*250*dt;parts.add({x:b.x-d*4,y:b.y+(Math.random()-.5)*4,vx:-d*25,vy:-6,dec:2.4,c:FIRE[1+(i%3)],s:2,shrink:true});if(d*(b.x-tx)>-6){b.on=false;burst(b.x,b.y,10,FIRE,50);sfx8('fire');if(i===2)hit(b.x,b.y);}});
          return this.balls.length<3||this.balls.some(b=>b.on);},
          dr(){this.balls.forEach(b=>{if(!b.on)return;pdisc(g,b.x,b.y,4,'#e5484d');pdisc(g,b.x,b.y,3,'#ff9a1f');pdisc(g,b.x-d,b.y-1,1.5,'#fff3c4');});}},
      meteor:{t:0,ms:[],up(dt){this.t+=dt;if(this.ms.length<7&&this.t>this.ms.length*.1){const big=this.ms.length===6;this.ms.push({x:(big?tx:tx-34+Math.random()*68)+d*24,y:-12,vx:-d*30,on:true,big});}
          this.ms.forEach(m=>{if(!m.on)return;m.y+=200*dt;m.x+=m.vx*dt;for(let k=0;k<2;k++)parts.add({x:m.x+(Math.random()-.5)*4,y:m.y-4,vx:0,vy:-20,dec:2,c:FIRE[k+1],s:2,shrink:true});
            if(m.y>=GY-4){m.on=false;burst(m.x,GY-4,m.big?40:14,FIRE,m.big?110:60,80,m.big?3:2);shakeT=Math.max(shakeT,.15);sfx8('hit');if(m.big){m.x=tx;hit(tx,GY-24);for(let k=0;k<26;k++)parts.add({x:tx+(Math.random()-.5)*20,y:GY,vx:(Math.random()-.5)*10,vy:-60-Math.random()*80,dec:1,c:FIRE[k%5],s:3,shrink:true});}}});
          return this.ms.length<7||this.ms.some(m=>m.on);},
          dr(){this.ms.forEach(m=>{if(!m.on)return;const r=m.big?7:4;pdisc(g,m.x,m.y,r+1,'#e5484d');pdisc(g,m.x,m.y,r,'#ff9a1f');pdisc(g,m.x-1,m.y+1,r*.5,'#fff3c4');});}},
      orb:{x:hx,y:hy-6,t:0,up(dt){this.t+=dt;this.x+=d*190*dt;this.y=hy-6+Math.sin(this.t*10)*2;if(Math.random()<.9)parts.add({x:this.x-d*5,y:this.y+(Math.random()-.5)*8,vx:-d*12,vy:16,g:80,dec:1.6,c:AQUA[1+(Math.random()*3|0)],s:1});if(d*(this.x-tx)>-6){hit(this.x,this.y);return false;}return true;},
          dr(){const x=this.x,y=this.y;pdisc(g,x,y,7,'#2558c4');pdisc(g,x,y,6,'#1f9fd6');pdisc(g,x,y,4,'#5cc8f0');pdisc(g,x-2,y-2,2,'#ffffff');const a=this.t*12;for(let k=0;k<3;k++){const aa=a+k*2.1;pr(g,x+Math.cos(aa)*10,y+Math.sin(aa)*10,2,2,'#b8f6ff');}}},
      spikes:{t:0,n:0,sp:[],up(dt){this.t+=dt;const span=Math.abs(tx-hx);while(this.n<6&&this.t>this.n*.08){const q=(this.n+1)/6;this.sp.push({x:hx+d*span*q,t:0,big:this.n===5});this.n++;sfx8('blip');}
          this.sp.forEach(s=>s.t+=dt);const last=this.sp[5];if(last&&last.t>.08)hit(tx,GY-20);return this.t<1;},
          dr(){this.sp.forEach(s=>{const hgt=Math.min(1,s.t*8)*(s.big?38:20)*Math.max(0,Math.min(1,(1-this.t)*3)),w=s.big?9:5;for(let y=0;y<hgt;y++){const ww=Math.max(1,Math.round(w*(1-y/hgt)));pr(g,s.x-ww,GY-y,ww*2,1,y%3?'#b8f6ff':'#5cc8f0');pr(g,s.x-ww,GY-y,1,1,'#2558c4');}});}},
      beam:{t:0,up(dt){this.t+=dt;if(this.t>.18)hit(tx,hy-4);if(this.t<.7&&Math.random()<.9)parts.add({x:tx-d*4,y:hy-4+(Math.random()-.5)*10,vx:d*30*Math.random(),vy:-30*Math.random(),g:100,dec:1.6,c:AQUA[Math.random()*4|0],s:2,shrink:true});return this.t<.75;},
          dr(){const q=Math.min(1,this.t*6)*Math.min(1,(.75-this.t)*6),x0=hx,x1=tx-d*4,th=Math.max(1,Math.round(7*q));for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++){const wob=Math.round(Math.sin(x*.5+this.t*30)*1.2);pr(g,x,hy-4-th/2+wob,1,th,'#1f9fd6');pr(g,x,hy-4-th/4+wob,1,Math.max(1,th/2),'#b8f6ff');}}},
      tsunami:{t:0,x:POS[tm]-d*30,up(dt){this.t+=dt;this.x+=d*(this.t<.25?30:230)*dt;if(Math.random()<.9)parts.add({x:this.x+d*4,y:GY-34-Math.random()*10,vx:d*40,vy:-20,g:120,dec:1.4,c:'#ffffff',s:2,shrink:true});if(d*(this.x-tx)>-10)hit(tx,GY-24);return d*(this.x-tx)<40;},
          dr(){const hgt=Math.min(1,this.t*3)*46,x=this.x;for(let i=0;i<70;i++){const xx=x-d*i,hh=hgt*(1-i/70)*(1+.08*Math.sin(i*.4+this.t*12));if(hh<1)continue;pr(g,xx,GY-hh,1,hh,i<4?'#ffffff':i%9<5?'#1f9fd6':'#2a7fd0');pr(g,xx,GY-hh,1,2,'#b8f6ff');}
            for(let k=0;k<8;k++){const xx=x-d*(k*3),yy=GY-hgt-2+Math.round(Math.sin(k+this.t*15)*2);pr(g,xx,yy,2,2,'#ffffff');}}}};
    const e=Object.assign({},P[m.fx]);fx.push(e);}
  function impact(tm,o,dmg,x,y,kind){const d=F[o];d.hp=Math.max(0,d.hp-dmg);setA(o,'hit');shakeT=dmg>10?.5:.3;flashT=Math.max(flashT,dmg>10?.2:.08);sfx8('hit');if(kind==='water')sfx8('splash');
    pops.push({txt:`-${dmg}`,tm:o,t:0,col:'#e5484d',big:dmg>10});burst(x,y,dmg>10?50:26,kind==='fire'?FIRE:AQUA,dmg>10?110:70,kind==='fire'?60:150);
    if(d.hp<=0)setTimeout(()=>end(tm,true),700);else setTimeout(()=>{if(phase==='anim')phase='ask';showNext();},900);}
  /* 判分后：答对 → 出招；答错 → 卡壳摔倒 */
  function act(tm,ok,ult){phase='anim';const k=KIND[tm];
    if(ok){const m=ult?Object.assign({ult:true},HEROES[k].ult):HEROES[k].moves[mvIdx[tm]++%3];setA(tm,'move',{m});sfx8(ult?'charge':'slash');
      if(!ult)pops.push({txt:m.name+'！',tm,t:0,col:tm==='r'?'#e5484d':'#1f9fd6',name:true});if(ult){banner={txt:`必杀！${m.name}`,t:0,col:tm==='r'?'#e5484d':'#1f9fd6'};flashT=.25;}}
    else{setA(tm,'jam');sfx8('charge');setTimeout(()=>{sfx8('jam');const[hx,hy]=hand(tm);for(let k2=0;k2<16;k2++)parts.add({x:hx,y:hy-6,vx:(Math.random()-.5)*30,vy:-10-Math.random()*20,dec:.8,c:k2%2?'#8a95ad':'#c9d3e3',s:3,shrink:true});pops.push({txt:'卡壳！',tm,t:0,col:'#e69500'});},350);
      setTimeout(()=>sfx8('fall'),600);setTimeout(()=>{if(phase==='anim')phase='ask';showNext();},2400);}}
  function end(w,ko=true){if(winner)return;winner=w||'draw';phase='end';const l=w?op(w):null;
    if(w){setA(w,'win');if(ko)setA(l,'ko');teamAdd(20,w);sfx8(ko?'ko':'win');setTimeout(()=>{sfx8('win');FX.confetti();},900);banner={txt:ko?'K.O.':'判定胜',t:0,col:'#ffd23f',big:true,end:true};}
    else{banner={txt:'平局',t:0,col:'#ffd23f',big:true,end:true};}
    card.innerHTML=`<div class="qmeta"><span class="tag">比赛结束</span></div><div class="qtext" style="font-size:26px">${w?`${tag(w)} 获胜！`:'两队打成平手！'}</div>
      <p class="hint">${w?(ko?`${HEROES[KIND[w]].name}把对手打倒，额外 +20。`:`题目答完，${HEROES[KIND[w]].name}血量领先，判定获胜，额外 +20。`):'题目答完时血量相同。'}</p>
      <div class="fres">${order.map(([i,ok,tm])=>`<span class="${ok?'ok':'no'} ${tm}"><b>${i+1}</b>${ok?'命中':'卡壳'}</span>`).join('')}</div><p class="hint">答错的题已记入小结页“错题回顾”，可以再练变式。</p>`;}
  function ask(){if(winner)return;if(qi>=Q.length){const r=F.r.hp,b=F.b.hp;end(r>b?'r':b>r?'b':null,false);return;}phase='ask';curTm=TEAM.cur;const q=Q[qi],ult=(q.pts||10)>10;
    const nm=ult?HEROES[KIND[curTm]].ult.name:HEROES[KIND[curTm]].moves[mvIdx[curTm]%3].name;
    card.innerHTML=`<div class="qmeta">${tag(curTm)}<span class="tag">第 ${qi+1} / ${Q.length} 题 · ${q.pts||10} 分${ult?' · 必杀技':''}</span><span class="hint">答对放出：${nm}</span></div><div class="fq"></div>`;
    const my=qi,v=qView($('.fq',card),q,{pts:q.pts||10,head:'',onJudge:(ok)=>{order.push([my,ok,curTm]);if(!ok)VARS.arm(v.stem,q,`对战 第 ${my+1} 题`);act(curTm,ok,ult);}});}
  function showNext(){if(winner||phase!=='ask'||$('.fnext',card))return;const r=document.createElement('div');r.className='row fnext';r.innerHTML='<button class="btn pri sm">下一题 ▶</button>';card.appendChild(r);
    $('button',r).onclick=()=>{qi++;ask();sfx8('select');};}
  function reset(){qi=0;phase='ask';fx=[];mvIdx={r:0,b:0};banner={txt:'ROUND 1 · FIGHT!',t:0,col:'#ffd23f',big:true};pops=[];winner=null;order=[];parts.clear();
    ['r','b'].forEach(k=>{F[k]={hp:HP,disp:HP,a:{type:'idle',t:0}};});teamSet('r');ask();}
  ['r','b'].forEach(k=>{F[k]={hp:HP,disp:HP,a:{type:'idle',t:0}};});
  function step(dt){['r','b'].forEach(k=>{const f=F[k],a=f.a;a.t+=dt;f.disp=lerp(f.disp,f.hp,1-Math.exp(-dt*5));
      if(a.type==='move'){const m=a.m,pt=m.pre?heroFrames(KIND[k],m.pre)/10:0,fr=Math.floor((a.t-pt)*m.fps);if(!a.fired&&a.t>=pt&&fr>=m.hit){a.fired=true;spawnFx(k,m);}
        if(a.t>pt+heroFrames(KIND[k],m.anim)/m.fps+.15)setA(k,'idle');}
      else if(a.type==='hit'&&a.t>.5)setA(k,f.hp<=0?'ko':'idle');else if(a.type==='jam'&&a.t>2.35)setA(k,'idle');});
    fx=fx.filter(e=>e.up(dt));}
  function tick(dt){t+=dt;step(dt);if(!bgc)paintBG();
    g.clearRect(0,0,W,H);g.drawImage(bgc,0,0);bgAnim();
    if(phase==='ask'&&!winner){const x=POS[curTm],c=curTm==='r'?'#e5484d':'#1f9fd6';for(let k=0;k<3;k++){const q=((t*1.2+k/3)%1);g.globalAlpha=1-q;g.save();g.translate(x,GY+1);g.scale(1,.35);pring(g,0,0,10+q*14,c);g.restore();}g.globalAlpha=1;}
    ['r','b'].forEach(k=>{g.fillStyle='rgba(31,42,68,.22)';g.fillRect(POS[k]-13,GY-1,26,3);});
    ['r','b'].forEach(k=>{const f=F[k],a=f.a,kind=KIND[k];let x=POS[k],y=GY;
      if(a.type==='hit'){x-=DIR[k]*Math.round(8*Math.max(0,1-a.t/.35));}
      const fr=frameOf(k);
      if(!fr)drawHeroIdle(g,kind,t+(k==='b'?.4:0),x,y,1,{tint:a.type==='hit'&&a.t<.18?'#ffffff':null});
      else drawHeroFrame(g,kind,fr.anim,fr.fr,x+(fr.jx||0),y+(fr.dy||0),1);});
    fx.forEach(e=>e.dr());parts.step(dt,g);
    // 血条
    [['r',6,1],['b',W-6,-1]].forEach(([k,x0,dir])=>{const f=F[k],bw=96,x=dir>0?x0:x0-bw;pr(g,x-2,5,bw+4,9,'#1f2a44');pr(g,x-1,6,bw+2,7,'#ffffff');
      const v=Math.round(bw*f.disp/HP),hv=Math.round(bw*f.hp/HP);pr(g,dir>0?x:x+bw-v,7,v,5,'#ffb000');pr(g,dir>0?x:x+bw-hv,7,hv,5,f.hp>HP*.3?'#1f9d6b':'#e5484d');pr(g,dir>0?x:x+bw-hv,7,hv,1,'#9ee6b8');});
    const{ctx,w,h}=fitS(cv);ctx.fillStyle=SKY;ctx.fillRect(0,0,w,h/2);ctx.fillStyle=FLOOR;ctx.fillRect(0,h/2,w,h/2);let sx=0,sy=0;if(shakeT>0){shakeT-=dt;sx=(Math.random()-.5)*14;sy=(Math.random()-.5)*10;}
    ctx.save();ctx.translate(sx,sy);const m=blitWorld(ctx,world,w,h);ctx.restore();const X=x=>m.ox+x*m.s,Y=y=>m.oy+y*m.s;
    if(flashT>0){flashT-=dt;ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(0,0,w,h);}
    ptxt(ctx,`红队 · ${HEROES.fire.name}`,X(6),Y(22)+4,{size:18,col:'#e5484d',align:'left'});ptxt(ctx,`${HEROES.water.name} · 蓝队`,X(W-6),Y(22)+4,{size:18,col:'#1f9fd6',align:'right'});
    ptxt(ctx,`${Math.ceil(F.r.hp)}`,X(106),Y(9.5),{size:15,col:'#1f2a44',sh:null,font:FNUM,weight:900,align:'left'});ptxt(ctx,`${Math.ceil(F.b.hp)}`,X(W-106),Y(9.5),{size:15,col:'#1f2a44',sh:null,font:FNUM,weight:900,align:'right'});
    ptxt(ctx,`${TEAM.sc.r} : ${TEAM.sc.b}`,w/2,Y(10),{size:22,col:'#1f2a44',font:FNUM,weight:900});
    if(phase==='ask'&&!winner){const x=X(POS[curTm]),y=Y(GY-70)+Math.sin(t*6)*4;ptxt(ctx,'▼ 答题中',x,y,{size:18,col:curTm==='r'?'#e5484d':'#1f9fd6'});}
    pops=pops.filter(p=>{p.t+=dt;const life=p.name?1.1:1.2;if(p.t>life)return false;const x=X(POS[p.tm]),y=Y(GY-(p.name?78:68))-p.t*(p.name?14:46);ctx.save();ctx.globalAlpha=Math.min(1,(life-p.t)*3);
      ptxt(ctx,p.txt,x,y,{size:p.name?26:p.big?46:p.txt.length>2?28:36,col:p.col,sh:'#1f2a44',font:p.txt.startsWith('-')?FNUM:HAND,weight:900,d:3});ctx.restore();return true;});
    if(banner){banner.t+=dt;const q=banner.t,dur=banner.big?2.2:1.6;if(q>dur&&!banner.end)banner=null;else{const sc=q<.2?.4+q*3:1;ctx.save();ctx.translate(w/2,Y(60));ctx.scale(sc,sc);
      ptxt(ctx,banner.txt,0,0,{size:banner.big?84:44,col:banner.col,sh:'#1f2a44',font:banner.txt.match(/^[A-Z. 0-9·!]+$/)?FNUM:HAND,weight:900,d:6});ctx.restore();
      if(banner.end&&winner!=='draw'&&q>1.2)ptxt(ctx,`${tname(winner)} WIN!`,w/2,Y(60)+72,{size:34,col:winner==='r'?'#e5484d':'#1f9fd6',font:FNUM,weight:900,d:4,sh:'#1f2a44'});}}}
  $('#fgReset').onclick=reset;
  let first=true;
  return{tick,enter(){if(first){first=false;reset();sfx8('fight');}}};})();

/* ================= 13 小结：易错点清单 + 错题回顾（变式完成情况） ================= */
S.sum=(()=>{const g=$('#suGrid');
  const COL=[['1-1 水资源及其利用','#1f9fd6',[['水资源','总量多但可利用的淡水少；我国人均约为世界的 1/4'],['过滤','玻璃棒引流；滤液浑浊要查明原因再过滤'],['活性炭','吸附色素和异味，是物理变化；不能杀菌'],['硬水软水','用肥皂水区分：泡沫多、浮渣少的是软水']]],
    ['1-2 水的组成','#1f9d6b',[['电解水','正氧负氢，V(正)∶V(负) ≈ 1∶2'],['结论','水由氢元素和氧元素组成（不是由氢气和氧气组成）'],['氢气','点燃前一定要验纯；密度最小、难溶于水'],['分类','氧化物：两种元素、其中一种是氧元素的化合物']]],
    ['1-3 物质组成的表示','#e69500',[['数字位置','前：个数；右下：原子数；右上：电荷；正上方：化合价'],['化合价','化合物中正、负化合价的代数和为 0；单质为 0'],['质量比','可以不化简，但题目要求最简比时要约分'],['纯度','先由元素质量求纯物质质量，再除以样品质量']]]];
  function render(hideAll=true){g.innerHTML=COL.map(([h,c,items])=>`<div class="scol" style="--tc:${c}"><h4>${h}</h4>${items.map(([q,a])=>`<div class="sitem${hideAll?' hide':''}"><span class="q">${q}</span><span class="a">${a}</span></div>`).join('')}</div>`).join('');
    $$('.sitem',g).forEach(x=>x.onclick=()=>{x.classList.toggle('hide');sfx8('blip');});}
  $('#suAll').onclick=()=>{$$('.sitem',g).forEach((x,i)=>setTimeout(()=>x.classList.remove('hide'),i*80));sfx8('start');};
  $('#suHide').onclick=()=>{$$('.sitem',g).forEach(x=>x.classList.add('hide'));sfx8('blip');};
  render();
  return{enter(){const r=TEAM.sc.r,b=TEAM.sc.b;$('#suScore').innerHTML=`<span class="cm">红队 ${r}</span>　<span style="color:var(--blue);font-weight:700">蓝队 ${b}</span><br><small class="hint">${r===b?'平分秋色！':(r>b?'红队':'蓝队')+'领先'}</small>`;
    const L=VARS.log;$('#suLog').innerHTML=L.length?L.map(e=>`<div class="vrow"><b>${e.src}</b><span>${e.ok.size} / ${e.q.v.length} 道变式做对</span><button class="btn sm">再练</button></div>`).join(''):'<p class="hint">本节还没有答错的题，或者答错后还没做变式。</p>';
    $$('#suLog .vrow button').forEach((b,i)=>b.onclick=()=>VARS.open(L[i].q,L[i].src));}};})();
