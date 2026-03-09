import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Page, PageType } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { useBlocksStore, PAGE_TYPE_LABELS as BLOCK_TYPE_LABELS } from '../../lib/store/blocksStore';

const PAGE_TYPE_LABELS: Record<string, string> = {
  cover: 'Cover',
  'value-proposition': 'Value Prop',
  diagram: 'Diagram',
  index: 'Index',
  'section-divider': 'Section',
  'long-form-text': 'Text (2-col)',
  'timeline-image': 'Timeline',
  'text-chart': 'Text + Chart',
  'multi-card-grid': 'Card Grid',
  'map-text': 'Map + Text',
  'text-images': 'Text + Images',
  'before-after': 'Before/After',
  'photo-gallery': 'Gallery',
  'data-table': 'Data Table',
  'comparison-table': 'Comparison',
  'three-circles': 'Three Circles',
  'text-news': 'News',
  'flow-chart': 'Flow Chart',
  disclaimer: 'Disclaimer',
  contact: 'Contact',
  'partner-profile': 'Partner Profile',
  'logos-text-table': 'Logos+Table',
};

const ADD_PAGE_OPTIONS: { type: PageType; label: string }[] = [
  { type: 'cover', label: 'Cover' },
  { type: 'value-proposition', label: 'Value Proposition' },
  { type: 'diagram', label: 'Diagram / Branching' },
  { type: 'index', label: 'Index / TOC' },
  { type: 'section-divider', label: 'Section Divider' },
  { type: 'timeline-image', label: 'Timeline + Image' },
  { type: 'multi-card-grid', label: 'Multi-Card Grid' },
  { type: 'text-chart', label: 'Text + Chart' },
  { type: 'data-table', label: 'Data Table' },
  { type: 'comparison-table', label: 'Comparison Table' },
  { type: 'text-images', label: 'Text + Images' },
  { type: 'before-after', label: 'Before/After Grid' },
  { type: 'map-text', label: 'Map + Text' },
  { type: 'three-circles', label: 'Three Circles' },
  { type: 'flow-chart', label: 'Flow Chart / Org Structure' },
  { type: 'disclaimer', label: 'Disclaimer' },
  { type: 'contact', label: 'Contact / Closing' },
  { type: 'partner-profile', label: 'Partner Profile' },
  { type: 'logos-text-table', label: 'Logos + Text + Table' },
  { type: 'photo-gallery', label: 'Photo Gallery' },
];

// ── Block picker modal ─────────────────────────────────────────────────────────

function BlockPickerModal({ onSelect, onClose }: {
  onSelect: (blockId: string) => void;
  onClose: () => void;
}) {
  const blocks = useBlocksStore((s) => s.blocks);

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #C8C8C8',
          borderRadius: 10,
          width: 400,
          maxWidth: '90vw',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid #C8C8C8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>Add from block library</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 16, color: '#787878', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {blocks.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>No blocks saved yet</p>
              <p style={{ margin: 0, fontSize: 12, color: '#787878' }}>
                Create reusable blocks in the{' '}
                <a href="#/blocks" style={{ color: '#FBB931', textDecoration: 'none', fontWeight: 600 }}>Blocks library</a>.
              </p>
            </div>
          ) : (
            blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => onSelect(block.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F2F2F2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{block.name}</div>
                  <div style={{ fontSize: 11, color: '#787878', marginTop: 2 }}>{BLOCK_TYPE_LABELS[block.type]}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#5E5E5E',
                  background: '#E8E8E8', border: '1px solid #C8C8C8',
                  padding: '2px 6px', borderRadius: 4,
                }}>
                  {block.usedIn.length} use{block.usedIn.length !== 1 ? 's' : ''}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── PageList ───────────────────────────────────────────────────────────────────

export default function PageList() {
  const pages = usePresentationStore((s) => s.presentation.pages);
  const presentationId = usePresentationStore((s) => s.presentation.id);
  const selectedPageId = usePresentationStore((s) => s.selectedPageId);
  const selectPage = usePresentationStore((s) => s.selectPage);
  const addPage = usePresentationStore((s) => s.addPage);
  const addPageFromBlock = usePresentationStore((s) => s.addPageFromBlock);
  const deletePage = usePresentationStore((s) => s.deletePage);
  const reorderPage = usePresentationStore((s) => s.reorderPage);
  const movePage = usePresentationStore((s) => s.movePage);

  const { blocks, addUsage, removeUsage } = useBlocksStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const openMenu = () => {
    if (addBtnRef.current) {
      const rect = addBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          addBtnRef.current && !addBtnRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const handleSelectBlock = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    addPageFromBlock(block);
    addUsage(blockId, presentationId);
    setShowBlockPicker(false);
  };

  const handleDeletePage = (page: Page) => {
    if (!window.confirm(`Delete page ${page.order + 1} (${PAGE_TYPE_LABELS[page.type] || page.type})?`)) return;

    // If this is the last page linked to a block, remove usage
    if (page.reusableBlockId) {
      const otherLinked = pages.filter((p) => p.id !== page.id && p.reusableBlockId === page.reusableBlockId);
      if (otherLinked.length === 0) {
        removeUsage(page.reusableBlockId, presentationId);
      }
    }
    deletePage(page.id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-[#E5E5E5] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">Pages</h3>
        <button
          ref={addBtnRef}
          onClick={openMenu}
          className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors"
          style={{ background: '#FBB931', color: '#1A1A1A' }}
          title="Add page"
        >
          +
        </button>

        {showMenu && createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              zIndex: 9999,
              background: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '4px 0',
              overflowY: 'auto',
              minWidth: 180,
              maxHeight: 'calc(100vh - 100px)',
              top: menuPos.top,
              left: menuPos.left,
            }}
          >
            {ADD_PAGE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => { addPage(opt.type); setShowMenu(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '6px 12px', fontSize: 12, color: '#1A1A1A',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F2F2F2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {opt.label}
              </button>
            ))}

            {/* Divider + block library option */}
            <div style={{ borderTop: '1px solid #E5E5E5', margin: '4px 0' }} />
            <button
              onClick={() => { setShowMenu(false); setShowBlockPicker(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', textAlign: 'left',
                padding: '6px 12px', fontSize: 12, color: '#FBB931', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FFFBEF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              <span>⬡</span>
              From block library
            </button>
          </div>,
          document.body
        )}
      </div>

      {showBlockPicker && (
        <BlockPickerModal
          onSelect={handleSelectBlock}
          onClose={() => setShowBlockPicker(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {pages.map((page: Page) => {
          const isSelected = page.id === selectedPageId;
          const isDragged = page.id === draggedId;
          const isDragOver = page.id === dragOverId && draggedId !== page.id;
          const isLinkedToBlock = !!page.reusableBlockId;

          return (
            <div
              key={page.id}
              draggable
              onDragStart={(e) => {
                setDraggedId(page.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragEnter={() => { dragCounter.current++; setDragOverId(page.id); }}
              onDragLeave={() => { dragCounter.current--; if (dragCounter.current === 0) setDragOverId(null); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                dragCounter.current = 0;
                if (draggedId && draggedId !== page.id) movePage(draggedId, page.order);
                setDraggedId(null); setDragOverId(null);
              }}
              onDragEnd={() => { dragCounter.current = 0; setDraggedId(null); setDragOverId(null); }}
              onClick={() => selectPage(page.id)}
              className="w-full text-left px-3 py-2 transition-colors"
              style={{
                background: isSelected ? '#FBB93122' : 'transparent',
                borderLeft: isSelected ? '3px solid #FBB931' : '3px solid transparent',
                opacity: isDragged ? 0.4 : 1,
                borderTop: isDragOver ? '2px solid #FBB931' : '2px solid transparent',
                cursor: isDragged ? 'grabbing' : 'grab',
              }}
            >
              {/* Thumbnail */}
              <div
                className="w-full rounded border mb-1.5"
                style={{
                  aspectRatio: '16/9',
                  background: isSelected ? '#FBB93111' : '#E8E8E8',
                  borderColor: isLinkedToBlock ? '#FBB931' : (isSelected ? '#FBB931' : '#E5E5E5'),
                  position: 'relative',
                }}
              >
                {isLinkedToBlock && (
                  <span style={{
                    position: 'absolute', top: 3, right: 4,
                    fontSize: 9, fontWeight: 700,
                    color: '#FBB931', letterSpacing: '0.04em',
                  }}>
                    BLOCK
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {page.order + 1}. {PAGE_TYPE_LABELS[page.type] || page.type}
                  {isLinkedToBlock && (
                    <span style={{ fontSize: 9, color: '#FBB931', fontWeight: 700 }}>⬡</span>
                  )}
                </span>
                <span className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => reorderPage(page.id, 'up')}
                    disabled={page.order === 0}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors hover:bg-[#E5E5E5] disabled:opacity-25 disabled:pointer-events-none"
                    style={{ color: '#333' }}
                    title="Move up"
                  >▲</button>
                  <button
                    onClick={() => reorderPage(page.id, 'down')}
                    disabled={page.order === pages.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors hover:bg-[#E5E5E5] disabled:opacity-25 disabled:pointer-events-none"
                    style={{ color: '#333' }}
                    title="Move down"
                  >▼</button>
                  <button
                    onClick={() => handleDeletePage(page)}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors hover:bg-red-100"
                    style={{ color: '#999' }}
                    title="Delete page"
                  >✕</button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
