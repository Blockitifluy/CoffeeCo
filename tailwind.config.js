/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
	theme: {
		extend: {
			gridTemplateColumns: {
				"h-layout": "2fr 3fr 2fr"
			}
		}
	},
	plugins: []
};
