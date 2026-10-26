# 把 KayKit 角色摆成拔河的五种状态（用力 / 猛拉 / 踉跄 / 欢呼 / 摔倒）逐帧渲染成透明 PNG，并导出每帧手部与脚底原点的像素坐标。
# 用法：KAYKIT_GLTF=<角色包 gltf 目录> <装了 bpy 的 python> render_all.py -- Knight,Rogue,Barbarian,Mage
# 输出在 frames/，再用 pack_sheets.py 打包成精灵图。
import sys,json;sys.path.insert(0,'.')
from common import *
from bpy_extras.object_utils import world_to_camera_view
names=sys.argv[sys.argv.index('--')+1].split(',')
RES=360;OUT='frames';os.makedirs(OUT,exist_ok=True)
ease=lambda x:x*x*(3-2*x)
def st_strain(arm,t):
    w=2*math.pi*t;pull6(arm,lean=28+1.6*math.sin(2*w),bob=.006*math.sin(2*w),hdown=15+2.5*math.sin(2*w+1),headk=.4+.06*math.sin(3*w))
    rotp(arm,'head',(0,0,1),2.5*math.sin(4*w),wpos(arm,'head'))
def st_heave(arm,t):
    k=math.sin(math.pi*t);lift=max(0,math.sin(math.pi*min(1,max(0,(t-.15)/.5))))
    pull6(arm,lean=28+14*k,bob=-.015*k,hdown=15+10*k,headk=.35,ff=(.14,-.30+.05*lift,.13+.09*lift))
def st_stumble(arm,t):
    if t<.35:k=ease(t/.35)
    else:k=1-ease((t-.35)/.65)
    lift=math.sin(math.pi*min(1,t/.7))
    pull6(arm,lean=28-40*k,drop=.08-.03*k,back=.06-.06*k,hdown=15-12*k,reach=.98+.02*k,headk=.4-.3*k,ff=(.14,-.30-.12*lift,.13+.10*lift))
def st_cheer(arm,t):
    arm.animation_data.action=bpy.data.actions['Cheer'];bpy.context.scene.frame_set(int(round(40*t)) or 0);bpy.context.view_layer.update()
def st_fall(arm,t):
    a=bpy.data.actions['Sit_Floor_Down'];f0,f1=a.frame_range
    arm.animation_data.action=a;bpy.context.scene.frame_set(int(round(f0+(f1-f0)*t)));bpy.context.view_layer.update()
STATES=[('strain',10,st_strain,True),('heave',12,st_heave,False),('stumble',12,st_stumble,False),('cheer',16,st_cheer,True),('fall',12,st_fall,False)]
meta={}
for n in names:
    arm=prep(n);setup_render(RES,14)
    sc=bpy.context.scene
    try:
        sc.cycles.use_denoising=True;sc.cycles.denoiser='OPENIMAGEDENOISE'
    except Exception as e:print('nodenoise',e)
    cam=cam_track((-8,-3.5,2.2),3.3,(0,-.05,.95))
    meta[n]={}
    for sname,N,fn,loop in STATES:
        hands=[];orig=[]
        for i in range(N):
            t=i/N if loop else i/(N-1)
            arm.matrix_world=mathutils.Matrix.Identity(4);arm.animation_data.action=None
            for pb in arm.pose.bones:pb.matrix_basis=mathutils.Matrix.Identity(4)
            base(arm,'Idle',1);fn(arm,t)
            bpy.context.view_layer.update()
            h=(wpos(arm,'hand.l')+wpos(arm,'hand.r'))/2
            p=world_to_camera_view(sc,cam,h);o=world_to_camera_view(sc,cam,V((0,0,0)))
            hands.append([round(p.x*RES,1),round((1-p.y)*RES,1)]);orig.append([round(o.x*RES,1),round((1-o.y)*RES,1)])
            render_to(f'{OUT}/{n}_{sname}_{i:02d}.png')
        meta[n][sname]={'n':N,'loop':loop,'hand':hands,'origin':orig}
        print('done',n,sname,flush=True)
    json.dump(meta[n],open(f'{OUT}/{n}.json','w'))
