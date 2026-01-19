import { NextResponse } from "next/server";
import { adminDb } from "../../../../firebase-admin";

export async function GET() {
  try {
    const testRef = await adminDb.collection("_test").add({
      message: "Firebase is working!",
      timestamp: new Date(),
    });

    const doc = await testRef.get();
    const data = doc.data();

    await testRef.delete();

    return NextResponse.json({
      success: true,
      message: "Firebase Admin is working correctly!",
      testData: data,
    });
  } catch (error) {
    console.error("Firebase test failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error,
      },
      { status: 500 }
    );
  }
}
