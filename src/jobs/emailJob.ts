import { Queue, Worker } from 'bullmq';
import { fetchGmailMessages} from '../auth/googleAuth';
import { getEmailResponse } from '../utilis/openAiSetup';

const emailQueue = new Queue('email-queue', {
  connection: { host: 'localhost', port: 6379 }
});

// Schedule readEmails to run every 5 minutes
export async function scheduleEmailCheck() {
  await emailQueue.add('check-email', {readEmails}, { repeat: { every: 180000 } })
}

// Define the readEmails function with BullMQ integration
export async function readEmails() {
  const messages = await fetchGmailMessages();
  if (!messages || messages.length === 0) {
    console.log('No unread messages found.');
    return;
  }

  // await labelEmails(messages);

  for (const msg of messages) {
    if (!msg.messageId || !msg.emailBody){
      continue;
    }
    console.log('Processing message with ID:', msg.messageId);
    console.log('Message body:', msg.emailBody);

    try {
      const response = await getEmailResponse(msg.emailBody);
      console.log('Generated response:', response);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }
}

// Create a BullMQ Worker to process the "check-email" job
const emailWorker = new Worker(
  'email-queue',
  async () => {
    await readEmails();
  },
  {
    connection: { host: 'localhost', port: 6379 },
  }
);

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed.`);
});

emailWorker.on('failed', (job, err) => {
  if (job) {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  } else {
    console.error(`Job failed with error: ${err.message}`);
  }
});