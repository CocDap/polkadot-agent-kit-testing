import { PolkadotAgentKit, getLangChainTools } from '@polkadot-agent-kit/sdk'
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ASSETS_PROMPT, NOMINATION_PROMPT, SWAP_PROMPT, IDENTITY_PROMPT, BIFROST_PROMPT } from "@polkadot-agent-kit/llm";
export const SYSTEM_PROMPT = ASSETS_PROMPT + SWAP_PROMPT + NOMINATION_PROMPT + IDENTITY_PROMPT + BIFROST_PROMPT;

import { ChatOllama } from "@langchain/ollama";

import dotenv from 'dotenv'

dotenv.config()

// Make sure your private key is removing prefix `0x` 
const privateKey = process.env.PRIVATE_KEY_AGENT || ''


async function runAgent(query: string) {
    // Initialize PolkadotAgentKit
    const agent = new PolkadotAgentKit({privateKey, keyType: 'Sr25519', chains:["polkadot","polkadot_asset_hub"]});
    await agent.initializeApi()

    // Get LangChain tools
    const tools = getLangChainTools(agent)


    const chatModel = new ChatOllama({
        model: "qwen3:latest",
      });
    
    const modelWithTools = chatModel.bindTools(tools);

    try {

      const messages = [
        new SystemMessage({ content: SYSTEM_PROMPT }),
        new HumanMessage({ content: query }),
      ];
  
      const aiMessage = await modelWithTools.invoke(messages);
  
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        console.log("Agent is calling tools...");
        for (const toolCall of aiMessage.tool_calls) {
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

runAgent("Check balance on Polkadot Asset Hub");
