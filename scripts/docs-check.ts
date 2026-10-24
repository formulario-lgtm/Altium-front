import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'AGENTS.md',
  'CHANGELOG.md',
  'README.md',
  'docs/architecture/overview.md',
  'docs/architecture/project-structure.md',
  'docs/standards/coding-standards.md',
  'docs/standards/ui-ux.md',
  'docs/standards/components.md',
  'docs/standards/testing.md',
  'docs/standards/documentation.md',
  'docs/standards/git-workflow.md',
  'docs/guides/development.md',
  'docs/guides/environments.md',
  'docs/features/README.md',
  'docs/features/system-status/overview.md',
  'docs/components/README.md',
  'docs/components/theme-toggle-button.md',
  'docs/decisions/README.md',
  'docs/decisions/0001-project-root-and-stack.md',
  'docs/decisions/0002-deferred-form-and-chart-libraries.md',
];

const requiredCursorRules = ['.cursor/rules/project.mdc'];

type Finding = { level: 'error' | 'warn'; message: string };

function walkVueComponents(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkVueComponents(fullPath));
    } else if (entry.endsWith('.vue')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main(): void {
  const findings: Finding[] = [];

  for (const file of requiredFiles) {
    if (!existsSync(join(root, file))) {
      findings.push({ level: 'error', message: `Missing required documentation file: ${file}` });
    }
  }

  for (const file of requiredCursorRules) {
    if (!existsSync(join(root, file))) {
      findings.push({ level: 'error', message: `Missing Cursor rule: ${file}` });
    }
  }

  const globalComponents = [
    ...walkVueComponents(join(root, 'src/components/base')),
    ...walkVueComponents(join(root, 'src/components/common')),
    ...walkVueComponents(join(root, 'src/components/layout')),
  ];

  for (const componentPath of globalComponents) {
    const baseName =
      componentPath
        .split(/[/\\]/)
        .pop()
        ?.replace(/\.vue$/, '') ?? '';
    const kebab = baseName
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/_/g, '-')
      .toLowerCase();
    const docPath = join(root, 'docs/components', `${kebab}.md`);
    if (!existsSync(docPath)) {
      findings.push({
        level: 'error',
        message: `Global component ${baseName} requires docs/components/${kebab}.md`,
      });
    }
  }

  const featuresIndex = join(root, 'docs/features/README.md');
  if (existsSync(featuresIndex)) {
    const content = readFileSync(featuresIndex, 'utf8');
    if (!content.includes('system-status')) {
      findings.push({
        level: 'error',
        message: 'docs/features/README.md must index system-status',
      });
    }
  }

  const errors = findings.filter((f) => f.level === 'error');
  for (const warning of findings.filter((f) => f.level === 'warn')) {
    console.warn(`[docs:check] WARN ${warning.message}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[docs:check] ERROR ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('[docs:check] OK — required documentation is present.');
}

main();
