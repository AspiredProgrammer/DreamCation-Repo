import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer-content">
					<div className="footer-section">
						<h3>DreamCation</h3>
						<p>Curate your travel plans, one destination at a time.</p>
					</div>
					<div className="footer-section">
						<h4>Quick Links</h4>
						<ul>
							<li>
								<Link to="/">Home</Link>
							</li>
							<li>
								<Link to="/hotels">Hotels</Link>
							</li>
							<li>
								<Link to="/account">Account</Link>
							</li>
						</ul>
					</div>
					<div className="footer-section">
						<h4>Support</h4>
						<ul>
							<li>
								<a href="#contact">Contact Us</a>
							</li>
							<li>
								<a href="#help">Help Center</a>
							</li>
							<li>
								<a href="#faq">FAQ</a>
							</li>
							<li>
								<a href="#terms">Terms & Conditions</a>
							</li>
						</ul>
					</div>
					<div className="footer-section">
						<h4>Follow Us</h4>
						<div className="social-links">
							<a href="#" className="social-link">
								📘
							</a>
							<a href="#" className="social-link">
								📷
							</a>
							<a href="#" className="social-link">
								🐦
							</a>
							<a href="#" className="social-link">
								📺
							</a>
						</div>
					</div>
				</div>
				<div className="footer-bottom">
					<p>&copy; 2024 DreamCation. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
