import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMcpServer } from './server.js';
import { CONFIG } from './config.js';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());

// Map of active SSE client sessions
const activeSessions = new Map();

// SSE subscription endpoint for remote MCP clients (Gemini Spark / Web)
app.get('/sse', async (req, res) => {
  console.log('[SSE] Client connection initiated...');

  const transport = new SSEServerTransport('/messages', res);
  const server = createMcpServer();

  activeSessions.set(transport.sessionId, transport);

  transport.onclose = () => {
    console.log(`[SSE] Session disconnected: ${transport.sessionId}`);
    activeSessions.delete(transport.sessionId);
  };

  await server.connect(transport);
  console.log(`[SSE] Connected session: ${transport.sessionId}`);
});

// Message endpoint to receive client JSON-RPC requests
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = activeSessions.get(sessionId);

  if (!transport) {
    return res.status(404).json({ error: `Session not found for ID: ${sessionId}` });
  }

  await transport.handlePostMessage(req, res);
});

// Diagnostic and health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    server: CONFIG.SERVER_NAME,
    version: CONFIG.SERVER_VERSION,
    activeSessions: activeSessions.size,
    endpoints: {
      sse: `http://localhost:${PORT}/sse`,
      messages: `http://localhost:${PORT}/messages`
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 MCP Gateway SSE Server running on port ${PORT}`);
  console.log(`📡 Local SSE URL: http://localhost:${PORT}/sse`);
  console.log(`====================================================`);
});
