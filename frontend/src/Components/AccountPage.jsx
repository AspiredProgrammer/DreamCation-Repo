import React, { useState } from "react";
import { Link } from "react-router-dom";
// import "../Styles/HomePage.css";
import NavBar from "./Navbar";
import Footer from "./Footer";

const AccountPage = () => {
	return (
		<div className="base">
			<div style={{ marginBottom: "20px" }}>
				<Link
					to="/"
					style={{
						textDecoration: "none",
						color: "#667eea",
						fontWeight: "bold",
						fontSize: "16px",
					}}
				>
					← Back to Home
				</Link>
			</div>
			<NavBar />
			<section id="home" className="main-box">
				<div className="content">
					<div>
						<h1 className="main-title">My Account</h1>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default AccountPage;
