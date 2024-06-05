// hooks/useRoom.js
import { useContext } from "react";
import { RoomContext } from "../RoomContext";

const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};

export default useRoom;
