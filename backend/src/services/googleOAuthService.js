import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google OAuth token and extract user information
 * @param {string} token - Google credential token from frontend
 * @returns {Promise<Object>} User info {email, name, picture, sub}
 */
export async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error("❌ Google token verification failed:", error.message);
    throw new Error(`Invalid Google token: ${error.message}`);
  }
}
