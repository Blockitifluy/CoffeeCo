import shade from "tailwind-shades-for-custom-colors";

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
		},

		colors: {
			charcoal: "#264653",
			persian: "#2A9D8F",
			saffron: "#E9C46A",
			sandy: "#F4A261",
			sienna: "#376F51"
		}
	}
};
export const plugins = [shade];
