import { NextResponse } from "next/server";
import { adminDb } from "../../../../firebase-admin";
import { handleApiError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";
import { withErrorHandling } from "@/middleware/api-error-handler";

export async function GET() {
  const { data, error } = await withErrorHandling(async () => {
    const testRef = await adminDb.collection("_test").add({
      message: "Firebase is working!",
      timestamp: new Date(),
    });

    const doc = await testRef.get();
    const testData = doc.data();

    await testRef.delete();

    return {
      success: true,
      message: "Firebase Admin is working correctly!",
      testData,
    };
  });

  if (error) {
    logger.error("Firebase test failed", { error });
    const handledError = handleApiError(error);

    return NextResponse.json(
      {
        success: false,
        error: handledError.message,
        details: handledError,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
