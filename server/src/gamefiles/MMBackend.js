const generateTargetNumber = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const operations = ["+", "-", "*", "/"];
  const chosenNumbers = [
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ];
  const chosenOperations = [
    operations[Math.floor(Math.random() * operations.length)],
    operations[Math.floor(Math.random() * operations.length)],
  ];

  // Ensure division results in a whole number
  if (chosenOperations[0] === "/") {
    chosenNumbers[1] = chosenNumbers[0] * chosenNumbers[1]; // Adjust second number to be a multiple of the first
  }
  if (chosenOperations[1] === "/" && chosenOperations[0] !== "/") {
    chosenNumbers[2] = chosenNumbers[1] * chosenNumbers[2]; // Adjust third number to be a multiple of the second
  }

  const equation = `${chosenNumbers[0]} ${chosenOperations[0]} ${chosenNumbers[1]} ${chosenOperations[1]} ${chosenNumbers[2]}`;
  const targetNumber = eval(equation);
  return { targetNumber };
};

//MMBackend.js
const { getCurrentGame, switchGame } = require("./GameEvents");

let roundWinner = "";
let countdown = 10;
let gameTimer;
let targetNumber = null;

function startGame(getConnections) {
  targetNumber = generateTargetNumber();

  if (gameTimer) {
    console.log("An interval already exists, skipping new interval setup.");
    return; // Skip setting a new interval if one already exists
  }

  gameTimer = setInterval(() => {
    countdown -= 1;
    if (countdown <= 0) {
      endGame(getConnections());
    }
  }, 1000);
}

function getTargetNumber(connection) {
  connection.sendUTF(
    JSON.stringify({
      type: "targetNumber",
      targetNumber: targetNumber,
    })
  );
}

function broadcastTargetNumber(connections) {
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "targetNumber",
        targetNumber: targetNumber,
      })
    );
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

function getCountdown(connection) {
  connection.sendUTF(
    JSON.stringify({
      type: "countdown",
      countdown: countdown,
    })
  );
}

function endGame(connections) {
  broadcastRoundWinner(connections, roundWinner);
  broadcastRoundStatus(connections);
  clearInterval(gameTimer);
  gameTimer = null; // Reset the timer to null after clearing
  countdown = 10;

  setTimeout(() => {
    switchGame(connections, "dragAndDrop");
    targetNumber = null;
  }, 3000);
}

module.exports = {
  startGame,
  getTargetNumber,
  getCountdown,
  broadcastTargetNumber,
  broadcastRoundWinner,
  endGame,
};
