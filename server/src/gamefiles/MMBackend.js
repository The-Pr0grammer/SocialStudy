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

  // Adjusting numbers to ensure division results in a whole number
  if (chosenOperations[0] === "/") {
    chosenNumbers[1] = chosenNumbers[0] * (Math.floor(Math.random() * 8) + 1); // Ensure the denominator is a non-zero product of the numerator
  }
  if (chosenOperations[1] === "/") {
    chosenNumbers[2] = chosenNumbers[1] * (Math.floor(Math.random() * 8) + 1); // Ensure the denominator is a non-zero product of the second number
  }

  // Form the equation
  const equation = `${chosenNumbers[0]} ${chosenOperations[0]} ${chosenNumbers[1]} ${chosenOperations[1]} ${chosenNumbers[2]}`;
  const targetNumber = Math.floor(eval(equation)); // Ensure the result is a whole number
  return targetNumber;
};


//MMBackend.js
let roundWinner = "";
let countdown = 100;
let gameTimer;
let targetNumber = null;

let gameController = null;

const setGameController = (controller) => {
  gameController = controller;
};

function startGame(connections) {
  targetNumber = generateTargetNumber();
  broadcastTargetNumber(connections);
  broadCastCountdown(connections);

  if (gameTimer) {
    console.log("An interval already exists, skipping new interval setup.");
    return; // Skip setting a new interval if one already exists
  }

  gameTimer = setInterval(() => {
    console.log("Countdown:", countdown);
    countdown -= 1;
    if (countdown <= 0) {
      endGame(connections);
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

function getCountdown(connection) {
  connection.sendUTF(
    JSON.stringify({
      type: "countdown",
      countdown: countdown,
    })
  );
}

function broadCastCountdown(connections) {
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "countdown",
        countdown: countdown,
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

function endGame(connections, source) {
  broadcastRoundWinner(connections, roundWinner);
  broadcastRoundStatus(connections);
  clearInterval(gameTimer);
  gameTimer = null; // Reset the timer to null after clearing
  targetNumber = null;
  countdown = 100;
  
  setTimeout(() => {
    gameController.switchGame("dragAndDrop");
  }, 3000);
}

module.exports = {
  setGameController,
  startGame,
  getTargetNumber,
  broadcastTargetNumber,
  getCountdown,
  broadcastRoundWinner,
  endGame,
};
