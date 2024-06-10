const EventEmitter = require('events');
const FITBBackend = require("./FITBBackend");
const MMBackend = require("./MMBackend");

class GameController extends EventEmitter {
    constructor(connections) {
        super();  // Call EventEmitter constructor
        this.connections = connections;
        this.currentGame = null;

        // Listen to specific game control events
        this.on('endGame', (source) => this.endGame(source));
        this.on('switchGame', (game) => this.switchGame(game));
    }

    getCurrentGame() {
        return this.currentGame;
    }

    switchGame(game) {
        this.currentGame = game === "fillInTheBlanks" ? "dragAndDrop" : "fillInTheBlanks";
        console.log("Switching game to:", this.currentGame);
        
        this.broadcastToAll({
            type: "switchGame",
            game: this.currentGame,
        });
        
        this.broadcastToAll({
            type: "updateRoundStatus",
            roundStatus: "inProgress",
        });

        if (this.currentGame === "fillInTheBlanks") {
            FITBBackend.startGame(this.connections);
        } else {
            MMBackend.startGame(this.connections);
        }
    }

    endGame(source) {
        if (this.currentGame === "fillInTheBlanks") {
            FITBBackend.endGame(this.connections, source);
        } else {
            MMBackend.endGame(this.connections, source);
        }
        this.currentGame = null;
        this.emit('gameEnded', this.currentGame); // Notify that the game has ended
    }

    broadcastToAll(message) {
        Object.values(this.connections).forEach(conn => {
            conn.sendUTF(JSON.stringify(message));
        });
    }
}

module.exports = GameController;
