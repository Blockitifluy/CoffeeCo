import { Component, Setter, createSignal, JSX } from "solid-js";
import logo from "../logo.png";
import {
	HIDE_RESULT,
	GetMessageForStatus,
	MessageResult
} from "../Libraries/Utilities";

interface LoginForm {
	password: string;
	username: string;
	email: "";
}

async function LoginUser(Form: LoginForm, setMR: Setter<MessageResult>) {
	const IdResponse: Response = await fetch(`/api/user/getfromid`);

	setMR({ ok: IdResponse.ok, message: GetMessageForStatus(IdResponse.status) });

	if (!IdResponse.ok) {
		console.error(
			`Submit request status not ok, status: ${IdResponse.status} ${IdResponse.statusText}`
		);

		return;
	}

	const id: number = (await IdResponse.json())["ID"],
		LoginBody = { ...Form, ID: id };

	const LoginOptions: RequestInit = {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json"
		},
		redirect: "follow",
		referrerPolicy: "strict-origin-when-cross-origin",
		body: JSON.stringify(LoginBody)
	};

	const Login = await fetch("/api/user/login", LoginOptions);

	if (!Login.ok) {
		console.error(
			`Submit request status not ok, status: ${Login.status} ${Login.statusText}`
		);

		console.groupEnd();

		return;
	}
}

const Login: Component = () => {
	const [form, setForm] = createSignal<LoginForm>({
		password: "",
		username: "",
		email: ""
	});

	const OnSubmit = (event: MouseEvent) => {
		LoginUser(form(), setMR);

		location.href = "/";

		event.preventDefault();
	};

	const [messageResult, setMR] = createSignal<MessageResult>({
		ok: true,
		message: HIDE_RESULT
	});

	const handlePassword: JSX.EventHandlerUnion<
		HTMLInputElement,
		InputEvent
	> = event => {
		const json: LoginForm = {
			password: event.currentTarget.value,
			username: form().username,
			email: ""
		};

		setForm(json);
	};

	const handleUsername: JSX.EventHandlerUnion<
		HTMLInputElement,
		InputEvent
	> = event => {
		const json: LoginForm = {
			password: form().password,
			username: event.currentTarget.value,
			email: ""
		};

		setForm(json);
	};

	return (
		<form class='flex flex-col bg-slate-800 p-5 rounded-lg absolute translate-x-[-50%] translate-y-[-50%] top-1/2 left-1/2'>
			<img
				src={logo}
				height={64}
				width={64}
				alt='logo'
				class='mx-auto mt-1 mb-3'
			/>

			<p
				class={`mx-auto my-2 ${
					HIDE_RESULT == messageResult().message ? "hidden" : ""
				} ${messageResult().message}`}
			>
				{messageResult().message}
			</p>

			<h1 class='text-white text-center text-2xl mb-4 font-semibold'>
				CoffeeCo - Log in
			</h1>

			<label class='text-white my-2'>Username</label>
			<input
				autocomplete='username'
				type='text'
				onInput={handleUsername}
				class='mb-4 bg-slate-700 rounded-md text-white p-1'
			/>

			<label class='text-white my-2'>Password</label>
			<input
				autocomplete='current-password'
				type='password'
				onInput={handlePassword}
				class='mb-4 bg-slate-700 rounded-md text-white p-1'
			/>

			<button
				type='submit'
				onClick={OnSubmit}
				class='bg-indigo-700 rounded-md mx-auto p-2 text-white mt-4'
			>
				Log in
			</button>
		</form>
	);
};

export default Login;
