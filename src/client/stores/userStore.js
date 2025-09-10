import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    playerName: localStorage.getItem('playerName') || '',
  }),
  actions: {
    setPlayerName(name) {
      this.playerName = name;
      localStorage.setItem('playerName', name);
    },
  },
});
