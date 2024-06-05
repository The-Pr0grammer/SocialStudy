import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import Chat from "./Chat";
import "../styles/FillInTheBlanks.css";

const FillInTheBlanks = () => {
  const { client } = useWebSocket();
  const { username } = useAuth();
  const { currentRoom, setCurrentRoom } = useRoom();

  const [currentPlayers, setCurrentPlayers] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [currentClue, setCurrentClue] = useState("");
  const [roundWinner, setRoundWinner] = useState("");
  const [roundStatus, setRoundStatus] = useState("in progress");
  const [countdown, setCountdown] = useState(-1);
  const [loading, setLoading] = useState(true);

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
  }, [client]);

  useEffect(() => {
    setCurrentRoom("gameRoom");

    if (client && client.readyState === WebSocket.OPEN && username) {
      client.send(
        JSON.stringify({
          type: "joinRoom",
          room: "gameRoom",
          user: username,
        })
      );

      client.onmessage = (message) => {
        const data = JSON.parse(message.data);

        switch (data.type) {
          case "currentWord":
            setCurrentWord(data.word);
            setCurrentClue(data.clue);
            break;
          case "countdown":
            setCountdown(data.countdown);
            break;
          case "updateRoundStatus":
            setRoundStatus(data.roundStatus);
            setRoundWinner(data.roundWinner);
            break;
          case "playerCount":
            setCurrentPlayers(data.playerCount);
            break;
          default:
            break;
        }
      };

      client.onclose = () => {
        console.log("FillInTheBlanks.js: WebSocket connection closed");
      };

      setLoading(false); // Set loading to false once the client is connected
    }
  }, []);

  const checkAnswer = (answer) => {
    if (client && client.readyState === WebSocket.OPEN && answer.length === currentWord.length) {
      client.send(
        JSON.stringify({
          type: "checkAnswer",
          message: answer.toLowerCase(),
          user: username,
        })
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main">
      <div className="game">
        <div style={{ height: "45%" }}>
          <h1>Fill in the Blanks</h1>
          <p>Complete the word(s) by filling in the blanks</p>
        </div>
        <div className="word">
          {currentWord &&
            currentWord.split("").map((char, index) => (
              <span key={index} className="letter">
                {char === " "
                  ? "\u00A0\u00A0\u00A0"
                  : char === "_"
                  ? " _ "
                  : char}
              </span>
            ))}
          {currentClue && <p>Clue: "{currentClue}"</p>}
        </div>
        <p>Players: {currentPlayers}</p>
      </div>

      {countdown > 0 && (
        <div className="countdown">
          <h1>New Round in: {countdown}</h1>
        </div>
      )}

      {roundStatus === "correct" && (
        <div className="status">
          <h1>{roundWinner} got the answer correct!</h1>
        </div>
      )}

      {roundStatus === "no winner" && (
        <div className="status">
          <h1>No one got the answer correct!</h1>
        </div>
      )}

      <div className="chatbox">
        <Chat checkAnswer={checkAnswer} />
      </div>
    </div>
  );
};

export default FillInTheBlanks;

