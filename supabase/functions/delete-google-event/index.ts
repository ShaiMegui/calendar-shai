// supabase/functions/delete-google-event/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400"
};

serve(async (req) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Gérer les requêtes OPTIONS
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Extraire le token d'accès
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization token provided");
    }
    
    const accessToken = authHeader.replace("Bearer ", "");
    console.log("Access token extracted (first 10 chars):", accessToken.substring(0, 10) + "...");

    // Analyser le corps de la requête
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed:", requestBody);
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid request body format");
    }

    const { eventId } = requestBody;
    
    if (!eventId) {
      throw new Error("Missing required parameter: eventId");
    }

    console.log("Attempting to delete event:", eventId);

    // Appeler directement l'API Google Calendar
    const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    console.log("DELETE request to:", deleteUrl);
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Delete response status:", deleteResponse.status);
    
    if (!deleteResponse.ok) {
      let errorMsg = `Failed with status: ${deleteResponse.status}`;
      
      try {
        // Tenter de lire le corps de l'erreur si disponible
        const errorBody = await deleteResponse.text();
        console.error("Error response body:", errorBody);
        if (errorBody) {
          try {
            const errorJson = JSON.parse(errorBody);
            errorMsg += ` - ${errorJson.error?.message || errorJson.error || errorBody}`;
          } catch {
            errorMsg += ` - ${errorBody}`;
          }
        }
      } catch (e) {
        console.error("Could not read error response:", e);
      }
      
      throw new Error(errorMsg);
    }

    console.log("Event deleted successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Event deleted successfully from Google Calendar"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});