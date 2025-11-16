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

    Write a helpful, fact-based legal answer using the case above.
    `;

    const response = await llm.invoke(prompt);
    return response.content;
}

export async function taskLLM(prompt: string) {
    const response = await llm.invoke(prompt);
    return response.content;
}