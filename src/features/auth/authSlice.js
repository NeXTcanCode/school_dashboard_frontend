import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: sessionStorage.getItem('token') || null,
  user: (() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      return storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  })(),
  isAuthenticated: !!sessionStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    },
    updateSchoolFeatures: (state, action) => {
      if (state.user) {
        state.user.features = action.payload;
        sessionStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    updateSchoolName: (state, action) => {
      if (state.user) {
        state.user.schoolName = action.payload;
        sessionStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  },
});

export const { setCredentials, logout, updateSchoolFeatures, updateSchoolName } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
