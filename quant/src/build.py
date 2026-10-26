#!/usr/bin/env python3
"""构建 quant/index.html —— 第四单元 课题3 物质组成的表示（物质组成的定量认识，课时3，实验室控制台风）。
用法（在仓库根目录）：python3 quant/src/build.py
- 拔河角色精灵图在 assets/（KayKit Adventurers，CC0），由 blender/render_all.py 用 Blender 渲染、再裁切打包成 WebP。
- 翻页、积分、音效、特效框架从 symbols/index.html 抽取；本课源文件都在 quant/src/。
- fonts.css 是按用字裁剪后的内嵌字体；改了文字后用 .claude/skills/interactive-courseware/scripts/font_subset.py 重新生成
  （需要 fonttools、brotli 和 @fontsource 字体包；环境不具备时沿用现有 fonts.css，个别新字会回退到系统字体）。"""
import sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
pf=os.path.join(ROOT,'quant','src');src=os.path.join(ROOT,'symbols','index.html');out=os.path.join(ROOT,'quant','index.html')
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
  // 控制台背景：石墨黑底、六边形网格、缓慢漂浮的数据粒子与扫描光带
  const cv=$('#bg');let sw=0,sh=0,t=0,pts=[];const off=document.createElement('canvas');
  function paint(){const{ctx,w,h}=fit(cv);sw=innerWidth;sh=innerHeight;off.width=cv.width;off.height=cv.height;const o=off.getContext('2d');o.setTransform(cv.width/w,0,0,cv.height/h,0,0);
    const g=o.createRadialGradient(w*.5,h*.4,Math.min(w,h)*.1,w*.5,h*.5,Math.max(w,h)*.8);g.addColorStop(0,'#0f1822');g.addColorStop(1,'#05080c');o.fillStyle=g;o.fillRect(0,0,w,h);
    const r=26,dx=r*Math.sqrt(3),dy=r*1.5;o.strokeStyle='rgba(63,216,255,.05)';o.lineWidth=1;
    for(let y=-r,row=0;y<h+r;y+=dy,row++)for(let x=(row%2?dx/2:0)-dx;x<w+dx;x+=dx){o.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;o.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}o.closePath();o.stroke();}
    pts=[...Array(46)].map((_,i)=>({x:Math.random()*w,y:Math.random()*h,v:6+Math.random()*16,s:['12','16','14','1','32','40','%','∶','Mr','×'][i%10],a:.05+Math.random()*.08}));}
  function tick(dt){t+=dt||0;if(innerWidth!==sw||innerHeight!==sh)paint();const{ctx,w,h}=fit(cv);ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(off,0,0);ctx.setTransform(cv.width/w,0,0,cv.height/h,0,0);
    if(LOW)return;ctx.font='700 14px "Noto Sans SC",sans-serif';pts.forEach(p=>{p.y-=p.v*(dt||0);if(p.y<-20){p.y=h+20;p.x=Math.random()*w;}ctx.fillStyle=`rgba(57,255,136,${p.a})`;ctx.fillText(p.s,p.x,p.y);});
    const sy=(t*60)%(h+200)-100,sg=ctx.createLinearGradient(0,sy-60,0,sy+60);sg.addColorStop(0,'rgba(63,216,255,0)');sg.addColorStop(.5,'rgba(63,216,255,.035)');sg.addColorStop(1,'rgba(63,216,255,0)');ctx.fillStyle=sg;ctx.fillRect(0,sy-60,w,120);}
  return{tick};
})();

"""
js_head=js_head.replace(bg_old,BG)
# 公共库里的径向光点函数也叫 glow，会被 core.js 的文字发光 glow 覆盖：改名为 glowDot
import re as _re
def _dot(x):return _re.sub(r'\bglow\((?=ctx,(?:x|p\.x),)','glowDot(',x.replace('function glow(ctx,x,y,r,col','function glowDot(ctx,x,y,r,col'))
js_head=_dot(js_head)
js_deck=_dot(js_deck)
assert 'const dt=Math.min(.05,(now-last)/1000);' in js_deck
js_deck=js_deck.replace('const dt=Math.min(.05,(now-last)/1000);','const dt=Math.max(0,Math.min(.05,(now-last)/1000));')
g_old="if(e.target.closest('canvas,input,.gal,.bins,.items'))return;"
assert g_old in js_deck
js_deck=js_deck.replace(g_old,"if(e.target.closest('canvas,input,.gal,.bins,.items,.ttray,.notepop,.kkeys,.dline'))return;")
rd=lambda f:open(os.path.join(pf,f),encoding='utf-8').read()
head=S[:S.index('<style>')].replace('<title>元素符号与元素周期表</title>','<title>物质组成的定量认识</title>')
import re,subprocess
head=re.sub(r'<link[^>]*fonts\.(googleapis|gstatic)[^>]*>\n?','',head)
assert '<title>物质组成的定量认识</title>' in head and 'googleapis' not in head
FCSS=os.path.join(pf,'fonts.css')
FONT_DIR=os.environ.get('FONT_DIR')
if FONT_DIR and os.path.isdir(FONT_DIR):
    subprocess.run([sys.executable,os.path.join(ROOT,'.claude','skills','interactive-courseware','scripts','font_subset.py')]+[os.path.join(pf,f) for f in os.listdir(pf) if f.endswith(('.js','.html'))]+[src,'-o',FCSS],check=True,env=dict(os.environ))
import base64,json
A=os.path.join(pf,'assets')
SPRJS='const SPR={'+','.join(f'{n}:"data:image/webp;base64,'+base64.b64encode(open(os.path.join(A,n+'.webp'),'rb').read()).decode()+'"' for n in ['Knight','Rogue','Barbarian','Mage'])+'};\nconst SMETA='+open(os.path.join(A,'meta.json')).read()+';\n'
JS=['fit.js','icons.js','core.js','p1.js','p2.js','p3.js','p4.js']
# 站酷快乐体不负责数字、拉丁字母和运算符号（它的“0”像方块）：从它的 unicode-range 里去掉，浏览器自动改用思源黑体
def zcool_no_digits(css):
    def fix(m):
        b=m.group(0)
        if 'ZCOOL' not in b:return b
        b=b.replace('U+20-7E','U+20-27,U+2A,U+2C-2F,U+3A-3C,U+3E-40,U+5B-60,U+7B-7E').replace(',U+D7,',',').replace(',U+2212','')
        return b
    return re.sub(r'@font-face\{[^}]*\}',fix,css)
html=(head+'<style>'+zcool_no_digits(rd('fonts.css'))+rd('quant.css')+'</style>\n</head>\n<body>\n<canvas id="bg" aria-hidden="true"></canvas>\n<div class="prog" id="prog"></div>\n'
  +'<div id="app">\n<main id="deck">\n'+rd('quant.html')+dock.replace('<div id="flash">','</div>\n<div id="flash">')+'<script>\n'
  +js_head+SPRJS+''.join(rd(f) for f in JS if os.path.exists(os.path.join(pf,f)))+js_deck+'</script>\n</body>\n</html>\n')
open(out,'w',encoding='utf-8').write(html)
print('written',len(html))
