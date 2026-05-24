import type { ModelDeployment } from "../models/model-deployment";

export class ModelDeploymentRepository {
  private readonly deployments = new Map<string, ModelDeployment>();

  save(deployment: ModelDeployment): ModelDeployment {
    this.deployments.set(deployment.id, deployment);
    return deployment;
  }

  findById(id: string): ModelDeployment | undefined {
    return this.deployments.get(id);
  }

  listByTenant(tenantId: string): ModelDeployment[] {
    return Array.from(this.deployments.values()).filter((deployment) => deployment.tenantId === tenantId);
  }
}