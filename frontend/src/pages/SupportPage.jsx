import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Accordion, Card } from "react-bootstrap";
import "../Styles/FAQ.css";
import "../Styles/MainStyles.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const SupportPage = () => {
	const faqs = [
		{
			q: "What is DreamCation?",
			a: "Dreamy Goodies is an web-based itinerary website with various features you might see on other websites like TripAdvisor or iTravel however here it's altogether in one place.",
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

	return (
		<div className="index-container" style={{ overflow: "hidden" }}>
			<Navbar />
			<div className="main-box">
				<div className="faq-container">
					<div className="faq-section">
						<h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>
							Frequently Asked Questions
						</h1>

						<Accordion defaultActiveKey="0">
							{" "}
							{faqs.map((faq, index) => (
								<Card key={index}>
									<Accordion.Item eventKey={String(index)}>
										<Accordion.Header>{faq.q}</Accordion.Header>
										<Accordion.Body>{faq.a}</Accordion.Body>
									</Accordion.Item>
								</Card>
							))}
						</Accordion>
					</div>
				</div>
			</div>
			<Footer pos={"relative"} />
		</div>
	);
};
export default SupportPage;
