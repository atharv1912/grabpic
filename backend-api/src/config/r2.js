import { S3Client } from '@aws-sdk/client-s3';

import  env from 'dotenv' ;
env.config();

export const r2 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,       // https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY,
    secretAccessKey: env.R2_SECRET_KEY,
  },
});