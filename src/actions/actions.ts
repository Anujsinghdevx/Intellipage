"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { adminDb } from "../../firebase-admin";
import liveblocks from "@/lib/liveblocks";

export async function createNewDocument() {
  const { userId, sessionClaims } = await auth();

  console.log("Auth Debug:", { userId, sessionClaims });

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  let userEmail = (sessionClaims?.email ||
    sessionClaims?.email_address ||
    sessionClaims?.primary_email_address) as string;

  if (!userEmail) {
    console.log("⚠️ Email not in session claims, fetching from currentUser...");
    const user = await currentUser();
    userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
    console.log("📧 Email from currentUser:", userEmail);
  }

  if (!userEmail) {
    console.error("❌ No valid email found. Session claims:", sessionClaims);
    throw new Error(
      "User email is missing. Please ensure your email is verified in your account settings."
    );
  }

  console.log("✅ Using email:", userEmail);

  try {
    const docCollectionRef = adminDb.collection("documents");
    const docRef = await docCollectionRef.add({
      title: "New Doc",
      createdAt: new Date(),
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
        createdAt: new Date(),
        roomId: docRef.id,
      });

    console.log("✅ Room access granted to user");

    return { docId: docRef.id };
  } catch (error) {
    console.error("❌ Error creating document:", error);
    throw new Error("Failed to create document");
  }
}

export async function deleteDocument(roomId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log("🗑️ Deleting document:", roomId);

  try {
    await adminDb.collection("documents").doc(roomId).delete();

    const query = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();

    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    await liveblocks.deleteRoom(roomId);

    console.log("✅ Document deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting document:", error);
    return { success: false };
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
        createdAt: new Date(),
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

  console.log("Removing user from document:", roomId, email);

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

  console.log("📝 Updating document:", roomId, "New title:", title);

  try {
    await adminDb.collection("documents").doc(roomId).update({
      title,
      updatedAt: new Date(),
    });

    console.log("✅ Document updated successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating document:", error);
    return { success: false };
  }
}
