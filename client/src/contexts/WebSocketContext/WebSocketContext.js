import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useAuth } from "../AuthContext";
import { useRoom } from "../RoomContext";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { isLoggedIn, username } = useAuth();
  const { currentRoom } = useRoom();
  const [client, setClient] = useState(null);
  const clientID = useRef(Math.trunc(Math.random() * 1000));
  const isConnecting = useRef(false);

  const connectToServer = () => {
    if (isConnecting.current || client) {
      return;
    }
    isConnecting.current = true;

    console.log(
      "WebSocketContext.js: Attempting to connect to server...",
      clientID.current
    );

    const socketClient = new W3CWebSocket("ws://127.0.0.1:8000");

    socketClient.onopen = () => {
      console.log("WebSocketContext.js: Connected to server", clientID.current);
      setClient(socketClient);
      isConnecting.current = false;
    };

    socketClient.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log("WebSocketContext.js: Message received", data);
    };

    socketClient.onerror = (error) => {
      console.error("WebSocketContext.js: Connection error:", clientID.current, error);
      isConnecting.current = false;
    };

    socketClient.onclose = () => {
      console.log("WebSocketContext.js: Connection closed", clientID.current);
      setClient(null);
      isConnecting.current = false;
      // Optionally reconnect
      setTimeout(() => connectToServer(), 5000);
    };

    return socketClient;
  };

  const handleDisconnect = () => {
    if (client) {
      console.log("WebSocketContext.js: Disconnecting client", clientID.current);
      client.close();
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      handleDisconnect();
      return;
    }

    let socketClient = connectToServer();

    window.onbeforeunload = () => handleDisconnect();

    return () => {
      console.log("WebSocketContext.js: Cleaning up WebSocket connection", clientID.current);
      handleDisconnect();
    };
  }, [isLoggedIn]);  // Depend on isLoggedIn to reconnect when auth state changes

  return (
    <WebSocketContext.Provider value={{ client }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
