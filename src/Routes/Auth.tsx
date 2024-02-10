// Later turn Login.tsx and Signin.tsx into one page

import { Component, For, createSignal } from "solid-js";
import logo from "../assets/logos/logo256.png";
import { useInputDict, Dict } from "../Libraries/Utilities";
import {
	AddUser,
	GetUserFromUsername,
	LoginUser
} from "../Libraries/ApiConnector";

export enum AuthType {
	Login = "Login",
	Signup = "Signup"
}

interface AuthProp {
	name: string;
	confirmText: string;
	Inputs: AuthInput[];
	OnSuccess: (Form: Dict<string>) => Promise<SubmitResult>;
}

interface AuthInput {
	name: string;
	autocomplete: "off" | "username" | "current-password" | "new-password";
	isPassword: boolean;
}

interface SubmitResult {
	ok: boolean;
	statusCode: number;
	message?: string;
}

const LoginProps: AuthProp = {
	name: "Login",
	confirmText: "Log in",
	Inputs: [
		{
			name: "Username",
			autocomplete: "username",
			isPassword: false
		},

		{
			name: "Password",
			autocomplete: "current-password",
			isPassword: true
		}
	],
	OnSuccess: async (Form: Dict<string>) => {
		try {
			const UserIdJson = await GetUserFromUsername(Form.Username);

			LoginUser(UserIdJson.ID, Form.Password);
		} catch (error) {
			return { ok: false, statusCode: 400, message: "Password doesn't match" };
		}

		return { ok: true, statusCode: 200 };
	}
};

const SignupProps: AuthProp = {
	name: "Signup",
	confirmText: "Sign up",
	Inputs: [
		{
			name: "Username",
			autocomplete: "username",
			isPassword: false
		},

		{
			name: "Email",
			autocomplete: "off",
			isPassword: false
		},

		{
			name: "Password",
			autocomplete: "new-password",
			isPassword: true
		}
	],
	OnSuccess: async (Form: Dict<string>) => {
		try {
			AddUser({
				username: Form.Username,
				email: Form.Email,
				password: Form.Password
			});
		} catch (error) {
			// May have condition if server is down
			return { ok: false, statusCode: 401, message: "User already exists" };
		}

		return { ok: true, statusCode: 201 };
	}
};

const AuthInputs: Map<AuthType, AuthProp> = new Map([
	[AuthType.Login, LoginProps],
	[AuthType.Signup, SignupProps]
]);

interface AuthInterfaceProps {
	Auth: AuthType;
}

const UserInterface: Component<AuthInterfaceProps> = (
	props: AuthInterfaceProps
) => {
	const AuthProp: AuthProp | undefined = AuthInputs.get(props.Auth);

	if (AuthProp === undefined) {
		console.log(`Auth ${props.Auth} doesn't exist`);
		return;
	}

	const [Form, setForm] = createSignal<Dict<string>>({});

	const OnSubmit = (e: MouseEvent) => {
		const FormDict: Dict<string> = Form();
		// Does match needed length

		if (Object.keys(FormDict).length !== AuthProp.Inputs.length) {
			// Not enough inputs
			return;
		}

		AuthProp.OnSuccess(Form()).then(res => {
			if (res.ok) {
				location.href = "http://localhost:8000/"; // Go to home page
				return;
			}

			// TODO
		});

		e.preventDefault();
	};

	return (
		<form
			class='flex flex-col bg-white text-slate-700 p-5 rounded-lg absolute translate-x-[-50%] translate-y-[-50%] top-1/2 left-1/2 shadow-lg
		'
		>
			<img
				src={logo}
				height={64}
				width={64}
				alt='logo'
				class='mx-auto mt-1 mb-3'
			/>

			<h1 class='text-center text-2xl mb-4 font-semibold'>
				CoffeeCo - {AuthProp.name}
			</h1>

			<For each={AuthProp.Inputs}>
				{auth => (
					<>
						<label class='my-2 text-slate-700'>{auth.name}</label>
						<input
							autocomplete={auth.autocomplete}
							type={auth.isPassword ? "password" : "text"}
							onInput={useInputDict(Form, setForm, auth.name)}
							class='mb-4 bg-slate-200 rounded-md p-1'
						/>
					</>
				)}
			</For>

			<button
				type='submit'
				onClick={OnSubmit}
				class='bg-persian text-white rounded-md mx-auto p-2 mt-4'
			>
				{AuthProp.confirmText}
			</button>
		</form>
	);
};

export default UserInterface;
