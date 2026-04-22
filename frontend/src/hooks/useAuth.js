import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  loadProfile,
  login as loginAction,
  loginWithGoogle as loginWithGoogleAction,
  register as registerAction,
  logout as logoutAction,
  setUser as setUserAction,
} from '../store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (authState.token && !authState.user && authState.authLoading) {
      dispatch(loadProfile());
    }
  }, [dispatch, authState.token, authState.user, authState.authLoading]);

  const login = useCallback(
    async (payload) => {
      const result = await dispatch(loginAction(payload)).unwrap();
      return result;
    },
    [dispatch]
  );

  const register = useCallback(
    async (payload) => {
      const result = await dispatch(registerAction(payload)).unwrap();
      return result;
    },
    [dispatch]
  );

  const loginWithGoogle = useCallback(
    async (googleCredentialToken) => {
      const result = await dispatch(loginWithGoogleAction(googleCredentialToken)).unwrap();
      return result;
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const setUser = useCallback(
    (user) => {
      dispatch(setUserAction(user));
    },
    [dispatch]
  );

  return {
    ...authState,
    isAuthenticated: Boolean(authState.token),
    login,
    loginWithGoogle,
    register,
    logout,
    setUser,
  };
}
