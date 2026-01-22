"use client";
import React, { useEffect } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NewDocument from "./NewDocument";
import { MenuIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { collection } from "firebase/firestore";
import { db } from "../../firebase";
import SidebarOption from "./SidebarOption";
import { RoomDocument } from "@/types/types";

const Sidebar = () => {
  const { user } = useUser();
  const [groupedData, setGroupedData] = React.useState<{
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

        if (roomData.role === "owner") {
          acc.owner.push({
            id: curr.id,
            ...roomData,
          });
        } else {
          acc.editor.push({
            id: curr.id,
            ...roomData,
          });
        }
        return acc;
      },
      {
        owner: [],
        editor: [],
      }
    );
    setGroupedData(grouped);
  }, [data]);

  const menuOptions = (
    <>
      <NewDocument />
      <div className="flex flex-col space-y-6 py-6">
        {loading ? (
          <p className="text-gray-500 text-sm animate-pulse">
            Loading documents...
          </p>
        ) : error ? (
          <p className="text-red-500 text-sm">Error: {error.message}</p>
        ) : groupedData.owner.length === 0 ? (
          <h2 className="text-gray-400 font-medium text-base">
            No documents found
          </h2>
        ) : (
          <>
            <h2 className="text-gray-600 font-semibold text-lg border-b pb-2">
              My Documents
            </h2>
            {groupedData.owner.map(
              (doc) =>
                doc.id && (
                  <SidebarOption
                    key={doc.id}
                    href={`/doc/${doc.id}`}
                    id={doc.id}
                  />
                )
            )}
          </>
        )}
      </div>
      {groupedData.editor.length > 0 && (
        <div className="mt-4">
          <h2 className="text-gray-600 font-semibold text-lg border-b pb-2">
            Shared with me
          </h2>
          {groupedData.editor.map(
            (doc) =>
              doc.id && (
                <SidebarOption
                  key={doc.id}
                  href={`/doc/${doc.id}`}
                  id={doc.id}
                />
              )
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-100 shadow-xl rounded-xl md:rounded-2xl backdrop-blur-lg border border-gray-300/50">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon
              className="p-2 hover:bg-gray-300 transition rounded-lg"
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
      <div className="hidden md:block overflow-y-auto max-h-[85vh] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-2">
        {menuOptions}
      </div>
    </div>
  );
};

export default Sidebar;
