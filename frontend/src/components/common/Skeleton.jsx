export default function Skeleton({
 variant = "text",
 width,
 height,
 className = "",
 count = 1,
}) {
 const presets = {
 text: "skeleton-text",
 title: "skeleton-title",
 card: "skeleton-card",
 avatar: "skeleton-circle",
 "table-row": "skeleton h-12 w-full",
 custom: "skeleton",
 };

 const baseClass = presets[variant] || presets.text;

 const style = {};
 if (width) style.width = width;
 if (height) style.height = height;

 if (count > 1) {
 return (
 <div className="space-y-3">
 {Array.from({ length: count }).map((_, i) => (
 <div
 key={i}
 className={`${baseClass} ${className}`}
 style={style}
 aria-hidden="true"
 />
 ))}
 </div>
 );
 }

 return (
 <div
 className={`${baseClass} ${className}`}
 style={style}
 aria-hidden="true"
 />
 );
}
