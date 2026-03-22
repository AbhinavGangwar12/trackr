import { createSlice } from '@reduxjs/toolkit';

const dummyResponses = [
  "Analyzing your training data... Based on your recent volume trends, you're on track for progressive overload. 💪",
  "I see your squat went up to 100kg! That's solid. Make sure you're hitting depth consistently before adding more weight.",
  "Your task completion rate dropped on Thursday. Consider batching easier tasks earlier in the day to build momentum.",
  "For your JWT implementation — make sure your refresh token rotation is handled correctly on concurrent requests.",
  "Rest day detected. Active recovery recommended: 20-minute walk or light stretching. Your CNS will thank you.",
  "Productivity insight: You complete 87% of high-priority tasks but only 55% of low-priority ones. That's actually healthy prioritization.",
  "Your bench press progression looks strong — 5kg in 4 weeks. If that slows, add a back-off set at 85% intensity.",
  "Next Puppet phase: after hostname setup, the `/etc/hosts` entries are critical before Puppet Server will resolve agents correctly.",
];

let responseIdx = 0;

const initialState = {
  isOpen: false,
  messages: [
    {
      id: 1,
      role: 'ai',
      text: "Hey Abhi 👋 I'm your TRACKR assistant. Ask me about your tasks, workouts, or code. I'm connected to your data.",
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
          text: "Hey Abhi 👋 I'm your TRACKR assistant. Chat cleared. What's on your mind?",
          timestamp: new Date().toISOString(),
        },
      ];
      state.nextId = 2;
    },
  },
});

export const { toggleChat, openChat, closeChat, sendMessage, receiveMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
