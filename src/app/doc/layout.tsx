import { LiveBlocksProvider } from "@/components";
import React from "react";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LiveBlocksProvider>
      <div className="h-full w-full">{children}</div>
    </LiveBlocksProvider>
  );
};

export default PageLayout;
