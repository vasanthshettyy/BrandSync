import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OCR_SPACE_API_KEY = Deno.env.get("OCR_SPACE_API_KEY");
const DEFAULT_THRESHOLD = Deno.env.get("VERIFICATION_CONFIDENCE_THRESHOLD") || "0.85";
const MAX_IMAGE_SIZE_BYTES = Number(Deno.env.get("VERIFICATION_MAX_IMAGE_BYTES") || (5 * 1024 * 1024));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function manualReviewResponse(errorMessage: string) {
  return jsonResponse({
    followers_count: null,
    platform: "Unknown",
    confidence: 0,
    threshold: parseFloat(DEFAULT_THRESHOLD),
    raw_text: "",
    recoverable: true,
    needs_manual_review: true,
    error: errorMessage,
  });
}

/**
 * Robust parsing for follower counts with heuristics for accuracy.
 */
function parseFollowers(text: string): number | null {
  // 1. Clean up common OCR artifacts and normalize
  const normalized = text.toLowerCase()
    .replace(/,/g, '') // Remove thousands separators
    .replace(/\s+/g, ' '); // Normalize spaces

  // 2. Identify keywords and their positions
  const keywords = ["followers", "subscribers", "subs", "following", "posts"];
  
  // 3. Extract all potential number patterns: "1.2k", "12,500", "150m"
  // We look for numbers that might have a suffix
  const numberPattern = /(\d+(?:\.\d+)?)\s*([kmb])?/g;
  
  let bestCount: number | null = null;
  let matches: Array<{ value: number, index: number }> = [];
  let match;

  while ((match = numberPattern.exec(normalized)) !== null) {
    let val = parseFloat(match[1]);
    const suffix = match[2];

    if (suffix === 'k') val *= 1000;
    else if (suffix === 'm') val *= 1000000;
    else if (suffix === 'b') val *= 1000000000;

    matches.push({ value: Math.floor(val), index: match.index });
  }

  // 4. Heuristic: Find the number closest to "followers" or "subscribers"
  let minDistance = Infinity;
  for (const keyword of ["followers", "subscribers", "subs"]) {
    const kwIndex = normalized.indexOf(keyword);
    if (kwIndex !== -1) {
      for (const m of matches) {
        const distance = Math.abs(m.index - kwIndex);
        if (distance < minDistance) {
          minDistance = distance;
          bestCount = m.value;
        }
      }
    }
  }

  // 5. Fallback: If no keyword proximity found, take the largest number 
  // (usually the follower count is the largest of Posts/Followers/Following)
  if (bestCount === null && matches.length > 0) {
    bestCount = Math.max(...matches.map(m => m.value));
  }

  // Basic sanity check: Follower counts below 10 or above 1B might be noise
  if (bestCount !== null && (bestCount < 5 || bestCount > 2000000000)) {
    return null;
  }

  return bestCount;
}

/**
 * Detect platform based on keywords
 */
function detectPlatform(text: string): "Instagram" | "YouTube" | "Unknown" {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("instagram") || lowerText.includes("reels") || lowerText.includes("followers") || lowerText.includes("following")) {
    return "Instagram";
  }
  if (lowerText.includes("youtube") || lowerText.includes("subscribers") || lowerText.includes("studio") || lowerText.includes("subs")) {
    return "YouTube";
  }
  return "Unknown";
}

serve(async (req: Request) => {
  console.log(`Request received: ${req.method} ${req.url}`);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!OCR_SPACE_API_KEY) {
      console.error("Missing OCR_SPACE_API_KEY");
      return jsonResponse({ 
        error: "Verification service is not configured. Please contact support.",
        recoverable: true
      }, 503);
    }

    const body = await req.json();
    const { image } = body;
    if (!image) throw new Error("Missing required field: image.");

    const base64Data = image.includes(',') ? image : `data:image/jpeg;base64,${image}`;
    const rawBase64 = base64Data.includes(",") ? base64Data.split(",", 2)[1] : base64Data;
    const approximateSizeInBytes = (rawBase64.length * 3) / 4;
    
    if (approximateSizeInBytes > MAX_IMAGE_SIZE_BYTES) {
      const maxMb = Math.round((MAX_IMAGE_SIZE_BYTES / (1024 * 1024)) * 10) / 10;
      throw new Error(`Image too large (Max ${maxMb}MB). Please try a more compressed image.`);
    }

    // Prepare Multipart form data for OCR.space
    const formData = new FormData();
    formData.append("apikey", OCR_SPACE_API_KEY);
    formData.append("base64Image", base64Data);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("scale", "true"); // IMPORTANT: Improves accuracy for small/blurry text
    formData.append("OCREngine", "2"); 

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const providerText = await res.text();
        console.error("OCR provider request failed", { status: res.status, body: providerText });
        return manualReviewResponse("OCR provider unavailable right now. Please submit for manual admin review.");
      }

      const ocrData = await res.json();

      if (ocrData.IsErroredOnProcessing || ocrData.OCRExitCode > 1) {
        const errMsg = ocrData.ErrorMessage || ocrData.ErrorDetails || "OCR service error";
        console.error("OCR processing error", errMsg);
        return manualReviewResponse("OCR could not reliably read this screenshot. Please submit for manual admin review.");
      }

      const parsedText = ocrData.ParsedResults?.[0]?.ParsedText || "";
      
      if (!parsedText.trim()) {
        return jsonResponse({
          followers_count: null,
          platform: "Unknown",
          confidence: 0,
          raw_text: "No text detected.",
          threshold: parseFloat(DEFAULT_THRESHOLD),
          recoverable: true,
          needs_manual_review: true,
          error: "No readable text detected. Please submit for manual admin review."
        });
      }

      const followers = parseFollowers(parsedText);
      const platform = detectPlatform(parsedText);
      
      // Calculate confidence based on data quality
      let confidence = 0.3; 
      if (followers) confidence += 0.4;
      if (platform !== "Unknown") confidence += 0.25;

      const responsePayload = {
        followers_count: followers,
        platform: platform,
        confidence: Math.min(confidence, 0.99),
        threshold: parseFloat(DEFAULT_THRESHOLD),
        raw_text: parsedText.substring(0, 500).trim()
      };

      return jsonResponse(responsePayload);

    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return manualReviewResponse("OCR processing timed out. Please submit for manual admin review.");
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    console.error("Verify Image Error:", error);
    return jsonResponse({ 
      error: error instanceof Error ? error.message : "Internal error",
      recoverable: true
    }, 400);
  }
});
