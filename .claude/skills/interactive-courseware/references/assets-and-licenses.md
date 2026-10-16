# 素材来源与授权

## 1. 网络访问现状（云端会话实测）

- **能访问**：GitHub（`git clone`、raw.githubusercontent.com）和 npm 镜像（registry.npmjs.org）。
- **不能访问**：Unsplash、Wikimedia、Poly Pizza、Sketchfab、Poly Haven、kenney.nl、quaternius.com、cdnjs / jsDelivr（容器内被拦截）、百度和中国水网等中文网站。WebFetch 也解析不了这些中文域名。
- 因此所有素材都要从 GitHub 或 npm 获取，转码后 base64 内联进 HTML。发布后的课件也就不依赖任何外部 CDN。
- 遇到官方标志、教材插图这类必须“原样”的图，又查不到时：**请老师把图片文件发过来**（聊天里贴的截图不一定会保存到文件系统），然后按原图描画或嵌入。

## 2. 已验证可用的素材

| 用途 | 来源 | 授权 | 获取方式 |
|---|---|---|---|
| 低多边形模型：房屋、拖拉机、树、鱼、农场、风车、马、船、各类食物等 | `pmndrs/market-assets`（`files/models/*/model.gltf`，`info.json` 中 `license:1` 表示 CC0） | CC0 | `git clone --filter=blob:none --no-checkout`，再用 sparse checkout 取需要的目录 |
| 城市模型：建筑、垃圾箱、垃圾袋、水塔、灌木、汽车、路灯 | `KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0`（`addons/.../Assets/gltf`） | CC0 | `git clone --depth 1` |
| 家具模型 | `KayKit-Game-Assets/KayKit-Furniture-Bits-1.0` | CC0 | 同上 |
| 城市建筑与道路 | `KenneyNL/Starter-Kit-City-Builder`（`.glb`） | CC0 | 同上 |
| 地球贴图（日间、夜间、凹凸 / 粗糙度 / 云层合成图） | `mrdoob/three.js` 的 `examples/textures/planets/`，来自 Solar System Scope | **CC BY 4.0，须署名** | sparse checkout |
| 环境光照 | three.js 自带的 `RoomEnvironment` | MIT | 已打包进 three 包 |
| HDR 天空 / 摄影棚光照（可选） | three.js 的 `examples/textures/equirectangular/*.hdr`（多为 Poly Haven） | CC0 | sparse checkout |
| 图标几何 | npm 包 `@mdi/svg`（Material Design Icons，7000 多个） | Apache 2.0 | `npm pack @mdi/svg` |
| 3D 引擎 | npm `three@0.160.0` + `esbuild` | MIT | 见 `scripts/three-bundle/` |

找不到合适免费模型的东西（例如水龙头、猪），要么换成库里有的近似物（用农场代替养殖场），要么用车削体、平滑弯管、圆角方块精细建模，并配上物理材质。

## 3. 模型处理流程

1. 用 `scripts/convert_glb.mjs` 把 `.gltf` 转成自包含的 `.glb`（要安装 `@gltf-transform/*` 和 `draco3dgltf`）。market-assets 的模型大多用 Draco 压缩，这一步会解压；同时做 dedup 和 prune。
2. 用一个预览页把所有 `.glb` 渲染成网格图检查外观，**所有模型渲染完后在同一帧里截图**，否则会因为缓冲区被清空而看不全。
3. 剔除损坏或不合适的模型（例如这匹马的骨骼蒙皮显示异常）；大于 1 MB 的模型尽量不用。
4. 内联：`const ASSET={glb:{name:base64},tex:{name:base64}}`；运行时用 `glb(name)` 取得克隆，用 `fitModel()` 调整大小和落地。

## 4. 图标规范

- 她不喜欢 3D 表情包式的图标（例如 Microsoft Fluent Emoji），要的是**代码绘制、风格统一、精致**的图标。
- 做法：几何形状取自 Material Design Icons（标准、可识别），再用课件主题的渐变色填充（`assets/icons.js`）。
- 标志类严格按标准：
  - 可回收物：蓝底、白色循环箭头、“可回收物”字样（GB/T 19095—2019 样式）。
  - 禁止标志：红色圆环加 45° 斜杠，内为黑色图形（如火焰，用标准的带内焰火焰图形，避免画成像水滴的形状）。
  - 警告标志：黄底、黑边三角形、黑色图形（如闪电）。
  - 国家节水标志：绿色圆形；左上方白色水滴；白色飘带从左侧向上勾起，托住水滴，再向右舒展，伸出圆的右边缘。按老师提供的原图描画。

## 5. 署名

- 小结页底部（或目录弹窗）加一行小字写明素材来源，README 里也写一份。
- CC0 不强制署名，但写上更规范；CC BY 必须署名。
