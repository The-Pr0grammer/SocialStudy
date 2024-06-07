import React from "react";
import { Provider } from 'react-redux';
import store from './redux/store';
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
  GameRoom,
  HWRoom,
  ChillRoom,
} from "./components";
import "./App.css";

function AppRoutes() {
  const { isLoggedIn } = useAuth();  // Ensure useAuth is actually exported and used correctly

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
      <Route path="/room-a" element={<GameRoom />} />
      <Route path="/room-b" element={<HWRoom />} />
      <Route path="/room-c" element={<ChillRoom />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}> {/* Redux Provider wrapping everything */}
      <Router>
        <AuthProvider>
          <RoomProvider>
            <WebSocketProvider>
              {/* All components inside here can now access Redux store */}
              <AppRoutes />
            </WebSocketProvider>
          </RoomProvider>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
