export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function chunkText(text: string, chunkSize = 1200, overlap = 150): string[] {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    chunks.push(normalized.slice(start, end));
    if (end === normalized.length) {
      break;
    }

    start = Math.max(0, end - overlap);
  }

  return chunks;
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(normalizeText(text).length / 4));
}

export function tokenize(text: string): string[] {
  return normalizeText(text).toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
}
