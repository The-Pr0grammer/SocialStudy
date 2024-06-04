// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { WebSocketProvider } from "./components/WebSocketContext";
import Login from "./components/Login";
import RoomSelection from "./components/RoomSelection";
import FillInTheBlanks from "./components/FillInTheBlanks";
import HWRoom from "./components/HWRoom";
import ChillRoom from "./components/ChillRoom";
import "./App.css";

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/room-selection" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/room-selection" element={<RoomSelection />} />
      <Route path="/room-a" element={<FillInTheBlanks />} />
      <Route path="/room-b" element={<HWRoom />} />
      <Route path="/room-c" element={<ChillRoom />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <AppRoutes />
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
