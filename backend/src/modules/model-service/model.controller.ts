import { Router } from "express";
import { validate } from "../../shared/validation/validate";
import { createModelSchema } from "./model.dto";
import { modelService } from "./model.service";

export const modelRouter = Router();

modelRouter.get("/", async (_request, response, next) => {
  try {
    response.json(await modelService.list());
  } catch (error) {
    next(error);
  }
});

modelRouter.post("/", async (request, response, next) => {
  try {
    const dto = validate(createModelSchema, request.body);
    response.status(201).json(await modelService.create(dto));
  } catch (error) {
    next(error);
  }
});

modelRouter.delete("/:id", async (request, response, next) => {
  try {
    await modelService.remove(request.params.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
