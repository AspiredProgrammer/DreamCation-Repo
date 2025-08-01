import React, { useState } from "react";
import { Link } from "react-router-dom";

import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";

const AccountPage = () => {
	return (
		<div className="base">
			{/* <NavBar /> */}
			<div style={{ margin: "20px" }}>
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
