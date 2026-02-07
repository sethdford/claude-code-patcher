#!/usr/bin/env node
/**
 * Session end hook — SessionEnd event
 *
 * Logs session duration and summary to the activity log.
 */

import { parseStdin, getProjectRoot } from './lib/utils.js';
import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const event = await parseStdin();

  const root = getProjectRoot();
  const logDir = join(root, 'logs');
  const logFile = join(logDir, 'claude-activity.jsonl');

  if (!existsSync(logDir)) {
    try {
      mkdirSync(logDir, { recursive: true });
    } catch {
      process.exit(0);
    }
  }

  const entry = {
    timestamp: new Date().toISOString(),
    event: 'session_end',
    session_id: process.env.CLAUDE_SESSION_ID || null,
    summary: event.summary || null,
  };

  try {
    appendFileSync(logFile, JSON.stringify(entry) + '\n');
  } catch {
    // Non-critical
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
