#!/usr/bin/env python3
"""构建 valence/index.html —— 第四单元 课题3 物质组成的表示（化合价，课时2，黑板粉笔风）。
用法（在仓库根目录）：python3 valence/src/build.py
- 翻页、积分、音效、特效框架从 symbols/index.html 抽取；本课源文件都在 valence/src/。
- fonts.css 是按用字裁剪后的内嵌字体；改了文字后用 .claude/skills/interactive-courseware/scripts/font_subset.py 重新生成
  （需要 fonttools、brotli 和 @fontsource 字体包；环境不具备时沿用现有 fonts.css，个别新字会回退到系统字体）。"""
import sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
pf=os.path.join(ROOT,'valence','src');src=os.path.join(ROOT,'symbols','index.html');out=os.path.join(ROOT,'valence','index.html')
S=open(src,encoding='utf-8').read()
def between(a,b):
    i=S.index(a);j=S.index(b,i+len(a));return S[i:j]
js_head=between("(()=>{\n'use strict';","/* ================= 1 封面")
js_deck=between("/* ================= 翻页框架 ================= */","</script>")
dock=between("</main>\n","<script>")
dock=dock.replace('<span class="pg" id="pg">1 / 12</span>','<span class="pg" id="pg">1 / 11</span>').replace('建议用时合计约 46 分钟','建议用时合计约 45 分钟')
assert '1 / 11' in dock and '约 45 分钟' in dock
bg_old=between('const BG=(()=>{','const S={};')
BG=r"""const BG=(()=>{
  // 黑板：墨绿底色、擦痕、淡淡的旧粉笔字（只在窗口尺寸变化时重画）
  const cv=$('#bg');let sw=0,sh=0;
  function paint(){const{ctx,w,h}=fit(cv);sw=innerWidth;sh=innerHeight;
    const g=ctx.createRadialGradient(w*.5,h*.45,Math.min(w,h)*.1,w*.5,h*.5,Math.max(w,h)*.8);g.addColorStop(0,'#28443a');g.addColorStop(1,'#172a22');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    let s=5;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<(w*h)/1400;i++){ctx.fillStyle=`rgba(255,255,255,${.012+rnd()*.025})`;ctx.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2);}
    for(let i=0;i<14;i++){const x=rnd()*w,y=rnd()*h,r=80+rnd()*220;ctx.strokeStyle=`rgba(241,238,228,${.01+rnd()*.016})`;ctx.lineWidth=24+rnd()*36;ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y,r,rnd()*6,rnd()*6+1.2+rnd());ctx.stroke();}
    const F=['+1','−2','H₂O','Fe₂O₃','x = +5','NaCl','0','+3','CO₃²⁻','(+1)×2 + (−2) = 0','KClO₃','+7','OH⁻','Ca(OH)₂'];
    F.forEach((f,i)=>{ctx.save();ctx.translate(rnd()*w,rnd()*h);ctx.rotate((rnd()-.5)*.4);ctx.fillStyle='rgba(241,238,228,.05)';ctx.font=`400 ${Math.round(28+rnd()*40)}px "ZCOOL KuaiLe",sans-serif`;ctx.fillText(f,0,0);ctx.restore();});}
  function tick(){if(innerWidth!==sw||innerHeight!==sh)paint();}
  return{tick};
})();

"""
js_head=js_head.replace(bg_old,BG)
assert 'const dt=Math.min(.05,(now-last)/1000);' in js_deck
js_deck=js_deck.replace('const dt=Math.min(.05,(now-last)/1000);','const dt=Math.max(0,Math.min(.05,(now-last)/1000));')
g_old="if(e.target.closest('canvas,input,.gal,.bins,.items'))return;"
assert g_old in js_deck
js_deck=js_deck.replace(g_old,"if(e.target.closest('canvas,input,.gal,.bins,.items,.match,.ttray,.notepop'))return;")
rd=lambda f:open(os.path.join(pf,f),encoding='utf-8').read()
head=S[:S.index('<style>')].replace('<title>元素符号与元素周期表</title>','<title>化合价</title>')
import re,subprocess
head=re.sub(r'<link[^>]*fonts\.(googleapis|gstatic)[^>]*>\n?','',head)
assert '<title>化合价</title>' in head and 'googleapis' not in head
FCSS=os.path.join(pf,'fonts.css')
FONT_DIR=os.environ.get('FONT_DIR')
if FONT_DIR and os.path.isdir(FONT_DIR):
    subprocess.run([sys.executable,os.path.join(ROOT,'.claude','skills','interactive-courseware','scripts','font_subset.py')]+[os.path.join(pf,f) for f in os.listdir(pf) if f.endswith(('.js','.html'))]+[src,'-o',FCSS],check=True,env=dict(os.environ))
JS=['fit.js','icons.js','core.js','p1.js','pe.js','p2.js','p3.js','p4.js']
# 站酷快乐体不负责数字、拉丁字母和运算符号（它的“0”像方块）：从它的 unicode-range 里去掉，浏览器自动改用思源黑体
def zcool_no_digits(css):
    def fix(m):
        b=m.group(0)
        if 'ZCOOL' not in b:return b
        b=b.replace('U+20-7E','U+20-27,U+2A,U+2C-2F,U+3A-3C,U+3E-40,U+5B-60,U+7B-7E').replace(',U+D7,',',').replace(',U+2212','')
        return b
    return re.sub(r'@font-face\{[^}]*\}',fix,css)
html=(head+'<style>'+zcool_no_digits(rd('fonts.css'))+rd('valence.css')+'</style>\n</head>\n<body>\n<canvas id="bg" aria-hidden="true"></canvas>\n<div class="prog" id="prog"></div>\n'
  +'<div id="app">\n<main id="deck">\n'+rd('valence.html')+dock.replace('<div id="flash">','</div>\n<div id="flash">')+'<script>\n'
  +js_head+''.join(rd(f) for f in JS if os.path.exists(os.path.join(pf,f)))+js_deck+'</script>\n</body>\n</html>\n')
open(out,'w',encoding='utf-8').write(html)
print('written',len(html))
