/**
 * Tool Builder
 * 
 * Converts user-friendly CustomToolDefinition to the internal
 * Claude Code tool format with all required methods and properties.
 */

import type { CustomToolDefinition, JsonSchema, JsonSchemaProperty } from './types.js';

/**
 * Convert JSON Schema to Zod-compatible code string
 * This generates code that will be executed in the context of the CLI
 * where 'v' is the Zod library
 */
function jsonSchemaToZodCode(schema: JsonSchema | JsonSchemaProperty, isRoot = true): string {
  if ('enum' in schema && schema.enum) {
    return `v.enum(${JSON.stringify(schema.enum)})`;
  }
  
  switch (schema.type) {
    case 'string':
      return schema.description 
        ? `v.string().describe(${JSON.stringify(schema.description)})`
        : 'v.string()';
      
    case 'number':
      return schema.description
        ? `v.number().describe(${JSON.stringify(schema.description)})`
        : 'v.number()';
      
    case 'boolean':
      return schema.description
        ? `v.boolean().describe(${JSON.stringify(schema.description)})`
        : 'v.boolean()';
      
    case 'array': {
      const itemSchema = (schema as JsonSchema).items;
      const itemsCode = itemSchema ? jsonSchemaToZodCode(itemSchema, false) : 'v.unknown()';
      const arrayCode = `v.array(${itemsCode})`;
      return schema.description
        ? `${arrayCode}.describe(${JSON.stringify(schema.description)})`
        : arrayCode;
    }
      
    case 'object': {
      const props = (schema as JsonSchema).properties || {};
      const required = new Set((schema as JsonSchema).required || []);
      
      const propEntries = Object.entries(props).map(([key, prop]) => {
        let propCode = jsonSchemaToZodCode(prop, false);
        // Make optional if not in required array
        if (!required.has(key) || prop.optional) {
          propCode += '.optional()';
        }
        return `${JSON.stringify(key)}: ${propCode}`;
      });
      
      const objectMethod = isRoot ? 'strictObject' : 'object';
      return `v.${objectMethod}({${propEntries.join(', ')}})`;
    }
      
    default:
      return 'v.unknown()';
  }
}

/**
 * Shared runtime code that provides helpers for all tools
 * This gets injected once and is available to all tool execute functions
 */
const RUNTIME_CODE = `
// === PATCHER RUNTIME ===
var _PatcherRuntime = (function() {
  var fs, path, os;
  try {
    fs = require('fs');
    path = require('path');
    os = require('os');
  } catch(e) {
    // Fallback for environments without these modules
    fs = { 
      existsSync: function() { return false; },
      readFileSync: function() { return '{}'; },
      writeFileSync: function() {},
      mkdirSync: function() {}
    };
    path = { 
      join: function() { return Array.prototype.slice.call(arguments).join('/'); },
      dirname: function(p) { return p.split('/').slice(0,-1).join('/'); }
    };
    os = { 
      homedir: function() { return process.env.HOME || '/tmp'; }
    };
  }

  // Gastown store path
  function getGastownDir() {
    if (process.env.GT_HOME) {
      return path.join(process.env.GT_HOME, '.gastown');
    }
    return path.join(os.homedir(), '.gastown');
  }

  function getStorePath() {
    return path.join(getGastownDir(), 'store.json');
  }

  // Shared store instance (cached)
  var _storeCache = null;
  var _storeCacheTime = 0;

  function loadStore() {
    var now = Date.now();
    // Cache for 100ms to handle concurrent access
    if (_storeCache && (now - _storeCacheTime) < 100) {
      return _storeCache;
    }
    
    var storePath = getStorePath();
    try {
      if (fs.existsSync(storePath)) {
        _storeCache = JSON.parse(fs.readFileSync(storePath, 'utf8'));
        _storeCacheTime = now;
        return _storeCache;
      }
    } catch(e) {
      console.error('[Patcher] Error loading store:', e.message);
    }
    
    _storeCache = {
      beads: {},
      convoys: {},
      hooks: {},
      mail: {},
      config: {
        townPath: process.env.GT_HOME || path.join(os.homedir(), 'gt'),
        agentId: process.env.GT_AGENT_ID || ('agent-' + Date.now().toString(36))
      },
      nextBeadNum: 1,
      nextConvoyNum: 1,
      nextMailNum: 1
    };
    _storeCacheTime = now;
    return _storeCache;
  }

  function saveStore(store) {
    var dir = getGastownDir();
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(getStorePath(), JSON.stringify(store, null, 2));
      _storeCache = store;
      _storeCacheTime = Date.now();
    } catch(e) {
      console.error('[Patcher] Error saving store:', e.message);
    }
  }

  function generateBeadId(store, prefix) {
    prefix = prefix || 'gt';
    var num = store.nextBeadNum++;
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var suffix = '';
    var n = num;
    for (var i = 0; i < 5; i++) {
      suffix = chars[n % 36] + suffix;
      n = Math.floor(n / 36);
    }
    return prefix + '-' + suffix.padStart(5, '0');
  }

  function getAgentId() {
    return process.env.GT_AGENT_ID || 
           process.env.CLAUDE_AGENT_ID ||
           loadStore().config.agentId ||
           ('claude-' + process.pid);
  }

  // Task tools storage (separate from Gastown)
  function getTasksPath() {
    return process.env.CLAUDE_TASKS_FILE || 
      path.join(os.homedir(), '.claude', 'tasks.json');
  }

  function loadTasks() {
    var filePath = getTasksPath();
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch(e) {}
    return { tasks: [], nextId: 1 };
  }

  function saveTasks(data) {
    var filePath = getTasksPath();
    var dir = path.dirname(filePath);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch(e) {
      console.error('[Patcher] Error saving tasks:', e.message);
    }
  }

  // Export runtime API
  return {
    fs: fs,
    path: path,
    os: os,
    loadStore: loadStore,
    saveStore: saveStore,
    generateBeadId: generateBeadId,
    getAgentId: getAgentId,
    loadTasks: loadTasks,
    saveTasks: saveTasks,
    getGastownDir: getGastownDir
  };
})();
// === END PATCHER RUNTIME ===
`;

/**
 * Generate the tool code string that will be injected into the CLI
 */
export function generateToolCode(tool: CustomToolDefinition): string {
  const varName = `_CustomTool_${tool.name}`;
  const inputSchemaVar = `_${tool.name}_InputSchema`;
  const outputSchemaVar = `_${tool.name}_OutputSchema`;
  
  const inputSchemaCode = jsonSchemaToZodCode(tool.inputSchema);
  const outputSchemaCode = tool.outputSchema 
    ? jsonSchemaToZodCode(tool.outputSchema)
    : 'v.object({})';
  
  const icon = tool.icon || '🔧';
  const displayName = tool.displayName || tool.name;
  const prompt = tool.prompt || `Use ${tool.name} when appropriate based on its description.`;
  
  // The execute function needs to be serialized
  // We'll wrap it in a way that works in the injected context
  let executeFnString = tool.execute.toString();
  
  // Fix method syntax: "async execute(...)" -> "async function(...)"
  // Object methods serialize as "methodName(...) {" or "async methodName(...) {"
  // We need to convert to "function(...) {" or "async function(...) {"
  executeFnString = executeFnString
    .replace(/^async\s+\w+\s*\(/, 'async function(')
    .replace(/^\w+\s*\(/, 'function(');
  
  return `
var ${inputSchemaVar} = ${inputSchemaCode};
var ${outputSchemaVar} = ${outputSchemaCode};

var ${varName} = {
  name: ${JSON.stringify(tool.name)},
  strict: true,
  async description() {
    return ${JSON.stringify(tool.description)};
  },
  async prompt() {
    return ${JSON.stringify(prompt)};
  },
  inputSchema: ${inputSchemaVar},
  outputSchema: ${outputSchemaVar},
  userFacingName() { return ${JSON.stringify(displayName)}; },
  isEnabled() { return true; },
  isConcurrencySafe() { return ${tool.concurrencySafe ?? false}; },
  isReadOnly() { return ${tool.readOnly ?? false}; },
  async checkPermissions(input) { return { behavior: "allow", updatedInput: input }; },
  validateInput() { return { valid: true }; },
  renderToolUseMessage(input, { verbose }) {
    return { icon: ${JSON.stringify(icon)}, title: ${JSON.stringify(tool.name)}, subtitle: JSON.stringify(input).slice(0, 50) };
  },
  renderToolUseProgressMessage() { return null; },
  renderToolUseRejectedMessage() { return null; },
  renderToolUseErrorMessage(err) { return { title: ${JSON.stringify(tool.name + " failed")}, subtitle: err.message }; },
  renderToolResultMessage(result) { return { title: ${JSON.stringify(tool.name + " complete")}, subtitle: typeof result === 'object' ? JSON.stringify(result).slice(0, 50) : String(result) }; },
  async *call(input, context) {
    // Provide runtime to execute function
    var _RT = _PatcherRuntime;
    var loadStore = _RT.loadStore;
    var saveStore = _RT.saveStore;
    var generateBeadId = _RT.generateBeadId;
    var getAgentId = _RT.getAgentId;
    var loadTasks = _RT.loadTasks;
    var saveTasks = _RT.saveTasks;
    var fs = _RT.fs;
    var path = _RT.path;
    var os = _RT.os;
    
    var _executeImpl = ${executeFnString};
    var result = await _executeImpl(input, context);
    yield result;
  }
};
`;
}

/**
 * Generate the full injection code for all custom tools
 */
export function generateInjectionCode(tools: CustomToolDefinition[]): string {
  const toolCodes = tools.map(generateToolCode);
  const toolNames = tools.map(t => `_CustomTool_${t.name}`);
  
  return `
// === CLAUDE-CODE-PATCHER CUSTOM TOOLS ===
// Injected by claude-code-patcher
// Tools: ${tools.map(t => t.name).join(', ')}

${RUNTIME_CODE}

${toolCodes.join('\n')}

// Register all custom tools
globalThis._CLAUDE_CUSTOM_TOOLS_ = [${toolNames.join(', ')}];
// === END CLAUDE-CODE-PATCHER CUSTOM TOOLS ===
`;
}
