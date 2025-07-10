import React, { useEffect, useState } from "react";


// import "../Styles/HotelPage.css";
// TODO show 10 results then a button to show more
const HotelPage = () => {
  // const searchParams = new URLSearchParams(window.location.href);
  
  // const queriedCity = searchParams.get('city')
  const [city, setCity] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHotelsByCity = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/hotels?city=${city}`,
      );
      if (!response.ok) {
        throw new Error("City not found or server error");
      }

      const data = await response.json();
      setHotels(data || []);
    } catch (err) {
      console.error("Error:", err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchHotelsByCity();
    }
  };
// using use Effect, grab the city from the url and fetch hotel data with that data
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.href);
    console.log(searchParams)
    const queriedCity = searchParams.get('city')
    console.log(queriedCity)
    if (queriedCity !== ''){
      setCity(queriedCity);
      fetchHotelsByCity();
    }
  },[])


  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Hotel Finder</h1>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
        style={{ padding: "8px", marginRight: "10px" }}
        onKeyDown={handleKeyDown}
      />
      <button onClick={fetchHotelsByCity} style={{ padding: "8px 12px" }}>
        Search
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {hotels.map((hotel) => (
            <li
              key={hotel.place_id}
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <strong>{hotel.name}</strong>
              <br />
              {hotel.vicinity}
              <br />
              {hotel.url && (
                <a href={hotel.url} target="_blank" rel="noopener noreferrer">
                  View on Google Maps
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HotelPage;
