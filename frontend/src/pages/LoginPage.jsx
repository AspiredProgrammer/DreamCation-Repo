import React, { useState } from "react";
import { Link } from "react-router-dom";

import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";

const LoginPage = () => {
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
						<h1 className="main-title">Login</h1>
						<Link
							className="btn-secondary"
							to="/register"
							style={{
								textDecoration: "none",
								fontWeight: "bold",
								fontSize: "16px",
							}}
						>
							Not registered? Click here to register!
						</Link>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default LoginPage;
