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
  formations: [],
  currentFormation: null,
  loading: false,
  error: null
};

// Actions asynchrones
export const obtenirFormations = createAsyncThunk(
  'formations/getFormations',
  async (_, { rejectWithValue }) => {
    try {
      console.log('obtenirFormations: Tentative de récupération...');
      // Utiliser la route générale pour récupérer toutes les formations
      const response = await axios.get(`${API_URL}/api/formations`, getConfig());
      console.log('obtenirFormations: Réponse reçue:', response.data);
      
      // Vérifier si la réponse a la structure attendue
      if (response.data && Array.isArray(response.data)) {
        // Si la réponse est directement un tableau
        return response.data;
      } else if (response.data && response.data.success && response.data.data) {
        // Si la réponse a la structure { success: true, data: [...] }
        return response.data.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Si la réponse a la structure { data: [...] }
        return response.data.data;
      }
      
      console.error('obtenirFormations: Structure de réponse inattendue:', response.data);
      throw new Error('Structure de réponse inattendue du serveur');
    } catch (error) {
      console.error('obtenirFormations: Erreur complète:', error);
      console.error('obtenirFormations: Réponse d\'erreur:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de la récupération des formations'
      );
    }
  }
);

// Action spécifique pour l'admin - récupérer toutes les formations
export const obtenirToutesFormations = createAsyncThunk(
  'formations/getToutesFormations',
  async (_, { rejectWithValue }) => {
    try {
      console.log('obtenirToutesFormations: Tentative de récupération...');
      const response = await axios.get(`${API_URL}/api/formations`, getConfig());
      console.log('obtenirToutesFormations: Réponse reçue:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      console.error('obtenirToutesFormations: Structure de réponse inattendue:', response.data);
      throw new Error('Structure de réponse inattendue du serveur');
    } catch (error) {
      console.error('obtenirToutesFormations: Erreur complète:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de la récupération des formations'
      );
    }
  }
);

export const getFormation = createAsyncThunk(
  'formations/getFormation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/formateur/formations/${id}`, getConfig());
      console.log('API Response for single formation:', response.data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Erreur lors de la récupération de la formation');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de la récupération de la formation'
      );
    }
  }
);

export const createFormation = createAsyncThunk(
  'formations/createFormation',
  async (formationData, { rejectWithValue }) => {
    try {
      console.log('Données envoyées au serveur:', formationData);
      // Utiliser la route générale pour permettre à l'admin de créer des formations
      const response = await axios.post(`${API_URL}/api/formations`, formationData, getConfig());
      console.log('API Response:', response.data);
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.status === 201) {
        // Si la formation est créée mais la réponse est vide
        return { ...formationData, message: 'Formation créée avec succès' };
      }
      throw new Error('Réponse invalide du serveur');
    } catch (error) {
      console.error('Erreur détaillée:', error.response?.data);
      if (error.response?.status === 201) {
        // Si le statut est 201 mais il y a une erreur dans la réponse
        return { ...formationData, message: 'Formation créée avec succès' };
      }
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Une erreur est survenue'
      );
    }
  }
);

export const updateFormation = createAsyncThunk(
  'formations/updateFormation',
  async ({ id, ...formationData }, { rejectWithValue }) => {
    try {
      // Utiliser la route générale pour permettre à l'admin de modifier les formations
      const response = await axios.put(`${API_URL}/api/formations/${id}`, formationData, getConfig());
      console.log('API Response:', response.data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Erreur lors de la mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la formation:', error);
      return rejectWithValue(error.response?.data?.message || 'Une erreur est survenue');
    }
  }
);

export const deleteFormation = createAsyncThunk(
  'formations/deleteFormation',
  async (id, { rejectWithValue }) => {
    try {
      // Utiliser la route générale pour permettre à l'admin de supprimer les formations
      const response = await axios.delete(`${API_URL}/api/formations/${id}`, getConfig());
      console.log('API Response:', response.data);
      if (response.data.success) {
        return id;
      }
      throw new Error(response.data.message || 'Erreur lors de la suppression');
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de la suppression de la formation'
      );
    }
  }
);

export const sInscrireFormation = createAsyncThunk(
  'formations/sInscrireFormation',
  async (formationId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/formations/${formationId}/inscription`, {}, getConfig());
      console.log('API Response:', response.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Une erreur est survenue');
    }
  }
);

export const evaluerFormation = createAsyncThunk(
  'formations/evaluerFormation',
  async ({ formationId, evaluation }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/formations/${formationId}/evaluation`, evaluation, getConfig());
      console.log('API Response:', response.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Une erreur est survenue');
    }
  }
);

export const inscrireFormation = createAsyncThunk(
  'formations/inscrireFormation',
  async (formationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        `${API_URL}/formations/${formationId}/inscription`,
        {},
        config
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Erreur lors de l\'inscription');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de l\'inscription'
      );
    }
  }
);

const formationSlice = createSlice({
  name: 'formations',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCurrentFormation(state) {
      state.currentFormation = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Formations
      .addCase(obtenirFormations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenirFormations.fulfilled, (state, action) => {
        state.loading = false;
        state.formations = action.payload;
        state.error = null;
      })
      .addCase(obtenirFormations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Toutes Formations (Admin)
      .addCase(obtenirToutesFormations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenirToutesFormations.fulfilled, (state, action) => {
        state.loading = false;
        state.formations = action.payload;
        state.error = null;
      })
      .addCase(obtenirToutesFormations.rejected, (state, action) => {
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
      // Create Formation
      .addCase(createFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFormation.fulfilled, (state, action) => {
        state.loading = false;
        state.formations.push(action.payload);
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
        const index = state.formations.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.formations[index] = action.payload;
        }
      })
      .addCase(updateFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Formation
      .addCase(deleteFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFormation.fulfilled, (state, action) => {
        state.loading = false;
        state.formations = state.formations.filter(
          (formation) => formation._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // S'inscrire Formation
      .addCase(sInscrireFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sInscrireFormation.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentFormation && state.currentFormation._id === action.payload._id) {
          state.currentFormation = action.payload;
        }
        const index = state.formations.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.formations[index] = action.payload;
        }
      })
      .addCase(sInscrireFormation.rejected, (state, action) => {
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
        if (state.currentFormation && state.currentFormation._id === action.payload._id) {
          state.currentFormation = action.payload;
        }
        const index = state.formations.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.formations[index] = action.payload;
        }
      })
      .addCase(evaluerFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Inscription à une formation
      .addCase(inscrireFormation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inscrireFormation.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(inscrireFormation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const { clearCurrentFormation, clearError } = formationSlice.actions;

// Export des alias pour la rétrocompatibilité
export { obtenirFormations as getFormations };
export { getFormation as obtenirFormation };
export { createFormation as creerFormation };
export { updateFormation as modifierFormation };
export { deleteFormation as supprimerFormation };

export default formationSlice.reducer;
