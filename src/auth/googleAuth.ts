import {google} from 'googleapis'
import { getEmailResponse } from '../utilis/openAiSetup';
import dotenv from 'dotenv' 

//Using environment variables
dotenv.config();

//Google OAuth Setup
const googleOAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


//Google OAuth2 authentication code flow
async function authenticateWithGoogle() {
    const authUrl = googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
  
    // Once the user visits the URL and gives permission, you will get the authorization code
    return authUrl;
}

//This will use the authorization code and generate the access token and refresh token
async function authorizationWithGoogle(code: string) {
    try{
        // Exchange the code for access and refresh tokens
        const { tokens } = await googleOAuth2Client.getToken(code);
    
        // Set the credentials for future Gmail API calls
        googleOAuth2Client.setCredentials(tokens);
        // Save tokens (this can be done in a DB or session in a real application)
        return tokens;
    
    }catch (error) {
        console.error('Error during OAuth2 callback:', error);
    }
}

//Emails Fetching Part
// Create a Gmail instance with authenticated OAuth client
async function fetchGmailMessages(){
    try {
      const gmail = google.gmail({ version: 'v1', auth: googleOAuth2Client });

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 5 ,
      });
  
      const messages = response.data.messages;
      if (!messages || messages.length === 0) {
        console.log('No messages found.');
        return [];
      }
  
      // Fetch details for each message
      const fullMessages = [];
      for (const message of messages) {
        if (!message.id) continue;
        
        const msgResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });

        const emailBody = msgResponse.data.snippet;
        fullMessages.push({ messageId: message.id, emailBody });
    }
      return fullMessages;
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
    }
}


//Now generating reply, using email
async function composeReply(messageId: string, emailBody: string) {
    try{
      const replyText = await getEmailResponse(emailBody);  // Get reply using Gemini API
      
      const gmail = google.gmail({ version: 'v1', auth: googleOAuth2Client });
  
      const rawMessage = Buffer.from(
        `To: recipient@example.com\nSubject: Re: Automated Response\n\n${replyText}`
      ).toString("base64");
  
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawMessage }
      });
  
      console.log(`Replied to message: ${messageId}`);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
}


export {authenticateWithGoogle,authorizationWithGoogle,fetchGmailMessages,composeReply};