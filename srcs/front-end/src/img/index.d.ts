
declare module "\*.svg" {  
	import React = require("react");
	export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;  
	const src: any;
	export default src;
}

declare module '*.png' {
	const value: any;
	export = value;
}

declare module '*.jpg' {
	const value: any;
	export = value;
}
declare module '*.jpeg' {
	const value: any;
	export = value;
}