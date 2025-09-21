<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import BaseButton from '../components/ui/BaseButton.vue';

const userStore = useUserStore();
const router = useRouter();

// Utilise le nom du store ou une chaîne vide
const playerNameInput = ref(userStore.playerName);

const continueToMenu = () => {
  if (playerNameInput.value.trim()) {
    userStore.setPlayerName(playerNameInput.value.trim());
    router.push('/menu');
  } else {
    alert('Veuillez entrer un nom.');
  }
};
</script>

<template>
  <div class="welcome-container">
    <h2>Bienvenue sur Red Tetris !</h2>
    <p>Pour commencer, veuillez entrer votre nom.</p>
    <form @submit.prevent="continueToMenu" class="name-form">
      <input
        v-model="playerNameInput"
        type="text"
        placeholder="Votre nom"
        required
        class="name-input"
      />
      <BaseButton type="submit">Continuer</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.welcome-container {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  padding: 40px;
  margin: 50px auto;
  max-width: 500px;
  border-radius: 8px;
  text-align: center;
}

.name-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.name-input {
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
