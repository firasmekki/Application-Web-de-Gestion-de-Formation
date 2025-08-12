import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Configuration pour inclure le token dans les requêtes
const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true
  };
};

const initialState = {
  items: [],
  loading: false,
  error: null
};

// Async thunk actions
export const getDomaines = createAsyncThunk(
  'domaines/getDomaines',
  async (_, { rejectWithValue }) => {
    try {
      console.log('getDomaines: Tentative de récupération des domaines...');
      const response = await axios.get(`${API_URL}/api/domaines`, getConfig());
      console.log('getDomaines: Réponse reçue:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('getDomaines: Erreur:', error);
      return rejectWithValue(error.response?.data?.message || 'Une erreur est survenue');
    }
  }
);

export const ajouterDomaine = createAsyncThunk(
  'domaines/ajouterDomaine',
  async (domaine, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/domaines`, domaine, getConfig());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Une erreur est survenue');
    }
  }
);

export const modifierDomaine = createAsyncThunk(
  'domaines/modifierDomaine',
  async ({ id, nom, description }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/api/domaines/${id}`, { nom, description }, getConfig());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Une erreur est survenue');
    }
  }
);

export const supprimerDomaine = createAsyncThunk(
  'domaines/supprimerDomaine',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/domaines/${id}`, getConfig());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Une erreur est survenue');
    }
  }
);

const domaineSlice = createSlice({
  name: 'domaines',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Domaines
      .addCase(getDomaines.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDomaines.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getDomaines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Domaine
      .addCase(ajouterDomaine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ajouterDomaine.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(ajouterDomaine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Domaine
      .addCase(modifierDomaine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifierDomaine.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(modifierDomaine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Domaine
      .addCase(supprimerDomaine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(supprimerDomaine.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(supprimerDomaine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default domaineSlice.reducer;
