"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Eye } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const SourceDocument = ({ source }: {source: any}) => {
    const router = useRouter();
    async function handleViewCase() {
        const tid = source.title.split(" ")[1];
        router.push(`/view/${tid}`)
    }
    
    return (
    <div className="flex justify-between items-center bg-[#DBE4FF] p-4 rounded-xl">
        <div>
            <h5 className="font-medium text-sm">{source.title}</h5>
            <p className="text-xs text-gray-500 mt-0.5">{source.citation}</p>
        </div>
        <Button
            onClick={handleViewCase}
            className="flex items-center text-sm bg-[#8AA6FA] cursor-pointer hover:bg-[#8AA6FA70] text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-sm"
        >
            <Eye className="w-4 h-4 mr-2" /> View Document
        </Button>
    </div>
)};

export default SourceDocument;