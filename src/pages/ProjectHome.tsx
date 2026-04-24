import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppState, useDispatch } from '../store/AppStore';
import { useAllCodesList } from '../store/selectors';
import { colorClasses } from '../lib/codeColors';

export default function ProjectHome() {
  const state = useAppState();
  const dispatch = useDispatch();
  const allCodes = useAllCodesList();

  const transcripts = Object.values(state.transcripts);
  const excerpts = Object.values(state.excerpts);

  const [rqLocal, setRqLocal] = useState(state.researchQuestion ?? '');
  const [memoLocal, setMemoLocal] = useState(state.analyticMemo ?? '');
  const rqTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setRqLocal(state.researchQuestion ?? ''); }, [state.researchQuestion]);
  useEffect(() => { setMemoLocal(state.analyticMemo ?? ''); }, [state.analyticMemo]);

  function handleRqChange(val: string) {
    setRqLocal(val);
    if (rqTimeout.current) clearTimeout(rqTimeout.current);
    rqTimeout.current = setTimeout(() => dispatch({ type: 'project/setResearchQuestion', payload: { question: val } }), 500);
  }

  function handleMemoChange(val: string) {
    setMemoLocal(val);
    if (memoTimeout.current) clearTimeout(memoTimeout.current);
    memoTimeout.current = setTimeout(() => dispatch({ type: 'project/setAnalyticMemo', payload: { memo: val } }), 500);
  }

  const codeFrequencies = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const ex of excerpts) {
      for (const cid of ex.codeIds) {
        freq[cid] = (freq[cid] ?? 0) + 1;
      }
    }
    return freq;
  }, [excerpts]);

  const topCodes = useMemo(() => {
    return allCodes
      .map(c => ({ code: c, count: codeFrequencies[c.id] ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [allCodes, codeFrequencies]);

  const maxCodeCount = topCodes.length > 0 ? topCodes[0].count : 1;

  const recentTranscripts = useMemo(
    () => [...transcripts].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [transcripts],
  );

  const recentExcerpts = useMemo(() => {
    return [...excerpts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [excerpts]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Research Question */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Research Question</h2>
        <textarea
          value={rqLocal}
          onChange={e => handleRqChange(e.target.value)}
          onBlur={() => {
            if (rqTimeout.current) clearTimeout(rqTimeout.current);
            if (rqLocal !== (state.researchQuestion ?? '')) dispatch({ type: 'project/setResearchQuestion', payload: { question: rqLocal } });
          }}
          placeholder="What is the central question driving this analysis? (e.g., What are the barriers for African-American institutions to succeed in their grant work?)"
          rows={2}
          className="w-full text-lg font-reading text-slate-800 border-0 border-b-2 border-slate-200 focus:border-[#C9952B] focus:outline-none bg-transparent resize-none placeholder:text-slate-300 leading-relaxed px-0 py-2"
        />
      </div>

      {/* Analytic Memo */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Analytic Memo</h2>
        <textarea
          value={memoLocal}
          onChange={e => handleMemoChange(e.target.value)}
          onBlur={() => {
            if (memoTimeout.current) clearTimeout(memoTimeout.current);
            if (memoLocal !== (state.analyticMemo ?? '')) dispatch({ type: 'project/setAnalyticMemo', payload: { memo: memoLocal } });
          }}
          placeholder="Running notes on emerging themes, patterns, and interpretations. What are you seeing in the data? What surprises you? What contradictions are appearing?"
          rows={4}
          className="w-full text-sm font-reading text-slate-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C9952B]/30 focus:border-[#C9952B] focus:outline-none bg-white resize-y placeholder:text-slate-300 leading-relaxed px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Code frequency */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Code Frequency</h2>
            <Link to="/analysis" className="text-xs text-navy-600 hover:text-navy-700">View all</Link>
          </div>
          {topCodes.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Start coding transcripts to see frequency data</p>
          ) : (
            <div className="space-y-2.5">
              {topCodes.map(({ code, count }) => {
                const cc = colorClasses(code.color);
                const pct = maxCodeCount > 0 ? (count / maxCodeCount) * 100 : 0;
                return (
                  <div key={code.id} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${cc.dot} shrink-0`} />
                    <span className="text-sm text-slate-700 w-36 truncate">{code.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-full rounded-full bg-navy-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent transcripts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent</h2>
            <Link to="/transcripts" className="text-xs text-navy-600 hover:text-navy-700">View all</Link>
          </div>
          {recentTranscripts.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No transcripts yet</p>
          ) : (
            <div className="space-y-1">
              {recentTranscripts.map(t => (
                <Link
                  key={t.id}
                  to={`/transcripts/${t.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400">{new Date(t.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent excerpts */}
      {recentExcerpts.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Latest Coded Excerpts</h2>
            <Link to="/analysis" className="text-xs text-navy-600 hover:text-navy-700">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recentExcerpts.map(ex => {
              const t = state.transcripts[ex.transcriptId];
              if (!t) return null;
              return (
                <Link
                  key={ex.id}
                  to={`/transcripts/${t.id}?excerpt=${ex.id}`}
                  className="block py-3 px-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-xs text-slate-400 mb-1 truncate">{t.title}</p>
                  <p className="text-sm text-slate-600 font-reading line-clamp-2">
                    "{t.text.slice(ex.start, Math.min(ex.end, ex.start + 120))}{ex.end - ex.start > 120 ? '...' : ''}"
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
