/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { safeStorage } from "../utils/safeStorage";

const metaEnv = (import.meta as any).env || {};

// Check if user has saved a customized live Firebase credential configuration
let savedCustomConfig: any = null;
try {
  const saved = safeStorage.getItem("corebit_firebase_custom_config");
  if (saved) {
    savedCustomConfig = JSON.parse(saved);
    console.log("ℹ️ Loaded custom Firebase credentials from storage:", savedCustomConfig.projectId);
  }
} catch (e) {
  console.warn("Could not load custom Firebase configuration from storage:", e);
}

const firebaseConfig = {
  apiKey: (savedCustomConfig?.apiKey || metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyBPVZ5uVNSjjs-AF1vIcvEs2pcXjiBTe3g").trim(),
  authDomain: (savedCustomConfig?.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "corebit-solutions.firebaseapp.com").trim(),
  projectId: (savedCustomConfig?.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || "corebit-solutions").trim(),
  storageBucket: (savedCustomConfig?.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "corebit-solutions.firebasestorage.app").trim(),
  messagingSenderId: (savedCustomConfig?.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "1083734078716").trim(),
  appId: (savedCustomConfig?.appId || metaEnv.VITE_FIREBASE_APP_ID || "1:1083734078716:web:b1739c6524fdbda08dd379").trim(),
  measurementId: (savedCustomConfig?.measurementId || metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-T2DV4VP67E").trim(),
  firestoreDatabaseId: (savedCustomConfig?.firestoreDatabaseId || undefined)
};

// Check if user forced local simulation fallback
let isForceSimulation = false;
try {
  isForceSimulation = safeStorage.getItem("corebit_force_simulation") === "true";
} catch (e) {
  // Safe fallback
}

// Check if valid config exists
const isFirebaseConfigured = 
  !isForceSimulation &&
  !!(firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.apiKey !== "AIzaSyBPVZ5uVNSjjs-AF1vIcvEs2pcXjiBTe3g");

let app: any;
let auth: any = null;
let db: any = null;
let analytics: any = null;
const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Safety check for initializeAuth vs getAuth in restricted iframes
    try {
      auth = getAuth(app);
    } catch (authInitError) {
      console.warn("Standard Firebase getAuth failed, attempting fallback initializeAuth:", authInitError);
      try {
        auth = initializeAuth(app, {
          persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]
        });
      } catch (authArrError) {
        console.warn("initializeAuth with standard browser storage array failed, falling back to inMemoryPersistence:", authArrError);
        try {
          auth = initializeAuth(app, {
            persistence: inMemoryPersistence
          });
        } catch (authMemError) {
          console.error("Critical: Failed to initialize even in-memory Firebase auth:", authMemError);
          auth = null;
        }
      }
    }

    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch (dbInitError) {
      console.warn("initializeFirestore failed in sandbox, attempting getFirestore fallback:", dbInitError);
      try {
        db = getFirestore(app);
      } catch (dbFallbackError) {
        console.error("Critical: Failed to generate Firestore instance:", dbFallbackError);
        db = null;
      }
    }
    
    // Skip Google Analytics initialization inside preview/sandbox iframes or local development server
    // to prevent cross-origin script load errors (gtag script loading is prone to Script error or security exceptions in restricted iframes)
    const isLocalOrIframe = typeof window !== "undefined" && (
      window.self !== window.top ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("run.app") ||
      window.location.hostname.includes("aistudio")
    );

    if (!isLocalOrIframe) {
      // Safely initialize analytics where supported (avoids crashing in server-render or iframe sandbox environments)
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log("📈 Google Analytics initialized.");
        }
      }).catch(err => {
        console.warn("Analytics not supported in this environment:", err);
      });
    } else {
      console.log("📈 Google Analytics initialization skipped in preview/sandbox/iframe context to preserve stability.");
    }

    console.log("🔥 Firebase initialized successfully with production credentials.");
  } catch (error) {
    console.error("Failed to initialize production Firebase:", error);
  }
} else {
  console.log("ℹ️ Firebase is running in mock/local mode. Fill your coordinates in .env or settings to connect live.");
}

export const ADMIN_EMAILS = [
  "corebitsolutionspvtltd@gmail.com",
  "sairajvikas30@gmail.com"
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  // If user loaded their own custom Live Firebase project, they are the admin
  if (savedCustomConfig) return true;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export { app, auth, db, analytics, googleProvider, isFirebaseConfigured };
