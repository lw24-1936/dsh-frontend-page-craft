# 设计方向与令牌

目标：让页面**有明确的视觉主张**，而不是组件库默认样式拼起来。先选一个方向，再抄对应令牌，最后只改必要的品牌色。

## 1. 四个方向（选一个，禁止混搭）

| 方向 | 关键词 | 适合 | 字体 | 圆角/阴影 | 密度 |
| --- | --- | --- | --- | --- | --- |
| **A 克制专业** | 中性、秩序、可信 | 后台、B 端工具、管理台 | 无衬线 | 8 / 极轻 | 紧凑 |
| **B 编辑杂志** | 版面、留白、叙事 | 品牌站、内容站、作品集 | 标题衬线 + 正文无衬线 | 2–4 / 无 | 舒适 |
| **C 产品化 SaaS** | 明亮、亲和、效率 | 落地页、SaaS 官网、AI 产品 | 无衬线 | 12 / 柔和 | 舒适 |
| **D 实验未来** | 深色、发光、网格 | 大屏、活动页、3D 展示 | 无衬线 + 等宽点缀 | 8–12 / 内发光 | 紧凑 |

判断口诀：**B 端要「安静」，营销要「有主张」，大屏要「远看有层次」，内容站要「读得下去」。**

## 2. 令牌配方（直接复制成 CSS 变量）

### A 克制专业

```css
:root {
  --bg: #f6f7f9;        --surface: #ffffff;   --surface-2: #f1f3f6;
  --border: #e3e7ee;    --border-strong: #cdd4df;
  --text: #0f172a;      --text-muted: #5b6676; --text-faint: #8a94a6;
  --accent: #2563eb;    --accent-contrast: #ffffff; --accent-weak: #e8efff;
  --danger: #dc2626;    --warning: #b45309;   --success: #15803d;
  --radius-sm: 6px; --radius: 8px; --radius-lg: 12px;
  --shadow-1: 0 1px 2px rgb(15 23 42 / .06);
  --shadow-2: 0 8px 24px rgb(15 23 42 / .08);
  --font-sans: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono: ui-monospace, "SF Mono", "JetBrains Mono", Consolas, monospace;
}
```

### B 编辑杂志

```css
:root {
  --bg: #faf9f6;  --surface: #ffffff; --border: #e6e2da;
  --text: #111110; --text-muted: #55534e; --text-faint: #8b8780;
  --accent: #c2410c; --accent-contrast: #ffffff; --accent-weak: #fdf0e9;
  --radius: 2px; --radius-lg: 4px;
  --shadow-1: none; --shadow-2: none;
  --rule: 1px solid var(--border);
  --font-display: "Songti SC", "Source Han Serif SC", Georgia, serif;
  --font-sans: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
}
/* 标题用 --font-display，正文用 --font-sans；用横线分区，别用卡片 */
```

### C 产品化 SaaS

```css
:root {
  --bg: #ffffff;  --surface: #f7f8fc; --surface-2: #eef1f9;
  --border: #e5e8f0; --text: #0b1220; --text-muted: #5a6478;
  --accent: #4f46e5; --accent-contrast: #ffffff; --accent-weak: #ecebff;
  --radius: 12px; --radius-sm: 8px; --radius-lg: 16px;
  --shadow-1: 0 1px 3px rgb(16 24 40 / .06);
  --shadow-2: 0 12px 32px rgb(16 24 40 / .10);
  --gradient-hero: radial-gradient(60% 60% at 50% 0%, #eef0ff 0%, transparent 70%);
}
```

### D 实验未来

```css
:root {
  --bg: #05070d;  --surface: #0b1220; --surface-2: #111a2c;
  --border: #1e2a40; --text: #e6edf7; --text-muted: #93a1b8;
  --accent: #22d3ee; --accent-contrast: #001014; --accent-weak: #062a33;
  --glow: 0 0 24px rgb(34 211 238 / .35);
  --grid: rgb(34 211 238 / .08);
  --font-sans: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono: ui-monospace, "SF Mono", monospace; /* 数据/标签用等宽 */
}
```

## 3. 层级：只靠字号、字重、留白

| 层级 | 字号 | 字重 | 行高 | 用途 |
| --- | --- | --- | --- | --- |
| Display | 56 / 48 | 600 | 1.1 | 首屏主张（一屏一次） |
| H1 | 40 / 32 | 600 | 1.2 | 页面标题 |
| H2 | 28 / 24 | 600 | 1.3 | 区块标题 |
| H3 | 20 | 600 | 1.4 | 卡片标题 |
| Body | 16 | 400 | 1.6 | 正文 |
| Small | 14 | 400 | 1.5 | 辅助信息 |
| Caption | 12 | 500 | 1.4 | 标签、时间戳（可加字距 .02em） |

规则：相邻层级字号差距 ≥ 1.25×；一屏内不要出现 3 个以上不同字重；正文最大行宽 65–75 个字符。

## 4. 间距与布局

- 基准 4px，常用 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96。
- 页面边距：桌面 40（内容最大宽 1200–1280），平板 24，手机 16。
- 区块间距：营销 64–96，后台 24–32；卡片内边距 16–24，别用 10 这种半格。
- 栅格：桌面 12 列、间距 24；平板 8 列；手机 4 列、间距 16。
- 对齐：同类元素共享一条边；数字右对齐、文本左对齐；表格列宽按内容定，别平均分。

## 5. 形状与阴影

- 圆角全站两档：容器 8–12，控件 6–8；不要每个卡片不同圆角。
- 阴影两级：贴地（`shadow-1`）与浮起（`shadow-2`）；编辑风不用阴影，用 1px 分隔线。
- 边框 1px，颜色低于文字两档；hover 才加深，不要默认高对比描边。

## 6. 动效

| 场景 | 时长 | 曲线 |
| --- | --- | --- |
| hover / press | 120ms | ease-out |
| 展开 / 切换 | 200ms | cubic-bezier(.2,.8,.2,1) |
| 入场（≤2 处） | 320ms | 同上，位移 ≤ 12px |
| 图表更新 | 300–600ms | ease-in-out |

必须写：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

## 7. 深色模式（独立配方，不是反色）

- 背景不用纯黑，用 `#05070d` / `#0b1220`；文本不用纯白，用 `#e6edf7`。
- 阴影改为描边 + 内发光；图表配色整体提亮一档，去掉浅色网格线。
- 图片/截图需要暗色适配或加 1px 边框，避免白底刺眼。
- 用 `color-scheme: dark` 让原生控件跟随。

## 8. 可访问性硬指标

- 正文对比度 ≥ 4.5:1（浅色 `--text` 对 `--bg`，深色反之）；大字 ≥ 3:1。
- 不只靠颜色传达状态：错误同时给图标或文案。
- 焦点环 2px、offset 2px，颜色用强调色；禁止 `outline: none` 而不给替代。
- 触控目标 ≥ 44×44px；相邻目标间距 ≥ 8px。
- 表单：label 与控件显式关联，错误信息用 `aria-describedby`。

## 9. 文案（设计的一部分）

- 标题讲「得到什么」，不讲「我们有什么」；按钮用动词（「开始分析」而不是「提交」）。
- 空状态给**下一步动作**，不只说「暂无数据」。
- 错误信息说「发生了什么 + 怎么办」，不甩错误码。
- 数字给量级与单位（「12,480 次/日」而不是「12480」）。
- 中英文混排加空格；标点用全角中文标点；不用三个感叹号。

## 10. 自检（设计阶段结束前）

- [ ] 遮住 logo 和颜色，页面还能看出是什么产品吗？
- [ ] 首屏 3 秒内能回答「这是什么、给谁、下一步做什么」吗？
- [ ] 去掉所有阴影/圆角，层级还成立吗？（成立说明排版是好的）
- [ ] 只保留一个强调色，重点还突出吗？
- [ ] 深色模式下有没有「白块刺眼」或「灰字看不清」？
