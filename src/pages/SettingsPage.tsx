// ========== Main Settings Page ===============================================================================================

import '../styles/SettingsPage.css'
import { useSettings } from '../hooks/useSettings'

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="settingsPage">
      <div className="settingsContainer">

        {/* Page title */}
        <div className="settingsPageHeader">
          <h1 className="settingsPageTitle">Settings</h1>
          <div className="settingsPageTitleLine" />
        </div>

        {/* Gameplay section */}
        <section className="settingsSection">
          <div className="settingsSectionHeader">
            <div className="settingsSectionLine" />
            <span className="settingsSectionLabel">Gameplay</span>
            <div className="settingsSectionLine" />
          </div>

          <div className="settingsCard">
            <label className="settingsRow">
              <div className="settingsRowBody">
                <span className="settingsRowLabel">Start with full Energy</span>
                <p className="settingsRowDesc">
                  When enabled, all characters begin with their maximum Energy. This also applies when loading or importing a rotation.
                </p>
              </div>
              <div className="settingsToggleWrap">
                <input
                  type="checkbox"
                  checked={settings.startWithFullEnergy}
                  onChange={e => updateSetting('startWithFullEnergy', e.target.checked)}
                />
                <div className="settingsToggleTrack">
                  <div className="settingsToggleThumb" />
                </div>
              </div>
            </label>

            <div className="settingsRowDivider" />

            <label className="settingsRow">
              <div className="settingsRowBody">
                <span className="settingsRowLabel">Auto-cast required follow-ups</span>
                <p className="settingsRowDesc">
                  When enabled, actions that require a specific follow-up will automatically cast the entire follow-up chain without manual selection.
                </p>
              </div>
              <div className="settingsToggleWrap">
                <input
                  type="checkbox"
                  checked={settings.autocastFollowUps}
                  onChange={e => updateSetting('autocastFollowUps', e.target.checked)}
                />
                <div className="settingsToggleTrack">
                  <div className="settingsToggleThumb" />
                </div>
              </div>
            </label>

            <div className="settingsRowDivider" />

            <label className="settingsRow">
              <div className="settingsRowBody">
                <span className="settingsRowLabel">Use fixed stacks</span>
                <p className="settingsRowDesc">
                  When enabled, actions with variable stack-based multipliers use a fixed stack value instead of the actual runtime amount. For example, Hiyuki's Foreclaimed Liberation uses 1.5 Snowforged Blade stacks.
                </p>
              </div>
              <div className="settingsToggleWrap">
                <input
                  type="checkbox"
                  checked={settings.useFixedStacks}
                  onChange={e => updateSetting('useFixedStacks', e.target.checked)}
                />
                <div className="settingsToggleTrack">
                  <div className="settingsToggleThumb" />
                </div>
              </div>
            </label>

            <div className="settingsRowDivider" />

            <label className="settingsRow">
              <div className="settingsRowBody">
                <span className="settingsRowLabel">Row deletion mode</span>
                <p className="settingsRowDesc">
                  When enabled, each action row shows a delete button. Clicking it removes that row and all rows after it, then replays the remaining steps from scratch.
                </p>
              </div>
              <div className="settingsToggleWrap">
                <input
                  type="checkbox"
                  checked={settings.rowDeletionMode}
                  onChange={e => updateSetting('rowDeletionMode', e.target.checked)}
                />
                <div className="settingsToggleTrack">
                  <div className="settingsToggleThumb" />
                </div>
              </div>
            </label>

            <div className="settingsRowDivider" />

            <label className="settingsRow">
              <div className="settingsRowBody">
                <span className="settingsRowLabel">Auto-trigger Outro/Intro on character select</span>
                <p className="settingsRowDesc">
                  When enabled, switching to a different character automatically fires the Outro and Intro without requiring you to pick an action first. Useful for inspecting the post-intro state before committing to the next action.
                </p>
              </div>
              <div className="settingsToggleWrap">
                <input
                  type="checkbox"
                  checked={settings.triggerOutroIntroOnCharacterSelect}
                  onChange={e => updateSetting('triggerOutroIntroOnCharacterSelect', e.target.checked)}
                />
                <div className="settingsToggleTrack">
                  <div className="settingsToggleThumb" />
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Debug section */}
        <section className="settingsSection">
          <div className="settingsSectionHeader">
            <div className="settingsSectionLine" />
            <span className="settingsSectionLabel">Debug</span>
            <div className="settingsSectionLine" />
          </div>

          <div className="settingsCard settingsCardSandbox">
            <label className="settingsRow settingsRowSandbox">
              <div className="settingsRowBody">
                <span className="settingsRowLabel settingsRowLabelSandbox">Sandbox mode</span>
                <p className="settingsRowDesc">
                  When enabled, all cast restrictions are ignored: cooldowns, energy costs, position requirements, form requirements, follow-up locks, and any other condition that would normally block an action.
                </p>
              </div>
              <div className="settingsToggleWrap settingsToggleWrapSandbox">
                <input
                  type="checkbox"
                  checked={settings.sandboxMode}
                  onChange={e => updateSetting('sandboxMode', e.target.checked)}
                />
                <div className="settingsToggleTrack">
                  <div className="settingsToggleThumb" />
                </div>
              </div>
            </label>
          </div>
        </section>

      </div>
    </div>
  )
}
