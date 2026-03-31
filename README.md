# BrandSync

BrandSync is a marketplace connecting Brands and Influencers. It facilitates gig creation, proposal handling, real-time messaging, and milestone-based contract management.

## Tech Stack

- **Frontend:** React 19 (Vite), Tailwind CSS v4, Framer Motion, React Router 7, Lucide Icons
- **Backend:** Supabase (PostgreSQL, Auth, Real-time Channels, Edge Functions)
- **Specialized:** Tesseract.js (Client-side OCR for social media reach verification)

## Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Create a `.env` file from the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Required variables:*
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
   *(Never store secrets like Google Client Secret in the frontend `.env` file.)*

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Builds the app for production into the `dist` folder.
- `npm run lint`: Runs ESLint to catch code quality and formatting issues.
- `npm run preview`: Previews the production build locally.

## Architecture

- **Roles & Routing:**
  - **Brand:** `/brand/*` (Manage gigs, review proposals, approve milestones).
  - **Influencer:** `/influencer/*` (Discover gigs, submit proposals, verify profile).
  - **Admin:** `/admin/*` (Moderation, user management, fallback verification).
  - Role-based routing is protected via `ProtectedRoute` and `RoleRoute` guards.
- **Supabase Integration:**
  - **Auth:** Email and OAuth, maintaining sessions across sessions.
  - **Database:** Extensive use of PostgreSQL triggers to dispatch business logic.
  - **Real-time:** Utilizing Supabase Channels for direct chat messaging and application notifications.
  - **Edge Functions:** Handled externally for secure processes (e.g., automated email notifications triggered via PostgreSQL `pg_net` extension).

## Verification Overview

Influencers must verify their reach before getting full platform trust. This process utilizes:
1. **Automated AI Verification:** Client-side OCR via `Tesseract.js` scans uploaded social media screenshots (from Instagram/YouTube). If the detected follower count matches or exceeds minimum thresholds, auto-verification occurs.
2. **Manual Fallback:** If the OCR process fails or the user submits a manual entry, the workflow defaults to a manual review state managed in the Admin panel.
*(Status: Active. Using unified verification UI via `VerificationUpload` component.)*
