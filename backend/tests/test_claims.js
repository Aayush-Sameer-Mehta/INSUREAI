import axios from "axios";

const baseURL = process.env.API_BASE_URL || "http://127.0.0.1:5001";
const email = process.env.ADMIN_EMAIL || "admin@insureai.com";
const password = process.env.ADMIN_PASSWORD || "password123";

async function testClaims() {
    try {
        const login = await axios.post(`${baseURL}/api/auth/login`, {
            email,
            password,
        });

        const token = login.data.accessToken;
        if (!token) {
            throw new Error("Login succeeded but no accessToken was returned.");
        }

        console.log(`Login success for ${email}`);

        const res = await axios.get(`${baseURL}/api/admin/claims`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log(
            "Claims success:",
            Array.isArray(res.data) ? `${res.data.length} claims` : res.data,
        );
    } catch (err) {
        console.error("API Error:", err.response ? err.response.data : err.message);
        process.exitCode = 1;
    }
}

await testClaims();
