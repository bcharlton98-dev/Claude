import type { CodeColorKey } from '../types';

interface ColorClasses {
  bg: string;
  bgLight: string;
  border: string;
  text: string;
  dot: string;
}

const COLOR_MAP: Record<CodeColorKey, ColorClasses> = {
  forest:   { bg: 'bg-forest-200',    bgLight: 'bg-forest-100',    border: 'border-forest-500',   text: 'text-forest-700',   dot: 'bg-forest-500' },
  olive:    { bg: 'bg-olive-200',      bgLight: 'bg-olive-100',     border: 'border-olive-500',    text: 'text-olive-600',    dot: 'bg-olive-500' },
  ember:    { bg: 'bg-ember-200',      bgLight: 'bg-ember-100',     border: 'border-ember-500',    text: 'text-ember-600',    dot: 'bg-ember-500' },
  gold:     { bg: 'bg-gold-200',       bgLight: 'bg-gold-100',      border: 'border-gold-400',     text: 'text-gold-500',     dot: 'bg-amber-500' },
  sky:      { bg: 'bg-sky-200',        bgLight: 'bg-sky-100',       border: 'border-sky-500',      text: 'text-sky-500',      dot: 'bg-sky-500' },
  rose:     { bg: 'bg-rose-200',       bgLight: 'bg-rose-100',      border: 'border-rose-400',     text: 'text-rose-500',     dot: 'bg-rose-500' },
  lavender: { bg: 'bg-lavender-200',   bgLight: 'bg-lavender-100',  border: 'border-lavender-400', text: 'text-lavender-600', dot: 'bg-lavender-400' },
  peach:    { bg: 'bg-peach-100',      bgLight: 'bg-peach-50',      border: 'border-peach-400',    text: 'text-peach-600',    dot: 'bg-peach-500' },
};

export function colorClasses(key: CodeColorKey): ColorClasses {
  return COLOR_MAP[key];
}

const RAW_COLORS: Record<CodeColorKey, string> = {
  forest:   '#22c55e',
  olive:    '#84cc16',
  ember:    '#f97316',
  gold:     '#f59e0b',
  sky:      '#0ea5e9',
  rose:     '#f43f5e',
  lavender: '#c084fc',
  peach:    '#fb923c',
};

export function rawColor(key: CodeColorKey): string {
  return RAW_COLORS[key];
}
