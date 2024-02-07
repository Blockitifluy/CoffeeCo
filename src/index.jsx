/* @refresh reload */

// This project uses Github Octicons (oc)

import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import { Link, MetaProvider } from "@solidjs/meta";

import "./index.css";
import MainPage from "./routes/MainPage";
import AboutUs from "./routes/AboutUs";
import Profile from "./routes/Profile";
import Signin from "./routes/Signin";
import Login from "./routes/Login";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
	);
}

const RouteElement = () => {
	return (
		<MetaProvider>
			<Link rel='manifest' href='/manifest.json' crossorigin='use-credemtial' />
			<Router>
				<Route path='/' component={MainPage} />
				<Route path='/users/:id' component={Profile} />
				<Route path='/about' component={AboutUs} />
				<Route path='/signin' component={Signin} />
				<Route path='/login' component={Login} />
			</Router>
		</MetaProvider>
	);
};

render(RouteElement, root);
