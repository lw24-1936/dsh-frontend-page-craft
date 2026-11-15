# 实现手册

## 1. 单页骨架（先跑起来，再长肉）

### 原生 HTML（零依赖 demo 首选）

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>页面标题</title>
  <style>
    :root { /* 令牌：从 design-direction.md 复制 */ }
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font: 16px/1.6 var(--font-sans); color: var(--text); background: var(--bg); }
    .container { max-width: 1200px; margin-inline: auto; padding-inline: 24px; }
    :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body>
  <main class="container"><!-- 区块 --></main>
</body>
</html>
```

### Vue3 + TS

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Metric = { label: string; value: number; unit: string; delta?: number }

const loading = ref(true)
const error = ref<string | null>(null)
const metrics = ref<Metric[]>([])

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/metrics')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    metrics.value = await res.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <section class="page">
    <header class="page__head">
      <h1>运营概览</h1>
      <button class="btn btn--primary" type="button">导出</button>
    </header>

    <div v-if="loading" class="grid" aria-busy="true">
      <div v-for="i in 3" :key="i" class="card skeleton" />
    </div>
    <div v-else-if="error" class="empty" role="alert">
      <p>数据加载失败：{{ error }}</p>
      <button class="btn" type="button" @click="load">重试</button>
    </div>
    <div v-else-if="metrics.length === 0" class="empty">
      <p>暂无数据</p>
      <button class="btn" type="button" @click="load">刷新</button>
    </div>
    <div v-else class="grid">
      <article v-for="m in metrics" :key="m.label" class="card">
        <p class="card__label">{{ m.label }}</p>
        <p class="card__value">{{ m.value.toLocaleString('zh-CN') }}<small>{{ m.unit }}</small></p>
      </article>
    </div>
  </section>
</template>
```

### React + TS

```tsx
import { useEffect, useState } from 'react'

type Metric = { label: string; value: number; unit: string }
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; data: Metric[] }

export function MetricsPage() {
  const [state, setState] = useState<State>({ status: 'loading' })

  async function load() {
    setState({ status: 'loading' })
    try {
      const res = await fetch('/api/metrics')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Metric[] = await res.json()
      setState(data.length ? { status: 'ready', data } : { status: 'empty' })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : '加载失败' })
    }
  }
  useEffect(() => { void load() }, [])

  if (state.status === 'loading') return <div className="grid" aria-busy>…</div>
  if (state.status === 'error') return <div role="alert">{state.message} <button onClick={load}>重试</button></div>
  if (state.status === 'empty') return <div>暂无数据 <button onClick={load}>刷新</button></div>
  return <div className="grid">…</div>
}
```

要点：**状态用联合类型表达**（不是三个布尔），空/错/慢是三个独立分支，不允许 `data && data.map()` 一把梭。

## 2. 状态四件套（每个数据区块都要有）

| 状态 | 表现 | 常见错误 |
| --- | --- | --- |
| loading | 骨架屏/局部 spinner + `aria-busy` | 整页白屏、只转圈无骨架 |
| empty | 说明 + 下一步动作 | 只写「暂无数据」 |
| error | 原因 + 重试 | 只 alert、吞异常、暴露堆栈 |
| 边界 | 超长文本截断 + tooltip、0 条、1 条、1000 条、无权限 | 只测「3 条正常数据」 |

## 3. 请求层（薄封装，别造框架）

```ts
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`请求失败 ${res.status}${body ? `：${body.slice(0, 120)}` : ''}`)
  }
  return res.json() as Promise<T>
}
```

规则：错误信息面向用户可读；超时用 `AbortController`；并发去重（同一 key 只发一次）；组件卸载时取消。

## 4. 表格

- 列定义显式写 `width` / `minWidth`，数字列右对齐 + `tabular-nums`。
- 表头 sticky：`position: sticky; top: 0; z-index: 1; background: var(--surface)`。
- 行高 ≥ 44；操作列固定在右侧；危险操作放「更多」菜单。
- 空/加载/错误都占表格区域，不改变布局高度。
- > 200 行用虚拟滚动或后端分页，别一次渲染。

## 5. 表单

- label 与控件用 `for`/`id` 关联；必填标记 + `aria-required`。
- 校验时机：失焦校验 + 提交时全量；错误就近显示，滚动到第一个错误。
- 提交态：禁用按钮 + loading + 防重复提交；成功后明确反馈（toast/跳转）。
- 危险操作二次确认，确认文案写清后果。

## 6. 图表（ECharts 按需）

```ts
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])
```

- 容器必须有确定高度；`ResizeObserver` 处理自适应；组件卸载 `dispose()`。
- 深色模式切主题时重新 `setOption` 配色；空数据 `showLoading` 之外要给文案。
- 大屏多个图表：合并 `requestAnimationFrame` 更新，页面隐藏时暂停（`document.visibilityState`）。

## 7. 响应式

```css
/* 三档：手机 / 平板 / 桌面 */
.grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
@media (min-width: 640px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
```

- 优先 `min-width` 渐进增强；避免固定像素宽容器。
- 图片 `max-width: 100%; height: auto;`，预留 `aspect-ratio` 防 CLS。
- 移动端安全区：`padding-bottom: max(16px, env(safe-area-inset-bottom))`。

## 8. 可访问性最小实现

```html
<button type="button" aria-expanded="false" aria-controls="panel">筛选</button>
<div id="panel" hidden>…</div>
<p id="err-email" role="alert">邮箱格式不正确</p>
<input aria-describedby="err-email" aria-invalid="true" />
```

- 模态框：聚焦首元素、Esc 关闭、焦点陷阱、关闭后焦点回触发按钮。
- 图标按钮必须有 `aria-label`；装饰图标 `aria-hidden="true"`。
- 动效/轮播提供暂停；不自动播放带声音的内容。

## 9. 性能

| 手段 | 说明 |
| --- | --- |
| 路由懒加载 | `() => import('./views/Chart.vue')` |
| 图片 | `loading="lazy"`、`srcset`、WebP/AVIF |
| 字体 | 系统栈优先；必须自定义时子集化 + `font-display: swap` |
| 首屏 | 关键 CSS 内联，非关键延后 |
| 长列表 | 虚拟滚动或分页 |
| 重计算 | 防抖/节流、`requestIdleCallback` |
| 监控 | 记 LCP/CLS/INP，超预算就砍功能 |

## 10. 常见 bug 清单（提交前自查）

- [ ] 异步竞态：快速切换筛选导致旧响应覆盖新数据（用请求 id 或 AbortController）
- [ ] 内存泄漏：事件监听、定时器、图表实例、ResizeObserver 未清理
- [ ] 双重提交：按钮未禁用
- [ ] 时区/数字格式：本地化与千分位
- [ ] 超长文本撑破布局（`overflow-wrap: anywhere` + 行数限制）
- [ ] 空数组 `[0]` 访问、`undefined` 渲染
- [ ] 移动端 100vh 被地址栏吃掉（用 `100dvh`）
- [ ] 深色模式下图片/图表刺眼
- [ ] 键盘 Tab 顺序错乱、焦点丢失
