import { auth } from "@clerk/nextjs/server";
import React from "react";
import RoomProvider from "@/components/RoomProvider";

const DocLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  await auth.protect();

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
};

export default DocLayout;
