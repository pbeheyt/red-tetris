import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import Game from './models/Game.js'
import { GAME_TICK_MS } from '../shared/constants.js'
import debug from 'debug'
import path from 'path'
import { fileURLToPath } from 'url'

const logerror = debug('tetris:error')
const loginfo = debug('tetris:info')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOBBY_ROOM = 'global-lobby';

const activeGames = {};
const gameIntervals = {};

/**
 * Construit et diffuse la liste des parties joignables à tous les clients dans le menu.
 * @param {Server} io L'instance du serveur Socket.io.
 */
const broadcastLobbies = (io) => {
  const joinableLobbies = Object.entries(activeGames)
    .filter(([roomName, game]) => game.status === 'lobby')
    .map(([roomName, game]) => ({
      roomName: roomName,
      hostName: game.players[0].name,
      playerCount: game.players.length,
    }));
  
  io.to(LOBBY_ROOM).emit('lobbiesListUpdate', joinableLobbies);
  loginfo('Broadcasted lobbies list to clients in menu.');
};

const initEngine = (io) => {
  io.on('connection', (socket) => {
    loginfo(`Socket connected: ${socket.id}`);

    socket.on('enterLobbyBrowser', () => {
      socket.join(LOBBY_ROOM);
      loginfo(`Socket ${socket.id} entered lobby browser.`);
      // Envoie la liste actuelle dès qu'un utilisateur ouvre le menu
      const joinableLobbies = Object.entries(activeGames)
        .filter(([roomName, game]) => game.status === 'lobby')
        .map(([roomName, game]) => ({
          roomName: roomName,
          hostName: game.players[0].name,
          playerCount: game.players.length,
        }));
      socket.emit('lobbiesListUpdate', joinableLobbies);
    });

    socket.on('leaveLobbyBrowser', () => {
      socket.leave(LOBBY_ROOM);
      loginfo(`Socket ${socket.id} left lobby browser.`);
    });

    socket.on('joinGame', ({ roomName, playerName, isSpectator }) => {
      loginfo(`User ${playerName} (${socket.id}) trying to join room '${roomName}' as ${isSpectator ? 'spectator' : 'player'}`);
      socket.join(roomName);
      socket.data.roomName = roomName;

      let game = activeGames[roomName];

      if (isSpectator) {
        if (game) {
          game.addSpectator({ id: socket.id, name: playerName });
        } else {
          // Ne peut pas spectate une partie qui n'existe pas
          socket.emit('error', { message: 'Cette partie n\'existe pas.' });
          socket.leave(roomName);
          return;
        }
      } else {
        // Logique pour les joueurs
        if (!game) {
          loginfo(`Creating new game in room '${roomName}' for host ${playerName}`);
          const hostInfo = { id: socket.id, name: playerName };
          const pieceSequence = []; // TODO: Implémenter la génération de pièces
          game = new Game(hostInfo, pieceSequence);
          activeGames[roomName] = game;
        } else {
          loginfo(`Player ${playerName} is joining existing game in room '${roomName}'`);
          const added = game.addPlayer({ id: socket.id, name: playerName });
          if (!added) {
            socket.emit('error', { message: 'La partie a déjà commencé ou est pleine.' });
            socket.leave(roomName);
            return;
          }
        }
      }

      io.to(roomName).emit('gameStateUpdate', game.getCurrentGameState());
      broadcastLobbies(io);
    });

    socket.on('startGame', () => {
      const roomName = socket.data.roomName;
      const game = activeGames[roomName];
      if (game && game.players[0].id === socket.id) { // Vérifie si le joueur est l'hôte
        loginfo(`Host ${socket.id} is starting the game in room '${roomName}'`);
        game.startGame();

        // Démarre la boucle de jeu UNIQUEMENT lorsque la partie commence.
        gameIntervals[roomName] = setInterval(() => {
          const newState = game.tick();
          io.to(roomName).emit('gameStateUpdate', newState);
        }, GAME_TICK_MS);

        io.to(roomName).emit('gameStateUpdate', game.getCurrentGameState());
        // Met à jour la liste des lobbies car cette partie n'est plus joignable
        broadcastLobbies(io);
      }
    });

    socket.on('playerAction', (action) => {
      const roomName = socket.data.roomName;
      const game = activeGames[roomName];
      if (game) {
        loginfo(`Action '${action}' from ${socket.id} in room '${roomName}'`);
        game.handlePlayerAction(socket.id, action);
        // L'état sera mis à jour et diffusé au prochain tick de la boucle de jeu.
      }
    });

    /**
     * Gère la logique de départ d'un participant (joueur ou spectateur).
     * @param {import('socket.io').Socket} socket Le socket du participant qui part.
     */
    const handleParticipantLeave = (socket) => {
      const roomName = socket.data.roomName;
      if (!roomName) return;

      const game = activeGames[roomName];
      if (!game) return;

      const initialPlayerCount = game.players.length;
      const playersLeft = game.removePlayer(socket.id);

      if (playersLeft < initialPlayerCount) {
        // Un joueur a été retiré
        if (playersLeft === 0) {
          loginfo(`Room '${roomName}' is empty. Stopping game loop and deleting game.`);
          clearInterval(gameIntervals[roomName]);
          delete gameIntervals[roomName];
          delete activeGames[roomName];
        } else {
          io.to(roomName).emit('gameStateUpdate', game.getCurrentGameState());
        }
      } else {
        // Aucun joueur n'a été retiré, c'était donc un spectateur
        game.removeSpectator(socket.id);
        io.to(roomName).emit('gameStateUpdate', game.getCurrentGameState());
      }

      broadcastLobbies(io);
    };

    socket.on('leaveGame', () => {
      loginfo(`Participant ${socket.id} is leaving the game via button.`);
      handleParticipantLeave(socket);
      // Oublie la room pour ce socket pour éviter une double action à la déconnexion
      socket.data.roomName = null;
    });

    socket.on('disconnect', () => {
      loginfo(`Socket disconnected: ${socket.id}`);
      handleParticipantLeave(socket);
    });
  });
};

export const start = (params) => {
  return new Promise((resolve, reject) => {
    const app = express()
    const server = http.createServer(app)
    const io = new Server(server, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST'],
      },
    })

    initEngine(io)

    // Serve static files from the Vite build output in production
    if (process.env.NODE_ENV === 'production') {
      const clientBuildPath = path.join(__dirname, '../../dist')
      app.use(express.static(clientBuildPath))
      app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'))
      })
    }

    server.listen(params.port, params.host, () => {
      loginfo(`Server listening on ${params.url}`)

      const stop = (cb) => {
        io.close()
        server.close(() => {
          server.unref()
          loginfo('Server stopped.')
          if (cb) cb()
        })
      }

      resolve({ stop })
    }).on('error', (err) => {
      logerror(err)
      reject(err)
    })
  })
}
