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
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }

  # All backend values are supplied via -backend-config flags in CI.
  # See .github/workflows/sharing-server-deploy.yml for the full init command.
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
  # Authentication is via GitHub Actions OIDC federated credentials using ARM_*
  # environment variables set by the workflow (ARM_CLIENT_ID, ARM_TENANT_ID,
  # ARM_SUBSCRIPTION_ID, ARM_USE_OIDC=true). No client secret is stored.
  # The SP has Contributor on the RG only, not subscription-level permissions,
  # so we disable automatic resource provider registration.
  use_oidc                        = true
  resource_provider_registrations = "none"
}
