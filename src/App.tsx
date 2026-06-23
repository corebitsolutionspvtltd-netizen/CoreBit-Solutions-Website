/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActivePage } from "./types";
import { AnimatePresence, motion } from "motion/react";

// Component imports
import Header from "./components/Header";
import HomeView from "./components/HomeView";
import ProjectsView from "./components/ProjectsView";
import ReviewsView from "./components/ReviewsView";
import ContactView from "./components/ContactView";
import EnquiriesView from "./components/EnquiriesView";
import PricingView from "./components/PricingView";
import DetailsView from "./components/DetailsView";
import AdminView from "./components/AdminView";
import Footer from "./components/Footer";

import { safeStorage } from "./utils/safeStorage";

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>(ActivePage.HOME);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);

  // Global Admin Mode State reactive across components
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return safeStorage.getItem("corebit_admin_mode") === "true";
  });

  const handlePageChange = (page: ActivePage) => {
    setActivePage(page);
    if (page !== ActivePage.ENQUIRIES) {
      setSelectedPlan(undefined);
    }
  };

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setActivePage(ActivePage.ENQUIRIES);
  };

  // Sync admin state
  useEffect(() => {
    const handleAdminSync = () => {
      setIsAdmin(safeStorage.getItem("corebit_admin_mode") === "true");
    };
    window.addEventListener("corebit_admin_mode_changed", handleAdminSync);
    return () => {
      window.removeEventListener("corebit_admin_mode_changed", handleAdminSync);
    };
  }, []);

  const renderActiveView = () => {
    switch (activePage) {
      case ActivePage.HOME:
        return <HomeView onPageChange={handlePageChange} />;
      case ActivePage.PROJECTS:
        return <ProjectsView />;
      case ActivePage.REVIEWS:
        return <ReviewsView />;
      case ActivePage.CONTACT:
        return <ContactView />;
      case ActivePage.ENQUIRIES:
        return <EnquiriesView preSelectedPlan={selectedPlan} />;
      case ActivePage.PRICING:
        return (
          <PricingView
            onSelectPlan={handleSelectPlan}
            onNavigate={(page) => {
              if (page === "enquiry" || page === "enquiries") {
                handlePageChange(ActivePage.ENQUIRIES);
              } else if (page === "contact") {
                handlePageChange(ActivePage.CONTACT);
              }
            }}
          />
        );
      case ActivePage.DETAILS:
        return <DetailsView />;
      case ActivePage.ADMIN:
        return <AdminView />;
      default:
        return <HomeView onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#3b125e] to-[#7c2d12] text-slate-100 font-sans flex flex-col overflow-x-hidden antialiased">
      
      {/* Sunset theme atmospheric ambient decoration blobs */}
      <div className="absolute top-0 right-[15%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-tr from-orange-500/10 via-purple-500/15 to-amber-500/5 blur-[90px] sm:blur-[140px] animate-sunset-pulse-1 pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[10%] w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] rounded-full bg-gradient-to-br from-indigo-600/5 via-orange-500/15 to-yellow-500/5 blur-[120px] sm:blur-[160px] animate-sunset-pulse-2 pointer-events-none z-0" />



      {/* Main navigation header */}
      <Header activePage={activePage} onPageChange={handlePageChange} />

      {/* Primary content router wrapped in framer motion transitions */}
      <main className="flex-grow z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer navigation */}
      <Footer onPageChange={handlePageChange} />



    </div>
  );
}
