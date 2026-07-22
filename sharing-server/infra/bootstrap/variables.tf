variable "resource_group_name" {
  description = "Existing Azure resource group for this environment's resources. Must be created manually (outside Terraform) with the GitHub Actions service principal's Contributor role assigned on it — this SP intentionally has no subscription-level permission to create resource groups itself."
  type        = string
}

variable "location" {
  description = "Expected Azure region of the resource group (e.g. francecentral). Only used to validate the resource group is actually where you think it is — bootstrap fails loudly on mismatch rather than silently deploying to the wrong region. All resources deployed by the main sharing-server config derive their actual region from the resource group itself, so a region migration means: manually create/move the resource group to the new region and RBAC-assign the SP there first, then update this value to match."
  type        = string
}

variable "container_name" {
  description = "Blob container name used to store the main Terraform state file"
  type        = string
  default     = "tfstate"
}
