// Chat.js
import React, { useState, useEffect } from "react";
import { useWebSocket } from "./WebSocketContext";

const Chat = ({ userName, checkAnswer }) => {
  const client = useWebSocket();
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState([]);

  const onSend = () => {
    if (client && client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({
          type: "message",
          message: chat,
          user: userName,
        })
      );
      setChat("");
      checkAnswer(chat, userName);
    }
  };

  useEffect(() => {
    if (client) {
      const handleMessage = (message) => {
        const dataFromServer = JSON.parse(message.data);

        if (dataFromServer.type === "message") {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              message: dataFromServer.message,
              user: dataFromServer.user,
            },
          ]);
        }
      };

      client.addEventListener("message", handleMessage);

      return () => {
        client.removeEventListener("message", handleMessage);
      };
    }
  }, [client]);

  return (
    <div className="main">
      <div className="chatbox">
        <h1 style={{textAlign:"left", "paddingLeft":"50px"}}>Logged in as: "{userName}"</h1>

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
