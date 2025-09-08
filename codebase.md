# codebase_tree.md

```md
.
├── codebase.md
├── codebase_tree.md
├── index.html
├── package.json
├── package-lock.json
├── params.js
├── README.md
├── src
│   ├── client
│   │   ├── actions
│   │   │   ├── alert.js
│   │   │   └── server.js
│   │   ├── components
│   │   │   └── test.js
│   │   ├── containers
│   │   │   └── app.js
│   │   ├── index.js
│   │   ├── middleware
│   │   │   └── storeStateMiddleWare.js
│   │   └── reducers
│   │       ├── alert.js
│   │       └── index.js
│   └── server
│       ├── index.js
│       └── main.js
├── test
│   ├── fake.js
│   ├── helpers
│   │   └── server.js
│   ├── index.js
│   ├── mocha.opts
│   ├── react1.js
│   ├── redux1.js
│   └── server1.js
└── webpack.config.js

11 directories, 25 files

```

# index.html

```html
<!doctype html>
<html>
  <head>
    <title>RedTetris</title>
    <link rel="icon" href="http://redpelicans.com/favicon.ico">                                                                                                                                          
  </head>
  <body>
    <div id="tetris"></div>
    <script src="bundle.js"></script>
  </body>
</html>

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
  server:{
     host: '0.0.0.0'
   , port: 3004
   , get url(){ return 'http://' + this.host + ':' + this.port } 
  },
}

module.exports = params


```

# README.md

```md
# Red Tetris Boilerplate

This starter kit was made to help students to develop red_tetris project : a Full Stack Javascript Tetris. We can also use it as a starting point for any product made of React / Redux and socket.io.

It helps:

* to transpile with Babel ES6 code
* to bundle with Wbepack JS files and hot reload client's code
* to write tests and check code coverage. 

Because we use React, Redux, Node.js and Socket.io, we had to define 3 kinds of unit tests :

* React ones like explained in redux documentation + `chai-equal-jsx`
* Redux ones, but instead of just testing pure functions, we defined a middleware to test state’s impact after one or many actions.
* Redux/Socket.io/Node.js, same as before, we use the same middleware but this time we can test state’s updates after socketio messages round trip.

### Install

Install [node](https://nodejs.org/en/) first. After that:

\`\`\`
$ npm install
\`\`\`

Edit `params.js` for your needs.


### Development Mode

#### Launch Server

\`\`\`
$ npm run  srv-dev
> red_tetrisboilerplate@0.0.1 srv-dev /home/eric/JS/red_tetris_boilerplate
> DEBUG=tetris:* babel-watch -w src src/server/main.js
\`\`\`

It launches a node.js server listening for socket.io connexions, that is wired to receive `ping` messages and answered to … `pong`.

#### Launch Client

\`\`\`
$ npm run client-dev
> red_tetrisboilerplate@0.0.1 client-dev /home/eric/JS/red_tetris_boilerplate
> webpack-dev-server --colors --hot --inline --host 0.0.0.0 --port 8080

http://0.0.0.0:8080/
webpack result is served from /
content is served from /home/eric/JS/red_tetris_boilerplate
…
webpack: bundle is now VALID.
\`\`\`


Point your browser to `http://0.0.0.0:8080/` it will load client side application. You should see `Soon, will be here a fantastic Tetris ...`, open your console and check you have :

\`\`\`
[HMR] Waiting for update signal from WDS...
bundle.js:28328  action @ 14:29:58.602 ALERT_POP 
bundle.js:28340  prev state Object
bundle.js:28344  action Object
bundle.js:28352  next state Object
bundle.js:616 [WDS] Hot Module Replacement enabled.
\`\`\`

URL is not yet editable in `params.js`, change it directly inside `package.json`.

As you can guess we are using webpack `hot reload` module, try to update any file under `src/client` and your browser should reload your code.

\`\`\`
[WDS] App updated. Recompiling...
\`\`\`


#### Test

Test, test and re-test …

Stop server, or use an other setup (//TODO)
\`\`\`
$ npm run test
\`\`\`

Tests are installed under `test` folder.

#### fake.js

A simple template to implement simple unit tests. In Tetris context you will try to test every functions or classes from server or client code. Just import your files and check (http://shouldjs.github.io/)[should] documentation to extend the test.


#### redux.js

Target is to test `actions` and `reducers` in one time. You can always split those tests as explained [here](http://redux.js.org/docs/recipes/WritingTests.html).
Look at the code :

\`\`\`
//cat redux1.js
// 1
import {configureStore} from './helpers/server'
// 2
import rootReducer from '../src/client/reducers'
import {ALERT_POP, alert} from '../src/client/actions/alert'
import chai from "chai"
const MESSAGE = "message"
chai.should()
describe('Fake redux test', function(){
  it('alert it', function(done){
    const initialState = {}
   // 3
    const store =  configureStore(rootReducer, null, initialState, {
      ALERT_POP: ({dispatch, getState}) =>  {
        const state = getState()
        state.message.should.equal(MESSAGE)
        done()
      }
    })
   // 4
    store.dispatch(alert(MESSAGE))
  });

});
\`\`\`

1. We use a special middleware to set up hooks in action’s workflow.
2. We use here the  root reducer, but it can be replaced by  any kind of reducer
3. target is to check updates in our store, so we have to create a store for each check (`it()`), `configureStore` is a store helper.

*configureStore* :

* `reducer`:  not necessary the root one
* `socket`:  (unused here)
* `initial state`:  set up to realize the action
* `actions hook`: object where keys are action’s type and values are callbacks. `action’s type` is one of your actions defined in your application, `callback` function will receive  {getState, dispatch, action} as real parameter.

Thanks to the hook you can react to actions, just to check a new state after an action, or to send actions to follow a workflow and check state at the end.


In our sample, we register a callback when `ALERT_POP` will be dispatched and check that `state.message`is right. Callback is called after reducers.


#### server.js

Very similar to previous test, but offer to test server code involved in a client action. You can use this kind of solution to test a pipeline like `action -> fetch -> action -> reducer`. Here client / server communication is based on socket.io and we use a middleware inspired by [redux-socket.io](https://github.com/itaylor/redux-socket.io) to transparantly dispatch and receive socket.io messages. So our test covers  `action -> socket.emit -> server code -> client socket callback -> action -> reducer`. I do not know if it’s still a unit test, but it’s a useful solution to test.

Let’s have a look on code:


\`\`\`
import chai from "chai"
import {startServer, configureStore} from './helpers/server'
import rootReducer from '../src/client/reducers'
// 1
import {ping} from '../src/client/actions/server'
import io from 'socket.io-client'
import params from '../params'
chai.should()

describe('Fake server test', function(){
  let tetrisServer

// 2 
  before(cb => startServer( params.server, function(err, server){
    tetrisServer = server
    cb()
  }))

  after(function(done){tetrisServer.stop(done)})

  it('should pong', function(done){
    const initialState = {}
    const socket = io(params.server.url)
    // 3
    const store =  configureStore(rootReducer, socket, initialState, {
      'pong': () =>  done()
    })
    store.dispatch(ping())
  });
});
\`\`\`


1. This time we will test server actions: it means client actions that transparently communicate with server
2. for each `describe` we have to launch the server. Tetris server is statefull, so we can run multiple tests (`it`) on one server to check behavior (ex: multiple users, events)
3. Now we have a socket (client connection), so middleware is able to send socket.io messages to server.

In our context, we dispatch `ping` action and register a callback on `pong` action.

#### Coverage

\`\`\`
npm run coverage

> red_tetrisboilerplate@0.0.1 coverage /home/eric/JS/red_tetris_boilerplate
> NODE_ENV=test nyc -r lcov -r text mocha --require babel-core/register

\`\`\`

Check results …. of this command, and launch your browser to `./coverage/lcov-report/index.html`


### Production Mode

It’s not a production recipe to run your Tetris over billions of players, but just 2 commands to run it without live reload.

\`\`\`
$ npm run srv-dist

> red_tetrisboilerplate@0.0.1 srv-dist /home/eric/JS/red_tetris_boilerplate
> DEBUG=tetris:* babel src --out-dir dist

src/client/actions/alert.js -> dist/client/actions/alert.js
src/client/actions/server.js -> dist/client/actions/server.js
src/client/components/test.js -> dist/client/components/test.js
src/client/containers/app.js -> dist/client/containers/app.js
src/client/index.js -> dist/client/index.js
src/client/middleware/storeStateMiddleWare.js -> dist/client/middleware/storeStateMiddleWare.js
src/client/reducers/alert.js -> dist/client/reducers/alert.js
src/client/reducers/index.js -> dist/client/reducers/index.js
src/server/index.js -> dist/server/index.js
src/server/main.js -> dist/server/main.js

$ npm run client-dist

> red_tetrisboilerplate@0.0.1 client-dist /home/eric/JS/red_tetris_boilerplate
> NODE_ENV=production webpack --progress --colors

Hash: 6841f78bfe6867fb2913  
Version: webpack 1.13.0
Time: 1923ms
    Asset    Size  Chunks             Chunk Names
bundle.js  754 kB       0  [emitted]  main
    + 197 hidden modules

$  DEBUG=tetris:* node dist/server/main.js 
  tetris:info tetris listen on http://0.0.0.0:3004 +0ms
  not yet ready to play tetris with U ...
\`\`\`

In production mode, node.js server serves `index.html` and `bundle.js`, so you have to point to url set up in `params.js` 

That’s all folks ... 

```

# src/client/actions/alert.js

```js
export const ALERT_POP = 'ALERT_POP'

export const alert = (message) => {
  return {
    type: ALERT_POP,
    message
  }
}


```

# src/client/actions/server.js

```js
export const ping = () => {
  return {
    type: 'server/ping'
  }
}

```

# src/client/components/test.js

```js
import React from 'react'

export const Tetris = () => {
  return (
    <Board/>
  )
}

export const Board = () => {
  return (
    <div/>
  )
}

```

# src/client/containers/app.js

```js
import React from 'react'
import { connect } from 'react-redux'


const App = ({message}) => {
  return (
    <span>{message}</span>
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}
export default connect(mapStateToProps, null)(App)



```

# src/client/index.js

```js
import React from 'react'
import ReactDom from 'react-dom'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'                                                                                                                                                    
import {storeStateMiddleWare} from './middleware/storeStateMiddleWare'
import reducer from './reducers'
import App from './containers/app'
import {alert} from './actions/alert'

const initialState = {}

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk, createLogger())
)

ReactDom.render((
  <Provider store={store}>
    <App/>
  </Provider>
), document.getElementById('tetris'))

store.dispatch(alert('Soon, will be here a fantastic Tetris ...'))

```

# src/client/middleware/storeStateMiddleWare.js

```js
export const storeStateMiddleWare = ({ getState }) => {
  return (next) => (action) => {
    let returnValue = next(action)
    window.top.state = getState()
    return returnValue
  }
}

```

# src/client/reducers/alert.js

```js
import { ALERT_POP } from '../actions/alert'

const reducer = (state = {} , action) => {
  switch(action.type){
    case ALERT_POP:
      return { message: action.message }
    default: 
      return state
  }
}

export default reducer


```

# src/client/reducers/index.js

```js
import alert from './alert'
export default alert




```

# src/server/index.js

```js
import fs  from 'fs'
import debug from 'debug'

const logerror = debug('tetris:error')
  , loginfo = debug('tetris:info')

const initApp = (app, params, cb) => {
  const {host, port} = params
  const handler = (req, res) => {
    const file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html'
    fs.readFile(__dirname + file, (err, data) => {
      if (err) {
        logerror(err)
        res.writeHead(500)
        return res.end('Error loading index.html')
      }
      res.writeHead(200)
      res.end(data)
    })
  }

  app.on('request', handler)

  app.listen({host, port}, () =>{
    loginfo(`tetris listen on ${params.url}`)
    cb()
  })
}

const initEngine = io => {
  io.on('connection', function(socket){
    loginfo("Socket connected: " + socket.id)
    socket.on('action', (action) => {
      if(action.type === 'server/ping'){
        socket.emit('action', {type: 'pong'})
      }
    })
  })
}

export function create(params){
  const promise = new Promise( (resolve, reject) => {
    const app = require('http').createServer()
    initApp(app, params, () =>{
      const io = require('socket.io')(app)
      const stop = (cb) => {
        io.close()
        app.close( () => {
          app.unref()
        })
        loginfo(`Engine stopped.`)
        cb()
      }

      initEngine(io)
      resolve({stop})
    })
  })
  return promise
}

```

# src/server/main.js

```js
import params  from '../../params'
import * as server from './index'
server.create(params.server).then( () => console.log('not yet ready to play tetris with U ...') )

```

# test/fake.js

```js
import chai from "chai"

chai.should()

describe('Check Sum', () => {
  it('1+1 == 2', () => {
    const res = 1 + 1
    res.should.equal(2)
  });

});

```

# test/helpers/server.js

```js
import * as server from '../../src/server/index'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

export const startServer = (params, cb) => {
  server.create(params)
    .then( server => cb(null, server) )
    .catch( err => cb(err) )
}

export const configureStore = (reducer, socket, initialState, types) => createStore( 
  reducer, 
  initialState, 
  applyMiddleware(
    myMiddleware(types), 
    socketIoMiddleWare(socket),  
    thunk
  )
)

const isFunction = arg => { return typeof arg === 'function' }

const myMiddleware = (types={}) => {
  const fired = {}
  return store => next => action => {
    const result = next(action)
    const cb = types[action.type]
    if(cb && !fired[action.type]){
      if(!isFunction(cb)) throw new Error("action's type value must be a function")
      fired[action.type] = true
      cb({getState: store.getState, dispatch: store.dispatch, action})
    }
    return result
  }
}

const socketIoMiddleWare = socket => ({dispatch, getState}) => {
  if(socket) socket.on('action', dispatch)
  return next => action => {
    if(socket && action.type && action.type.indexOf('server/') === 0) socket.emit('action', action)
    return next(action)
  }
}

```

# test/index.js

```js
import glob from 'glob'

// console.log(__dirname)
// const files = glob.sync("src/server#<{(||)}>#*.js")
// files.forEach(file => {
//   console.log(file)
//   require('../' + file)
// })

```

# test/mocha.opts

```opts
--require chai
-R spec
--ui bdd

```

# test/react1.js

```js
import chai from "chai"
import React from 'react'
import equalJSX from 'chai-equal-jsx'
import {createRenderer} from 'react-addons-test-utils'
import {Tetris, Board} from '../src/client/components/test'

chai.should()
chai.use(equalJSX)

describe('Fake react test', function(){
  it('works', function(){
    const renderer = createRenderer()
    renderer.render(React.createElement(Tetris))
    const output = renderer.getRenderOutput()
    output.should.equalJSX(<Board/>)
  })

})

```

# test/redux1.js

```js
import {configureStore} from './helpers/server'
import rootReducer from '../src/client/reducers'
import {ALERT_POP, alert} from '../src/client/actions/alert'
import chai from "chai"

const MESSAGE = "message"

chai.should()

describe('Fake redux test', function(){
  it('alert it', function(done){
    const initialState = {}
    const store =  configureStore(rootReducer, null, initialState, {
      ALERT_POP: ({dispatch, getState}) =>  {
        const state = getState()
        state.message.should.equal(MESSAGE)
        done()
      }
    })
    store.dispatch(alert(MESSAGE))
  });

});

```

# test/server1.js

```js
import chai from "chai"
import {startServer, configureStore} from './helpers/server'
import rootReducer from '../src/client/reducers'
import {ping} from '../src/client/actions/server'
import io from 'socket.io-client'
import params from '../params'

chai.should()

describe('Fake server test', function(){
  let tetrisServer
  before(cb => startServer( params.server, function(err, server){
    tetrisServer = server
    cb()
  }))

  after(function(done){tetrisServer.stop(done)})

  it('should pong', function(done){
    const initialState = {}
    const socket = io(params.server.url)
    const store =  configureStore(rootReducer, socket, initialState, {
      'pong': () =>  done()
    })
    store.dispatch(ping())
  });
});

```

# webpack.config.js

```js
var path = require('path');

module.exports = {
  entry: './src/client/index.js',

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query:{
        presets: ["es2015", "react", "stage-0"]
      }
    }]
  }
};

```

