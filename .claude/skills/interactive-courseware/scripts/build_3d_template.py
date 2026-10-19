#!/usr/bin/env python3
"""3D 单文件课件构建示例（水资源课的实际构建脚本，只在老师要求 3D 时参考；2D 课件用 build_2d_template.py）。

用法：python3 build_template.py symbols/index.html <输出 index.html> <源目录> <three-bundle.js> <素材目录>
- 从 symbols/index.html 抽取共享的 head、工具与积分（js_head）、翻页框架（js_deck）、底栏（dock）；
- 替换背景 BG 模块，并把主循环的 dt 限制为不小于 0；
- 源目录里放本课的 water.css、water.html、fit.js、icons.js、engine3d.js、scenes.js（新课件按需改名）；
- 素材目录：glb/*.glb，以及 *.jpg / *.png 贴图，全部转成 base64 写进 ASSET；
- 整体包进 #app（固定画布缩放），three.js 打包文件单独放在一个 <script> 里。
"""
import sys,os
src,out,w2,three,assets=sys.argv[1:6]
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
  const cv=$('#bg');let t=0;const ms=Array.from({length:60},()=>({x:Math.random(),y:Math.random(),r:.6+Math.random()*1.8,s:.006+Math.random()*.014,ph:Math.random()*6}));
  function tick(dt){t+=dt;const{ctx,w,h}=fit(cv);ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<7;i++){const x=w*(.06+i*.15)+Math.sin(t*.12+i*1.7)*w*.03,sp=60+i*14;const g=ctx.createLinearGradient(0,0,0,h*.95);g.addColorStop(0,'rgba(120,220,255,.075)');g.addColorStop(1,'rgba(120,220,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-14,0);ctx.lineTo(x+14+i*3,0);ctx.lineTo(x+sp*2.2,h);ctx.lineTo(x+sp*.6,h);ctx.closePath();ctx.fill();}
    const N=LOW?15:ms.length;for(let i=0;i<N;i++){const m=ms[i];m.y-=m.s*dt;if(m.y<-.02){m.y=1.02;m.x=Math.random();}const x=m.x*w+Math.sin(t*.6+m.ph)*14,y=m.y*h;
      ctx.fillStyle=`rgba(170,235,255,${.18+.15*Math.sin(t+m.ph)})`;ctx.beginPath();ctx.arc(x,y,m.r,0,TAU);ctx.fill();}
    ctx.globalCompositeOperation='source-over';}
  return{tick};
})();

"""
js_head=js_head.replace(bg_old,BG)
assert 'const dt=Math.min(.05,(now-last)/1000);' in js_deck
js_deck=js_deck.replace('const dt=Math.min(.05,(now-last)/1000);','const dt=Math.max(0,Math.min(.05,(now-last)/1000));')
rd=lambda f:open(os.path.join(w2,f),encoding='utf-8').read()
three_js=open(three,encoding='utf-8').read()
import base64,json
G={f[:-4]:base64.b64encode(open(os.path.join(assets,'glb',f),'rb').read()).decode() for f in sorted(os.listdir(os.path.join(assets,'glb')))}
TX={f.rsplit('.',1)[0]:base64.b64encode(open(os.path.join(assets,f),'rb').read()).decode() for f in os.listdir(assets) if f.endswith(('.jpg','.png'))}
ASSET='const ASSET='+json.dumps({'glb':G,'tex':TX})+';\n'
head=S[:S.index('<style>')].replace('<title>元素符号与元素周期表</title>','<title>水资源及其利用</title>')
head=head.replace('family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;700&family=Fredoka:wght@500;700&family=JetBrains+Mono:wght@500;700',
                  'family=Noto+Serif+SC:wght@700;900&family=Noto+Sans+SC:wght@400;500;700&family=Outfit:wght@500;700')
assert '<title>水资源及其利用</title>' in head and 'Outfit' in head
html=(head+'<style>'+rd('water.css')+'</style>\n</head>\n<body>\n<canvas id="bg" aria-hidden="true"></canvas>\n<div class="prog" id="prog"></div>\n'
  +'<div id="app">\n<main id="deck">\n'+rd('water.html')+dock.replace('<div id="flash">','</div>\n<div id="flash">')+'<script>\n/* three.js r160 + GLTFLoader + RoomEnvironment — MIT License, Copyright 2010-2023 Three.js Authors */\n'+three_js+'\n</script>\n<script>\n'+ASSET+'</script>\n<script>\n'
  +js_head+rd('fit.js')+rd('icons.js')+rd('engine3d.js')+rd('scenes.js')+js_deck+'</script>\n</body>\n</html>\n')
open(out,'w',encoding='utf-8').write(html)
print('written',len(html))
