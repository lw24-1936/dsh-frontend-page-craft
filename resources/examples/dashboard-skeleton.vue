<script setup lang="ts">
/**
 * 仪表盘骨架样例：状态四件套 + 指标卡 + 明细表。
 * 零第三方依赖；换成 Element Plus / Ant Design Vue 时保留状态机与布局顺序。
 */
import { computed, onMounted, ref } from 'vue'

type Row = { id: string; customer: string; plan: string; mrr: number; seats: number; status: 'active' | 'trial' | 'churn' }
type Phase = 'loading' | 'error' | 'empty' | 'ready'

const phase = ref<Phase>('loading')
const rows = ref<Row[]>([])
const message = ref('')
const updatedAt = ref('')
const statusText: Record<Row['status'], string> = { active: '付费中', trial: '试用', churn: '已流失' }

const metrics = computed(() => {
  const active = rows.value.filter((r) => r.status === 'active')
  const mrr = active.reduce((sum, r) => sum + r.mrr, 0)
  const seats = rows.value.reduce((sum, r) => sum + r.seats, 0)
  const trial = rows.value.filter((r) => r.status === 'trial').length
  return [
    { label: '月度经常性收入', value: mrr, unit: '元', delta: 4.2 },
    { label: '付费席位', value: seats, unit: '个', delta: 1.8 },
    { label: '试用中客户', value: trial, unit: '家', delta: -0.6 },
  ]
})

const fmt = (n: number) => n.toLocaleString('zh-CN')

async function load() {
  phase.value = 'loading'
  message.value = ''
  try {
    const res = await fetch('/api/accounts')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: Row[] = await res.json()
    rows.value = data
    updatedAt.value = new Date().toLocaleString('zh-CN', { hour12: false })
    phase.value = data.length ? 'ready' : 'empty'
  } catch (e) {
    message.value = e instanceof Error ? e.message : '未知错误'
    phase.value = 'error'
  }
}

onMounted(load)
</script>

<template>
  <section class="page">
    <header class="head">
      <div>
        <h1>客户与收入</h1>
        <p class="meta">
          <span>数据更新：{{ updatedAt || '—' }}</span>
          <span class="dot" aria-hidden="true">·</span>
          <span>口径：本月已确认</span>
        </p>
      </div>
      <div class="head__actions">
        <button class="btn" type="button" :disabled="phase === 'loading'" @click="load">
          {{ phase === 'loading' ? '刷新中…' : '刷新' }}
        </button>
        <button class="btn btn--primary" type="button">导出 CSV</button>
      </div>
    </header>

    <!-- loading：骨架与最终布局等高，避免跳动 -->
    <div v-if="phase === 'loading'" class="grid" aria-busy="true" aria-label="正在加载">
      <div v-for="i in 3" :key="i" class="card card--skeleton"><span class="bar" /><span class="bar bar--wide" /></div>
    </div>

    <div v-else-if="phase === 'error'" class="state" role="alert">
      <p class="state__title">数据加载失败</p>
      <p class="state__desc">接口返回：{{ message }}。请检查网络或稍后重试。</p>
      <button class="btn" type="button" @click="load">重试</button>
    </div>

    <div v-else-if="phase === 'empty'" class="state">
      <p class="state__title">还没有客户数据</p>
      <p class="state__desc">接入账单系统后，这里会显示收入、席位与续费状态。</p>
      <button class="btn btn--primary" type="button">去接入数据源</button>
    </div>

    <template v-else>
      <div class="grid">
        <article v-for="m in metrics" :key="m.label" class="card">
          <p class="card__label">{{ m.label }}</p>
          <p class="card__value">
            {{ fmt(m.value) }}<small>{{ m.unit }}</small>
            <span class="delta" :class="m.delta >= 0 ? 'delta--up' : 'delta--down'">
              {{ m.delta >= 0 ? '+' : '' }}{{ m.delta }}%
            </span>
          </p>
        </article>
      </div>

      <section class="table-wrap" aria-labelledby="table-title">
        <h2 id="table-title" class="sr-only">客户明细</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">客户</th>
              <th scope="col">套餐</th>
              <th scope="col" class="num">MRR（元）</th>
              <th scope="col" class="num">席位</th>
              <th scope="col">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td>{{ r.customer }}</td>
              <td>{{ r.plan }}</td>
              <td class="num">{{ fmt(r.mrr) }}</td>
              <td class="num">{{ fmt(r.seats) }}</td>
              <td><span class="tag" :class="`tag--${r.status}`">{{ statusText[r.status] }}</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </section>
</template>

<style scoped>
.page { --bg: #f6f7f9; --surface: #fff; --border: #e3e7ee; --text: #0f172a; --muted: #5b6676; --accent: #2563eb; --radius: 8px;
  background: var(--bg); color: var(--text); padding: 24px; font: 16px/1.6 -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
.head { display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.head h1 { margin: 0; font-size: 24px; line-height: 1.3; }
.meta { margin: 4px 0 0; font-size: 13px; color: var(--muted); }
.dot { margin-inline: 6px; }
.head__actions { display: flex; gap: 8px; }
.btn { min-height: 40px; padding: 0 14px; border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 6px; font: inherit; font-size: 14px; cursor: pointer; }
.btn--primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.btn:disabled { opacity: .6; cursor: progress; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.grid { display: grid; gap: 16px; grid-template-columns: 1fr; margin-bottom: 20px; }
@media (min-width: 720px) { .grid { grid-template-columns: repeat(3, 1fr); } }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; min-height: 96px; }
.card__label { margin: 0; font-size: 13px; color: var(--muted); }
.card__value { margin: 6px 0 0; font-size: 28px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
.card__value small { font-size: 13px; font-weight: 500; color: var(--muted); margin-left: 4px; }
.delta { margin-left: 8px; font-size: 13px; font-weight: 600; }
.delta--up { color: #15803d; } .delta--down { color: #b91c1c; }
.card--skeleton { display: grid; gap: 10px; align-content: center; }
.bar { display: block; height: 12px; width: 40%; border-radius: 4px; background: linear-gradient(90deg, #eef1f6, #e3e8f1, #eef1f6); background-size: 200% 100%; animation: shimmer 1.2s linear infinite; }
.bar--wide { width: 64%; height: 20px; }
@keyframes shimmer { to { background-position: -200% 0; } }

.state { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 40px 24px; text-align: center; }
.state__title { margin: 0 0 6px; font-size: 16px; font-weight: 600; }
.state__desc { margin: 0 0 16px; color: var(--muted); font-size: 14px; }

.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap; }
thead th { position: sticky; top: 0; background: var(--surface); font-size: 12px; letter-spacing: .04em; color: var(--muted); z-index: 1; }
tbody tr:last-child td { border-bottom: 0; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
.tag--active { background: #e7f6ec; color: #15803d; }
.tag--trial { background: #eaf0ff; color: #1d4ed8; }
.tag--churn { background: #f4f4f5; color: #52525b; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

@media (prefers-reduced-motion: reduce) { .bar { animation: none; } }
</style>
