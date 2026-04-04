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

## Commands Reference

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Builds the app for production into the `dist` folder.
- `npm run lint`: Runs ESLint to catch code quality and formatting issues.
- `npm run test`: Runs the unified test suite.

## Release Checklist (Production Deployment)

Follow these steps for a stable production handoff:

### 1. Database Migrations
Apply the latest standardized schema changes to your production instance:
```bash
npx supabase migration up
```

### 2. Set Supabase Secrets
Configure environment-aware secrets for Edge Functions:
```bash
# Email (Resend)
npx supabase secrets set RESEND_API_KEY=your_key
npx supabase secrets set FROM_EMAIL="MakerHQ <notifications@yourdomain.com>"
npx supabase secrets set APP_BASE_URL=https://your-app.com

# OCR Verification
npx supabase secrets set OCR_SPACE_API_KEY=your_key
npx supabase secrets set VERIFICATION_CONFIDENCE_THRESHOLD=0.85
```

### 3. Deploy Edge Functions
Push the server-side logic:
```bash
npx supabase functions deploy send-email
npx supabase functions deploy verify-image
```

### 4. Post-Deploy Configuration
Ensure the database knows where to send async email notifications:
```sql
-- Execute in Supabase SQL Editor
ALTER DATABASE postgres SET "app.settings.edge_function_url" TO 'https://[PROJECT_ID].supabase.co/functions/v1/send-email';
ALTER DATABASE postgres SET "app.settings.edge_function_key" TO '[SERVICE_ROLE_KEY]';
```

### 5. Smoke Tests
- [ ] Log in as an Admin and view the **Verification Queue**.
- [ ] Log in as an Influencer and upload a verification screenshot.
- [ ] Confirm a notification appears in the Topbar bell.
- [ ] Verify that unread counts sync in real-time.

## Architecture & Verification

- **Real-time Engine:** Uses Supabase Channels for instant message and notification delivery.
- **OCR Logic:** Edge Function parses screenshots via OCR.space. Confidence < 0.85 automatically triggers a manual review state.
- **Handoff Status:** Hardening Phase Complete. Ready for Phase 10 (Advanced Analytics).
