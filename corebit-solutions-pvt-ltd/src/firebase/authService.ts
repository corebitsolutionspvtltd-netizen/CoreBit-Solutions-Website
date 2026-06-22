/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured, isAdminEmail } from "./config";

/**
 * Signs in the user via Google Authentication.
 * If production Firebase config is missing, operates in a mock/sandbox flow for high-fidelity demonstration.
 */
export async function loginWithGoogle(): Promise<{ user: User | null; email: string | null; error?: string }> {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user?.email || null;
      
      if (email && isAdminEmail(email)) {
        return { user: result.user, email };
      } else {
        // Sign out immediately if unauthorized to comply with strict security rules
        await signOut(auth);
        return { user: null, email, error: "Unauthorized access path. Only registered developer node core coordinates permitted." };
      }
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      return { user: null, email: null, error: error.message || "Authentication attempt failed." };
    }
  }

  // Local/Sandbox high-fidelity simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      // Prompt default mock user for demonstration
      const promptEmail = window.prompt(
        "📝 ENTER DEVELOPER GMAIL ADDRESS FOR SIMULATION:\n\nDefault: corebitsolutionspvtltd@gmail.com\n\n(Enter 'corebitsolutionspvtltd@gmail.com' to login successfully, or any other email to simulate unauthorized response)",
        "corebitsolutionspvtltd@gmail.com"
      );

      if (!promptEmail) {
        resolve({ user: null, email: null, error: "Authentication pipeline aborted by user." });
        return;
      }

      if (isAdminEmail(promptEmail)) {
        const mockUser = {
          uid: "mock-admin-uid-12345",
          email: promptEmail,
          displayName: "Sairaj Vikas A",
          photoURL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
          emailVerified: true
        } as unknown as User;
        
        // Save current user to sessionStorage
        sessionStorage.setItem("corebit_mock_user", JSON.stringify(mockUser));
        localStorage.setItem("corebit_admin_mode", "true");
        window.dispatchEvent(new Event("corebit_admin_mode_changed"));
        
        resolve({ user: mockUser, email: promptEmail });
      } else {
        resolve({ user: null, email: promptEmail, error: "Unauthorized. Allowed access restricted to corporate owner." });
      }
    }, 600);
  });
}

/**
 * Signs out the current user.
 */
export async function logoutUser(): Promise<boolean> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase logout error:", e);
    }
  }

  sessionStorage.removeItem("corebit_mock_user");
  localStorage.removeItem("corebit_mock_user");
  localStorage.removeItem("corebit_admin_mode");
  localStorage.removeItem("cbit_admin_access");
  window.dispatchEvent(new Event("corebit_admin_mode_changed"));
  return true;
}

/**
 * Subscribes to the auth state changes.
 */
export function subscribeToAuth(callback: (user: User | null, isAdmin: boolean) => void): () => void {
  // Let's define a function to check and handle the local session storage mock user
  const checkMockUser = (): boolean => {
    const raw = sessionStorage.getItem("corebit_mock_user") || localStorage.getItem("corebit_mock_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as User;
        callback(parsed, true);
        return true;
      } catch {
        // error parsing
      }
    }
    return false;
  };

  let unsubscribeFirebase: (() => void) | null = null;

  if (isFirebaseConfigured && auth) {
    unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      // If there is a mock user active, let that override or coexist for admin purposes
      if (checkMockUser()) return;

      const authorized = !!(user && user.email && isAdminEmail(user.email));
      if (authorized) {
        localStorage.setItem("corebit_admin_mode", "true");
      } else {
        localStorage.removeItem("corebit_admin_mode");
      }
      callback(user, authorized);
    });
  }

  // Handle local mock sync and custom event changes instantly
  const handleLocalSync = () => {
    if (!checkMockUser()) {
      // If no mock user found, check Firebase state if it's configured
      if (isFirebaseConfigured && auth) {
        const user = auth.currentUser;
        const authorized = !!(user && user.email && isAdminEmail(user.email));
        callback(user, authorized);
      } else {
        callback(null, false);
      }
    }
  };

  window.addEventListener("corebit_admin_mode_changed", handleLocalSync);

  // Perform first run sync
  handleLocalSync();

  return () => {
    if (unsubscribeFirebase) unsubscribeFirebase();
    window.removeEventListener("corebit_admin_mode_changed", handleLocalSync);
  };
}
