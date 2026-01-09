import { PolkadotAgentKit, getLangChainTools } from '@polkadot-agent-kit/sdk'
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ASSETS_PROMPT, NOMINATION_PROMPT, SWAP_PROMPT, IDENTITY_PROMPT, BIFROST_PROMPT } from "@polkadot-agent-kit/llm";
export const SYSTEM_PROMPT = ASSETS_PROMPT + SWAP_PROMPT + NOMINATION_PROMPT + IDENTITY_PROMPT + BIFROST_PROMPT;

import { ChatOllama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import dotenv from 'dotenv'
import { voteAction } from './customTools';

dotenv.config()

const privateKey = process.env.PRIVATE_KEY_AGENT || ''
const geminiApiKey = process.env.GEMINI_API_KEY || ''


type ModelType = 'ollama' | 'gemini';

async function runAgent(query: string, modelType: ModelType = 'ollama') {
    // Initialize PolkadotAgentKit
    const agent = new PolkadotAgentKit({privateKey, keyType: 'Sr25519', chains:["paseo"]});
    await agent.initializeApi()


    agent.addCustomTools([voteAction]);

    // Get LangChain tools
    const tools = getLangChainTools(agent)

    let chatModel;

    if (modelType === 'gemini') {
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not set in the environment variables.");
      }
      chatModel = new ChatGoogleGenerativeAI({
        apiKey: geminiApiKey,
        model: "gemini-2.0-flash",
      });
    } else {
      chatModel = new ChatOllama({
        model: "qwen3:latest",
      });
    }

    const modelWithTools = chatModel.bindTools(tools);

    try {

      const messages = [
        new SystemMessage({ content: SYSTEM_PROMPT }),
        new HumanMessage({ content: query }),
      ];
  
      const aiMessage = await modelWithTools.invoke(messages);
      console.log("AI Message:", aiMessage);
  
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        console.log("Agent is calling tools...");
        console.log("Tool calls:", aiMessage.tool_calls);
        for (const toolCall of aiMessage.tool_calls) {
          console.log("Tool call:", toolCall);
          const selectedTool = tools.find((t) => t.name === toolCall.name);
          if (selectedTool) {
            
            const toolResult = await selectedTool.invoke(toolCall.args);
            console.log(`- Tool Result (${toolCall.name}): ${toolResult}`);
          } else {
            console.warn(`- Tool ${toolCall.name} not found.`);
          }
        }
      } else {
        const content = String(aiMessage.content || "No response from LLM.");
        console.log(`Agent: ${content}`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }

}

// Check balance 
runAgent("Check balance on Polkadot Asset Hub");

// To use Gemini, uncomment the line below and ensure GEMINI_API_KEY is set in your .env file
// runAgent("Check balance on Polkadot Asset Hub", "gemini");


// XCM native with Ollama 
// runAgent("transfer 0.1 WND to 5Ccmxb84eREZmtSkrLJSYp6QxJwNvmNbrfBm4p5B5VnKrB8z from Westend to Westend Asset Hub");

// XCM native with Gemini  
// runAgent("transfer 0.1 WND to 5Ccmxb84eREZmtSkrLJSYp6QxJwNvmNbrfBm4p5B5VnKrB8z from Westend to Westend Asset Hub", "gemini");

// runAgent("Vote proposal id 1 with nay");
