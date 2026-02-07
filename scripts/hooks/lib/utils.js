/**
 * Shared utilities for Claude Code hook scripts.
 * Cross-platform Node.js helpers following the everything-claude-code pattern.
 */

import { existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Parse JSON from stdin (hook event payload).
 * Claude Code pipes event data as JSON to hook scripts via stdin.
 * @returns {Promise<object>} Parsed event data
 */
export function parseStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(data.trim() ? JSON.parse(data) : {});
      } catch {
        resolve({ raw: data });
      }
    });
    process.stdin.on('error', reject);
    // Timeout if no stdin after 2s (e.g., manual invocation)
    setTimeout(() => resolve({}), 2000);
  });
}

/**
 * Find the project root by traversing up from cwd looking for package.json.
 * @returns {string} Absolute path to project root
 */
export function getProjectRoot() {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

/**
 * Extract file_path from hook tool_input payload.
 * Handles both Write (file_path) and Edit (file_path) tool shapes.
 * @param {object} input - The tool_input object from the event
 * @returns {string|null} The file path, or null if not found
 */
export function getFilePath(input) {
  if (!input) return null;
  return input.file_path || input.filePath || input.path || null;
}

/**
 * Check if a file is a source code file (TypeScript/JavaScript).
 * @param {string} filePath
 * @returns {boolean}
 */
export function isSourceFile(filePath) {
  if (!filePath) return false;
  const ext = extname(filePath);
  return ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext);
}

/**
 * Check if a file is a test file.
 * @param {string} filePath
 * @returns {boolean}
 */
export function isTestFile(filePath) {
  if (!filePath) return false;
  const name = basename(filePath);
  return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(name) || filePath.includes('__tests__');
}

/**
 * Check if a file is a TypeScript file.
 * @param {string} filePath
 * @returns {boolean}
 */
export function isTypeScriptFile(filePath) {
  if (!filePath) return false;
  const ext = extname(filePath);
  return ['.ts', '.tsx'].includes(ext);
}

/**
 * Log a message to stderr (visible to Claude Code as hook output).
 * @param {string} msg
 */
export function log(msg) {
  process.stderr.write(`${msg}\n`);
}

/**
 * Find the related test file for a source file.
 * Checks co-located .test.ts, tests/ directory, and __tests__/ directory.
 * @param {string} srcPath - Absolute path to the source file
 * @returns {string|null} Path to the test file, or null
 */
export function findRelatedTestFile(srcPath) {
  if (!srcPath) return null;
  const dir = dirname(srcPath);
  const name = basename(srcPath, extname(srcPath));
  const ext = extname(srcPath);

  // Co-located: foo.test.ts next to foo.ts
  const colocated = join(dir, `${name}.test${ext}`);
  if (existsSync(colocated)) return colocated;

  // Spec variant: foo.spec.ts
  const spec = join(dir, `${name}.spec${ext}`);
  if (existsSync(spec)) return spec;

  // tests/ subdirectory
  const testsDir = join(dir, 'tests', `${name}.test${ext}`);
  if (existsSync(testsDir)) return testsDir;

  // __tests__/ subdirectory
  const underTests = join(dir, '__tests__', `${name}.test${ext}`);
  if (existsSync(underTests)) return underTests;

  // Project root tests/ directory
  const root = getProjectRoot();
  const rootTests = join(root, 'tests', `${name}.test${ext}`);
  if (existsSync(rootTests)) return rootTests;

  return null;
}

/**
 * Run a shell command and return stdout. Returns null on failure.
 * @param {string} cmd
 * @param {object} [opts]
 * @returns {string|null}
 */
export function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 30000, ...opts }).trim();
  } catch {
    return null;
  }
}

/**
 * Get list of recently modified files in git working tree.
 * @returns {string[]}
 */
export function getModifiedFiles() {
  const result = run('git diff --name-only HEAD 2>/dev/null');
  if (!result) return [];
  return result.split('\n').filter(Boolean);
}

/**
 * Get the current git branch name.
 * @returns {string|null}
 */
export function getGitBranch() {
  return run('git rev-parse --abbrev-ref HEAD 2>/dev/null');
}
