import { Component } from "solid-js";

export function GetMessageForStatus(status: number): string {
	let result: string = "";

	switch (status) {
		case 500:
			result = "500 - Server Error";
			break;
		case 404:
			result = "404 - Not Found";
			break;
		case 400:
			result = "400 - Bad Request";
			break;
		case 401:
			result = "401 - Request isn't unauthorised"; //! ITS SPELT "UNAUTHORISED" NOT "UNAUTHORIZZZZZZZZED"
		case 201:
			result = "Everything is alright 👍";
			break;
		case 200:
			result = "Everything is alright 👍";
			break;
		default:
			result = `${status} - idk what happened?`;
	}

	return result;
}

export interface MessageResult {
	ok: boolean;
	message: string;
}

export const HIDE_RESULT: string = "DON'T SHOW";

export function removeItemOnce<t>(arr: t[], index: number): t[] {
	arr.splice(index, 1);
	return arr;
}

type ColouredReplacer = (substring: string, ...args: string[]) => string;

class ColouredRule {
	public Expression: RegExp;
	public Replacer: ColouredReplacer;

	public constructor(Expression: RegExp, Replacer: ColouredReplacer) {
		this.Expression = Expression;
		this.Replacer = Replacer;
	}
}

const ColouredRules: ColouredRule[] = [
	new ColouredRule(/@([\d\w_]+)/g, (_, g1) => {
		return `<a class="text-indigo-600">@${g1}</a>`;
	}),

	new ColouredRule(/#([\da-zA-Z]+)/g, (_, g1) => {
		return `<a class="text-indigo-600">#${g1}</a>`;
	}),

	new ColouredRule(/`(.+?)`/g, (_, g1) => {
		return `<a class="bg-slate-400/25 font-mono rounded px-1">${g1}</a>`;
	}),

	new ColouredRule(/_(.+?)_/g, (_, g1) => {
		return `<span class="italic">${g1}</span>`;
	}),

	new ColouredRule(/\*(.+?)\*/g, (_, g1) => {
		return `<span class="font-bold">${g1}</span>`;
	})
];

/**
 * Filter's html tags to prevent html tags being executed
 * @example <script>console.log("You Have been hacked")</script>
 */
const ANTI_BYPASS: RegExp =
	/<\s*[A-Za-z_]+\s*.*\/?\s*>(?:.*<\s*\/[\sA-Za-z_]+>)?/gs;

interface FormatedTextProps {
	text: string;
}

export const FormatedText: Component<FormatedTextProps> = (
	props: FormatedTextProps
) => {
	//Does it bypass the ANTI_BYPASS REGEX
	if (props.text.search(ANTI_BYPASS) !== -1) {
		console.error("Bypassed Messaage");

		return <p class='font-mono text-red-500'>Bypassed message: {props.text}</p>;
	}

	let coloured: string = props.text;

	for (let Rule of ColouredRules) {
		coloured = coloured.replace(Rule.Expression, Rule.Replacer);
	}

	return <p innerHTML={coloured}></p>;
};
