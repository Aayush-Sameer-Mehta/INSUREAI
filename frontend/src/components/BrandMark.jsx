export default function BrandMark({ className = "h-6 w-6" }) {
 return (
 <svg
 viewBox="0 0 64 64"
 xmlns="http://www.w3.org/2000/svg"
 className={className}
 role="img"
 aria-label="InsureAI brand mark"
 >
 <defs>
 <linearGradient id="brand-bg" x1="8%" y1="8%" x2="92%" y2="92%">
 <stop offset="0%" stopColor="#2563eb" />
 <stop offset="55%" stopColor="#4f46e5" />
 <stop offset="100%" stopColor="#0ea5e9" />
 </linearGradient>
 <linearGradient id="brand-core" x1="0%" y1="0%" x2="100%" y2="100%">
 <stop offset="0%" stopColor="#f8fafc" />
 <stop offset="100%" stopColor="#dbeafe" />
 </linearGradient>
 </defs>

 <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#brand-bg)" />

 <path
 d="M32 15c-7.7 6.1-15 8.7-15 8.7v9.7c0 10.9 6.9 16.7 15 20.6 8.1-3.9 15-9.7 15-20.6v-9.7S39.7 21.1 32 15z"
 fill="url(#brand-core)"
 opacity="0.95"
 />

 <path
 d="M24 37.5l6-6 4 4 6.5-8"
 fill="none"
 stroke="#1d4ed8"
 strokeWidth="3.4"
 strokeLinecap="round"
 strokeLinejoin="round"
 />

 <circle cx="45.5" cy="19.5" r="4.5" fill="#fde047" />
 <path
 d="M45.5 13.5v12M39.5 19.5h12"
 stroke="#f97316"
 strokeWidth="1.8"
 strokeLinecap="round"
 />
 </svg>
 );
}
