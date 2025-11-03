import React, { useState, useEffect } from "react";

const ErrorPage = () => {
	return (
		<main class="bl_page404">
			<h1>Error 404. The page does not exist</h1>
			<p>
				Sorry! The page you are looking for can not be found. You may not have
				access to this page. Go to the main page.
			</p>
			<div class="bl_page404__wrapper">
				<img
					src="https://github.com/BlackStar1991/Pictures-for-sharing-/blob/master/404/bigBoom/cloud_warmcasino.png?raw=true"
					alt="cloud_warmcasino.png"
				/>
				<div class="bl_page404__el1"></div>
				<div class="bl_page404__el2"></div>
				<div class="bl_page404__el3"></div>
				<a class="bl_page404__link" href="/">
					go home
				</a>
			</div>
		</main>
	);
};

export default ErrorPage;
