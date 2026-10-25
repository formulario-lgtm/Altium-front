import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'AGENTS.md',
  'CHANGELOG.md',
  'README.md',
  'docs/architecture/overview.md',
  'docs/architecture/project-structure.md',
  'docs/architecture/api-integration.md',
  'docs/architecture/visual-identity.md',
  'docs/standards/coding-standards.md',
  'docs/standards/ui-ux.md',
  'docs/standards/components.md',
  'docs/standards/testing.md',
  'docs/standards/documentation.md',
  'docs/standards/git-workflow.md',
  'docs/standards/http-client.md',
  'docs/standards/query-management.md',
  'docs/guides/development.md',
  'docs/guides/environments.md',
  'docs/guides/openapi-types.md',
  'docs/guides/authentication.md',
  'docs/features/README.md',
  'docs/components/README.md',
  'docs/decisions/README.md',
  'docs/decisions/0001-project-root-and-stack.md',
  'docs/decisions/0002-deferred-form-and-chart-libraries.md',
  'docs/decisions/0003-openapi-contract-sync.md',
  'docs/decisions/0004-openapi-fetch-over-axios.md',
  'contracts/openapi.json',
  'src/types/generated/api.ts',
];

/** Feature folders: each needs `docs/features/<name>/overview.md` and an index entry. */
const requiredFeatures = [
  'system-status',
  'auth',
  'account',
  'home',
  'users',
  'teams',
  'roles',
  'audit',
  'sales',
  'administrative',
  'supervision',
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
  const globalComponentDocs: Array<{ baseName: string; kebab: string }> = [];

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
    globalComponentDocs.push({ baseName, kebab });
  }

  const featuresIndex = join(root, 'docs/features/README.md');
  const indexContent = existsSync(featuresIndex) ? readFileSync(featuresIndex, 'utf8') : '';
  for (const feature of requiredFeatures) {
    const docPath = `docs/features/${feature}/overview.md`;
    if (!existsSync(join(root, docPath))) {
      findings.push({ level: 'error', message: `Missing feature documentation: ${docPath}` });
    }
    if (!indexContent.includes(`${feature}/overview.md`)) {
      findings.push({
        level: 'error',
        message: `docs/features/README.md must index ${feature}`,
      });
    }
  }

  const componentsIndex = join(root, 'docs/components/README.md');
  const componentsContent = existsSync(componentsIndex)
    ? readFileSync(componentsIndex, 'utf8')
    : '';
  for (const { baseName, kebab } of globalComponentDocs) {
    if (!componentsContent.includes(`${kebab}.md`)) {
      findings.push({
        level: 'error',
        message: `docs/components/README.md must index ${baseName} (${kebab}.md)`,
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
