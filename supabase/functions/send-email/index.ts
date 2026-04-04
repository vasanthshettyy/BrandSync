// supabase/functions/send-email/index.ts
// MakerHQ Phase 8: Transactional Email Service via Resend API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "http://localhost:5173";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "MakerHQ <notifications@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(JSON.stringify({ error: "Email service not configured (missing RESEND_API_KEY)" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, title, message, type, link } = await req.json();

    if (!to || !title || !message) {
      throw new Error("Missing required fields: to, title, or message.");
    }

    // Dynamic Email Formatting based on Notification Type
    const getAccentColor = (type: string) => {
      switch (type) {
        case 'proposal_received': return '#7C3AED'; // Purple
        case 'milestone_update': return '#F59E0B'; // Amber
        case 'contract_completed': return '#10B981'; // Emerald
        default: return '#0D9488'; // Teal
      }
    };

    const accentColor = getAccentColor(type);

    // Robust link construction
    let ctaUrl = "";
    if (link) {
      const sanitizedLink = link.startsWith('/') ? link : `/${link}`;
      ctaUrl = `${APP_BASE_URL.replace(/\/$/, '')}${sanitizedLink}`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; }
          .header { padding: 30px; border-bottom: 1px solid #27272a; text-align: center; }
          .content { padding: 30px; line-height: 1.6; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${accentColor}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
          h1 { color: #ffffff; margin-top: 0; font-size: 20px; }
          p { color: #d4d4d8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="color: ${accentColor}; margin: 0; letter-spacing: 1px;">MakerHQ</h2>
          </div>
          <div class="content">
            <h1>${title}</h1>
            <p>${message}</p>
            ${ctaUrl ? `<a href="${ctaUrl}" class="button">View Details</a>` : ''}
          </div>
          <div class="footer">
            &copy; 2026 MakerHQ. All rights reserved.<br/>
            You received this because of an update on your account.
          </div>
        </div>
      </body>
      </html>
    `;

    // Resend API Fetch
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: title,
        html: htmlContent,
      }),
    });


    const resData = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify(resData), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
