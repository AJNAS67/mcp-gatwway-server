/**
 * Centralized Configuration for MCP Gateway Server
 */
export const CONFIG = {
  SERVER_NAME: 'job-portal-mcp-gateway',
  SERVER_VERSION: '1.0.0',
  CANDIDATE_SERVICE_URL: process.env.CANDIDATE_SERVICE_URL || 'http://localhost:5001',
  JOB_SERVICE_URL: process.env.JOB_SERVICE_URL || 'http://localhost:5002',
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '5000', 10)
};
