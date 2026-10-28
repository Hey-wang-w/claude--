"""把 LPC 生成器导出的角色动作表裁成一张小图集（只保留对战需要的朝向和动作）。
用法：python3 make_atlas.py   （需要 Pillow；输出 heroes.png 与 heroes.json）
素材来自 Universal LPC Spritesheet Character Generator，授权与作者见 lpc/*/CREDITS.txt。"""
import json,os
from PIL import Image
H=os.path.dirname(os.path.abspath(__file__))
# (英雄, 动作名, 文件, 帧尺寸, 行号)；炎刃朝右（第 3 行），澜音朝左（第 1 行）；hurt 只有一行（正面倒地）
SPEC=[('fire','idle','combat',64,3),('fire','slash','slash_128',128,3),('fire','backslash','backslash_128',128,3),('fire','halfslash','halfslash_128',128,3),
      ('fire','hurt','hurt',64,0),('fire','win','emote',64,3),('fire','jump','jump',64,3),
      ('water','walk','walk',64,1),('water','cast','spellcast',64,1),('water','thrust','thrust',64,1),('water','shoot','shoot',64,1),
      ('water','hurt','hurt',64,0),('water','win','emote',64,1)]
strips=[];meta={}
for hero,name,f,s,r in SPEC:
  im=Image.open(f'{H}/lpc/{hero}/{f}.png').convert('RGBA');y0=r*s if im.size[1]>s else 0
  row=im.crop((0,y0,im.size[0],y0+s));n=0
  for k in range(im.size[0]//s):
    if row.crop((k*s,0,k*s+s,s)).getbbox():n=k+1
  row=row.crop((0,0,n*s,s));strips.append((hero,name,row,s,n))
W=max(st[2].size[0] for st in strips);Ht=sum(st[2].size[1] for st in strips)
at=Image.new('RGBA',(W,Ht));y=0
for hero,name,row,s,n in strips:
  at.paste(row,(0,y));meta.setdefault(hero,{})[name]={'y':y,'s':s,'n':n,'ax':s//2,'ay':63 if s==64 else 95};y+=s
at.save(f'{H}/heroes.png',optimize=True)
json.dump(meta,open(f'{H}/heroes.json','w'),separators=(',',':'))
print(at.size,os.path.getsize(f'{H}/heroes.png'),{h:{k:v['n'] for k,v in m.items()} for h,m in meta.items()})
