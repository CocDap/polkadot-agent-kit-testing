
# Polkadot Agent Kit Testing SDK 

A testing environment for the Polkadot Agent Kit that demonstrates how to interact with Polkadot using AI agents.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
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


## Running the Agent

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





