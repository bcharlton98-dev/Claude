import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
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

  const [excerptPopoverId, setExcerptPopoverId] = useState<string | null>(null);
  const [excerptPopoverPos, setExcerptPopoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const segments = useMemo(() => buildSegments(text.length, excerpts), [text.length, excerpts]);

  const segmentStyles = useMemo(() => {
    const styles = new Map<number, React.CSSProperties>();
    for (const seg of segments) {
      if (seg.excerptIds.length === 0) continue;

      const allCodeIds = new Set<string>();
      for (const eid of seg.excerptIds) {
        const ex = state.excerpts[eid];
        if (ex) ex.codeIds.forEach(cid => allCodeIds.add(cid));
      }

      const codeIds = Array.from(allCodeIds);
      if (codeIds.length === 0) continue;

      const firstCode = state.codes[codeIds[0]];
      if (!firstCode) continue;

      const bgColor = rawColor(firstCode.color) + '22';
      const shadows = codeIds.map((cid, i) => {
        const code = state.codes[cid];
        if (!code) return '';
        return `inset 0 -${2 + i * 2}px 0 0 ${rawColor(code.color)}`;
      }).filter(Boolean);

      styles.set(seg.start, {
        backgroundColor: bgColor,
        boxShadow: shadows.join(', '),
        borderRadius: '2px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      });
    }
    return styles;
  }, [segments, state.excerpts, state.codes]);

  useEffect(() => {
    if (!focusExcerptId || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-excerpt-ids*="${focusExcerptId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-ember-400', 'ring-offset-1');
      const timer = setTimeout(() => el.classList.remove('ring-2', 'ring-ember-400', 'ring-offset-1'), 2000);
      return () => clearTimeout(timer);
    }
  }, [focusExcerptId, transcriptId, excerpts]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const result = getSelectionOffsets(containerRef.current);
      if (result && result.end - result.start > 0) {
        setExcerptPopoverId(null);
        setSelectionPopover({
          start: result.start,
          end: result.end,
          text: result.text,
          position: { x: clientX, y: clientY },
        });
      }
    });
  }, []);

  function handleSegmentClick(excerptIds: string[], e: React.MouseEvent) {
    if (excerptIds.length === 0) return;

    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;

    const excerpt = state.excerpts[excerptIds[0]];
    if (!excerpt) return;

    setSelectionPopover(null);
    setExcerptPopoverId(excerpt.id);
    setExcerptPopoverPos({ x: e.clientX, y: e.clientY });
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="text-[16px] leading-[1.9] text-slate-700 whitespace-pre-wrap font-reading select-text"
        onMouseUp={handleMouseUp}
      >
        {segments.map((seg) => {
          const segText = text.slice(seg.start, seg.end);
          const isHighlighted = seg.excerptIds.length > 0;

          return (
            <span
              key={seg.start}
              data-start={seg.start}
              data-excerpt-ids={isHighlighted ? seg.excerptIds.join(',') : undefined}
              style={isHighlighted ? segmentStyles.get(seg.start) : undefined}
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

      {excerptPopoverId && (
        <ExcerptPopover
          excerptId={excerptPopoverId}
          position={excerptPopoverPos}
          onClose={() => setExcerptPopoverId(null)}
        />
      )}
    </div>
  );
}
