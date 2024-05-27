export const content = [
	"./src/**/*.{js,jsx,ts,tsx}",
	"./index.html",
	"./errors/**/*.html"
];

/** @type {import('tailwindcss').Config} */
export const theme = {
	colors: {
		white: "#fff",
		background: "#fff",
		header: "#f6f8fa",
		button: "#526077",

		subtitle: "#64748b",
		title: "#000",
		text: "#334155",

		accent: "#2a9d8f",
		warning: "#ed6722",

		outline: "#d0d7de"
	},

	extend: {
		width: {
			post: "32rem"
		},
		gridTemplateRows: {
			post: "32px 1fr"
		},

		gridTemplateColumns: {
			header: "1fr 2fr 1fr",
			miniheader: "2fr 1fr",
			post: "32px 1fr"
		}
	}
};
