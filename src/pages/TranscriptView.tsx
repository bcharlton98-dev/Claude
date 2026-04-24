import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import TranscriptReader from '../components/TranscriptReader';
import MemoEditor from '../components/MemoEditor';
import CodeBadge from '../components/CodeBadge';
import { useTranscript, useExcerptsForTranscript, useAllTags } from '../store/selectors';
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
  const allTags = useAllTags();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [tagInput, setTagInput] = useState('');

  if (!transcript) {
    return (
      <div className="p-8">
        <p className="text-warm-500">Transcript not found.</p>
        <Link to="/transcripts" className="text-navy-600 hover:underline text-sm mt-2 inline-block">
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

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !(transcript!.tags ?? []).includes(trimmed)) {
      dispatch({ type: 'transcript/setTags', payload: { id: transcript!.id, tags: [...(transcript!.tags ?? []), trimmed] } });
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    dispatch({ type: 'transcript/setTags', payload: { id: transcript!.id, tags: (transcript!.tags ?? []).filter(t => t !== tag) } });
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto p-8">
        <Link
          to="/transcripts"
          className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-navy-600 mb-4"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        {isEditing ? (
          <div className="flex items-center gap-2 mb-4">
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setIsEditing(false); }}
              className="text-2xl font-bold text-warm-800 border border-warm-200 rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-navy-300"
              autoFocus
            />
            <button onClick={saveTitle} className="text-sm text-navy-600 font-medium px-3 py-1">Save</button>
          </div>
        ) : (
          <h1
            className="text-2xl font-bold text-warm-800 mb-2 cursor-pointer hover:text-navy-700 transition-colors"
            onClick={startEditing}
            title="Click to rename"
          >
            {transcript.title}
          </h1>
        )}

        {/* Tags bar */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {(transcript.tags ?? []).map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy-100 text-navy-700 text-xs font-medium">
              <Tag size={10} />
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-rose-500">&times;</button>
            </span>
          ))}
          <div className="inline-flex">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
              placeholder="+ tag"
              className="w-20 text-xs border border-warm-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-navy-300 focus:w-32 transition-all"
              list="tag-suggestions"
            />
            <datalist id="tag-suggestions">
              {allTags.filter(t => !(transcript.tags ?? []).includes(t)).map(t => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        </div>

        <TranscriptReader
          transcriptId={transcript.id}
          text={transcript.text}
          excerpts={excerpts}
          focusExcerptId={focusExcerptId}
        />
      </div>

      <aside className="w-80 border-l border-slate-200 bg-white overflow-y-auto shrink-0">
        {/* Document Info header */}
        <div className="bg-navy-600 text-white px-4 py-2">
          <h2 className="text-xs font-semibold tracking-wide uppercase">Document Info</h2>
        </div>
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Excerpts</span>
              <p className="font-semibold text-slate-700">{excerpts.length}</p>
            </div>
            <div>
              <span className="text-slate-400">Added</span>
              <p className="font-semibold text-slate-700">{new Date(transcript.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 space-y-4">
        {/* Cohort */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Cohort</h2>
          <input
            value={transcript.cohort ?? ''}
            onChange={e => dispatch({ type: 'transcript/setCohort', payload: { id: transcript.id, cohort: e.target.value } })}
            placeholder="e.g. Year 1, 2024 Cycle..."
            className="w-full text-sm border border-warm-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400"
            list="cohort-suggestions"
          />
          <datalist id="cohort-suggestions">
            {Array.from(new Set(Object.values(state.transcripts).map(t => t.cohort).filter(Boolean))).map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {/* Descriptors */}
        {(state.descriptorSchema ?? []).length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Descriptors</h2>
            <div className="space-y-2">
              {(state.descriptorSchema ?? []).map(key => {
                const desc = (transcript.descriptors ?? []).find(d => d.key === key);
                return (
                  <div key={key}>
                    <label className="block text-xs text-warm-500 mb-0.5">{key}</label>
                    <input
                      value={desc?.value ?? ''}
                      onChange={e => {
                        const newDescriptors = [...(transcript.descriptors ?? [])];
                        const idx = newDescriptors.findIndex(d => d.key === key);
                        if (idx >= 0) {
                          newDescriptors[idx] = { key, value: e.target.value };
                        } else {
                          newDescriptors.push({ key, value: e.target.value });
                        }
                        dispatch({ type: 'transcript/setDescriptors', payload: { id: transcript.id, descriptors: newDescriptors } });
                      }}
                      placeholder={`Enter ${key.toLowerCase()}...`}
                      className="w-full text-sm border border-warm-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-300"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Memo</h2>
          <MemoEditor
            value={transcript.memo}
            onChange={(memo) => dispatch({ type: 'transcript/setMemo', payload: { id: transcript.id, memo } })}
            placeholder="Notes about this transcript..."
          />
        </div>

        </div>

        {/* Codes header */}
        <div className="bg-navy-600 text-white px-4 py-2">
          <h2 className="text-xs font-semibold tracking-wide uppercase">Excerpts ({excerpts.length})</h2>
        </div>
        <div className="px-4 py-3">
        <div>
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
        </div>
      </aside>
    </div>
  );
}
