import axios from "axios";
import * as cheerio from 'cheerio';

export async function searchIndianKanoon(query: string) {
  const url = `https://api.indiankanoon.org/search/?formInput=${encodeURIComponent(
    query
  )}`;
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
  console.log("Search results from Indian Kanoon:", data);
  return data;
}

export async function fetchIndianKanoonPDF(tid: string) {
  const url = `https://api.indiankanoon.org/doc/${tid}/`;
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

  const html = data?.doc;
    if (!html) throw new Error("No document returned from API");

    const $ = cheerio.load(html);
    
    $('script, style').remove();
    
    const text = $('body').text();
    
    const cleanedText = text.replace(/[\n\t\r]+/g, '\n').trim();
    
    return cleanedText;
}
