import React, { createContext, useContext, useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const { isLoggedIn, username } = useAuth();

  useEffect(() => {
    let socketClient = null;
    let intervalId = null;

    const connectToServer = () => {
      console.log("WebSocketContext.js: Attempting to connect to server...");
      socketClient = new W3CWebSocket(
        "ws://127.0.0.1:8000?username=" + username
      );

      socketClient.onopen = () => {
        console.log("WebSocketContext.js: Connected to server");
        setClient(socketClient);
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };

      socketClient.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === "connectionConfirmation") {
          console.log(
            "WebSocket Client -> username:" +
              username +
              " Acknowledging connection. Requesting confirmation for clearance."
          );

          socketClient.send(
            JSON.stringify({
              type: "connectionAcknowledgement",
            })
          );
        }
      };

      socketClient.onerror = (error) => {
        console.error("WebSocketContext.js: Connection error:", error);
      };

      socketClient.onclose = () => {
        console.log("WebSocketContext.js: Connection closed");
        setClient(null);
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
        socketClient.close();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [username]);

  return (
    <WebSocketContext.Provider value={client}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
