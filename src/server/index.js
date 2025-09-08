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
