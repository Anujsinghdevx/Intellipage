"use client";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import React, { useEffect, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";
import { logger } from "@/lib/logger";

type EditorProps = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkmode: boolean;
};

function BlockNote({ doc, provider, darkmode }: EditorProps) {
  const userInfo = useSelf((me) => me.info);

  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo?.name,
        color: stringToColor(userInfo?.email),
      },
    },
  });

  return (
    <div className="relative max-w-6xl mx-auto">
      <BlockNoteView
        className="bg-white/40 dark:bg-white/10 shadow-[0px_4px_24px_-1px_rgba(212,175,156,0.25)] 
             rounded-[40px] border-[3px] border-[#FFF1EA] backdrop-blur-[45px] p-4  "
        editor={editor}
        theme={darkmode ? "dark" : "light"}
      />
    </div>
  );
}

const Editor = () => {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [darkmode, setDarkmode] = useState<boolean>(false);
  const style = `hover:text-white ${
    darkmode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-800 bg-gray-300 hover:bg-gray-300 hover:text-gray-700"
  }`;
  useEffect(() => {
    try {
      const yDoc = new Y.Doc();
      const yProvider = new LiveblocksYjsProvider(room, yDoc);
      setDoc(yDoc);
      setProvider(yProvider);

      return () => {
        yDoc?.destroy();
        yProvider?.destroy();
      };
    } catch (error) {
      logger.error("Editor initialization failed", { error });
      return () => {};
    }
  }, [room]);
  if (!doc || !provider) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-10">
        <TranslateDocument doc={doc} />
        <Button className={style} onClick={() => setDarkmode(!darkmode)}>
          {darkmode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
      <BlockNote doc={doc} provider={provider} darkmode={darkmode} />
    </div>
  );
};

export default Editor;
