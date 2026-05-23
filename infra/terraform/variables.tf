variable "name_prefix" {
  type        = string
  description = "Short name prefix for all Azure resources"
  default     = "aifoundry"
}

variable "environment" {
  type        = string
  description = "Environment name"
  default     = "dev"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "eastus"
}

variable "tags" {
  type        = map(string)
  default     = {}
}

variable "existing_resource_group" {
  type        = string
  description = "Optional: use an existing resource group name instead of creating a new one"
  default     = ""
}
