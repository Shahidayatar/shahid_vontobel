import { retrieveCitations } from "../../azure/azure-search.client";
import { saveChatTranscript } from "../../azure/blob.client";
import { runAzureOpenAIChat } from "../../azure/azure-openai.client";
import { AppError } from "../../shared/errors/app-error";
import { agentRepository } from "../agent-service/agent.repository";
import { modelRepository } from "../model-service/model.repository";
import { modelChatRepository } from "../model-chat-service/model-chat.repository";
import type { AgentChatRequestDto } from "./agent-chat.dto";

class AgentChatService {
  history(agentId: string) {
    return modelChatRepository.getHistory(agentId);
  }

  async send(input: AgentChatRequestDto) {
    const agent = agentRepository.findById(input.agentId);
    if (!agent) {
      throw new AppError("Agent not found", 404);
    }

    const deployment = modelRepository.findById(agent.modelDeploymentId);
    if (!deployment) {
      throw new AppError("Linked model deployment not found", 404);
    }

    const citations = agent.retrievalEnabled ? await retrieveCitations(input.message) : [];
    const groundingText = citations.map((item) => `${item.title}: ${item.source}`).join("\n");

    modelChatRepository.add(input.agentId, {
      role: "user",
      content: input.message
    });

    const result = await runAzureOpenAIChat({
      deployment: deployment.name,
      systemPrompt: `${agent.systemPrompt}\n${groundingText ? `Context:\n${groundingText}` : ""}`,
      userMessage: input.message,
      temperature: agent.temperature
    });

    const assistant = modelChatRepository.add(input.agentId, {
      role: "assistant",
      content: result.content,
      citations,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        latencyMs: result.latencyMs
      }
    });

    await saveChatTranscript("agent-chat", `${input.agentId}.json`, JSON.stringify(this.history(input.agentId)));
    return assistant;
  }
}

export const agentChatService = new AgentChatService();
