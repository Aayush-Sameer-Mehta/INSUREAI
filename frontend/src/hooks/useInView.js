import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, inView] — tracks when the element enters the viewport.
 * Triggers once by default (once it's in view, it stays in view).
 */
export default function useInView(threshold = 0.2) {
 const ref = useRef(null);
 const [inView, setInView] = useState(false);

 useEffect(() => {
 const el = ref.current;
 if (!el) return;
 const obs = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting) setInView(true);
 },
 { threshold }
 );
 obs.observe(el);
 return () => obs.disconnect();
 }, [threshold]);

 return [ref, inView];
}
