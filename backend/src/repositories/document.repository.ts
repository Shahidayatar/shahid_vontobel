import type { DocumentChunk, DocumentRecord } from "../models/document";

export class DocumentRepository {
  private readonly documents = new Map<string, DocumentRecord>();
  private readonly chunks = new Map<string, DocumentChunk>();

  saveDocument(document: DocumentRecord): DocumentRecord {
    this.documents.set(document.id, document);
    return document;
  }

  findDocumentById(id: string): DocumentRecord | undefined {
    return this.documents.get(id);
  }

  listDocumentsByAgent(agentId: string, tenantId: string): DocumentRecord[] {
    return Array.from(this.documents.values()).filter((document) => document.agentId === agentId && document.tenantId === tenantId);
  }

  saveChunk(chunk: DocumentChunk): DocumentChunk {
    this.chunks.set(chunk.id, chunk);
    return chunk;
  }

  listChunksByAgent(agentId: string, tenantId: string): DocumentChunk[] {
    return Array.from(this.chunks.values()).filter((chunk) => chunk.agentId === agentId && chunk.tenantId === tenantId);
  }

  deleteChunksByDocument(documentId: string): void {
    for (const [chunkId, chunk] of this.chunks.entries()) {
      if (chunk.documentId === documentId) {
        this.chunks.delete(chunkId);
      }
    }
  }
}
