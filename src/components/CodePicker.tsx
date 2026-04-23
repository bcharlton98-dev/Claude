import { useCodesTree, type CodeTreeNode } from '../store/selectors';
import { colorClasses } from '../lib/codeColors';
import type { ID } from '../types';

interface Props {
  selectedIds: ID[];
  onToggle: (codeId: ID) => void;
}

export default function CodePicker({ selectedIds, onToggle }: Props) {
  const tree = useCodesTree();

  if (tree.length === 0) {
    return <p className="text-sm text-warm-400 italic py-2">No codes yet. Create some in the Codebook.</p>;
  }

  return (
    <div className="space-y-0.5 max-h-60 overflow-y-auto">
      {tree.map(node => (
        <CodePickerNode key={node.code.id} node={node} depth={0} selectedIds={selectedIds} onToggle={onToggle} />
      ))}
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
