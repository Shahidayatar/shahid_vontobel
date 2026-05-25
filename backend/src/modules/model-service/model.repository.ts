import type { ModelDeployment } from "./model.types";

class ModelRepository {
  private models: ModelDeployment[] = [];

  list(): ModelDeployment[] {
    return this.models;
  }

  setAll(models: ModelDeployment[]): void {
    this.models = models;
  }

  upsert(model: ModelDeployment): ModelDeployment {
    const index = this.models.findIndex((item) => item.id === model.id);
    if (index >= 0) {
      this.models[index] = model;
    } else {
      this.models.unshift(model);
    }

    return model;
  }

  delete(id: string): void {
    this.models = this.models.filter((model) => model.id !== id);
  }

  findById(id: string): ModelDeployment | undefined {
    return this.models.find((model) => model.id === id);
  }
}

export const modelRepository = new ModelRepository();
