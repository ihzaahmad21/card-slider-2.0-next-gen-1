import React from 'react';
import './SettingsButton.css';

const SettingsButton = ({ onClick }) => {
  return (
    <button className="settings-button" onClick={onClick} title="Settings">
      <svg className="settings-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
      </svg>
      <span className="settings-label">Settings</span>
    </button>
  );
};

export default SettingsButton;