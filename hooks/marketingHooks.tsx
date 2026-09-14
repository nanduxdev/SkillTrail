import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";

export const HEADER_HEIGHT = 64;

export function useLenisScrollTo() {
	const lenis = useLenis();
	return (hash: string) => (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		lenis?.scrollTo(hash, { offset: -HEADER_HEIGHT });
	};
}

export function useReveal() {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setVisible(true);
			return;
		}
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					setVisible(true);
					io.unobserve(el);
				}
			},
			{ threshold: 0.08 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return { ref, visible };
}
