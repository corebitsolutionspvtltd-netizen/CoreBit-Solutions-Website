/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Trash2, Edit, Save, Undo, Check, Lock, Unlock, Settings, 
  Mail, Phone, Shield, Info, Calendar, Building2, ExternalLink, 
  Eye, RefreshCw, FileSpreadsheet, LayoutDashboard, LogOut, X,
  MapPin, Award, Terminal, DollarSign, ListChecks, AlertTriangle,
  Upload, Image as ImageIcon
} from "lucide-react";
import { 
  fetchProjects, saveProject, deleteProject,
  fetchReviews, saveReview, deleteReview,
  fetchPricingPlans, savePricingPlan, deletePricingPlan,
  fetchCompanyDetails, saveCompanyDetails, CompanyDetails,
  fetchContactMessages, deleteContactMessage, 
  fetchEnquiries, deleteEnquiry as deleteEnquiryCloud,
  fetchActivityLogs, saveActivityLog,
  getLatestFirestoreError,
  FirestoreDiagnosticError
} from "../firebase/dbService";
import { loginWithGoogle, logoutUser, subscribeToAuth } from "../firebase/authService";
import { Project, Review, PricingPlan } from "../types";
import { normalizeImageUrl, parseScreenshotLines } from "../utils/imageUtils";
import ImageUploaderGrid from "./ImageUploaderGrid";

type AdminTab = "projects" | "reviews" | "pricing" | "company" | "enquiries" | "contact_messages" | "activity_logs" | "firebase_sync";

export default function AdminView() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isLodingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Dynamic entity lists
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [contactMsgs, setContactMsgs] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const triggerConfirmation = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        try {
          await onConfirm();
        } catch (e) {
          console.error("Error in confirmation action:", e);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Modal / Form triggers
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);

  // Editing targets
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<PricingPlan> | null>(null);

  // Project form states
  const [projName, setProjName] = useState("");
  const [projCompany, setProjCompany] = useState("");
  const [projClient, setProjClient] = useState("");
  const [projStarted, setProjStarted] = useState("");
  const [projDelivered, setProjDelivered] = useState("");
  const [projValue, setProjValue] = useState("");
  const [projLocation, setProjLocation] = useState("");
  const [projOverview, setProjOverview] = useState("");
  const [projScreenshots, setProjScreenshots] = useState<string[]>([]);
  const [projStatus, setProjStatus] = useState<"draft" | "published">("published");

  // Review form states
  const [revAuthor, setRevAuthor] = useState("");
  const [revRole, setRevRole] = useState("");
  const [revCompany, setRevCompany] = useState("");
  const [revTitle, setRevTitle] = useState("");
  const [revComment, setRevComment] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revStatus, setRevStatus] = useState<"draft" | "published">("published");

  // Plan form states
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planPeriod, setPlanPeriod] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planFeatures, setPlanFeatures] = useState("");
  const [planPopular, setPlanPopular] = useState(false);
  const [planStatus, setPlanStatus] = useState<"draft" | "published">("published");

  // Company details form states
  const [compName, setCompName] = useState("");
  const [compMail, setCompMail] = useState("");
  const [compPhone, setCompPhone] = useState("");
  const [compAddress, setCompAddress] = useState("");
  const [compGst, setCompGst] = useState("");
  const [compUdyam, setCompUdyam] = useState("");

  // Custom Firebase Config Editor State
  const [firebaseApiKey, setFirebaseApiKey] = useState("");
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState("");
  const [firebaseProjectId, setFirebaseProjectId] = useState("");
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState("");
  const [firebaseSenderId, setFirebaseSenderId] = useState("");
  const [firebaseAppId, setFirebaseAppId] = useState("");
  const [firebaseMeasurementId, setFirebaseMeasurementId] = useState("");
  const [lastFsError, setLastFsError] = useState<FirestoreDiagnosticError | null>(null);

  useEffect(() => {
    const checkError = () => {
      setLastFsError(getLatestFirestoreError());
    };
    checkError();
    window.addEventListener("corebit_firestore_error_updated", checkError);
    return () => {
      window.removeEventListener("corebit_firestore_error_updated", checkError);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("corebit_firebase_custom_config");
      if (saved) {
        const obj = JSON.parse(saved);
        setFirebaseApiKey(obj.apiKey || "");
        setFirebaseAuthDomain(obj.authDomain || "");
        setFirebaseProjectId(obj.projectId || "");
        setFirebaseStorageBucket(obj.storageBucket || "");
        setFirebaseSenderId(obj.messagingSenderId || "");
        setFirebaseAppId(obj.appId || "");
        setFirebaseMeasurementId(obj.measurementId || "");
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Subscribe to Auth State Changes
  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribe = subscribeToAuth((user, isAdmin) => {
      setCurrentUser(user);
      setIsAuthenticated(isAdmin);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all database state items when authenticated
  const loadDatabaseState = async () => {
    if (!isAuthenticated) return;
    setIsDataLoading(true);
    try {
      const [projList, revList, plansList, companyDetails, msgsList, enqsList, logsList] = await Promise.all([
        fetchProjects(),
        fetchReviews(),
        fetchPricingPlans(),
        fetchCompanyDetails(),
        fetchContactMessages(),
        fetchEnquiries(),
        fetchActivityLogs()
      ]);
      setProjects(projList);
      setReviews(revList);
      setPlans(plansList);
      setCompany(companyDetails);
      setContactMsgs(msgsList || []);
      setEnquiries(enqsList || []);
      setActivityLogs(logsList || []);
      
      if (companyDetails) {
        setCompName(companyDetails.corporateName);
        setCompMail(companyDetails.email);
        setCompPhone(companyDetails.phone);
        setCompAddress(companyDetails.address);
        setCompGst(companyDetails.gst);
        setCompUdyam(companyDetails.udyam);
      }
    } catch (e) {
      console.error("Error fetching admin views configuration:", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDatabaseState();
    }
  }, [isAuthenticated]);

  // Sign In Trigger
  const handleGoogleSignIn = async () => {
    setAuthError("");
    const res = await loginWithGoogle();
    if (res.error) {
      setAuthError(res.error);
    }
  };

  const handleEmailPasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;
    if (email === "corebitsolutionspvtltd@gmail.com" && (password === "CoreBitSolutions123#" || password === "corebitsolutions123#")) {
      const mockUser = {
        uid: "corebit-admin-uid-999",
        email: "corebitsolutionspvtltd@gmail.com",
        displayName: "CoreBit Solutions Pvtltd Admin",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        emailVerified: true
      };
      sessionStorage.setItem("corebit_mock_user", JSON.stringify(mockUser));
      localStorage.setItem("corebit_mock_user", JSON.stringify(mockUser));
      localStorage.setItem("corebit_admin_mode", "true");
      localStorage.setItem("cbit_admin_access", "true");
      window.dispatchEvent(new Event("corebit_admin_mode_changed"));
    } else {
      setAuthError("Incorrect Email ID or Password. Please try again with valid credentials.");
    }
  };

  // Sign Out Trigger
  const handleSignOut = async () => {
    await logoutUser();
  };

  /**
   * PROJECTS CRUD ACTIONS
   */
  const handleAddProjectClick = () => {
    setEditingProject(null);
    setProjName("");
    setProjCompany("");
    setProjClient("");
    setProjStarted("");
    setProjDelivered("");
    setProjValue("");
    setProjLocation("");
    setProjOverview("");
    setProjScreenshots([]);
    setProjStatus("published");
    setShowProjectForm(true);
  };

  const handleEditProjectClick = (proj: Project) => {
    setEditingProject(proj);
    setProjName(proj.projectName);
    setProjCompany(proj.companyName);
    setProjClient(proj.clientName);
    setProjStarted(proj.startedDate);
    setProjDelivered(proj.deliveredDate);
    setProjValue(proj.paymentDetails?.totalAmount || "");
    setProjLocation(proj.paymentDetails?.billingAddress || "");
    setProjOverview(proj.projectOverview || "");
    setProjScreenshots(proj.screenshots || []);
    setProjStatus(proj.status || "published");
    setShowProjectForm(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = projScreenshots.map(u => normalizeImageUrl(u.trim())).filter(Boolean);
    const payload: Partial<Project> = {
      projectName: projName,
      companyName: projCompany,
      clientName: projClient,
      startedDate: projStarted,
      deliveredDate: projDelivered,
      projectOverview: projOverview,
      status: projStatus,
      screenshots: urls.length > 0 ? urls : [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
      ],
      paymentDetails: {
        totalAmount: projValue || "₹0.00",
        pricingTier: "Bespoke Enterprise Group Integration",
        paymentStatus: "Paid in Full",
        paymentMethod: "ACH Wire Transfer (Institutional)",
        billingAddress: projLocation || "N/A"
      }
    };

    const isEdit = !!editingProject?.id;
    if (isEdit) {
      payload.id = editingProject!.id;
    }

    const saved = await saveProject(payload);
    
    // Audit Logging
    const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
    const logAction = isEdit ? "Update Project Blueprint" : "Create Project Blueprint";
    await saveActivityLog(
      logAction, 
      email, 
      "projects", 
      saved.id || "unknown", 
      isEdit ? editingProject : null, 
      saved
    );

    setShowProjectForm(false);
    loadDatabaseState();
  };

  const handleProjectDelete = (id: string) => {
    triggerConfirmation(
      "Delete Project Blueprint",
      "Are you absolutely sure you want to permanently delete this corporate delivered project? This will update all cloud Firestore metrics.",
      async () => {
        const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
        const oldProject = projects.find(p => p.id === id);
        
        await deleteProject(id);
        
        // Audit Logging
        await saveActivityLog(
          "Delete Project Blueprint", 
          email, 
          "projects", 
          id, 
          oldProject, 
          null
        );

        loadDatabaseState();
      }
    );
  };

  /**
   * REVIEWS CRUD ACTIONS
   */
  const handleAddReviewClick = () => {
    setEditingReview(null);
    setRevAuthor("");
    setRevRole("");
    setRevCompany("");
    setRevTitle("");
    setRevComment("");
    setRevRating(5);
    setRevStatus("published");
    setShowReviewForm(true);
  };

  const handleEditReviewClick = (rev: Review) => {
    setEditingReview(rev);
    setRevAuthor(rev.authorName);
    setRevRole(rev.authorRole);
    setRevCompany(rev.companyName);
    setRevTitle(rev.projectTitle || "");
    setRevComment(rev.comment);
    setRevRating(rev.rating);
    setRevStatus(rev.status || "published");
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Review> = {
      authorName: revAuthor,
      authorRole: revRole,
      companyName: revCompany,
      projectTitle: revTitle,
      comment: revComment,
      rating: revRating,
      status: revStatus,
      avatar: editingReview?.avatar || ""
    };

    const isEdit = !!editingReview?.id;
    if (isEdit) {
      payload.id = editingReview!.id;
    }

    const saved = await saveReview(payload);

    // Audit Logging
    const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
    const logAction = isEdit ? "Update Client Testimony" : "Create Client Testimony";
    await saveActivityLog(
      logAction, 
      email, 
      "reviews", 
      saved.id || "unknown", 
      isEdit ? editingReview : null, 
      saved
    );

    setShowReviewForm(false);
    loadDatabaseState();
  };

  const handleReviewDelete = (id: string) => {
    triggerConfirmation(
      "Delete Client Testimony",
      "Are you sure you want to permanently delete this client review from the database? This action is irreversible.",
      async () => {
        const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
        const oldReview = reviews.find(r => r.id === id);

        await deleteReview(id);

        // Audit Logging
        await saveActivityLog(
          "Delete Client Testimony", 
          email, 
          "reviews", 
          id, 
          oldReview, 
          null
        );

        loadDatabaseState();
      }
    );
  };

  /**
   * PRICING CRUD ACTIONS
   */
  const handleAddPlanClick = () => {
    setEditingPlan(null);
    setPlanName("");
    setPlanPrice("");
    setPlanPeriod("full build");
    setPlanDesc("");
    setPlanFeatures("");
    setPlanPopular(false);
    setPlanStatus("published");
    setShowPlanForm(true);
  };

  const handleEditPlanClick = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(plan.price);
    setPlanPeriod(plan.period);
    setPlanDesc(plan.description);
    setPlanFeatures(plan.features.join("\n"));
    setPlanPopular(!!plan.isPopular);
    setPlanStatus(plan.status || "published");
    setShowPlanForm(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fts = planFeatures.split("\n").map(f => f.trim()).filter(Boolean);
    const payload: Partial<PricingPlan> = {
      name: planName,
      price: planPrice,
      period: planPeriod,
      description: planDesc,
      features: fts,
      isPopular: planPopular,
      status: planStatus
    };

    const isEdit = !!editingPlan?.id;
    if (isEdit) {
      payload.id = editingPlan!.id;
    }

    const saved = await savePricingPlan(payload);

    // Audit Logging
    const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
    const logAction = isEdit ? "Update Pricing Plan" : "Create Pricing Plan";
    await saveActivityLog(
      logAction, 
      email, 
      "pricingPlans", 
      saved.id || "unknown", 
      isEdit ? editingPlan : null, 
      saved
    );

    setShowPlanForm(false);
    loadDatabaseState();
  };

  const handlePlanDelete = (id: string) => {
    triggerConfirmation(
      "Delete Pricing Plan",
      "Are you sure you want to permanently delete this custom pricing plan structure?",
      async () => {
        const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
        const oldPlan = plans.find(p => p.id === id);

        await deletePricingPlan(id);

        // Audit Logging
        await saveActivityLog(
          "Delete Pricing Plan", 
          email, 
          "pricingPlans", 
          id, 
          oldPlan, 
          null
        );

        loadDatabaseState();
      }
    );
  };

  /**
   * COMPANY DETAILS SAVE
   */
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CompanyDetails = {
      corporateName: compName,
      email: compMail,
      phone: compPhone,
      address: compAddress,
      gst: compGst,
      udyam: compUdyam
    };

    const oldCompany = company;
    await saveCompanyDetails(payload);

    // Audit Logging
    const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
    await saveActivityLog(
      "Update Company Details", 
      email, 
      "companyDetails", 
      "main", 
      oldCompany, 
      payload
    );

    alert("Corporate Legal Coordinates successfully saved to cloud database.");
    loadDatabaseState();
  };

  /**
   * MESSAGES & INTAKE PURGES
   */
  const deleteInboxMessage = (id: string) => {
    triggerConfirmation(
      "Resolve Inbox Message",
      "Are you sure you want to resolve and archive this client inbox registration message?",
      async () => {
        const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
        const oldMsg = contactMsgs.find(m => m.id === id);

        await deleteContactMessage(id);

        // Audit Logging
        await saveActivityLog(
          "Resolve Inbox Message", 
          email, 
          "contactMessages", 
          id, 
          oldMsg, 
          null
        );

        loadDatabaseState();
      }
    );
  };

  const deleteEnquiry = (id: string) => {
    triggerConfirmation(
      "Resolve Intake Enquiry",
      "Are you sure you want to resolve and clear this incoming corporate intake blueprint statement?",
      async () => {
        const email = currentUser?.email || "corebitsolutionspvtltd@gmail.com";
        const oldEnq = enquiries.find(e => e.referenceId === id || e.id === id);

        await deleteEnquiryCloud(id);

        // Audit Logging
        await saveActivityLog(
          "Resolve Intake Enquiry", 
          email, 
          "enquiries", 
          id, 
          oldEnq, 
          null
        );

        loadDatabaseState();
      }
    );
  };

  return (
    <div className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-[70vh]">
      
      {/* Outer Banner Segment */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Shield className="w-3.5 h-3.5 text-orange-400" />
          Secure Gate Node
        </motion.div>
        
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
          Institutional <span className="text-orange-400">Admin Control</span> Panel
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm font-sans mt-2">
          Encrypted database syncing and portal management exclusively for corebitsolutionspvtltd@gmail.com and authorized coordinate partners.
        </p>
      </div>

      {isLodingAuth ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">Verifying Cryptographic Credentials...</span>
        </div>
      ) : !isAuthenticated ? (
        // EMAIL & PASSWORD SIGN IN FORM CARD
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto p-8 rounded-3xl bg-[#0d1321]/95 border border-white/10 backdrop-blur-md shadow-2xl relative text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-orange-400" />
          </div>

          <h3 className="font-display text-lg font-black text-white uppercase tracking-wider text-center">
            Operator Verification Required
          </h3>
          <p className="text-slate-400 text-xs mt-2 mb-6 font-sans leading-relaxed text-center">
            Please enter your administrative credentials to securely access data synchronization streams and management pipelines.
          </p>

          <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#94a3b8] mb-1.5">
                Admin Email ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-orange-500/50 transition-colors"
                  required
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#94a3b8] mb-1.5">
                Secure Key Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-orange-500/50 transition-colors"
                  required
                />
                <Shield className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-semibold leading-relaxed font-sans">
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-sans text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-orange-500/10"
            >
              <Unlock className="w-4 h-4" />
              <span>Verify & Unshackle Portal</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              Authorized access restricted to: <strong className="text-orange-400/80">corebitsolutionspvtltd@gmail.com</strong>
            </p>
          </div>
        </motion.div>
      ) : (
        // COMPLETE MASTER ADMIN PANEL
        <div className="space-y-8 animate-fadeIn">
          {localStorage.getItem("corebit_force_simulation") === "true" && (
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-orange-400 block uppercase tracking-wider text-[10px] leading-tight font-mono">🚀 Interactive Sandbox Mode Active</span>
                  <p className="text-slate-350 text-xs mt-0.5 leading-relaxed font-sans">
                    The system is currently running in local-persistence sandbox mode. Data modifications, message logs, and reviews are saved instantly. If your project coordinates are ready, you can return to production database synchronization.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("corebit_force_simulation");
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98] select-none shrink-0"
              >
                Sync Live Cloud
              </button>
            </div>
          )}
          {/* Header Dashboard Banner */}
          <div className="p-6 rounded-3xl bg-[#0d1321] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-orange-500/30 overflow-hidden shrink-0 shadow-lg">
                <img 
                  src={currentUser?.photoURL || "https://images.unsplash.com/photo-1570295999915-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"} 
                  alt="Administrator Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">{currentUser?.displayName || "Sairaj Vikas A"}</h3>
                <span className="block font-mono text-[9px] text-orange-400 uppercase font-black tracking-widest">Global ROOT ADMINISTRATOR • ACTIVE</span>
                <span className="block font-sans text-[10px] text-slate-400 mt-0.5">{currentUser?.email}</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              Secure LogOut
            </button>
          </div>

          {/* Tab Navigation Menu */}
          <div className="flex flex-wrap gap-2.5 border-b border-white/10 pb-4 justify-center md:justify-start">
            {(
              [
                { id: "projects", label: "Corporate Projects", icon: FileSpreadsheet },
                { id: "reviews", label: "Client Reviews", icon: Award },
                { id: "pricing", label: "Pricing Structures", icon: DollarSign },
                { id: "company", label: "Organizational Summary", icon: Building2 },
                { id: "enquiries", label: "Project Intake Statements", icon: Terminal },
                { id: "contact_messages", label: "Contact Inbox Messages", icon: Mail },
                { id: "activity_logs", label: "CMS Audit History", icon: ListChecks },
                { id: "firebase_sync", label: "Firebase Rules & Credentials", icon: Settings }
              ] as const
            ).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-orange-500 text-white border-orange-400 shadow-[0_4px_12px_-3px_rgba(249,115,22,0.3)]"
                      : "bg-[#0d1321] text-slate-350 border-white/5 hover:border-white/15 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* MAIN TABS SWITCH */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative min-h-[40vh]">
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <RefreshCw className="w-7 h-7 text-orange-500 animate-spin" />
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">Syncing Cloud Entities...</span>
              </div>
            ) : (
              <div>
                {/* 1. DELIVERED PROJECTS TAB */}
                {activeTab === "projects" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <FileSpreadsheet className="w-5 h-5 text-orange-400" /> Dynamic delivered projects
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Changes made here instantly publish to the front delivered blueprints showcase.</p>
                      </div>
                      <button
                        onClick={handleAddProjectClick}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-650 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Blueprint
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map(proj => (
                        <div key={proj.id} className="p-5 rounded-2xl bg-[#0d1321]/80 border border-white/5 hover:border-white/10 flex justify-between items-start gap-4 transition-all">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest">{proj.companyName}</span>
                            <h4 className="font-sans text-sm font-bold text-white uppercase mt-0.5 tracking-wider">{proj.projectName}</h4>
                            <p className="text-slate-405 text-xs line-clamp-2 mt-1 leading-relaxed font-sans">{proj.projectOverview}</p>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              <span className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-orange-300 font-bold uppercase">{proj.paymentDetails?.totalAmount || "₹0.00"}</span>
                              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Delivered: {proj.deliveredDate}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleEditProjectClick(proj)}
                              className="p-1.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleProjectDelete(proj.id)}
                              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-550 hover:text-white transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {projects.length === 0 && (
                      <div className="text-center py-16 text-slate-550">No blueprints database rows found. Add your first record.</div>
                    )}
                  </div>
                )}

                {/* 2. CLIENT REVIEWS TAB */}
                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Award className="w-5 h-5 text-orange-400" /> Client Testimonials Database
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Add, edit or delete reviews displayed globally across modern reviewer layouts.</p>
                      </div>
                      <button
                        onClick={handleAddReviewClick}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-650 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Testimony
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.map(rev => (
                        <div key={rev.id} className="p-5 rounded-2xl bg-[#0d1321]/80 border border-white/5 hover:border-white/10 flex justify-between items-start gap-4 transition-all">
                          <div>
                            <div className="flex items-center gap-1 mb-1 shadow-sm">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < rev.rating ? "text-orange-400 fill-orange-400" : "text-white/15"}`} viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              ))}
                            </div>
                            <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider">{rev.authorName}</h4>
                            <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">{rev.authorRole} • {rev.companyName}</span>
                            <p className="text-slate-405 text-xs line-clamp-3 mt-2 leading-relaxed italic font-sans">"{rev.comment}"</p>
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleEditReviewClick(rev)}
                              className="p-1.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReviewDelete(rev.id)}
                              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-550 hover:text-white transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {reviews.length === 0 && (
                      <div className="text-center py-16 text-slate-550">No testimonies found. Add standard elements.</div>
                    )}
                  </div>
                )}

                {/* 3. PRICING PLANS TAB */}
                {activeTab === "pricing" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-orange-400" /> Pricing plans structures
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Configure pricing plans details, periodic timelines and service checklists dynamic tags.</p>
                      </div>
                      <button
                        onClick={handleAddPlanClick}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-650 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Pricing Tier
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plans.map(plan => (
                        <div key={plan.id} className="p-5 rounded-2xl bg-[#0d1321]/80 border border-white/5 hover:border-white/10 flex justify-between items-start gap-4 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider">{plan.name}</h4>
                              {plan.isPopular && <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-mono font-black text-[7px] uppercase tracking-widest border border-orange-500/20">Popular</span>}
                            </div>
                            <span className="block text-sm font-mono text-orange-450 font-bold mt-1 uppercase tracking-tight">{plan.price} <span className="text-[10px] text-slate-500 font-normal"> / {plan.period}</span></span>
                            <p className="text-slate-400 text-xs mt-1.5">{plan.description}</p>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-black mt-2 leading-none font-mono">Checklist Items: {plan.features.length} features</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleEditPlanClick(plan)}
                              className="p-1.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePlanDelete(plan.id)}
                              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-555 hover:text-white transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {plans.length === 0 && (
                      <div className="text-center py-16 text-slate-550">No pricing plans found. Create accelerator presets.</div>
                    )}
                  </div>
                )}

                {/* 4. COMPANY DETAILS TAB */}
                {activeTab === "company" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-orange-400" /> Organizational Summary & Registered Credentials
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">Manage institutional details, registered legal name, GST, and Gov. UDYAM Registration Numbers.</p>
                    </div>

                    <form onSubmit={handleCompanySubmit} className="space-y-5 max-w-2xl bg-[#0d1321]/60 p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Corporate name</label>
                          <input 
                            type="text" 
                            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                            placeholder="Corporate Legal Entity Name"
                            value={compName}
                            onChange={(e) => setCompName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Primary Email contact</label>
                          <input 
                            type="email" 
                            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                            placeholder="Legal Partner Email Coordinates"
                            value={compMail}
                            onChange={(e) => setCompMail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Corporate Primary Phone</label>
                          <input 
                            type="text" 
                            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                            placeholder="Direct Client Line"
                            value={compPhone}
                            onChange={(e) => setCompPhone(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">GST identification code</label>
                          <input 
                            type="text" 
                            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                            placeholder="33AABCC1234F1Z1"
                            value={compGst}
                            onChange={(e) => setCompGst(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Gov. UDYAM Registration Certificate Number</label>
                        <input 
                          type="text" 
                          className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                          placeholder="UDYAM-TN-XX-XXXXXXX"
                          value={compUdyam}
                          onChange={(e) => setCompUdyam(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Corporate Office Registered Address</label>
                        <textarea 
                          rows={2}
                          className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500 resize-none"
                          placeholder="Full Postal Office Physical Location"
                          value={compAddress}
                          onChange={(e) => setCompAddress(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-650 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all"
                      >
                        <Save className="w-4 h-4" /> Save Corporate Credentials
                      </button>
                    </form>
                  </div>
                )}

                {/* 5. PROJECT INTAKE STATEMENTS (ENQUIRIES) TAB */}
                {activeTab === "enquiries" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-orange-400" /> Dispatch incoming blueprints
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">Monitor real-time project blueprints and budget-configured intake sheets submitted by clients.</p>
                    </div>

                    <div className="space-y-4">
                      {enquiries.map(enq => (
                        <div key={enq.referenceId || enq.id} className="p-6 rounded-2xl bg-[#0d1321]/80 border border-white/10 hover:border-white/15 transition-all shadow-md relative">
                          <button
                            onClick={() => deleteEnquiry(enq.referenceId || enq.id)}
                            className="absolute top-4 right-4 p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer"
                            title="Clear statement"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                            <div className="space-y-1">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase font-black tracking-wider leading-none">Reference Ingress code</span>
                              <span className="block font-mono text-xs font-black text-orange-300 uppercase tracking-wider">{enq.referenceId || "N/A"}</span>
                              <span className="block text-[10px] text-slate-400 font-sans mt-2">{enq.timestamp || "N/A"}</span>
                            </div>

                            <div className="space-y-1">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase font-black tracking-wider leading-none">Investor Details</span>
                              <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider">{enq.clientName}</h4>
                              <a href={`mailto:${enq.clientEmail}`} className="block text-xs text-orange-400 font-sans hover:underline break-all">{enq.clientEmail}</a>
                              {enq.clientPhone && (
                                <span className="block text-xs text-amber-300 font-mono">📱 {enq.clientPhone}</span>
                              )}
                              <span className="block text-xs text-slate-300 font-sans">{enq.companyName || "No Company Specified"}</span>
                            </div>

                            <div className="space-y-1 md:border-l md:border-white/5 md:pl-4">
                              <span className="block text-[8px] font-mono text-slate-501 uppercase font-black tracking-wider leading-none">Configurations</span>
                              <span className="block text-xs font-bold text-slate-205">Service Line: <span className="text-white">{enq.serviceLine}</span></span>
                              <span className="block text-xs font-bold text-slate-205">Allocated Budget: <span className="text-orange-400 font-mono">{enq.budgetRange}</span></span>
                              <span className="block text-xs font-bold text-slate-205">Deploy Timeframe: <span className="text-sky-400">{enq.timeline}</span></span>
                            </div>
                          </div>

                          {enq.notes && (
                            <div className="mt-4 border-t border-white/5 pt-3">
                              <span className="block text-[8px] font-mono text-slate-501 uppercase font-bold tracking-wider mb-1 leading-none">Administrator Checklist Notes</span>
                              <p className="text-slate-300 text-xs leading-relaxed max-w-4xl break-words whitespace-pre-wrap">{enq.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}

                      {enquiries.length === 0 && (
                        <div className="text-center py-20 text-slate-550 border border-dashed border-white/5 rounded-2xl select-none">No client project blueprints received. Direct client targets to Business Enquiries.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. CONTACT MESSAGES TAB */}
                {activeTab === "contact_messages" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-5 h-5 text-orange-400" /> Incoming contact messages inbox
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">Monitor short direct messages and consultation inquiries entered at the Contact page.</p>
                    </div>

                    <div className="space-y-4">
                      {contactMsgs.map(msg => (
                        <div key={msg.id} className="p-5 rounded-2xl bg-[#0d1321]/80 border border-white/5 hover:border-white/10 transition-all relative">
                          <button
                            onClick={() => deleteInboxMessage(msg.id)}
                            className="absolute top-4 right-4 p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer shadow-sm"
                            title="Resolve Message"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-white/5 pr-4">
                              <span className="block text-[8px] font-mono text-slate-510 uppercase font-bold tracking-widest leading-none">Sender Address Code</span>
                              <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider truncate mt-1.5">{msg.name}</h4>
                              <span className="block text-[10px] text-slate-450 mt-1 truncate">{msg.email}</span>
                              {msg.phone && (
                                <span className="block text-[11px] text-amber-300 font-mono mt-1">📱 {msg.phone}</span>
                              )}
                              <span className="block text-[9px] font-mono text-slate-550 mt-2">{msg.timestamp}</span>
                            </div>

                            <div className="md:col-span-3">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase font-black tracking-wider leading-none">Subject line</span>
                              <span className="block text-xs font-bold text-orange-300 mt-1 uppercase tracking-tight">{msg.subject}</span>
                              <p className="text-slate-205 text-xs font-sans leading-relaxed mt-2.5 max-w-4xl whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {contactMsgs.length === 0 && (
                        <div className="text-center py-20 text-slate-550 border border-dashed border-white/5 rounded-2xl select-none">Corporate mail channels clear. No pending messages.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. CMS AUDIT HISTORY (ACTIVITY LOGS) TAB */}
                {activeTab === "activity_logs" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-orange-400" /> CMS Audit History & Version Logs
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">
                        Track additions, updates, deletions, and company coordinates adjustments in real-time. Click to compare oldValue vs. newValue.
                      </p>
                    </div>

                    <div className="space-y-4 font-sans">
                      {activityLogs.map((log, index) => {
                        const hasValues = log.oldValue || log.newValue;
                        return (
                          <div key={log.id || index} className="p-5 rounded-2xl bg-[#0d1321]/80 border border-white/5 hover:border-white/10 transition-all text-left">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest leading-none">
                                  #{activityLogs.length - index}
                                </span>
                                <span className="inline-block px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-extrabold uppercase tracking-wider text-orange-400 leading-none">
                                  {log.action}
                                </span>
                                <span className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-slate-405 leading-none">
                                  {log.collection}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-450 font-mono">
                                {log.timestamp}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-t border-b border-white/5 text-xs text-slate-300">
                              <div>
                                <span className="text-[9px] font-mono uppercase text-slate-500 block leading-none mb-1">Operator Email</span>
                                <span className="font-medium text-slate-200">{log.user || log.userEmail || "System"}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-mono uppercase text-slate-500 block leading-none mb-1">Document reference</span>
                                <span className="font-mono text-[10px] font-semibold text-slate-300 truncate block">{log.documentId || "none"}</span>
                              </div>
                              <div className="flex justify-end items-center">
                                {hasValues && (
                                  <button
                                    onClick={() => {
                                      // Toggle expanded log using custom field tracking on document id
                                      const el = document.getElementById(`details-${log.id}`);
                                      if (el) {
                                        el.classList.toggle("hidden");
                                      }
                                    }}
                                    className="px-3 py-1 rounded bg-orange-500/10 hover:bg-orange-500 hover:text-white border border-orange-500/20 text-[10px] font-extrabold uppercase tracking-wider text-orange-400 transition-all cursor-pointer shadow-sm"
                                  >
                                    View Version Payload
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Collapsible details container */}
                            <div id={`details-${log.id}`} className="mt-4 pt-3 border-t border-white/5 space-y-4 hidden">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.oldValue && (
                                  <div className="space-y-1.5">
                                    <span className="text-[9.5px] uppercase font-mono font-bold text-red-400 block tracking-widest">◀ OLD VALUE (History Snapshot)</span>
                                    <pre className="font-mono text-[9.5px] text-slate-350 bg-red-950/15 border border-red-500/10 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                                      {log.oldValue}
                                    </pre>
                                  </div>
                                )}
                                {log.newValue && (
                                  <div className="space-y-1.5">
                                    <span className="text-[9.5px] uppercase font-mono font-bold text-emerald-400 block tracking-widest">▶ NEW VALUE (Incoming Target)</span>
                                    <pre className="font-mono text-[9.5px] text-slate-300 bg-emerald-950/15 border border-emerald-500/10 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                                      {log.newValue}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {activityLogs.length === 0 && (
                        <div className="text-center py-20 text-slate-550 border border-dashed border-white/5 rounded-2xl select-none">
                          No CMS synchronization actions are logged/retained in history.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. FIREBASE CONNECTION DIAGNOSTICS & SYNC TAB */}
                {activeTab === "firebase_sync" && (
                  <div className="space-y-8 animate-fadeIn text-left">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Settings className="w-5 h-5 text-orange-400" /> Firebase Cloud Sync Diagnostics
                        </h2>
                        <p className="text-slate-400 text-xs mt-1 font-sans">
                          Diagnose, configure, and connect your live Google Firebase Firestore project to CoreBit Solutions.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                      {/* Left: General Connectivity & Live Diagnostics */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#0b0e14]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-2 font-mono">
                            📡 Real-Time Diagnostic Feed
                          </h3>

                          <div className="space-y-3.5 text-xs">
                            {/* Connection Indicator */}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-medium">Database state:</span>
                              {localStorage.getItem("corebit_force_simulation") === "true" ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 font-extrabold uppercase">
                                  🟡 Sandbox Mode (Local)
                                </span>
                              ) : localStorage.getItem("corebit_firebase_custom_config") ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-extrabold uppercase">
                                  🟢 Live Sync Config
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 font-extrabold uppercase">
                                  🔵 Boilerplate Default
                                </span>
                              )}
                            </div>

                            {/* Client Connectivity status */}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-medium">Network adapter:</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-extrabold uppercase">
                                🟢 Client Online
                              </span>
                            </div>

                            {/* App ID */}
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-400 font-medium font-sans">Active project ID:</span>
                              <span className="text-slate-300 font-bold max-w-[150px] truncate">
                                {firebaseProjectId || "corebit-solutions"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Firestore error diagnostics */}
                        <div className="bg-[#0b0e14]/50 border border-white/5 rounded-2xl p-5 space-y-3">
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-2 font-mono">
                            ⚠️ Last Captured Exception
                          </h3>

                          {lastFsError ? (
                            <div className="space-y-2.5">
                              <div className="p-3 bg-red-950/20 border border-red-500/25 rounded-xl text-xs text-red-300 font-mono leading-relaxed break-all">
                                <strong className="text-rose-400 font-bold block mb-1">Firestore Error code: {lastFsError.code || "unknown"}</strong>
                                {lastFsError.message}
                              </div>
                              <span className="block text-[9px] font-mono text-slate-500">
                                Logged at: {new Date(lastFsError.timestamp).toLocaleTimeString()}
                              </span>
                              <button
                                onClick={() => {
                                  localStorage.removeItem("corebit_firestore_last_error");
                                  setLastFsError(null);
                                }}
                                className="w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white uppercase tracking-wider font-mono cursor-pointer transition-colors"
                              >
                                Clear error state
                              </button>
                            </div>
                          ) : (
                            <div className="py-4 text-center">
                              <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                                <Check className="w-4 h-4" /> NO WRITE ERRORS CAPTURED
                              </span>
                              <p className="text-slate-500 text-[10px] mt-1 select-none leading-relaxed">
                                Messages and inquiries are logging cleanly, or local sandbox rendering has bypassed remote connection checks.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Admin Rules Warning & Helper */}
                        <div className="bg-slate-900/45 border border-white/5 rounded-2xl p-5 space-y-3 font-sans">
                          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-widest font-mono">🔐 Firestore Security Rules</span>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            If you created a new Firestore database in <strong>Production Mode</strong>, Google blocks all guest client writes. You must paste the following Rules in your Firebase console under the <strong>Rules tab</strong> to allow visitor forms to submit correctly.
                          </p>
                          <div className="relative pt-1">
                            <pre className="p-3 bg-black/40 border border-white/5 text-[9px] font-mono text-slate-300 rounded-xl max-h-40 overflow-y-auto whitespace-pre leading-relaxed select-all">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public contact messages rules
    match /contactMessages/{messageId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null 
        && (request.auth.token.email == "corebitsolutionspvtltd@gmail.com" || request.auth.token.email == "${currentUser?.email || 'sairajvikas30@gmail.com'}");
    }

    // Public intake enquiries rules
    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null 
        && (request.auth.token.email == "corebitsolutionspvtltd@gmail.com" || request.auth.token.email == "${currentUser?.email || 'sairajvikas30@gmail.com'}");
    }

    // General app read/writes
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && (request.auth.token.email == "corebitsolutionspvtltd@gmail.com" || request.auth.token.email == "${currentUser?.email || 'sairajvikas30@gmail.com'}");
    }
  }
}`}
                            </pre>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public contact messages rules
    match /contactMessages/{messageId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null 
        && (request.auth.token.email == "corebitsolutionspvtltd@gmail.com" || request.auth.token.email == "${currentUser?.email || 'sairajvikas30@gmail.com'}");
    }

    // Public intake enquiries rules
    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null 
        && (request.auth.token.email == "corebitsolutionspvtltd@gmail.com" || request.auth.token.email == "${currentUser?.email || 'sairajvikas30@gmail.com'}");
    }

    // General app read/writes
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && (request.auth.token.email == "corebitsolutionspvtltd@gmail.com" || request.auth.token.email == "${currentUser?.email || 'sairajvikas30@gmail.com'}");
    }
  }
}`);
                                alert("Firestore security rules copied successfully!");
                              }}
                              className="w-full mt-2 py-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-400 hover:text-white border border-orange-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                              📋 Copy Firebase Rules Text
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Custom Config Sync Manager Form */}
                      <div className="lg:col-span-2 space-y-6 animate-fadeIn">
                        <div className="bg-[#0b0e14]/50 border border-white/5 rounded-2xl p-6 space-y-5">
                          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-3">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                              🔑 Sync Custom Firebase Project Credentials
                            </h3>
                            {localStorage.getItem("corebit_firebase_custom_config") ? (
                              <button
                                onClick={() => {
                                  triggerConfirmation(
                                    "Disconnect Customized Project",
                                    "Disconnect customized project keys and revert back to standard demo coordinates?",
                                    () => {
                                      localStorage.removeItem("corebit_firebase_custom_config");
                                      window.location.reload();
                                    }
                                  );
                                }}
                                className="px-3 py-1 bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all font-sans"
                              >
                                Disconnect Customized Project
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 text-slate-500 rounded-lg text-[9px] font-bold uppercase tracking-wider font-sans select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                No Custom Project Connected
                              </div>
                            )}
                          </div>

                          <p className="text-slate-305 text-xs leading-relaxed font-sans">
                            Paste your Firebase Web credentials copy-pasted directly from your <strong>Firebase Console Settings &gt; General &gt; Your Apps &gt; Web Apps</strong> config. Re-keying this config connects the active client to your live databases instantly without any redeployment.
                          </p>

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] uppercase font-bold text-slate-450 tracking-wider">Web API Key (apiKey) *</label>
                                <input
                                  type="text"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-orange-500"
                                  placeholder="AIzaSy..."
                                  value={firebaseApiKey}
                                  onChange={(e) => setFirebaseApiKey(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] uppercase font-bold text-slate-450 tracking-wider">Firebase Auth Domain *</label>
                                <input
                                  type="text"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-orange-500"
                                  placeholder="corebit-solutions.firebaseapp.com"
                                  value={firebaseAuthDomain}
                                  onChange={(e) => setFirebaseAuthDomain(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] uppercase font-bold text-slate-450 tracking-wider">Google Project ID (projectId) *</label>
                                <input
                                  type="text"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-orange-500"
                                  placeholder="corebit-solutions"
                                  value={firebaseProjectId}
                                  onChange={(e) => setFirebaseProjectId(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] uppercase font-bold text-slate-450 tracking-wider">Storage Bucket (storageBucket)</label>
                                <input
                                  type="text"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-orange-500"
                                  placeholder="corebit-solutions.firebasestorage.app"
                                  value={firebaseStorageBucket}
                                  onChange={(e) => setFirebaseStorageBucket(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] uppercase font-bold text-slate-450 tracking-wider">Messaging Sender ID (messagingSenderId)</label>
                                <input
                                  type="text"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-orange-500"
                                  placeholder="1083734078716"
                                  value={firebaseSenderId}
                                  onChange={(e) => setFirebaseSenderId(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] uppercase font-bold text-slate-450 tracking-wider">Web Application ID (appId) *</label>
                                <input
                                  type="text"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-orange-500"
                                  placeholder="1:1083734078716:web:a26dbbf..."
                                  value={firebaseAppId}
                                  onChange={(e) => setFirebaseAppId(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] uppercase font-bold text-slate-450 tracking-wider">Measurement / Analytics ID (measurementId)</label>
                                <input
                                  type="text"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-orange-500"
                                  placeholder="G-32RRXLLVYL"
                                  value={firebaseMeasurementId}
                                  onChange={(e) => setFirebaseMeasurementId(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3 font-sans">
                            <button
                              onClick={() => {
                                setFirebaseApiKey("");
                                setFirebaseAuthDomain("");
                                setFirebaseProjectId("");
                                setFirebaseStorageBucket("");
                                setFirebaseSenderId("");
                                setFirebaseAppId("");
                                setFirebaseMeasurementId("");
                              }}
                              className="px-4 py-2.5 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
                            >
                              Reset Form Fields
                            </button>
                            <button
                              onClick={() => {
                                if (!firebaseApiKey || !firebaseProjectId || !firebaseAppId) {
                                  alert("Required settings: Web API Key, Project ID, and Application ID must not be empty.");
                                  return;
                                }
                                const configObj = {
                                  apiKey: firebaseApiKey.trim(),
                                  authDomain: firebaseAuthDomain.trim() || `${firebaseProjectId.trim()}.firebaseapp.com`,
                                  projectId: firebaseProjectId.trim(),
                                  storageBucket: firebaseStorageBucket.trim() || `${firebaseProjectId.trim()}.firebasestorage.app`,
                                  messagingSenderId: firebaseSenderId.trim(),
                                  appId: firebaseAppId.trim(),
                                  measurementId: firebaseMeasurementId.trim()
                                };
                                localStorage.setItem("corebit_firebase_custom_config", JSON.stringify(configObj));
                                localStorage.removeItem("corebit_force_simulation"); // Disable forced sandbox if customized keys are loaded
                                alert("Success: Custom Firebase Project Config stored! Loading fresh cloud client...");
                                window.location.reload();
                              }}
                              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-orange-500/10"
                            >
                              Synchronize Custom Project Keys
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. PROJECT CREATION / EDITING FLYOUT FORMS */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showProjectForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setShowProjectForm(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display text-lg font-black text-white uppercase tracking-wider mb-5">
                {editingProject ? "Update Delivered Blueprint" : "Register New Delivered Blueprint"}
              </h3>

              <form onSubmit={handleProjectSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Project Name *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Client Company *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                      value={projCompany}
                      onChange={(e) => setProjCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Client Director *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                      value={projClient}
                      onChange={(e) => setProjClient(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Client billing base (Address) *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="Coimbatore, India"
                      value={projLocation}
                      onChange={(e) => setProjLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Value *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="₹40,25,500.00"
                      value={projValue}
                      onChange={(e) => setProjValue(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Started Date *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="Jan 15, 2024"
                      value={projStarted}
                      onChange={(e) => setProjStarted(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Delivered Date *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="May 15, 2024"
                      value={projDelivered}
                      onChange={(e) => setProjDelivered(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <ImageUploaderGrid
                    images={projScreenshots}
                    onChange={setProjScreenshots}
                    label="Showcase Screenshots"
                    maxCount={10}
                  />
                  <div className="rounded-2xl bg-orange-500/5 border border-orange-500/10 p-3.5 space-y-2.5">
                    <p className="text-[10px] text-slate-200 leading-relaxed font-sans flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                      <strong>How do screenshots work?</strong>
                    </p>
                    <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-3.5 font-sans leading-relaxed">
                      <li>
                        <strong>Direct File Upload:</strong> Drag and drop any image file or click inside the dashed area to upload. Image is automatically compressed to safeguard storage limits.
                      </li>
                      <li>
                        <strong>Add via Web Link:</strong> Click the "Add via Web Link" option to manually paste any standard image URL directly.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Project Technical Overview *</label>
                  <textarea 
                    rows={3}
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500 resize-none font-sans"
                    placeholder="High frequency cryptocurrency trading engine featuring low latency telemetry graphs..."
                    value={projOverview}
                    onChange={(e) => setProjOverview(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Publish Status *</label>
                  <select 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs w-full focus:outline-none focus:border-orange-500"
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as "draft" | "published")}
                    required
                  >
                    <option value="published">🟢 Published (Live on Public Blueprints Showcase)</option>
                    <option value="draft">🟠 Draft (Hidden from Public Visitors)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-650 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all mt-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProject ? "Update Blueprint Details" : "Register Blueprint"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 2. CHOOSE CLIENT TESTIMONIES SUBMISSIONS */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowReviewForm(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display text-lg font-black text-white uppercase tracking-wider mb-5">
                {editingReview ? "Update Client Testimony" : "Add Client Testimony"}
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Client Representative *</label>
                  <input 
                    type="text" 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                    placeholder="Elena Rostova"
                    value={revAuthor}
                    onChange={(e) => setRevAuthor(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Corporate Role *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="CTO"
                      value={revRole}
                      onChange={(e) => setRevRole(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Company Name *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="MediLink Health Services"
                      value={revCompany}
                      onChange={(e) => setRevCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Project Title Tag *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="Bespoke Trading Engine"
                      value={revTitle}
                      onChange={(e) => setRevTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Rating (1-5)</label>
                    <input 
                      type="number" 
                      min={1}
                      max={5}
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                      value={revRating}
                      onChange={(e) => setRevRating(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Comment *</label>
                  <textarea 
                    rows={4}
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500 resize-none italic font-sans"
                    placeholder="CoreBit Solutions delivered our trading system ahead of list schedule..."
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Publish Status *</label>
                  <select 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                    value={revStatus}
                    onChange={(e) => setRevStatus(e.target.value as "draft" | "published")}
                    required
                  >
                    <option value="published">🟢 Published (Live on Testimonials carousel)</option>
                    <option value="draft">🟠 Draft (Hidden from Public Visitors)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-650 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all mt-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingReview ? "Update Testimony Records" : "Add testimony"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 3. DYNAMIC PRICING STRUCTURE PRESET FORM */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showPlanForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowPlanForm(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display text-lg font-black text-white uppercase tracking-wider mb-5">
                {editingPlan ? "Configure Pricing Tier" : "Add Pricing Tier"}
              </h3>

              <form onSubmit={handlePlanSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Pricing Tier Name *</label>
                  <input 
                    type="text" 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                    placeholder="Startup MVP Accelerator"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Amount Tag *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="₹7,88,500"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Period tag *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="full build"
                      value={planPeriod}
                      onChange={(e) => setPlanPeriod(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Tier Abstract Description *</label>
                  <textarea 
                    rows={2}
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500 resize-none font-sans"
                    placeholder="Launch your product concept quickly tailored to validate..."
                    value={planDesc}
                    onChange={(e) => setPlanDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Features Checklist (one per line) *</label>
                  <textarea 
                    rows={4}
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500 resize-none font-mono"
                    placeholder="Custom UI/UX Design&#10;Dedicated Developer&#10;Core Database Setup"
                    value={planFeatures}
                    onChange={(e) => setPlanFeatures(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-2 select-none">
                  <input 
                    type="checkbox" 
                    id="plan-pop-chk"
                    className="w-4 h-4 accent-orange-500"
                    checked={planPopular}
                    onChange={(e) => setPlanPopular(e.target.checked)}
                  />
                  <label htmlFor="plan-pop-chk" className="font-mono text-[9px] uppercase font-black text-white tracking-widest cursor-pointer">Highlight this tier as Popular</label>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-wider">Publish Status *</label>
                  <select 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                    value={planStatus}
                    onChange={(e) => setPlanStatus(e.target.value as "draft" | "published")}
                    required
                  >
                    <option value="published">🟢 Published (Live on Public Pricing Cards)</option>
                    <option value="draft">🟠 Draft (Hidden from Public Visitors)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-650 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all mt-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPlan ? "Update Tier Settings" : "Deploy Pricing Tier"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal Safeguard Overlay */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div key="confirm-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl p-6 space-y-6"
            >
              {/* Header block with AlertTriangle Icon */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    {confirmModal.title || "Confirm Action"}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed">
                    {confirmModal.message || "Are you sure you want to proceed with this operation?"}
                  </p>
                </div>
              </div>

              {/* Close button top right */}
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute top-4 right-4 p-1 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Buttons Block inline */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl text-xs uppercase font-bold tracking-widest cursor-pointer transition-all font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await confirmModal.onConfirm();
                  }}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs uppercase font-bold tracking-widest cursor-pointer shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all font-sans"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
