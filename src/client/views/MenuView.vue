<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useGameStore } from '../stores/gameStore';

const userStore = useUserStore();
const gameStore = useGameStore();
const router = useRouter();

if (!userStore.playerName) {
  router.push('/');
}

// S'abonne aux mises à jour du lobby en entrant dans la vue
onMounted(() => {
  gameStore.enterLobbyBrowser();
});

// Se désabonne en quittant la vue pour ne pas recevoir de mises à jour inutiles
onUnmounted(() => {
  gameStore.leaveLobbyBrowser();
});

const startSoloGame = () => {
  const roomName = `solo-${Date.now()}`;
  router.push(`/${roomName}/${userStore.playerName}`);
};

const createMultiplayerGame = () => {
  // Le nom de la partie sera simplement le nom de l'hôte
  const roomName = userStore.playerName;
  router.push(`/${roomName}/${userStore.playerName}`);
};

const joinGame = (roomName) => {
  router.push(`/${roomName}/${userStore.playerName}`);
};
</script>

<template>
  <div class="menu-container">
    <div class="actions-box">
      <h2>Menu Principal</h2>
      <p>Bonjour, <strong>{{ userStore.playerName }}</strong> !</p>
      <div class="button-group">
        <button @click="startSoloGame" class="menu-button solo">Mode Solo</button>
        <button @click="createMultiplayerGame" class="menu-button multi-create">Créer une partie</button>
      </div>
    </div>

    <div class="lobby-browser">
      <h3>Parties en attente</h3>
      <div v-if="gameStore.lobbies.length > 0" class="lobbies-table-container">
        <table>
          <thead>
            <tr>
              <th>Nom de la Partie</th>
              <th>Hôte</th>
              <th>Joueurs</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lobby in gameStore.lobbies" :key="lobby.roomName">
              <td>{{ lobby.roomName }}</td>
              <td>{{ lobby.hostName }}</td>
              <td>{{ lobby.playerCount }} / 4</td>
              <td>
                <button @click="joinGame(lobby.roomName)" class="join-button">Rejoindre</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-lobbies-message">
        <p>Aucune partie en attente pour le moment. Pourquoi ne pas en créer une ?</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 20px auto;
}

.actions-box, .lobby-browser {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.menu-button {
  color: white;
  padding: 15px 25px;
  font-size: 1.1em;
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

.lobbies-table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.join-button {
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.join-button:hover {
  background-color: #0056b3;
}

.no-lobbies-message {
  padding: 20px;
  color: #777;
}
</style>
