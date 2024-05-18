import * as Solid from "solid-js";
import { OcArrowleft2 } from "solid-icons/oc";
import { Status, DefaultStatus, BasicStatus } from "../common";
import { A } from "@solidjs/router";

export namespace Input {
	export type InputMap = Map<string, string>;
	export type AuthSubmit = (Inputs: InputMap) => Promise<BasicStatus>;

	/**
	 * Used by {@link AuthOnClick}
	 */
	export interface AuthOnClickInputs {
		page: Input.AuthProps;
		/**
		 * Sets the status
		 */
		setStatus: Solid.Setter<Status>;
	}

	/**
	 * The automatic fill of a input
	 */
	export enum AuthPlaceholder {
		currentPassword = "current-password",
		newPassword = "new-password",
		username = "username",
		email = "email",
		name = "name",
		off = "off",
		on = "on"
	}

	/**
	 * The Propetries of {@link AuthComponent}
	 */
	export interface AuthProps {
		/**
		 * The main title of Prompt
		 */
		title: string;
		/**
		 * Text under the title
		 */
		subtitle: string;
		/**
		 * The button's {@link Input.AuthProps.confirmText} text
		 */
		confirmText: string;
		/**
		 * The Input templetes
		 */
		Inputs: Input.AuthInput[];
		/**
		 * Happens on button click (On Submit)
		 */
		Submit: Input.AuthSubmit;
	}

	/**
	 * An template of a {@link InputComponent}
	 */
	export class AuthInput {
		/**
		 * If false, the input is hidden (shown in •••)
		 */
		public isPassword: boolean;
		/**
		 * The name of Input
		 */
		public key: string;
		/**
		 * The placeholder Input
		 */
		public placeholder: AuthPlaceholder;
		/**
		 * Maximum character limit for the input
		 */
		public limit?: number;

		/**
		 * Constructs a {@link Input.AuthInput AuthInput}
		 * @param text The {@link Input.AuthInput.key key} value
		 * @param placeholder Automatic input fill in
		 * @param isPassword If false, the input is hidden (shown in •••)
		 * @param limit Maximum character limit for the input
		 */
		constructor(
			text: string,
			placeholder: AuthPlaceholder = AuthPlaceholder.off,
			isPassword: boolean = false,
			limit?: number
		) {
			this.placeholder = placeholder;
			this.isPassword = isPassword;
			this.limit = limit;
			this.key = text;
		}
	}
}

/**
 * A map of input's name and value/data
 */
const InputMap: Input.InputMap = new Map<string, string>();

/**
 * Happens the input has a keyup event, then updates the signal and adds from {@link InputMap}
 * @param key The name of {@link InputComponent Input}
 * @param input Gets the input as string
 * @param setInput Set the input
 * @returns An event connecter
 */
function OnInput(
	key: string,
	[input, setInput]: Solid.Signal<string>
): Solid.JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> {
	return e => {
		const Target: HTMLInputElement = e.target as HTMLInputElement;

		setInput(Target.value);
		InputMap.set(key, input());
	};
}

/**
 * The InputComponent included in {@link AuthComponent}
 * @param props The InputComponent's propetries
 */
const InputComponent: Solid.Component<Input.AuthInput> = props => {
	const [input, setInput] = Solid.createSignal<string>("");

	return (
		<div class='flex flex-col gap-1'>
			<label for={props.key}>{props.key}</label>
			<input
				id={props.key}
				onKeyUp={OnInput(props.key, [input, setInput])}
				class='border-2 border-slate-700/65 p-2 rounded placeholder:text-slate-700/65'
				placeholder={props.key}
				autocomplete={props.placeholder}
				maxLength={props.limit}
				type={props.isPassword ? "password" : "text"}
			/>

			<Solid.Show when={props.limit}>
				<span>{props.limit} limit</span>
			</Solid.Show>
		</div>
	);
};

/**
 * When the submit button is clicked
 * @param inputs Includes the {@link Input.AuthOnClickInputs.page page} and sets the status
 * @param event The event occured on Mouse Click
 */
const AuthOnClick = async (
	inputs: Input.AuthOnClickInputs,
	event: MouseEvent
) => {
	event.preventDefault();

	const result = await inputs.page.Submit(InputMap),
		resultStatus = new Status(result.msg, result.ok);

	inputs.setStatus(resultStatus);

	if (result.ok) location.href = "/";
};

/**
 * The Auth Page (could be Login / Signin)
 * @param props The page's propetries
 */
const AuthComponent: Solid.Component<{ page: Input.AuthProps }> = props => {
	const [status, setStatus] = Solid.createSignal<Status>(DefaultStatus);

	return (
		<div class='justify-center items-center grid bg-background w-screen h-screen'>
			<form class='flex flex-col gap-4 bg-white drop-shadow-lg px-8 py-10 rounded w-80'>
				<h1 class='mt-2 font-bold text-3xl leading-4'>{props.page.title}</h1>
				<sub class='mb-2 text-sm'>{props.page.subtitle}</sub>

				<Solid.Show when={status().show}>
					<span
						class={
							status().ok
								? "text-persian-500"
								: "text-sandy-500" + " my-0 font-semibold"
						}
					>
						{status().msg}
					</span>
				</Solid.Show>

				<section class='flex flex-col gap-2 mx-auto mb-2 w-64'>
					<Solid.For each={props.page.Inputs}>
						{input => (
							<InputComponent
								isPassword={input.isPassword}
								key={input.key}
								placeholder={input.placeholder}
							/>
						)}
					</Solid.For>
				</section>

				<section>
					<button
						onClick={[AuthOnClick as any, { page: props.page, setStatus }]}
						class='bg-charcoal-700 hover:bg-charcoal-600 mx-auto py-2 rounded-full w-full font-medium text-2xl text-white transition-colors'
					>
						{props.page.confirmText}
					</button>

					<A
						class='flex justify-end items-center mt-4 text-charcoal-600 hover:text-charcoal-500 transition-colors'
						href='/'
					>
						<OcArrowleft2 />
						Back
					</A>
				</section>
			</form>
		</div>
	);
};

export default AuthComponent;
