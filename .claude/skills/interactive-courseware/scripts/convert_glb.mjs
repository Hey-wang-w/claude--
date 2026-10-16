// 把 .gltf（可能带 Draco 压缩）转成自包含、未压缩的 .glb，便于 base64 内联、无需 Draco 解码器。
// 安装：npm install @gltf-transform/core@4.1.0 @gltf-transform/extensions@4.1.0 @gltf-transform/functions@4.1.0 draco3dgltf@1.5.7
// 用法：node convert_glb.mjs <input.gltf> <output.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const [, , src, dst] = process.argv;
const doc = await io.read(src);
doc.getRoot().listExtensionsUsed().forEach(e => { if (e.extensionName === 'KHR_draco_mesh_compression') e.dispose(); });
await doc.transform(dedup(), prune());
await io.write(dst, doc);
