// Summary resonator plate: identity + share of team damage, damage-origin split, damage-type bars and an expandable action table
import { useState } from 'react'
import type { ActionBreakdownEntry, CharacterSummary, ContributionOriginEntry } from './summaryTypes'
import { DMG_TYPE_LABELS, ELEMENT_TO_NEGATIVE_STATUS_LABEL, getDmgTypeTheme, getElementColor } from './theme'
import type { CharColor } from './theme'
import type { CharacterRole } from './characterRoles'
import { formatDamage } from './format'
import { PortraitRing, TacetMark, accentVar } from '../../shared/ui'

type CharTypeCardProps = {
  summary: CharacterSummary
  grandTotal: number
  originEntry?: ContributionOriginEntry
  actionBreakdown?: ActionBreakdownEntry[]
  role?: CharacterRole
  charColorMap: Map<string, CharColor>
}

export function CharTypeCard({ summary, grandTotal, originEntry, actionBreakdown, role, charColorMap }: CharTypeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const theme = charColorMap.get(summary.name) ?? getElementColor(summary.element)
  const allCharDamage = summary.directDamage + summary.caDamage + summary.passiveDamage
  const teamShare = grandTotal > 0 ? (summary.totalCharacterDamage / grandTotal) * 100 : 0
  const maxActionDmg = actionBreakdown && actionBreakdown.length > 0 ? actionBreakdown[0].damage : 1
  const damageTypes = summary.damageByType.filter(({ damage }) => damage > 0)

  // Damage origin: this character's own share, then the share enabled by each buffer
  const originParts = originEntry
    ? [
        { key: summary.name, label: 'Self', pct: originEntry.selfPct, raw: theme.raw },
        ...originEntry.buffedBy.map(b => ({ key: b.charName, label: b.charName, pct: b.pct, raw: (charColorMap.get(b.charName) ?? getElementColor(b.element)).raw })),
      ]
    : []

  return (
    <div className="ui-plate summaryPlate" style={accentVar(theme.raw)}>
      <TacetMark seed={summary.name} size={230} className="ui-plate-watermark" />

      <div className="summaryPlateGrid">
        {/* Identity + headline share */}
        <div className="summaryPlateId">
          <div className="summaryPlateWho">
            <PortraitRing name={summary.name} src={summary.image} size={58} />
            <div className="summaryPlateNameBlock">
              <span className="summaryPlateName">{summary.name}</span>
              <span className="summaryPlateTags">
                <span className="ui-chip ui-chip--muted">S{summary.sequence}</span>
                {summary.weaponName != null && <span className="ui-chip ui-chip--muted">R{summary.weaponRank} {summary.weaponName}</span>}
              </span>
            </div>
          </div>
          <div className="summaryPlateShare">
            <span className="summaryPlateShareValue">{teamShare.toFixed(1)}<small>%</small></span>
            <span className="summaryPlateShareMeta">
              <span className="ui-readout-label">of team damage</span>
              <span className="summaryPlateShareAbs">{formatDamage(summary.totalCharacterDamage)}</span>
            </span>
          </div>
          <div className="summaryPlateChips">
            {role && <span className="ui-chip">{role}</span>}
            {summary.libCount > 0 && <span className="ui-chip">×{summary.libCount} Liberation{summary.libCount > 1 ? 's' : ''}</span>}
          </div>
        </div>

        {/* Origin split + damage types */}
        <div className="summaryPlateData">
          {originParts.length > 0 && (
            <div className="summaryCharOrigin">
              <div className="ui-group-label">Damage Origin</div>
              <div className="summaryCharOriginBar">
                {originParts.map(p => (
                  <div key={p.key} className="summaryCharOriginSeg" style={{ ...accentVar(p.raw), flexGrow: Math.max(p.pct, 0.5) }} />
                ))}
              </div>
              <div className="summaryCharOriginLegend">
                {originParts.map(p => (
                  <span key={p.key} style={accentVar(p.raw)}>
                    <i className="ui-diamond" />
                    {p.label} <b>{p.pct.toFixed(0)}%</b>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Each type receives the full damage of any action that carries it, so bars may sum beyond 100% */}
          <div>
            <div className="ui-group-label">Damage Types</div>
            {damageTypes.length === 0 ? (
              <div className="ui-empty">No direct damage recorded</div>
            ) : (
              <div className="summaryTypeRows">
                {damageTypes.map(({ type, damage }) => {
                  const typePct = allCharDamage > 0 ? (damage / allCharDamage) * 100 : 0
                  const typeLabel = type === 'NEGATIVE_STATUS' ? (ELEMENT_TO_NEGATIVE_STATUS_LABEL[summary.element] ?? DMG_TYPE_LABELS[type]) : (DMG_TYPE_LABELS[type] ?? type)
                  const typeTheme = getDmgTypeTheme(type)
                  return (
                    <div key={type} className="summaryTypeRow">
                      <span className="summaryTypeLabel">{typeLabel}</span>
                      <div className="ui-bar">
                        <div className="ui-bar-fill" style={{ width: `${Math.min(typePct, 100)}%`, background: typeTheme.color, boxShadow: `0 0 6px ${typeTheme.glow}` }} />
                      </div>
                      <span className="summaryTypePct">{typePct.toFixed(1)}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action breakdown — collapsed by default */}
      {actionBreakdown && actionBreakdown.length > 0 && (
        <>
          <button type="button" className={`summaryPlateExpand${expanded ? ' is-open' : ''}`} onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Hide actions' : `Actions · ${actionBreakdown.length}`}
          </button>
          {expanded && (
            <div className="summaryActionTable">
              <div className="summaryActionRow summaryActionRow--head">
                <span>Casts</span>
                <span>Action</span>
                <span />
                <span>Total</span>
                <span>Share</span>
              </div>
              {actionBreakdown.map(entry => {
                const barPct = maxActionDmg > 0 ? (entry.damage / maxActionDmg) * 100 : 0
                const charPct = allCharDamage > 0 ? (entry.damage / allCharDamage) * 100 : 0
                return (
                  <div key={entry.actionName} className="summaryActionRow">
                    <span className="summaryActionCount">×{entry.count}</span>
                    <span className="summaryActionName">{entry.actionName}</span>
                    <div className="ui-bar">
                      <div className="ui-bar-fill" style={{ width: `${barPct}%` }} />
                    </div>
                    <span className="summaryActionValue">{formatDamage(entry.damage)}</span>
                    <span className="summaryActionPct">{charPct.toFixed(1)}%</span>
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
