export type Badge = {
  label: string;
  /** CSS hex color for text */
  colorHex: string;
  /** CSS hex color for background */
  bgHex: string;
  /** Legacy Tailwind text class (kept for backward compat) */
  color: string;
  /** Legacy Tailwind bg class */
  bg: string;
};

export function getBadge(rating: number | null | undefined): Badge {
  if (!rating || rating < 900)
    return { label: 'Beginner',     colorHex: '#5F6368', bgHex: '#F1F3F4', color: 'text-ds-muted',  bg: 'bg-ds-bg-card' };
  if (rating < 1000)
    return { label: 'Rising Player',colorHex: '#137333', bgHex: '#E6F4EA', color: 'text-ds-green',  bg: 'bg-ds-green-bg' };
  if (rating < 1100)
    return { label: 'Club Player',  colorHex: '#1A73E8', bgHex: '#E8F0FE', color: 'text-ds-blue',   bg: 'bg-ds-blue-tint' };
  if (rating < 1200)
    return { label: 'Advanced',     colorHex: '#6200EA', bgHex: '#EDE7F6', color: 'text-purple-700',bg: 'bg-purple-50' };
  return   { label: 'Master',       colorHex: '#B45309', bgHex: '#FEF3C7', color: 'text-amber-700', bg: 'bg-amber-50' };
}
