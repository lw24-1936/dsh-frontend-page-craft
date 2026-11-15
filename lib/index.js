/**
 * dsh-frontend-page-craft —— 前端页面「需求分析 → 设计 → 实现 → 验收」技能插件。
 *
 * 设计：
 *   - 只注册一个技能：frontend-page-craft。description 写清触发场景与硬门禁，
 *     保证模型在「做页面 / 选组件库 / 设计系统 / 数据大屏」时能自己想到它；
 *   - 技能正文放 skills/frontend-page-craft.md，运行时读盘，改文案不改代码；
 *   - 正文只保留流程与判据，组件目录、选型矩阵、页面范式、实现手册、验收清单
 *     放 resources/，通过 resourceBase 让模型按步骤按需读取（渐进披露）；
 *   - 零运行时依赖，硬依赖 skills 服务（不在时不激活，而不是静默不生效）。
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '..');
const SKILL_DIR = join(PACKAGE_ROOT, 'skills');
const RESOURCE_DIR = join(PACKAGE_ROOT, 'resources');

const SKILL_SPEC = {
  name: 'frontend-page-craft',
  file: 'frontend-page-craft.md',
  description:
    '前端页面从需求到上线的执行层技能：先做需求分析（Brief）、再定视觉方向与设计令牌（DESIGN）、然后实现（Vue3/React 均可）、最后按清单验收。做页面、改页面、做后台/仪表盘/落地页/移动 H5/数据大屏、选组件库或图表库、建设计系统、review 前端 UI 时加载。硬门禁：禁止未确认就装依赖；禁止默认紫渐变+三卡片+emoji 图标的 AI 味页面；必须交付 loading/empty/error/边界四态、键盘可达与 4.5:1 对比度、响应式与 prefers-reduced-motion；凡用组件库必须先查 resources/component-catalog.md 与 stack-decisions.md，不得凭记忆报不存在的组件名或版本号。',
  whenToUse:
    '用户说「做个页面/落地页/后台/仪表盘/大屏/H5/官网/表单/表格/看板」，或要求重做/美化现有界面、搭建设计系统与设计令牌、挑选前端组件库/图表库/动画库时。',
};

const RESOURCE_FILES = [
  'component-catalog.md',
  'catalog.json',
  'stack-decisions.md',
  'design-direction.md',
  'page-archetypes.md',
  'implementation-playbook.md',
  'qa-checklist.md',
  'source-notes.md',
  'examples/hero-proof.html',
  'examples/dashboard-skeleton.vue',
];

/** 硬依赖：skills 服务 */
const inject = ['skills'];

function readSkillContent(ctx) {
  try {
    const content = readFileSync(join(SKILL_DIR, SKILL_SPEC.file), 'utf8');
    if (!content.trim()) throw new Error('技能正文为空');
    return content;
  } catch (err) {
    ctx.logger?.warn?.(
      `[dsh-frontend-page-craft] 读取 skills/${SKILL_SPEC.file} 失败：${err.message}；技能未注册`,
    );
    return null;
  }
}

/** 资源目录可用时返回 resourceBase，否则如实降级为「只加载正文」。 */
function resolveResourceBase(ctx) {
  try {
    if (!existsSync(RESOURCE_DIR) || !statSync(RESOURCE_DIR).isDirectory()) {
      throw new Error('resources 目录不存在');
    }
    const missing = RESOURCE_FILES.filter((rel) => !existsSync(join(RESOURCE_DIR, rel)));
    if (missing.length) {
      ctx.logger?.warn?.(
        `[dsh-frontend-page-craft] 缺少资源文件：${missing.join(', ')}；缺失项在正文中会标注为不可用`,
      );
    }
    return { kind: 'directory', path: RESOURCE_DIR };
  } catch (err) {
    ctx.logger?.warn?.(
      `[dsh-frontend-page-craft] 资源目录不可用（${err.message}），将只加载技能正文`,
    );
    return undefined;
  }
}

function apply(ctx, config = {}) {
  // 允许用 config.enabled === false 临时停用，而不必卸载 bundle。
  if (config && config.enabled === false) {
    ctx.logger?.info?.('[dsh-frontend-page-craft] config.enabled=false，技能未注册');
    return () => {};
  }

  const content = readSkillContent(ctx);
  if (!content) return () => {};

  const resourceBase = resolveResourceBase(ctx);

  const dispose = ctx.skills.register({
    name: SKILL_SPEC.name,
    description: SKILL_SPEC.description,
    whenToUse: SKILL_SPEC.whenToUse,
    content,
    source: 'bundled',
    invocation: { modelInvocable: true, userInvocable: true },
    ...(resourceBase ? { resourceBase } : {}),
    metadata: {
      pack: 'dsh-frontend-page-craft',
      kind: 'frontend',
      file: SKILL_SPEC.file,
      resources: 'resources',
      flow: 'brief > design > implement > verify',
    },
  });

  return () => {
    try {
      dispose();
    } catch {
      // 卸载阶段清理失败不应阻断其余资源回收
    }
  };
}

const name = 'dsh-frontend-page-craft';

export { apply, inject, name, SKILL_SPEC, RESOURCE_FILES };
