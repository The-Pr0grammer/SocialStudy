//App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  AuthProvider,
  WebSocketProvider,
  RoomProvider,
  useAuth,
} from "./contexts";
import {
  Login,
  RoomSelection,
  FillInTheBlanks,
  HWRoom,
  ChillRoom,
} from "./components";
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
        <RoomProvider>
          <WebSocketProvider>
            <AppRoutes />
          </WebSocketProvider>
        </RoomProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
