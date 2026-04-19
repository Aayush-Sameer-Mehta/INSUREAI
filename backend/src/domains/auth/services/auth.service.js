import { generateAccessToken, generateRefreshToken } from "../../../utils/token.js";
import { getDashboardRoute, normalizeRole } from "../../../utils/roles.js";

export function buildAuthPayload(user) {
  return {
    user_id: user._id,
    id: user._id,
    email: user.email,
    role: normalizeRole(user.role),
  };
}

export async function issueAuthTokens(user) {
  const payload = buildAuthPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    dashboardRoute: getDashboardRoute(normalizeRole(user.role)),
  };
}
