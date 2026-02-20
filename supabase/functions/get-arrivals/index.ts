import { serve } from "https://deno.land/std@0.131.0/http/server.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  const { stopId } = await req.json()
  const MTA_KEY = Deno.env.get('MTA_API_KEY')

  // MTA Bus Time API - Stop Monitoring endpoint
  const url = `https://bustime.mta.info/api/siri/stop-monitoring.json?key=${MTA_KEY}&MonitoringRef=${stopId}`

  const response = await fetch(url)
  const data = await response.json()

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  })
})
