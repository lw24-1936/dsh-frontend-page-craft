# 前端规范检查：32 条红线与依据

这一层不是 ESLint 的替代品，而是**补充**：

| 层 | 负责 | 工具 |
| --- | --- | --- |
| 语法/格式 | 分号、引号、缩进、换行 | Prettier |
| 语义/类型 | 未使用变量、隐式 any、Hooks 规则、Vue 模板语法 | ESLint + typescript-eslint + eslint-plugin-vue |
| **跨文件/模板红线** | XSS、可访问性、Vue 模板组合、密钥、性能气味 | **本检查器** |
| 浏览器实测 | 对比度、键盘、LCP/INP/CLS | 页面验收 + Lighthouse |

检查器零依赖、单文件，可在任何仓库里跑：

```bash
node resources/bin/check-standards.mjs --path . --exclude fixtures
```

## 级别与门禁

| 级别 | 含义 | 门禁 |
| --- | --- | --- |
| **P0** | 安全或可访问性阻断：会出 XSS、键盘用户不可用、模板必然错乱 | 必须修，`--fail-on p0` 时退出码 1 |
| **P1** | 违反公认规范，短期可运行、长期必还债 | 应当修，`--fail-on p1` 时退出码 1 |
| **P2** | 卫生项：影响可维护性/一致性 | 记录为待办，不阻塞 |

默认 `--fail-on p0`；发布前建议 `--fail-on p1`。`--fail-on none` 只报告不拦截。

## 规则总表

### 安全（XSS / 注入 / 密钥）

| 规则 | 级别 | 检查什么 | 依据 |
| --- | --- | --- | --- |
| `security/no-eval` | P0 | `eval()`、`new Function()` | ESLint [no-eval](https://eslint.org/docs/latest/rules/no-eval) · [Airbnb 6.4](https://github.com/airbnb/javascript) |
| `security/v-html` | P0 | Vue 模板里的 `v-html` | Vue 文档（安全）· [OWASP XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) |
| `security/react-danger` | P0 | `dangerouslySetInnerHTML` | React 文档 · OWASP XSS |
| `security/target-blank` | P0 | `target="_blank"` 缺 `rel="noopener"` | [MDN rel=noopener](https://developer.mozilla.org/docs/Web/HTML/Attributes/rel/noopener) |
| `security/hardcoded-secret` | P0 | 代码里出现 16 位以上疑似密钥 | OWASP Secrets Management · 12-Factor App |
| `security/document-write` | P1 | `document.write/writeln` | [MDN document.write](https://developer.mozilla.org/docs/Web/API/Document/write) |
| `security/innerhtml` | P1 | `.innerHTML =` 赋值 | OWASP XSS Prevention Cheat Sheet |
| `security/settimeout-string` | P1 | `setTimeout("code")` 字符串形式 | MDN · ESLint no-implied-eval |
| `security/mixed-content` | P2 | `http://` 资源引用 | [MDN Mixed content](https://developer.mozilla.org/docs/Web/Security/Mixed_content) |
| `js/no-debugger` | P0 | 遗留 `debugger` | ESLint [no-debugger](https://eslint.org/docs/latest/rules/no-debugger) |

### 可访问性（WCAG 2.2）

| 规则 | 级别 | 检查什么 | 依据 |
| --- | --- | --- | --- |
| `a11y/img-alt` | P0 | `<img>` 缺 `alt` | [WCAG 2.2 · 1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) |
| `a11y/zoom-disabled` | P0 | `user-scalable=no` / `maximum-scale=1` | [WCAG 2.2 · 1.4.4](https://www.w3.org/TR/WCAG22/#resize-text) |
| `a11y/outline-none` | P0 | 去掉 outline 且无 `:focus-visible` 替代 | [WCAG 2.2 · 2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible) |
| `a11y/html-lang` | P1 | `<html>` 缺 `lang` | [WCAG 2.2 · 3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) |
| `a11y/iframe-title` | P1 | `<iframe>` 缺 `title` | [WCAG 2.2 · 4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) |
| `a11y/click-static` | P1 | `div/span/li` 绑点击但无 `role`+`tabindex` | [WCAG 2.2 · 2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) |
| `a11y/button-type` | P2 | `<button>` 未写 `type` | [HTML Standard](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element) |
| `a11y/autoplay` | P2 | 音视频自动播放且未静音 | [WCAG 2.2 · 1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) |

### 模板（Vue 官方风格指南 Priority A）

| 规则 | 级别 | 检查什么 | 依据 |
| --- | --- | --- | --- |
| `vue/v-for-key` | P0 | `v-for` 缺 `key` | [Vue 风格指南 · keyed v-for](https://vuejs.org/style-guide/rules-essential.html#use-keyed-v-for) |
| `vue/v-if-v-for` | P0 | 同一元素同时 `v-if` + `v-for` | [Vue 风格指南 · v-if/v-for](https://vuejs.org/style-guide/rules-essential.html#avoid-v-if-with-v-for) |

### TypeScript / React / 卫生

| 规则 | 级别 | 检查什么 | 依据 |
| --- | --- | --- | --- |
| `ts/no-explicit-any` | P1 | 显式 `any` | [typescript-eslint no-explicit-any](https://typescript-eslint.io/rules/no-explicit-any/) · TypeScript Handbook |
| `ts/ban-ts-ignore` | P1 | `@ts-ignore` | [typescript-eslint ban-ts-comment](https://typescript-eslint.io/rules/ban-ts-comment/) |
| `react/key-index` | P2 | `key={index}` | [React 列表渲染](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key) |
| `js/no-var` | P1 | `var` 声明 | ESLint [no-var](https://eslint.org/docs/latest/rules/no-var) · [Google JS Style](https://google.github.io/styleguide/jsguide.html) · Airbnb 2.2 |
| `js/eqeqeq` | P2 | `==` / `!=` | ESLint [eqeqeq](https://eslint.org/docs/latest/rules/eqeqeq) · Airbnb 15.1 |
| `js/no-console` | P2 | `console.log/info/debug` | ESLint [no-console](https://eslint.org/docs/latest/rules/no-console) |
| `js/no-alert` | P2 | `alert()` | ESLint [no-alert](https://eslint.org/docs/latest/rules/no-alert) |

### HTML 骨架 / CSS / 性能

| 规则 | 级别 | 检查什么 | 依据 |
| --- | --- | --- | --- |
| `html/doctype` | P1 | 缺 `<!doctype html>` | [HTML Standard（doctype）](https://html.spec.whatwg.org/multipage/syntax.html#the-doctype) |
| `html/viewport` | P1 | 缺 viewport 或没有 `width=device-width` | MDN viewport · [WCAG 1.4.10](https://www.w3.org/TR/WCAG22/#reflow) |
| `html/duplicate-id` | P1 | 同文件重复 `id` | HTML Standard（id 唯一性）· [WCAG 4.1.1](https://www.w3.org/TR/WCAG22/#parsing) |
| `css/important` | P2 | `!important` > 3 次 | MDN Specificity · CSS Guidelines |
| `perf/data-uri` | P1 | 内联 base64 图片 > 2KB | [web.dev 图片与 LCP](https://web.dev/articles/optimize-lcp) |

共 **32 条**（安全 10、可访问性 8、模板 2、TS/React/卫生 7、HTML/CSS/性能 5）。

## 命令与输出

```bash
# 默认：扫描当前目录，P0 才让退出码变 1
node resources/bin/check-standards.mjs

# 发布前更严格
node resources/bin/check-standards.mjs --path src --fail-on p1

# 只给机器读
node resources/bin/check-standards.mjs --format json > standards.json

# 忽略个别规则 / 只查某类文件 / 排除目录
node resources/bin/check-standards.mjs --ignore js/no-console,js/no-alert --include .ts,.vue --exclude fixtures,legacy
```

文本输出：

```
src/App.vue:12:5  P0  vue/v-for-key
    v-for 必须带稳定 key（业务 id，不要下标）
    > <li v-for="item in items">
共 1 个问题：P0 1 · P1 0 · P2 0（扫描 18 个文件，fail-on=p0）
```

JSON 输出包含 `scanned`、`findings[]`（`file/line/column/rule/severity/message/source/snippet`）、`counts`、`exitCode`、`skipped[]`。

退出码：`0` 通过；`1` 有达到 `--fail-on` 阈值的问题；`2` 参数/路径错误由 Node 自身抛出。

## CI 集成

```yaml
- run: node resources/bin/check-standards.mjs --path . --exclude fixtures --fail-on p1
```

与 ESLint 并存，不冲突：ESLint 管得到的地方它也会报；它管的是 ESLint 默认配置看不到的**模板组合、跨文件 id、密钥、内联资源**。

## 与 ESLint 的推荐组合

新项目建议（版本以项目 lockfile 为准，不要抄死版本号）：

- `eslint` + `prettier` + `eslint-config-prettier`
- `typescript-eslint` 的 `recommended-type-checked`
- `eslint-plugin-vue` 的 `flat/essential`（Vue 项目）
- `eslint-plugin-jsx-a11y` 的 `recommended`（React 项目）
- `stylelint` + `stylelint-config-standard`（CSS/SCSS）

本检查器可以在 CI 里作为**第二道**：ESLint 通过后仍跑一次，专门兜住规则覆盖不到的红线。

## 已知限制（避免误信）

- **行级扫描，不做 AST 解析**：跨行 JSX/模板属性、复杂表达式可能漏报；字符串内出现的标签文本可能误报。
- **`.vue` 的行内 `<script>` 与模板共用规则集**：脚本里的字符串若含 `<img>` 等标签文本，可能被模板规则误伤。
- **HTML 内联 `<script>` 不按 JS 规则检查**（只按 HTML 规则）；内联脚本请拆到独立文件。
- **注释启发式**：单行与块注释会被跳过，但字符串里未闭合的引号可能影响判断；模板字符串跨行不跟踪。
- **不检查运行时**：对比度、焦点顺序、LCP/INP 必须用浏览器或 Lighthouse 实测。
- **密钥规则是正则启发式**：可能漏报变体，也可能把测试夹具当密钥；命中后请人工确认。

## 扩展一条规则

1. 在 `resources/bin/check-standards.mjs` 的 `LINE_RULES`（行级）或 `TAG_RULES`（标签级）追加一条，写明 `id`（`域/规则名`）、`severity`、`exts`、`pattern`/`test`、`message`、`source`。
2. 需要看字符串内容时加 `inspectLiterals: true`；匹配注释指令（如 `@ts-ignore`）时加 `onRaw: true`。
3. 在 `test/fixtures/standards/` 加一个必然命中的样例，在 `test/standards.test.mjs` 加期望。
4. 同步更新本文规则总表与 README 的规则数量。
