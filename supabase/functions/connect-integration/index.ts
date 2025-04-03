import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OAuth2Client } from "npm:google-auth-library@9.6.3";

// Configuration des en-têtes CORS améliorée
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // À remplacer par l'origine exacte en production
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
  "Access-Control-Max-Age": "86400", // 24 heures
};

const GOOGLE_CLIENT_ID = "251483254161-dm9851lia2815q2g9ietfs5va8gjmtn5.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const GOOGLE_REDIRECT_URI = "https://tbnilshtsjyashreevjt.supabase.co/functions/v1/connect-integration-callback";

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

serve(async (req: Request) => {
  // Gérer les requêtes OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      status: 204, // No Content
      headers: corsHeaders,
    });
  }

  try {
    let appType, userId, origin;

    // Extraire les paramètres selon la méthode
    if (req.method === "POST") {
      // Extraire du corps JSON
      const body = await req.json().catch(() => null);
      
      if (!body || !body.appType || !body.userId) {
        throw new Error("Missing required parameters: appType and userId");
      }
      
      appType = body.appType;
      userId = body.userId;
      origin = body.origin || new URL(req.url).origin;
    } else {
      // Extraire des paramètres d'URL pour GET
      const url = new URL(req.url);
      appType = url.searchParams.get("appType");
      userId = url.searchParams.get("userId");
      origin = url.searchParams.get("origin") || url.origin;
      
      if (!appType || !userId) {
        throw new Error("Missing required parameters: appType and userId");
      }
    }

    if (appType !== "GOOGLE_MEET_AND_CALENDAR") {
      throw new Error("Unsupported integration type");
    }

    // Générer l'URL d'authentification OAuth avec des scopes spécifiques
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.settings.readonly"
      ],
      prompt: "consent",
      state: JSON.stringify({ userId, appType, origin }),
      include_granted_scopes: true
    });

    return new Response(
      JSON.stringify({ url: authUrl }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in connect-integration function:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});