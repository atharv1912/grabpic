import { Client } from '@upstash/qstash'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN
})

/**
 * Pushes a job to QStash which will POST it to your Python worker
 * @param {object} payload - the job data your worker expects
 * @returns {string} messageId - use this to track the job
 */
export async function pushJob(payload) {
  const response = await qstash.publishJSON({
    url: process.env.WORKER_URL,     // QStash will POST here
    body: payload,                    // becomes req.body in your worker
    retries: 3,                       // retry 3 times if worker returns non-2xx
    delay: 0                          // process immediately
  })

  return response.messageId          // return so the route can give it to the user
}   