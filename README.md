# Jinghe Canvas Core

用于创作画布的 TypeScript 逻辑模块，提取自维护者本地使用的“剧本画布”项目，以 MIT 许可证提供。

Reusable TypeScript logic extracted from the maintainer's local creative-canvas project. Licensed under the MIT License.

## 提供的能力

- **connections**：图片、视频、音频节点之间的引用规则；重复连线与容量判断；连线拖动时的边缘平移增量。
- **imageReferences**：上传图片引用归一化、按来源去重，以及旧字段兼容。
- **mentions**：`@` 查询范围、稳定的节点提及标记、插入、移除和按连线过滤。
- **gestures**：指针按键及修饰键转换为分组、平移、缩放意图。
- **minimap**：视口与世界坐标换算、小地图点击定位及布局。

这些模块不依赖 React 或 Next.js 运行时，不附带界面或生成服务。节点引用的数量上限来自原应用的产品规则，不代表当前任何模型服务的通用限制；集成者应按实际需求调整。

## 运行示例与测试

需要 Node.js 22.18 或更新版本。模块以 TypeScript 源码提供。Node 使用类型擦除运行；其他环境需自行选择支持 TypeScript 的构建工具。

```powershell
node --experimental-strip-types examples/demo.mjs
node --experimental-strip-types --test tests/*.test.mjs
```

以上命令不需要安装依赖，不会调用模型或生成图片、视频。若需类型检查，可先安装开发依赖，再运行 `npm run typecheck`。本次已使用本机现有 TypeScript 编译器验证；未在候选包内安装依赖。

```typescript
import { connections, mentions } from './src/index.ts';

const image = { id: 'image-1', kind: 'image' as const };
const video = { id: 'video-1', kind: 'video' as const };
const allowed = connections.canAddCanvasMediaReference(image, video, []);
const token = mentions.promptMentionToken(image.id);
```

## 范围与来源

来源和提取调整见 `PROVENANCE.md`。此包没有复制 Lovart 界面、图标或下载素材；没有环境密钥、用户数据、媒体文件、模型调用代码或本地Git历史。测试中的 example.com 地址是测试字符串，不会发起请求。

该候选包不是完整网站，测试不能证明完整画布交互或真实模型生成正常。目前只进行本地验证，未声称已有社区用户、星标或下载量。

## 贡献与问题反馈

反馈问题时，请提供最小复现：Node版本、模块名、输入数据、预期和实际结果，以及合成测试。不要在问题或测试中提交密钥、真实用户资料或私人素材。修复应添加对应行为的回归测试。

## 许可证

MIT，见 [LICENSE](LICENSE)。`private: true` 仅防止意外 npm 发布。许可证覆盖本包中的代码，不覆盖未纳入本包的原项目第三方素材。
