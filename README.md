
# Polkadot Agent Kit Testing SDK 

A testing environment for the Polkadot Agent Kit that demonstrates how to interact with Polkadot using AI agents.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v22 or higher)
- **pnpm** (v10.7.0 or higher)
- **Ollama** (latest version)

## Setup Instructions

### 1. Install Dependencies

First, install the project dependencies:

```bash
pnpm install
```

### 2. Set up Ollama

#### Download and Install Ollama
1. Go to [https://ollama.com/download](https://ollama.com/download)
2. Choose your specific OS and download the installer
3. Follow the installation instructions for your platform

#### Install the Required Model
Install the Qwen3 model that the agent uses:

```bash
ollama run qwen3:latest
```

#### Verify Ollama is Running
Check if Ollama is active and accessible:

```bash
curl http://localhost:11434
```

You should receive a response indicating Ollama is running.


### 3. Environment Configuration

Create a `.env` file in the project root with your private key:

```bash
# Create .env file
touch .env
```

Add your private key to the `.env` file:

```env
PRIVATE_KEY_AGENT=your_private_key_here_without_0x_prefix
```

### 4. Environment Setup

Create a `.env` file with your private key and, optionally, your Gemini API key:

```env
PRIVATE_KEY_AGENT=your_private_key_here_without_0x_prefix
GEMINI_API_key=your_gemini_api_key_here
```

## Testing Approaches

This project supports testing with two different large language models:

- **Ollama (default)**: A local model for offline testing
- **Google Gemini**: A cloud-based model for advanced testing

### Approach 1: Direct SDK Testing

Build and run the agent in development mode:

```bash
pnpm run dev
```

## Expected Output

When running successfully, you should see output similar to:

```
Agent is calling tools...
- Tool Result (check_balance): {"content":"{\"success\":true,\"data\":\"Balance on polkadot_asset_hub: 0.755153 DOT\",\"tool\":\"check_balance\",\"timestamp\":\"2025-08-18T09:02:52.097Z\"}","tool_call_id":"check_balance_1755507772097"}
```

## Customizing Queries

You can modify the query in `src/index.ts` by changing the `runAgent()` call:

```typescript
// Example queries you can try:
runAgent("Check balance on Polkadot Asset Hub");
runAgent("Transfer 0.1 DOT to address 5F... on Polkadot");

// To use Gemini
// runAgent("Check balance on Polkadot Asset Hub", "gemini");
```

## Troubleshooting

### Common Errors

#### Error: Ollama connection failed
**Solution:** Ensure Ollama is running:
```bash
# Start Ollama if not running
ollama serve

# Check if it's accessible
curl http://localhost:11434
```

#### Error: Invalid private key
**Solution:** 
- Ensure your private key is in the `.env` file
- Remove the `0x` prefix from your private key

#### Error: Model not found
**Solution:** Install the required model:
```bash
ollama run qwen3:latest
```

#### Error: Invalid node version

```
/Users/x/polkadot/openguild/test/polkadot-agent-kit-testing/node_modules/.pnpm/@polkadot-api+substrate-bindings@0.16.5/node_modules/@polkadot-api/substrate-bindings/dist/index.js:4
var base = require('@scure/base');
           ^

Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/x/polkadot/openguild/test/polkadot-agent-kit-testing/node_modules/.pnpm/@scure+base@2.0.0/node_modules/@scure/base/index.js from /Users/x/polkadot/openguild/test/polkadot-agent-kit-testing/node_modules/.pnpm/@polkadot-api+substrate-bindings@0.16.5/node_modules/@polkadot-api/substrate-bindings/dist/index.js not supported.
Instead change the require of /Users/x/polkadot/openguild/test/polkadot-agent-kit-testing/node_modules/.pnpm/@scure+base@2.0.0/node_modules/@scure/base/index.js in /Users/x/polkadot/openguild/test/polkadot-agent-kit-testing/node_modules/.pnpm/@polkadot-api+substrate-bindings@0.16.5/node_modules/@polkadot-api/substrate-bindings/dist/index.js to a dynamic import() which is available in all CommonJS modules.
    at Object.<anonymous> (/Users/x/polkadot/openguild/test/polkadot-agent-kit-testing/node_modules/.pnpm/@polkadot-api+substrate-bindings@0.16.5/node_modules/@polkadot-api/substrate-bindings/dist/index.js:4:12) {
  code: 'ERR_REQUIRE_ESM'
}

```

**Solution:** Upgrade to higher node version > 22

# Polkadot Agent Kit Testing MCP Server 

## Step 1: Build the project 

```bash
pnpm build
```
## Step 2: Run Inspector for Polkadot Agent Kit MCP Server 
```
npx @modelcontextprotocol/inspector node dist/mcp.js

Starting MCP inspector...
⚙️ Proxy server listening on 127.0.0.1:6277
🔑 Session token: d3660d11c4b607c01da5400f34f0016825633dbedbd57945e945f7ffadc0ce2f
Use this token to authenticate requests or set DANGEROUSLY_OMIT_AUTH=true to disable auth

🔗 Open inspector with token pre-filled:
   http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=d3660d11c4b607c01da5400f34f0016825633dbedbd57945e945f7ffadc0ce2f

🔍 MCP Inspector is up and running at http://127.0.0.1:6274 🚀
New STDIO connection request

```

## Step 3: 
Waiting for Polkadot Agent Kit initilization, the Inspector will show all available tools 

![List tools](/images/list_tools.png)

## Step 4: Call check_balance took

![Check balance](/images/check_balance.png)





