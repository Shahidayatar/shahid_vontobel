import { env } from "../config/env";

type ChatRequest = {
  deployment: string;
  systemPrompt?: string;
  userMessage: string;
  temperature?: number;
};

type ChatResult = {
  content: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
};

export async function runAzureOpenAIChat(request: ChatRequest): Promise<ChatResult> {
  const started = Date.now();

  if (!env.AZURE_OPENAI_ENDPOINT || !env.AZURE_OPENAI_KEY) {
    return {
      content: `Simulated response for deployment ${request.deployment}. Configure AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY for live calls.`,
      promptTokens: Math.round(request.userMessage.length / 3),
      completionTokens: 72,
      latencyMs: 160
    };
  }

  const messages = [
    ...(request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : []),
    { role: "user", content: request.userMessage }
  ];

  const response = await fetch(
    `${env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${request.deployment}/chat/completions?api-version=${env.AZURE_OPENAI_API_VERSION}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.AZURE_OPENAI_KEY
      },
      body: JSON.stringify({
        messages,
        temperature: request.temperature ?? 0.4
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Azure OpenAI request failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };

  return {
    content: payload.choices[0]?.message?.content ?? "",
    promptTokens: payload.usage?.prompt_tokens ?? 0,
    completionTokens: payload.usage?.completion_tokens ?? 0,
    latencyMs: Date.now() - started
  };
}
