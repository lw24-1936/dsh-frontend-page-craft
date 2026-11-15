# 选型决策矩阵

## 决策顺序（不可跳步）

```
技术栈（已有？→ 沿用）
  → 页面类型（后台/营销/移动/大屏/文档/对话）
    → UI 组件库（一套，且与栈匹配）
      → 图表/专项库（按需，能懒加载就懒加载）
        → 动效（最多一个）
          → 明确不做的事
```

**铁律**：项目里已有 UI 库就沿用（哪怕不是最优）；新项目才做完整选型；一个项目只允许一套 UI 组件库、一套图标方案、一条动效曲线语言。

## 1. 框架与构建

| 场景 | 默认 | 替换条件 |
| --- | --- | --- |
| 中后台 / B 端 | Vue3 + TS + Vite | 团队 React 为主 → React + Vite |
| 营销站 / 官网 | React + Next.js 或 Vue3 + Nuxt | 只需单页静态 → 纯 HTML/CSS/JS 更快 |
| 移动 H5 | Vue3 + Vite + Vant | 需要小程序/多端 → uni-app + Vue3 |
| 数据大屏 | Vue3 + Vite（Vue2 项目沿用 Vue2） | 需要复杂交互 3D → 评估 Three.js/Galacean |
| 文档站 | VitePress / Docusaurus | 已有框架 → 框架内做布局 |
| AI 对话产品 | Vue3 或 React + SSE | 需要流式渲染优化 → 用框架原生方案 + 虚拟列表 |

> 版本以项目 `package.json` / lockfile 为准，不要在新代码里硬编码版本号，也不要在文档里写「建议升级到 X」而不核实兼容性。

## 2. PC UI 组件库

| 条件 | 选择 | 理由 |
| --- | --- | --- |
| Vue3 中后台，要中文生态 | Element Plus | 组件全、示例多、团队上手快 |
| 表格/表单极重、设计规范强 | Ant Design Vue | 表格与表单能力最强 |
| Vue3 + TS、主题要自由 | Naive UI | 变量体系好、无强预设 |
| Vue3 / React 双端统一 | Arco Design | 一套设计语言两端可用 |
| React | shadcn/ui + Tailwind | 源码可控、按令牌改，不是黑盒依赖 |
| 确定要 Material | Vuetify 3 | 全量 MD 组件 |
| 配置化 CRUD 为主 | Avue（配 Element） | 表单表格生成快 |
| 存量 Vue2 | Element UI / iView | 只维护不迁移 |

**反模式**：Element Plus + Ant Design Vue 混用；引入 UI 库后又自研一套按钮/弹窗却不对齐令牌。

## 3. 移动 UI 组件库

| 条件 | 选择 |
| --- | --- |
| uni-app + Vue3 | Wot Design Uni（默认）/ uview-plus（业务组件多） |
| uni-app + Vue2 存量 | uView UI |
| 非 uni-app 的 Vue3 H5 | Vant（需确认可新增依赖） |
| React H5 | shadcn/ui 或 Radix 自研 |
| 电商营销向 | NutUI / NutUI-JDT |
| 对话界面 | 自研消息流（ChatUI 仅作参考） |

移动端不引入 PC 组件库；不为了「统一」在移动端塞 Element Plus。

## 4. 图表 / 可视化

决策树：

```
数据量 > 5k 点，或要地图/关系图/3D 图？
├─ 是 → ECharts（大屏默认）或 AntV（定制/图分析）
└─ 否 → 图表数 ≤ 3 且要轻量？
        ├─ 是 → Chart.js 或手写 SVG
        └─ 否 → ECharts（按需引入）
```

| 需求 | 选择 |
| --- | --- |
| 常规业务图表、大屏 | ECharts（`echarts/core` 按需） |
| 图形语法深度定制 / 关系图 / 多维表 | AntV（G2 / G6 / S2） |
| 轻量折线柱状饼 | Chart.js |
| Vue3 想要好看的小组件（迷你图/仪表/词云） | Vue Data UI |
| 企业已有 Highcharts 授权 | Highcharts |
| 地图 | 百度地图系：Vue3 用 vue3-baidu-map-gl，Vue2 用 vue-baidu-map；或 ECharts geo |
| 大屏缩放 | v-scale-screen（固定 16:9） |

规则：图表必须有**标题、单位、图例、空数据文案**；颜色不能只靠色相区分（加形状/纹理/标签）；深色模式单独配色。

## 5. 数据大屏专项

| 决策 | 方案 |
| --- | --- |
| 适配 | 设计稿 1920×1080，用 v-scale-screen 或 `transform: scale` 整体缩放 |
| 布局 | 绝对定位分区 + 12 栅格；顶部标题栏、左右数据区、中央主视图 |
| 装饰 | 自绘 SVG/CSS 边框，不依赖停更的 DataV（Vue3） |
| 滚动 | 列表用 vue3-seamless-scroll；数据更新用定时器 + 过渡 |
| 性能 | 图表合并渲染、离屏暂停动画、`requestAnimationFrame` 节流 |
| 兜底 | 断网/无数据时的占位与时间戳，避免空白大屏 |

## 6. 动效

| 需求 | 方案 |
| --- | --- |
| 微交互（hover/press/展开） | CSS transition（120–200ms） |
| 入场/区块出现 | CSS animation 或 Animate.css |
| 滚动触发 / 时间线 / SVG / FLIP | anime.js |
| 营销页组件级动效（React） | Magic UI（复制源码，别整包引） |
| 轮播/画廊 | Swiper |
| 大屏列表滚动 | vue3-seamless-scroll |

规则：同时最多 1 个动画库；`prefers-reduced-motion: reduce` 时关闭非必要动画；不与输入竞争（动画不阻塞交互）。

## 7. 富文本 / Markdown

| 需求 | 选择 |
| --- | --- |
| 企业级富文本、工具栏成熟 | TinyMCE（注意高级插件授权） |
| Markdown 写作、分屏预览 | Vditor |
| 轻量评论框 | 原生 contenteditable + 消毒，别上重型编辑器 |

## 8. 3D

| 需求 | 选择 |
| --- | --- |
| 模型展示、粒子、场景 | Three.js |
| 游戏/虚拟展厅/物理 | Babylon.js |
| 移动营销互动 3D | Galacean |
| VR/AR 快速原型 | A-Frame |
| WebGPU 实验 | Orillusion（必须准备降级） |
| Vue 内快速展示模型 | vue-3d-loader |

3D 一律动态加载，首屏给静态图/骨架；移动端先测帧率与发热。

## 9. 图标、字体、色彩

| 项 | 默认 |
| --- | --- |
| 图标 | Lucide（React）/ @iconify（通用）/ Element Plus 图标（已在用时）；**禁止 emoji 当图标** |
| 字体 | 系统栈优先（`-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei"`）；中文标题可引入思源黑体子集 |
| 数值/表格 | 等宽数字（`font-variant-numeric: tabular-nums`） |
| 色彩 | 1 强调色 + 中性 9 阶 + 语义色族；用 OKLCH 或 HSL 统一生成 |

## 10. 数据层与状态（够用即可）

| 需求 | 默认 |
| --- | --- |
| 请求 | 项目已有 axios/fetch 封装就复用；新项目用原生 fetch + 薄封装 |
| 服务端状态 | Vue: Pinia + 组合式封装；React: TanStack Query |
| 表单 | Element/Ant 自带校验；复杂表单用 vee-validate / react-hook-form |
| 路由 | 框架自带 |
| 虚拟列表 | 长列表（>200 行）再引入，不要提前上 |

## 11. 什么时候「不引入库」

- 一个按钮、一个弹窗、一个下拉：自研 30 行 CSS 比引入设计体系更可控。
- 只有一个图表：手写 SVG 或 Chart.js，别上 ECharts 全量。
- 只要一段入场动画：CSS keyframes。
- 静态展示页：纯 HTML/CSS，零 JS 也能很高级。

## 12. 选型记录模板（写进 DESIGN.md）

```markdown
## 选型
| 层 | 选择 | 版本来源 | 理由 | 放弃的方案 |
| --- | --- | --- | --- | --- |
| 框架 | Vue3 + Vite | lockfile | 项目既有 | React |
| UI | Element Plus | lockfile | 团队熟悉、表格强 | Naive UI（主题自由但生态弱） |
| 图表 | ECharts（按需） | 新增 | 大屏图表多 | Chart.js（类型不够） |
| 动效 | CSS + anime.js | 新增 | 需要滚动编排 | 只上 CSS（编排不足） |
```

**门禁**：选型表里出现「凭感觉」「听说不错」→ 补一条可验证理由（文档/仓库活跃度/包体/团队经验）。
