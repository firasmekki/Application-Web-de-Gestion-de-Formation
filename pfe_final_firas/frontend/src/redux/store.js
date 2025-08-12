import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import formationReducer from './slices/formationSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import themeReducer from './slices/themeSlice';
import chatReducer from './slices/chatSlice';
import adminReducer from './slices/adminSlice';
import domaineReducer from './slices/domaineSlice';
import participantReducer from './slices/participantSlice';
import formateurReducer from './slices/formateurSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    formations: formationReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    theme: themeReducer,
    chat: chatReducer,
    admin: adminReducer,
    domaines: domaineReducer,
    participant: participantReducer,
    formateur: formateurReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore ces actions pour la vérification de sérialisation
        ignoredActions: ['auth/loginSuccess', 'auth/updateUser'],
        // Ignore ces chemins dans le state
        ignoredPaths: ['auth.user', 'chat.messages']
      }
    })
});

export default store;
