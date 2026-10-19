#!/usr/bin/env python3
"""构建 formula/index.html —— 第四单元 课题3 物质组成的表示（化学式，课时1，浅色方格纸 + 贴纸风）。
用法（在仓库根目录）：python3 formula/src/build.py
- 翻页、积分、音效、特效框架从 symbols/index.html 抽取；本课源文件都在 formula/src/。
- fonts.css 是按用字裁剪后的内嵌字体；改了文字后用 .claude/skills/interactive-courseware/scripts/font_subset.py 重新生成
  （需要 fonttools、brotli 和 @fontsource 字体包；环境不具备时沿用现有 fonts.css，个别新字会回退到系统字体）。"""
import sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
pf=os.path.join(ROOT,'formula','src');src=os.path.join(ROOT,'symbols','index.html');out=os.path.join(ROOT,'formula','index.html')
S=open(src,encoding='utf-8').read()
def between(a,b):
    i=S.index(a);j=S.index(b,i+len(a));return S[i:j]
js_head=between("(()=>{\n'use strict';","/* ================= 1 封面")
js_deck=between("/* ================= 翻页框架 ================= */","</script>")
dock=between("</main>\n","<script>")
dock=dock.replace('<span class="pg" id="pg">1 / 12</span>','<span class="pg" id="pg">1 / 10</span>').replace('建议用时合计约 46 分钟','建议用时合计约 45 分钟')
assert '1 / 10' in dock and '约 45 分钟' in dock
bg_old=between('const BG=(()=>{','const S={};')
BG=r"""const BG=(()=>{
  // 方格纸底 + 缓慢漂浮的淡色化学式
  const cv=$('#bg');const F=['H2O','CO2','O2','NaCl','Fe3O4','P2O5','NH3','H2O2','KMnO4','MgO','N2','HgO','SO2','C15H22O5'];
  let s=11;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const items=F.map((f,i)=>({f,x:rnd(),y:rnd(),v:.004+rnd()*.006,a:(rnd()-.5)*.5,z:.6+rnd()*.8,c:['#ff7a5c','#1fb39f','#8a6cff','#1f9fd6','#ffb000'][i%5]}));
  const sub=t=>t.replace(/(\d+)/g,m=>m.split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[d]).join(''));
  let t=0;
  function tick(dt){t+=dt||0;const{ctx,w,h}=fit(cv);ctx.fillStyle='#f3f6fb';ctx.fillRect(0,0,w,h);
    const g=Math.max(18,Math.min(w,h)/32);ctx.strokeStyle='#dde6f2';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<w;x+=g){ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,h);}for(let y=0;y<h;y+=g){ctx.moveTo(0,y+.5);ctx.lineTo(w,y+.5);}ctx.stroke();
    items.forEach(it=>{const y=((it.y-t*it.v)%1+1)%1*(h+120)-60,x=it.x*w+Math.sin(t*.3+it.x*9)*20;ctx.save();ctx.translate(x,y);ctx.rotate(it.a);ctx.globalAlpha=.10;ctx.fillStyle=it.c;
      ctx.font=`700 ${Math.round(g*1.6*it.z)}px "Noto Sans SC",sans-serif`;ctx.textAlign='center';ctx.fillText(sub(it.f),0,0);ctx.restore();});}
  return{tick};
})();

"""
js_head=js_head.replace(bg_old,BG)
assert 'const dt=Math.min(.05,(now-last)/1000);' in js_deck
js_deck=js_deck.replace('const dt=Math.min(.05,(now-last)/1000);','const dt=Math.max(0,Math.min(.05,(now-last)/1000));')
g_old="if(e.target.closest('canvas,input,.gal,.bins,.items'))return;"
assert g_old in js_deck
js_deck=js_deck.replace(g_old,"if(e.target.closest('canvas,input,.gal,.bins,.items,.tray,[data-drag],.ecard'))return;")
rd=lambda f:open(os.path.join(pf,f),encoding='utf-8').read()
head=S[:S.index('<style>')].replace('<title>元素符号与元素周期表</title>','<title>化学式</title>')
import re,subprocess
head=re.sub(r'<link[^>]*fonts\.(googleapis|gstatic)[^>]*>\n?','',head)
assert '<title>化学式</title>' in head and 'googleapis' not in head
FCSS=os.path.join(pf,'fonts.css')
FONT_DIR=os.environ.get('FONT_DIR')
if FONT_DIR and os.path.isdir(FONT_DIR):
    subprocess.run([sys.executable,os.path.join(ROOT,'.claude','skills','interactive-courseware','scripts','font_subset.py')]+[os.path.join(pf,f) for f in os.listdir(pf) if f.endswith(('.js','.html'))]+[src,'-o',FCSS],check=True,env=dict(os.environ))
JS=['fit.js','icons.js','core.js','p1.js','p2.js','p3.js','p4.js']
html=(head+'<style>'+rd('fonts.css')+rd('formula.css')+'</style>\n</head>\n<body>\n<canvas id="bg" aria-hidden="true"></canvas>\n<div class="prog" id="prog"></div>\n'
  +'<div id="app">\n<main id="deck">\n'+rd('formula.html')+dock.replace('<div id="flash">','</div>\n<div id="flash">')+'<script>\n'
  +js_head+''.join(rd(f) for f in JS if os.path.exists(os.path.join(pf,f)))+js_deck+'</script>\n</body>\n</html>\n')
open(out,'w',encoding='utf-8').write(html)
print('written',len(html))
