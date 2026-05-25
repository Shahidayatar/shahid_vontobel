import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import { env } from "../config/env";

export async function retrieveCitations(query: string): Promise<Array<{ title: string; source: string }>> {
  if (!env.AZURE_SEARCH_ENDPOINT || !env.AZURE_SEARCH_INDEX || !env.AZURE_SEARCH_KEY) {
    return [{ title: "Knowledge Base", source: `Mocked context for: ${query.slice(0, 48)}` }];
  }

  const client = new SearchClient(
    env.AZURE_SEARCH_ENDPOINT,
    env.AZURE_SEARCH_INDEX,
    new AzureKeyCredential(env.AZURE_SEARCH_KEY)
  );

  const results = await client.search(query, { top: 3 });
  const citations: Array<{ title: string; source: string }> = [];

  for await (const result of results.results) {
    const document = result.document as Record<string, unknown>;
    citations.push({
      title: String(document.title ?? "Document"),
      source: String(document.source ?? "Azure AI Search")
    });
  }

  return citations;
}
