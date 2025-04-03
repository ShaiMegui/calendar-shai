import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { google } from "npm:googleapis@129.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const GOOGLE_CLIENT_ID = "251483254161-dm9851lia2815q2g9ietfs5va8gjmtn5.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Get access token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization token provided");
    }
    const accessToken = authHeader.replace("Bearer ", "");

    // Parse request body
    const { startTime, endTime, attendees, summary } = await req.json();

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET
    );

    try {
      // First try with the current access token
      oauth2Client.setCredentials({ access_token: accessToken });

      // Create Calendar API client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Create calendar event with Google Meet
      const event = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: {
          summary,
          start: {
            dateTime: startTime,
          },
          end: {
            dateTime: endTime,
          },
          attendees,
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      });

      // Extract meet link and event ID
      const meetLink = event.data.conferenceData?.entryPoints?.[0]?.uri;
      const eventId = event.data.id;

      if (!meetLink || !eventId) {
        throw new Error("Failed to create Google Meet link");
      }

      return new Response(
        JSON.stringify({
          meetLink,
          eventId,
        }),
        { 
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      // If the error is related to invalid credentials
      if (error.message.includes("invalid_grant") || error.message.includes("Invalid Credentials")) {
        // Initialize Supabase client
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          {
            auth: {
              persistSession: false,
            }
          }
        );

        // Get integration details from database
        const { data: integration, error: dbError } = await supabaseAdmin
          .from("integrations")
          .select("*")
          .eq("access_token", accessToken)
          .single();

        if (dbError || !integration) {
          throw new Error("Integration not found");
        }

        // Try to refresh the token
        oauth2Client.setCredentials({
          refresh_token: integration.refresh_token,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        // Update the integration with new tokens
        const { error: updateError } = await supabaseAdmin
          .from("integrations")
          .update({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
            expiry_date: credentials.expiry_date,
            updated_at: new Date().toISOString(),
          })
          .eq("id", integration.id);

        if (updateError) {
          throw new Error("Failed to update integration tokens");
        }

        // Retry the calendar event creation with new token
        oauth2Client.setCredentials(credentials);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = await calendar.events.insert({
          calendarId: 'primary',
          conferenceDataVersion: 1,
          sendUpdates: 'all',
          requestBody: {
            summary,
            start: {
              dateTime: startTime,
            },
            end: {
              dateTime: endTime,
            },
            attendees,
            conferenceData: {
              createRequest: {
                requestId: crypto.randomUUID(),
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          },
        });

        const meetLink = event.data.conferenceData?.entryPoints?.[0]?.uri;
        const eventId = event.data.id;

        if (!meetLink || !eventId) {
          throw new Error("Failed to create Google Meet link after token refresh");
        }

        return new Response(
          JSON.stringify({
            meetLink,
            eventId,
          }),
          { 
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }

      // If it's not a token issue, rethrow the error
      throw error;
    }
  } catch (error) {
    console.error("Error creating Google Meet:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to create meeting",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      }
    );
  }
});