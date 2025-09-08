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

```bash
npm install
```

### Configuration

You can edit the server configuration (host, port) in `params.js`.

## Development

To run both the client-side Vite development server and the backend Node.js server concurrently, use the main `dev` script:

```bash
npm run dev
```

This command will:
1.  Start the **Vite dev server** on `http://localhost:8080`. It will serve the Vue application with Hot Module Replacement (HMR).
2.  Start the **Node.js server** with `nodemon` on `http://localhost:3004`. It will handle the Socket.io connections and automatically restart on file changes.

The Vite server is configured to proxy Socket.io requests to the backend, so your client application can communicate seamlessly with the server.

## Testing

To run the unit tests with Vitest:

```bash
npm test
```

To generate a test coverage report:

```bash
npm run coverage
```

## Production Build

To build the client application for production:

```bash
npm run client-build
```

This will create an optimized `dist` folder containing the static assets of your application.

To run the server in production mode (which will also serve the built client application):

```bash
npm start
```

Point your browser to the URL configured in `params.js` (e.g., `http://localhost:3004`).
