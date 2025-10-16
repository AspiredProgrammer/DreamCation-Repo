import React, { useState } from "react";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/MainStyles.css";
import planeBG from "../assets/planebg.jpg";
import carBG from "../assets/carbg.jpeg";
import busBG from "../assets/busbg.jpg";



function getBookingUrl(airlineCode, origin, dest, departDate, returnDate, adults = 1) {
  // format date to DD/MM/YYYY for Air Canada
  const formatDate = (d) => {
    if (!d) return "";
    const dateObj = new Date(d);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}%2F${month}%2F${year}`;
  };

  // * Flights * //
  switch (airlineCode) {
    case "AC": // ✈ Air Canada
      const depart = formatDate(departDate);
      const ret = returnDate ? formatDate(returnDate) : "";
      const tripType = returnDate ? "RoundTrip" : "OneWay";
      return `https://www.aircanada.com/booking/ca/en/aco/search?org0=${origin}&dest0=${dest}&orgType0=A&destType0=A${
        returnDate
          ? `&org1=${dest}&dest1=${origin}&orgType1=A&destType1=A`
          : ""
      }&departureDate0=${depart}${
        returnDate ? `&departureDate1=${ret}` : ""
      }&adt=${adults}&yth=0&chd=0&inf=0&ins=0&marketCode=DOM&tripType=${tripType}&isFlexible=false`;

    case "AA": // 🇺🇸 American Airlines
      return `https://www.aa.com/booking/find-flights?origin=${origin}&destination=${dest}&departDate=${departDate}&returnDate=${returnDate || ""}`;

    case "DL": // 🛫 Delta Air Lines
      return `https://www.delta.com/flight-search/search?fromCity=${origin}&toCity=${dest}&departDate=${departDate}&returnDate=${returnDate || ""}`;

    case "UA": // 🛩 United Air Lines
      return `https://www.united.com/en/us/fsr/choose-flights?f=${origin}&t=${dest}&d=${departDate}&r=${returnDate || ""}`;

    case "WS": // 🇨🇦 WestJet
      return `https://www.westjet.com/shop/?adults=${adults}&children=0&infants=0&currency=CAD&lang=en-CA&origin=${origin}&destination=${dest}&outboundDate=${departDate}&returnDate=${returnDate || departDate}`;

    case "AS": // 🇺🇸 Alaska Airlines
      return `https://www.alaskaair.com/planbook/shopping?from=${origin}&to=${dest}&departDate=${departDate}&returnDate=${returnDate || ""}`;

    default:
      // fallback: Google Flights search
      return `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${dest}%20on%20${departDate}${
        returnDate ? `%20through%20${returnDate}` : ""
      }`;
  }
}




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
    returnDate: "",
    adults: 1,
    tripType: "round",
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
      <section
  className="main-box flights-page transition-bg"
  style={{
    backgroundImage:
      mode === "flights"
        ? `url(${planeBG})`
        : mode === "cars"
        ? `url(${carBG})`
        : `url(${busBG})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    transition: "background-image 0.5s ease-in-out",
  }}
>
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

            <div className="form-group trip-type-toggle">
  <label>Trip Type:</label>
  <div className="trip-type-buttons">
    <button
      type="button"
      className={form.tripType === "oneway" ? "active" : ""}
      onClick={() => setForm({ ...form, tripType: "oneway", returnDate: "" })}
    >
      One Way
    </button>
    <button
      type="button"
      className={form.tripType === "round" ? "active" : ""}
      onClick={() => setForm({ ...form, tripType: "round" })}
    >
      Round Trip
    </button>
  </div>
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
            
            {form.tripType === "round" && (
  <div className="form-group">
    <label htmlFor="returnDate">Return Date</label>
    <input
      type="date"
      id="returnDate"
      name="returnDate"
      value={form.returnDate || ""}
      onChange={onChange}
    />
  </div>
)}



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
              {loading ? "Searching…" : "Search Flights"}
            </button>

            {error && <p className="error-text">{error}</p>}
          </form>
        </div>

        {/* Right: Results */}
        <div className="results-column">
          {offers.length === 0 && !loading && (
            <p className="no-results"> </p>
          )}

          {offers.map((o, i) => {
            const it = o.itineraries?.[0];
            const segs = it?.segments || [];
            const first = segs[0];
            const last = segs[segs.length - 1];
            const price = o.price?.total;
            const airlineCode = first?.carrierCode;

            const bookingUrl = getBookingUrl(
              airlineCode,
              first?.departure?.iataCode,
              last?.arrival?.iataCode,
              form.date,
              form.tripType === "round" ? form.returnDate : "",
              form.adults
            );
            
            
            
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
<div className="car-rentals">
  <form
    className="search-form"
    onSubmit={async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      setOffers([]);
      try {
        const res = await fetch(
          `/api/cars?origin=${form.origin}&dest=${form.dest}&pickupDate=${form.date}&returnDate=${form.returnDate}&driversAge=25`
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setOffers(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }}
  >
    <div className="form-group">
      <label htmlFor="origin">Pickup Location Code</label>
      <input
        id="origin"
        name="origin"
        value={form.origin}
        onChange={onChange}
        placeholder="e.g. YYZ"
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="dest">Drop-Off Location Code</label>
      <input
        id="dest"
        name="dest"
        value={form.dest}
        onChange={onChange}
        placeholder="e.g. LAX"
      />
    </div>

    <div className="form-group">
      <label htmlFor="date">Pickup Date</label>
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
      <label htmlFor="returnDate">Return Date</label>
      <input
        type="date"
        id="returnDate"
        name="returnDate"
        value={form.returnDate}
        onChange={onChange}
      />
    </div>

    <button type="submit" className="search-button">
      {loading ? "Searching…" : "🚗 Search Cars"}
    </button>

    {error && <p className="error-text">{error}</p>}
  </form>

  <div className="results-column">
    {offers.length === 0 && !loading && <p></p>}
    {offers.map((car, i) => (
      <div key={i} className="car-card">
        <h3>{car.vehicle?.model}</h3>
        <p>{car.vehicle?.make} – {car.vehicle?.category}</p>
        <p>Price: ${car.price?.total}</p>
        <p>Pickup: {car.pickup?.location?.code}</p>
        <p>Drop-Off: {car.dropOff?.location?.code}</p>
      </div>
    ))}
  </div>
</div>
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