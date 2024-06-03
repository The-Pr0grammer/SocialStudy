import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from 'react-router-dom'
import "../styles/RoomSelection.css"; // Import CSS file for styling

function RoomSelection() {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to handle room selection
  const handleRoomSelection = (room) => {
    switch (room) {
      case "Room A":
        console.log("Selected room:", room);
        navigate("/room-a"); // Use navigate to navigate to '/room-a'
        break;
      case "Room B":
        navigate("/room-b"); // Use navigate to navigate to '/room-b'
        break;
      case "Room C":
        navigate("/room-c"); // Use navigate to navigate to '/room-c'
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
        onClick={() => handleRoomSelection("Room A")}
      >
        Game Room
      </button>
      <button
        className="room-button"
        onClick={() => handleRoomSelection("Room B")}
      >
        Chill Room
      </button>
      <button
        className="room-button"
        onClick={() => handleRoomSelection("Room C")}
      >
        HW Room
      </button>
    </div>
  );
}

export default RoomSelection;
