// 逐页截图并拼一张总览（总览需要 python3 + Pillow）。
// 用法：node shoot_pages.js <课件.html> <输出目录> [1366x768] [--gl]
const path=require('path'),fs=require('fs'),cp=require('child_process');
const { chromium } = require(cp.execSync('npm root -g').toString().trim()+'/playwright');
const file=path.resolve(process.argv[2]),dir=path.resolve(process.argv[3]||'shots');const GL=process.argv.includes('--gl');
const [vw,vh]=(process.argv.find(a=>/^\d+x\d+$/.test(a))||'1366x768').split('x').map(Number);fs.mkdirSync(dir,{recursive:true});
(async()=>{const b=await chromium.launch({args:GL?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']:[]});
  const p=await b.newPage({viewport:{width:vw,height:vh}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());await p.goto('file://'+file);await p.waitForTimeout(GL?4000:1200);
  const n=await p.$$eval('.slide',s=>s.length);const files=[];
  for(let i=0;i<n;i++){await p.waitForTimeout(GL?3500:1200);const f=path.join(dir,`p${String(i+1).padStart(2,'0')}.png`);await p.screenshot({path:f});files.push(f);await p.keyboard.press('ArrowRight');}
  await b.close();console.log('errors',errs);
  try{cp.execSync(`python3 -c "
from PIL import Image
import sys
fs=sys.argv[1:];W=640;H=int(W*${vh}/${vw});cols=3;rows=(len(fs)+cols-1)//cols
m=Image.new('RGB',(W*cols,H*rows))
for i,f in enumerate(fs):m.paste(Image.open(f).resize((W,H)),((i%cols)*W,(i//cols)*H))
m.save('${path.join(dir,'overview.png')}')" ${files.join(' ')}`);console.log('overview',path.join(dir,'overview.png'));}catch(e){console.log('overview skipped:',e.message.slice(0,80));}
})();
