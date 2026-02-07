#!/usr/bin/env node
/**
 * Desktop notification hook — Stop/Notification events
 *
 * Sends native desktop notifications:
 * - macOS: osascript
 * - Linux: notify-send
 */

import { parseStdin } from './lib/utils.js';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';

function notify(title, message) {
  const os = platform();

  try {
    if (os === 'darwin') {
      execSync(
        `osascript -e 'display notification "${message}" with title "${title}"'`,
        { timeout: 5000, stdio: 'pipe' }
      );
    } else if (os === 'linux') {
      execSync(
        `notify-send "${title}" "${message}"`,
        { timeout: 5000, stdio: 'pipe' }
      );
    }
    // Windows: no built-in notification support without extra deps
  } catch {
    // Notification failure is never critical
  }
}

async function main() {
  const event = await parseStdin();

  // Determine notification type from event shape
  const eventType = event.event || event.hook_event || '';
  const message = event.message || '';

  if (eventType === 'Stop' || eventType === 'stop') {
    notify('Claude Code', 'Session stopped — review output');
  } else if (eventType === 'Notification' || eventType === 'notification') {
    notify('Claude Code', message || 'Input needed');
  } else {
    // Generic notification for unknown event types
    notify('Claude Code', message || 'Task update');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
