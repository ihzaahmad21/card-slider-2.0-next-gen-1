import React, { useState } from 'react';
import {
  ANIMATION_SPEED_OPTIONS,
  CARD_QUALITY_OPTIONS,
  DEFAULT_SORT_OPTIONS
} from '../config/defaultSettings';
import { AUDIO_TRACKS } from '../config/audioTracks';
import useEscapeKey from '../hooks/useEscapeKey.js';
import './SettingsModal.css';

const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    className={`settings-toggle ${checked ? 'on' : ''} ${disabled ? 'disabled' : ''}`}
    onClick={() => !disabled && onChange(!checked)}
  >
    <span className="settings-toggle-knob" />
  </button>
);

const Row = ({ label, hint, children }) => (
  <div className="settings-row">
    <div className="settings-row-info">
      <span className="settings-row-label">{label}</span>
      {hint && <span className="settings-row-hint">{hint}</span>}
    </div>
    <div className="settings-row-control">{children}</div>
  </div>
);

const TABS = [
  { id: 'audio', label: 'Audio', icon: '🎵' },
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'game', label: 'Game', icon: '🎮' },
  { id: 'notifications', label: 'Alerts', icon: '🔔' }
];

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  resetSettings,
  resetCategory,
  audio
}) {
  const [activeTab, setActiveTab] = useState('audio');

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const a = settings.audio;

  const handleVolume = (value) => {
    const volume = value;
    updateSetting('audio', 'volume', volume);
    audio?.changeVolume(volume);
  };

  const handleMuteChange = (next) => {
    if (next === a.muted) return;
    updateSetting('audio', 'muted', next);
    if (audio) {
      if (next && !audio.isMuted) audio.toggleMute();
      if (!next && audio.isMuted) audio.toggleMute();
    }
  };

  const handleEnabledChange = (next) => {
    updateSetting('audio', 'enabled', next);
    if (!next) {
      updateSetting('audio', 'muted', true);
      if (audio && !audio.isMuted) audio.toggleMute();
    } else if (audio.isMuted && a.muted) {
      audio.toggleMute();
    }
  };

  const handleTrackChange = (trackId) => {
    updateSetting('audio', 'currentTrack', trackId);
    audio?.changeTrack(trackId);
  };

  const displayVolume = audio && audio.isMuted ? 0 : Math.round((audio?.volume ?? a.volume) * 100);

  const handleResetAll = () => {
    if (window.confirm('Reset all settings to default? This cannot be undone.')) {
      resetSettings();
    }
  };

  const handleResetCategory = () => {
    if (window.confirm(`Reset ${TABS.find(t => t.id === activeTab).label} settings to default?`)) {
      resetCategory(activeTab);
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-modal-header">
          <div className="settings-modal-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
            <span>Settings</span>
          </div>
          <button className="settings-modal-close" onClick={onClose} title="Close (ESC)">✕</button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings-tab-icon">{tab.icon}</span>
              <span className="settings-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-modal-body">
          {/* ---------- AUDIO TAB ---------- */}
          {activeTab === 'audio' && (
            <>
              <Row label="Music Enabled" hint="Turn background music on/off">
                <Toggle checked={a.enabled} onChange={handleEnabledChange} />
              </Row>

              <Row label="Volume" hint={`${displayVolume}%`}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={displayVolume}
                  onChange={(e) => handleVolume(parseInt(e.target.value, 10) / 100)}
                  className="settings-range"
                />
              </Row>

              <Row label="Muted" hint="Instantly silence BGM">
                <Toggle checked={a.muted} onChange={handleMuteChange} />
              </Row>

              <Row label="Track" hint="Current Storm 4 OST">
                <select
                  className="settings-select"
                  value={a.currentTrack}
                  onChange={(e) => handleTrackChange(e.target.value)}
                >
                  {AUDIO_TRACKS.map(track => (
                    <option key={track.id} value={track.id}>{track.name}</option>
                  ))}
                </select>
              </Row>
            </>
          )}

          {/* ---------- DISPLAY TAB ---------- */}
          {activeTab === 'display' && (
            <>
              <Row label="Reduce Motion" hint="Disable unnecessary animations">
                <Toggle
                  checked={settings.display.reduceMotion}
                  onChange={(v) => updateSetting('display', 'reduceMotion', v)}
                />
              </Row>

              <Row label="Card Animation Speed" hint="How fast cards animate">
                <select
                  className="settings-select"
                  value={settings.display.cardAnimationSpeed}
                  onChange={(e) => updateSetting('display', 'cardAnimationSpeed', e.target.value)}
                >
                  {ANIMATION_SPEED_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Row>

              <Row label="Card Quality" hint="Image quality vs. performance">
                <select
                  className="settings-select"
                  value={settings.display.cardQuality}
                  onChange={(e) => updateSetting('display', 'cardQuality', e.target.value)}
                >
                  {CARD_QUALITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Row>

              <Row label="Show Tooltips" hint="Show helper tooltips on hover">
                <Toggle
                  checked={settings.display.showTooltips}
                  onChange={(v) => updateSetting('display', 'showTooltips', v)}
                />
              </Row>
            </>
          )}

          {/* ---------- GAME TAB ---------- */}
          {activeTab === 'game' && (
            <>
              <Row label="Auto-Save" hint="Automatically persist progress">
                <Toggle
                  checked={settings.game.autoSave}
                  onChange={(v) => updateSetting('game', 'autoSave', v)}
                />
              </Row>

              <Row label="Confirm Purchases" hint="Ask before spending coins">
                <Toggle
                  checked={settings.game.confirmPurchases}
                  onChange={(v) => updateSetting('game', 'confirmPurchases', v)}
                />
              </Row>

              <Row label="Show Card Values" hint="Display coin value on cards">
                <Toggle
                  checked={settings.game.showCardValues}
                  onChange={(v) => updateSetting('game', 'showCardValues', v)}
                />
              </Row>

              <Row label="Default Inventory Sort" hint="First sorting applied to inventory">
                <select
                  className="settings-select"
                  value={settings.game.defaultSortOrder}
                  onChange={(e) => updateSetting('game', 'defaultSortOrder', e.target.value)}
                >
                  {DEFAULT_SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Row>
            </>
          )}

          {/* ---------- NOTIFICATIONS TAB ---------- */}
          {activeTab === 'notifications' && (
            <>
              <Row label="Notifications" hint="Master toggle for all alerts">
                <Toggle
                  checked={settings.notifications.enabled}
                  onChange={(v) => updateSetting('notifications', 'enabled', v)}
                />
              </Row>

              <Row label="Pack Opening" hint="Notify when opening packs">
                <Toggle
                  checked={settings.notifications.packOpening}
                  disabled={!settings.notifications.enabled}
                  onChange={(v) => updateSetting('notifications', 'packOpening', v)}
                />
              </Row>

              <Row label="Achievements" hint="Notify on achievement unlocks">
                <Toggle
                  checked={settings.notifications.achievements}
                  disabled={!settings.notifications.enabled}
                  onChange={(v) => updateSetting('notifications', 'achievements', v)}
                />
              </Row>

              <Row label="Daily Rewards" hint="Reminder when a daily bonus is ready">
                <Toggle
                  checked={settings.notifications.dailyRewards}
                  disabled={!settings.notifications.enabled}
                  onChange={(v) => updateSetting('notifications', 'dailyRewards', v)}
                />
              </Row>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="settings-modal-footer">
          <button className="settings-reset-btn" onClick={handleResetCategory}>
            Reset {TABS.find(t => t.id === activeTab).label}
          </button>
          <button className="settings-reset-btn danger" onClick={handleResetAll}>
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}