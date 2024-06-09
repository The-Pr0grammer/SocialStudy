import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";
import "../styles/DragAndDrop.css";

const ItemTypes = {
  ITEM: "item",
};

const DragItem = ({ id, type, children }) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemTypes.ITEM,
    item: { id, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={ref}
      className="drag-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {children}
    </div>
  );
};

const DropBox = ({ id, accept, onDrop, children }) => {
  const [, ref] = useDrop({
    accept: accept,
    drop: (item) => {
      console.log(`DropBox ${id} received item:`, item); // Added detailed logging
      onDrop(id, item);
    },
  });

  const handleRemoveItem = () => {
    onDrop(id, null); // Remove the item from the box
  };

  return (
    <div ref={ref} className="drop-box">
      {children}
      {children && (
        <button className="remove-item" onClick={handleRemoveItem}>
          X
        </button>
      )}
    </div>
  );
};

const DragAndDrop = ({ onGameSwitch }) => {
  const { client } = useWebSocket();
  const { username } = useAuth();
  const { currentRoom, setCurrentRoom } = useRoom();
  const [roundWinner, setRoundWinner] = useState("");
  const [roundStatus, setRoundStatus] = useState("in progress");
  const [currentPlayers, setCurrentPlayers] = useState(0);

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
  }, []);

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
        // console.log("FillInTheBlanks.js: WebSocket connection closed");
      };
    }
  }, [client]);

  const [equation, setEquation] = useState(["", "", "", "", ""]);
  const [result, setResult] = useState(null);

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const symbols = ["+", "-", "X", "/"];

  const handleDrop = (index, item) => {
    console.log("Dropped item:", item, "at index:", index); // Debugging log
    setEquation(
      update(equation, {
        [index]: { $set: item ? item.id : "" }, // Set empty string if item is null (removed)
      })
    );
  };

  const checkEquation = () => {
    const formattedEquation = equation.join("").replace(/X/g, "*"); // Ensure multiplication is represented correctly
    try {
      const evalResult = eval(formattedEquation);
      setResult(`Result: ${evalResult}`); // Displaying result
    } catch (error) {
      setResult("Invalid equation");
    }
  };

  useEffect(() => {
    const formattedEquation = equation.join("").replace(/X/g, "*"); // Ensure multiplication is represented correctly
    try {
      const evalResult = eval(formattedEquation);
      setResult(`Result: ${evalResult}`); // Displaying result
    } catch (error) {
      setResult("Invalid equation");
    }
  }, [equation]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="math-game">
        <div className="heading">
          <h1>Math Mayhem</h1>
          <p>
            Drag and drop the numbers and symbols to complete a valid equation.
          </p>
        </div>
        {result !== null && <div className="result">Result: {result}</div>}
        <div className="numbers">
          {numbers.map((number) => (
            <DragItem key={number} id={number} type={ItemTypes.ITEM}>
              {number}
            </DragItem>
          ))}
        </div>
        <div className="symbols">
          {symbols.map((symbol) => (
            <DragItem key={symbol} id={symbol} type={ItemTypes.ITEM}>
              {symbol}
            </DragItem>
          ))}
        </div>
        <div className="equation">
          {equation.map((item, index) => (
            <DropBox
              key={index}
              id={index}
              accept={[ItemTypes.ITEM]}
              onDrop={handleDrop}
            >
              {item}
            </DropBox>
          ))}
        </div>
        <button className="check-button" onClick={checkEquation}>
          Check Equation
        </button>

        <p style={{ color: "white" }}>Players: {currentPlayers}</p>
      </div>
    </DndProvider>
  );
};

export default DragAndDrop;
