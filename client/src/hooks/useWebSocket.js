// hooks/useWebSocket.js
import { useContext } from "react";
import { WebSocketContext } from "../WebSocketContext";

const useWebSocket = () => {
  const client = useContext(WebSocketContext);
  if (client === null) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return client;
};

export default useWebSocket;
