"use client";
import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { createNewDocument } from "@/actions/actions";
import { FilePlus } from "lucide-react";

const NewDocument = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const { docId } = await createNewDocument();
      router.push(`/doc/${docId}`);
    });
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={handleCreateNewDocument}
        disabled={isPending}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                   text-white px-6 py-3 rounded-lg shadow-md transition-all 
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <span className="animate-pulse">Creating...</span>
          </>
        ) : (
          <>
            <FilePlus className="w-5 h-5" /> New Document
          </>
        )}
      </Button>
    </div>
  );
};

export default NewDocument;
