import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { API_URL } from '../../config';

const loadState = () => {
  try {
    const serializedUser = localStorage.getItem('user');
    const serializedToken = localStorage.getItem('token');
    return {
      user: serializedUser ? JSON.parse(serializedUser) : null,
      token: serializedToken || null,
      isAuthenticated: Boolean(serializedToken),
      loading: false,
      error: null
    };
  } catch (err) {
    console.error('Error loading auth state:', err);
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    };
  }
};

const initialState = loadState();

// Load User
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.response?.data?.message || 'Session expirée');
    }
  }
);

// Register User
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/inscription`, userData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
        return {
          token: response.data.token,
          user: response.data.utilisateur
        };
      }
      return rejectWithValue('Erreur lors de l\'inscription');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  }
);

// Login User
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('URL de l\'API:', API_URL);
      console.log('Tentative de connexion avec:', credentials);
      
      const response = await axios.post(`${API_URL}/api/auth/connexion`, credentials);
      console.log('Réponse du serveur:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
        return {
          token: response.data.token,
          user: response.data.utilisateur
        };
      } else {
        return rejectWithValue(response.data.message || 'Échec de la connexion');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse d\'erreur:', error.response);
      
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || 'Erreur lors de la connexion');
      } else if (error.request) {
        // La requête a été faite mais pas de réponse reçue
        console.error('Pas de réponse reçue:', error.request);
        return rejectWithValue('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration:', error.message);
        return rejectWithValue('Erreur de configuration de la requête');
      }
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      // Sauvegarder dans localStorage
      try {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      } catch (err) {
        console.error('Error saving auth state:', err);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      
      // Nettoyer localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      
      // Nettoyer localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      try {
        localStorage.setItem('user', JSON.stringify(state.user));
      } catch (err) {
        console.error('Error saving updated user:', err);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload || 'Une erreur est survenue';
        // Ne pas effacer localStorage ici pour permettre de réessayer
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
  updateUser 
} = authSlice.actions;

export default authSlice.reducer;
