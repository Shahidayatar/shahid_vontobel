# Example Flows

## Agent creation

1. The user opens the dashboard and submits the create-agent form.
2. The frontend calls `POST /agents` with the tenant-scoped configuration.
3. The backend stores the agent and initial prompt version.
4. The frontend calls `POST /provision/{agentId}` to create the resource plan.
5. The agent becomes available for upload and chat.

## RAG ingestion

1. The user uploads a document from the upload page.
2. The frontend calls `POST /documents/upload` as multipart form data.
3. The backend stores the file, extracts text, and records the document.
4. The frontend calls `POST /documents/{agentId}/index`.
5. The backend chunks the text, creates embeddings, and saves vector chunks for retrieval.

## Chat runtime

1. The user asks a question in the chat page.
2. The frontend calls `POST /chat` with the tenant and agent identifiers.
3. The backend generates the query embedding and retrieves top chunks.
4. The prompt is built from the system prompt plus grounded context.
5. The backend returns the answer and logs usage metrics.
