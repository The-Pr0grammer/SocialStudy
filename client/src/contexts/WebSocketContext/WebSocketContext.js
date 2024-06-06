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
    if (isConnecting.current) {
      return;
    }
    isConnecting.current = true;

    console.log(
      "WebSocketContext.js: Attempting to connect to server...",
      clientID.current
    );

    const socketClient = new W3CWebSocket("ws://127.0.0.1:8000");

    socketClient.onopen = () => {
      setClient(socketClient);
      isConnecting.current = false;
      console.log("WebSocketContext.js: Connected to server", clientID.current);
    };

    socketClient.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "connectionConfirmation") {
        console.log(
          "WebSocketContext.js: Connection confirmation received, sending acknowledgement...",
          clientID.current
        );
        socketClient.send(
          JSON.stringify({
            type: "connectionAcknowledgement",
          })
        );
      }
    };

    socketClient.onerror = (error) => {
      console.error(
        "WebSocketContext.js: Connection error:",
        clientID.current,
        error
      );
    };

    socketClient.onclose = () => {
      console.log("WebSocketContext.js: Connection closed", clientID.current);
      setClient(null);
      isConnecting.current = false;
    };

    return socketClient;
  };

  const handleDisconnect = (socketClient) => {
    console.log("hitting diconnect function ♥️")
    if (socketClient) {
      console.log(
        "WebSocketContext.js: Client",
        clientID.current,
        "has been disconnected. Goodbye!"
      );
      socketClient.close();
      setClient(null);
    }
  };

  useEffect(() => {
    let socketClient = connectToServer();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // console.log("WebSocketContext.js: Page is hidden", clientID.current);
      } else if (document.visibilityState === "visible") {
        // console.log("WebSocketContext.js: Page is visible", clientID.current);
        if (!socketClient || socketClient.readyState !== W3CWebSocket.OPEN) {
          setTimeout(() => {
            socketClient = connectToServer();
          }, 1000);
        }
      }
    };

    window.addEventListener("unload", () => handleDisconnect(socketClient));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      console.log(
        "WebSocketContext.js: Cleaning up WebSocket connection...",
        clientID.current
      );
      // handleDisconnect(socketClient);
      window.removeEventListener("unload", () =>
        handleDisconnect(socketClient)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ client }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
