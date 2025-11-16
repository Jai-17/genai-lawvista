import {PDFParse} from 'pdf-parse';

export async function extractPDFText(buffer: Buffer) {
    const data = new PDFParse(buffer);
    const parsed = await data.getText();
    return parsed.text;
}

export function chunkText(text: string, size = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size)
    chunks.push(text.slice(i, i + size));
  return chunks;
}