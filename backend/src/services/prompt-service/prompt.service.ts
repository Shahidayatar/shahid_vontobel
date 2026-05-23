import { randomUUID } from "crypto";
import { AgentRepository } from "../../repositories/agent.repository";
import { PromptRepository } from "../../repositories/prompt.repository";

export class PromptService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly promptRepository: PromptRepository
  ) {}

  createPrompt(agentId: string, tenantId: string, systemPrompt: string, createdBy: string) {
    const agent = this.agentRepository.findById(agentId);
    if (!agent || agent.tenantId !== tenantId) {
      throw new Error("Agent not found for tenant");
    }

    this.promptRepository.deactivateExisting(agentId, tenantId);
    const version = this.promptRepository.listByAgent(agentId, tenantId).length + 1;
    const prompt = {
      id: randomUUID(),
      agentId,
      tenantId,
      version,
      systemPrompt,
      createdBy,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    this.promptRepository.save(prompt);
    return prompt;
  }

  listPrompts(agentId: string, tenantId: string) {
    return this.promptRepository.listByAgent(agentId, tenantId);
  }
}
