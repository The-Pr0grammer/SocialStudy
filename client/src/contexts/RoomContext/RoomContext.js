// RoomContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    currentRoom && console.log("RoomContext.js: Current room:", currentRoom);
  }, [currentRoom]);

  return (
    <RoomContext.Provider value={{ currentRoom, setCurrentRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);
