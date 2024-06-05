const webSocket = require("websocket");
const http = require("http");
const generateRandomizedBlanks = require("./WordGenerator.js");
const WordDatabase = require("./WordDatabase.js");

function initializeWebSocketServer(app) {
  const websSocketServerPort = 8000;
  const server = http.createServer(app);
  const connections = {};
  const generateId = () => "id" + Math.random().toString(16).slice(2);

  let currentWordIndex = Math.floor(Math.random() * WordDatabase.length);
  let currentWord = "";
  let countdown = -1;
  let roundTimer = 0;
  let roundInterval = null;
  let newRoundInterval = null;
  const roundStatus = ["in progress", "correct", "no winner", "stopped"];

  const rooms = {
    gameRoom: new Set(),
    hwRoom: new Set(),
    chillRoom: new Set(),
  };

  server.listen(websSocketServerPort);
  const wsServer = new webSocket.server({
    httpServer: server,
  });

  // Check if the websocket server is running
  if (wsServer) {
    console.log(
      "Server.js: Websocket server is initialized 🚀 -> Running on port",
      websSocketServerPort
    );
  }

  let musicState = {
    isPlaying: true,
    currentTime: 0,
    timestamp: Date.now(),
  };

  const broadcastMusicState = () => {
    for (let key in connections) {
      connections[key].sendUTF(
        JSON.stringify({ type: "musicState", musicState })
      );
    }
  };

  setInterval(() => {
    if (musicState.isPlaying) {
      const now = Date.now();
      const elapsed = (now - musicState.timestamp) / 1000;
      musicState.currentTime += elapsed;
      musicState.timestamp = now;
      broadcastMusicState();
    }
  }, 5000);

  const broadcastCurrentWord = () => {
    if (currentWord === "") {
      currentWord = WordDatabase[currentWordIndex].word;
      currentWord = generateRandomizedBlanks(
        WordDatabase[currentWordIndex].word,
        currentWord,
        true
      );

      roundInterval && clearInterval(roundInterval);
      newRoundInterval && clearInterval(newRoundInterval);
      roundTimer = 0;

      roundInterval = setInterval(() => {
        if (roundTimer >= WordDatabase[currentWordIndex].word.length * 5) {
          revealWord();
          updateRoundStatus(roundStatus[2]);
          startNewRound();
        } else if (roundTimer % 5 === 0 && roundTimer !== 0) {
          broadcastCurrentWord(currentWord);
        }
        roundTimer += 1;
      }, 1000);
    } else {
      currentWord = generateRandomizedBlanks(
        WordDatabase[currentWordIndex].word,
        currentWord,
        false
      );
    }

    for (let key in connections) {
      connections[key].sendUTF(
        JSON.stringify({
          type: "currentWord",
          word: currentWord,
          clue: WordDatabase[currentWordIndex].clue,
        })
      );
    }
  };

  const checkAnswer = (answer, userName) => {
    if (
      answer.toLowerCase() === WordDatabase[currentWordIndex].word.toLowerCase()
    ) {
      roundWinner = userName;
      updateRoundStatus(roundStatus[1], roundWinner);
      revealWord();
      startNewRound();
    }
  };

  const updateRoundStatus = (rs, w) => {
    for (let key in connections) {
      connections[key].sendUTF(
        JSON.stringify({
          type: "updateRoundStatus",
          roundStatus: rs,
          roundWinner: w,
        })
      );
    }
  };

  const startNewRound = () => {
    currentWordIndex = Math.floor(Math.random() * WordDatabase.length);
    roundInterval && clearInterval(roundInterval);
    newRoundInterval && clearInterval(newRoundInterval);
    currentWord = "";
    countdown = 6;

    newRoundInterval = setInterval(() => {
      countdown -= 1;
      if (countdown === 0) {
        countdown = -1;
        clearInterval(newRoundInterval);
        currentWordIndex = Math.floor(Math.random() * WordDatabase.length);
        roundWinner = "";

        for (let key in connections) {
          connections[key].sendUTF(
            JSON.stringify({
              type: "countdown",
              countdown,
            })
          );
        }

        updateRoundStatus(roundStatus[0], roundWinner);
        broadcastCurrentWord();
      } else {
        for (let key in connections) {
          connections[key].sendUTF(
            JSON.stringify({
              type: "countdown",
              countdown,
            })
          );
        }
      }
    }, 1000);
  };

  const revealWord = () => {
    roundInterval && clearInterval(roundInterval);
    for (let key in connections) {
      connections[key].sendUTF(
        JSON.stringify({
          type: "currentWord",
          word: WordDatabase[currentWordIndex].word,
          clue: WordDatabase[currentWordIndex].clue,
        })
      );
    }
  };

  const updatePlayerCount = (room, direction, client) => {
    const roomSet = rooms[room];
    roomSet.size === 0 && startNewRound();
    if (direction === 1) {
      roomSet.add(client);
    } else {
      roomSet.delete(client);
    }

    for (let key in connections) {
      connections[key].sendUTF(
        JSON.stringify({
          type: "playerCount",
          playerCount: roomSet.size,
          room,
        })
      );
    }
    
    console.log("Server.js: Player count in " + room + " is " + roomSet.size);
  };

  wsServer.on("request", function (request) {
    const id = generateId();
    const connection = request.accept(null, request.origin);
    connections[id] = connection;

    let confirmationTimeout = null;
    let ackReqCount = 0;
    confirmationTimeout = setInterval(() => {
      connection.sendUTF(JSON.stringify({ type: "connectionConfirmation" }));
      ackReqCount += 1;
      console.log(
        "Server.js: Sending connection confirmation to client with id ",
        id,
        " Attempt:",
        ackReqCount
      );

      if (ackReqCount >= 10) {
        clearInterval(confirmationTimeout);
        console.log(
          "Server.js: Connection confirmation timed out for client with id ",
          id
        );
      }
    }, 1000);

    connection.on("message", function (message) {
      const data = JSON.parse(message.utf8Data);

      if (data.type === "connectionAcknowledgement") {
        clearTimeout(confirmationTimeout);

        console.log(
          "server.js: Client ",
          id,
          " acknowledgement confirmed. You are cleared for takeoff! 🛫"
        );
      } else if (data.type === "checkAnswer") {
        checkAnswer(data.message, data.user);
      } else if (data.type === "message") {
        for (let key in connections) {
          connections[key].sendUTF(message.utf8Data);
        }
      } else if (data.type === "joinRoom") {
        console.log(
          "server.js: Client " +
            id +
            " has joined " +
            data.room +
            ". Welcome! 🎉"
        );
        updatePlayerCount(data.room, 1, connection);
      } else if (data.type === "leaveRoom") {
        console.log(
          "server.js: Client " + id + " has left " + data.room + ". Goodbye! 👋"
        );
        updatePlayerCount(data.room, -1, connection);
      }
    });

    connection.on("close", function (reasonCode, description) {
      confirmationTimeout && clearInterval(confirmationTimeout);
      roundInterval && clearInterval(roundInterval);
      newRoundInterval && clearInterval(newRoundInterval);

      console.log(
        "server.js: " +
          new Date() +
          " Peer " +
          connection.remoteAddress +
          " disconnected." +
          " Reason code: " +
          reasonCode +
          " Description: " +
          description
      );

      for (let room in rooms) {
        if (rooms[room].has(connection)) {
          updatePlayerCount(room, -1, connection);
        }
      }

      delete connections[id];
    });
  });

  return server;
}

module.exports = initializeWebSocketServer;
