import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config({quiet: true});

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function generateAnswer(query: string, pdfText: string) {
  const prompt = `
    User Query: ${query}

    Case Summary Text:
    ${pdfText}

   
    Start your answer addressing the user's query and give a generic response without consulting the case summary first. Keep it 2-3 lines.

    Then, analyze the case summary text provided above and identify relevant sections that pertain to the user's query. Extract key points, legal principles, and any precedents mentioned in the case summary that directly relate to the query.
     Write a helpful, fact-based legal answer using the case above. Instead of saying "According to the provided text", start simply by saying "According to a case I know of" or "In a legal case". Use a professional and formal tone suitable for legal discussions.
     End the answer by saying "Here are some relevant case files you can refer to."
    `;

    const response = await llm.invoke(prompt);
    return response.content;
}

export async function taskLLM(prompt: string) {
    const response = await llm.invoke(prompt);
    return response.content;
}