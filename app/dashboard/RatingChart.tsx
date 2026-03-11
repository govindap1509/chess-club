'use client';

interface Point {
  rating: number;
  created_at: string;
  note?: string | null;
}

export default function RatingChart({ data }: { data: Point[] }) {
  if (!data || data.length < 2) {
    return (
      <p style={{ fontSize: 13, color: '#80868B', padding: '12px 0' }}>
        Play matches to see your rating history chart here.
      </p>
    );
  }

  const W = 600;
  const H = 130;
  const PAD_X = 16;
  const PAD_Y = 16;

  const ratings = data.map((d) => d.rating);
  const rawMin = Math.min(...ratings);
  const rawMax = Math.max(...ratings);
  // Give a bit of breathing room; if flat, add ±10
  const yMin = rawMin === rawMax ? rawMin - 10 : rawMin - Math.max(5, (rawMax - rawMin) * 0.12);
  const yMax = rawMin === rawMax ? rawMax + 10 : rawMax + Math.max(5, (rawMax - rawMin) * 0.12);

  const toX = (i: number) => PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2);
  const toY = (r: number) => H - PAD_Y - ((r - yMin) / (yMax - yMin)) * (H - PAD_Y * 2);

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.rating), ...d }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;

  const first = data[0].rating;
  const last = data[data.length - 1].rating;
  const diff = last - first;
  const diffColor = diff >= 0 ? '#137333' : '#C5221F';
  const diffLabel = diff >= 0 ? `+${diff}` : `${diff}`;

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#5F6368' }}>
          {data.length} data points
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: diffColor }}>
          {diffLabel} pts overall
        </span>
      </div>

      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        aria-label="Rating history chart"
      >
        <defs>
          <linearGradient id="ratingArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1A73E8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((f) => {
          const y = PAD_Y + f * (H - PAD_Y * 2);
          const rating = Math.round(yMax - f * (yMax - yMin));
          return (
            <g key={f}>
              <line x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} stroke="#E8EAED" strokeWidth="1" />
              <text x={0} y={y + 4} fontSize="9" fill="#BDC1C6">{rating}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#ratingArea)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#1A73E8"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="#FFFFFF" stroke="#1A73E8" strokeWidth="2" />
            {/* Tooltip on hover via title */}
            <title>{`${p.rating} pts${p.note ? ` · ${p.note}` : ''}`}</title>
          </g>
        ))}

        {/* First & last labels */}
        <text x={pts[0].x} y={pts[0].y - 8} fontSize="10" fill="#5F6368" textAnchor="middle">{first}</text>
        <text x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 8} fontSize="10" fill="#1A73E8" fontWeight="600" textAnchor="middle">{last}</text>
      </svg>
    </div>
  );
}
