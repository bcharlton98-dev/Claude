import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { CodeTreeNode } from '../store/selectors';
import { useExcerptCountForCode } from '../store/selectors';
import { colorClasses } from '../lib/codeColors';

interface Props {
  nodes: CodeTreeNode[];
  onSelect?: (codeId: string) => void;
  selectedId?: string | null;
  onEdit?: (codeId: string) => void;
  onDelete?: (codeId: string) => void;
}

export default function CodeTree({ nodes, onSelect, selectedId, onEdit, onDelete }: Props) {
  if (nodes.length === 0) {
    return <p className="text-sm text-warm-400 italic py-4 px-4">No codes yet.</p>;
  }

  return (
    <ul className="space-y-0.5">
      {nodes.map(node => (
        <CodeTreeItem
          key={node.code.id}
          node={node}
          depth={0}
          onSelect={onSelect}
          selectedId={selectedId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function CodeTreeItem({
  node,
  depth,
  onSelect,
  selectedId,
  onEdit,
  onDelete,
}: {
  node: CodeTreeNode;
  depth: number;
  onSelect?: (codeId: string) => void;
  selectedId?: string | null;
  onEdit?: (codeId: string) => void;
  onDelete?: (codeId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const count = useExcerptCountForCode(node.code.id);
  const cc = colorClasses(node.code.color);
  const isSelected = selectedId === node.code.id;
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors group ${
          isSelected ? 'bg-forest-100 text-forest-700' : 'hover:bg-warm-100 text-warm-700'
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => onSelect?.(node.code.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-0.5 hover:bg-warm-200 rounded shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span className={`w-3 h-3 rounded-full ${cc.dot} shrink-0`} />
        <span className="flex-1 font-medium truncate">{node.code.name}</span>
        <span className="text-xs text-warm-400 tabular-nums">{count}</span>

        {(onEdit || onDelete) && (
          <span className="opacity-0 group-hover:opacity-100 flex gap-1 ml-1">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(node.code.id); }}
                className="text-xs text-warm-500 hover:text-forest-600 px-1"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(node.code.id); }}
                className="text-xs text-warm-500 hover:text-rose-500 px-1"
              >
                Del
              </button>
            )}
          </span>
        )}
      </div>

      {hasChildren && expanded && (
        <ul>
          {node.children.map(child => (
            <CodeTreeItem
              key={child.code.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
