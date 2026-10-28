/* ================= 8 量筒读数：拖动眼睛，看读数与实际体积的差别 ================= */
S.cyl=(()=>{const cv=$('#cvCyl');let t=0,mode=0,eyeY=300,V=34,Vt=34,G=null,moved=false;
  const CX=400,R=40,Y0=520,PX=8,F=.16,EX=780;// 0 mL 在 Y0，每 mL 8 px；F：视线在量筒壁处的偏移系数
  const yOf=v=>Y0-v*PX,reading=()=>V-(eyeY-yOf(V))*F/PX,TGT=30;
  const fill30=()=>(TGT+(eyeY-Y0)*F/PX)/(1-F);
  const kind=()=>{const d=eyeY-yOf(V);return Math.abs(d)<14?'平视':d<0?'俯视':'仰视';};
  function draw(){const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G=scene(w,h,1000,600,70);ctx.save();ctx.translate(G.ox,G.oy);ctx.scale(G.k,G.k);
    if(Math.abs(V-Vt)>.01){V+=Math.sign(Vt-V)*Math.min(Math.abs(Vt-V),12*1/60);}
    // 量筒
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,566,1000,8);
    ctx.fillStyle='rgba(222,236,246,.5)';ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(CX-80,566);ctx.lineTo(CX+80,566);ctx.lineTo(CX+66,540);ctx.lineTo(CX-66,540);ctx.closePath();ctx.fill();ctx.stroke();
    const top=yOf(55);ctx.beginPath();ctx.moveTo(CX-R-8,top-6);ctx.lineTo(CX-R,top+6);ctx.lineTo(CX-R,540);ctx.lineTo(CX+R,540);ctx.lineTo(CX+R,top);ctx.fillStyle=GL_F;ctx.fill();
    const ly=yOf(V);ctx.save();ctx.beginPath();ctx.rect(CX-R,top,2*R,540-top);ctx.clip();ctx.fillStyle=SOL;ctx.beginPath();ctx.moveTo(CX-R,ly-7);ctx.quadraticCurveTo(CX,ly+7,CX+R,ly-7);ctx.lineTo(CX+R,545);ctx.lineTo(CX-R,545);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(60,120,170,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(CX-R,ly-7);ctx.quadraticCurveTo(CX,ly+7,CX+R,ly-7);ctx.stroke();ctx.restore();
    ctx.strokeStyle=GL_S;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(CX-R-8,top-6);ctx.lineTo(CX-R,top+6);ctx.lineTo(CX-R,540);ctx.lineTo(CX+R,540);ctx.lineTo(CX+R,top);ctx.stroke();
    ctx.strokeStyle=INK;ctx.lineWidth=1.2;for(let m=0;m<=50;m++){const y=yOf(m);ctx.beginPath();ctx.moveTo(CX-R,y);ctx.lineTo(CX-R+(m%5===0?24:12),y);ctx.stroke();if(m%10===0)txt(ctx,String(m),CX-R-22,y,{size:16,weight:700});}
    txt(ctx,'mL',CX-R-22,yOf(55),{size:14,col:DIM,weight:700});glassHi(ctx,CX+R*.55,top+10,CX+R*.55,530,3,.6);
    // 眼睛与视线
    const yw=ly+(eyeY-ly)*F,R0=reading(),k=kind(),col=k==='平视'?OKC:BADC;
    ctx.setLineDash([7,5]);ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(EX-26,eyeY);ctx.lineTo(CX,ly);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(CX-R-6,yw);ctx.lineTo(CX+R+6,yw);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(CX,ly,4,0,TAU);ctx.fill();
    eye(ctx,EX,eyeY);caption(ctx,`${k}（拖动眼睛）`,EX+10,eyeY+(eyeY<120?46:-40),null,null,{col:INK,size:17});
    // 读数卡
    const card=(y,lab,val,c)=>{ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.fillRect(560,y,240,62);ctx.strokeRect(560,y,240,62);txt(ctx,lab,576,y+20,{size:14,col:DIM,weight:700,align:'left'});txt(ctx,val,784,y+40,{size:28,weight:800,col:c,align:'right'});};
    if(mode===0){card(70,'读　数',`${R0.toFixed(1)} mL`,col);card(144,'实际体积',moved?`${V.toFixed(1)} mL`:'?? mL',INK);
      hand(ctx,k==='平视'?'读数准确':k==='俯视'?'俯视：读数偏大':'仰视：读数偏小',680,236,{size:20,col});}
    else{card(70,'读　数',`${Math.abs(V-Vt)>.05?R0.toFixed(1):TGT.toFixed(1)} mL`,INK);card(144,'实际量取',Math.abs(V-Vt)>.05?'?? mL':`${V.toFixed(1)} mL`,Math.abs(V-Vt)>.05?INK:col);
      if(Math.abs(V-Vt)<=.05)hand(ctx,k==='平视'?'量取准确：30 mL':k==='俯视'?'俯视量取：实际不到 30 mL':'仰视量取：实际超过 30 mL',680,236,{size:20,col});
      else hand(ctx,'倒入液体，读数到 30 mL 时停止…',680,236,{size:18,col:DIM});}
    ctx.restore();
    hand(ctx,mode===0?'上下拖动眼睛（或点下方按钮），看读数怎样变化':'先选视线，再看按这个视线“量取 30 mL”实际倒了多少',w/2,26,{size:17,col:DIM});}
  function eye(ctx,x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='#fffdf8';ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-30,0);ctx.quadraticCurveTo(0,-24,30,0);ctx.quadraticCurveTo(0,24,-30,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#5b4632';ctx.beginPath();ctx.arc(-8,0,10,0,TAU);ctx.fill();ctx.fillStyle=INK;ctx.beginPath();ctx.arc(-9,0,5,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-11,-3,2.2,0,TAU);ctx.fill();
    ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-26,-20);ctx.quadraticCurveTo(0,-34,28,-18);ctx.stroke();ctx.restore();}
  const setEye=y=>{eyeY=clamp(y,70,530);moved=true;if(mode===1)Vt=clamp(fill30(),0,50);};
  const ui=canvasUI(cv,{tools:()=>{if(!G)return[];const[x,y]=G.toC(EX,eyeY);return[{id:'eye',x,y,r:40*G.k,draw:()=>{}}];},onTap:()=>{}});
  cv.addEventListener('pointermove',()=>{if(ui.drag&&ui.drag.moved){const[,sy]=G.toS(ui.drag.x,ui.drag.y-ui.drag.dy);setEye(sy);}});
  const preset=d=>{setEye(yOf(mode===1?TGT:V)+d);sfx('click');};
  $('#cyUp').onclick=()=>preset(180);$('#cyLv').onclick=()=>preset(0);$('#cyDn').onclick=()=>preset(-180);
  const setMode=m=>{mode=m;['#cyM0','#cyM1'].forEach((s,i)=>$(s).setAttribute('aria-pressed',String(i===m)));if(m===0){V=Vt=34;}else{V=0;Vt=clamp(fill30(),0,50);}moved=m===1;sfx('click');};
  $('#cyM0').onclick=()=>setMode(0);$('#cyM1').onclick=()=>setMode(1);
  const q=qPanel($('#cyQ'),QB.cyl,{src:'读数小测'});
  $('#cyReset').onclick=()=>{eyeY=300;moved=false;setMode(0);q.reset();};
  notes('cyl','量筒的使用',['量筒放平，视线与量筒内液体<mark>凹液面的最低处</mark>保持水平，再读出体积。','<mark>俯视</mark>：读数偏大（实际偏小）；<mark>仰视</mark>：读数偏小（实际偏大）。','选量筒：量程<mark>大于且最接近</mark>所需体积，一次量完。','接近刻度时改用胶头滴管滴加；量筒不能加热，不能作反应容器。'],
    '俯视量取 30 mL：读数到 30 时，实际不到 30 mL。',
    (ctx,w,h)=>{const x=w*.3,top=h*.08,bot=h*.92,lv=h*.5;ctx.strokeStyle=PEN.ink;ctx.lineWidth=2;ctx.strokeRect(x-24,top,48,bot-top);
      ctx.strokeStyle=PEN.blue;ctx.beginPath();ctx.moveTo(x-24,lv-5);ctx.quadraticCurveTo(x,lv+6,x+24,lv-5);ctx.stroke();
      [['俯视',-h*.32,PEN.red,'偏大'],['平视',0,PEN.green,'准确'],['仰视',h*.32,PEN.red,'偏小']].forEach(([s,dy,col,r])=>{const ey=lv+dy;ctx.setLineDash([5,4]);ctx.strokeStyle=col;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(w*.74,ey);ctx.lineTo(x,lv+1);ctx.stroke();ctx.setLineDash([]);
        hand(ctx,'◉',w*.77,ey,{size:18,col:PEN.ink});hand(ctx,`${s} · 读数${r}`,w*.77,ey+(dy>0?-20:20),{size:15,col});});});
  return{tick(dt){t+=dt;draw();}};})();

/* ================= 9 酒精灯与给液体加热：错误做法真实发生（失火、火焰压入灯内、试管炸裂、液体喷出） ================= */
S.lamp=(()=>{const cv=$('#cvLamp'),bar=$('#lpBar');let t=0,mode=0,G=null,msg=null,A=null;
  const L={cap:true,lit:false,fire:0,inner:0,cloth:0};// 酒精灯
  const H={full:false,noPre:false,face:false,wick:false,res:null};// 给液体加热
  function buildBar(){const tabs=`<button class="btn" data-m="0" aria-pressed="${mode===0}">酒精灯</button><button class="btn" data-m="1" aria-pressed="${mode===1}">给液体加热</button><span class="sep"></span>`;
    bar.innerHTML=tabs+(mode===0?['火柴点燃','灯引灯','嘴吹灭','灯帽盖灭','湿抹布盖灭'].map((s,i)=>`<button class="btn" data-a="${i}">${s}</button>`).join('')
      :[['full','液体超过 1/3'],['noPre','不预热'],['wick','试管底碰灯芯'],['face','管口对着人']].map(([k,s])=>`<button class="btn" data-t="${k}" aria-pressed="${H[k]}">${s}</button>`).join('')+'<button class="btn pri" data-go="1">开始加热</button>');
    $$('[data-m]',bar).forEach(b=>b.onclick=()=>{mode=+b.dataset.m;msg=null;A=null;buildBar();sfx('click');});
    $$('[data-a]',bar).forEach(b=>b.onclick=()=>act(+b.dataset.a));
    $$('[data-t]',bar).forEach(b=>b.onclick=()=>{if(A)return;H[b.dataset.t]=!H[b.dataset.t];H.res=null;stampOff(cv.parentNode.parentNode);b.setAttribute('aria-pressed',String(H[b.dataset.t]));sfx('click');});
    $$('[data-go]',bar).forEach(b=>b.onclick=heat);upd();}
  function upd(){if(mode!==0)return;const B=$$('[data-a]',bar),busy=!!A;B[0].disabled=busy||L.lit||L.fire>0;B[1].disabled=busy||L.lit||L.fire>0;B[2].disabled=busy||!L.lit;B[3].disabled=busy||!(L.lit||L.inner>0);B[4].disabled=busy||!(L.fire>0);}
  function act(i){if(A)return;stampOff(cv.parentNode.parentNode);
    if(i===0&&!L.lit){A={k:'match',t0:t,dur:2.2};}
    else if(i===1&&!L.lit){A={k:'lamp2',t0:t,dur:3};}
    else if(i===2&&L.lit){A={k:'blow',t0:t,dur:2};}
    else if(i===3&&(L.lit||L.inner)){A={k:'cap',t0:t,dur:1.2};}
    else if(i===4&&L.fire){A={k:'cloth',t0:t,dur:1.6};}
    sfx('whoosh');upd();}
  function finish(k){
    if(k==='match'){L.cap=false;L.lit=true;msg=[[true,'取下灯帽，用火柴点燃酒精灯']];sfx('ok');}
    if(k==='lamp2'){L.cap=false;L.lit=true;L.fire=1;msg=[[false,'用燃着的酒精灯去引燃：酒精洒出，在桌上燃烧起来！'],[true,'应立即用湿抹布盖灭']];sfx('boom');shake();}
    if(k==='blow'){L.lit=false;L.inner=1;msg=[[false,'用嘴吹灭：火焰沿灯颈压入灯内，可能引燃灯内酒精，甚至爆炸'],[true,'应该用灯帽盖灭']];sfx('bad');shake();}
    if(k==='cap'){L.lit=false;L.inner=0;L.cap=true;msg=[[true,'用灯帽盖灭，火焰因缺少空气而熄灭']];sfx('ok');stampOn(cv.parentNode.parentNode,'规范',true,'50%','28%');}
    if(k==='cloth'){L.fire=0;L.cloth=1;msg=[[true,'湿抹布盖灭：隔绝空气并降温']];sfx('ok');}
    A=null;upd();}
  function heat(){if(A)return;H.res=null;stampOff(cv.parentNode.parentNode);A={k:'heat',t0:t,dur:6};sfx('whoosh');}
  const LS=1.3,LX=400,LBY=540,WICK=[LX,LBY-107*LS],CAPP=[560,LBY],MATCHP=[730,LBY],LAMP2=[880,LBY],CLOTH=[150,LBY];
  function capShape(ctx,x,y){ctx.save();ctx.translate(x,y);ctx.scale(LS,LS);ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(-17,-38);ctx.quadraticCurveTo(0,-50,17,-38);ctx.lineTo(20,0);ctx.closePath();ctx.fillStyle='rgba(210,230,240,.6)';ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=2;ctx.stroke();ctx.restore();}
  function matchbox(ctx,x,y){ctx.save();ctx.fillStyle='#c9965a';ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.fillRect(x-44,y-22,88,22);ctx.strokeRect(x-44,y-22,88,22);ctx.fillStyle='#6b4f2a';ctx.fillRect(x-44,y-22,88,5);ctx.restore();AP.match(ctx,x-34,y-30,1,-.08);hand(ctx,'火柴',x,y+24,{size:15,col:DIM});}
  function clothAt(ctx,x,y,w=120){ctx.save();ctx.fillStyle='rgba(112,140,150,.92)';ctx.strokeStyle='#4d6168';ctx.lineWidth=1.2;rr(ctx,x-w/2,y-16,w,16,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-w/2+8,y-8);ctx.lineTo(x+w/2-8,y-8);ctx.stroke();ctx.restore();}
  function lampScene(ctx,k){const lx=LX,by=LBY,wick=WICK;
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,by,1000,8);
    // 桌上的火
    if(L.fire>0||(A&&A.k==='lamp2'&&k>.55)){const f=L.fire>0?1:seg(k,.55,1);ctx.fillStyle='rgba(150,200,235,.35)';ctx.beginPath();ctx.ellipse(620,by+2,150*f,8,0,0,TAU);ctx.fill();for(let i=0;i<9;i++){const x=500+i*30;flame(ctx,x,by+2,(.35+.25*Math.sin(i*1.7))*f,t+i);}}
    if(A&&A.k==='cloth'){const c=seg(k,0,.6);ctx.save();ctx.translate(lerp(CLOTH[0],620,c),lerp(by-8,by-8,c)-Math.sin(c*Math.PI)*160);ctx.fillStyle='rgba(112,140,150,.92)';ctx.beginPath();ctx.moveTo(-170*c-60*(1-c),0);for(let x=-170;x<=170;x+=20)ctx.lineTo(x*(.35+.65*c),Math.sin(x*.07)*5);ctx.lineTo((170*c+60*(1-c)),14);ctx.lineTo(-(170*c+60*(1-c)),14);ctx.closePath();ctx.fill();ctx.restore();
      if(c<1)for(let i=0;i<9;i++)flame(ctx,500+i*30,by+2,.4*(1-c),t+i);}
    else if(L.cloth){ctx.fillStyle='rgba(112,140,150,.92)';ctx.fillRect(450,by-8,340,10);hand(ctx,'湿抹布',620,by-26,{size:15,col:DIM});}
    else{clothAt(ctx,CLOTH[0],by);hand(ctx,'湿抹布',CLOTH[0],by+24,{size:15,col:DIM});}
    // 主灯
    const capOn=A&&A.k==='match'?k<.25:A&&A.k==='cap'?k>.6:L.cap;
    lamp(ctx,lx,by,LS,false,t,capOn);
    if(L.inner>0||(A&&A.k==='blow'&&k>.45)||(A&&A.k==='cap'&&L.inner&&k<.6)){ctx.save();ctx.globalCompositeOperation='multiply';const g=ctx.createRadialGradient(lx,by-44,4,lx,by-44,78);g.addColorStop(0,'rgba(255,140,40,.95)');g.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,by-44,78,0,TAU);ctx.fill();ctx.restore();
      flame(ctx,lx-12,by-18,.4,t*1.3);flame(ctx,lx+16,by-16,.34,t*1.1+2);hand(ctx,'灯内起火！',lx,by-200,{size:22,col:BADC});}
    const litNow=(L.lit&&!(A&&(A.k==='blow'&&k>.4||A.k==='cap'&&k>.62)))||(A&&A.k==='match'&&k>.62)||(A&&A.k==='lamp2'&&k>.5);
    if(litNow)flame(ctx,wick[0],wick[1],LS*(A&&A.k==='blow'?1-seg(k,0,.4)*.7:1),t);
    if(!capOn&&!(A&&A.k==='cap'))capShape(ctx,CAPP[0],CAPP[1]);
    if(A&&A.k==='cap'){const c=seg(k,0,.6);capShape(ctx,lerp(CAPP[0],lx,c),lerp(by,by-90*LS,c)-Math.sin(c*Math.PI)*80);}
    // 火柴
    matchbox(ctx,MATCHP[0],MATCHP[1]);
    if(A&&A.k==='match'){const c=seg(k,.2,.6);AP.match(ctx,lerp(MATCHP[0]+20,wick[0]+10,c),lerp(MATCHP[1]-40,wick[1]-8,c),1.3,Math.PI*.9,k>.12,t);}
    // 另一盏燃着的灯
    if(A&&A.k==='lamp2'){const c=seg(k,0,.4),tl=seg(k,.35,.55);ctx.save();ctx.translate(lerp(LAMP2[0],580,c),by-lerp(0,90,tl));ctx.rotate(-tl*1.1);lamp(ctx,0,0,.85,true,t);ctx.restore();
      if(k>.45){for(let i=0;i<6;i++){const p=((t*1.6+i/6)%1);drop(ctx,lerp(530,570+i*12,p),lerp(by-130,by,p),3.6,'rgba(150,200,235,.9)');}}}
    else if(!L.fire){lamp(ctx,LAMP2[0],by,.7,true,t);hand(ctx,'另一盏燃着的灯',LAMP2[0],by+24,{size:15,col:DIM});}
    // 吹气
    if(A&&A.k==='blow'&&k<.6){ctx.strokeStyle=CC;ctx.lineWidth=2.4;for(let i=0;i<4;i++){const p=(t*2+i/4)%1;ctx.globalAlpha=1-p;ctx.beginPath();ctx.moveTo(700-p*200,wick[1]-40+i*12);ctx.quadraticCurveTo(680-p*200,wick[1]-50+i*12,660-p*200,wick[1]-40+i*12);ctx.stroke();}ctx.globalAlpha=1;hand(ctx,'呼——',740,wick[1]-30,{size:22,col:CC});}
    if(!A&&!msg)hand(ctx,'点按钮，或直接把火柴、灯帽、另一盏灯、湿抹布拖过来；点火焰是“用嘴吹”',500,60,{size:17,col:DIM});}
  /* 给液体加热：试管 45°，试管夹夹在距管口约 1/3 处 */
  function heatScene(ctx,k){const lx=470,by=540,wick=[lx,by-107],r=18,Lt=230,s2=Math.SQRT1_2;
    const run=A&&A.k==='heat',pre=!H.noPre&&run&&k<.25,osc=pre?Math.sin((t-A.t0)*9)*26:0;
    const bot=H.wick?[lx+4,wick[1]-12]:[lx,wick[1]-50],u=H.face?[-s2,s2]:[s2,s2],a=H.face?Math.PI/4:-Math.PI/4;
    const B0=[bot[0]+u[0]*osc*.0+osc*(H.face?1:-1)*.5,bot[1]];const mouth=[B0[0]-u[0]*Lt,B0[1]-u[1]*Lt];
    const crackAt=H.noPre?.3:H.wick?.42:9,cracked=run?k>crackAt:(H.res&&(H.noPre||H.wick));const boil=run&&!cracked?seg(k,.4,.7):H.res&&!cracked?1:0;
    ctx.fillStyle='#e9e1d0';ctx.fillRect(0,by,1000,8);
    // 同学
    ctx.save();ctx.translate(935,by);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.arc(0,-210,26,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-48,-120);ctx.quadraticCurveTo(-46,-176,0,-180);ctx.quadraticCurveTo(46,-176,48,-120);ctx.lineTo(48,0);ctx.lineTo(-48,0);ctx.closePath();ctx.fill();ctx.stroke();
    hand(ctx,'同学',0,-150,{size:16,col:DIM});ctx.restore();
    lamp(ctx,lx,by,1,true,t);
    // 试管与液体
    const fr=H.full?.62:.28,low=B0[1]+r;testTube(ctx,mouth[0],mouth[1],Lt,2*r,a);
    ctx.save();tubeClip(ctx,mouth[0],mouth[1],Lt,2*r,a);const surf=low-fr*Lt*s2*.92;ctx.fillStyle=SOL;ctx.fillRect(0,surf+(boil?Math.sin(t*30)*2:0),1000,300);
    if(boil){ctx.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<14;i++){const p=(t*1.4+i/14)%1;ctx.beginPath();ctx.arc(B0[0]-u[0]*(10+((i*37)%30))+((i*13)%9-4),lerp(low-6,surf,p),2+p*2,0,TAU);ctx.fill();}}ctx.restore();
    testTube(ctx,mouth[0],mouth[1],Lt,2*r,a,{col:'rgba(0,0,0,0)'});
    if(cracked){ctx.strokeStyle=INK;ctx.lineWidth=1.6;[[-1,22],[0,26],[1,20],[2,16]].forEach(([g,l])=>{ctx.beginPath();ctx.moveTo(B0[0],B0[1]);ctx.lineTo(B0[0]+Math.cos(g)*l*.5,B0[1]-Math.sin(g)*l*.5-6);ctx.lineTo(B0[0]+Math.cos(g+.4)*l,B0[1]-Math.sin(g+.4)*l-4);ctx.stroke();});
      for(let i=0;i<3;i++){const p=(t*1.5+i/3)%1;drop(ctx,B0[0]+i*4-4,B0[1]+10+p*60,3,SOL);}}
    // 试管夹（从底部套上，夹在距管口约 1/3 处），手握长柄
    const cp=[mouth[0]+u[0]*Lt/3,mouth[1]+u[1]*Lt/3];const hA=H.face?Math.PI*.25:Math.PI*.75,he=[cp[0]+Math.cos(hA)*270,cp[1]+Math.sin(hA)*270];
    AP.holder(ctx,cp[0],cp[1],20,hA,r);
    // 喷出
    const spray=H.full&&!cracked&&(run?k>.62:H.res);if(spray){for(let i=0;i<16;i++){const p=((t*1.2+i/16)%1);const vx=-u[0]*(220+i*8),vy=-u[1]*260;const x=mouth[0]+vx*p,y=mouth[1]+vy*p+300*p*p;drop(ctx,x,y,3.4,SOL);}
      if(H.face){hand(ctx,'烫伤！',935,300,{size:24,col:BADC});}}
    if(pre)hand(ctx,'预热：来回移动试管',lx,140,{size:18,col:CC});
    caption(ctx,'外焰',lx+120,wick[1]-60,lx+12,wick[1]-58,{col:CA,size:15});caption(ctx,'焰心',lx-120,wick[1]-8,lx-4,wick[1]-8,{col:CA,size:15});
    caption(ctx,'试管夹夹在距管口约 1/3 处',H.face?640:170,H.face?130:150,cp[0],cp[1],{col:INK,size:15});
    if(!run&&!H.res)hand(ctx,'按亮的按钮是“错误做法”，可以组合；再点“开始加热”',500,40,{size:17,col:DIM});}
  function heatResult(){return[[!H.full,H.full?'液体超过试管容积的 1/3：沸腾时喷出':'液体不超过试管容积的 1/3'],[!H.noPre,H.noPre?'没有预热：试管受热不均匀而炸裂':'先预热，再集中加热'],
      [!H.wick,H.wick?'试管底接触灯芯：受热不均匀而炸裂':'用外焰加热'],[!H.face,H.face?'管口对着人：喷出的液体烫伤同学':'管口不对着自己和他人']];}
  function draw(){const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G=scene(w,h,1000,600,70);const k=A?Math.min(1,(t-A.t0)/A.dur):0;
    ctx.save();ctx.translate(G.ox,G.oy);ctx.scale(G.k,G.k);(mode===0?lampScene:heatScene)(ctx,k);ctx.restore();
    if(A&&k>=1){if(A.k==='heat'){A=null;H.res=heatResult();const ok=H.res.every(r=>r[0]);sfx(ok?'ok':'bad');if(ok)stampOn(cv.parentNode.parentNode,'规范',true,'50%','28%');else if(H.noPre||H.wick){sfx('boom');shake();}}else finish(A.k);}
    if(A&&A.k==='heat'&&!A.cr&&(H.noPre&&k>.3||H.wick&&k>.42)){A.cr=1;sfx('boom');shake();}
    if(mode===0)dragHints(ctx,ui,G,{m:[WICK[0],WICK[1],46,'点燃灯芯'],l2:[WICK[0],WICK[1],46,'引燃？'],cap:[LX,LBY-100*LS,50,'盖上灯帽'],cl:[620,LBY-10,90,'盖住火焰']},t);
    const rows=mode===0?msg:H.res;if(rows)resultCard(ctx,w-370,20,350,mode===0?'后果':'加热结果',rows);}
  const ui=canvasUI(cv,{tools:()=>{if(!G||A||mode!==0)return[];const T=[],tl=(id,sx,sy,r,fn)=>{const[x,y]=G.toC(sx,sy);T.push({id,x,y,r:r*G.k,draw:(ctx,x,y,gh)=>{if(!gh)return;ctx.save();ctx.translate(x,y);ctx.scale(G.k,G.k);fn(ctx);ctx.restore();}});};
      if(!L.lit&&!L.fire)tl('m',MATCHP[0],MATCHP[1]-20,50,ctx=>AP.match(ctx,-30,0,1.3,0,true,t));
      if(!L.lit&&!L.fire)tl('l2',LAMP2[0],LAMP2[1]-60,60,ctx=>lamp(ctx,0,60,.7,true,t));
      if((L.lit||L.inner)&&!L.cap)tl('cap',CAPP[0],CAPP[1]-26,40,ctx=>capShape(ctx,0,26));
      if(L.fire)tl('cl',CLOTH[0],CLOTH[1]-10,60,ctx=>clothAt(ctx,0,10));return T;},
    hots:()=>!G||A||mode!==0||!L.lit?[]:[{hit:(x,y)=>{const[sx,sy]=G.toS(x,y);return Math.abs(sx-WICK[0])<30&&sy>WICK[1]-100&&sy<WICK[1]+4;},act:()=>act(2)}],
    onTap:id=>act({m:0,l2:1,cap:3,cl:4}[id]),
    onDrop:(id,x,y)=>{const[sx,sy]=G.toS(x,y);if(id==='cl'){if(Math.abs(sx-620)<200&&sy>380){act(4);return true;}return false;}
      if(Math.hypot(sx-WICK[0],sy-WICK[1])<140){act({m:0,l2:1,cap:3}[id]);return true;}return false;}});
  const q=qPanel($('#lpQ'),QB.lamp,{src:'加热小测'});
  $('#lpReset').onclick=()=>{Object.assign(L,{cap:true,lit:false,fire:0,inner:0,cloth:0});Object.assign(H,{full:false,noPre:false,face:false,wick:false,res:null});mode=0;msg=null;A=null;stampOff(cv.parentNode.parentNode);buildBar();q.reset();};
  buildBar();
  notes('lamp','酒精灯与给液体加热',['酒精不超过酒精灯容积的 <mark>2/3</mark>；禁止向燃着的酒精灯里添加酒精，禁止用燃着的酒精灯引燃另一只。','用<mark>火柴</mark>点燃，用<mark>灯帽盖灭</mark>，不可用嘴吹灭。','用<mark>外焰</mark>加热；试管夹从试管<mark>底部往上套</mark>，夹在距管口约 1/3 处。','液体不超过试管容积的 <mark>1/3</mark>，试管与桌面约成 45°，先预热，管口不对着人。'],
    '加热后的试管不能立即用冷水冲洗，以免炸裂。',
    (ctx,w,h)=>{const s=Math.min(w/300,h/330);lamp(ctx,w*.32,h*.96,.95*s,true,.3);const fy=h*.96-107*.95*s;
      [['外焰',-60,PEN.red],['内焰',-34,PEN.gold],['焰心',-10,PEN.blue]].forEach(([n,dy,col],i)=>{const y=fy+dy*.95*s;ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(w*.32+6,y);ctx.lineTo(w*.62,y-i*4);ctx.stroke();hand(ctx,n,w*.7,y-i*4,{size:16,col});});
      hand(ctx,'外焰温度最高',w*.58,h*.12,{size:17,col:PEN.red});});
  return{tick(dt){t+=dt;draw();}};})();
