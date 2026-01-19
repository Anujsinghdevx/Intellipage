"use client";
import Link from "next/link";
import React from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";
import { doc } from "firebase/firestore";
import { usePathname } from "next/navigation";

const SidebarOption = ({ href, id }: { href: string; id: string }) => {
  const [data, loading, error] = useDocumentData(doc(db, "documents", id));
  const pathname = usePathname();
  const isActive = pathname === href; // Ensuring exact match

  if (loading) return <p className="text-gray-500 text-sm">Loading...</p>;
  if (error)
    return <p className="text-red-500 text-sm">Error loading document</p>;
  if (!data) return null;

  return (
    <div>
      <Link
        href={href}
        className={`block border p-2 rounded-md transition-colors ${
          isActive
            ? "bg-gray-300 font-bold border-black"
            : "border-gray-400 hover:bg-gray-200"
        }`}
      >
        <p className="truncate">{data.title || "Untitled Document"}</p>
      </Link>
    </div>
  );
};

export default SidebarOption;
