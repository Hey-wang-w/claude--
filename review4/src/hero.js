/* ================= 对战角色：LPC 像素精灵（图集由 sprites/make_atlas.py 生成，构建时内嵌） =================
   炎刃：火焰剑士（朝右）；澜音：水系法师（朝左）。素材来自 Universal LPC Spritesheet Character Generator，
   授权 CC-BY-SA 3.0 / OGA-BY 3.0 / GPL 3.0，作者名单见 sprites/lpc/fire（及 water）/CREDITS.txt。 */
const HEROES={
  fire:{name:'炎刃',team:'r',idle:['idle',3],
    moves:[{name:'烈焰斩',anim:'slash',fps:14,hit:3,fx:'crescent'},{name:'炎轮回旋',anim:'halfslash',fps:13,hit:3,fx:'wheel'},{name:'赤炎三连',anim:'backslash',fps:18,hit:4,fx:'triple'}],
    ult:{name:'爆炎·千重斩',anim:'backslash',fps:16,hit:5,fx:'meteor',pre:'jump'}},
  water:{name:'澜音',team:'b',idle:['walk',4],
    moves:[{name:'潮汐弹',anim:'cast',fps:12,hit:5,fx:'orb'},{name:'冰棱刺',anim:'thrust',fps:13,hit:5,fx:'spikes'},{name:'激流冲击',anim:'shoot',fps:16,hit:6,fx:'beam'}],
    ult:{name:'沧澜·万水归一',anim:'cast',fps:9,hit:5,fx:'tsunami'}}};
const HERO_ATLAS=(()=>{const img=new Image();img.src='data:image/png;base64,__HEROES_PNG__';return{img,meta:__HEROES_JSON__,tint:{}};})();
const heroFrames=(kind,anim)=>HERO_ATLAS.meta[kind][anim].n;
/* 白色受击闪光用的染色图集（第一次用时生成） */
function heroTinted(col){if(HERO_ATLAS.tint[col])return HERO_ATLAS.tint[col];const im=HERO_ATLAS.img;if(!im.complete||!im.naturalWidth)return null;
  const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);
  return HERO_ATLAS.tint[col]=c;}
/* 画一帧：(x,y) 是脚底中点；scale 用整数最清晰；flip 水平翻转；tint 传颜色时画成纯色剪影（受击闪白） */
function drawHeroFrame(ctx,kind,anim,frame,x,y,scale=1,{flip=false,tint=null,alpha=1}={}){const m=HERO_ATLAS.meta[kind][anim];if(!m)return;const src=tint?heroTinted(tint):HERO_ATLAS.img;if(!src||(!tint&&!src.complete))return;
  const f=Math.max(0,Math.min(m.n-1,frame|0));ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha*=alpha;ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);
  ctx.drawImage(src,f*m.s,m.y,m.s,m.s,-m.ax*scale,-m.ay*scale,m.s*scale,m.s*scale);ctx.restore();}
/* 待机：炎刃握剑摆架势（两帧）；澜音斜握法杖（杖尖离地），轻轻呼吸 */
function drawHeroIdle(ctx,kind,t,x,y,scale=1,o={}){const[a,f]=HEROES[kind].idle;
  if(kind==='fire')drawHeroFrame(ctx,kind,a,Math.floor(t*2.2)%2,x,y,scale,o);
  else drawHeroFrame(ctx,kind,a,f,x,y-(Math.sin(t*2.6)>.3?scale:0),scale,o);}
