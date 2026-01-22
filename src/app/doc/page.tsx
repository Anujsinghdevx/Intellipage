"use client";

import React, { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NewDocument, SidebarOption } from "@/components";
import { MenuIcon } from "lucide-react";
import { RoomDocument } from "@/types/types";

const Sidebar = () => {
  const { user } = useUser();
  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({ owner: [], editor: [] });
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const [data, loading, error] = useCollection(
    userEmail ? collection(db, "users", userEmail, "rooms") : null
  );

  useEffect(() => {
    if (!data) return;

    const grouped = data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>(
      (acc, curr) => {
        const roomData = curr.data() as RoomDocument;
        acc[roomData.role === "owner" ? "owner" : "editor"].push({
          id: curr.id,
          ...roomData,
        });
        return acc;
      },
      { owner: [], editor: [] }
    );

    setGroupedData(grouped);
  }, [data]);

  const menuOptions = (
    <div className="space-y-6 w-full">
      <NewDocument />
      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">
          Loading documents...
        </p>
      ) : error ? (
        <p className="text-red-500 text-sm">
          Failed to load documents: {error.message}
        </p>
      ) : (
        <>
          {groupedData.owner.length > 0 ? (
            <div>
              <h2 className="text-gray-700 font-semibold text-lg border-b pb-2">
                My Documents
              </h2>
              <div className="space-y-2 max-h-40 overflow-auto scrollbar-thin scrollbar-thumb-gray-400">
                {groupedData.owner.map((doc) => (
                  <SidebarOption
                    key={doc.id}
                    href={`/doc/${doc.id}`}
                    id={doc.id as string}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 font-medium text-sm">
              No documents found
            </p>
          )}
          {groupedData.editor.length > 0 && (
            <div className="mt-4">
              <h2 className="text-gray-700 font-semibold text-lg border-b pb-2">
                Shared with Me
              </h2>
              <div className="space-y-2 max-h-40 overflow-auto scrollbar-thin scrollbar-thumb-gray-400">
                {groupedData.editor.map((doc) => (
                  <SidebarOption
                    key={doc.id}
                    href={`/doc/${doc.id}`}
                    id={doc.id as string}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <aside className="flex justify-center mt-32 min-h-[50vh]  ">
      <div className="p-6 bg-white w-[70%] max-w-md shadow-2xl rounded-2xl backdrop-blur-lg border border-gray-200/70 md:flex md:flex-col md:items-center">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <MenuIcon
                className="p-2 hover:bg-gray-200 transition rounded-lg"
                size={40}
              />
            </SheetTrigger>
            <SheetContent side="left" className="bg-white rounded-lg shadow-xl">
              <SheetHeader>
                <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{menuOptions}</div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:flex flex-col items-center w-full">
          {menuOptions}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
