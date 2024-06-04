// RoomSelection.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoomSelection.css';

function RoomSelection() {
  const navigate = useNavigate();

  const handleRoomSelection = (room) => {
    switch (room) {
      case "Game Room":
        console.log("Selected room:", room);
        navigate("/room-a");
        break;
      case "Homework Room":
        console.log("Selected room:", room);
        navigate("/room-b");
        break;
      case "Chill Room":
        console.log("Selected room:", room);
        navigate("/room-c");
        break;
      default:
        break;
    }
  };

  return (
    <div className="room-selection-container">
      <h2 className="room-selection-title">Room Selection</h2>
      <button
        className="room-button"
        onClick={() => handleRoomSelection("Game Room")}
      >
        The Game Room
      </button>
      <button
        className="room-button"
        onClick={() => handleRoomSelection("Homework Room")}
      >
        The Homework Room
      </button>
      <button
        className="room-button"
        onClick={() => handleRoomSelection("Chill Room")}
      >
        The Chill Room
      </button>
    </div>
  );
}

export default RoomSelection;
