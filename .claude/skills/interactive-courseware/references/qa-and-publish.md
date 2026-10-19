# 自检、测试与发布

## 1. 测试环境

- Playwright 安装在全局 npm 目录：`require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright')`。不要运行 `playwright install`，Chromium 已预装。
- 新课件的字体已经内嵌，测试截图就是真实字体效果。旧课件（Google Fonts 外链）测试时可以拦截字体请求加快速度：`page.route(/fonts\.(googleapis|gstatic)/, r=>r.abort())`，这时截图里是回退字体，字体效果要另行确认。
- 收集 `pageerror` 和 `console` 中的 error。忽略 `ERR_FAILED`（字体请求被拦截产生的）。注意：页面模块在主循环里出错只会打出 `console.error`，不会触发 `pageerror`，两个都要看；画布空白、没报错时，先查画布有没有尺寸（`offsetWidth`）。
- WebGL 页面的启动参数：`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`。软件渲染很慢：每页至少等 4 秒，点击超时设到 15 秒以上，镜头动画会比真机慢。
- 用 `#pN` 直达某一页时，`goto` 之后还要 `reload()`，因为只改哈希不会重新加载页面。
- 截图、测试脚本、中间文件都放在 scratchpad，不要放进仓库。

## 2. 必做的检查

1. **排版审计**：`node scripts/audit_layout.js <课件.html> [--gl]`。默认检查 1000×650、1024×768、1280×720、1366×768、1920×1080、2560×1080 六种分辨率，报告每页的纵向溢出（`scroll`）、横向截断（`h-clip`）、尺寸为 0 的图和控制台报错。目标是所有页面 `scroll=0`，没有报错。（3D 场景里折叠状态的编号标签被报为 `h-clip` 是正常的。）
2. **逐页截图**：`node scripts/shoot_pages.js <课件.html> <输出目录> [宽x高] [--gl]`，再拼成缩略图总览逐张查看。然后针对每页写一个交互脚本：点按钮、答题，在关键状态截图；动画要在开始、进行中、结束三个时刻各截一次，核对先后顺序。
3. **模拟直接操作**：用 `page.mouse.move / down / move… / up` 模拟真实拖动（中间至少分 8 步移动），用 `page.mouse.click` 点仪器。画布坐标换算：`屏幕坐标 = rect.x + 版面坐标 × (rect.width / offsetWidth)`——屏幕宽不等于版面宽，换算错了会误以为拖拽失效。每个可拖动、可点击的仪器都要测，并确认结果和点按钮一致。
4. **找茬类题目**：在错误区域的左、中、右各点一次，确认都判对；再点一个无关位置，确认判“这里没错”。
5. **偏好对照**：拿着 SKILL.md 第 2、5 节和 `preferences-and-feedback.md` 第 0 节的清单看截图，逐条确认；实验装置再按 `lab-apparatus.md` 第 2 节的空间关系核对表过一遍。
6. **3D 额外检查**：拖动旋转到侧面和背面、滚轮推近后再截图；按 `3d-playbook.md` 第 6 节的清单检查。
7. **数学检查**：各页 `data-min` 之和等于 45，竞赛题数量和计分规则正确，例题的计算结果正确。

## 3. 发布与提交

1. 构建：`python3 <课件>/src/build.py` 生成 `<课件>/index.html`。源文件和构建脚本一起提交。
2. 提交并推送到会话指定的分支，提交信息末尾带上会话要求的署名行。不要创建 PR，除非老师要求。
3. 在 README 里追加或更新这套课件的小节：一段说明加页面表（页 / 内容 / 互动形式），以及素材来源。
4. 发布 Artifact（发布后系统可能提示“wake subscription not registered”，意思只是页面评论不会自动通知到会话，不影响发布和打开；不用向老师长篇解释）：`bash scripts/strip_for_artifact.sh <目录>/index.html <scratchpad>/<名字>.html`（去掉 doctype、html、head、body 和 meta 行），然后用 Artifact 工具发布这个文件。**之后每次更新都用同一个文件路径重新发布**，链接就保持不变。首次发布时加上 icon 和一句描述。
5. 回复老师（中文）：先给链接，再按老师的编号逐条说明改了什么，附页面表；说明哪些做不到、请老师提供什么（例如原图），以及需要老师确认的判断。
