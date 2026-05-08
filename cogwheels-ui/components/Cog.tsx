type CogProps = {
  teeth?: number;
  size?: number;
  className?: string;
  color?: string;
  toothShape?: "trapezoid" | "pin" | "wedge" | "block";
  innerStyle?: "spokes" | "rings" | "web" | "solid";
  hubColor?: string;
  bgColor?: string;
};

/**
 * A configurable, thinner cogwheel. Teeth are slim and slightly tapered.
 */
export function Cog({
  teeth = 14,
  size = 120,
  className,
  color = "currentColor",
  toothShape = "trapezoid",
  innerStyle = "spokes",
  hubColor,
  bgColor = "oklch(0.13 0.012 80)",
}: CogProps) {
  const cx = 50;
  const cy = 50;
  const rOuter = 47;
  const rInner = 39;
  const hub = 11;
  const bore = 4.5;

  const tooth = (i: number) => {
    const angle = (360 / teeth) * i;
    const common = {
      key: i,
      transform: `rotate(${angle} ${cx} ${cy})`,
      fill: color,
    };
    if (toothShape === "pin") {
      return (
        <g {...common}>
          <rect x={cx - 0.9} y={cy - rOuter - 1} width={1.8} height={rOuter - rInner + 2} rx={0.9} fill={color} />
          <circle cx={cx} cy={cy - rOuter} r={1.6} fill={color} />
        </g>
      );
    }
    if (toothShape === "wedge") {
      const yTop = cy - rOuter - 1;
      const yBot = cy - rInner + 1;
      return (
        <polygon
          {...common}
          points={`${cx - 0.6},${yTop} ${cx + 0.6},${yTop} ${cx + 2.6},${yBot} ${cx - 2.6},${yBot}`}
        />
      );
    }
    if (toothShape === "block") {
      return <rect {...common} x={cx - 2.2} y={cy - rOuter} width={4.4} height={rOuter - rInner + 1} rx={0.6} />;
    }
    // trapezoid (default, thin)
    const yTop = cy - rOuter;
    const yBot = cy - rInner + 0.5;
    return (
      <polygon
        {...common}
        points={`${cx - 1.6},${yTop} ${cx + 1.6},${yTop} ${cx + 2.6},${yBot} ${cx - 2.6},${yBot}`}
      />
    );
  };

  const inner = () => {
    if (innerStyle === "solid") {
      return <circle cx={cx} cy={cy} r={rInner - 2} fill={color} opacity={0.08} />;
    }
    if (innerStyle === "rings") {
      return (
        <>
          <circle cx={cx} cy={cy} r={rInner - 4} fill="none" stroke={color} strokeWidth={0.5} opacity={0.55} />
          <circle cx={cx} cy={cy} r={rInner - 9} fill="none" stroke={color} strokeWidth={0.4} opacity={0.4} />
          <circle cx={cx} cy={cy} r={rInner - 14} fill="none" stroke={color} strokeWidth={0.3} opacity={0.3} />
        </>
      );
    }
    if (innerStyle === "web") {
      return (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <rect
              key={i}
              x={cx - 0.6}
              y={cy - rInner + 3}
              width={1.2}
              height={rInner - hub - 2}
              fill={color}
              opacity={0.45}
              transform={`rotate(${i * 60} ${cx} ${cy})`}
            />
          ))}
          <circle cx={cx} cy={cy} r={rInner - 6} fill="none" stroke={color} strokeWidth={0.4} opacity={0.4} />
        </>
      );
    }
    // spokes
    return Array.from({ length: 5 }).map((_, i) => (
      <rect
        key={i}
        x={cx - 0.6}
        y={cy - rInner + 3}
        width={1.2}
        height={rInner - hub - 2}
        fill={color}
        opacity={0.45}
        transform={`rotate(${(360 / 5) * i} ${cx} ${cy})`}
      />
    ));
  };

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      {Array.from({ length: teeth }, (_, i) => tooth(i))}
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={color} strokeWidth={1.1} />
      {inner()}
      <circle cx={cx} cy={cy} r={hub} fill={hubColor ?? color} opacity={0.9} />
      <circle cx={cx} cy={cy} r={bore} fill={bgColor} />
      <circle cx={cx} cy={cy} r={bore - 1} fill="none" stroke={color} strokeWidth={0.4} opacity={0.7} />
    </svg>
  );
}

/* ----------------------- Tacet mark variants ----------------------- */

export function TacetDiamond({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g transform="rotate(45 20 20)">
        <rect x="6" y="6" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="11" y="11" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
        <rect x="17.5" y="17.5" width="5" height="5" rx="0.8" fill="currentColor" />
      </g>
    </svg>
  );
}

export function TacetCross({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <path d="M20 4 L20 36 M4 20 L36 20" />
        <circle cx="20" cy="20" r="6" />
        <circle cx="20" cy="20" r="11" opacity="0.5" />
      </g>
      <circle cx="20" cy="20" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function TacetSpire({ size = 28, className }: { size?: number; className?: string }) {
  // Vertical spire / waveform
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1" strokeLinecap="round">
        <path d="M20 4 L20 36" />
        <path d="M14 12 L26 12" opacity="0.7" />
        <path d="M11 20 L29 20" />
        <path d="M14 28 L26 28" opacity="0.7" />
      </g>
      <polygon points="20,2 22,6 18,6" fill="currentColor" />
      <polygon points="20,38 22,34 18,34" fill="currentColor" />
    </svg>
  );
}

export function TacetTriquetra({ size = 32, className }: { size?: number; className?: string }) {
  // Three interlocking arcs forming a triangle motif
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <circle cx="20" cy="14" r="7" />
        <circle cx="13" cy="25" r="7" />
        <circle cx="27" cy="25" r="7" />
        <circle cx="20" cy="21" r="2" fill="currentColor" />
      </g>
    </svg>
  );
}

export function CornerBracket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={28} height={28} className={className} aria-hidden="true">
      <path d="M2 16 V4 H16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M6 8 H10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      <circle cx="4" cy="4" r="1" fill="currentColor" />
    </svg>
  );
}
