import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "../config/env";

export async function saveChatTranscript(containerName: string, blobName: string, content: string): Promise<void> {
  if (!env.AZURE_STORAGE_CONNECTION_STRING) {
    return;
  }

  const client = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
  const container = client.getContainerClient(containerName);
  await container.createIfNotExists();
  const blob = container.getBlockBlobClient(blobName);
  await blob.upload(content, Buffer.byteLength(content));
}
