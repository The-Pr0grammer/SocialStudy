// WebSocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useAuth } from "../AuthContext";
import { useRoom } from "../RoomContext";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { isLoggedIn, username } = useAuth();
  const [client, setClient] = useState(null);
  const { currentRoom } = useRoom();

  useEffect(() => {
    
    console.log("WebSocket context is aware of the current room:", currentRoom);
  }, [currentRoom]);

  useEffect(() => {
    let socketClient = null;
    let intervalId = null;

    const connectToServer = () => {
      console.log("WebSocketContext.js: Attempting to connect to server...");
      socketClient = new W3CWebSocket("ws://127.0.0.1:8000");

      socketClient.onopen = () => {
        console.log("WebSocketContext.js: Connected to server");
        setClient(socketClient);
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        // Store the WebSocket connection status in localStorage
        localStorage.setItem("websocketConnected", "true");
      };

      socketClient.onerror = (error) => {
        console.error("WebSocketContext.js: Connection error:", error);
      };

      socketClient.onclose = () => {
        console.log("WebSocketContext.js: Connection closed");
        setClient(null);
        localStorage.removeItem("websocketConnected");
        if (!intervalId) {
          intervalId = setInterval(connectToServer, 10000);
        }
      };
    };

    if (isLoggedIn && username) {
      connectToServer();
    }

    return () => {
      if (socketClient) {
        console.log(
          "WebSocketContext.js: Client",
          username,
          "has left the game room. Goodbye!"
        );

        socketClient.send(
          JSON.stringify({
            type: "leaveRoom",
            user: username,
            room: "gameRoom", //this has to correspond to the room the user is in when they disconnect from the websocket
          })
        );
        socketClient.close();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      localStorage.removeItem("websocketConnected");
    };
  }, [isLoggedIn, username]);

  return (
    <WebSocketContext.Provider value={client}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
