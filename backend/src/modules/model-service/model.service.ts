import type { CreateModelDto } from "./model.dto";
import { modelRepository } from "./model.repository";
import type { ModelDeployment } from "./model.types";

class ModelService {
  list(): ModelDeployment[] {
    return modelRepository.list();
  }

  create(payload: CreateModelDto): ModelDeployment {
    return modelRepository.create(payload);
  }

  remove(id: string): void {
    modelRepository.delete(id);
  }
}

export const modelService = new ModelService();
