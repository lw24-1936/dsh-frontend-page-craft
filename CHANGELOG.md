# Changelog

## 1.1.0

- **新增规范检查器** `resources/bin/check-standards.mjs`（零依赖 CLI，32 条规则，P0/P1/P2 三级）：
  - 安全 10 条：`eval`/`new Function`、`v-html`、`dangerouslySetInnerHTML`、`target=_blank` 无 `rel`、硬编码密钥、`document.write`、`.innerHTML`、字符串定时器、混合内容、`debugger`。
  - 可访问性 8 条：`img` 无 `alt`、禁止缩放、去 `outline` 无 `:focus-visible`、`html` 无 `lang`、`iframe` 无 `title`、静态元素绑点击、`button` 无 `type`、自动播放未静音。
  - 模板 2 条：`v-for` 无 `key`、同元素 `v-if` + `v-for`。
  - TS/React/卫生 7 条：显式 `any`、`@ts-ignore`、`key={index}`、`var`、`==`、`console.log`、`alert`。
  - HTML/CSS/性能 5 条：缺 doctype、viewport、重复 id、`!important`、内联大图。
  - 支持 `--format json`、`--fail-on`、`--ignore`、`--include`、`--exclude`、`--quiet`、`--max-findings`。
- 新增 `resources/standards.md`：规则总表、依据链接（ESLint/Airbnb/Google/Vue/WCAG/OWASP/web.dev）、与 ESLint 的分工、已知限制、扩展方法。
- 技能流程：阶段 C 增加「规范自检」，阶段 D 增加「先跑检查器再人工验收」门禁；资源路由表补充规则文档与检查器。
- 技能描述补充「实现后必须运行 `bin/check-standards.mjs`，P0 不得存在」。
- 测试：新增 `test/standards.test.mjs`（10 个用例）与 5 个夹具；`npm test` 同时跑结构与检查器测试。
- 文档：README 重写（徽章、目录、快速开始、规则覆盖表、来源、限制）；新增 CONTRIBUTING.md；DETAIL.md 同步。
- 工具链：`npm run standards` 自扫描仓库（排除夹具），CI 增加 Node 20/22/24 上的检查器测试。

## 1.0.0

首个版本。

- 技能 `frontend-page-craft`：需求分析 → 设计 → 实现 → 验收四阶段流程，含门禁与反 AI 味 15 条。
- 组件目录：移动端 10、PC 端 17、可视化/大屏 15、动画 8、编辑器 3、3D 7、其他 8，共 68 条，逐条标注生态、维护状态、适用/不适用与安装包名（`resources/catalog.json` + `component-catalog.md`）。
- 选型矩阵：框架、UI 库、图表、大屏、动效、编辑器、3D、图标字体、数据层。
- 设计方向：4 套视觉方向与可直接复制的 CSS 令牌（含深色模式与可访问性指标）。
- 7 类页面范式：后台、仪表盘、落地页、移动端、数据大屏、文档站、AI 对话。
- 实现手册与验收清单（P0/P1、阈值、VERIFY 模板）。
- 两个可改造样例：`hero-proof.html`、`dashboard-skeleton.vue`。
