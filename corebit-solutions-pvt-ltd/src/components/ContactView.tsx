/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { TEAM_MEMBERS } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, Phone, Clock, MessageSquare, CheckCircle, Send, Sparkles,
  Search, Trash2, Download, Check, RefreshCw, AlertTriangle, ChevronDown
} from "lucide-react";
import { 
  fetchContactMessages, 
  saveContactMessage, 
  deleteContactMessage 
} from "../firebase/dbService";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "Pending" | "Reviewed" | "Contacted";
}

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Custom Software Consultation",
    message: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Admin and Message State
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

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load messages from Firestore / fallback
  useEffect(() => {
    const loadInbox = async () => {
      const fetched = await fetchContactMessages();
      const hasStoredKey = localStorage.getItem("corebit_contact_messages") !== null;

      if (fetched && fetched.length > 0) {
        setMessages(fetched);
      } else if (hasStoredKey) {
        setMessages([]);
      } else {
        // Fallback or seed defaults if nothing exists anywhere
        const defaults: ContactMessage[] = [
          {
            id: "msg-jessica",
            name: "Jessica Alvi",
            email: "j.alvi@fintechscale.org",
            subject: "Custom Software Consultation",
            message: "Hello CoreBit, we are looking to request a customized dashboard for our new DeFi algorithmic models. Do you have developers specializing in native low-latency charts?",
            timestamp: "6/14/2026, 10:24 AM",
            status: "Reviewed"
          },
          {
            id: "msg-david",
            name: "David H. Miller",
            email: "miller.d@techsphere.com",
            subject: "DevOps & Infrastructure Auditing",
            message: "Our engineering pod needs a 3rd party review of our AWS security setups for a SOC2 audit coming up next month. Do you have direct consulting pods available?",
            timestamp: "6/15/2026, 4:45 PM",
            status: "Pending"
          }
        ];
        setMessages(defaults);
        localStorage.setItem("corebit_contact_messages", JSON.stringify(defaults));
      }
    };
    loadInbox();

    const handleSync = () => {
      loadInbox();
    };
    window.addEventListener("corebit_contact_messages_updated", handleSync);
    return () => {
      window.removeEventListener("corebit_contact_messages_updated", handleSync);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setFormError("Please fill out all required fields, including your contact number.");
      return;
    }

    setIsLoading(true);
    const messageId = "msg-" + Date.now();
    const timestamp = new Date().toLocaleString();
    
    const newMessage: ContactMessage = {
      id: messageId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      timestamp,
      status: "Pending"
    };

    try {
      // Send email alert to the admin
      await fetch("/api/send-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: messageId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          timestamp,
        }),
      });
    } catch (err) {
      console.warn("Admin email warning notification skipped or deferred:", err);
    }

    // Save to Firestore & local storage
    await saveContactMessage(newMessage);

    setIsLoading(false);
    setIsSubmitted(true);
    
    // Clear Form state
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "Custom Software Consultation",
      message: ""
    });
  };

  const handleMessageDelete = async (id: string) => {
    await deleteContactMessage(id);
    const fetched = await fetchContactMessages();
    setMessages(fetched);
  };

  const handleMessageStatusChange = async (id: string, nextStatus: "Pending" | "Reviewed" | "Contacted") => {
    const found = messages.find(m => m.id === id);
    if (found) {
      const updatedMsg = { ...found, status: nextStatus };
      await saveContactMessage(updatedMsg);
      const fetched = await fetchContactMessages();
      setMessages(fetched);
    }
  };

  const handleExportCSV = () => {
    const header = "ID,Name,Email,Subject,Timestamp,Status,Message\n";
    const rows = messages.map(m => 
      `"${m.id}","${m.name.replace(/"/g, '""')}","${m.email}","${m.subject}","${m.timestamp}","${m.status}","${m.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ).join("\n");
    
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `corebit_contact_inbox_${Date.now()}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredMessages = messages.filter(m => {
    const matchQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       m.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       m.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = filterSubject === "all" || m.subject === filterSubject;
    return matchQuery && matchSubject;
  });

  return (
    <div className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          Average Response: Under 24h
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase"
        >
          Contact <span className="text-orange-400 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent opacity-90">Corporate Inquiries</span>
        </motion.h1>
         <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base text-slate-300 font-sans mt-3 max-w-2xl mx-auto"
        >
          Whether you have specific technical architecture questions or want to verify retainer onboarding, our global office nodes are standing by.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
        {/* Contact info channels (Left) */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 space-y-6 order-2 lg:order-1"
        >
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <h3 className="font-display text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-400" /> Contact Ingress
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center border border-white/10 text-orange-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">General Enquiries</span>
                  <a href="mailto:corebitsolutionspvtltd@gmail.com" className="text-slate-205 text-sm hover:text-orange-300 transition-colors">
                    corebitsolutionspvtltd@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center border border-white/10 text-orange-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Corporate Support Lines</span>
                  <div className="flex flex-col space-y-1 mt-1">
                    <a href="tel:+919597123923" className="text-slate-200 text-xs sm:text-sm hover:text-orange-300 transition-colors font-medium">
                      +91 95971 23923
                    </a>
                    <a href="tel:+919500726936" className="text-slate-200 text-xs sm:text-sm hover:text-orange-300 transition-colors font-medium">
                      +91 95007 26936
                    </a>
                    <a href="tel:+919363153995" className="text-slate-200 text-xs sm:text-sm hover:text-orange-300 transition-colors font-medium">
                      +91 93631 53995
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center border border-white/10 text-orange-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Work Hours</span>
                  <span className="block text-slate-200 text-sm">
                    Mon - Fri: 09:00 - 18:00 (Local Timezones)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick branch nodes summary */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl animate-fadeIn">
            <h4 className="font-sans text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-4 border-b border-white/5 pb-1 select-none">
              Personnel Operators
            </h4>
            <div className="space-y-3.5">
              {TEAM_MEMBERS.map(member => (
                <div key={member.name} className="flex flex-col text-xs border-b border-white/5 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-250 font-bold tracking-wide font-sans">{member.name}</span>
                    <a href={`tel:${member.phone.replace(/\s+/g, '')}`} className="text-slate-400 hover:text-orange-400 font-mono text-[11px] transition-colors">
                      {member.phone}
                    </a>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans tracking-wide font-medium">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Message Web Form (Right) */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl relative overflow-hidden order-1 lg:order-2"
          id="contact-form-stage"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="contact-active-form"
                onSubmit={handleSubmit}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5 text-left"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-400">
                    <Send className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base sm:text-md uppercase tracking-tight">
                    Submit Message Payload
                  </h3>
                </div>

                {formError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl font-sans" id="form-error-banner">
                    ⚠️ {formError}
                  </div>
                )}

                <div>
                  <label htmlFor="name-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    id="name-input"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Your Corporate Email *
                  </label>
                  <input
                    type="email"
                    id="email-input"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Your Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="phone-input"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Subject of Interest *
                  </label>
                  <div className="relative">
                    <select
                      id="subject-select"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 pr-12 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                      required
                    >
                      <option value="Custom Software Consultation" className="bg-[#0f172a] text-white">Custom Software Consultation</option>
                      <option value="Mobile App Development" className="bg-[#0f172a] text-white">Mobile App Development</option>
                      <option value="Web Development Services" className="bg-[#0f172a] text-white">Web Development Services</option>
                      <option value="Windows Application Development" className="bg-[#0f172a] text-white">Windows Application Development</option>
                      <option value="DevOps & Infrastructure Auditing" className="bg-[#0f172a] text-white">DevOps & Infrastructure Auditing</option>
                      <option value="General Corporate Support" className="bg-[#0f172a] text-white">General Corporate Support</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Your Message / Query *
                  </label>
                  <textarea
                    id="message-input"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe how we can support you..."
                    rows={4}
                    className="w-full px-5 py-3 rounded-2xl bg-[#0f172a]/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    required
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    id="submit-form-btn"
                    className="w-full py-3.5 rounded-full bg-orange-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer opacity-95 hover:bg-orange-400 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Dispatching Message...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Secure Message</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="contact-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
                id="contact-success-banner"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  Message Dispatched!
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-6 font-sans">
                  Thank you for reaching out to CoreBit Solutions. Your query has been logged securely in our support pipeline. An account lead from our operations team will reply within 24 hours.
                </p>

                {localStorage.getItem("corebit_force_simulation") === "true" ? (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300 max-w-sm mx-auto mb-6 text-center leading-relaxed font-sans">
                    ℹ️ <strong>Sandbox Mode Active:</strong> Registered locally inside your browser's memory. To integrate with your real Google Firestore database, update your credentials in the <strong>Admin Console &gt; Firebase</strong> tab.
                  </div>
                ) : localStorage.getItem("corebit_firestore_last_error") ? (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-rose-350 max-w-sm mx-auto mb-6 text-center leading-relaxed font-sans break-words">
                    ⚠️ <strong>Cloud Write Denied:</strong> {JSON.parse(localStorage.getItem("corebit_firestore_last_error") || "{}").message}. Message saved in local fallback storage. Access <strong>Admin console &gt; Firebase Connection</strong> to adjust your credentials or Firestore rules.
                  </div>
                ) : null}

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-5 py-2.5 rounded-full border border-white/10 text-slate-350 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ADMIN INBOUND MESSAGES CONSOLE TABLE */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden"
            id="admin-messages-inbox-console"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/15 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-black text-white text-base sm:text-lg uppercase tracking-wider">
                    📬 Inbound Message Terminal
                  </h3>
                  <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mt-0.5">
                    Authorized System Admin Console
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all text-slate-300 hover:text-white cursor-pointer select-none"
                >
                  <Download className="w-4 h-4 text-orange-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Search Bar */}
              <div className="relative sm:col-span-2">
                <input
                  type="text"
                  placeholder="Search sender name, email, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Subject Selector */}
              <div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-4 py-3 text-slate-200 text-xs focus:border-amber-500 focus:outline-none appearance-none"
                >
                  <option value="all">Filter: All Subjects</option>
                  <option value="Custom Software Consultation">Custom Software Consultation</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Web Development Services">Web Development Services</option>
                  <option value="Windows Application Development">Windows Application Development</option>
                  <option value="DevOps & Infrastructure Auditing">DevOps & Infrastructure Auditing</option>
                  <option value="General Corporate Support">General Corporate Support</option>
                </select>
              </div>
            </div>

            {/* Grid Table Display */}
            <div className="overflow-x-auto border border-white/5 rounded-2xl bg-[#0a0f1d]/60">
              {filteredMessages.length > 0 ? (
                <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0f172a]/80 select-none font-mono text-[9px] uppercase font-semibold text-slate-400 tracking-wider">
                      <th className="p-4">Sender Details</th>
                      <th className="p-4">Subject & Message Block</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Status Flag</th>
                      <th className="p-4 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-white/[2%] transition-all">
                        {/* Name and Email */}
                        <td className="p-4">
                          <span className="block font-bold text-white text-sm leading-tight">{msg.name}</span>
                          <span className="block text-[11px] text-slate-400 mt-1 font-mono">{msg.email}</span>
                        </td>
                        
                        {/* Subject and Message block */}
                        <td className="p-4 max-w-sm">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 font-mono text-[9px] font-bold uppercase tracking-wider mb-2 select-none">
                            {msg.subject}
                          </span>
                          <p className="text-slate-300 text-xs leading-relaxed break-words font-sans">
                            {msg.message}
                          </p>
                        </td>

                        {/* Date sent */}
                        <td className="p-4 whitespace-nowrap text-[11px] font-mono text-slate-400">
                          {msg.timestamp}
                        </td>

                        {/* Status tag */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5 w-24">
                            <span className={`px-2 py-1 rounded-lg text-center text-[9px] font-extrabold uppercase tracking-widest ${
                              msg.status === "Pending" ? "bg-amber-500/15 text-amber-400 border border-amber-500/10" :
                              msg.status === "Reviewed" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/10" :
                              "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10"
                            }`}>
                              {msg.status}
                            </span>
                            {/* Actions to toggle status directly */}
                            <select
                              value={msg.status}
                              onChange={(e) => handleMessageStatusChange(msg.id, e.target.value as any)}
                              className="bg-[#0f172a] border border-white/10 rounded-lg text-[9px] font-bold text-slate-400 py-0.5 px-1 focus:outline-none focus:border-amber-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Contacted">Contacted</option>
                            </select>
                          </div>
                        </td>

                        {/* Remove button */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (deleteConfirmId === msg.id) {
                                handleMessageDelete(msg.id);
                                setDeleteConfirmId(null);
                              } else {
                                setDeleteConfirmId(msg.id);
                                setTimeout(() => {
                                  setDeleteConfirmId(prev => prev === msg.id ? null : prev);
                                }, 3000);
                              }
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-250 cursor-pointer flex items-center gap-1.5 ml-auto border ${
                              deleteConfirmId === msg.id
                                ? "bg-red-650 border-red-500 text-white animate-pulse"
                                : "bg-red-500/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-transparent"
                            }`}
                            title={deleteConfirmId === msg.id ? "Click again to confirm purge" : "Delete Message Record"}
                          >
                            <Trash2 className="w-4 h-4" />
                            {deleteConfirmId === msg.id && <span>Sure?</span>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-500 space-y-2 select-none">
                  <AlertTriangle className="w-10 h-10 text-amber-500/30 mx-auto" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">No Messages Logged</p>
                  <p className="text-xs text-slate-600">The filtered search result returned zero active communications.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
