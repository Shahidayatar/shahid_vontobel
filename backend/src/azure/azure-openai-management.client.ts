import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID } from "crypto";
import { env } from "../config/env";

type DeploymentModelName = "gpt-4o" | "gpt-4.1" | "text-embedding-3-large";

type AzureDeployment = {
  id: string;
  name: string;
  type: string;
  sku?: {
    name?: string;
    capacity?: number;
  };
  properties?: {
    model?: {
      format?: string;
      name?: string;
      version?: string;
    };
    provisioningState?: string;
  };
};

type ModelDeploymentSummary = {
  id: string;
  name: string;
  model: string;
  region: string;
  status: "provisioning" | "running" | "failed";
  health: "healthy" | "degraded" | "offline";
  createdAt: string;
};

const credential = new DefaultAzureCredential();

function requireDeploymentConfig(): {
  subscriptionId: string;
  resourceGroupName: string;
  accountName: string;
  location: string;
} {
  const { AZURE_OPENAI_SUBSCRIPTION_ID, AZURE_OPENAI_RESOURCE_GROUP_NAME, AZURE_OPENAI_ACCOUNT_NAME, AZURE_OPENAI_LOCATION } = env;

  if (!AZURE_OPENAI_SUBSCRIPTION_ID || !AZURE_OPENAI_RESOURCE_GROUP_NAME || !AZURE_OPENAI_ACCOUNT_NAME || !AZURE_OPENAI_LOCATION) {
    throw new Error(
      "Missing Azure OpenAI deployment config. Set AZURE_OPENAI_SUBSCRIPTION_ID, AZURE_OPENAI_RESOURCE_GROUP_NAME, AZURE_OPENAI_ACCOUNT_NAME, and AZURE_OPENAI_LOCATION."
    );
  }

  return {
    subscriptionId: AZURE_OPENAI_SUBSCRIPTION_ID,
    resourceGroupName: AZURE_OPENAI_RESOURCE_GROUP_NAME,
    accountName: AZURE_OPENAI_ACCOUNT_NAME,
    location: AZURE_OPENAI_LOCATION
  };
}

async function getManagementToken(): Promise<string> {
  const token = await credential.getToken("https://management.azure.com/.default");
  if (!token) {
    throw new Error("Unable to acquire Azure management token");
  }

  return token.token;
}

async function managementRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getManagementToken();
  const response = await fetch(`https://management.azure.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Azure OpenAI management request failed with ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

function mapStatus(provisioningState?: string): ModelDeploymentSummary["status"] {
  switch (provisioningState?.toLowerCase()) {
    case "succeeded":
      return "running";
    case "failed":
    case "canceled":
      return "failed";
    case "accepted":
    case "creating":
    case "deleting":
    case "moving":
      return "provisioning";
    default:
      return "provisioning";
  }
}

function mapHealth(status: ModelDeploymentSummary["status"]): ModelDeploymentSummary["health"] {
  switch (status) {
    case "running":
      return "healthy";
    case "provisioning":
      return "degraded";
    case "failed":
      return "offline";
  }
}

function toSummary(deployment: AzureDeployment): ModelDeploymentSummary {
  const modelName = deployment.properties?.model?.name ?? "unknown";
  const status = mapStatus(deployment.properties?.provisioningState);

  return {
    id: deployment.id ?? randomUUID(),
    name: deployment.name,
    model: modelName,
    region: env.AZURE_OPENAI_LOCATION ?? "unknown",
    status,
    health: mapHealth(status),
    createdAt: new Date().toISOString()
  };
}

export async function listAzureOpenAIDeployments(): Promise<ModelDeploymentSummary[]> {
  const { subscriptionId, resourceGroupName, accountName } = requireDeploymentConfig();
  const payload = await managementRequest<{ value?: AzureDeployment[] }>(
    `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.CognitiveServices/accounts/${accountName}/deployments?api-version=${env.AZURE_OPENAI_MANAGEMENT_API_VERSION}`
  );

  return (payload.value ?? []).map(toSummary);
}

export async function createAzureOpenAIDeployment(input: {
  name: string;
  model: DeploymentModelName;
}): Promise<ModelDeploymentSummary> {
  const { subscriptionId, resourceGroupName, accountName } = requireDeploymentConfig();

  const deployment = await managementRequest<AzureDeployment>(
    `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.CognitiveServices/accounts/${accountName}/deployments/${encodeURIComponent(input.name)}?api-version=${env.AZURE_OPENAI_MANAGEMENT_API_VERSION}`,
    {
      method: "PUT",
      body: JSON.stringify({
        sku: {
          name: "GlobalStandard",
          capacity: 1
        },
        properties: {
          model: {
            format: "OpenAI",
            name: input.model
          }
        }
      })
    }
  );

  return toSummary(deployment);
}

export async function deleteAzureOpenAIDeployment(name: string): Promise<void> {
  const { subscriptionId, resourceGroupName, accountName } = requireDeploymentConfig();

  await managementRequest<unknown>(
    `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.CognitiveServices/accounts/${accountName}/deployments/${encodeURIComponent(name)}?api-version=${env.AZURE_OPENAI_MANAGEMENT_API_VERSION}`,
    { method: "DELETE" }
  );
}