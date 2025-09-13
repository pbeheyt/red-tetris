<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useGameStore } from '../stores/gameStore';

const userStore = useUserStore();
const gameStore = useGameStore();
const router = useRouter();

const newRoomName = ref('');

if (!userStore.playerName) {
  router.push('/');
}

// S'abonne aux mises à jour et charge les données initiales en entrant dans la vue
onMounted(() => {
  gameStore.enterLobbyBrowser();
  gameStore.fetchLeaderboard();
});

// Se désabonne en quittant la vue pour ne pas recevoir de mises à jour inutiles
onUnmounted(() => {
  gameStore.leaveLobbyBrowser();
});

const startSoloGame = () => {
  const roomName = `solo-${Date.now()}`;
  router.push(`/${roomName}/${userStore.playerName}?solo=true`);
};

const createMultiplayerGame = () => {
  const roomName = newRoomName.value.trim();
  if (roomName) {
    router.push(`/${roomName}/${userStore.playerName}`);
  } else {
    alert('Veuillez donner un nom à votre partie.');
  }
};

const joinGame = (roomName) => {
  router.push(`/${roomName}/${userStore.playerName}`);
};

const spectateGame = (roomName) => {
  router.push(`/${roomName}/${userStore.playerName}?spectate=true`);
};

const handleChangeName = () => {
  router.push('/');
};
</script>

<template>
  <div class="menu-container">
    <div class="actions-box">
      <h2>Menu Principal</h2>
      <div class="welcome-message">
        <p>Bonjour, <strong>{{ userStore.playerName }}</strong> !</p>
        <button @click="handleChangeName" class="change-name-button">Changer de nom</button>
      </div>
      <button @click="startSoloGame" class="menu-button solo">Mode Solo</button>

      <form @submit.prevent="createMultiplayerGame" class="create-game-form">
        <input
          v-model="newRoomName"
          type="text"
          placeholder="Nom de la nouvelle partie"
          required
          class="room-name-input"
        />
        <button type="submit" class="menu-button multi-create">Créer une partie</button>
      </form>
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
              <th colspan="2">Action</th>
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
              <td>
                <button @click="spectateGame(lobby.roomName)" class="spectate-button">Spectateur</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-lobbies-message">
        <p>Aucune partie en attente pour le moment. Pourquoi ne pas en créer une ?</p>
      </div>
    </div>

    <div class="leaderboard">
      <h3>🏆 Leaderboard 🏆</h3>
      <div v-if="gameStore.leaderboard.length > 0" class="lobbies-table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in gameStore.leaderboard" :key="entry.id">
              <td>{{ index + 1 }}</td>
              <td>{{ entry.name }}</td>
              <td>{{ entry.score }}</td>
              <td>{{ new Date(entry.date).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-lobbies-message">
        <p>Aucun score enregistré. Soyez le premier à entrer dans la légende !</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.change-name-button {
  background-color: #6c757d;
  color: white;
  padding: 5px 10px;
  font-size: 0.8em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.change-name-button:hover {
  background-color: #5a6268;
}

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

.create-game-form {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  align-items: stretch;
}

.room-name-input {
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 8px;
  flex-grow: 1;
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

.spectate-button {
  background-color: #6c757d;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.spectate-button:hover {
  background-color: #5a6268;
}

.no-lobbies-message {
  padding: 20px;
  color: #777;
}

.leaderboard {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.leaderboard td:first-child, .leaderboard th:first-child {
  font-weight: bold;
  text-align: center;
}
</style>
