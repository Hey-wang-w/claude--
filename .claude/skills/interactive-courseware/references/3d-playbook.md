# 3D 场景手册（three.js）

## 目录
1. 什么时候用 3D
2. 引擎搭建（打包、共享渲染器、轨道控制、标签）
3. 材质与光照
4. 常用构件：水、水流、粒子、地形沙盘、模型
5. 真实比例与镜头编排
6. 细节打磨清单（老师指出过的问题）
7. 性能与测试

---

## 1. 什么时候用 3D

- **默认不用 3D。** 老师的最新要求是：“用户不主动要求，不使用 3D 制作演示场景。”演示用精致的 2D Canvas / SVG 动画，这正是老师最满意的第三单元课件的做法。
- 老师主动要求 3D 时，**模型必须用 Blender 制作**（老师的原话：“它能做成更精美的 3D 模型，没有就先安装”）。three.js 只负责在课件里显示和交互，不用它的基本几何体拼凑模型。
- 3D 的完成度不能低于同一套课件里的 2D 页面。

## 1.5 Blender 建模流程（已在云端环境实测）

安装（无界面，作为 Python 模块使用）：

```bash
python3 --version            # bpy 5.x 需要 Python 3.13；4.x 需要 3.11
python3 -m venv <scratchpad>/bl && <scratchpad>/bl/bin/pip install bpy   # 约 400 MB，PyPI 可访问
# 备选：apt-get install blender（Ubuntu 源可访问，版本较旧，运行时用 blender -b -P script.py）
```

建模脚本（`<scratchpad>/bl/bin/python model.py`）的要点：

- `bpy.ops.wm.read_factory_settings(use_empty=True)` 清空场景；单位按真实尺寸设置（例如 1 单位 = 1 dm），方便表现真实比例。
- 造型：从基本体或曲线出发，配合倒角修改器（Bevel）、表面细分（Subdivision Surface）、`shade_smooth` 和自动平滑法线；器皿用“车削”（曲线加 Screw 修改器）；管道用曲线挤出；动物、植物等复杂模型优先导入 CC0 模型，在 Blender 里修整、重新上材质。
- 材质：只用 Principled BSDF。玻璃设 `Transmission Weight=1`、`Roughness≈0.05`、`IOR=1.5`；金属设 `Metallic=1`、`Roughness≈0.15`；水设透射加浅青色。这些参数导出到 glTF 后，three.js 会对应到 `MeshPhysicalMaterial`。
- 导出前应用修改器，并控制面数（单个模型最好在 5 万三角面以内）：`bpy.ops.export_scene.gltf(filepath=..., export_format='GLB', export_apply=True)`。
- 预览：用 Cycles CPU 低采样渲一张 PNG 检查造型；或者直接放进 three.js 查看器，用 Playwright 截图检查。
- 动态（水位上升、倒水、粒子）仍在 three.js 里做：Blender 负责静态的精美模型，交互和动画在课件里实现。
- 内联：GLB 转 base64 放进 `ASSET.glb`，用 `glb(name)` 加载（见第 4 节）。

## 2. 引擎搭建

**打包**：环境里的 CDN 访问不了，而且课件要离线使用，所以用 npm 安装 `three@0.160.0` 和 `esbuild`，把 three、`GLTFLoader`、`RoomEnvironment`、`RoundedBoxGeometry`、`BufferGeometryUtils` 打成一个 IIFE（见 `scripts/three-bundle/`），内联进课件。不要用 `build/three.min.js`：它在 r150 之后已废弃，第一行的 `console.warn(...)` 后面跟着逗号，删掉这一行会导致语法错误。

**共享渲染器**（`assets/engine3d.js`）：
- 整套课件只用**一个** `WebGLRenderer`，翻到哪一页就 `R3.attach(view)`，把画布移到那一页的舞台里。避免创建多个 WebGL 上下文。
- 每个场景是一个 `View`：自带场景和相机，以及自写的轨道控制（拖动旋转、滚轮 / 双指缩放、惯性、俯仰角限制、`flyTo()` 平滑运镜、右下角“复位”按钮）。
- 点选用 `view.picks` 加 `onPick(key)`（给模型分组加一个不可见的球体作为命中区域）；也可以用 `onTap(ray)` 自己做射线检测。
- **标签**是 HTML 叠层：`view.label(html,[x,y,z],{cls,ax,click})`。每帧投影到屏幕，并**限制在舞台范围内**（`ax`：`-100%` 表示标签放在锚点左侧，`0%` 表示右侧，默认居中）。可点击的编号标签（“1 蒸发”）适合分步揭晓。
- 每页模块里懒加载场景：`enter(){ if(!v) build(); R3.attach(v); }`；`tick(dt){ …更新动画… v.render(dt); }`。

## 3. 材质与光照

- 环境光照：`PMREMGenerator.fromScene(new RoomEnvironment())`，金属和玻璃有了真实反射，不需要外部 HDR 文件。
- 灯光：半球光 + 一盏带阴影的平行光。阴影要设置 `bias≈-0.0004` 和 `normalBias≈0.03`，否则大圆盘的扇形三角面上会出现放射状条纹。
- 色调映射：`ACESFilmic`，曝光约 0.95；输出色彩空间为 sRGB。
- 玻璃：`MeshPhysicalMaterial({transmission:1, roughness:.03, thickness:.08, ior:1.5, transparent:true, depthWrite:false})`；`LOW` 模式下改用菲涅尔着色器的轻量玻璃。
- 金属（铬）：`metalness:1, roughness:.14, envMapIntensity:2.6`。粗糙度太低时会反射出环境里的暗面，看起来发黑。
- 水：带清漆的半透明 `MeshPhysicalMaterial`；容器里的水柱不要渲染底面圆片。
- 地球：真实贴图（日间贴图 + 粗糙度贴图 + 云层 alphaMap）。大气光晕用背面球加 `smoothstep` 衰减，并在球面边缘加一层菲涅尔亮边。环境反射强度降到约 0.12，避免海面出现多个白色高光。**镜头距离要让光晕完整落在画面内**，否则光晕会被方形画布裁切。

## 4. 常用构件（都在 `assets/engine3d.js`）

- `WaterCol(R,color,opacity)`：圆柱水体，`set(y0,y1)` 设置水位；顶面是 `RipDisc` 波纹面，`hit(x,z,amp)` 产生向外扩散的涟漪。
- `glassCyl(R,H,{ticks})`：带刻度和杯口的玻璃容器。
- `Stream`：沿 Catmull-Rom 曲线的管状水流，用来表现倒水和调水。
- `Parts`：加色混合的粒子（蒸发、雨、蒸腾），亮度就是透明度。表现污染时改用普通混合的深色粒子。
- 高度场地形：`PlaneGeometry` 旋转后逐顶点设置高度，配合顶点颜色（草地、岩石、雪、河岸、田垄条纹）。**一定要加 `skirt()` 侧壁**，否则从侧面看地形像悬空的薄片。河道在高度函数里下挖，再铺一层水平的水面。
- 模型：`glb(name)` 返回克隆的模型，`fitModel(obj,height)` 按高度缩放、落地并居中，`stripBase(obj)` 去掉模型自带的地面圆盘。放到地形上时，`y` 取地形高度并略微下沉。
- 可点击标记：用画布绘制贴图的精灵（`badge('?')`），发现后变“!”，处理完变“✓”。

## 5. 真实比例与镜头编排

老师要求“直接使用实际比例，倒进小杯子时采用镜头放大的效果聚焦”。做法：

- 先定单位：1 个单位 = 1 dm，因此 1 L = 1 dm³，水位高度 = V / (πR²)。100 L 水箱（R = 2.3）中淡水层只有约 0.15 dm 厚——这层“薄”本身就是教学重点。
- 每一步配一个预设镜头 `VIEW={all,top,pour,bk,cup}`，进入该步时 `flyTo`。长过程分阶段运镜：先拉远看全局，再推近细节，最后拉回全景对比大小。
- 标签只在当前步骤显示，过时的标签及时隐藏，避免重叠。
- 物理过程要合理：冰浮在水上，所以“冰川部分”采用“原地冻结”（颜色变白、表面变粗糙、涟漪停止），而不是把冰块塞在水底；倒水时，倒出一方的水位要同步下降。

## 6. 细节打磨清单（交付前逐条看截图）

- [ ] 模型贴地，没有悬空的农田、拖拉机或标签。
- [ ] **没有共面的面**（深度冲突会导致闪烁）：容器底座不能和台面平齐（抬高约 5 mm）；相邻的方块不能共用侧面（中间那块缩小约 0.004）；地形侧壁的底边与下面土层的顶面恰好相接、不重叠；不要再叠加同位置的“顶板”。老师两次截图指出过这种闪烁。
- [ ] 透明面不交错（海水体积顶面与波浪面之间留一点间距；体积做成接近不透明）。
- [ ] 地形和沙盘有侧壁；从任意角度旋转都不会露出破绽（用拖动后截图来检查）。
- [ ] 光晕、阴影完整，没有放射状条纹或方形裁切。
- [ ] 高光只有一个主光源的高光，环境反射不过亮。
- [ ] 标签不重叠、不跑出画面，文字可读（字号不小于 12 px）。
- [ ] 颜色有层次：深色背景上，物体要有明暗和轮廓，不能糊成一片。
- [ ] 每个过程符合物理和化学事实，比例数字与笔记一致。
- [ ] 难做的模型（动物、器具）先找免费模型库；找不到时精细建模（例如车削体加平滑弯管做水龙头）。不要用几个球和方块凑。

## 7. 性能与测试

- 像素比上限 2；`LOW` 模式下关闭透射材质，减少粒子数量。
- 无头浏览器测试需要启动参数：`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`。软件渲染很慢：等待时间要加长，点击超时设到 15 秒以上；动画进度会落后于真实设备，这属于正常现象。
- 旋转后的视角要专门截图检查（用鼠标拖动模拟）。
