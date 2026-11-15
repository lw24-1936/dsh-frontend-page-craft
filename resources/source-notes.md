# 素材来源与整理说明

本插件的组件目录来自用户提供的三个文件，整理时做了去重、分类、生命周期标注与选型建议；**原始条目一个没丢**（见 `catalog.json`）。

## 1. `前端组件库.md`（11.6 KB，251 行）

八大类：移动端组件库、PC 端组件库、数据可视化（数据大屏）、动画组件库、文本编辑器、3D 组件库、其他组件库、扩展（报表/移动模板/原型图表）。共 60 余条，含官网链接与少量说明。

原文特点：以「链接清单」为主，缺少版本、生态、维护状态与选择依据——这些是本插件补的。

## 2. `常用优质组件库.docx`（7.1 KB）

只有一个标题「常用优质组件库」和 5 个链接：

| 链接 | 归类 |
| --- | --- |
| https://animejs.com/documentation | 动画：anime.js |
| https://www.shadcn.net/zh/docs | PC/React：shadcn/ui |
| https://magicui.design/ | 营销页动效组件：Magic UI |
| https://shaders.com/ | 着色器素材（未核实） |
| https://leibox.pantoria.cn/ | 未分类（未核实） |

## 3. `可视化组件.md`（802 B，24 行）

10 个链接：Vue Data UI、Highcharts、vue-charts.com、ppchart、DataV、Chart.js 中文站、isqqw、v-scale-screen、vue-seamless-scroll、vue3-baidu-map-gl。**全部并入「可视化 / 大屏」类**，其中 v-scale-screen 原文只在可视化文件出现，是数据大屏适配的关键补充。

## 整理规则

1. 同一库在多个文件重复出现 → 合并为一条，保留最完整的链接。
2. 只给链接、无描述的条目（shaders.com、leibox、vue-charts.com、v3-color-picker）→ 标 `unknown`，写「未核实前不引入生产」。
3. 社区样例站（ppchart / isqqw / makeapie）→ 标 `community`，明确「不是依赖」。
4. 生命周期判断依据：生态版本（Vue2/Vue3）、官方仓库活跃度、是否有官方迁移说明；结论写进 `catalog.json` 的 `status` 字段，并在 `component-catalog.md` 解释「选 / 不选」的理由。
5. 未在素材中出现、但选型必须的项（Vant、Lucide、DOMPurify、TanStack Query 等）只在 `stack-decisions.md` 作为**默认建议**出现，不混进素材目录，避免「来源不清」。

## 未覆盖（明确说明）

- 没有收录各库的具体 API 与版本号——避免过期错误，统一以官方文档为准。
- 没有做「哪个库最好」的绝对排名——只给场景化选择与禁止项。
- 素材里的第三方链接可用性未逐一探测；`unknown` 状态的条目需自行核对。
