import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  LINE_RULES,
  TAG_RULES,
  FILE_RULES,
  scanText,
  scanProject,
  summarize,
  formatText,
  listRules,
  loadIgnoreFile,
  main,
} from '../resources/bin/check-standards.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const FIXTURES = join(ROOT, 'test', 'fixtures', 'standards')

const rulesOf = (findings, file) =>
  new Set(findings.filter((f) => f.file.replaceAll('\\', '/').endsWith(file)).map((f) => f.rule))

test('rule catalog is complete and well formed', () => {
  assert.ok(LINE_RULES.length >= 15, '行级规则少于 15 条')
  assert.ok(TAG_RULES.length >= 8, '标签级规则少于 8 条')
  const ids = new Set()
  for (const rule of [...LINE_RULES, ...TAG_RULES]) {
    assert.ok(/^[a-z][a-z0-9]*\/[a-z][a-z0-9-]*$/.test(rule.id), `规则 id 不合规：${rule.id}`)
    assert.ok(!ids.has(rule.id), `规则 id 重复：${rule.id}`)
    ids.add(rule.id)
    assert.ok(['p0', 'p1', 'p2'].includes(rule.severity), `${rule.id} 级别非法`)
    assert.ok(rule.message.length > 8, `${rule.id} 缺少说明`)
    assert.ok(rule.source.length > 3, `${rule.id} 缺少出处`)
    assert.ok(rule.exts instanceof Set && rule.exts.size > 0, `${rule.id} 缺少适用扩展名`)
  }
})

test('scans the bad Vue fixture for template, security and TS red lines', () => {
  const result = scanProject({ root: FIXTURES })
  const rules = rulesOf(result.findings, 'bad.vue')
  for (const expected of [
    'a11y/img-alt',
    'vue/v-for-key',
    'vue/v-if-v-for',
    'security/v-html',
    'security/target-blank',
    'a11y/click-static',
    'a11y/iframe-title',
    'security/no-eval',
    'js/no-var',
    'js/no-debugger',
    'js/no-console',
    'ts/no-explicit-any',
    'security/hardcoded-secret',
  ]) {
    assert.ok(rules.has(expected), `未检出 ${expected}，实际：${[...rules].join(', ')}`)
  }
})

test('scans the bad HTML fixture for skeleton and a11y red lines', () => {
  const result = scanProject({ root: FIXTURES })
  const rules = rulesOf(result.findings, 'bad.html')
  for (const expected of [
    'html/doctype',
    'a11y/html-lang',
    'a11y/img-alt',
    'security/target-blank',
    'a11y/zoom-disabled',
    'html/duplicate-id',
  ]) {
    assert.ok(rules.has(expected), `未检出 ${expected}，实际：${[...rules].join(', ')}`)
  }
})

test('clean fixtures produce no findings', () => {
  const result = scanProject({ root: FIXTURES })
  assert.deepEqual([...rulesOf(result.findings, 'good.vue')], [])
  assert.deepEqual([...rulesOf(result.findings, 'good.html')], [])
})

test('fail-on threshold controls the exit code', () => {
  const p0Only = scanProject({ root: FIXTURES, ignore: [], include: ['.vue'], maxFindings: 500 })
  assert.equal(summarize(p0Only, { failOn: 'p0' }).exitCode, 1)

  const tsOnly = scanProject({ root: FIXTURES, include: ['.ts'] })
  assert.ok(summarize(tsOnly, { failOn: 'p0' }).exitCode === 0, '仅 P1 问题时 fail-on=p0 不应失败')
  assert.ok(summarize(tsOnly, { failOn: 'p1' }).exitCode === 1, 'fail-on=p1 应失败')
  assert.ok(summarize(tsOnly, { failOn: 'none' }).exitCode === 0)
})

test('ignore list suppresses specific rules', () => {
  const result = scanProject({ root: FIXTURES, ignore: ['a11y/img-alt', 'js/no-console'] })
  const all = result.findings.map((f) => f.rule)
  assert.ok(!all.includes('a11y/img-alt'))
  assert.ok(!all.includes('js/no-console'))
  assert.ok(all.includes('vue/v-for-key'))
})

test('comments and string literals do not produce findings', () => {
  const text = [
    "// eval('x')",
    "/* debugger; var legacy = 1 */",
    "const label = 'eval('",
    'const ok = 1 // console.log(ok)',
  ].join('\n')
  const { findings } = scanText(text, { file: 'comments.ts', ext: '.ts' })
  assert.deepEqual(findings, [])
})

test('multi-line block comments are skipped across lines', () => {
  const text = ['/*', "eval('x')", 'console.log(1)', '*/', 'const ok = 1'].join('\n')
  const { findings } = scanText(text, { file: 'block.js', ext: '.js' })
  assert.deepEqual(findings, [])
})

test('file-level CSS focus rule requires a focus-visible replacement', () => {
  const bad = scanText('.a { outline: none; }', { file: 'a.css', ext: '.css' })
  assert.ok(bad.findings.some((f) => f.rule === 'a11y/outline-none'))

  const ok = scanText('.a:focus-visible { outline: 2px solid #000; }', {
    file: 'b.css',
    ext: '.css',
  })
  assert.ok(!ok.findings.some((f) => f.rule === 'a11y/outline-none'))
})

test('text and json renderers agree on counts', () => {
  const result = scanProject({ root: FIXTURES })
  const { text, counts, exitCode } = formatText(result)
  assert.match(text, /共 \d+ 个问题：P0 \d+ · P1 \d+ · P2 \d+/)
  assert.equal(counts.p0 + counts.p1 + counts.p2, result.findings.length)
  assert.equal(exitCode, 1)
})

test('css comments do not trigger file-level rules', () => {
  const commented = scanText('/* 这里解释为什么不用 outline: none */\n.a { color: red; }', {
    file: 'x.css',
    ext: '.css',
  })
  assert.deepEqual(commented.findings, [])

  const real = scanText('.a { outline: none; }', { file: 'y.css', ext: '.css' })
  assert.ok(real.findings.some((f) => f.rule === 'a11y/outline-none'))
})

test('svelte templates are scanned with tag rules', () => {
  const result = scanProject({ root: FIXTURES })
  const rules = rulesOf(result.findings, 'bad.svelte')
  for (const expected of ['a11y/img-alt', 'a11y/button-type', 'html/duplicate-id']) {
    assert.ok(rules.has(expected), `未检出 ${expected}，实际：${[...rules].join(', ')}`)
  }
})

test('duplicate ids are detected in Vue templates too', () => {
  const { findings } = scanText('<div id="a"></div>\n<div id="a"></div>', {
    file: 'x.vue',
    ext: '.vue',
  })
  assert.ok(findings.some((f) => f.rule === 'html/duplicate-id'))
})

test('rule listing and ignore files stay in sync with the catalog', () => {
  const rules = listRules()
  assert.equal(rules.length, 32)
  assert.equal(new Set(rules.map((r) => r.id)).size, 32)
  assert.equal(rules.length, LINE_RULES.length + TAG_RULES.length + FILE_RULES.length)

  const ignore = loadIgnoreFile(join(FIXTURES, 'ignore.txt'))
  assert.deepEqual(ignore, ['a11y/img-alt', 'js/no-console', 'js/no-var'])
})

test('CLI handles single files, missing paths and --list-rules', () => {
  const capture = (argv) => {
    let out = ''
    let err = ''
    const stdout = process.stdout.write
    const stderr = process.stderr.write
    process.stdout.write = (chunk) => {
      out += chunk
      return true
    }
    process.stderr.write = (chunk) => {
      err += chunk
      return true
    }
    try {
      const code = main(argv)
      return { code, out, err }
    } finally {
      process.stdout.write = stdout
      process.stderr.write = stderr
    }
  }

  const single = capture(['--path', join(FIXTURES, 'bad.ts'), '--fail-on', 'none'])
  assert.equal(single.code, 0)
  assert.match(single.out, /ts\/no-explicit-any/)
  assert.match(single.out, /扫描 1 个文件/)

  const missing = capture(['--path', join(FIXTURES, 'nope')])
  assert.equal(missing.code, 2)
  assert.match(missing.err, /路径不存在/)

  const listed = capture(['--list-rules'])
  assert.equal(listed.code, 0)
  assert.equal(listed.out.trim().split('\n').length, 32)
})
