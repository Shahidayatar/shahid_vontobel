import { estimateTokens, tokenize } from "./text";

export type ChatContextChunk = {
  fileName: string;
  text: string;
  score: number;
};

export type GenerateReplyInput = {
  agentName: string;
  systemPrompt: string;
  question: string;
  contexts: ChatContextChunk[];
  model: string;
};

export type GenerateReplyOutput = {
  answer: string;
  inputTokens: number;
  outputTokens: number;
};

function summarizeContext(contexts: ChatContextChunk[]): string {
  if (contexts.length === 0) {
    return "No relevant source documents were found for this query.";
  }

  return contexts
    .slice(0, 3)
    .map((context, index) => `Source ${index + 1} (${context.fileName}, score ${context.score.toFixed(3)}): ${context.text.slice(0, 450)}`)
    .join("\n\n");
}

export function generateLocalCompletion(input: GenerateReplyInput): GenerateReplyOutput {
  const contextSummary = summarizeContext(input.contexts);
  const groundedTokens = tokenize(contextSummary).length;
  const answer = [
    `Agent ${input.agentName} response`,
    `System prompt: ${input.systemPrompt}`,
    `Question: ${input.question}`,
    `Grounded context: ${contextSummary}`,
    groundedTokens > 0
      ? "Answer: I used the retrieved context to produce this response and can cite the source documents if needed."
      : "Answer: I did not find supporting context, so this response is a best-effort summary and should be reviewed before reuse."
  ].join("\n\n");

  return {
    answer,
    inputTokens: estimateTokens(`${input.systemPrompt}\n${input.question}\n${contextSummary}`),
    outputTokens: estimateTokens(answer)
  };
}
