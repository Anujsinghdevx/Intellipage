import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import liveblocks from "@/lib/liveblocks";

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    console.log("DEBUG: userId =", userId, "| type =", typeof userId);
    console.log("DEBUG: sessionClaims =", sessionClaims);

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing userId" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { room } = body;
    console.log("DEBUG: room =", room);

    if (!room || typeof room !== "string") {
      return NextResponse.json({ error: "Invalid room" }, { status: 400 });
    }

    let email = sessionClaims?.email as string;
    let name =
      (sessionClaims?.fullName as string) ||
      (sessionClaims?.firstName as string);
    let avatar = sessionClaims?.imageUrl as string;

    if (!email || !name || !avatar) {
      console.log("Fetching user info from currentUser API...");
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

    console.log("User info:", { email, name, avatar });

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
    console.error("Auth endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
