output "resource_group_name" {
  value       = azurerm_resource_group.base.name
  description = "Base resource group name"
}

output "resource_group_location" {
  value       = azurerm_resource_group.base.location
  description = "Base resource group location"
}

output "storage_account_name" {
  value       = azurerm_storage_account.base.name
  description = "Storage account name used for document storage"
}

output "key_vault_name" {
  value       = azurerm_key_vault.base.name
  description = "Key Vault name"
}

output "key_vault_uri" {
  value       = azurerm_key_vault.base.vault_uri
  description = "Key Vault URI"
}

output "openai_account_name" {
  value       = azurerm_cognitive_account.openai.name
  description = "Azure OpenAI account name"
}

output "search_service_name" {
  value       = azurerm_search_service.base.name
  description = "Azure AI Search service name"
}

output "application_insights_connection_string" {
  value       = azurerm_application_insights.base.connection_string
  description = "Application Insights connection string"
  sensitive   = true
}

output "user_assigned_identity_id" {
  value       = azurerm_user_assigned_identity.base.id
  description = "User assigned identity ID"
}

output "backend_app_service_name" {
  value       = azurerm_linux_web_app.backend.name
  description = "Backend App Service name"
}

output "backend_app_service_default_hostname" {
  value       = azurerm_linux_web_app.backend.default_hostname
  description = "Backend App Service default hostname"
}

output "backend_app_service_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
  description = "Backend App Service URL"
}

output "frontend_static_web_app_name" {
  value       = azurerm_static_web_app.frontend.name
  description = "Frontend Static Web App name"
}

output "frontend_static_web_app_default_hostname" {
  value       = azurerm_static_web_app.frontend.default_host_name
  description = "Frontend Static Web App default hostname"
}