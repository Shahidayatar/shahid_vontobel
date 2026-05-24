variable "resource_group_name" {
  type        = string
  description = "Azure resource group name for the base platform"
  default     = "Shahid_vontobel"
}

variable "resource_prefix" {
  type        = string
  description = "Prefix used to build Azure resource names"
  default     = "Shahid"
}

variable "environment" {
  type        = string
  description = "Environment label for tags"
  default     = "base"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "eastus"
}

variable "hosting_location" {
  type        = string
  description = "Azure region used for the backend App Service hosting plan"
  default     = "swedencentral"
}

variable "static_web_app_location" {
  type        = string
  description = "Azure region used for the Static Web App"
  default     = "eastus2"
}

variable "tags" {
  type    = map(string)
  default = {}
}
