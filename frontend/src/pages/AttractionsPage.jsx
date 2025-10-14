import React, { useMemo, useState } from "react";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useItinerary } from "../contexts/ItineraryContext";
import "../Styles/MainStyles.css";

const CLIENT_PAGE_SIZE = 4;      // fixed visible page size
const FETCH_PAGE_SIZE = 200;     // request plenty once, then paginate locally

const ActivitiesPage = () => {
  const { addToItinerary, isItemInItinerary } = useItinerary();
  // Left form inputs
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(5);                 // km
  const [category, setCategory] = useState("RESTAURANT");  // default: Food & Drink
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Data + UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allActivities, setAllActivities] = useState([]);  // full dataset from a single fetch
  const [meta, setMeta] = useState(null);                  // meta from server (optional display)
  const [page, setPage] = useState(1);                     // client page index (1-based)

  // Fetch once on submit; do NOT fetch again on Next/Prev.
  const searchActivities = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    setLoading(true);
    setError("");
    setAllActivities([]);
    setMeta(null);
    setPage(1);

    try {
      const qs = new URLSearchParams({
        city: city.trim(),
        radius: String(Number(radius) || 5),
        category: category || "",
        page: "1",
        pageSize: String(FETCH_PAGE_SIZE),     // ask backend for many results once
      });
      if (minPrice !== "") qs.append("minPrice", String(minPrice));
      if (maxPrice !== "") qs.append("maxPrice", String(maxPrice));

      const res = await fetch(`/api/activities/by-city?${qs.toString()}`);
      if (!res.ok) {
        const tx = await res.text();
        throw new Error(tx || "Search failed");
      }
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : [];
      setAllActivities(list);
      setMeta(json.meta || null);

      if (list.length === 0) setError("No activities found for this city / filter");
    } catch (err) {
      console.error("Activities error:", err);
      setError(err.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  // Client-side pagination slice
  const totalClientPages = useMemo(
    () => Math.max(1, Math.ceil(allActivities.length / CLIENT_PAGE_SIZE)),
    [allActivities.length]
  );

  const pageItems = useMemo(() => {
    const start = (page - 1) * CLIENT_PAGE_SIZE;
    return allActivities.slice(start, start + CLIENT_PAGE_SIZE);
  }, [allActivities, page]);

  const hasPrev = !loading && page > 1;
  const hasNext = !loading && page < totalClientPages;

  const onPrev = () => { if (hasPrev) setPage((p) => p - 1); };
  const onNext = () => { if (hasNext) setPage((p) => p + 1); };

  const formatPrice = (p) =>
    p?.amount && p?.currencyCode ? `${p.currencyCode} ${p.amount}` : null;

  const handleAddToItinerary = async (activity) => {
    // Create a unique ID for this attraction
    const itemId = `attraction-${activity.id}`;

    // Prepare attraction data for itinerary
    const attractionData = {
      itemType: 'attraction',
      itemId: itemId,
      itemData: {
        name: activity.name,
        shortDescription: activity.shortDescription,
        rating: activity.rating,
        price: activity.price,
        type: category,
        city: city,
        radius: radius,
        bookingLink: activity.bookingLink,
        pictures: activity.pictures
      },
      date: null, // Attractions don't have specific dates by default
      time: null,
      notes: ""
    };

    await addToItinerary(attractionData);
  };

  return (
    <div className="homepage">
      <NavBar />
      <section className="main-box activities-page">
        <div className="content">
          <h1 className="main-title">
            Explore <span className="highlight">Activities</span>
          </h1>
          <p className="subtitle">Find great food &amp; experiences by city.</p>

          <div className="activities-layout">
            {/* LEFT: Form */}
            <form className="search-form search-form-card" onSubmit={searchActivities}>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  placeholder="e.g., Toronto"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="radius">Radius (km)</label>
                <select
                  id="radius"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                >
                  <option value={1}>1 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={30}>30 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>

              {/* Category – default Food & Drink */}
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="RESTAURANT">Food &amp; Drink</option>
                  <option value="">All</option>
                  <option value="TOURS">Tours</option>
                  <option value="MUSEUM">Museum</option>
                  <option value="NIGHTLIFE">Nightlife</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="SIGHTS">Sights</option>
                </select>
              </div>

              {/* Price range */}
              <div className="form-group">
                <label>Price (min / max)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    type="number"
                    min="0"
                    placeholder="min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="search-button">
                {loading ? "Searching…" : "🔍 Search Activities"}
              </button>

              {error && <p className="error-text" style={{ marginTop: 8 }}>{error}</p>}
            </form>

            {/* RIGHT: Results + Client Pagination */}
            <div className="results-pane">
              {/* Header with count + pager (arrows hidden while loading) */}
              {allActivities.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ color: "#fff" }}>
                    {allActivities.length} result{allActivities.length === 1 ? "" : "s"} • Page {page} of {totalClientPages}
                  </div>

                  {!loading && (
                    <div style={{ display: "flex", gap: 8 }}>
                      {hasPrev && (
                        <button
                          type="button"
                          onClick={onPrev}
                          className="btn btn-secondary"
                          style={{ padding: "8px 12px" }}
                        >
                          ← Prev
                        </button>
                      )}
                      {hasNext && (
                        <button
                          type="button"
                          onClick={onNext}
                          className="btn btn-primary"
                          style={{ padding: "8px 12px" }}
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="results-column">
                {loading && <p style={{ color: "#fff" }}>Loading…</p>}

                {!loading && pageItems.map((act, i) => {
                  const img = Array.isArray(act.pictures) && act.pictures[0];
                  const priceStr = formatPrice(act.price);
                  const hasBooking =
                    typeof act.bookingLink === "string" &&
                    act.bookingLink.startsWith("http");

                  // Create unique ID for checking if item is in itinerary
                  const itemId = `attraction-${act.id}`;
                  const isInItinerary = isItemInItinerary('attraction', itemId);

                  return (
                    <div key={act.id || i} className="activity-card">
                      {img && (
                        <img
                          src={img}
                          alt={act.name || "Activity image"}
                          className="activity-img"
                          loading="lazy"
                        />
                      )}
                      <h3 className="activity-title">
                        {act.name || "Untitled Activity"}
                      </h3>

                      {act.shortDescription && (
                        <div
                          className="activity-desc"
                          dangerouslySetInnerHTML={{ __html: act.shortDescription }}
                        />
                      )}

                      <div className="activity-meta">
                        {act.rating != null && <span>⭐ {act.rating}</span>}
                        {priceStr && <span className="activity-price">{priceStr}</span>}
                      </div>

                      <div className="activity-actions">
                        {hasBooking ? (
                          <a
                            href={act.bookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="booking-button"
                          >
                            Book Now
                          </a>
                        ) : (
                          <button className="booking-button" disabled>
                            Book Unavailable
                          </button>
                        )}
                        <button
                          onClick={() => handleAddToItinerary(act)}
                          disabled={isInItinerary}
                          className={`add-to-itinerary-btn ${isInItinerary ? 'in-itinerary' : ''}`}
                        >
                          {isInItinerary ? '✓ In Itinerary' : '📅 Add to Itinerary'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {!loading && allActivities.length === 0 && !error && (
                  <p style={{ color: "#fff" }}>Start by searching a city.</p>
                )}
              </div>

              {/* Footer pager (arrows hidden while loading) */}
              {!loading && allActivities.length > 0 && totalClientPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                  {hasPrev && (
                    <button
                      type="button"
                      onClick={onPrev}
                      className="btn btn-secondary"
                      style={{ padding: "10px 14px" }}
                    >
                      ← Prev
                    </button>
                  )}
                  <span style={{ color: "#fff", alignSelf: "center" }}>
                    Page {page} / {totalClientPages}
                  </span>
                  {hasNext && (
                    <button
                      type="button"
                      onClick={onNext}
                      className="btn btn-primary"
                      style={{ padding: "10px 14px" }}
                    >
                      Next →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ActivitiesPage;
