import React, { createContext, useContext, useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useAuth } from "../AuthContext";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { isLoggedIn, username } = useAuth();
  const [client, setClient] = useState(null);

  const connectToServer = () => {
    console.log("WebSocketContext.js: Attempting to connect to server...");
    const socketClient = new W3CWebSocket("ws://127.0.0.1:8000");

    socketClient.onopen = () => {
      setClient(socketClient);
      console.log("WebSocketContext.js: Connected to server");

      localStorage.setItem("websocketConnected", "true");
    };

    socketClient.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "connectionConfirmation") {
        console.log(
          "WebSocketContext.js: Connection confirmation received, sending acknowledgement..."
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
      localStorage.removeItem("websocketConnected");
      reconnect();
    };

    return socketClient;
  };

  const reconnect = () => {
    if (!localStorage.getItem("websocketConnected")) {
      const intervalId = setInterval(() => {
        console.log("WebSocketContext.js: Attempting to reconnect...");
        const newClient = connectToServer();
        if (newClient.readyState === W3CWebSocket.OPEN) {
          clearInterval(intervalId);
        }
      }, 5000);
    }
  };

  const handleDisconnect = (socketClient) => {
    if (socketClient) {
      console.log(
        "WebSocketContext.js: Client",
        username,
        "has been disconnected. Goodbye!"
      );
      socketClient.close();
      setClient(null);
    }
    localStorage.removeItem("websocketConnected");
  };

  useEffect(() => {
    const socketClient = connectToServer();

    const handleUnload = () => {
      handleDisconnect(socketClient);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      console.log("WebSocketContext.js: Cleaning up WebSocket connection...");
      handleDisconnect(socketClient);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ client }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
