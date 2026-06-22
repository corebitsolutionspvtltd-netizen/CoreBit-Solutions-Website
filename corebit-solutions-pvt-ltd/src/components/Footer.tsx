/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActivePage } from "../types";
import { Cpu, Mail, Phone, ShieldCheck, Edit, X, Save, Twitter, Linkedin, Github } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import { 
  fetchFooterSettings, 
  saveFooterSettings 
} from "../firebase/dbService";

interface FooterProps {
  onPageChange: (page: ActivePage) => void;
}

export default function Footer({ onPageChange }: FooterProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(
    localStorage.getItem("corebit_admin_mode") === "true" || localStorage.getItem("cbit_admin_access") === "true"
  );

  useEffect(() => {
    const handleFooterAdminSync = () => {
      setIsAdmin(localStorage.getItem("corebit_admin_mode") === "true" || localStorage.getItem("cbit_admin_access") === "true");
    };
    window.addEventListener("corebit_admin_mode_changed", handleFooterAdminSync);
    return () => window.removeEventListener("corebit_admin_mode_changed", handleFooterAdminSync);
  }, []);

  // Footer state
  const [footerSettings, setFooterSettings] = useState(() => {
    const saved = localStorage.getItem("corebit_footer_settings_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing footer settings", e);
      }
    }
    return {
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
  });

  // Fetch Cloud State on Mount
  useEffect(() => {
    const loadFooterCloud = async () => {
      try {
        const cloud = await fetchFooterSettings();
        if (cloud) {
          setFooterSettings(cloud);
        }
      } catch (e) {
        console.error("Failed loading cloud footer options:", e);
      }
    };
    loadFooterCloud();

    const handleFooterSync = () => {
      loadFooterCloud();
    };
    window.addEventListener("corebit_footer_settings_updated", handleFooterSync);
    return () => {
      window.removeEventListener("corebit_footer_settings_updated", handleFooterSync);
    };
  }, []);

  // Modal active state
  const [showModal, setShowModal] = useState(false);
  
  // Backing form inputs
  const [formAboutText, setFormAboutText] = useState("");
  const [formQualityBadge, setFormQualityBadge] = useState("");
  const [formOpsHubTitle, setFormOpsHubTitle] = useState("");
  const [formAddressName, setFormAddressName] = useState("");
  const [formAddressLine1, setFormAddressLine1] = useState("");
  const [formAddressLine2, setFormAddressLine2] = useState("");
  const [formSupportEmail, setFormSupportEmail] = useState("");
  const [formDialsText, setFormDialsText] = useState("");
  const [formCopyrightText, setFormCopyrightText] = useState("");
  const [formCopyrightSub, setFormCopyrightSub] = useState("");
  const [formTwitterLink, setFormTwitterLink] = useState("");
  const [formLinkedinLink, setFormLinkedinLink] = useState("");
  const [formGithubLink, setFormGithubLink] = useState("");

  const handleOpenModal = () => {
    setFormAboutText(footerSettings.aboutText);
    setFormQualityBadge(footerSettings.qualityBadge);
    setFormOpsHubTitle(footerSettings.operationsHubTitle);
    setFormAddressName(footerSettings.addressName);
    setFormAddressLine1(footerSettings.addressLine1);
    setFormAddressLine2(footerSettings.addressLine2);
    setFormSupportEmail(footerSettings.supportEmail);
    setFormDialsText(footerSettings.dialsText);
    setFormCopyrightText(footerSettings.copyrightText);
    setFormCopyrightSub(footerSettings.copyrightSub);
    setFormTwitterLink(footerSettings.twitterLink);
    setFormLinkedinLink(footerSettings.linkedinLink);
    setFormGithubLink(footerSettings.githubLink);
    setShowModal(true);
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      aboutText: formAboutText,
      qualityBadge: formQualityBadge,
      operationsHubTitle: formOpsHubTitle,
      addressName: formAddressName,
      addressLine1: formAddressLine1,
      addressLine2: formAddressLine2,
      supportEmail: formSupportEmail,
      dialsText: formDialsText,
      copyrightText: formCopyrightText,
      copyrightSub: formCopyrightSub,
      twitterLink: formTwitterLink,
      linkedinLink: formLinkedinLink,
      githubLink: formGithubLink
    };

    setFooterSettings(updated);
    
    try {
      await saveFooterSettings(updated);
    } catch (err) {
      console.error("Failed saving footer modifications:", err);
    }
    
    setShowModal(false);
  };

  const directoryItems = [
    { label: "Home", page: ActivePage.HOME, emoji: "🏠" },
    { label: "Services", page: "services", emoji: "🛠️" },
    { label: "Projects", page: ActivePage.PROJECTS, emoji: "📁" },
    { label: "Client Reviews", page: ActivePage.REVIEWS, emoji: "⭐" },
    { label: "Pricing Plans", page: ActivePage.PRICING, emoji: "💰" },
    { label: "Company Details", page: ActivePage.DETAILS, emoji: "🏢" },
    { label: "Contact Us", page: ActivePage.CONTACT, emoji: "📞" },
    { label: "Secure Admin Portal", page: ActivePage.ADMIN, emoji: "🔒" },
  ];

  const handleNavClick = (page: ActivePage | "services") => {
    if (page === "services") {
      onPageChange(ActivePage.HOME);
      setTimeout(() => {
        const el = document.getElementById("roles-responsibilities-section") || document.getElementById("navigation-bento-grid");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } else {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const dialNumbers = footerSettings.dialsText
    .split("\n")
    .map(num => num.trim())
    .filter(Boolean);

  return (
    <footer className="bg-[#050912] border-t border-white/5 pt-16 pb-12 w-full mt-auto relative z-20 text-slate-300 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating footer inline trigger for admins */}
        {isAdmin && (
          <div className="mb-8 p-3.5 rounded-2xl bg-amber-550/10 border border-amber-500/20 flex justify-between items-center gap-4">
            <span className="text-[11px] font-mono font-bold uppercase text-amber-200">
              ⚡ Footer Structure Configurable Mode
            </span>
            <button
              onClick={handleOpenModal}
              className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Edit className="w-3 h-3" />
              <span>Modify Corporate Footer</span>
            </button>
          </div>
        )}

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 mb-14">
          
          {/* Column 1: Corebit Solutions Pvt Ltd Branding & Socials */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col space-y-5">
            <div>
              <Logo size="custom" />
            </div>

            <p className="text-slate-405 text-xs sm:text-[13px] font-sans leading-relaxed text-left max-w-sm">
              {footerSettings.aboutText}
            </p>

            {/* Social Media Links customization */}
            <div className="flex items-center gap-3 pt-1">
              {footerSettings.twitterLink && (
                <a 
                  href={footerSettings.twitterLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 border border-white/5 transition-all flex items-center justify-center cursor-pointer"
                  title="Twitter Custom Path"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {footerSettings.linkedinLink && (
                <a 
                  href={footerSettings.linkedinLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 border border-white/5 transition-all flex items-center justify-center cursor-pointer"
                  title="LinkedIn Custom Path"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {footerSettings.githubLink && (
                <a 
                  href={footerSettings.githubLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 border border-white/5 transition-all flex items-center justify-center cursor-pointer"
                  title="GitHub Custom Path"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </div>

            {footerSettings.qualityBadge && (
              <div className="flex items-center gap-2 text-emerald-400/90 py-1">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">
                  {footerSettings.qualityBadge}
                </span>
              </div>
            )}
          </div>

          {/* Column 2: Client Directory */}
          <div className="md:col-span-6 lg:col-span-3 flex flex-col space-y-4">
            <h4 className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#94a3b8] border-b border-white/5 pb-1 select-none">
              CLIENT DIRECTORY
            </h4>
            <div className="flex flex-col space-y-3">
              {directoryItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.page as any)}
                  className="flex items-center gap-2.5 text-xs sm:text-[13px] text-slate-400 hover:text-white transition-colors duration-200 text-left font-sans font-medium w-fit cursor-pointer"
                >
                  <span className="text-sm select-none">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Regional Hub & Contacts */}
          <div className="md:col-span-6 lg:col-span-4 flex flex-col space-y-4">
            <h4 className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#94a3b8] border-b border-white/5 pb-1 select-none font-bold">
              {footerSettings.operationsHubTitle}
            </h4>
            <div className="text-slate-400 text-xs sm:text-[13px] font-sans space-y-1.5 leading-relaxed text-left">
              <p className="font-semibold text-slate-200">{footerSettings.addressName}</p>
              <p>{footerSettings.addressLine1}</p>
              <p>{footerSettings.addressLine2}</p>
            </div>

            <div className="space-y-3.5 pt-3">
              <a 
                href={`mailto:${footerSettings.supportEmail}`}
                className="flex items-center gap-2.5 text-xs sm:text-[13px] text-slate-400 hover:text-white transition-colors duration-200 w-fit"
              >
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{footerSettings.supportEmail}</span>
              </a>
              <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-400">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex flex-col space-y-1 text-left">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-slate-500 font-mono">Operations Hotline dials:</span>
                  {dialNumbers.map((num, idx) => (
                    <a key={idx} href={`tel:${num.replace(/\s+/g, "")}`} className="hover:text-white transition-colors duration-150 font-mono text-[12px]">
                      {num}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & tech specs bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <span className="block text-[11px] text-slate-400 font-bold tracking-wide">
              {footerSettings.copyrightText}
            </span>
            <span className="block text-[10px] text-slate-500 font-sans">
              {footerSettings.copyrightSub}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-bold tracking-widest uppercase font-mono flex items-center md:self-center select-none gap-2">
            <span>Powered By CoreBit Solutions</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* EDIT MODAL DIALOG CONTAINER */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left text-slate-200 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display text-base font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-400" />
                <span>Configure Corporate Footer</span>
              </h3>

              <form onSubmit={handleSaveFooter} className="space-y-4 text-xs font-semibold">
                
                <div className="space-y-1">
                  <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider text-orange-400">Branding About Copy *</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-sans leading-normal focus:outline-none focus:border-orange-500"
                    placeholder="Describe Corebit Solutions..."
                    value={formAboutText}
                    onChange={(e) => setFormAboutText(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Quality / Security Seal text</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="ISO 9001:2015 STAMP"
                      value={formQualityBadge}
                      onChange={(e) => setFormQualityBadge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Helpdesk Admin Email *</label>
                    <input
                      type="email"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="corebitsolutionspvtltd@gmail.com"
                      value={formSupportEmail}
                      onChange={(e) => setFormSupportEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Regional Hub Title *</label>
                  <input
                    type="text"
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                    placeholder="COIMBATORE OPERATIONS HUB"
                    value={formOpsHubTitle}
                    onChange={(e) => setFormOpsHubTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Entity Address Name *</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="Corebit Solutions Pvt Ltd,"
                      value={formAddressName}
                      onChange={(e) => setFormAddressName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Address Line 1 *</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="Peelamedu, Road"
                      value={formAddressLine1}
                      onChange={(e) => setFormAddressLine1(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Address Line 2 *</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="Coimbatore, Tamil Nadu"
                      value={formAddressLine2}
                      onChange={(e) => setFormAddressLine2(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 font-mono">
                  <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Hotline Dials list (one check per line) *</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                    placeholder="+91 95971 23923&#10;+91 95007 26936"
                    value={formDialsText}
                    onChange={(e) => setFormDialsText(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Twitter URL</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-[11px]"
                      placeholder="https://twitter.com/..."
                      value={formTwitterLink}
                      onChange={(e) => setFormTwitterLink(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">LinkedIn URL</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-[11px]"
                      placeholder="https://linkedin.com/..."
                      value={formLinkedinLink}
                      onChange={(e) => setFormLinkedinLink(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">GitHub URL</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-[11px]"
                      placeholder="https://github.com/..."
                      value={formGithubLink}
                      onChange={(e) => setFormGithubLink(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Copyright Statement *</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="© 2026 Corebit..."
                      value={formCopyrightText}
                      onChange={(e) => setFormCopyrightText(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-404 font-mono text-[9px] uppercase tracking-wider">Copyright Sub-note *</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="Registered Non-Government Technology Publication..."
                      value={formCopyrightSub}
                      onChange={(e) => setFormCopyrightSub(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-orange-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Footer Structure</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </footer>
  );
}
