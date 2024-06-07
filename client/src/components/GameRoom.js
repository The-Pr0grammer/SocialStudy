import React, { useState } from "react";
import FillInTheBlanks from "./FillInTheBlanks";
import DragAndDrop from "./DragAndDrop";
import Chat from "./Chat";

const GameRoom = () => {
  const [currentGame, setCurrentGame] = useState("fillInTheBlanks");

  const handleGameSwitch = () => {
    setCurrentGame(
      currentGame === "fillInTheBlanks" ? "dragAndDrop" : "fillInTheBlanks"
    );
  };

  return (
    <div>
      {currentGame === "fillInTheBlanks" ? (
        <FillInTheBlanks onGameSwitch={handleGameSwitch} />
      ) : (
        <DragAndDrop onGameSwitch={handleGameSwitch} />
      )}
      <div className="chatbox">
        <Chat checkAnswer={checkAnswer} />
      </div>
    </div>
  );
};

export default GameRoom;
