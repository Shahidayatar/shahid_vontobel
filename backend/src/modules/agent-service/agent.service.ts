import type { CreateAgentDto } from "./agent.dto";
import { agentRepository } from "./agent.repository";
import type { Agent } from "./agent.types";

class AgentService {
  list(): Agent[] {
    return agentRepository.list();
  }

  create(input: CreateAgentDto): Agent {
    return agentRepository.create(input);
  }
}

export const agentService = new AgentService();
