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

# Terraform manages the resource group itself so the target Azure region is
# set in exactly one place: this bootstrap config. The main sharing-server
# config (../main.tf) reads the region back via a data source on this same
# resource group, so migrating regions is just: delete this resource group
# (and everything in it) in Azure, change `location` below, re-run this
# bootstrap, then re-run the main deploy — no other config needs to change.
resource "azurerm_resource_group" "this" {
  name     = var.resource_group_name
  location = var.location
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
  resource_group_name      = azurerm_resource_group.this.name
  location                 = azurerm_resource_group.this.location
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
