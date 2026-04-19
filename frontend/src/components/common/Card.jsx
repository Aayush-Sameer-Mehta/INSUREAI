import { motion } from "framer-motion";

const variantClasses = {
 default: "panel",
 glass: "glass-panel",
 outlined: "rounded-panel border border-slate-200/80 bg-transparent ",
 gradient:
 "rounded-panel border-0 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white shadow-xl",
 interactive: "panel-interactive",
};

export default function Card({
 children,
 variant = "default",
 className = "",
 padding = true,
 hover = false,
 header,
 footer,
 ...props
}) {
 const Wrapper = hover ? motion.div : "div";
 const hoverProps = hover
 ? { whileHover: { y: -4, transition: { duration: 0.2 } } }
 : {};

 return (
 <Wrapper
 className={`${variantClasses[variant] || variantClasses.default} overflow-hidden ${className}`}
 {...hoverProps}
 {...props}
 >
 {header && (
 <div className="border-b border-slate-100 px-6 py-4 ">
 {header}
 </div>
 )}
 {padding ? <div className="p-6">{children}</div> : children}
 {footer && (
 <div className="border-t border-slate-100 px-6 py-4 ">
 {footer}
 </div>
 )}
 </Wrapper>
 );
}
