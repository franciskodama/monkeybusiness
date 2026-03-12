import { Storage } from '@google-cloud/storage';
import * as path from 'path';

// Credentials will be loaded from environment variables
const gcsConfig = {
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
};

const storage = new Storage(gcsConfig.projectId ? gcsConfig : {});
const bucketName = process.env.GCS_BUCKET_NAME || '';

export async function uploadToGCS(filePath: string, destFileName: string) {
  if (!bucketName) {
    console.log('⚠️ GCS_BUCKET_NAME not set. Skipping cloud upload.');
    return;
  }

  try {
    console.log(`☁️ Uploading ${destFileName} to Google Cloud Storage...`);
    await storage.bucket(bucketName).upload(filePath, {
      destination: destFileName,
      metadata: {
        contentType: 'application/octet-stream',
      },
    });
    console.log(`✅ Successfully uploaded to GCS bucket: ${bucketName}`);
  } catch (error) {
    console.error('❌ GCS Upload failed:', error);
    throw error;
  }
}
