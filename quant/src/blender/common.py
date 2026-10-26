import bpy,sys,math,mathutils,os
# KayKit Adventurers 角色包（git clone https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0）里的 gltf 目录
A=os.environ.get('KAYKIT_GLTF','KayKit-Character-Pack-Adventures-1.0/addons/kaykit_character_pack_adventures/Characters/gltf/')
KEEP={'Knight':['Knight_ArmLeft','Knight_ArmRight','Knight_Body','Knight_Cape','Knight_Head','Knight_Helmet','Knight_LegLeft','Knight_LegRight']}
def load(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=A+name+'.glb')
    arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]
    return arm
def hide_props(name):
    for o in bpy.data.objects:
        if o.type=='MESH' and not o.name.startswith(name+'_'):
            o.hide_render=True;o.hide_viewport=True
def setup_render(res=320,samples=24):
    sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=samples;sc.cycles.use_denoising=False
    sc.render.resolution_x=res;sc.render.resolution_y=res;sc.render.film_transparent=True;sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA'
    sc.view_settings.view_transform='Standard'
    w=bpy.data.worlds.new('w');sc.world=w;w.use_nodes=True;w.node_tree.nodes['Background'].inputs[1].default_value=.6
    for nm,rot,en in [('key',(50,10,-40),3.5),('fill',(60,-10,140),1.2),('rim',(110,0,90),2.0)]:
        l=bpy.data.lights.new(nm,'SUN');l.energy=en;o=bpy.data.objects.new(nm,l);bpy.context.collection.objects.link(o);o.rotation_euler=[math.radians(a) for a in rot]
def cam_track(loc,scale=3.0,target=(0,0,0.9)):
    c=bpy.data.cameras.new('cam');c.type='ORTHO';c.ortho_scale=scale;o=bpy.data.objects.new('cam',c);bpy.context.collection.objects.link(o);o.location=loc
    e=bpy.data.objects.new('tgt',None);bpy.context.collection.objects.link(e);e.location=target
    t=o.constraints.new('TRACK_TO');t.target=e;t.track_axis='TRACK_NEGATIVE_Z';t.up_axis='UP_Y';bpy.context.scene.camera=o;return o
def wpos(arm,bone,which='head'):
    bpy.context.view_layer.update();pb=arm.pose.bones[bone];return arm.matrix_world@(pb.head if which=='head' else pb.tail)
def base(arm,action,frame):
    arm.animation_data.action=bpy.data.actions[action];bpy.context.scene.frame_set(frame);bpy.context.view_layer.update()
    # 冻结当前姿态，后面手动叠加
    for pb in arm.pose.bones:
        pb.matrix_basis=pb.matrix_basis.copy()
    arm.animation_data.action=None
V=mathutils.Vector
def rotp(arm,bone,axis,deg,pivot):
    pb=arm.pose.bones[bone];Mw=arm.matrix_world;bpy.context.view_layer.update()
    p=Mw.inverted()@V(pivot);ax=(Mw.to_3x3().inverted()@V(axis)).normalized()
    R=mathutils.Matrix.Rotation(math.radians(deg),4,ax);T=mathutils.Matrix.Translation(p);pb.matrix=T@R@T.inverted()@pb.matrix;bpy.context.view_layer.update()
def aim(arm,bone,tip,target,tipwhich='head'):
    s=wpos(arm,bone);e=wpos(arm,tip,tipwhich);v1=(e-s);v2=(V(target)-s)
    q=v1.rotation_difference(v2);ax,ang=q.to_axis_angle()
    if ang>1e-4:rotp(arm,bone,ax,math.degrees(ang),s)
def ground(arm,z=0.0):
    bpy.context.view_layer.update()
    lo=min(wpos(arm,'toes.l','tail').z,wpos(arm,'toes.r','tail').z,wpos(arm,'foot.l').z-0.12,wpos(arm,'foot.r').z-0.12)
    arm.location.z+=z-lo;bpy.context.view_layer.update()
def render_to(path):
    bpy.context.scene.render.filepath=os.path.abspath(path);bpy.ops.render.render(write_still=True)
def two_bone(arm,up,lo,end,target,pole):
    """两段骨骼 IK：up→lo→end 让 end 到达 target，膝/肘朝 pole 方向弯"""
    s=wpos(arm,up);m=wpos(arm,lo);e=wpos(arm,end);a=(m-s).length;b=(e-m).length;T=V(target);d=min((T-s).length,a+b-1e-4);d=max(d,abs(a-b)+1e-3)
    dirv=(T-s).normalized();T=s+dirv*d
    cosA=(a*a+d*d-b*b)/(2*a*d);A=math.acos(max(-1,min(1,cosA)))
    pv=V(pole)-s;pv=(pv-dirv*pv.dot(dirv)).normalized()
    mid=s+dirv*(a*math.cos(A))+pv*(a*math.sin(A))
    aim(arm,up,lo,mid);aim(arm,lo,end,T)
def movep(arm,bone,d):
    pb=arm.pose.bones[bone];Mw=arm.matrix_world;bpy.context.view_layer.update()
    da=Mw.to_3x3().inverted()@V(d);pb.matrix=mathutils.Matrix.Translation(da)@pb.matrix;bpy.context.view_layer.update()
def pull6(arm,lean=24,drop=.08,back=.06,hdown=12,ff=(.14,-.30,.13),rf=(-.14,-.02,.13),headk=.4,reach=.98,hx=.06,bob=0,armlean=0):
    movep(arm,'root',(0,back,-drop+bob))
    hp=wpos(arm,'hips');rotp(arm,'spine',(1,0,0),-lean,hp)
    hd=wpos(arm,'head');rotp(arm,'head',(1,0,0),lean*headk,hd)
    for s,dx in (('l',1),('r',-1)):
        sh=wpos(arm,f'upperarm.{s}');L=(wpos(arm,f'lowerarm.{s}')-sh).length+(wpos(arm,f'hand.{s}')-wpos(arm,f'lowerarm.{s}')).length
        a=math.radians(hdown+armlean);T=V((dx*hx,0,0))
        # 手的 y、z：从肩部沿“向前、略向下”伸出 reach×臂长；x 收到中线附近
        dy=math.sqrt(max(0,(L*reach)**2-(sh.x-dx*hx)**2));T.y=sh.y-dy*math.cos(a);T.z=sh.z-dy*math.sin(a)
        two_bone(arm,f'upperarm.{s}',f'lowerarm.{s}',f'hand.{s}',T,(dx*.9,T.y+.2,T.z-.6))
    two_bone(arm,'upperleg.l','lowerleg.l','foot.l',V(ff),(.3,-1.2,.9))
    two_bone(arm,'upperleg.r','lowerleg.r','foot.r',V(rf),(-.2,-1.0,1.0))
import numpy as np
HIDE={'Barbarian':['Barbarian_Round_Shield']}
def recolor(hue_lo,hue_hi,to_h,sat_min=.25,sat_mul=1.0,val_mul=1.0):
    """把贴图里色相在 [hue_lo,hue_hi]（0..1）且饱和度足够的像素改成目标色相；皮肤、头发（低饱和/橙棕色）不受影响"""
    for img in bpy.data.images:
        if img.size[0]<64:continue
        px=np.array(img.pixels[:],dtype=np.float32).reshape(-1,4);rgb=px[:,:3]
        mx=rgb.max(1);mn=rgb.min(1);d=mx-mn+1e-6;s=d/(mx+1e-6);v=mx
        r,g,b=rgb[:,0],rgb[:,1],rgb[:,2]
        h=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))/6
        m=(h>=hue_lo)&(h<=hue_hi)&(s>=sat_min)
        H=np.full_like(h,to_h);S=np.clip(s*sat_mul,0,1);Vv=np.clip(v*val_mul,0,1)
        i=np.floor(H*6);f=H*6-i;p=Vv*(1-S);q=Vv*(1-f*S);t=Vv*(1-(1-f)*S);i=i.astype(int)%6
        nr=np.choose(i,[Vv,q,p,p,t,Vv]);ng=np.choose(i,[t,Vv,Vv,q,p,p]);nb=np.choose(i,[p,p,t,Vv,Vv,q])
        rgb[m,0]=nr[m];rgb[m,1]=ng[m];rgb[m,2]=nb[m];px[:,:3]=rgb
        img.pixels[:]=px.ravel();img.update()
CHAR={'Knight':None,'Rogue':(0.2,0.5,0.98,1.05,.95),'Barbarian':None,'Mage':(0.62,0.97,0.6,1.0,1.05)}
def prep(name):
    arm=load(name);hide_props(name)
    for o in HIDE.get(name,[]):bpy.data.objects[o].hide_render=True
    rc=CHAR[name]
    if rc:recolor(rc[0],rc[1],rc[2],sat_mul=rc[3],val_mul=rc[4])
    return arm
