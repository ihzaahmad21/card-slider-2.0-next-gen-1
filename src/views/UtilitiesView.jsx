import React from 'react';
import QuickStats from '../components/QuickStats.jsx';
import DailyBonus from '../components/DailyBonus.jsx';
import AudioControls from '../components/AudioControls.jsx';
import SettingsButton from '../components/SettingsButton.jsx';
import './UtilitiesView.css';

export default function UtilitiesView({ inventory = [], allCards = [], audio, onOpenSettings, onClaimDaily }) {
  return (
    <section className="view active" id="view-utilities">
      <div className="utilities-page">
        <div className="section-header">
          <span className="section-subtitle">Dashboard &amp; Tools</span>
          <h2 className="section-title">Utilities</h2>
        </div>

        <div className="utilities-grid">
          {/* Collection Stats — full width card */}
          <div className="util-card util-card-stats">
            <QuickStats inventory={inventory} allCards={allCards} />
          </div>

          {/* Daily Bonus */}
          <div className="util-card util-card-daily">
            <DailyBonus onClaim={onClaimDaily} />
          </div>

          {/* Audio Controls */}
          <div className="util-card util-card-audio">
            <AudioControls audio={audio} />
          </div>

          {/* Settings */}
          <div className="util-card util-card-settings">
            <SettingsButton onClick={onOpenSettings} />
          </div>
        </div>
      </div>
    </section>
  );
}
