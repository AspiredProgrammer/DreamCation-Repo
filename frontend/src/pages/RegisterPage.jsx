import React, { useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const RegisterPage = () => {
	const [errors, setErrors] = useState([]);
	const [msg, setMsg] = useState("");

	const isLoggedIn = localStorage.getItem("token") !== null;
	const token = isLoggedIn ? localStorage.getItem("token") : null;
	const decodedToken = token ? jwtDecode(token) : null;
	const scope = decodedToken ? decodedToken.scope : "";
	const isAuthorized = isLoggedIn && scope === "ADMIN";

	const [form, setForm] = useState({
		f_name: "",
		l_name: "",
		username: "",
		password: "",
		email: "",
		phoneNum: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		const fieldErrors = [];
		if (!form.f_name) {
			fieldErrors.push("First name is required");
		}
		if (!form.l_name) {
			fieldErrors.push("Last name is required");
		}
		if (!form.username) {
			fieldErrors.push("Username is required");
		}
		if (!form.password) {
			fieldErrors.push("Password is required");
		}
		if (!form.email) {
			fieldErrors.push("Email is required");
		}
		if (!form.phoneNum) {
			fieldErrors.push("Phone number is required");
		}
		if (!form.confirm_password) {
			fieldErrors.push("Confirm password is required");
		}
		if (form.password !== form.confirm_password) {
			fieldErrors.push("Password and Confirm password must be the same");
		}

		if (fieldErrors.length > 0) {
			setErrors(fieldErrors.map((msg, index) => ({ id: index, msg })));
		}
		return;
	};

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
						<h1 className="main-title">Registration</h1>
						<Link
							className="btn-secondary"
							to="/login"
							style={{
								textDecoration: "none",
								fontWeight: "bold",
								fontSize: "16px",
							}}
						>
							Already registered? Click here to log in!
						</Link>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default RegisterPage;
