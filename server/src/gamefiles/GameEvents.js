let currentGame = ""; // This will track the current game mode.

function getCurrentGame() {
  return currentGame;
}

function switchGame(connections, game) {
  currentGame = game === "fillInTheBlanks" ? "dragAndDrop" : "fillInTheBlanks";

  console.log("Switching game to:", currentGame);
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
