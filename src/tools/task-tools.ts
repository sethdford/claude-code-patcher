/**
 * Task Management Tools
 * 
 * Built-in tools for task/todo management:
 * - TaskCreate: Create tasks with dependencies
 * - TaskGet: Retrieve task details
 * - TaskUpdate: Update task status
 * - TaskList: List all tasks
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { CustomToolDefinition } from '../types.js';

/**
 * Task data structure
 */
interface Task {
  id: string;
  subject: string;
  description?: string;
  status: 'open' | 'in_progress' | 'blocked' | 'resolved';
  blocked_by: string[];
  comments?: Array<{ text: string; timestamp: string }>;
  created: string;
  updated: string;
}

interface TaskStorage {
  tasks: Task[];
  nextId: number;
}

/**
 * Get the task storage file path
 */
function getStoragePath(): string {
  return process.env.CLAUDE_TASKS_FILE || 
    path.join(os.homedir(), '.claude', 'tasks.json');
}

/**
 * Load tasks from storage
 */
function loadTasks(): TaskStorage {
  const filePath = getStoragePath();
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {
    // Ignore errors, return default
  }
  return { tasks: [], nextId: 1 };
}

/**
 * Save tasks to storage
 */
function saveTasks(data: TaskStorage): void {
  const filePath = getStoragePath();
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * TaskCreate - Create a new task
 */
export const TaskCreate: CustomToolDefinition = {
  name: 'TaskCreate',
  description: 'Create a new task with subject, description, and optional dependencies. Use this to track work items, todos, or action items.',
  prompt: 'Use TaskCreate when the user wants to create a task, todo, or work item. Include a clear subject and optional description.',
  icon: '📝',
  inputSchema: {
    type: 'object',
    properties: {
      subject: {
        type: 'string',
        description: 'The task title/subject'
      },
      description: {
        type: 'string',
        description: 'Detailed description of the task',
        optional: true
      },
      blocked_by: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of task IDs that must complete first',
        optional: true
      }
    },
    required: ['subject']
  },
  outputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      subject: { type: 'string' },
      status: { type: 'string' },
      created: { type: 'string' }
    }
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { subject: string; description?: string; blocked_by?: string[] }) {
    const data = loadTasks();
    
    const task: Task = {
      id: `task-${data.nextId++}`,
      subject: input.subject,
      description: input.description,
      status: 'open',
      blocked_by: input.blocked_by || [],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    data.tasks.push(task);
    saveTasks(data);
    
    return {
      id: task.id,
      subject: task.subject,
      status: task.status,
      created: task.created
    };
  }
};

/**
 * TaskGet - Retrieve task details
 */
export const TaskGet: CustomToolDefinition = {
  name: 'TaskGet',
  description: 'Retrieve full details of a task by its ID, including subject, description, status, and dependencies.',
  prompt: 'Use TaskGet to retrieve details about a specific task when the user asks about a task\'s status or details.',
  icon: '🔍',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'The ID of the task to retrieve'
      }
    },
    required: ['task_id']
  },
  outputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      subject: { type: 'string' },
      description: { type: 'string', optional: true },
      status: { type: 'string' },
      blocked_by: { type: 'array', items: { type: 'string' }, optional: true },
      created: { type: 'string' },
      updated: { type: 'string' }
    }
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(input: { task_id: string }) {
    const data = loadTasks();
    const task = data.tasks.find(t => t.id === input.task_id);
    
    if (!task) {
      return { error: `Task not found: ${input.task_id}` };
    }
    
    return task;
  }
};

/**
 * TaskUpdate - Update a task
 */
export const TaskUpdate: CustomToolDefinition = {
  name: 'TaskUpdate',
  description: 'Update a task\'s status (open, in_progress, blocked, resolved), add comments, or modify blockers.',
  prompt: 'Use TaskUpdate to change task status, mark tasks complete (resolved), or update task details when requested.',
  icon: '✏️',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'The ID of the task to update'
      },
      status: {
        type: 'string',
        enum: ['open', 'in_progress', 'blocked', 'resolved'],
        description: 'New status for the task',
        optional: true
      },
      comment: {
        type: 'string',
        description: 'Add a comment to the task',
        optional: true
      },
      blocked_by: {
        type: 'array',
        items: { type: 'string' },
        description: 'Update the list of blocking task IDs',
        optional: true
      }
    },
    required: ['task_id']
  },
  outputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      subject: { type: 'string' },
      status: { type: 'string' },
      updated: { type: 'string' }
    }
  },
  readOnly: false,
  concurrencySafe: false,
  
  async execute(input: { 
    task_id: string; 
    status?: 'open' | 'in_progress' | 'blocked' | 'resolved';
    comment?: string;
    blocked_by?: string[];
  }) {
    const data = loadTasks();
    const task = data.tasks.find(t => t.id === input.task_id);
    
    if (!task) {
      return { error: `Task not found: ${input.task_id}` };
    }
    
    if (input.status) {
      task.status = input.status;
    }
    
    if (input.blocked_by) {
      task.blocked_by = input.blocked_by;
    }
    
    if (input.comment) {
      task.comments = task.comments || [];
      task.comments.push({
        text: input.comment,
        timestamp: new Date().toISOString()
      });
    }
    
    task.updated = new Date().toISOString();
    saveTasks(data);
    
    return {
      id: task.id,
      subject: task.subject,
      status: task.status,
      updated: task.updated
    };
  }
};

/**
 * TaskList - List all tasks
 */
export const TaskList: CustomToolDefinition = {
  name: 'TaskList',
  description: 'List all tasks with summary info. Can filter by status (all, open, in_progress, blocked, resolved).',
  prompt: 'Use TaskList to show the user their tasks. Can filter by status if requested.',
  icon: '📋',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['all', 'open', 'in_progress', 'blocked', 'resolved'],
        description: 'Filter by status (default: all)',
        optional: true
      }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      count: { type: 'number' },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            subject: { type: 'string' },
            status: { type: 'string' }
          }
        }
      }
    }
  },
  readOnly: true,
  concurrencySafe: true,
  
  async execute(input: { status?: string }) {
    const data = loadTasks();
    let tasks = data.tasks;
    
    if (input.status && input.status !== 'all') {
      tasks = tasks.filter(t => t.status === input.status);
    }
    
    return {
      count: tasks.length,
      tasks: tasks.map(t => ({
        id: t.id,
        subject: t.subject,
        status: t.status
      }))
    };
  }
};

/**
 * All task tools as an array
 */
export const taskTools: CustomToolDefinition[] = [
  TaskCreate,
  TaskGet,
  TaskUpdate,
  TaskList
];
