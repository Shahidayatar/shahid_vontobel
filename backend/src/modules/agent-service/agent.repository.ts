import { randomUUID } from "crypto";
import type { CreateAgentDto } from "./agent.dto";
import type { Agent } from "./agent.types";

class AgentRepository {
  private readonly agents: Agent[] = [];

  list(): Agent[] {
    return this.agents;
  }

  create(input: CreateAgentDto): Agent {
    const next: Agent = {
      id: randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    this.agents.unshift(next);
    return next;
  }

  findById(id: string): Agent | undefined {
    return this.agents.find((agent) => agent.id === id);
  }
}

export const agentRepository = new AgentRepository();
