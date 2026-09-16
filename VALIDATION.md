# 本次验证

- `node --experimental-strip-types --test tests/*.test.mjs`：23项通过，0失败，0跳过。
- TypeScript 5.9.3 `tsc --noEmit -p tsconfig.json`：退出码0。
- `node --experimental-strip-types examples/demo.mjs`：退出码0；图片到视频的引用为true，自连线为false，空格左拖为pan，2倍缩放下800×600视口换算为400×300世界区域。
- 来源逻辑仅调整类型导入路径，未改动算法。完整应用专用的一项源码匹配测试不在候选包范围，见PROVENANCE.md。

这是本地独立模块验证；没有启动完整画布网站，没有实际模型请求或收费生成，也未验证多平台浏览器交互。

维护者已确认以MIT许可证公开此独立包。当前还没有可核验的社区采用数据。验证通过不等于申请获批或安全性全面审计通过。
