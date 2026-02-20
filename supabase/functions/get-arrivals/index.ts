import { serve } from "https://deno.land/std@0.131.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { stopId, maxVisits } = body

    if (!stopId) {
      return new Response(JSON.stringify({ error: "stopId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    const MTA_KEY = Deno.env.get('MTA_API_KEY')
    if (!MTA_KEY) {
      return new Response(JSON.stringify({ error: "MTA API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    // MTA Bus Time API - Stop Monitoring endpoint
    const visits = maxVisits ? `&MaximumStopVisits=${encodeURIComponent(String(maxVisits))}` : ""
    const url = `https://bustime.mta.info/api/siri/stop-monitoring.json?key=${encodeURIComponent(MTA_KEY)}&MonitoringRef=${encodeURIComponent(stopId)}${visits}`

    const response = await fetch(url)
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `MTA API request failed: ${response.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  }
})
