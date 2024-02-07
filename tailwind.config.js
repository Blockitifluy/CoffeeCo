/** @type {import('tailwindcss').Config} */
export const content = [
	"./src/**/*.{js,jsx,ts,tsx}",
	"./index.html",
	"./errors/**/*.html"
];
export const theme = {
	extend: {
		gridTemplateColumns: {
			"h-layout": "2fr 3fr 2fr"
		}
	}
};
export const plugins = [];
