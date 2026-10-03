import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CONFIG } from './config.js';
import { studentTool } from './tools/studentTool.js';
import { jobTool } from './tools/jobTool.js';

/**
 * Creates and configures the unified MCP Gateway Server with separated tool modules.
 */
export function createMcpServer() {
  const server = new McpServer({
    name: CONFIG.SERVER_NAME,
    version: CONFIG.SERVER_VERSION
  });

  // 1. Register Tool 1: Student / Candidate Data Tool
  server.tool(
    studentTool.name,
    studentTool.description,
    studentTool.schema,
    studentTool.handler
  );

  // 2. Register Tool 2: Job List / Vacancies Tool
  server.tool(
    jobTool.name,
    jobTool.description,
    jobTool.schema,
    jobTool.handler
  );

  return server;
}
