import React, { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./WebSocketContext";
import { Icon } from "@mui/material";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import PauseCircleFilledOutlinedIcon from "@mui/icons-material/PauseCircleFilledOutlined";

const MusicPlayer = () => {
  const client = useWebSocket();
  const songUrl = process.env.PUBLIC_URL + "/assets/music/Nomyn - Vision.mp3";
  const [musicState, setMusicState] = useState({
    isPlaying: true,
    currentTime: 0,
  });
  const audioRef = useRef(null);
  const [localIsPlaying, setLocalIsPlaying] = useState(true);

  const syncMusic = (musicState) => {
    if (audioRef.current) {
      const now = Date.now();
      const elapsed = (now - musicState.timestamp) / 1000;
      const updatedTime = musicState.currentTime + elapsed;

      audioRef.current.currentTime = updatedTime;
      if (musicState.isPlaying && localIsPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (localIsPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setLocalIsPlaying(!localIsPlaying);
    }
  };

  useEffect(() => {
    if (client) {
      client.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);

        if (dataFromServer.type === "musicState") {
          setMusicState(dataFromServer.musicState);
          syncMusic(dataFromServer.musicState);
        }
      };
    }
  }, [client]);

  return (
    <div className="music-container">
      <h1 style={{ marginRight: "1%" }}>Current Song: Nomyn - Vision </h1>
      <audio ref={audioRef} src={songUrl} autoPlay />

      {localIsPlaying ? (
        <PauseCircleFilledOutlinedIcon
          onClick={toggleMusic}
          style={{ fontSize: "40px", cursor: "pointer" }}
        />
      ) : (
        <PlayCircleFilledOutlinedIcon
          onClick={toggleMusic}
          style={{ fontSize: "40px", cursor: "pointer" }}
        />
      )}
    </div>
  );
};

export default MusicPlayer;
