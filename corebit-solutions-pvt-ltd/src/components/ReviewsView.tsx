/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CLIENT_REVIEWS } from "../data";
import { Review } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote, ArrowUpRight, Sparkles, Check, ChevronDown, ChevronUp, Trash2, ShieldAlert, KeyRound, Lock, Unlock, Edit, Plus, Upload } from "lucide-react";

import { fetchReviews, saveReview, deleteReview } from "../firebase/dbService";

const AVATAR_PRESETS = [
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80", label: "Executive (Female)" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", label: "Executive (Male 1)" },
  { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", label: "Partner (Female)" },
  { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", label: "VP Product" },
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", label: "Director (Female)" },
  { url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", label: "Systems Tech (Male)" },
];

export default function ReviewsView() {
  const [reviews, setReviews] = React.useState<Review[]>([]);

  React.useEffect(() => {
    const loadReviews = async () => {
      const data = await fetchReviews();
      setReviews(data);
    };
    loadReviews();
    window.addEventListener("corebit_reviews_updated", loadReviews);
    return () => {
      window.removeEventListener("corebit_reviews_updated", loadReviews);
    };
  }, []);

  const [showForm, setShowForm] = React.useState(false);
  const [authorName, setAuthorName] = React.useState("");
  const [authorRole, setAuthorRole] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [projectTitle, setProjectTitle] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [avatar, setAvatar] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Edit State
  const [editingReviewId, setEditingReviewId] = React.useState<string | number | null>(null);

  // Admin / Developer State
  const [isAdmin, setIsAdmin] = React.useState(() => {
    return localStorage.getItem("corebit_admin_mode") === "true";
  });
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const [passcode, setPasscode] = React.useState("");
  const [passcodeError, setPasscodeError] = React.useState(false);

  React.useEffect(() => {
    const handleAdminSync = () => {
      setIsAdmin(localStorage.getItem("corebit_admin_mode") === "true");
    };
    window.addEventListener("corebit_admin_mode_changed", handleAdminSync);
    return () => {
      window.removeEventListener("corebit_admin_mode_changed", handleAdminSync);
    };
  }, []);

  const handleOpenEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setAuthorName(review.authorName);
    setAuthorRole(review.authorRole);
    setCompanyName(review.companyName);
    setProjectTitle(review.projectTitle || "");
    setComment(review.comment);
    setRating(review.rating);
    setAvatar(review.avatar || "");
    setShowForm(true);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorRole.trim() || !companyName.trim() || !projectTitle.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    
    try {
      if (editingReviewId) {
        const stringId = String(editingReviewId);
        const reviewData: Partial<Review> = {
          id: stringId,
          authorName: authorName.trim(),
          authorRole: authorRole.trim(),
          companyName: companyName.trim(),
          projectTitle: projectTitle.trim(),
          comment: comment.trim(),
          rating,
          avatar: avatar.trim()
        };

        await saveReview(reviewData);
        setEditingReviewId(null);
      } else {
        const reviewData: Partial<Review> = {
          authorName: authorName.trim(),
          authorRole: authorRole.trim(),
          companyName: companyName.trim(),
          projectTitle: projectTitle.trim(),
          comment: comment.trim(),
          rating,
          avatar: avatar.trim()
        };

        await saveReview(reviewData);
      }

      setIsSubmitting(false);
      setIsSuccess(true);

      // Reset fields
      setAuthorName("");
      setAuthorRole("");
      setCompanyName("");
      setProjectTitle("");
      setComment("");
      setRating(5);
      setAvatar("");

      setTimeout(() => {
        setIsSuccess(false);
        setShowForm(false);
      }, 1500);
    } catch (err) {
      console.error("Error submitting review to DB:", err);
      setIsSubmitting(false);
    }
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === "admin" || passcode.toLowerCase() === "developer") {
      setIsAdmin(true);
      localStorage.setItem("corebit_admin_mode", "true");
      localStorage.setItem("cbit_admin_access", "true");
      window.dispatchEvent(new Event("corebit_admin_mode_changed"));
      setPasscode("");
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 2000);
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem("corebit_admin_mode");
    localStorage.removeItem("cbit_admin_access");
    window.dispatchEvent(new Event("corebit_admin_mode_changed"));
  };

  const handleDeleteReview = async (id: string | number) => {
    const stringId = String(id);
    await deleteReview(stringId);
  };

  return (
    <div className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest mb-4 font-sans"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          Verified Operators Trust
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-sans text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase animate-fadeIn"
        >
          Corporate <span className="text-orange-400 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent opacity-90">Client Reviews</span>
        </motion.h1>
         <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base text-slate-300 font-sans mt-3 max-w-2xl mx-auto"
        >
          Check out direct audits and feedback from managing directors, tech founders, and CTOs who modernized their product engines with CoreBit Solutions.
        </motion.p>
      </div>





      {/* Write a Review Button Banner */}
      <div className="flex justify-center mb-16 animate-fadeIn">
        <motion.button
          onClick={() => {
            if (showForm && editingReviewId) {
              setEditingReviewId(null);
              setAuthorName("");
              setAuthorRole("");
              setCompanyName("");
              setProjectTitle("");
              setComment("");
              setRating(5);
            }
            setShowForm(!showForm);
            setIsSuccess(false);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-6 py-4.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-sans text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25 transition-all cursor-pointer border border-orange-400/20"
        >
          <Quote className="w-3.5 h-3.5 fill-white/10 mr-1 shrink-0" />
          <span>
            {editingReviewId 
              ? (showForm ? "Cancel Active Edit Mode" : "Resume Review Edit") 
              : (showForm ? "Hide Submission Portal" : "Submit Corporate Review")}
          </span>
          {showForm ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </motion.button>
      </div>

      {/* Review Submission Form Container */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-2xl mx-auto mb-16 overflow-hidden"
        >
          <div className="p-8 rounded-3xl bg-[#090e1a]/80 border border-white/10 backdrop-blur-xl shadow-2xl relative">
            <h3 className="font-sans text-xl font-bold text-white mb-1 uppercase tracking-wider text-center">
              {editingReviewId ? "✏️ Edit Client Feedback Record" : "Client Feedback Intake"}
            </h3>
            <p className="text-xs text-slate-400 font-sans text-center mb-6">
              {editingReviewId 
                ? "Modify custom parameter evaluation fields. Direct changes propagate live on execution."
                : "Share your business acceleration story. Certified audits go live instantly on the regional board feed."}
            </p>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-1.5 font-sans">
                  Published Successfully
                </h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-sans">
                  Thank you for your response! Your professional review has been integrated into our live feed.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Score Selector */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold text-center">
                    Evaluation Score
                  </label>
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform duration-100 hover:scale-120 cursor-pointer p-1"
                        title={`${star} Stars`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? "fill-orange-400 text-orange-400"
                              : "text-white/10 hover:text-white/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Role Field Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono text-[#94a3b8] uppercase tracking-widest mb-1.5 font-bold">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Sairaj Vikas"
                      className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-[#94a3b8] uppercase tracking-widest mb-1.5 font-bold">
                      Corporate Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="e.g. Managing Director"
                      className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Company Name Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono text-[#94a3b8] uppercase tracking-widest mb-1.5 font-bold">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. ApexTrade Solutions"
                      className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-[#94a3b8] uppercase tracking-widest mb-1.5 font-bold">
                      Project Title / Scope of Work *
                    </label>
                    <input
                      type="text"
                      required
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Financial Trading Engine"
                      className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Profile Avatar Photo upload/link */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[9px] font-mono text-[#94a3b8] uppercase tracking-widest font-bold">
                      Profile Avatar Photo (Optional)
                    </label>
                    <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-orange-400 cursor-pointer hover:text-orange-300 hover:bg-orange-500/10 transition-all bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
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
                              const maxDimension = 150; // profile photos are small
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
                                setAvatar(dataUrl);
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
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Paste image link or click Upload Photo to select directly"
                    className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors font-sans"
                  />
                  {avatar.trim() && (
                    <div className="mt-2 flex items-center gap-2 bg-slate-900/60 border border-white/5 p-2 rounded-lg">
                      <img 
                        src={avatar} 
                        className="w-8 h-8 rounded-full object-cover border border-white/10" 
                        alt="Avatar Preview" 
                        onError={(e) => { e.currentTarget.style.display = "none" }} 
                      />
                      <span className="text-[10px] text-slate-400 font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-xs">{avatar}</span>
                      <button type="button" onClick={() => setAvatar("")} className="text-red-400 hover:text-red-300 ml-auto text-[10px] font-bold uppercase">Clear</button>
                    </div>
                  )}
                </div>

                {/* Comment Text Box */}
                <div>
                  <label className="block text-[9px] font-mono text-[#94a3b8] uppercase tracking-widest mb-1.5 font-bold">
                    Meticulous Experience Feedback *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe how CoreBit Solutions optimized your workflows, built beautiful interfaces, or modernized your company servers..."
                    className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 resize-none transition-colors font-sans leading-relaxed"
                  />
                </div>

                {/* Submit button bar */}
                <div className="flex gap-3.5 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer transition-all border border-orange-400/20"
                  >
                    {isSubmitting 
                      ? "Publishing Updates..." 
                      : (editingReviewId ? "Save Review Updates" : "Confirm & Launch Feed")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      if (editingReviewId) {
                        setEditingReviewId(null);
                        setAuthorName("");
                        setAuthorRole("");
                        setCompanyName("");
                        setProjectTitle("");
                        setComment("");
                        setRating(5);
                      }
                    }}
                    className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      )}

      {/* Reviews Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="client-reviews-grid">
        {reviews.filter(r => isAdmin || r.status !== "draft").map((review, index) => (
          <motion.div
            key={review.id}
            id={`review-card-${review.id}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.1 }}
            className={`group relative p-8 rounded-3xl bg-white/5 hover:bg-white/15 border ${review.status === "draft" ? "border-amber-500/35 ring-1 ring-amber-500/10" : "border-white/10"} hover:border-white/20 backdrop-blur-md flex flex-col justify-between transition-all duration-300 shadow-xl`}
          >
            {/* Quote Ornament */}
            <Quote className="absolute right-6 top-6 w-10 h-10 text-white/5 rotate-180 pointer-events-none group-hover:text-orange-500/10 transition-colors" />

            {review.status === "draft" && (
              <div className="absolute top-4 left-6 z-10">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[8px] font-mono font-extrabold uppercase tracking-widest text-amber-400">
                  ⚠️ CSM Draft Status
                </span>
              </div>
            )}

            {isAdmin && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditReview(review);
                  }}
                  className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition-all duration-200 cursor-pointer flex items-center gap-1 shadow-lg active:scale-95"
                  title="Edit this review record"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReview(review.id);
                  }}
                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-650 text-red-200 hover:text-white border border-red-500/40 hover:border-transparent transition-all duration-200 cursor-pointer z-10 flex items-center gap-1 shadow-lg active:scale-95"
                  title="Delete this review permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Delete</span>
                </button>
              </div>
            )}

            <div>
              {/* Star rating component */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "fill-orange-400 text-orange-400" : "text-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Project Title Tag */}
              {review.projectTitle && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-400/10 border border-orange-450/20 text-orange-300 text-[10px] font-bold uppercase tracking-wider font-mono mb-4 select-none">
                  <Sparkles className="w-3 h-3 text-orange-400" />
                  <span>Project: {review.projectTitle}</span>
                </div>
              )}

              {/* Comment text */}
              <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>

            {/* Author Profile Bio */}
            <div className="flex items-center gap-4.5 pt-6 mt-6 border-t border-white/10">
              {!review.avatar ? (
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold uppercase select-none flex-shrink-0">
                  {review.authorName?.charAt(0) || "C"}
                </div>
              ) : (
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img
                    src={review.avatar}
                    alt={review.authorName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const marker = parent.querySelector(".avatar-err-marker");
                        if (marker) marker.classList.remove("hidden");
                      }
                    }}
                  />
                  <div className="avatar-err-marker hidden absolute inset-0 w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold uppercase select-none">
                    {review.authorName?.charAt(0) || "C"}
                  </div>
                </div>
              )}
              <div className="flex-grow">
                <span className="block text-sm font-bold text-white group-hover:text-orange-300 transition-colors font-sans">
                  {review.authorName}
                </span>
                <span className="block text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider font-sans">
                  {review.authorRole} at{" "}
                  <span className="text-orange-300">{review.companyName}</span>
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center border border-white/10 text-slate-400 group-hover:text-orange-300 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
