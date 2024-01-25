/* @refresh reload */

// This project uses Github Octicons (oc)

import { render } from "solid-js/web";
import Header from "./components/Header";
import { Router, Route, useParams } from "@solidjs/router";

import "./index.css";
import MainPage from "./Routes/MainPage";
import AboutUs from "./Routes/AboutUs";
import Profile from "./Routes/Profile";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
	);
}

const RouteElement = () => {
	return (
		<Router>
			<Route path='/' component={MainPage} />
			<Route path='/users/:id' component={Profile} />
			<Route path='/about' component={AboutUs} />
		</Router>
	);
};

render(RouteElement, root);
