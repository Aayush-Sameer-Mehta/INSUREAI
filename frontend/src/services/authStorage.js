const ACCESS_TOKEN_KEY = "insureai_access_token";
const REFRESH_TOKEN_KEY = "insureai_refresh_token";

function getStorage() {
 return window.sessionStorage;
}

export function getAccessToken() {
 return getStorage().getItem(ACCESS_TOKEN_KEY) || "";
}

export function getRefreshToken() {
 return getStorage().getItem(REFRESH_TOKEN_KEY) || "";
}

export function setTokens({ accessToken, refreshToken }) {
 const storage = getStorage();
 if (accessToken) {
 storage.setItem(ACCESS_TOKEN_KEY, accessToken);
 }
 if (refreshToken) {
 storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
 }
}

export function clearTokens() {
 const storage = getStorage();
 storage.removeItem(ACCESS_TOKEN_KEY);
 storage.removeItem(REFRESH_TOKEN_KEY);
}
