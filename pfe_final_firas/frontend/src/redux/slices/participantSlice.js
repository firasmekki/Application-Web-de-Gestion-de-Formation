import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  formationsInscrites: [],
  notifications: [],
  historique: [],
  loading: false,
  error: null
};

// Async thunks
export const fetchInscriptions = createAsyncThunk(
  'participant/fetchInscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token not found');
      }

      const response = await axios.get(`${API_URL}/api/participant/inscriptions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération des inscriptions');
    }
  }
);

export const fetchHistorique = createAsyncThunk(
  'participant/fetchHistorique',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token not found');
      }

      const response = await axios.get(`${API_URL}/api/participant/historique`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return response.data.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Historique error:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique');
    }
  }
);

export const telechargerCertificat = createAsyncThunk(
  'participant/telechargerCertificat',
  async (formationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token not found');
      }

      const response = await axios.get(
        `${API_URL}/api/participant/formations/${formationId}/certificat`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du téléchargement du certificat');
    }
  }
);

export const evaluerFormation = createAsyncThunk(
  'participant/evaluerFormation',
  async ({ formationId, evaluation }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token not found');
      }

      const response = await axios.post(
        `${API_URL}/api/participant/formations/${formationId}/evaluation`,
        evaluation,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de l\'évaluation de la formation');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'participant/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token not found');
      }

      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération des notifications');
    }
  }
);

// Rename exports for French compatibility
export const {
  fetchInscriptions: obtenirFormationsInscrites,
  fetchHistorique: obtenirHistoriqueFormations,
  fetchNotifications: obtenirNotifications
} = { fetchInscriptions, fetchHistorique, fetchNotifications };

// Slice
const participantSlice = createSlice({
  name: 'participant',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inscriptions
      .addCase(fetchInscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.formationsInscrites = action.payload;
      })
      .addCase(fetchInscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Historique
      .addCase(fetchHistorique.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistorique.fulfilled, (state, action) => {
        state.loading = false;
        state.historique = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchHistorique.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.historique = [];
      })
      // Telecharger Certificat
      .addCase(telechargerCertificat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(telechargerCertificat.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the downloaded certificate
      })
      .addCase(telechargerCertificat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Evaluer Formation
      .addCase(evaluerFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(evaluerFormation.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the evaluation response
      })
      .addCase(evaluerFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = participantSlice.actions;
export default participantSlice.reducer;
