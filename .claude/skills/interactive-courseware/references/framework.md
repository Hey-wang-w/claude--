# 单文件课件框架

## 目录
1. 文件结构与构建方式
2. 共享运行时 API
3. 固定画布缩放（屏幕适配）
4. 页面骨架与“笔记”卡
5. 常用交互模式（含判分规则）
6. 代码坑速查

---

## 1. 文件结构与构建方式

每套课件是**一个自包含的 HTML 文件**（`<目录>/index.html`）：CSS、JS、图标、3D 模型和贴图全部内联，断网可用（只有 Google Fonts 是可选的外链，加载失败时回退到系统字体）。

构建方式：用一个 Python 脚本，从已有课件里**抽出共享部分**，再拼上本课的 CSS、HTML 和 JS：

- `head`：`symbols/index.html` 中 `<style>` 之前的部分（改标题和字体链接）。
- `js_head`：`(()=>{\n'use strict';` 到 `/* ================= 1 封面` 之间的工具函数、音效、特效、积分。
- `js_deck`：`/* ================= 翻页框架 ================= */` 到 `</script>` 之间的翻页、目录、键盘、触摸和主循环。
- `dock`：`</main>\n` 到 `<script>` 之间的底栏、目录弹窗、闪屏层和特效画布（要改页码“1 / N”和“建议用时合计约 45 分钟”）。
- 背景 `BG` 模块可以整体替换成符合本课风格的版本。

示例见 `scripts/build_template.py`（水资源课的构建脚本：内联 three.js 打包文件和 base64 素材，套上固定画布）。浅色 2D 课件参考 `review/index.html`；深色霓虹风参考 `ion-structure/index.html`。

源文件（本课的 CSS、HTML、各模块 JS）放在 scratchpad，**不要提交到仓库**；仓库里只放构建产物 `index.html` 和 README。测试截图同样只放 scratchpad。

## 2. 共享运行时 API（来自 `js_head` / `js_deck`）

- DOM：`$(sel,root)`、`$$(sel,root)`；数学：`TAU`、`clamp`、`lerp`、`ease`、`smooth(a,b,x)`。
- `LOW`：低特效模式开关（底栏“特效：高 / 低”），重的效果要判断它。
- `fit(canvas)` → `{ctx,w,h}`：按设备像素比自适应的 2D 画布。`label(ctx,txt,x,y,{size,col,align,weight,font,stroke})` 用于画布文字。
- 音效：`sfx('click'|'pop'|'drop'|'ok'|'bad'|'win'|'whoosh'|'tick'|'zap'|'boom')`；`note(freq,dur,type,vol)` 播放单音。
- 特效：`FX.burst(x,y,n,colors)`、`FX.confetti()`、`burstAt(el,n,colors)`、`flash(col)`、`shake()`。
- 积分：`TEAM.cur`（`'r'` 或 `'b'`）、`TEAM.sc`、`teamAdd(v,tm)`、`teamNext()`、`teamSet(tm)`、`tname(k)` 返回“红队 / 蓝队”。
- 页面模块：`S[id]={enter(),leave(),tick(dt)}`。主循环只调用当前页的 `tick`，翻页时调用 `enter` / `leave`。
- 页面标记：`<section class="slide" data-id="x" data-title="标题" data-min="5" [data-opt]>`。`data-go="next"` 的按钮会自动绑定为“下一页”。
- 导航：方向键、PageUp/PageDown、空格、Home/End、`F` 全屏、左右滑动；地址带 `#p3` 可直达第 3 页（测试时要 `reload` 才生效）。
- 目录弹窗：列出每页的建议分钟数，并提供 ±10 分、清零的积分调整。

## 3. 固定画布缩放（屏幕适配）

她会在不同窗口里打开课件。各元素各自响应式会导致“屏幕适应有偏差”。解决方案（`assets/fit.js`）：

- `#app` 宽固定为 1600 px，高按窗口比例取 900–1200 px；整体用 `transform: scale()` 缩放并居中。底栏和目录弹窗也放进 `#app`，背景画布、特效画布和闪屏层留在外面铺满窗口。
- CSS 里不用 `vw` / `vh`，改为 `calc(var(--vw)*N)` / `calc(var(--vh)*N)`（`--vw:16px`，`--vh` = 画布高 / 100），并删掉窄屏 `@media` 规则。
- 拖拽时位移要除以 `SCALE`；读取 `getBoundingClientRect()` 得到的是缩放后的坐标，与 `clientX` 一致，可以直接用。
- WebGL 渲染器的像素比设为 `devicePixelRatio × SCALE`，窗口大小变化时重新设置。

## 4. 页面骨架与“笔记”卡

统一的三段式结构让版式整齐：

```html
<section class="slide" data-id="earth" data-title="重难点：全球水资源" data-min="5">
  <div class="frame">                      <!-- grid: 页眉 auto / 主体 1fr -->
    <header class="hd"><div><p class="eyebrow">栏目</p><h2>标题</h2></div><div class="tools">按钮</div></header>
    <div class="body two">                 <!-- 舞台 1fr + 侧栏约 30% -->
      <div class="stage">演示 / 3D / 游戏</div>
      <aside class="side">
        <div class="panel">互动、作答</div>
        <div class="note grow"><h4>笔记 · 主题</h4><ol><li>…<mark>关键词</mark>…</li></ol></div>
      </aside>
    </div>
  </div>
</section>
```

- **重难点讲解页**右下方固定放“笔记”卡：暖色横线纸，关键词用荧光笔效果标出，`→` 写结论。
- 舞台和侧栏等高；侧栏里“互动面板”在上、“笔记”占满剩余高度。整页不出现滚动条。
- 竞赛页用 `.body.q`（舞台 : 题目 ≈ 1 : 1.1）。

## 5. 常用交互模式

| 模式 | 要点 |
|---|---|
| 翻牌 / 揭晓 | 先让学生说，再点开核对；适合封面热身和概念回顾 |
| 配对连线 | 先选左边一项再选右边；对了 +5 并锁定，错了抖动 |
| 判断对错 | 每句给出“正确 / 错误 + 理由”，答完自动换队 |
| 多选 + 检查 | 选完点“检查”，分别标出“漏选”和“多选”，全对 +10 |
| 填表 + 检查 | 输入框配“检查 / 显示答案 / 重做”三个按钮，统计答对数 |
| 拖拽分类 | 卡片拖进两个水池（也可以直接点）；`setPointerCapture`，位移除以 `SCALE` |
| 排布 / 搭建类游戏 | 自由放置，**提交后再判**；错误提交结束本关并演示正确答案；检查放置顺序 |
| 画图任务 | 老师勾选要画的题目范围，可计时，画完再揭示标准图 |
| 关系图填空 | 照教材原图布局，点“?”揭晓；可“全部揭晓 / 全部盖住” |
| 计算器式演示 | 参数可调用来出新题，“先算后揭晓”（计算步骤先模糊处理） |
| 竞赛 | 12 道左右的新题，题型与练习册一致，标“提升”的题双倍；每题有解析；答题队自动轮换 |

计分惯例：普通互动 +5，竞赛题 +10，提升题 +20 或前进两格；**错误不扣分也不加分**。每次判分后调用 `teamNext()`。

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

## 7. 统一工具栏与画布直接操作（水的净化课件起）

- **工具栏**：舞台内所有操作按钮放在 `<div class="ctlbar">`（绝对定位在舞台底部中间，纸白底、描边、错位投影），纯文字按钮，最多一个 `.pri`。画布内容要给底部留出约 70 px。页眉 `.tools` 只放“重新开始”。
- **直接操作** `canvasUI(cv,{tools,hots,onDrop})`（见 `purify/index.html` 的 draw 部分）：
  - `tools()` 返回可拖动的小仪器 `{id,x,y,r,on,draw}`，拖动时跟随指针并带阴影，原位留半透明占位；用过（`on:false`）变淡。
  - `hots()` 返回可点击区域 `{hit(x,y),act()}`；悬停时光标变手形。
  - `onDrop(id,x,y)` 判断是否落在目标容器内，成功就 `$('#按钮').click()`——**直接操作和按钮走同一套校验逻辑**，避免两套结果不一致。
  - 配套小图形：`jarIcon`（试剂瓶）、`dropperIcon`（滴瓶）、`dishIcon`（表面皿）、`cupIcon`（小烧杯）、`trayHint`（“拖进烧瓶”之类提示）。
- 画布坐标用版面像素（`fitS` / `ptIn`），注意整体缩放：**屏幕宽 ≠ 版面宽**，自动化测试换算坐标时要用 `getBoundingClientRect().width / offsetWidth`。
- **字体内嵌**：`scripts/font_subset.py <源文件...> -o fonts.css`，从 npm 包 `@fontsource/zcool-kuaile`、`@fontsource/noto-sans-sc` 的 latin 与 chinese-simplified 子集里按用字裁剪（需要 `pip install fonttools brotli`），三套字形合计约 400 KB。构建脚本每次自动重新裁剪，并删掉 Google Fonts 外链。
