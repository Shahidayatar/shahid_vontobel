import { Router } from "express";
import { validate } from "../../shared/validation/validate";
import { createAgentSchema } from "./agent.dto";
import { agentService } from "./agent.service";

export const agentRouter = Router();

agentRouter.get("/", (_request, response) => {
  response.json(agentService.list());
});

agentRouter.post("/", (request, response) => {
  const dto = validate(createAgentSchema, request.body);
  response.status(201).json(agentService.create(dto));
});
