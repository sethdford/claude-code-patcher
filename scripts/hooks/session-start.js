#!/usr/bin/env node
/**
 * Session start hook — SessionStart event
 *
 * Outputs environment context summary to stdout (injected into Claude's context):
 * 1. Node.js version check
 * 2. Dependencies installed check
 * 3. Build freshness check
 * 4. Git status summary
 * 5. Project version
 * 6. Server status (port 3847)
 */

import { run, getProjectRoot, getGitBranch } from './lib/utils.js';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function main() {
  const root = getProjectRoot();
  const lines = [];

  lines.push('── Claude Fleet Session Context ──');
  lines.push('');

  // 1. Node.js version
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1));
  if (major < 18) {
    lines.push(`⚠️  Node.js ${nodeVersion} — requires >=18.0.0`);
  } else {
    lines.push(`Node.js: ${nodeVersion}`);
  }

  // 2. Dependencies
  const nodeModules = join(root, 'node_modules');
  if (!existsSync(nodeModules)) {
    lines.push('⚠️  node_modules missing — run `npm install`');
  }

  // 3. Build freshness
  const distDir = join(root, 'dist');
  const srcDir = join(root, 'src');
  if (existsSync(distDir) && existsSync(srcDir)) {
    try {
      const distStat = statSync(distDir);
      const srcStat = statSync(srcDir);
      if (srcStat.mtimeMs > distStat.mtimeMs) {
        lines.push('⚠️  dist/ is stale — run `npm run build`');
      } else {
        lines.push('Build: up to date');
      }
    } catch {
      lines.push('Build: unknown');
    }
  } else if (!existsSync(distDir)) {
    lines.push('⚠️  No dist/ directory — run `npm run build`');
  }

  // 4. Git status
  const branch = getGitBranch();
  if (branch) {
    lines.push(`Branch: ${branch}`);

    const dirtyCount = run('git status --porcelain 2>/dev/null | wc -l');
    if (dirtyCount && parseInt(dirtyCount) > 0) {
      lines.push(`Dirty files: ${dirtyCount.trim()}`);
    }
  }

  // 5. Project version
  try {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    lines.push(`Version: ${pkg.version || 'unknown'}`);
    lines.push(`Project: ${pkg.name || 'unknown'}`);
  } catch {
    // No package.json
  }

  // 6. Server port check (fleet typically uses 3847)
  const portCheck = run('lsof -i :3847 -t 2>/dev/null');
  if (portCheck) {
    lines.push('Server: running on port 3847');
  }

  lines.push('');
  lines.push('── End Session Context ──');

  // Output to stdout — Claude Code injects this into context
  console.log(lines.join('\n'));
  process.exit(0);
}

main();
