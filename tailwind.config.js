export const content = [
	"./src/**/*.{js,jsx,ts,tsx}",
	"./index.html",
	"./errors/**/*.html"
];
/** @type {import('tailwindcss').Config} */
export const theme = {
	colors: {
		white: "#ffffff",
		background: "#dbdbdb",
		slate: {
			50: "#f6f7f9",
			100: "#eceef2",
			200: "#d5d9e2",
			300: "#b1bbc8",
			400: "#8695aa",
			500: "#64748b",
			600: "#526077",
			700: "#434e61",
			800: "#3a4252",
			900: "#343a46",
			950: "#23272e"
		},
		charcoal: {
			50: "#f0fafb",
			100: "#d9f2f4",
			200: "#b7e4ea",
			300: "#85d0db",
			400: "#4cb2c4",
			500: "#3196a9",
			600: "#2b798f",
			700: "#296475",
			800: "#295361",
			900: "#264653",
			950: "#142d38"
		},
		persian: {
			50: "#f2fbf9",
			100: "#d3f4ed",
			200: "#a6e9db",
			300: "#72d6c6",
			400: "#44bdac",
			500: "#2a9d8f",
			600: "#208177",
			700: "#1d6861",
			800: "#1c534f",
			900: "#1b4642",
			950: "#0a2928"
		},
		saffron: {
			50: "#fdf9ed",
			100: "#f8edcd",
			200: "#f0d997",
			300: "#e9c46a",
			400: "#e2ab3d",
			500: "#da8d26",
			600: "#c16c1e",
			700: "#a04f1d",
			800: "#833e1d",
			900: "#6c331b",
			950: "#3d190b"
		},
		sandy: {
			50: "#fef6ee",
			100: "#fdead7",
			200: "#fad2ae",
			300: "#f4a261",
			400: "#f18746",
			500: "#ed6722",
			600: "#de4e18",
			700: "#b83a16",
			800: "#933019",
			900: "#762a18",
			950: "#40120a"
		},
		sienna: {
			50: "#f1f8f3",
			100: "#deede2",
			200: "#bfdbc8",
			300: "#95c0a5",
			400: "#67a07e",
			500: "#468361",
			600: "#376f51",
			700: "#29533e",
			800: "#224333",
			900: "#1d372a",
			950: "#0f1f17"
		}
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

export const plugins = [];
