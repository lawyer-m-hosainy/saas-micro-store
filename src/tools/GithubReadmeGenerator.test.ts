import { describe, expect, it } from 'vitest';
import { buildReadme, ReadmeInputs } from './GithubReadmeGenerator';

const base = (overrides: Partial<ReadmeInputs> = {}): ReadmeInputs => ({
  projectName: 'MyApp',
  description: 'A cool app.',
  installCommand: 'npm install myapp',
  usageExample: 'npm start',
  license: 'MIT',
  githubUser: 'octocat',
  repoName: 'myapp',
  includeBadges: true,
  includeContributing: true,
  ...overrides,
});

describe('buildReadme', () => {
  it('starts with the project name as an H1', () => {
    const md = buildReadme(base());
    expect(md.startsWith('# MyApp')).toBe(true);
  });

  it('includes the description, install, and usage sections', () => {
    const md = buildReadme(base());
    expect(md).toContain('A cool app.');
    expect(md).toContain('npm install myapp');
    expect(md).toContain('npm start');
  });

  it('includes shields.io badges referencing the given user and repo when enabled', () => {
    const md = buildReadme(base({ includeBadges: true }));
    expect(md).toContain('shields.io/github/license/octocat/myapp');
    expect(md).toContain('shields.io/github/stars/octocat/myapp');
  });

  it('omits badges when disabled', () => {
    const md = buildReadme(base({ includeBadges: false }));
    expect(md).not.toContain('shields.io');
  });

  it('includes a contributing section only when enabled', () => {
    expect(buildReadme(base({ includeContributing: true }))).toContain('## المساهمة');
    expect(buildReadme(base({ includeContributing: false }))).not.toContain('## المساهمة');
  });

  it('states the given license in the license section', () => {
    const md = buildReadme(base({ license: 'Apache-2.0' }));
    expect(md).toContain('رخصة Apache-2.0');
  });

  it('falls back to sensible defaults for empty fields', () => {
    const md = buildReadme(base({ projectName: '', installCommand: '', usageExample: '', license: '' }));
    expect(md).toContain('# My Project');
    expect(md).toContain('npm install');
    expect(md).toContain('npm start');
    expect(md).toContain('رخصة MIT');
  });
});
