import React from "react";
import "../styles/RoomSelection.css"; // Import CSS file for styling

function RoomSelection() {
  // Function to handle room selection
  const handleRoomSelection = (room) => {
    // Logic to handle room selection
    console.log("Selected room:", room);
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
      {/* Apply button classname */}
    </div>
  );
}

export default RoomSelection;
