<script setup>
// Le composant App.vue est maintenant la "coquille" principale de l'application.
// Il ne contient que les éléments globaux et le <router-view>
// qui affichera le composant correspondant à la route actuelle.
</script>

<template>
  <div id="main-container">
    <header>
      <h1>Red Tetris</h1>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
/* Styles globaux - non "scoped" pour s'appliquer à toute l'application */
body {
  font-family: Arial, sans-serif;
  background-color: #f0f2f5;
  margin: 0;
  padding: 0;
  color: #333;
}

#main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 20px;
}

h1 {
  color: #c0392b; /* Rouge "Red Pelicans" */
}
</style>
