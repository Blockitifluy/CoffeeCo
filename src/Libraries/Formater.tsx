import { Component } from "solid-js";

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
		return `<a class="text-sienna-400">@${g1}</a>`;
	}),

	new ColouredRule(/#([\da-zA-Z]+)/g, (_, g1) => {
		return `<a class="text-sienna-400">#${g1}</a>`;
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
	class?: string;
}

export const FormatedText: Component<FormatedTextProps> = (
	props: FormatedTextProps
) => {
	//Does it bypass the ANTI_BYPASS REGEX
	if (props.text.search(ANTI_BYPASS) !== -1) {
		console.error("Bypassed Messaage");

		return (
			<p class='font-mono text-sandy-500'>Bypassed message: {props.text}</p>
		);
	}

	let coloured: string = props.text;

	for (const Rule of ColouredRules) {
		coloured = coloured.replace(Rule.Expression, Rule.Replacer);
	}

	return <p class={props.class} innerHTML={coloured}></p>;
};
