import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode, ReactElement } from 'react'
import '../../styles/rotation-editor/StatusDetailPanel.css'
import type { CharacterStats, EnemyStats } from '../../types/stats'

// ========== Types ============================================================================================================

export type StatusDetailInfo = {
  key: string
  label: string
  icon: string
  value?: number
  maxStacks?: number
  type?: 'buff' | 'debuff' | 'negativeStatus'
  color?: string
  timeLeft?: number
  description?: string
  showStatus?: boolean
  showStats?: boolean
  stats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
}

type StatusDetailPanelProps = {
  status: StatusDetailInfo | null
  onClose?: () => void
  variant?: 'modal' | 'tooltip'
  style?: CSSProperties
}

// ========== Constants ========================================================================================================

const TYPE_LABELS: Record<string, string> = {
  buff: 'Buff',
  debuff: 'Debuff',
  negativeStatus: 'Negative Status',
}

const TYPE_ACCENT_DEFAULTS: Record<string, string> = {
  buff: '#4CAF50',
  debuff: '#F44336',
  negativeStatus: '#9C27B0',
}

const FLAT_STAT_KEYS = new Set(['level', 'flatATK', 'flatHP', 'flatDEF'])

// ========== Helpers ==========================================================================================================

/**
 * Splits camelCase keys into readable label text, preserving acronyms (ATK, DEF, DMG, HP).
 */
function formatStatKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

function formatStatValue(key: string, value: number): string {
  if (FLAT_STAT_KEYS.has(key)) return value < 0 ? `${value.toFixed(0)}` : `+${value.toFixed(0)}`
  const pct = (value * 100).toFixed(1)
  return value < 0 ? `${pct}%` : `+${pct}%`
}

/**
 * Wraps numbers, %, and / in colored spans — mirrors the character profile overlay behaviour.
 */
function colorizeText(text: string, accentColor: string): ReactNode {
  const pattern = /(\d+(?:[.,]\d+)*|[%/])/g
  const parts: (string | ReactElement)[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(
      <span key={match.index} style={{ color: accentColor, fontWeight: 600 }}>
        {match[0]}
      </span>,
    )
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <>{parts}</>
}

// ========== Component: Status Detail Panel ===================================================================================

export function StatusDetailPanel({ status, onClose, variant = 'modal', style }: StatusDetailPanelProps) {
  if (!status) return null

  const typeLabel = TYPE_LABELS[status.type ?? ''] ?? 'Effect'
  const accent = status.color ?? TYPE_ACCENT_DEFAULTS[status.type ?? ''] ?? '#88AACC'
  const value = status.value ?? 0
  const isActive = value === 1 && (!status.maxStacks || status.maxStacks === 1)
  const stacksDisplay = isActive ? 'Active' : `${value} / ${status.maxStacks}`
  const showStatusSection = status.showStatus !== false

  const charStatsEntries = status.showStats && status.stats
    ? (Object.entries(status.stats) as [string, number][]).filter(([, v]) => v !== 0)
    : []
  const enemyStatsEntries = status.showStats && status.enemyStats
    ? (Object.entries(status.enemyStats) as [string, number][]).filter(([, v]) => v !== 0)
    : []
  const statsEntries = [...charStatsEntries, ...enemyStatsEntries]

  const panelContent = (
    <div
      className="statusDetailPanel"
      style={{ '--sdp-accent': accent, ...(variant === 'tooltip' ? style : {}) } as CSSProperties}
      onClick={variant === 'modal' ? (e => e.stopPropagation()) : undefined}
    >
      {/* ── Header ── */}
      <div className="statusDetailHeader">
        <img
          src={status.icon}
          alt={status.label}
          className="statusDetailIcon"
          onError={e => { ;(e.target as HTMLImageElement).style.opacity = '0.25' }}
        />
        <div className="statusDetailTitleGroup">
          <span className="statusDetailName">{status.label}</span>
          <span className="statusDetailType">{typeLabel}</span>
        </div>
        {variant === 'modal' && onClose && (
          <button className="statusDetailClose" onClick={onClose} aria-label="Close">✕</button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="statusDetailBody">

        {/* Status */}
        {showStatusSection && (
          <div className="statusDetailSection">
            <span className="statusDetailSectionLabel">Status</span>
            <div className="statusDetailRow">
              <span className="statusDetailRowLabel">Stacks</span>
              <span className={`statusDetailRowValue${isActive ? ' statusDetailRowValue--active' : ''}`}>
                {stacksDisplay}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        {status.description && (
          <div className="statusDetailSection">
            <span className="statusDetailSectionLabel">Description</span>
            <p className="statusDetailDescription">
              {colorizeText(status.description, accent)}
            </p>
          </div>
        )}

        {/* Active Stats */}
        {statsEntries.length > 0 && (
          <div className="statusDetailSection">
            <span className="statusDetailSectionLabel">Active Stats</span>
            {statsEntries.map(([key, val]) => (
              <div key={key} className="statusDetailRow">
                <span className="statusDetailRowLabel">{formatStatKey(key)}</span>
                <span className="statusDetailRowValue statusDetailRowValue--stat">{formatStatValue(key, val)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )

  if (variant === 'tooltip') {
    return createPortal(panelContent, document.body)
  }

  return createPortal(
    <div className="statusDetailOverlay" onClick={onClose}>
      {panelContent}
    </div>,
    document.body,
  )
}
