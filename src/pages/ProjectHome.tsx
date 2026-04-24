import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, BarChart3, Grid3X3, ArrowRight } from 'lucide-react';
import { useAppState } from '../store/AppStore';
import { useAllCodesList } from '../store/selectors';
import { colorClasses } from '../lib/codeColors';

export default function ProjectHome() {
  const state = useAppState();
  const allCodes = useAllCodesList();

  const transcripts = Object.values(state.transcripts);
  const excerpts = Object.values(state.excerpts);
  const codes = allCodes;

  const recentTranscripts = useMemo(
    () => [...transcripts].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [transcripts],
  );

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
    return codes
      .map(c => ({ code: c, count: codeFrequencies[c.id] ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [codes, codeFrequencies]);

  const maxCodeCount = topCodes.length > 0 ? topCodes[0].count : 1;

  const recentExcerpts = useMemo(() => {
    return [...excerpts]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6);
  }, [excerpts]);

  const descriptorBreakdown = useMemo(() => {
    const schema = state.descriptorSchema ?? [];
    if (schema.length === 0) return [];
    const firstKey = schema[0];
    const counts: Record<string, number> = {};
    for (const t of transcripts) {
      const d = (t.descriptors ?? []).find(dd => dd.key === firstKey);
      const val = d?.value || 'Unset';
      counts[val] = (counts[val] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }, [transcripts, state.descriptorSchema]);

  const descriptorLabel = (state.descriptorSchema ?? [])[0] ?? '';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Transcripts', value: transcripts.length, icon: FileText, to: '/transcripts', color: 'text-navy-600 bg-navy-50' },
          { label: 'Codes', value: codes.length, icon: BookOpen, to: '/codebook', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Excerpts', value: excerpts.length, icon: BarChart3, to: '/analysis', color: 'text-amber-600 bg-amber-50' },
          { label: 'Code Applications', value: Object.values(codeFrequencies).reduce((a, b) => a + b, 0), icon: Grid3X3, to: '/matrix', color: 'text-rose-600 bg-rose-50' },
        ].map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to} className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <ArrowRight size={14} className="text-slate-300" />
            </div>
            <p className="text-3xl font-bold text-slate-800 mt-3 tabular-nums">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Code cloud */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Code Frequency</h2>
            <Link to="/analysis" className="text-xs text-navy-600 hover:text-navy-700">View all</Link>
          </div>
          {topCodes.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Start coding transcripts to see frequency data</p>
          ) : (
            <div className="space-y-2">
              {topCodes.map(({ code, count }) => {
                const cc = colorClasses(code.color);
                const pct = maxCodeCount > 0 ? (count / maxCodeCount) * 100 : 0;
                return (
                  <div key={code.id} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${cc.dot} shrink-0`} />
                    <span className="text-sm text-slate-700 w-32 truncate">{code.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full bg-navy-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Descriptor breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">
            {descriptorLabel ? `By ${descriptorLabel}` : 'Descriptors'}
          </h2>
          {descriptorBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              {descriptorLabel ? 'No data yet' : 'Set up descriptor fields in Codebook'}
            </p>
          ) : (
            <div className="space-y-3">
              {descriptorBreakdown.map(({ label, count }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{label}</span>
                  <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Recent transcripts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Transcripts</h2>
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
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
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

        {/* Recent excerpts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Excerpts</h2>
            <Link to="/analysis" className="text-xs text-navy-600 hover:text-navy-700">View all</Link>
          </div>
          {recentExcerpts.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No excerpts coded yet</p>
          ) : (
            <div className="space-y-2">
              {recentExcerpts.map(ex => {
                const t = state.transcripts[ex.transcriptId];
                if (!t) return null;
                return (
                  <Link
                    key={ex.id}
                    to={`/transcripts/${t.id}?excerpt=${ex.id}`}
                    className="block py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-xs text-slate-400 mb-1">{t.title}</p>
                    <p className="text-sm text-slate-600 font-reading line-clamp-2">
                      "{t.text.slice(ex.start, Math.min(ex.end, ex.start + 100))}{ex.end - ex.start > 100 ? '...' : ''}"
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
