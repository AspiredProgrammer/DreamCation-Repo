import React, { useState } from "react";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/MainStyles.css";

const AIRLINE_NAMES = {
  UA: "United Airlines",
  WS: "WestJet",
  AS: "Alaska Airlines",
  AC: "Air Canada",
  AA: "American Airlines",
  DL: "Delta Air Lines",
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

export default function TransportationPage() {
  const [mode, setMode] = useState("flights");
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

  async function searchFlights(e) {
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
            Choose Your <span className="highlight">Transportation</span>
          </h1>
          <p className="subtitle">
            Find the best way to reach your destination through flights, cars, or transit.
          </p>

          {/* Mode Tabs */}
          <div className="mode-tabs">
            <button
              className={mode === "flights" ? "active" : ""}
              onClick={() => setMode("flights")}
            >
              Flights
            </button>
            <button
              className={mode === "cars" ? "active" : ""}
              onClick={() => setMode("cars")}
            >
              Car Rentals
            </button>
            <button
              className={mode === "transit" ? "active" : ""}
              onClick={() => setMode("transit")}
            >
              Public Transit
            </button>
          </div>

          {/* Flights Search */}
          {/* Flights Search */}
{mode === "flights" && (
  <div className="flights-layout">
    {/* Left: Search Form */}
    <div className="search-column">
      <form className="search-form" onSubmit={searchFlights}>
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

    {/* Right: Results */}
    <div className="results-column">
      {offers.length === 0 && !loading && (
        <p className="no-results">No results yet.</p>
      )}

      {offers.map((o, i) => {
        const it = o.itineraries?.[0];
        const segs = it?.segments || [];
        const first = segs[0];
        const last = segs[segs.length - 1];
        const price = o.price?.total;
        const airlineCode = first?.carrierCode;

        // booking link
        const bookingUrl = `https://www.google.com/flights?hl=en#flt=${first?.departure?.iataCode}.${last?.arrival?.iataCode}.${form.date};c:USD;e:1;sd:1;t:f`;

        return (
          <div key={i} className="flight-card enhanced">
            <div className="flight-info">
              <div className="airline-logo">
                <img
                  src={`https://pics.avs.io/80/40/${airlineCode}.png`}
                  alt={airlineName(airlineCode)}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
              <div className="flight-route">
                <strong>
                  {first?.departure?.iataCode} → {last?.arrival?.iataCode}
                </strong>
                <p>
                  {formatDateTime(first?.departure?.at)} →{" "}
                  {formatDateTime(last?.arrival?.at)}
                </p>
                <p>Stops: {Math.max(0, segs.length - 1)}</p>
              </div>
            </div>
            <div className="flight-price-section">
              <p className="flight-price">${price}</p>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="book-button"
              >
                Book Now →
              </a>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}


          {/* Car Rentals */}
          {mode === "cars" && (
            <div className="alt-section">

            </div>
          )}

          {/* Public Transit */}
          {mode === "transit" && (
            <div className="alt-section">
              
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
