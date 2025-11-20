"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const ViewCase = () => {
  const { caseId } = useParams();
  const [pdfSrc, setPdfSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<any>();
  const [showSummary, setShowSummary] = useState(false);
  const [showLegalStatutes, setShowLegalStatutes] = useState(false);
  const [contentTypeState, setContentType] = useState("");

  useEffect(() => {
    if (caseId) {
      fetchCasePdf(caseId);
    }
  }, [caseId]);

  const fetchCasePdf = async (caseTid: any) => {
    console.log(`[PDF Viewer] Attempting to fetch case ID: ${caseTid}`);
    setLoading(true);
    try {
      const url = `http://localhost:8000/api/v1/pdf/${caseTid}/view`;
      console.log(`[PDF Viewer] Calling backend endpoint: ${url}`);

      const response = await axios.get(url);
      const data = response.data;
      console.log("HI FROddM ", data);
      console.log(
        `[PDF Viewer] Response received. Keys: ${Object.keys(data).join(", ")}`
      );
      setMetadata(data);
      console.log(data);
      const base64String = data.data.doc;
      const contentType = data.data["Content-Type"];
      console.log(data.data);
      console.log(contentType);
      setContentType(contentType);
      if (
        base64String &&
        typeof base64String === "string" &&
        base64String.length > 100
      ) {
        console.log(
          `[PDF Viewer] Data found. Base64 string length: ${base64String.length}`
        );
        if (contentType === "application/pdf") {
          const uri = `data:application/pdf;base64,${base64String}`;
          setPdfSrc(uri);
        } else if (contentType === "text/html") {
          const decodedHtml = atob(base64String);
          setPdfSrc(decodedHtml);
        }
        console.log("[PDF Viewer] Successfully set PDF Data URI.");
      } else {
        console.error(
          "[PDF Viewer] ERROR: Invalid or empty Base64 PDF data received."
        );
        console.log("[PDF Viewer] Data received (if any):", data);
        setPdfSrc("error");
      }
    } catch (error) {
      console.error("[PDF Viewer] FATAL Error fetching PDF data:", error);
      setPdfSrc("error");
    } finally {
      setLoading(false);
      console.log("[PDF Viewer] Fetch process finished.");
    }
  };

  async function callSummary() {
    setShowSummary(!showSummary);
  }

  async function callLegalStatutes() {
    setShowLegalStatutes(!showLegalStatutes);
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <div className="w-full max-w-4xl mx-auto flex flex-col">
        {/* Header/Title Area */}
        <div className="mt-10 flex flex-col items-center w-full">
          <h2 className="text-xl text-gray-700">
            {metadata?.metadata.doctype}
          </h2>
          <h1 className="text-2xl font-extrabold text-center my-2 text-gray-900">
            {metadata?.metadata.title}
          </h1>
          <div className="flex gap-4 text-gray-500 text-sm mt-1">
            <p>Cites {metadata?.metadata.numcites}</p>
            <p>|</p>
            <p>Published on {metadata?.metadata.publishdate}</p>
            <p>|</p>
            <p>TID: {metadata?.metadata.tid}</p>
          </div>
        </div>

        <div className="mt-7 flex gap-5 justify-center mb-6">
          <Button
            className="bg-[#8AA6FA] hover:bg-[#6e8ce8] shadow-md"
            onClick={callSummary}
          >
            Summarize
          </Button>
          <Button
            className="bg-[#8AA6FA] hover:bg-[#6e8ce8] shadow-md"
            onClick={callLegalStatutes}
          >
            Identify Legal Statutes
          </Button>
        </div>

        {showSummary && (
          <div className="bg-[#EEF2FD] py-10 px-7 mb-10">
            <p className="leading-7">{metadata.summary}</p>
          </div>
        )}

        {showLegalStatutes && (
          <div className="bg-[#EEF2FD] py-10 px-7 mb-10">
            <p className="leading-7">{metadata.legalStatutes}</p>
          </div>
        )}

        <div className="flex-1 rounded-xl shadow-2xl border border-gray-300 bg-white min-h-[70vh]">
          {loading && (
            <div className="flex items-center justify-center h-full text-lg text-gray-500">
              <Loader className="w-6 h-6 mr-2 animate-spin" /> Loading PDF...
            </div>
          )}
          {pdfSrc === "error" && !loading && (
            <div className="flex items-center justify-center h-full text-xl text-red-600 p-8 text-center">
              Error: Could not load PDF data. Please check network and backend
              response.
            </div>
          )}
          {pdfSrc && pdfSrc !== "error" && (
            <>
              {contentTypeState === "application/pdf" && (
                <iframe
                  src={pdfSrc}
                  title={`Case ${caseId} PDF`}
                  className="w-full h-screen rounded-xl"
                  style={{ border: "none" }}
                >
                  Your browser does not support inline PDFs.
                </iframe>
              )}

              {contentTypeState === "text/html" && (
                <iframe
                  srcDoc={pdfSrc}
                  title={`Case ${caseId} HTML`}
                  className="w-full h-screen rounded-xl border-none"
                  style={{ border: "none" }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCase;
