# 贡献指南

## 环境

- Node.js ≥ 20（CI 覆盖 20 / 22 / 24）
- 无需安装依赖：插件与检查器都是零依赖 ESM

## 本地开发

```bash
npm run check      # 语法检查（lib 与检查器）
npm test           # 结构测试 + 检查器测试
npm run standards  # 用检查器扫描本仓库（排除 test/fixtures）
npm run verify     # 全部
```

把目录链进 DSH profile 后，改 `skills/` 与 `resources/` 会即时生效（技能正文按需重读）：

```bash
dsh plugin --profile desktop add link:<本目录绝对路径>
```

## 新增一条规范规则

1. 在 `resources/bin/check-standards.mjs` 选择位置：
   - `LINE_RULES`：行级正则；需要读取字符串内容时加 `inspectLiterals: true`，需要匹配注释指令（如 `@ts-ignore`）时加 `onRaw: true`。
   - `TAG_RULES`：HTML/Vue 标签属性组合，函数签名 `(name, attrs) => boolean`。
2. 写明 `id`（`域/规则名`）、`severity`（p0/p1/p2）、`exts`、`message`（说明 + 怎么改）、`source`（规范出处）。
3. 在 `test/fixtures/standards/` 增加能命中的样例；在 `test/standards.test.mjs` 增加期望。
4. 同步更新：`resources/standards.md` 的规则总表与计数、`README.md` 的规则覆盖表、`CHANGELOG.md`。

## 新增页面范式 / 选型条目

- 范式写到 `resources/page-archetypes.md`：线框、必备区块、组件映射、陷阱、验收要点。
- 选型条目同时改 `resources/catalog.json`（机器可读）与 `resources/component-catalog.md`（人读）；两边名称必须一致，测试会校验。
- 维护状态依据：官方仓库活跃度、生态版本、官方迁移说明；`unknown` 的条目标注「未核实前不引入」。

## 提交约定

- 提交信息用 `类型: 摘要`，类型取 `feat` / `fix` / `docs` / `test` / `refactor` / `chore`。
- 一个提交只做一类事；规则变更与文档变更分开。
- 提交前必须 `npm run verify` 全绿。

## 发布

1. 更新 `package.json` 版本与 `CHANGELOG.md`。
2. `git tag -a vX.Y.Z -m "..."` 并推送标签。
3. 市场收录按 cordis 插件类型；技能目录分类见市场规则。
