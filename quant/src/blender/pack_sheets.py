"""把 render_all.py 渲染出的逐帧 PNG 打包成每个角色一张 WebP 精灵图 + meta.json。
用法：在 render_all.py 的输出目录旁运行 `python3 pack_sheets.py`（需要 Pillow），结果在 pack/。
meta.json 里每个状态记录起始帧 i、帧数 n、是否循环，以及每帧的手部与脚底原点像素坐标（已扣掉裁边）。"""
from PIL import Image
import glob, json, io, os

STS = ['strain', 'heave', 'stumble', 'cheer', 'fall']
NAMES = ['Knight', 'Rogue', 'Barbarian', 'Mage']
RES = 360
os.makedirs('pack', exist_ok=True)
out = {}; total = 0
for n in NAMES:
    meta = json.load(open(f'frames/{n}.json'))
    fr = []; idx = {}
    for st in STS:
        fs = sorted(glob.glob(f'frames/{n}_{st}_*.png')); idx[st] = [len(fr), len(fs)]
        fr += [Image.open(f).convert('RGBA') for f in fs]
    # 所有帧共用一个裁剪框，保证原点对齐
    bb = None
    for im in fr:
        b = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    bb = (max(0, bb[0] - 4), max(0, bb[1] - 4), min(RES, bb[2] + 4), min(RES, bb[3] + 4)); cw, ch = bb[2] - bb[0], bb[3] - bb[1]
    cols = 8; rows = (len(fr) + cols - 1) // cols; sheet = Image.new('RGBA', (cw * cols, ch * rows), (0, 0, 0, 0))
    for i, im in enumerate(fr): sheet.paste(im.crop(bb), ((i % cols) * cw, (i // cols) * ch))
    buf = io.BytesIO(); sheet.save(buf, 'WEBP', quality=82, method=6); data = buf.getvalue(); total += len(data)
    open(f'pack/{n}.webp', 'wb').write(data)
    M = {'w': cw, 'h': ch, 'cols': cols, 'st': {}}
    for st in STS:
        s, c = idx[st]; m = meta[st]
        M['st'][st] = {'i': s, 'n': c, 'loop': m['loop'],
                       'hand': [[round(x - bb[0], 1), round(y - bb[1], 1)] for x, y in m['hand']],
                       'org': [[round(x - bb[0], 1), round(y - bb[1], 1)] for x, y in m['origin']]}
    out[n] = M; print(n, cw, ch, sheet.size, len(data) // 1024, 'KB')
json.dump(out, open('pack/meta.json', 'w'))
print('total', total // 1024, 'KB')
