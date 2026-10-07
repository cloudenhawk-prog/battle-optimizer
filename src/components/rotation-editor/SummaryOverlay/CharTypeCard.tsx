// Summary per-character card: portrait, role/liberation chips, damage origin strip, type bars, action breakdown
import { useState } from 'react'
import type { ActionBreakdownEntry, CharacterSummary, ContributionOriginEntry } from './summaryTypes'
import { DMG_TYPE_LABELS, ELEMENT_TO_NEGATIVE_STATUS_LABEL, getDmgTypeTheme, getElementColor } from './theme'
import type { CharColor } from './theme'
import type { CharacterRole } from './characterRoles'
import { formatDamage } from './format'

export function CharTypeCard({ summary, originEntry, actionBreakdown, role, charColorMap }: { summary: CharacterSummary; originEntry?: ContributionOriginEntry; actionBreakdown?: ActionBreakdownEntry[]; role?: CharacterRole; charColorMap: Map<string, CharColor> }) {
  const [expanded, setExpanded] = useState(false)
  const theme = charColorMap.get(summary.name) ?? getElementColor(summary.element)
  const allCharDamage = summary.directDamage + summary.caDamage + summary.passiveDamage
  const maxActionDmg = actionBreakdown && actionBreakdown.length > 0 ? actionBreakdown[0].damage : 1

  return (
    <div
      className="summaryCharCard"
      style={{ '--char-color': theme.primary, '--char-glow': theme.glow } as React.CSSProperties}
    >
      <div className="summaryCharCardAccent" />

      {/* Header */}
      <div className="summaryCharCardHeader">
        <div className="summaryCharCardPortrait">
          {summary.image ? (
            <img src={summary.image} alt={summary.name} className="summaryCharCardPortraitImg" />
          ) : (
            <div className="summaryCharCardPortraitFallback">{summary.name.slice(0, 2).toUpperCase()}</div>
          )}
          <div className="summaryCharCardPortraitGlow" />
        </div>
        <div className="summaryCharCardInfo">
          <div className="summaryCharCardName">{summary.name}</div>
          <div className="summaryCharCardGearTags">
            <span className="summaryCharCardGearTag">S{summary.sequence}</span>
            {summary.weaponName != null && <span className="summaryCharCardGearTag">R{summary.weaponRank} {summary.weaponName}</span>}
          </div>
        </div>
        <div className="summaryCharCardChips">
          {role && (
            <span
              className="summaryCharCardChip"
              style={{ color: theme.primary, borderColor: `color-mix(in srgb, ${theme.primary} 30%, transparent)`, background: `color-mix(in srgb, ${theme.primary} 8%, transparent)` }}
            >
              {role}
            </span>
          )}
          {summary.libCount > 0 && (
            <span
              className="summaryCharCardChip"
              style={{ color: theme.primary, borderColor: `color-mix(in srgb, ${theme.primary} 30%, transparent)`, background: `color-mix(in srgb, ${theme.primary} 8%, transparent)` }}
            >
              ×{summary.libCount} Liberation{summary.libCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Contribution origin strip — always shown to show where this character's damage comes from */}
      {originEntry && (
        <div className="summaryCharOriginStrip">
          <span
            className="summaryCharOriginChip"
            style={{ color: theme.primary, borderColor: `color-mix(in srgb, ${theme.primary} 40%, transparent)` }}
          >
            Self {originEntry.selfPct.toFixed(0)}%
          </span>
          {originEntry.buffedBy.map(b => {
            const bTheme = charColorMap.get(b.charName) ?? getElementColor(b.element)
            return (
              <span
                key={b.charName}
                className="summaryCharOriginChip"
                style={{ color: bTheme.primary, borderColor: `color-mix(in srgb, ${bTheme.primary} 40%, transparent)` }}
              >
                {b.pct.toFixed(0)}% from {b.charName}
              </span>
            )
          })}
        </div>
      )}

      {/* Damage-type bars — primary content. Click to toggle action breakdown */}
      {/* Each type receives the full damage of any action that carries it, so bars may sum beyond the card total. */}
      {summary.damageByType.length > 0 && (
        <div
          className="summaryCharTypeDisclaimer"
          style={{ color: `color-mix(in srgb, ${theme.primary} 70%, rgba(255,255,255,0.4))` }}
        >
          Damage Type Distribution
        </div>
      )}
      <div className="summaryCharTypeRowsGrid">
        {summary.damageByType.length === 0 ? (
          <div className="summaryCharTypeEmpty">No direct damage recorded</div>
        ) : (
          summary.damageByType.filter(({ damage }) => damage > 0).map(({ type, damage }) => {
            const teamPct = allCharDamage > 0 ? (damage / allCharDamage) * 100 : 0
            const typeTheme = getDmgTypeTheme(type)
            const typeLabel = type === 'NEGATIVE_STATUS'
              ? (ELEMENT_TO_NEGATIVE_STATUS_LABEL[summary.element] ?? DMG_TYPE_LABELS[type])
              : (DMG_TYPE_LABELS[type] ?? type)
            return (
              <div key={type} className="summaryCharTypeRow">
                <span className="summaryCharTypeLabel">{typeLabel}</span>
                <div className="summaryCharTypeBar">
                  <div
                    className="summaryCharTypeBarFill"
                    style={{
                      width: `${teamPct}%`,
                      background: typeTheme.color,
                      boxShadow: `0 0 8px ${typeTheme.glow}`,
                    }}
                  />
                </div>
                <span className="summaryCharTypePct">{teamPct.toFixed(1)}%</span>
              </div>
            )
          })
        )}
      </div>

      {/* Action breakdown — collapsed by default. Toggle via expand button. */}
      {actionBreakdown && actionBreakdown.length > 0 && (
        <>
          <button
            className="summaryCharExpandBtn"
            style={{ color: theme.primary }}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? '▲ Hide action detail' : '▼ Show action breakdown'}
          </button>
          {expanded && (
            <div className="summaryActionBreakdown">
              <div className="summaryActionBreakdownHeader">
                <span className="summaryActionCount summaryActionHeaderLabel">Casts</span>
                <span className="summaryActionName summaryActionHeaderLabel">Action</span>
                <div className="summaryActionBar summaryActionBarSpacer" />
                <span className="summaryActionValue summaryActionHeaderLabel">Total DMG</span>
                <span className="summaryActionPct summaryActionHeaderLabel">Share</span>
              </div>
              {actionBreakdown.map(entry => {
                const barPct = maxActionDmg > 0 ? (entry.damage / maxActionDmg) * 100 : 0
                const teamPct = allCharDamage > 0 ? (entry.damage / allCharDamage) * 100 : 0
                return (
                  <div key={entry.actionName} className="summaryActionRow">
                    <span className="summaryActionCount">×{entry.count}</span>
                    <span className="summaryActionName">{entry.actionName}</span>
                    <div className="summaryActionBar">
                      <div
                        className="summaryActionBarFill"
                        style={{ width: `${barPct}%`, background: theme.primary, boxShadow: `0 0 4px ${theme.glow}` }}
                      />
                    </div>
                    <span className="summaryActionValue">{formatDamage(entry.damage)}</span>
                    <span className="summaryActionPct">{teamPct.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
