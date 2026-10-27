const BG=(()=>{
  // 浅色方格纸背景：方格由 CSS 画；画布上只飘几枚淡淡的像素贴纸（水滴、加号、方块），不抢内容
  const cv=$('#bg');let t=0,sw=0,sh=0,items=[];const P=4;
  const DROP=['..1..','.111.','11111','11111','.111.'],PLUS=['.1.','111','.1.'];
  const COLS=['#ffd6c9','#cdeee8','#dcd3ff','#cfe8f7','#ffe9a8'];
  function seed(){sw=innerWidth;sh=innerHeight;const{w,h}=fit(cv);
    items=[...Array(16)].map((_,i)=>({x:Math.random()*w,y:Math.random()*h,v:6+Math.random()*10,p:Math.random()*6,k:i%3,c:COLS[i%COLS.length],s:Math.random()<.4?2:1}));}
  function shape(ctx,m,x,y,s,c){ctx.fillStyle=c;m.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='1')ctx.fillRect(Math.round(x+i*P*s),Math.round(y+j*P*s),P*s,P*s);});}
  function tick(dt){t+=dt||0;if(innerWidth!==sw||innerHeight!==sh)seed();const{ctx,w,h}=fit(cv);ctx.clearRect(0,0,w,h);if(LOW)return;
    items.forEach(o=>{o.y-=o.v*(dt||0);if(o.y<-40){o.y=h+20;o.x=Math.random()*w;}const x=o.x+Math.sin(t*.5+o.p)*10;
      if(o.k===0)shape(ctx,DROP,x,o.y,o.s,o.c);else if(o.k===1)shape(ctx,PLUS,x,o.y,o.s,o.c);else{ctx.fillStyle=o.c;ctx.fillRect(Math.round(x),Math.round(o.y),P*2*o.s,P*2*o.s);}});}
  return{tick};
})();
