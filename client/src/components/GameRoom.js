import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import FillInTheBlanks from "./FillInTheBlanks";
import DragAndDrop from "./DragAndDrop";
import Chat from "./Chat";
import "../styles/GameRoom.css";

const GameRoom = () => {
  const { client } = useWebSocket();
  const { username } = useAuth();
  const { setCurrentRoom } = useRoom();
  const currentGame = useSelector((state) => state.gameRoom.currentGame);

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

  //leave room when component unmounts
  useEffect(() => {
    setCurrentRoom("gameRoom");

    if (!client || client.readyState !== WebSocket.OPEN || !username) {
      console.log("Client is not ready or user is not logged in. GameRoom");
      return;
    }

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

  return (
    <div className="main">
      {currentGame === "fillInTheBlanks" ? (
        <FillInTheBlanks />
      ) : (
        <DragAndDrop />
      )}
      <div className="chatbox">
        <Chat />
      </div>
    </div>
  );
};

export default GameRoom;
