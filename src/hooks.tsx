import { Accessor, createSignal, JSX } from "solid-js";

export type InputHook<T> = [
	JSX.EventHandlerUnion<T, KeyboardEvent>,
	Accessor<string>
];

/**
 * A hook, the gets an input of a `input`/`textarea` as a string
 * @param def The default input
 * @returns Event connecter and gets the input string
 */
export function useInput<T>(def?: string): InputHook<T> {
	const [getter, setter] = createSignal<string>(def || "");

	const Connecter: JSX.EventHandlerUnion<T, KeyboardEvent> = e => {
		const value: string = (e.target as any).value;
		setter(value);
	};

	return [Connecter, getter];
}
