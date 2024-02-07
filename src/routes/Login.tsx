import { Component } from "solid-js";
import UI, { AuthType } from "./Auth";

const Login: Component = () => {
	return <UI Auth={AuthType.Login} />;
};

export default Login;
