const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!AZURE_STORAGE_CONNECTION_STRING || !AZURE_STORAGE_CONTAINER_NAME) {
  throw new Error('Azure Blob Storage environment variables are not set');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);

async function uploadToAzureBlob(file) {
  const blobName = Date.now() + '-' + file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype }
  });
  return blockBlobClient.url;
}

async function deleteFromAzureBlob(blobUrl) {
  if (!blobUrl) return;
  // Extract blob name from URL
  const urlParts = blobUrl.split('/');
  const blobName = urlParts[urlParts.length - 1];
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}

module.exports = { uploadToAzureBlob, deleteFromAzureBlob };
