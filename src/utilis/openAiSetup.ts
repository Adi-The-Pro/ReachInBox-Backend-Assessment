import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from 'dotenv'
dotenv.config();

const getEmailResponse = async (content: string) =>{
    if (!process.env.GEMINI_API_KEY) {
      console.log('No API Key Found');
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(`${content} this is the body of the message that my client has sent me, categorize it as interested, not interested or more information
    and send me the response as, 
    if you think the client is interested - * suggest an appropriate response by yourself *
    if you think the client is not interested - * suggest an appropriate response by yourself *
    if you think the client needs more information - * suggest an appropriate response by yourself *
    the response should be of the following format -
    label -> xyz ( interested || not interested || more information)
    response -> * your response *`);
    const ans = result?.response?.text();
    return ans;
}
export {getEmailResponse}