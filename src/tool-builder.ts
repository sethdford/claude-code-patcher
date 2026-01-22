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
  const executeFnString = tool.execute.toString();
  
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
    const _executeImpl = ${executeFnString};
    const result = await _executeImpl(input, context);
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

${toolCodes.join('\n')}

// Register all custom tools
globalThis._CLAUDE_CUSTOM_TOOLS_ = [${toolNames.join(', ')}];
// === END CLAUDE-CODE-PATCHER CUSTOM TOOLS ===
`;
}
