// Summary centrepiece: one dial with two rings (outer = damage dealt, inner = damage enabled) and a hover-linked ledger
import { useState } from 'react'
import type { CharacterRole } from './characterRoles'
import type { DialRow } from './dialRows'
import { formatDamage } from './format'
import { PortraitRing, RingChart, TacetMark, accentVar } from '../../shared/ui'

// Ring radii in px (dial is SIZE × SIZE); the bezel sits just outside the outer ring
const SIZE = 460
const OUTER = { inner: 156, outer: 194 }
const INNER = { inner: 118, outer: 146 }
const BEZEL = 204

type ResonanceDialProps = {
  rows: DialRow[]
  roles: Map<string, CharacterRole>
  centerLabel: string
  unit?: string
}

export function ResonanceDial({ rows, roles, centerLabel, unit }: ResonanceDialProps) {
  const [active, setActive] = useState<string | null>(null)
  const dealtTotal = rows.reduce((s, r) => s + r.dealt, 0)
  const enabledTotal = rows.reduce((s, r) => s + r.enabled, 0)
  const pct = (v: number, total: number) => (total > 0 ? (v / total) * 100 : 0)
  const hovered = rows.find(r => r.key === active) ?? null

  const ring = (pick: (r: DialRow) => number, radii: { inner: number; outer: number }) => ({
    ...radii,
    segments: rows.map(r => ({ key: r.key, value: pick(r), color: `hsl(${r.raw})` })),
  })

  return (
    <div className="summaryDial">
      <div className="summaryDialStage">
        <RingChart size={SIZE} rings={[ring(r => r.dealt, OUTER), ring(r => r.enabled, INNER)]} bezel={BEZEL} activeKey={active} onHover={setActive}>
          <div className="summaryDialCore" style={hovered ? accentVar(hovered.raw) : undefined}>
            <TacetMark seed={hovered?.name ?? 'Resonance'} size={196} opacity={hovered ? 0.5 : 0.32} spin className="summaryDialCrest" />
            {hovered ? (
              <div className="summaryDialReadout">
                <span className="summaryDialName">{hovered.name}</span>
                <span className="summaryDialBig">{pct(hovered.dealt, dealtTotal).toFixed(1)}<small>%</small></span>
                <span className="summaryDialSub">dealt · <b>{pct(hovered.enabled, enabledTotal).toFixed(1)}%</b> enabled</span>
              </div>
            ) : (
              <div className="summaryDialReadout">
                <span className="ui-readout-label">{centerLabel}</span>
                <span className="summaryDialBig">{formatDamage(dealtTotal)}{unit && <small>{unit}</small>}</span>
                <span className="summaryDialSub">{rows.length} sources</span>
              </div>
            )}
          </div>
        </RingChart>
      </div>

      {/* Ledger: one row per source, both rings side by side */}
      <div className="summaryLedger" onMouseLeave={() => setActive(null)}>
        <div className="summaryLedgerRow summaryLedgerRow--head">
          <span>Resonator</span>
          <span><i className="summaryRingKey summaryRingKey--outer" />Dealt</span>
          <span><i className="summaryRingKey summaryRingKey--inner" />Enabled</span>
        </div>
        {rows.map(r => {
          const role = roles.get(r.key)
          return (
            <div key={r.key} className={`summaryLedgerRow${active === r.key ? ' is-active' : ''}`} style={accentVar(r.raw)} onMouseEnter={() => setActive(r.key)}>
              <span className="summaryLedgerId">
                {r.image ? <PortraitRing name={r.name} src={r.image} size={34} /> : <i className="ui-diamond summaryLedgerDiamond" />}
                <span className="summaryLedgerName">{r.name}</span>
                {role && <span className="summaryLedgerRole">{role}</span>}
              </span>
              <LedgerCell value={r.dealt} pct={pct(r.dealt, dealtTotal)} />
              <LedgerCell value={r.enabled} pct={pct(r.enabled, enabledTotal)} />
            </div>
          )
        })}
      </div>
      <p className="ui-section-hint summaryDialHint">Enabled = Shapley attribution: damage a buff unlocks is credited to the buffer</p>
    </div>
  )
}

function LedgerCell({ value, pct }: { value: number; pct: number }) {
  return (
    <span className="summaryLedgerCell">
      <span className="summaryLedgerPct">{pct.toFixed(1)}%</span>
      <span className="summaryLedgerValue">{formatDamage(value)}</span>
      <span className="ui-bar summaryLedgerBar"><span className="ui-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} /></span>
    </span>
  )
}
