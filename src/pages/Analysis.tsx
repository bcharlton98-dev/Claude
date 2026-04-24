import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Download } from 'lucide-react';
import CodeTree from '../components/CodeTree';
import CodeBadge from '../components/CodeBadge';
import { useCodesTree, useExcerptsForCode } from '../store/selectors';
import { useAppState } from '../store/AppStore';
import { exportExcerptsAsCsv, downloadCsv } from '../lib/export';
import { isElectron, getElectronAPI } from '../lib/electronAPI';

export default function Analysis() {
  const state = useAppState();
  const tree = useCodesTree();
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  function handleExport() {
    const csv = exportExcerptsAsCsv(state);
    const date = new Date().toISOString().slice(0, 10);
    const filename = `plenior-export-${date}.csv`;

    if (isElectron()) {
      getElectronAPI().exportCsv({ csv, defaultName: filename });
    } else {
      downloadCsv(csv, filename);
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-72 border-r border-warm-200 bg-white overflow-y-auto p-4 shrink-0">
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-sm font-semibold text-warm-700">Codes</h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
            title="Export all excerpts as CSV for Airtable"
          >
            <Download size={12} />
            CSV
          </button>
        </div>
        <CodeTree
          nodes={tree}
          selectedId={selectedCodeId}
          onSelect={setSelectedCodeId}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {selectedCodeId ? (
          <AnalysisPanel codeId={selectedCodeId} />
        ) : (
          <div className="text-center py-16">
            <p className="text-warm-400 text-lg">Select a code to view excerpts</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisPanel({ codeId }: { codeId: string }) {
  const state = useAppState();
  const code = state.codes[codeId];
  const excerpts = useExcerptsForCode(codeId);

  if (!code) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-800">{code.name}</h1>
        {code.memo && <p className="text-sm text-warm-500 mt-1">{code.memo}</p>}
        <p className="text-sm text-warm-400 mt-1">{excerpts.length} excerpt{excerpts.length !== 1 ? 's' : ''}</p>
      </div>

      {excerpts.length === 0 ? (
        <p className="text-warm-400 text-sm italic">No excerpts coded with "{code.name}" yet.</p>
      ) : (
        <div className="space-y-3">
          {excerpts.map(ex => {
            const transcript = state.transcripts[ex.transcriptId];
            if (!transcript) return null;

            const contextBefore = transcript.text.slice(Math.max(0, ex.start - 60), ex.start);
            const excerptText = transcript.text.slice(ex.start, ex.end);
            const contextAfter = transcript.text.slice(ex.end, ex.end + 60);

            return (
              <div
                key={ex.id}
                className="bg-white rounded-xl border border-warm-100 card-shadow px-5 py-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-warm-700">{transcript.title}</span>
                  <Link
                    to={`/transcripts/${transcript.id}?excerpt=${ex.id}`}
                    className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
                  >
                    Open <ExternalLink size={12} />
                  </Link>
                </div>
                <p className="text-sm text-warm-600 leading-relaxed font-reading">
                  {ex.start > 60 && <span className="text-warm-400">...</span>}
                  <span className="text-warm-400">{contextBefore}</span>
                  <mark className="bg-gold-200 text-warm-800 rounded px-0.5">{excerptText}</mark>
                  <span className="text-warm-400">{contextAfter}</span>
                  {ex.end + 60 < transcript.text.length && <span className="text-warm-400">...</span>}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {ex.codeIds.map(cid => {
                    const c = state.codes[cid];
                    if (!c) return null;
                    return <CodeBadge key={cid} code={c} />;
                  })}
                </div>
                {ex.memo && (
                  <p className="text-xs text-warm-500 mt-2 italic border-l-2 border-warm-200 pl-2">
                    {ex.memo}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
