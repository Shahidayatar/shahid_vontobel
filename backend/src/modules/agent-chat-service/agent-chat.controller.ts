import { Router } from "express";
import { validate } from "../../shared/validation/validate";
import { agentChatRequestSchema } from "./agent-chat.dto";
import { agentChatService } from "./agent-chat.service";

export const agentChatRouter = Router();

agentChatRouter.get("/history/:agentId", (request, response) => {
  response.json(agentChatService.history(request.params.agentId));
});

agentChatRouter.post("/", async (request, response, next) => {
  try {
    const dto = validate(agentChatRequestSchema, request.body);
    const result = await agentChatService.send(dto);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
