import { Component } from "solid-js";
import AuthComponent, { Input } from "../components/auth";
import { UserLogin } from "../requests/user";
import { BASIC_STATUS_SUCCESS, BasicStatus, FORM_NOT_FILLED } from "../common";

const Submit: Input.AuthSubmit = async Inputs => {
	const handle: string | undefined = Inputs.get("Handle"),
		password: string | undefined = Inputs.get("Password");

	if (!handle || !password) return FORM_NOT_FILLED;

	try {
		await UserLogin(handle, password);

		return BASIC_STATUS_SUCCESS;
	} catch (err) {
		console.error(err);

		return new BasicStatus((err as Error).message, false);
	}
};

const Inputs: Input.AuthInput[] = [
	new Input.AuthInput("Handle", Input.AuthPlaceholder.username, false, 24),
	new Input.AuthInput("Password", Input.AuthPlaceholder.newPassword, true)
];

const AuthPage: Input.AuthProps = {
	title: "Login",
	subtitle: "Stay updated on The World",
	confirmText: "Log in",
	Inputs: Inputs,
	Submit: Submit
};

const LoginPage: Component = () => {
	return <AuthComponent page={AuthPage} />;
};

export default LoginPage;
