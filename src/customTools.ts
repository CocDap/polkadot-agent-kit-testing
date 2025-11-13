import z from "zod";
import { createAction, createSuccessResponse, type ToolConfig } from "@polkadot-agent-kit/llm"




// 1. Build a LangChain-style tool
const voteTool = {
    async invoke(args: { proposalId: number; vote: "aye" | "nay" ; chain: string }) {
        // TODO:
        // - Call the vote on the proposal
        // - Return the result

        return createSuccessResponse(
            `Voted ${args.vote} on proposal ${args.proposalId}`,
            "vote_on_proposal"
        )
    }
}

// 2. Describe it with a ToolConfig
const voteConfig: ToolConfig = {
    name: "vote_on_proposal",
    description: "Vote on a governance proposal",
    schema: z.object({
        proposalId: z.number(),
        vote: z.enum(["aye", "nay"]),
        chain: z.string().describe("The chain to vote on, e.g. polkadot, polkadot_asset_hub, west")
    })
}

// 3. Convert to an Action and register
export const voteAction = createAction(voteTool, voteConfig)


