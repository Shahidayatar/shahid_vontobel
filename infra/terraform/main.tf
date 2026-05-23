locals {
  resource_group_name = "rg-${var.name_prefix}-${var.environment}"
  # derive a DNS/storage-safe suffix by keeping only lowercase alphanumerics
  _combined = lower("${var.name_prefix}${var.environment}")
  _cleaned = join("", regexall(local._combined, "[a-z0-9]"))
  # ensure suffix is non-empty and starts with a letter (required by some services)
  _starts_with_letter = length(regexall(local._combined, "^[a-z]")) > 0
  suffix_raw = local._cleaned
  suffix_pfx = local._starts_with_letter ? local.suffix_raw : "a${local.suffix_raw}"
  suffix = substr(local.suffix_pfx == "" ? "plat" : local.suffix_pfx, 0, 18)
  storage_account_name = substr("st${local.suffix}plat", 0, 24)
  common_tags = merge(var.tags, {
    project     = "AI Foundry as a Service"
    environment = var.environment
  })
}

# Allow deploying into an existing resource group when provided
data "azurerm_resource_group" "existing" {
  count = var.existing_resource_group != "" ? 1 : 0
  name  = var.existing_resource_group
}

locals {
  effective_rg_name = var.existing_resource_group != "" ? var.existing_resource_group : local.resource_group_name
  rg_location       = var.existing_resource_group != "" ? data.azurerm_resource_group.existing[0].location : var.location
  rg_id             = var.existing_resource_group != "" ? data.azurerm_resource_group.existing[0].id : azurerm_resource_group.platform[0].id
}

resource "azurerm_resource_group" "platform" {
  count    = var.existing_resource_group == "" ? 1 : 0
  name     = local.resource_group_name
  location = var.location
  tags     = local.common_tags
}

resource "azurerm_log_analytics_workspace" "platform" {
  name                = "law-${local.suffix}"
  location            = local.rg_location
  resource_group_name  = local.effective_rg_name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

resource "azurerm_application_insights" "platform" {
  name                = "appi-${local.suffix}"
  location            = local.rg_location
  resource_group_name  = local.effective_rg_name
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.platform.id
  tags                = local.common_tags
}

resource "azurerm_storage_account" "platform" {
  name                     = local.storage_account_name
  resource_group_name      = local.effective_rg_name
  location                 = local.rg_location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
  tags                     = local.common_tags
}

resource "azurerm_key_vault" "platform" {
  name                        = "kv-${local.suffix}"
  location                    = local.rg_location
  resource_group_name         = local.effective_rg_name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  soft_delete_retention_days   = 7
  purge_protection_enabled     = false
  enable_rbac_authorization    = true
  tags                        = local.common_tags
}

resource "azurerm_cognitive_account" "openai" {
  name                = "aoai-${local.suffix}"
  location            = local.rg_location
  resource_group_name = local.effective_rg_name
  kind                = "OpenAI"
  sku_name            = "S0"
  local_auth_enabled  = false
  tags                = local.common_tags
}

resource "azurerm_cognitive_deployment" "chat_model" {
  name                 = "gpt4o"
  cognitive_account_id = azurerm_cognitive_account.openai.id
  model {
    format  = "OpenAI"
    name    = "gpt-4o"
    version = "2024-08-06"
  }
  sku {
    name     = "Standard"
    capacity = 20
  }
}

resource "azurerm_cognitive_deployment" "embedding_model" {
  name                 = "text-embedding-3-small"
  cognitive_account_id = azurerm_cognitive_account.openai.id
  model {
    format  = "OpenAI"
    name    = "text-embedding-3-small"
    version = "1"
  }
  sku {
    name     = "Standard"
    capacity = 20
  }
}

resource "azurerm_search_service" "platform" {
  name                = "srch-${local.suffix}"
  location            = local.rg_location
  resource_group_name = local.effective_rg_name
  sku                 = "standard"
  local_authentication_enabled = false
  replica_count       = 1
  partition_count     = 1
  tags                = local.common_tags
}

resource "azurerm_service_plan" "backend" {
  name                = "asp-${local.suffix}"
  location            = local.rg_location
  resource_group_name = local.effective_rg_name
  os_type             = "Linux"
  sku_name            = "P0v3"
}

resource "azurerm_linux_web_app" "backend" {
  name                = "app-${local.suffix}-api"
  location            = local.rg_location
  resource_group_name = local.effective_rg_name
  service_plan_id     = azurerm_service_plan.backend.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true
    application_stack {
      node_version = "22-lts"
    }
  }

  app_settings = {
    WEBSITES_PORT                    = "8080"
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.platform.connection_string
  }
}

resource "azurerm_role_assignment" "backend_storage" {
  scope                = azurerm_storage_account.platform.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id
}

resource "azurerm_role_assignment" "backend_key_vault" {
  scope                = azurerm_key_vault.platform.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id
}

resource "azurerm_role_assignment" "backend_search" {
  scope                = azurerm_search_service.platform.id
  role_definition_name = "Search Index Data Contributor"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id
}

resource "azurerm_role_assignment" "backend_openai" {
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id
}

resource "azurerm_static_web_app" "frontend" {
  name                = "swa-${local.suffix}"
  resource_group_name = local.effective_rg_name
  location            = local.rg_location
  sku_tier            = "Standard"
  sku_size            = "Standard"
  tags                = local.common_tags
}

resource "azurerm_api_management" "gateway" {
  name                = "apim-${local.suffix}"
  location            = local.rg_location
  resource_group_name = local.effective_rg_name
  publisher_name      = "Platform Team"
  publisher_email     = "platform@example.com"
  sku_name            = "Developer_1"
  tags                = local.common_tags
}

data "azurerm_client_config" "current" {}
