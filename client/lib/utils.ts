/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TYPING_SPEED_MS = 5;

export function simulateTypingEffect(finalAnswerText:any, finalMetadata:any, setMessages:any, newMessageIndex:any) {
    let i = 0;
    const interval = setInterval(() => {
        if (i < finalAnswerText.length) {
            const nextChar = finalAnswerText.charAt(i);
            
            setMessages((m: any) => m.map((msg:any, index:any) => {
                if (index === newMessageIndex) {
                    return { ...msg, text: msg.text + nextChar };
                }
                return msg;
            }));
            i++;
        } else {
            clearInterval(interval);
            
            // Final update after typing is complete: apply the sources/metadata
            setMessages((m: any) => m.map((msg:any, index:any) => {
                if (index === newMessageIndex) {
                    return { 
                        ...msg,
                        tid: finalMetadata.primaryTid,
                        // Map the relevantCases array from the JSON into the sources format
                        sources: finalMetadata.relevantCases.map((c:any) => ({ 
                            id: c.tid, 
                            title: c.doc || `Document ${c.tid}`, 
                            citation: c.citation || 'Kanoon Search Result', 
                            tid: c.tid 
                        }))
                    };
                }
                return msg;
            }));
        }
    }, TYPING_SPEED_MS);
}