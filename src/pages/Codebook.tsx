import { useState } from 'react';
import { Plus, Save, FolderOpen, Settings2, X } from 'lucide-react';
import CodeTree from '../components/CodeTree';
import MemoEditor from '../components/MemoEditor';
import { useCodesTree, useAllCodesList } from '../store/selectors';
import { useAppState, useDispatch } from '../store/AppStore';
import { CODE_COLORS, type CodeColorKey, type ID } from '../types';
import { colorClasses } from '../lib/codeColors';

export default function Codebook() {
  const dispatch = useDispatch();
  const state = useAppState();
  const tree = useCodesTree();
  const allCodes = useAllCodesList();
  const [editingId, setEditingId] = useState<ID | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDescriptorSchema, setShowDescriptorSchema] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [newDescriptorKey, setNewDescriptorKey] = useState('');

  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState<CodeColorKey>('forest');
  const [formParent, setFormParent] = useState<ID | null>(null);

  const templates = Object.values(state.codebookTemplates ?? {}).sort((a, b) => b.createdAt - a.createdAt);
  const descriptorSchema = state.descriptorSchema ?? [];

  function startCreate() {
    setEditingId(null);
    setFormName('');
    setFormColor('forest');
    setFormParent(null);
    setShowCreate(true);
  }

  function startEdit(codeId: ID) {
    const code = state.codes[codeId];
    if (!code) return;
    setShowCreate(false);
    setEditingId(codeId);
    setFormName(code.name);
    setFormColor(code.color);
    setFormParent(code.parentId);
  }

  function handleSave() {
    if (!formName.trim()) return;
    if (editingId) {
      dispatch({
        type: 'code/update',
        payload: { id: editingId, patch: { name: formName.trim(), color: formColor, parentId: formParent } },
      });
      setEditingId(null);
    } else {
      dispatch({
        type: 'code/create',
        payload: { name: formName.trim(), color: formColor, parentId: formParent },
      });
      setShowCreate(false);
    }
    setFormName('');
  }

  function handleDelete(codeId: ID) {
    const code = state.codes[codeId];
    if (!code) return;
    const excerptCount = Object.values(state.excerpts).filter(e => e.codeIds.includes(codeId)).length;
    const msg = excerptCount > 0
      ? `Delete "${code.name}"? ${excerptCount} excerpt${excerptCount > 1 ? 's' : ''} will lose this code. Child codes will be moved up.`
      : `Delete "${code.name}"? Child codes will be moved up.`;
    if (confirm(msg)) {
      dispatch({ type: 'code/delete', payload: { id: codeId } });
      if (editingId === codeId) setEditingId(null);
    }
  }

  function isDescendant(codeId: ID, potentialAncestorId: ID): boolean {
    let current = codeId;
    const visited = new Set<string>();
    while (current) {
      if (visited.has(current)) return false;
      visited.add(current);
      if (current === potentialAncestorId) return true;
      const code = state.codes[current];
      if (!code?.parentId) return false;
      current = code.parentId;
    }
    return false;
  }

  const parentOptions = editingId
    ? allCodes.filter(c => c.id !== editingId && !isDescendant(c.id, editingId))
    : allCodes;

  function buildLabel(codeId: ID): string {
    const code = state.codes[codeId];
    if (!code) return '';
    if (!code.parentId) return code.name;
    return buildLabel(code.parentId) + ' > ' + code.name;
  }

  const editingCode = editingId ? state.codes[editingId] : null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">Codebook</h1>
          <p className="text-sm text-warm-500 mt-1">{allCodes.length} code{allCodes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDescriptorSchema(!showDescriptorSchema)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-warm-600 bg-white border border-warm-200 rounded-lg hover:bg-warm-100 transition-colors"
            title="Manage descriptor fields"
          >
            <Settings2 size={14} />
            Descriptors
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-warm-600 bg-white border border-warm-200 rounded-lg hover:bg-warm-100 transition-colors"
          >
            <FolderOpen size={14} />
            Templates
          </button>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors btn-press"
          >
            <Plus size={16} />
            New Code
          </button>
        </div>
      </div>

      {/* Descriptor schema manager */}
      {showDescriptorSchema && (
        <div className="mb-6 bg-white rounded-xl border border-warm-100 card-shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-warm-700">Descriptor Fields</h3>
            <button onClick={() => setShowDescriptorSchema(false)} className="text-warm-400 hover:text-warm-600">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-warm-500 mb-3">
            Define structured metadata fields for transcripts (e.g., Institution Type, Region, Grant Program).
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {descriptorSchema.map(key => (
              <span key={key} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-warm-100 text-warm-700 text-xs font-medium">
                {key}
                <button
                  onClick={() => dispatch({ type: 'schema/removeDescriptorKey', payload: { key } })}
                  className="ml-0.5 hover:text-rose-500"
                >&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newDescriptorKey}
              onChange={e => setNewDescriptorKey(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newDescriptorKey.trim()) {
                  dispatch({ type: 'schema/addDescriptorKey', payload: { key: newDescriptorKey.trim() } });
                  setNewDescriptorKey('');
                }
              }}
              placeholder="New field name..."
              className="flex-1 text-sm border border-warm-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={() => {
                if (newDescriptorKey.trim()) {
                  dispatch({ type: 'schema/addDescriptorKey', payload: { key: newDescriptorKey.trim() } });
                  setNewDescriptorKey('');
                }
              }}
              disabled={!newDescriptorKey.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Codebook templates */}
      {showTemplates && (
        <div className="mb-6 bg-white rounded-xl border border-warm-100 card-shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-warm-700">Codebook Templates</h3>
            <button onClick={() => setShowTemplates(false)} className="text-warm-400 hover:text-warm-600">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-warm-500 mb-3">
            Save the current codebook as a template to reuse across projects, or apply an existing template.
          </p>

          {/* Save current */}
          <div className="flex gap-2 mb-4">
            <input
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && templateName.trim() && allCodes.length > 0) {
                  dispatch({ type: 'template/save', payload: { name: templateName.trim() } });
                  setTemplateName('');
                }
              }}
              placeholder="Template name..."
              className="flex-1 text-sm border border-warm-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={() => {
                if (templateName.trim() && allCodes.length > 0) {
                  dispatch({ type: 'template/save', payload: { name: templateName.trim() } });
                  setTemplateName('');
                }
              }}
              disabled={!templateName.trim() || allCodes.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <Save size={14} />
              Save Current
            </button>
          </div>

          {/* List templates */}
          {templates.length === 0 ? (
            <p className="text-xs text-warm-400 italic">No templates saved yet.</p>
          ) : (
            <div className="space-y-2">
              {templates.map(t => (
                <div key={t.id} className="flex items-center justify-between border border-warm-100 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-warm-700">{t.name}</span>
                    <span className="text-xs text-warm-400 ml-2">{t.codes.length} codes</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm(`Apply "${t.name}"? This will add its codes to your current codebook.`)) {
                          dispatch({ type: 'template/apply', payload: { templateId: t.id } });
                        }
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'template/delete', payload: { id: t.id } })}
                      className="text-xs text-warm-400 hover:text-rose-500 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-xl border border-warm-100 card-shadow p-4">
          <CodeTree
            nodes={tree}
            selectedId={editingId}
            onSelect={startEdit}
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        </div>

        {(showCreate || editingId) && (
          <div className="w-72 bg-white rounded-xl border border-warm-100 card-shadow p-5 h-fit sticky top-8">
            <h3 className="text-sm font-semibold text-warm-700 mb-4">
              {editingId ? 'Edit Code' : 'New Code'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1">Name</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                  placeholder="Code name"
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {CODE_COLORS.map(c => {
                    const cc = colorClasses(c);
                    return (
                      <button
                        key={c}
                        onClick={() => setFormColor(c)}
                        className={`w-7 h-7 rounded-full ${cc.dot} transition-all ${
                          formColor === c ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : 'hover:scale-110'
                        }`}
                        title={c}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1">Parent</label>
                <select
                  value={formParent ?? ''}
                  onChange={e => setFormParent(e.target.value || null)}
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
                >
                  <option value="">-- None (root) --</option>
                  {parentOptions.map(c => (
                    <option key={c.id} value={c.id}>{buildLabel(c.id)}</option>
                  ))}
                </select>
              </div>

              {editingCode && (
                <div>
                  <label className="block text-xs font-medium text-warm-500 mb-1">Memo</label>
                  <MemoEditor
                    value={editingCode.memo}
                    onChange={memo => dispatch({ type: 'code/update', payload: { id: editingCode.id, patch: { memo } } })}
                    placeholder="Notes about this code..."
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={!formName.trim()}
                  className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors btn-press"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => { setEditingId(null); setShowCreate(false); }}
                  className="px-4 py-2 text-sm text-warm-500 hover:text-warm-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
