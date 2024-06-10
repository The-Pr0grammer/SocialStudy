import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useAuth } from "../AuthContext";
import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentGame,
  setCurrentWord,
  setCurrentClue,
  setTargetNumber,
  setRoundWinner,
  setRoundStatus,
  setPlayerCount,
  setMessages,
} from "../../redux/gameRoom/gameSlice";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [client, setClient] = useState(null);
  const clientID = useRef(Math.trunc(Math.random() * 1000));
  const isConnecting = useRef(false);
  const dispatch = useDispatch();

  const connectToServer = () => {
    if (isConnecting.current || client) {
      return;
    }

    isConnecting.current = true;

    const socketClient = new W3CWebSocket("ws://127.0.0.1:8000");

    socketClient.onopen = () => {
      console.log("WebSocketContext.js: Connected to server", clientID.current);
      setClient(socketClient);
      isConnecting.current = false;
    };

    const handleMessage = (message) => {
      const data = JSON.parse(message.data);

      switch (data.type) {
        case "connectionConfirmation":
          sendAcknowledgement(socketClient);
          break;
        case "switchGame":
          console.log("Switching game to:", data.game);
          dispatch(setCurrentGame(data.game));
          break;
        case "currentWord":
          dispatch(setCurrentWord(data.word));
          dispatch(setCurrentClue(data.clue));
          break;
        case "targetNumber":
          dispatch(setTargetNumber(data.targetNumber));
          break;
        case "updateRoundWinner":
          dispatch(setRoundWinner(data.roundWinner));
          break;
        case "updateRoundStatus":
          dispatch(setRoundStatus(data.roundStatus));
          break;
        case "playerCount":
          dispatch(setPlayerCount(data.playerCount));
          break;
        case "updateChat":
          dispatch(setMessages(data));
          break;
        default:
          console.log("Unhandled message type:", data.type);
          break;
      }
    };

    // Add the message listener once
    socketClient.addEventListener("message", handleMessage);

    socketClient.onerror = (error) => {
      console.error(
        "WebSocketContext.js: Connection error:",
        clientID.current,
        error
      );
      isConnecting.current = false;
    };

    socketClient.onclose = () => {
      console.log("WebSocketContext.js: Connection closed", clientID.current);
      socketClient.removeEventListener("message", handleMessage);

      // Optionally reconnect
      setTimeout(() => {
        connectToServer();

        console.log("WebSocketContext.js: Reconnecting...", clientID.current);
      }, 1000);
    };

    return socketClient;
  };

  const handleDisconnect = () => {
    if (client) {
      console.log(
        "Handling disconnect...Cleaning up WebSocket event listeners...",
        clientID.current
      );
      setClient(null);
      isConnecting.current = false;
      client.close();
    }
  };

  const sendAcknowledgement = (sc) => {
    console.log("Sending connection acknowledgement...", clientID.current);
    sc.send(JSON.stringify({ type: "connectionAcknowledgement" }));
  };

  useEffect(() => {
    if (isLoggedIn) {
      connectToServer();
    }

    window.onbeforeunload = () => handleDisconnect();

    return () => {
      handleDisconnect();
    };
  }, [isLoggedIn]); // Depend on isLoggedIn to reconnect when auth state changes

  return (
    <WebSocketContext.Provider value={{ client }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
