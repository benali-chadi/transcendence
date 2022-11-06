module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				my: {
					"dark-lavender": "#D1D6E0",
					lavender: "#D8E3F7",
					yellow: "#F6D003",
					violet: "#2B0C4F",
					"light-violet": "#6155CB",
					orange: "#E5572F",
					green: "#1FAC49",
					blue: "#5B6FC8",
					red: "#BF1600",
				},
			},
			backgroundSize: {
				"50%w": "100% 50%",
				"50%h": "50% 100%",
			},
			borderRadius: {
				med: "2rem",
				large: "4rem",
				xlarge: "8rem",
			},
			fontFamily: {
				header: ['"Poppins"', '"sans-serif"'],
			},
			screens: {
				'3xl': '2000px',
			},
		},
	},
	plugins: [],
};
