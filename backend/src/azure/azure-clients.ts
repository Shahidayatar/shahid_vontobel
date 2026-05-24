import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import {
  SearchIndexClient,
  SearchClient,
  type SearchIndex
} from "@azure/search-documents";
import { SecretClient } from "@azure/keyvault-secrets";
import { env } from "../config/env";

const DEPLOYABLE_MODEL_NAMES = new Set(["gpt-5-pro", "gpt-4o-mini"]);

export type AzureOpenAiModelCatalogEntry = {
  id: string;
  displayName: string;
  provider: string;
  modelName: string;
  version?: string;
  description: string;
  lifecycleStatus?: string;
  capabilities?: Record<string, unknown>;
  defaultSystemPrompt: string;
};

export type AzureOpenAiDeploymentStatus = {
  id: string;
  name: string;
  modelName: string;
  modelVersion?: string;
  provisioningState?: string;
};

export type AzureOpenAiClients = {
  getClient(): Promise<any>;
  chatDeployment: string;
  embeddingDeployment: string;
};

export type AzureOpenAiManagementClients = {
  subscriptionId: string;
  resourceGroupName: string;
  accountName: string;
  location: string;
  listModels(): Promise<AzureOpenAiModelCatalogEntry[]>;
  listDeployments(): Promise<AzureOpenAiDeploymentStatus[]>;
  createDeployment(input: {
    deploymentName: string;
    modelName: string;
    modelVersion?: string;
    capacity?: number;
  }): Promise<AzureOpenAiDeploymentStatus>;
  deleteDeployment(deploymentName: string): Promise<void>;
};

export type AzureSearchClients = {
  indexClient: SearchIndexClient;
  getSearchClient(indexName: string): SearchClient<Record<string, unknown>>;
  ensureIndex(indexName: string, dimensions: number): Promise<void>;
};

export type AzureBlobClients = {
  serviceClient: BlobServiceClient;
  getContainerClient(containerName: string): ContainerClient;
  ensureContainer(containerName: string): Promise<ContainerClient>;
};

export type AzureKeyVaultClients = {
  client: SecretClient;
  setSecret(name: string, value: string): Promise<void>;
};

export type AzureClients = {
  openAi?: AzureOpenAiClients;
  openAiManagement?: AzureOpenAiManagementClients;
  search?: AzureSearchClients;
  blob?: AzureBlobClients;
  keyVault?: AzureKeyVaultClients;
};

function createCredential() {
  return new DefaultAzureCredential();
}

async function getManagementToken(credential: DefaultAzureCredential) {
  const token = await credential.getToken("https://management.azure.com/.default");
  if (!token?.token) {
    throw new Error("Unable to acquire Azure management token");
  }

  return token.token;
}

async function managementRequest<T>(credential: DefaultAzureCredential, url: string, init?: RequestInit): Promise<T> {
  const token = await getManagementToken(credential);
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => "");
    throw new Error(`Azure management request failed (${response.status}): ${payload}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function createSearchIndex(indexName: string, dimensions: number): SearchIndex {
  return {
    name: indexName,
    fields: [
      { name: "id", type: "Edm.String", key: true, searchable: false, filterable: true, sortable: false, facetable: false },
      { name: "tenantId", type: "Edm.String", searchable: false, filterable: true, sortable: false, facetable: true },
      { name: "agentId", type: "Edm.String", searchable: false, filterable: true, sortable: false, facetable: true },
      { name: "documentId", type: "Edm.String", searchable: false, filterable: true, sortable: false, facetable: false },
      { name: "fileName", type: "Edm.String", searchable: true, filterable: true, sortable: true, facetable: false },
      { name: "chunkIndex", type: "Edm.Int32", searchable: false, filterable: true, sortable: true, facetable: false },
      { name: "content", type: "Edm.String", searchable: true, filterable: false, sortable: false, facetable: false },
      {
        name: "contentVector",
        type: "Collection(Edm.Single)",
        searchable: true,
        filterable: false,
        sortable: false,
        facetable: false,
        vectorSearchDimensions: dimensions,
        vectorSearchProfileName: "vector-profile"
      }
    ],
    vectorSearch: {
      algorithms: [
        {
          name: "vector-hnsw",
          kind: "hnsw",
          hnswParameters: {
            metric: "cosine"
          }
        }
      ],
      profiles: [
        {
          name: "vector-profile",
          algorithmConfigurationName: "vector-hnsw"
        }
      ]
    }
  } as unknown as SearchIndex;
}

export function createAzureClients(): AzureClients {
  const credential = createCredential();

  const openAi = env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_CHAT_DEPLOYMENT && env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT
    ? {
        async getClient() {
          const azureOpenAi = await import("@azure/openai");
          return new azureOpenAi.OpenAIClient(env.AZURE_OPENAI_ENDPOINT as string, credential);
        },
        chatDeployment: env.AZURE_OPENAI_CHAT_DEPLOYMENT,
        embeddingDeployment: env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT
      }
    : undefined;

  const openAiManagement = env.AZURE_OPENAI_SUBSCRIPTION_ID && env.AZURE_OPENAI_RESOURCE_GROUP_NAME && env.AZURE_OPENAI_ACCOUNT_NAME && env.AZURE_OPENAI_LOCATION
    ? {
        subscriptionId: env.AZURE_OPENAI_SUBSCRIPTION_ID,
        resourceGroupName: env.AZURE_OPENAI_RESOURCE_GROUP_NAME,
        accountName: env.AZURE_OPENAI_ACCOUNT_NAME,
        location: env.AZURE_OPENAI_LOCATION,
        async listModels() {
          const payload = await managementRequest<{ value?: Array<Record<string, any>> }>(
            credential,
            `https://management.azure.com/subscriptions/${env.AZURE_OPENAI_SUBSCRIPTION_ID}/providers/Microsoft.CognitiveServices/locations/${encodeURIComponent(env.AZURE_OPENAI_LOCATION as string)}/models?api-version=2024-10-01`
          );

          return (payload.value ?? [])
            .filter((entry) => entry.kind === "OpenAI" && entry.model?.name)
            .filter((entry) => entry.lifecycleStatus !== "Deprecated" && entry.lifecycleStatus !== "Deprecating")
            .filter((entry) => DEPLOYABLE_MODEL_NAMES.has(String(entry.model?.name)))
            .map((entry) => ({
              id: String(entry.model?.name),
              displayName: String(entry.model?.name),
              provider: String(entry.model?.publisher ?? "Azure OpenAI"),
              modelName: String(entry.model?.name),
              version: entry.model?.version ? String(entry.model.version) : undefined,
              description: String(entry.description ?? `${entry.model?.name} model available in ${env.AZURE_OPENAI_LOCATION}`),
              lifecycleStatus: entry.lifecycleStatus ? String(entry.lifecycleStatus) : undefined,
              capabilities: entry.model?.capabilities ?? {},
              defaultSystemPrompt: `You are an enterprise assistant using ${String(entry.model?.name)}.`
            }));
        },
        async listDeployments() {
          const payload = await managementRequest<{ value?: Array<Record<string, any>> }>(
            credential,
            `https://management.azure.com/subscriptions/${env.AZURE_OPENAI_SUBSCRIPTION_ID}/resourceGroups/${encodeURIComponent(env.AZURE_OPENAI_RESOURCE_GROUP_NAME as string)}/providers/Microsoft.CognitiveServices/accounts/${encodeURIComponent(env.AZURE_OPENAI_ACCOUNT_NAME as string)}/deployments?api-version=2024-10-01`
          );

          return (payload.value ?? []).map((entry) => ({
            id: String(entry.id),
            name: String(entry.name),
            modelName: String(entry.properties?.model?.name ?? entry.name),
            modelVersion: entry.properties?.model?.version ? String(entry.properties.model.version) : undefined,
            provisioningState: entry.properties?.provisioningState ? String(entry.properties.provisioningState) : undefined
          }));
        },
        async createDeployment(input: { deploymentName: string; modelName: string; modelVersion?: string; capacity?: number; }) {
          const body = {
            sku: {
              name: "Standard",
              capacity: input.capacity ?? 1
            },
            properties: {
              model: {
                format: "OpenAI",
                name: input.modelName,
                ...(input.modelVersion ? { version: input.modelVersion } : {})
              }
            }
          };

          const result = await managementRequest<Record<string, any>>(
            credential,
            `https://management.azure.com/subscriptions/${env.AZURE_OPENAI_SUBSCRIPTION_ID}/resourceGroups/${encodeURIComponent(env.AZURE_OPENAI_RESOURCE_GROUP_NAME as string)}/providers/Microsoft.CognitiveServices/accounts/${encodeURIComponent(env.AZURE_OPENAI_ACCOUNT_NAME as string)}/deployments/${encodeURIComponent(input.deploymentName)}?api-version=2024-10-01`,
            {
              method: "PUT",
              body: JSON.stringify(body)
            }
          );

          return {
            id: String(result.id ?? input.deploymentName),
            name: String(result.name ?? input.deploymentName),
            modelName: input.modelName,
            modelVersion: input.modelVersion,
            provisioningState: String(result.properties?.provisioningState ?? "Creating")
          };
        },
        async deleteDeployment(deploymentName: string) {
          await managementRequest<void>(
            credential,
            `https://management.azure.com/subscriptions/${env.AZURE_OPENAI_SUBSCRIPTION_ID}/resourceGroups/${encodeURIComponent(env.AZURE_OPENAI_RESOURCE_GROUP_NAME as string)}/providers/Microsoft.CognitiveServices/accounts/${encodeURIComponent(env.AZURE_OPENAI_ACCOUNT_NAME as string)}/deployments/${encodeURIComponent(deploymentName)}?api-version=2024-10-01`,
            {
              method: "DELETE"
            }
          );
        }
      } satisfies AzureOpenAiManagementClients
    : undefined;

  const search = env.AZURE_SEARCH_ENDPOINT
    ? (() => {
        const indexClient = new SearchIndexClient(env.AZURE_SEARCH_ENDPOINT, credential);
        return {
          indexClient,
          getSearchClient(indexName: string) {
            return new SearchClient<Record<string, unknown>>(env.AZURE_SEARCH_ENDPOINT as string, indexName, credential);
          },
          async ensureIndex(indexName: string, dimensions: number) {
            try {
              await indexClient.getIndex(indexName);
            } catch {
              await indexClient.createIndex(createSearchIndex(indexName, dimensions));
            }
          }
        } satisfies AzureSearchClients;
      })()
    : undefined;

  const blob = env.AZURE_BLOB_SERVICE_URL
    ? {
        serviceClient: new BlobServiceClient(env.AZURE_BLOB_SERVICE_URL, credential),
        getContainerClient(containerName: string) {
          return new BlobServiceClient(env.AZURE_BLOB_SERVICE_URL as string, credential).getContainerClient(containerName);
        },
        async ensureContainer(containerName: string) {
          const containerClient = new BlobServiceClient(env.AZURE_BLOB_SERVICE_URL as string, credential).getContainerClient(containerName);
          await containerClient.createIfNotExists();
          return containerClient;
        }
      } satisfies AzureBlobClients
    : undefined;

  const keyVault = env.AZURE_KEY_VAULT_URL
    ? {
        client: new SecretClient(env.AZURE_KEY_VAULT_URL, credential),
        async setSecret(name: string, value: string) {
          await new SecretClient(env.AZURE_KEY_VAULT_URL as string, credential).setSecret(name, value);
        }
      } satisfies AzureKeyVaultClients
    : undefined;

  return {
    openAi,
    openAiManagement,
    search,
    blob,
    keyVault
  };
}
