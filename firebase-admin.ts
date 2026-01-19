import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
let serviceAccount: any;

try {
    serviceAccount = require('./service_key.json');
    console.log("✅ Service key loaded successfully");
} catch (error) {
    console.error("❌ Failed to load service_key.json");
    console.error("Make sure service_key.json is in your project root");
    throw new Error("service_key.json not found - download it from Firebase Console → Project Settings → Service Accounts");
}

if (getApps().length === 0) {
    try {
        app = initializeApp({
            credential: cert(serviceAccount)
        });
        console.log("✅ Firebase Admin initialized successfully");
        console.log("📦 Project ID:", serviceAccount.project_id);
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