import { qstash } from '../config/queue.js';
import { env } from '../config/env.js';

export const publishPhotoJob = async ({ photoId, r2Key, eventId }) => {
  await qstash.publishJSON({
    url: `${env.QSTASH_WORKER_URL}/process-photo`,  // your Python worker endpoint
    body: {
      photo_id: photoId,
      r2_key: r2Key,
      event_id: eventId,
    },
    retries: 3,          // QStash retries if worker fails
    delay: 0,
  });
};