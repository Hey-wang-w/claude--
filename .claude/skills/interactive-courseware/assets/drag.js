/* ================= 拖放：卡片既能拖到目标上，也保留“先点卡片、再点目标” =================
   DRAG.make(el,{drop(target,cx,cy)}): target 是指针下方最近的 [data-drop] 元素或画布；drop 返回 true 表示接收。
   拖动时生成跟随指针的“影子卡片”（按 #app 的缩放换算），目标高亮；拖动后不再触发 click。 */
const DRAG=(()=>{let cur=null;
  function under(cx,cy){for(const e of document.elementsFromPoint(cx,cy)){if(e.classList.contains('dragghost'))continue;const d=e.closest('[data-drop]');if(d)return d;if(e.tagName==='CANVAS')return e;}return null;}
  function make(el,{drop,onStart}={}){
    el.addEventListener('pointerdown',e=>{if(e.button)return;const r=el.getBoundingClientRect();cur={el,drop,onStart,sx:e.clientX,sy:e.clientY,ox:e.clientX-r.left,oy:e.clientY-r.top,moved:false,ghost:null,hot:null,id:e.pointerId};
      try{el.setPointerCapture(e.pointerId);}catch(_){}});
    el.addEventListener('pointermove',e=>{if(!cur||cur.el!==el)return;const app=$('#app'),ar=app.getBoundingClientRect(),k=ar.width/app.offsetWidth||1;
      if(!cur.moved){if(Math.hypot(e.clientX-cur.sx,e.clientY-cur.sy)<7)return;cur.moved=true;onStart&&onStart();const g=el.cloneNode(true);g.classList.add('dragghost');g.style.width=el.offsetWidth+'px';g.style.height=el.offsetHeight+'px';app.appendChild(g);cur.ghost=g;el.classList.add('dragsrc');sfx8&&sfx8('select');}
      cur.ghost.style.left=((e.clientX-ar.left)/k-cur.ox/k)+'px';cur.ghost.style.top=((e.clientY-ar.top)/k-cur.oy/k)+'px';
      const h=under(e.clientX,e.clientY);if(h!==cur.hot){cur.hot&&cur.hot.classList&&cur.hot.classList.remove('dropon');cur.hot=h;h&&h.classList&&h.tagName!=='CANVAS'&&h.classList.add('dropon');}});
    const fin=e=>{if(!cur||cur.el!==el)return;const c=cur;cur=null;if(!c.moved)return;c.ghost.remove();el.classList.remove('dragsrc');c.hot&&c.hot.classList&&c.hot.classList.remove('dropon');
      el.dataset.dragged='1';setTimeout(()=>{delete el.dataset.dragged;},0);const tg=under(e.clientX,e.clientY);if(!(tg&&c.drop&&c.drop(tg,e.clientX,e.clientY)))sfx8&&sfx8('blip');};
    el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',fin);
    el.addEventListener('click',e=>{if(el.dataset.dragged){e.stopImmediatePropagation();e.preventDefault();}},true);
    el.style.touchAction='none';}
  /* 画布坐标：屏幕坐标 → 画布版面坐标 */
  const cvPt=(cv,cx,cy)=>{const r=cv.getBoundingClientRect(),s=r.width/cv.offsetWidth||1;return[(cx-r.left)/s,(cy-r.top)/s];};
  return{make,cvPt};})();
