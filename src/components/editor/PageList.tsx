import type { Page } from '../../types/presentation';
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

export default function PageList() {
  const pages = usePresentationStore((s) => s.presentation.pages);
  const selectedPageId = usePresentationStore((s) => s.selectedPageId);
  const selectPage = usePresentationStore((s) => s.selectPage);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-[#E5E5E5]">
        <h3 className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">Pages</h3>
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
