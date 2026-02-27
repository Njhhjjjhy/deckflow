import { useRef, useEffect, useState, useCallback } from 'react';
import { usePresentationStore } from '../../lib/store/presentationStore';
import type { Language } from '../../types/presentation';
import PageList from './PageList';
import CoverPageEditor from './CoverPageEditor';
import SlidePreview from '../preview/SlidePreview';

const LANGUAGE_OPTIONS: { key: Language; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'zh-tw', label: 'zh-TW' },
  { key: 'zh-cn', label: 'zh-CN' },
];

export default function PresentationEditor() {
  const presentation = usePresentationStore((s) => s.presentation);
  const selectedPageId = usePresentationStore((s) => s.selectedPageId);
  const previewLanguage = usePresentationStore((s) => s.previewLanguage);
  const setPreviewLanguage = usePresentationStore((s) => s.setPreviewLanguage);

  const selectedPage = presentation.pages.find((p) => p.id === selectedPageId) ?? null;

  // Auto-scale preview to fit container
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.65);

  const computeScale = useCallback(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const padding = 48; // 24px on each side
    const availW = el.clientWidth - padding;
    const availH = el.clientHeight - padding;
    const scaleX = availW / 960;
    const scaleY = availH / 540;
    setPreviewScale(Math.min(scaleX, scaleY, 1));
  }, []);

  useEffect(() => {
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [computeScale]);

  return (
    <div className="flex h-screen" style={{ background: '#F2F2F2' }}>
      {/* Left: Page list */}
      <div
        className="flex-shrink-0 border-r border-[#E5E5E5] overflow-hidden"
        style={{ width: 180, background: '#fff' }}
      >
        <PageList />
      </div>

      {/* Center: Content fields */}
      <div
        className="flex-shrink-0 border-r border-[#E5E5E5] overflow-y-auto"
        style={{ width: 320, background: '#fff' }}
      >
        <div className="p-4">
          {selectedPage ? (
            selectedPage.type === 'cover' ? (
              <CoverPageEditor page={selectedPage} />
            ) : (
              <p className="text-sm text-[#999]">
                Editor not available for "{selectedPage.type}"
              </p>
            )
          ) : (
            <p className="text-sm text-[#999]">Select a page to edit</p>
          )}
        </div>
      </div>

      {/* Right: Live preview */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Preview toolbar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-[#E5E5E5] flex-shrink-0"
          style={{ background: '#fff' }}
        >
          <span className="text-xs font-medium text-[#1A1A1A]">Preview</span>
          <div className="flex gap-1">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPreviewLanguage(opt.key)}
                className="px-2.5 py-1 text-xs rounded transition-colors"
                style={{
                  background: previewLanguage === opt.key ? '#FBB931' : 'transparent',
                  color: previewLanguage === opt.key ? '#1A1A1A' : '#666',
                  fontWeight: previewLanguage === opt.key ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview area — scales to fit */}
        <div ref={previewContainerRef} className="flex-1 flex items-center justify-center overflow-auto p-6">
          {selectedPage ? (
            <div
              style={{
                boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                transform: `scale(${previewScale})`,
                transformOrigin: 'center center',
              }}
            >
              <SlidePreview page={selectedPage} language={previewLanguage} />
            </div>
          ) : (
            <p className="text-sm text-[#999]">No page selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
