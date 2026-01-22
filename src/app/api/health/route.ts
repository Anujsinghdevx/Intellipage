import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";
import { withErrorHandling } from "@/middleware/api-error-handler";

export async function GET() {
  const { data, error } = await withErrorHandling(async () => ({
    status: "ok",
  }));

  if (error) {
    const handledError = handleApiError(error);
    logger.error("Healthcheck failed", handledError);
    return NextResponse.json(
      { status: "error", error: handledError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
