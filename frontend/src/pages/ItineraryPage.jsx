import React from "react";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useItinerary } from "../contexts/ItineraryContext";
import "../Styles/MainStyles.css";
import "../Styles/ItineraryPage.css";

function formatDateTime(dateString, timeString) {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    if (!timeString) return formattedDate;
    const time = new Date(`2000-01-01T${timeString}`);
    const formattedTime = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${formattedDate} at ${formattedTime}`;
}

export default function ItineraryPage() {
    const { items, stats, removeFromItinerary, getItemsGroupedByDate } = useItinerary();

    const grouped = getItemsGroupedByDate();
    const dates = Object.keys(grouped).sort((a, b) => {
        if (a === "No Date") return 1;
        if (b === "No Date") return -1;
        return new Date(a) - new Date(b);
    });

    return (
        <div className="homepage">
            <NavBar />
            <section className="main-box itinerary-page">
                <div className="content">
                    <div className="page-intro-card">
                        <h1 className="main-title">
                            <span className="highlight">My Itinerary</span>
                        </h1>
                        <p className="subtitle">Saved flights, hotels, and attractions</p>
                    </div>

                    {items.length === 0 ? (
                        <div className="itinerary-empty">
                            <div className="empty-card">
                                <div className="empty-emoji">🗂️</div>
                                <h2 className="empty-title">Your itinerary is empty</h2>
                                <p className="empty-subtitle">Start planning by saving flights, hotels, and attractions.</p>
                                <div className="empty-actions">
                                    <a href="/transportation" className="btn btn-primary">Browse Flights</a>
                                    <a href="/hotels" className="btn btn-secondary">Browse Hotels</a>
                                    <a href="/attractions" className="btn btn-secondary">Browse Attractions</a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="itinerary-content">
                            <div className="itinerary-stats" style={{ display: "flex", gap: 12, color: "#fff" }}>
                                <span>Flights: {stats.flights}</span>
                                <span>Hotels: {stats.hotels}</span>
                                <span>Attractions: {stats.attractions}</span>
                                <span>Total: {stats.total}</span>
                            </div>

                            <div className="itinerary-timeline" style={{ width: "100%", marginTop: 12 }}>
                                {dates.map((d) => (
                                    <div key={d} className="timeline-date">
                                        <h3 className="timeline-date-header">{d}</h3>
                                        <div className="timeline-items">
                                            {grouped[d].map((item) => (
                                                <div key={item.id} className="timeline-item flight-card">
                                                    <div className="timeline-content">
                                                        <div className="timeline-header">
                                                            <h4 className="item-title">
                                                                {item.item_type === "flight" && (item.item_data.route || "Flight")}
                                                                {item.item_type === "hotel" && (item.item_data.name || "Hotel")}
                                                                {item.item_type === "attraction" && (item.item_data.name || "Attraction")}
                                                            </h4>
                                                            <div className="timeline-actions">
                                                                <button className="btn btn-primary" onClick={() => removeFromItinerary(item.id)}>Remove</button>
                                                            </div>
                                                        </div>
                                                        <p className="timeline-time">{formatDateTime(item.date, item.time)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}


