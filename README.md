# MakerHQ

MakerHQ is a marketplace connecting Brands and Influencers. It facilitates gig creation, proposal handling, real-time messaging, and milestone-based contract management.

*Where the creator economy gets to work*

## Tech Stack

- **Frontend:** React 19 (Vite), Tailwind CSS v4, Framer Motion, React Router 7, Lucide Icons
- **Backend:** Supabase (PostgreSQL, Auth, Real-time Channels, Edge Functions)
- **Specialized:** OCR.space (image analysis for reach verification)

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
   
   *Server-Side Only Secrets (Supabase Secrets):*
   - `OCR_SPACE_API_KEY`: Your OCR.space API key (Required for verification OCR).
   - `VERIFICATION_CONFIDENCE_THRESHOLD`: (Optional) Defaults to `0.85`.
   - `RESEND_API_KEY`: Your Resend API key (Required for transactional emails).
   - `FROM_EMAIL`: The "from" address for emails (e.g., `MakerHQ <notifications@yourdomain.com>`).
   - `APP_BASE_URL`: The production URL of your frontend (e.g., `https://makerhq.ai`) used for email deep links. Defaults to `http://localhost:5173` if unset.
   *(Never store these in your frontend `.env` file!)*

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Email Notifications Deployment

To set up the automated transactional email system:
1. Obtain an API key from [Resend](https://resend.com/).
2. Set the required secrets in your Supabase project:
   ```bash
   npx supabase secrets set RESEND_API_KEY=your_resend_key_here
   npx supabase secrets set FROM_EMAIL="MakerHQ <notifications@yourdomain.com>"
   npx supabase secrets set APP_BASE_URL=https://your-production-url.com
   ```
3. Deploy the edge function:
   ```bash
   npx supabase functions deploy send-email
   ```
4. Configure your production database to point `pg_net` triggers to the deployed function:
   ```sql
   -- Run this in your Supabase SQL Editor
   ALTER DATABASE postgres SET "app.settings.edge_function_url" TO 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/send-email';
   ALTER DATABASE postgres SET "app.settings.edge_function_key" TO '[YOUR_ANON_KEY]';
   ```

## OCR Verification Deployment

To set up the OCR verification feature:
1. Obtain an API key from [OCR.space](https://ocr.space/ocrapi).
2. Set the secret in your Supabase project:
   ```bash
   npx supabase secrets set OCR_SPACE_API_KEY=your_key_here
   npx supabase secrets set VERIFICATION_CONFIDENCE_THRESHOLD=0.85
   ```
3. Deploy the edge function:
   ```bash
   npx supabase functions deploy verify-image
   ```

## Commands Reference

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Builds the app for production into the `dist` folder.
- `npm run lint`: Runs ESLint to catch code quality and formatting issues.
- `npm run test`: Runs the unified test suite.

## Architecture

- **Roles & Routing:**
  - **Brand:** `/brand/*` (Manage gigs, review proposals, approve milestones).
  - **Influencer:** `/influencer/*` (Discover gigs, submit proposals, verify profile).
  - **Admin:** `/admin/*` (Moderation, user management, fallback verification).
- **Supabase Integration:**
  - **Auth:** Email and OAuth, maintaining sessions across sessions.
  - **Database:** Extensive use of PostgreSQL triggers to dispatch business logic.
  - **Real-time:** Utilizing Supabase Channels for direct chat messaging and application notifications.
  - **Edge Functions:** Handled externally for secure processes (e.g., automated email notifications triggered via PostgreSQL `pg_net` extension).

## Verification Overview

Influencers must verify their reach before getting full platform trust. This process utilizes:
1. **Automated OCR Verification:** OCR.space (via Supabase Edge Function) scans social media screenshots.
2. **Manual Fallback:** If OCR fails or confidence is low, the workflow defaults to a manual review state.
