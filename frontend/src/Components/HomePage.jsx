import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import placeholder from "../images/placeholder.jpg";

const HomePage = () => {
  // const [searchParams, setSearchParams] = useSearchParams();
  const [city, setCity] = useState("");
  // const navigate = useNavigate();
  const handleKeyDown = (e) => {
    setCity(e.target.value)
  };



  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
     <h1>Welcome to DreamCation!</h1>
     <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
        onKeyDown={handleKeyDown}
        style={{ padding: "8px", marginRight: "10px" }}
      />
        <Link className="search-btn" to={`/hotels?city=${city}`}>Search</Link>

      {/* <button onClick={
        navigate({pathname: "hotels", search: })
        } 
        style={{ padding: "8px 12px" }}>
        Search
      </button> */}
      
      
      <div id="carousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-indicators">
              <button
                type="button"
                data-bs-target="#carousel"
                data-bs-slide-to="0"
                class="active"
                aria-current="true"
                aria-label="Slide 1"
              ></button>
              <button
                type="button"
                data-bs-target="#carousel"
                data-bs-slide-to="1"
                aria-label="Slide 2"
              ></button>
              <button
                type="button"
                data-bs-target="#carousel"
                data-bs-slide-to="2"
                aria-label="Slide 3"
              ></button>
            </div>
          <div class="carousel-inner">
            <div class="carousel-item active">
              <img
                id="carousel-img-1"
                src={placeholder}
                class="d-block w-100 carousel-set-img1"
                alt="Deal 1"
              />
            </div>
            <div class="carousel-item">
              <img
                id="carousel-img-2"
                src={placeholder}
                class="d-block w-100 carousel-set-img1"
                alt="Deal 2"
              />
            </div>
            <div class="carousel-item">
              <img
                id="carousel-img-3"
                src={placeholder}
                class="d-block w-100 carousel-set-img1"
                alt="Deal 3"
              />
            </div>
          </div>
          <button
            class="carousel-control-prev"
            type="button"
            data-bs-target="#carousel"
            data-bs-slide="prev"
          >
            <span
              class="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span style={{color: 'black'}} class="">Previous</span>
          </button>
          <button
            class="carousel-control-next"
            type="button"
            data-bs-target="#carousel"
            data-bs-slide="next"
          >
            <span
              class="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span style={{color: 'black'}} class="">Next</span>
          </button>
      </div>
    </div>
  );
};

export default HomePage;
