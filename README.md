# 前端页面工坊 · dsh-frontend-page-craft

[![ci](https://github.com/lw24-1936/dsh-frontend-page-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/lw24-1936/dsh-frontend-page-craft/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![dsh](https://img.shields.io/badge/dsh-%3E%3D0.2.0-5b21b6.svg)](https://github.com/deepseek-ai/dsh)

> DeepSeek Harness 技能插件：把「做个页面」变成 **需求分析 → 设计 → 实现 → 验收** 四步可交付的工程，并内置 32 条前端规范红线检查器与 68 个组件库选型目录。

---

## 目录

- [它解决什么](#它解决什么)
- [快速开始](#快速开始)
- [能力](#能力)
- [规范检查器](#规范检查器)
- [工作方式](#工作方式)
- [目录结构](#目录结构)
- [规则来源](#规则来源)
- [开发与验证](#开发与验证)
- [已知限制](#已知限制)
- [贡献](#贡献)
- [许可](#许可)

## 它解决什么

AI 直接写页面，常见四个问题：

1. **只出代码，不出判断**：没有需求边界、没有视觉主张，拼出来的页面「能用但廉价」。
2. **AI 味**：紫蓝渐变 + 三张等宽卡片 + emoji 图标 + Lorem 假数据 + 只有 happy path。
3. **选错库**：Vue2 时代的停更库还在被推荐，一个项目混两套 UI 框架。
4. **规范欠账**：XSS、`target=_blank` 无 `rel`、`img` 无 `alt`、`v-for` 无 `key`、去掉焦点环——上线后才被发现。

这个插件把四个问题变成四道门禁：Brief 的可测验收标准、DESIGN 的方向与令牌、32 条规范检查、P0/P1 验收清单。

## 快速开始

### 安装

```bash
# 会话内
plugin_manager { action: "install_bundle", target: "github:lw24-1936/dsh-frontend-page-craft" }

# 或应用自带 CLI（desktop profile 必须用它）
"D:\Program Files\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd" \
  plugin --profile desktop add github:lw24-1936/dsh-frontend-page-craft
```

本地开发直接链目录，改源码即时生效：

```bash
dsh plugin --profile desktop add link:<本目录绝对路径>
```

### 使用

会话里说「做个 XX 页面」「重做这个界面」「帮我选组件库/图表库」「搭个数据大屏」，技能会按描述自动加载；也可显式 `/frontend-page-craft` 或让模型调用 `skill frontend-page-craft`。

实现完成后跑规范检查：

```bash
node <插件目录>/resources/bin/check-standards.mjs --path . --fail-on p1
```

## 能力

### 四阶段流程

| 阶段 | 产物 | 门禁 |
| --- | --- | --- |
| A 需求分析 | `BRIEF.md`：用户、场景、真实内容、状态清单、**可测**验收标准 | 出现「好看/大气」这类不可测词 → 不进入设计 |
| B 设计 | `DESIGN.md`：4 选 1 视觉方向 + CSS 令牌 + 布局骨架 + 组件映射表 | 组件名必须来自目录，禁止凭记忆 |
| C 实现 | `src/…`：骨架 → 静态内容 → 四态 → 交互 → 响应式 → 动效 → 清理 | 装依赖前必须确认 |
| D 验收 | `VERIFY.md`：规范检查 + P0/P1 清单 + 证据 | P0 未过不宣称完成 |

### 内置资产

- **组件库目录 68 条**：移动 10 / PC 17 / 可视化 15 / 动画 8 / 编辑器 3 / 3D 7 / 其他 8，逐条标注生态、维护状态（可用 / 旧生态 / 停更 / 商业 / 社区 / 未知）、适用与不适用、安装包名。
- **设计方向 4 套**：克制专业、编辑杂志、产品化 SaaS、实验未来，各附可直接复制的 CSS 令牌（含深色模式）。
- **页面范式 7 类**：后台、仪表盘、落地页、移动端、数据大屏、文档站、AI 对话，含线框、必备区块、常见坑。
- **实现手册**：Vue3/React 代码骨架、四态、请求层、表格、表单、ECharts 按需引入、响应式、可访问性、性能。
- **验收清单**：P0/P1 与阈值（对比度 4.5:1、44px 触控、390/768/1440、首屏 JS ≤ 200KB、LCP ≤ 2.5s）。
- **反 AI 味 15 条**：从配色、图标、层级、假数据到动效克制的逐条自检。

## 规范检查器

零依赖单文件，32 条规则，每条带出处。三级判定：

| 级别 | 含义 | 默认行为 |
| --- | --- | --- |
| P0 | 安全/可访问性阻断 | 退出码 1（`--fail-on p0`） |
| P1 | 违反公认规范 | 发布前建议 `--fail-on p1` |
| P2 | 卫生项 | 仅报告 |

```bash
# 基本用法（目录或单个文件）
node resources/bin/check-standards.mjs
node resources/bin/check-standards.mjs --path src/App.vue

# 发布前严格模式
node resources/bin/check-standards.mjs --path src --fail-on p1

# 机器可读
node resources/bin/check-standards.mjs --format json > standards.json

# 忽略规则 / 限定类型 / 排除目录
node resources/bin/check-standards.mjs --ignore js/no-console --include .ts,.vue --exclude legacy

# 用忽略文件批量豁免（不传时自动读取目标目录下的 .standardsignore）
node resources/bin/check-standards.mjs --ignore-file .standardsignore

# 列出全部规则 id（配 --ignore 用）
node resources/bin/check-standards.mjs --list-rules
```

扫描 `.js/.mjs/.cjs/.jsx/.ts/.tsx/.mts/.cts/.vue/.svelte/.astro/.html/.htm/.css/.scss/.less`；`.svelte/.astro` 目前只走模板标签与样式规则（脚本规则未解析）。

覆盖范围：

| 域 | 规则数 | 例子 |
| --- | --- | --- |
| 安全 | 10 | `eval`/`new Function`、`v-html`、`dangerouslySetInnerHTML`、`target=_blank` 缺 `rel`、硬编码密钥、`document.write` |
| 可访问性 | 8 | `img` 缺 `alt`、禁止缩放、去 `outline` 无 `:focus-visible`、`iframe` 缺 `title`、静态元素绑点击 |
| 模板 | 2 | `v-for` 缺 `key`、同元素 `v-if` + `v-for` |
| TypeScript / React / 卫生 | 7 | 显式 `any`、`@ts-ignore`、`key={index}`、`var`、`==`、`console.log` |
| HTML / CSS / 性能 | 5 | 缺 doctype、viewport 缺 `width=device-width`、重复 `id`、`!important` 泛滥、内联 base64 大图 |

完整规则、依据链接与限制见 [resources/standards.md](resources/standards.md)。

CI 集成：

```yaml
- run: node resources/bin/check-standards.mjs --path . --exclude fixtures --fail-on p1
```

## 工作方式

1. **判页面类型**：7 类范式之一，决定骨架、密度与必读资源。
2. **Brief**：只在阻塞时问不超过 3 个问题，其余写进「假设」。
3. **Design**：先方向、再令牌、最后组件映射；一个页面 1 个强调色、1 套圆角阴影。
4. **实现**：每步可运行；四态齐全；动效最多 1 个库。
5. **验收**：先跑检查器，再按清单勾选；不能开浏览器时明确写「视觉未验证」。

## 目录结构

```
lib/index.js                     插件入口（注册技能）
skills/frontend-page-craft.md    主流程与门禁（模型加载的正文）
resources/
  component-catalog.md           组件库目录（人读）
  catalog.json                   组件库目录（机器可读，68 条）
  stack-decisions.md             框架/UI/图表/动效/编辑器/3D 选型矩阵
  design-direction.md            4 套方向 + CSS 令牌
  page-archetypes.md             7 类页面范式
  implementation-playbook.md     代码骨架与实现细节
  qa-checklist.md                P0/P1 验收清单
  standards.md                   32 条规范红线与依据
  bin/check-standards.mjs        规范检查器（零依赖 CLI）
  examples/                      可直接改造的样例
locale/{en,zh}.json              插件页标题与描述
docs/DETAIL.md                   插件详情页
test/                            结构测试 + 检查器测试 + 夹具
```

## 规则来源

规则不是自创，全部对应公开标准：

- [ESLint 规则](https://eslint.org/docs/latest/rules/)（`no-eval`、`no-var`、`eqeqeq`、`no-console`…）
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)、[Google JS](https://google.github.io/styleguide/jsguide.html) / [TS Style Guide](https://google.github.io/styleguide/tsguide.html)
- [typescript-eslint](https://typescript-eslint.io/rules/)（`no-explicit-any`、`ban-ts-comment`）
- [Vue 官方风格指南](https://vuejs.org/style-guide/)（Priority A：keyed v-for、v-if 不与 v-for 同元素）
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)（1.1.1、1.4.2、1.4.4、2.1.1、2.4.7、3.1.1、4.1.2）
- [OWASP XSS 防护速查表](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [web.dev Core Web Vitals](https://web.dev/articles/vitals)（LCP 2.5s / CLS 0.1 / INP 200ms）

## 开发与验证

```bash
npm run check      # 语法检查
npm test           # 结构测试 + 检查器测试（29 个用例）
npm run standards  # 自扫描本仓库（排除测试夹具）
npm run verify     # 全部
```

CI 在 Node 20 / 22 / 24 上跑同样的检查。

## 已知限制

- 检查器是**行级**扫描，不做 AST：跨行属性、跨行模板字符串可能漏报；`.vue` 脚本里的字符串若含标签文本可能误报。
- `.svelte` / `.astro` 只检查模板标签与样式，不检查其中的脚本逻辑。
- HTML 内联 `<script>` 不按 JS 规则检查，请拆到独立文件。
- 不测量运行时：对比度、焦点顺序、LCP/INP 需浏览器或 Lighthouse 实测。
- 密钥规则是启发式，命中后需人工确认。
- 组件库维护状态核对于 2026-11-15，之后可能变化；采用前请按 `resources/component-catalog.md` 第 9 节复核。
- 不自动装依赖、不改用户项目；装包前必须确认。

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。新增规则需要：规则条目 + 夹具 + 测试 + 文档总表同步。

## 许可

[MIT](LICENSE)
