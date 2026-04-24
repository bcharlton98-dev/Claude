import type { AppState } from '../types';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportExcerptsAsCsv(state: AppState): string {
  const descriptorKeys = state.descriptorSchema ?? [];

  const headers = [
    'Transcript',
    'Cohort',
    'Transcript Tags',
    ...descriptorKeys,
    'Excerpt Text',
    'Codes',
    'Code Path',
    'Excerpt Memo',
    'Transcript Memo',
    'Char Start',
    'Char End',
  ];

  const rows = [headers.map(escapeCsv).join(',')];

  for (const excerpt of Object.values(state.excerpts)) {
    const transcript = state.transcripts[excerpt.transcriptId];
    if (!transcript) continue;

    const excerptText = transcript.text.slice(excerpt.start, excerpt.end);
    const tags = (transcript.tags ?? []).join('; ');
    const descriptors = transcript.descriptors ?? [];

    const descriptorValues = descriptorKeys.map(key => {
      const d = descriptors.find(dd => dd.key === key);
      return d?.value ?? '';
    });

    const codeNames = excerpt.codeIds
      .map(cid => state.codes[cid]?.name ?? '')
      .filter(Boolean)
      .join('; ');

    const codePaths = excerpt.codeIds
      .map(cid => buildCodePath(state, cid))
      .filter(Boolean)
      .join('; ');

    const row = [
      escapeCsv(transcript.title),
      escapeCsv(transcript.cohort ?? ''),
      escapeCsv(tags),
      ...descriptorValues.map(escapeCsv),
      escapeCsv(excerptText),
      escapeCsv(codeNames),
      escapeCsv(codePaths),
      escapeCsv(excerpt.memo),
      escapeCsv(transcript.memo),
      String(excerpt.start),
      String(excerpt.end),
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

function buildCodePath(state: AppState, codeId: string): string {
  const parts: string[] = [];
  let current = codeId;
  const visited = new Set<string>();

  while (current && !visited.has(current)) {
    visited.add(current);
    const code = state.codes[current];
    if (!code) break;
    parts.unshift(code.name);
    current = code.parentId ?? '';
  }

  return parts.join(' > ');
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
