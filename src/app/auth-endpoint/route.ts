import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import liveblocks from "@/lib/liveblocks";
import { logger } from "@/lib/logger";
import { handleApiError } from "@/lib/error-handler";

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    logger.info("Auth request received", { userId, sessionClaims });

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing userId" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { room } = body;
    logger.info("Auth request room", { room });

    if (!room || typeof room !== "string") {
      return NextResponse.json({ error: "Invalid room" }, { status: 400 });
    }

    let email = sessionClaims?.email as string;
    let name =
      (sessionClaims?.fullName as string) ||
      (sessionClaims?.firstName as string);
    let avatar = sessionClaims?.imageUrl as string;

    if (!email || !name || !avatar) {
      logger.info("Fetching user info from currentUser API...");
      const user = await currentUser();

      if (!email) {
        email =
          user?.emailAddresses?.[0]?.emailAddress || `${userId}@example.com`;
      }
      if (!name) {
        name = user?.fullName || user?.firstName || "Anonymous";
      }
      if (!avatar) {
        avatar = user?.imageUrl || "/default-avatar.png";
      }
    }

    logger.info("User info resolved", { email, name, avatar });

    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name,
        email,
        avatar,
      },
    });

    session.allow(room, session.FULL_ACCESS);

    const { body: responseBody, status } = await session.authorize();

    return new Response(responseBody, { status });
  } catch (error) {
    logger.error("Auth endpoint error", { error });
    const handledError = handleApiError(error);
    return NextResponse.json(
      { error: handledError.message || "Internal server error" },
      { status: 500 }
    );
  }
}
