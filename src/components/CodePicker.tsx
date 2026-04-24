import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCodesTree, type CodeTreeNode } from '../store/selectors';
import { useDispatch } from '../store/AppStore';
import { colorClasses } from '../lib/codeColors';
import { CODE_COLORS, type ID, type CodeColorKey } from '../types';

interface Props {
  selectedIds: ID[];
  onToggle: (codeId: ID) => void;
}

export default function CodePicker({ selectedIds, onToggle }: Props) {
  const tree = useCodesTree();
  const dispatch = useDispatch();
  const [newCodeName, setNewCodeName] = useState('');
  const [showInput, setShowInput] = useState(false);

  function handleCreateCode() {
    const name = newCodeName.trim();
    if (!name) return;
    const colorIndex = Object.keys(tree).length % CODE_COLORS.length;
    const color: CodeColorKey = CODE_COLORS[colorIndex];
    dispatch({ type: 'code/create', payload: { name, color, parentId: null } });
    setNewCodeName('');
    setShowInput(false);
  }

  return (
    <div>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {tree.length === 0 && !showInput && (
          <p className="text-xs text-warm-400 italic py-1">No codes yet.</p>
        )}
        {tree.map(node => (
          <CodePickerNode key={node.code.id} node={node} depth={0} selectedIds={selectedIds} onToggle={onToggle} />
        ))}
      </div>
      {showInput ? (
        <div className="flex gap-1.5 mt-2">
          <input
            value={newCodeName}
            onChange={e => setNewCodeName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateCode();
              if (e.key === 'Escape') { setShowInput(false); setNewCodeName(''); }
            }}
            placeholder="New code name..."
            className="flex-1 text-xs border border-warm-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest-300"
            autoFocus
          />
          <button
            onClick={handleCreateCode}
            disabled={!newCodeName.trim()}
            className="px-2 py-1.5 bg-forest-500 text-white text-xs rounded-lg hover:bg-forest-600 disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-1 mt-2 text-xs text-forest-600 hover:text-forest-700 font-medium"
        >
          <Plus size={12} />
          Create new code
        </button>
      )}
    </div>
  );
}

function CodePickerNode({
  node,
  depth,
  selectedIds,
  onToggle,
}: {
  node: CodeTreeNode;
  depth: number;
  selectedIds: ID[];
  onToggle: (codeId: ID) => void;
}) {
  const cc = colorClasses(node.code.color);
  const checked = selectedIds.includes(node.code.id);

  return (
    <>
      <label
        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-warm-100 cursor-pointer text-sm"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(node.code.id)}
          className="accent-forest-500"
        />
        <span className={`w-3 h-3 rounded-full ${cc.dot} shrink-0`} />
        <span className="text-warm-800">{node.code.name}</span>
      </label>
      {node.children.map(child => (
        <CodePickerNode
          key={child.code.id}
          node={child}
          depth={depth + 1}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}
