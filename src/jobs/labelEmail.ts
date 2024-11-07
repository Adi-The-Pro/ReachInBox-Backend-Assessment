import { google } from 'googleapis';
import { oauth2Client } from '../auth/gmailAuth';

export async function labelEmail(messageId: string, labelIds: string[]) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: labelIds, // Add labels to the email
          },
      });

    console.log(Message ${messageId} labeled successfully.);
  } catch (error) {
    console.error(Error labeling message ${messageId}:, error);
  }
}

export async function labelEmails(messages: any[]) {
  const labelIds = ['IMPORTANT']; // Example: change to desired labels
  
  for (const message of messages) {
    if (message.id) {
      await labelEmail(message.id, labelIds);
    }
  }
}