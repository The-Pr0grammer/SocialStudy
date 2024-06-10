import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { setCurrentGame} from "../redux/gameRoom/gameSlice";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import "../styles/FillInTheBlanks.css";

const FillInTheBlanks = () => {
  const { client } = useWebSocket();
  const { username } = useAuth();

  const [countdown, setCountdown] = useState(-1);
  const [loading, setLoading] = useState(true);
  

  const currentWord = useSelector((state) => state.gameRoom.currentWord);
  const currentPlayers = useSelector((state) => state.gameRoom.playerCount);
  const currentClue = useSelector((state) => state.gameRoom.currentClue);
  const roundWinner = useSelector((state) => state.gameRoom.roundWinner);
  const roundStatus = useSelector((state) => state.gameRoom.roundStatus);

  useEffect(() => {
    if (!client || client.readyState !== WebSocket.OPEN || !username) {
      setLoading(true);
      console.log("Client is not ready or user is not logged in. FITB");
      return;
    }

    client.send(
      JSON.stringify({
        type: "requestWord",
      })
    );

    // Set loading to false once the client is connected and handlers are set
    setLoading(false);
  }, [client]); // Only re-run the effect if `client` changes

  if (loading) {
    return <div style={{ textSize: "2.5em" }}>Loading...</div>;
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
