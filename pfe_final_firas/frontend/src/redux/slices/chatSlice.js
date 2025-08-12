import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  messages: [],
  currentConversation: null,
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const newMessage = action.payload;
      const messageExists = state.messages.some(msg => msg._id === newMessage._id);
      if (!messageExists) {
        state.messages.push(newMessage);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setCurrentConversation,
  setMessages,
  addMessage,
  clearMessages,
  setConversations,
  setLoading,
  setError
} = chatSlice.actions;

export default chatSlice.reducer;
