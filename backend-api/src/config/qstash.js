import { Client } from '@upstash/qstash';
import 'dotenv/config';

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});