output "resource_group_name" {
  value = local.effective_rg_name
}

output "backend_url" {
  value = azurerm_linux_web_app.backend.default_hostname
}

output "frontend_url" {
  value = azurerm_static_web_app.frontend.default_host_name
}

output "openai_account_name" {
  value = azurerm_cognitive_account.openai.name
}
