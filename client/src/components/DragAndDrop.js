import React, { useState } from "react";
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
      {children && id !== 3 && ( // Render the "X" button only if there's an item and it's not the "=" box
        <button className="remove-item" onClick={handleRemoveItem}>
          X
        </button>
      )}
    </div>
  );
};

const DragAndDrop = ({ onGameSwitch }) => {
  const [equation, setEquation] = useState(["", "", "", "=", ""]);
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
    const lhs = equation
      .slice(0, equation.indexOf("="))
      .join("")
      .replace("X", "*");
    const rhs = equation
      .slice(equation.indexOf("=") + 1)
      .join("")
      .replace("X", "*");
    console.log("LHS:", lhs, "RHS:", rhs); // Debugging log

    try {
      // eslint-disable-next-line no-eval
      const evalLhs = eval(lhs);
      // eslint-disable-next-line no-eval
      const evalRhs = eval(rhs);
      if (evalLhs === evalRhs) {
        setResult("Correct");
        setEquation(["", "", "", "=", ""]); // Reset equation to initial state
      } else {
        setResult("Incorrect");
      }
    } catch (e) {
      setResult("Invalid equation");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="math-game">
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
        {result !== null && <div className="result">Result: {result}</div>}
      </div>
    </DndProvider>
  );
};

export default DragAndDrop;
