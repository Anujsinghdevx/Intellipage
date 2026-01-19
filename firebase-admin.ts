import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

const requiredEnvVars = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

console.log("🔍 Checking Firebase Admin environment variables:");
console.log("Project ID:", requiredEnvVars.projectId ? "✅ Found" : "❌ Missing");
console.log("Client Email:", requiredEnvVars.clientEmail ? "✅ Found" : "❌ Missing");
console.log("Private Key:", requiredEnvVars.privateKey ? "✅ Found" : "❌ Missing");

if (!requiredEnvVars.projectId || !requiredEnvVars.clientEmail || !requiredEnvVars.privateKey) {
    console.error("❌ Missing Firebase Admin credentials in environment variables");
    throw new Error("Missing Firebase Admin environment variables. Please check your .env.local file.");
}

if (getApps().length === 0) {
    try {
        app = initializeApp({
            credential: cert({
                projectId: requiredEnvVars.projectId,
                clientEmail: requiredEnvVars.clientEmail,
                privateKey: requiredEnvVars.privateKey.replace(/\\n/g, '\n'),
            })
        });
        console.log("✅ Firebase Admin initialized successfully");
        console.log("📦 Project ID:", requiredEnvVars.projectId);
    } catch (error) {
        console.error("❌ Firebase Admin initialization failed:", error);
        throw error;
    }
} else {
    app = getApps()[0];
    console.log("✅ Using existing Firebase Admin instance");
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };