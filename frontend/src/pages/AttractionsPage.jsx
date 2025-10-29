import React, { useMemo, useState } from "react";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/Activities.css";
import { useItinerary } from "../contexts/ItineraryContext";

const CLIENT_PAGE_SIZE = 4;
const FETCH_PAGE_SIZE = 50;

const ActivitiesPage = () => {
  const { addToItinerary } = useItinerary();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [mode, setMode] = useState("events");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allActivities, setAllActivities] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [openIndex, setOpenIndex] = useState(null);

  // ---------- Fetch PredictHQ Events ----------
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
        q: query || "",
        category: category || "",
        page: "1",
        pageSize: String(FETCH_PAGE_SIZE),
        ...(onlyFree ? { onlyFree: "true" } : {}),
      });

      if (eventDate) qs.append("eventDate", eventDate);

      const res = await fetch(`/api/activities/by-city?${qs.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();

      const list = Array.isArray(json.data) ? json.data : [];
      setAllActivities(list);
      setMeta(json.meta || null);

      if (list.length === 0)
        setError("No events found for this city or filter");
    } catch (err) {
      console.error("Activities error:", err);
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Fetch Google Places ----------
  const searchPlaces = async (e) => {
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
        type: category || "restaurant",
        page: "1",
        pageSize: String(FETCH_PAGE_SIZE),
      });

      const res = await fetch(`/api/places/by-city?${qs.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();

      const list = Array.isArray(json.data) ? json.data : [];
      setAllActivities(list);
      setMeta(json.meta || null);

      if (list.length === 0)
        setError("No places found for this city or filter");
    } catch (err) {
      console.error("Places error:", err);
      setError(err.message || "Failed to fetch places");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Pagination ----------
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
  const onPrev = () => hasPrev && setPage((p) => p - 1);
  const onNext = () => hasNext && setPage((p) => p + 1);

  return (
    <div className="homepage">
      <NavBar />

      {/* --- Title Section --- */}
    

      {/* --- Main Search/Results Section --- */}
      <section className={`activities-page ${mode}`}>
          <section className="n"
      >
        <h1 className="main-title ">
          Discover The Perfect <br />
          <span className="highlight">Activity to do While You Travel</span>
        </h1>
        <p className="subtitle">
          Explore breathtaking experiences, discover local events, and plan your next adventure.
        </p>
      </section>
        <div className="activities-layout">
          {/* LEFT FORM */}
          <form
            className="search-form search-form-card"
            onSubmit={mode === "events" ? searchActivities : searchPlaces}
          >
            <div className="tab-toggle">
              <button
                className={mode === "events" ? "active-tab" : ""}
                onClick={() => setMode("events")}
              >
                Events
              </button>
              <button
                className={mode === "places" ? "active-tab" : ""}
                onClick={() => setMode("places")}
              >
                Places
              </button>
            </div>

            <h3 className="form-title">
              {mode === "events"
                ? "Refine Your Event Search"
                : "Find Restaurants & Attractions"}
            </h3>

            <div className="form-group">
              <label htmlFor="city" style={{ color: "black" }}>
                City
              </label>
              <input
                id="city"
                type="text"
                placeholder="e.g., Toronto"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={{
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #ccc",
                  color: "#000",
                }}
              />
            </div>

            {mode === "events" ? (
              <>
                <div className="form-group">
                  <label htmlFor="category" style={{ color: "black" }}>
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ backgroundColor: "#f8f8f8", color: "#000" }}
                  >
                    <option value="">All</option>
                    <option value="academic">Academic</option>
                    <option value="community">Community</option>
                    <option value="concerts">Concerts</option>
                    <option value="conferences">Conferences</option>
                    <option value="expos">Expos</option>
                    <option value="festivals">Festivals</option>
                    <option value="performing-arts">Performing Arts</option>
                    <option value="politics">Politics</option>
                    <option value="sports">Sports</option>
                    <option value="public-holidays">Public Holidays</option>
                    <option value="school-holidays">School Holidays</option>
                    <option value="severe-weather">Severe Weather</option>
                    <option value="disasters">Disasters</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="eventDate" style={{ color: "black" }}>
                    Event Date (optional)
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{
                      backgroundColor: "#f8f8f8",
                      border: "1px solid #ccc",
                      color: "#000",
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="query" style={{ color: "black" }}>
                    Keyword
                  </label>
                  <input
                    id="query"
                    type="text"
                    placeholder="e.g., festival, meetup, workshop"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                      backgroundColor: "#f8f8f8",
                      border: "1px solid #ccc",
                      color: "#000",
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label htmlFor="category" style={{ color: "black" }}>
                  Type of Place
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ backgroundColor: "#f8f8f8", color: "#000" }}
                >
                  <option value="restaurant">Restaurants</option>
                  <option value="cafe">Cafes</option>
                  <option value="bar">Bars</option>
                  <option value="tourist_attraction">Attractions</option>
                  <option value="museum">Museums</option>
                </select>
              </div>
            )}

            <button type="submit" className="search-button">
              {loading
                ? "Searching…"
                : mode === "events"
                  ? "🔍 Search Events"
                  : "🔍 Search Places"}
            </button>
            {error && <p className="error-text">{error}</p>}
          </form>

          {/* RIGHT RESULTS PANEL */}
          <div className="results-pane">
            {loading && <p className="loading">Loading…</p>}
            {!loading && pageItems.length === 0 && !error && (
              <p className="no-results2">Start by searching for a city.</p>
            )}

            {/* RESULTS */}
            <div className="results-column">
              {pageItems.map((item, i) => (
                <div key={item.id || i} className="activity-card-simple">
                  {item.image || item.photo ? (
                    <img
                      src={item.image || item.photo}
                      alt={item.name}
                      className="activity-img-simple"
                      loading="lazy"
                    />
                  ) : null}

                  <div className="activity-title-box">
                    <h4>{item.name}</h4>
                    <button
                      className="info-btn"
                      onClick={() => setOpenIndex(i)}
                    >
                      More Info
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ marginLeft: 8 }}
                      onClick={() => addToItinerary({
                        itemType: 'attraction',
                        itemId: item.id || `${item.name}-${i}`,
                        itemData: {
                          name: item.name,
                          type: item.type,
                          shortDescription: item.shortDescription,
                          image: item.image || item.photo,
                          url: item.url || item.mapsUrl || item.officialUrl,
                        },
                      })}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {!loading && allActivities.length > 0 && (
              <div className="pager">
                {hasPrev && (
                  <button onClick={onPrev} className="btn btn-secondary">
                    ← Prev
                  </button>
                )}
                <span>
                  Page {page} / {totalClientPages}
                </span>
                {hasNext && (
                  <button onClick={onNext} className="btn btn-primary">
                    Next →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {openIndex !== null && (
        <div className="activity-modal" onClick={() => setOpenIndex(null)}>
          <div
            className="activity-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="close-btn" onClick={() => setOpenIndex(null)}>
              &times;
            </span>

            <h2>{pageItems[openIndex]?.name || "Untitled"}</h2>

            {pageItems[openIndex]?.image || pageItems[openIndex]?.photo ? (
              <img
                src={pageItems[openIndex].image || pageItems[openIndex].photo}
                alt={pageItems[openIndex].name}
                className="modal-img"
              />
            ) : (
              <div className="modal-img-placeholder">No Image Available</div>
            )}

            <p>
              {pageItems[openIndex]?.shortDescription ||
                "No additional details available."}
            </p>

            <div className="activity-meta">
              {pageItems[openIndex]?.startTime && (
                <span>
                  🕒{" "}
                  {new Date(
                    pageItems[openIndex].startTime
                  ).toLocaleString()}
                </span>
              )}
              {pageItems[openIndex]?.endTime && (
                <span>
                  ⏳ Ends:{" "}
                  {new Date(pageItems[openIndex].endTime).toLocaleString()}
                </span>
              )}
              {pageItems[openIndex]?.location && (
                <span>📍 {pageItems[openIndex].location}</span>
              )}
              {pageItems[openIndex]?.address && (
                <span>📍 {pageItems[openIndex].address}</span>
              )}
              {pageItems[openIndex]?.rating && (
                <span>⭐ {pageItems[openIndex].rating}</span>
              )}
            </div>

            {mode === "events" ? (
              pageItems[openIndex]?.url ? (
                <a
                  href={pageItems[openIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-btn"
                >
                  View Official Event Page
                </a>
              ) : (
                <button className="book-btn" disabled>
                  Link Unavailable
                </button>
              )
            ) : (
              <div className="dual-links">
                {pageItems[openIndex]?.officialUrl ? (
                  <a
                    href={pageItems[openIndex].officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="book-btn"
                  >
                    Visit Official Website
                  </a>
                ) : (
                  <button className="book-btn" disabled>
                    Website Unavailable
                  </button>
                )}

                {pageItems[openIndex]?.mapsUrl ? (
                  <a
                    href={pageItems[openIndex].mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="book-btn secondary"
                  >
                    🗺️ View on Google Maps
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ActivitiesPage;
