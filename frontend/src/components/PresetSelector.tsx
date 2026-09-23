import React from 'react';
import { PRESET_SCENARIOS, PresetScenario } from '../data/presets';
import { Sparkles } from 'lucide-react';

interface PresetSelectorProps {
  activePresetId: string;
  onSelectPreset: (preset: PresetScenario) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <div className="glass-panel presets-container">
      <div className="presets-label">
        <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
        Escenarios de Prueba:
      </div>
      {PRESET_SCENARIOS.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className={`preset-chip ${isActive ? 'active' : ''}`}
            title={preset.description}
          >
            <span>{preset.title}</span>
            <span
              style={{
                fontSize: '10px',
                opacity: 0.75,
                marginLeft: '6px',
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              {preset.tag}
            </span>
          </button>
        );
      })}
    </div>
  );
};
