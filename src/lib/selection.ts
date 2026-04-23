export interface SelectionRange {
  start: number;
  end: number;
  text: string;
}

export function getSelectionOffsets(containerEl: HTMLElement): SelectionRange | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);
  if (!containerEl.contains(range.commonAncestorContainer)) return null;

  const start = getAbsoluteOffset(range.startContainer, range.startOffset);
  const end = getAbsoluteOffset(range.endContainer, range.endOffset);

  if (start === null || end === null || start === end) return null;

  const lo = Math.min(start, end);
  const hi = Math.max(start, end);

  return { start: lo, end: hi, text: sel.toString() };
}

function getAbsoluteOffset(node: Node, offset: number): number | null {
  const span = node.nodeType === Node.TEXT_NODE
    ? node.parentElement
    : node as HTMLElement;

  if (!span) return null;

  const target = span.closest('[data-start]');
  if (!target) return null;

  const segStart = parseInt(target.getAttribute('data-start')!, 10);

  if (node.nodeType === Node.TEXT_NODE) {
    return segStart + offset;
  }

  let charOffset = 0;
  for (let i = 0; i < offset; i++) {
    const child = node.childNodes[i];
    charOffset += (child.textContent || '').length;
  }
  return segStart + charOffset;
}
