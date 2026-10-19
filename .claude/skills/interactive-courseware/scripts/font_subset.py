#!/usr/bin/env python3
"""按课件实际用到的字符裁剪字体，输出内嵌 @font-face（base64 woff2）。
用法：font_subset.py <用字来源文件...> -o fonts.css"""
import sys,io,base64,re
from fontTools import subset
from fontTools.ttLib import TTFont
import os
F=os.environ.get('FONT_DIR','fonts/')  # npm pack @fontsource/zcool-kuaile @fontsource/noto-sans-sc 后解压到这里
ZC=F+'fontsource-zcool-kuaile-5.3.0/package/files/zcool-kuaile-'
NS=F+'fontsource-noto-sans-sc-5.3.1/package/files/noto-sans-sc-'
args=sys.argv[1:];out=args[args.index('-o')+1];srcs=[a for a in args if a not in('-o',out)]
text=''.join(open(p,encoding='utf-8').read() for p in srcs)
chars=set(text)|set(chr(c) for c in range(32,127))|set('，。、；：？！“”‘’（）《》【】—…·→←↑↓℃①②③④⑤⑥✓✗×÷＋－＝％')
chars={c for c in chars if ord(c)>=32}
def sub(path,family,weight):
    f=TTFont(path);cmap=f.getBestCmap();have=[c for c in chars if ord(c) in cmap]
    if not have:return ''
    o=subset.Options();o.flavor='woff2';o.layout_features=['*'];o.name_IDs=['*'];o.notdef_outline=True
    s=subset.Subsetter(o);s.populate(unicodes=[ord(c) for c in have]);s.subset(f)
    b=io.BytesIO();f.flavor='woff2';f.save(b)
    cps=sorted(ord(c) for c in have);rng=[];a=p=cps[0]
    for c in cps[1:]:
        if c==p+1:p=c;continue
        rng.append((a,p));a=p=c
    rng.append((a,p));ur=','.join(f'U+{x:X}' if x==y else f'U+{x:X}-{y:X}' for x,y in rng)
    sys.stderr.write(f'{family} {weight} {path.rsplit("/",1)[1]}: {len(have)} glyphs, {len(b.getvalue())//1024} KB\n')
    return f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:block;src:url(data:font/woff2;base64,{base64.b64encode(b.getvalue()).decode()}) format('woff2');unicode-range:{ur}}}\n"
css=''
for part in['latin','chinese-simplified']:
    css+=sub(f'{ZC}{part}-400-normal.woff2','ZCOOL KuaiLe',400)
    for wt in(400,700):css+=sub(f'{NS}{part}-{wt}-normal.woff2','Noto Sans SC',wt)
open(out,'w').write('/* 字体：站酷快乐体（OFL）、思源黑体 Noto Sans SC（OFL），按本课件用字裁剪后内嵌 */\n'+css)
