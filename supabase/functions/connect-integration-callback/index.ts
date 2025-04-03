import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle OAuth error response
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error("No authorization code provided");
    }

    if (!state) {
      throw new Error("No state parameter provided");
    }

    // Parse state parameter
    let parsedState;
    try {
      parsedState = JSON.parse(state);
    } catch (e) {
      throw new Error("Invalid state parameter format");
    }

    const { userId, appType, origin } = parsedState;

    if (!userId || !appType || !origin) {
      throw new Error("Invalid state parameter content");
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Check if integration already exists
    const { data: existingIntegration } = await supabaseClient
      .from("integrations")
      .select("id")
      .eq("user_id", userId)
      .eq("app_type", appType)
      .maybeSingle();

    if (existingIntegration) {
      // Update existing integration
      const { error: updateError } = await supabaseClient
        .from("integrations")
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          metadata: {
            scope: tokens.scope,
            token_type: tokens.token_type
          },
          is_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingIntegration.id);

      if (updateError) throw updateError;
    } else {
      // Create new integration
      const { error: insertError } = await supabaseClient
        .from("integrations")
        .insert({
          user_id: userId,
          provider: "GOOGLE",
          category: "CALENDAR_AND_VIDEO_CONFERENCING",
          app_type: appType,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          metadata: {
            scope: tokens.scope,
            token_type: tokens.token_type
          },
          is_connected: true
        });

      if (insertError) throw insertError;
    }

    // Redirect back to frontend with success parameter
    const redirectUrl = new URL("/app/integrations", origin);
    redirectUrl.searchParams.set("success", "true");
    
    return Response.redirect(redirectUrl.toString(), 302);

  } catch (error) {
    console.error("Error in callback:", error);
    
    // Get origin from state parameter
    let redirectOrigin;
    try {
      const state = new URL(req.url).searchParams.get("state");
      if (state) {
        const parsedState = JSON.parse(state);
        redirectOrigin = parsedState.origin;
      }
    } catch (e) {
      console.error("Error parsing state for error redirect:", e);
    }

    // Use parsed origin or fallback to a default
    const redirectUrl = new URL("/app/integrations", redirectOrigin || "https://calendrier-shai.netlify.app");
    redirectUrl.searchParams.set("error", encodeURIComponent(error instanceof Error ? error.message : "An unknown error occurred"));
    
    return Response.redirect(redirectUrl.toString(), 302);
  }
});