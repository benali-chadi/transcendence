export const pageVariantDesktop = {
	initial: {
		y: "100vh",
	},
	animate: {
		y: 0,
		transition: {
			duration: 0.5,
			type: "tween",
			// stiffness: 300,
		},
	},
	exit: {
		y: "-100vh",
		transition: { ease: "easeInOut", type: "tween", duration: 0.5 },
	},
};

export const pageVariantMobile = {
	initial: {
		x: "100vw",
	},
	animate: {
		x: 0,
		transition: {
			duration: 0.5,
			type: "tween",
			// stiffness: 300,
		},
	},
	exit: {
		x: "-100vw",
		transition: { ease: "easeInOut", type: "tween", duration: 0.5 },
	},
};

export const pageVariants = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.75,
			type: "tween",
			// stiffness: 300,
		},
	},
	exit: {
		opacity: 0,
	},
};

export const navVariants = {
	open: {
		opacity: 1,
		x: 0,
		transition: { stiffness: 100 },
	},
	close: {
		opacity: 0,
		x: "-100%",
		transition: { stiffness: 230 },
	},
};

export const threeDotsVariants = {
	open: {
		display: "block",
		opacity: 1,
		y: 0,
		transition: { stiffness: 100 },
	},
	close: {
		opacity: 0,
		y: "-15%",
		transition: { stiffness: 100 },
		transitionEnd: { display: "none" },
	},
};

export const chatAreaVariants = {
	open: {
		display: "block",
		x: 0,
		transition: { type: "tween", duration: 0.5, ease: "easeInOut" },
		opacity: 1,
	},
	close: {
		opacity: 0,
		x: "100%",
		transition: { type: "tween", duration: 1 },
		transitionEnd: { display: "none" },
	},
};

export const cardVariants = {
	initial: {
		x: "-100vw"
	},
	animate: {
		x: 0,
		transition: {
			type: "spring",
			stiffness: 70
		}
	},
	exit: {
		x: "100vw",
		transition: {
			type: "tween",
			duration: 0.5
		}
	}
};