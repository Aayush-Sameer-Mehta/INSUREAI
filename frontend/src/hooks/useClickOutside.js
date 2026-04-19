import { useEffect, useRef } from "react";

/**
 * Calls `handler` when a click occurs outside the referenced element.
 * Replaces the duplicated outside-click listeners in Navbar.jsx.
 */
export default function useClickOutside(handler) {
 const ref = useRef(null);

 useEffect(() => {
 const listener = (e) => {
 if (ref.current && !ref.current.contains(e.target)) {
 handler();
 }
 };
 document.addEventListener("mousedown", listener);
 return () => document.removeEventListener("mousedown", listener);
 }, [handler]);

 return ref;
}
