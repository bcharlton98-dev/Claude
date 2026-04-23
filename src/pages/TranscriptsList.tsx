import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Upload, X } from 'lucide-react';
import { useAppState, useDispatch } from '../store/AppStore';

type ImportTab = 'paste' | 'txt' | 'docx';

export default function TranscriptsList() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<ImportTab>('paste');
  const [title, setTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [loading, setLoading] = useState(false);

  const transcripts = Object.values(state.transcripts).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  function resetModal() {
    setShowModal(false);
    setTitle('');
    setPasteContent('');
    setTab('paste');
    setLoading(false);
  }

  function createTranscript(text: string) {
    if (!title.trim() || !text.trim()) return;
    dispatch({ type: 'transcript/create', payload: { title: title.trim(), text: text.trim() } });
    resetModal();
  }

  function handlePasteSubmit() {
    createTranscript(pasteContent);
  }

  async function handleFileUpload(file: File, type: 'txt' | 'docx') {
    setLoading(true);
    try {
      let text: string;
      if (type === 'txt') {
        text = await file.text();
      } else {
        const mammoth = await import('mammoth');
        const buf = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buf });
        text = result.value;
      }
      if (!title.trim()) {
        setTitle(file.name.replace(/\.(txt|docx)$/i, ''));
      }
      createTranscript(text);
    } catch (e) {
      console.error('Failed to parse file:', e);
      alert('Failed to parse file. Please try a different format.');
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete "${name}"? This will also delete all excerpts from this transcript.`)) {
      dispatch({ type: 'transcript/delete', payload: { id } });
    }
  }

  const excerptCounts = (id: string) =>
    Object.values(state.excerpts).filter(e => e.transcriptId === id).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">Transcripts</h1>
          <p className="text-sm text-warm-500 mt-1">{transcripts.length} document{transcripts.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-forest-500 text-white text-sm font-medium rounded-lg hover:bg-forest-600 transition-colors btn-press"
        >
          <Plus size={16} />
          New Transcript
        </button>
      </div>

      {transcripts.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto text-warm-300 mb-4" />
          <p className="text-warm-500 text-lg">No transcripts yet</p>
          <p className="text-warm-400 text-sm mt-1">Add one to get started with coding</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {transcripts.map(t => (
            <Link
              key={t.id}
              to={`/transcripts/${t.id}`}
              className="block bg-white rounded-xl px-5 py-4 card-shadow card-hover border border-warm-100"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-warm-800 truncate">{t.title}</h3>
                  <p className="text-xs text-warm-400 mt-1">
                    {excerptCounts(t.id)} excerpt{excerptCounts(t.id) !== 1 ? 's' : ''}
                    {' · '}
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(t.id, t.title); }}
                  className="text-warm-300 hover:text-rose-500 transition-colors p-1 ml-3"
                  aria-label="Delete transcript"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-warm-500 mt-2 line-clamp-2">
                {t.text.slice(0, 200)}
              </p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={resetModal}>
          <div className="bg-white rounded-2xl w-full max-w-lg card-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-semibold text-warm-800">New Transcript</h2>
              <button onClick={resetModal} className="text-warm-400 hover:text-warm-600">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Interview with..."
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex gap-1 mb-3">
                  {(['paste', 'txt', 'docx'] as ImportTab[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                        tab === t
                          ? 'bg-forest-100 text-forest-700'
                          : 'text-warm-500 hover:bg-warm-100'
                      }`}
                    >
                      {t === 'paste' ? 'Paste Text' : t === 'txt' ? 'Upload .txt' : 'Upload .docx'}
                    </button>
                  ))}
                </div>

                {tab === 'paste' && (
                  <textarea
                    value={pasteContent}
                    onChange={e => setPasteContent(e.target.value)}
                    placeholder="Paste your transcript text here..."
                    rows={10}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400 resize-y"
                  />
                )}

                {tab === 'txt' && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-warm-200 rounded-xl py-10 cursor-pointer hover:border-forest-400 hover:bg-forest-50/30 transition-colors">
                    <Upload size={24} className="text-warm-400 mb-2" />
                    <span className="text-sm text-warm-500">Click to upload a .txt file</span>
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'txt');
                      }}
                    />
                  </label>
                )}

                {tab === 'docx' && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-warm-200 rounded-xl py-10 cursor-pointer hover:border-forest-400 hover:bg-forest-50/30 transition-colors">
                    <Upload size={24} className="text-warm-400 mb-2" />
                    <span className="text-sm text-warm-500">
                      {loading ? 'Parsing...' : 'Click to upload a .docx file'}
                    </span>
                    <input
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      disabled={loading}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'docx');
                      }}
                    />
                  </label>
                )}
              </div>
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
