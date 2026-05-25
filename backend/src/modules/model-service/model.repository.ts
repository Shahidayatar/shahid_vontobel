import { randomUUID } from "crypto";
import type { CreateModelDto } from "./model.dto";
import type { ModelDeployment } from "./model.types";

class ModelRepository {
  private readonly models: ModelDeployment[] = [
    {
      id: randomUUID(),
      name: "gpt4o-production",
      model: "gpt-4o",
      region: "swedencentral",
      status: "running",
      health: "healthy",
      createdAt: new Date().toISOString()
    }
  ];

  list(): ModelDeployment[] {
    return this.models;
  }

  create(input: CreateModelDto): ModelDeployment {
    const model: ModelDeployment = {
      id: randomUUID(),
      name: input.name,
      model: input.model,
      region: input.region,
      status: "running",
      health: "healthy",
      createdAt: new Date().toISOString()
    };
    this.models.unshift(model);
    return model;
  }

  delete(id: string): void {
    const index = this.models.findIndex((model) => model.id === id);
    if (index >= 0) {
      this.models.splice(index, 1);
    }
  }

  findById(id: string): ModelDeployment | undefined {
    return this.models.find((model) => model.id === id);
  }
}

export const modelRepository = new ModelRepository();
