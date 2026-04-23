import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TranscriptReader from '../components/TranscriptReader';
import MemoEditor from '../components/MemoEditor';
import CodeBadge from '../components/CodeBadge';
import { useTranscript, useExcerptsForTranscript } from '../store/selectors';
import { useAppState, useDispatch } from '../store/AppStore';
import { useState } from 'react';

export default function TranscriptView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const focusExcerptId = searchParams.get('excerpt');
  const transcript = useTranscript(id!);
  const excerpts = useExcerptsForTranscript(id!);
  const dispatch = useDispatch();
  const state = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  if (!transcript) {
    return (
      <div className="p-8">
        <p className="text-warm-500">Transcript not found.</p>
        <Link to="/transcripts" className="text-forest-600 hover:underline text-sm mt-2 inline-block">
          Back to transcripts
        </Link>
      </div>
    );
  }

  function startEditing() {
    setEditTitle(transcript!.title);
    setIsEditing(true);
  }

  function saveTitle() {
    if (editTitle.trim() && editTitle.trim() !== transcript!.title) {
      dispatch({ type: 'transcript/rename', payload: { id: transcript!.id, title: editTitle.trim() } });
    }
    setIsEditing(false);
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto p-8">
        <Link
          to="/transcripts"
          className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-forest-600 mb-4"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        {isEditing ? (
          <div className="flex items-center gap-2 mb-6">
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setIsEditing(false); }}
              className="text-2xl font-bold text-warm-800 border border-warm-200 rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-forest-300"
              autoFocus
            />
            <button onClick={saveTitle} className="text-sm text-forest-600 font-medium px-3 py-1">Save</button>
          </div>
        ) : (
          <h1
            className="text-2xl font-bold text-warm-800 mb-6 cursor-pointer hover:text-forest-700 transition-colors"
            onClick={startEditing}
            title="Click to rename"
          >
            {transcript.title}
          </h1>
        )}

        <TranscriptReader
          transcriptId={transcript.id}
          text={transcript.text}
          excerpts={excerpts}
          focusExcerptId={focusExcerptId}
        />
      </div>

      <aside className="w-80 border-l border-warm-200 bg-white overflow-y-auto p-5 shrink-0">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-warm-700 mb-2">Transcript Memo</h2>
          <MemoEditor
            value={transcript.memo}
            onChange={(memo) => dispatch({ type: 'transcript/setMemo', payload: { id: transcript.id, memo } })}
            placeholder="Notes about this transcript..."
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-700 mb-3">
            Excerpts ({excerpts.length})
          </h2>
          {excerpts.length === 0 ? (
            <p className="text-xs text-warm-400 italic">
              Select text in the transcript and apply codes to create excerpts.
            </p>
          ) : (
            <div className="space-y-2">
              {excerpts.map(ex => (
                <div
                  key={ex.id}
                  className="border border-warm-100 rounded-lg px-3 py-2 text-xs hover:border-warm-200 transition-colors"
                >
                  <p className="text-warm-600 line-clamp-2 mb-1.5">
                    "{transcript.text.slice(ex.start, Math.min(ex.end, ex.start + 100))}
                    {ex.end - ex.start > 100 ? '...' : ''}"
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ex.codeIds.map(cid => {
                      const code = state.codes[cid];
                      if (!code) return null;
                      return <CodeBadge key={cid} code={code} size="sm" />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
