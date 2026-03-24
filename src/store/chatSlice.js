import { createSlice } from '@reduxjs/toolkit';

const dummyResponses = [
  "This feature will be available soon — Abhinav",
];

let responseIdx = 0;

const initialState = {
  isOpen: false,
  messages: [
    {
      id: 1,
      role: 'ai',
      text: "Hey 👋 AI assistant is coming soon. — Abhinav",
      timestamp: new Date().toISOString(),
    },
  ],
  isTyping: false,
  nextId: 2,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    sendMessage: (state, action) => {
      state.messages.push({
        id: state.nextId++,
        role: 'user',
        text: action.payload,
        timestamp: new Date().toISOString(),
      });
      state.isTyping = true;
    },
    receiveMessage: (state) => {
      state.isTyping = false;
      state.messages.push({
        id: state.nextId++,
        role: 'ai',
        text: dummyResponses[responseIdx % dummyResponses.length],
        timestamp: new Date().toISOString(),
      });
      responseIdx++;
    },
    clearChat: (state) => {
      state.messages = [
        {
          id: 1,
          role: 'ai',
          text: "Hey 👋 AI assistant is coming soon. — Abhinav",
          timestamp: new Date().toISOString(),
        },
      ];
      state.nextId = 2;
    },
  },
});

export const { toggleChat, openChat, closeChat, sendMessage, receiveMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
