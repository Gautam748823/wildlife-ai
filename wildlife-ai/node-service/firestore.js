/**
 * node-service/firestore.js
 * ==========================
 * Initialises the Firebase Admin SDK and exports the Firestore db instance.
 * All route files import `db` from this file.
 *
 * Setup:
 *  1. Go to Firebase Console → Project Settings → Service Accounts
 *  2. Click "Generate new private key" → save as serviceAccountKey.json
 *  3. Add the path to .env:
 *       FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
 *     OR set individual env vars (better for deployment):
 *       FIREBASE_PROJECT_ID=your-project-id
 *       FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
 *       FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
 */

const admin   = require("firebase-admin");
const dotenv  = require("dotenv");
const path    = require("path");
const fs      = require("fs");

dotenv.config();

// ── Initialise Firebase Admin SDK ────────────────────────────────────────────
if (!admin.apps.length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath && fs.existsSync(path.resolve(serviceAccountPath))) {
    // Option A: use serviceAccountKey.json file
    const serviceAccount = require(path.resolve(serviceAccountPath));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("[Firestore] Initialised using service account file");

  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Option B: use individual environment variables (recommended for production)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log(`[Firestore] Initialised for project: ${process.env.FIREBASE_PROJECT_ID}`);

  } else {
    console.warn("[Firestore] WARNING: No Firebase credentials found in .env — Firestore calls will fail");
    console.warn("[Firestore] Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to .env");
    admin.initializeApp();   // Empty init so the server still starts
  }
}

const db = admin.firestore();

module.exports = { db, admin };
