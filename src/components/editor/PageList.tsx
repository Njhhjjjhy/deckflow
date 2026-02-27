import { useState } from 'react';
import type { Page, PageType } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';

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
};

const ADD_PAGE_OPTIONS: { type: PageType; label: string }[] = [
  { type: 'cover', label: 'Cover' },
  { type: 'section-divider', label: 'Section Divider' },
];

export default function PageList() {
  const pages = usePresentationStore((s) => s.presentation.pages);
  const selectedPageId = usePresentationStore((s) => s.selectedPageId);
  const selectPage = usePresentationStore((s) => s.selectPage);
  const addPage = usePresentationStore((s) => s.addPage);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-[#E5E5E5] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">Pages</h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
            title="Add page"
          >
            +
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-7 z-10 rounded border shadow-lg py-1"
              style={{ background: '#fff', borderColor: '#E5E5E5', minWidth: 150 }}
            >
              {ADD_PAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    addPage(opt.type);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[#F2F2F2]"
                  style={{ color: '#1A1A1A' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {pages.map((page: Page) => {
          const isSelected = page.id === selectedPageId;
          return (
            <button
              key={page.id}
              onClick={() => selectPage(page.id)}
              className="w-full text-left px-3 py-2 transition-colors"
              style={{
                background: isSelected ? '#FBB93122' : 'transparent',
                borderLeft: isSelected ? '3px solid #FBB931' : '3px solid transparent',
              }}
            >
              {/* Thumbnail placeholder */}
              <div
                className="w-full rounded border mb-1.5"
                style={{
                  aspectRatio: '16/9',
                  background: isSelected ? '#FBB93111' : '#E8E8E8',
                  borderColor: isSelected ? '#FBB931' : '#E5E5E5',
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: '#1A1A1A' }}>
                  {page.order + 1}. {PAGE_TYPE_LABELS[page.type] || page.type}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
