import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';



const initialState = {
  loading: false,
  error: null,
  statistics: {
    global: null,
    formations: null,
    formateurs: null,
    participants: null
  },
  users: [],
};



export const fetchStatistics = createAsyncThunk(
  'admin/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching statistics...');
      console.log('Fetching global stats...');
      const globalStats = await axios.get(`/statistiques/global`);
      console.log('Global stats response:', globalStats.data);
      
      console.log('Fetching formations stats...');
      const formationsStats = await axios.get(`/statistiques/formations`);
      console.log('Formations stats response:', formationsStats.data);
      
      console.log('Fetching formateurs stats...');
      const formateursStats = await axios.get(`/statistiques/formateurs`);
      console.log('Formateurs stats response:', formateursStats.data);
      
      console.log('Fetching participants stats...');
      const participantsStats = await axios.get(`/statistiques/participants`);
      console.log('Participants stats response:', participantsStats.data);

      const result = {
        global: globalStats.data.data,
        formations: formationsStats.data.data,
        formateurs: formateursStats.data.data,
        participants: participantsStats.data.data
      };
      
      console.log('Final statistics result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching statistics:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching users...');
      const { data } = await axios.get(`/utilisateurs`);
      console.log('Users response:', data);
      return data.data;
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const modifierUtilisateur = createAsyncThunk(
  'admin/modifierUtilisateur',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Updating user...');
      const { data } = await axios.put(
        `/utilisateurs/${userData.id}`,
        userData
      );
      console.log('User updated response:', data);
      return data.data;
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const supprimerUtilisateur = createAsyncThunk(
  'admin/supprimerUtilisateur',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Deleting user...');
      await axios.delete(`/utilisateurs/${userId}`);
      console.log('User deleted successfully');
      return userId;
    } catch (error) {
      console.error('Error deleting user:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const changerStatutUtilisateur = createAsyncThunk(
  'admin/changerStatutUtilisateur',
  async ({ userId, statut }, { rejectWithValue }) => {
    try {
      console.log('Changing user status...');
      console.log('Request payload:', { statut });
      
      const { data } = await axios.patch(
        `/utilisateurs/${userId}/statut`,
        { statut }
      );
      console.log('User status changed response:', data);
      return data.data;
    } catch (error) {
      console.error('Error changing user status:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Statistics loading...');
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
        state.error = null;
        console.log('Statistics loaded successfully:', action.payload);
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Statistics loading failed:', action.payload);
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Users loading...');
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        console.log('Users loaded successfully:', action.payload);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Users loading failed:', action.payload);
      })
      // Modify User
      .addCase(modifierUtilisateur.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Updating user...');
      })
      .addCase(modifierUtilisateur.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        console.log('User updated successfully:', action.payload);
      })
      .addCase(modifierUtilisateur.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Updating user failed:', action.payload);
      })
      // Delete User
      .addCase(supprimerUtilisateur.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Deleting user...');
      })
      .addCase(supprimerUtilisateur.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        console.log('User deleted successfully:', action.payload);
      })
      .addCase(supprimerUtilisateur.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Deleting user failed:', action.payload);
      })
      // Change User Status
      .addCase(changerStatutUtilisateur.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Changing user status...');
      })
      .addCase(changerStatutUtilisateur.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        console.log('User status changed successfully:', action.payload);
      })
      .addCase(changerStatutUtilisateur.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Changing user status failed:', action.payload);
      });
  }
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
