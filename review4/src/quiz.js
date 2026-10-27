/* ================= 题目引擎：单选 / 判断 / 计算 / 比值统一判分；答错后点“原题”弹出 3 道变式巩固 =================
   题目格式 q：{t:'c'|'tf'|'n'|'r', q:'题干（可含 HTML）', o:[选项], a:答案, w:'解析', unit, dp:要求的小数位数, tol, pic:(ctx,w,h)=>{} 配图, v:[3 道变式（同格式）]}
   c 单选：a 为选项序号；tf 判断：a 为 true/false；n 计算：a 为数值；r 比值：a 为 [a,b,…]（等价比判对并提醒）。 */
const QT={c:'单选',tf:'判断',n:'计算',r:'比值'};
function judgeQ(q,val){let ok=false,msg='';
  if(q.t==='c')ok=val===q.a;
  else if(q.t==='tf')ok=val===q.a;
  else if(q.t==='r'){const p=String(val).split('∶').filter(x=>x!=='').map(Number);
    if(p.length===q.a.length&&p.every(x=>x>0)){if(p.every((x,k)=>Math.abs(x-q.a[k])<1e-9))ok=true;else{const k0=p[0]/q.a[0];if(p.every((x,k)=>Math.abs(x/q.a[k]-k0)<1e-6)){ok=true;msg=`比值正确。<b>注意看题目要求</b>：若要求最简整数比，应写成 ${q.a.join(' ∶ ')}。`;}}}}
  else{const s=String(val).replace('%',''),v=parseFloat(s),d=Math.abs(v-q.a);
    if(q.dp!=null){const decs=(s.split('.')[1]||'').length,cn=['零','一','两','三'][q.dp]??q.dp;ok=decs===q.dp&&d<1e-9;
      if(!ok&&decs!==q.dp&&d<=.06)msg=`数值接近，但<b>题目要求保留${cn}位小数</b>，应写成 ${q.a}。`;else if(!ok&&decs===q.dp&&d<=.1+1e-9)msg=`保留${cn}位小数时要<b>四舍五入</b>，应写成 ${q.a}。`;}
    else{ok=d<=(q.tol??1e-9);if(!ok&&q.unit==='%'&&Math.abs(v-q.a*100)<.5)msg='注意：答案写成百分数。';}}
  return{ok,msg};}
function ansText(q){return q.t==='c'?`${'ABCD'[q.a]}. ${q.o[q.a]}`:q.t==='tf'?(q.a?'正确':'错误'):q.t==='r'?q.a.join(' ∶ '):`${q.a}${q.unit&&q.unit!=='%'?' '+q.unit:q.unit||''}`;}
/* 单道题：渲染题干、配图、作答区、提交；scored=false 用于变式（不计分、不换队） */
function qView(box,q,{scored=true,pts=5,head='',onJudge}={}){let pick=null,val='',done=false;
  const keyset=q.t==='r'?['1','2','3','4','5','6','7','8','9','0','.','∶','⌫','C']:['1','2','3','4','5','6','7','8','9','0','.','%','⌫','C'];
  box.innerHTML=`<div class="qv"><div class="qstem">${head}<span class="qtype">${QT[q.t]}</span>${q.q}</div>${q.pic?'<canvas class="qpic"></canvas>':''}
    ${q.t==='c'?`<div class="opts${q.o.every(o=>String(o).replace(/<[^>]+>/g,'').length<=9)?' c2':''}">${q.o.map((o,k)=>`<button class="opt" data-v="${k}"><i>${'ABCD'[k]}</i><span>${o}</span></button>`).join('')}</div>`
     :q.t==='tf'?`<div class="tfbtns"><button class="opt" data-v="1"><i>✓</i><span>正确</span></button><button class="opt" data-v="0"><i>✗</i><span>错误</span></button></div>`
     :`<div class="kscreen"><span>&nbsp;</span><span class="cur"></span>${q.unit?`<span class="unit">${q.unit}</span>`:''}</div><div class="kkeys w7">${keyset.map(k=>`<button data-k="${k}" class="${/[⌫C∶%]/.test(k)?'fn':''}">${k==='⌫'?'退格':k==='C'?'清空':k}</button>`).join('')}</div>`}
    <div class="row qrowbtn"><button class="btn pri sm" data-a="sub">提交</button></div><div class="status qst">${scored?`答对 +${pts}`:'变式练习不计分'}</div></div>`;
  const st=$('.qst',box),stem=$('.qstem',box),scr=$('.kscreen',box);
  if(q.pic){const cv=$('.qpic',box);requestAnimationFrame(()=>{const{ctx,w,h}=fitS(cv);q.pic(ctx,w,h);});}
  $$('.opt',box).forEach(b=>b.onclick=()=>{if(done)return;pick=q.t==='tf'?b.dataset.v==='1':+b.dataset.v;$$('.opt',box).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('click');});
  const show=()=>{if(scr)scr.firstChild.textContent=val||' ';};
  $$('.kkeys button',box).forEach(b=>b.onclick=()=>{if(done)return;const k=b.dataset.k;if(k==='⌫')val=val.slice(0,-1);else if(k==='C')val='';else if(k==='%'){if(!val.endsWith('%'))val+='%';}else if(val.length<12&&!val.endsWith('%'))val+=k;sfx('tick');show();});
  $('[data-a="sub"]',box).onclick=()=>{if(done)return;const v=q.t==='c'||q.t==='tf'?pick:val;if(v===null||v===''){setSt(st,'warn',q.t==='c'||q.t==='tf'?'先选一个答案':'先用键盘输入答案');return;}
    done=true;const{ok,msg}=judgeQ(q,v),tm=TEAM.cur;
    if(q.t==='c'||q.t==='tf')$$('.opt',box).forEach(b=>{const bv=q.t==='tf'?b.dataset.v==='1':+b.dataset.v;b.disabled=true;if(bv===q.a)b.classList.add('right');else if(bv===v)b.classList.add('wrong');});
    if(scr){scr.classList.add(ok?'right':'wrong');$('.cur',scr)?.remove();}
    $('.kkeys',box)?.classList.add('gone');// 判分后收起键盘，给解析腾出位置
    $('[data-a="sub"]',box).disabled=true;
    if(scored){if(ok){teamAdd(pts,tm);sfx('ok');setSt(st,'ok',`<b>${tname(tm)}答对 +${pts}</b>　${msg}${q.w}`);}else{sfx('bad');setSt(st,'bad',`<b>${tname(tm)}答错，不加分</b>　${msg}正确答案：<b>${ansText(q)}</b>。${q.w}`);}teamNext();}
    else{sfx(ok?'ok':'bad');setSt(st,ok?'ok':'bad',`<b>${ok?'巩固成功！':'还没掌握'}</b>　${msg}${ok?'':`正确答案：<b>${ansText(q)}</b>。`}${q.w}`);}
    onJudge&&onJudge(ok,v);};
  return{stem,row:$('.qrowbtn',box),get done(){return done;},fill(v){if(done||!scr)return false;val=String(v).slice(0,12);show();sfx('pop');return true;}};}
/* 一组题：进度格 + 逐题作答；答错的题题干可点开变式，进度格上答错的格子也能再点开 */
function qPanel(box,list,{pts=5,src='',onJudge}={}){let i=0,view=null;const res=[];
  function render(){const q=list[i];box.innerHTML=`<div class="kprog">${list.map((_,k)=>`<i class="${res[k]===true?'ok':res[k]===false?'no':k===i?'cur':''}" data-k="${k}" title="${res[k]===false?'点开变式':''}"></i>`).join('')}</div><div class="qpb"></div>`;
    $$('.kprog i.no',box).forEach(p=>{p.style.cursor='pointer';p.onclick=()=>VARS.open(list[+p.dataset.k],`${src} 第 ${+p.dataset.k+1} 题`);});
    const v=view=qView($('.qpb',box),q,{pts:q.pts||pts,head:`<b class="qno">${i+1}/${list.length}</b>`,onJudge:(ok)=>{res[i]=ok;if(!ok&&q.v)VARS.arm(v.stem,q,`${src} 第 ${i+1} 题`);
        const pip=$$('.kprog i',box)[i];pip.className=ok?'ok':'no';if(!ok){pip.style.cursor='pointer';pip.onclick=()=>VARS.open(q,`${src} 第 ${i+1} 题`);}onJudge&&onJudge(ok,q,i);}});
    const nx=document.createElement('button');nx.className='btn sm';nx.textContent=i<list.length-1?'下一题':'从头再做';v.row.appendChild(nx);
    nx.onclick=()=>{if(i<list.length-1)i++;else{i=0;res.length=0;}render();sfx('whoosh');};}
  render();return{reset(){i=0;res.length=0;render();},fill:v=>view.fill(v)};}
/* 变式弹窗：只有答错后，老师点“原题”才弹出；3 道变式依次做，不计分；小结页统计 */
const VARS=(()=>{const log=[];let pop,cur=null,k=0;
  function ensure(){if(pop)return;pop=document.createElement('div');pop.className='varpop';
    pop.innerHTML=`<div class="vcard"><div class="vhead"><b class="hand">变式巩固</b><span class="vn"></span><button class="btn sm vx">关闭</button></div><div class="vsrc"></div><div class="vbody"></div>
      <div class="row vfoot"><span class="vdots"></span><button class="btn sm vnext">下一道变式 ▶</button></div></div>`;
    $('#app').appendChild(pop);$('.vx',pop).onclick=close;pop.addEventListener('click',e=>{if(e.target===pop)close();});$('.vnext',pop).onclick=()=>{if(cur&&k<cur.q.v.length-1){k++;show();sfx('whoosh');}};
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pop.classList.contains('on'))close();});
    // 翻页时关闭
    const mo=new MutationObserver(ms=>{if(ms.some(m=>m.target.classList.contains('slide')&&!m.target.classList.contains('active')))close();});$$('.slide').forEach(sl=>mo.observe(sl,{attributes:true,attributeFilter:['class']}));}
  function entry(q,src){let e=log.find(x=>x.q===q);if(!e){e={q,src,tried:new Set(),ok:new Set()};log.push(e);}return e;}
  function show(){const e=cur,vq=e.q.v[k];$('.vn',pop).textContent=`第 ${k+1} / ${e.q.v.length} 道`;$('.vsrc',pop).innerHTML=`原题：${e.src}`;
    $('.vdots',pop).innerHTML=e.q.v.map((_,j)=>`<i class="${e.ok.has(j)?'ok':e.tried.has(j)?'no':j===k?'cur':''}"></i>`).join('');
    $('.vnext',pop).disabled=k>=e.q.v.length-1;
    qView($('.vbody',pop),vq,{scored:false,head:'',onJudge:ok=>{e.tried.add(k);if(ok){e.ok.add(k);FX.burst(innerWidth/2,innerHeight/2,18,[CG,CA]);}
      $('.vdots',pop).innerHTML=e.q.v.map((_,j)=>`<i class="${e.ok.has(j)?'ok':e.tried.has(j)?'no':j===k?'cur':''}"></i>`).join('');}});}
  function open(q,src){if(!q||!q.v||!q.v.length)return;ensure();cur=entry(q,src);k=Math.min(cur.tried.size,q.v.length-1);show();pop.classList.add('on');sfx('pop');}
  function close(){pop&&pop.classList.remove('on');}
  function arm(el,q,src){if(!q.v||!el)return;entry(q,src);el.classList.add('armed');if(!$('.vbadge',el)){const b=document.createElement('span');b.className='vbadge';b.textContent='答错了 · 点题目做变式';el.appendChild(b);}
    el.onclick=()=>open(q,src);}
  function disarm(el){if(!el)return;el.classList.remove('armed');$('.vbadge',el)?.remove();el.onclick=null;}
  return{open,arm,disarm,close,log};})();
