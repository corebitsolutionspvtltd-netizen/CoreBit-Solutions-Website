/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { TEAM_MEMBERS, COMPANY_MILESTONES } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, Sparkles, Building, Mail, Phone, Calendar, Users, 
  Edit, Trash2, Plus, Download, FileText, Globe, ExternalLink,
  Twitter, Linkedin, Github, Save, X, RefreshCw, Upload,
  Cpu, Layers, MessageSquare, Heart, Compass
} from "lucide-react";
import { fetchCompanyDetails, saveCompanyDetails, CompanyDetails } from "../firebase/dbService";

export default function DetailsView() {
  const [isAdmin, setIsAdmin] = useState<boolean>(
    localStorage.getItem("corebit_admin_mode") === "true" || localStorage.getItem("cbit_admin_access") === "true"
  );
  
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal form states
  const [editCorporateName, setEditCorporateName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editGst, setEditGst] = useState("");
  const [editUdyam, setEditUdyam] = useState("");
  const [editTwitter, setEditTwitter] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editGithub, setEditGithub] = useState("");

  // Certificate action states
  const [renameCertificateId, setRenameCertificateId] = useState<string | null>(null);
  const [tempRenameTitle, setTempRenameTitle] = useState("");
  const [timelineMode, setTimelineMode] = useState<string>(() => localStorage.getItem("corebit_timeline_mode") || "milestone");

  // Sync admin mode changes
  useEffect(() => {
    const handleAdminChange = () => {
      setIsAdmin(localStorage.getItem("corebit_admin_mode") === "true" || localStorage.getItem("cbit_admin_access") === "true");
    };
    window.addEventListener("corebit_admin_mode_changed", handleAdminChange);
    return () => window.removeEventListener("corebit_admin_mode_changed", handleAdminChange);
  }, []);

  // Fetch company details on mount and listen to updates
  const loadData = async () => {
    try {
      const data = await fetchCompanyDetails();
      setCompanyDetails(data);
      
      // Initialize edit fields
      if (data) {
        setEditCorporateName(data.corporateName || "");
        setEditEmail(data.email || "");
        setEditPhone(data.phone || "");
        setEditAddress(data.address || "");
        setEditGst(data.gst || "");
        setEditUdyam(data.udyam || "");
        setEditTwitter(data.socialLinks?.twitter || "");
        setEditLinkedin(data.socialLinks?.linkedin || "");
        setEditGithub(data.socialLinks?.github || "");
      }
    } catch (e) {
      console.error("Error loading company details in DetailsView:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("corebit_company_details_updated", handleUpdate);
    return () => window.removeEventListener("corebit_company_details_updated", handleUpdate);
  }, []);

  const handleOpenEdit = () => {
    if (!companyDetails) return;
    setEditCorporateName(companyDetails.corporateName);
    setEditEmail(companyDetails.email);
    setEditPhone(companyDetails.phone);
    setEditAddress(companyDetails.address);
    setEditGst(companyDetails.gst);
    setEditUdyam(companyDetails.udyam);
    setEditTwitter(companyDetails.socialLinks?.twitter || "");
    setEditLinkedin(companyDetails.socialLinks?.linkedin || "");
    setEditGithub(companyDetails.socialLinks?.github || "");
    setShowEditModal(true);
  };

  const handleSaveCorporateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyDetails) return;
    setIsSaving(true);
    
    const updatedDetails: CompanyDetails = {
      ...companyDetails,
      corporateName: editCorporateName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      gst: editGst,
      udyam: editUdyam,
      socialLinks: {
        twitter: editTwitter,
        linkedin: editLinkedin,
        github: editGithub
      }
    };

    try {
      await saveCompanyDetails(updatedDetails);
      setCompanyDetails(updatedDetails);
      setShowEditModal(false);
    } catch (e) {
      console.error("Error saving corporate credentials:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // Certificate Upload Handler
  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyDetails) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const newCertificate = {
        id: `cert-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
        fileName: file.name,
        fileUrl: base64Data
      };

      const updatedCertificates = [...(companyDetails.certificates || []), newCertificate];
      const updatedDetails = { ...companyDetails, certificates: updatedCertificates };
      
      setCompanyDetails(updatedDetails);
      await saveCompanyDetails(updatedDetails);
    };
    reader.readAsDataURL(file);
  };

  // Certificate Delete Handler
  const handleDeleteCertificate = async (id: string) => {
    if (!companyDetails) return;
    const updatedCertificates = (companyDetails.certificates || []).filter(c => c.id !== id);
    const updatedDetails = { ...companyDetails, certificates: updatedCertificates };
    
    setCompanyDetails(updatedDetails);
    await saveCompanyDetails(updatedDetails);
  };

  // Certificate Rename Submit Handler
  const handleRenameCertificate = async (id: string) => {
    if (!companyDetails || !tempRenameTitle.trim()) return;
    const updatedCertificates = (companyDetails.certificates || []).map(c => 
      c.id === id ? { ...c, title: tempRenameTitle.trim() } : c
    );
    const updatedDetails = { ...companyDetails, certificates: updatedCertificates };
    
    setCompanyDetails(updatedDetails);
    await saveCompanyDetails(updatedDetails);
    setRenameCertificateId(null);
    setTempRenameTitle("");
  };

  const activeDetails = companyDetails || {
    corporateName: "CoreBit Solutions Pvt Ltd",
    email: "corebitsolutionspvtltd@gmail.com",
    phone: "+91 95971 23923",
    address: "Flat/Door/Block No. 8/33, TVK Street, KG Chavadi, Coimbatore, Tamil Nadu, Pin 641105",
    gst: "33AABCC1234F1Z1",
    udyam: "UDYAM-TN-03-0330267"
  };

  return (
    <div className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative">
        {isAdmin && (
          <div className="absolute top-0 right-0 z-10">
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-600/10 uppercase tracking-wider"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Credentials
            </button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Building className="w-3.5 h-3.5 text-orange-400" />
          Organizational Summary
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase"
        >
          Company <span className="text-orange-400 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent opacity-90">Details & DNA</span>
        </motion.h1>
         <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base text-slate-300 font-sans mt-3 max-w-2xl mx-auto"
        >
          {activeDetails.corporateName} is meticulously registered for enterprise-tier engineering and globally aligned software systems output.
        </motion.p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <RefreshCw className="w-7 h-7 text-orange-500 animate-spin" />
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">Loading Corporate Registries...</span>
        </div>
      ) : (
        <>
          {/* Main Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* DNA Column (Left) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl relative group">
                {isAdmin && (
                  <button
                    onClick={handleOpenEdit}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-orange-600/10 text-orange-400 hover:bg-orange-600 hover:text-white transition-all cursor-pointer border border-orange-500/10"
                    title="Edit legal info"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}

                <h3 className="font-display text-lg font-bold text-white mb-4.5 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400" /> Legal & Operations
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Corporate Name</span>
                    <span className="text-sm font-semibold text-slate-200">{activeDetails.corporateName}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">GST Identification Number</span>
                    <span className="text-sm font-mono font-bold text-orange-300">{activeDetails.gst || "Not Configured"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Gov. UDYAM Certificate Number</span>
                    <span className="text-sm font-mono font-bold text-teal-300">{activeDetails.udyam || "Not Configured"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Primary Email Contact</span>
                    <a href={`mailto:${activeDetails.email}`} className="text-sm font-semibold text-slate-200 hover:text-orange-400 transition-colors break-all block">{activeDetails.email}</a>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Corporate Office Address</span>
                    <span className="text-xs text-slate-300 leading-relaxed block mt-0.5">{activeDetails.address}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Corporate Phone Line</span>
                    <a href={`tel:${activeDetails.phone.replace(/\s+/g, '')}`} className="text-sm font-semibold text-slate-200 hover:text-orange-400 transition-colors block">{activeDetails.phone}</a>
                  </div>

                  {/* Social Handles */}
                  {(activeDetails.socialLinks?.twitter || activeDetails.socialLinks?.linkedin || activeDetails.socialLinks?.github) && (
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Social Links</span>
                      <div className="flex gap-2">
                        {activeDetails.socialLinks?.linkedin && (
                          <a href={activeDetails.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-white/5 border border-white/5 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/20 transition-all text-slate-400">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {activeDetails.socialLinks?.github && (
                          <a href={activeDetails.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-white/5 border border-white/5 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/20 transition-all text-slate-400">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {activeDetails.socialLinks?.twitter && (
                          <a href={activeDetails.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-white/5 border border-white/5 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/20 transition-all text-slate-400">
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                <h3 className="font-display text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" /> Technology Advantage
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
                  We leverage modern toolchains to speed up iterations while maintaining standard compliance. High performance is non-negotiable.
                </p>
                <div className="flex flex-wrap gap-2 mt-4.5">
                  {["React", "Node.js", "TypeScript", "FastAPI", "AWS", "Go", "Docker", "D3.js"].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Middle and Right: Milestones & Certification Vault */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Secure Certifications Vault */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-400" /> Certificates & Accreditations
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Legally recognized ISO standard metrics, brand credentials and active service agreements.</p>
                  </div>
                  {isAdmin && (
                    <label className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider">
                      <Upload className="w-3.5 h-3.5" />
                      Upload PDF/Image
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        className="hidden" 
                        onChange={handleCertificateUpload} 
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activeDetails.certificates || []).map(cert => (
                    <div key={cert.id} className="p-4 rounded-2xl bg-[#0d1321]/80 border border-white/5 hover:border-white/10 flex justify-between items-start gap-3 transition-all relative group">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          {renameCertificateId === cert.id ? (
                            <div className="flex items-center gap-1 mt-1">
                              <input 
                                type="text"
                                className="bg-[#0f172a] border border-white/20 rounded px-2 py-1 text-slate-100 text-xs"
                                value={tempRenameTitle}
                                onChange={(e) => setTempRenameTitle(e.target.value)}
                                autoFocus
                              />
                              <button onClick={() => handleRenameCertificate(cert.id)} className="p-1.5 rounded bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white transition-all"><Save className="w-3" /></button>
                              <button onClick={() => setRenameCertificateId(null)} className="p-1.5 rounded bg-white/5 text-slate-400"><X className="w-3" /></button>
                            </div>
                          ) : (
                            <h4 className="text-xs font-bold text-slate-200 leading-normal">{cert.title}</h4>
                          )}
                          <span className="block text-[9px] font-mono text-slate-500 uppercase font-black tracking-wide truncate max-w-[180px]" title={cert.fileName}>{cert.fileName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {cert.fileUrl && (
                          <a 
                            href={cert.fileUrl} 
                            download={cert.fileName}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
                            title="Download Certificate"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setRenameCertificateId(cert.id);
                                setTempRenameTitle(cert.title);
                              }}
                              className="p-1.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all"
                              title="Rename"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (deleteConfirmId === cert.id) {
                                  handleDeleteCertificate(cert.id);
                                  setDeleteConfirmId(null);
                                } else {
                                  setDeleteConfirmId(cert.id);
                                  setTimeout(() => {
                                    setDeleteConfirmId(prev => prev === cert.id ? null : prev);
                                  }, 3000);
                                }
                              }}
                              className={`p-1.5 rounded transition-all text-xs font-bold leading-none flex items-center gap-1 ${
                                deleteConfirmId === cert.id
                                  ? "bg-red-650 border border-red-500 text-white animate-pulse px-2"
                                  : "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-550 hover:text-white"
                              }`}
                              title={deleteConfirmId === cert.id ? "Click again to confirm delete" : "Delete"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deleteConfirmId === cert.id && <span>Sure?</span>}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {(activeDetails.certificates || []).length === 0 && (
                    <div className="col-span-2 text-center py-8 text-slate-500 border border-dashed border-white/5 rounded-2xl select-none text-xs">
                      No documents catalogued. Select Upload PDF/Image above to register.
                    </div>
                  )}
                </div>
              </motion.div>

            </div>
          </div>

          {/* Core Team Members Section */}
          <h3 className="font-sans text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 select-none">
            <Users className="w-5.5 h-5.5 text-orange-400" /> Core Leadership & Engineering Nodes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="company-team-grid">
            {TEAM_MEMBERS.map((member) => (
              <motion.div
                key={member.name}
                id={`team-item-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-md flex flex-col justify-between h-full transition-all duration-300 group shadow-xl"
              >
                <div>
                  <span className="block text-[10px] uppercase font-bold text-orange-400 tracking-wider mb-1 font-mono">
                    OPERATIONS NODE
                  </span>
                  <h4 className="font-sans text-lg font-bold text-white uppercase tracking-wider group-hover:text-orange-300 transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-slate-300 text-xs font-sans mt-3 leading-relaxed min-h-[40px] font-medium">
                    {member.role}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4.5 mt-6.5 space-y-2">
                  <a 
                    href={`tel:${member.phone.replace(/\s+/g, '')}`} 
                    className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors duration-150 w-fit"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{member.phone}</span>
                  </a>
                  <a 
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-xs text-orange-300 hover:text-orange-400 transition-colors break-all w-fit font-medium"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.email}</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* INSTITUTIONAL/CORPORATE REGISTRATION EDIT MODAL */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display text-lg font-black text-white uppercase tracking-wider mb-5">
                Update Institutional Credentials
              </h3>

              <form onSubmit={handleSaveCorporateDetails} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Corporate Name</label>
                  <input 
                    type="text" 
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-205 text-xs w-full focus:outline-none focus:border-orange-500"
                    placeholder="CoreBit Solutions Pvt Ltd"
                    value={editCorporateName}
                    onChange={(e) => setEditCorporateName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider font-semibold">Primary Contact Phone</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-205 text-xs w-full focus:outline-none focus:border-orange-500"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Corporate Email Address</label>
                    <input 
                      type="email" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-205 text-xs w-full focus:outline-none focus:border-orange-500"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">GST Identification Number</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-205 text-xs w-full focus:outline-none focus:border-orange-500"
                      value={editGst}
                      onChange={(e) => setEditGst(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">UDYAM Certificate Number</label>
                    <input 
                      type="text" 
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-205 text-xs w-full focus:outline-none focus:border-orange-500"
                      value={editUdyam}
                      onChange={(e) => setEditUdyam(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Registered Corporate Address</label>
                  <textarea 
                    rows={2}
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-205 text-xs w-full focus:outline-none focus:border-orange-500 resize-none"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="border-t border-white/5 pt-3.5 space-y-3">
                  <span className="block font-mono text-[9px] uppercase font-black text-slate-450 tracking-wider">Social Channels Coordinates</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="font-mono text-[8px] text-slate-500 font-bold uppercase">LinkedIn</label>
                      <input 
                        type="text" 
                        className="bg-[#0f172a] border border-white/10 rounded px-2.5 py-2 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                        placeholder="https://linkedin.com/..."
                        value={editLinkedin}
                        onChange={(e) => setEditLinkedin(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[8px] text-slate-500 font-bold uppercase">GitHub</label>
                      <input 
                        type="text" 
                        className="bg-[#0f172a] border border-white/10 rounded px-2.5 py-2 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                        placeholder="https://github.com/..."
                        value={editGithub}
                        onChange={(e) => setEditGithub(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[8px] text-slate-500 font-bold uppercase">Twitter</label>
                      <input 
                        type="text" 
                        className="bg-[#0f172a] border border-white/10 rounded px-2.5 py-2 text-slate-202 text-xs w-full focus:outline-none focus:border-orange-500"
                        placeholder="https://twitter.com/..."
                        value={editTwitter}
                        onChange={(e) => setEditTwitter(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-orange-600/10"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? "Persisting to Cloud..." : "Commit Credentials"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
