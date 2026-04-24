import { useMemo, useState } from 'react';
import { useAppState } from '../store/AppStore';
import { useAllCodesList } from '../store/selectors';

export default function Matrix() {
  const state = useAppState();
  const allCodes = useAllCodesList();
  const transcripts = useMemo(
    () => Object.values(state.transcripts).sort((a, b) => a.title.localeCompare(b.title)),
    [state.transcripts],
  );

  const [filterKey, setFilterKey] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [filterCohort, setFilterCohort] = useState('');

  const descriptorKeys = state.descriptorSchema ?? [];
  const cohorts = useMemo(() => {
    const set = new Set<string>();
    for (const t of Object.values(state.transcripts)) {
      if (t.cohort) set.add(t.cohort);
    }
    return Array.from(set).sort();
  }, [state.transcripts]);

  const descriptorValues = useMemo(() => {
    if (!filterKey) return [];
    const set = new Set<string>();
    for (const t of Object.values(state.transcripts)) {
      const d = (t.descriptors ?? []).find(dd => dd.key === filterKey);
      if (d?.value) set.add(d.value);
    }
    return Array.from(set).sort();
  }, [state.transcripts, filterKey]);

  const filteredTranscripts = useMemo(() => {
    return transcripts.filter(t => {
      if (filterCohort && (t.cohort ?? '') !== filterCohort) return false;
      if (filterKey && filterValue) {
        const d = (t.descriptors ?? []).find(dd => dd.key === filterKey);
        if (!d || d.value !== filterValue) return false;
      }
      return true;
    });
  }, [transcripts, filterKey, filterValue, filterCohort]);

  const leafCodes = useMemo(() => {
    const parentIds = new Set(allCodes.map(c => c.parentId).filter(Boolean));
    return allCodes.filter(c => !parentIds.has(c.id));
  }, [allCodes]);

  const matrix = useMemo(() => {
    const grid: Record<string, Record<string, number>> = {};
    for (const t of filteredTranscripts) {
      grid[t.id] = {};
      for (const code of leafCodes) {
        grid[t.id][code.id] = 0;
      }
    }
    for (const ex of Object.values(state.excerpts)) {
      if (!grid[ex.transcriptId]) continue;
      for (const cid of ex.codeIds) {
        if (grid[ex.transcriptId][cid] !== undefined) {
          grid[ex.transcriptId][cid]++;
        }
      }
    }
    return grid;
  }, [filteredTranscripts, leafCodes, state.excerpts]);

  const codeTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const code of leafCodes) {
      totals[code.id] = 0;
      for (const t of filteredTranscripts) {
        totals[code.id] += matrix[t.id]?.[code.id] ?? 0;
      }
    }
    return totals;
  }, [leafCodes, filteredTranscripts, matrix]);

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">Code Frequency Matrix</h1>
          <p className="text-sm text-warm-500 mt-1">
            {filteredTranscripts.length} transcript{filteredTranscripts.length !== 1 ? 's' : ''} × {leafCodes.length} code{leafCodes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {cohorts.length > 0 && (
            <select
              value={filterCohort}
              onChange={e => setFilterCohort(e.target.value)}
              className="text-sm border border-warm-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="">All cohorts</option>
              {cohorts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {descriptorKeys.length > 0 && (
            <>
              <select
                value={filterKey}
                onChange={e => { setFilterKey(e.target.value); setFilterValue(''); }}
                className="text-sm border border-warm-200 rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="">Filter by...</option>
                {descriptorKeys.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              {filterKey && (
                <select
                  value={filterValue}
                  onChange={e => setFilterValue(e.target.value)}
                  className="text-sm border border-warm-200 rounded-lg px-3 py-1.5 bg-white"
                >
                  <option value="">All</option>
                  {descriptorValues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
            </>
          )}
        </div>
      </div>

      {leafCodes.length === 0 || filteredTranscripts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-warm-400">
          <p>{leafCodes.length === 0 ? 'Create codes in the Codebook first.' : 'No transcripts match your filters.'}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-warm-200 rounded-xl bg-white">
          <table className="text-sm border-collapse w-full">
            <thead className="sticky top-0 z-10 bg-warm-100">
              <tr>
                <th className="text-left px-3 py-2 border-b border-r border-warm-200 font-semibold text-warm-700 min-w-[200px] sticky left-0 bg-warm-100">
                  Transcript
                </th>
                {leafCodes.map(code => (
                  <th
                    key={code.id}
                    className="px-2 py-2 border-b border-r border-warm-200 font-medium text-warm-600 min-w-[80px] text-center"
                    title={code.name}
                  >
                    <span className="block truncate max-w-[100px]">{code.name}</span>
                  </th>
                ))}
                <th className="px-3 py-2 border-b border-warm-200 font-semibold text-warm-700 text-center min-w-[60px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTranscripts.map(t => {
                const rowTotal = leafCodes.reduce((sum, c) => sum + (matrix[t.id]?.[c.id] ?? 0), 0);
                return (
                  <tr key={t.id} className="hover:bg-cream-50">
                    <td className="px-3 py-2 border-b border-r border-warm-100 font-medium text-warm-700 truncate max-w-[250px] sticky left-0 bg-white">
                      {t.title}
                    </td>
                    {leafCodes.map(code => {
                      const count = matrix[t.id]?.[code.id] ?? 0;
                      return (
                        <td
                          key={code.id}
                          className={`px-2 py-2 border-b border-r border-warm-100 text-center tabular-nums ${
                            count > 0 ? 'text-warm-800 font-medium' : 'text-warm-300'
                          }`}
                          style={count > 0 ? { backgroundColor: `rgba(45, 94, 59, ${Math.min(count * 0.12, 0.5)})` } : undefined}
                        >
                          {count || '·'}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 border-b border-warm-100 text-center font-semibold text-warm-700 tabular-nums">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-warm-100 font-semibold">
                <td className="px-3 py-2 border-t border-r border-warm-200 text-warm-700 sticky left-0 bg-warm-100">
                  Totals
                </td>
                {leafCodes.map(code => (
                  <td key={code.id} className="px-2 py-2 border-t border-r border-warm-200 text-center tabular-nums text-warm-700">
                    {codeTotals[code.id]}
                  </td>
                ))}
                <td className="px-3 py-2 border-t border-warm-200 text-center tabular-nums text-warm-800">
                  {Object.values(codeTotals).reduce((a, b) => a + b, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
