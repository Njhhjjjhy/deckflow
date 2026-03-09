import { useEffect, useState, useCallback, useRef } from 'react';

interface DraggableElement {
  id: string;
  label: string;
  selector: string;
  origX: number;
  origY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  color: string;
}

interface DebugOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const COLORS = [
  '#E74C3C', '#2980B9', '#27AE60', '#8E44AD', '#E67E22',
  '#1ABC9C', '#C0392B', '#2C3E50', '#D4AC0D', '#7D3C98',
];

/** Auto-discover all elements with a BEM-style class (e.g. cover-page__*) */
function discoverItems(container: HTMLElement): { selector: string; label: string; color: string }[] {
  const seen = new Set<string>();
  const items: { selector: string; label: string; color: string }[] = [];
  const allElements = container.querySelectorAll('[class]');

  for (const el of allElements) {
    for (const cls of el.classList) {
      // Match BEM element classes like "cover-page__header", "cover-page__logo"
      const match = cls.match(/^([a-z-]+)__([a-z-]+)$/);
      if (match) {
        const selector = `.${cls}`;
        if (seen.has(selector)) continue;
        seen.add(selector);
        // Turn "cover-page__header" into "Header", "hero--placeholder" stays as parent
        const label = match[2]
          .replace(/--.*$/, '') // strip modifier
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        items.push({ selector, label, color: COLORS[items.length % COLORS.length] });
      }
    }
  }
  return items;
}

export default function DebugOverlay({ containerRef }: DebugOverlayProps) {
  const [elements, setElements] = useState<DraggableElement[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState({ w: 960, h: 540 });
  const dragStart = useRef<{ mouseX: number; mouseY: number; startOffsetX: number; startOffsetY: number } | null>(null);

  // Content area: between header bottom and page number top
  const HEADER_H = 57;
  const PAGE_NUM_H = 16;

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    setPageSize({ w: Math.round(cRect.width), h: Math.round(cRect.height) });

    const discovered = discoverItems(container);

    setElements(prev => {
      const next: DraggableElement[] = [];
      for (const item of discovered) {
        const el = container.querySelector(item.selector);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const existing = prev.find(p => p.id === item.selector);
        next.push({
          id: item.selector,
          label: item.label,
          selector: item.selector,
          origX: Math.round(r.left - cRect.left),
          origY: Math.round(r.top - cRect.top),
          offsetX: existing?.offsetX ?? 0,
          offsetY: existing?.offsetY ?? 0,
          width: Math.round(r.width),
          height: Math.round(r.height),
          color: item.color,
        });
      }
      return next;
    });
  }, [containerRef]);

  useEffect(() => {
    measure();
    const t = setTimeout(measure, 300);
    return () => clearTimeout(t);
  }, [measure]);

  // Drag handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!activeId || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setElements(prev =>
        prev.map(el =>
          el.id === activeId
            ? { ...el, offsetX: dragStart.current!.startOffsetX + dx, offsetY: dragStart.current!.startOffsetY + dy }
            : el
        )
      );
    };
    const onUp = () => {
      setActiveId(null);
      dragStart.current = null;
    };
    if (activeId) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [activeId]);

  const onMouseDown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = elements.find(x => x.id === id);
    if (!el) return;
    setActiveId(id);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, startOffsetX: el.offsetX, startOffsetY: el.offsetY };
  };

  const resetAll = () => {
    setElements(prev => prev.map(el => ({ ...el, offsetX: 0, offsetY: 0 })));
  };

  const copyPositions = () => {
    const lines = elements.map(el => {
      const finalX = el.origX + el.offsetX;
      const finalY = el.origY + el.offsetY;
      const centerX = finalX + el.width / 2;
      const centerY = finalY + el.height / 2;
      return `${el.label}: left=${finalX}px, top=${finalY}px, center=(${Math.round(centerX)}, ${Math.round(centerY)})`;
    });
    navigator.clipboard.writeText(lines.join('\n'));
  };

  const pageCenterX = pageSize.w / 2;
  const contentCenterY = HEADER_H + (pageSize.h - HEADER_H - PAGE_NUM_H) / 2;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: pageSize.w,
        height: pageSize.h,
        zIndex: 9999,
      }}
    >
      {/* Vertical center line (full page) */}
      <div style={{ position: 'absolute', left: pageCenterX, top: 0, width: 0, height: pageSize.h, borderLeft: '1px dashed rgba(0,200,0,0.5)', pointerEvents: 'none' }} />
      {/* Horizontal center line (content area, below header) */}
      <div style={{ position: 'absolute', top: contentCenterY, left: 0, width: pageSize.w, height: 0, borderTop: '1px dashed rgba(0,200,0,0.5)', pointerEvents: 'none' }} />
      {/* Center label */}
      <div style={{ position: 'absolute', left: pageCenterX + 6, top: contentCenterY + 4, fontSize: 10, fontFamily: 'monospace', color: 'rgba(0,160,0,0.7)', background: 'rgba(255,255,255,0.85)', padding: '1px 4px', borderRadius: 2, pointerEvents: 'none' }}>
        center ({Math.round(pageCenterX)}, {Math.round(contentCenterY)})
      </div>

      {/* Draggable elements */}
      {elements.map(el => {
        const finalX = el.origX + el.offsetX;
        const finalY = el.origY + el.offsetY;
        const centerX = Math.round(finalX + el.width / 2);
        const centerY = Math.round(finalY + el.height / 2);
        const isActive = el.id === activeId;
        const hasMoved = el.offsetX !== 0 || el.offsetY !== 0;

        return (
          <div key={el.id}>
            {/* Draggable hit area */}
            <div
              onMouseDown={e => onMouseDown(el.id, e)}
              style={{
                position: 'absolute',
                left: finalX,
                top: finalY,
                width: el.width,
                height: el.height,
                border: `2px solid ${el.color}`,
                borderRadius: el.id.includes('hero') || el.id.includes('logo-icon') ? '50%' : 0,
                boxSizing: 'border-box',
                cursor: isActive ? 'grabbing' : 'grab',
                background: isActive ? `${el.color}11` : 'transparent',
              }}
            />
            {/* Center dot */}
            <div style={{ position: 'absolute', left: centerX - 4, top: centerY - 4, width: 8, height: 8, borderRadius: '50%', background: el.color, pointerEvents: 'none' }} />
            {/* Element center crosshairs */}
            <div style={{ position: 'absolute', left: centerX, top: finalY, width: 0, height: el.height, borderLeft: `1px dotted ${el.color}`, opacity: 0.4, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: centerY, left: finalX, width: el.width, height: 0, borderTop: `1px dotted ${el.color}`, opacity: 0.4, pointerEvents: 'none' }} />
            {/* Label */}
            <div
              style={{
                position: 'absolute',
                left: finalX,
                top: finalY - 18,
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#fff',
                background: el.color,
                padding: '2px 6px',
                borderRadius: 3,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {el.label} — center ({centerX}, {centerY}){hasMoved ? ` — moved ${el.offsetX > 0 ? '+' : ''}${el.offsetX}, ${el.offsetY > 0 ? '+' : ''}${el.offsetY}` : ''}
            </div>
          </div>
        );
      })}

      {/* Controls panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: '10px 14px',
          fontFamily: 'monospace',
          fontSize: 11,
          lineHeight: 1.8,
          pointerEvents: 'auto',
          minWidth: 220,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: '#1A1A1A' }}>Drag to reposition</div>
        <div style={{ color: 'rgba(0,160,0,0.8)', marginBottom: 6 }}>Page center: ({Math.round(pageCenterX)}, {Math.round(contentCenterY)})</div>
        {elements.map(el => {
          const finalX = el.origX + el.offsetX;
          const finalY = el.origY + el.offsetY;
          const centerX = Math.round(finalX + el.width / 2);
          const centerY = Math.round(finalY + el.height / 2);
          return (
            <div key={el.id} style={{ color: el.color }}>
              {el.label}: center ({centerX}, {centerY})
            </div>
          );
        })}
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <button onClick={resetAll} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 3, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}>Reset</button>
          <button onClick={copyPositions} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 3, border: '1px solid #ccc', background: '#1A1A1A', color: '#FBB931', cursor: 'pointer' }}>Copy positions</button>
        </div>
      </div>
    </div>
  );
}
