"use client";
import React from "react";
import { LiveblocksProvider as LiveblocksSDKProvider } from "@liveblocks/react/suspense";

const CustomLiveblocksProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
    throw new Error("Missing NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY");
  }

  return (
    <LiveblocksSDKProvider authEndpoint="/auth-endpoint" throttle={16}>
      {children}
    </LiveblocksSDKProvider>
  );
};

export default CustomLiveblocksProvider;
