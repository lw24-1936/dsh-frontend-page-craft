# 前端页面工坊（dsh-frontend-page-craft）

一个技能插件：让 Agent 按「需求分析 → 设计 → 实现 → 验收」四阶段做前端页面，并基于内置组件库目录做选型，而不是凭记忆拼组件。

## 它解决什么

- **只出代码不出判断**：默认先产出 BRIEF（可测验收标准）与 DESIGN（视觉方向 + 令牌 + 组件映射），再写代码。
- **AI 味页面**：15 条硬清单 + P0/P1 验收清单，紫渐变三卡片、emoji 图标、假数据这类默认输出会被明确拦下。
- **选错库**：组件目录带生态、维护状态、适用/不适用与引入方式；Vue2 时代的停更库会被标 `停更`，新项目不再误选。
- **四态缺失**：loading / empty / error / 边界是必经分支，不是可选项。

## 技能内容

| 文件 | 作用 |
| --- | --- |
| `skills/frontend-page-craft.md` | 主流程：页面类型判定、Brief、DESIGN、实现顺序、验收门禁、反 AI 味 15 条、资源路由 |
| `resources/component-catalog.md` | 组件库目录（68 条）：移动 10 / PC 17 / 可视化 15 / 动画 8 / 编辑器 3 / 3D 7 / 其他 8，含选与不选的理由 |
| `resources/catalog.json` | 同一目录的机器可读版（名称、生态、状态、链接、安装包名、适用场景） |
| `resources/stack-decisions.md` | 选型矩阵：框架、UI 库、图表、大屏、动效、编辑器、3D、图标字体、数据层 |
| `resources/design-direction.md` | 4 个视觉方向 + 可直接复制的 CSS 令牌配方 + 层级/间距/动效/深色/可访问性 |
| `resources/page-archetypes.md` | 7 类页面范式：后台、仪表盘、落地页、移动端、数据大屏、文档站、AI 对话 |
| `resources/implementation-playbook.md` | 代码骨架（原生/Vue3/React）、四态、请求层、表格、表单、图表、响应式、安全与常见 bug |
| `resources/qa-checklist.md` | P0/P1 验收清单与阈值，附 VERIFY.md 模板 |
| `resources/examples/hero-proof.html` | 可直接打开的落地页样例（编辑杂志方向） |
| `resources/examples/dashboard-skeleton.vue` | 仪表盘骨架样例（状态机 + 表格 + 骨架屏） |

正文只放流程与判据，细节走 `resourceBase` 按需读取，避免一次塞进上下文。

## 安装

从 GitHub 安装（需要能访问 github.com）：

```bash
# 会话内
plugin_manager { action: "install_bundle", target: "github:lw24-1936/dsh-frontend-page-craft" }

# 或应用自带 CLI（desktop profile 必须用它）
"D:\Program Files\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd" \
  plugin --profile desktop add github:lw24-1936/dsh-frontend-page-craft
```

本地开发（改源码即时生效）：

```bash
dsh plugin --profile desktop add link:<本目录绝对路径>
```

也可以直接在会话里 `plugin_manager install_bundle`，target 传本地目录的 `file:` 或 `link:` 规格。

安装或升级后重载插件（或新开会话），技能目录里应出现 `frontend-page-craft`，`skill` 工具可直接加载；输入框输入 `/` 也能在「技能」分组里选到。

## 使用

会话里说「做个 XX 页面」「重做这个界面」「帮我选组件库/图表库」「搭个数据大屏」，技能会按其 description 自动加载；也可显式：

```
skill frontend-page-craft
```

## 配置

插件只有一个开关（可选）：`config.enabled=false` 时跳过注册，便于临时停用而不卸载。

## 边界

- 不安装依赖、不改用户项目：只给流程、判据与代码骨架；装包前必须经用户确认。
- 组件库 API 与版本以官方文档为准；目录只做选型，不替代查文档。
- `unknown` 状态的条目（shaders.com、leibox、vue-charts.com、v3-color-picker）未核实，未核实前不引入生产。
- 生命周期结论核对于 2026-11-15，后续可能变化，采用前按 `component-catalog.md` 第 9 节方法复核。

## 开发

```bash
npm run check   # 语法检查
npm test        # 结构/内容一致性测试
npm run verify
```

## License

MIT
