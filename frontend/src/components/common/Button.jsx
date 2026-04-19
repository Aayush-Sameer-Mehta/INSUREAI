import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const variants = {
 primary: "btn-primary",
 secondary: "btn-secondary",
 outline: "btn-outline",
 accent: "btn-accent",
 ghost: "btn-ghost",
 danger: "btn-danger",
};

const sizes = {
 sm: "btn-sm",
 md: "",
 lg: "btn-lg",
};

const Button = forwardRef(
 (
 {
 children,
 variant = "primary",
 size = "md",
 loading = false,
 disabled = false,
 icon: Icon,
 iconRight: IconRight,
 className = "",
 type = "button",
 ...props
 },
 ref
 ) => {
 const isDisabled = disabled || loading;

 return (
 <motion.button
 ref={ref}
 type={type}
 disabled={isDisabled}
 aria-busy={loading || undefined}
 whileTap={isDisabled ? undefined : { scale: 0.97 }}
 whileHover={isDisabled ? undefined : { y: variant === "ghost" ? 0 : -1 }}
 className={`${variants[variant] || variants.primary} ${sizes[size] || ""} ${className}`}
 {...props}
 >
 {loading ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 <span>{typeof children === "string" ? children : "Loading..."}</span>
 </>
 ) : (
 <>
 {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
 {children}
 {IconRight && <IconRight className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
 </>
 )}
 </motion.button>
 );
 }
);

Button.displayName = "Button";
export default Button;
