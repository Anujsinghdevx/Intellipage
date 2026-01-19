import CustomLiveblocksProvider from "@/components/LiveBlocksProvider";
import React from "react";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CustomLiveblocksProvider>
      <div className="h-full w-full">{children}</div>
    </CustomLiveblocksProvider>
  );
};

export default PageLayout;
