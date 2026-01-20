"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { adminDb } from "../../firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { Timestamp } from "firebase-admin/firestore";

export async function createNewDocument() {
  const { userId, sessionClaims } = await auth();

  console.log("🔍 Auth Debug:", { userId, sessionClaims });

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  let userEmail = (sessionClaims?.email ||
    sessionClaims?.email_address ||
    sessionClaims?.primary_email_address) as string;

  if (!userEmail) {
    console.log("❌ Email not in session claims, fetching from currentUser...");
    const user = await currentUser();
    userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
    console.log("Email from currentUser:", userEmail);
  }

  if (!userEmail) {
    console.error("❌ No valid email found. Session claims:", sessionClaims);
    throw new Error(
      "User email is missing. Please ensure your email is verified in your account settings."
    );
  }

  console.log("✅ Using email:", userEmail);

  try {
    console.log("About to create document in Firestore...");
    console.log("AdminDb type:", typeof adminDb);
    console.log("AdminDb collection method:", typeof adminDb.collection);

    const docCollectionRef = adminDb.collection("documents");
    console.log("✅ Got collection reference");

    const docRef = await docCollectionRef.add({
      title: "New Doc",
    });

    console.log("✅ Document created:", docRef.id);
    await adminDb
      .collection("users")
      .doc(userEmail)
      .collection("rooms")
      .doc(docRef.id)
      .set({
        userId: userEmail,
        role: "owner",
        roomId: docRef.id,
      });

    console.log("✅ Room access granted to user");

    return { docId: docRef.id };
  } catch (error: unknown) {
    console.error("❌ Error creating document:");
    console.error("Error type:", typeof error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    const errorCode =
      error instanceof Error && "code" in error ? error.code : undefined;

    console.error("Error message:", errorMessage);
    console.error("Error code:", errorCode);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    throw new Error(`Failed to create document: ${errorMessage}`);
  }
}

export async function deleteDocument(roomId: string) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log("Deleting document:", roomId);

  try {
    console.log("Step 1: Getting document metadata...");
    const docRef = adminDb.collection("documents").doc(roomId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log("Document doesn't exist");
      return { success: false, error: "Document not found" };
    }

    console.log("Step 2: Deleting main document...");
    await docRef.delete();
    console.log("✅ Main document deleted");

    console.log("Step 3: Deleting user's room reference...");
    const userEmail = sessionClaims?.email as string;
    if (userEmail) {
      await adminDb
        .collection("users")
        .doc(userEmail)
        .collection("rooms")
        .doc(roomId)
        .delete();
      console.log("✅ User's room reference deleted");
    }

    console.log("Step 4: Deleting Liveblocks room...");
    try {
      await liveblocks.deleteRoom(roomId);
      console.log("✅ Liveblocks room deleted");
    } catch (lbError) {
      console.log("Liveblocks room may not exist or already deleted", lbError);
    }

    console.log("✅ Document deleted successfully");
    return { success: true };
  } catch (error: unknown) {
    console.error("❌ Error deleting document:");
    console.error("Error message:", (error as Error)?.message);
    console.error("Error code:", (error as Error & { code?: string })?.code);
    return { success: false, error: (error as Error)?.message };
  }
}

export async function inviteUserToDocument(roomId: string, email: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log("👥 Inviting user to document:", roomId, email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: email,
        role: "editor",
        roomId,
      });

    console.log("✅ User invited successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error adding user:", error);
    return { success: false };
  }
}

export async function removeUserFromDocument(roomId: string, email: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log("👤 Removing user from document:", roomId, email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .delete();

    console.log("✅ User removed successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error removing user:", error);
    return { success: false };
  }
}

export async function updateDocument(roomId: string, title: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log("Updating document:", roomId, "New title:", title);

  try {
    await adminDb.collection("documents").doc(roomId).update({
      title,
    });

    console.log("✅ Document updated successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating document:", error);
    return { success: false };
  }
}

export async function migrateDocumentCollaborators(roomId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log("🔄 Migrating document collaborators for:", roomId);

  try {
    const docRef = adminDb.collection("documents").doc(roomId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, error: "Document not found" };
    }

    const docData = docSnap.data();

    if (docData?.collaborators) {
      console.log("Document already has collaborators");
      return { success: true, message: "Already migrated" };
    }

    const usersSnapshot = await adminDb.collection("users").get();
    const collaborators: Record<
      string,
      { role: string; email: string; addedAt: Timestamp }
    > = {};

    for (const userDoc of usersSnapshot.docs) {
      const userEmail = userDoc.id;
      const roomRef = await adminDb
        .collection("users")
        .doc(userEmail)
        .collection("rooms")
        .doc(roomId)
        .get();

      if (roomRef.exists) {
        const roomData = roomRef.data();
        collaborators[userEmail.replace(/\./g, "_")] = {
          role: roomData?.role || "editor",
          email: userEmail,
          addedAt: Timestamp.now(),
        };
      }
    }
    await docRef.update({
      collaborators: collaborators,
    });

    console.log(
      "✅ Migration complete. Found",
      Object.keys(collaborators).length,
      "collaborators"
    );
    return {
      success: true,
      collaboratorCount: Object.keys(collaborators).length,
    };
  } catch (error: unknown) {
    console.error("❌ Error migrating document:", error);
    return { success: false, error: (error as Error)?.message };
  }
}
