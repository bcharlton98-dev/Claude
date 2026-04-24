import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, ExternalLink } from 'lucide-react';
import { useAppState } from '../store/AppStore';
import { searchAll, MAX_SEARCH_RESULTS } from '../lib/search';

export default function Search() {
  const state = useAppState();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => searchAll(state, query),
    [state, query],
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-warm-800 mb-6">Search</h1>

      <div className="relative mb-6">
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search transcripts and memos..."
          className="w-full border border-warm-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
          autoFocus
        />
      </div>

      {query.trim() && (
        <p className="text-sm text-warm-400 mb-4">
          {results.length} result{results.length !== 1 ? 's' : ''}
          {results.length === MAX_SEARCH_RESULTS && ' (max)'}
        </p>
      )}

      <div className="space-y-2">
        {results.map((r, i) => (
          <Link
            key={`${r.id}-${r.kind}-${i}`}
            to={r.kind === 'code'
              ? `/codebook`
              : r.kind === 'transcript'
                ? `/transcripts/${r.transcriptId}`
                : `/transcripts/${r.transcriptId}?excerpt=${r.id}`
            }
            className="block bg-white rounded-xl border border-warm-100 px-5 py-4 card-shadow card-hover"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-warm-700">
                {r.kind === 'code' ? `Code: ${r.snippet}` : r.transcriptTitle}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-warm-400 capitalize">
                  {r.kind === 'transcript' ? 'text' : r.kind === 'transcript-memo' ? 'memo' : r.kind === 'code' ? 'code' : 'excerpt memo'}
                </span>
                <ExternalLink size={12} className="text-warm-400" />
              </div>
            </div>
            {r.kind !== 'code' && (
              <p className="text-sm text-warm-500">
                <HighlightedSnippet snippet={r.snippet} query={query} />
              </p>
            )}
          </Link>
        ))}
      </div>

      {query.trim() && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-warm-400 text-lg">No results found</p>
          <p className="text-warm-400 text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}

function HighlightedSnippet({ snippet, query }: { snippet: string; query: string }) {
  if (!query.trim()) return <>{snippet}</>;

  const parts: React.ReactNode[] = [];
  let remaining = snippet;
  const lowerQuery = query.toLowerCase();
  let key = 0;

  while (remaining.length > 0) {
    const idx = remaining.toLowerCase().indexOf(lowerQuery);
    if (idx === -1) {
      parts.push(<span key={key}>{remaining}</span>);
      break;
    }
    if (idx > 0) {
      parts.push(<span key={key}>{remaining.slice(0, idx)}</span>);
      key++;
    }
    parts.push(
      <mark key={key} className="bg-gold-200 text-warm-800 rounded px-0.5">
        {remaining.slice(idx, idx + query.length)}
      </mark>,
    );
    key++;
    remaining = remaining.slice(idx + query.length);
  }

  return <>{parts}</>;
}
