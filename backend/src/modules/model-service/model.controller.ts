import { Router } from "express";
import { validate } from "../../shared/validation/validate";
import { createModelSchema } from "./model.dto";
import { modelService } from "./model.service";

export const modelRouter = Router();

modelRouter.get("/", (_request, response) => {
  response.json(modelService.list());
});

modelRouter.post("/", (request, response) => {
  const dto = validate(createModelSchema, request.body);
  response.status(201).json(modelService.create(dto));
});

modelRouter.delete("/:id", (request, response) => {
  modelService.remove(request.params.id);
  response.status(204).send();
});
