
/* ================= 屏幕适配：以 1600 宽的固定画布排版，整体等比缩放到任意屏幕 ================= */
let SCALE=1;
(()=>{const app=$('#app');
  function lay(){const vw=innerWidth,vh=innerHeight,W=1600;const H=clamp(Math.round(W*vh/vw),900,1200);const s=Math.min(vw/W,vh/H);SCALE=s;
    app.style.height=H+'px';app.style.setProperty('--vh',(H/100)+'px');app.style.transform=`translate(${(vw-W*s)/2}px,${(vh-H*s)/2}px) scale(${s})`;
    try{if(R3.cur)R3.attach(R3.cur);}catch(e){}}
  addEventListener('resize',lay);lay();})();
