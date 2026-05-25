import { saveChatTranscript } from "../../azure/blob.client";
import { runAzureOpenAIChat } from "../../azure/azure-openai.client";
import { AppError } from "../../shared/errors/app-error";
import { modelRepository } from "../model-service/model.repository";
import type { ModelChatRequestDto } from "./model-chat.dto";
import { modelChatRepository } from "./model-chat.repository";

class ModelChatService {
  history(modelId: string) {
    return modelChatRepository.getHistory(modelId);
  }

  async send(input: ModelChatRequestDto) {
    const deployment = modelRepository.findById(input.modelId);
    if (!deployment) {
      throw new AppError("Model deployment not found", 404);
    }

    modelChatRepository.add(input.modelId, {
      role: "user",
      content: input.message
    });

    const result = await runAzureOpenAIChat({
      deployment: deployment.name,
      userMessage: input.message
    });

    const assistant = modelChatRepository.add(input.modelId, {
      role: "assistant",
      content: result.content,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        latencyMs: result.latencyMs
      }
    });

    await saveChatTranscript("model-chat", `${input.modelId}.json`, JSON.stringify(this.history(input.modelId)));
    return assistant;
  }
}

export const modelChatService = new ModelChatService();
