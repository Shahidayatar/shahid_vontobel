import { Router } from "express";
import { validate } from "../../shared/validation/validate";
import { modelChatRequestSchema } from "./model-chat.dto";
import { modelChatService } from "./model-chat.service";

export const modelChatRouter = Router();

modelChatRouter.get("/history/:modelId", (request, response) => {
  response.json(modelChatService.history(request.params.modelId));
});

modelChatRouter.post("/", async (request, response, next) => {
  try {
    const dto = validate(modelChatRequestSchema, request.body);
    const result = await modelChatService.send(dto);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
