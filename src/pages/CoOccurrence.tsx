import { useMemo } from 'react';
import { useAppState } from '../store/AppStore';
import { useAllCodesList } from '../store/selectors';
import { colorClasses } from '../lib/codeColors';

export default function CoOccurrence() {
  const state = useAppState();
  const allCodes = useAllCodesList();

  const leafCodes = useMemo(() => {
    const parentIds = new Set(allCodes.map(c => c.parentId).filter(Boolean));
    return allCodes.filter(c => !parentIds.has(c.id));
  }, [allCodes]);

  const coMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    for (const c of leafCodes) {
      matrix[c.id] = {};
      for (const c2 of leafCodes) {
        matrix[c.id][c2.id] = 0;
      }
    }

    for (const ex of Object.values(state.excerpts)) {
      const codes = ex.codeIds.filter(cid => matrix[cid]);
      for (let i = 0; i < codes.length; i++) {
        matrix[codes[i]][codes[i]]++;
        for (let j = i + 1; j < codes.length; j++) {
          matrix[codes[i]][codes[j]]++;
          matrix[codes[j]][codes[i]]++;
        }
      }
    }
    return matrix;
  }, [leafCodes, state.excerpts]);

  const maxCoOccurrence = useMemo(() => {
    let max = 0;
    for (const c1 of leafCodes) {
      for (const c2 of leafCodes) {
        if (c1.id !== c2.id) {
          max = Math.max(max, coMatrix[c1.id]?.[c2.id] ?? 0);
        }
      }
    }
    return max || 1;
  }, [leafCodes, coMatrix]);

  const topPairs = useMemo(() => {
    const pairs: { code1: string; code2: string; count: number }[] = [];
    for (let i = 0; i < leafCodes.length; i++) {
      for (let j = i + 1; j < leafCodes.length; j++) {
        const count = coMatrix[leafCodes[i].id]?.[leafCodes[j].id] ?? 0;
        if (count > 0) {
          pairs.push({ code1: leafCodes[i].name, code2: leafCodes[j].name, count });
        }
      }
    }
    return pairs.sort((a, b) => b.count - a.count).slice(0, 20);
  }, [leafCodes, coMatrix]);

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-warm-800">Code Co-Occurrence</h1>
        <p className="text-sm text-warm-500 mt-1">
          How often codes appear together on the same excerpt
        </p>
      </div>

      {leafCodes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-warm-400">
          <p>Create codes and code some excerpts first.</p>
        </div>
      ) : (
        <div className="flex gap-6 flex-1 min-h-0">
          <div className="flex-1 overflow-auto border border-warm-200 rounded-xl bg-white">
            <table className="text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-warm-100">
                <tr>
                  <th className="px-2 py-2 border-b border-r border-warm-200 sticky left-0 bg-warm-100" />
                  {leafCodes.map(code => {
                    const cc = colorClasses(code.color);
                    return (
                      <th key={code.id} className="px-1 py-2 border-b border-r border-warm-200 text-center" title={code.name}>
                        <div className="flex flex-col items-center gap-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${cc.dot}`} />
                          <span className="block truncate max-w-[60px] text-warm-600 font-medium">{code.name}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {leafCodes.map(row => {
                  const cc = colorClasses(row.color);
                  return (
                    <tr key={row.id}>
                      <td className="px-2 py-1.5 border-b border-r border-warm-100 font-medium text-warm-700 whitespace-nowrap sticky left-0 bg-white">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${cc.dot} shrink-0`} />
                          {row.name}
                        </span>
                      </td>
                      {leafCodes.map(col => {
                        const count = coMatrix[row.id]?.[col.id] ?? 0;
                        const isDiag = row.id === col.id;
                        const intensity = isDiag ? 0 : count / maxCoOccurrence;
                        return (
                          <td
                            key={col.id}
                            className={`px-1 py-1.5 border-b border-r border-warm-100 text-center tabular-nums ${
                              isDiag ? 'bg-warm-50 text-warm-400' : count > 0 ? 'text-warm-800 font-medium' : 'text-warm-300'
                            }`}
                            style={!isDiag && count > 0 ? { backgroundColor: `rgba(212, 136, 77, ${intensity * 0.5})` } : undefined}
                          >
                            {count || (isDiag ? count : '·')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {topPairs.length > 0 && (
            <div className="w-64 shrink-0">
              <h3 className="text-sm font-semibold text-warm-700 mb-3">Top Co-Occurrences</h3>
              <div className="space-y-2">
                {topPairs.map((pair, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-warm-100">
                    <span className="text-warm-700 truncate flex-1">
                      {pair.code1} + {pair.code2}
                    </span>
                    <span className="text-warm-500 tabular-nums ml-2 font-medium">{pair.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
