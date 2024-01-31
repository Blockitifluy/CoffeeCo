import logo from "../logo.png";
import { Component, Setter, createSignal } from "solid-js";
import {
	MessageResult,
	GetMessageForStatus,
	HIDE_RESULT
} from "../Libraries/Utilities";
import { JSX } from "solid-js";

// TODO: Add RegExp
// TODO: Add Email Form

const PasswordAllowed: RegExp =
		/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
	UsernameAllowed: RegExp = /^(?=.*\w)(?=.*\w)(?=.*\w).{8,25}$/gm,
	EmailAllowed: RegExp =
		/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

interface SigninForm {
	password: string;
	username: string;
	email: string;
}

async function SignUser(Form: SigninForm, setMR: Setter<MessageResult>) {
	const AddOptions: RequestInit = {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json"
		},
		redirect: "follow",
		referrerPolicy: "strict-origin-when-cross-origin",
		body: JSON.stringify(Form)
	};

	console.group("Requesting adding user");
	console.log("Add user");

	const AddResponse: Response = await fetch(
		"http://localhost:8000/api/user/add",
		AddOptions
	);

	setMR({
		ok: AddResponse.ok,
		message: GetMessageForStatus(AddResponse.status)
	});

	if (!AddResponse.ok) {
		console.error(
			`Submit request status not ok, status: ${AddResponse.status} ${AddResponse.statusText}`
		);

		console.groupEnd();

		return;
	}

	console.log(`Submit success`);

	console.groupEnd();

	const LoginBody = { ...Form, ID: (await AddResponse.json())["ID"] };

	console.log(LoginBody);

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

	console.log("Login user");

	const Login = await fetch("/api/user/login", LoginOptions);

	if (!Login.ok) {
		console.error(
			`Submit request status not ok, status: ${Login.status} ${Login.statusText}`
		);

		console.groupEnd();

		return;
	}
}

const Signin: Component = () => {
	const [form, setForm] = createSignal<SigninForm>({
		password: "",
		username: "",
		email: ""
	});

	const [messageResult, setMR] = createSignal<MessageResult>({
		ok: true,
		message: HIDE_RESULT
	});

	const OnSubmit = (event: MouseEvent) => {
		SignUser(form(), setMR);

		location.href = "/";

		event.preventDefault();
	};

	const handlePassword: JSX.EventHandlerUnion<
		HTMLInputElement,
		InputEvent
	> = event => {
		const json: SigninForm = {
			password: event.currentTarget.value,
			username: form().username,
			email: form().email
		};

		setForm(json);
	};

	const handleUsername: JSX.EventHandlerUnion<
		HTMLInputElement,
		InputEvent
	> = event => {
		const json: SigninForm = {
			password: form().password,
			username: event.currentTarget.value,
			email: form().email
		};

		setForm(json);
	};

	const handleEmail: JSX.EventHandlerUnion<
		HTMLInputElement,
		InputEvent
	> = event => {
		const json: SigninForm = {
			password: form().password,
			username: form().username,
			email: event.currentTarget.value
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
				} ${messageResult().ok ? "text-green-600" : "text-red-600"}`}
			>
				{messageResult().message}
			</p>
			<h1 class='text-white text-center text-2xl mb-4 font-semibold'>
				CoffeeCo - Sign in
			</h1>

			<label class='text-white my-2'>Username</label>
			<input
				autocomplete='username'
				type='text'
				onInput={handleUsername}
				class='mb-4 bg-slate-700 rounded-md text-white p-1'
			/>

			<label class='text-white my-2'>Email</label>
			<input
				autocomplete='email'
				type='text'
				placeholder='person@example.com'
				onInput={handleEmail}
				class='mb-4 bg-slate-700 rounded-md text-white p-1 placeholder:text-slate-300'
			/>

			<label class='text-white my-2'>Password</label>
			<input
				autocomplete='new-password'
				type='password'
				onInput={handlePassword}
				class='mb-4 bg-slate-700 rounded-md text-white p-1'
			/>

			<button
				onClick={OnSubmit}
				type='submit'
				class='bg-indigo-700 rounded-md mx-auto p-2 text-white mt-4'
			>
				Sign in
			</button>
		</form>
	);
};

export default Signin;
