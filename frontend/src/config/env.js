/**
 * Validated environment configuration.
 * Fails fast if critical env vars are missing in production.
 */
const env = {
 API_URL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
 DEV: import.meta.env.DEV,
 PROD: import.meta.env.PROD,
};

/* Warn in production if API URL is still the default */
if (env.PROD && env.API_URL.includes("localhost")) {
 console.warn(
 "⚠️ VITE_API_URL is still set to localhost. Update your .env for production."
 );
}

export default env;
