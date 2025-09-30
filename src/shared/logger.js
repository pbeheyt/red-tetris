// @src/shared/logger.js

// Ce flag est utilisé pour détecter si nous sommes dans un environnement Node.js.
const isServer = typeof window === 'undefined';

/**
 * Crée une instance de logger avec un namespace spécifique.
 * Le comportement du logger s'adapte automatiquement à l'environnement (client/serveur)
 * et au mode (développement/production).
 *
 * @param {string} namespace - Le nom du module ou du contexte pour le logger (ex: 'gameStore', 'tetris:info').
 * @returns {Function} Une fonction de logging prête à l'emploi.
 */
export function createLogger(namespace) {
  if (isServer) {
    // --- Environnement Serveur (Node.js) ---
    // En production, `debug` ne sera importé que si la variable d'env `DEBUG` est définie.
    // Cela évite de charger la dépendance inutilement.
    if (process.env.DEBUG) {
      // On utilise un require dynamique pour que le bundler ne l'inclue pas toujours.
      // C'est une micro-optimisation, mais une bonne pratique.
      try {
        // eslint-disable-next-line no-undef
        const debug = require('debug');
        return debug(namespace);
      } catch (e) {
        // Au cas où la dépendance `debug` serait absente.
        return (...args) => console.log(`[${namespace}]`, ...args);
      }
    }
    // En production sans `DEBUG`, on retourne une fonction vide.
    return () => {};

  } else {
    // --- Environnement Client (Navigateur) ---
    // `import.meta.env.DEV` est une variable spéciale de Vite.
    // Elle est `true` en développement (`npm run dev`)
    // et `false` en production (`npm run build`).
    if (import.meta.env.DEV) {
      // En développement, on retourne une fonction de logging stylisée.
      return console.log.bind(
        console,
        `%c[${namespace}]`,
        'color: #71717a; font-weight: bold;'
      );
    } else {
      // En production, Vite va détecter que cette branche est "morte"
      // et la supprimera complètement du code final (tree-shaking).
      return () => {};
    }
  }
}
