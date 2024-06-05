// FillInTheBlanks.js
import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import Chat from "./Chat";
import "../styles/FillInTheBlanks.css";

const FillInTheBlanks = () => {
  const { setCurrentRoom } = useRoom(); // Destructure setCurrentRoom from RoomContext
  const [currentPlayers, setCurrentPlayers] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [currentClue, setCurrentClue] = useState("");
  const [roundWinner, setRoundWinner] = useState("");
  const [roundStatus, setRoundStatus] = useState("in progress");
  const [countdown, setCountdown] = useState(-1);
  const { client } = useWebSocket();
  const { username } = useAuth();

  useEffect(() => {
    const handleUnload = () => {
      setCurrentRoom(null); // Set the current room to null when unloading
    };

    setCurrentRoom("gameRoom"); // Set the current room when component loads

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [setCurrentRoom]); // Include setCurrentRoom in the dependency array to avoid eslint warnings

  useEffect(() => {
    if (client && username) {
      client.send(
        JSON.stringify({
          type: "joinRoom",
          room: "gameRoom",
          user: username,
        })
      );

      client.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === "currentWord") {
          setCurrentWord(data.word);
          setCurrentClue(data.clue);
        } else if (data.type === "countdown") {
          setCountdown(data.countdown);
        } else if (data.type === "updateRoundStatus") {
          setRoundStatus(data.roundStatus);
          setRoundWinner(data.roundWinner);
        } else if (data.type === "playerCount") {
          setCurrentPlayers(data.playerCount);
        }
      };

      return () => {
        client.send(
          JSON.stringify({
            type: "leaveRoom",
            room: "gameRoom",
            user: username,
          })
        );
      };
    }
  }, [client, username]);

  const checkAnswer = (answer) => {
    if (client && answer.length === currentWord.length) {
      client.send(
        JSON.stringify({
          type: "checkAnswer",
          message: answer.toLowerCase(),
          user: username,
        })
      );
    }
  };

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
