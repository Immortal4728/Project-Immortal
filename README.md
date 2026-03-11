<div align="center">

# ⚡ Project Immortal

### Engineering Ideas Into Real Software

A full-stack project management platform built for engineering students,
administrators, and employees to collaborate on final-year and production-grade software projects.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase)](https://firebase.google.com/)
[![InsForge](https://img.shields.io/badge/InsForge-BaaS-10B981)](https://insforge.app/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Role-Based Access](#-role-based-access)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌟 Overview

**Project Immortal** is a multi-role web platform that connects students with a professional engineering team. Students can submit project ideas, track progress, and access project documentation — while admins manage submissions, schedule meetings, upload project files, and monitor platform analytics.

The platform features three distinct portals:

| Portal | Purpose |
|--------|---------|
| 🎓 **Student Portal** | Submit projects, track progress, view documents, manage profile |
| 🛡️ **Admin Portal** | Review submissions, manage users, upload documents, update project stages |
| 👷 **Employee Portal** | Access assigned projects, upload documentation files |

---

## ✨ Features

### Public Website
- **Animated Landing Page** — WebGL shader background, 3D elements via React Three Fiber
- **Services Section** — Core domain showcase (AI/ML, Web Dev, Mobile, etc.)
- **Testimonials** — Client reviews with marquee animation
- **Project Submission Form** — Students can submit project requests directly
- **Contact Section** — Business info and project intake CTA
- **Why Us Page** — Company advantages and differentiators
- **Terms & Privacy Policy** — Legal compliance pages

### Student Dashboard
- **Project Progress Tracker** — 6-stage visual pipeline (Submitted → Review → Approved → Development → Delivery → Completed)
- **Project Overview** — Title, domain, description, submission date, order ID
- **Meeting Info** — View scheduled meeting links, dates, and times
- **Project Documents** — Download uploaded files (Record, PPT, Viva, Notes)
- **Profile Photo Upload** — Crop & upload avatar with real-time preview
- **Status Badge** — Dynamic status indicators (Pending, Approved, In Development, etc.)

### Admin Portal
- **Dashboard** — Overview metrics and system health
- **Project Submissions** — Review, approve, or reject student submissions
- **Customer Management** — View approved students with project cards
  - Schedule meetings with date/time/link
  - Upload project documentation (Record, PPT, Viva, Notes)
  - Update project progress stage
  - View project details
- **User Management** — Activate/deactivate employee accounts
- **Platform Analytics** — Real-time metrics and data visualizations (via Recharts)
- **Admin Profile** — Firebase-authenticated admin with verified session badge
- **Email Notifications** — Automated approval emails with credentials via Gmail SMTP

### Employee Portal
- **Project Workspace** — Document management for assigned projects
- **File Upload/Replace/Delete** — Direct InsForge storage operations
- **Document Type Slots** — Record, PPT, Viva Questions, Internal Notes

### Security & Auth
- **Firebase Authentication** — Email/password with email verification
- **Admin Email Whitelist** — Configurable via environment variables
- **Middleware Protection** — Route-level auth for all admin and employee routes
- **Session Cookies** — Secure token management for students and employees
- **OTP Verification** — Email-based verification flow

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.1.6 | React framework with App Router, SSR, API routes |
| [React](https://react.dev/) | 19.2.3 | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [Framer Motion](https://www.framer.com/motion/) | 12.35.0 | Page transitions & micro-animations |
| [Lucide React](https://lucide.dev/) | 0.575.0 | Icon library |
| [Recharts](https://recharts.org/) | 3.8.0 | Data visualization charts |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) | 9.5.0 | 3D WebGL rendering |
| [Three.js](https://threejs.org/) | 0.183.2 | 3D graphics engine (via R3F) |
| [React Easy Crop](https://github.com/ValentinH/react-easy-crop) | 5.5.6 | Image cropping for profile photos |
| [Radix UI](https://www.radix-ui.com/) | 1.4.3 | Accessible UI primitives (Avatar, Slot) |
| [Class Variance Authority](https://cva.style/) | 0.7.1 | Component variant management |

### Backend & Services

| Technology | Purpose |
|------------|---------|
| [InsForge SDK](https://insforge.app/) | Backend-as-a-Service (Database, Storage, Functions) |
| [Firebase Auth](https://firebase.google.com/products/auth) | Admin authentication (email/password + verification) |
| [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) | Server-side token verification |
| [PostgreSQL](https://www.postgresql.org/) | Primary database (via InsForge PostgREST API) |
| [Nodemailer](https://nodemailer.com/) | Email delivery (Gmail SMTP for approval notifications) |
| [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) | Password hashing for employee accounts |
| [jose](https://github.com/panva/jose) | JWT token handling |

### Database Schema

| Table | Purpose |
|-------|---------|
| `project_requests` | Student submissions, status, credentials, progress stage |
| `project_files` | Uploaded documents (per project & document type) |
| `project_submissions` | Initial project submission intake |
| `employees` | Admin and employee user accounts |

### Storage

| Bucket | Purpose |
|--------|---------|
| `project_files` | Student project documentation (PDF, DOCX, PPT, TXT) |

### Dev Tools

| Tool | Purpose |
|------|---------|
| [ESLint](https://eslint.org/) | Code linting |
| [PostCSS](https://postcss.org/) | CSS processing |
| [shadcn/ui](https://ui.shadcn.com/) | Pre-built UI components |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Public    │  │ Student      │  │ Admin / Employee       │ │
│  │ Website   │  │ Dashboard    │  │ Portal                 │ │
│  └─────┬────┘  └──────┬───────┘  └───────────┬────────────┘ │
└────────┼───────────────┼─────────────────────┼──────────────┘
         │               │                     │
         ▼               ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App Router (API Routes)             │
│                                                              │
│  /api/submit      /api/student/*     /api/admin/*            │
│  /api/auth/*      /api/employee/*    /api/logout             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Middleware (Auth Guard)                    │  │
│  │  • Firebase token verification for admin routes        │  │
│  │  • Session cookie checks for employee/student routes   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────┬──────────────────────────┬────────────────────────────┘
       │                          │
       ▼                          ▼
┌──────────────┐         ┌──────────────────┐
│  Firebase    │         │    InsForge       │
│  Auth        │         │  (BaaS)          │
│              │         │                  │
│ • Sign-in    │         │ • PostgreSQL DB  │
│ • Verify     │         │ • File Storage   │
│ • ID Tokens  │         │ • Raw SQL API    │
└──────────────┘         └──────────────────┘
```

---

## 📁 Project Structure

```
project_immortal/
├── public/                     # Static assets (logos, team photos)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page (Hero, Services, Contact)
│   │   ├── layout.tsx          # Root layout with fonts & loading screen
│   │   ├── globals.css         # Global styles & Tailwind config
│   │   ├── start-project/      # Project submission form
│   │   ├── why-us/             # Company advantages page
│   │   ├── login/              # Admin login (Firebase)
│   │   ├── verify-email/       # Email verification flow
│   │   ├── terms/              # Terms of Service
│   │   ├── privacy-policy/     # Privacy Policy
│   │   │
│   │   ├── student/
│   │   │   ├── login/          # Student login page
│   │   │   └── dashboard/      # Student dashboard (progress, docs, profile)
│   │   │
│   │   ├── employee/
│   │   │   ├── login/          # Employee login page
│   │   │   └── project/[id]/   # Project documentation workspace
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx      # Admin sidebar layout
│   │   │   ├── dashboard/      # Admin overview dashboard
│   │   │   ├── profile/        # Admin profile + customer management
│   │   │   ├── submissions/    # Project submission review
│   │   │   ├── customers/      # Customer directory
│   │   │   ├── users/          # Employee management
│   │   │   ├── analytics/      # Platform analytics & charts
│   │   │   └── verify-otp/     # OTP verification
│   │   │
│   │   └── api/
│   │       ├── submit/         # Project submission endpoint
│   │       ├── auth/           # Authentication endpoints
│   │       ├── logout/         # Session termination
│   │       ├── student/        # Student session, login, profile, project
│   │       ├── employee/       # Employee login, logout, projects, upload
│   │       └── admin/          # Admin profile, employees, submissions, analytics
│   │
│   ├── components/
│   │   ├── navbar.tsx          # Site navigation bar
│   │   ├── ClientLayout.tsx    # Client-side layout wrapper
│   │   ├── CustomCursor.tsx    # Custom cursor animation
│   │   ├── LoadingScreen.tsx   # Initial loading animation
│   │   ├── admin-documents-workspace.tsx  # Admin document manager
│   │   ├── sections/           # Landing page sections
│   │   │   ├── Services.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── TextMarquee.tsx
│   │   │   └── WhatWeEngineer.tsx
│   │   └── ui/                 # Reusable UI components
│   │       ├── animated-web3-landing-page.tsx
│   │       ├── web-gl-shader.tsx
│   │       ├── modern-stunning-sign-in.tsx
│   │       ├── footer-section.tsx
│   │       ├── testimonial-card.tsx
│   │       └── ...
│   │
│   └── lib/
│       ├── db.ts               # InsForge raw SQL query helper
│       ├── firebase.ts         # Firebase client initialization
│       ├── insforge.ts         # InsForge SDK client
│       ├── supabase.ts         # Supabase client (legacy)
│       ├── verify-admin.ts     # Firebase Admin token verification
│       ├── otp-store.ts        # OTP management
│       ├── types.ts            # Shared TypeScript types
│       └── utils.ts            # Utility functions
│
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Firebase** project with Authentication enabled (Email/Password)
- **InsForge** account with a configured backend

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/project-immortal.git
cd project-immortal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual credentials

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file using `.env.example` as a template:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_INSFORGE_URL` | ✅ | InsForge backend URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | ✅ | InsForge anonymous API key |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ⬜ | Firebase analytics measurement ID |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin email whitelist |
| `NEXT_PUBLIC_ADMIN_EMAILS` | ✅ | Client-side admin email whitelist |
| `EMAIL_USER` | ✅ | Gmail address for sending emails |
| `EMAIL_PASS` | ✅ | Gmail app password for SMTP |
| `NEXT_PUBLIC_SUPABASE_URL` | ⬜ | Supabase URL (legacy) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⬜ | Supabase anon key (legacy) |
| `DATABASE_URL` | ⬜ | Direct database connection string |
| `JWT_SECRET` | ⬜ | JWT signing secret |

---

## 👥 Role-Based Access

| Role | Auth Method | Routes | Capabilities |
|------|-------------|--------|-------------|
| **Public** | None | `/`, `/why-us`, `/start-project` | Browse site, submit projects |
| **Student** | Email + Order ID | `/student/*` | View dashboard, track progress, download docs |
| **Employee** | Email + Password (DB) | `/employee/*` | Manage project documents |
| **Admin** | Firebase (Email/Password) | `/admin/*` | Full platform control |

---

## 🔌 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submit` | Submit a new project request |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/student/login` | Student authentication |
| `GET` | `/api/student/session` | Get current student session & project data |
| `GET` | `/api/student/project` | Fetch student project details |
| `POST` | `/api/student/profile/upload` | Upload profile photo |
| `POST` | `/api/student/logout` | End student session |

### Employee
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/employee/login` | Employee authentication |
| `GET` | `/api/employee/project/[id]` | Get assigned project details |
| `POST` | `/api/employee/upload` | Upload project files |
| `POST` | `/api/employee/logout` | End employee session |

### Admin (Protected by Firebase middleware)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/profile` | Get admin profile data |
| `GET` | `/api/admin/submissions` | List all project submissions |
| `POST` | `/api/admin/update-status` | Approve/reject submissions |
| `GET` | `/api/admin/employees` | List all employees |
| `PATCH` | `/api/admin/employees/[id]` | Activate/deactivate employee |
| `DELETE` | `/api/admin/employees/[id]` | Delete employee account |
| `GET` | `/api/admin/customers` | List approved customers |
| `GET` | `/api/admin/analytics` | Platform analytics data |
| `GET` | `/api/admin/dashboard` | Dashboard metrics |

---

## 🚢 Deployment

The application is designed for deployment on **Vercel**:

1. Push your code to GitHub
2. Connect the repository to [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy

> **Note:** Ensure your InsForge backend and Firebase project are properly configured before deploying.

---

## 📄 License

This project is proprietary software developed by the Project Immortal team.

---

<div align="center">

**Built with ❤️ by the Project Immortal Engineering Team**

Guntur, Andhra Pradesh, India

</div>
