# 单文件课件框架

## 目录
1. 文件结构与构建方式
2. 共享运行时 API
3. 固定画布缩放（屏幕适配）
4. 页面骨架与“笔记”卡
5. 常用交互模式（含判分规则）
6. 代码坑速查
7. 统一工具栏、画布直接操作与字体内嵌

---

## 1. 文件结构与构建方式

每套课件是**一个自包含的 HTML 文件**（`<课件>/index.html`）：CSS、JS、图标、字体、模型和贴图全部内联，**不依赖任何外链**，断网可用。

目录约定（从 `purify/` 起）：

```
<课件>/index.html              构建产物（发布、上课用）
<课件>/src/build.py            构建脚本（复制 scripts/build_2d_template.py 修改）
<课件>/src/*.css *.html *.js   本课源文件：样式、页面、绘图库、各页模块
<课件>/src/fonts.css           按用字裁剪后的内嵌字体（scripts/font_subset.py 生成）
```

**源文件必须提交进仓库**。scratchpad 在会话结束后就没了，只留构建产物的话，下次会话只能硬改几百 KB 的单文件。（`purify/` 之前的六套课件没有源文件，修改时直接编辑 `index.html`，或先把相应片段抽成源文件。）

构建脚本从 `symbols/index.html` **抽出共享部分**，再拼上本课的 CSS、HTML 和 JS：

- `head`：`<style>` 之前的部分（改标题，删掉 Google Fonts 外链）。
- `js_head`：`(()=>{\n'use strict';` 到 `/* ================= 1 封面` 之间的工具函数、音效、特效、积分。背景 `BG` 模块可以整体替换成本课风格。
- `js_deck`：`/* ================= 翻页框架 ================= */` 到 `</script>` 之间的翻页、目录、键盘、触摸和主循环（构建时把 `dt` 限制为不小于 0）。
- `dock`：`</main>\n` 到 `<script>` 之间的底栏、目录弹窗、闪屏层和特效画布（要改页码“1 / N”和“建议用时合计约 45 分钟”）。

运行：`python3 <课件>/src/build.py`（在仓库根目录）。改了文字、需要重新裁剪字体时：`FONT_DIR=<字体包目录> <装了 fonttools 的 python> <课件>/src/build.py`。

3D 课件的构建示例见 `scripts/build_3d_template.py`（内联 three.js 打包文件和 base64 模型）。

## 2. 共享运行时 API（来自 `js_head` / `js_deck`）

- DOM：`$(sel,root)`、`$$(sel,root)`；数学：`TAU`、`clamp`、`lerp`、`ease`、`smooth(a,b,x)`。
- `LOW`：低特效模式开关（底栏“特效：高 / 低”），重的效果要判断它。
- 画布：**新课件一律用 `fitS(canvas)`**（`assets/lab-draw.js`），返回的 `w,h` 是版面像素，不受整体缩放影响，字号、线宽在任何屏幕上都一致；指针坐标用 `ptIn(canvas,event)` 换算成同一套版面像素。旧的 `fit(canvas)` 返回的是屏幕像素，只用于铺满窗口的背景和特效画布。`label(ctx,txt,x,y,{size,col,align,weight,font,stroke})` 写画布文字；`txt`、`hand` 是它的两种预设（正文 / 站酷快乐体）。
- 音效：`sfx('click'|'pop'|'drop'|'ok'|'bad'|'win'|'whoosh'|'tick'|'zap'|'boom')`；`note(freq,dur,type,vol)` 播放单音。
- 特效：`FX.burst(x,y,n,colors)`、`FX.confetti()`、`burstAt(el,n,colors)`、`flash(col)`、`shake()`。
- 积分：`TEAM.cur`（`'r'` 或 `'b'`）、`TEAM.sc`、`teamAdd(v,tm)`、`teamNext()`、`teamSet(tm)`、`tname(k)` 返回“红队 / 蓝队”。
- 页面模块：`S[id]={enter(),leave(),tick(dt)}`。主循环只调用当前页的 `tick`，翻页时调用 `enter` / `leave`。
- 页面标记：`<section class="slide" data-id="x" data-title="标题" data-min="5" [data-opt]>`。`data-go="next"` 的按钮会自动绑定为“下一页”。
- 导航：方向键、PageUp/PageDown、空格、Home/End、`F` 全屏、左右滑动；地址带 `#p3` 可直达第 3 页（测试时要 `reload` 才生效）。
- 目录弹窗：列出每页的建议分钟数，并提供 ±10 分、清零的积分调整。

## 3. 固定画布缩放（屏幕适配）

老师会在不同窗口里打开课件。各元素各自响应式会导致“屏幕适应有偏差”。解决方案（`assets/fit.js`）：

- `#app` 宽固定为 1600 px，高按窗口比例取 900–1200 px；整体用 `transform: scale()` 缩放并居中。底栏和目录弹窗也放进 `#app`，背景画布、特效画布和闪屏层留在外面铺满窗口。
- CSS 里不用 `vw` / `vh`，改为 `calc(var(--vw)*N)` / `calc(var(--vh)*N)`（`--vw:16px`，`--vh` = 画布高 / 100），并删掉窄屏 `@media` 规则。
- 坐标换算：`getBoundingClientRect()` 和 `clientX` 都是屏幕像素；版面像素 = 屏幕像素 ÷ 缩放比（`rect.width / el.offsetWidth`）。DOM 拖拽时位移要除以 `SCALE`；画布内一律用 `ptIn` 得到版面像素。
- WebGL 渲染器的像素比设为 `devicePixelRatio × SCALE`，窗口大小变化时重新设置。

## 4. 页面骨架与“笔记”卡

统一的三段式结构让版式整齐：

```html
<section class="slide" data-id="alum" data-title="方法一：沉降（明矾）" data-min="3">
  <div class="frame">                      <!-- grid: 页眉 auto / 主体 1fr -->
    <header class="hd"><div><p class="eyebrow">栏目</p><h2>标题</h2></div>
      <div class="tools"><button class="btn sm" id="alReset">重新开始</button></div></header>
    <div class="body two">                 <!-- 舞台 1fr + 侧栏约 430 px -->
      <div class="stage">
        <div class="duo"><canvas id="cvAlum"></canvas></div>            <!-- 演示 / 实验，可直接拖动点击 -->
        <div class="ctlbar"><button class="btn">加入明矾</button><button class="btn">搅拌</button><button class="btn pri">静置 3 分钟</button></div>
      </div>
      <aside class="side">
        <div class="panel">作答 + <button class="btn pri sm">提交</button> + 状态栏</div>
        <div class="note grow"><h4>笔记 · 沉降</h4><ol><li>…<mark>关键词</mark>… <span class="to">→ 结论</span></li></ol>
          <p class="pit"><b>易错</b><span>明矾<span class="kr">不能</span>杀菌消毒。</span></p></div>
      </aside>
    </div>
  </div>
</section>
```

- **笔记改为弹窗**（水的组成课起）：源码里笔记卡 `.note` 照常写在页面里，启动时 `buildNotes()` 把它移进页面内的 `.notepop` 遮罩（默认 `hidden`），并在页眉 `.tools` 最前面插入“笔记”按钮（芥黄色，打开后变深色）；点 ×、点遮罩空白、按 Esc、翻页都会关闭。弹窗里便签放大（约 680 px 宽、正文 25 px），隐藏回形针以免压住关闭按钮。
- 去掉笔记后，右侧面板只剩作答：内容少时用 `.side.mid` 垂直居中，或把面板并进舞台（例如把“提交”放进档案头），并把舞台里的卡片、图放大填满，不要留大片空白。整页不出现滚动条。
- 竞赛页用 `.body.q`（舞台 : 题目 ≈ 1 : 1.1）。

## 5. 常用交互模式

**总规则**：凡是计分的作答，都是“先作答 → 点‘提交’ → 判对错”；错了不加分，标出正确答案并给理由，然后自动换队。即时反馈只用于不计分的探索（翻牌、演示、虚拟实验的操作）。

| 模式 | 要点 |
|---|---|
| 翻牌 / 揭晓 | 先让学生说，再点开核对；适合封面热身和概念回顾（不计分） |
| 单选 / 判断 | 选好后提交；正确项标绿，选错项标红，附解析 |
| 多选 | 选完提交，分别标出“漏选”（黄框）和“多选”（红框），全对才加分 |
| 排序 | 依次点击编号（再点撤销），排完提交；错的位置改标正确序号 |
| 配对连线 | 全部连完后提交，逐对标出对错（不要“连错就抖动、可以重试”） |
| 填表 | 输入框配“提交 / 显示答案 / 重做”，统计答对数 |
| 拖拽分类 | 卡片拖进（或点进）分类区，全部放完后提交；`setPointerCapture`，位移除以 `SCALE` |
| 排布 / 搭建 | 自由放置，**提交后再判**；错误提交后演示正确答案；检查放置顺序 |
| 找茬 / 点选 | 在图上标记（再点撤销，限定最多几处），提交后判定；**判定区域覆盖整片出错的地方**（区域函数，不是单点半径）；漏找、多标分别标出 |
| 故障诊断 | 给出“病例”（如滤液浑浊），多选可能原因后提交，再给出处理办法 |
| 画图任务 | 老师勾选要画的范围，可计时，画完再揭示标准图 |
| 关系图填空 | 照教材原图布局，点“?”揭晓；可“全部揭晓 / 全部盖住” |
| 虚拟实验 | 按钮 + 直接操作（拖动、点击仪器），错误操作真实地产生后果；用实验记录逐步打勾，完整做对再加分 |
| 课堂演示配合 | 学生上台做真实验时，大屏给计时器、当前步骤和台下“质检员”核对表 |
| 竞赛 | 12 道左右的新题，题型与练习册一致，标“提升”的题双倍；每题有解析；答题队自动轮换 |

计分：课中互动 +5，竞赛题 +10，提升题 +20（或前进两格）；错误不扣分也不加分；判分后调用 `teamNext()`。

- 计算题数字键盘 `kpQuiz(box,items,{pts})`（`quant/src/core.js`）：`items=[{q,ans,kind:'num'|'ratio',unit,tol,why}]`；键盘有数字、小数点、退格、清空，比值题换成“∶”键、百分数题有“%”键；比值答案等比例即判对（不是最简时提示“注意看题目要求”）；`wide:true` 时键盘排成两行；提交后判分、换队、写入同一面板的 `.status`，读数屏播放对 / 错动画。
- 计算器 `calcPad(box,{onFill})`（同文件）：独立一张卡放在题目卡下面，+ − × ÷ ( ) =，“填入答案 ↑”调用 `kp.fill(值)` 把结果填进题目卡；题目已提交时不填。题目卡和计算器不要合在一个键盘里（老师要求分开）。题目项可加 `dp`（要求的小数位数）：位数和数值都对才判对；位数不对或没四舍五入时判错并说明应写成多少。
- 物质选项卡 `molTabs(ctx,G,list,cur,nEx,w)`（同文件）：前 `nEx` 个是讲解例子（“例”），后面对应练习（“练”），两组间有分隔线；点击判定用 `G.cx(i)`、`G.cw`。

## 6. 代码坑速查

- 共享 CSS 里的 `display:grid` 会让 `hidden` 属性失效，要加 `[hidden]{display:none!important}`。
- 特效颜色必须写 6 位十六进制（`#ffffff`）。`#fff` 会被拼成 `rgba(255,15,NaN…)`，导致 `addColorStop` 抛异常。
- `AudioContext` 要在用户手势中 `resume()`；页面初始化时不要播放声音。
- 初始化代码里不要引用后面才声明的 `const`（暂时性死区），需要时直接查 DOM。
- 主循环的 `dt` 要限制为不小于 0（首帧可能为负），否则沿曲线运动的物体会读到越界的点而报错。
- 内联 SVG 必须写明宽高，否则在 flex 容器里尺寸为 0（“这题没有图”）。
- 同一元素上多个 CSS 动画会互相覆盖（错误高亮把弧线绘制动画覆盖了），要拆到不同元素上。
- 笔记卡里用 `<b>`、`<mark>` 时，注意外层样式不要把它们设成块级元素。
- 页码这类短文本加 `white-space:nowrap`，防止换行。
- 标签、按钮的文字不能被截断：审计脚本会报告 `h-clip`。
- 移动端或窄窗不再单独适配：固定画布会整体缩放。
- 全局规则 `.stage>canvas{position:absolute;inset:0}` 会作用到舞台里**任何**直接子画布；要正常排版的画布（例如表格下面的图）加 `position:relative;inset:auto`，或包一层 div。
- flex 容器里直接写“文字 + `<b>` + 文字”，每段都会变成单独的 flex 项而断成几列；把文字包进一个 `<span>`。
- 各页模块里的变量名不要和已有函数重名（例如已有 `function ui()` 又写 `const ui=canvasUI(...)`）：整个文件是同一个作用域，会直接报错，整套课件白屏。
- 一个页面初始化报错，后面的页面全部不工作。用 `$('[data-id="xxx"] .stage')` 选页面，不要写不存在的 `#xxx`。
- **自己的函数不要和公共库重名**。课件模块里的 `function` 声明会被提升并覆盖 `js_head` 里同名的函数，不报错但行为全变：定量认识课里自定义的文字发光 `glow(ctx,s,x,y,opts)` 覆盖了特效库的光点 `glow(ctx,x,y,r,col,a)`，每次粒子特效都把坐标当文字画在屏幕顶端。新增全局函数前先在构建产物里搜一遍同名；构建脚本可以把公共库里的名字改掉（`quant/src/build.py` 的 `_dot`）。
- 公共的 `label()` 会把 `globalAlpha` 直接设成参数 `a`（默认 1）并留在那里。淡入动画里写文字时要传 `a:ctx.globalAlpha`，写完再恢复原值；`hudBox`、`line`、`arrowQ`、`atomBall` 等绘图函数的 `a` 默认取 `ctx.globalAlpha`，否则文字和图形不同步（文字还没出现，箭头已经全亮）。
- **判分不要放进 `setTimeout`**：提交后立即判分、加分、写状态；延时只用于动画。延时回调要带“题号令牌”（换题时 `tok++`，回调里 `if(my!==tok)return`），否则延时期间点“下一题”，旧题的判分会落到新题上（化合价天平：锰酸钾自动显示答案）。会连点的按钮（闪卡选项）点一次先加锁；竞赛到达胜利条件后不再给“下一题”。
- 自动化测试换算画布坐标时，屏幕宽 ≠ 版面宽（缩放比约 0.85），要用 `rect.width / offsetWidth` 换算，否则会误以为拖拽失效。

## 7. 统一工具栏、画布直接操作与字体内嵌

- **工具栏**：舞台内所有操作按钮放在 `<div class="ctlbar">`（绝对定位在舞台底部中间，纸白底、描边、错位投影），纯文字按钮，最多一个 `.pri`，用过的按钮设 `disabled`。画布内容要给底部留出约 70 px。页眉 `.tools` 只放“重新开始”（以及标签切换这类页面级开关）；作答的“提交 / 重做”放右侧面板。
- **直接操作** `canvasUI(cv,{tools,hots,onDrop})`（`assets/lab-draw.js`）：
  - `tools()` 返回可拖动的小仪器 `{id,x,y,r,on,draw}`，拖动时跟随指针并带阴影，原位留半透明占位；用过（`on:false`）变淡。
  - `hots()` 返回可点击区域 `{hit(x,y),act()}`；悬停时光标变成手形。
  - `onDrop(id,x,y)` 判断是否落在目标容器内，成功就 `$('#按钮').click()`——**直接操作和按钮走同一套校验逻辑**，两边结果永远一致。
  - 配套图形：`jarIcon`（试剂瓶）、`dropperIcon`（滴瓶）、`dishIcon`（表面皿）、`cupIcon`（小烧杯）、`trayHint`（“拖进烧瓶”之类的提示）。
  - 每个状态都要有提示：能拖的东西画虚线圈，能点的仪器旁写“点我振荡”“点水龙头通水”。
- **字体内嵌**：`scripts/font_subset.py <源文件...> -o fonts.css` 从 npm 包 `@fontsource/zcool-kuaile`、`@fontsource/noto-sans-sc` 的 latin 与 chinese-simplified 子集里按用字裁剪（需要 `pip install fonttools brotli`；字体包用 `npm pack` 下载后解压到 `FONT_DIR`），三套字形合计约 400 KB。CSS 变量：`--f-hand` 站酷快乐体，`--f-body` 和 `--f-num` 思源黑体。

## 8. 题目卡与隐藏变式（`review4/src/quiz.js`）

复习课的题库统一写成数据，题目卡和变式弹窗由同一个模块生成：

- 题目格式：`{t:'c'|'tf'|'n'|'r', q, o, a, w, unit, dp, tol, pic, pts, v:[3 道变式]}`。`c` 选择、`tf` 判断、`n` 数值（数字键盘；`dp` 规定小数位，位数不对判错并提示）、`r` 比值（等价比判对并提示是否要求最简）。`pic` 放微观示意图，`pts` 覆盖分值（提升题 20）。
- `qView(box,q,{pts,onJudge})`：一道题；`qPanel(box,list,{src})`：一组题加进度格，返回 `{reset,fill}`（`fill` 供计算器“填入答案”）。
- `VARS`：答错后 `VARS.arm(题干元素, q, 出处)`，题干出现粉色虚线和“答错了 · 点题目做变式”，点击弹出 3 道变式（不计分）；进度格红格、小结页“错题回顾”也能打开；翻页时弹窗自动关闭；`VARS.disarm` 在“重新开始”时清除。舞台任务（拖卡、分类、排序）传伪题 `{v:QB.xxxTask}` 即可共用。
- 题库 `qbank.js` 里的构造函数叫 `QC/TF/N/RA`，**不要叫 `C`**（与公共库颜色表重名）。

## 9. 像素角色引擎（`review4/src/pix.js`）

- 角色是代码画的矢量木偶（64×72 画布），再量化到调色板、去掉半透明、加深色外描边，得到像素精灵；按“状态 + 帧号”缓存。状态：idle / attack / hit / jam（卡壳摔倒再爬起）/ win / ko。躺倒姿势在 110×96 的画布上旋转，避免被裁。
- `pxStage(cv,4)`：每 4 个屏幕像素 = 1 个世界像素，返回低分辨率画布 `g` 和 `flush()`；`pixWorld(320,180)` + `blitWorld` 用于固定世界坐标的对战场景。`pr/pdisc/pring/pbox/ptxt` 是像素画工具，`pixParticles()` 是像素粒子，`sfx8()` 是 8-bit 音效，`drawMicro()` 画 ○ / ● 微观示意图。
- 浅色主题下：`ptxt` 的默认投影是白色，标题横幅显式传 `sh:'#1f2a44'`；场景底色、气体、玻璃一律用浅色加墨色描边，不要用纯白直接画在白底上。
