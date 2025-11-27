import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Accordion } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import "../Styles/FAQ.css";
// import "../Styles/MainStyles.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const SupportPage = () => {
	const token = localStorage.getItem("token");
	let decodedToken = null;
	let isAuthorized = false;

	if (token && token.split(".").length === 3) {
		try {
			decodedToken = jwtDecode(token);
			isAuthorized = decodedToken?.scope === "ADMIN";
		} catch (err) {
			console.error("Invalid token:", err.message);
			localStorage.removeItem("token"); // Remove invalid token
		}
	}

	const faqs = [
		{
			q: "What is DreamCation?",
			a: "DreamCation is an web-based itinerary website with various features you might see on other websites like TripAdvisor or iTravel however here it's altogether in one place.",
		},
		{
			q: "What is the team's goal?",
			a: "Our goal is to the address the need for a website that simplifies the travel planning and empowers travellers to make informed decisions and find the best available deals. Beyond planning, the platform fosters community engagement through reviews, comments, helping users exchange experiences and build a trusted travel network. The interface is designed to be visually appealing and easy to navigate, ensuring a smooth experience for both first-time visitors and seasoned travellers.",
		},
		{
			q: "What do we offer?",
			a: "We offer users the option to search for hotels, flights to specific cities and activities/attractions in those cities. We showcase the prices and allow users to see the locations on an actual map with the 'view on Google Maps' hyperlink. You can choose your mode of transportation and see the available offers.",
		},
		{
			q: "Why become a registered user on DreamCation?",
			a: "Registered users have the privlege to 'save' their travel planning research into an 'itinerary' where they can later view on their account page. You can view your dream plans and even share it with friends!",
		},
	];
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		console.log("ENDPOINT is:", process.env.REACT_APP_ENDPOINT);

		e.preventDefault();

		if (!message) {
			toast.error("Cannot submit empty field!", { position: "bottom-right" });
		}

		try {
			console.log(process.env);
			const response = await fetch(`/user/support`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(isAuthorized && token
						? { Authorization: `Bearer ${token}` }
						: {}),
				},
				body: JSON.stringify(message),
			});

			const data = await response.json();
			if (!response.ok) {
				toast.error("Error: " + data, { position: "top-right" });
			} else {
				toast.success("Message sent!", { position: "top-right" });

				setMessage("");
			}
		} catch (error) {
			console.error("Error registering user:", error);
			toast.error("Error registering user!", { position: "top-right" });
		}
	};

	const handleChange = (e) => {
		setMessage(e.target.value);
	};

	return (
		<div className="faqpage">
			<Navbar />
			<div className="main-box">
				<div className="inner-box">
					<div className="faq-section">
						<h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>
							Frequently Asked Questions
						</h1>

						<Accordion defaultActiveKey="0">
							{faqs.map((faq, index) => (
								<Accordion.Item key={index} eventKey={String(index)}>
									<Accordion.Header>{faq.q}</Accordion.Header>
									<Accordion.Body>{faq.a}</Accordion.Body>
								</Accordion.Item>
							))}
						</Accordion>

						<section>
							<h2 style={{ color: "white" }}>Support Form</h2>
							<p style={{ textDecoration: "italic", color: "white" }}>
								Have any questions or concerns? Want to share it with us? Submit
								your questions in the form below!
							</p>
						</section>

						<form onSubmit={handleSubmit} className="search-form">
							<div className="form-group">
								<input type="text" value={message} onChange={handleChange} />
							</div>

							<button type="submit" className="search-button">
								Complete registration
							</button>
						</form>
					</div>
				</div>
			</div>
			<Footer pos={"relative"} />
		</div>
	);
};
export default SupportPage;
