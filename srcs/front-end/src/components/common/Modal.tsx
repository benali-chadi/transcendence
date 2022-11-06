import React, { FC } from "react";
import { MutableRefObject, useEffect, useRef } from "react";
import { createPortal } from "react-dom";


interface Props {
	children: JSX.Element
}

const Modal: FC<Props> = ({ children }) => {
	const modalRef: MutableRefObject<HTMLDivElement | null > = useRef(null);
	if (!modalRef.current) modalRef.current = document.createElement("div");
	useEffect(() => {
		const modalRoot = document.getElementById("modal");
		if (!modalRoot || !modalRef.current)
			return;
		modalRoot.appendChild(modalRef.current);
		return () =>
		{
			if (modalRef.current)
				modalRoot.removeChild(modalRef.current)
			;
		} 
	}, []);
	return createPortal(<div>{children}</div>, modalRef.current);
};

export default Modal;
