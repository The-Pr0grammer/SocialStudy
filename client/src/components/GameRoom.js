import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import FillInTheBlanks from "./FillInTheBlanks";
import DragAndDrop from "./DragAndDrop";
import Chat from "./Chat";
import "../styles/GameRoom.css";

const GameRoom = () => {
  const [currentGame, setCurrentGame] = useState("fillInTheBlanks");
  const { client } = useWebSocket();
  const { username } = useAuth();
  const { currentRoom, setCurrentRoom } = useRoom();

  const handleBeforeUnload = () => {
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "leaveRoom",
          user: username,
          room: "gameRoom",
        })
      );
    }
    setCurrentRoom(null);
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "leaveRoom",
            user: username,
            room: "gameRoom",
          })
        );
      }
      setCurrentRoom(null);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    setCurrentRoom("gameRoom");

    if (client && client.readyState === WebSocket.OPEN && username) {
      client.send(
        JSON.stringify({
          type: "joinRoom",
          room: "gameRoom",
          user: username,
        })
      );
    }
  }, [client]);

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
      {currentGame === "fillInTheBlanks" ? (
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
