import { randomUUID } from "crypto";
import { AgentRepository } from "../../repositories/agent.repository";
import { DocumentRepository } from "../../repositories/document.repository";
import { PromptRepository } from "../../repositories/prompt.repository";
import { UsageRepository } from "../../repositories/usage.repository";
import type { AzureClients } from "../../azure/azure-clients";
import { createEmbedding } from "../shared/embeddings";
import { generateLocalCompletion } from "../shared/chat-completion";
import { estimateTokens } from "../shared/text";
import { rankChunks } from "../shared/vector-search";

export type ChatRequest = {
  tenantId: string;
  agentId: string;
  question: string;
};

export class ChatService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly promptRepository: PromptRepository,
    private readonly usageRepository: UsageRepository,
    private readonly azureClients?: AzureClients
  ) {}

  async chat(request: ChatRequest) {
    const agent = this.agentRepository.findById(request.agentId);
    if (!agent || agent.tenantId !== request.tenantId) {
      throw new Error("Agent not found for tenant");
    }

    const prompt = this.promptRepository.findActiveByAgent(agent.id, agent.tenantId) ?? {
      id: randomUUID(),
      agentId: agent.id,
      tenantId: agent.tenantId,
      version: 0,
      systemPrompt: agent.systemPrompt,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const queryVector = await this.createVector(request.question);
    const ranked = await this.retrieveContext(agent.id, agent.tenantId, request.question, queryVector);
    const completion = await this.generateAnswer({
      agentName: agent.name,
      model: agent.model,
      deploymentName: agent.resourcePlan?.openAIDeploymentName ?? this.azureClients?.openAi?.chatDeployment ?? agent.model,
      systemPrompt: prompt.systemPrompt,
      question: request.question,
      contexts: ranked.map((chunk) => ({ fileName: chunk.fileName, text: chunk.text, score: chunk.score }))
    });

    const estimatedCostUsd = Number((((completion.inputTokens + completion.outputTokens) / 1000) * 0.01).toFixed(6));
    const usageRecord = this.usageRepository.save({
      id: randomUUID(),
      requestId: randomUUID(),
      tenantId: request.tenantId,
      agentId: request.agentId,
      operation: "chat",
      model: agent.model,
      inputTokens: completion.inputTokens,
      outputTokens: completion.outputTokens,
      estimatedCostUsd,
      createdAt: new Date().toISOString()
    });

    return {
      answer: completion.answer,
      agentId: agent.id,
      tenantId: agent.tenantId,
      model: agent.model,
      contexts: ranked,
      usage: usageRecord,
      requestId: usageRecord.requestId,
      estimatedTokens: estimateTokens(request.question)
    };
  }

  private async retrieveContext(agentId: string, tenantId: string, question: string, queryVector: number[]) {
    const agent = this.agentRepository.findById(agentId);
    const indexName = agent?.resourcePlan?.searchIndexName ?? `${agentId.slice(0, 12)}-chunks`;

    if (this.azureClients?.search) {
      try {
        const searchClient = this.azureClients.search.getSearchClient(indexName);
        const results = await searchClient.search(question, {
          filter: `tenantId eq '${tenantId}' and agentId eq '${agentId}'`,
          top: 5,
          vectorQueries: [
            {
              kind: "vector",
              fields: ["contentVector"],
              vector: queryVector,
              kNearestNeighborsCount: 5
            }
          ] as any
        } as any);

        const ranked = [] as Array<{ fileName: string; text: string; score: number }>;
        for await (const result of results.results as any) {
          const doc = result.document ?? result;
          ranked.push({
            fileName: String(doc.fileName ?? "source"),
            text: String(doc.content ?? doc.text ?? ""),
            score: typeof result.score === "number" ? result.score : 0
          });
        }

        if (ranked.length > 0) {
          return ranked;
        }
      } catch {
        // Fall back to the in-memory store if search is unavailable or the index is not ready.
      }
    }

    const chunks = this.documentRepository.listChunksByAgent(agentId, tenantId);
    return rankChunks(chunks, queryVector, 5).map((chunk) => ({
      fileName: chunk.fileName,
      text: chunk.text,
      score: chunk.score
    }));
  }

  private async generateAnswer(input: {
    agentName: string;
    model: string;
    deploymentName: string;
    systemPrompt: string;
    question: string;
    contexts: Array<{ fileName: string; text: string; score: number }>;
  }) {
    if (this.azureClients?.openAi) {
      const openAiClient = await this.azureClients.openAi.getClient();
      const messages = [
        { role: "system", content: input.systemPrompt },
        {
          role: "user",
          content: [
            `You are ${input.agentName}. Answer the user using only the supplied context.`,
            `Question: ${input.question}`,
            `Context:\n${input.contexts.map((context) => `- ${context.fileName}: ${context.text}`).join("\n\n")}`
          ].join("\n\n")
        }
      ] as any;

      const response = await openAiClient.getChatCompletions(input.deploymentName, messages, {
        temperature: 0.2,
        maxTokens: 800
      } as any);

      const answer = String(response.choices?.[0]?.message?.content ?? "").trim();
      const usage = (response.usage as { promptTokens?: number; completionTokens?: number } | undefined) ?? {};
      return {
        answer: answer || generateLocalCompletion(input).answer,
        inputTokens: Number(usage.promptTokens ?? estimateTokens(input.systemPrompt + input.question)),
        outputTokens: Number(usage.completionTokens ?? estimateTokens(answer))
      };
    }

    return generateLocalCompletion(input);
  }

  private async createVector(text: string): Promise<number[]> {
    if (this.azureClients?.openAi) {
      const openAiClient = await this.azureClients.openAi.getClient();
      const response = await openAiClient.getEmbeddings(this.azureClients.openAi.embeddingDeployment, [text]);
      return response.data[0]?.embedding as number[];
    }

    return createEmbedding(text);
  }
}
