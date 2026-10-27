#!/usr/bin/env python3
"""构建 review4/index.html —— 第四单元 自然界的水 复习课（浅色贴纸版面 + 像素对战）。
用法（在仓库根目录）：python3 review4/src/build.py
- 对战角色是 LPC 像素精灵：sprites/make_atlas.py 把生成器导出的动作表裁成 heroes.png + heroes.json，构建时以 base64 内嵌。
- 翻页、积分、音效、特效框架从 symbols/index.html 抽取；本课源文件都在 review4/src/。
- fonts.css 是按用字裁剪后的内嵌字体；改了文字后用 .claude/skills/interactive-courseware/scripts/font_subset.py 重新生成
  （需要 fonttools、brotli 和 @fontsource 字体包；环境不具备时沿用现有 fonts.css，个别新字会回退到系统字体）。"""
import sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
pf=os.path.join(ROOT,'review4','src');src=os.path.join(ROOT,'symbols','index.html');out=os.path.join(ROOT,'review4','index.html')
S=open(src,encoding='utf-8').read()
def between(a,b):
    i=S.index(a);j=S.index(b,i+len(a));return S[i:j]
js_head=between("(()=>{\n'use strict';","/* ================= 1 封面")
js_deck=between("/* ================= 翻页框架 ================= */","</script>")
dock=between("</main>\n","<script>")
dock=dock.replace('<span class="pg" id="pg">1 / 12</span>','<span class="pg" id="pg">1 / 13</span>').replace('建议用时合计约 46 分钟','建议用时合计约 45 分钟')
assert '1 / 13' in dock and '约 45 分钟' in dock
bg_old=between('const BG=(()=>{','const S={};')
BG=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"bg.js"),encoding="utf-8").read()
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
js_deck=js_deck.replace(g_old,"if(e.target.closest('canvas,input,.gal,.bins,.items,.ttray,.notepop,.kkeys,.ckeys,.varpop,.mapw,.cardtray'))return;")
rd=lambda f:open(os.path.join(pf,f),encoding='utf-8').read()
head=S[:S.index('<style>')].replace('<title>元素符号与元素周期表</title>','<title>第四单元复习</title>')
import re,subprocess
head=re.sub(r'<link[^>]*fonts\.(googleapis|gstatic)[^>]*>\n?','',head)
assert '<title>第四单元复习</title>' in head and 'googleapis' not in head
FCSS=os.path.join(pf,'fonts.css')
FONT_DIR=os.environ.get('FONT_DIR')
if FONT_DIR and os.path.isdir(FONT_DIR):
    subprocess.run([sys.executable,os.path.join(ROOT,'.claude','skills','interactive-courseware','scripts','font_subset.py')]+[os.path.join(pf,f) for f in os.listdir(pf) if f.endswith(('.js','.html'))]+[src,'-o',FCSS],check=True,env=dict(os.environ))
JS=['fit.js','icons.js','core.js','quiz.js','drag.js','vec.js','pix.js','hero.js','qbank.js','p1.js','p2.js','p3.js','p4.js']
# 站酷快乐体不负责数字、拉丁字母和运算符号（它的“0”像方块）：从它的 unicode-range 里去掉，浏览器自动改用思源黑体
def zcool_no_digits(css):
    def fix(m):
        b=m.group(0)
        if 'ZCOOL' not in b:return b
        b=b.replace('U+20-7E','U+20-27,U+2A,U+2C-2F,U+3A-3C,U+3E-40,U+5B-60,U+7B-7E').replace(',U+D7,',',').replace(',U+2212','')
        return b
    return re.sub(r'@font-face\{[^}]*\}',fix,css)
html=(head+'<style>'+zcool_no_digits(rd('fonts.css'))+rd('review4.css')+'</style>\n</head>\n<body>\n<canvas id="bg" aria-hidden="true"></canvas>\n<div class="prog" id="prog"></div>\n'
  +'<div id="app">\n<main id="deck">\n'+rd('review4.html')+dock.replace('<div id="flash">','</div>\n<div id="flash">')+'<script>\n'
  +js_head+''.join(rd(f) for f in JS if os.path.exists(os.path.join(pf,f)))+js_deck+'</script>\n</body>\n</html>\n')
import base64,json as _json
_sp=os.path.join(pf,'sprites')
html=html.replace('__HEROES_PNG__',base64.b64encode(open(os.path.join(_sp,'heroes.png'),'rb').read()).decode()).replace('__HEROES_JSON__',_json.dumps(_json.load(open(os.path.join(_sp,'heroes.json'))),separators=(',',':')))
assert '__HEROES_' not in html
open(out,'w',encoding='utf-8').write(html)
print('written',len(html))
