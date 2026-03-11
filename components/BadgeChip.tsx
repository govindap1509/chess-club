import { getBadge } from '@/lib/badges';

export default function BadgeChip({ rating }: { rating: number | null | undefined }) {
  const badge = getBadge(rating);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '100px',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1,
        backgroundColor: badge.bgHex,
        color: badge.colorHex,
        whiteSpace: 'nowrap',
      }}
    >
      {badge.label}
    </span>
  );
}
