const webSocket = require("websocket");
const http = require("http");
const FITBBackend = require("./FITBBackend");
const { getCurrentGame, switchGame } = require("./GameEvents");
const generateTargetNumber = require("./TargetNumberGenerator.js");
const confirmationTimeout = null;

let currentGame = ["fillInTheBlanks, dragAndDrop"]; // This will track the current game mode.
const connections = {}; // This will store all active connections.

function initializeWebSocketServer(app) {
  const websSocketServerPort = 8000;
  const server = http.createServer(app);

  const rooms = {
    gameRoom: new Set(),
    hwRoom: new Set(),
    chillRoom: new Set(),
  };

  server.listen(websSocketServerPort);
  const wsServer = new webSocket.server({
    httpServer: server,
  });

  wsServer.on("request", function (request) {
    const id = generateId();
    const connection = request.accept(null, request.origin);
    connections[id] = connection;

    setupConnectionHandlers(connection, id, rooms);
  });

  console.log(
    "Server.js: Websocket server is initialized 🚀 -> Running on port",
    websSocketServerPort
  );

  return server;
}

function setupConnectionHandlers(connection, id, rooms) {
  let attempts = 0;
  let confirmationTimeout = setInterval(() => {
    connection.sendUTF(JSON.stringify({ type: "connectionConfirmation" }));
    console.log(
      "Server.js: Sending connection confirmation to client with id ",
      id
    );

    if (attempts === 10) {
      console.log("Server.js: Connection confirmation timed out.");
      clearInterval(confirmationTimeout);
    } else if (connection.connected) {
      clearInterval(confirmationTimeout);
    }

    attempts += 1;
  }, 1000);

  connection.on("message", function (message) {
    const data = JSON.parse(message.utf8Data);
    handleMessage(data, connection, rooms);
  });

  connection.on("close", function (reasonCode, description) {
    clearInterval(confirmationTimeout);
    console.log(
      "server.js: Peer " + id + " disconnected.",
      reasonCode,
      description
    );
    updatePlayerCount("leaveRoom", rooms, connection);
    delete connections[id];
  });
}

function handleMessage(data, connection, rooms) {
  console.log("server.js: Broadcasting chat message...");
  switch (data.type) {
    case "connectionAcknowledgement":
      console.log("server.js: Client acknowledgement confirmed.");
      break;
    case "requestWord":
      FITBBackend.getCurrentWord(connection);
      break;
    case "checkAnswer":
      FITBBackend.checkAnswer(data.message, data.user, () => connections);
      break;
    case "joinRoom":
      updatePlayerCount("joinRoom", rooms, connection);
      break;
    case "leaveRoom":
      updatePlayerCount("leaveRoom", rooms, connection);
      break;
    case "message":
      broadcastChatMessage(data.message, data.user);
      break;
    // Add more cases as needed
  }
}

function broadcastChatMessage(message, user) {
  console.log("server.js: Broadcasting chat message...", message, user);
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "message",
        message: message,
        user: user,
      })
    );
  }
}

function updatePlayerCount(action, rooms, connection) {
  const room = "gameRoom"; // Example, this should be dynamic based on the client's action
  const roomSet = rooms[room];

  if (action === "joinRoom") {
    roomSet.add(connection);
    if (roomSet.size === 1) {
      // Start the game if this is the first player
      FITBBackend.startGame(() => connections);
    }
  } else if (action === "leaveRoom") {
    roomSet.delete(connection);
    if (roomSet.size === 0) {
      // Stop the game if all players have left
      FITBBackend.endGame(() => connections);
    }
  }

  //send the player count to all clients
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "playerCount",
        playerCount: roomSet.size,
      })
    );
  }

  console.log(`Updated player count in ${room}: ${roomSet.size}`);
}

function generateId() {
  return "id" + Math.random().toString(16).slice(2);
}

module.exports = { initializeWebSocketServer };
