import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

// Check for required environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log("🔍 Checking Firebase Admin environment variables:");
console.log("Project ID:", projectId ? "✅ Found" : "❌ Missing");
console.log("Client Email:", clientEmail ? "✅ Found" : "❌ Missing");
console.log("Private Key:", privateKey ? "✅ Found (length: " + privateKey.length + ")" : "❌ Missing");

if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Missing Firebase Admin credentials in environment variables");
    throw new Error("Missing Firebase Admin environment variables. Please check your .env.local file.");
}

if (getApps().length === 0) {
    try {
        const credential = {
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        };

        console.log("🔑 Credential structure:", {
            projectId: credential.projectId,
            clientEmail: credential.clientEmail,
            privateKeyPreview: credential.privateKey.substring(0, 50) + "...",
        });

        app = initializeApp({
            credential: cert(credential)
        });
        
        console.log("✅ Firebase Admin initialized successfully");
        console.log("📦 Project ID:", projectId);
    } catch (error: any) {
        console.error("❌ Firebase Admin initialization failed:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Full error:", error);
        throw error;
    }
} else {
    app = getApps()[0];
    console.log("✅ Using existing Firebase Admin instance");
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };