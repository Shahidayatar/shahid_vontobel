import type { Request, Response } from "express";
import type { AppContainer } from "../container";

export function createEvaluationController(container: AppContainer) {
  return {
    evaluate: (req: Request, res: Response) => {
      return res.json(container.evaluationService.evaluate(req.body));
    }
  };
}
