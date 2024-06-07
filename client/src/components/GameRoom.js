import React, { useState } from "react";
import FillInTheBlanks from "./FillInTheBlanks";
import DragAndDrop from "./DragAndDrop";
import Chat from "./Chat";
import "../styles/GameRoom.css";

const GameRoom = () => {
  const [currentGame, setCurrentGame] = useState("fillInTheBlanks");

  const handleGameSwitch = () => {
    setCurrentGame(
      currentGame === "fillInTheBlanks" ? "dragAndDrop" : "fillInTheBlanks"
    );
  };

  return (
    <div className="main">
      <div className="change-game">
        <button onClick={() => handleGameSwitch()}>Change Game</button>
      </div>
      {/* {currentGame === "fillInTheBlanks" ? ( */}
      {currentGame !== "fillInTheBlanks" ? (
        <FillInTheBlanks onGameSwitch={handleGameSwitch} />
      ) : (
        <DragAndDrop onGameSwitch={handleGameSwitch} />
      )}
      <div className="chatbox">
        <Chat />
      </div>
    </div>
  );
};

export default GameRoom;
