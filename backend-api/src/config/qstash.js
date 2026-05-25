import { Client } from '@upstash/qstash';
import { env } from './env.js';

export const qstash = new Client({
  token: env.QSTASH_TOKEN,
});