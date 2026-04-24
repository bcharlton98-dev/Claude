import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../store/AppStore';
import { useAllCodesList } from '../store/selectors';
import CodeBadge from '../components/CodeBadge';

export default function Framework() {
  const state = useAppState();
  const allCodes = useAllCodesList();
  const [selectedCodeIds, setSelectedCodeIds] = useState<string[]>([]);
  const [filterCohort, setFilterCohort] = useState('');
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const transcripts = useMemo(
    () => Object.values(state.transcripts)
      .filter(t => !filterCohort || (t.cohort ?? '') === filterCohort)
      .sort((a, b) => a.title.localeCompare(b.title)),
    [state.transcripts, filterCohort],
  );

  const cohorts = useMemo(() => {
    const set = new Set<string>();
    for (const t of Object.values(state.transcripts)) {
      if (t.cohort) set.add(t.cohort);
    }
    return Array.from(set).sort();
  }, [state.transcripts]);

  const leafCodes = useMemo(() => {
    const parentIds = new Set(allCodes.map(c => c.parentId).filter(Boolean));
    return allCodes.filter(c => !parentIds.has(c.id));
  }, [allCodes]);

  const activeCodes = selectedCodeIds.length > 0
    ? leafCodes.filter(c => selectedCodeIds.includes(c.id))
    : leafCodes;

  const frameworkData = useMemo(() => {
    const data: Record<string, Record<string, { text: string; excerptId: string }[]>> = {};
    for (const t of transcripts) {
      data[t.id] = {};
      for (const code of activeCodes) {
        data[t.id][code.id] = [];
      }
    }

    for (const ex of Object.values(state.excerpts)) {
      if (!data[ex.transcriptId]) continue;
      const transcript = state.transcripts[ex.transcriptId];
      if (!transcript) continue;

      for (const cid of ex.codeIds) {
        if (data[ex.transcriptId][cid]) {
          const text = transcript.text.slice(ex.start, ex.end);
          data[ex.transcriptId][cid].push({
            text: text.length > 150 ? text.slice(0, 150) + '...' : text,
            excerptId: ex.id,
          });
        }
      }
    }
    return data;
  }, [transcripts, activeCodes, state.excerpts, state.transcripts]);

  function toggleCode(codeId: string) {
    setSelectedCodeIds(prev =>
      prev.includes(codeId) ? prev.filter(id => id !== codeId) : [...prev, codeId],
    );
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">Cross-Case Framework</h1>
          <p className="text-sm text-warm-500 mt-1">
            Case-by-theme matrix — click cells to expand excerpts
          </p>
        </div>
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
      </div>

      {leafCodes.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          {leafCodes.map(code => (
            <button
              key={code.id}
              onClick={() => toggleCode(code.id)}
              className={`transition-opacity ${
                selectedCodeIds.length > 0 && !selectedCodeIds.includes(code.id) ? 'opacity-40' : ''
              }`}
            >
              <CodeBadge code={code} size="sm" />
            </button>
          ))}
          {selectedCodeIds.length > 0 && (
            <button
              onClick={() => setSelectedCodeIds([])}
              className="text-xs text-warm-500 hover:text-warm-700 px-2 py-0.5"
            >
              Show all
            </button>
          )}
        </div>
      )}

      {activeCodes.length === 0 || transcripts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-warm-400">
          <p>{activeCodes.length === 0 ? 'Create codes in the Codebook first.' : 'No transcripts match your filters.'}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-warm-200 rounded-xl bg-white">
          <table className="text-sm border-collapse w-full">
            <thead className="sticky top-0 z-10 bg-warm-100">
              <tr>
                <th className="text-left px-3 py-2 border-b border-r border-warm-200 font-semibold text-warm-700 min-w-[180px] sticky left-0 bg-warm-100">
                  Case
                </th>
                {activeCodes.map(code => (
                  <th key={code.id} className="px-3 py-2 border-b border-r border-warm-200 font-medium text-warm-600 min-w-[200px] text-left">
                    {code.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transcripts.map(t => (
                <tr key={t.id} className="align-top">
                  <td className="px-3 py-2 border-b border-r border-warm-100 font-medium text-warm-700 sticky left-0 bg-white">
                    <Link to={`/transcripts/${t.id}`} className="hover:text-forest-600 transition-colors">
                      {t.title}
                    </Link>
                    {t.cohort && <span className="block text-xs text-warm-400 mt-0.5">{t.cohort}</span>}
                  </td>
                  {activeCodes.map(code => {
                    const excerpts = frameworkData[t.id]?.[code.id] ?? [];
                    const cellKey = `${t.id}-${code.id}`;
                    const isExpanded = expandedCell === cellKey;
                    return (
                      <td
                        key={code.id}
                        className="px-3 py-2 border-b border-r border-warm-100 text-warm-600 cursor-pointer hover:bg-cream-50 transition-colors"
                        onClick={() => setExpandedCell(isExpanded ? null : cellKey)}
                      >
                        {excerpts.length === 0 ? (
                          <span className="text-warm-300">—</span>
                        ) : isExpanded ? (
                          <div className="space-y-2">
                            {excerpts.map((ex, i) => (
                              <p key={i} className="text-xs leading-relaxed border-l-2 border-warm-200 pl-2 font-reading">
                                "{ex.text}"
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs">
                            {excerpts.length} excerpt{excerpts.length !== 1 ? 's' : ''}
                            {excerpts[0] && (
                              <span className="text-warm-400 block mt-0.5 truncate max-w-[180px]">
                                "{excerpts[0].text.slice(0, 60)}..."
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
