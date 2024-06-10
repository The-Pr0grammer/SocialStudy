// Chat.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkAnswer } from "../redux/gameRoom/gameSlice";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import "../styles/Chat.css"; // Import CSS file

const Chat = () => {
  const { client } = useWebSocket();
  const { username } = useAuth();
  const { currentRoom } = useRoom();
  const [chat, setChat] = useState("");
  const messages = useSelector((state) => state.gameRoom.messages);

  const dispatch = useDispatch();

  const onSend = () => {
    if (client && client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({
          type: "message",
          message: chat,
          user: username,
        })
      );
      setChat("");
      currentRoom === "gameRoom" &&
        dispatch(checkAnswer(chat, client, username));
    }
  };

  return (
    <div className="main">
      <div className="chatbox">
        <h1 style={{ textAlign: "left", paddingLeft: "50px" }}>
          Logged in as: "{username}"
        </h1>

        <div className="messages">
          {messages.map((message, key) => (
            <div key={key}>
              {message.user} : {message.message}
            </div>
          ))}
        </div>

        <div className="inputdiv">
          <input
            className="chat-input"
            type="text"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onSend()}
            placeholder="Type a message"
          />
          <button className="send-button" onClick={onSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
