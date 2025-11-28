console.log(" transitRoutes.js loaded");
// api-gateway/src/transitRoutes.js
const express = require("express");
const axios = require("axios");

const router = express.Router();

// make sure this matches your .env key name:
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;



// GET /api/transit/bus-route?origin=...&destination=...
router.get("/bus-route", async (req, res) => {
  console.log("🚌 /api/transit/bus-route called with:", req.query);

  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res
        .status(400)
        .json({ error: "origin and destination are required" });
    }

    if (!GOOGLE_KEY) {
      console.error("❌ GOOGLE_API_KEY is missing from env");
      return res.status(500).json({ error: "Server missing Google API key" });
    }

    const url = "https://maps.googleapis.com/maps/api/directions/json";

    const response = await axios.get(url, {
      params: {
        origin,
        destination,
        mode: "transit",
        transit_mode: "bus",
        key: GOOGLE_KEY,
      },
    });

    const data = response.data;
    console.log("📦 Google Directions status:", data.status);

    if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
      console.error("Google Directions error:", data);
      return res.status(502).json({
        error: "Failed to get route from Google",
        status: data.status,
        message: data.error_message,
      });
    }

    const leg = data.routes[0].legs[0];

    const summary = {
      origin: leg.start_address,
      destination: leg.end_address,
      duration: leg.duration?.text,
      distance: leg.distance?.text,
      steps: leg.steps.map((step) => {
        const base = {
          travelMode: step.travel_mode,
          instruction: step.html_instructions,
          duration: step.duration?.text,
          distance: step.distance?.text,
        };

        if (step.travel_mode === "TRANSIT" && step.transit_details) {
          const td = step.transit_details;
          base.transit = {
            lineName: td.line?.short_name || td.line?.name,
            vehicle: td.line?.vehicle?.type,
            departureStop: td.departure_stop?.name,
            arrivalStop: td.arrival_stop?.name,
            numStops: td.num_stops,
            departureTime: td.departure_time?.text,
            arrivalTime: td.arrival_time?.text,
          };
        }

        return base;
      }),
    };

    res.json({ route: summary });
  } catch (err) {
    console.error("TRANSIT API ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch transit route" });
  }
});

// export only the router
module.exports = router;
