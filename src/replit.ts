import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { GoogleGenAI, Type } from "@google/genai";

import { PolkadotAgentKit, getLangChainTools } from '@polkadot-agent-kit/sdk'
import { ASSETS_PROMPT, NOMINATION_PROMPT, SWAP_PROMPT, IDENTITY_PROMPT, BIFROST_PROMPT } from "@polkadot-agent-kit/llm";
export const SYSTEM_PROMPT = ASSETS_PROMPT + SWAP_PROMPT + NOMINATION_PROMPT + IDENTITY_PROMPT + BIFROST_PROMPT;

import dotenv from 'dotenv'

dotenv.config()

const privateKey = process.env.PRIVATE_KEY_AGENT || process.env.POLKADOT_MNEMONIC || '';
console.log("Private key:", privateKey);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const port = 8080;
const hostname = "0.0.0.0";

// Initialize PolkadotAgentKit
let agentKit: PolkadotAgentKit | null = null;
let langChainTools: any[] = [];

async function initializePolkadotAgentKit() {
  try {
    console.log("Initializing PolkadotAgentKit...");
    
    // Initialize the agent kit with private key from environment

    if (!privateKey) {
      throw new Error("PRIVATE_KEY_AGENT or POLKADOT_MNEMONIC must be set in environment variables");
    }
    
    agentKit = new PolkadotAgentKit({
      privateKey,
      keyType: 'Sr25519',
      chains: ["polkadot"]
    });
    
    await agentKit.initializeApi();
    
    // Get LangChain tools from the agent kit
    langChainTools = getLangChainTools(agentKit);
    
    console.log(`Successfully initialized PolkadotAgentKit with ${langChainTools.length} tools!`);
    console.log("Available tools:", langChainTools.map(t => t.name).join(", "));
  } catch (error: any) {
    console.error("Failed to initialize PolkadotAgentKit:", error?.message || error);
    console.log("Server will continue - Polkadot tools will not work");
    agentKit = null;
    langChainTools = [];
  }
}

// Convert LangChain tools to Gemini function declarations
function convertToGeminiFunctionDeclarations() {
  return langChainTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: Type.OBJECT,
      properties: tool.schema?.properties || {},
      required: tool.schema?.required || []
    }
  }));
}

// Handle chat requests with tool calling using PolkadotAgentKit
async function handleChat(message: string): Promise<{ response: string; toolCalls?: any[] }> {
  try {
    if (!agentKit || langChainTools.length === 0) {
      return {
        response: "PolkadotAgentKit is not initialized. Please check the server logs."
      };
    }

    const toolCalls: any[] = [];
    const functionDeclarations = convertToGeminiFunctionDeclarations();
    console.log("Function declarations:", functionDeclarations);
    
    // First call to Gemini with tool definitions
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: functionDeclarations.length > 0 ? [
          {
            functionDeclarations
          }
        ] : undefined
      }
    });

    console.log("Response:", response);

    const candidate = response.candidates?.[0];
    if (!candidate) {
      return { response: "No response generated" };
    }

    const parts = candidate.content?.parts || [];
    let finalResponse = "";
    
    // Check if there are function calls
    for (const part of parts) {
      if (part.functionCall) {
        const functionCall = part.functionCall;
        const functionName = functionCall.name;
        const args = functionCall.args;
        
        console.log(`Function call detected: ${functionName}`, args);
        
        // Find the corresponding LangChain tool
        const tool = langChainTools.find(t => t.name === functionName);
        
        if (!tool) {
          console.error(`Tool ${functionName} not found`);
          continue;
        }
        
        // Execute the tool using LangChain
        let functionResult = "";
        try {
          functionResult = await tool.invoke(args);
          
          toolCalls.push({
            name: functionName,
            args,
            result: functionResult
          });
        } catch (toolError: any) {
          console.error(`Error executing tool ${functionName}:`, toolError);
          functionResult = `Error: ${toolError.message || "Unknown error"}`;
        }
        
        // Make a second call to Gemini with the function result
        const followUpResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            },
            {
              role: "model",
              parts: [{ functionCall: functionCall }]
            },
            {
              role: "function",
              parts: [{
                functionResponse: {
                  name: functionName,
                  response: { result: functionResult }
                }
              }]
            }
          ],
          config: {
            systemInstruction: SYSTEM_PROMPT
          }
        });
        
        finalResponse = followUpResponse.text || "I've processed your request.";
      } else if (part.text) {
        finalResponse = part.text;
      }
    }
    
    if (!finalResponse) {
      finalResponse = "I'm here to help! You can ask me about Polkadot operations like checking balances, transferring tokens, and more.";
    }
    
    return {
      response: finalResponse,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined
    };
    
  } catch (error: any) {
    console.error("Error in handleChat:", error);
    return {
      response: `Sorry, I encountered an error: ${error.message || "Unknown error"}`
    };
  }
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Serve the HTML file
  if (req.url === "/" && req.method === "GET") {
    const htmlPath = path.join(__dirname, "public", "index.html");
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error loading page");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }
  
  // Handle chat API
  if (req.url === "/chat" && req.method === "POST") {
    let body = "";
    
    req.on("data", chunk => {
      body += chunk.toString();
    });
    
    req.on("end", async () => {
      try {
        const { message } = JSON.parse(body);
        const result = await handleChat(message);
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (error: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

// Start server first
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Chat interface available at http://${hostname}:${port}/`);
  
  // Initialize PolkadotAgentKit in the background
  initializePolkadotAgentKit().catch(err => {
    console.error("PolkadotAgentKit initialization error:", err);
  });
});
