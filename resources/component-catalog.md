# 前端组件库目录（选型用）

来源：`source-notes.md` 记录的三个素材文件 + 官方站点核对。**目录只回答「用哪个」，不回答「怎么用」**——具体 API 以官方文档为准，别凭记忆写组件名。

## 使用方式（三步）

1. 先在下方找到类型（移动 / PC / 可视化 / 动画 / 编辑器 / 3D / 其他）。
2. 只看 `可用` 行；`旧生态` / `停更` 只在维护存量项目时选，新项目一律跳过。
3. 去 `stack-decisions.md` 确认默认项，再看项目既有栈——**已有栈优先，禁止一个项目两套 UI 库**。

状态图例：`可用` = 仍在维护；`旧生态` = 可用但属旧版生态（如 Vue2）；`停更` = 新项目不要选；`商业`/`社区`/`未知` = 见备注。

---

## 1. 移动端

| 组件库 | 生态 | 状态 | 什么时候选 / 别选 | 安装 |
| --- | --- | --- | --- | --- |
| **Wot Design Uni** | uni-app / Vue3 | 可用 | 选：uni-app Vue3+TS 的默认项，组件全、贴近 Vant 手感。别选：非 uni-app 项目 | `wot-design-uni` |
| **uview-plus** | uni-app / Vue3 | 可用 | 选：uni-app Vue3 需要大量业务组件（表单、picker、步骤条）。别选：非 uni-app | `uview-plus` |
| **NutUI** | Vue2/Vue3、React | 可用 | 选：电商/移动端、需要京东风格与营销组件。别选：桌面为主 | `@nutui/nutui` |
| **NutUI-JDT** | Vue2/Vue3 | 可用 | 选：京东科技/金融风格的企业移动端。别选：品牌风格自由的项目 | 见官网 |
| **Taro UI for React** | React / Taro | 旧生态 | 选：存量 Taro 项目保持一致。别选：新 Taro 项目 | `taro-ui` |
| **uView UI** | uni-app / Vue2 | 旧生态 | 选：存量 Vue2 uni-app。别选：Vue3（用 uview-plus） | `uview-ui` |
| **ChatUI** | React | 旧生态 | 选：快速搭对话界面原型。别选：生产级对话产品（自研消息流） | `@chatui/core` |
| **Onsen UI** | Web Components | 旧生态 | 选：Hybrid/Cordova 存量项目。别选：现代 H5 | `onsenui` |
| **Cube UI** | Vue2 | 停更 | 仅滴滴系存量项目 | `cube-ui` |
| **Mint UI** | Vue2 | 停更 | 仅老项目；新项目不要碰 | `mint-ui` |

**移动端默认结论**：uni-app → Wot Design Uni；H5 + Vue3 非 uni-app → Vant（若项目未装，先问是否允许新增依赖）；React H5 → shadcn/ui 或自研 + Radix。

## 2. PC 端（Web）

| 组件库 | 生态 | 状态 | 什么时候选 / 别选 | 安装 |
| --- | --- | --- | --- | --- |
| **Element Plus** | Vue3 | 可用 | 选：Vue3 中后台默认项，中文文档与生态最顺。别选：需要完全自定义设计语言且不愿覆盖变量 | `element-plus` |
| **Ant Design Vue** | Vue2/Vue3 | 可用 | 选：表格/表单重、团队熟悉 Ant 规范。别选：首屏包体敏感且不做按需引入 | `ant-design-vue` |
| **Naive UI** | Vue3 | 可用 | 选：Vue3+TS、主题变量友好、不要预设风格。别选：需要大量行业模板 | `naive-ui` |
| **Arco Design** | Vue3 / React | 可用 | 选：字节风格、Vue/React 双端统一。别选：极致包体敏感 | `@arco-design/web-vue` |
| **Vuetify 3** | Vue3 | 可用 | 选：确定要 Material Design 全量组件。别选：非 Material 品牌 | `vuetify` |
| **Avue** | Vue2/Vue3 + Element | 可用 | 选：配置化 CRUD、快速生成表单表格。别选：高度定制交互（配置化会反噬） | `@smallwei/avue` |
| **shadcn/ui** | React + Tailwind | 可用 | 选：React 默认底座，源码在项目里、按令牌改。别选：非 React/Tailwind | CLI 生成 |
| **Element UI** | Vue2 | 旧生态 | 仅存量 Vue2 后台 | `element-ui` |
| **iView** | Vue2 | 旧生态 | 仅存量（后继 View UI Plus） | `view-design` |
| **Buefy** | Vue2 + Bulma | 旧生态 | 仅 Bulma 存量项目 | `buefy` |
| **hey UI** | Vue2/Vue3 | 旧生态 | 仅存量项目 | `heyui` |
| **Vue Element Admin** | Vue2 模板 | 旧生态 | 选：学习后台骨架/存量参考。别选：Vue3 新项目 | 模板 |
| **Vue Material** | Vue2 | 停更 | 不要选 | — |
| **Vue Bootstrap** | Vue2 + Bootstrap | 停更 | 不要选 | — |
| **Vue-Blu** | Vue2 | 停更 | 不要选 | — |
| **Keen UI** | Vue2 | 停更 | 不要选 | — |
| **Fish-UI** | Vue2 | 停更 | 不要选 | — |

**PC 默认结论**：Vue3 中后台 → Element Plus（复杂表格/表单可上 Ant Design Vue）；Vue3 偏设计自由 → Naive UI；React → shadcn/ui。**一个项目只允许一套**。

## 3. 可视化 / 大屏

| 库 / 资源 | 生态 | 状态 | 什么时候选 / 别选 | 安装 |
| --- | --- | --- | --- | --- |
| **ECharts** | 框架无关 | 可用 | 选：默认图表库，类型全、中文资料多、大屏首选。别选：只要 1 个迷你图（手写 SVG 更轻） | `echarts`（按需引入） |
| **AntV** | G2/G6/S2/L7 | 可用 | 选：图形语法深度定制、关系图（G6）、多维表格（S2）、地理（L7）。别选：常见图表 + 团队不熟 G2 | `@antv/g2` 等 |
| **Chart.js** | 框架无关 | 可用 | 选：轻量常见图表、Canvas 优先。别选：复杂联动/大数据/地图 | `chart.js` |
| **Vue Data UI** | Vue3 | 可用 | 选：Vue3 开箱好看的小图表/仪表/迷你图/词云。别选：需要与 ECharts 生态联动 | `vue-data-ui` |
| **v-scale-screen** | Vue3 | 可用 | 选：数据大屏固定 16:9 缩放。别选：普通响应式页面（会破坏可读性） | `v-scale-screen` |
| **DataV（jiaminghi）** | Vue2 | 旧生态 | 选：存量 Vue2 大屏、需要装饰边框。别选：Vue3（组件不兼容，需自研装饰层） | `@jiaminghi/data-view` |
| **vue-seamless-scroll** | Vue2 | 旧生态 | 选：Vue2 大屏列表滚动。别选：Vue3 | `vue-seamless-scroll` |
| **vue-baidu-map** | Vue2 | 旧生态 | 选：Vue2 + 百度地图。别选：Vue3 | `vue-baidu-map` |
| **vue3-baidu-map-gl** | Vue3 | 可用 | 选：Vue3 + 百度地图 | `vue3-baidu-map-gl` |
| **Highcharts** | 框架无关 | 商业 | 选：企业已有授权、需要成熟交互与导出。别选：无商用授权 | `highcharts` |
| **v-charts** | Vue2 | 停更 | 不要选（官方建议改 vue-echarts） | — |
| **vue-charts.com** | 站点 | 未知 | 仅作为选型线索，未核实前不进生产 | — |

**社区样例站（找 option，不是依赖）**：**ppchart**、**isqqw**、**makeapie**——抄配置可以，别引入包；商用前核对图表作者授权。

## 4. 动画 / 动效

| 库 | 生态 | 状态 | 什么时候选 / 别选 | 安装 |
| --- | --- | --- | --- | --- |
| **anime.js** | 框架无关 | 可用 | 选：时间线编排、滚动触发、SVG/数值动画、FLIP。别选：简单 hover/淡入（CSS 就够） | `animejs` |
| **Animate.css** | CSS | 可用 | 选：快速加入场/强调动画。别选：复杂编排 | `animate.css` |
| **Swiper** | 框架无关 | 可用 | 选：轮播、触摸滑动、画廊。别选：静态三列区块 | `swiper` |
| **vue3-seamless-scroll** | Vue3 | 可用 | 选：大屏/看板列表无缝滚动 | `vue3-seamless-scroll` |
| **Magic UI** | React + Tailwind | 可用 | 选：营销页动效组件（marquee/border-beam/bento/number-ticker）。别选：非 React/Tailwind | 复制源码 |
| **loading.io** | 素材/服务 | 商业 | 选：需要现成 loading 素材。别选：能 CSS 手写 | 服务 |
| **Kinesis** | Vue2 | 停更 | 不要选 | — |
| **Velocity.js** | JS | 停更 | 不要选（CSS/WAAPI 足够） | — |
| **Vue-Motion** | Vue2 | 停更 | 不要选 | — |

**动效结论**：一个页面最多上 **1 个动画库**；简单过渡用 CSS，编排用 anime.js。全站统一时长（120/200/320ms）与同一条缓动曲线，并尊重 `prefers-reduced-motion`。

## 5. 富文本 / Markdown 编辑器

| 库 | 生态 | 状态 | 什么时候选 / 别选 | 安装 |
| --- | --- | --- | --- | --- |
| **TinyMCE** | 框架无关 | 可用 | 选：企业级富文本、成熟工具栏、可自托管。别选：轻量需求；注意部分高级插件需商业授权 | `tinymce` |
| **Vditor** | 框架无关（含 Vue 示例） | 可用 | 选：Markdown（所见即所得/分屏）、文档与博客。别选：Word 式复杂排版 | `vditor` |
| **vue-quill-editor** | Vue2 | 停更 | 不要选（Quill 2 已无该官方封装） | — |

## 6. 3D / WebGL

| 库 | 生态 | 状态 | 什么时候选 / 别选 | 安装 |
| --- | --- | --- | --- | --- |
| **Three.js** | 框架无关 | 可用 | 选：默认 3D 底层，模型展示/场景/粒子。别选：只要伪 3D 视差 | `three` |
| **Babylon.js** | 框架无关 | 可用 | 选：3D 游戏、虚拟展厅、要物理/后处理。别选：轻量模型展示 | `@babylonjs/core` |
| **Galacean** | Web（蚂蚁） | 可用 | 选：移动优先互动/营销 3D。别选：桌面重 3D | `@galacean/engine` |
| **A-Frame** | Web / VR | 可用 | 选：快速 VR/AR 场景、声明式标记。别选：性能敏感复杂应用 | `aframe` |
| **Orillusion** | WebGPU | 可用 | 选：高性能 WebGPU 实验项目。别选：要覆盖旧浏览器（必须准备降级） | `@orillusion/core` |
| **vue-3d-loader** | Vue2/Vue3 | 旧生态 | 选：Vue 里快速展示 glTF/OBJ。别选：要交互与自定义材质 | `vue-3d-loader` |
| **Lingo3D** | React | 旧生态 | 选：React 声明式搭 3D 场景。别选：长期维护保证要求高 | `lingo3d` |

**3D 结论**：先问「是否真的需要 WebGL」——首屏 3D 会把 LCP 拖垮。需要时默认 Three.js，加载器懒加载 + 静态降级图。

## 7. 其他与素材

| 项 | 类型 | 状态 | 用法 |
| --- | --- | --- | --- |
| **shadcn/ui** | React UI 底座 | 可用 | 组件源码进项目，按设计令牌改；配 Tailwind |
| **Inspira UI** | Vue3/Nuxt 动效组件 | 可用 | 落地页现成动效；非 Nuxt/Tailwind 栈别用 |
| **v3-color-picker** | Vue3 组件 | 未知 | 颜色选择器备选；维护度需核对 |
| **DataEase** | BI 产品 | 可用 | 要报表平台而非手写页面时选 |
| **vue3-vant-mobile** | Vue3 + Vant 模板 | 可用 | 移动 H5 起项目骨架 |
| **shaders.com** | 着色器素材 | 未知 | 背景效果线索；商用前核对授权 |
| **leibox** | 未知 | 未知 | 素材线索，未核实前不引入 |
| **Axhub** | 原型/图表资源 | 社区 | 找原型组件与图表参考，不是代码依赖 |

## 8. 引入成本与包体（判断依据）

| 类别 | 典型增量（gzip，粗略） | 对策 |
| --- | --- | --- |
| Element Plus / Ant Design Vue / Arco / Naive | 80–200KB+ | 按需引入、路由级分包 |
| ECharts | 100KB+（全量）；按需 30–60KB | `echarts/core` + 只注册用到的 chart/component |
| Chart.js | ~60KB | 只用需要的 controller |
| Swiper | ~25KB | 只引入用到的模块 |
| Three.js | ~150KB+ | 动态 `import()`，首屏不加载 |
| TinyMCE / Vditor | 200KB–1MB+ | 只在编辑页加载 |
| anime.js | ~17KB | 可接受；别和别的动画库叠加 |

## 9. 生命周期核对方法（比记结论可靠）

1. 打开官方仓库：最近提交时间、开放 issue 响应、是否有 v2/v3 迁移说明。
2. 看官方文档是否还在更新对应框架版本（如 Vue3/React 18+）。
3. 看包管理器页面：近 12 个月是否有发布、周下载量是否断崖。
4. **结论写进 DESIGN.md 的「选型理由」，不要只写库名**；素材里的库若已停更，明确写「仅因存量项目选择」。
