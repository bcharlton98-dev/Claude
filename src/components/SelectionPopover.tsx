import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import CodePicker from './CodePicker';
import { useDispatch } from '../store/AppStore';
import type { ID } from '../types';

interface Props {
  transcriptId: ID;
  start: number;
  end: number;
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function SelectionPopover({ transcriptId, start, end, selectedText, position, onClose }: Props) {
  const dispatch = useDispatch();
  const [selectedCodes, setSelectedCodes] = useState<ID[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  function handleToggle(codeId: ID) {
    setSelectedCodes(prev =>
      prev.includes(codeId) ? prev.filter(id => id !== codeId) : [...prev, codeId],
    );
  }

  function handleCreate() {
    if (selectedCodes.length === 0) return;
    dispatch({
      type: 'excerpt/create',
      payload: { transcriptId, start, end, codeIds: selectedCodes },
    });
    onClose();
  }

  const left = Math.min(position.x, window.innerWidth - 300);
  const top = Math.min(position.y + 8, window.innerHeight - 350);

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-xl shadow-lg border border-warm-200 w-72 card-elevated"
      style={{ left, top }}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-warm-100">
        <h3 className="text-sm font-semibold text-warm-800">Code Selection</h3>
        <button onClick={onClose} className="text-warm-400 hover:text-warm-600" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-warm-500 mb-2 line-clamp-2">
          "{selectedText.length > 80 ? selectedText.slice(0, 80) + '...' : selectedText}"
        </p>
        <CodePicker selectedIds={selectedCodes} onToggle={handleToggle} />
      </div>

      <div className="px-4 py-3 border-t border-warm-100">
        <button
          onClick={handleCreate}
          disabled={selectedCodes.length === 0}
          className="w-full py-2 px-4 bg-forest-500 text-white text-sm font-medium rounded-lg hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors btn-press"
        >
          Apply {selectedCodes.length > 0 ? `(${selectedCodes.length})` : ''}
        </button>
      </div>
    </div>
  );
}
