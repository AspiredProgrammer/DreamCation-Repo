import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useItinerary } from "../contexts/ItineraryContext";
import "../Styles/MainStyles.css";

function formatDateTime(dateString, timeString) {
    if (!dateString) return "No Date";

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    if (timeString) {
        const time = new Date(`2000-01-01T${timeString}`);
        const formattedTime = time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        return `${formattedDate} at ${formattedTime}`;
    }

    return formattedDate;
}

const ItineraryPage = () => {
    const {
        items,
        stats,
        loading,
        error,
        updateItineraryItem,
        removeFromItinerary,
        clearItinerary,
        getItemsGroupedByDate,
        isAuthenticated
    } = useItinerary();

    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({ date: "", time: "", notes: "" });

    const handleEdit = (item) => {
        setEditingItem(item.id);
        setEditForm({
            date: item.date || "",
            time: item.time || "",
            notes: item.notes || ""
        });
    };

    const handleSaveEdit = async () => {
        if (editingItem) {
            await updateItineraryItem(editingItem, editForm);
            setEditingItem(null);
            setEditForm({ date: "", time: "", notes: "" });
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditForm({ date: "", time: "", notes: "" });
    };

    const handleRemoveItem = async (itemId) => {
        if (window.confirm("Are you sure you want to remove this item from your itinerary?")) {
            await removeFromItinerary(itemId);
        }
    };

    const handleClearItinerary = async () => {
        if (window.confirm("Are you sure you want to clear your entire itinerary? This action cannot be undone.")) {
            await clearItinerary();
        }
    };

    // Remove authentication requirement - show local itinerary or empty state

    if (loading) {
        return (
            <div className="homepage">
                <NavBar />
                <section className="main-box">
                    <div className="content">
                        <h1 className="main-title">
                            <span className="highlight">My Itinerary</span>
                        </h1>
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading your itinerary...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="homepage">
                <NavBar />
                <section className="main-box">
                    <div className="content">
                        <h1 className="main-title">
                            <span className="highlight">My Itinerary</span>
                        </h1>
                        <div className="error-container">
                            <h2>Error Loading Itinerary</h2>
                            <p>{error}</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    const groupedItems = getItemsGroupedByDate();
    const sortedDates = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'No Date') return 1;
        if (b === 'No Date') return -1;
        return new Date(a) - new Date(b);
    });

    return (
        <div className="homepage">
            <NavBar />
            <section className="main-box">
                <div className="content">
                    <div className="itinerary-header">
                        <h1 className="main-title">
                            <span className="highlight">My Itinerary</span>
                        </h1>
                        {!isAuthenticated() && (
                            <div className="local-storage-notice">
                                <p><strong>Local Mode:</strong> Your itinerary is saved locally. <Link to="/login">Login</Link> to sync across devices.</p>
                            </div>
                        )}
                        <div className="itinerary-stats">
                            <div className="stat-item">
                                <span className="stat-number">{stats.flights}</span>
                                <span className="stat-label">Flights</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{stats.hotels}</span>
                                <span className="stat-label">Hotels</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{stats.attractions}</span>
                                <span className="stat-label">Attractions</span>
                            </div>
                            <div className="stat-item total">
                                <span className="stat-number">{stats.total}</span>
                                <span className="stat-label">Total</span>
                            </div>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="empty-itinerary">
                            <h2>Your itinerary is empty</h2>
                            <p>Start planning your dream vacation by adding flights, hotels, and attractions!</p>
                            {!isAuthenticated() && (
                                <div className="local-storage-notice">
                                    <p><strong>Note:</strong> Your itinerary is saved locally. <Link to="/login">Login</Link> to sync across devices.</p>
                                </div>
                            )}
                            <div className="empty-itinerary-actions">
                                <Link to="/flights" className="btn btn-primary">
                                    Browse Flights
                                </Link>
                                <Link to="/hotels" className="btn btn-secondary">
                                    Browse Hotels
                                </Link>
                                <Link to="/attractions" className="btn btn-secondary">
                                    Browse Attractions
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="itinerary-content">
                            <div className="itinerary-actions">
                                <button
                                    onClick={handleClearItinerary}
                                    className="clear-itinerary-btn"
                                >
                                    Clear Itinerary
                                </button>
                            </div>

                            <div className="itinerary-timeline">
                                {sortedDates.map((date) => (
                                    <div key={date} className="timeline-date">
                                        <h3 className="timeline-date-header">{date}</h3>
                                        <div className="timeline-items">
                                            {groupedItems[date]
                                                .sort((a, b) => {
                                                    if (a.time && b.time) {
                                                        return a.time.localeCompare(b.time);
                                                    }
                                                    if (a.time && !b.time) return -1;
                                                    if (!a.time && b.time) return 1;
                                                    return 0;
                                                })
                                                .map((item) => (
                                                    <div key={item.id} className="timeline-item">
                                                        <div className="timeline-icon">
                                                            {item.item_type === 'flight' && '✈️'}
                                                            {item.item_type === 'hotel' && '🏨'}
                                                            {item.item_type === 'attraction' && '🎯'}
                                                        </div>
                                                        <div className="timeline-content">
                                                            <div className="timeline-header">
                                                                <h4 className="item-title">
                                                                    {item.item_data.name || item.item_data.route || 'Untitled Item'}
                                                                </h4>
                                                                <div className="timeline-actions">
                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="edit-btn"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRemoveItem(item.id)}
                                                                        className="remove-btn"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {editingItem === item.id ? (
                                                                <div className="edit-form">
                                                                    <div className="form-group">
                                                                        <label>Date:</label>
                                                                        <input
                                                                            type="date"
                                                                            value={editForm.date}
                                                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label>Time:</label>
                                                                        <input
                                                                            type="time"
                                                                            value={editForm.time}
                                                                            onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label>Notes:</label>
                                                                        <textarea
                                                                            value={editForm.notes}
                                                                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                                                            placeholder="Add notes about this item..."
                                                                            rows="3"
                                                                        />
                                                                    </div>
                                                                    <div className="edit-actions">
                                                                        <button onClick={handleSaveEdit} className="save-btn">
                                                                            Save
                                                                        </button>
                                                                        <button onClick={handleCancelEdit} className="cancel-btn">
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="timeline-details">
                                                                    <p className="timeline-time">
                                                                        {formatDateTime(item.date, item.time)}
                                                                    </p>

                                                                    {item.item_type === 'flight' && (
                                                                        <div className="flight-details">
                                                                            <p><strong>Airline:</strong> {item.item_data.airline}</p>
                                                                            <p><strong>Route:</strong> {item.item_data.route}</p>
                                                                            {item.item_data.departure && (
                                                                                <p><strong>Departure:</strong> {new Date(item.item_data.departure).toLocaleString()}</p>
                                                                            )}
                                                                            {item.item_data.arrival && (
                                                                                <p><strong>Arrival:</strong> {new Date(item.item_data.arrival).toLocaleString()}</p>
                                                                            )}
                                                                            <p><strong>Stops:</strong> {item.item_data.stops}</p>
                                                                        </div>
                                                                    )}

                                                                    {item.item_type === 'hotel' && (
                                                                        <div className="hotel-details">
                                                                            <p><strong>Location:</strong> {item.item_data.vicinity}</p>
                                                                            <p><strong>City:</strong> {item.item_data.searchCity}</p>
                                                                            {item.item_data.rating && (
                                                                                <p><strong>Rating:</strong> ⭐ {item.item_data.rating.toFixed(1)}</p>
                                                                            )}
                                                                            {item.item_data.url && (
                                                                                <a
                                                                                    href={item.item_data.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="hotel-link"
                                                                                >
                                                                                    View on Google Maps
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {item.item_type === 'attraction' && (
                                                                        <div className="attraction-details">
                                                                            <p><strong>Type:</strong> {item.item_data.type}</p>
                                                                            {item.item_data.price && (
                                                                                <p><strong>Price:</strong> ${item.item_data.price.amount}</p>
                                                                            )}
                                                                            {item.item_data.shortDescription && (
                                                                                <p><strong>Description:</strong> {item.item_data.shortDescription}</p>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {item.notes && (
                                                                        <div className="item-notes">
                                                                            <p><strong>Notes:</strong> {item.notes}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
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
};

export default ItineraryPage;
