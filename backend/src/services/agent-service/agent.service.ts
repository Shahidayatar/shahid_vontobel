import { randomUUID } from "crypto";
import type { Agent, AgentResourcePlan } from "../../models/agent";
import { PromptRepository } from "../../repositories/prompt.repository";
import { AgentRepository } from "../../repositories/agent.repository";

export type CreateAgentInput = {
  tenantId: string;
  name: string;
  description?: string;
  model: string;
  systemPrompt: string;
  dataSources?: string[];
};

export type UpdateAgentInput = Partial<Omit<CreateAgentInput, "tenantId">>;

export class AgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly promptRepository: PromptRepository
  ) {}

  createAgent(input: CreateAgentInput): Agent {
    const now = new Date().toISOString();
    const agent: Agent = {
      id: randomUUID(),
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      model: input.model,
      systemPrompt: input.systemPrompt,
      dataSources: input.dataSources ?? [],
      isProvisioned: false,
      createdAt: now,
      updatedAt: now
    };

    this.agentRepository.save(agent);
    this.promptRepository.save({
      id: randomUUID(),
      agentId: agent.id,
      tenantId: agent.tenantId,
      version: 1,
      systemPrompt: agent.systemPrompt,
      createdBy: "system",
      createdAt: now,
      isActive: true
    });

    return agent;
  }

  listAgents(tenantId: string): Agent[] {
    return this.agentRepository.listByTenant(tenantId);
  }

  getAgent(tenantId: string, agentId: string): Agent | undefined {
    const agent = this.agentRepository.findById(agentId);
    if (!agent || agent.tenantId !== tenantId) {
      return undefined;
    }

    return agent;
  }

  updateAgent(tenantId: string, agentId: string, input: UpdateAgentInput): Agent | undefined {
    const current = this.getAgent(tenantId, agentId);
    if (!current) {
      return undefined;
    }

    const updated: Agent = {
      ...current,
      ...input,
      dataSources: input.dataSources ?? current.dataSources,
      updatedAt: new Date().toISOString()
    };

    this.agentRepository.save(updated);

    if (input.systemPrompt) {
      this.promptRepository.deactivateExisting(updated.id, updated.tenantId);
      this.promptRepository.save({
        id: randomUUID(),
        agentId: updated.id,
        tenantId: updated.tenantId,
        version: this.promptRepository.listByAgent(updated.id, updated.tenantId).length + 1,
        systemPrompt: input.systemPrompt,
        createdBy: "system",
        createdAt: updated.updatedAt,
        isActive: true
      });
    }

    return updated;
  }

  deleteAgent(tenantId: string, agentId: string): boolean {
    const current = this.getAgent(tenantId, agentId);
    if (!current) {
      return false;
    }

    return this.agentRepository.delete(agentId);
  }

  assignResourcePlan(agentId: string, tenantId: string, resourcePlan: AgentResourcePlan): Agent | undefined {
    const current = this.getAgent(tenantId, agentId);
    if (!current) {
      return undefined;
    }

    const updated: Agent = {
      ...current,
      resourcePlan,
      updatedAt: new Date().toISOString()
    };

    this.agentRepository.save(updated);
    return updated;
  }

  markProvisioned(agentId: string, resourcePlan: AgentResourcePlan, status: string): Agent | undefined {
    const agent = this.agentRepository.findById(agentId);
    if (!agent) {
      return undefined;
    }

    const updated: Agent = {
      ...agent,
      isProvisioned: status === "succeeded",
      provisioningStatus: status,
      resourcePlan,
      updatedAt: new Date().toISOString()
    };

    this.agentRepository.save(updated);
    return updated;
  }
}
