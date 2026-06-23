/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ActivePage {
  HOME = "home",
  CONTACT = "contact",
  PROJECTS = "projects",
  REVIEWS = "reviews",
  ENQUIRIES = "enquiries",
  PRICING = "pricing",
  DETAILS = "details",
  ADMIN = "admin"
}

export interface ProjectPaymentDetails {
  totalAmount: string;
  pricingTier: string;
  paymentStatus: "Paid in Full" | "Milestone Invoicing Complete" | "Retainer Retained";
  paymentMethod: string;
  billingAddress: string;
}

export interface Project {
  id: string;
  projectName: string;
  startedDate: string;
  deliveredDate: string;
  clientName: string;
  companyName: string;
  screenshots?: string[];
  clientReview?: {
    rating: number;
    comment: string;
    avatar: string;
    role: string;
  };
  paymentDetails?: ProjectPaymentDetails;
  projectOverview?: string;
  status?: "draft" | "published";
}

export interface Review {
  id: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  projectTitle?: string;
  comment: string;
  rating: number;
  avatar: string;
  status?: "draft" | "published";
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  status?: "draft" | "published";
}

export interface TeamMember {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface CompanyMilestone {
  year: string;
  title: string;
  description: string;
}

export interface RoleItem {
  id: string;
  name: string;
  subtitle: string;
  iconName: string;
  responsibilities: string[];
}

