import React from "react";
import PropTypes from "prop-types";
import "../styles/VideoPlayer.css";

const VideoPlayer = ({ videoUrl }) => {
  // Ensure the video URL includes the autoplay parameter
  const autoplayUrl = `${videoUrl}?autoplay=1`;

  return (
    <div className="video-container">
      <iframe
        width="560"
        height="315"
        src={autoplayUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube Video Player"
      ></iframe>
    </div>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
};

export default VideoPlayer;
