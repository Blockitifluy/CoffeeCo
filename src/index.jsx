/* @refresh reload */

// This project uses Github Octicons (oc)

import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import { Link, MetaProvider } from "@solidjs/meta";

import "./index.css";
import MainPage from "./routes/MainPage";
import AboutUs from "./routes/AboutUs";
import Profile from "./routes/Profile";
import AuthPage, { AuthType } from "./routes/Auth";
import ErrorUI, { Errors } from "./Libraries/ErrorUI";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
	);
}

const RouteElement = () => {
	const [ErrorSignal, setErrorSignal] = createSignal([]);

	return (
		<Errors.Provider value={[ErrorSignal, setErrorSignal]}>
			<MetaProvider>
				<Link
					rel='manifest'
					href='/manifest.json'
					crossorigin='use-credemtial'
				/>

				<Router>
					<Route path='/' component={MainPage} />
					<Route path='/users/:id' component={Profile} />
					<Route path='/about' component={AboutUs} />
					<Route
						path='/signup'
						component={<AuthPage Auth={AuthType.Signup} />}
					/>
					<Route path='/login' component={<AuthPage Auth={AuthType.Login} />} />
				</Router>

				<ErrorUI />
			</MetaProvider>
		</Errors.Provider>
	);
};

render(RouteElement, root);
