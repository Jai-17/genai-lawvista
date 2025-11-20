"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import MessageBubble from "@/components/messageBubble";
import { simulateTypingEffect } from "@/lib/utils";
import axios from "axios";
import { Loader, Send } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userQuery = input.trim();
    if (!userQuery) return;

    setInput("");
    setMessages((m: any) => [...m, { sender: "user", text: userQuery }]);
    setLoading(true);

    const newLLMMessageIndex = messages.length + 1;

    const newLLMMessage = { sender: "llm", text: "", sources: null, tid: null };
    setMessages((m: any) => [...m, newLLMMessage]);

    try {
      const response = await axios.post("http://localhost:8000/api/v1/chat", { query: userQuery });
      const data = response.data;

      if (data.error) {
        throw new Error(data.error);
      }

      const finalMetadata = {
        primaryTid: data.relevantCases[0]?.tid,
        relevantCases: data.relevantCases,
      };

      simulateTypingEffect(
        data.answer,
        finalMetadata,
        setMessages,
        newLLMMessageIndex
      );
    } catch (error: any) {
      console.error("Chat Process Error:", error);
      setMessages((m: any) => [
        ...m,
        {
          sender: "system",
          text: `**Error:** Could not process request. Please check server status.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col mx-52">

            {(messages.length === 0) && (<div className="pt-40 text-center">
              <h1 className="text-4xl font-bold text-[#4070FF]">Hello there!</h1>
              <h2 className="text-3xl text-[#8AA6FA]">How can i help you today?</h2>
            </div>)}

      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg}
          />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start items-center p-4">
            <div className="bg-gray-200 text-gray-700 p-3 rounded-xl rounded-tl-lg shadow-sm flex items-center text-sm">
              <Loader className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
            </div>
          </div>
        )}
      </div>
      
      <div className="sticky bottom-0 mb-10">
        <form onSubmit={handleSubmit} className="flex space-x-3 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your query..."
            className="flex-1 p-4 bg-[#E0E6F9] rounded-md text-gray-800"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-3 cursor-pointer bg-[#0E1A45] text-white font-bold rounded-xl shadow-lg hover:bg-[#0E1A4580] disabled:bg-[#0E1A4530] transition duration-150 flex items-center"
            disabled={loading}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
