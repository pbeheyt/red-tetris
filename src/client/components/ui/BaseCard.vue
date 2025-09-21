<script setup>
// Ce composant n'a pas besoin de script pour le moment.
// Il est purement structurel et stylistique.
</script>

<template>
  <div class="base-card">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>
    <main class="card-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.base-card {
  background-color: #f9f9f9;
  border: 2px solid #1a1a1a;
  
  /* Ombre portée dure, style 8-bit, pour la profondeur */
  box-shadow: 4px 4px 0px 0px #1a1a1a;
  
  /* Pas de coins arrondis pour un look "bloc" */
  border-radius: 0;
  
  margin: 40px auto; /* Centre la carte et ajoute de l'espace vertical */
  max-width: 800px;
}

.card-header {
  padding: 10px 15px;
  background-color: #e0e0e0;
  border-bottom: 2px solid #1a1a1a;
  text-align: center;
}

/* Cible directement les éléments de titre pour un style cohérent */
.card-header > :first-child {
  margin: 0;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-content {
  padding: 20px;
  text-align: center;
}
</style>
