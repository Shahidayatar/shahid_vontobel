locals {
  backend_app_service_name = "shahid-vontobel-api"
  backend_plan_name        = "shahid-vontobel-plan"
  frontend_swa_name        = "shahid-vontobel-swa"
}

resource "azurerm_service_plan" "backend" {
  name                = local.backend_plan_name
  location            = var.hosting_location
  resource_group_name = azurerm_resource_group.base.name
  os_type             = "Linux"
  sku_name            = "B1"
  tags                = local.common_tags
}

resource "azurerm_linux_web_app" "backend" {
  name                                           = local.backend_app_service_name
  location                                       = var.hosting_location
  resource_group_name                            = azurerm_resource_group.base.name
  service_plan_id                                = azurerm_service_plan.backend.id
  https_only                                     = true
  ftp_publish_basic_authentication_enabled       = false
  webdeploy_publish_basic_authentication_enabled = false
  tags                                           = local.common_tags

  lifecycle {
    ignore_changes = [tags]
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.base.id]
  }

  site_config {
    always_on        = true
    app_command_line = "npm start"

    application_stack {
      node_version = "22-lts"
    }
  }

  app_settings = {
    PORT                                  = "8080"
    WEBSITES_PORT                         = "8080"
    WEBSITE_RUN_FROM_PACKAGE              = "1"
    SCM_DO_BUILD_DURING_DEPLOYMENT        = "true"
    NODE_ENV                              = "production"
    AUTH_DISABLED                         = "true"
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.base.connection_string
    AZURE_OPENAI_SUBSCRIPTION_ID          = data.azurerm_client_config.current.subscription_id
    AZURE_OPENAI_RESOURCE_GROUP_NAME      = azurerm_resource_group.base.name
    AZURE_OPENAI_ACCOUNT_NAME             = azurerm_cognitive_account.openai.name
    AZURE_OPENAI_LOCATION                 = var.location
    AZURE_CLIENT_ID                       = azurerm_user_assigned_identity.base.client_id
    AZURE_SEARCH_ENDPOINT                 = "https://${azurerm_search_service.base.name}.search.windows.net"
    AZURE_BLOB_SERVICE_URL                = "https://${azurerm_storage_account.base.name}.blob.core.windows.net"
    AZURE_KEY_VAULT_URL                   = azurerm_key_vault.base.vault_uri
    AZURE_OPENAI_ENDPOINT                 = azurerm_cognitive_account.openai.endpoint
    AZURE_OPENAI_CHAT_DEPLOYMENT          = "gpt4o"
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT     = "text-embedding-3-small"
    AZURE_USE_MANAGED_IDENTITY            = "true"
  }
}

resource "azurerm_role_assignment" "backend_storage" {
  scope                = azurerm_storage_account.base.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.base.principal_id
}

resource "azurerm_role_assignment" "backend_key_vault" {
  scope                = azurerm_key_vault.base.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = azurerm_user_assigned_identity.base.principal_id
}

resource "azurerm_role_assignment" "backend_search" {
  scope                = azurerm_search_service.base.id
  role_definition_name = "Search Index Data Contributor"
  principal_id         = azurerm_user_assigned_identity.base.principal_id
}

resource "azurerm_role_assignment" "backend_openai" {
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI Contributor"
  principal_id         = azurerm_user_assigned_identity.base.principal_id
}

resource "azurerm_static_web_app" "frontend" {
  name                = local.frontend_swa_name
  resource_group_name = azurerm_resource_group.base.name
  location            = var.static_web_app_location
  sku_tier            = "Standard"
  sku_size            = "Standard"
  tags                = local.common_tags
}