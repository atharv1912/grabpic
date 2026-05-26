import { qstash } from '../config/qstash.js';
import 'dotenv/config';

export const publishPhotoJob = async ({ photoId, r2Key, eventId }) => {
  const workerUrl = `${process.env.QSTASH_WORKER_URL}/process-photo`;
  console.log('Publishing photo job with URL:', workerUrl);
  
  if (!process.env.QSTASH_WORKER_URL) {
    throw new Error('QSTASH_WORKER_URL environment variable is not set');
  }
  
  await qstash.publishJSON({
    url: workerUrl,
    body: {
      photo_id: photoId,
      r2_key: r2Key,
      event_id: eventId,
    },
    retries: 3,          // QStash retries if worker fails
    delay: 0,
  });
};