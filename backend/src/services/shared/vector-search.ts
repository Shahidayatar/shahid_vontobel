import type { DocumentChunk } from "../../models/document";

function cosineSimilarity(left: number[], right: number[]): number {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export function rankChunks(chunks: DocumentChunk[], queryVector: number[], topK = 5): Array<DocumentChunk & { score: number }> {
  return chunks
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(chunk.vector, queryVector) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
}
