/* ================= 过滤五步：共用的分步动画 ================= */
const FSTEP=[
  {t:'折滤纸',d:'圆形滤纸<b>对折</b>，再<b>对折</b>，打开成圆锥形：<b>一边一层，一边三层</b>。',
   k:[['要点','折好的滤纸一侧 3 层、一侧 1 层'],['注意','滤纸边缘要比漏斗口略低']],lab:'把圆形滤纸对折、再对折，打开成圆锥形（一边三层）。'},
  {t:'放入漏斗，润湿',d:'把滤纸放进漏斗，用少量水<b>润湿</b>，用<b>玻璃棒</b>轻压，使滤纸<b>紧贴漏斗内壁</b>，中间不留气泡。',
   k:[['一贴','滤纸紧贴漏斗内壁'],['二低①','滤纸边缘低于漏斗边缘'],['注意','留有气泡会使过滤变慢']],lab:'放入漏斗，用少量水润湿，轻压使滤纸紧贴漏斗内壁，不留气泡。'},
  {t:'组装装置',d:'漏斗放在铁圈上，下方放烧杯，使漏斗<b>下端管口紧靠烧杯内壁</b>。',
   k:[['三靠③','漏斗下端紧靠烧杯内壁'],['作用','滤液沿内壁流下，防止溅出']],lab:'漏斗放上铁圈，下端管口紧靠烧杯内壁。'},
  {t:'沿玻璃棒倾倒',d:'烧杯口<b>紧靠玻璃棒</b>，玻璃棒下端<b>轻靠三层滤纸</b>处，液体缓缓流入；<b>液面低于滤纸边缘</b>。',
   k:[['三靠①','烧杯口紧靠玻璃棒'],['三靠②','玻璃棒下端轻靠三层滤纸处'],['二低②','液面始终低于滤纸边缘'],['注意','靠在三层处，防止戳破滤纸']],lab:'烧杯口靠玻璃棒，玻璃棒靠三层滤纸，慢慢倒入，液面低于滤纸边缘。'},
  {t:'观察滤液',d:'滤纸上留下泥沙，滤液变澄清。若滤液<b>仍浑浊</b>，查明原因后<b>再过滤一次</b>。',
   k:[['现象','滤纸上有泥沙，滤液澄清'],['注意','滤液浑浊 → 再过滤'],['结论','过滤除去的是不溶性杂质']],lab:'观察滤纸上的残留物和滤液；如果滤液仍浑浊，再过滤一次。'}];
function drawFStep(ctx,ox,oy,k,i,p,t,{labels=true}={}){
  ctx.save();ctx.translate(ox,oy);ctx.scale(k,k);
  if(i===0){const cx=300,cy=290,R=185;
    const paper=(f)=>{ctx.fillStyle=f?'#fdfcf6':'#ece7da';ctx.strokeStyle='#b0a68e';ctx.lineWidth=2;ctx.shadowColor='rgba(60,40,10,.16)';ctx.shadowBlur=10;ctx.shadowOffsetY=4;};
    ctx.save();
    if(p<.33){const a=ease(p/.33),sy=1-2*a;
      paper(1);ctx.beginPath();ctx.arc(cx,cy,R,Math.PI,TAU);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.save();ctx.translate(cx,cy);ctx.scale(1,sy||.001);paper(sy>0);ctx.beginPath();ctx.arc(0,0,R,0,Math.PI);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      if(labels)hand(ctx,'① 对折',cx,cy+R+50,{size:34,col:CIN});}
    else if(p<.66){const b=ease((p-.33)/.33),sx=1-2*b;
      paper(1);ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,Math.PI,Math.PI*1.5);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.save();ctx.translate(cx,cy);ctx.scale(sx||.001,1);paper(sx>0);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,Math.PI*1.5,TAU);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      ctx.strokeStyle='rgba(150,140,120,.5)';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);
      if(labels)hand(ctx,'② 再对折',cx,cy+90,{size:34,col:CIN});}
    else{const c=ease(clamp((p-.66)/.24,0,1));
      ctx.globalAlpha=1-c;paper(1);ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,Math.PI,Math.PI*1.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=c;
      const top=170,ap=500,rw=150;ctx.shadowColor='transparent';ctx.beginPath();ctx.ellipse(cx,top,rw,rw*.22,0,0,TAU);ctx.fillStyle='#e9e4d6';ctx.fill();ctx.strokeStyle='#b0a68e';ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx-rw,top);ctx.lineTo(cx,ap);ctx.lineTo(cx+rw,top);ctx.ellipse(cx,top,rw,rw*.22,0,0,Math.PI,false);ctx.closePath();ctx.fillStyle='#fdfcf6';ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx+rw*.04,top+rw*.22);ctx.lineTo(cx,ap);ctx.lineTo(cx+rw,top);ctx.ellipse(cx,top,rw,rw*.22,0,0,Math.PI/2-.04,false);ctx.closePath();const tg=ctx.createLinearGradient(cx,0,cx+rw,0);tg.addColorStop(0,'#d6cbb0');tg.addColorStop(1,'#e6dec8');ctx.fillStyle=tg;ctx.fill();
      ctx.strokeStyle='#8f8266';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(cx+rw*.04,top+rw*.22);ctx.lineTo(cx,ap);ctx.stroke();ctx.strokeStyle='rgba(143,130,102,.5)';ctx.lineWidth=1;[[.4,.2],[.7,.155]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(cx+rw*a,top+rw*b);ctx.lineTo(cx+1,ap-3);ctx.stroke();});
      if(labels){callout(ctx,cx-rw*.45,top+110,cx-210,top+80,'一边一层',{col:NAVY,size:20});callout(ctx,cx+rw*.5,top+100,cx+220,top+70,'一边三层',{col:CIN,size:20});hand(ctx,'③ 打开成圆锥形',cx,ap+50,{size:34,col:CIN});}
      ctx.globalAlpha=1;}
    ctx.restore();
  }
  else if(i===1){const F=funnelGeo(300,200,96,130,170,8);const drop0=clamp(p/.25,0,1),wet=clamp((p-.3)/.2,0,1),press=clamp((p-.6)/.3,0,1);
    funnelBack(ctx,F);const top=F.ry+18-(1-ease(drop0))*120;
    ctx.save();ctx.globalAlpha=.4+.6*drop0;paperCone(ctx,{...F,ry:F.ry-(1-ease(drop0))*120,cy:F.cy-(1-ease(drop0))*120},top,{wet,bubbles:drop0>=1?(1-press):0});ctx.restore();
    funnelBody(ctx,F);
    if(p>.28&&p<.55){const ph=(t*1.8)%1;// 洗瓶滴水
      ctx.save();ctx.translate(420,40);ctx.rotate(-.5);rr(ctx,-30,-20,60,90,14);ctx.fillStyle='rgba(225,238,246,.6)';ctx.fill();ctx.strokeStyle=GL_S;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='rgba(150,200,225,.5)';ctx.fillRect(-28,20,56,46);ctx.strokeStyle='#5a6270';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(0,-40);ctx.lineTo(-30,-60);ctx.stroke();ctx.restore();
      drop(ctx,370+ph*-40,40+ph*120,6,waterCol(0,{a:1.6}));}
    if(press>0&&press<1){// 玻璃棒从漏斗口内侧伸入，棒尖压在滤纸内表面（不能插进滤纸与漏斗壁之间）
      const sd=press<.5?1:-1,ph=(press%.5)/.5,pTop=F.ry+18,pBot=F.cy-12,pk=(F.cy-pTop)/(F.cy-F.ry),prw=F.R*pk*.985,yy=lerp(pTop+22,pBot-28,(Math.sin(ph*Math.PI*2-Math.PI/2)+1)/2),wx=F.cx+sd*(prw*(pBot-yy)/(pBot-pTop)-7);rod(ctx,F.cx-sd*70,yy-250,wx,yy,8);}
    if(labels){if(drop0>=1&&press<1)callout(ctx,F.cx+F.R*.5,F.ry+60,F.cx+190,F.ry+30,'有气泡 → 过滤慢',{col:CIN,size:18});if(press>0)callout(ctx,F.cx-F.R*.4,F.ry+90,F.cx-220,F.ry+130,'用玻璃棒轻压，赶走气泡',{col:NAVY,size:18});
      if(press>=1)callout(ctx,F.cx-F.R*.55,F.ry+60,F.cx-210,F.ry+30,'紧贴漏斗内壁',{col:MOSS,size:18});}
  }
  else if(i===2){const a=ease(clamp(p/.35,0,1)),b=ease(clamp((p-.35)/.4,0,1));ctx.globalAlpha=1;
    filterRig(ctx,0,0,1,{balpha:b,lv:0,fil:0,t});
    if(labels&&b>=1){ctx.save();ctx.strokeStyle=MOSS;ctx.lineWidth=3;ctx.beginPath();ctx.arc(308,446,22,0,TAU);ctx.stroke();ctx.restore();callout(ctx,329,450,450,420,'下端紧靠烧杯内壁',{col:MOSS,size:18});}
  }
  else if(i===3){filterRig(ctx,0,0,1,{rod:true,pour:true,flow:1,lv:.55,fil:clamp(p,0,1)*.6,t,pourLv:.55-.25*p,labels:labels?(p<.45?['三靠']:['三靠','二低']):null});}
  else{const r=filterRig(ctx,0,0,1,{rod:false,lv:0,fil:.7,mud:1,t});
    beaker(ctx,520,560,96,130,{lv:.6,col:waterCol(.85),ticks:3});
    if(labels){callout(ctx,300,262,450,230,'滤纸上留有泥沙',{col:MUD,size:18});callout(ctx,262,515,400,380,'滤液澄清',{col:NAVY,size:18});hand(ctx,'原泥沙水',520,590,{size:22,col:'#4a4f5c'});}}
  ctx.restore();}

/* ================= 5 过滤：步骤拆解 ================= */
S.steps=(()=>{const cv=$('#cvSteps');let cur=0,p=0,t=0;const seen=new Set([0]);
  $('#stTabs').innerHTML=FSTEP.map((s,i)=>`<button data-i="${i}"><em>${i+1}</em>${s.t}</button>`).join('');
  $$('#stTabs button').forEach(b=>b.onclick=()=>show(+b.dataset.i));
  function show(i){cur=clamp(i,0,4);p=0;seen.add(cur);sfx('whoosh');const s=FSTEP[cur];$('#stT').textContent=`第 ${cur+1} 步　${s.t}`;$('#stD').innerHTML=s.d;
    $('#stKeys').innerHTML=s.k.map(([a,b])=>`<li class="${a==='注意'?'warn':''}"><i>${a}</i><span>${b}</span></li>`).join('');
    $$('#stTabs button').forEach((b,k)=>{b.classList.toggle('on',k===cur);b.classList.toggle('done',seen.has(k)&&k!==cur);});
    $('#stPrev').disabled=cur===0;$('#stNext').textContent=cur===4?'去动手实验 →':'下一步';}
  $('#stPrev').onclick=()=>show(cur-1);$('#stNext').onclick=()=>{if(cur===4){$('#btnNext').click();return;}show(cur+1);};$('#stReplay').onclick=()=>{p=0;sfx('click');};$('#stReset').onclick=()=>{seen.clear();seen.add(0);show(0);};
  show(0);
  function tick(dt){t+=dt;p=Math.min(1,p+dt/(cur===0?4.5:cur===3?6:3.5));const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);
    const k=Math.min((h-66)/600,w/800),ox=cur<2?w-650*k:w-760*k,oy=2;drawFStep(ctx,ox,oy,k,cur,p,t);}
  return{tick,enter(){p=0;}};})();

/* ================= 6 学生动手演示 ================= */
S.lab=(()=>{const cv=$('#cvLab');let total=240,left=240,run=false,cur=0,p=0,t=0,lastSec=-1;
  const CHK=[['一贴','滤纸紧贴漏斗内壁，无气泡'],['二低','滤纸边缘低于漏斗边缘'],['二低','液面低于滤纸边缘'],['三靠','烧杯口紧靠玻璃棒'],['三靠','玻璃棒下端轻靠三层滤纸处'],['三靠','漏斗下端紧靠烧杯内壁']];
  const mark=CHK.map(()=>0);const box=$('#labChk');
  function renderChk(){box.innerHTML=CHK.map((c,i)=>`<button class="${mark[i]===1?'ok':mark[i]===2?'ng':''}" data-i="${i}"><i>${c[0]}</i><span>${c[1]}</span><em>${mark[i]===1?'✓':mark[i]===2?'✗':''}</em></button>`).join('');
    $$('button',box).forEach(b=>b.onclick=()=>{const i=+b.dataset.i;mark[i]=(mark[i]+1)%3;sfx(mark[i]===1?'ok':mark[i]===2?'bad':'click');renderChk();});}
  renderChk();
  let paid=false;
  $('#labRes').onclick=()=>{const ok=mark.filter(v=>v===1).length,ng=mark.filter(v=>v===2).length,un=6-ok-ng;const st=$('#labSt');
    if(un){setSt(st,'warn',`还有 ${un} 项没有判定，请质检员看完再判`);return;}
    if(!ng){if(!paid){teamAdd(5);paid=true;}sfx('win');FX.confetti();setSt(st,'ok',`<b>6 项全部达标！</b>演示同学所在队（${tname(TEAM.cur)}）+5。<br>现象：滤纸上留有泥沙，滤液比原泥沙水澄清。`);stampOn($('[data-id="lab"] .lab'),'操作规范',true,'70%','30%');}
    else{sfx('bad');setSt(st,'bad',`<b>${ng} 项未达标：</b>${mark.map((v,i)=>v===2?CHK[i][1]:null).filter(Boolean).join('；')}。请台下同学说一说怎样改正。`);}};
  $$('[data-lt]').forEach(b=>b.onclick=()=>{total=left=+b.dataset.lt;run=false;$$('[data-lt]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();sfx('click');});
  $('#labGo').onclick=()=>{if(left<=0)left=total;run=true;sfx('click');};$('#labPause').onclick=()=>{run=false;sfx('click');};$('#labReset').onclick=()=>{run=false;left=total;draw();stampOff($('[data-id="lab"] .lab'));};
  function draw(){const s=Math.ceil(left);$('#labClock').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;$('#labClock').classList.toggle('low',left<=30);$('#labArc').setAttribute('stroke-dashoffset',String(276.5*(1-left/total)));}
  function show(i){cur=clamp(i,0,4);p=0;const s=FSTEP[cur];$('#labN').textContent=`第 ${cur+1} 步 / 共 5 步`;$('#labT').textContent=s.t;$('#labD').innerHTML=s.lab;$('#labPrev').disabled=cur===0;$('#labNext').disabled=cur===4;sfx('whoosh');}
  $('#labPrev').onclick=()=>show(cur-1);$('#labNext').onclick=()=>show(cur+1);show(0);draw();
  function tick(dt){t+=dt;p=Math.min(1,p+dt/(cur===0?4.5:4));if(run){left=Math.max(0,left-dt);const s=Math.ceil(left);if(s!==lastSec){lastSec=s;if(s<=10&&s>0)sfx('tick');}if(left<=0){run=false;sfx('win');stampOn($('[data-id="lab"] .lab'),'时间到',false,'30%','30%');}draw();}
    const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const k=Math.min(w,h)/640;drawFStep(ctx,(w-600*k)/2,(h-600*k)/2,k,cur,p,t,{labels:false});}
  return{tick};})();

/* ================= 7 找茬 + 故障诊断 ================= */
S.spot=(()=>{const cv=$('#cvSpot'),wrap=$('#spWrap');let sc=0,t=0,marks=[[],[]],judged=[false,false],geo=null;
  /* 每处错误：[名称, 标注位置, 判定区域（基准坐标）] —— 区域覆盖整片出错的地方，不只一个点 */
  const inBox=(x,y,x0,x1,y0,y1)=>x>=x0&&x<=x1&&y>=y0&&y<=y1;
  const nearSeg=(x,y,[ax,ay],[bx,by],r)=>{const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy,u=clamp(((x-ax)*dx+(y-ay)*dy)/L2,0,1);return Math.hypot(x-ax-u*dx,y-ay-u*dy)<r;};
  const SC=[{o:{rod:false,pour:true,flow:1,lv:.5,fil:.3,tipAway:true},err:[
      ['没有用玻璃棒引流',g=>[g.F.cx+40,g.F.ry-40],(g,x,y)=>inBox(x,y,g.F.cx-20,g.F.cx+g.F.R+90,g.F.ry-140,g.F.ry+24)],
      ['漏斗下端没有紧靠烧杯内壁',g=>g.tip,(g,x,y)=>inBox(x,y,g.F.cx-60,g.F.cx+60,g.F.sy-60,g.F.sy+50)]]},
    {o:{rod:true,rodSingle:true,pour:true,flow:1,liquidHigh:true,lv:1,fil:.6,filTurb:.75},err:[
      ['液面高于滤纸边缘',g=>[g.F.cx-g.F.R*.82,g.ptop+2],(g,x,y)=>inBox(x,y,g.F.cx-g.F.R-16,g.F.cx+g.F.R+16,g.F.ry-18,g.ptop+26)],
      ['玻璃棒靠在一层滤纸一侧',g=>g.rodTip,(g,x,y)=>Math.hypot(x-g.rodTip[0],y-g.rodTip[1])<55||nearSeg(x,y,g.rodTip,[lerp(g.rodTip[0],g.rodTop[0],.3),lerp(g.rodTip[1],g.rodTop[1],.3)],26)]]}];
  const hitE=(e,mx,my)=>e[2](geo,...geo.inv(mx,my));
  const st=$('#spSt');
  function rings(){$$('.ring2',wrap).forEach(e=>e.remove());if(!geo)return;
    if(judged[sc]){SC[sc].err.forEach(e=>{const m=marks[sc].find(([mx,my])=>hitE(e,mx,my));const[x,y]=m||geo.map(...e[1](geo));addRing(x,y,m?'right':'miss',(m?'✓ ':'漏找：')+e[0]);});
      marks[sc].forEach(([mx,my])=>{if(!SC[sc].err.some(e=>hitE(e,mx,my)))addRing(mx,my,'wrong','这里没错');});}
    else marks[sc].forEach(([x,y])=>addRing(x,y,'',''));}
  function addRing(x,y,cls,lab){const d=document.createElement('div');d.className='ring2 '+cls;d.style.left=x+'px';d.style.top=y+'px';if(lab)d.innerHTML=`<b>${lab}</b>`;wrap.appendChild(d);}
  cv.onclick=e=>{if(judged[sc])return;const[x,y]=ptIn(cv,e);const m=marks[sc];const j=m.findIndex(([a,b])=>Math.hypot(a-x,b-y)<34);if(j>=0)m.splice(j,1);else{if(m.length>=4){setSt(st,'warn','最多标记 4 处，点已有的圈可以撤销');return;}m.push([x,y]);}sfx('pop');rings();setSt(st,'',`已标记 ${m.length} 处`);};
  $$('[data-sc]').forEach(b=>b.onclick=()=>{sc=+b.dataset.sc;$$('[data-sc]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');geo=null;requestAnimationFrame(()=>{rings();});setSt(st,'',judged[sc]?'本装置已判定，可点“重做”':`已标记 ${marks[sc].length} 处`);});
  $('#spSub').onclick=()=>{if(judged[sc]||!geo)return;if(!marks[sc].length){setSt(st,'warn','请先在图上点出错误位置');return;}judged[sc]=true;const tm=TEAM.cur;
    const found=SC[sc].err.filter(e=>marks[sc].some(([mx,my])=>hitE(e,mx,my))).length;
    const extra=marks[sc].filter(([mx,my])=>!SC[sc].err.some(e=>hitE(e,mx,my))).length;
    rings();if(found===2&&!extra){teamAdd(5,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}全部找对 +5</b>　${SC[sc].err.map(e=>e[0]).join('；')}`);}
    else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}不加分</b>　找对 ${found} 处${extra?`，多标 ${extra} 处`:''}。正确：${SC[sc].err.map(e=>e[0]).join('；')}`);}teamNext();};
  $('#spRedo').onclick=()=>{marks[sc]=[];judged[sc]=false;rings();setSt(st,'','已标记 0 处');};
  // 故障诊断
  const CASE=[{h:'滤液仍然浑浊',ic:'alert-circle-outline',o:[['滤纸破损',1],['液面高于滤纸边缘',1],['承接滤液的烧杯不干净',1],['滤纸没有紧贴漏斗内壁',0],['漏斗下端没有靠烧杯内壁',0]],fix:'查明原因，更换滤纸或洗净仪器后<b>再过滤一次</b>。'},
              {h:'过滤速度太慢',ic:'timer-outline',o:[['滤纸与漏斗壁之间有气泡',1],['泥沙太多，堵住滤纸孔隙',1],['液面低于滤纸边缘',0],['玻璃棒靠在三层滤纸处',0]],fix:'重新使滤纸紧贴漏斗内壁；泥沙多时<b>先静置沉淀，再过滤</b>。'}];
  const diag=$('#spDiag');
  function renderDiag(){diag.innerHTML=CASE.map((c,ci)=>`<div class="case" data-c="${ci}"><h4>${icon(c.ic)}${c.h}</h4><p class="hint">可能的原因有哪些？（多选）</p><div class="cs">${c.o.map((o,i)=>`<button class="mixc" data-i="${i}" aria-pressed="false">${o[0]}</button>`).join('')}</div>
    <div class="row"><button class="btn pri sm" data-chk="${ci}">检查</button><button class="btn sm" data-rd="${ci}">重做</button></div><div class="status">全对 +5 分</div></div>`).join('');
    $$('.case',diag).forEach(el=>{const ci=+el.dataset.c,c=CASE[ci];let done=false;
      $$('.mixc',el).forEach(b=>b.onclick=()=>{if(done)return;b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));sfx('click');});
      $(`[data-chk="${ci}"]`,el).onclick=()=>{if(done)return;const picks=$$('.mixc',el).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>+b.dataset.i);const s=$('.status',el);if(!picks.length){setSt(s,'warn','请至少选一项');return;}done=true;const tm=TEAM.cur;let bad=0;
        $$('.mixc',el).forEach(b=>{const i=+b.dataset.i,a=c.o[i][1]===1,p2=picks.includes(i);if(a&&p2)b.classList.add('right');else if(a){b.classList.add('miss');bad++;}else if(p2){b.classList.add('wrong');bad++;}});
        if(!bad){teamAdd(5,tm);sfx('ok');setSt(s,'ok',`<b>${tname(tm)}全对 +5</b>　处理：${c.fix}`);}else{sfx('bad');setSt(s,'bad',`<b>${tname(tm)}不加分</b>（黄框漏选，红框多选）　处理：${c.fix}`);}teamNext();};
      $(`[data-rd="${ci}"]`,el).onclick=()=>renderDiag();});}
  renderDiag();
  function tab(n){$('#spTab1').setAttribute('aria-pressed',String(n===1));$('#spTab2').setAttribute('aria-pressed',String(n===2));wrap.hidden=n!==1;$('#spBar').hidden=n!==1;$('#spBtns').hidden=n!==1;diag.hidden=n!==2;
    $('#spH').textContent=n===1?'操作找茬：哪里错了？':'故障诊断：出了问题怎么办？';$('#spTitle').textContent=n===1?'在图中点出错误':'先诊断，再处理';
    $('#spTip').textContent=n===1?'每套装置藏着 2 处错误，点出位置后提交；全部找对 +5 分。':'左侧两个“病例”，各选出可能原因后点检查，每个全对 +5 分。';st.hidden=n!==1;sfx('click');}
  $('#spTab1').onclick=()=>tab(1);$('#spTab2').onclick=()=>tab(2);
  function tick(dt){t+=dt;if(wrap.hidden)return;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const k=Math.min((h-70)/600,w/640),ox=(w-600*k)/2,oy=10;
    const first=!geo;geo=filterRig(ctx,ox,oy,k,Object.assign({t},SC[sc].o));if(first)rings();
    hand(ctx,sc?'装置乙':'装置甲',40,40,{size:32,align:'left',col:CIN});}
  return{tick,enter(){geo=null;}};})();
