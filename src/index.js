#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server.js';
import { CONFIG } from './config.js';

/**
 * Entry point for MCP Gateway Server.
 * Communicates via standard input/output (stdio) with MCP clients.
 *
 * NOTE: Logs must be sent to stderr to prevent corrupting stdio JSON-RPC protocol messages.
 */
async function main() {
  process.stderr.write(`[MCP] Starting ${CONFIG.SERVER_NAME} v${CONFIG.SERVER_VERSION}...\n`);
  process.stderr.write(`[MCP] Candidate Service target: ${CONFIG.CANDIDATE_SERVICE_URL}\n`);
  process.stderr.write(`[MCP] Job Service target: ${CONFIG.JOB_SERVICE_URL}\n`);

  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  process.stderr.write(`[MCP] Server listening over Stdio. Ready for MCP client connections.\n`);
}

main().catch((err) => {
  process.stderr.write(`[MCP] Fatal error starting server: ${err.message}\n`);
  if (err.stack) process.stderr.write(`${err.stack}\n`);
  process.exit(1);
});
