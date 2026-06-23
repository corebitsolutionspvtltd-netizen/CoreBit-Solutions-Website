/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Review, PricingPlan, TeamMember, CompanyMilestone } from "./types";

export const DELIVERED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    projectName: "ApexTrade Mobile Platform",
    startedDate: "Jan 15, 2024",
    deliveredDate: "May 15, 2024",
    clientName: "Sarah Jenkins",
    companyName: "ApexTrade Solutions",
    projectOverview: "A high-frequency algorithmic cryptocurrency and stock trading mobile application featuring ultra-low latency charts, real-time trading feeds, and secure biometric lock mechanics.",
    screenshots: [
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590283623516-72aa46df7c58?auto=format&fit=crop&w=800&q=80"
    ],
    clientReview: {
      rating: 5,
      comment: "CoreBit Solutions delivered our trading platform ahead of line-schedules. Their attention to security protocols, fluid responsive charts, and native performance was exemplary. Our traders absolutely love the interface!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      role: "CTO"
    },
    paymentDetails: {
      totalAmount: "₹40,25,500.00",
      pricingTier: "Enterprise Custom Built (Accelerated Pod)",
      paymentStatus: "Paid in Full",
      paymentMethod: "ACH Wire Transfer (Silicon Valley Bank)",
      billingAddress: "120 Hawthorne St, San Francisco, CA 94107"
    }
  },
  {
    id: "proj-2",
    projectName: "EcoSphere IoT Dashboard",
    startedDate: "Mar 01, 2024",
    deliveredDate: "Aug 01, 2024",
    clientName: "Marcus Vance",
    companyName: "EcoSphere Global",
    projectOverview: "Enterprise-grade real-time IoT sensory telemetry and green energy consumption tracking dashboard displaying live diagnostics for modern hyper-scale server rooms and building complexes.",
    screenshots: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
    ],
    clientReview: {
      rating: 5,
      comment: "The IoT control grid developed by CoreBit has completely modernized how we monitor resource consumption. Their charts and stream integrations have been instrumental in saving energy.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Head of Infrastructure"
    },
    paymentDetails: {
      totalAmount: "₹29,21,600.00",
      pricingTier: "Enterprise Custom Built (Smart Energy Package)",
      paymentStatus: "Paid in Full",
      paymentMethod: "Corporate Credit Card (Chase Business)",
      billingAddress: "500 Tech Parkway, Suite 200, Atlanta, GA 30313"
    }
  },
  {
    id: "proj-3",
    projectName: "MediLink Healthcare Portal",
    startedDate: "Jun 10, 2024",
    deliveredDate: "Dec 10, 2024",
    clientName: "Elena Rostova",
    companyName: "MediLink Health Services",
    projectOverview: "HIPAA-compliant patient portals, encrypted electronic health records management systems, real-time doctor appointments booking engine, and secure instant teleconsultations video sockets.",
    screenshots: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
    ],
    clientReview: {
      rating: 5,
      comment: "HIPAA-compliance is a difficult journey, but the senior engineers at CoreBit delivered safe, bulletproof medical software. Highly professional and responsive partners.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      role: "Managing Director"
    },
    paymentDetails: {
      totalAmount: "₹48,14,000.00",
      pricingTier: "Enterprise Custom Built (Encrypted HIPAA Suite)",
      paymentStatus: "Paid in Full",
      paymentMethod: "ACH Wire Transfer (HSBC Private)",
      billingAddress: "88 Medical Plaza, London, UK W1G 6QT"
    }
  },
  {
    id: "proj-4",
    projectName: "Zelo Logistics Platform",
    startedDate: "Sep 01, 2024",
    deliveredDate: "Dec 01, 2024",
    clientName: "David Chen",
    companyName: "Zelo Logistics Group",
    projectOverview: "AI-driven route optimizations, driver coordinate tracking map systems, smart immediate delivery scheduling algorithms, and responsive container dispatch grids.",
    screenshots: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=800&q=80"
    ],
    clientReview: {
      rating: 5,
      comment: "We recommended CoreBit's talent directly to global corporate partners after they fully resolved an optimization bottleneck that was costing us enormous travel idle times. Amazing UI/UX design matching backend speed.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      role: "VP of Product"
    },
    paymentDetails: {
      totalAmount: "₹24,07,000.00",
      pricingTier: "Dedicated Engineering Pod Retainer (3-Month Build)",
      paymentStatus: "Paid in Full",
      paymentMethod: "SEPA Bank Swiss Transfer",
      billingAddress: "12 Sentosa crescent, Block B, Singapore 098972"
    }
  }
];

export const CLIENT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    authorName: "Sarah Jenkins",
    authorRole: "CTO",
    companyName: "ApexTrade Solutions",
    projectTitle: "Bespoke Financial Trading Engine",
    comment: "CoreBit Solutions delivered our trading application ahead of schedule. Their attention to security, fluid native animations, and overall system scalability was outstanding. Our users absolutely love the interface!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "rev-2",
    authorName: "Marcus Vance",
    authorRole: "Head of Infrastructure",
    companyName: "EcoSphere Global",
    projectTitle: "IoT Telemetry Commercial Dashboard",
    comment: "The IoT dashboard developed by CoreBit has completely transformed how we monitor our commercial facilities. Their expertise in real-time charts and data density representation was crucial to our project's success.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "rev-3",
    authorName: "Elena Rostova",
    authorRole: "Managing Director",
    companyName: "MediLink Health Services",
    projectTitle: "HIPAA-Compliant Video Suite",
    comment: "Building a HIPAA-secure video system is inherently challenging, but the engineering team at CoreBit solutions made it look simple. Highly professional, responsive, and reliable software developers.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "rev-4",
    authorName: "David Chen",
    authorRole: "VP of Product",
    companyName: "Zelo Logistics Group",
    projectTitle: "Smart Route Optimizer & Fleet Dispatch",
    comment: "We recommended CoreBit to our parent company after they solved a complex route-planning bottleneck for our driver dispatch software. Incredible UI/UX craft paired with deep backend engineering expertise.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan-mvp",
    name: "Startup MVP Accelerator",
    price: "₹7,88,500",
    period: "full build",
    description: "Launch your product concept quickly. Perfect for validating your early ideas with a fully operational, beautiful MVP.",
    features: [
      "Custom UI/UX Design (Up to 8 screens)",
      "Dedicated Full-Stack Developer & Designer",
      "Core Database and User Authentication",
      "Standard External Platform APIs Integrations",
      "Fully Responsive Web, Mobile or Windows Shell",
      "30 Days Post-Launch Support",
      "Complete Source Code Handover"
    ]
  },
  {
    id: "plan-scale",
    name: "Enterprise Custom Built",
    price: "₹16,18,500",
    period: "full build",
    description: "Comprehensive software architecture tailored for rapidly growing startups and mid-market organizations.",
    isPopular: true,
    features: [
      "End-to-End Bespoke System Architecture",
      "Advanced Real-Time telemetries / WebSockets",
      "AI/ML integrations (such as Gemini)",
      "Native Windows Desktop & Mobile Orchestrations",
      "High Volume Database Sharding Setup",
      "Highly Segmented Enterprise Level Role Controls",
      "90 Days Dedicated Post-Launch Support",
      "DevOps Deployment & CI/CD Pipeline Configuration"
    ]
  },
  {
    id: "plan-retainer",
    name: "Dedicated Engineering Pod",
    price: "₹5,14,600",
    period: "per month",
    description: "On-demand elite React, Windows and Node engineers, working exclusively on your product updates and enhancements.",
    features: [
      "Dedicated Senior React/Node/C# Developer Role",
      "Direct Slack/Discord Team Ingress",
      "Iterative Weekly Sprints & Progress Reviews",
      "Unlimited Code Audits & Refactorings",
      "Server/Desktop Maintenance & Hotfixes",
      "Continuous Dev Sandbox Pipelines",
      "Flexible Cancel/Pause Terms"
    ]
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "SAIRAJ VIKAS A",
    role: "Backend Developer",
    phone: "+91 95971 23923",
    email: "corebitsolutionspvtltd@gmail.com"
  },
  {
    name: "SANITH KRISHNA S",
    role: "Business Development Executive and Client Coordinator",
    phone: "+91 95007 26936",
    email: "corebitsolutionspvtltd@gmail.com"
  },
  {
    name: "NAVANEETHAN R",
    role: "Database Manager",
    phone: "+91 93631 53995",
    email: "corebitsolutionspvtltd@gmail.com"
  }
];

export const COMPANY_MILESTONES: CompanyMilestone[] = [
  {
    year: "2023",
    title: "Founding & Early Stage",
    description: "CoreBit Solutions Pvt Ltd was founded with a mission to bring high-end design craftsmanship and reliable custom software architecture to world-wide startups."
  },
  {
    year: "2024",
    title: "Expansion of Core Engineering Pods",
    description: "Expanded to 25+ senior engineers, focusing on robust full-stack development, cloud integrations, and mobile applications."
  },
  {
    year: "2025",
    title: "50+ Client Launches",
    description: "Successfully launched over 50 clients globally, maintaining a perfect 5-star customer review average across modern software reviewing directories."
  },
  {
    year: "2026",
    title: "Entering the Next Decade",
    description: "Integrating Gemini GenAI systems and real-time streaming architectures into our core service offerings to provide client systems with state-of-the-art software capabilities."
  }
];
