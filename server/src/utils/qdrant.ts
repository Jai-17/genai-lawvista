import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";
import { QdrantClient } from "@qdrant/js-client-rest";
import { chunkText } from "./pdf";
import { text } from "body-parser";
dotenv.config({quiet: true});

export const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: 'gemini-embedding-001',
})

export const qdrantVectorStore = new QdrantVectorStore(embeddings, {
  url: 'http://localhost:6333',
  collectionName: "lawvista_collection",
});

const QDRANT_URL = 'http://localhost:6333';
const COLLECTION_NAME = "lawvista_collection";

const qdrantClient = new QdrantClient({ url: QDRANT_URL });

export async function indexCaseToVectorDB(tid: number, pdfText: string, chunkSize = 1000) {
    
    const textChunks = chunkText(pdfText, chunkSize);
    
    console.log(textChunks.length, "chunks created for tid:", tid);
    const documents: Document[] = textChunks.map(chunk => 
        new Document({
            pageContent: chunk,
            metadata: { tid },
        })
    );
    console.log("Indexing documents to Qdrant vector DB...");
    await qdrantVectorStore.addDocuments(documents); 

    console.log(`Successfully indexed ${documents.length} chunks for tid: ${tid}`);
}

export async function getCaseFromVectorDB(tid: number) {
  const filter = {
    must: [
      {
        key: "metadata.tid",
        match: { value: tid },
      },
    ],
  };

  const results = await qdrantVectorStore.similaritySearch(
    "",
    100,
    filter
  );

  if (!results || results.length === 0) {
    return null;
  }

  return results.map((doc) => doc.pageContent).join("\n\n");
}

export async function getMetadataCaseFromVectorDB(tid: number) {
    const filter = {
        must: [
            {
                key: "metadata.tid",
                match: { value: tid },
            },
        ],
    };

    try {
        const response = await qdrantClient.scroll(
            COLLECTION_NAME,
            {
                filter: filter,
                limit: 10,     
                with_payload: true, 
                with_vector: false,
            }
        );

        const docs = response.points
        
        if (!docs || docs.length === 0) {
            console.log(`Case with tid ${tid} not found.`);
            return null;
        }

        console.log(`Retrieved ${docs.length} documents for tid: ${tid}`);
        return docs.map((point: any) => point.payload.content).join("\n\n");
        
    } catch (error) {
        console.error("Qdrant Metadata Retrieval Error:", error);
        return null;
    }
}