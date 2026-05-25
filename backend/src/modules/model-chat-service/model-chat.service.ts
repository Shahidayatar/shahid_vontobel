import { saveChatTranscript } from "../../azure/blob.client";
import { runAzureOpenAIChat } from "../../azure/azure-openai.client";
import { AppError } from "../../shared/errors/app-error";
import { logger } from "../../shared/logging/logger";
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
      logger.warn("Model chat deployment not found", { modelId: input.modelId });
      throw new AppError("Model deployment not found", 404);
    }

    logger.info("Model chat request received", {
      modelId: input.modelId,
      deploymentId: deployment.id,
      deploymentName: deployment.name,
      model: deployment.model
    });

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

    logger.info("Model chat response stored", {
      modelId: input.modelId,
      deploymentName: deployment.name,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      latencyMs: result.latencyMs
    });

    await saveChatTranscript("model-chat", `${input.modelId}.json`, JSON.stringify(this.history(input.modelId)));
    return assistant;
  }
}

export const modelChatService = new ModelChatService();
