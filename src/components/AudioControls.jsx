import React from 'react';
import './AudioControls.css';

const AudioControls = ({ audio }) => {
  const {
    isPlaying,
    volume,
    isMuted,
    currentTrack,
    isLoading,
    error,
    tracks,
    togglePlayPause,
    changeVolume,
    toggleMute,
    changeTrack,
    nextTrack,
    previousTrack
  } = audio || {};

  if (!audio) return null;

  const displayVolume = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div className="audio-controls">
      <div className="audio-controls-header">
        <svg className="audio-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span className="audio-label">Background Music</span>
      </div>

      {error && (
        <div className="audio-error" onClick={togglePlayPause}>
          <span>🔊 Click to enable audio</span>
        </div>
      )}

      <div className="audio-now-playing">
        <div className="audio-track-name">{currentTrack.name}</div>
        <div className="audio-track-mood">{currentTrack.mood}</div>
      </div>

      <div className="audio-playback-controls">
        <button 
          className="audio-btn audio-btn-sm"
          onClick={previousTrack}
          title="Previous Track"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>

        <button 
          className="audio-btn audio-btn-play"
          onClick={togglePlayPause}
          disabled={isLoading}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="audio-spinner" />
          ) : isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <button 
          className="audio-btn audio-btn-sm"
          onClick={nextTrack}
          title="Next Track"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z"/>
          </svg>
        </button>
      </div>

      <div className="audio-volume-control">
        <button 
          className="audio-btn audio-btn-sm"
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : volume < 0.5 ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          )}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={displayVolume}
          onChange={(e) => changeVolume(parseInt(e.target.value) / 100)}
          className="audio-volume-slider"
          title={`Volume: ${displayVolume}%`}
        />

        <span className="audio-volume-value">{displayVolume}%</span>
      </div>

      <div className="audio-track-selector">
        <label htmlFor="track-select" className="audio-select-label">
          Select Track:
        </label>
        <select
          id="track-select"
          value={currentTrack.id}
          onChange={(e) => changeTrack(e.target.value)}
          className="audio-select"
        >
          {tracks.map(track => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AudioControls;
