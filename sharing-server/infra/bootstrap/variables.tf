variable "resource_group_name" {
  description = "Azure resource group to create (or reuse, if it already exists and is imported first) for this environment's resources"
  type        = string
}

variable "location" {
  description = "Azure region to create the resource group in (e.g. francecentral). All resources deployed by the main sharing-server config derive their region from this resource group's location, so this is the single place a region migration starts from."
  type        = string
}

variable "container_name" {
  description = "Blob container name used to store the main Terraform state file"
  type        = string
  default     = "tfstate"
}
