import { Component } from "solid-js";
import UI, { AuthType } from "./Auth";

const Signup: Component = () => {
	return <UI Auth={AuthType.Signup} />;
};

export default Signup;
