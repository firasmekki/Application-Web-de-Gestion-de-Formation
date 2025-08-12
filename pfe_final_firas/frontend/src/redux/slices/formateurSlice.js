import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  loading: false,
  error: null,
  formations: [],
  statistics: null,
  currentFormation: null,
};

// Thunk to fetch all formations
export const fetchFormations = createAsyncThunk(
  'formateur/fetchFormations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/formateur/formations');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors du chargement des formations');
    }
  }
);

// Thunk to create a new formation
export const createFormation = createAsyncThunk(
  'formateur/createFormation',
  async (formationData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/formateur/formations', formationData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors de la création de la formation');
    }
  }
);

// Thunk to update a formation
export const updateFormation = createAsyncThunk(
  'formateur/updateFormation',
  async ({ id, formationData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/formateur/formations/${id}`, formationData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors de la mise à jour de la formation');
    }
  }
);

// Thunk to get a single formation
export const getFormation = createAsyncThunk(
  'formateur/getFormation',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/formateur/formations/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors du chargement de la formation');
    }
  }
);

// Thunk to delete a formation
export const supprimerFormation = createAsyncThunk(
  'formateur/supprimerFormation',
  async ({ id, motif }, { rejectWithValue }) => {
    try {
      await axios.delete(`/formateur/formations/${id}`, { data: { motif } });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors de la suppression de la formation');
    }
  }
);

// Thunk to fetch statistics
export const fetchStatistics = createAsyncThunk(
  'formateur/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/formateur/statistics');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors du chargement des statistiques');
    }
  }
);

// Rename exports for French compatibility
export const {
  fetchFormations: obtenirFormationsFormateur,
  createFormation: creerFormation,
  updateFormation: modifierFormation,
  getFormation: obtenirFormation,
  supprimerFormation: supprimerFormationFormateur,
  fetchStatistics: obtenirStatistiquesFormateur
} = {
  fetchFormations,
  createFormation,
  updateFormation,
  getFormation,
  supprimerFormation,
  fetchStatistics
};

const formateurSlice = createSlice({
  name: 'formateur',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFormation: (state) => {
      state.currentFormation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Formations
      .addCase(fetchFormations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormations.fulfilled, (state, action) => {
        state.loading = false;
        state.formations = action.payload;
        state.error = null;
      })
      .addCase(fetchFormations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Formation
      .addCase(createFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFormation.fulfilled, (state, action) => {
        state.loading = false;
        state.formations.unshift(action.payload);
        state.error = null;
      })
      .addCase(createFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Formation
      .addCase(updateFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFormation.fulfilled, (state, action) => {
        state.loading = false;
        state.formations = state.formations.map(formation =>
          formation._id === action.payload._id ? action.payload : formation
        );
        state.currentFormation = action.payload;
        state.error = null;
      })
      .addCase(updateFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Formation
      .addCase(getFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFormation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFormation = action.payload;
        state.error = null;
      })
      .addCase(getFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Formation
      .addCase(supprimerFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(supprimerFormation.fulfilled, (state, action) => {
        state.loading = false;
        state.formations = state.formations.filter(
          (formation) => formation._id !== action.payload
        );
        state.error = null;
      })
      .addCase(supprimerFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentFormation } = formateurSlice.actions;
export default formateurSlice.reducer;
