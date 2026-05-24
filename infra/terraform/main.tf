locals {
  base_prefix = join("", regexall(lower(var.resource_prefix), "[a-z0-9]"))
  prefix      = local.base_prefix == "" ? "shahid" : local.base_prefix

  common_tags = merge(var.tags, {
    project     = "AI Foundry as a Service"
    owner       = "Shahid"
    environment = var.environment
    managedBy   = "terraform"
  })
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "base" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_log_analytics_workspace" "base" {
  name                = "${local.prefix}-law"
  location            = var.location
  resource_group_name = azurerm_resource_group.base.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

resource "azurerm_application_insights" "base" {
  name                = "${local.prefix}-appi"
  location            = var.location
  resource_group_name = azurerm_resource_group.base.name
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.base.id
  tags                = local.common_tags
}

resource "azurerm_storage_account" "base" {
  name                            = "shahidstgacct01"
  location                        = var.location
  resource_group_name             = azurerm_resource_group.base.name
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  tags                            = local.common_tags
}

resource "azurerm_key_vault" "base" {
  name                       = substr("${local.prefix}-kv", 0, 24)
  location                   = var.location
  resource_group_name        = azurerm_resource_group.base.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  rbac_authorization_enabled = true
  tags                       = local.common_tags
}

resource "azurerm_cognitive_account" "openai" {
  name                = "${local.prefix}-openai"
  location            = var.location
  resource_group_name = azurerm_resource_group.base.name
  kind                = "OpenAI"
  sku_name            = "S0"
  local_auth_enabled  = false
  tags                = local.common_tags
}

resource "azurerm_search_service" "base" {
  name                         = "${local.prefix}-search"
  location                     = var.location
  resource_group_name          = azurerm_resource_group.base.name
  sku                          = "standard"
  replica_count                = 1
  partition_count              = 1
  local_authentication_enabled = false
  tags                         = local.common_tags
}

resource "azurerm_user_assigned_identity" "base" {
  name                = "${local.prefix}-identity"
  location            = var.location
  resource_group_name = azurerm_resource_group.base.name
  tags                = local.common_tags
}
