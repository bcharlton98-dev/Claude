import { X } from 'lucide-react';
import CodeBadge from './CodeBadge';
import CodePicker from './CodePicker';
import MemoEditor from './MemoEditor';
import { useDispatch, useAppState } from '../store/AppStore';
import type { Excerpt } from '../types';
import { useState } from 'react';

interface Props {
  excerpt: Excerpt;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ExcerptPopover({ excerpt, position, onClose }: Props) {
  const dispatch = useDispatch();
  const state = useAppState();
  const [showPicker, setShowPicker] = useState(false);

  function handleRemoveCode(codeId: string) {
    dispatch({ type: 'excerpt/removeCode', payload: { id: excerpt.id, codeId } });
  }

  function handleToggleCode(codeId: string) {
    if (excerpt.codeIds.includes(codeId)) {
      dispatch({ type: 'excerpt/removeCode', payload: { id: excerpt.id, codeId } });
    } else {
      dispatch({ type: 'excerpt/addCode', payload: { id: excerpt.id, codeId } });
    }
  }

  function handleDelete() {
    dispatch({ type: 'excerpt/delete', payload: { id: excerpt.id } });
    onClose();
  }

  const currentExcerpt = state.excerpts[excerpt.id];
  if (!currentExcerpt) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-lg border border-warm-200 w-80 card-elevated"
      style={{ left: Math.min(position.x, window.innerWidth - 340), top: position.y + 8 }}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-warm-100">
        <h3 className="text-sm font-semibold text-warm-800">Excerpt</h3>
        <button onClick={onClose} className="text-warm-400 hover:text-warm-600">
          <X size={16} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div>
          <p className="text-xs font-medium text-warm-500 mb-1.5">Applied Codes</p>
          <div className="flex flex-wrap gap-1.5">
            {currentExcerpt.codeIds.map(codeId => {
              const code = state.codes[codeId];
              if (!code) return null;
              return (
                <CodeBadge
                  key={codeId}
                  code={code}
                  onRemove={() => handleRemoveCode(codeId)}
                />
              );
            })}
          </div>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="text-xs text-forest-600 hover:text-forest-700 mt-2 font-medium"
          >
            {showPicker ? 'Hide codes' : '+ Add/remove codes'}
          </button>
        </div>

        {showPicker && (
          <div className="border border-warm-100 rounded-lg p-2">
            <CodePicker selectedIds={currentExcerpt.codeIds} onToggle={handleToggleCode} />
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-warm-500 mb-1.5">Memo</p>
          <MemoEditor
            value={currentExcerpt.memo}
            onChange={(memo) => dispatch({ type: 'excerpt/setMemo', payload: { id: excerpt.id, memo } })}
            placeholder="Add a memo to this excerpt..."
          />
        </div>

        <button
          onClick={handleDelete}
          className="text-xs text-rose-500 hover:text-rose-500/80 font-medium"
        >
          Delete excerpt
        </button>
      </div>
    </div>
  );
}
