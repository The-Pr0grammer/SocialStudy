const webSocket = require("websocket");
const http = require("http");
const connections = {}; // This will store all active connections.

const GameController = require("./gamefiles/GameController");
const FITBBackend = require("./gamefiles/FITBBackend");
const MMBackend = require("./gamefiles/MMBackend.js");

const gameController = new GameController(connections);
FITBBackend.setGameController(gameController);
MMBackend.setGameController(gameController);

const confirmationTimeout = null;

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
    handleMessage(data, connection, rooms, id);
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

function handleMessage(data, connection, rooms, id) {
  switch (data.type) {
    case "connectionAcknowledgement":
      console.log(
        "server.js: Client" +
          id +
          " acknowledgement confirmed. You are cleared for takeoff 🛫"
      );
      break;
    case "requestWord":
      FITBBackend.getCurrentWord(connection);
      break;
    case "checkAnswer":
      FITBBackend.checkAnswer(data.message, data.user, connections);
      break;
    case "requestNumber":
      MMBackend.getTargetNumber(connection);
      break;
    case "requestCountdown":
      MMBackend.getCountdown(connection);
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
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "updateChat",
        message: message,
        user: user,
      })
    );
  }
}

function updatePlayerCount(action, rooms, connection) {
  const room = "gameRoom";
  const roomSet = rooms[room];

  if (action === "joinRoom") {
    roomSet.add(connection);
    console.log(`Player joined ${room}. Total players: ${roomSet.size}`);
    if (roomSet.size === 1) {
      console.log("Starting game due to first player join.");
      gameController.switchGame("dragAndDrop");
    }
  } else if (action === "leaveRoom") {
    roomSet.delete(connection);
    console.log(`Player left ${room}. Total players: ${roomSet.size}`);
    if (roomSet.size === 0) {
      console.log("Stopping game due to no players left.");
      gameController.endGame("noPlayers");
    }
  }

  // Broadcast the player count to all players in the room
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "playerCount",
        playerCount: roomSet.size,
      })
    );
  }
}

function generateId() {
  return "id" + Math.random().toString(16).slice(2);
}

module.exports = { initializeWebSocketServer };
