#!/usr/bin/env python3
"""2D 单文件课件构建模板（取自 purify/src/build.py，新课件复制到 <课件>/src/build.py 后改目录名、页数和标题）。
原用途：构建 purify/index.html —— 第四单元 课题2 水的净化（实验记录本风）。
用法（在仓库根目录）：python3 purify/src/build.py
- 翻页、积分、音效、特效框架从 symbols/index.html 抽取；本课源文件都在 purify/src/。
- fonts.css 是按用字裁剪后的内嵌字体；改了文字后用 .claude/skills/interactive-courseware/scripts/font_subset.py 重新生成
  （需要 fonttools、brotli 和 @fontsource 字体包；环境不具备时沿用现有 fonts.css，个别新字会回退到系统字体）。"""
import sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
pf=os.path.join(ROOT,'purify','src');src=os.path.join(ROOT,'symbols','index.html');out=os.path.join(ROOT,'purify','index.html')
S=open(src,encoding='utf-8').read()
def between(a,b):
    i=S.index(a);j=S.index(b,i+len(a));return S[i:j]
js_head=between("(()=>{\n'use strict';","/* ================= 1 封面")
js_deck=between("/* ================= 翻页框架 ================= */","</script>")
dock=between("</main>\n","<script>")
dock=dock.replace('<span class="pg" id="pg">1 / 12</span>','<span class="pg" id="pg">1 / 13</span>').replace('建议用时合计约 46 分钟','建议用时合计约 45 分钟')
assert '1 / 13' in dock and '约 45 分钟' in dock
bg_old=between('const BG=(()=>{','const S={};')
BG=r"""const BG=(()=>{
  const cv=$('#bg');let sw=0,sh=0;
  function paint(){const{ctx,w,h}=fit(cv);sw=innerWidth;sh=innerHeight;
    const g=ctx.createRadialGradient(w/2,h*.45,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.75);g.addColorStop(0,'#f1e9db');g.addColorStop(1,'#ddcfb6');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<(w*h)/900;i++){const x=rnd()*w,y=rnd()*h,l=4+rnd()*14,a=rnd()*TAU;ctx.strokeStyle=`rgba(${rnd()<.5?'120,90,50':'255,255,255'},${.05+rnd()*.07})`;ctx.lineWidth=.6+rnd()*.6;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);ctx.stroke();}}
  function tick(){if(innerWidth!==sw||innerHeight!==sh)paint();}
  return{tick};
})();

"""
js_head=js_head.replace(bg_old,BG)
assert 'const dt=Math.min(.05,(now-last)/1000);' in js_deck
js_deck=js_deck.replace('const dt=Math.min(.05,(now-last)/1000);','const dt=Math.max(0,Math.min(.05,(now-last)/1000));')
rd=lambda f:open(os.path.join(pf,f),encoding='utf-8').read()
head=S[:S.index('<style>')].replace('<title>元素符号与元素周期表</title>','<title>水的净化</title>')
import re,subprocess
head=re.sub(r'<link[^>]*fonts\.(googleapis|gstatic)[^>]*>\n?','',head)
assert '<title>水的净化</title>' in head and 'googleapis' not in head
FCSS=os.path.join(pf,'fonts.css')
FONT_DIR=os.environ.get('FONT_DIR')
if FONT_DIR and os.path.isdir(FONT_DIR):
    subprocess.run([sys.executable,os.path.join(ROOT,'.claude','skills','interactive-courseware','scripts','font_subset.py')]+[os.path.join(pf,f) for f in os.listdir(pf) if f.endswith(('.js','.html'))]+[src,'-o',FCSS],check=True,env=dict(os.environ))
JS=['fit.js','icons.js','draw.js','p1.js','p2.js','p3.js','p4.js']
html=(head+'<style>'+rd('fonts.css')+rd('purify.css')+'</style>\n</head>\n<body>\n<canvas id="bg" aria-hidden="true"></canvas>\n<div class="prog" id="prog"></div>\n'
  +'<div id="app">\n<main id="deck">\n'+rd('purify.html')+dock.replace('<div id="flash">','</div>\n<div id="flash">')+'<script>\n'
  +js_head+''.join(rd(f) for f in JS if os.path.exists(os.path.join(pf,f)))+js_deck+'</script>\n</body>\n</html>\n')
open(out,'w',encoding='utf-8').write(html)
print('written',len(html))
