import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../src/server.js';

async function testProtocol() {
  console.log('Testing MCP Server initialization & protocol handshake...');

  const server = createMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);

  const client = new Client(
    { name: 'test-mcp-client', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(clientTransport);

  // 1. List available tools
  const toolsResponse = await client.listTools();
  console.log(`Registered Tools Count: ${toolsResponse.tools.length}`);

  const toolNames = toolsResponse.tools.map(t => t.name);
  console.log('Tools:', toolNames);

  if (!toolNames.includes('get_student_data') || !toolNames.includes('get_job_list')) {
    throw new Error('Expected both get_student_data and get_job_list to be registered!');
  }

  // 2. Call get_student_data via client
  const studentResult = await client.callTool({
    name: 'get_student_data',
    arguments: { id: 'CAND-001' }
  });
  console.log('Student Tool MCP Call Result status:', studentResult.isError ? 'FAIL' : 'OK');

  // 3. Call get_job_list via client
  const jobResult = await client.callTool({
    name: 'get_job_list',
    arguments: { id: 'JOB-001' }
  });
  console.log('Job Tool MCP Call Result status:', jobResult.isError ? 'FAIL' : 'OK');

  await client.close();
  console.log('✅ MCP Protocol Verification PASSED!');
}

testProtocol().catch(err => {
  console.error('❌ Protocol test error:', err);
  process.exit(1);
});
