import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    drawerOpen: true,
    alert: {
      show: false,
      type: 'info',
      message: '',
    },
    confirmDialog: {
      show: false,
      title: '',
      message: '',
      onConfirm: null,
    },
  },
  reducers: {
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
    showAlert: (state, action) => {
      state.alert = {
        show: true,
        type: action.payload.type || 'info',
        message: action.payload.message,
      };
    },
    hideAlert: (state) => {
      state.alert = {
        show: false,
        type: 'info',
        message: '',
      };
    },
    showConfirmDialog: (state, action) => {
      state.confirmDialog = {
        show: true,
        title: action.payload.title,
        message: action.payload.message,
        onConfirm: action.payload.onConfirm,
      };
    },
    hideConfirmDialog: (state) => {
      state.confirmDialog = {
        show: false,
        title: '',
        message: '',
        onConfirm: null,
      };
    },
  },
});

export const {
  toggleDrawer,
  showAlert,
  hideAlert,
  showConfirmDialog,
  hideConfirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
