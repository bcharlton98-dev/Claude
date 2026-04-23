import { useState } from 'react';
import { Plus } from 'lucide-react';
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

  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState<CodeColorKey>('forest');
  const [formParent, setFormParent] = useState<ID | null>(null);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">Codebook</h1>
          <p className="text-sm text-warm-500 mt-1">{allCodes.length} code{allCodes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-forest-500 text-white text-sm font-medium rounded-lg hover:bg-forest-600 transition-colors btn-press"
        >
          <Plus size={16} />
          New Code
        </button>
      </div>

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
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400"
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
                          formColor === c ? 'ring-2 ring-offset-2 ring-forest-400 scale-110' : 'hover:scale-110'
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
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400 bg-white"
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
                  className="flex-1 py-2 bg-forest-500 text-white text-sm font-medium rounded-lg hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors btn-press"
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
