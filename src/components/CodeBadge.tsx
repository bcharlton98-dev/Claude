import type { Code } from '../types';
import { colorClasses } from '../lib/codeColors';

interface Props {
  code: Code;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export default function CodeBadge({ code, onRemove, size = 'sm' }: Props) {
  const cc = colorClasses(code.color);
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${cc.bg} ${cc.text} ${sizeClasses}`}>
      {code.name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:opacity-70 cursor-pointer"
          aria-label={`Remove ${code.name}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
