import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import { join } from "path";
import { AgentRepository } from "../../repositories/agent.repository";
import { DocumentRepository } from "../../repositories/document.repository";
import { UsageRepository } from "../../repositories/usage.repository";
import type { DocumentChunk, DocumentRecord } from "../../models/document";
import { chunkText, estimateTokens, normalizeText } from "../shared/text";
import { createEmbedding } from "../shared/embeddings";
import { storeLocalBlob } from "../shared/storage";
import type { AzureClients } from "../../azure/azure-clients";

export type UploadedDocument = {
  document: DocumentRecord;
  indexedChunks: DocumentChunk[];
};

export class RagService {
  private readonly storageRoot = join(process.cwd(), "data", "uploads");

  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly usageRepository: UsageRepository,
    private readonly azureClients?: AzureClients
  ) {}

  async uploadDocument(input: {
    tenantId: string;
    agentId: string;
    fileName: string;
    mimeType: string;
    content: Buffer;
  }): Promise<DocumentRecord> {
    const agent = this.agentRepository.findById(input.agentId);
    if (!agent || agent.tenantId !== input.tenantId) {
      throw new Error("Agent not found for tenant");
    }

    const blob = await storeLocalBlob(this.storageRoot, `${input.tenantId}/${input.agentId}`, `${randomUUID()}-${input.fileName}`, input.content, input.mimeType);
    if (this.azureClients?.blob) {
      const containerName = agent.resourcePlan?.storageContainerName ?? `${input.agentId.slice(0, 12)}docs`;
      const containerClient = await this.azureClients.blob.ensureContainer(containerName);
      const blobClient = containerClient.getBlockBlobClient(blob.fileName);
      await blobClient.uploadData(input.content, {
        blobHTTPHeaders: { blobContentType: input.mimeType }
      });
    }

    const text = normalizeText(input.content.toString("utf8"));
    const document: DocumentRecord = {
      id: randomUUID(),
      agentId: input.agentId,
      tenantId: input.tenantId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      storagePath: blob.path,
      textLength: text.length,
      status: "uploaded",
      createdAt: new Date().toISOString()
    };

    this.documentRepository.saveDocument(document);
    this.usageRepository.save({
      id: randomUUID(),
      requestId: randomUUID(),
      tenantId: input.tenantId,
      agentId: input.agentId,
      operation: "document-upload",
      model: "n/a",
      inputTokens: estimateTokens(text),
      outputTokens: 0,
      estimatedCostUsd: 0,
      createdAt: new Date().toISOString()
    });

    return document;
  }

  async indexDocuments(agentId: string, tenantId: string): Promise<DocumentChunk[]> {
    const agent = this.agentRepository.findById(agentId);
    if (!agent || agent.tenantId !== tenantId) {
      throw new Error("Agent not found for tenant");
    }

    const documents = this.documentRepository.listDocumentsByAgent(agentId, tenantId).filter((document) => document.status !== "indexed");
    const indexedChunks: DocumentChunk[] = [];
    const searchIndexName = agent.resourcePlan?.searchIndexName ?? `${agentId.slice(0, 12)}-chunks`;

    if (this.azureClients?.search) {
      await this.azureClients.search.ensureIndex(searchIndexName, 1536);
    }

    for (const document of documents) {
      const content = normalizeText(await this.loadDocumentText(document));
      const pieces = chunkText(content);

      for (const [chunkIndex, piece] of pieces.entries()) {
        const vector = await this.createVector(piece);
        const chunk: DocumentChunk = {
          id: randomUUID(),
          agentId,
          tenantId,
          documentId: document.id,
          fileName: document.fileName,
          chunkIndex,
          text: piece,
          vector,
          createdAt: new Date().toISOString()
        };

        this.documentRepository.saveChunk(chunk);
        indexedChunks.push(chunk);

        if (this.azureClients?.search) {
          const searchClient = this.azureClients.search.getSearchClient(searchIndexName);
          await searchClient.mergeOrUploadDocuments([{ 
            id: chunk.id,
            tenantId: chunk.tenantId,
            agentId: chunk.agentId,
            documentId: chunk.documentId,
            fileName: chunk.fileName,
            chunkIndex: chunk.chunkIndex,
            content: chunk.text,
            contentVector: chunk.vector
          } as any]);
        }
      }

      this.documentRepository.saveDocument({
        ...document,
        status: "indexed",
        indexedAt: new Date().toISOString()
      });
    }

    return indexedChunks;
  }

  listChunks(agentId: string, tenantId: string): DocumentChunk[] {
    return this.documentRepository.listChunksByAgent(agentId, tenantId);
  }

  private async loadDocumentText(document: DocumentRecord): Promise<string> {
    const buffer = await readFile(document.storagePath);
    return normalizeText(buffer.toString("utf8"));
  }

  private async createVector(text: string): Promise<number[]> {
    if (this.azureClients?.openAi) {
      const openAiClient = await this.azureClients.openAi.getClient();
      const embeddings = await openAiClient.getEmbeddings(this.azureClients.openAi.embeddingDeployment, [text]);
      return embeddings.data[0]?.embedding as number[];
    }

    return createEmbedding(text);
  }
}
