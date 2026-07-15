/**
 * Shared utility functions for building Azure Storage endpoint URLs.
 */

/**
 * Returns the Azure Table Storage endpoint URL for the given storage account.
 * @param storageAccount - The Azure Storage account name (not the full URL)
 * @returns The Table Storage endpoint URL, e.g. `https://myaccount.table.core.windows.net`
 */
export function getAzureTableStorageEndpoint(storageAccount: string): string {
	return `https://${storageAccount}.table.core.windows.net`;
}

/**
 * Returns the Azure Blob Storage endpoint URL for the given storage account.
 * @param storageAccount - The Azure Storage account name (not the full URL)
 * @returns The Blob Storage endpoint URL, e.g. `https://myaccount.blob.core.windows.net`
 */
export function getAzureBlobStorageEndpoint(storageAccount: string): string {
	return `https://${storageAccount}.blob.core.windows.net`;
}
