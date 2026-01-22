"use client";
import { Document, ErrorBoundary } from "@/components";
import { logger } from "@/lib/logger";
import React, { use } from "react";

const DocumentPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  if (!id) {
    logger.error("Missing document id in route params", { params });
    return <div className="p-4 text-red-600">Invalid document id</div>;
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col flex-1 min-h-screen">
        <Document id={id} />
      </div>
    </ErrorBoundary>
  );
};

export default DocumentPage;
