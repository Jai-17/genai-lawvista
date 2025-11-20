import { Request, Response } from "express";
import { fetchIndianKanoonPDF, searchIndianKanoon } from "./utils/kanoon";
import {
  getMetadataCaseFromVectorDB,
  indexCaseToVectorDB,
} from "./utils/qdrant";
import { generateAnswer, taskLLM } from "./utils/llm";
import * as cheerio from "cheerio";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const chat = async (req: Request, res: Response) => {
  try {
    const query = req.body.query;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const prompt = `You are a legal search query optimizer for the Indian Kanoon Search API.

Given a user's natural-language question, convert it into a short, precise
keyword-based query following these rules:

1. Output ONLY the final search query string. No explanation.
2. Remove filler words (like "please", "tell me", "can you", "about", etc).
3. Include only meaningful legal nouns, actions, entities, and relevant terms.
4. If a multi-word term is important, turn it into a phrase using quotes.
   Examples: "freedom of speech", "domestic violence", "section 498A".
5. Combine related terms using ANDD.
6. Use ORR only if the user's question clearly allows alternatives.
7. Use NOTT only if the user explicitly wants exclusion.
8. Keep the query under 8 terms.
9. Prefer statutory references, IPC/CrPC sections, Act names, crime types,
   victim types, rights, court types, etc.
10. Output must be a single line valid for the Indian Kanoon formInput= parameter.

Example conversions:
- User: "tell me about dowry cases where husband won"
  Output: "dowry harassment ANDD husband acquittal"
  
- User: "cases on land dispute between farmers"
  Output: "land dispute ANDD farmers"

- User: "cases where bail was denied in murder"
  Output: "bail denial ANDD murder"

Now convert the user's query into the optimized Indian Kanoon keywords:

Given query: """${query}"""
    `;
    const searchParams = await taskLLM(prompt);

    console.log("Received query:", query);
    console.log("Optimized search params:", searchParams);
    const searchData = await searchIndianKanoon(searchParams as string);
    const docs = searchData?.docs || [];
    if (docs.length === 0) {
      return res.status(404).json({ error: "No relevant documents found" });
    }

    const primaryCase = docs[0];
    const relevantCases = docs.slice(0, 5);

    const tid = primaryCase.tid;
    console.log("Primary case TID:", tid);
    let pdfText = await getMetadataCaseFromVectorDB(tid);
    console.log(pdfText);
    console.log(
      "Retrieved PDF text from vector DB:",
      pdfText ? "Found" : "Not Found"
    );
    if (!pdfText) {
      pdfText = await fetchIndianKanoonPDF(tid);
      console.log("Extracted text from PDF, length:", pdfText.length);

      await indexCaseToVectorDB(tid, pdfText);
    }

    const answer = await generateAnswer(query, pdfText);

    res
      .status(200)
      .json({ message: "Chat endpoint is working", answer, relevantCases });
  } catch (error) {
    console.error("Error in chat controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const summarizePDF = async (req: Request, res: Response) => {
  try {
    const tid = req.params.id;
    const caseText = await fetchIndianKanoonPDF(tid);
    const prompt = `
    Summarize the following legal case text in a concise manner:
    ${caseText}
    don't start with anything such as "Here is your summary", just provide the summary directly.
    `;
    const summary = await taskLLM(prompt);

    res.status(200).json({ tid, summary });
  } catch (error) {
    console.error("Error in summarizePDF controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const identifyLegalStatutes = async (req: Request, res: Response) => {
  try {
    const tid = req.params.id;
    const caseText = await fetchIndianKanoonPDF(tid);
    const prompt = `
    Identify and list the relevant legal statutes mentioned in the following case text:
    ${caseText}
    Provide only the list of statutes without any additional explanation.
    `;
    const legalStatutes = await taskLLM(prompt);

    res.status(200).json({ tid, legalStatutes });
  } catch (error) {
    console.error("Error in identifyLegalStatutes controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const viewPDF = async (req: Request, res: Response) => {
  try {
    const tid = req.params.id;
    console.log("Viewing PDF for TID:", tid);
    const url = `https://api.indiankanoon.org/origdoc/${tid}/`;
    const { data } = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Token ${process.env.INDIAN_KANOON_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const pdfData = await axios.post(
      `https://api.indiankanoon.org/doc/${tid}/`,
      {},
      {
        headers: {
          Authorization: `Token ${process.env.INDIAN_KANOON_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const caseFileHTML = pdfData.data.doc || "";
    const $ = cheerio.load(caseFileHTML);
    $("script, style").remove();
    const text = $("body").text();
    const caseFileText = text.replace(/[\n\t\r]+/g, "\n").trim();

    const summaryPrompt = `
    Summarize the following legal case text in a concise manner:
    ${caseFileText}
    don't start with anything such as "Here is your summary", just provide the summary directly.
    `;
    const summary = await taskLLM(summaryPrompt);

    const legalStatutesPrompt = `
    Identify and list the relevant legal statutes mentioned in the following case text:
    ${caseFileText}
    Provide only the list of statutes without any additional explanation.
    `;
    const legalStatutes = await taskLLM(legalStatutesPrompt);

    const metadata = {
      title: pdfData.data.title,
      publishedDate: pdfData.data.publishdate,
      numcites: pdfData.data.numcites,
      docType: pdfData.data.docsource,
      tid: pdfData.data.tid,
    };

    res.status(200).json({ data, metadata: metadata, summary, legalStatutes });
  } catch (error) {
    console.error("Error in viewPDF controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
