// WebSocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const socketClient = new W3CWebSocket("ws://127.0.0.1:8000");
    setClient(socketClient);

    socketClient.onopen = () => {
      console.log("WebSocket Client Connected from WebSocketContext.js");
    };

    socketClient.onerror = (error) => {
      console.error("WebSocket Error: ", error);
    };

    socketClient.onclose = () => {
      console.log("WebSocket Client Closed");
      setClient(null); // Reset client state
    };

    return () => {
      if (socketClient) {
        socketClient.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={client}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
