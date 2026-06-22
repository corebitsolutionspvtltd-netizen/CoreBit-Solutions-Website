/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Edit, Trash2, Plus, PhoneCall, Sparkles, X, Save, ArrowLeft, RefreshCw } from "lucide-react";

interface PricingViewProps {
  onSelectPlan?: (planName: string) => void;
  onSelectProduct?: (productName: string) => void;
  onNavigate?: (page: any) => void;
}

interface FeaturePlan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  price: string;
  billing: string;
  badgeType: "standard" | "popular" | "best-value";
  features: string[];
  buttonText: string;
  dbValue: string;
  suitableFor: string;
  status?: "draft" | "published";
}

const DEFAULT_WEBSITE_PLANS: FeaturePlan[] = [
  {
    id: "web-silver",
    name: "Silver Plan",
    badge: "Essential",
    tagline: "Perfect for Startups & Small Businesses",
    price: "₹18,000",
    billing: "fixed estimate",
    badgeType: "standard",
    suitableFor: "SME Brand Presence",
    features: [
      "Up to 10 Web Pages",
      "Mobile Responsive Design",
      "Contact Us Form",
      "Slider/Banner Section",
      "Basic SEO Setup",
      "Social Media Integration",
      "Free SSL Certificate",
      "1 Month Support"
    ],
    buttonText: "Get Started",
    dbValue: "Website - Silver Plan"
  },
  {
    id: "web-gold",
    name: "Gold Plan",
    badge: "Popular ⭐",
    tagline: "Best Choice for Growing Businesses",
    price: "₹38,500",
    billing: "fixed estimate",
    badgeType: "popular",
    suitableFor: "SME eCommerce & Portfolios",
    features: [
      "Up to 15 Web Pages",
      "Custom UI/UX Design",
      "CMS Integration",
      "Blog Management",
      "Advanced SEO Optimization",
      "WhatsApp Integration",
      "Google Analytics Setup",
      "3 Months Support"
    ],
    buttonText: "Start Your Project",
    dbValue: "Website - Gold Plan"
  },
  {
    id: "web-platinum",
    name: "Platinum Plan",
    badge: "Best Value 💎",
    tagline: "Perfect for Professional Businesses",
    price: "₹75,000",
    billing: "fixed estimate",
    badgeType: "best-value",
    suitableFor: "Corporate Portals & Teams",
    features: [
      "Up to 20 Web Pages",
      "Premium Custom Design",
      "Admin Dashboard",
      "Advanced Animations",
      "Lead Generation Forms",
      "Performance Optimization",
      "Security Enhancements",
      "6 Months Support"
    ],
    buttonText: "Choose Platinum Plan",
    dbValue: "Website - Platinum Plan"
  }
];

const DEFAULT_APP_PLANS: FeaturePlan[] = [
  {
    id: "app-silver",
    name: "Silver Plan",
    badge: "Essential",
    tagline: "Perfect for startups requiring custom software models.",
    price: "₹95,000",
    billing: "starting rate",
    badgeType: "standard",
    suitableFor: "Basic Web/Android MVP",
    features: [
      "Custom database model integration",
      "Responsive login & user registration",
      "Sleek operational analytics screen",
      "Standard system configuration files",
      "Unified system contact form APIs",
      "Standard file uploads feature",
      "Complete secure SSL protocol keys",
      "1 Month active configuration SLA"
    ],
    buttonText: "Get Started",
    dbValue: "Application - Silver Plan"
  },
  {
    id: "app-gold",
    name: "Gold Plan",
    badge: "Popular ⭐",
    tagline: "Ideal scaling setup for commercial platforms.",
    price: "₹1,85,000",
    billing: "starting rate",
    badgeType: "popular",
    suitableFor: "Android + Web Companion Sync",
    features: [
      "Simultaneous double platform deployments",
      "Custom premium software system layout",
      "Instant multi-channel push alerts",
      "Advanced SEO web interface headers",
      "Custom dashboard with metrics graphs",
      "Integrated live WhatsApp chat hook",
      "Enterprise grade security system check",
      "3 Months dedicated business support"
    ],
    buttonText: "Start Your Project",
    dbValue: "Application - Gold Plan"
  },
  {
    id: "app-platinum",
    name: "Platinum Plan",
    badge: "Best Value 💎",
    tagline: "Perfect for complex high-load custom architecture.",
    price: "₹3,50,000",
    billing: "starting rate",
    badgeType: "best-value",
    suitableFor: "Enterprise scalable networks",
    features: [
      "Full Android + iOS + Web Application system",
      "Fully tailored administrative dashboard",
      "High fidelity system animation flow",
      "Integrated unified payment system integration",
      "Dedicated cloud database synchronization",
      "Advanced network firewall filters",
      "Direct live phone & chat hotline support",
      "6 Months complete operational SLA"
    ],
    buttonText: "Choose Platinum Plan",
    dbValue: "Application - Platinum Plan"
  }
];

const DEFAULT_BOTH_PLANS: FeaturePlan[] = [
  {
    id: "combo-silver",
    name: "Silver Plan",
    badge: "Essential",
    tagline: "Unified startup catalog website & basic helper tool.",
    price: "₹1,10,000",
    billing: "composite project",
    badgeType: "standard",
    suitableFor: "SME branding & client intake",
    features: [
      "Up to 10 web pages responsive layouts",
      "Companion website database control program",
      "Sleek visual custom feedback forms",
      "Standard SEO optimization protocols",
      "Unified social handles setup integrations",
      "Free secure system SSL certification",
      "Essential automated file backup setup",
      "1 Month cohesive system support"
    ],
    buttonText: "Get Started",
    dbValue: "Combo - Silver Plan"
  },
  {
    id: "combo-gold",
    name: "Gold Plan",
    badge: "Popular ⭐",
    tagline: "Unify external client traffic & smartphone apps.",
    price: "₹2,10,000",
    billing: "composite project",
    badgeType: "popular",
    suitableFor: "Active commercial consumer brand mapping",
    features: [
      "Up to 15 responsive themed corporate pages",
      "Bespoke native Android companion mobile app",
      "Advanced custom system UI admin console",
      "Full database content management portal",
      "Instant smartphone client push notification server",
      "WhatsApp direct chat icon integration",
      "Integrated Google Analytics visitor statistics",
      "3 Months tailored enterprise pack support"
    ],
    buttonText: "Start Your Project",
    dbValue: "Combo - Gold Plan"
  },
  {
    id: "combo-platinum",
    name: "Platinum Plan",
    badge: "Best Value 💎",
    tagline: "Comprehensive universal elite dual layout suite.",
    price: "₹4,20,000",
    billing: "composite project",
    badgeType: "best-value",
    suitableFor: "High performance corporate systems",
    features: [
      "Up to 20 robust top level web platform sections",
      "Universal cross platform mobile phone native apps",
      "Comprehensive operational control system",
      "Rich database analytics dashboards and charts",
      "Multi-way secure payment gateway channel setups",
      "Maximum load performance scaling guidelines",
      "Premium server threat mitigation parameters",
      "6 Months premier priority support"
    ],
    buttonText: "Choose Platinum Plan",
    dbValue: "Combo - Platinum Plan"
  }
];

export default function PricingView({
  onSelectPlan,
  onSelectProduct,
  onNavigate
}: PricingViewProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(
    localStorage.getItem("corebit_admin_mode") === "true" || localStorage.getItem("cbit_admin_access") === "true"
  );

  const [activeCategory, setActiveCategory] = useState<"website" | "application" | "both" | null>(null);

  // Load plans state from LocalStorage
  const [websitePlans, setWebsitePlans] = useState<FeaturePlan[]>(() => {
    const saved = localStorage.getItem("corebit_website_plans");
    return saved ? JSON.parse(saved) : DEFAULT_WEBSITE_PLANS;
  });
  
  const [applicationPlans, setApplicationPlans] = useState<FeaturePlan[]>(() => {
    const saved = localStorage.getItem("corebit_app_plans");
    return saved ? JSON.parse(saved) : DEFAULT_APP_PLANS;
  });

  const [hybridPlans, setHybridPlans] = useState<FeaturePlan[]>(() => {
    const saved = localStorage.getItem("corebit_both_plans");
    return saved ? JSON.parse(saved) : DEFAULT_BOTH_PLANS;
  });

  // Modal editor state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FeaturePlan | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form fields
  const [formDataName, setFormDataName] = useState("");
  const [formDataBadge, setFormDataBadge] = useState("");
  const [formDataTagline, setFormDataTagline] = useState("");
  const [formDataPrice, setFormDataPrice] = useState("");
  const [formDataBilling, setFormDataBilling] = useState("");
  const [formDataBadgeType, setFormDataBadgeType] = useState<"standard" | "popular" | "best-value">("standard");
  const [formDataSuitableFor, setFormDataSuitableFor] = useState("");
  const [formDataFeatures, setFormDataFeatures] = useState("");
  const [formDataButtonText, setFormDataButtonText] = useState("");
  const [formDataDbValue, setFormDataDbValue] = useState("");
  const [formDataStatus, setFormDataStatus] = useState<"draft" | "published">("published");

  // Sync state with localstorage when mutated
  useEffect(() => {
    localStorage.setItem("corebit_website_plans", JSON.stringify(websitePlans));
  }, [websitePlans]);

  useEffect(() => {
    localStorage.setItem("corebit_app_plans", JSON.stringify(applicationPlans));
  }, [applicationPlans]);

  useEffect(() => {
    localStorage.setItem("corebit_both_plans", JSON.stringify(hybridPlans));
  }, [hybridPlans]);

  // Sync admin mode changes
  useEffect(() => {
    const handleAdminChange = () => {
      setIsAdmin(localStorage.getItem("corebit_admin_mode") === "true" || localStorage.getItem("cbit_admin_access") === "true");
    };
    window.addEventListener("corebit_admin_mode_changed", handleAdminChange);
    return () => window.removeEventListener("corebit_admin_mode_changed", handleAdminChange);
  }, []);

  const getActiveData = () => {
    switch (activeCategory) {
      case "website":
        return { 
          title: "Website Development Packages", 
          subtitle: "Choose the package that best suits your website development standard budget metric.", 
          items: websitePlans 
        };
      case "application":
        return { 
          title: "Custom Application Architecture Plans", 
          subtitle: "Deploy highly efficient native system programs engineered entirely to custom configurations.", 
          items: applicationPlans 
        };
      case "both":
        return { 
          title: "Synergistic Web + Application Hybrid Plans", 
          subtitle: "Complete cross platforms system synchronized in unison for maximum client reach.", 
          items: hybridPlans 
        };
      default:
        return null;
    }
  };

  const activeData = getActiveData();

  const handleInquirePlan = (plan: FeaturePlan) => {
    const selectedText = plan.dbValue || `${activeCategory?.toUpperCase() || ""} - ${plan.name}`;
    if (onSelectProduct) {
      onSelectProduct(selectedText);
    } else if (onSelectPlan) {
      onSelectPlan(selectedText);
    }
    
    if (onNavigate) {
      onNavigate("enquiry");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ADD PLAN FOR ACTIVE CATEGORY
  const handleOpenAddPlan = () => {
    if (!activeCategory) return;
    setEditingPlan(null);
    setFormDataName("");
    setFormDataBadge("");
    setFormDataTagline("");
    setFormDataPrice("₹45,000");
    setFormDataBilling("starting rate");
    setFormDataBadgeType("standard");
    setFormDataSuitableFor("Enterprise Core Functions");
    setFormDataFeatures("Dynamic UI Design\nCustom Integrations\nDedicated Channel Support");
    setFormDataButtonText("Get Started");
    setFormDataDbValue("");
    setFormDataStatus("published");
    setShowFormModal(true);
  };

  // EDIT PLAN
  const handleOpenEditPlan = (plan: FeaturePlan) => {
    setEditingPlan(plan);
    setFormDataName(plan.name);
    setFormDataBadge(plan.badge || "");
    setFormDataTagline(plan.tagline);
    setFormDataPrice(plan.price);
    setFormDataBilling(plan.billing);
    setFormDataBadgeType(plan.badgeType);
    setFormDataSuitableFor(plan.suitableFor);
    setFormDataFeatures(plan.features.join("\n"));
    setFormDataButtonText(plan.buttonText);
    setFormDataDbValue(plan.dbValue);
    setFormDataStatus(plan.status || "published");
    setShowFormModal(true);
  };

  // DELETE PLAN
  const handleDeletePlan = (id: string) => {
    if (activeCategory === "website") {
      setWebsitePlans(prev => prev.filter(p => p.id !== id));
    } else if (activeCategory === "application") {
      setApplicationPlans(prev => prev.filter(p => p.id !== id));
    } else if (activeCategory === "both") {
      setHybridPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  // SUBMIT ADD/EDIT FORM
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;

    const targetDbValue = formDataDbValue || `${activeCategory.toUpperCase()} - ${formDataName}`;
    const featureArray = formDataFeatures.split("\n").map(f => f.trim()).filter(Boolean);

    const targetList = activeCategory === "website" 
      ? websitePlans 
      : activeCategory === "application" 
      ? applicationPlans 
      : hybridPlans;

    if (editingPlan) {
      // Edit mode
      const updatedList = targetList.map(p => 
        p.id === editingPlan.id 
          ? {
              ...p,
              name: formDataName,
              badge: formDataBadge || undefined,
              tagline: formDataTagline,
              price: formDataPrice,
              billing: formDataBilling,
              badgeType: formDataBadgeType,
              suitableFor: formDataSuitableFor,
              features: featureArray,
              buttonText: formDataButtonText,
              dbValue: targetDbValue,
              status: formDataStatus
            }
          : p
      );
      
      if (activeCategory === "website") setWebsitePlans(updatedList);
      else if (activeCategory === "application") setApplicationPlans(updatedList);
      else if (activeCategory === "both") setHybridPlans(updatedList);
    } else {
      // Add mode
      const newPlan: FeaturePlan = {
        id: `custom-plan-${Date.now()}`,
        name: formDataName,
        badge: formDataBadge || undefined,
        tagline: formDataTagline,
        price: formDataPrice,
        billing: formDataBilling,
        badgeType: formDataBadgeType,
        suitableFor: formDataSuitableFor,
        features: featureArray,
        buttonText: formDataButtonText,
        dbValue: targetDbValue,
        status: formDataStatus
      };

      const updatedList = [...targetList, newPlan];
      if (activeCategory === "website") setWebsitePlans(updatedList);
      else if (activeCategory === "application") setApplicationPlans(updatedList);
      else if (activeCategory === "both") setHybridPlans(updatedList);
    }

    setShowFormModal(false);
  };

  return (
    <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SECTION HEADING */}
      <section className="space-y-4 text-center max-w-4xl mx-auto">
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[10px] uppercase font-mono tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full font-bold inline-block"
        >
          💰 Transparent Engineering
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight"
        >
          Pricing Plans
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto"
        >
          Please select a plan category below to view available packages for CoreBit Solutions Pvt Ltd.
        </motion.p>
      </section>

      {/* THREE INTERACTIVE PATHWAY PREFERENCE SELECTIONS */}
      <div className="flex justify-center pt-2">
        <div className="bg-slate-900/80 p-2 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-2 w-full max-w-2xl shadow-2xl">
          
          {/* Website Selection Button */}
          <button
            onClick={() => setActiveCategory(activeCategory === "website" ? null : "website")}
            className={`flex-1 py-4 px-4 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border select-none ${
              activeCategory === "website"
                ? "bg-orange-600 text-white shadow-xl shadow-orange-600/15 border-orange-550 font-extrabold"
                : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
            }`}
          >
            <span className="text-sm shrink-0">🌐</span>
            <span>Website</span>
          </button>
          
          {/* Application Selection Button */}
          <button
            onClick={() => setActiveCategory(activeCategory === "application" ? null : "application")}
            className={`flex-1 py-4 px-4 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border select-none ${
              activeCategory === "application"
                ? "bg-orange-600 text-white shadow-xl shadow-orange-600/15 border-orange-550 font-extrabold"
                : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
            }`}
          >
            <span className="text-sm shrink-0">📱</span>
            <span>Application</span>
          </button>
          
          {/* Both Selection Button */}
          <button
            onClick={() => setActiveCategory(activeCategory === "both" ? null : "both")}
            className={`flex-1 py-4 px-4 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border select-none ${
              activeCategory === "both"
                ? "bg-orange-600 text-white shadow-xl shadow-orange-600/15 border-orange-550 font-extrabold"
                : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
            }`}
          >
            <span className="text-sm shrink-0">🚀</span>
            <span>Both</span>
          </button>

        </div>
      </div>

      {/* RENDER DYNAMIC BLOCK TRIGGERED BY PREFERENCE CATEGORY */}
      <AnimatePresence mode="wait">
        {activeData === null ? (
          
          /* NO OPTION SELECTED */
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 py-8 text-center max-w-2xl mx-auto"
          >
            <div className="border border-white/5 bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-300 leading-relaxed font-semibold">
                  Choose a plan category to view package details.
                </p>
              </div>
            </div>
          </motion.div>

        ) : (

          /* CATEGORY SELECTED VIEW */
          <motion.div 
            key={activeCategory || "selected-view"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            
            {/* Active Subtitle */}
            <div className="text-center space-y-2 max-w-xl mx-auto relative">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-wide">
                {activeData.title}
              </h2>
              <p className="text-xs text-orange-400 font-mono tracking-wider mb-2">
                ✦ {activeData.subtitle} ✦
              </p>
              {isAdmin && (
                <button
                  onClick={handleOpenAddPlan}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-orange-600 hover:bg-orange-550 text-white rounded-xl transition-all cursor-pointer shadow-md mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Plan Option
                </button>
              )}
            </div>

            {/* THREE COLUMN GRID CARD LISTS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 max-w-6xl mx-auto">
              {activeData.items.filter(plan => isAdmin || plan.status !== "draft").map((plan, index) => {
                
                // Color schemes config
                let badgeColorClass = "bg-white/5 text-gray-300 border-white/10";
                let outerCardStyle = "bg-white/5 border-white/5 hover:border-white/10";
                
                if (plan.badgeType === "popular") {
                  badgeColorClass = "bg-orange-500/20 text-orange-300 border-orange-500/30 ring-1 ring-orange-500/25";
                  outerCardStyle = "bg-orange-950/15 border-orange-500/50 shadow-2xl shadow-orange-500/5 ring-1 ring-orange-500/10 hover:border-orange-400";
                } else if (plan.badgeType === "best-value") {
                  badgeColorClass = "bg-teal-500/15 text-teal-300 border-teal-500/20";
                }

                if (plan.status === "draft") {
                  outerCardStyle = "bg-[#111625] border-amber-500/40 shadow-xl shadow-amber-500/2 ring-1 ring-amber-500/10 hover:border-amber-400";
                }

                return (
                  <motion.div 
                    key={plan.id || plan.dbValue}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-3xl border p-6 md:p-8 flex flex-col justify-between relative backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${outerCardStyle}`}
                  >
                    
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-10 flex gap-1.5">
                        <button
                          onClick={() => handleOpenEditPlan(plan)}
                          className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-450 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (deleteConfirmId === plan.id) {
                              handleDeletePlan(plan.id);
                              setDeleteConfirmId(null);
                            } else {
                              setDeleteConfirmId(plan.id);
                              setTimeout(() => {
                                setDeleteConfirmId(prev => prev === plan.id ? null : prev);
                              }, 3000);
                            }
                          }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase font-mono ${
                            deleteConfirmId === plan.id
                              ? "bg-red-650 border-red-500 text-white animate-pulse"
                              : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-650 hover:text-white"
                          }`}
                          title={deleteConfirmId === plan.id ? "Click again to confirm delete" : "Delete"}
                        >
                          <Trash2 className="w-3 h-3" />
                          {deleteConfirmId === plan.id && <span>Sure?</span>}
                        </button>
                      </div>
                    )}

                    <div className="space-y-6">
                      
                      {/* Upper Metadata */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase font-semibold">
                            OPTION 0{index + 1}
                          </span>
                          {plan.status === "draft" ? (
                            <span className="text-[8px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-500/20 border-amber-500/30 text-amber-400 font-bold">
                              ⚠️ Offline Draft
                            </span>
                          ) : plan.badge ? (
                            <span className={`text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold ${badgeColorClass}`}>
                              {plan.badge}
                            </span>
                          ) : null}
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-white font-display">
                          {plan.name}
                        </h3>
                        
                        <p className="text-xs text-gray-400 leading-relaxed min-h-[36px]">
                          {plan.tagline}
                        </p>
                      </div>

                      {/* Pricing info */}
                      <div className="pt-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                            {plan.price}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500">
                            /{plan.billing}
                          </span>
                        </div>
                        <span className="text-[9px] text-orange-450 font-mono block mt-1">
                          Best suited for: {plan.suitableFor}
                        </span>
                      </div>

                      <hr className="border-white/5" />

                      {/* Features list */}
                      <div className="space-y-3.5 flex-1">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500 block">Deliverables & Benefits:</span>
                        <ul className="space-y-3">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 leading-normal">
                              <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Submit Inquiry Button */}
                    <div className="pt-8 pt-auto">
                      <button
                        onClick={() => handleInquirePlan(plan)}
                        className={`w-full font-display font-bold text-xs py-3 rounded-xl transition-all h-fit cursor-pointer uppercase tracking-wider border ${
                          plan.badgeType === "popular"
                            ? "bg-orange-600 text-white shadow-md shadow-orange-600/15 border-orange-550 hover:bg-orange-500" 
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                        }`}
                      >
                        {plan.buttonText}
                      </button>
                    </div>

                  </motion.div>
                );
              })}

              {activeData.items.length === 0 && (
                <div className="col-span-3 text-center py-16 text-slate-550 border border-dashed border-white/5 rounded-3xl">
                  No pricing option tiers available. Select Add Plan Option above to register.
                </div>
              )}
            </section>

            {/* Foot reminder message */}
            <div className="text-center">
              <button
                onClick={() => setActiveCategory(null)}
                className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose Another Category</span>
              </button>
            </div>

          </motion.div>

        )}
      </AnimatePresence>

      {/* SLA / Direct Inquiry consultation trigger box */}
      <section className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Need a Custom solution?</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Contact our core engineering team for a personalized, granular scoping document or enterprise SLA options based entirely on your target system metrics.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              if (onSelectProduct) {
                onSelectProduct("Custom Enterprise Software Integration");
              } else if (onSelectPlan) {
                onSelectPlan("Custom Enterprise Software Integration");
              }
              
              if (onNavigate) {
                onNavigate("enquiry");
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex-1 md:flex-initial text-center bg-orange-600 hover:bg-orange-550 text-white text-xs font-semibold px-6 py-3.5 rounded-xl cursor-pointer transition-all uppercase tracking-wider font-display border border-orange-550"
          >
            Inquire Custom Scope
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* ADD/EDIT PLAN DIALOG MODAL */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative text-left text-slate-200"
            >
              <button 
                onClick={() => setShowFormModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display text-lg font-black text-white uppercase tracking-wider mb-5">
                {editingPlan ? "Edit Pricing Plan Option" : `Add Pricing Plan to ${activeCategory?.toUpperCase()}`}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Plan Name *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500 font-semibold"
                      placeholder="Gold Plan"
                      value={formDataName}
                      onChange={(e) => setFormDataName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Badge Tag (Optional)</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="Best Seller ⭐"
                      value={formDataBadge}
                      onChange={(e) => setFormDataBadge(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Plan Tagline / Secondary Label *</label>
                  <input 
                    type="text" 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500"
                    placeholder="Ideal choice for scaling startups"
                    value={formDataTagline}
                    onChange={(e) => setFormDataTagline(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Price Token *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500 font-mono font-bold text-orange-400"
                      placeholder="₹38,500"
                      value={formDataPrice}
                      onChange={(e) => setFormDataPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Period billing rate *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="starting rate"
                      value={formDataBilling}
                      onChange={(e) => setFormDataBilling(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Aesthetic Theme Accent</label>
                    <select 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500 cursor-pointer"
                      value={formDataBadgeType}
                      onChange={(e) => setFormDataBadgeType(e.target.value as any)}
                    >
                      <option value="standard">Standard Dark</option>
                      <option value="popular">Accent Orange (Popular)</option>
                      <option value="best-value">Accent Teal</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider font-semibold">Suitable For *</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500"
                      placeholder="SME eCommerce"
                      value={formDataSuitableFor}
                      onChange={(e) => setFormDataSuitableFor(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Button Call To Action Text *</label>
                  <input 
                    type="text" 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500"
                    placeholder="Start Your Project"
                    value={formDataButtonText}
                    onChange={(e) => setFormDataButtonText(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Features Checklist (one per line) *</label>
                  <textarea 
                    rows={4}
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500 resize-none font-mono"
                    placeholder="Double Platform deploys&#10;Instant Multi-Channel Sync&#10;3 Months Dedicated Support"
                    value={formDataFeatures}
                    onChange={(e) => setFormDataFeatures(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Publish Management Status</label>
                    <select 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500 cursor-pointer"
                      value={formDataStatus}
                      onChange={(e) => setFormDataStatus(e.target.value as any)}
                    >
                      <option value="published">🚀 Published (Publicly Visible)</option>
                      <option value="draft">📁 Draft (Internal Administrative View)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Database lookup name (Optional)</label>
                  <input 
                    type="text" 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs w-full focus:outline-none focus:border-orange-500"
                    placeholder="Website - Gold Plan"
                    value={formDataDbValue}
                    onChange={(e) => setFormDataDbValue(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-orange-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPlan ? "Confirm Package Changes" : "Commit Package option"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
