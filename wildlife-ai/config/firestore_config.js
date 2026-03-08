/**
 * config/firestore_config.js
 * ============================
 * Reference config file for Firestore setup instructions.
 * Actual Firestore initialisation is in node-service/firestore.js
 *
 * FIRESTORE SETUP GUIDE:
 * ========================
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (or use existing one)
 * 3. Click "Firestore Database" → "Create database"
 * 4. Choose "Start in test mode" (change to production rules later)
 * 5. Go to Project Settings → Service Accounts
 * 6. Click "Generate new private key" → download serviceAccountKey.json
 * 7. Add to .env:
 *      FIREBASE_PROJECT_ID=your-project-id
 *      FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
 *      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
 *    OR set: FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
 *
 * FIRESTORE COLLECTIONS USED IN THIS PROJECT:
 * ==============================================
 *   sightings  — { speciesName, confidence, imageUrl, location, report, createdAt }
 *   species    — { commonName, scientificName, iucnStatus, habitat, description }
 *   users      — { email, role, createdAt }  (future: auth)
 *
 * FIRESTORE SECURITY RULES (paste in Firebase Console → Firestore → Rules):
 * ============================================================================
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Allow read/write from your backend service account
 *     match /{document=**} {
 *       allow read, write: if request.auth != null;
 *     }
 *   }
 * }
 */

module.exports = {
  collections: {
    SIGHTINGS: "sightings",
    SPECIES:   "species",
    USERS:     "users",
    REPORTS:   "reports",
  },
};
