/* ================= 6 由化学式求化合价：化合价天平 ================= */
S.calc=(()=>{const cv=$('#cvCalc');let t=0,qi=0,x=null,pick=null,free=false,phase='ask',revT=0,ang=0;
  // [化学式, 未知元素, 各部分 [符号, 个数, 化合价（未知为 null）], 答案]
  const Q=[['KMnO4','Mn',[['K',1,1],['Mn',1,null],['O',4,-2]],7],['K2MnO4','Mn',[['K',2,1],['Mn',1,null],['O',4,-2]],6],['MnO2','Mn',[['Mn',1,null],['O',2,-2]],4],
    ['H2SO4','S',[['H',2,1],['S',1,null],['O',4,-2]],6],['NaClO','Cl',[['Na',1,1],['Cl',1,null],['O',1,-2]],1],['K2Cr2O7','Cr',[['K',2,1],['Cr',2,null],['O',7,-2]],6]];
  const NM={Mn:'锰',S:'硫',Cl:'氯',Cr:'铬'},PNM={KMnO4:'高锰酸钾',K2MnO4:'锰酸钾',MnO2:'二氧化锰',H2SO4:'硫酸',NaClO:'次氯酸钠',K2Cr2O7:'重铬酸钾'};
  const KEYS=[-3,-2,-1,0,1,2,3,4,5,6,7,8],vs=v=>v===0?'0':(v>0?'+':'−')+Math.abs(v);
  $('#caKeys').innerHTML=KEYS.map(v=>`<button data-v="${v}">${vs(v)}</button>`).join('');
  $$('#caKeys button').forEach(b=>b.onclick=()=>{if(phase!=='ask'&&!free)return;pick=+b.dataset.v;if(free)x=pick;keys();sfx('click');});
  const keys=()=>$$('#caKeys button').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.v===pick));b.classList.remove('right','wrong');
    if(phase==='done'&&!free){if(+b.dataset.v===Q[qi][3])b.classList.add('right');else if(+b.dataset.v===pick)b.classList.add('wrong');}});
  function ask(){const q=Q[qi];phase='ask';pick=null;x=free?0:null;revT=0;
    $('#caTitle').textContent=free?'自由调天平':`求化合价 ${qi+1} / ${Q.length}`;
    $('#caAsk').innerHTML=free?'点下面的数字改变未知元素的化合价，看天平什么时候平衡。':`${PNM[q[0]]}（${fmB(q[0])}）中，<b class="ky">${NM[q[1]]}元素</b>的化合价是多少？`;
    setSt($('#caSt'),'',free?'自由模式不计分。':'先列式计算，再提交。答对 +5');keys();}
  $('#caSub').onclick=()=>{if(free||phase!=='ask')return;if(pick===null){setSt($('#caSt'),'warn','请先选一个化合价');return;}phase='rev';x=pick;revT=0;const q=Q[qi],tm=TEAM.cur,ok=pick===q[3];
    const eq=q[2].map(([s,n,v])=>`(${v===null?'x':vs(v)})×${n}`).join(' + ')+' = 0';
    setTimeout(()=>{phase='done';keys();if(ok){teamAdd(5,tm);sfx('ok');setSt($('#caSt'),'ok',`<b>${tname(tm)}答对 +5</b>　${eq}，x = ${vs(q[3])}`);}
      else{x=q[3];revT=0;sfx('bad');setSt($('#caSt'),'bad',`<b>${tname(tm)}答错，不加分</b>　${eq}，x = ${vs(q[3])}`);}teamNext();},1500);};
  $('#caNext').onclick=()=>{if(free)return;qi=(qi+1)%Q.length;ask();sfx('whoosh');};
  $('#caMode').onclick=()=>{free=!free;$('#caMode').setAttribute('aria-pressed',String(free));ask();sfx('click');};
  $('#caReset').onclick=()=>{qi=0;free=false;$('#caMode').setAttribute('aria-pressed','false');ask();};
  // 画化学式：逐个元素写出，并在正上方标化合价（未知的标“?”或学生的值）
  function drawFm(ctx,q,cx,y,size){const parts=q[2];
    const wOf=([s,n])=>{ctx.font=`700 ${size}px ${FNUM}`;let w=ctx.measureText(s).width;if(n>1){ctx.font=`700 ${size*.6}px ${FNUM}`;w+=ctx.measureText(String(n)).width+2;}return w;};
    const W=parts.reduce((a,p)=>a+wOf(p)+4,0);let px=cx-W/2;
    parts.forEach(p=>{const[s,n,v]=p,wd=wOf(p);ctx.font=`700 ${size}px ${FNUM}`;const sw=ctx.measureText(s).width;const unk=v===null;
      ctx.fillStyle=unk?CY:INK;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(s,px,y+size*.35);
      if(n>1){ctx.font=`700 ${size*.6}px ${FNUM}`;ctx.fillText(String(n),px+sw+1,y+size*.35+size*.22);}
      const lab=unk?(x===null?'?':vs(x)):vs(v);txt(ctx,lab,px+sw/2,y-size*.62,{size:size*.42,weight:700,col:unk?CY:CB});
      if(unk){ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle=CY;ctx.lineWidth=2;ctx.strokeRect(px-6,y-size*.95,sw+12,size*1.4);ctx.restore();}
      px+=wd+4;});}
  function tick(dt){t+=dt;revT+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);const q=Q[qi];
    drawFm(ctx,q,w/2,104,64);
    // 天平
    const sum=q[2].reduce((a,[s,n,v])=>a+(v===null?(x===null?0:x):v)*n,0),locked=x===null;
    const target=locked?0:-clamp(sum,-8,8)*.045;ang=lerp(ang,target,1-Math.exp(-dt*4));
    const fx=w/2,fy=h*.42,L=Math.min(w*.32,340);
    chalkPath(ctx,[[fx,fy],[fx-46,fy+150],[fx+46,fy+150]],{col:INK,w:3,closed:true,seed:2});chalkLine(ctx,fx-90,fy+150,fx+90,fy+150,{col:INK,w:3,seed:3});
    const ends=[-1,1].map(sg=>[fx+sg*L*Math.cos(ang),fy+sg*L*Math.sin(ang)]);chalkLine(ctx,ends[0][0],ends[0][1],ends[1][0],ends[1][1],{col:INK,w:5,seed:4});
    chalkCircle(ctx,fx,fy,7,{col:CY,fill:CY,seed:5});
    // 指针
    chalkLine(ctx,fx,fy,fx+Math.sin(ang)*60,fy-Math.cos(ang)*60,{col:Math.abs(sum)<1e-9&&!locked?CG:CP,w:3,seed:6});
    const pans=[[],[]];q[2].forEach(([s,n,v])=>{const vv=v===null?x:v;for(let i=0;i<n;i++){if(vv===null)continue;if(vv>0)pans[0].push([s,vv,v===null]);else if(vv<0)pans[1].push([s,vv,v===null]);}});
    ends.forEach(([ex,ey],k)=>{const py=ey+90;chalkLine(ctx,ex,ey,ex-70,py,{col:'rgba(241,238,228,.6)',w:2,seed:10+k});chalkLine(ctx,ex,ey,ex+70,py,{col:'rgba(241,238,228,.6)',w:2,seed:12+k});
      chalkPath(ctx,[[ex-86,py],[ex-70,py+14],[ex+70,py+14],[ex+86,py]],{col:INK,w:3,seed:14+k});
      hand(ctx,k?'需要盘（负价）':'供给盘（正价）',ex,py+38,{size:22,col:k?CP:CB});
      const items=pans[k],per=Math.min(7,Math.max(1,items.length)),bw=Math.min(40,160/per);
      items.forEach(([s,v,unk],i)=>{const col=i%per,row=Math.floor(i/per),bh=14+Math.abs(v)*7,bx=ex-per*bw/2+col*bw,by=py-bh-row*(bh+4)-2;
        ctx.fillStyle=unk?'rgba(255,226,122,.85)':k?'rgba(255,158,181,.75)':'rgba(143,211,255,.75)';rr(ctx,bx+1,by,bw-2,bh,4);ctx.fill();
        txt(ctx,s,bx+bw/2,by+bh/2,{size:Math.min(12,bw*.42),weight:700,col:'#1f3328'});});});
    if(locked){hand(ctx,'先算一算，提交后天平才会松开',fx,fy-84,{size:22,col:DIM});}
    // 算式
    const eq=q[2].map(([s,n,v])=>`(${v===null?(x===null?'x':vs(x)):vs(v)})×${n}`).join(' + ');
    const by2=h-160;hand(ctx,`${eq} = ${locked?'0':vs(sum)}`,w/2,by2,{size:28,col:INK});
    if(!locked){const ok=sum===0,sup=q[2].reduce((a,[s,n,v])=>{const vv=v===null?x:v;return a+(vv>0?vv*n:0);},0),ned=q[2].reduce((a,[s,n,v])=>{const vv=v===null?x:v;return a+(vv<0?-vv*n:0);},0);
      hand(ctx,ok?`供给 ${sup} = 需要 ${ned}，天平平衡 ✓`:`供给 ${sup} ≠ 需要 ${ned}，天平不平衡`,w/2,by2+40,{size:24,col:ok?CG:CP});
      if(ok&&!free&&phase==='done')hand(ctx,`${NM[q[1]]}元素的化合价：${vs(q[3])}`,w/2,by2-42,{size:26,col:CY});}}
  ask();
  notes('calc','由化学式求化合价',['依据：化合物里<mark>正、负化合价的代数和为 0</mark>（供给 = 需要）。','步骤：标出已知化合价 → 未知设为 x → 列式（化合价 × 原子个数，求和 = 0）→ 解出 x。',
    `${fmB('KMnO4')}：(+1)×1 + x + (−2)×4 = 0，x = <mark>+7</mark>。`],
    '别忘了乘原子个数：K₂Cr₂O₇ 中 2x = +12，x = +6。',
    (ctx,w,h)=>{const fx=w/2,fy=h*.42,L=w*.3;chalkPath(ctx,[[fx,fy],[fx-30,fy+90],[fx+30,fy+90]],{col:PEN.ink,w:2.5,closed:true,seed:2});chalkLine(ctx,fx-L,fy,fx+L,fy,{col:PEN.ink,w:4,seed:3});
      [[-1,'供给盘',PEN.red,[['K','+1'],['Mn','+7']]],[1,'需要盘',PEN.blue,[['O','−2'],['O','−2'],['O','−2'],['O','−2']]]].forEach(([sg,lab,c,items])=>{const ex=fx+sg*L,py=fy+64;
        chalkLine(ctx,ex,fy,ex-48,py,{col:PEN.dim,w:1.5,seed:5});chalkLine(ctx,ex,fy,ex+48,py,{col:PEN.dim,w:1.5,seed:6});chalkLine(ctx,ex-58,py,ex+58,py,{col:PEN.ink,w:3,seed:7});
        items.forEach(([e,v],i)=>{const bw=26,x=ex-items.length*bw/2+i*bw,bh=Math.abs(+v.replace('−','-'))*9;ctx.fillStyle=c;ctx.globalAlpha=.25;ctx.fillRect(x+1,py-bh,bw-2,bh);ctx.globalAlpha=1;ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.strokeRect(x+1,py-bh,bw-2,bh);txt(ctx,e,x+bw/2,py-bh-11,{size:15,weight:700,col:c});});
        hand(ctx,lab,ex,py+26,{size:20,col:c});});
      fmDraw(ctx,'KMn{+7}O4',w/2,48,38,{col:PEN.ink,cols:{val:PEN.red}});hand(ctx,'供给 1 + 7 = 需要 2×4',w/2,h*.88,{size:22,col:PEN.green});});
  return{tick};})();

/* ================= 7 同种元素的多种化合价：氯的电梯、亚铁与铁、NH₄NO₃ ================= */
S.multi=(()=>{const cv=$('#cvMulti');let t=0,scene='cl',place={},sel=null,done=false,ride=-1,feOpen={},nStep=0;const G={};
  const FL=[7,5,3,1,0,-1];
  const CARDS=[['HCl',-1,'(+1) + x = 0'],['Cl2',0,'单质中元素化合价为 0'],['NaClO',1,'(+1) + x + (−2) = 0'],['KClO3',5,'(+1) + x + (−2)×3 = 0'],['HClO4',7,'(+1) + x + (−2)×4 = 0']];
  const vs=v=>v===0?'0':(v>0?'+':'−')+Math.abs(v);
  const cardXY=i=>[G.cx0,G.cy0+i*G.cg];
  const floorAt=(x,y)=>G.fx&&x>G.fx-20&&x<G.fx+G.fw+20?FL.findIndex((f,i)=>y>G.fy(i)-G.fh/2&&y<G.fy(i)+G.fh/2):-1;
  function drop(i,fi){if(done)return;place[i]=FL[fi];sel=null;sfx('drop');}
  const ui=canvasUI(cv,{tools:()=>scene==='cl'&&G.w?CARDS.map((c,i)=>{const p=place[i]!==undefined;const[x,y]=p?[G.slotX(FL.indexOf(place[i]),i),G.fy(FL.indexOf(place[i]))]:cardXY(i);
      return{id:i,x,y,r:46,draw:(ctx,x2,y2)=>{const s=sel===i;chalkRect(ctx,x2-58,y2-24,116,48,{col:done?(place[i]===c[1]?CG:CP):s?CY:INK,w:s?3.5:2.5,fill:'rgba(27,47,38,.95)',seed:i+40});fmDraw(ctx,c[0],x2,y2,24,{col:INK});}};}):[],
    hots:()=>scene==='cl'?FL.map((f,fi)=>({hit:(x,y)=>floorAt(x,y)===fi,act:()=>{if(sel!==null)drop(sel,fi);}}))
      :scene==='fe'?FE.map((c,i)=>({hit:(x,y)=>G.feBox&&G.feBox[i]&&x>G.feBox[i][0]&&x<G.feBox[i][0]+G.feBox[i][2]&&y>G.feBox[i][1]&&y<G.feBox[i][1]+G.feBox[i][3],act:()=>{feOpen[i]=!feOpen[i];sfx('pop');}}))
      :[{hit:()=>true,act:()=>{nStep=Math.min(4,nStep+1);sfx('pop');}}],
    onDrop:(id,x,y)=>{const fi=floorAt(x,y);if(fi<0)return false;drop(id,fi);return true;},
    onTap:id=>{if(done)return;sel=sel===id?null:id;sfx('click');}});
  const FE=[['FeO','氧化亚铁',2],['FeCl2','氯化亚铁',2],['Fe(OH)2','氢氧化亚铁',2],['FeSO4','硫酸亚铁',2],['Fe2O3','氧化铁',3],['FeCl3','氯化铁',3],['Fe(OH)3','氢氧化铁',3],['Fe2(SO4)3','硫酸铁',3]];
  function setScene(s){scene=s;['Cl','Fe','N'].forEach(k=>$('#mu'+k).setAttribute('aria-pressed',String(s===k.toLowerCase())));
    $('#muTitle').textContent=s==='cl'?'送它们上楼':s==='fe'?'亚铁与铁':'一种物质，两种价';
    $('#muHint').innerHTML=s==='cl'?'把含氯物质拖到氯元素化合价对应的楼层（也可以先点物质、再点楼层），全部放好后提交。':s==='fe'?'铁有 +2、+3 两种化合价。点一点黑板上的化学式，看看它们怎么读。':'点黑板，一步步看 NH₄NO₃ 中两个氮原子的化合价。';
    $('#muSub').disabled=$('#muRedo').disabled=s!=='cl';sfx('whoosh');}
  $('#muCl').onclick=()=>setScene('cl');$('#muFe').onclick=()=>setScene('fe');$('#muN').onclick=()=>{nStep=0;setScene('n');};
  $('#muSub').onclick=()=>{if(done)return;if(Object.keys(place).length<CARDS.length){setSt($('#muSt'),'warn',`还有 ${CARDS.length-Object.keys(place).length} 张卡片没送上楼`);return;}done=true;sel=null;ride=0;const tm=TEAM.cur,bad=CARDS.filter((c,i)=>place[i]!==c[1]).length;
    if(!bad){teamAdd(5,tm);sfx('ok');setSt($('#muSt'),'ok',`<b>${tname(tm)}全对 +5</b>　氯元素：HCl −1、Cl₂ 0、NaClO +1、KClO₃ +5、HClO₄ +7。`);}
    else{sfx('bad');setSt($('#muSt'),'bad',`<b>${tname(tm)}送错 ${bad} 张，不加分</b>　电梯会把每张卡送到正确的楼层。`);}teamNext();};
  $('#muRedo').onclick=()=>{place={};sel=null;done=false;ride=-1;setSt($('#muSt'),'','全对 +5 分');};
  tfGroup($('#muTF'),$('#muTSub'),$('#muTRedo'),$('#muTSt'),[
    ['非金属元素在化合物里一定显负价',false,'CO₂ 中碳元素显 +4 价、KClO₃ 中氯元素显 +5 价。'],
    ['同种元素在同一种化合物里，化合价一定相同',false,'NH₄NO₃ 中两个氮原子分别显 −3 价和 +5 价。'],['单质中元素的化合价为 0',true,''],[`${fmB('FeCl2')} 读作氯化铁`,false,'铁显 +2 价时读作“亚铁”：FeCl₂ 是氯化亚铁。']]);
  $('#muReset').onclick=()=>{$('#muRedo').click();$('#muTRedo').click();feOpen={};nStep=0;setScene('cl');};
  function tick(dt){t+=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;
    if(scene==='cl'){G.cx0=w*.14;G.cy0=110;G.cg=Math.min(92,(h-200)/5);G.fx=w*.38;G.fw=w*.48;G.fh=Math.min(84,(h-120)/6);G.fy=i=>70+G.fh/2+i*G.fh;G.slotX=(fi,i)=>{const on=CARDS.map((c,j)=>j).filter(j=>place[j]===FL[fi]);return G.fx+140+on.indexOf(i)*126;};
      hand(ctx,'含氯物质',G.cx0,60,{size:24,col:CB});
      // 楼层
      FL.forEach((f,i)=>{const y=G.fy(i);chalkLine(ctx,G.fx,y+G.fh/2,G.fx+G.fw,y+G.fh/2,{col:'rgba(241,238,228,.45)',w:2,seed:i+1});hand(ctx,vs(f),G.fx+20,y,{size:30,col:f>0?CY:f<0?CP:INK});
        });
      chalkRect(ctx,G.fx,70,G.fw,G.fh*6,{col:INK,w:3,seed:20});hand(ctx,'氯元素的化合价',G.fx+G.fw/2,46,{size:24,col:INK});
      // 电梯井与轿厢
      const sx=G.fx+G.fw+18;chalkRect(ctx,sx,70,46,G.fh*6,{col:'rgba(241,238,228,.5)',w:2,seed:21});
      let cy=G.fy(5);if(done){ride+=dt*.8;const order=[5,4,3,2,1,0].filter(fi=>CARDS.some(c=>c[1]===FL[fi]));const k=Math.min(order.length-1,Math.floor(ride));const fi=order[k];cy=G.fy(fi);
        CARDS.forEach((c,i)=>{if(FL.indexOf(c[1])===fi&&ride<order.length+.5){txt(ctx,`${c[0].replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d])}：${c[2]}${c[1]?`，x = ${vs(c[1])}`:''}`,G.fx+G.fw/2,70+G.fh*6+18,{size:18,weight:700,col:CY});}});}
      chalkRect(ctx,sx+5,cy-G.fh/2+6,36,G.fh-12,{col:CY,w:2.5,fill:'rgba(255,226,122,.25)',seed:22});
      ui.draw(ctx);
      if(!done)txt(ctx,sel!==null?'再点楼层，把它送上去':'拖到楼层，或先点卡片再点楼层',G.cx0,G.cy0+5*G.cg-10,{size:14,weight:700,col:DIM});
      else CARDS.forEach((c,i)=>{if(place[i]!==c[1]){const y=G.fy(FL.indexOf(c[1]));hand(ctx,`← ${c[0].replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d])} 应在这里`,G.fx+G.fw-12,y,{size:18,col:CP,align:'right'});}});}
    else if(scene==='fe'){G.feBox=[];const cw=Math.min(210,(w-120)/4),ch=110,x0=w/2-cw*2-18;
      [['+2 价：读作“亚铁”',CB,0],['+3 价：读作“铁”',CY,4]].forEach(([tt,col,o],r)=>{const y0=70+r*(ch+80);hand(ctx,tt,w/2,y0,{size:30,col});
        for(let i=0;i<4;i++){const c=FE[o+i],x=x0+i*(cw+12),y=y0+30;G.feBox[o+i]=[x,y,cw,ch];chalkRect(ctx,x,y,cw,ch,{col,w:2.5,seed:o+i+50});
          fmDraw(ctx,c[0].replace(/^Fe(\d*)/,(m,d)=>`Fe${d}{+${c[2]}}`),x+cw/2,y+56,34,{col:INK});hand(ctx,feOpen[o+i]?c[1]:'点我读一读',x+cw/2,y+ch-20,{size:feOpen[o+i]?28:18,col:feOpen[o+i]?col:DIM});}});
      hand(ctx,'同一种元素在不同物质中可以显不同的化合价',w/2,h-36,{size:24,col:CG});}
    else{const y=120;fmDraw(ctx,'NH4NO3',w/2,y,84,{col:INK});hand(ctx,'硝酸铵',w/2,y+64,{size:30,col:CY});
      const L=[['NH₄ 是铵根，带 1 个单位正电荷，化合价为 +1',CB],['铵根中：x + (+1)×4 = +1，N 为 −3 价',CB],['NO₃ 是硝酸根，带 1 个单位负电荷，化合价为 −1',CP],['硝酸根中：y + (−2)×3 = −1，N 为 +5 价',CP]];
      L.forEach(([s,col],i)=>{if(i<nStep)hand(ctx,s,w/2,y+130+i*52,{size:26,col});});
      if(nStep>=4){hand(ctx,'同一种化合物里，同种元素也可以显不同的化合价',w/2,y+130+4*52+20,{size:26,col:CG});
        txt(ctx,'（根中各元素化合价的代数和，等于根的化合价）',w/2,y+130+4*52+58,{size:16,weight:700,col:DIM});}
      else txt(ctx,'点黑板，下一步',w/2,h-30,{size:15,weight:700,col:DIM});}}
  notes('multi','同种元素的多种化合价',['同一种元素在不同物质里可显<mark>不同的化合价</mark>。','<mark>单质</mark>里元素的化合价为 <mark>0</mark>。','铁显 +2 价读作“<mark>亚铁</mark>”：FeCl₂ 氯化亚铁；+3 价读作“铁”：FeCl₃ 氯化铁。','同一种化合物里，同种元素也可显不同化合价：NH₄NO₃ 中 N 为 −3 和 +5。'],
    '非金属元素不一定显负价：CO₂ 中碳为 +4 价。',
    (ctx,w,h)=>{const F=[['+7','HClO₄'],['+5','KClO₃'],['+1','NaClO'],['0','Cl₂'],['−1','HCl']],fh=(h-60)/F.length;
      hand(ctx,'氯的化合价',w/2,24,{size:22,col:PEN.green});
      F.forEach(([v,f],i)=>{const y=50+i*fh+fh/2;chalkLine(ctx,40,y+fh/2,w-40,y+fh/2,{col:'rgba(42,42,36,.3)',w:1.5,seed:i});txt(ctx,v,70,y,{size:24,weight:700,col:v[0]==='−'?PEN.blue:v==='0'?PEN.ink:PEN.red});txt(ctx,f,w*.6,y,{size:22,weight:700,col:PEN.ink});});
      chalkPath(ctx,[[w-30,h-30],[w-30,60],[w-40,72],[w-30,60],[w-20,72]],{col:PEN.gold,w:2.5,seed:9});});
  setScene('cl');
  return{tick};})();

/* ================= 8 根据化合价写化学式：教材五步 + 特殊情况；按名称拼化学式 ================= */
S.write=(()=>{const cv=$('#cvWrite');let t=0,step=0,auto=null,special=false,pa='P',pb='O',stT=0,stepT=0,lastStep=0;const G={};
  // 正价部分 [符号, 化合价, 名称, 是否原子团]；负价部分 [符号, 化合价, 读法用字]
  const POS=[['Na',1,'钠'],['K',1,'钾'],['Ag',1,'银'],['NH4',1,'铵',1],['Mg',2,'镁'],['Ca',2,'钙'],['Ba',2,'钡'],['Zn',2,'锌'],['Cu',2,'铜'],['Fe2',2,'亚铁'],['Fe3',3,'铁'],['Al',3,'铝'],['P',5,'磷'],['C',4,'碳']];
  const NEG=[['O',-2,'氧化'],['Cl',-1,'氯化'],['Br',-1,'溴化'],['S',-2,'硫化'],['OH',-1,'氢氧化',1],['NO3',-1,'硝酸',1],['SO4',-2,'硫酸',1],['CO3',-2,'碳酸',1],['PO4',-3,'磷酸',1]];
  const sym=s=>s.replace(/^Fe\d$/,'Fe');
  // 不常见或不能稳定存在的组合，不让生成
  const BAD={P:['Cl','Br','S','OH','NO3','SO4','CO3','PO4'],C:['Cl','Br','S','OH','NO3','SO4','CO3','PO4'],NH4:['O','OH','S'],Ag:['OH'],Al:['CO3','S'],Fe3:['CO3','S'],Cu:['CO3'],Mg:['S'],Ca:['S'],Ba:['S']};
  const ok2=(a,b)=>!(BAD[a]||[]).includes(b);
  const P=()=>POS.find(p=>p[0]===pa),N=()=>NEG.find(n=>n[0]===pb);
  const lcm=(a,b)=>a*b/gcd(a,b);
  function build(){const[a,va,an,ga]=P(),[b,vb,bn,gb]=N(),A=Math.abs(va),B=Math.abs(vb),L=lcm(A,B),na=L/A,nb=L/B;
    const part=(s,n,g)=>n===1?s:g?`(${s})${n}`:`${s}${n}`;const f=part(sym(a),na,ga)+part(b,nb,gb);
    let name;if(b==='O'&&(a==='P'||a==='C'))name=`${CN[nb]}氧化${na>1?CN[na]:''}${an}`;else name=bn+an;
    if(f==='CO2')name='二氧化碳';
    return{a:sym(a),va,b,vb,A,B,L,na,nb,f,name,ga,gb};}
  // 选择正价部分与负价部分（画布上的两排卡片）
  const chipW=()=>Math.min(64,(G.w-150)/POS.length);
  const ui=canvasUI(cv,{hots:()=>special||!G.w?[]:[...POS.map((p,i)=>({hit:(x,y)=>Math.abs(x-G.px(i))<chipW()/2-2&&Math.abs(y-G.py)<22,act:()=>{if(!ok2(p[0],pb))pb='O';if(!ok2(p[0],pb))pb='Cl';pa=p[0];step=0;stop();sfx('click');}})),
      ...NEG.map((n,i)=>({hit:(x,y)=>Math.abs(x-G.nx(i))<36&&Math.abs(y-G.ny)<22,act:()=>{if(!ok2(pa,n[0])){stT=2.5;sfx('bad');return;}pb=n[0];step=0;stop();sfx('click');}}))]});
  function stop(){if(auto){clearInterval(auto);auto=null;}$('#wrAll').textContent='演示五步';}
  $('#wrStep').onclick=()=>{if(special)toggleSp();step=step>=6?0:step+1;sfx(step?'pop':'click');};
  $('#wrAll').onclick=()=>{if(special)toggleSp();if(auto){stop();return;}step=0;$('#wrAll').textContent='停止';auto=setInterval(()=>{step++;sfx('pop');if(step>=6)stop();},1300);};
  function toggleSp(){special=!special;$('#wrSpecial').setAttribute('aria-pressed',String(special));stop();sfx('whoosh');}
  $('#wrSpecial').onclick=toggleSp;
  const vs=v=>(v>0?'+':'−')+Math.abs(v),sb=s=>s.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
  function tick(dt){t+=dt;if(stT>0)stT-=dt;const{ctx,w,h}=fitS(cv);ctx.clearRect(0,0,w,h);G.w=w;
    if(special){hand(ctx,'通常这样写，也有特殊情况',w/2,46,{size:32,col:CY});
      const S=[['NH3','N{-3}H3{+1}','氨气','负价的 N 习惯写在左边'],['CH4','C{-4}H4{+1}','甲烷','负价的 C 写在左边；这里碳显 −4 价（表 4-3 只列出常见的 +2、+4）'],['ClO2','Cl{+4}O2{-2}','二氧化氯','氯显 +4 价，表 4-3 里没有，按名称直接写'],['H2O2','H2{+1}O2{-1}','过氧化氢','氧显 −1 价，不是通常的 −2 价']];
      const rh=(h-120)/4;S.forEach(([f,fv,n,why],i)=>{const y=96+i*rh+rh/2;chalkRect(ctx,40,y-rh/2+6,w-80,rh-12,{col:'rgba(241,238,228,.45)',w:2,seed:i+60});
        fmDraw(ctx,fv,150,y+12,40,{col:INK});hand(ctx,n,300,y,{size:28,col:CB,align:'left'});txt(ctx,why,440,y,{size:18,weight:700,align:'left',col:INK});});
      txt(ctx,'化学式以实验测定的组成为准：先认识通常的规律，再记住常见的例外。',w/2,h-24,{size:15,weight:700,col:DIM});return;}
    // 卡片
    G.py=34;G.px=i=>w/2+40+(i-(POS.length-1)/2)*chipW();G.ny=86;G.nx=i=>w/2+40+(i-(NEG.length-1)/2)*78;if(step!==lastStep){lastStep=step;stepT=0;}stepT+=dt;
    POS.forEach((p,i)=>{const on=p[0]===pa,x=G.px(i),cw=chipW()-6;chalkRect(ctx,x-cw/2,G.py-20,cw,40,{col:on?CY:'rgba(241,238,228,.5)',w:on?3:2,fill:on?'rgba(255,226,122,.18)':null,seed:i+70});
      fmDraw(ctx,sym(p[0]),x,G.py+5,17,{col:INK});txt(ctx,vs(p[1]),x,G.py-11,{size:10,weight:700,col:CB});});
    NEG.forEach((n,i)=>{const on=n[0]===pb,can=ok2(pa,n[0]),x=G.nx(i);ctx.globalAlpha=can?1:.3;chalkRect(ctx,x-34,G.ny-20,68,40,{col:on?CP:'rgba(241,238,228,.5)',w:on?3:2,fill:on?'rgba(255,158,181,.18)':null,seed:i+90});
      fmDraw(ctx,n[0],x,G.ny+5,18,{col:INK});txt(ctx,vs(n[1]),x,G.ny-11,{size:10,weight:700,col:CP});ctx.globalAlpha=1;});
    txt(ctx,'正价部分',30,G.py,{size:13,weight:700,col:CB,align:'left'});txt(ctx,'负价部分',30,G.ny,{size:13,weight:700,col:CP,align:'left'});
    if(stT>0)txt(ctx,'这两种一般不这样组合，换一个试试',w/2,G.ny+34,{size:14,weight:700,col:BADC});
    // 五步
    const B=build(),x0=60,y0=150,rh=Math.min(78,(h-y0-70)/6);
    const lines=[['① 写出元素（或根）的符号，正价在左、负价在右，标出化合价',''],
      ['② 求正、负化合价绝对值的最小公倍数（= 供给、需要的电子总数）',B.A===B.B?`${B.A} 和 ${B.B} 的最小公倍数 = ${B.L}`:B.L===B.A*B.B?`${B.A} × ${B.B} = ${B.L}`:`${B.A} 和 ${B.B} 的最小公倍数 = ${B.L}`],
      ['③ 求各原子（或根）的个数 = 最小公倍数 ÷ 化合价绝对值',`${sb(B.a)}：${B.L} ÷ ${B.A} = ${B.na}　　${sb(B.b)}：${B.L} ÷ ${B.B} = ${B.nb}`],
      ['④ 把个数写在右下角（“1”省略，根不止 1 个加括号）',B.f],
      ['⑤ 检查：正、负化合价的代数和为 0',`(${vs(B.va)})×${B.na} + (${vs(B.vb)})×${B.nb} = 0 ✓`],
      ['读作',B.name]];
    if(step===0)hand(ctx,'选好正价部分和负价部分，点“下一步”',w/2,y0+rh*2,{size:30,col:DIM});
    lines.forEach(([cap,body],i)=>{if(i>=step)return;const y=y0+i*rh+rh/2;const fresh=i===step-1;ctx.globalAlpha=fresh?clamp(stepT*3,0,1):1;
      txt(ctx,cap,x0,y-rh*.3,{size:15,weight:700,col:DIM,align:'left'});
      if(i===0){let x=x0;[[B.a,B.va,CB],[B.b,B.vb,CP]].forEach(([s,v,col])=>{const wv=fmDraw(ctx,s,0,0,34,{measure:true});fmDraw(ctx,s,x,y+rh*.3,30,{align:'left',col});txt(ctx,vs(v),x+wv/2,y-rh*.06,{size:16,weight:700,col:CY});x+=wv+48;});}
      else if(i===3)fmDraw(ctx,body,x0,y+rh*.2,40,{align:'left',col:CY});
      else if(i===5)hand(ctx,body,x0,y+rh*.18,{size:32,col:CG,align:'left'});
      else hand(ctx,body,x0,y+rh*.18,{size:26,col:INK,align:'left'});ctx.globalAlpha=1;});}
  // 按名称拼化学式
  const TG=[['溴化钠','NaBr'],['氯化钙','CaCl2'],['氧化铝','Al2O3'],['氢氧化铝','Al(OH)3'],['碳酸钠','Na2CO3'],['硝酸铜','Cu(NO3)2'],['氯化亚铁','FeCl2'],['硫酸铁','Fe2(SO4)3'],['硫酸铵','(NH4)2SO4']];
  const TILES=['Na','K','Ca','Mg','Al','Fe','Cu','Zn','NH4','O','Cl','Br','OH','NO3','SO4','CO3','2','3','4','(',')'];
  let ti=0,seq=[],cdone=false;const cst=$('#wrSt');
  $('#wrTray').innerHTML=TILES.map(s=>`<button data-s="${s}" class="${/^\d$/.test(s)?'dg':/[()]/.test(s)?'pr':''}">${/^\d$|[()]/.test(s)?s:fm(s)}</button>`).join('');
  $$('#wrTray button').forEach(b=>b.onclick=()=>{if(cdone||seq.length>=12)return;seq.push(b.dataset.s);sfx('click');slots();});
  function slots(){const box=$('#wrSlots');box.innerHTML=seq.length?seq.map((s,i)=>`<span class="sl${/^\d$/.test(s)?' d':''}" data-i="${i}">${/^\d$|[()]/.test(s)?s:fm(s)}</span>`).join(''):'<span class="hint">点下面的卡片</span>';
    $$('.sl',box).forEach(x=>x.onclick=()=>{if(cdone)return;seq.splice(+x.dataset.i,1);sfx('click');slots();});}
  function target(){$('#wrTask').textContent=TG[ti][0];seq=[];cdone=false;slots();setSt(cst,'','点符号、原子团、数字和括号拼出化学式（数字自动写成右下角的小字）。答对 +5');}
  $('#wrBack').onclick=()=>{if(cdone)return;seq.pop();sfx('click');slots();};
  $('#wrNext').onclick=()=>{ti=(ti+1)%TG.length;target();};
  $('#wrSub').onclick=()=>{if(cdone)return;if(!seq.length){setSt(cst,'warn','还没有拼');return;}cdone=true;const tm=TEAM.cur,[n,f]=TG[ti];
    if(seq.join('')===f){teamAdd(5,tm);sfx('ok');burstAt($('#wrSlots'),24,[CY,CG,CP]);setSt(cst,'ok',`<b>${tname(tm)}拼对 +5</b>　${n}：${fmB(f)}。点“换一题”继续。`);}
    else{sfx('bad');setSt(cst,'bad',`<b>${tname(tm)}拼错，不加分</b>　${n}的化学式是 ${fmB(f)}。`);}teamNext();};
  $('#wrReset').onclick=()=>{pa='P';pb='O';step=0;stop();if(special)toggleSp();ti=0;target();};
  target();
  notes('write','根据化合价写化学式',['① 写符号：<mark>正价在左、负价在右</mark>，标出化合价。','② 求化合价绝对值的<mark>最小公倍数</mark>。','③ 个数 = 最小公倍数 ÷ 化合价绝对值。','④ 个数写在右下角（“1”省略，根不止 1 个加括号）。','⑤ <mark>检查</mark>：正、负化合价的代数和为 0。'],
    '通常正价在左；特殊情况：NH₃、CH₄ 负价元素写在左边。',
    (ctx,w,h)=>{const y=70;fmDraw(ctx,'P',w*.3,y,56,{col:PEN.ink});txt(ctx,'+5',w*.3,y-50,{size:24,weight:700,col:PEN.red});fmDraw(ctx,'O',w*.7,y,56,{col:PEN.ink});txt(ctx,'−2',w*.7,y-50,{size:24,weight:700,col:PEN.blue});
      hand(ctx,'5 × 2 = 10',w/2,y+64,{size:24,col:PEN.gold});
      txt(ctx,'P：10 ÷ 5 = 2',w*.3,y+108,{size:18,weight:700,col:PEN.red});txt(ctx,'O：10 ÷ 2 = 5',w*.7,y+108,{size:18,weight:700,col:PEN.blue});
      chalkPath(ctx,[[w*.3,y+124],[w*.38,y+168]],{col:PEN.red,w:2,seed:2});chalkPath(ctx,[[w*.7,y+124],[w*.56,y+168]],{col:PEN.blue,w:2,seed:3});
      fmDraw(ctx,'P2O5',w/2,y+196,52,{col:PEN.ink,cols:{sub:PEN.green}});hand(ctx,'(+5)×2 + (−2)×5 = 0 ✓',w/2,h-22,{size:20,col:PEN.green});});
  return{tick,leave(){stop();}};})();
