import { agentRepository } from "./agent-service/agent.repository";
import { modelRepository } from "./model-service/model.repository";

class DashboardService {
  overview() {
    const models = modelRepository.list();
    const agents = agentRepository.list();

    return {
      totalModels: models.length,
      activeAgents: agents.length,
      tokenUsage: 2850000,
      monthlyCost: 19750,
      recentDeployments: models.slice(0, 4),
      recentChats: [],
      health: {
        healthy: models.filter((item) => item.health === "healthy").length,
        degraded: models.filter((item) => item.health === "degraded").length,
        offline: models.filter((item) => item.health === "offline").length
      }
    };
  }
}

export const dashboardService = new DashboardService();
