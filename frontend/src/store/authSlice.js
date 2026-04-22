import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe, loginUser, registerUser } from '../services/authService';
import { googleLogin as googleLoginService } from '../services/googleAuthService';
import { clearTokens, getAccessToken, setTokens } from '../services/authStorage';
import { extractAuthUser, getDashboardRouteForRole } from '../utils/auth';

export const loadProfile = createAsyncThunk('auth/loadProfile', async (_, { rejectWithValue }) => {
  try {
    const profile = await getMe();
    return profile;
  } catch (error) {
    clearTokens();
    return rejectWithValue(error.response?.data || 'Failed to load profile');
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await loginUser(payload);
    setTokens(response);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await registerUser(payload);
    setTokens(response);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Registration failed');
  }
});

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleCredentialToken, { rejectWithValue }) => {
    try {
      const response = await googleLoginService(googleCredentialToken);
      setTokens(response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Google login failed');
    }
  },
);

const initialState = {
  user: null,
  token: getAccessToken(),
  dashboardRoute: '/user/dashboard',
  authLoading: Boolean(getAccessToken()),
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      clearTokens();
      state.user = null;
      state.token = '';
      state.dashboardRoute = '/user/dashboard';
      state.error = null;
    },
    setTokenOnly: (state, action) => {
      state.token = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.dashboardRoute = getDashboardRouteForRole(action.payload?.role);
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadProfile
      .addCase(loadProfile.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        const profile = action.payload;
        const resolvedUser = extractAuthUser(profile);
        state.user = resolvedUser;
        state.dashboardRoute = profile?.dashboardRoute || getDashboardRouteForRole(resolvedUser?.role);
        state.authLoading = false;
        state.error = null;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.user = null;
        state.token = '';
        state.dashboardRoute = '/user/dashboard';
        state.authLoading = false;
        state.error = action.payload;
      })
      // login
      .addCase(login.fulfilled, (state, action) => {
        const response = action.payload;
        state.token = response.accessToken;
        state.user = response.user;
        state.dashboardRoute = response.dashboardRoute || getDashboardRouteForRole(response.user?.role);
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
      })
      // register
      .addCase(register.fulfilled, (state, action) => {
        const response = action.payload;
        state.token = response.accessToken;
        state.user = response.user;
        state.dashboardRoute = response.dashboardRoute || getDashboardRouteForRole(response.user?.role);
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
      })
      // loginWithGoogle
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        const response = action.payload;
        const resolvedUser = extractAuthUser(response);
        state.token = response.accessToken;
        state.user = resolvedUser;
        state.dashboardRoute =
          response.dashboardRoute || getDashboardRouteForRole(resolvedUser?.role);
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, setTokenOnly, setAuthLoading, setUser } = authSlice.actions;

export default authSlice.reducer;
