// 从本地运行的 LPC 角色生成器（npx vite --port 5179）导出“按动作拆分”的 ZIP 和署名文本。
// 用法：node export_lpc.js "<网址 hash，不含 #>" out.zip   → out.zip（standard/*.png、custom/*_128.png）+ out_credits.txt
const cp=require('child_process');const { chromium } = require(cp.execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:1400},acceptDownloads:true});
await p.goto('http://127.0.0.1:5179/#'+process.argv[2]);await p.waitForTimeout(10000);
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:120000}),p.click('text=ZIP: Split by animation')]);await dl.saveAs(process.argv[3]);
const [d2]=await Promise.all([p.waitForEvent('download',{timeout:60000}),p.click('text=Credits (TXT)')]);await d2.saveAs(process.argv[3].replace('.zip','_credits.txt'));
await b.close();})();
