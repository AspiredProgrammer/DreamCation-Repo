import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/dreamcation-logo.png";

import { jwtDecode } from "jwt-decode";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("token") !== null;
  const token = isLoggedIn ? localStorage.getItem("token") : null;
  const decodedToken = token ? jwtDecode(token) : null;
  const scope = decodedToken ? decodedToken.scope : "";
  const isAuthorized = isLoggedIn && scope === "ADMIN";
  const isCustomer = isLoggedIn && scope === "CUSTOMER";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src={logo} width={60} height={40} alt="logo" />
          <h2>DreamCation</h2>
        </Link>
        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/hotels" className="nav-link">
            Hotels
          </Link>
          <Link to="/flights" className="nav-link">
            Flights
          </Link>
          <Link to="/attractions" className="nav-link">
            Attractions
          </Link>
          {!isCustomer && !isAuthorized && (
            <Link to="/register" className="nav-link">
              Register
            </Link>
          )}
          {isLoggedIn && (
            <>
              <Link to="/account">Account</Link>
              <button onClick={handleLogOut}>Logout</button>
            </>
          )}
        </div>
        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
