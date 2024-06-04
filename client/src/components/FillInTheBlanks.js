// FillInTheBlanks.js
import React, { useState, useEffect } from "react";
import Chat from "./Chat";
import MusicPlayer from "./MusicPlayer";
import { useWebSocket } from "./WebSocketContext";
import { useAuth } from "./AuthContext"; // Import useAuth hook
import "../styles/FillInTheBlanks.css"; // Import CSS file

const FillInTheBlanks = () => {
  const client = useWebSocket();

  const [currentPlayers, setCurrentPlayers] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [currentClue, setCurrentClue] = useState("");
  const [roundWinner, setRoundWinner] = useState("");
  const [roundStatus, setRoundStatus] = useState("in progress");
  const [countdown, setCountdown] = useState(-1);
  const { username } = useAuth();

  const connectPlayer = () => {
    if (client) {
      console.log(
        "Websocket client username: ",
        username + " has connected to the game room"
      );
      client.send(
        JSON.stringify({
          type: "connectPlayer",
          user: username,
        })
      );
    }
  };

  useEffect(() => {
    if (client) {
      connectPlayer();

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
          console.log("Player count update from server: ", data.playerCount);

          setCurrentPlayers(data.playerCount);
        }
      };
    }
  }, [client]);

  const checkAnswer = (answer) => {
    if (answer.length === currentWord.length) {
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
      {/* <div className="music-box">
        <MusicPlayer />
      </div> */}
      <div className="game">
        <div style={{ height: "45%" }}>
          <h1>Fill in the Blanks</h1>
          <p>Complete the word(s) by filling in the blanks</p>
        </div>
        <div className="word">
          {currentWord &&
            currentWord !== "" &&
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
