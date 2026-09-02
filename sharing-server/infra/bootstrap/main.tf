terraform {
  required_version = ">= 1.9"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Deliberately no remote backend here. This config creates the storage account
  # that the main sharing-server/infra config uses as ITS backend, so it can't
  # depend on that backend without a circular bootstrap problem. State is local
  # to the CI run and discarded afterward — this is a run-once-per-environment
  # bootstrap, not something reconciled on every deploy. If you ever need to
  # change these resources again, re-run with `terraform import` first.
}

provider "azurerm" {
  features {}
  use_oidc                        = true
  resource_provider_registrations = "none"
}

# The GitHub Actions service principal only has Contributor scoped to this
# resource group (RBAC can only be granted once the RG exists), so it can
# never create the resource group itself — that requires subscription-level
# permission this SP intentionally does not have. The resource group must be
# created manually (by someone with broader access) in the target region,
# with the SP's Contributor role assignment (re-)created on it, BEFORE this
# bootstrap runs. See the sharing-server-bootstrap.yml workflow comments for
# the exact steps.
#
# This is a data source (not a managed resource) for that reason. `var.location`
# is only used to validate the RG actually is where you think it is — a
# postcondition fails loudly on mismatch instead of silently bootstrapping the
# wrong region.
data "azurerm_resource_group" "this" {
  name = var.resource_group_name

  lifecycle {
    postcondition {
      condition     = self.location == var.location
      error_message = "Resource group '${var.resource_group_name}' is in '${self.location}', not the expected '${var.location}'. Create/move the resource group to the expected region first (see sharing-server-bootstrap.yml)."
    }
  }
}

# Storage account names must be globally unique, 3-24 chars, lowercase alphanumeric only.
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
  keepers = {
    resource_group_name = var.resource_group_name
  }
}

resource "azurerm_storage_account" "tfstate" {
  name                     = "sharingtfstate${random_string.suffix.result}"
  resource_group_name      = data.azurerm_resource_group.this.name
  location                 = data.azurerm_resource_group.this.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = true # protects Terraform state from accidental overwrite/corruption
  }
}

resource "azurerm_storage_container" "tfstate" {
  name                  = var.container_name
  storage_account_id    = azurerm_storage_account.tfstate.id
  container_access_type = "private"
}
