/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { db, isFirebaseConfigured, auth, isAdminEmail } from "./config";
import { safeStorage } from "../utils/safeStorage";

// Shadow the global localStorage to safely handle iframe sandbox storage constraints
const localStorage = safeStorage;

// Cache to store the latest stringified data from Firestore to prevent infinite synchronization loops
const lastSnapshotSync: Record<string, string> = {};

/**
 * Returns true only if Firebase is configured and there is a currently authenticated 
 * user whose email is recognized as a valid authorized administrator.
 * This prevents guest visits from firing permission-blocked write requests and console warning spam.
 */
function checkWritePermission(): boolean {
  if (!isFirebaseConfigured || !auth) return false;
  const user = auth.currentUser;
  return !!user && !!user.email && isAdminEmail(user.email);
}
import { Project, Review, PricingPlan } from "../types";
import { DELIVERED_PROJECTS, CLIENT_REVIEWS, PRICING_PLANS } from "../data";

// Reusable timeout wrapper to prevent Firestore hanging when offline or slow
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 4000): Promise<T> {
  if (typeof window !== "undefined" && !navigator.onLine) {
    throw new Error("Local navigator detects offline client status");
  }

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Firebase request timed out after ${timeoutMs}ms (offline fallback)`)), timeoutMs)
    )
  ]);
}

// Connection diagnostic tracker
export interface FirestoreDiagnosticError {
  message: string;
  code?: string;
  timestamp: number;
}

export function setFirestoreError(err: any) {
  const diag: FirestoreDiagnosticError = {
    message: err?.message || String(err),
    code: err?.code || undefined,
    timestamp: Date.now()
  };
  if (typeof window !== "undefined") {
    localStorage.setItem("corebit_firestore_last_error", JSON.stringify(diag));
    window.dispatchEvent(new Event("corebit_firestore_error_updated"));
  }
}

export function clearFirestoreError() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("corebit_firestore_last_error");
    window.dispatchEvent(new Event("corebit_firestore_error_updated"));
  }
}

export function getLatestFirestoreError(): FirestoreDiagnosticError | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("corebit_firestore_last_error");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Helper keys for local fallback
const STORAGE_KEYS = {
  PROJECTS: "corebit_db_projects",
  REVIEWS: "corebit_db_reviews",
  PRICING: "corebit_db_pricing",
  COMPANY: "corebit_db_company_details"
};

// Initial Company Details Default State
export interface CompanyDetails {
  email: string;
  phone: string;
  address: string;
  gst: string;
  udyam: string;
  corporateName: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  certificates?: Array<{
    id: string;
    title: string;
    fileUrl: string;
    fileName: string;
  }>;
}

const DEFAULT_COMPANY_DETAILS: CompanyDetails = {
  email: "corebitsolutionspvtltd@gmail.com",
  phone: "+91 95971 23923",
  address: "Flat/Door/Block No. 8/33, TVK Street, KG Chavadi, Coimbatore, Tamil Nadu, Pin 641105",
  gst: "33AABCC1234F1Z1",
  udyam: "UDYAM-TN-03-0330267",
  corporateName: "CoreBit Solutions Pvt Ltd",
  socialLinks: {
    twitter: "https://twitter.com/corebitsolutions",
    linkedin: "https://linkedin.com/company/corebit-solutions",
    github: "https://github.com/corebit-solutions"
  },
  certificates: [
    {
      id: "cert-1",
      title: "ISO 9001:2015 Quality Management System Certification",
      fileUrl: "https://images.unsplash.com/photo-1606857500007-649bcd977f24?auto=format&fit=crop&w=400&q=80",
      fileName: "ISO_9001_Quality_Certificate.pdf"
    },
    {
      id: "cert-2",
      title: "Gov. MSME Outstanding Software Developer Accreditation",
      fileUrl: "https://images.unsplash.com/photo-1606857500007-649bcd977f24?auto=format&fit=crop&w=400&q=80",
      fileName: "MSME_Accreditation_2024.pdf"
    }
  ]
};

/**
 * 1. PROJECTS OPERATIONS
 */
export async function fetchProjects(): Promise<Project[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "projects");
      const snapshot = await withTimeout(getDocs(q), 1500);
      const list: Project[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Project);
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Firestore fetchProjects warning, falling back to LocalStorage:", e);
    }
  }

  // Fallback to LocalStorage
  const local = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DELIVERED_PROJECTS;
    }
  }
  
  // Seed local storage with initial design mock if empty
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DELIVERED_PROJECTS));
  return DELIVERED_PROJECTS;
}

export async function saveProject(project: Partial<Project> & { id?: string }): Promise<Project> {
  const isNew = !project.id;
  const projectToSave = {
    ...project,
    id: project.id || `proj-${Date.now()}`
  } as Project;

  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      if (isNew) {
        const docRef = await addDoc(collection(db, "projects"), {
          ...project,
          id: projectToSave.id
        });
        projectToSave.id = docRef.id;
        await updateDoc(doc(db, "projects", docRef.id), { id: docRef.id });
      } else {
        await setDoc(doc(db, "projects", project.id!), projectToSave, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore saveProject warning, using LocalStorage:", e);
    }
  }

  // Update LocalStorage
  const list = await fetchProjects();
  let updatedList: Project[];
  if (isNew) {
    updatedList = [...list, projectToSave];
  } else {
    updatedList = list.map(p => p.id === projectToSave.id ? { ...p, ...projectToSave } : p);
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));
  window.dispatchEvent(new Event("corebit_projects_updated"));
  return projectToSave;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (e) {
      console.warn("Firestore deleteProject warning:", e);
    }
  }

  const list = await fetchProjects();
  const updatedList = list.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));
  window.dispatchEvent(new Event("corebit_projects_updated"));
  return true;
}

/**
 * 2. REVIEWS OPERATIONS
 */
export async function fetchReviews(): Promise<Review[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "reviews");
      const snapshot = await withTimeout(getDocs(q), 1500);
      const list: Review[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Review);
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Firestore fetchReviews warning, falling back to LocalStorage:", e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return CLIENT_REVIEWS;
    }
  }

  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(CLIENT_REVIEWS));
  return CLIENT_REVIEWS;
}

export async function saveReview(review: Partial<Review> & { id?: string }): Promise<Review> {
  const isNew = !review.id;
  const reviewToSave = {
    ...review,
    id: review.id || `rev-${Date.now()}`
  } as Review;

  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      if (isNew) {
        const docRef = await addDoc(collection(db, "reviews"), {
          ...review,
          id: reviewToSave.id
        });
        reviewToSave.id = docRef.id;
        await updateDoc(doc(db, "reviews", docRef.id), { id: docRef.id });
      } else {
        await setDoc(doc(db, "reviews", review.id!), reviewToSave, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore saveReview warning:", e);
    }
  }

  const list = await fetchReviews();
  let updatedList: Review[];
  if (isNew) {
    updatedList = [...list, reviewToSave];
  } else {
    updatedList = list.map(r => r.id === reviewToSave.id ? { ...r, ...reviewToSave } : r);
  }
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updatedList));
  window.dispatchEvent(new Event("corebit_reviews_updated"));
  return reviewToSave;
}

export async function deleteReview(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      await deleteDoc(doc(db, "reviews", id));
    } catch (e) {
      console.warn("Firestore deleteReview warning:", e);
    }
  }

  const list = await fetchReviews();
  const updatedList = list.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updatedList));
  window.dispatchEvent(new Event("corebit_reviews_updated"));
  return true;
}

/**
 * 3. PRICING PLANS OPERATIONS
 */
export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "pricingPlans");
      const snapshot = await withTimeout(getDocs(q), 1500);
      const list: PricingPlan[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as PricingPlan);
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Firestore fetchPricingPlans warning, using LocalStorage fallback:", e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.PRICING);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return PRICING_PLANS;
    }
  }

  localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(PRICING_PLANS));
  return PRICING_PLANS;
}

export async function savePricingPlan(plan: Partial<PricingPlan> & { id?: string }): Promise<PricingPlan> {
  const isNew = !plan.id;
  const planToSave = {
    ...plan,
    id: plan.id || `plan-${Date.now()}`
  } as PricingPlan;

  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      if (isNew) {
        const docRef = await addDoc(collection(db, "pricingPlans"), {
          ...plan,
          id: planToSave.id
        });
        planToSave.id = docRef.id;
        await updateDoc(doc(db, "pricingPlans", docRef.id), { id: docRef.id });
      } else {
        await setDoc(doc(db, "pricingPlans", plan.id!), planToSave, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore savePricingPlan warning:", e);
    }
  }

  const list = await fetchPricingPlans();
  let updatedList: PricingPlan[];
  if (isNew) {
    updatedList = [...list, planToSave];
  } else {
    updatedList = list.map(p => p.id === planToSave.id ? { ...p, ...planToSave } : p);
  }
  localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(updatedList));
  window.dispatchEvent(new Event("corebit_pricing_updated"));
  return planToSave;
}

export async function deletePricingPlan(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      await deleteDoc(doc(db, "pricingPlans", id));
    } catch (e) {
      console.warn("Firestore deletePricingPlan warning:", e);
    }
  }

  const list = await fetchPricingPlans();
  const updatedList = list.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(updatedList));
  window.dispatchEvent(new Event("corebit_pricing_updated"));
  return true;
}

/**
 * 4. COMPANY DETAILS OPERATIONS
 */
export async function fetchCompanyDetails(): Promise<CompanyDetails> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "companyDetails", "main");
      const docSnap = await withTimeout(getDoc(docRef), 1500);
      if (docSnap.exists()) {
        return docSnap.data() as CompanyDetails;
      }
    } catch (e) {
      console.warn("Firestore fetchCompanyDetails warning:", e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.COMPANY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_COMPANY_DETAILS;
    }
  }

  localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY_DETAILS));
  return DEFAULT_COMPANY_DETAILS;
}

export async function saveCompanyDetails(details: CompanyDetails): Promise<CompanyDetails> {
  const incomingString = JSON.stringify(details);
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      if (lastSnapshotSync["companyDetails"] !== incomingString) {
        await setDoc(doc(db, "companyDetails", "main"), details, { merge: true });
        lastSnapshotSync["companyDetails"] = incomingString;
      }
    } catch (e) {
      console.warn("Firestore saveCompanyDetails warning:", e);
    }
  }

  localStorage.setItem(STORAGE_KEYS.COMPANY, incomingString);
  window.dispatchEvent(new Event("corebit_company_details_updated"));
  return details;
}

/**
 * 5. HOME SETTINGS OPERATIONS
 */
export async function fetchHomeSettings(): Promise<any> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "homeSettings", "main");
      const docSnap = await withTimeout(getDoc(docRef), 1500);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (e) {
      console.warn("Firestore fetchHomeSettings warning:", e);
    }
  }

  const saved = localStorage.getItem("corebit_home_settings");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback to default
    }
  }
  const defaults = {
    heroBadge: "Elite Software & Windows App Development",
    heroTitle: "Architecting the Digital Future.",
    heroSubtitle: "CoreBit Solutions Pvt Ltd provides enterprise-grade web development, premium native Windows applications, fluid mobile platforms, and secure system architectures.",
    aboutTitle: "Welcome to CoreBit Solutions Pvt Ltd",
    aboutPara1: "CoreBit Solutions Pvt Ltd is a technology-driven company dedicated to delivering innovative, reliable, and scalable digital solutions for businesses of all sizes. We specialize in developing customized software, feature-rich Windows desktop applications, native iOS & Android applications, high-performance web systems, and custom SaaS platforms that help organizations streamline operations.",
    aboutPara2: "Our team combines technical expertise, desktop/mobile/web craftsmanship, and industry knowledge to provide high-quality solutions tailored to each client's unique requirements. We are committed to maintaining strong client relationships through transparency, professionalism, and exceptional service delivery.",
    aboutPara3: "At CoreBit Solutions Pvt Ltd, our mission is to empower businesses with modern multi-platform technology solutions that drive success in an increasingly connected digital world.",
    quote: "CoreBit Solutions Pvt Ltd is committed to delivering excellence through teamwork, innovation, and customer-focused solutions, ensuring the highest level of service for every project we undertake.",
    checkpointsText: "Innovative Cross-Platform Apps\nNative Windows Desktop Builds\nReliable & Scalable Architectures\nTransparency & Client Growth"
  };
  localStorage.setItem("corebit_home_settings", JSON.stringify(defaults));
  return defaults;
}

export async function saveHomeSettings(settings: any): Promise<any> {
  const incomingString = JSON.stringify(settings);
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      if (lastSnapshotSync["homeSettings"] !== incomingString) {
        await setDoc(doc(db, "homeSettings", "main"), settings, { merge: true });
        lastSnapshotSync["homeSettings"] = incomingString;
      }
    } catch (e) {
      console.warn("Firestore saveHomeSettings warning:", e);
    }
  }
  localStorage.setItem("corebit_home_settings", incomingString);
  window.dispatchEvent(new Event("corebit_home_settings_updated"));
  return settings;
}

/**
 * 6. ROLES / SERVICES DATA OPERATIONS
 */
export async function fetchRolesData(): Promise<any[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "rolesData");
      const snapshot = await withTimeout(getDocs(q), 1500);
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Firestore fetchRolesData warning:", e);
    }
  }

  const saved = localStorage.getItem("corebit_roles_data");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      //
    }
  }
  return [];
}

export async function saveRolesData(roles: any[]): Promise<any[]> {
  const incomingString = JSON.stringify(roles);
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      if (lastSnapshotSync["rolesData"] !== incomingString) {
        for (const role of roles) {
          await setDoc(doc(db, "rolesData", role.id), role, { merge: true });
        }
        lastSnapshotSync["rolesData"] = incomingString;
      }
    } catch (e) {
      console.warn("Firestore saveRolesData warning:", e);
    }
  }
  localStorage.setItem("corebit_roles_data", incomingString);
  window.dispatchEvent(new Event("corebit_roles_data_updated"));
  return roles;
}

export async function saveSingleRole(role: any): Promise<any> {
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      await setDoc(doc(db, "rolesData", role.id), role, { merge: true });
    } catch (e) {
      console.warn("Firestore saveSingleRole warning:", e);
    }
  }
  return role;
}

export async function deleteSingleRole(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      await deleteDoc(doc(db, "rolesData", id));
    } catch (e) {
      console.warn("Firestore deleteSingleRole warning:", e);
    }
  }
  return true;
}

/**
 * 7. NAVIGATION CARDS OPERATIONS
 */
export async function fetchNavCards(): Promise<any[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "navCards");
      const snapshot = await withTimeout(getDocs(q), 1500);
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Firestore fetchNavCards warning:", e);
    }
  }

  const saved = localStorage.getItem("corebit_nav_cards");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      //
    }
  }
  return [];
}

export async function saveNavCards(cards: any[]): Promise<any[]> {
  const incomingString = JSON.stringify(cards);
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      if (lastSnapshotSync["navCards"] !== incomingString) {
        for (const card of cards) {
          await setDoc(doc(db, "navCards", card.id), card, { merge: true });
        }
        lastSnapshotSync["navCards"] = incomingString;
      }
    } catch (e) {
      console.warn("Firestore saveNavCards warning:", e);
    }
  }
  localStorage.setItem("corebit_nav_cards", incomingString);
  window.dispatchEvent(new Event("corebit_nav_cards_updated"));
  return cards;
}

/**
 * 8. CONTACT MESSAGES OPERATIONS
 */
export async function fetchContactMessages(): Promise<any[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "contactMessages");
      const snapshot = await withTimeout(getDocs(q), 1500);
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      if (list.length > 0) {
        return list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
      }
    } catch (e) {
      console.warn("Firestore fetchContactMessages warning, falling back to local:", e);
    }
  }

  const saved = localStorage.getItem("corebit_contact_messages");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      //
    }
  }
  return [];
}

export async function saveContactMessage(msg: any): Promise<any> {
  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, "contactMessages", msg.id), msg, { merge: true }), 8000);
      clearFirestoreError();
    } catch (e) {
      console.warn("Firestore saveContactMessage warning:", e);
      setFirestoreError(e);
    }
  }

  const list = await fetchContactMessages();
  const exists = list.some(item => item.id === msg.id);
  const updated = exists 
    ? list.map(item => item.id === msg.id ? { ...item, ...msg } : item)
    : [msg, ...list];
  localStorage.setItem("corebit_contact_messages", JSON.stringify(updated));
  window.dispatchEvent(new Event("corebit_contact_messages_updated"));
  return msg;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(deleteDoc(doc(db, "contactMessages", id)), 1500);
    } catch (e) {
      console.warn("Firestore deleteContactMessage warning:", e);
    }
  }

  const list = await fetchContactMessages();
  const updated = list.filter(m => m.id !== id);
  localStorage.setItem("corebit_contact_messages", JSON.stringify(updated));
  window.dispatchEvent(new Event("corebit_contact_messages_updated"));
  return true;
}

/**
 * 9. INTAKE ENQUIRIES OPERATIONS
 */
export async function fetchEnquiries(): Promise<any[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "enquiries");
      const snapshot = await withTimeout(getDocs(q), 1500);
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      if (list.length > 0) {
        return list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
      }
    } catch (e) {
      console.warn("Firestore fetchEnquiries warning, falling back to local:", e);
    }
  }

  const saved = localStorage.getItem("corebit_enquiries_list");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      //
    }
  }
  return [];
}

export async function saveEnquiry(enq: any): Promise<any> {
  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, "enquiries", enq.id), enq, { merge: true }), 8000);
      clearFirestoreError();
    } catch (e) {
      console.warn("Firestore saveEnquiry warning:", e);
      setFirestoreError(e);
    }
  }

  const list = await fetchEnquiries();
  const exists = list.some(item => item.id === enq.id);
  const updated = exists 
    ? list.map(item => item.id === enq.id ? { ...item, ...enq } : item)
    : [enq, ...list];
  localStorage.setItem("corebit_enquiries_list", JSON.stringify(updated));
  window.dispatchEvent(new Event("corebit_enquiries_updated"));
  return enq;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(deleteDoc(doc(db, "enquiries", id)), 1500);
    } catch (e) {
      console.warn("Firestore deleteEnquiry warning:", e);
    }
  }

  const list = await fetchEnquiries();
  const updated = list.filter(e => e.id !== id);
  localStorage.setItem("corebit_enquiries_list", JSON.stringify(updated));
  window.dispatchEvent(new Event("corebit_enquiries_updated"));
  return true;
}

/**
 * 10. AUDIT LOG OPERATIONS
 */
export async function saveActivityLog(
  action: string, 
  user: string,
  collectionName?: string,
  documentId?: string,
  oldValue?: any,
  newValue?: any
): Promise<any> {
  const log = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    user: user || "System",
    collection: collectionName || "general",
    documentId: documentId || "none",
    timestamp: new Date().toLocaleString(),
    oldValue: oldValue ? (typeof oldValue === "object" ? JSON.stringify(oldValue, null, 2) : String(oldValue)) : "",
    newValue: newValue ? (typeof newValue === "object" ? JSON.stringify(newValue, null, 2) : String(newValue)) : ""
  };

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, "activityLogs", log.id), log), 8000);
      clearFirestoreError();
    } catch (e) {
      console.warn("Firestore saveActivityLog warning:", e);
      setFirestoreError(e);
    }
  }

  const logsRaw = localStorage.getItem("corebit_activity_logs");
  let logs: any[] = [];
  if (logsRaw) {
    try {
      logs = JSON.parse(logsRaw);
      if (!Array.isArray(logs)) {
        logs = [];
      }
    } catch {
      logs = [];
    }
  }
  localStorage.setItem("corebit_activity_logs", JSON.stringify([log, ...logs]));
  window.dispatchEvent(new Event("corebit_activity_logs_updated"));
  return log;
}

export async function fetchActivityLogs(): Promise<any[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "activityLogs");
      const snapshot = await withTimeout(getDocs(q), 1500);
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      if (list.length > 0) {
        return list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
      }
    } catch (e) {
      console.warn("Firestore fetchActivityLogs warning:", e);
    }
  }

  const logsRaw = localStorage.getItem("corebit_activity_logs");
  if (logsRaw) {
    try {
      const parsed = JSON.parse(logsRaw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Return empty array on parse failure
    }
  }
  return [];
}

/**
 * 11. FOOTER SETTINGS OPERATIONS
 */
export async function fetchFooterSettings(): Promise<any> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "footerSettings", "main");
      const docSnap = await withTimeout(getDoc(docRef), 1500);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (e) {
      console.warn("Firestore fetchFooterSettings warning:", e);
    }
  }

  const saved = localStorage.getItem("corebit_footer_settings_v2");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      //
    }
  }
  const defaults = {
    aboutText: "CoreBit Solutions Private Limited is a registered corporate technology publisher and custom system delivery software house based out of Coimbatore, Tamil Nadu, serving worldwide clients with high fidelity architectures, security integrations, and responsive client layouts.",
    qualityBadge: "ISO 9001:2015 QUALITY SECURITY ASSURED",
    operationsHubTitle: "COIMBATORE OPERATIONS HUB",
    addressName: "CoreBit Solutions Pvt Ltd,",
    addressLine1: "Peelamedu, Peelamedu Pudur Road,",
    addressLine2: "Coimbatore, Tamil Nadu 641004, India",
    supportEmail: "corebitsolutionspvtltd@gmail.com",
    dialsText: "+91 95971 23923\n+91 95007 26936\n+91 93631 53995",
    copyrightText: "© 2026 CoreBit Solutions Private Limited. All rights reserved globally.",
    copyrightSub: "Registered Non-Government Technology Publication and supply enterprise. Managed in Coimbatore, Tamil Nadu.",
    twitterLink: "https://twitter.com/corebitsolutions",
    linkedinLink: "https://linkedin.com/company/corebitsolutions",
    githubLink: "https://github.com/corebitsolutions"
  };
  localStorage.setItem("corebit_footer_settings_v2", JSON.stringify(defaults));
  return defaults;
}

export async function saveFooterSettings(settings: any): Promise<any> {
  const incomingString = JSON.stringify(settings);
  if (isFirebaseConfigured && db && checkWritePermission()) {
    try {
      if (lastSnapshotSync["footerSettings"] !== incomingString) {
        await setDoc(doc(db, "footerSettings", "main"), settings, { merge: true });
        lastSnapshotSync["footerSettings"] = incomingString;
      }
    } catch (e) {
      console.warn("Firestore saveFooterSettings warning:", e);
    }
  }
  localStorage.setItem("corebit_footer_settings_v2", incomingString);
  window.dispatchEvent(new Event("corebit_footer_settings_updated"));
  return settings;
}

/**
 * 12. REAL-TIME MULTI-SITE DATABASE SYNCHRONIZATION
 * Standardizes real-time subscriptions onto Firestore collections and documents.
 * Updates local cache and propagates custom events so that all connected apps sync immediately.
 */
function startRealtimeSync() {
  if (!isFirebaseConfigured || !db) return;

  console.log("📡 Initializing real-time synchronization channels across connected websites...");

  // 1. Projects Realtime Listener
  try {
    onSnapshot(collection(db, "projects"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      const incomingString = JSON.stringify(list);
      lastSnapshotSync["projects"] = incomingString;
      const currentLocal = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (currentLocal !== incomingString) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, incomingString);
        window.dispatchEvent(new Event("corebit_projects_updated"));
      }
    }, (error) => {
      console.warn("Realtime sync warning for projects:", error);
    });
  } catch (err) {
    console.error("Failed to start projects realtime sync:", err);
  }

  // 2. Reviews Realtime Listener
  try {
    onSnapshot(collection(db, "reviews"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      const incomingString = JSON.stringify(list);
      lastSnapshotSync["reviews"] = incomingString;
      const currentLocal = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (currentLocal !== incomingString) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, incomingString);
        window.dispatchEvent(new Event("corebit_reviews_updated"));
      }
    }, (error) => {
      console.warn("Realtime sync warning for reviews:", error);
    });
  } catch (err) {
    console.error("Failed to start reviews realtime sync:", err);
  }

  // 3. Pricing Plans Realtime Listener
  try {
    onSnapshot(collection(db, "pricingPlans"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      const incomingString = JSON.stringify(list);
      lastSnapshotSync["pricingPlans"] = incomingString;
      const currentLocal = localStorage.getItem(STORAGE_KEYS.PRICING);
      if (currentLocal !== incomingString) {
        localStorage.setItem(STORAGE_KEYS.PRICING, incomingString);
        window.dispatchEvent(new Event("corebit_pricing_updated"));
      }
    }, (error) => {
      console.warn("Realtime sync warning for pricing:", error);
    });
  } catch (err) {
    console.error("Failed to start pricing plans realtime sync:", err);
  }

  // 4. Company Details Realtime Listener
  try {
    onSnapshot(doc(db, "companyDetails", "main"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const incomingString = JSON.stringify(data);
        lastSnapshotSync["companyDetails"] = incomingString;
        const currentLocal = localStorage.getItem(STORAGE_KEYS.COMPANY);
        if (currentLocal !== incomingString) {
          localStorage.setItem(STORAGE_KEYS.COMPANY, incomingString);
          window.dispatchEvent(new Event("corebit_company_details_updated"));
        }
      }
    }, (error) => {
      console.warn("Realtime sync warning for companyDetails:", error);
    });
  } catch (err) {
    console.error("Failed to start company details realtime sync:", err);
  }

  // 5. Home Settings Realtime Listener
  try {
    onSnapshot(doc(db, "homeSettings", "main"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const incomingString = JSON.stringify(data);
        lastSnapshotSync["homeSettings"] = incomingString;
        const currentLocal = localStorage.getItem("corebit_home_settings");
        if (currentLocal !== incomingString) {
          localStorage.setItem("corebit_home_settings", incomingString);
          window.dispatchEvent(new Event("corebit_home_settings_updated"));
        }
      }
    }, (error) => {
      console.warn("Realtime sync warning for homeSettings:", error);
    });
  } catch (err) {
    console.error("Failed to start home settings realtime sync:", err);
  }

  // 6. Roles Data Realtime Listener
  try {
    onSnapshot(collection(db, "rolesData"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      const incomingString = JSON.stringify(list);
      lastSnapshotSync["rolesData"] = incomingString;
      const currentLocal = localStorage.getItem("corebit_roles_data");
      if (currentLocal !== incomingString) {
        localStorage.setItem("corebit_roles_data", incomingString);
        window.dispatchEvent(new Event("corebit_roles_data_updated"));
      }
    }, (error) => {
      console.warn("Realtime sync warning for rolesData:", error);
    });
  } catch (err) {
    console.error("Failed to start roles data realtime sync:", err);
  }

  // 7. Nav Cards Realtime Listener
  try {
    onSnapshot(collection(db, "navCards"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      const incomingString = JSON.stringify(list);
      lastSnapshotSync["navCards"] = incomingString;
      const currentLocal = localStorage.getItem("corebit_nav_cards");
      if (currentLocal !== incomingString) {
        localStorage.setItem("corebit_nav_cards", incomingString);
        window.dispatchEvent(new Event("corebit_nav_cards_updated"));
      }
    }, (error) => {
      console.warn("Realtime sync warning for navCards:", error);
    });
  } catch (err) {
    console.error("Failed to start nav cards realtime sync:", err);
  }

  // 8. Contact Messages Realtime Listener
  try {
    onSnapshot(collection(db, "contactMessages"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      const sorted = list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
      const incomingString = JSON.stringify(sorted);
      lastSnapshotSync["contactMessages"] = incomingString;
      const currentLocal = localStorage.getItem("corebit_contact_messages");
      if (currentLocal !== incomingString) {
        localStorage.setItem("corebit_contact_messages", incomingString);
        window.dispatchEvent(new Event("corebit_contact_messages_updated"));
      }
    }, (error) => {
      console.warn("Realtime sync warning for contactMessages:", error);
    });
  } catch (err) {
    console.error("Failed to start contact messages realtime sync:", err);
  }

  // 9. Enquiries Realtime Listener
  try {
    onSnapshot(collection(db, "enquiries"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      const sorted = list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
      const incomingString = JSON.stringify(sorted);
      lastSnapshotSync["enquiries"] = incomingString;
      const currentLocal = localStorage.getItem("corebit_enquiries_list");
      if (currentLocal !== incomingString) {
        localStorage.setItem("corebit_enquiries_list", incomingString);
        window.dispatchEvent(new Event("corebit_enquiries_updated"));
      }
    }, (error) => {
      console.warn("Realtime sync warning for enquiries:", error);
    });
  } catch (err) {
    console.error("Failed to start enquiries realtime sync:", err);
  }

  // 10. Activity Logs Realtime Listener
  try {
    onSnapshot(collection(db, "activityLogs"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      const sorted = list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
      const incomingString = JSON.stringify(sorted);
      lastSnapshotSync["activityLogs"] = incomingString;
      const currentLocal = localStorage.getItem("corebit_activity_logs");
      if (currentLocal !== incomingString) {
        localStorage.setItem("corebit_activity_logs", incomingString);
        window.dispatchEvent(new Event("corebit_activity_logs_updated"));
      }
    }, (error) => {
      console.warn("Realtime sync warning for activityLogs:", error);
    });
  } catch (err) {
    console.error("Failed to start activity logs realtime sync:", err);
  }

  // 11. Footer Settings Realtime Listener
  try {
    onSnapshot(doc(db, "footerSettings", "main"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const incomingString = JSON.stringify(data);
        lastSnapshotSync["footerSettings"] = incomingString;
        const currentLocal = localStorage.getItem("corebit_footer_settings_v2");
        if (currentLocal !== incomingString) {
          localStorage.setItem("corebit_footer_settings_v2", incomingString);
          window.dispatchEvent(new Event("corebit_footer_settings_updated"));
        }
      }
    }, (error) => {
      console.warn("Realtime sync warning for footerSettings:", error);
    });
  } catch (err) {
    console.error("Failed to start footer settings realtime sync:", err);
  }
}

// Automatically start real-time updates as soon as dbService is loaded
if (isFirebaseConfigured) {
  setTimeout(() => {
    startRealtimeSync();
  }, 100);
}
