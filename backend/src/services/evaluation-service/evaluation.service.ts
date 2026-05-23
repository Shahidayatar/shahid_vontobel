import { tokenize } from "../shared/text";

export type EvaluateRequest = {
  answer: string;
  context: string;
  expectedAnswer?: string;
};

export class EvaluationService {
  evaluate(request: EvaluateRequest) {
    const answerTokens = tokenize(request.answer);
    const contextTokens = new Set(tokenize(request.context));
    const supported = answerTokens.filter((token) => contextTokens.has(token)).length;
    const supportRatio = answerTokens.length === 0 ? 0 : supported / answerTokens.length;
    const hallucinationRisk = Number((1 - supportRatio).toFixed(3));
    const qualityScore = Number((Math.min(1, supportRatio + (request.expectedAnswer ? 0.2 : 0)) * 100).toFixed(1));

    return {
      hallucinationRisk,
      qualityScore,
      passed: hallucinationRisk < 0.45 && qualityScore >= 55,
      notes: [
        supportRatio >= 0.4 ? "Context support is acceptable." : "Answer may be under-grounded.",
        request.expectedAnswer ? "Reference answer provided for regression scoring." : "No reference answer provided."
      ]
    };
  }
}
