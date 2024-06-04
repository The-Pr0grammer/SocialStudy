const webSocket = require("websocket");
const http = require("http");
const generateRandomizedBlanks = require("./WordGenerator.js");
const WordDatabase = require("./WordDatabase.js");

function initializeWebSocketServer(app) {
  const websSocketServerPort = 8000;
  const server = http.createServer(app);
  const connections = {};
  const generateId = () => "id" + Math.random().toString(16).slice(2);
  let confirmationTimeout = null;

  let currentWordIndex = Math.floor(Math.random() * WordDatabase.length);
  let currentWord = "";
  let countdown = -1;
  let roundTimer = 0;
  let roundInterval = null;
  let newRoundInterval = null;
  let currentPlayers = 0;
  let roundWinner = "";
  const roundStatus = ["in progress", "correct", "no winner", "stopped"];

  server.listen(websSocketServerPort);
  const wsServer = new webSocket.server({
    httpServer: server,
  });

  //check if the websocket server is running
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

  let intervalLock = false;

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
    if (intervalLock) return;
    intervalLock = true;

    console.log("Starting new round...");
    currentWordIndex = Math.floor(Math.random() * WordDatabase.length);
    roundInterval && clearInterval(roundInterval);
    newRoundInterval && clearInterval(newRoundInterval);
    currentWord = "";
    countdown = 6;

    newRoundInterval = setInterval(() => {
      console.log("Countdown is", countdown);
      countdown -= 1;
      if (countdown === 0) {
        console.log("Countdown is 0");
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
        intervalLock = false;
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

  const updatePlayerCount = (direction, client) => {
    if (currentPlayers === 0) {
      startNewRound();
    } else {
      client.sendUTF(
        JSON.stringify({
          type: "currentWord",
          word: currentWord,
          clue: WordDatabase[currentWordIndex].clue,
        })
      );
    }

    currentPlayers += direction;

    if (currentPlayers === 0) {
      stopGame();
    }

    console.log("Current players: ", currentPlayers);

    if (currentPlayers > 0) {
      for (let key in connections) {
        connections[key].sendUTF(
          JSON.stringify({
            type: "playerCount",
            playerCount: currentPlayers,
          })
        );
      }
    }
  };

  const stopGame = () => {
    roundInterval && clearInterval(roundInterval);
    newRoundInterval && clearInterval(newRoundInterval);
    currentWord = "";
    countdown = -1;
    roundTimer = 0;
    roundWinner = "";
  };

  wsServer.on("request", function (request) {
    const id = generateId();
    const connection = request.accept(null, request.origin);
    connections[id] = connection;

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
          " acknowledged. You are cleared for takeoff! 🛫"
        );
      } else if (data.type === "checkAnswer") {
        // Check a submitted answer
        checkAnswer(data.message, data.user);
      } else if (data.type === "message") {
        // Broadcast the text message to all clients
        for (let key in connections) {
          connections[key].sendUTF(message.utf8Data);
        }
      } else if (data.type === "connectPlayer") {
        console.log(
          "server.js: Client " +
            id +
            " has connected to the gameroom. Welcome! 🎉"
        );

        updatePlayerCount(1, connection); // Update the player count
      } else if (data.type === "leaveGameRoom") {
        console.log(
          "server.js: Client " + id + " has left the gameroom. Goodbye! 👋"
        );
        updatePlayerCount(-1); // Update the player count
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

      delete connections[id];
    });
  });

  // Return the Express server instance
  return server;
}

module.exports = initializeWebSocketServer;
