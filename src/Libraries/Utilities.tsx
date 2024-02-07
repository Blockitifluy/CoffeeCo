import { Accessor, JSX, Setter } from "solid-js";

export interface MessageResult {
	ok: boolean;
	message: string;
}

export type Dict<V> = { [key: string]: V };

export const HIDE_RESULT: string = "DON'T SHOW";

export function removeItemOnce<t>(arr: t[], index: number): t[] {
	arr.splice(index, 1);
	return arr;
}

type UnionInput = InputEvent & {
	currentTarget: HTMLInputElement;
	target: Element;
};

export function useInputDict(
	Form: Accessor<Dict<string>>,
	setForm: Setter<Dict<string>>,
	key: string
): JSX.EventHandlerUnion<HTMLInputElement, InputEvent> {
	return (event: UnionInput) => {
		const Clone: Dict<string> = { ...Form(), [key]: event.currentTarget.value };

		console.log(Clone, event.currentTarget.value);

		setForm(Clone);
	};
}

/**
 * A hook connecting an `object` setter to an input text-like `element`. There are some rules to this:
 * - Form has to have string keys & values,
 * - Form has to be an `object`,
 * - and using Solidjs
 * @param Form
 * @param setForm Sets the `Form` parameter using a `Setter`
 * @param key The key in the form parameter
 * @param debug Logs the `Form` (default = `false`)
 * @returns A Event Handle used in JSX HTML
 */
export function useInput<T>(
	Form: Accessor<T>,
	setForm: Setter<T>,
	key: string,
	debug: boolean = false
): JSX.EventHandlerUnion<HTMLInputElement, InputEvent> {
	const Handler: JSX.EventHandlerUnion<
		HTMLInputElement,
		InputEvent
	> = event => {
		const json: T = {
			...Form(),
			[key]: event.currentTarget.value
		};

		if (debug) {
			console.log(Form());
		}

		setForm(() => json);
	};

	return Handler;
}
