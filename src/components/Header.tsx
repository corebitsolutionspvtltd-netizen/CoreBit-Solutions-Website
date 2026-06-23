/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ActivePage } from "../types";
import { Menu, X, Code2, Sun, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import Logo from "./Logo";
import { safeStorage } from "../utils/safeStorage";

const localStorage = safeStorage;

interface HeaderProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
}

export default function Header({ activePage, onPageChange }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(() => {
    return localStorage.getItem("corebit_admin_mode") === "true";
  });

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  React.useEffect(() => {
    const handleAdminSync = () => {
      setIsAdmin(localStorage.getItem("corebit_admin_mode") === "true");
    };
    window.addEventListener("corebit_admin_mode_changed", handleAdminSync);

    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      // Run once on load
      handleScroll();
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      window.removeEventListener("corebit_admin_mode_changed", handleAdminSync);
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(handleScroll, 150);
    return () => clearTimeout(timer);
  }, [isAdmin, activePage]);

  const baseMenuItems = [
    { label: "Home Page", page: ActivePage.HOME },
    { label: "Contact Us", page: ActivePage.CONTACT },
    { label: "Successfully Delivered Projects", page: ActivePage.PROJECTS },
    { label: "Client Reviews", page: ActivePage.REVIEWS },
    { label: "For Business Enquiries", page: ActivePage.ENQUIRIES },
    { label: "Pricing Plans", page: ActivePage.PRICING },
    { label: "Company Details", page: ActivePage.DETAILS },
  ];

  const menuItems = isAdmin 
    ? [...baseMenuItems, { label: "🔑 Admin Panel", page: ActivePage.ADMIN }]
    : baseMenuItems;

  const handleNavClick = (page: ActivePage) => {
    onPageChange(page);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 mx-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand matching Geometric Balance theme */}
          <button
            onClick={() => handleNavClick(ActivePage.HOME)}
            className="flex items-center group text-left focus:outline-none cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            id="brand-logo-btn"
          >
            <Logo size="custom" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1.5 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg" id="desktop-navigation">
            {menuItems.map((item) => {
              const isActive = activePage === item.page;
              return (
                <button
                  key={item.page}
                  id={`nav-item-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase font-sans transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-orange-300 bg-white/10 border-b border-orange-300/60 shadow-[0_2px_10px_-2px_rgba(249,115,22,0.2)]"
                      : "text-slate-300 hover:text-orange-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Business Inquiry CTA Button (Points to Enquiries) */}
          <div className="hidden lg:block">
            <button
              onClick={() => handleNavClick(ActivePage.ENQUIRIES)}
              id="cta-enquire-btn"
              className="relative group overflow-hidden px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 bg-white shadow-xl hover:scale-[1.02] hover:bg-orange-400 hover:text-white transition-all cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1.5 font-bold">
                Enquire
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle Menu"
              id="mobile-menu-btn"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Navigation Options always visible at the top */}
      <div className="lg:hidden relative border-t border-white/5 bg-slate-950/45" id="mobile-horizontal-nav-wrapper">
        {/* Left Arrow Fade Indicator */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none flex items-center justify-start pl-2 z-10 animate-fade-in">
            <ChevronLeft className="w-3.5 h-3.5 text-orange-400/80" />
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className="px-4 pb-3 pt-2 overflow-x-auto scrollbar-none" 
          id="mobile-horizontal-nav"
        >
          <div className="flex items-center space-x-2.5 min-w-max pb-0.5 animate-fade-in pr-8">
            {menuItems.map((item) => {
              const isActive = activePage === item.page;
              return (
                <button
                  key={item.page}
                  id={`mobile-scroll-nav-item-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase font-sans transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "text-orange-350 bg-white/10 border-b border-orange-400/60 shadow-[0_2px_10px_-2px_rgba(249,115,22,0.35)]"
                      : "text-slate-300 hover:text-orange-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Arrow Fade Indicator with subtle horizontal bounce */}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent pointer-events-none flex items-center justify-end pr-2.5 z-10 animate-fade-in">
            <ChevronRight className="w-3.5 h-3.5 text-orange-400 animate-horizontal-bounce" />
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-[#0f172a]/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-300 ease-in-out">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = activePage === item.page;
              return (
                <button
                  key={item.page}
                  id={`mobile-nav-item-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-between ${
                    isActive
                      ? "bg-white/10 text-orange-300 border-l-4 border-orange-400"
                      : "text-slate-300 hover:text-orange-300 hover:bg-white/5"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <Sun className="w-4 h-4 text-orange-400 animate-spin-slow" />}
                </button>
              );
            })}
            <div className="pt-4 border-t border-white/10 mt-2">
              <button
                onClick={() => handleNavClick(ActivePage.ENQUIRIES)}
                className="w-full text-center py-3.5 px-4 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-400 active:scale-95 transition-all shadow-md cursor-pointer"
                id="mobile-cta-btn"
              >
                Start Your Business Enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
