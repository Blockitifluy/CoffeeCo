import { Component, For, createSignal } from "solid-js";
import logo from "../assets/logos/logo256.png";
import { useInputDict, Dict } from "../Libraries/Utilities";
import * as ApiConnector from "../Libraries/ApiConnector";

/**
 * Has two options:
 * * Login (Login),
 * * Signup (Signup)
 * @enum
 */
export enum AuthType {
	Login,
	Signup
}

/**
 * Used for AuthInputs.
 * See {@link AuthInputs}
 */
interface AuthProp {
	/**
	 * The title of Auth page
	 */
	name: string;
	/**
	 * The text button
	 */
	confirmText: string;
	/**
	 * The input elements (See {@link AuthInput})
	 */
	Inputs: AuthInput[];
	/**
	 * Fired when the Auth Page is successful.
	 * @param Form The Form's inputs
	 * @returns A Promise of a `SubmitResult` if it was ok (see {@link SubmitResult})
	 */
	OnSuccess: (Form: Dict<string>) => Promise<SubmitResult>;
}

/**
 * The json version of the inputs (See {@link AuthProp})
 */
interface AuthInput {
	/**
	 * Name of the input
	 */
	name: string;
	/**
	 * The autocomplete propetry
	 */
	autocomplete: "off" | "username" | "current-password" | "new-password";
	/**
	 * Hides text if isPassword is equal true
	 */
	isPassword: boolean;
}

/**
 * Auth's OnSuccess result
 */
interface SubmitResult {
	/**
	 * Is the request is okay
	 */
	ok: boolean;
	/**
	 * The status code of request
	 */
	statusCode: number;
	/**
	 * The displayed message
	 */
	message?: string;
}

/**
 * The map of Auth pages
 */
const AuthInputs: Map<AuthType, AuthProp> = new Map([
	[
		AuthType.Login,
		{
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
					const UserIdJson = await ApiConnector.GetUserFromUsername(
						Form.Username
					);

					await ApiConnector.LoginUser(UserIdJson.id, Form.Password);
				} catch (error) {
					return {
						ok: false,
						statusCode: 400,
						message: "Password doesn't match"
					};
				}

				return { ok: true, statusCode: 200 };
			}
		}
	],
	[
		AuthType.Signup,
		{
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
					await ApiConnector.AddUser({
						handle: Form.Username,
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
		}
	]
]);

/**
 * The props for the {@link UserInterface}
 */
interface AuthInterfaceProps {
	Auth: AuthType;
}

/**
 * A mult-page component for:
 * * Log in,
 * * Sign up
 * @param props Contains Auth type
 * @returns Auth Page Component
 */
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
			return;
		}

		AuthProp.OnSuccess(FormDict).then((res: SubmitResult) => {
			if (res.ok) {
				location.href = "/"; // Go to home page
				return;
			}
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
						<label class='my-2 text-slate-700' for={auth.name}>
							{auth.name}
						</label>
						<input
							id={auth.name}
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
				class='bg-persian-500 text-white rounded-md mx-auto p-2 mt-4'
			>
				{AuthProp.confirmText}
			</button>
		</form>
	);
};

export default UserInterface;
