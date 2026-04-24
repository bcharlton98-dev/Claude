import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Upload, X, Filter, Tag } from 'lucide-react';
import { useAppState, useDispatch } from '../store/AppStore';
import { useAllTags } from '../store/selectors';

type ImportTab = 'paste' | 'upload';

export default function TranscriptsList() {
  const state = useAppState();
  const dispatch = useDispatch();
  const allTags = useAllTags();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<ImportTab>('paste');
  const [title, setTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterDescKey, setFilterDescKey] = useState('');
  const [filterDescValue, setFilterDescValue] = useState('');
  const [filterCohort, setFilterCohort] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const descriptorKeys = state.descriptorSchema ?? [];
  const cohorts = useMemo(() => {
    const set = new Set<string>();
    for (const t of Object.values(state.transcripts)) {
      if (t.cohort) set.add(t.cohort);
    }
    return Array.from(set).sort();
  }, [state.transcripts]);

  const descriptorValues = useMemo(() => {
    if (!filterDescKey) return [];
    const set = new Set<string>();
    for (const t of Object.values(state.transcripts)) {
      const d = (t.descriptors ?? []).find(dd => dd.key === filterDescKey);
      if (d?.value) set.add(d.value);
    }
    return Array.from(set).sort();
  }, [state.transcripts, filterDescKey]);

  let transcripts = Object.values(state.transcripts).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  if (filterTags.length > 0) {
    transcripts = transcripts.filter(t =>
      filterTags.every(ft => (t.tags ?? []).includes(ft)),
    );
  }
  if (filterCohort) {
    transcripts = transcripts.filter(t => (t.cohort ?? '') === filterCohort);
  }
  if (filterDescKey && filterDescValue) {
    transcripts = transcripts.filter(t => {
      const d = (t.descriptors ?? []).find(dd => dd.key === filterDescKey);
      return d?.value === filterDescValue;
    });
  }

  function resetModal() {
    setShowModal(false);
    setTitle('');
    setPasteContent('');
    setNewTags([]);
    setTagInput('');
    setTab('paste');
    setLoading(false);
    setUploadProgress('');
  }

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !newTags.includes(trimmed)) {
      setNewTags([...newTags, trimmed]);
    }
    setTagInput('');
  }

  function createTranscript(titleStr: string, text: string, tags: string[]) {
    if (!titleStr.trim() || !text.trim()) return;
    dispatch({ type: 'transcript/create', payload: { title: titleStr.trim(), text: text.trim(), tags } });
  }

  function handlePasteSubmit() {
    createTranscript(title, pasteContent, newTags);
    resetModal();
  }

  async function handleBulkUpload(files: FileList) {
    setLoading(true);
    const fileArray = Array.from(files);
    let processed = 0;

    for (const file of fileArray) {
      try {
        setUploadProgress(`Processing ${processed + 1} of ${fileArray.length}: ${file.name}`);
        let text: string;
        const isDocx = file.name.toLowerCase().endsWith('.docx');

        if (isDocx) {
          const mammoth = await import('mammoth');
          const buf = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: buf });
          text = result.value;
        } else {
          text = await file.text();
        }

        const name = file.name.replace(/\.(txt|docx)$/i, '');
        createTranscript(name, text, [...newTags]);
        processed++;
      } catch (e) {
        console.error(`Failed to parse ${file.name}:`, e);
      }
    }

    setUploadProgress(`Done! Imported ${processed} of ${fileArray.length} files.`);
    setTimeout(resetModal, 1200);
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete "${name}"? This will also delete all excerpts from this transcript.`)) {
      dispatch({ type: 'transcript/delete', payload: { id } });
    }
  }

  function toggleFilterTag(tag: string) {
    setFilterTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  }

  const excerptCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of Object.values(state.excerpts)) {
      counts.set(e.transcriptId, (counts.get(e.transcriptId) ?? 0) + 1);
    }
    return counts;
  }, [state.excerpts]);

  const totalTranscripts = Object.keys(state.transcripts).length;

  // Escape to close modal
  useEffect(() => {
    if (!showModal) return;
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') resetModal(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showModal]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">Transcripts</h1>
          <p className="text-sm text-warm-500 mt-1">
            {(filterTags.length > 0 || filterCohort || (filterDescKey && filterDescValue))
              ? `${transcripts.length} of ${totalTranscripts} (filtered)`
              : `${transcripts.length} document${transcripts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors btn-press ${
              (filterTags.length > 0 || filterCohort || filterDescValue)
                ? 'bg-ember-100 text-ember-600 border border-ember-300'
                : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-100'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-forest-500 text-white text-sm font-medium rounded-lg hover:bg-forest-600 transition-colors btn-press"
          >
            <Plus size={16} />
            Add Reports
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 bg-white rounded-xl border border-warm-100 card-shadow p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide">Filters</p>
            {(filterTags.length > 0 || filterCohort || filterDescValue) && (
              <button
                onClick={() => { setFilterTags([]); setFilterCohort(''); setFilterDescKey(''); setFilterDescValue(''); }}
                className="text-xs text-ember-600 hover:text-ember-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Cohort filter */}
          {cohorts.length > 0 && (
            <div>
              <p className="text-xs text-warm-500 mb-1.5">Cohort</p>
              <div className="flex flex-wrap gap-1.5">
                {cohorts.map(c => (
                  <button
                    key={c}
                    onClick={() => setFilterCohort(filterCohort === c ? '' : c)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      filterCohort === c ? 'bg-forest-500 text-white' : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Descriptor filter */}
          {descriptorKeys.length > 0 && (
            <div>
              <p className="text-xs text-warm-500 mb-1.5">Descriptors</p>
              <div className="flex gap-2">
                <select
                  value={filterDescKey}
                  onChange={e => { setFilterDescKey(e.target.value); setFilterDescValue(''); }}
                  className="text-xs border border-warm-200 rounded-lg px-2 py-1.5 bg-white"
                >
                  <option value="">Field...</option>
                  {descriptorKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {filterDescKey && (
                  <select
                    value={filterDescValue}
                    onChange={e => setFilterDescValue(e.target.value)}
                    className="text-xs border border-warm-200 rounded-lg px-2 py-1.5 bg-white"
                  >
                    <option value="">All</option>
                    {descriptorValues.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div>
              <p className="text-xs text-warm-500 mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleFilterTag(tag)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      filterTags.includes(tag) ? 'bg-forest-500 text-white' : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    }`}
                  >{tag}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {transcripts.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto text-warm-300 mb-4" />
          <p className="text-warm-500 text-lg">
            {filterTags.length > 0 ? 'No transcripts match your filters' : 'No transcripts yet'}
          </p>
          <p className="text-warm-400 text-sm mt-1">
            {filterTags.length > 0 ? 'Try removing some filters' : 'Add reports to get started with coding'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {transcripts.map(t => (
            <Link
              key={t.id}
              to={`/transcripts/${t.id}`}
              className="block bg-white rounded-xl px-5 py-4 card-shadow card-hover border border-warm-100"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-warm-800 truncate">{t.title}</h3>
                  <p className="text-xs text-warm-400 mt-1">
                    {excerptCountMap.get(t.id) ?? 0} excerpt{(excerptCountMap.get(t.id) ?? 0) !== 1 ? 's' : ''}
                    {' · '}
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </p>
                  {(t.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(t.tags ?? []).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm-100 text-warm-600 text-xs">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(t.id, t.title); }}
                  className="text-warm-300 hover:text-rose-500 transition-colors p-1 ml-3"
                  aria-label="Delete transcript"
                >
                  <X size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={resetModal}>
          <div className="bg-white rounded-2xl w-full max-w-lg card-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-semibold text-warm-800">Add Reports</h2>
              <button onClick={resetModal} className="text-warm-400 hover:text-warm-600">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Tags section — shared across both tabs */}
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Tags <span className="font-normal text-warm-400">(demographics, categories)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest-100 text-forest-700 text-xs font-medium">
                      {tag}
                      <button onClick={() => setNewTags(newTags.filter(t => t !== tag))} className="hover:text-rose-500">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                    placeholder="e.g. HBCU, Year 2, STEM..."
                    className="flex-1 border border-warm-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400"
                    list="existing-tags"
                  />
                  <datalist id="existing-tags">
                    {allTags.filter(t => !newTags.includes(t)).map(t => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                  <button
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim()}
                    className="px-3 py-1.5 bg-warm-100 text-warm-600 text-sm rounded-lg hover:bg-warm-200 disabled:opacity-40 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1">
                {(['paste', 'upload'] as ImportTab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      tab === t
                        ? 'bg-forest-100 text-forest-700'
                        : 'text-warm-500 hover:bg-warm-100'
                    }`}
                  >
                    {t === 'paste' ? 'Paste Text' : 'Upload Files'}
                  </button>
                ))}
              </div>

              {tab === 'paste' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Report title..."
                      className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400"
                    />
                  </div>
                  <textarea
                    value={pasteContent}
                    onChange={e => setPasteContent(e.target.value)}
                    placeholder="Paste report text here..."
                    rows={8}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400 resize-y"
                  />
                </>
              )}

              {tab === 'upload' && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-warm-200 rounded-xl py-10 cursor-pointer hover:border-forest-400 hover:bg-forest-50/30 transition-colors">
                  <Upload size={24} className="text-warm-400 mb-2" />
                  <span className="text-sm text-warm-500 font-medium">
                    {loading ? uploadProgress : 'Click to select files (.txt or .docx)'}
                  </span>
                  <span className="text-xs text-warm-400 mt-1">
                    Select multiple files for bulk import
                  </span>
                  <input
                    type="file"
                    accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    className="hidden"
                    disabled={loading}
                    onChange={e => {
                      const files = e.target.files;
                      if (files && files.length > 0) handleBulkUpload(files);
                    }}
                  />
                </label>
              )}
            </div>

            {tab === 'paste' && (
              <div className="px-6 py-4 border-t border-warm-100">
                <button
                  onClick={handlePasteSubmit}
                  disabled={!title.trim() || !pasteContent.trim()}
                  className="w-full py-2.5 px-4 bg-forest-500 text-white text-sm font-medium rounded-lg hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors btn-press"
                >
                  Create Transcript
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
