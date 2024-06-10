let currentGame = ["fillInTheBlanks, dragAndDrop"]; // This will track the current game mode.

function getCurrentGame() {
  return currentGame;
}

function switchGame(connections) {
  currentGame =
    currentGame === "fillInTheBlanks" ? "dragAndDrop" : "fillInTheBlanks";
  Object.values(connections).forEach((conn) => {
    conn.sendUTF(
      JSON.stringify({
        type: "switchGame",
        game: currentGame,
      })
    );
  });
}

module.exports = { getCurrentGame, switchGame };