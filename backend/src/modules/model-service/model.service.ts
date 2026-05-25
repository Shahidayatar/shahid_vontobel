import type { CreateModelDto } from "./model.dto";
import { modelRepository } from "./model.repository";
import type { ModelDeployment } from "./model.types";
import {
  createAzureOpenAIDeployment,
  deleteAzureOpenAIDeployment,
  listAzureOpenAIDeployments
} from "../../azure/azure-openai-management.client";

class ModelService {
  async list(): Promise<ModelDeployment[]> {
    const deployments = await listAzureOpenAIDeployments();
    modelRepository.setAll(deployments);
    return modelRepository.list();
  }

  async create(payload: CreateModelDto): Promise<ModelDeployment> {
    const deployment = await createAzureOpenAIDeployment({
      name: payload.name,
      model: payload.model
    });

    modelRepository.upsert(deployment);
    return deployment;
  }

  async remove(id: string): Promise<void> {
    const existing = modelRepository.findById(id);
    const name = existing?.name ?? id;
    await deleteAzureOpenAIDeployment(name);
    modelRepository.delete(id);
  }
}

export const modelService = new ModelService();
