const BG=(()=>{
  // 展厅背景：两束斜射的柔光 + 光束里缓缓飘浮的微尘（纸面竖向栏线由 CSS 画）
  const cv=$('#bg');let t=0,sw=0,sh=0,dust=[];
  function seed(){sw=innerWidth;sh=innerHeight;const{w,h}=fit(cv);dust=[...Array(40)].map(()=>({x:Math.random()*w,y:Math.random()*h,r:.6+Math.random()*1.6,v:3+Math.random()*7,p:Math.random()*6}));}
  function tick(dt){t+=dt||0;if(innerWidth!==sw||innerHeight!==sh)seed();const{ctx,w,h}=fit(cv);ctx.clearRect(0,0,w,h);if(LOW)return;
    [[w*.18,.07],[w*.72,.05]].forEach(([x,a],k)=>{const g=ctx.createLinearGradient(x,0,x+w*.25,h);g.addColorStop(0,`rgba(255,248,230,${a*2})`);g.addColorStop(1,'rgba(255,248,230,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-60+Math.sin(t*.1+k)*20,0);ctx.lineTo(x+90+Math.sin(t*.1+k)*20,0);ctx.lineTo(x+w*.32,h);ctx.lineTo(x+w*.12,h);ctx.fill();});
    dust.forEach(d=>{d.y-=d.v*(dt||0);d.x+=Math.sin(t*.4+d.p)*.15;if(d.y<-5){d.y=h+5;d.x=Math.random()*w;}ctx.fillStyle=`rgba(120,100,70,${.12+.1*Math.sin(t+d.p)})`;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,TAU);ctx.fill();});}
  return{tick};
})();
