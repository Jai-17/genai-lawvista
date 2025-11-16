/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDown, Eye } from "lucide-react";
import SourceDocument from "./sourceDocument";

const MessageBubble = ({ message }:any) => {
    const isUser = message.sender === 'user';
    const isLLM = message.sender === 'llm';
    const isSystem = message.sender === 'system';
    
    // Check if the message should show the special header (only for LLM and current user query)
    const showHeader = isUser || isLLM; 
    
    // Function to render the user/avatar header
    const renderHeader = () => (
        <div className="flex items-center space-x-2 text-sm font-semibold mb-2">
            <div className={`w-8 h-8 rounded-full ${isLLM ? 'bg-[url(/chatbot.webp)]' : 'bg-[url(/user.png)]'} bg-cover`} />
            <span className="text-gray-700">{isUser ? 'You' : 'Law Vista'}</span>
        </div>
    );

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
            {showHeader && renderHeader()}

            <div className={`max-w-3xl px-10 py-6 my-1 whitespace-pre-wrap text-base rounded-2xl transition duration-150 w-full bg-[#EEF2FD]`}
            >
                {/* Render content */}
                {message.text}

                {/* Render Sources Section for LLM Messages */}
                {isLLM && message.sources && message.sources.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <h4 className="text-gray-600 font-semibold mb-3 flex items-center text-sm">
                            <span className="text-xl mr-2">📚</span> Sources
                        </h4>
                        <div className="space-y-3">
                            {message.sources.map((source: any, index: any) => (
                                <SourceDocument key={source.id} source={source} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;