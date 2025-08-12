import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setConversations,
  setCurrentConversation,
  setMessages,
  addMessage,
  clearMessages,
  setLoading,
  setError
} = chatSlice.actions;

// Thunk pour charger les conversations
export const fetchConversations = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.get(`${API_URL}/api/chat/conversations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      withCredentials: true
    });
    
    if (response.data.success) {
      dispatch(setConversations(response.data.data));
    } else {
      dispatch(setError('Erreur lors du chargement des conversations'));
    }
  } catch (error) {
    console.error('Erreur fetchConversations:', error);
    dispatch(setError(error.message));
  }
};

// Thunk pour charger les messages
export const fetchMessages = (chatId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.get(`${API_URL}/api/chat/messages/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      withCredentials: true
    });
    
    if (response.data.success) {
      dispatch(setMessages(response.data.data));
    } else {
      dispatch(setError('Erreur lors du chargement des messages'));
    }
  } catch (error) {
    console.error('Erreur fetchMessages:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default chatSlice.reducer;
