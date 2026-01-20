"use client";

import * as Y from "yjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { BotIcon, LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import Markdown from "react-markdown";

const languages: { [key: string]: string } = {
  english: "eng_Latn",
  hindi: "hin_Deva",
  spanish: "spa_Latn",
  arabic: "ara_Arab",
  russian: "rus_Cyrl",
};

// Helper function to extract plain text from BlockNote structure
const extractTextFromBlocks = (data: any): string => {
  // If it's already a string, return it
  if (typeof data === 'string') {
    return data;
  }
  
  // If it's not an array or object, return empty
  if (!data || typeof data !== 'object') {
    return '';
  }
  
  let textParts: string[] = [];
  
  // Recursive function to extract text
  const extractText = (obj: any) => {
    if (typeof obj === 'string') {
      textParts.push(obj);
      return;
    }
    
    if (Array.isArray(obj)) {
      obj.forEach(item => extractText(item));
      return;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      // Check for common text properties
      if (obj.text && typeof obj.text === 'string') {
        textParts.push(obj.text);
      }
      if (obj.content && typeof obj.content === 'string') {
        textParts.push(obj.content);
      }
      
      // Recurse through all properties
      Object.values(obj).forEach(value => {
        if (value && typeof value === 'object') {
          extractText(value);
        } else if (typeof value === 'string' && value.trim().length > 0) {
          // Only add if it's not a property name (like 'id', 'type', etc.)
          if (!['id', 'type', 'props', 'children', 'content'].includes(String(value))) {
            textParts.push(value);
          }
        }
      });
    }
  };
  
  extractText(data);
  
  // Join with spaces and clean up
  return textParts
    .filter(text => text && text.trim().length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const TranslateDocument = ({ doc }: { doc: Y.Doc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!language) {
      toast.error("Please select a language");
      return;
    }

    startTransition(async () => {
      try {
        const rawData = doc.get("document-store").toJSON();
        console.log("=== DEBUG: Raw document data ===");
        console.log(rawData);
        console.log("Type:", typeof rawData);
        console.log("Is Array:", Array.isArray(rawData));

        let documentData = extractTextFromBlocks(rawData);
        
        console.log("=== DEBUG: Extracted text ===");
        console.log(documentData);
        console.log("Length:", documentData.length);

        if (!documentData || documentData.trim().length === 0) {
          toast.error("Document is empty or could not extract text");
          console.error("Failed to extract text from:", rawData);
          return;
        }

        console.log("=== DEBUG: Sending to API ===");
        console.log("Text:", documentData);
        console.log("Language:", language);

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentData: documentData.trim(),
            targetLang: language,
          }),
        });

        const responseData = await res.json();
        console.log("=== DEBUG: API Response ===");
        console.log(responseData);

        if (res.ok) {
          const { translated_text } = responseData;
          
          if (Array.isArray(translated_text)) {
            setSummary(translated_text.join('\n'));
          } else {
            setSummary(translated_text);
          }
          
          toast.success("Document translated successfully");
        } else {
          console.error("API Error:", responseData);
          toast.error("Failed to translate the document");
        }
      } catch (error) {
        console.error("=== DEBUG: Translation error ===");
        console.error(error);
        toast.error("An error occurred during translation");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>
          <LanguagesIcon className="w-4 h-4 mr-2" />
          Translate
        </DialogTrigger>
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Translate the document</DialogTitle>
          <DialogDescription>
            Select a language and AI will translate the document content into the selected language
          </DialogDescription>
        </DialogHeader>
        
        <hr className="my-4" />

        {summary && (
          <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100 rounded-lg">
            <div className="flex gap-2 items-center">
              <BotIcon className="w-6 h-6 flex-shrink-0 text-blue-600" />
              <p className="font-bold">
                {isPending ? "Translating..." : "Translation:"}
              </p>
            </div>
            <div className="w-full">
              {isPending ? (
                <p className="text-gray-500">Processing...</p>
              ) : (<div className="prose prose-sm max-w-none">
                <Markdown>{summary}</Markdown>
              </div>
              )}
            </div>
          </div>
        )}

        <form className="flex gap-2" onSubmit={handleAskQuestion}>
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Language" />
            </SelectTrigger>

            <SelectContent>
              {Object.entries(languages).map(([languageName, code]) => (
                <SelectItem key={code} value={code}>
                  {languageName.charAt(0).toUpperCase() + languageName.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button type="submit" disabled={!language || isPending}>
            {isPending ? "Translating..." : "Translate"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TranslateDocument;