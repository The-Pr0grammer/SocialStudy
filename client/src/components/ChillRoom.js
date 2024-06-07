import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import Chat from "./Chat";
import VideoPlayer from "./VideoPlayer";
import "../styles/ChillRoom.css";

const ChillRoom = () => {
  const { client } = useWebSocket();
  const { username } = useAuth();
  const { currentRoom, setCurrentRoom } = useRoom();

  const [currentViewers, setCurrentViewers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/embed/dQw4w9WgXcQ"
  ); // Default YouTube video URL

  const handleBeforeUnload = () => {
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "leaveRoom",
          user: username,
          room: "chillRoom",
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
            room: "chillRoom",
          })
        );
      }
      setCurrentRoom(null);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    setCurrentRoom("chillRoom");

    if (client && client.readyState === WebSocket.OPEN && username) {
      client.send(
        JSON.stringify({
          type: "joinRoom",
          room: "chillRoom",
          user: username,
        })
      );

      client.onmessage = (message) => {
        const data = JSON.parse(message.data);

        switch (data.type) {
          case "playerCount":
            if (data.room === "chillRoom") {
              setCurrentViewers(data.playerCount);
            }
            break;
          default:
            break;
        }
      };

      client.onclose = () => {
        // console.log("ChillRoom.js: WebSocket connection closed");
      };

      setLoading(false); // Set loading to false once the client is connected
    }
  }, [client]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main">
      <div className="video">
        <h1>Chill Room</h1>
        <p>Relax and chat with other viewers</p>
        <div className="video-section">
          <VideoPlayer videoUrl={videoUrl} />
        </div>
        <p>Viewers: {currentViewers}</p>
      </div>

      <div className="chatbox">
        <Chat />
      </div>
    </div>
  );
};

export default ChillRoom;
