const colorMap = {
 success: "badge-success",
 warning: "badge-warning",
 danger: "badge-danger",
 info: "badge-info",
 purple: "badge-purple",
 default: "badge bg-slate-100 text-slate-700 ring-1 ring-slate-200/50 ",
};

export default function Badge({
 children,
 color = "default",
 dot = false,
 className = "",
 ...props
}) {
 return (
 <span className={`${colorMap[color] || colorMap.default} ${className}`} {...props}>
 {dot && (
 <span
 className={`inline-block h-1.5 w-1.5 rounded-full ${
 color === "success" ? "bg-emerald-500" :
 color === "warning" ? "bg-amber-500" :
 color === "danger" ? "bg-red-500" :
 color === "info" ? "bg-blue-500" :
 color === "purple" ? "bg-violet-500" :
 "bg-slate-400"
 }`}
 />
 )}
 {children}
 </span>
 );
}
