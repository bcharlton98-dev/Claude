import { useRef, useState, useCallback, useEffect } from 'react';
import type { Excerpt, ID } from '../types';
import { buildSegments } from '../lib/segments';
import { getSelectionOffsets } from '../lib/selection';
import { rawColor } from '../lib/codeColors';
import { useAppState } from '../store/AppStore';
import SelectionPopover from './SelectionPopover';
import ExcerptPopover from './ExcerptPopover';

interface Props {
  transcriptId: ID;
  text: string;
  excerpts: Excerpt[];
  focusExcerptId?: string | null;
}

export default function TranscriptReader({ transcriptId, text, excerpts, focusExcerptId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const state = useAppState();

  const [selectionPopover, setSelectionPopover] = useState<{
    start: number;
    end: number;
    text: string;
    position: { x: number; y: number };
  } | null>(null);

  const [excerptPopover, setExcerptPopover] = useState<{
    excerpt: Excerpt;
    position: { x: number; y: number };
  } | null>(null);

  const segments = buildSegments(text.length, excerpts);

  useEffect(() => {
    if (!focusExcerptId) return;
    const el = containerRef.current?.querySelector(`[data-excerpt-id="${focusExcerptId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-ember-400', 'ring-offset-1');
      const timer = setTimeout(() => el.classList.remove('ring-2', 'ring-ember-400', 'ring-offset-1'), 2000);
      return () => clearTimeout(timer);
    }
  }, [focusExcerptId, transcriptId]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    setTimeout(() => {
      const result = getSelectionOffsets(containerRef.current!);
      if (result && result.end - result.start > 0) {
        setExcerptPopover(null);
        setSelectionPopover({
          start: result.start,
          end: result.end,
          text: result.text,
          position: { x: e.clientX, y: e.clientY },
        });
      }
    }, 10);
  }, []);

  function handleSegmentClick(excerptIds: string[], e: React.MouseEvent) {
    if (excerptIds.length === 0) return;

    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;

    const excerpt = state.excerpts[excerptIds[0]];
    if (!excerpt) return;

    setSelectionPopover(null);
    setExcerptPopover({
      excerpt,
      position: { x: e.clientX, y: e.clientY },
    });
  }

  function getSegmentStyle(excerptIds: string[]): React.CSSProperties {
    if (excerptIds.length === 0) return {};

    const allCodeIds = new Set<string>();
    for (const eid of excerptIds) {
      const ex = state.excerpts[eid];
      if (ex) ex.codeIds.forEach(cid => allCodeIds.add(cid));
    }

    const codeIds = Array.from(allCodeIds);
    if (codeIds.length === 0) return {};

    const firstCode = state.codes[codeIds[0]];
    if (!firstCode) return {};

    const bgColor = rawColor(firstCode.color) + '22';
    const shadows = codeIds.map((cid, i) => {
      const code = state.codes[cid];
      if (!code) return '';
      return `inset 0 -${2 + i * 2}px 0 0 ${rawColor(code.color)}`;
    }).filter(Boolean);

    return {
      backgroundColor: bgColor,
      boxShadow: shadows.join(', '),
      borderRadius: '2px',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
    };
  }

  const firstExcerptIdForSegment = (excerptIds: string[]): string | undefined => {
    return excerptIds[0];
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="text-sm leading-7 text-warm-700 whitespace-pre-wrap font-[inherit] select-text"
        onMouseUp={handleMouseUp}
      >
        {segments.map((seg) => {
          const segText = text.slice(seg.start, seg.end);
          const isHighlighted = seg.excerptIds.length > 0;

          return (
            <span
              key={seg.start}
              data-start={seg.start}
              data-excerpt-id={firstExcerptIdForSegment(seg.excerptIds)}
              style={isHighlighted ? getSegmentStyle(seg.excerptIds) : undefined}
              className={isHighlighted ? 'hover:brightness-95 transition-all' : undefined}
              onClick={isHighlighted ? (e) => handleSegmentClick(seg.excerptIds, e) : undefined}
            >
              {segText}
            </span>
          );
        })}
      </div>

      {selectionPopover && (
        <SelectionPopover
          transcriptId={transcriptId}
          start={selectionPopover.start}
          end={selectionPopover.end}
          selectedText={selectionPopover.text}
          position={selectionPopover.position}
          onClose={() => {
            setSelectionPopover(null);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}

      {excerptPopover && (
        <ExcerptPopover
          excerpt={excerptPopover.excerpt}
          position={excerptPopover.position}
          onClose={() => setExcerptPopover(null)}
        />
      )}
    </div>
  );
}
