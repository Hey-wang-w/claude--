// 多分辨率排版审计：逐页报告纵向溢出、文字截断、尺寸为 0 的图和控制台报错。
// 用法：node audit_layout.js <课件.html 的绝对或相对路径> [--gl] [--sizes=1000x650,1366x768]
const path=require('path');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const file=path.resolve(process.argv[2]);const GL=process.argv.includes('--gl');
const sz=(process.argv.find(a=>a.startsWith('--sizes='))||'--sizes=1000x650,1024x768,1280x720,1366x768,1920x1080,2560x1080').slice(8).split(',').map(s=>s.split('x').map(Number));
(async()=>{
  const b=await chromium.launch({args:GL?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']:[]});const out=[];
  for(const [vw,vh] of sz){
    const p=await b.newPage({viewport:{width:vw,height:vh}});const errs=[];
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED/.test(m.text()))errs.push(m.text())});
    await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
    await p.goto('file://'+file);await p.waitForTimeout(GL?3000:900);
    const n=await p.$$eval('.slide',s=>s.length);
    for(let i=0;i<n;i++){
      await p.waitForTimeout(GL?1800:900);
      const r=await p.evaluate(()=>{
        const s=document.querySelector('.slide.active'),id=s.dataset.id,issues=[];
        const vis=e=>{const st=getComputedStyle(e);return st.display!=='none'&&st.visibility!=='hidden'&&!e.closest('[hidden]')};
        s.querySelectorAll('svg,canvas,img').forEach(e=>{if(!vis(e))return;const b=e.getBoundingClientRect();if(b.width<4||b.height<4)issues.push(`zero-size ${e.tagName}`);});
        s.querySelectorAll('button,.card,.panel,.status,h2,h3,p,td,th').forEach(e=>{if(!vis(e))return;if(e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX!=='auto')issues.push(`h-clip <${e.tagName.toLowerCase()} class="${e.className}"> "${(e.innerText||'').slice(0,20).replace(/\n/g,' ')}"`);});
        const scroll=s.scrollHeight-s.clientHeight;if(s.scrollWidth>s.clientWidth+1)issues.push('page h-overflow');
        return{id,scroll,issues};});
      out.push(`${vw}x${vh} ${String(i+1).padStart(2)} ${r.id.padEnd(8)} scroll=${r.scroll}${r.issues.length?' | '+[...new Set(r.issues)].slice(0,5).join(' ; '):''}`);
      await p.keyboard.press('ArrowRight');
    }
    if(errs.length)out.push(`${vw}x${vh} ERRORS: ${[...new Set(errs)].join(' | ')}`);
    await p.close();
  }
  console.log(out.join('\n'));await b.close();
})();
