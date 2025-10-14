import React, { useState } from "react";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useItinerary } from "../contexts/ItineraryContext";
import "../Styles/MainStyles.css";

const AIRLINE_NAMES = {
  UA: "United Airlines",
  WS: "WestJet",
  AS: "Alaska Airlines",
  AC: "Air Canada",
  AA: "American Airlines",
  DL: "Delta Air Lines",
  // we can add more but these are what i saw most
};

const airlineName = (code) => AIRLINE_NAMES[code] || code;

function formatDateTime(s) {
  if (!s) return "";
  return new Date(s).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function FlightsPage() {
  const { addToItinerary, isItemInItinerary } = useItinerary();
  const [form, setForm] = useState({
    origin: "YYZ",
    dest: "LAX",
    date: "",
    adults: 1,
  });
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddToItinerary = async (flightOffer) => {
    const it = flightOffer.itineraries?.[0];
    const segs = it?.segments || [];
    const first = segs[0];
    const last = segs[segs.length - 1];
    const price = flightOffer.price?.total;

    // Create a unique ID for this flight offer
    const itemId = `${first?.departure?.iataCode}-${last?.arrival?.iataCode}-${first?.departure?.at}-${flightOffer.id || Math.random()}`;

    // Prepare flight data for itinerary
    const flightData = {
      itemType: 'flight',
      itemId: itemId,
      itemData: {
        name: `${airlineName(first?.carrierCode)} ${first?.departure?.iataCode} → ${last?.arrival?.iataCode}`,
        airline: airlineName(first?.carrierCode),
        route: `${first?.departure?.iataCode} → ${last?.arrival?.iataCode}`,
        departure: first?.departure?.at,
        arrival: last?.arrival?.at,
        stops: Math.max(0, segs.length - 1),
        segments: segs.map(seg => ({
          departure: seg.departure,
          arrival: seg.arrival,
          carrierCode: seg.carrierCode,
          aircraft: seg.aircraft
        })),
        passengers: form.adults,
        searchDate: form.date,
        origin: form.origin,
        destination: form.dest,
        price: parseFloat(price)
      },
      date: form.date || null,
      time: first?.departure?.at ? new Date(first.departure.at).toTimeString().split(' ')[0] : null,
      notes: ""
    };

    await addToItinerary(flightData);
  };

  async function search(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOffers([]);
    try {
      const res = await fetch(
        `/api/flights?origin=${form.origin}&dest=${form.dest}&date=${form.date}&adults=${form.adults}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setOffers(data.data || []);
    } catch (e) {
      setError(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="homepage">
      <NavBar />
      <section className="main-box flights-page">
        <div className="content">
          <h1 className="main-title">
            Find Your <span className="highlight">Perfect Flight</span>
          </h1>
          <p className="subtitle">
            Search for flights with ease and start your next journey.
          </p>

          <div className="flights-layout">
            <div className="search-column">
              <form className="search-form" onSubmit={search}>
                <div className="form-group">
                  <label htmlFor="origin">Origin</label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={form.origin}
                    onChange={onChange}
                    placeholder="e.g., YYZ"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dest">Destination</label>
                  <input
                    type="text"
                    id="dest"
                    name="dest"
                    value={form.dest}
                    onChange={onChange}
                    placeholder="e.g., LAX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Departure Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={form.date}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adults">Adults</label>
                  <input
                    type="number"
                    id="adults"
                    name="adults"
                    min="1"
                    value={form.adults}
                    onChange={onChange}
                  />
                </div>

                <button type="submit" className="search-button">
                  {loading ? "Searching…" : "🔍 Search Flights"}
                </button>

                {error && <p className="error-text">{error}</p>}
              </form>
            </div>

            <div className="results-column">
              {offers.length === 0 && !loading && (
                <p className="no-results">
                </p>
              )}

              {offers.map((o, i) => {
                const it = o.itineraries?.[0];
                const segs = it?.segments || [];
                const first = segs[0];
                const last = segs[segs.length - 1];
                const price = o.price?.total;

                const title = `${airlineName(first?.carrierCode)} ${first?.departure?.iataCode
                  } → ${last?.arrival?.iataCode}`;

                // Create unique ID for checking if item is in itinerary
                const itemId = `${first?.departure?.iataCode}-${last?.arrival?.iataCode}-${first?.departure?.at}-${o.id || Math.random()}`;
                const isInItinerary = isItemInItinerary('flight', itemId);

                return (
                  <div key={i} className="flight-card">
                    <div className="flight-title">{title}</div>
                    <p className="flight-meta">
                      {formatDateTime(first?.departure?.at)} →{" "}
                      {formatDateTime(last?.arrival?.at)}
                    </p>
                    <p className="flight-meta">
                      Stops: {Math.max(0, segs.length - 1)}
                    </p>
                    <p className="flight-price">${price}</p>
                    <button
                      onClick={() => handleAddToItinerary(o)}
                      disabled={isInItinerary}
                      className={`add-to-itinerary-btn ${isInItinerary ? 'in-itinerary' : ''}`}
                    >
                      {isInItinerary ? '✓ In Itinerary' : '📅 Add to Itinerary'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
