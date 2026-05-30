# AI Foundry as a Service

Internal enterprise AI platform scaffold for multi-tenant agent creation, RAG ingestion, chat orchestration, provisioning automation, and observability on Azure.

## Included in this iteration

- Architecture overview and repo layout
- Backend API scaffold in TypeScript
- Local MVP path for agent CRUD, document ingestion, vector retrieval, and chat orchestration

## High-level architecture

<img width="1024" height="929" alt="image" src="https://github.com/user-attachments/assets/650017dc-de86-4225-b8da-3e55d9d40536" />
<img width="910" height="430" alt="image" src="https://github.com/user-attachments/assets/fa9a8311-785e-4a52-b1e8-cd43639cb004" />

## Repository layout

- `backend` - control plane API and core platform services
- `frontend` - self-service portal for agents, upload, chat, and analytics
- `infra` - Terraform/Bicep modules and deployment composition
- `openapi` - API contract for backend and APIM
- `.github/workflows` - CI/CD pipeline definitions

## Run locally

1. Install dependencies with `npm install` at the repository root.
2. Start the backend with `npm run dev:backend`.
3. Start the frontend with `npm run dev:frontend`.

The local backend uses in-memory storage and local file caching when Azure endpoints are not configured.

## Deploy to Azure

1. Fill in the Azure variables in `backend/.env.example` or your deployment pipeline secrets.
2. Run Terraform from `infra/terraform` to create the platform foundation.
3. Build and deploy the backend container or App Service package.
4. Deploy the frontend to Static Web Apps or App Service.
5. Configure APIM and Entra ID policies in front of the backend.

