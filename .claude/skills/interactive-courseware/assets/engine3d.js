
/* ================= 3D 引擎：共用一个渲染器，切页时挂到当前舞台 ================= */
const T3=window.THREE;
const R3=(()=>{
  let r=null,env=null,cur=null;
  function init(){if(r||!T3)return r;try{r=new T3.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){return null;}
    r.setPixelRatio(Math.min(2,(window.devicePixelRatio||1)*SCALE,LOW?1:2));r.toneMapping=T3.ACESFilmicToneMapping;r.toneMappingExposure=.95;r.outputColorSpace=T3.SRGBColorSpace;
    r.shadowMap.enabled=true;r.shadowMap.type=T3.PCFSoftShadowMap;r.domElement.className='gl';
    // 摄影棚式环境光（RoomEnvironment），让金属与玻璃有真实反射
    const pm=new T3.PMREMGenerator(r);env=pm.fromScene(new T3.RoomEnvironment(),.04).texture;return r;}
  function attach(v){if(!init())return false;r.setPixelRatio(Math.min(2,(window.devicePixelRatio||1)*SCALE,LOW?1:2));cur=v;if(r.domElement.parentNode!==v.host)v.host.prepend(r.domElement);v.resize(true);return true;}
  return{init,attach,get r(){return r;},get env(){return env;},get cur(){return cur;}};
})();

class View{
  constructor(host,{fov=38,pos=[0,3,9],target=[0,1,0],minD=3,maxD=24,minP=.15,maxP=1.45,auto=0,bg=null}={}){
    this.host=host;this.scene=new T3.Scene();if(bg)this.scene.background=new T3.Color(bg);
    this.cam=new T3.PerspectiveCamera(fov,1,.05,200);this.tg=new T3.Vector3(...target);
    const d=new T3.Vector3(...pos).sub(this.tg);this.rad=d.length();this.th=Math.atan2(d.x,d.z);this.ph=Math.acos(d.y/this.rad);
    this.home={rad:this.rad,th:this.th,ph:this.ph,tg:this.tg.clone()};this.lim={minD,maxD,minP,maxP};this.vth=0;this.vph=0;this.auto=auto;this.fly=null;
    this.lbl=document.createElement('div');this.lbl.className='lbls';host.appendChild(this.lbl);this.labels=[];this.picks=[];this.onPick=null;this.onTap=null;
    this.hint=document.createElement('div');this.hint.className='hint3d';this.hint.innerHTML=`<span>拖动旋转 · 滚轮/双指缩放</span><button class="btn sm" title="复位视角">复位</button>`;host.appendChild(this.hint);
    this.hint.querySelector('button').onclick=()=>this.flyTo(this.home);
    this.ray=new T3.Raycaster();this.w=1;this.h=1;this.bind();
  }
  bind(){const el=this.host,pts=new Map();let moved=0,pinch0=0,rad0=0;
    el.addEventListener('pointerdown',e=>{if(e.target.closest('.lbls button,.hint3d,.panel,.ov,button'))return;if(e.target.tagName!=='CANVAS')return;el.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;this.auto&&(this.autoHold=3);
      if(pts.size===2){const[a,b]=[...pts.values()];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1]);rad0=this.rad;}});
    el.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const p=pts.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];pts.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(dx)+Math.abs(dy);
      if(pts.size===2){const[a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch0)this.rad=clamp(rad0*pinch0/d,this.lim.minD,this.lim.maxD);return;}
      this.vth=-dx*.0065;this.vph=-dy*.0055;this.th+=this.vth;this.ph=clamp(this.ph+this.vph,this.lim.minP,this.lim.maxP);this.fly=null;});
    const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);pinch0=0;if(moved<6)this.tap(e);};
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',e=>pts.delete(e.pointerId));
    el.addEventListener('wheel',e=>{if(e.target.tagName!=='CANVAS')return;e.preventDefault();this.rad=clamp(this.rad*Math.exp(e.deltaY*.0012),this.lim.minD,this.lim.maxD);this.fly=null;},{passive:false});}
  tap(e){const r=this.host.getBoundingClientRect();const m=new T3.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(m,this.cam);
    if(this.onTap)this.onTap(this.ray);
    if(!this.picks.length||!this.onPick)return;const hit=this.ray.intersectObjects(this.picks,true)[0];if(!hit)return;let o=hit.object;while(o&&!o.userData.pick)o=o.parent;if(o)this.onPick(o.userData.pick,o,hit);}
  flyTo({rad,th,ph,tg}){this.fly={rad,th,ph,tg:tg.clone(),k:0,s:{rad:this.rad,th:this.th,ph:this.ph,tg:this.tg.clone()}};}
  resize(force){const w=this.host.clientWidth,h=this.host.clientHeight;if(!force&&w===this.w&&h===this.h)return;this.w=w;this.h=h;if(R3.r)R3.r.setSize(w,h,false);this.cam.aspect=w/Math.max(1,h);this.cam.updateProjectionMatrix();}
  label(html,pos,{cls='',click=null,ax='-50%'}={}){const d=document.createElement(click?'button':'div');d.className='l3 '+cls;d.innerHTML=html;if(click)d.onclick=click;this.lbl.appendChild(d);const o={ax,el:d,pos:pos instanceof T3.Vector3?pos:new T3.Vector3(...pos),on:true};this.labels.push(o);return o;}
  render(dt){if(R3.cur!==this||!R3.r)return;this.resize();
    if(this.fly){const f=this.fly;f.k=Math.min(1,f.k+dt*1.3);const k=ease(f.k);this.rad=lerp(f.s.rad,f.rad,k);this.ph=lerp(f.s.ph,f.ph,k);this.tg.lerpVectors(f.s.tg,f.tg,k);
      let dth=f.th-f.s.th;dth=Math.atan2(Math.sin(dth),Math.cos(dth));this.th=f.s.th+dth*k;if(f.k>=1)this.fly=null;}
    else{this.vth*=.92;this.vph*=.92;this.th+=this.vth*.5;this.ph=clamp(this.ph+this.vph*.5,this.lim.minP,this.lim.maxP);if(this.auto){if(this.autoHold>0)this.autoHold-=dt;else this.th+=this.auto*dt;}}
    const s=Math.sin(this.ph);this.cam.position.set(this.tg.x+this.rad*s*Math.sin(this.th),this.tg.y+this.rad*Math.cos(this.ph),this.tg.z+this.rad*s*Math.cos(this.th));this.cam.lookAt(this.tg);
    R3.r.render(this.scene,this.cam);
    const v=new T3.Vector3();for(const l of this.labels){if(!l.on){l.el.style.display='none';continue;}v.copy(l.pos).project(this.cam);const vis=v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1;l.el.style.display=vis?'':'none';
      if(vis){const ew=l.el.offsetWidth,f=l.ax==='-100%'?1:l.ax==='0%'?0:.5;let x=(v.x*.5+.5)*this.w,y=(-v.y*.5+.5)*this.h;x=clamp(x,ew*f+8,this.w-ew*(1-f)-8);y=clamp(y,18,this.h-18);l.el.style.transform=`translate(${l.ax},-50%) translate(${x}px,${y}px)`;}}
  }
}
/* 常用材质与零件 */
const M3={
  glass:()=>LOW?M3.glassLite():new T3.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.03,transmission:1,thickness:.08,ior:1.5,envMapIntensity:1.2,clearcoat:1,clearcoatRoughness:.03,transparent:true,side:T3.DoubleSide,depthWrite:false,specularIntensity:1}),
  glassLite:()=>new T3.ShaderMaterial({transparent:true,depthWrite:false,side:T3.DoubleSide,
    vertexShader:'varying vec3 n;varying vec3 vd;void main(){vec4 m=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);vd=normalize(-m.xyz);gl_Position=projectionMatrix*m;}',
    fragmentShader:'varying vec3 n;varying vec3 vd;void main(){float f=pow(1.-abs(dot(n,vd)),2.2);float s=pow(max(0.,dot(reflect(-vd,n),normalize(vec3(.4,.8,.5)))),40.);gl_FragColor=vec4(mix(vec3(.75,.92,1.),vec3(1.),s),.07+.6*f+.5*s);}'}),
  water:(c=0x2e9bd6,o=.82)=>new T3.MeshPhysicalMaterial({color:c,metalness:0,roughness:.06,transparent:true,opacity:o,envMapIntensity:1.2,clearcoat:1,clearcoatRoughness:.08}),
  chrome:()=>new T3.MeshStandardMaterial({color:0xe9eef2,metalness:1,roughness:.12,envMapIntensity:1.4}),
  mat:(c,r=.8,m=0)=>new T3.MeshStandardMaterial({color:c,roughness:r,metalness:m}),
};
function lights(scene,{sun=[5,9,4],amb=.55,shadow=true,size=8}={}){scene.environment=R3.env;
  scene.add(new T3.HemisphereLight(0xcfeeff,0x1a2a35,amb));const d=new T3.DirectionalLight(0xfff4e0,2.1);d.position.set(...sun);
  if(shadow){d.castShadow=true;d.shadow.mapSize.set(LOW?512:1024,LOW?512:1024);const c=d.shadow.camera;c.left=c.bottom=-size;c.right=c.top=size;c.near=.5;c.far=40;d.shadow.bias=-.0004;d.shadow.normalBias=.03;d.shadow.radius=3;}scene.add(d);return d;}
function shadowAll(o){o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});return o;}
/* 圆形波纹水面：撞击后产生向外扩散、逐渐衰减的波 */
class RipDisc{
  constructor(R,mat,rings=22,seg=64){this.R=R;const pos=[],idx=[];pos.push(0,0,0);for(let i=1;i<=rings;i++){const r=R*i/rings;for(let j=0;j<seg;j++){const a=j/seg*TAU;pos.push(Math.cos(a)*r,0,Math.sin(a)*r);}}
    for(let j=0;j<seg;j++)idx.push(0,1+(j+1)%seg,1+j);for(let i=1;i<rings;i++)for(let j=0;j<seg;j++){const a=1+(i-1)*seg+j,b=1+(i-1)*seg+(j+1)%seg,c=1+i*seg+j,d=1+i*seg+(j+1)%seg;idx.push(a,b,d,a,d,c);}
    this.g=new T3.BufferGeometry();this.g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));this.g.setIndex(idx);this.g.computeVertexNormals();this.base=Float32Array.from(pos);
    this.mesh=new T3.Mesh(this.g,mat);this.hits=[];this.t=0;}
  hit(x=0,z=0,a=.05){this.hits.push({x,z,a,t:this.t});if(this.hits.length>8)this.hits.shift();}
  step(dt){this.t+=dt;const p=this.g.attributes.position.array,b=this.base;
    for(let i=0;i<p.length;i+=3){const x=b[i],z=b[i+2];let y=Math.sin(x*6+this.t*2)*.004+Math.cos(z*5-this.t*1.6)*.004;
      for(const h of this.hits){const age=this.t-h.t,d=Math.hypot(x-h.x,z-h.z),f=d-age*1.4;if(f<0&&f>-.6)y+=Math.sin(f*22)*h.a*Math.exp(-age*1.6)*(1+f);}p[i+1]=y;}
    this.g.attributes.position.needsUpdate=true;this.g.computeVertexNormals();this.hits=this.hits.filter(h=>this.t-h.t<3);}
}
/* 一段竖直的水柱（容器里的水）：侧面 + 波纹顶面 */
class WaterCol{
  constructor(R,color=0x2e9bd6,op=.82){this.R=R;this.mat=M3.water(color,op);this.grp=new T3.Group();
    this.side=new T3.Mesh(new T3.CylinderGeometry(R,R,1,64,1,true),this.mat);this.side.position.y=.5;this.grp.add(this.side);
    this.bot=new T3.Mesh(new T3.CircleGeometry(R,48),this.mat);this.bot.rotation.x=Math.PI/2;this.grp.add(this.bot);
    this.top=new RipDisc(R,this.mat);this.grp.add(this.top.mesh);this.set(0,.5);}
  set(y0,y1){const h=Math.max(.0005,y1-y0);this.side.scale.y=h;this.side.position.y=y0+h/2;this.bot.position.y=y0;this.top.mesh.position.y=y1;this.grp.visible=y1-y0>.002;this.y1=y1;this.y0=y0;}
  color(c){this.mat.color.set(c);}
}
function glassCyl(R,H,{ticks=0,base=true}={}){const g=new T3.Group();const m=M3.glass();
  const wall=new T3.Mesh(new T3.CylinderGeometry(R,R,H,64,1,true),m);wall.position.y=H/2;g.add(wall);
  const rim=new T3.Mesh(new T3.TorusGeometry(R,.018,8,64),new T3.MeshPhysicalMaterial({color:0xffffff,roughness:.05,transparent:true,opacity:.5}));rim.rotation.x=Math.PI/2;rim.position.y=H;g.add(rim);
  if(base){const b=new T3.Mesh(new T3.CylinderGeometry(R,R*1.02,.05,64),new T3.MeshPhysicalMaterial({color:0xcfe9f3,roughness:.25,metalness:0,clearcoat:1,clearcoatRoughness:.1,envMapIntensity:1.2}));b.position.y=.031;b.receiveShadow=true;g.add(b);}
  if(ticks){const tm=new T3.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7});for(let i=1;i<ticks;i++){const l=i%5===0?.18:.09;const tk=new T3.Mesh(new T3.BoxGeometry(l,.012,.012),tm);const a=-.6;tk.position.set(Math.sin(a)*(R+.002),H*i/ticks,Math.cos(a)*(R+.002));tk.rotation.y=a;g.add(tk);}}
  return g;}
/* 一条流动的水流（管状），用于“倒水”“调水” */
class Stream{
  constructor(color=0x8fe6f6,r=.04){this.mat=new T3.MeshPhysicalMaterial({color,roughness:.05,transparent:true,opacity:.85,emissive:0x0a3a50,emissiveIntensity:.4});this.mesh=new T3.Mesh(new T3.BufferGeometry(),this.mat);this.r=r;this.mesh.visible=false;}
  set(pts,r=this.r){this.mesh.geometry.dispose();const c=new T3.CatmullRomCurve3(pts.map(p=>new T3.Vector3(...p)));this.mesh.geometry=new T3.TubeGeometry(c,40,r,10,false);this.mesh.visible=true;}
  hide(){this.mesh.visible=false;}
}
/* 可点击的“?”标记（画在精灵上） */
function badge(txt='?',col='#e9c46a',fg='#3a2408'){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle=col;x.beginPath();x.arc(64,64,54,0,TAU);x.fill();x.lineWidth=10;x.strokeStyle='#fff';x.stroke();
  x.fillStyle=fg;x.font='900 70px Outfit,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,70);const t=new T3.CanvasTexture(c);t.colorSpace=T3.SRGBColorSpace;
  const s=new T3.Sprite(new T3.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.renderOrder=9;return s;}
/* 简单的值噪声（用于生成地形、行星） */
const NZ=(()=>{const P=new Uint8Array(512);const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=(Math.sin(i*91.7)*43758.5453%1+1)%1*(i+1)|0;[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<512;i++)P[i]=p[i&255];
  const f=t=>t*t*t*(t*(t*6-15)+10),g=(h,x,y,z)=>{const u=h&15,a=u<8?x:y,b=u<4?y:u===12||u===14?x:z;return((u&1)?-a:a)+((u&2)?-b:b);};
  function n3(x,y,z){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=f(x),v=f(y),w=f(z);
    const A=P[X]+Y,AA=P[A]+Z,AB=P[A+1]+Z,B=P[X+1]+Y,BA=P[B]+Z,BB=P[B+1]+Z;
    return lerp(lerp(lerp(g(P[AA],x,y,z),g(P[BA],x-1,y,z),u),lerp(g(P[AB],x,y-1,z),g(P[BB],x-1,y-1,z),u),v),lerp(lerp(g(P[AA+1],x,y,z-1),g(P[BA+1],x-1,y,z-1),u),lerp(g(P[AB+1],x,y-1,z-1),g(P[BB+1],x-1,y-1,z-1),u),v),w);}
  const fbm=(x,y,z,o=5)=>{let s=0,a=.5,fq=1;for(let i=0;i<o;i++){s+=a*n3(x*fq,y*fq,z*fq);a*=.5;fq*=2.03;}return s;};return{n3,fbm};})();
/* 在 3D 中写字（贴图文字牌） */
function textSprite(txt,{size=40,col='#ffffff',bg='rgba(6,20,35,.75)',pad=18}={}){const c=document.createElement('canvas'),x=c.getContext('2d');x.font=`700 ${size}px ${BODY}`;const w=Math.ceil(x.measureText(txt).width)+pad*2,h=size+pad*1.4;c.width=w;c.height=h;
  x.font=`700 ${size}px ${BODY}`;x.fillStyle=bg;rr(x,0,0,w,h,h/2);x.fill();x.fillStyle=col;x.textBaseline='middle';x.fillText(txt,pad,h/2+2);const t=new T3.CanvasTexture(c);t.colorSpace=T3.SRGBColorSpace;
  const s=new T3.Sprite(new T3.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(w/h*.3,.3,1);s.renderOrder=8;return s;}
function rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

/* 内嵌素材（CC0 模型 / 贴图）解码与缓存 */
const b64buf=b=>{const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;};
const GLBC={};
function glb(name){if(!GLBC[name])GLBC[name]=new Promise((ok,no)=>{try{new T3.GLTFLoader().parse(b64buf(ASSET.glb[name]),'',g=>{g.scene.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;}});ok(g.scene);},no);}catch(e){no(e);}});
  return GLBC[name].then(s=>s.clone(true));}
/* 按高度缩放、落地并居中 */
function fitModel(o,h){const b=new T3.Box3().setFromObject(o),sz=b.getSize(new T3.Vector3());const k=h/sz.y;o.scale.multiplyScalar(k);const b2=new T3.Box3().setFromObject(o),c=b2.getCenter(new T3.Vector3());o.position.x-=c.x;o.position.z-=c.z;o.position.y-=b2.min.y;const g=new T3.Group();g.add(o);return g;}
function texB64(name,{srgb=true,mime='image/jpeg'}={}){const im=new Image();const t=new T3.Texture(im);if(srgb)t.colorSpace=T3.SRGBColorSpace;im.onload=()=>{t.needsUpdate=true;};im.src=`data:${mime};base64,${ASSET.tex[name]}`;t.anisotropy=8;return t;}

/* 去掉模型自带的大底盘（如农场模型下的白色圆盘） */
function stripBase(o){const B=new T3.Box3().setFromObject(o),S=B.getSize(new T3.Vector3());const rm=[];o.traverse(m=>{if(!m.isMesh)return;const b=new T3.Box3().setFromObject(m),s=b.getSize(new T3.Vector3());if(s.y<S.y*.03&&Math.max(s.x,s.z)>Math.max(S.x,S.z)*.7)rm.push(m);});rm.forEach(m=>m.parent.remove(m));return o;}

/* 高度场地形的侧壁（沙盘的“剖面”），避免从侧面看到地形像一张悬空的薄片 */
function skirt(W,D,hFn,bottom,cx=0,cz=0,{top=0x8a6a45,bot=0x4e3b28,n=120}={}){const pos=[],col=[],idx=[];const cT=new T3.Color(top),cB=new T3.Color(bot);
  const edges=[[[-W/2,-D/2],[W/2,-D/2]],[[W/2,-D/2],[W/2,D/2]],[[W/2,D/2],[-W/2,D/2]],[[-W/2,D/2],[-W/2,-D/2]]];
  for(const[[ax,az],[bx,bz]] of edges){const base=pos.length/3;for(let i=0;i<=n;i++){const k=i/n,x=lerp(ax,bx,k)+cx,z=lerp(az,bz,k)+cz,h=hFn(x,z);pos.push(x,h,z,x,bottom,z);col.push(cT.r,cT.g,cT.b,cB.r,cB.g,cB.b);}
    for(let i=0;i<n;i++){const a=base+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new T3.Mesh(g,new T3.MeshStandardMaterial({vertexColors:true,roughness:.95,side:T3.DoubleSide}));m.receiveShadow=true;return m;}
