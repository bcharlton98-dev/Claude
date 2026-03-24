/** Brand SVG icons — zero emoji, consistent flat style */

export function FlameIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2C12 2 6 8.5 6 14a6 6 0 0 0 12 0c0-5.5-6-12-6-12Z" fill="#D4884D" />
      <path d="M12 22a4 4 0 0 1-4-4c0-3 4-7 4-7s4 4 4 7a4 4 0 0 1-4 4Z" fill="#9C5A2B" />
    </svg>
  )
}

export function FlameIconWhite({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2C12 2 6 8.5 6 14a6 6 0 0 0 12 0c0-5.5-6-12-6-12Z" fill="white" />
      <path d="M12 22a4 4 0 0 1-4-4c0-3 4-7 4-7s4 4 4 7a4 4 0 0 1-4 4Z" fill="white" opacity={0.6} />
    </svg>
  )
}

export function StarIcon({ size = 16, color = '#D4A050', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 2l2.35 4.76 5.25.77-3.8 3.7.9 5.24L10 13.87l-4.7 2.6.9-5.24-3.8-3.7 5.25-.77L10 2Z" fill={color} />
    </svg>
  )
}

export function ChallengeIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="white" strokeWidth={2.2} strokeLinecap="round">
      <path d="M7 17L17 7" />
      <path d="M17 17L7 7" />
      <path d="M17 7l-3 0M17 7l0 3" />
      <path d="M7 17l3 0M7 17l0-3" />
    </svg>
  )
}

export function RouteIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" fill="white" stroke="none" />
      <circle cx="18" cy="5" r="3" fill="white" stroke="none" />
      <path d="M6 16V8a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v8a4 4 0 0 0 4 4" stroke="white" />
    </svg>
  )
}

export function TargetIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="8" stroke="#2D5E3B" strokeWidth="2" fill="none" />
      <circle cx="10" cy="10" r="4" stroke="#2D5E3B" strokeWidth="2" fill="none" />
      <circle cx="10" cy="10" r="1.5" fill="#2D5E3B" />
    </svg>
  )
}

export function TrendUpIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="#2D5E3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14l4-4 3 3 7-7" />
      <path d="M14 6h3v3" />
    </svg>
  )
}

export function WalkerIcon({ size = 14, color = '#2D5E3B' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="3.5" r="2.5" fill={color} />
      <path d="M8 8h4l2 5h-2l-1 4h-2l-1-4H6l2-5Z" fill={color} />
    </svg>
  )
}

export function GemIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 7l6 10 6-10" fill="#60A5FA" />
      <path d="M4 7l2-4h8l2 4H4Z" fill="#93C5FD" />
      <path d="M10 3l-2 4h4l-2-4Z" fill="#BFDBFE" />
    </svg>
  )
}

export function TrophyIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M6 3h8v6a4 4 0 0 1-8 0V3Z" fill="#D4A050" />
      <path d="M6 5H3c0 2.5 1.5 4 3 4" stroke="#D4A050" strokeWidth="1.5" fill="none" />
      <path d="M14 5h3c0 2.5-1.5 4-3 4" stroke="#D4A050" strokeWidth="1.5" fill="none" />
      <rect x="8" y="13" width="4" height="2" rx="0.5" fill="#D4A050" />
      <rect x="6" y="15" width="8" height="2" rx="1" fill="#D4A050" />
    </svg>
  )
}

export function LeafIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 16C4 16 4 4 16 4c0 12-12 12-12 12Z" fill="#7E8E4E" />
      <path d="M4 16C8 12 12 8 16 4" stroke="#2D5E3B" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function SunriseIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 14h12" stroke="#D4A050" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 4v2M4.5 8.5l1.4 1.4M15.5 8.5l-1.4 1.4" stroke="#D4884D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 14a4 4 0 0 1 8 0" fill="#D4884D" />
    </svg>
  )
}

export function MountainIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M2 16l6-12 3 4 3-4 4 12H2Z" fill="#7E8E4E" />
      <path d="M8 4l1.5 3L8 6 6.5 8" fill="white" opacity={0.5} />
    </svg>
  )
}

/** Colored initial avatar circle */
const AVATAR_PALETTE = [
  '#7E8E4E', // sage
  '#D4A050', // amber
  '#BE7339', // terracotta
  '#5B9A8B', // teal
  '#9A8C7C', // warm grey
  '#A47CB5', // lavender
]

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

export function getInitials(name: string): string {
  if (name === 'You') return 'YO'
  const parts = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function AvatarCircle({ name, size = 32, className = '' }: { name: string; size?: number; className?: string }) {
  const bg = getAvatarColor(name)
  const initials = getInitials(name)
  const fontSize = size * 0.38
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, fontSize }}
    >
      {initials}
    </div>
  )
}

/** Rank circle for leaderboard positions */
export function RankCircle({ rank, size = 28 }: { rank: number; size?: number }) {
  const colors: Record<number, { bg: string; text: string }> = {
    1: { bg: '#D4A050', text: 'white' },
    2: { bg: '#A8A8A8', text: 'white' },
    3: { bg: '#CD7F32', text: 'white' },
  }
  const c = colors[rank] || { bg: '#E5E0D8', text: '#6e655e' }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: c.bg, color: c.text, fontSize: size * 0.4 }}
    >
      {rank}
    </div>
  )
}

/** Checkmark icon for completed items */
export function CheckIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="9" fill="#2D5E3B" />
      <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Step shoe icon */
export function ShoeIcon({ size = 20, color = '#2D5E3B', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 14c0-1 1-2 2-3l2-6h4l1 3c2 1 5 1 5 3v1c0 1-1 2-2 2H5c-1 0-2-1-2-2Z" fill={color} />
    </svg>
  )
}

/** Clock/timer icon */
export function ClockIcon({ size = 20, color = '#2D5E3B', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="2" />
      <path d="M10 5v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Wave/social icon */
export function WaveIcon({ size = 20, color = '#2D5E3B', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M2 10c2-4 4-4 6 0s4 4 6 0 4-4 4 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Pin marker icon for map start */
export function PinIcon({ size = 14, color = '#2D5E3B' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <path d="M10 1a6 6 0 0 0-6 6c0 4 6 11 6 11s6-7 6-11a6 6 0 0 0-6-6Zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  )
}

/** Flag icon for finish */
export function FlagIcon({ size = 14, color = '#2D5E3B' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 2v16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M4 3h10l-3 4 3 4H4" fill={color} />
    </svg>
  )
}

/** Link icon for habit stacks */
export function LinkIcon({ size = 16, color = '#2D5E3B', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M8 12l4-4" />
      <path d="M6 10l-1 1a3 3 0 0 0 4.24 4.24l1-1" />
      <path d="M14 10l1-1a3 3 0 0 0-4.24-4.24l-1 1" />
    </svg>
  )
}

/** Runner icon */
export function RunnerIcon({ size = 16, color = '#2D5E3B', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="12" cy="3" r="2.5" fill={color} />
      <path d="M7 9l3-3 2 1 3-2M9 11l-3 6M10 10l4 3 2 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Render a badge/milestone icon by key */
export function BadgeIcon({ icon, size = 20, color = '#2D5E3B', className = '' }: { icon: string; size?: number; color?: string; className?: string }) {
  const iconMap: Record<string, React.FC<{ size?: number; color?: string; className?: string }>> = {
    shoe: ShoeIcon,
    flame: ({ size: s, className: c }) => <FlameIcon size={s} className={c} />,
    runner: RunnerIcon,
    target: TargetIcon,
    wave: WaveIcon,
    link: LinkIcon,
    star: StarIcon,
    trophy: TrophyIcon,
    mountain: MountainIcon,
    leaf: LeafIcon,
    summit: MountainIcon,
    route: RouteIcon,
    clock: ClockIcon,
    gem: GemIcon,
    check: CheckIcon,
  }
  const IconComponent = iconMap[icon]
  if (IconComponent) return <IconComponent size={size} color={color} className={className} />
  return <div className={`rounded-full bg-warm-200 ${className}`} style={{ width: size, height: size }} />
}

/** Habit icon by key */
export function HabitIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const color = '#6e655e'
  switch (icon) {
    case 'coffee':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="7" width="10" height="10" rx="2" fill={color} />
          <path d="M13 9h2a2 2 0 0 1 0 4h-2" stroke={color} strokeWidth="1.5" />
          <path d="M6 5c0-1 1-2 1-2M9 5c0-1 1-2 1-2" stroke={color} strokeWidth="1" strokeLinecap="round" opacity={0.5} />
        </svg>
      )
    case 'car':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <path d="M3 12h14v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Z" fill={color} />
          <path d="M5 12l2-5h6l2 5" stroke={color} strokeWidth="1.5" />
          <circle cx="6" cy="15" r="1.5" fill="white" />
          <circle cx="14" cy="15" r="1.5" fill="white" />
        </svg>
      )
    case 'lunch':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <ellipse cx="10" cy="12" rx="7" ry="4" fill={color} />
          <path d="M3 12c0-4 3-8 7-8s7 4 7 8" stroke={color} strokeWidth="1.5" fill="none" />
        </svg>
      )
    case 'tv':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4" width="16" height="10" rx="2" fill={color} />
          <path d="M7 17h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    default:
      return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />
  }
}
