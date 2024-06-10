import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCountdown } from "../redux/gameRoom/gameSlice";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
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

const DragAndDrop = () => {
  const { client } = useWebSocket();
  const { username } = useAuth();
  const [loading, setLoading] = useState(true);

  const targetNumber = useSelector((state) => state.gameRoom.targetNumber);
  const roundWinner = useSelector((state) => state.gameRoom.roundWinner);
  const roundStatus = useSelector((state) => state.gameRoom.roundStatus);
  const currentPlayers = useSelector((state) => state.gameRoom.playerCount);
  const countdown = useSelector((state) => state.gameRoom.countdown);
  const [localCountdown, setLocalCountdown] = useState(countdown);
  const dispatch = useDispatch();

  let countInterval = null;

  const [equation, setEquation] = useState(["", "", "", "", ""]);
  const [result, setResult] = useState(null);

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const symbols = ["+", "-", "X", "/"];

  useEffect(() => {
    console.log("DragAndDrop.js: Setting up game", equation);
    if (!client || client.readyState !== WebSocket.OPEN || !username) {
      setLoading(true);
      console.log("Client is not ready or user is not logged in.");
      return;
    }

    client.send(
      JSON.stringify({
        type: "requestNumber",
      })
    );

    client.send(
      JSON.stringify({
        type: "requestCountdown",
      })
    );

    // Set loading to false once the client is connected and handlers are set
    setLoading(false);
  }, [client]);

  useEffect(() => {
    // Initialize local countdown state
    setLocalCountdown(countdown);

    // Setup the interval
    const countInterval = setInterval(() => {
      setLocalCountdown((prevCount) => {
        console.log("Local Countdown:", prevCount - 1); // Debugging log
        return prevCount - 1;
      });
    }, 1000);

    // Cleanup interval on component unmount or countdown change
    return () => clearInterval(countInterval);
  }, [countdown]); // Dependency on countdown from Redux

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
      if (!equation.every((element) => element === "")) {
        setResult(`${evalResult}`); // Displaying result if not all boxes are empty
      } else {
        setResult(null);
      }
    } catch (error) {
      setResult("Invalid equation");
    }
  };

  useEffect(() => {
    const formattedEquation = equation.join("").replace(/X/g, "*"); // Ensure multiplication is represented correctly
    try {
      const evalResult = eval(formattedEquation);
      if (!equation.every((element) => element === "")) {
        setResult(`${evalResult}`); // Displaying result if not all boxes are empty
      } else {
        setResult(null);
      }
    } catch (error) {
      setResult("Invalid equation");
    }
  }, [equation]);

  if (loading) {
    return <div style={{ textSize: "2.5em" }}>Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="math-game">
        <div className="heading">
          <h1>Math Mayhem</h1>
          <p>
            Drag and drop the numbers and symbols to complete a valid equation.
          </p>
        </div>
        <div className="info-row">
          <h2 className="target">Target Number: {targetNumber}</h2>
          <p className="countdown">Countdown: {localCountdown}</p>
        </div>
        <div className="result"> Result: {result}</div>
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
        {roundStatus === "complete" && (
          <div className="status">
            <h1>{roundWinner} got the answer correct!</h1>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default DragAndDrop;
