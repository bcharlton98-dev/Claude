import type { Excerpt } from '../types';

export interface Segment {
  start: number;
  end: number;
  excerptIds: string[];
}

export function buildSegments(textLength: number, excerpts: Excerpt[]): Segment[] {
  if (excerpts.length === 0) {
    return [{ start: 0, end: textLength, excerptIds: [] }];
  }

  const pointSet = new Set<number>();
  pointSet.add(0);
  pointSet.add(textLength);

  for (const ex of excerpts) {
    if (ex.start >= 0 && ex.start <= textLength) pointSet.add(ex.start);
    if (ex.end >= 0 && ex.end <= textLength) pointSet.add(ex.end);
  }

  const points = Array.from(pointSet).sort((a, b) => a - b);
  const segments: Segment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    if (segStart === segEnd) continue;

    const active: string[] = [];
    for (const ex of excerpts) {
      if (ex.start <= segStart && ex.end >= segEnd) {
        active.push(ex.id);
      }
    }

    segments.push({ start: segStart, end: segEnd, excerptIds: active });
  }

  return segments;
}
