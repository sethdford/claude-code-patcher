/**
 * Gastown Native Tools
 * 
 * First-class native tools for Gas Town multi-agent orchestration.
 * These tools enable Claude Code instances to coordinate work through
 * Gastown's shared state (beads, convoys, hooks, mail).
 * 
 * Based on: https://github.com/steveyegge/gastown
 * 
 * Core Concepts:
 * - Beads: Git-backed issue tracking (work items)
 * - Convoys: Work bundles that group beads for assignment
 * - Hooks: Git worktree persistent storage for agent state
 * - Mail: Inter-agent messaging system
 * - Sling: Assign beads to agents
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync, spawnSync } from 'child_process';
import type { CustomToolDefinition, ToolContext } from '../types.js';

// ============================================================================
// GASTOWN STATE MANAGEMENT
// ============================================================================

interface GastownConfig {
  townPath: string;
  currentRig?: string;
  agentId?: string;
}

interface Bead {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'blocked' | 'resolved';
  assignee?: string;
  rig?: string;
  convoy?: string;
  created: string;
  updated: string;
  tags?: string[];
  blockedBy?: string[];
  comments?: Array<{ author: string; text: string; timestamp: string }>;
}

interface Convoy {
  id: string;
  name: string;
  beads: string[];
  status: 'active' | 'completed' | 'paused';
  created: string;
  updated: string;
  assignedAgents?: string[];
}

interface HookState {
  agentId: string;
  rig: string;
  beadId?: string;
  status: 'active' | 'suspended' | 'completed';
  context: Record<string, unknown>;
  created: string;
  updated: string;
}

interface MailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  replyTo?: string;
}

interface GastownStore {
  beads: Record<string, Bead>;
  convoys: Record<string, Convoy>;
  hooks: Record<string, HookState>;
  mail: Record<string, MailMessage[]>;  // keyed by recipient agentId
  config: GastownConfig;
  nextBeadNum: number;
  nextConvoyNum: number;
  nextMailNum: number;
}

/**
 * Get the Gastown data directory
 */
function getGastownDir(): string {
  // Check for GT_HOME environment variable first
  if (process.env.GT_HOME) {
    return path.join(process.env.GT_HOME, '.gastown');
  }
  
  // Check for town path in current directory
  const cwd = process.cwd();
  const localGt = path.join(cwd, '.gastown');
  if (fs.existsSync(localGt)) {
    return localGt;
  }
  
  // Default to home directory
  return path.join(os.homedir(), '.gastown');
}

/**
 * Get the store file path
 */
function getStorePath(): string {
  return path.join(getGastownDir(), 'store.json');
}

/**
 * Load Gastown store
 */
function loadStore(): GastownStore {
  const storePath = getStorePath();
  try {
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
  } catch {
    // Return default store
  }
  
  return {
    beads: {},
    convoys: {},
    hooks: {},
    mail: {},
    config: {
      townPath: process.env.GT_HOME || path.join(os.homedir(), 'gt'),
      agentId: process.env.GT_AGENT_ID || `agent-${Date.now().toString(36)}`
    },
    nextBeadNum: 1,
    nextConvoyNum: 1,
    nextMailNum: 1
  };
}

/**
 * Save Gastown store
 */
function saveStore(store: GastownStore): void {
  const dir = getGastownDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(getStorePath(), JSON.stringify(store, null, 2));
}

/**
 * Generate a bead ID (e.g., gt-abc12)
 */
function generateBeadId(store: GastownStore, prefix = 'gt'): string {
  const num = store.nextBeadNum++;
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  let n = num;
  for (let i = 0; i < 5; i++) {
    suffix = chars[n % 36] + suffix;
    n = Math.floor(n / 36);
  }
  return `${prefix}-${suffix.padStart(5, '0')}`;
}

/**
 * Try to execute real gt command if available
 */
function tryGtCommand(args: string[]): { success: boolean; output?: string; error?: string } {
  try {
    const result = spawnSync('gt', args, { 
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    if (result.status === 0) {
      return { success: true, output: result.stdout };
    }
    return { success: false, error: result.stderr || 'Command failed' };
  } catch {
    return { success: false, error: 'gt command not available' };
  }
}

/**
 * Get current agent ID
 */
function getAgentId(): string {
  return process.env.GT_AGENT_ID || 
         process.env.CLAUDE_AGENT_ID ||
         loadStore().config.agentId ||
         `claude-${process.pid}`;
}

// ============================================================================
// BEAD TOOLS (Issue Tracking)
// ============================================================================

/**
 * BeadCreate - Create a new bead (work item/issue)
 */
export const BeadCreate: CustomToolDefinition = {
  name: 'BeadCreate',
  description: 'Create a new bead (work item/issue) in Gastown. Beads are the fundamental unit of work tracking, stored in a git-backed ledger. Use for creating tasks, bugs, features, or any trackable work.',
  prompt: 'Use BeadCreate when the user wants to create a task, issue, bug report, or feature request. Beads can be grouped into convoys and assigned to agents.',
  icon: '📿',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short title for the bead'
      },
      description: {
        type: 'string',
        description: 'Detailed description of the work',
        optional: true
      },
      rig: {
        type: 'string',
        description: 'Project/rig to associate with (optional)',
        optional: true
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for categorization',
        optional: true
      },
      blockedBy: {
        type: 'array',
        items: { type: 'string' },
        description: 'Bead IDs that block this work',
        optional: true
      }
    },
    required: ['title']
  },
  outputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      status: { type: 'string' },
      created: { type: 'string' }
    }
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { 
    title: string; 
    description?: string; 
    rig?: string;
    tags?: string[];
    blockedBy?: string[];
  }, _context?: ToolContext) {
    const store = loadStore();
    const id = generateBeadId(store);
    
    const bead: Bead = {
      id,
      title: input.title,
      description: input.description,
      status: 'open',
      rig: input.rig,
      tags: input.tags,
      blockedBy: input.blockedBy,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    store.beads[id] = bead;
    saveStore(store);
    
    return {
      id: bead.id,
      title: bead.title,
      status: bead.status,
      created: bead.created
    };
  }
};

/**
 * BeadGet - Retrieve bead details
 */
export const BeadGet: CustomToolDefinition = {
  name: 'BeadGet',
  description: 'Retrieve full details of a bead by ID. Returns title, description, status, assignee, convoy membership, and any blockers.',
  prompt: 'Use BeadGet to check the status or details of a specific work item/bead.',
  icon: '🔍',
  inputSchema: {
    type: 'object',
    properties: {
      beadId: {
        type: 'string',
        description: 'The bead ID (e.g., gt-abc12)'
      }
    },
    required: ['beadId']
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(input: { beadId: string }, _context?: ToolContext) {
    const store = loadStore();
    const bead = store.beads[input.beadId];
    
    if (!bead) {
      return { error: `Bead not found: ${input.beadId}` };
    }
    
    return bead;
  }
};

/**
 * BeadUpdate - Update a bead
 */
export const BeadUpdate: CustomToolDefinition = {
  name: 'BeadUpdate',
  description: 'Update a bead\'s status, add comments, or modify properties. Status can be: open, in_progress, blocked, resolved.',
  prompt: 'Use BeadUpdate to change bead status (mark as in_progress when starting, resolved when done), add comments, or update blockers.',
  icon: '✏️',
  inputSchema: {
    type: 'object',
    properties: {
      beadId: {
        type: 'string',
        description: 'The bead ID to update'
      },
      status: {
        type: 'string',
        enum: ['open', 'in_progress', 'blocked', 'resolved'],
        description: 'New status',
        optional: true
      },
      comment: {
        type: 'string',
        description: 'Add a comment',
        optional: true
      },
      assignee: {
        type: 'string',
        description: 'Assign to an agent',
        optional: true
      },
      blockedBy: {
        type: 'array',
        items: { type: 'string' },
        description: 'Update blockers',
        optional: true
      }
    },
    required: ['beadId']
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: {
    beadId: string;
    status?: 'open' | 'in_progress' | 'blocked' | 'resolved';
    comment?: string;
    assignee?: string;
    blockedBy?: string[];
  }, _context?: ToolContext) {
    const store = loadStore();
    const bead = store.beads[input.beadId];
    
    if (!bead) {
      return { error: `Bead not found: ${input.beadId}` };
    }
    
    if (input.status) bead.status = input.status;
    if (input.assignee) bead.assignee = input.assignee;
    if (input.blockedBy) bead.blockedBy = input.blockedBy;
    
    if (input.comment) {
      bead.comments = bead.comments || [];
      bead.comments.push({
        author: getAgentId(),
        text: input.comment,
        timestamp: new Date().toISOString()
      });
    }
    
    bead.updated = new Date().toISOString();
    saveStore(store);
    
    return {
      id: bead.id,
      title: bead.title,
      status: bead.status,
      updated: bead.updated
    };
  }
};

/**
 * BeadList - List beads with filtering
 */
export const BeadList: CustomToolDefinition = {
  name: 'BeadList',
  description: 'List beads with optional filtering by status, assignee, rig, or convoy. Returns summary info for each bead.',
  prompt: 'Use BeadList to show available work items. Filter by status to find open work, or by assignee to see your assignments.',
  icon: '📋',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['all', 'open', 'in_progress', 'blocked', 'resolved'],
        description: 'Filter by status',
        optional: true
      },
      assignee: {
        type: 'string',
        description: 'Filter by assignee',
        optional: true
      },
      rig: {
        type: 'string',
        description: 'Filter by rig/project',
        optional: true
      },
      convoy: {
        type: 'string',
        description: 'Filter by convoy ID',
        optional: true
      }
    }
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(input: {
    status?: string;
    assignee?: string;
    rig?: string;
    convoy?: string;
  }, _context?: ToolContext) {
    const store = loadStore();
    let beads = Object.values(store.beads);
    
    if (input.status && input.status !== 'all') {
      beads = beads.filter(b => b.status === input.status);
    }
    if (input.assignee) {
      beads = beads.filter(b => b.assignee === input.assignee);
    }
    if (input.rig) {
      beads = beads.filter(b => b.rig === input.rig);
    }
    if (input.convoy) {
      beads = beads.filter(b => b.convoy === input.convoy);
    }
    
    return {
      count: beads.length,
      beads: beads.map(b => ({
        id: b.id,
        title: b.title,
        status: b.status,
        assignee: b.assignee,
        rig: b.rig
      }))
    };
  }
};

// ============================================================================
// CONVOY TOOLS (Work Bundles)
// ============================================================================

/**
 * ConvoyCreate - Create a convoy to bundle beads
 */
export const ConvoyCreate: CustomToolDefinition = {
  name: 'ConvoyCreate',
  description: 'Create a convoy to bundle multiple beads into a coordinated work unit. Convoys help track related work items together and can be assigned to agents.',
  prompt: 'Use ConvoyCreate when grouping related beads together for coordinated work. The Mayor typically creates convoys to organize agent work.',
  icon: '🚚',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name for the convoy'
      },
      beadIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Bead IDs to include in the convoy',
        optional: true
      }
    },
    required: ['name']
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { name: string; beadIds?: string[] }, _context?: ToolContext) {
    const store = loadStore();
    const id = `cv-${(store.nextConvoyNum++).toString().padStart(5, '0')}`;
    
    const convoy: Convoy = {
      id,
      name: input.name,
      beads: input.beadIds || [],
      status: 'active',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    // Update beads to reference this convoy
    for (const beadId of convoy.beads) {
      if (store.beads[beadId]) {
        store.beads[beadId].convoy = id;
      }
    }
    
    store.convoys[id] = convoy;
    saveStore(store);
    
    return {
      id: convoy.id,
      name: convoy.name,
      beadCount: convoy.beads.length,
      status: convoy.status
    };
  }
};

/**
 * ConvoyAdd - Add beads to an existing convoy
 */
export const ConvoyAdd: CustomToolDefinition = {
  name: 'ConvoyAdd',
  description: 'Add beads to an existing convoy. Use to expand a convoy with additional work items.',
  prompt: 'Use ConvoyAdd to add more beads to an existing convoy.',
  icon: '➕',
  inputSchema: {
    type: 'object',
    properties: {
      convoyId: {
        type: 'string',
        description: 'The convoy ID'
      },
      beadIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Bead IDs to add'
      }
    },
    required: ['convoyId', 'beadIds']
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { convoyId: string; beadIds: string[] }, _context?: ToolContext) {
    const store = loadStore();
    const convoy = store.convoys[input.convoyId];
    
    if (!convoy) {
      return { error: `Convoy not found: ${input.convoyId}` };
    }
    
    for (const beadId of input.beadIds) {
      if (!convoy.beads.includes(beadId)) {
        convoy.beads.push(beadId);
        if (store.beads[beadId]) {
          store.beads[beadId].convoy = convoy.id;
        }
      }
    }
    
    convoy.updated = new Date().toISOString();
    saveStore(store);
    
    return {
      id: convoy.id,
      name: convoy.name,
      beadCount: convoy.beads.length
    };
  }
};

/**
 * ConvoyShow - Show convoy details
 */
export const ConvoyShow: CustomToolDefinition = {
  name: 'ConvoyShow',
  description: 'Show detailed information about a convoy, including all its beads and their statuses.',
  prompt: 'Use ConvoyShow to see the progress and contents of a convoy.',
  icon: '📦',
  inputSchema: {
    type: 'object',
    properties: {
      convoyId: {
        type: 'string',
        description: 'The convoy ID (optional, shows active convoy if not provided)',
        optional: true
      }
    }
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(input: { convoyId?: string }, _context?: ToolContext) {
    const store = loadStore();
    
    let convoy: Convoy | undefined;
    if (input.convoyId) {
      convoy = store.convoys[input.convoyId];
    } else {
      // Get most recent active convoy
      convoy = Object.values(store.convoys)
        .filter(c => c.status === 'active')
        .sort((a, b) => b.updated.localeCompare(a.updated))[0];
    }
    
    if (!convoy) {
      return { error: 'No convoy found' };
    }
    
    const beadDetails = convoy.beads.map(id => {
      const bead = store.beads[id];
      return bead ? {
        id: bead.id,
        title: bead.title,
        status: bead.status,
        assignee: bead.assignee
      } : { id, error: 'not found' };
    });
    
    const statusCounts = beadDetails.reduce((acc, b) => {
      const status: string = 'status' in b && b.status ? b.status : 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      id: convoy.id,
      name: convoy.name,
      status: convoy.status,
      created: convoy.created,
      updated: convoy.updated,
      progress: statusCounts,
      beads: beadDetails
    };
  }
};

/**
 * ConvoyList - List all convoys
 */
export const ConvoyList: CustomToolDefinition = {
  name: 'ConvoyList',
  description: 'List all convoys with their status and bead counts.',
  prompt: 'Use ConvoyList to see all work bundles and their progress.',
  icon: '📑',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['all', 'active', 'completed', 'paused'],
        description: 'Filter by status',
        optional: true
      }
    }
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(input: { status?: string }, _context?: ToolContext) {
    const store = loadStore();
    let convoys = Object.values(store.convoys);
    
    if (input.status && input.status !== 'all') {
      convoys = convoys.filter(c => c.status === input.status);
    }
    
    return {
      count: convoys.length,
      convoys: convoys.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        beadCount: c.beads.length,
        updated: c.updated
      }))
    };
  }
};

// ============================================================================
// AGENT COORDINATION TOOLS
// ============================================================================

/**
 * AgentSling - Assign a bead to an agent
 */
export const AgentSling: CustomToolDefinition = {
  name: 'AgentSling',
  description: 'Sling (assign) a bead to an agent for work. This updates the bead\'s assignee and status, and notifies the target agent via mail.',
  prompt: 'Use AgentSling to assign work to yourself or another agent. This is the primary way to distribute work in Gastown.',
  icon: '🎯',
  inputSchema: {
    type: 'object',
    properties: {
      beadId: {
        type: 'string',
        description: 'The bead ID to assign'
      },
      agentId: {
        type: 'string',
        description: 'Target agent ID (defaults to self)',
        optional: true
      },
      message: {
        type: 'string',
        description: 'Optional message to include',
        optional: true
      }
    },
    required: ['beadId']
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { beadId: string; agentId?: string; message?: string }, _context?: ToolContext) {
    const store = loadStore();
    const bead = store.beads[input.beadId];
    
    if (!bead) {
      return { error: `Bead not found: ${input.beadId}` };
    }
    
    const targetAgent = input.agentId || getAgentId();
    const fromAgent = getAgentId();
    
    // Update bead
    bead.assignee = targetAgent;
    bead.status = 'in_progress';
    bead.updated = new Date().toISOString();
    
    // Send mail notification
    const mailId = `mail-${(store.nextMailNum++).toString().padStart(6, '0')}`;
    const mail: MailMessage = {
      id: mailId,
      from: fromAgent,
      to: targetAgent,
      subject: `Work assigned: ${bead.title}`,
      body: input.message || `Bead ${bead.id} has been assigned to you.\n\nTitle: ${bead.title}\nDescription: ${bead.description || 'N/A'}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    if (!store.mail[targetAgent]) {
      store.mail[targetAgent] = [];
    }
    store.mail[targetAgent].push(mail);
    
    saveStore(store);
    
    return {
      beadId: bead.id,
      assignedTo: targetAgent,
      status: bead.status,
      mailSent: mailId
    };
  }
};

/**
 * AgentList - List known agents
 */
export const AgentList: CustomToolDefinition = {
  name: 'AgentList',
  description: 'List all known agents and their current work assignments.',
  prompt: 'Use AgentList to see what agents are active and what they\'re working on.',
  icon: '👥',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(_input: Record<string, never>, _context?: ToolContext) {
    const store = loadStore();
    
    // Collect agents from beads and hooks
    const agents = new Map<string, { beads: string[]; hooks: string[] }>();
    
    for (const bead of Object.values(store.beads)) {
      if (bead.assignee) {
        if (!agents.has(bead.assignee)) {
          agents.set(bead.assignee, { beads: [], hooks: [] });
        }
        if (bead.status === 'in_progress') {
          agents.get(bead.assignee)!.beads.push(bead.id);
        }
      }
    }
    
    for (const hook of Object.values(store.hooks)) {
      if (!agents.has(hook.agentId)) {
        agents.set(hook.agentId, { beads: [], hooks: [] });
      }
      agents.get(hook.agentId)!.hooks.push(hook.beadId || 'general');
    }
    
    const currentAgent = getAgentId();
    
    return {
      currentAgent,
      agents: Array.from(agents.entries()).map(([id, data]) => ({
        id,
        isSelf: id === currentAgent,
        activeBeads: data.beads.length,
        hooks: data.hooks.length
      }))
    };
  }
};

// ============================================================================
// HOOK TOOLS (Persistent State)
// ============================================================================

/**
 * HookWrite - Write to persistent hook storage
 */
export const HookWrite: CustomToolDefinition = {
  name: 'HookWrite',
  description: 'Write data to your persistent hook storage. Hooks survive agent restarts and are git-backed for reliability.',
  prompt: 'Use HookWrite to save important state that should persist across sessions. Good for work progress, context, and resumption data.',
  icon: '🪝',
  inputSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'Storage key'
      },
      value: {
        type: 'string',
        description: 'Value to store (will be JSON parsed if valid JSON)'
      },
      beadId: {
        type: 'string',
        description: 'Associated bead ID (optional)',
        optional: true
      }
    },
    required: ['key', 'value']
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { key: string; value: string; beadId?: string }, _context?: ToolContext) {
    const store = loadStore();
    const agentId = getAgentId();
    const hookId = `${agentId}:${input.beadId || 'general'}`;
    
    if (!store.hooks[hookId]) {
      store.hooks[hookId] = {
        agentId,
        rig: store.config.currentRig || 'default',
        beadId: input.beadId,
        status: 'active',
        context: {},
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
    }
    
    // Try to parse as JSON
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(input.value);
    } catch {
      parsedValue = input.value;
    }
    
    store.hooks[hookId].context[input.key] = parsedValue;
    store.hooks[hookId].updated = new Date().toISOString();
    
    saveStore(store);
    
    return {
      hookId,
      key: input.key,
      stored: true
    };
  }
};

/**
 * HookRead - Read from persistent hook storage
 */
export const HookRead: CustomToolDefinition = {
  name: 'HookRead',
  description: 'Read data from your persistent hook storage. Use to recover context after restart.',
  prompt: 'Use HookRead to retrieve previously stored state, especially when resuming work.',
  icon: '📖',
  inputSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'Storage key to read (optional, reads all if not provided)',
        optional: true
      },
      beadId: {
        type: 'string',
        description: 'Associated bead ID (optional)',
        optional: true
      }
    }
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(input: { key?: string; beadId?: string }, _context?: ToolContext) {
    const store = loadStore();
    const agentId = getAgentId();
    const hookId = `${agentId}:${input.beadId || 'general'}`;
    
    const hook = store.hooks[hookId];
    if (!hook) {
      return { error: 'No hook found', hookId };
    }
    
    if (input.key) {
      return {
        hookId,
        key: input.key,
        value: hook.context[input.key],
        updated: hook.updated
      };
    }
    
    return {
      hookId,
      context: hook.context,
      updated: hook.updated
    };
  }
};

// ============================================================================
// MAIL TOOLS (Inter-Agent Messaging)
// ============================================================================

/**
 * MailSend - Send a message to another agent
 */
export const MailSend: CustomToolDefinition = {
  name: 'MailSend',
  description: 'Send a message to another agent. Messages are stored in their mailbox for when they next check.',
  prompt: 'Use MailSend to communicate with other agents, report status, ask questions, or hand off work.',
  icon: '📤',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient agent ID'
      },
      subject: {
        type: 'string',
        description: 'Message subject'
      },
      body: {
        type: 'string',
        description: 'Message body'
      },
      replyTo: {
        type: 'string',
        description: 'Mail ID this is replying to (optional)',
        optional: true
      }
    },
    required: ['to', 'subject', 'body']
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { to: string; subject: string; body: string; replyTo?: string }, _context?: ToolContext) {
    const store = loadStore();
    const fromAgent = getAgentId();
    
    const mailId = `mail-${(store.nextMailNum++).toString().padStart(6, '0')}`;
    const mail: MailMessage = {
      id: mailId,
      from: fromAgent,
      to: input.to,
      subject: input.subject,
      body: input.body,
      timestamp: new Date().toISOString(),
      read: false,
      replyTo: input.replyTo
    };
    
    if (!store.mail[input.to]) {
      store.mail[input.to] = [];
    }
    store.mail[input.to].push(mail);
    
    saveStore(store);
    
    return {
      id: mailId,
      to: input.to,
      subject: input.subject,
      sent: mail.timestamp
    };
  }
};

/**
 * MailCheck - Check mailbox for messages
 */
export const MailCheck: CustomToolDefinition = {
  name: 'MailCheck',
  description: 'Check your mailbox for messages from other agents. Returns unread messages by default.',
  prompt: 'Use MailCheck at the start of sessions or periodically to see if other agents have sent you messages.',
  icon: '📬',
  inputSchema: {
    type: 'object',
    properties: {
      unreadOnly: {
        type: 'boolean',
        description: 'Only show unread messages (default: true)',
        optional: true
      },
      markRead: {
        type: 'boolean',
        description: 'Mark retrieved messages as read (default: true)',
        optional: true
      }
    }
  },
  readOnly: false,  // Can mark as read
  concurrencySafe: true,
  
  async execute(input: { unreadOnly?: boolean; markRead?: boolean }, _context?: ToolContext) {
    const store = loadStore();
    const agentId = getAgentId();
    
    const unreadOnly = input.unreadOnly !== false;
    const markRead = input.markRead !== false;
    
    let messages = store.mail[agentId] || [];
    
    if (unreadOnly) {
      messages = messages.filter(m => !m.read);
    }
    
    if (markRead && messages.length > 0) {
      for (const msg of messages) {
        msg.read = true;
      }
      saveStore(store);
    }
    
    return {
      agentId,
      count: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        from: m.from,
        subject: m.subject,
        body: m.body,
        timestamp: m.timestamp,
        replyTo: m.replyTo
      }))
    };
  }
};

/**
 * MailReply - Reply to a message
 */
export const MailReply: CustomToolDefinition = {
  name: 'MailReply',
  description: 'Reply to a received message. Automatically addresses to the original sender.',
  prompt: 'Use MailReply to respond to messages from other agents.',
  icon: '↩️',
  inputSchema: {
    type: 'object',
    properties: {
      mailId: {
        type: 'string',
        description: 'The mail ID to reply to'
      },
      body: {
        type: 'string',
        description: 'Reply message body'
      }
    },
    required: ['mailId', 'body']
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { mailId: string; body: string }, _context?: ToolContext) {
    const store = loadStore();
    const agentId = getAgentId();
    
    // Find original message
    const myMail = store.mail[agentId] || [];
    const original = myMail.find(m => m.id === input.mailId);
    
    if (!original) {
      return { error: `Message not found: ${input.mailId}` };
    }
    
    // Create reply
    const replyId = `mail-${(store.nextMailNum++).toString().padStart(6, '0')}`;
    const reply: MailMessage = {
      id: replyId,
      from: agentId,
      to: original.from,
      subject: original.subject.startsWith('Re: ') ? original.subject : `Re: ${original.subject}`,
      body: input.body,
      timestamp: new Date().toISOString(),
      read: false,
      replyTo: original.id
    };
    
    if (!store.mail[original.from]) {
      store.mail[original.from] = [];
    }
    store.mail[original.from].push(reply);
    
    saveStore(store);
    
    return {
      id: replyId,
      to: original.from,
      subject: reply.subject,
      sent: reply.timestamp
    };
  }
};

// ============================================================================
// IDENTITY TOOL
// ============================================================================

/**
 * WhoAmI - Get current agent identity and context
 */
export const WhoAmI: CustomToolDefinition = {
  name: 'WhoAmI',
  description: 'Get your current agent identity, workspace context, and active assignments. Essential for understanding your role in the Gastown ecosystem.',
  prompt: 'Use WhoAmI at the start of sessions to understand your identity and current work context.',
  icon: '🪪',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(_input: Record<string, never>, _context?: ToolContext) {
    const store = loadStore();
    const agentId = getAgentId();
    
    // Get assigned beads
    const myBeads = Object.values(store.beads)
      .filter(b => b.assignee === agentId && b.status === 'in_progress');
    
    // Get hooks
    const myHooks = Object.values(store.hooks)
      .filter(h => h.agentId === agentId);
    
    // Get unread mail count
    const unreadMail = (store.mail[agentId] || [])
      .filter(m => !m.read).length;
    
    return {
      agentId,
      townPath: store.config.townPath,
      currentRig: store.config.currentRig,
      activeBeads: myBeads.map(b => ({ id: b.id, title: b.title })),
      hookCount: myHooks.length,
      unreadMail,
      timestamp: new Date().toISOString()
    };
  }
};

// ============================================================================
// EXPORT ALL TOOLS
// ============================================================================

/**
 * All Gastown tools as an array
 */
export const gastownTools: CustomToolDefinition[] = [
  // Beads (Issue Tracking)
  BeadCreate,
  BeadGet,
  BeadUpdate,
  BeadList,
  
  // Convoys (Work Bundles)
  ConvoyCreate,
  ConvoyAdd,
  ConvoyShow,
  ConvoyList,
  
  // Agent Coordination
  AgentSling,
  AgentList,
  
  // Hooks (Persistent State)
  HookWrite,
  HookRead,
  
  // Mail (Inter-Agent Messaging)
  MailSend,
  MailCheck,
  MailReply,
  
  // Identity
  WhoAmI
];
