# .dockerignore

```
# Git
.git
.gitignore

# Node
node_modules
npm-debug.log

# Build output
dist
coverage

# Docker
.dockerignore
Dockerfile
docker-compose.yml
docker-compose.prod.yml

# Editor/OS
.vscode
.idea
.DS_Store

```

# codebase_tree.md

```md
.
├── codebase.md
├── codebase_tree.md
├── docker-compose.prod.yml
├── docker-compose.yml
├── Dockerfile
├── index.html
├── Makefile
├── package.json
├── package-lock.json
├── params.js
├── README.md
├── src
│   ├── client
│   │   ├── App.vue
│   │   └── main.js
│   └── server
│       ├── index.js
│       └── main.js
└── vite.config.js

4 directories, 16 files

```

# docker-compose.prod.yml

```yml
# docker-compose.prod.yml for Production
version: '3.8'

services:
  red-tetris-prod:
    build:
      context: .
      target: production # Build the final 'production' stage
    container_name: red-tetris-prod
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=production

```

# docker-compose.yml

```yml
# docker-compose.yml for Development
version: '3.8'

services:
  red-tetris-dev:
    build:
      context: .
      target: deps # Build only up to the 'deps' stage
    container_name: red-tetris-dev
    command: npm run dev
    ports:
      - "8080:8080" # Vite client dev server
      - "3004:3004" # Node.js server
    volumes:
      - .:/usr/src/app # Mount source code for hot-reloading
      - /usr/src/app/node_modules # Do not mount local node_modules

```

# Dockerfile

```
# Stage 1: Install all dependencies (dev and prod)
FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Stage 2: Build the client application
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run client-build

# Stage 3: Production image
FROM node:18-alpine AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy production dependencies from 'deps' stage
COPY --from=deps /usr/src/app/package*.json ./
RUN npm install --omit=dev

# Copy server source code
COPY ./src/server ./src/server
COPY ./params.js ./params.js

# Copy client build from 'builder' stage
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3004

CMD [ "npm", "start" ]

```

# index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="http://redpelicans.com/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Red Tetris</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/client/main.js"></script>
  </body>
</html>

```

# Makefile

```
# Makefile for Red Tetris Project

.PHONY: dev stop build prod-up prod-down clean help

# Default command
help:
	@echo "Available commands:"
	@echo "  make dev         - Start the development environment (client + server with hot-reload)"
	@echo "  make stop        - Stop the development environment"
	@echo "  make build       - Build the production Docker image"
	@echo "  make prod-up     - Start the production environment in detached mode"
	@echo "  make prod-down   - Stop the production environment"
	@echo "  make clean       - Remove all stopped containers, unused networks, and dangling images"

# --- Development ---
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml up

stop:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.yml down

# --- Production ---
build:
	@echo "Building production Docker image..."
	docker-compose -f docker-compose.prod.yml build

prod-up: build
	@echo "Starting production environment in detached mode..."
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	@echo "Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

# --- Utility ---
clean:
	@echo "Cleaning up Docker resources..."
	docker system prune -f

```

# package.json

```json
{
  "name": "red_tetris",
  "version": "1.0.0",
  "type": "module",
  "author": "redpelicans",
  "license": "MIT",
  "scripts": {
    "dev": "concurrently \"npm:client-dev\" \"npm:srv-dev\"",
    "client-dev": "vite",
    "client-build": "vite build",
    "srv-dev": "nodemon src/server/main.js",
    "start": "node src/server/main.js",
    "test": "vitest",
    "coverage": "vitest run --coverage",
    "lint": "eslint . --ext .vue,.js --fix"
  },
  "dependencies": {
    "ai-digest": "^1.5.1",
    "express": "^4.19.2",
    "pinia": "^2.1.7",
    "socket.io": "^4.7.5",
    "socket.io-client": "^4.7.5",
    "vue": "^3.4.27",
    "vue-router": "^4.3.2"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.5",
    "@vitest/coverage-v8": "^1.6.0",
    "concurrently": "^8.2.2",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.26.0",
    "nodemon": "^3.1.2",
    "vite": "^5.2.12",
    "vitest": "^1.6.0"
  }
}

```

# params.js

```js
const params = {
  server: {
    host: '0.0.0.0',
    port: 3004,
    get url() {
      return `http://${this.host}:${this.port}`
    },
  },
}

export default params

```

# README.md

```md
# Red Tetris (Modern Boilerplate)

This is a modernized starter kit for the Red Tetris project, based on a **Vite + Vue.js + Pinia** stack for the client and an **Express + Socket.io** stack for the server.

The original boilerplate has been refactored to use modern, fast, and efficient tools.

## Tech Stack

-   **Client-side**:
    -   **Build Tool**: [Vite](https://vitejs.dev/)
    -   **Framework**: [Vue.js 3](https://vuejs.org/) (with Composition API)
    -   **State Management**: [Pinia](https://pinia.vuejs.org/)
    -   **Routing**: [Vue Router](https://router.vuejs.org/)
    -   **Linting**: [ESLint](https://eslint.org/) with `eslint-plugin-vue`
-   **Server-side**:
    -   **Framework**: [Express](https://expressjs.com/)
    -   **Real-time Communication**: [Socket.io](https://socket.io/)
    -   **Runtime**: [Node.js](https://nodejs.org/) (with ES Modules)
-   **Testing**:
    -   **Test Runner**: [Vitest](https://vitest.dev/)
    -   **Coverage**: `@vitest/coverage-v8`

## Project Setup

### Install Dependencies

First, ensure you have a recent version of [Node.js](https://nodejs.org/en/) installed (e.g., v18+). Then, install the project dependencies:

\`\`\`bash
npm install
\`\`\`

### Configuration

You can edit the server configuration (host, port) in `params.js`.

## Development

To run both the client-side Vite development server and the backend Node.js server concurrently, use the main `dev` script:

\`\`\`bash
npm run dev
\`\`\`

This command will:
1.  Start the **Vite dev server** on `http://localhost:8080`. It will serve the Vue application with Hot Module Replacement (HMR).
2.  Start the **Node.js server** with `nodemon` on `http://localhost:3004`. It will handle the Socket.io connections and automatically restart on file changes.

The Vite server is configured to proxy Socket.io requests to the backend, so your client application can communicate seamlessly with the server.

## Testing

To run the unit tests with Vitest:

\`\`\`bash
npm test
\`\`\`

To generate a test coverage report:

\`\`\`bash
npm run coverage
\`\`\`

## Production Build

To build the client application for production:

\`\`\`bash
npm run client-build
\`\`\`

This will create an optimized `dist` folder containing the static assets of your application.

To run the server in production mode (which will also serve the built client application):

\`\`\`bash
npm start
\`\`\`

Point your browser to the URL configured in `params.js` (e.g., `http://localhost:3004`).

```

# src/client/App.vue

```vue
<script setup>
// This is the main component for the application.
// Game logic and components will be managed from here.
</script>

<template>
  <div class="app-container">
    <h1>Red Tetris</h1>
    <p>Le boilerplate a été mis à jour avec succès !</p>
    <p>Prochaine étape : construire le jeu.</p>
  </div>
</template>

<style scoped>
.app-container {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
  color: #333;
}
</style>

```

# src/client/main.js

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import styles, router, etc. here if needed in the future

const app = createApp(App)

app.use(createPinia())
// app.use(router) // To be added when routes are created

app.mount('#app')

```

# src/server/index.js

```js
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import debug from 'debug'
import path from 'path'
import { fileURLToPath } from 'url'

const logerror = debug('tetris:error')
const loginfo = debug('tetris:info')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const initEngine = (io) => {
  io.on('connection', (socket) => {
    loginfo(`Socket connected: ${socket.id}`)
    socket.on('action', (action) => {
      if (action.type === 'server/ping') {
        socket.emit('action', { type: 'pong' })
      }
    })
    socket.on('disconnect', () => {
      loginfo(`Socket disconnected: ${socket.id}`)
    })
  })
}

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

```

# src/server/main.js

```js
import params from '../../params.js'
import { start } from './index.js'

start(params.server).then(() => {
  console.log('Server is ready to play Tetris with you!')
}).catch((err) => {
  console.error('Failed to start server:', err)
})

```

# vite.config.js

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3004',
        ws: true,
      },
    },
  },
})

```

