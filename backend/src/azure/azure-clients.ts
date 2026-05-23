import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import {
  SearchIndexClient,
  SearchClient,
  type SearchIndex
} from "@azure/search-documents";
import { SecretClient } from "@azure/keyvault-secrets";
import { env } from "../config/env";

export type AzureOpenAiClients = {
  getClient(): Promise<any>;
  chatDeployment: string;
  embeddingDeployment: string;
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
  search?: AzureSearchClients;
  blob?: AzureBlobClients;
  keyVault?: AzureKeyVaultClients;
};

function createCredential() {
  return new DefaultAzureCredential();
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
    search,
    blob,
    keyVault
  };
}
