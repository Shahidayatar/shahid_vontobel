import { DefaultAzureCredential } from "@azure/identity";
import { env } from "../config/env";
import { logger } from "../shared/logging/logger";

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

const credential = new DefaultAzureCredential();

async function getBearerToken(): Promise<string> {
  const token = await credential.getToken("https://cognitiveservices.azure.com/.default");
  if (!token) {
    throw new Error("Unable to acquire Azure OpenAI bearer token");
  }

  return token.token;
}

export async function runAzureOpenAIChat(request: ChatRequest): Promise<ChatResult> {
  const started = Date.now();

  if (!env.AZURE_OPENAI_ENDPOINT) {
    logger.warn("Azure OpenAI chat using simulated response", {
      deployment: request.deployment,
      hasEndpoint: Boolean(env.AZURE_OPENAI_ENDPOINT),
      hasKey: Boolean(env.AZURE_OPENAI_KEY)
    });

    return {
      content: `Simulated response for deployment ${request.deployment}. Configure AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY for live calls.`,
      promptTokens: Math.round(request.userMessage.length / 3),
      completionTokens: 72,
      latencyMs: 160
    };
  }

  logger.info("Azure OpenAI chat request started", {
    deployment: request.deployment,
    endpointConfigured: true,
    authMode: env.AZURE_OPENAI_KEY ? "api-key" : "azure-ad",
    hasSystemPrompt: Boolean(request.systemPrompt),
    temperature: request.temperature ?? 0.4
  });

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
        ...(env.AZURE_OPENAI_KEY
          ? { "api-key": env.AZURE_OPENAI_KEY }
          : { Authorization: `Bearer ${await getBearerToken()}` })
      },
      body: JSON.stringify({
        messages,
        ...(request.temperature === undefined ? {} : { temperature: request.temperature })
      })
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error("Azure OpenAI chat request failed", {
      deployment: request.deployment,
      status: response.status,
      body: errorBody
    });

    throw new Error(`Azure OpenAI request failed with ${response.status}: ${errorBody}`);
  }

  const payload = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };

  const result = {
    content: payload.choices[0]?.message?.content ?? "",
    promptTokens: payload.usage?.prompt_tokens ?? 0,
    completionTokens: payload.usage?.completion_tokens ?? 0,
    latencyMs: Date.now() - started
  };

  logger.info("Azure OpenAI chat request completed", {
    deployment: request.deployment,
    latencyMs: result.latencyMs,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens
  });

  return result;
}
