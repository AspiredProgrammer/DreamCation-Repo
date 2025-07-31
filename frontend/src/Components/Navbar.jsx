import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/dreamcation-logo.png";

const NavBar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<nav className="navbar">
			<div className="nav-container">
				<div className="nav-logo">
					<img src={logo} width={60} height={40} alt="logo" />
					<h2>DreamCation</h2>
				</div>
				<div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
					<Link to="/" className="nav-link">
						Home
					</Link>
					<Link to="/hotels" className="nav-link">
						Hotels
					</Link>
					<Link to="/account" className="nav-link">
						Account
					</Link>
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
