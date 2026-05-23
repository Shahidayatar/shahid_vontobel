import type { Agent } from "../models/agent";

export class AgentRepository {
  private readonly agents = new Map<string, Agent>();

  save(agent: Agent): Agent {
    this.agents.set(agent.id, agent);
    return agent;
  }

  findById(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  listByTenant(tenantId: string): Agent[] {
    return Array.from(this.agents.values()).filter((agent) => agent.tenantId === tenantId);
  }

  delete(id: string): boolean {
    return this.agents.delete(id);
  }
}
