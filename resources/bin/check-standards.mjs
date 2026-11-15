#!/usr/bin/env node
/**
 * dsh-frontend-page-craft · 前端规范检查器
 *
 * 零依赖、行级扫描：把「世界上公认的规范」压缩成 32 条可执行规则，
 * 每条规则都标注出处（ESLint / Airbnb / Google / Vue Style Guide / WCAG 2.2 /
 * OWASP / web.dev），并把问题分成 P0（必须修）/ P1（应当修）/ P2（卫生项）。
 *
 * 它不是 ESLint 的替代品：ESLint + typescript-eslint + stylelint 负责语法级、
 * 类型级与自动修复；本工具负责跨文件/模板级的红线（XSS、可访问性、Vue 模板、
 * 安全与性能气味），以及在没有工具链时的一次性体检。
 *
 * 用法：
 *   node check-standards.mjs [--path .] [--format text|json] [--fail-on p0|p1|p2|none]
 *                            [--ignore ruleId,ruleId] [--include .ts,.vue]
 *                            [--exclude dir] [--max-findings 200] [--quiet]
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SEVERITY_RANK = { p0: 0, p1: 1, p2: 2 }

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.hg', '.svn', 'dist', 'build', 'out', 'output',
  'coverage', '.next', '.nuxt', '.output', '.turbo', '.cache', 'vendor',
  '__pycache__', '.venv', 'venv', '.idea', '.vscode-test', 'tmp', '.backup',
])

const TEXT_EXTS = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts',
  '.vue', '.html', '.htm', '.css', '.scss', '.less',
])

const JS_EXTS = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue'])
const HTML_EXTS = new Set(['.html', '.htm', '.vue'])
const CSS_EXTS = new Set(['.css', '.scss', '.less', '.vue'])
const TS_EXTS = new Set(['.ts', '.tsx', '.mts', '.cts', '.vue'])
const JSX_EXTS = new Set(['.jsx', '.tsx'])

const MAX_FILE_BYTES = 1024 * 1024
const MAX_LINE_SNIPPET = 110

/**
 * 行级规则：pattern 在「去注释后」的行上匹配。
 * source 是规则依据，写进 JSON 便于追溯。
 */
export const LINE_RULES = [
  {
    id: 'security/no-eval',
    severity: 'p0',
    exts: JS_EXTS,
    pattern: /\b(?:eval\s*\(|new\s+Function\s*\()/,
    message: '禁止 eval / new Function：可执行任意字符串，等同代码注入',
    source: 'ESLint no-eval · Airbnb 6.4',
  },
  {
    id: 'security/v-html',
    severity: 'p0',
    exts: new Set(['.vue']),
    pattern: /\bv-html\s*=/,
    message: 'v-html 会直接渲染 HTML：必须先用 DOMPurify 或后端白名单消毒，否则是 XSS',
    source: 'Vue 文档（安全）· OWASP XSS',
  },
  {
    id: 'security/react-danger',
    severity: 'p0',
    exts: JSX_EXTS,
    pattern: /dangerouslySetInnerHTML/,
    message: 'dangerouslySetInnerHTML 必须消毒后再用；能用文本就用文本',
    source: 'React 文档 · OWASP XSS',
  },
  {
    id: 'security/document-write',
    severity: 'p1',
    exts: JS_EXTS,
    pattern: /\bdocument\s*\.\s*write(?:ln)?\s*\(/,
    message: 'document.write 已废弃且可注入：用 DOM API 或框架渲染',
    source: 'MDN document.write',
  },
  {
    id: 'security/innerhtml',
    severity: 'p1',
    exts: JS_EXTS,
    pattern: /\.innerHTML\s*=/,
    message: '.innerHTML 赋值跳过转义：用 textContent 或消毒后的片段',
    source: 'OWASP XSS Prevention Cheat Sheet',
  },
  {
    id: 'security/hardcoded-secret',
    severity: 'p0',
    exts: TEXT_EXTS,
    pattern: /(?:api[_-]?key|access[_-]?token|secret|password|passwd)\s*[:=]\s*['"][A-Za-z0-9_\-.]{16,}['"]/i,
    message: '疑似硬编码密钥：改走环境变量/配置注入，并轮换已泄露的值',
    source: 'OWASP Secrets Management · 12-Factor App',
    inspectLiterals: true,
  },
  {
    id: 'security/settimeout-string',
    severity: 'p1',
    exts: JS_EXTS,
    pattern: /set(?:Timeout|Interval)\s*\(\s*['"`]/,
    message: 'setTimeout/setInterval 的字符串形式等同 eval：改传函数',
    source: 'MDN setTimeout · ESLint no-implied-eval',
    inspectLiterals: true,
  },
  {
    id: 'security/mixed-content',
    severity: 'p2',
    exts: TEXT_EXTS,
    pattern: /(?:src|href)\s*=\s*['"]http:\/\//,
    message: 'HTTPS 页面里的 http:// 资源会被浏览器拦截（混合内容）',
    source: 'MDN Mixed content',
    inspectLiterals: true,
  },
  {
    id: 'js/no-debugger',
    severity: 'p0',
    exts: JS_EXTS,
    pattern: /\bdebugger\b/,
    message: '提交前删除 debugger',
    source: 'ESLint no-debugger',
  },
  {
    id: 'js/no-var',
    severity: 'p1',
    exts: JS_EXTS,
    pattern: /(^|[^\w.$])var\s+[A-Za-z_$]/,
    message: '不用 var：用 const，需要重赋值时用 let',
    source: 'ESLint no-var · Google JS Style · Airbnb 2.2',
  },
  {
    id: 'js/eqeqeq',
    severity: 'p2',
    exts: JS_EXTS,
    // 用拼接避免本文件自身被这条规则命中（扫描器也要能自我扫描）
    pattern: new RegExp(`[^=!<>]${'='}${'='}[^=]|[^!]!${'='}[^=]`),
    message: '用 === / !== 避免隐式类型转换',
    source: 'ESLint eqeqeq · Airbnb 15.1',
  },
  {
    id: 'js/no-console',
    severity: 'p2',
    exts: JS_EXTS,
    pattern: /\bconsole\.(?:log|debug|info)\s*\(/,
    message: '生产代码不要留 console.log/info/debug；需要日志用统一 logger',
    source: 'ESLint no-console · Airbnb 13.1',
  },
  {
    id: 'js/no-alert',
    severity: 'p2',
    exts: JS_EXTS,
    pattern: /(?:^|[^\w.])alert\s*\(/,
    message: '不用 alert：用页面内的 toast / 对话框',
    source: 'ESLint no-alert',
  },
  {
    id: 'ts/no-explicit-any',
    severity: 'p1',
    exts: TS_EXTS,
    pattern: /(?::\s*any\b|\bas\s+any\b|<any>)/,
    message: '避免显式 any：用具体类型、unknown + 收窄，或泛型',
    source: 'typescript-eslint no-explicit-any · TypeScript Handbook',
  },
  {
    id: 'ts/ban-ts-ignore',
    severity: 'p1',
    exts: TS_EXTS,
    pattern: /@ts-ignore\b/,
    message: '用 @ts-expect-error 代替 @ts-ignore：前者在错误消失时会报错',
    source: 'typescript-eslint ban-ts-comment',
    onRaw: true,
  },
  {
    id: 'react/key-index',
    severity: 'p2',
    exts: JSX_EXTS,
    pattern: /key\s*=\s*\{\s*(?:index|idx|i)\s*\}/,
    message: '列表 key 不要用数组下标：用稳定业务 id，避免重排时状态错位',
    source: 'React 文档（Keys）',
  },
]

/** 标签级规则：在单个 HTML/Vue 标签上判断属性组合。 */
export const TAG_RULES = [
  {
    id: 'security/target-blank',
    severity: 'p0',
    exts: HTML_EXTS,
    test: (name, attrs) =>
      /\btarget\s*=\s*["']?_blank/i.test(attrs) && !/\brel\s*=\s*["'][^"']*noopener/i.test(attrs),
    message: 'target="_blank" 必须带 rel="noopener"（否则新页面可通过 window.opener 反向控制）',
    source: 'OWASP · MDN rel=noopener',
  },
  {
    id: 'a11y/img-alt',
    severity: 'p0',
    exts: HTML_EXTS,
    test: (name, attrs) => name === 'img' && !/\balt\s*=/i.test(attrs),
    message: 'img 必须有 alt（装饰图用 alt=""）',
    source: 'WCAG 2.2 · 1.1.1 非文本内容',
  },
  {
    id: 'a11y/iframe-title',
    severity: 'p1',
    exts: HTML_EXTS,
    test: (name, attrs) => name === 'iframe' && !/\btitle\s*=/i.test(attrs),
    message: 'iframe 必须有 title，读屏才能说明这块是什么',
    source: 'WCAG 2.2 · 4.1.2 名称、角色、值',
  },
  {
    id: 'a11y/button-type',
    severity: 'p2',
    exts: HTML_EXTS,
    test: (name, attrs) => name === 'button' && !/\btype\s*=/i.test(attrs),
    message: 'button 显式写 type="button|submit"，避免在表单里默认提交',
    source: 'HTML Standard（button）',
  },
  {
    id: 'a11y/click-static',
    severity: 'p1',
    exts: HTML_EXTS,
    test: (name, attrs) =>
      ['div', 'span', 'li', 'p', 'td', 'section'].includes(name) &&
      /(@click|onClick)\s*=/.test(attrs) &&
      !/\b(role|tabindex)\s*=/i.test(attrs),
    message: '静态元素绑定点击时补 role + tabindex + 键盘处理，或直接换成 button',
    source: 'WCAG 2.2 · 2.1.1 键盘',
  },
  {
    id: 'a11y/autoplay',
    severity: 'p2',
    exts: HTML_EXTS,
    test: (name, attrs) =>
      ['video', 'audio'].includes(name) && /\bautoplay\b/i.test(attrs) && !/\bmuted\b/i.test(attrs),
    message: '自动播放音视频必须静音，否则违反「音频控制」并打扰用户',
    source: 'WCAG 2.2 · 1.4.2 音频控制',
  },
  {
    id: 'vue/v-for-key',
    severity: 'p0',
    exts: new Set(['.vue']),
    test: (name, attrs) => /\bv-for\s*=/.test(attrs) && !/(?::key|\bkey)\s*=/.test(attrs),
    message: 'v-for 必须带稳定 key（业务 id，不要下标）',
    source: 'Vue 官方风格指南 · Priority A（keyed v-for）',
  },
  {
    id: 'vue/v-if-v-for',
    severity: 'p0',
    exts: new Set(['.vue']),
    test: (name, attrs) => /\bv-if\s*=/.test(attrs) && /\bv-for\s*=/.test(attrs),
    message: '不要在同一元素上同时用 v-if 与 v-for：外层套 template 或先过滤数据',
    source: 'Vue 官方风格指南 · Priority A（v-if/v-for）',
  },
]

/**
 * 把一行里的注释替换成等长空格，保留列号；跨行块注释用 state 跟踪。
 * 字符串字面量里的 // 与 /* 不会被当成注释。
 */
function stripLine(raw, ext, state) {
  const jsLike = JS_EXTS.has(ext)
  const htmlLike = HTML_EXTS.has(ext)
  if (!jsLike && !htmlLike) return raw

  let out = ''
  let quote = null
  for (let i = 0; i < raw.length; i += 1) {
    if (state.blockJs) {
      if (raw.startsWith('*/', i)) {
        state.blockJs = false
        out += '  '
        i += 1
      } else {
        out += ' '
      }
      continue
    }
    if (state.blockHtml) {
      if (raw.startsWith('-->', i)) {
        state.blockHtml = false
        out += '   '
        i += 2
      } else {
        out += ' '
      }
      continue
    }

    const ch = raw[i]
    if (quote) {
      out += ch
      if (ch === '\\') {
        out += raw[i + 1] ?? ''
        i += 1
      } else if (ch === quote) {
        quote = null
      }
      continue
    }
    if (jsLike && (ch === "'" || ch === '"' || ch === '`')) {
      quote = ch
      out += ch
      continue
    }
    if (htmlLike && raw.startsWith('<!--', i)) {
      const end = raw.indexOf('-->', i + 4)
      if (end === -1) {
        state.blockHtml = true
        out += ' '.repeat(raw.length - i)
        break
      }
      out += ' '.repeat(end + 3 - i)
      i = end + 2
      continue
    }
    if (jsLike && raw.startsWith('//', i)) {
      out += ' '.repeat(raw.length - i)
      break
    }
    if (jsLike && raw.startsWith('/*', i)) {
      const end = raw.indexOf('*/', i + 2)
      if (end === -1) {
        state.blockJs = true
        out += ' '.repeat(raw.length - i)
        break
      }
      out += ' '.repeat(end + 2 - i)
      i = end + 1
      continue
    }
    out += ch
  }
  return out
}

/**
 * 把字符串字面量的内容替换成空格（保留引号与长度），避免把 `'eval('` 这类
 * 字符串内容当成代码；跨行模板字符串不跟踪，属已知限制。
 */
function maskStrings(line) {
  let out = ''
  let quote = null
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (quote) {
      if (ch === '\\') {
        out += '  '
        i += 1
      } else if (ch === quote) {
        quote = null
        out += ch
      } else {
        out += ' '
      }
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch
      out += ch
      continue
    }
    out += ch
  }
  return out
}

function isIgnoredName(name) {
  return (
    name.endsWith('.min.js') ||
    name.endsWith('.min.css') ||
    name.endsWith('.map') ||
    name.endsWith('.lock') ||
    name === 'package-lock.json' ||
    name === 'pnpm-lock.yaml'
  )
}

function walk(root, { ignoreDirs, out }) {
  let entries
  try {
    entries = readdirSync(root, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(root, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || ignoreDirs.has(entry.name)) continue
      walk(full, { ignoreDirs, out })
      continue
    }
    if (!entry.isFile()) continue
    if (isIgnoredName(entry.name)) continue
    out.push(full)
  }
}

/**
 * 扫描一段文本。导出以便测试与二次开发（不落盘）。
 * @returns {{findings: object[]}}
 */
export function scanText(text, { file = '<inline>', ext = '.js', ignore = new Set(), maxFindings = Infinity } = {}) {
  const findings = []
  const lines = text.split(/\r?\n/)
  const state = { blockJs: false, blockHtml: false }
  const push = (line, column, rule, snippetLine) => {
    if (ignore.has(rule.id)) return
    if (findings.length >= maxFindings) return
    const source = snippetLine ?? lines[line - 1] ?? ''
    findings.push({
      file,
      line,
      column: Math.max(1, column),
      rule: rule.id,
      severity: rule.severity,
      message: rule.message,
      source: rule.source,
      snippet: source.trim().slice(0, MAX_LINE_SNIPPET),
    })
  }

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i]
    if (!raw.trim()) continue
    const stripped = stripLine(raw, ext, state)
    const masked = stripped ? maskStrings(stripped) : stripped

    for (const rule of LINE_RULES) {
      if (!rule.exts.has(ext)) continue
      if (rule.onRaw) {
        const m = rule.pattern.exec(raw)
        if (m) push(i + 1, m.index + 1, rule)
        continue
      }
      if (!stripped.trim()) continue
      const subject = rule.inspectLiterals ? stripped : masked
      const m = rule.pattern.exec(subject)
      if (m) push(i + 1, m.index + 1, rule)
    }

    if (stripped.trim() && HTML_EXTS.has(ext)) {
      const tagRe = /<([a-zA-Z][-a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g
      let m
      while ((m = tagRe.exec(stripped))) {
        const name = m[1].toLowerCase()
        const attrs = m[2] ?? ''
        for (const rule of TAG_RULES) {
          if (!rule.exts.has(ext)) continue
          if (rule.test(name, attrs)) push(i + 1, m.index + 1, rule)
        }
      }
    }
  }

  const joined = lines.join('\n')
  const filePush = (rule, line = 1, column = 1) => push(line, column, rule)

  if (ext === '.html') {
    const firstMeaningful = lines.find(
      (l) => l.replace(/^\uFEFF/, '').trim() && !l.trim().startsWith('<!--'),
    )
    if (!firstMeaningful || !/^<!doctype\s+html/i.test(firstMeaningful.replace(/^\uFEFF/, '').trim())) {
      filePush({
        id: 'html/doctype',
        severity: 'p1',
        message: 'HTML 缺少 <!doctype html>：会退到怪异模式，布局与盒模型异常',
        source: 'HTML Standard（doctype）',
      })
    }
    const htmlTag = /<html\b([^>]*)>/i.exec(joined)
    if (htmlTag && !/\blang\s*=/i.test(htmlTag[1])) {
      filePush({
        id: 'a11y/html-lang',
        severity: 'p1',
        message: '<html> 缺少 lang：读屏无法选择正确语言',
        source: 'WCAG 2.2 · 3.1.1 页面语言',
      })
    }
    const viewport = /<meta[^>]+name\s*=\s*["']viewport["'][^>]*>/i.exec(joined)
    if (!viewport) {
      filePush({
        id: 'html/viewport',
        severity: 'p1',
        message: '缺少 viewport meta（width=device-width）：移动端会缩放到 980px 布局',
        source: 'MDN viewport · WCAG 1.4.10 回流',
      })
    } else {
      if (!/width\s*=\s*device-width/i.test(viewport[0])) {
        filePush({
          id: 'html/viewport',
          severity: 'p1',
          message: 'viewport 未设置 width=device-width',
          source: 'MDN viewport · WCAG 1.4.10 回流',
        })
      }
      if (/user-scalable\s*=\s*["']?no|maximum-scale\s*=\s*["']?1(?:\D|$)/i.test(viewport[0])) {
        filePush({
          id: 'a11y/zoom-disabled',
          severity: 'p0',
          message: '禁止缩放（user-scalable=no / maximum-scale=1）违反 WCAG 1.4.4',
          source: 'WCAG 2.2 · 1.4.4 调整文本大小',
        })
      }
    }
    const ids = new Map()
    const idRe = /\bid\s*=\s*["']([^"']+)["']/g
    let m
    while ((m = idRe.exec(joined))) {
      const seen = ids.get(m[1]) ?? 0
      ids.set(m[1], seen + 1)
      if (seen === 1) {
        const lineNo = joined.slice(0, m.index).split('\n').length
        filePush(
          {
            id: 'html/duplicate-id',
            severity: 'p1',
            message: `重复 id="${m[1]}"：label/aria 引用与锚点会指向错误元素`,
            source: 'HTML Standard（id 唯一性）· WCAG 4.1.1',
          },
          lineNo,
        )
      }
    }
  }

  if (CSS_EXTS.has(ext)) {
    if (/outline\s*:\s*(?:none|0)/i.test(joined) && !/:focus-visible/i.test(joined)) {
      filePush({
        id: 'a11y/outline-none',
        severity: 'p0',
        message: '去掉了 outline 却没有 :focus-visible 替代：键盘用户看不到焦点',
        source: 'WCAG 2.2 · 2.4.7 焦点可见',
      })
    }
    const importantCount = (joined.match(/!important/gi) ?? []).length
    if (importantCount > 3) {
      filePush({
        id: 'css/important',
        severity: 'p2',
        message: `!important 出现 ${importantCount} 次：说明选择器或层级设计失衡`,
        source: 'MDN Specificity · CSS Guidelines',
      })
    }
  }

  const dataUri = /data:image\/[a-z+]+;base64,([A-Za-z0-9+/=]{2048,})/i.exec(joined)
  if (dataUri) {
    const lineNo = joined.slice(0, dataUri.index).split('\n').length
    filePush(
      {
        id: 'perf/data-uri',
        severity: 'p1',
        message: '内联 base64 图片超过 2KB：阻塞首屏解析且无法缓存',
        source: 'web.dev（图片与 LCP 优化）',
      },
      lineNo,
    )
  }

  return { findings }
}

/** 扫描单个文件；读不了或超大时返回 skipped 原因。 */
export function scanFile(file, options = {}) {
  const ext = extname(file).toLowerCase()
  if (!TEXT_EXTS.has(ext)) return { findings: [], skipped: `${file}: 不支持的类型` }
  let st
  try {
    st = statSync(file)
  } catch {
    return { findings: [], skipped: `${file}: 无法读取` }
  }
  if (st.size > MAX_FILE_BYTES) return { findings: [], skipped: `${file}: 超过 1MB` }
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    return { findings: [], skipped: `${file}: 读取失败` }
  }
  return scanText(text, { ...options, file, ext })
}

/** 扫描目录；root 默认为当前目录。 */
export function scanProject({ root = '.', ignore = [], include, exclude = [], maxFindings = Infinity } = {}) {
  const rootAbs = resolve(root)
  const ignoreSet = new Set(ignore)
  const excludeDirs = new Set(exclude)
  const includeSet =
    include && include.length
      ? new Set(include.map((e) => (e.startsWith('.') ? e : `.${e}`)))
      : null
  const files = []
  walk(rootAbs, { ignoreDirs: excludeDirs, out: files })

  const findings = []
  const skipped = []
  let scanned = 0
  for (const file of files.sort()) {
    const ext = extname(file).toLowerCase()
    if (!TEXT_EXTS.has(ext)) continue
    if (includeSet && !includeSet.has(ext)) continue
    const result = scanFile(file, { ignore: ignoreSet, maxFindings: maxFindings - findings.length })
    if (result.skipped) skipped.push(result.skipped)
    scanned += 1
    findings.push(
      ...result.findings.map((f) => ({ ...f, file: relative(rootAbs, f.file) || f.file })),
    )
    if (findings.length >= maxFindings) break
  }
  return { root: rootAbs, scanned, findings, skipped }
}

/** 汇总计数与退出码。 */
export function summarize(result, { failOn = 'p0' } = {}) {
  const counts = { p0: 0, p1: 0, p2: 0 }
  for (const f of result.findings) counts[f.severity] = (counts[f.severity] ?? 0) + 1
  let exitCode = 0
  if (failOn !== 'none') {
    const threshold = SEVERITY_RANK[failOn] ?? 0
    exitCode = result.findings.some((f) => SEVERITY_RANK[f.severity] <= threshold) ? 1 : 0
  }
  return { counts, exitCode }
}

/** 纯文本渲染。 */
export function formatText(result, { failOn = 'p0', quiet = false } = {}) {
  const { counts, exitCode } = summarize(result, { failOn })
  const lines = []
  if (!quiet) {
    for (const f of result.findings) {
      lines.push(`${f.file}:${f.line}:${f.column}  ${f.severity.toUpperCase()}  ${f.rule}`)
      lines.push(`    ${f.message}`)
      if (f.snippet) lines.push(`    > ${f.snippet}`)
    }
    if (result.findings.length) lines.push('')
  }
  lines.push(
    `共 ${result.findings.length} 个问题：P0 ${counts.p0} · P1 ${counts.p1} · P2 ${counts.p2}（扫描 ${result.scanned} 个文件，fail-on=${failOn}）`,
  )
  if (result.skipped.length && !quiet) {
    lines.push(`跳过 ${result.skipped.length} 个文件（不支持/超大/读取失败）`)
  }
  return { text: lines.join('\n'), exitCode, counts }
}

function parseArgs(argv) {
  const options = {
    path: '.',
    format: 'text',
    failOn: 'p0',
    ignore: [],
    include: [],
    exclude: [],
    maxFindings: 500,
    quiet: false,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => argv[++i]
    switch (arg) {
      case '--path': options.path = next(); break
      case '--format': options.format = next(); break
      case '--fail-on': options.failOn = next(); break
      case '--ignore': options.ignore = next().split(',').map((s) => s.trim()).filter(Boolean); break
      case '--include': options.include = next().split(',').map((s) => s.trim()).filter(Boolean); break
      case '--exclude': options.exclude = next().split(',').map((s) => s.trim()).filter(Boolean); break
      case '--max-findings': options.maxFindings = Number(next()) || 500; break
      case '--quiet': options.quiet = true; break
      case '--help':
      case '-h':
        options.help = true
        break
      default:
        if (!arg.startsWith('-')) options.path = arg
        break
    }
  }
  return options
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv)
  if (options.help) {
    process.stdout.write(
      [
        '前端规范检查器（dsh-frontend-page-craft）',
        '',
        '用法: node check-standards.mjs [--path .] [--format text|json] [--fail-on p0|p1|p2|none]',
        '                               [--ignore ruleId,...] [--include .ts,.vue]',
        '                               [--exclude dir,...] [--max-findings 500] [--quiet]',
        '',
        'P0 = 必须修（安全/可访问性阻断），P1 = 应当修，P2 = 卫生项。',
      ].join('\n') + '\n',
    )
    return 0
  }

  const result = scanProject(options)
  if (options.format === 'json') {
    const { counts, exitCode } = summarize(result, { failOn: options.failOn })
    process.stdout.write(`${JSON.stringify({ ...result, counts, exitCode }, null, 2)}\n`)
    return exitCode
  }
  const { text, exitCode } = formatText(result, options)
  process.stdout.write(`${text}\n`)
  return exitCode
}

const isEntry = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (isEntry) {
  process.exitCode = main()
}
