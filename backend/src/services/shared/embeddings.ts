const DEFAULT_DIMENSIONS = 64;

function hashToken(token: string): number {
  let hash = 0;
  for (let index = 0; index < token.length; index += 1) {
    hash = (hash * 31 + token.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function createEmbedding(text: string, dimensions = DEFAULT_DIMENSIONS): number[] {
  const vector = new Array(dimensions).fill(0);
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);

  if (tokens.length === 0) {
    return vector;
  }

  for (const token of tokens) {
    const hash = hashToken(token);
    const bucket = hash % dimensions;
    const sign = hash % 2 === 0 ? 1 : -1;
    vector[bucket] += sign * (1 + token.length / 10);
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}
