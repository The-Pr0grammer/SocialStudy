// FillInTheBlanks.js
import React, { useState, useEffect } from "react";
import Chat from "./Chat";
import MusicPlayer from "./MusicPlayer";
import { useWebSocket } from "./WebSocketContext";

const FillInTheBlanks = ({ userName }) => {
  const client = useWebSocket();

  const [currentWord, setCurrentWord] = useState("");
  const [currentClue, setCurrentClue] = useState("");
  const [roundWinner, setRoundWinner] = useState("");
  const [roundStatus, setRoundStatus] = useState("in progress");
  const [countdown, setCountdown] = useState(-1);

  const checkAnswer = (answer, userName) => {
    if (answer.length === currentWord.length) {
      client.send(
        JSON.stringify({
          type: "check",
          message: answer.toLowerCase(),
          user: userName,
        })
      );
    }
  };

  useEffect(() => {
    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);

      if (dataFromServer.type === "connectionConfirmation") {
        client.send(
          JSON.stringify({
            type: "connectionAcknowledgement",
          })
        );
      } else if (dataFromServer.type === "currentWord") {
        setCurrentWord(dataFromServer.word);
        setCurrentClue(dataFromServer.clue);
      } else if (dataFromServer.type === "countdown") {
        setCountdown(dataFromServer.countdown);
      } else if (dataFromServer.type === "updateRoundStatus") {
        setRoundStatus(dataFromServer.roundStatus);
        setRoundWinner(dataFromServer.roundWinner);
      }
    };

    client.onclose = () => {
      console.log("WebSocket Client Disconnected");
    };
  }, [client]); // Include currentWord in the dependency array

  useEffect(() => {
    console.log("CONSOLE LOG FROM FITB roundstatus is:", roundStatus);
  }, [roundStatus]);

  return (
    <div className="main">
      <div className="music-box">
        <MusicPlayer />
      </div>
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
          <p>Clue: "{currentClue}"</p>
        </div>
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
        <Chat userName={userName} checkAnswer={checkAnswer} />
      </div>
    </div>
  );
};

export default FillInTheBlanks;
