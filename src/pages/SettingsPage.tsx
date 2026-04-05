// ========== Main Settings Page ===============================================================================================

import { useSettings } from '../hooks/useSettings'

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Settings</h2>
      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.startWithFullEnergy}
            onChange={e => updateSetting('startWithFullEnergy', e.target.checked)}
          />
          Start characters with full Energy
        </label>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.7 }}>
          When enabled, all characters begin with their maximum Energy. This also applies when loading or importing a rotation.
        </p>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.autocastFollowUps}
            onChange={e => updateSetting('autocastFollowUps', e.target.checked)}
          />
          Auto-cast required follow-ups
        </label>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.7 }}>
          When enabled, actions that require a specific follow-up will automatically cast the entire follow-up chain without manual selection.
        </p>
      </div>
    </div>
  )
}
