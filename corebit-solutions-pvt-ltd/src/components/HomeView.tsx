/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActivePage, RoleItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, Rocket, Star, Sparkles, Tag, Building, ArrowRight,
  Code, Code2, TrendingUp, Layout, Server, Database, Users, CheckSquare,
  Edit, X, Save, Plus, Trash2, Check, Smartphone, Globe
} from "lucide-react";
import { 
  fetchHomeSettings, 
  saveHomeSettings, 
  fetchRolesData, 
  saveRolesData, 
  fetchNavCards, 
  saveNavCards,
  deleteSingleRole
} from "../firebase/dbService";

const ICON_MAP: Record<string, any> = {
  "Code2": Code2,
  "TrendingUp": TrendingUp,
  "Layout": Layout,
  "Server": Server,
  "Database": Database,
  "Users": Users,
  "CheckSquare": CheckSquare,
  "Sparkles": Sparkles,
  "Code": Code,
  "Rocket": Rocket,
  "Star": Star,
  "Tag": Tag,
  "Mail": Mail,
  "Building": Building,
  "Check": Check,
  "Smartphone": Smartphone,
  "Globe": Globe
};

interface HomeViewProps {
  onPageChange: (page: ActivePage) => void;
}

export default function HomeView({ onPageChange }: HomeViewProps) {
  // Available interactive roles state
  const [activeRoleId, setActiveRoleId] = useState("senior-dev");

  // State to check if admin/developer mode is on
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("corebit_admin_mode") === "true";
  });

  // Keep admin state synced
  useEffect(() => {
    const checkAdminSync = () => {
      setIsAdmin(localStorage.getItem("corebit_admin_mode") === "true");
    };
    window.addEventListener("corebit_admin_mode_changed", checkAdminSync);
    return () => window.removeEventListener("corebit_admin_mode_changed", checkAdminSync);
  }, []);

  // Persistent Custom Content Settings
  const [homeTexts, setHomeTexts] = useState(() => {
    const saved = localStorage.getItem("corebit_home_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing corebit_home_settings", e);
      }
    }
    return {
      heroBadge: "Elite Software & Windows App Development",
      heroTitle: "Architecting the Digital Future.",
      heroSubtitle: "CoreBit Solutions Pvt Ltd provides enterprise-grade web development, premium native Windows applications, fluid mobile platforms, and secure system architectures.",
      aboutTitle: "Welcome to CoreBit Solutions Pvt Ltd",
      aboutPara1: "CoreBit Solutions Pvt Ltd is a technology-driven company dedicated to delivering innovative, reliable, and scalable digital solutions for businesses of all sizes. We specialize in developing customized software, feature-rich Windows desktop applications, native iOS & Android applications, high-performance web systems, and custom SaaS platforms that help organizations streamline operations.",
      aboutPara2: "Our team combines technical expertise, desktop/mobile/web craftsmanship, and industry knowledge to provide high-quality solutions tailored to each client's unique requirements. We are committed to maintaining strong client relationships through transparency, professionalism, and exceptional service delivery.",
      aboutPara3: "At CoreBit Solutions Pvt Ltd, our mission is to empower businesses with modern multi-platform technology solutions that drive success in an increasingly connected digital world.",
      quote: "CoreBit Solutions Pvt Ltd is committed to delivering excellence through teamwork, innovation, and customer-focused solutions, ensuring the highest level of service for every project we undertake.",
      checkpointsText: "Innovative Cross-Platform Apps\nNative Windows Desktop Builds\nReliable & Scalable Architectures\nTransparency & Client Growth"
    };
  });

  // Load custom roles/services data
  const [rolesData, setRolesData] = useState<RoleItem[]>(() => {
    const saved = localStorage.getItem("corebit_roles_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing corebit_roles_data", e);
      }
    }
    return [
      {
        id: "senior-dev",
        name: "Senior Developer",
        subtitle: "Technical development lead and architectural quality guardian",
        iconName: "Code2",
        responsibilities: [
          "Design and develop high-quality software solutions.",
          "Guide and mentor junior developers.",
          "Review code and maintain coding standards.",
          "Identify and resolve technical challenges.",
          "Collaborate with project stakeholders to define requirements.",
          "Ensure project delivery within timelines and quality standards.",
          "Implement best practices for security, scalability, and performance."
        ]
      },
      {
        id: "bde",
        name: "Business Development Executive",
        subtitle: "Growth catalyst and corporate relationship coordinator",
        iconName: "TrendingUp",
        responsibilities: [
          "Identify potential clients and business opportunities.",
          "Conduct market research and competitor analysis.",
          "Present company services to prospective clients.",
          "Prepare business proposals and quotations.",
          "Maintain relationships with existing clients.",
          "Coordinate with internal teams to understand client requirements.",
          "Achieve sales and business growth targets."
        ]
      },
      {
        id: "frontend-dev",
        name: "Frontend Developer (UI/UX)",
        subtitle: "Interface visual artist and device-responsive master",
        iconName: "Layout",
        responsibilities: [
          "Design and develop website and application user interfaces.",
          "Ensure responsive design across all devices.",
          "Improve user experience and accessibility.",
          "Collaborate with designers and backend developers.",
          "Optimize application performance and loading speed.",
          "Maintain consistency in branding and design standards.",
          "Conduct UI testing and implement improvements."
        ]
      },
      {
        id: "backend-dev",
        name: "Backend Developer",
        subtitle: "Server logistics architect and microservices API manager",
        iconName: "Server",
        responsibilities: [
          "Develop and maintain backend systems and APIs.",
          "Implement business logic and application workflows.",
          "Integrate databases and third-party services.",
          "Ensure application security and data protection.",
          "Optimize server performance and scalability.",
          "Troubleshoot and resolve backend issues.",
          "Collaborate with frontend developers for seamless integration."
        ]
      },
      {
        id: "db-manager",
        name: "Database Manager",
        subtitle: "Structure designer, query optimizer and security sentinel",
        iconName: "Database",
        responsibilities: [
          "Design and maintain database structures.",
          "Monitor database performance and availability.",
          "Implement backup and recovery procedures.",
          "Ensure data security and compliance standards.",
          "Optimize database queries and performance.",
          "Manage data storage and access permissions.",
          "Support development teams with database-related requirements."
        ]
      },
      {
        id: "client-coordinator",
        name: "Client Coordinator",
        subtitle: "Strategic corporate liaison and client satisfaction catalyst",
        iconName: "Users",
        responsibilities: [
          "Manage client communications and follow-ups.",
          "Understand client requirements and expectations.",
          "Coordinate project updates and progress reports.",
          "Schedule meetings and discussions with clients.",
          "Resolve client concerns and provide timely support.",
          "Ensure smooth communication between clients and internal teams.",
          "Maintain long-term client relationships and satisfaction."
        ]
      },
      {
        id: "client-testing",
        name: "Client Testing and Approval",
        subtitle: "UAT pipeline lead and functional quality gatekeeper",
        iconName: "CheckSquare",
        responsibilities: [
          "Review completed project modules against UAT standard scripts.",
          "Coordinate User Acceptance Testing (UAT) activities.",
          "Verify that all requested features are implemented correctly.",
          "Document and report bugs, issues, or improvement requests.",
          "Work closely with developers to ensure timely issue resolution.",
          "Confirm that the product meets quality, performance, and usability standards."
        ]
      }
    ];
  });

  // Load custom navigation cards (with customizable titles, buttons & statistics)
  const [navCards, setNavCards] = useState(() => {
    const saved = localStorage.getItem("corebit_nav_cards");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing corebit_nav_cards", e);
      }
    }
    return [
      {
        id: "card-projects",
        page: ActivePage.PROJECTS,
        title: "Successfully Delivered Projects",
        subtitle: "Portfolio & Engineering Crafts",
        description: "Explore our archive of high-performance mobile apps, enterprise dashboards, and secure SaaS solutions delivered globally.",
        iconName: "Rocket",
        gradient: "from-orange-500 to-amber-500",
        bgClass: "bg-white/10 hover:bg-white/15 border-white/20 shadow-orange-500/5",
        accent: "text-orange-300",
        badge: "50+ Built"
      },
      {
        id: "card-enquiries",
        page: ActivePage.ENQUIRIES,
        title: "For Business Enquiries",
        subtitle: "Bespoke Project Planner",
        description: "Ready to accelerate? Step through our custom project scope planner to receive a detailed cost estimate and technical timeline.",
        iconName: "Sparkles",
        gradient: "from-amber-500 to-orange-600",
        bgClass: "bg-orange-600/10 hover:bg-orange-600/15 border-white/15 shadow-orange-600/5",
        accent: "text-amber-455",
        badge: "Get Estimate"
      },
      {
        id: "card-pricing",
        page: ActivePage.PRICING,
        title: "Pricing Plans",
        subtitle: "Transparent Design & Dev tiers",
        description: "Flexible, predictable product options mapped to your stage—from quick MVP accelerators to dedicated senior engineering retainer squads.",
        iconName: "Tag",
        gradient: "from-[#581c87] to-orange-500",
        bgClass: "bg-white/5 hover:bg-white/10 border-white/10 shadow-indigo-500/5",
        accent: "text-orange-300",
        badge: "Value Tiers"
      },
      {
        id: "card-reviews",
        page: ActivePage.REVIEWS,
        title: "Client Reviews",
        subtitle: "Real Testimonials from Operators",
        description: "Read straight feedback from CTOs, product managers, and managing directors who modernized their infrastructure with our support.",
        iconName: "Star",
        gradient: "from-[#581c87] to-indigo-900",
        bgClass: "bg-indigo-950/20 hover:bg-indigo-950/30 border-white/10 shadow-purple-500/5",
        accent: "text-orange-300",
        badge: "5.0★ Rating"
      },
      {
        id: "card-details",
        page: ActivePage.DETAILS,
        title: "Company Details",
        subtitle: "Our Milestones & DNA",
        description: "We are an elite software development squad. Review our offices in SF, Singapore & Mumbai, company history, and core values.",
        iconName: "Building",
        gradient: "from-orange-500 to-[#581c87]",
        bgClass: "bg-white/10 hover:bg-white/15 border-white/20 shadow-amber-500/5",
        accent: "text-orange-300",
        badge: "Since 2023"
      },
      {
        id: "card-contact",
        page: ActivePage.CONTACT,
        title: "Contact Us",
        subtitle: "Primary Ingress & Direct Communication",
        description: "Reach our operations team directly for prompt responses. Fill out our simple contact form or reach any of our localized branch nodes.",
        iconName: "Mail",
        gradient: "from-[#581c87] to-orange-600",
        bgClass: "bg-white/5 hover:bg-white/10 border-white/10 shadow-slate-500/5",
        accent: "text-[#f59e0b]",
        badge: "24h Response"
      }
    ];
  });

  // Load latest data from Firestore on mount
  useEffect(() => {
    const loadCloudData = async () => {
      try {
        const cloudHome = await fetchHomeSettings();
        if (cloudHome) setHomeTexts(cloudHome);

        const cloudRoles = await fetchRolesData();
        if (cloudRoles && cloudRoles.length > 0) setRolesData(cloudRoles);

        const cloudNav = await fetchNavCards();
        if (cloudNav && cloudNav.length > 0) setNavCards(cloudNav);
      } catch (e) {
        console.error("Failed to fetch cloud home layout parameters:", e);
      }
    };
    loadCloudData();
  }, []);

  // Synchronize dynamic updates with both LocalStorage and Firestore
  useEffect(() => {
    const syncHome = async () => {
      try {
        await saveHomeSettings(homeTexts);
      } catch (err) {
        console.error("Home settings sync error:", err);
      }
    };
    syncHome();
  }, [homeTexts]);

  useEffect(() => {
    const syncRoles = async () => {
      try {
        if (rolesData.length > 0) {
          await saveRolesData(rolesData);
        }
      } catch (err) {
        console.error("Roles sync error:", err);
      }
    };
    syncRoles();
  }, [rolesData]);

  useEffect(() => {
    const syncNav = async () => {
      try {
        if (navCards.length > 0) {
          await saveNavCards(navCards);
        }
      } catch (err) {
        console.error("Navigation cards sync error:", err);
      }
    };
    syncNav();
  }, [navCards]);

  // Tab management inside General Home Customizer
  const [activeConfigTab, setActiveConfigTab] = useState<"general" | "services" | "navigation">("general");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Editing form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempBadge, setTempBadge] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [tempSubtitle, setTempSubtitle] = useState("");
  const [tempAboutTitle, setTempAboutTitle] = useState("");
  const [tempAboutPara1, setTempAboutPara1] = useState("");
  const [tempAboutPara2, setTempAboutPara2] = useState("");
  const [tempAboutPara3, setTempAboutPara3] = useState("");
  const [tempQuote, setTempQuote] = useState("");
  const [tempCheckpointsText, setTempCheckpointsText] = useState("");

  // Role addition/editing form states nested inside Dashboard
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleFormName, setRoleFormName] = useState("");
  const [roleFormSubtitle, setRoleFormSubtitle] = useState("");
  const [roleFormResponsibilities, setRoleFormResponsibilities] = useState("");
  const [roleFormIcon, setRoleFormIcon] = useState("Code2");

  const handleOpenEdit = () => {
    setTempBadge(homeTexts.heroBadge);
    setTempTitle(homeTexts.heroTitle);
    setTempSubtitle(homeTexts.heroSubtitle);
    setTempAboutTitle(homeTexts.aboutTitle);
    setTempAboutPara1(homeTexts.aboutPara1);
    setTempAboutPara2(homeTexts.aboutPara2);
    setTempAboutPara3(homeTexts.aboutPara3);
    setTempQuote(homeTexts.quote);
    setTempCheckpointsText(homeTexts.checkpointsText);
    
    // Clear nested role form
    setEditingRoleId(null);
    setRoleFormName("");
    setRoleFormSubtitle("");
    setRoleFormResponsibilities("");
    setRoleFormIcon("Code2");

    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setHomeTexts({
      heroBadge: tempBadge,
      heroTitle: tempTitle,
      heroSubtitle: tempSubtitle,
      aboutTitle: tempAboutTitle,
      aboutPara1: tempAboutPara1,
      aboutPara2: tempAboutPara2,
      aboutPara3: tempAboutPara3,
      quote: tempQuote,
      checkpointsText: tempCheckpointsText,
    });
    setShowEditModal(false);
  };

  // SERVICES CRUD HANDLERS (Staffing Roles)
  const handleAddNewRole = () => {
    if (!roleFormName.trim()) return;
    const bulletList = roleFormResponsibilities.split("\n").map(r => r.trim()).filter(Boolean);
    const newRole: RoleItem = {
      id: `role-${Date.now()}`,
      name: roleFormName,
      subtitle: roleFormSubtitle,
      iconName: roleFormIcon,
      responsibilities: bulletList
    };
    setRolesData(prev => [...prev, newRole]);
    
    // Clear form
    setRoleFormName("");
    setRoleFormSubtitle("");
    setRoleFormResponsibilities("");
    setRoleFormIcon("Code2");
  };

  const handleStartEditRole = (role: RoleItem) => {
    setEditingRoleId(role.id);
    setRoleFormName(role.name);
    setRoleFormSubtitle(role.subtitle);
    setRoleFormResponsibilities(role.responsibilities.join("\n"));
    setRoleFormIcon(role.iconName || "Code2");
  };

  const handleUpdateRole = () => {
    if (!editingRoleId) return;
    const bulletList = roleFormResponsibilities.split("\n").map(r => r.trim()).filter(Boolean);
    setRolesData(prev => prev.map(r => 
      r.id === editingRoleId
        ? {
            ...r,
            name: roleFormName,
            subtitle: roleFormSubtitle,
            iconName: roleFormIcon,
            responsibilities: bulletList
          }
        : r
    ));
    setEditingRoleId(null);
    setRoleFormName("");
    setRoleFormSubtitle("");
    setRoleFormResponsibilities("");
    setRoleFormIcon("Code2");
  };

  const handleDeleteRole = (id: string) => {
    if (rolesData.length <= 1) {
      alert("At least one staffing service role must remain listed.");
      return;
    }
    setRolesData(prev => prev.filter(r => r.id !== id));
    if (activeRoleId === id) {
      const remaining = rolesData.filter(r => r.id !== id);
      setActiveRoleId(remaining[0]?.id || "");
    }
    deleteSingleRole(id).catch(err => {
      console.warn("Failed to delete role doc from firestore:", err);
    });
  };

  const handleResetToDefaultRoles = async () => {
    if (window.confirm("Are you sure you want to restore all 7 original default corporate staffing roles? This will overwrite the current list.")) {
      // Delete existing roles from firestore
      for (const r of rolesData) {
        try {
          await deleteSingleRole(r.id);
        } catch {
          // Ignore
        }
      }
      const defaults: RoleItem[] = [
        {
          id: "senior-dev",
          name: "Senior Developer",
          subtitle: "Technical development lead and architectural quality guardian",
          iconName: "Code2",
          responsibilities: [
            "Design and develop high-quality software solutions.",
            "Guide and mentor junior developers.",
            "Review code and maintain coding standards.",
            "Identify and resolve technical challenges.",
            "Collaborate with project stakeholders to define requirements.",
            "Ensure project delivery within timelines and quality standards.",
            "Implement best practices for security, scalability, and performance."
          ]
        },
        {
          id: "bde",
          name: "Business Development Executive",
          subtitle: "Growth catalyst and corporate relationship coordinator",
          iconName: "TrendingUp",
          responsibilities: [
            "Identify potential clients and business opportunities.",
            "Conduct market research and competitor analysis.",
            "Present company services to prospective clients.",
            "Prepare business proposals and quotations.",
            "Maintain relationships with existing clients.",
            "Coordinate with internal teams to understand client requirements.",
            "Achieve sales and business growth targets."
          ]
        },
        {
          id: "frontend-dev",
          name: "Frontend Developer (UI/UX)",
          subtitle: "Interface visual artist and device-responsive master",
          iconName: "Layout",
          responsibilities: [
            "Design and develop website and application user interfaces.",
            "Ensure responsive design across all devices.",
            "Improve user experience and accessibility.",
            "Collaborate with designers and backend developers.",
            "Optimize application performance and loading speed.",
            "Maintain consistency in branding and design standards.",
            "Conduct UI testing and implement improvements."
          ]
        },
        {
          id: "backend-dev",
          name: "Backend Developer",
          subtitle: "Server logistics architect and microservices API manager",
          iconName: "Server",
          responsibilities: [
            "Develop and maintain backend systems and APIs.",
            "Implement business logic and application workflows.",
            "Integrate databases and third-party services.",
            "Ensure application security and data protection.",
            "Optimize server performance and scalability.",
            "Troubleshoot and resolve backend issues.",
            "Collaborate with frontend developers for seamless integration."
          ]
        },
        {
          id: "db-manager",
          name: "Database Manager",
          subtitle: "Structure designer, query optimizer and security sentinel",
          iconName: "Database",
          responsibilities: [
            "Design and maintain database structures.",
            "Monitor database performance and availability.",
            "Implement backup and recovery procedures.",
            "Ensure data security and compliance standards.",
            "Optimize database queries and performance.",
            "Manage data storage and access permissions.",
            "Support development teams with database-related requirements."
          ]
        },
        {
          id: "client-coordinator",
          name: "Client Coordinator",
          subtitle: "Strategic corporate liaison and client satisfaction catalyst",
          iconName: "Users",
          responsibilities: [
            "Manage client communications and follow-ups.",
            "Understand client requirements and expectations.",
            "Coordinate project updates and progress reports.",
            "Schedule meetings and discussions with clients.",
            "Resolve client concerns and provide timely support.",
            "Ensure smooth communication between clients and internal teams.",
            "Maintain long-term client relationships and satisfaction."
          ]
        },
        {
          id: "client-testing",
          name: "Client Testing and Approval",
          subtitle: "UAT pipeline lead and functional quality gatekeeper",
          iconName: "CheckSquare",
          responsibilities: [
            "Review completed project modules against UAT standard scripts.",
            "Coordinate User Acceptance Testing (UAT) activities.",
            "Verify that all requested features are implemented correctly.",
            "Document and report bugs, issues, or improvement requests.",
            "Work closely with developers to ensure timely issue resolution.",
            "Confirm that the product meets quality, performance, and usability standards."
          ]
        }
      ];
      setRolesData(defaults);
      setActiveRoleId("senior-dev");
      localStorage.setItem("corebit_roles_data", JSON.stringify(defaults));
    }
  };

  const handleRestoreAllDefaultRolesQuick = async () => {
    const defaults: RoleItem[] = [
      {
        id: "senior-dev",
        name: "Senior Developer",
        subtitle: "Technical development lead and architectural quality guardian",
        iconName: "Code2",
        responsibilities: [
          "Design and develop high-quality software solutions.",
          "Guide and mentor junior developers.",
          "Review code and maintain coding standards.",
          "Identify and resolve technical challenges.",
          "Collaborate with project stakeholders to define requirements.",
          "Ensure project delivery within timelines and quality standards.",
          "Implement best practices for security, scalability, and performance."
        ]
      },
      {
        id: "bde",
        name: "Business Development Executive",
        subtitle: "Growth catalyst and corporate relationship coordinator",
        iconName: "TrendingUp",
        responsibilities: [
          "Identify potential clients and business opportunities.",
          "Conduct market research and competitor analysis.",
          "Present company services to prospective clients.",
          "Prepare business proposals and quotations.",
          "Maintain relationships with existing clients.",
          "Coordinate with internal teams to understand client requirements.",
          "Achieve sales and business growth targets."
        ]
      },
      {
        id: "frontend-dev",
        name: "Frontend Developer (UI/UX)",
        subtitle: "Interface visual artist and device-responsive master",
        iconName: "Layout",
        responsibilities: [
          "Design and develop website and application user interfaces.",
          "Ensure responsive design across all devices.",
          "Improve user experience and accessibility.",
          "Collaborate with designers and backend developers.",
          "Optimize application performance and loading speed.",
          "Maintain consistency in branding and design standards.",
          "Conduct UI testing and implement improvements."
        ]
      },
      {
        id: "backend-dev",
        name: "Backend Developer",
        subtitle: "Server logistics architect and microservices API manager",
        iconName: "Server",
        responsibilities: [
          "Develop and maintain backend systems and APIs.",
          "Implement business logic and application workflows.",
          "Integrate databases and third-party services.",
          "Ensure application security and data protection.",
          "Optimize server performance and scalability.",
          "Troubleshoot and resolve backend issues.",
          "Collaborate with frontend developers for seamless integration."
        ]
      },
      {
        id: "db-manager",
        name: "Database Manager",
        subtitle: "Structure designer, query optimizer and security sentinel",
        iconName: "Database",
        responsibilities: [
          "Design and maintain database structures.",
          "Monitor database performance and availability.",
          "Implement backup and recovery procedures.",
          "Ensure data security and compliance standards.",
          "Optimize database queries and performance.",
          "Manage data storage and access permissions.",
          "Support development teams with database-related requirements."
        ]
      },
      {
        id: "client-coordinator",
        name: "Client Coordinator",
        subtitle: "Strategic corporate liaison and client satisfaction catalyst",
        iconName: "Users",
        responsibilities: [
          "Manage client communications and follow-ups.",
          "Understand client requirements and expectations.",
          "Coordinate project updates and progress reports.",
          "Schedule meetings and discussions with clients.",
          "Resolve client concerns and provide timely support.",
          "Ensure smooth communication between clients and internal teams.",
          "Maintain long-term client relationships and satisfaction."
        ]
      },
      {
        id: "client-testing",
        name: "Client Testing and Approval",
        subtitle: "UAT pipeline lead and functional quality gatekeeper",
        iconName: "CheckSquare",
        responsibilities: [
          "Review completed project modules against UAT standard scripts.",
          "Coordinate User Acceptance Testing (UAT) activities.",
          "Verify that all requested features are implemented correctly.",
          "Document and report bugs, issues, or improvement requests.",
          "Work closely with developers to ensure timely issue resolution.",
          "Confirm that the product meets quality, performance, and usability standards."
        ]
      }
    ];

    setRolesData(defaults);
    setActiveRoleId("senior-dev");
    localStorage.setItem("corebit_roles_data", JSON.stringify(defaults));

    try {
      await saveRolesData(defaults);
    } catch (err) {
      console.warn("Could not save defaults directly to Firestore:", err);
    }
  };

  // NAV HUB CARDS EDIT CUSTOMIZER
  const handleUpdateCardValue = (cardId: string, field: string, val: string) => {
    setNavCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, [field]: val } : c
    ));
  };

  const checkpointsList = homeTexts.checkpointsText
    .split("\n")
    .map((c: string) => c.trim())
    .filter((c: string) => c.length > 0);

  const activeRole = rolesData.find((r) => r.id === activeRoleId) || rolesData[0];

  return (
    <div className="py-8 md:py-16">
      
      {/* Inline Floating Admin Controller for Home Page */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Edit className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Homepage Content & Layout Modifier (Admin)
                </h4>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Authorized mode enabled. Manage website details, services list, custom buttons, and navigation statistics inline.
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenEdit}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Configure Homepage</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Hero Intro Section */}
      <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 mb-16 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse animate-spin-slow" />
          {homeTexts.heroBadge}
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl sm:text-6.5xl md:text-7xl font-extrabold tracking-tight text-white leading-none mb-6 uppercase"
        >
          {homeTexts.heroTitle.includes("Digital") ? (
            <>
              {homeTexts.heroTitle.split("Digital")[0]}
              <span className="text-orange-400 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">Digital</span>
              {homeTexts.heroTitle.split("Digital")[1]}
            </>
          ) : (
            homeTexts.heroTitle
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-slate-300 font-sans leading-relaxed text-balance max-w-3xl mx-auto"
        >
          {homeTexts.heroSubtitle}
        </motion.p>

        {/* Feature Icons Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto mt-10 bg-white/5 p-4 border border-white/10 rounded-3xl backdrop-blur-md shadow-md"
        >
          {[
            { icon: Code2, label: "React & TS Code" },
            { icon: Smartphone, label: "Fluid App Sync" },
            { icon: Globe, label: "Cloud Ingress" },
            { icon: Code, label: "Bespoke SaaS" },
            { icon: Database, label: "Scalable DBs" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-[#0f172a]/85 flex items-center justify-center border border-white/10 text-orange-400 mb-2">
                {React.createElement(item.icon, { className: "w-5 h-5" })}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-200 leading-tight">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* About Our Company Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-28" id="about-company-section">
        <div className="relative overflow-hidden p-8 sm:p-12 md:p-14 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tr from-orange-500/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch relative z-10">
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest">
                  <Building className="w-3.5 h-3.5 text-orange-405" />
                  About Our Company
                </div>
                
                <h2 className="font-display text-2xl sm:text-4.5xl font-extrabold text-white tracking-tight uppercase leading-none">
                  {homeTexts.aboutTitle.includes("CoreBit Solutions") ? (
                    <>
                      {homeTexts.aboutTitle.split("CoreBit Solutions")[0]}
                      <span className="text-orange-400 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent font-black">CoreBit Solutions</span>
                      {homeTexts.aboutTitle.split("CoreBit Solutions")[1]}
                    </>
                  ) : (
                    homeTexts.aboutTitle
                  )}
                </h2>
                
                <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed font-sans">
                  {homeTexts.aboutPara1}
                </p>
                
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                  {homeTexts.aboutPara2}
                </p>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                  {homeTexts.aboutPara3}
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-5 bg-[#0f172a]/50 border border-white/10 p-8 rounded-3xl backdrop-blur-xs flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-4">
                <span className="block text-[10px] uppercase font-bold text-orange-400 tracking-widest">
                  Corporate Commitment
                </span>
                <p className="text-slate-200 text-xs sm:text-sm font-sans italic leading-relaxed border-l-2 border-orange-500/40 pl-4 py-1">
                  "{homeTexts.quote}"
                </p>
              </div>
              
              {/* Highlight Checklist */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                {checkpointsList.map((cap, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-orange-500/20 text-orange-300 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-305">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles and Responsibilities / Listed Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-28" id="roles-responsibilities-section">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Users className="w-3.5 h-3.5 text-orange-400" />
            Engineering Teams & Services
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            Roles and <span className="font-light opacity-80">Responsibilities</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto font-sans">
            We mobilize specialized technical cells and corporate leads to implement your blueprints. Discover the precise ownership models powering our project delivery cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Sidebar Role Buttons Selector */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-1">
              Select Staff Member Role / Service Cell
            </span>
            {/* Nav Scroller Container */}
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none snap-x h-fit max-h-[500px]">
              {rolesData.map((role) => {
                const isSelected = activeRoleId === role.id;
                const RoleIcon = ICON_MAP[role.iconName || "Code2"] || Code2;
                return (
                  <button
                    key={role.id}
                    id={`role-tab-${role.id}`}
                    onClick={() => setActiveRoleId(role.id)}
                    className={`w-64 lg:w-full flex-shrink-0 snap-start text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/15"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#0f172a] text-orange-400"
                      }`}>
                        <RoleIcon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className={`block text-xs sm:text-sm font-bold tracking-tight uppercase ${isSelected ? "text-white" : "text-slate-100"}`}>
                          {role.name}
                        </span>
                        <span className={`block text-[10px] truncate max-w-[150px] lg:max-w-xs mt-0.5 ${isSelected ? "text-orange-100 font-medium" : "text-slate-400"}`}>
                          {role.subtitle}
                        </span>
                      </div>
                    </div>
                    <span className={`font-mono text-sm hidden lg:block ${isSelected ? "text-white opacity-80" : "text-slate-500 group-hover:text-slate-300"}`}>
                      →
                    </span>
                  </button>
                );
              })}
            </div>
            {rolesData.length < 7 && (
              <button
                onClick={handleRestoreAllDefaultRolesQuick}
                className="mt-3 w-full p-4.5 rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/15 text-orange-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/5 hover:border-orange-500/50"
              >
                <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>Restore 7 Default Corporate Roles</span>
              </button>
            )}
          </div>

          {/* Details Pane for Active Role */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md">
            <AnimatePresence mode="wait">
              {activeRole && (
                <motion.div
                  key={activeRole.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 h-full flex flex-col justify-between"
                >
                  <div>
                    {/* Role Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 shadow-inner">
                        {React.createElement(ICON_MAP[activeRole.iconName || "Code2"] || Code2, { className: "w-5 h-5" })}
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-orange-400 tracking-widest leading-none mb-1">
                          Enterprise Staffing Scope
                        </span>
                        <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight">
                          {activeRole.name}
                        </h3>
                      </div>
                    </div>

                    {/* Subtitle / Focus Segment */}
                    <p className="text-slate-300 text-xs sm:text-sm italic font-sans leading-relaxed border-l-2 border-orange-500/60 pl-4 py-1 mb-8">
                      {activeRole.subtitle}
                    </p>

                    {/* Bullet lists of explicit Responsibilities */}
                    <div className="space-y-4">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Core Responsibilities
                      </span>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {activeRole.responsibilities.map((resp, rIdx) => (
                          <motion.div 
                            key={rIdx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: rIdx * 0.04 }}
                            className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#0f172a]/30 border border-white/5 shadow-inner"
                          >
                            <div className="p-0.5 rounded-full bg-orange-500/20 text-orange-400 shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
                              {resp}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Operational signoff */}
                  <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 uppercase font-semibold">
                      Registered Entity Structure
                    </span>
                    <span className="text-orange-400 font-bold uppercase tracking-wider">
                      Cell Allocation Node
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Main Feature Cards Grid / Navigation Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-orange-300 text-[10px] font-bold uppercase tracking-widest mb-3 select-none">
            System Map
          </div>
          <h2 className="font-display text-3xl font-extrabold text-white tracking-tight uppercase">
            Navigation <span className="font-light opacity-80">Hub</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            Choose an engineering compartment to review our rates, review testimonials, or blueprint your system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" id="navigation-bento-grid">
          {navCards.map((card, index) => {
            const IconComponent = ICON_MAP[card.iconName || "Rocket"] || Rocket;
            return (
              <motion.div
                key={card.page}
                id={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`group relative flex flex-col justify-between h-full p-8 rounded-3xl backdrop-blur-lg border text-slate-150 transition-all duration-300 shadow-xl ${card.bgClass}`}
              >
                {/* Visual Glow Ornament */}
                <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-500`}></div>

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                      <div className="w-5 h-5 border-2 border-[#581c87] rounded-sm rotate-45 flex items-center justify-center">
                        <IconComponent className="w-3.5 h-3.5 text-[#581c87] -rotate-45" />
                      </div>
                    </div>

                    <span className="text-[10px] font-mono tracking-widest uppercase font-black px-3 py-1 rounded bg-white/5 border border-white/5 text-orange-400 group-hover:scale-105 transition-all">
                      {card.badge}
                    </span>
                  </div>

                  <div className="space-y-2 select-none">
                    <span className={`text-[9px] uppercase font-bold tracking-widest leading-none ${card.accent}`}>
                      {card.subtitle}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold uppercase font-display text-white group-hover:text-amber-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-sans mt-3">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                    OPERATE CELL NODE 0{index + 1}
                  </span>
                  
                  <button
                    onClick={() => {
                      onPageChange(card.page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center justify-center p-2.5 rounded-full bg-[#0d1321] group-hover:bg-orange-500 hover:scale-110 border border-white/10 group-hover:border-orange-400 transition-all cursor-pointer group shadow-lg"
                  >
                    <ArrowRight className="w-4 h-4 text-orange-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LANDING PAGE MASTER CUSTOMIZER EDIT MODAL */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#0d1321] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg uppercase tracking-tight">
                      Configure Landing Experience Dashboard
                    </h3>
                    <p className="text-slate-400 text-[10px] font-mono leading-none mt-1 uppercase font-semibold">
                      Institutional Layout Control System
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Internal Tab selectors inside Main modal */}
              <div className="flex gap-2 mb-6 border-b border-white/5 pb-2">
                {[
                  { id: "general", label: "Hero & About Texts" },
                  { id: "services", label: "Operations Services / Roles" },
                  { id: "navigation", label: "Navigation Buttons & Stats" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveConfigTab(tab.id as any)}
                    className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all border cursor-pointer ${
                      activeConfigTab === tab.id
                        ? "bg-orange-500 text-white border-orange-500 font-extrabold"
                        : "bg-white/5 text-slate-400 border-transparent hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* VIEW SWITCH */}
              {activeConfigTab === "general" && (
                <form onSubmit={handleSaveEdit} className="space-y-5 text-left text-xs text-slate-200">
                  <div className="space-y-4">
                    <h4 className="text-[10px] text-orange-400 font-mono uppercase tracking-widest pb-1 border-b border-white/5">
                      1. Hero Section Content
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-mono mb-1">Badge Status Line</label>
                        <input
                          type="text"
                          value={tempBadge}
                          onChange={(e) => setTempBadge(e.target.value)}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-mono mb-1">Display Title</label>
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1 font-semibold">Hero Subtitle</label>
                      <textarea
                        value={tempSubtitle}
                        onChange={(e) => setTempSubtitle(e.target.value)}
                        rows={2}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-slate-202 focus:border-orange-500 focus:outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-3">
                    <h4 className="text-[10px] text-orange-400 font-mono uppercase tracking-widest pb-1 border-b border-white/5">
                      2. About Company Content
                    </h4>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Section Title</label>
                      <input
                        type="text"
                        value={tempAboutTitle}
                        onChange={(e) => setTempAboutTitle(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 font-mono mb-1">Main Description (Paragraph 1)</label>
                        <textarea
                          value={tempAboutPara1}
                          onChange={(e) => setTempAboutPara1(e.target.value)}
                          rows={3}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:border-orange-500 focus:outline-none font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-mono mb-1">Secondary Details (Paragraph 2)</label>
                        <textarea
                          value={tempAboutPara2}
                          onChange={(e) => setTempAboutPara2(e.target.value)}
                          rows={3}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:border-orange-500 focus:outline-none font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-mono mb-1">Mission Summary (Paragraph 3)</label>
                        <textarea
                          value={tempAboutPara3}
                          onChange={(e) => setTempAboutPara3(e.target.value)}
                          rows={2}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-slate-202 focus:border-orange-500 focus:outline-none font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-3">
                    <h4 className="text-[10px] text-orange-400 font-mono uppercase tracking-widest pb-1 border-b border-white/5">
                      3. Company Commitment
                    </h4>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Commitment Quote</label>
                      <textarea
                        value={tempQuote}
                        onChange={(e) => setTempQuote(e.target.value)}
                        rows={2}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-slate-202 focus:border-orange-500 focus:outline-none font-sans italic"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Bullet highlights (One per line)</label>
                      <textarea
                        value={tempCheckpointsText}
                        onChange={(e) => setTempCheckpointsText(e.target.value)}
                        rows={4}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-slate-202 focus:border-orange-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-5">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-orange-600/10"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save General Layout</span>
                    </button>
                  </div>
                </form>
              )}

              {activeConfigTab === "services" && (
                <div className="space-y-6 text-left text-xs text-slate-200">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5 gap-4">
                    <div className="space-y-1">
                      <h4 className="text-[10px] text-orange-400 font-mono uppercase tracking-widest">
                        Update Staffing Services / Roles List
                      </h4>
                      <p className="text-slate-400 text-[10px]">Customize titles, subtitles, responsibilities checklists, or discard/add roles instantly.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetToDefaultRoles}
                      className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap"
                    >
                      Reset to Defaults
                    </button>
                  </div>

                  {/* List of current roles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[240px] overflow-y-auto pr-1">
                    {rolesData.map(role => (
                      <div key={role.id} className="p-4 rounded-xl bg-[#0f172a] border border-white/5 flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <h5 className="font-bold text-white uppercase">{role.name}</h5>
                          <p className="text-slate-400 text-[10px] line-clamp-1">{role.subtitle}</p>
                          <span className="block text-[8px] font-mono text-orange-400">Responsibilities: {role.responsibilities.length} items</span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleStartEditRole(role)}
                            className="p-1 px-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white text-[10px] uppercase font-bold"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              if (deleteConfirmId === role.id) {
                                handleDeleteRole(role.id);
                                setDeleteConfirmId(null);
                              } else {
                                setDeleteConfirmId(role.id);
                                setTimeout(() => {
                                  setDeleteConfirmId(prev => prev === role.id ? null : prev);
                                }, 3000);
                              }
                            }}
                            className={`p-1 px-2 rounded border text-[10px] uppercase font-bold transition-all ${
                              deleteConfirmId === role.id
                                ? "bg-red-650 border-red-500 text-white animate-pulse"
                                : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-550 hover:text-white"
                            }`}
                          >
                            {deleteConfirmId === role.id ? "Sure?" : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add / Edit role nested sub-form */}
                  <div className="p-5 rounded-2xl bg-[#0f172a]/50 border border-white/10 space-y-4">
                    <h5 className="font-bold text-white uppercase tracking-wider text-[10px] text-orange-400">
                      {editingRoleId ? "Edit Selected Role Details" : "Add New Corporate Service Role"}
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-400 font-mono text-[9px] uppercase">Service/Role Title *</label>
                        <input 
                          type="text" 
                          className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-white"
                          placeholder="Lead DevOps Specialist"
                          value={roleFormName}
                          onChange={(e) => setRoleFormName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-400 font-mono text-[9px] uppercase">Tagline / Subtext *</label>
                        <input 
                          type="text" 
                          className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-white"
                          placeholder="Technical orchestration & deployment lead"
                          value={roleFormSubtitle}
                          onChange={(e) => setRoleFormSubtitle(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-400 font-mono text-[9px] uppercase">Aesthetic Vector Icon</label>
                        <select
                          className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-white cursor-pointer"
                          value={roleFormIcon}
                          onChange={(e) => setRoleFormIcon(e.target.value)}
                        >
                          <option value="Code2">Standard Code Tag (Code2)</option>
                          <option value="TrendingUp">Trending Expansion Arrow (TrendingUp)</option>
                          <option value="Layout">Sleek Interface (Layout)</option>
                          <option value="Server">Database Server Rack (Server)</option>
                          <option value="Database">Cylinder Database (Database)</option>
                          <option value="Users">Multi-User group (Users)</option>
                          <option value="CheckSquare">Verification Checkbox (CheckSquare)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-400 font-mono text-[9px] uppercase">Checklist Responsibilities (one per line) *</label>
                        <textarea 
                          rows={3}
                          className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-white resize-none font-sans"
                          placeholder="Maintain continuous integrations&#10;Deploy microservice load weights&#10;Setup system firewalls"
                          value={roleFormResponsibilities}
                          onChange={(e) => setRoleFormResponsibilities(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {editingRoleId ? (
                        <>
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingRoleId(null);
                              setRoleFormName("");
                              setRoleFormSubtitle("");
                              setRoleFormResponsibilities("");
                            }}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-bold uppercase text-[9px] tracking-wider text-slate-300"
                          >
                            Cancel Edit
                          </button>
                          <button 
                            type="button" 
                            onClick={handleUpdateRole}
                            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold uppercase text-[9px] tracking-wider text-white"
                          >
                            Update Role Details
                          </button>
                        </>
                      ) : (
                        <button 
                          type="button" 
                          onClick={handleAddNewRole}
                          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold uppercase text-[9px] tracking-wider text-white flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert Role</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {activeConfigTab === "navigation" && (
                <div className="space-y-6 text-left text-xs text-slate-200">
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-orange-400 font-mono uppercase tracking-widest pb-1 border-b border-white/5">
                      Configure Navigation Buttons, Titles, & Secondary Statistics
                    </h4>
                    <p className="text-slate-450 text-[10px]">Alter specific displays or numbers showing on each system link box to perfectly sync layout trends.</p>
                  </div>

                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                    {navCards.map((card, cIdx) => (
                      <div key={card.id} className="p-5 rounded-2xl bg-[#0f172a] border border-white/5 space-y-3">
                        <span className="font-mono text-[9px] font-black text-orange-400 uppercase tracking-widest">Navigation Cell 0{cIdx + 1} ({card.page.toUpperCase()})</span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-mono text-[9px] uppercase">Box Title *</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                              value={card.title}
                              onChange={(e) => handleUpdateCardValue(card.id, "title", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-mono text-[9px] uppercase">Display statistic / badge *</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-orange-400 font-mono font-bold text-xs"
                              value={card.badge}
                              onChange={(e) => handleUpdateCardValue(card.id, "badge", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-mono text-[9px] uppercase">Sub-label *</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                              value={card.subtitle}
                              onChange={(e) => handleUpdateCardValue(card.id, "subtitle", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-mono text-[9px] uppercase">Box Description *</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-slate-205 text-xs"
                              value={card.description}
                              onChange={(e) => handleUpdateCardValue(card.id, "description", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold uppercase text-[10px] tracking-widest text-white shadow-md cursor-pointer"
                    >
                      Finish Customizing Nodes
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
