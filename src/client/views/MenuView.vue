<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useGameStore } from '../stores/gameStore';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';

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
    <BaseCard>
      <template #header>
        <h2>Menu Principal</h2>
      </template>
      <div class="welcome-message">
        <p>Bonjour, <strong>{{ userStore.playerName }}</strong> !</p>
        <BaseButton @click="handleChangeName" variant="secondary" class="change-name-button">Changer de nom</BaseButton>
      </div>

      <div class="main-actions">
        <BaseButton @click="startSoloGame" variant="success">Mode Solo</BaseButton>

        <form @submit.prevent="createMultiplayerGame" class="create-game-form">
          <input
            v-model="newRoomName"
            type="text"
            placeholder="Nom de la nouvelle partie"
            required
            class="room-name-input"
          />
          <BaseButton type="submit" variant="info">Créer une partie</BaseButton>
        </form>
      </div>
    </BaseCard>

    <BaseCard>
      <template #header>
        <h3>Parties en attente</h3>
      </template>
      <div v-if="gameStore.lobbies.length > 0" class="lobbies-table-container">
        <table>
          <thead>
            <tr>
              <th>Nom de la Partie</th>
              <th>Hôte</th>
              <th>Joueurs</th>
              <th>Statut</th>
              <th colspan="2">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lobby in gameStore.lobbies" :key="lobby.roomName">
              <td>{{ lobby.roomName }}</td>
              <td>{{ lobby.hostName }}</td>
              <td>{{ lobby.playerCount }} / 4</td>
              <td>
                <span :class="['status', `status-${lobby.status}`]">{{ lobby.status }}</span>
              </td>
              <td>
                <BaseButton
                  @click="joinGame(lobby.roomName)"
                  variant="success"
                  :disabled="lobby.status === 'playing'"
                  style="padding: 8px 12px; font-size: 0.9em;"
                >Rejoindre</BaseButton>
              </td>
              <td>
                <BaseButton @click="spectateGame(lobby.roomName)" variant="secondary" style="padding: 8px 12px; font-size: 0.9em;">Spectateur</BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-lobbies-message">
        <p>Aucune partie en attente pour le moment. Pourquoi ne pas en créer une ?</p>
      </div>
    </BaseCard>

    <BaseCard>
      <template #header>
        <h3>🏆 Leaderboard 🏆</h3>
      </template>
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
    </BaseCard>
  </div>
</template>

<style scoped>
.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px; /* Augmentation de la marge */
}

.change-name-button {
  padding: 5px 10px;
  font-size: 0.8em; /* Style de l'ancien bouton en ligne */
}

.main-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 350px; /* Limite la largeur pour un meilleur aspect */
  margin: 0 auto; /* Centre le bloc d'actions */
}

/* Assure que les boutons directs et ceux dans le formulaire prennent toute la largeur */
.main-actions > .base-button,
.main-actions .base-button {
  width: 100%;
  box-sizing: border-box; /* Important pour que le padding ne casse pas la largeur */
}


.menu-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 20px auto;
}

.create-game-form {
  display: flex;
  flex-direction: column; /* Empile l'input et le bouton */
  gap: 10px;
}

.room-name-input {
  font-family: inherit;
  font-size: 1em;
  background-color: #111;
  color: var(--text-color, #e0e0e0);
  border: 2px solid var(--border-color, #444);
  border-radius: 0;
  padding: 10px;
  flex-grow: 1;
}

.room-name-input::placeholder {
  color: #777;
}


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
  border-bottom: 1px solid var(--border-color, #444);
  text-align: left;
  vertical-align: middle;
}

th {
  background-color: #111;
  font-size: 1.1em;
}


.status {
  font-size: 0.9em;
  color: inherit;
}

.status-lobby {
  color: #28a745; /* green */
}

.status-playing {
  color: #ffc107; /* yellow */
}

.no-lobbies-message {
  padding: 20px;
  color: #777;
}


.leaderboard td:first-child, .leaderboard th:first-child {
  font-weight: bold;
  text-align: center;
}
</style>
