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
  let roundInterval;
  let newRoundInterval;

  server.listen(websSocketServerPort);
  console.log("Server is listening on port", websSocketServerPort);

  const wsServer = new webSocket.server({
    httpServer: server,
  });

  let roundStatus = "in progress";
  let roundWinner = "";

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
          roundStatus = "no winner";
          revealWord();
          updateRoundStatus(roundStatus);
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
      roundStatus = "correct";
      roundWinner = userName;
      updateRoundStatus(roundStatus, roundWinner);
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
        roundStatus = "in progress";
        roundWinner = "";

        for (let key in connections) {
          connections[key].sendUTF(
            JSON.stringify({
              type: "countdown",
              countdown,
            })
          );
        }

        updateRoundStatus(roundStatus, roundWinner);
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

  wsServer.on("request", function (request) {
    console.log("WebSocket request received");
    const id = generateId();
    const connection = request.accept(null, request.origin);
    console.log("WebSocket connection accepted");
    connections[id] = connection;

    const confirmationTimeout = setInterval(() => {
      connection.sendUTF(JSON.stringify({ type: "connectionConfirmation" }));
    }, 1000);

    connection.on("message", function (message) {
      console.log("message: " + message.utf8Data);

      const data = JSON.parse(message.utf8Data);

      if (data.type === "connectionAcknowledgement") {
        clearTimeout(confirmationTimeout);
        broadcastCurrentWord();
      } else if (data.type === "check") {
        checkAnswer(data.message, data.user);
      } else if (data.type === "message") {
        for (let key in connections) {
          connections[key].sendUTF(message.utf8Data);
        }
      }
    });

    connection.on("close", function (reasonCode, description) {
      console.log(
        new Date() + " Peer " + connection.remoteAddress + " disconnected."
      );
      delete connections[id];
    });
  });

  // Return the Express server instance
  return server;
}

module.exports = initializeWebSocketServer;
