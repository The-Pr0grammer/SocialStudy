import React, { useState } from "react";
import Login from "./components/Login";
import RoomSelection from "./components/RoomSelection";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track authentication status

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Update authentication status to true upon successful login
    console.log("Login successful!");
  };

  return (
    <div>
      {!isLoggedIn ? ( // Render login component if not logged in
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Render room selection component if logged in
        <RoomSelection />
      )}
    </div>
  );
}

export default App;
