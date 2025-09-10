<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const router = useRouter();

if (!userStore.playerName) {
  router.push('/');
}

const generateRoomName = () => `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const startSoloGame = () => {
  const roomName = `solo-${Date.now()}`;
  router.push(`/${roomName}/${userStore.playerName}`);
};

const createMultiplayerGame = () => {
  const roomName = generateRoomName();
  router.push(`/${roomName}/${userStore.playerName}`);
};

const joinMultiplayerGame = () => {
  const roomName = prompt("Veuillez entrer le nom de la partie que vous souhaitez rejoindre :");
  if (roomName && roomName.trim()) {
    router.push(`/${roomName.trim()}/${userStore.playerName}`);
  }
};
</script>

<template>
  <div class="menu-container">
    <h2>Menu Principal</h2>
    <p>Bonjour, <strong>{{ userStore.playerName }}</strong> !</p>
    <div class="button-group">
      <button @click="startSoloGame" class="menu-button solo">Mode Solo</button>
      <button @click="createMultiplayerGame" class="menu-button multi-create">Créer une partie</button>
      <button @click="joinMultiplayerGame" class="menu-button multi-join">Rejoindre une partie</button>
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  padding: 40px;
  margin: 50px auto;
  max-width: 500px;
  border-radius: 8px;
  text-align: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.menu-button {
  color: white;
  padding: 15px;
  font-size: 1.2em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.menu-button:hover {
  opacity: 0.9;
}

.solo { background-color: #28a745; }
.multi-create { background-color: #17a2b8; }
.multi-join { background-color: #ffc107; color: #333; }
</style>
