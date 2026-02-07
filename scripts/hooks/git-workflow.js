#!/usr/bin/env node
/**
 * Git workflow hook — PreToolUse on Bash
 *
 * Enforces git safety:
 * 1. Block `git push --force` to main/master (exit 2 = block)
 * 2. Warn on non-conventional commit messages
 * 3. Warn if committing directly to main branch
 * 4. Remind to review before `git push`
 */

import { parseStdin, log, getGitBranch } from './lib/utils.js';

const CONVENTIONAL_PATTERN = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?:\s.+/;

async function main() {
  const event = await parseStdin();
  const input = event.tool_input || {};
  const command = input.command || '';

  if (!command) {
    process.exit(0);
  }

  // 1. Block force push to main/master
  if (/git\s+push\s+.*--force/.test(command) || /git\s+push\s+-f\b/.test(command)) {
    if (/\b(main|master)\b/.test(command)) {
      log('');
      log('🚫 BLOCKED: Force push to main/master is not allowed.');
      log('   Use a feature branch and create a PR instead.');
      log('');
      process.exit(2);
    }
    log('');
    log('⚠️  Force pushing — make sure this is intentional.');
    log('');
  }

  // 2. Check conventional commit messages
  const commitMatch = command.match(/git\s+commit\s+.*-m\s+["']([^"']+)["']/);
  if (commitMatch) {
    const message = commitMatch[1];
    if (!CONVENTIONAL_PATTERN.test(message)) {
      log('');
      log('⚠️  Non-conventional commit message detected.');
      log('   Expected format: type(scope): description');
      log('   Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert');
      log(`   Got: "${message}"`);
      log('');
    }
  }

  // 3. Warn if committing to main
  if (/git\s+commit\b/.test(command)) {
    const branch = getGitBranch();
    if (branch === 'main' || branch === 'master') {
      log('');
      log('⚠️  Committing directly to ' + branch + ' — consider using a feature branch.');
      log('');
    }
  }

  // 4. Remind to review before push
  if (/git\s+push\b/.test(command) && !/--force|-f\b/.test(command)) {
    log('');
    log('📤 Pushing changes — make sure you\'ve reviewed the diff.');
    log('');
  }

  // 5. Block destructive git operations
  if (/git\s+reset\s+--hard/.test(command)) {
    log('');
    log('⚠️  Destructive operation: git reset --hard — uncommitted changes will be lost.');
    log('');
  }

  if (/git\s+clean\s+-f/.test(command)) {
    log('');
    log('⚠️  Destructive operation: git clean -f — untracked files will be deleted.');
    log('');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
