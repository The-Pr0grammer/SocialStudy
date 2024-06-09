import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentWord } from "../redux/gameRoom/gameSlice";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import "../styles/FillInTheBlanks.css";

const FillInTheBlanks = ({ onGameSwitch }) => {
  const { client } = useWebSocket();
  const { username } = useAuth();
  const { currentRoom, setCurrentRoom } = useRoom();

  const [currentPlayers, setCurrentPlayers] = useState(0);
  const [currentClue, setCurrentClue] = useState("");
  const [roundWinner, setRoundWinner] = useState("");
  const [roundStatus, setRoundStatus] = useState("in progress");
  const [countdown, setCountdown] = useState(-1);
  const [loading, setLoading] = useState(true);

  const currentWord = useSelector((state) => state.gameRoom.currentWord);
  const dispatch = useDispatch();

  useEffect(() => {
    setCurrentRoom("gameRoom");

    console.log("WebSocketContext.js: Checking if client is open...", client);

    if (client && client.readyState === WebSocket.OPEN && username) {
      client.send(
        JSON.stringify({
          type: "joinRoom",
          room: "gameRoom",
          user: username,
        })
      );

      client.send(
        JSON.stringify({
          type: "requestWord",
        })
      );

      client.onmessage = (message) => {
        const data = JSON.parse(message.data);

        switch (data.type) {
          case "connectionConfirmation":
            console.log(
              "WebSocketContext.js: Connection confirmation received, sending acknowledgement... from gameroom"
            );
            client.send(
              JSON.stringify({
                type: "connectionAcknowledgement",
              })
            );
            break;
          case "currentWord":
            dispatch(setCurrentWord(data.word));
            setCurrentClue(data.clue);
            break;
          case "updateRoundWinner":
            setRoundWinner(data.roundWinner);
            break;
          case "playerCount":
            setCurrentPlayers(data.playerCount);
            break;
          case "updateRoundStatus":
            setRoundStatus(data.roundStatus);
            break;
          case "switchGame":
            onGameSwitch(data.game);
            break;
          default:
            break;
        }
      };

      client.onclose = () => {
        // console.log("FillInTheBlanks.js: WebSocket connection closed");
      };

      setLoading(false); // Set loading to false once the client is connected
    }
  }, [client]);

  if (loading) {
    return (
      <div style={{ textSize: "2.5em" }}>
        Loading Loading Loading Loading Loading Loading Loading Loading Loading
        Loading Loading Loading Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="game">
        <div style={{ height: "45%" }}>
          <h1>Fill in the Blanks</h1>
          <p>
            Complete the word(s) by filling in the blanks. First person with the
            correct answer wins
          </p>
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

      {roundStatus === "complete" && (
        <div className="status">
          <h1>{roundWinner} got the answer correct!</h1>
        </div>
      )}
    </div>
  );
};

export default FillInTheBlanks;
