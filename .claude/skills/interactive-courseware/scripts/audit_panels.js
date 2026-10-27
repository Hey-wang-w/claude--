// 题目卡挤占审计：逐题故意答错（让解析最长），检查右侧面板是否溢出、与下面的卡片（如计算器）重叠、超出页面。
// 用法：node audit_panels.js <课件.html> '{"题目卡容器id":页码,...}' [1600x900]
// 例：node audit_panels.js review4/index.html '{"rsQ":3,"lbQ":10}' 1366x768   （容器是 qPanel 的盒子，页码从 1 开始）
const path=require('path'),cp=require('child_process');const { chromium } = require(cp.execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const file=path.resolve(process.argv[2]),IDS=JSON.parse(process.argv[3]);const [vw,vh]=(process.argv[4]||'1600x900').split('x').map(Number);
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:vw,height:vh}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.waitForTimeout(800);let cur=1,bad=0;
  for(const [id,pg] of Object.entries(IDS).sort((a,b)=>a[1]-b[1])){while(cur<pg){await p.keyboard.press('ArrowRight');cur++;await p.waitForTimeout(120);}await p.waitForTimeout(500);
    const n=await p.$$eval(`#${id} .kprog i`,x=>x.length);
    for(let i=0;i<n;i++){const opts=await p.$$(`#${id} .opt`);if(opts.length)await opts[opts.length-1].click();else await p.click(`#${id} .kkeys button[data-k="7"]`);
      await p.click(`#${id} button[data-a="sub"]`);await p.waitForTimeout(250);
      const r=await p.evaluate(id=>{const box=document.getElementById(id),panel=box.closest('.panel'),side=panel.parentElement,pr=panel.getBoundingClientRect(),sr=side.getBoundingClientRect();
        const maxB=Math.max(...[...box.querySelectorAll('*')].map(e=>e.getBoundingClientRect()).filter(r=>r.height>0).map(r=>r.bottom));
        const ov=[...side.children].filter(e=>e!==panel).map(e=>e.getBoundingClientRect()).some(s=>!(s.bottom<=pr.top+1||s.top>=pr.bottom-1));
        const fb=document.querySelector('.slide.active .frame').getBoundingClientRect().bottom;
        return{over:Math.round(maxB-pr.bottom),outSide:Math.round(pr.bottom-sr.bottom),ov,outFrame:Math.round(pr.bottom-fb)};},id);
      if(r.over>-8||r.outSide>1||r.ov||r.outFrame>1){bad++;console.log('挤占',id,'第'+(i+1)+'题',JSON.stringify(r));}
      const nx=await p.$(`#${id} .qrowbtn .btn:not(.pri)`);if(nx&&i<n-1)await nx.click();await p.waitForTimeout(150);}}
  console.log(bad?`共 ${bad} 处问题`:'没有挤占','报错',errs);await b.close();})();
