const generateRandomizedBlanks = (word, wordWithBlanks, initial) => {
  // Split the word into characters
  const characters = initial ? word.split("") : wordWithBlanks.split("");
  let newBlankAdded = false;

  //if initial word
  if (initial)
    for (let i = 0; i < characters.length; i++) {
      // Check if the character is not whitespace
      if (characters[i].trim() !== "") {
        characters[i] = "_";
      }
    }
  else {
    while (!newBlankAdded) {
      const random = Math.trunc(Math.random() * (word.length - 0) + 0);
      // Check if the character is not whitespace
      if (characters[random].trim() !== "" && characters[random] == "_") {
        characters[random] = word[random];
        newBlankAdded = true; // Mark that a blank has been added
      }
    }
  }

  // Join the characters back into a string
  return characters.join("");
};

// FITBBackend.js
const WordDatabase = require("./WordDatabase");
const { getCurrentGame, switchGame } = require("./GameEvents");

let currentWordIndex = Math.floor(Math.random() * WordDatabase.length);
let currentWord = "";
let roundWinner = "";
let gameTimer;

function startGame(getConnections) {
  if (gameTimer) {
    console.log("A game timer already exists. Skipping setup of new game.");
    return; // Prevent setting up a new interval if one already exists
  }

  currentWord = generateRandomizedBlanks(
    WordDatabase[currentWordIndex].word,
    currentWord,
    true
  );

  broadcastCurrentWord(getConnections());

  gameTimer = setInterval(() => {
    currentWord = generateRandomizedBlanks(
      WordDatabase[currentWordIndex].word,
      currentWord,
      false
    );

    if (!currentWord.includes("_")) {
      console.log("Game completed. No blanks left.");
      broadcastRoundWinner(getConnections(), "No one");
      endGame(getConnections());
    } else {
      broadcastCurrentWord(getConnections());
    }
  }, 5000);
}

function getCurrentWord(connection) {
  connection.sendUTF(
    JSON.stringify({
      type: "currentWord",
      word: currentWord,
      clue: WordDatabase[currentWordIndex].clue,
    })
  );
}

function broadcastCurrentWord(connections) {
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "currentWord",
        word: currentWord,
        clue: WordDatabase[currentWordIndex].clue,
      })
    );
  }
}

function checkAnswer(answer, username, getConnections) {
  if (
    answer.toLowerCase() === WordDatabase[currentWordIndex].word.toLowerCase()
  ) {
    broadcastRoundWinner(getConnections(), username);
    endGame(getConnections());
  }
}

function broadcastRoundWinner(connections, userName) {
  roundWinner = userName;
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "updateRoundWinner",
        roundWinner: roundWinner,
      })
    );
  }
}

function broadcastRoundStatus(connections) {
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "updateRoundStatus",
        roundStatus: "complete",
      })
    );
  }
}

function endGame(connections) {
  revealWord(connections);
  broadcastRoundWinner(connections, roundWinner);
  broadcastRoundStatus(connections);
  clearInterval(gameTimer);
  gameTimer = null; // Reset the timer to null after clearing

  setTimeout(() => {
    switchGame(connections, "fillInTheBlanks");
  }, 3000);
}

function revealWord(connections) {
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "currentWord",
        word: WordDatabase[currentWordIndex].word,
        clue: WordDatabase[currentWordIndex].clue,
      })
    );
  }
}

module.exports = {
  startGame,
  getCurrentWord,
  broadcastCurrentWord,
  checkAnswer,
  broadcastRoundWinner,
  revealWord,
  endGame,
};
