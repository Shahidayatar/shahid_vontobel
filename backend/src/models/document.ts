export type DocumentStatus = "uploaded" | "indexed" | "failed";

export type DocumentRecord = {
  id: string;
  agentId: string;
  tenantId: string;
  fileName: string;
  mimeType: string;
  storagePath: string;
  textLength: number;
  status: DocumentStatus;
  createdAt: string;
  indexedAt?: string;
  errorMessage?: string;
};

export type DocumentChunk = {
  id: string;
  agentId: string;
  tenantId: string;
  documentId: string;
  fileName: string;
  chunkIndex: number;
  text: string;
  vector: number[];
  createdAt: string;
};
