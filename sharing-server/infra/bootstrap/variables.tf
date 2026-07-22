variable "resource_group_name" {
  description = "Existing Azure resource group to create the Terraform state storage account in"
  type        = string
}

variable "container_name" {
  description = "Blob container name used to store the main Terraform state file"
  type        = string
  default     = "tfstate"
}
