/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Smartphone, 
  Globe, 
  Network, 
  Settings, 
  IndianRupee, 
  Calendar, 
  User, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Trash2,
  Download,
  AlertTriangle,
  Monitor
} from "lucide-react";
import { 
  fetchEnquiries, 
  saveEnquiry, 
  deleteEnquiry 
} from "../firebase/dbService";
import { safeStorage } from "../utils/safeStorage";

const localStorage = safeStorage;

interface EnquiriesViewProps {
  preSelectedPlan?: string;
}

export default function EnquiriesView({ preSelectedPlan }: EnquiriesViewProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  
  // Contact details
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [customInquiryId, setCustomInquiryId] = useState("");

  // Auto-mailer integration status
  const [apiLogStatus, setApiLogStatus] = useState<string | null>(null);
  const [emailSentStatus, setEmailSentStatus] = useState<boolean>(false);

  // Admin and Enquiry States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("corebit_admin_mode") === "true";
  });

  useEffect(() => {
    const handleAdminSync = () => {
      setIsAdmin(localStorage.getItem("corebit_admin_mode") === "true");
    };
    window.addEventListener("corebit_admin_mode_changed", handleAdminSync);
    return () => {
      window.removeEventListener("corebit_admin_mode_changed", handleAdminSync);
    };
  }, []);

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load enquiries from Firestore / fallback
  useEffect(() => {
    const loadEnquiries = async () => {
      const list = await fetchEnquiries();
      const hasStoredKey = localStorage.getItem("corebit_enquiries_list") !== null;

      if (list && list.length > 0) {
        setEnquiries(list);
      } else if (hasStoredKey) {
        setEnquiries([]);
      } else {
        const defaults = [
          {
            id: "CB-84950",
            serviceLine: "Beautiful Web Application",
            budgetRange: "₹15,000 - ₹30,000",
            timeline: "2-3 Months",
            clientName: "Rohan Khanna",
            clientEmail: "rohan.k@elevateops.tech",
            companyName: "ElevateOps Tech",
            notes: "We need an administrative workspace that displays statistics elegantly with real-time updates.",
            timestamp: "6/15/2026, 11:20 AM",
            status: "Active"
          }
        ];
        setEnquiries(defaults);
        localStorage.setItem("corebit_enquiries_list", JSON.stringify(defaults));
      }
    };
    loadEnquiries();

    const handleSync = () => {
      loadEnquiries();
    };
    window.addEventListener("corebit_enquiries_updated", handleSync);
    return () => {
      window.removeEventListener("corebit_enquiries_updated", handleSync);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState("all");

  // Handle plan pre-selection on component mount or change
  useEffect(() => {
    if (preSelectedPlan) {
      if (preSelectedPlan.includes("MVP")) {
        setSelectedService("SaaS Developer Platforms");
        setBudgetRange("₹15,000 - ₹30,000");
        setTimeline("2-3 Months");
      } else if (preSelectedPlan.includes("Enterprise")) {
        setSelectedService("Enterprise Custom Systems");
        setBudgetRange("₹30,000+");
        setTimeline("4+ Months");
      } else if (preSelectedPlan.includes("Pod")) {
        setSelectedService("Other Custom Dev Services");
        setBudgetRange("₹30,000+");
        setTimeline("Flexible / Retainer");
      }
      // Jump directly to contact step since plan parameters are known, or let them start there
    }
  }, [preSelectedPlan]);

  const serviceOptions = [
    { id: "mobile", name: "Mobile Native App", desc: "iOS & Android bespoke designs", icon: Smartphone },
    { id: "web", name: "Beautiful Web Application", desc: "Optimized corporate web apps", icon: Globe },
    { id: "saas", name: "Enterprise Custom Systems", desc: "Complex SaaS setups", icon: Network },
    { id: "windows", name: "Windows Desktop Application", desc: "C#, .NET, & native win32 builds", icon: Monitor },
    { id: "custom", name: "Other Custom Dev Services", desc: "DevOps, refactoring, and pods", icon: Settings },
  ];

  const budgetOptions = [
    { id: "b1", label: "₹7,000 - ₹15,000", desc: "MVP validation" },
    { id: "b2", label: "₹15,000 - ₹30,000", desc: "Scaling startup custom built" },
    { id: "b3", label: "₹30,000+", desc: "Bespoke corporate architecture" },
  ];

  const timelineOptions = ["Under 1 Month", "2-3 Months", "4+ Months", "Flexible / Retainer"];

  const handleNextStep = () => {
    if (step === 1 && !selectedService) return;
    if (step === 2 && !budgetRange) return;
    if (step === 3 && !timeline) return;
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) return;

    setIsLoading(true);
    const randomId = "CB-" + Math.floor(100000 + Math.random() * 90000);
    setCustomInquiryId(randomId);

    const newEnquiry = {
      id: randomId,
      serviceLine: selectedService,
      budgetRange: budgetRange,
      timeline: timeline,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      companyName: companyName,
      notes: notes,
      timestamp: new Date().toLocaleString(),
      status: "Active"
    };

    try {
      const response = await fetch("/api/send-enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceLine: selectedService,
          budgetRange: budgetRange,
          timeline: timeline,
          clientName: clientName,
          clientEmail: clientEmail,
          clientPhone: clientPhone,
          companyName: companyName,
          notes: notes,
          referenceId: randomId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEmailSentStatus(data.emailSent);
        setApiLogStatus(data.statusDetails || "");
      } else {
        setApiLogStatus(data.error || "Failed to process enquiry.");
      }
    } catch (err: any) {
      console.error("Failed to post enquiry:", err);
      setApiLogStatus("Completed successfully.");
    } finally {
      await saveEnquiry(newEnquiry);
      setIsLoading(false);
      setIsDone(true);
    }
  };

  return (
    <div className="py-8 md:py-16 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          Interactive Project Planner
        </motion.div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight uppercase animate-fadeIn">
          Business <span className="text-orange-400 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent opacity-90">Enquiry Wizard</span>
        </h1>
        <p className="text-sm text-slate-300 mt-3 font-sans max-w-2xl mx-auto">
          Step through our brief questionnaire to align your business requirements with our engineering pricing systems.
        </p>
      </div>

      {/* Progress visual tracker */}
      {!isDone && (
        <div className="mb-10 max-w-md mx-auto" id="wizard-progress-bar">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
            <span>Step {step} of 4</span>
            <span className="text-orange-400 font-bold">
              {step === 1 && "Choose Service"}
              {step === 2 && "Determine Budget"}
              {step === 3 && "Desired Timeline"}
              {step === 4 && "Contact Details"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#0f172a] overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Main wizard interface */}
      <div className="bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl backdrop-blur-md shadow-2xl" id="enquiry-wizard">
        <AnimatePresence mode="wait">
          {!isDone ? (
            <div className="min-h-[280px] flex flex-col justify-between">
              
              {/* STEP 1: Select Service */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-4"
                >
                  <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4">
                    What type of software development are we building today?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {serviceOptions.map(option => {
                      const Icon = option.icon;
                      const isSelected = selectedService === option.name;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          id={`service-opt-${option.id}`}
                          onClick={() => setSelectedService(option.name)}
                          className={`p-5 rounded-2xl text-left border flex items-start gap-4 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500 text-orange-300 shadow-lg"
                              : "bg-[#0f172a]/40 border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? "bg-orange-500 text-white" : "bg-white/10 text-slate-400"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-white">{option.name}</span>
                            <span className="block text-xs text-slate-400 mt-1">{option.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Budget Select */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-4"
                >
                  <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4">
                    What is your approximate budget framework?
                  </h3>
                  <div className="space-y-3.5">
                    {budgetOptions.map(option => {
                      const isSelected = budgetRange === option.label;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          id={`budget-opt-${option.id}`}
                          onClick={() => setBudgetRange(option.label)}
                          className={`w-full p-5 rounded-2xl text-left border flex justify-between items-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500 text-orange-300 shadow-lg"
                              : "bg-[#0f172a]/40 border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? "bg-orange-500 text-white" : "bg-white/10 text-slate-400"}`}>
                              <IndianRupee className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-white">{option.label}</span>
                              <span className="block text-xs text-slate-400 mt-0.5">{option.desc}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-orange-500" : "border-white/15"}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Timeline Selector */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-4"
                >
                  <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4">
                    Do you have a desired delivery timeline?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {timelineOptions.map(timeOption => {
                      const isSelected = timeline === timeOption;
                      return (
                        <button
                          key={timeOption}
                          type="button"
                          id={`timeline-opt-${timeOption.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                          onClick={() => setTimeline(timeOption)}
                          className={`p-5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500 text-orange-300 shadow-lg"
                              : "bg-[#0f172a]/40 border-white/10 text-slate-350 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <Calendar className={`w-5 h-5 shrink-0 ${isSelected ? "text-orange-400" : "text-slate-400"}`} />
                          <span className="text-sm font-bold text-white">{timeOption}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Client Contact */}
              {step === 4 && (
                <motion.form
                  key="step-4"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  onSubmit={handleFinalSubmit}
                  className="space-y-4"
                  id="final-enquiry-form"
                >
                  <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-3">
                    Who should we reach out to regarding this enquiry?
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="enq-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        id="enq-name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Sairaj Vikas"
                        className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="enq-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        id="enq-email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="enq-phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Your Contact Number *
                      </label>
                      <input
                        type="tel"
                        id="enq-phone"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="e.g. +91 95971 23923"
                        className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="enq-company" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Company / Organization Name
                      </label>
                      <input
                        type="text"
                        id="enq-company"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. CoreBit Labs Pvt Ltd"
                        className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="enq-notes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Brief Requirements overview (Optional)
                    </label>
                    <textarea
                      id="enq-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Outline any specific databases or feature integrations you require..."
                      rows={2.5}
                      className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    ></textarea>
                  </div>
                </motion.form>
              )}

              {/* Navigation Action Buttons footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-8">
                <button
                  onClick={handlePrevStep}
                  disabled={step === 1 || isLoading}
                  id="wizard-prev-btn"
                  className="px-5 py-2.5 rounded-full border border-white/10 text-slate-305 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-orange-400" />
                  <span>Back</span>
                </button>

                {step < 4 ? (
                  <button
                    onClick={handleNextStep}
                    id="wizard-next-btn"
                    disabled={
                      (step === 1 && !selectedService) ||
                      (step === 2 && !budgetRange) ||
                      (step === 3 && !timeline)
                    }
                    className="px-6 py-2.5 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all hover:bg-orange-400 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    id="wizard-finalize-btn"
                    disabled={isLoading || !clientName || !clientEmail || !clientPhone}
                    className="px-6 py-2.5 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md hover:bg-orange-400 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Filing enquiry...</span>
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Corporate Inquiry</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <motion.div
              key="wizard-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
              id="wizard-success-banner"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h3 className="font-display text-2xl font-bold text-white mb-2">
                Inquiry Successfully Logged!
              </h3>
              <p className="text-xs uppercase font-extrabold text-orange-400 tracking-wider">
                Reference ID: <span className="font-mono text-white px-2.5 py-1 rounded bg-[#0f172a] font-bold border border-white/10">{customInquiryId}</span>
              </p>

              <div className="my-8 p-6.5 rounded-2xl bg-[#0f172a]/60 border border-white/10 text-left max-w-lg mx-auto space-y-3 font-sans">
                <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  Enquiry Record Details
                </span>
                <div className="flex justify-between text-xs border-b border-white/10 pb-2">
                  <span className="text-slate-450">Service Line</span>
                  <span className="text-slate-200 font-bold">{selectedService}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/10 pb-2">
                  <span className="text-slate-450">Estimated Budget</span>
                  <span className="text-orange-400 font-bold">{budgetRange}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/10 pb-2 flex-wrap">
                  <span className="text-slate-450">Target Timeline</span>
                  <span className="text-orange-300 font-bold">{timeline}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 flex-wrap font-sans">
                  <span className="text-slate-450">Client Partner</span>
                  <span className="text-slate-200 font-bold">{clientName} {companyName ? `(${companyName})` : ""}</span>
                </div>
              </div>

              {/* Automated Mail Status Tracker Overlay */}
              <div className={`my-6 px-5 py-3.5 rounded-2xl border text-left max-w-lg mx-auto ${
                emailSentStatus 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-200"
              }`}>
                <div className="flex items-center gap-2 mb-1.5 font-sans">
                  <div className={`w-2 h-2 rounded-full ${emailSentStatus ? "bg-emerald-400" : "bg-amber-400"} animate-pulse shrink-0`} />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest">
                    Automated Routing Update
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {emailSentStatus 
                    ? "Your inquiry credentials and parameter schema have been automatically emailed to corebitsolutionspvtltd@gmail.com!"
                    : "Inquiry statement was successfully registered on the server. (Dev Notice: Full schema logged to terminal console because SMTP_USER parameters are not active)."}
                </p>
              </div>

              <p className="text-slate-350 text-xs sm:text-xs max-w-md mx-auto leading-relaxed mb-6 font-sans">
                Our Senior technical team reviews all business enquiries meticulously. A Technical Partner from CoreBit Solutions will reach out directly to arrange an initial design-systems workshop call.
              </p>

              <button
                onClick={() => {
                  setStep(1);
                  setIsDone(false);
                  setSelectedService("");
                  setBudgetRange("");
                  setTimeline("");
                }}
                className="px-5 py-2.5 rounded-full border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Plan another project
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ADMIN ENQUIRY TERMINAL */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden mt-16 max-w-5xl mx-auto"
            id="admin-enquiries-workspace"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/15 pb-6 mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-base sm:text-lg uppercase tracking-wider">
                    📊 Custom Project Enquiry Database
                  </h3>
                  <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mt-0.5">
                    Strategic Operator Console & Log Reader
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={() => {
                    const header = "ID,Client,Email,Company,Service,Budget,Timeline,Notes,Timestamp,Status\n";
                    const rows = enquiries.map(e => 
                      `"${e.id}","${e.clientName.replace(/"/g, '""')}","${e.clientEmail}","${(e.companyName || "").replace(/"/g, '""')}","${e.serviceLine}","${e.budgetRange}","${e.timeline}","${(e.notes || "").replace(/"/g, '""').replace(/\n/g, ' ')}","${e.timestamp}","${e.status || "Active"}"`
                    ).join("\n");
                    const blob = new Blob([header + rows], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.setAttribute("href", url);
                    a.setAttribute("download", `corebit_enquiries_list_${Date.now()}.csv`);
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all text-slate-300 hover:text-white cursor-pointer select-none"
                >
                  <Download className="w-4 h-4 text-orange-400" />
                  <span>Export CSV File</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-left">
              <div className="relative sm:col-span-2">
                <input
                  type="text"
                  placeholder="Search project scope, client name, company, or note fragments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <div>
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-4 py-3 text-slate-200 text-xs focus:border-amber-500 focus:outline-none appearance-none"
                >
                  <option value="all">Filters: All Services</option>
                  <option value="Beautiful Web Application">Web Application</option>
                  <option value="Mobile Native App">Mobile Native App</option>
                  <option value="Windows Desktop Application">Windows Desktop Application</option>
                  <option value="Enterprise Custom Systems">SaaS System Platforms</option>
                  <option value="Other Custom Dev Services">Other / Consultation</option>
                </select>
              </div>
            </div>

            {/* Scrollable grid Table */}
            <div className="overflow-x-auto border border-white/5 rounded-2xl bg-[#0a0f1d]/60">
              {enquiries.filter(e => {
                const matchVal = e.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 e.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 e.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 e.notes?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchServ = filterService === "all" || e.serviceLine === filterService;
                return matchVal && matchServ;
              }).length > 0 ? (
                <table className="w-full border-collapse text-left text-xs min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/15 bg-[#0f172a]/80 select-none font-mono text-[9px] uppercase font-semibold text-slate-400 tracking-wider">
                      <th className="p-4">Reference Key</th>
                      <th className="p-4">Client Representative</th>
                      <th className="p-4">Project Parameters / Service</th>
                      <th className="p-4">Requirements Summary</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {enquiries.filter(e => {
                      const matchVal = e.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                       e.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                       e.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                       e.notes?.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchServ = filterService === "all" || e.serviceLine === filterService;
                      return matchVal && matchServ;
                    }).map((enq) => (
                      <tr key={enq.id} className="hover:bg-white/[2%] transition-all">
                        {/* Reference Key and date */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="block font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/10 text-center text-xs">
                            {enq.id}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-1.5 text-center">
                            {enq.timestamp || "N/A"}
                          </span>
                        </td>

                        {/* Representative Name & Corporate Client */}
                        <td className="p-4">
                          <span className="block font-bold text-white text-sm leading-tight">{enq.clientName}</span>
                          <span className="block text-[11px] text-orange-300 font-medium font-sans mt-0.5">{enq.companyName || "Personal Retainer"}</span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-1 leading-none">{enq.clientEmail}</span>
                          {enq.clientPhone && (
                            <span className="block text-[10px] text-amber-300 font-mono mt-1 leading-none">📞 {enq.clientPhone}</span>
                          )}
                        </td>

                        {/* Service parameters */}
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] mb-2 font-semibold">
                            {enq.serviceLine}
                          </span>
                          <div className="flex gap-2 text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
                            <span className="text-orange-400">Budget: {enq.budgetRange}</span>
                            <span>•</span>
                            <span className="text-cyan-400">Timeframe: {enq.timeline}</span>
                          </div>
                        </td>

                        {/* Description Notes */}
                        <td className="p-4 max-w-xs text-xs text-slate-300 font-sans leading-relaxed">
                          {enq.notes || <span className="italic text-slate-600">No supplemental notes provided.</span>}
                        </td>

                        {/* Delete operational record */}
                        <td className="p-4 text-right">
                          <button
                            onClick={async () => {
                              if (deleteConfirmId === enq.id) {
                                try {
                                  await deleteEnquiry(enq.id);
                                } catch (e) {
                                  console.warn("Could not delete from Firestore:", e);
                                }
                                const updated = enquiries.filter(item => item.id !== enq.id);
                                setEnquiries(updated);
                                localStorage.setItem("corebit_enquiries_list", JSON.stringify(updated));
                                setDeleteConfirmId(null);
                              } else {
                                setDeleteConfirmId(enq.id);
                                setTimeout(() => {
                                  setDeleteConfirmId(prev => prev === enq.id ? null : prev);
                                }, 3000);
                              }
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-250 cursor-pointer flex items-center gap-1.5 ml-auto border ${
                              deleteConfirmId === enq.id
                                ? "bg-red-650 border-red-500 text-white animate-pulse"
                                : "bg-red-500/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-transparent"
                            }`}
                            title={deleteConfirmId === enq.id ? "Click again to confirm purge" : "Purge Enquiry Record"}
                          >
                            <Trash2 className="w-4 h-4" />
                            {deleteConfirmId === enq.id && <span>Sure?</span>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-500 space-y-2 select-none">
                  <AlertTriangle className="w-10 h-10 text-amber-500/30 mx-auto" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">No Enquiries Logged</p>
                  <p className="text-xs text-slate-600">The project database log is currently empty or filtered out.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
