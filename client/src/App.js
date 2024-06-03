import React, { useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./components/Login";
import RoomSelection from "./components/RoomSelection";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track authentication status

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Update authentication status to true upon successful login
    console.log("Login successful!");
  };

  return (
    <Router>
      <div>
        {isLoggedIn ? (
          <Route path="/room-selection" component={RoomSelection} />
        ) : (
          <Route
            path="/login"
            render={() => <Login onLoginSuccess={handleLoginSuccess} />}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
