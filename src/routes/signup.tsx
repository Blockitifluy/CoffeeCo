import { Component } from "solid-js";
import AuthComponent, { Input } from "../components/auth";
import { NewUser, UserLogin } from "../requests/user";
import {
	ADD_USER_ERROR,
	BASIC_STATUS_SUCCESS,
	BasicStatus,
	FORM_NOT_FILLED,
	LOGIN_FAILED
} from "../common";

const Submit: Input.AuthSubmit = async Inputs => {
	const handle = Inputs.get("Handle"),
		password = Inputs.get("Password"),
		email = Inputs.get("Email");

	if (!handle || !password || !email) return FORM_NOT_FILLED;

	try {
		const Res = await NewUser(handle, password, email);
		if (!Res.ok) return ADD_USER_ERROR;

		const LoginRes = await UserLogin(handle, password),
			resultStatus = LoginRes.ok ? BASIC_STATUS_SUCCESS : LOGIN_FAILED;

		return resultStatus;
	} catch {
		return new BasicStatus("Not Connected", false);
	}
};

const Inputs: Input.AuthInput[] = [
	new Input.AuthInput("Handle", Input.AuthPlaceholder.username, false, 24),
	new Input.AuthInput("Email", Input.AuthPlaceholder.email, false),
	new Input.AuthInput("Password", Input.AuthPlaceholder.newPassword, true)
];

const AuthPage: Input.AuthProps = {
	title: "Signup",
	subtitle: "Stay updated on The World",
	confirmText: "Sign up",
	Inputs: Inputs,
	Submit: Submit
};

const SignupPage: Component = () => {
	return <AuthComponent page={AuthPage} />;
};

export default SignupPage;