# 打包 three.js（离线内联用）

```bash
mkdir -p /tmp/tb && cp entry.js /tmp/tb/ && cd /tmp/tb
echo '{"name":"b","private":true}' > package.json
npm install --silent three@0.160.0 esbuild@0.20.2
npx esbuild entry.js --bundle --minify --format=iife --outfile=three-bundle.js   # 约 700 KB
```

`entry.js` 把 three 与 `GLTFLoader`、`RoomEnvironment`、`mergeVertices`、`RoundedBoxGeometry` 一起挂到 `window.THREE`。
需要别的扩展（例如 `RGBELoader`、`OrbitControls`）时，在 entry.js 里加一行 import 即可。
