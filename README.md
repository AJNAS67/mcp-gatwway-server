# MCP Gateway Server for Job Portal Services

A high-performance Model Context Protocol (MCP) server that aggregates and provides AI models direct access to:
1. **Student & Candidate Data** (from Candidate Service at `http://localhost:5001`)
2. **Job Listings & Vacancies** (from Job Service at `http://localhost:5002`)

Each service has a dedicated tool module with input schemas powered by [Zod](https://zod.dev) and the official [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol).

---

## 🏛 Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          AI Host / MCP Client                │
                  │   (Claude Desktop / Cursor / Antigravity)    │
                  └──────────────────────┬───────────────────────┘
                                         │ stdio (JSON-RPC)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │              MCP Gateway Server              │
                  │       (c:\workspace\Personal\mcp-gateway)    │
                  ├──────────────────────┬───────────────────────┤
                  │                      │                       │
                  │  Tool 1:             │  Tool 2:              │
                  │  get_student_data    │  get_job_list         │
                  └──────────┬───────────┴───────────┬───────────┘
                             │ HTTP                  │ HTTP
                             ▼                       ▼
                  ┌──────────────────────┐┌──────────────────────┐
                  │  Candidate Service   ││     Job Service      │
                  │ (Port 5001: Express) ││ (Port 5002: Express) │
                  └──────────────────────┘└──────────────────────┘
```

---

## 🛠 Available MCP Tools

### 1. `get_student_data`
Defined in [`src/tools/studentTool.js`](file:///c:/workspace/Personal/mcp-gateway-server/src/tools/studentTool.js).

Fetches candidate and student records from the Candidate Service on port `5001`.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | *(Optional)* Exact candidate ID (e.g. `"CAND-001"`) for full profile details. |
| `search` | `string` | *(Optional)* Keyword search across name, role, college, skills, company, or bio. |
| `category` | `string` | *(Optional)* Domain filter (`"Cyber Security"`, `"MERN Stack"`, `"Data Science & AI"`, etc.). |
| `skill` | `string` | *(Optional)* Filter by specific skill (e.g. `"Python"`, `"React"`, `"Docker"`). |
| `status` | `string` | *(Optional)* Filter: `"Fresher"`, `"Intern"`, or `"Working Professional"`. |
| `place` | `string` | *(Optional)* City / location filter (e.g. `"Bangalore"`, `"Pune"`). |
| `minExp` / `maxExp`| `number` | *(Optional)* Experience range in years. |
| `getStats` | `boolean`| *(Optional)* Retrieve aggregate statistics (total candidates, skill demand, etc.). |
| `page` / `limit` | `number` | *(Optional)* Pagination controls (default limit: 10). |

---

### 2. `get_job_list`
Defined in [`src/tools/jobTool.js`](file:///c:/workspace/Personal/mcp-gateway-server/src/tools/jobTool.js).

Fetches job openings, requirements, and recruiter details from the Job Service on port `5002`.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | *(Optional)* Exact job vacancy ID (e.g. `"JOB-001"`) for full JD, requirements, and HR contacts. |
| `search` | `string` | *(Optional)* Keyword search across job title, company name, skills, description. |
| `category` | `string` | *(Optional)* Tech domain filter (`"Cyber Security"`, `"MERN Stack"`, `"Angular"`, etc.). |
| `skill` | `string` | *(Optional)* Required skill (e.g. `"AWS"`, `"Kubernetes"`, `"React"`). |
| `jobType` | `string` | *(Optional)* `"Full-time"`, `"Remote"`, `"Hybrid"`, `"Contract"`, `"Internship"`. |
| `location` | `string` | *(Optional)* Job location filter (e.g. `"Remote"`, `"Bangalore"`, `"Hyderabad"`). |
| `experience`| `string` | *(Optional)* Experience requirements (e.g. `"0 - 1 years"`, `"1 - 3 years"`). |
| `getStats` | `boolean`| *(Optional)* Retrieve macro job market stats (total vacancies, category distribution). |
| `page` / `limit` | `number` | *(Optional)* Pagination controls (default limit: 10). |

---

## 📁 Project Directory Structure

```
mcp-gateway-server/
├── src/
│   ├── config.js               # Service ports, URLs, and timeout settings
│   ├── server.js               # MCP Server setup and tool registrations
│   ├── index.js                # CLI executable & Stdio transport bridge
│   └── tools/
│       ├── studentTool.js      # Student / Candidate Tool implementation
│       └── jobTool.js          # Job List / Vacancies Tool implementation
├── tests/
│   ├── test-tools.js           # Live integration tests for both microservices
│   └── test-mcp-protocol.js    # MCP protocol handshake & tool execution tests
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Verify Upstream Microservices
Ensure the backend services are running in `C:\workspace\Personal\job-portal-services`:
```bash
# From C:\workspace\Personal\job-portal-services
node start-all.js
```
- Candidate Service: `http://localhost:5001`
- Job Service: `http://localhost:5002`

### 2. Run Tests
Verify both tools connect and retrieve data:
```bash
npm test
```

### 3. Start MCP Server Manually
```bash
npm start
```

---

## ⚙️ Connecting to MCP Clients

### Claude Desktop Configuration
Add this entry to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "job-portal-gateway": {
      "command": "node",
      "args": [
        "C:\\workspace\\Personal\\mcp-gateway-server\\src\\index.js"
      ],
      "env": {
        "CANDIDATE_SERVICE_URL": "http://localhost:5001",
        "JOB_SERVICE_URL": "http://localhost:5002"
      }
    }
  }
}
```

### Cursor / Antigravity IDE Configuration
Add to your project's or global MCP config (`mcp_config.json`):

```json
{
  "mcpServers": {
    "job-portal": {
      "command": "node",
      "args": [
        "c:/workspace/Personal/mcp-gateway-server/src/index.js"
      ]
    }
  }
}
```
