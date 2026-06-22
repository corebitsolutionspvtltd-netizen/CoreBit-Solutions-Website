/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { DELIVERED_PROJECTS } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  CheckCircle2, 
  User, 
  Building2, 
  Briefcase, 
  Sparkles,
  X,
  CreditCard,
  MapPin,
  Star,
  Eye,
  ArrowRight,
  ArrowLeft,
  IndianRupee,
  Receipt,
  ShieldCheck,
  Building,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Cpu,
  Terminal,
  Activity,
  Database
} from "lucide-react";
import { Project } from "../types";
import { fetchProjects, saveProject, deleteProject as dbDeleteProject } from "../firebase/dbService";
import { normalizeImageUrl, parseScreenshotLines } from "../utils/imageUtils";
import SystemMockInterface from "./SystemMockInterface";
import ImageUploaderGrid from "./ImageUploaderGrid";

export default function ProjectsView() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [imageAspects, setImageAspects] = useState<Record<string, number>>({});

  useEffect(() => {
    // Reset image error cache state when changing projects & indexes
    setImageErrors({});
  }, [selectedProject, activeImgIdx]);

  // Load stateful projects from local storage or fallback to delivered projects list
  const [projects, setProjects] = useState<Project[]>([]);

  // Keep projects synchronized with dbService
  useEffect(() => {
    const loadProjects = async () => {
      const data = await fetchProjects();
      setProjects(data);
    };
    loadProjects();
    window.addEventListener("corebit_projects_updated", loadProjects);
    return () => {
      window.removeEventListener("corebit_projects_updated", loadProjects);
    };
  }, []);

  // Admin lock mode
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem("cbit_admin_access") === "true";
    const mode = localStorage.getItem("corebit_admin_mode") === "true";
    return saved || mode;
  });

  useEffect(() => {
    const handleAdminSync = () => {
      const saved = localStorage.getItem("cbit_admin_access") === "true";
      const mode = localStorage.getItem("corebit_admin_mode") === "true";
      setIsAdmin(saved || mode);
    };
    window.addEventListener("corebit_admin_mode_changed", handleAdminSync);
    return () => {
      window.removeEventListener("corebit_admin_mode_changed", handleAdminSync);
    };
  }, []);

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Projects delete verification confirm target
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Administrator add/edit form dialog controls
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<"add" | "edit">("add");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form Field State Bindings
  const [fieldName, setFieldName] = useState("");
  const [fieldCompany, setFieldCompany] = useState("");
  const [fieldClient, setFieldClient] = useState("");
  const [fieldStartedDate, setFieldStartedDate] = useState("");
  const [fieldDeliveredDate, setFieldDeliveredDate] = useState("");
  const [fieldProductValue, setFieldProductValue] = useState("");
  const [fieldLocation, setFieldLocation] = useState("");
  const [fieldOverview, setFieldOverview] = useState("");
  const [fieldRating, setFieldRating] = useState(5);
  const [fieldComment, setFieldComment] = useState("");
  const [fieldRole, setFieldRole] = useState("");
  const [fieldAvatar, setFieldAvatar] = useState("");
  const [fieldScreenshots, setFieldScreenshots] = useState<string[]>([]);

  const handleEnableAdminClick = () => {
    setShowPasswordPrompt(true);
    setPassword("");
    setPasswordError("");
  };

  const handleDisableAdmin = () => {
    setIsAdmin(false);
    localStorage.setItem("cbit_admin_access", "false");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim();
    if (cleanPassword === "admin123" || cleanPassword === "admin" || cleanPassword === "corebit123") {
      setIsAdmin(true);
      localStorage.setItem("cbit_admin_access", "true");
      setShowPasswordPrompt(false);
      setPassword("");
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again! (Hint: admin123)");
    }
  };

  const handleOpenAddProject = () => {
    setFormType("add");
    setEditingProjectId(null);
    setFieldName("");
    setFieldCompany("");
    setFieldClient("");
    setFieldStartedDate("");
    setFieldDeliveredDate("");
    setFieldProductValue("");
    setFieldLocation("");
    setFieldOverview("");
    setFieldRating(5);
    setFieldComment("");
    setFieldRole("");
    setFieldAvatar("");
    setFieldScreenshots([]);
    setShowFormModal(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setFormType("edit");
    setEditingProjectId(proj.id);
    setFieldName(proj.projectName);
    setFieldCompany(proj.companyName);
    setFieldClient(proj.clientName);
    setFieldStartedDate(proj.startedDate);
    setFieldDeliveredDate(proj.deliveredDate);
    setFieldProductValue(proj.paymentDetails?.totalAmount || "");
    setFieldLocation(proj.paymentDetails?.billingAddress || "");
    setFieldOverview(proj.projectOverview || "");
    setFieldRating(proj.clientReview?.rating || 5);
    setFieldComment(proj.clientReview?.comment || "");
    setFieldRole(proj.clientReview?.role || "");
    setFieldAvatar(proj.clientReview?.avatar || "");
    setFieldScreenshots(proj.screenshots || []);
    setShowFormModal(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      await dbDeleteProject(projectToDelete.id);
      if (selectedProject?.id === projectToDelete.id) {
        setSelectedProject(null);
      }
      setProjectToDelete(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fieldName.trim() || 
      !fieldCompany.trim() || 
      !fieldClient.trim() || 
      !fieldStartedDate.trim() || 
      !fieldDeliveredDate.trim() || 
      !fieldProductValue.trim() || 
      !fieldLocation.trim()
    ) {
      alert("All fields marked with * are required to display project information correctly.");
      return;
    }

    const cleanScreenshots = fieldScreenshots
      .map(url => normalizeImageUrl(url))
      .filter(Boolean);

    const defaultScreenshots = [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ];

    const projectScreenshots = cleanScreenshots.length > 0 ? cleanScreenshots : defaultScreenshots;

    const hasReview = fieldComment.trim().length > 0;
    const clientReview = hasReview ? {
      rating: fieldRating,
      comment: fieldComment.trim(),
      role: fieldRole.trim() || "Consultant Partner",
      avatar: normalizeImageUrl(fieldAvatar.trim()) || ""
    } : undefined;

    const paymentDetails = {
      totalAmount: fieldProductValue.trim(),
      pricingTier: "Bespoke Enterprise Group Integration",
      paymentStatus: "Paid in Full" as const,
      paymentMethod: "ACH Wire Transfer (Institutional)",
      billingAddress: fieldLocation.trim()
    };

    const projectData: Partial<Project> = {
      projectName: fieldName.trim(),
      companyName: fieldCompany.trim(),
      clientName: fieldClient.trim(),
      startedDate: fieldStartedDate.trim(),
      deliveredDate: fieldDeliveredDate.trim(),
      projectOverview: fieldOverview.trim() || "Custom database architecture and secure production systems integrated under standard corporate timelines.",
      screenshots: projectScreenshots,
      clientReview,
      paymentDetails
    };

    if (formType === "edit" && editingProjectId) {
      projectData.id = editingProjectId;
    }

    const saved = await saveProject(projectData);

    if (formType === "edit" && selectedProject?.id === editingProjectId) {
      setSelectedProject(saved);
    }

    setShowFormModal(false);
  };

  // Focus trap / keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setActiveImgIdx(0);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
  };

  const handleNextImage = (max: number) => {
    setActiveImgIdx((prev) => (prev + 1) % max);
  };

  const handlePrevImage = (max: number) => {
    setActiveImgIdx((prev) => (prev - 1 + max) % max);
  };

  return (
    <div className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          Delivered Engagements
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase"
        >
          Successfully <span className="text-orange-400 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent opacity-90">Delivered Projects</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base text-slate-300 font-sans mt-3 max-w-2xl mx-auto"
        >
          An audit-cleared record of corporate blueprints, production deployments, and software integrations successfully delivered by CoreBit Solutions Pvt Ltd.
        </motion.p>


      </div>

      {/* Projects Grid arranged in 3xN format */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12"
        id="projects-showcase-grid"
      >
        {/* Admin Card: Add New Project */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleOpenAddProject}
            className="relative group border-2 border-dashed border-orange-500/30 hover:border-orange-500/60 bg-orange-500/5 hover:bg-orange-500/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer flex flex-col items-center justify-center text-center min-h-[350px] select-none"
          >
            <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-200 group-hover:text-amber-300 transition-colors uppercase tracking-wider">
              Add New Project
            </h3>
            <p className="text-xs text-slate-400 max-w-[210px] mt-2 leading-relaxed font-sans">
              Provision a new verified engagement record for CoreBit's delivered portfolio.
            </p>
          </motion.div>
        )}

        {projects.filter(p => isAdmin || p.status !== "draft").map((project, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            key={project.id}
            className={`relative group bg-white/5 border ${project.status === "draft" ? "border-amber-500/30" : "border-white/10"} hover:border-orange-500/30 hover:bg-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-xl flex flex-col justify-between`}
          >
            {/* Card Accent Glow */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative z-10 space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-6">
                {/* Card Header Illustration */}
                <div className="flex items-center justify-between">
                  {project.status === "draft" ? (
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-[9px] font-mono text-amber-400 font-extrabold uppercase tracking-wide leading-none">
                      ⚠️ CSM Draft Mode (Offline)
                    </span>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  )}
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditProject(project)}
                        className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 hover:text-orange-350 transition-all cursor-pointer flex items-center justify-center"
                        title="Edit Project"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(project)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-500 hover:text-red-400 transition-all cursor-pointer flex items-center justify-center"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Completed Engagement
                    </span>
                  )}
                </div>

                {/* Project Name */}
                <div>
                  <span className="block text-[10px] uppercase font-bold text-orange-400 tracking-widest mb-1">
                    Project Name
                  </span>
                  <h3 className="font-display text-2.5xl font-extrabold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors uppercase">
                    {project.projectName}
                  </h3>
                </div>

                {/* Metadata List */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  {/* Client Name */}
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-[#0f172a] text-slate-400 shrink-0 border border-white/5">
                      <User className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Client Partner</span>
                      <span className="text-sm font-bold text-slate-100">{project.clientName}</span>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-[#0f172a] text-slate-400 shrink-0 border border-white/5">
                      <Building2 className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Corporate Entity</span>
                      <span className="text-sm font-bold text-slate-100">{project.companyName}</span>
                    </div>
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Started Date */}
                    <div className="p-3 py-3.5 rounded-2xl bg-[#0f172a]/40 border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.2 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[8px] uppercase font-bold tracking-wider">Started</span>
                      </div>
                      <span className="block text-xs font-bold text-slate-200">{project.startedDate}</span>
                    </div>

                    {/* Delivered Date */}
                    <div className="p-3 py-3.5 rounded-2xl bg-[#0f172a]/40 border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.2 text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[8px] uppercase font-bold tracking-wider">Delivered</span>
                      </div>
                      <span className="block text-xs font-bold text-slate-200">{project.deliveredDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show More Actions Footer Button */}
              <div className="pt-4 border-t border-white/10 mt-6 select-none">
                <button
                  type="button"
                  id={`btn-show-more-${project.id}`}
                  onClick={() => openProjectDetails(project)}
                  className="w-full py-3 px-4 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2 group-hover:scale-[1.01] active:scale-95"
                >
                  <Eye className="w-4 h-4 text-white" />
                  <span>Show More Details</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Interactive Details Modal Backdrop */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-xl">
            {/* Modal Closer Mask Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProjectDetails}
              className="absolute inset-0 cursor-default"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-5xl bg-[#0d1321] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 md:p-12 overflow-hidden z-10 max-h-[90vh] overflow-y-auto scrollbar-thin"
              id="project-depth-details-modal"
            >
              {/* Top Closer Pin */}
              <button
                type="button"
                onClick={closeProjectDetails}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer z-20"
                aria-label="Close details"
                id="btn-close-modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
                {/* LEFT CONSOLE: Showcase Pictures & System Summary */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Screenshots Module */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                        Production Live Showcase
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                        Screen {activeImgIdx + 1} of {selectedProject.screenshots?.length || 1}
                      </span>
                    </div>

                    {selectedProject.screenshots && selectedProject.screenshots.length > 0 ? (
                      <div className="space-y-3">
                        {/* Big Interactive Slide */}
                        <div 
                          className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 group/slider flex items-center justify-center transition-all duration-300 w-full max-h-[460px] sm:max-h-[500px] md:max-h-[520px] mx-auto shadow-2xl"
                          style={{
                            aspectRatio: imageErrors[selectedProject.screenshots[activeImgIdx]]
                              ? "1.7777"
                              : `${imageAspects[selectedProject.screenshots[activeImgIdx]] || 1.7777}`
                          }}
                        >
                          {imageErrors[selectedProject.screenshots[activeImgIdx]] ? (
                            <SystemMockInterface
                              projectName={selectedProject.projectName}
                              companyName={selectedProject.companyName}
                              projectOverview={selectedProject.projectOverview}
                              screenIndex={activeImgIdx}
                            />
                          ) : (
                            <img
                              src={normalizeImageUrl(selectedProject.screenshots[activeImgIdx])}
                              alt={`${selectedProject.projectName} production screen ${activeImgIdx + 1}`}
                              className="w-full h-full object-contain select-none bg-slate-950/80"
                              referrerPolicy="no-referrer"
                              onLoad={(e) => {
                                const img = e.currentTarget;
                                if (img.naturalWidth && img.naturalHeight) {
                                  const ratio = img.naturalWidth / img.naturalHeight;
                                  setImageAspects(prev => ({ 
                                    ...prev, 
                                    [selectedProject.screenshots[activeImgIdx]]: ratio 
                                  }));
                                }
                              }}
                              onError={() => {
                                const url = selectedProject.screenshots[activeImgIdx];
                                if (url) {
                                  setImageErrors(prev => ({ ...prev, [url]: true }));
                                }
                              }}
                            />
                          )}
                          
                          {/* Dark overlay slider gradient (Only visible if showing a real image, not our mock system dashboard) */}
                          {!imageErrors[selectedProject.screenshots[activeImgIdx]] && (
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                          )}

                          {/* Navigation Buttons Overlays */}
                          <button
                            type="button"
                            onClick={() => handlePrevImage(selectedProject.screenshots!.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/5 opacity-0 group-hover/slider:opacity-100 focus:opacity-100 z-10"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNextImage(selectedProject.screenshots!.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/5 opacity-0 group-hover/slider:opacity-100 focus:opacity-100 z-10"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Thumbnails list selectors */}
                        <div className="grid grid-cols-5 gap-2">
                          {selectedProject.screenshots.map((screen, sIdx) => {
                            const isCurrent = activeImgIdx === sIdx;
                            const hasError = imageErrors[screen];
                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => setActiveImgIdx(sIdx)}
                                className={`relative aspect-[16/10] rounded-lg overflow-hidden border bg-slate-950 cursor-pointer transition-all ${
                                  isCurrent ? "border-orange-500 ring-2 ring-orange-500/20" : "border-white/10 hover:border-white/20"
                                }`}
                              >
                                {hasError ? (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 p-1 gap-1">
                                    {sIdx % 5 === 0 && <Activity className="w-3.5 h-3.5 text-orange-400" />}
                                    {sIdx % 5 === 1 && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                                    {sIdx % 5 === 2 && <Database className="w-3.5 h-3.5 text-cyan-400" />}
                                    {sIdx % 5 === 3 && <Cpu className="w-3.5 h-3.5 text-purple-400" />}
                                    {sIdx % 5 === 4 && <Terminal className="w-3.5 h-3.5 text-amber-400" />}
                                    <span className="text-[6.5px] text-slate-400 uppercase font-mono font-bold tracking-tight text-center truncate w-full">
                                      {sIdx % 5 === 0 && "Monitor"}
                                      {sIdx % 5 === 1 && "Security"}
                                      {sIdx % 5 === 2 && "Database"}
                                      {sIdx % 5 === 3 && "Threads"}
                                      {sIdx % 5 === 4 && "Terminal"}
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    src={normalizeImageUrl(screen)}
                                    alt="Thumbnail view"
                                    className="w-full h-full object-cover select-none"
                                    referrerPolicy="no-referrer"
                                    onError={() => {
                                      setImageErrors(prev => ({ ...prev, [screen]: true }));
                                    }}
                                  />
                                )}
                                {!isCurrent && <div className="absolute inset-0 bg-black/45 hover:bg-black/10 transition-colors" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-slate-500 text-xs">No screenshots loaded</span>
                      </div>
                    )}
                  </div>

                  {/* Context overview box */}
                  <div className="p-6 rounded-2xl bg-[#0f172a]/55 border border-white/10 space-y-3">
                    <span className="block text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                      Business Architecture Overview
                    </span>
                    <h3 className="font-display text-xl font-extrabold text-white uppercase tracking-tight">
                      {selectedProject.projectName}
                    </h3>
                    <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans mt-2">
                      {selectedProject.projectOverview || "Custom application architecture fully integrated and deployed into production systems under strict client timelines."}
                    </p>
                    
                    {/* Compact dates row inside overview */}
                    <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-white/5">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none mb-1">Started Date</span>
                        <span className="text-xs text-slate-200 font-bold">{selectedProject.startedDate}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none mb-1">Delivered Date</span>
                        <span className="text-xs text-slate-200 font-bold">{selectedProject.deliveredDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT CONSOLE: Accounts Ledger & Client Testimonial */}
                <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
                  
                  {/* Account / Ledger Segment */}
                  <div className="bg-[#0f172a]/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
                    {/* Security stamp watermark element */}
                    <div className="absolute -right-6 -bottom-6 text-white/[0.02] transform -rotate-12 pointer-events-none">
                      <ShieldCheck className="w-40 h-40" />
                    </div>

                    <div className="relative z-10 space-y-5">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <span className="block text-[10px] uppercase font-bold text-slate-200 tracking-wider">
                            Authorized Payment Ledger
                          </span>
                        </div>
                        {/* Transaction ID */}
                        <span className="font-mono text-[9px] text-slate-400">REF: CBIT-{selectedProject.id.toUpperCase()}</span>
                      </div>

                      {/* Financial statistics fields */}
                      <div className="space-y-4 text-xs">
                        {/* Project Name */}
                        <div className="flex flex-col gap-1 pb-2 border-b border-white/5">
                          <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Project Name</span>
                          <span className="text-slate-100 font-extrabold text-sm uppercase">{selectedProject.projectName}</span>
                        </div>

                        {/* Client Name */}
                        <div className="flex flex-col gap-1 pb-2 border-b border-white/5">
                          <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Client Name</span>
                          <span className="text-slate-100 font-bold">{selectedProject.clientName}</span>
                        </div>

                        {/* Product Value */}
                        <div className="flex flex-col gap-1 pb-2 border-b border-white/5">
                          <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Product Value</span>
                          <span className="text-orange-450 font-extrabold text-sm font-mono">{selectedProject.paymentDetails?.totalAmount || "₹0.00"}</span>
                        </div>

                        {/* Location of Client */}
                        <div className="flex flex-col gap-1 pt-1">
                          <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Location of Client</span>
                          <span className="text-slate-200 font-medium leading-relaxed font-sans">
                            {selectedProject.paymentDetails?.billingAddress || "Not Listed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Testimonial Segment */}
                  {selectedProject.clientReview && (
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                          Verified Engagement Testimonial
                        </span>
                        
                        {/* Rating sequence */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: selectedProject.clientReview.rating }).map((_, rStarIdx) => (
                            <Star key={rStarIdx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      {/* Quotation text */}
                      <p className="text-slate-200 text-xs sm:text-sm font-sans italic leading-relaxed border-l-2 border-orange-500/50 pl-4 py-0.5">
                        "{selectedProject.clientReview.comment}"
                      </p>

                       {/* User Info bottom */}
                      <div className="flex items-center gap-3.5 pt-2">
                        <div>
                          <span className="block text-xs font-bold text-slate-100">{selectedProject.clientName}</span>
                          <span className="block text-[10px] text-slate-455 uppercase font-semibold">
                            {selectedProject.clientReview.role} at {selectedProject.companyName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operational Security Audit compliance */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1.5 uppercase font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Client Approved & Checked
                    </span>
                    <span className="uppercase tracking-widest text-[9px]">
                      CoreBit Corporate Group
                    </span>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Password Gate Modal */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base sm:text-lg uppercase tracking-tight">Administrator Access</h3>
                  <p className="text-slate-400 text-[11px] font-medium leading-none mt-1">Unlock developer setup management options</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                      Admin Space Password
                    </label>
                    <span className="text-[10px] font-mono text-orange-400 uppercase font-semibold">Hint: admin123</span>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter admin credentials..."
                    className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-sm focus:border-orange-500 focus:outline-none transition-all placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/15"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    autoFocus
                  />
                  {passwordError && (
                    <span className="text-red-400 text-xs font-semibold mt-1.5 block">
                      {passwordError}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setPassword("");
                      setPasswordError("");
                    }}
                    className="px-4 py-2.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-orange-500/5"
                  >
                    Verify Access
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Deletion Action Safeguard */}
      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d1321] border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-start gap-4 border-b border-white/10 pb-4 mb-5">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-base sm:text-lg uppercase tracking-tight">Confirm Deletion</h3>
                  <p className="text-slate-400 text-[11px] mt-1 font-medium">This action irreversibly destroys client engagement ledger records.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 mb-5 text-center">
                <span className="block text-[9px] uppercase font-bold text-red-400 tracking-widest leading-none mb-1.5">Project to Destroy</span>
                <span className="text-sm font-extrabold text-white uppercase tracking-tight">{projectToDelete.projectName}</span>
              </div>

              <div className="flex items-center justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="px-4 py-2.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-400 text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-red-500/5"
                >
                  Execute Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Configuration / Editor Dialog Form */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0d1321] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 z-10 max-h-[90vh] overflow-y-auto scrollbar-thin space-y-6"
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                      Engagement Setup
                    </span>
                    <h2 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                      {formType === "add" ? "Add New Project" : "Edit Project Specifications"}
                    </h2>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer select-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-4">
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500 border-b border-white/5 pb-1 select-none">
                    1. Primary Specifications
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Project Name <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ApexTrade Mobile Core"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Corporate Entity <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ApexTrade Solutions"
                        value={fieldCompany}
                        onChange={(e) => setFieldCompany(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Client Partner <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={fieldClient}
                        onChange={(e) => setFieldClient(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Started Date <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jan 15, 2024"
                        value={fieldStartedDate}
                        onChange={(e) => setFieldStartedDate(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Delivered Date <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. May 15, 2024"
                        value={fieldDeliveredDate}
                        onChange={(e) => setFieldDeliveredDate(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500 border-b border-white/5 pb-1 select-none">
                    2. Legal & Financial Ledger Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Product Value <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹40,25,500.00"
                        value={fieldProductValue}
                        onChange={(e) => setFieldProductValue(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Location of Client <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 120 Hawthorne St, San Francisco, CA"
                        value={fieldLocation}
                        onChange={(e) => setFieldLocation(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500 border-b border-white/5 pb-1 select-none">
                    3. Overview & Scope Narrative
                  </span>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                      Project Architecture Overview
                    </label>
                    <textarea
                      rows={3}
                      placeholder="A high-performance system integrated completely under tight client constraints..."
                      value={fieldOverview}
                      onChange={(e) => setFieldOverview(e.target.value)}
                      className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500 border-b border-white/5 pb-1 select-none">
                    4. External Client Testimonial (Optional)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Testimonial Rating (1 - 5)
                      </label>
                      <select
                        value={fieldRating}
                        onChange={(e) => setFieldRating(Number(e.target.value))}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all"
                      >
                        <option value={5}>5 Stars - Elite</option>
                        <option value={4}>4 Stars - Great</option>
                        <option value={3}>3 Stars - Satisfied</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                        Corporate Role
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CEO, Head of Product"
                        value={fieldRole}
                        onChange={(e) => setFieldRole(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                          Avatar Image URL
                        </label>
                        <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-orange-400 cursor-pointer hover:text-orange-300">
                          <Upload className="w-2.5 h-2.5" />
                          Upload Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement("canvas");
                                  let width = img.width;
                                  let height = img.height;
                                  const maxDimension = 150; // profile photos are small/compact
                                  if (width > maxDimension || height > maxDimension) {
                                    if (width > height) {
                                      height = Math.round((height * maxDimension) / width);
                                      width = maxDimension;
                                    } else {
                                      width = Math.round((width * maxDimension) / height);
                                      height = maxDimension;
                                    }
                                  }
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext("2d");
                                  if (ctx) {
                                    ctx.drawImage(img, 0, 0, width, height);
                                    const dataUrl = canvas.toDataURL("image/jpeg", 0.65);
                                    setFieldAvatar(dataUrl);
                                  }
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Leave blank to show initials"
                        value={fieldAvatar}
                        onChange={(e) => setFieldAvatar(e.target.value)}
                        className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
                      Testimonial Statement Review
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. CoreBit solutions delivered exactly matching our specifications. High speed team performance!"
                      value={fieldComment}
                      onChange={(e) => setFieldComment(e.target.value)}
                      className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:border-orange-500 focus:outline-none transition-all focus:ring-1 focus:ring-orange-500/15 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500 border-b border-white/5 pb-1 select-none">
                    5. Advanced Showcase Media (Optional)
                  </span>

                  <ImageUploaderGrid
                    images={fieldScreenshots}
                    onChange={setFieldScreenshots}
                    label="Showcase Screens (JPG / PNG or Web Links)"
                    maxCount={10}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-5 py-2.5 rounded-full border border-white/10 text-slate-350 hover:bg-white/5 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-orange-500/10"
                  >
                    {formType === "add" ? "Deploy Project" : "Commit Specifications"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
