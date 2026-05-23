# Architecture Overview

The platform is split into three layers:

1. Experience layer: the self-service frontend for internal teams to create agents, upload documents, chat, and review usage.
2. Control plane: a modular backend API that owns agents, provisioning, ingestion, chat orchestration, prompt management, evaluation, and usage tracking.
3. Azure runtime: OpenAI, AI Search, Blob Storage, Key Vault, API Management, Entra ID, and Monitor.

## Design principles

- Multi-tenant first: every persisted entity is scoped to a tenant.
- Provision-by-default: each agent has a provisioning record and resource plan.
- RAG-native: documents are chunked, embedded, indexed, and retrieved through a consistent pipeline.
- Azure-ready: adapters isolate cloud integration from business logic.
- Observable by default: request IDs, structured logs, and token usage events are emitted on every request.
