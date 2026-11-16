import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { apply, inject, name, SKILL_SPEC, RESOURCE_FILES } from '../lib/index.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8')
const exists = (rel) => existsSync(join(ROOT, rel))

function makeCtx(sink = {}) {
  return {
    logger: { warn: () => {}, info: () => {} },
    skills: {
      register(payload) {
        sink.payload = payload
        return () => {}
      },
    },
  }
}

test('exports the bundle identity expected by cordis', () => {
  assert.equal(name, 'dsh-frontend-page-craft')
  assert.deepEqual(inject, ['skills'])
  assert.equal(SKILL_SPEC.name, 'frontend-page-craft')
})

test('registers one bundled skill with resource base', () => {
  const sink = {}
  const dispose = apply(makeCtx(sink), {})

  assert.ok(sink.payload, 'skills.register 未被调用')
  const skill = sink.payload
  assert.equal(skill.name, 'frontend-page-craft')
  assert.equal(skill.source, 'bundled')
  assert.equal(skill.invocation.modelInvocable, true)
  assert.equal(skill.invocation.userInvocable, true)
  assert.ok(skill.description.length > 120, 'description 太短，无法覆盖触发场景')
  assert.match(skill.description, /需求分析|Brief/)
  assert.match(skill.description, /组件库/)
  assert.match(skill.content, /## 2\. 阶段 A/)
  assert.match(skill.content, /反 AI 味/)
  assert.equal(skill.resourceBase.kind, 'directory')
  assert.ok(skill.resourceBase.path.endsWith('resources'))
  assert.equal(skill.metadata.flow, 'brief > design > implement > verify')
  assert.equal(skill.metadata.checks, 32)

  assert.equal(typeof dispose, 'function')
  dispose()
})

test('config.enabled=false skips registration', () => {
  const sink = {}
  const dispose = apply(makeCtx(sink), { enabled: false })
  assert.equal(sink.payload, undefined)
  assert.equal(typeof dispose, 'function')
})

test('all declared files exist', () => {
  assert.ok(exists(SKILL_SPEC.file.startsWith('skills/') ? SKILL_SPEC.file : `skills/${SKILL_SPEC.file}`))
  for (const rel of RESOURCE_FILES) assert.ok(exists(join('resources', rel)), `缺少 resources/${rel}`)
  for (const rel of ['docs/DETAIL.md', 'icon.svg', 'cordis.patch.yml', 'README.md', 'locale/en.json', 'locale/zh.json']) {
    assert.ok(exists(rel), `缺少 ${rel}`)
  }
})

test('skill content routes to every resource file', () => {
  const content = read('skills/frontend-page-craft.md')
  for (const rel of RESOURCE_FILES) {
    assert.ok(content.includes(rel), `技能正文未引用 resources/${rel}`)
  }
  for (const heading of ['阶段 A', '阶段 B', '阶段 C', '阶段 D', '资源路由表', '常见失败']) {
    assert.ok(content.includes(heading), `技能正文缺少「${heading}」`)
  }
})

test('catalog.json is complete and consistent', () => {
  const catalog = JSON.parse(read('resources/catalog.json'))
  const items = catalog.items
  assert.ok(Array.isArray(items) && items.length >= 60, 'catalog 条目少于 60')

  const statuses = new Set(Object.keys(catalog.meta.statusMeaning))
  const ids = new Set()
  for (const item of items) {
    assert.ok(item.id && !ids.has(item.id), `id 缺失或重复：${item.id}`)
    ids.add(item.id)
    assert.ok(item.name, `${item.id} 缺少 name`)
    assert.ok(item.category, `${item.id} 缺少 category`)
    assert.ok(statuses.has(item.status), `${item.id} 的 status 非法：${item.status}`)
    assert.match(item.url, /^https?:\/\//, `${item.id} 的 url 非法`)
    assert.ok(item.useWhen && item.avoidWhen, `${item.id} 缺少适用/不适用说明`)
  }

  const categories = new Set(items.map((i) => i.category))
  for (const expected of ['mobile', 'pc', 'viz', 'animation', 'editor', '3d', 'other']) {
    assert.ok(categories.has(expected), `catalog 缺少分类 ${expected}`)
  }
})

test('component-catalog.md covers every catalog entry by name', () => {
  const md = read('resources/component-catalog.md').toLowerCase()
  const { items } = JSON.parse(read('resources/catalog.json'))
  const missing = items.filter((i) => !md.includes(i.name.toLowerCase()))
  assert.deepEqual(missing.map((i) => i.name), [], '以下库未出现在 component-catalog.md')
})

test('stack decisions, archetypes and checklist stay substantive', () => {
  assert.match(read('resources/stack-decisions.md'), /ECharts/)
  assert.match(read('resources/stack-decisions.md'), /门禁/)
  const archetypes = read('resources/page-archetypes.md')
  for (const heading of ['## 后台管理', '## 仪表盘', '## 落地页', '## 移动端', '## 数据大屏', '## 文档站', '## AI 对话']) {
    assert.ok(archetypes.includes(heading), `缺少范式 ${heading}`)
  }
  const checklist = read('resources/qa-checklist.md')
  for (const token of ['P0', 'P1', '4.5:1', '390 / 768 / 1440', 'prefers-reduced-motion']) {
    assert.ok(checklist.includes(token), `验收清单缺少 ${token}`)
  }
})

test('example html is self-contained and accessible', () => {
  const html = read('resources/examples/hero-proof.html')
  assert.doesNotMatch(html, /<script[^>]+src=/i, '示例不应有外部脚本')
  assert.doesNotMatch(html, /cdn\./i, '示例不应依赖 CDN')
  assert.match(html, /prefers-reduced-motion/)
  assert.match(html, /:focus-visible/)
  assert.match(html, /lang="zh-CN"/)
  assert.match(html, /aria-labelledby/)
})

test('bundle manifest and patch agree', () => {
  const pkg = JSON.parse(read('package.json'))
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.ok(pkg.files.includes('resources'))
  assert.ok(pkg.files.includes('skills'))
  assert.ok(pkg.files.includes('lib'))
  assert.equal(pkg.exports['./icon'], './icon.svg')
  assert.equal(pkg.bin['dsh-frontend-standards'], './resources/bin/check-standards.mjs')
  assert.match(pkg.version, /^1\.2\./)
  assert.match(read('cordis.patch.yml'), /dsh-frontend-page-craft/)
})

test('standards doc cites the standards it implements', () => {
  const doc = read('resources/standards.md')
  for (const source of ['eslint.org', 'airbnb', 'google.github.io/styleguide', 'typescript-eslint.io', 'vuejs.org/style-guide', 'w3.org/TR/WCAG22', 'owasp.org', 'web.dev']) {
    assert.ok(doc.toLowerCase().includes(source.toLowerCase()), `standards.md 缺少依据来源：${source}`)
  }
  assert.match(doc, /32 条/)
})

test('readme documents install, usage and limits', () => {
  const readme = read('README.md')
  for (const token of ['badge.svg', '快速开始', '规范检查器', '目录结构', '已知限制', 'LICENSE']) {
    assert.ok(readme.includes(token), `README 缺少章节或元素：${token}`)
  }
  assert.match(readme, /check-standards\.mjs/)
})

test('locale metadata is complete', () => {
  for (const lang of ['en', 'zh']) {
    const locale = JSON.parse(read(`locale/${lang}.json`))
    assert.ok(locale.meta.title, `${lang} 缺少 title`)
    assert.ok(locale.meta.description.length > 30, `${lang} 描述过短`)
    assert.equal(locale.meta.detail, 'docs/DETAIL.md')
  }
})

test('icon is a valid small SVG', () => {
  const svg = read('icon.svg')
  assert.match(svg.trimStart(), /^<svg[\s>]/)
  assert.ok(Buffer.byteLength(svg) < 256 * 1024)
  assert.match(svg, /<\/svg>\s*$/)
})
