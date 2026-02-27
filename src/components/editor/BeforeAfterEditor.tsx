import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';

type LangRecord = { en: string; 'zh-tw': string; 'zh-cn': string };

interface PairData {
  id: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel: LangRecord;
  afterLabel: LangRecord;
  showBeforeLabel: boolean;
  showAfterLabel: boolean;
  showArrow: boolean;
}

const MAX_PAIRS = 8;
const MIN_PAIRS = 1;
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_ACCEPTED = '.jpg,.jpeg,.png,.webp,.svg';

const LAYOUT_OPTIONS = [
  { value: '2x2', label: '2×2' },
  { value: '1x2', label: '1×2' },
  { value: '2x1', label: '2×1' },
  { value: 'freeform', label: 'Free' },
] as const;

function createEmptyLang(): LangRecord {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function asTranslatableField(rec: Record<string, string>) {
  return {
    en: rec.en || '',
    'zh-tw': rec['zh-tw'] || '',
    'zh-cn': rec['zh-cn'] || '',
    translationStatus: {
      'zh-tw': 'empty' as const,
      'zh-cn': 'empty' as const,
    },
  };
}

function createDefaultPair(): PairData {
  return {
    id: crypto.randomUUID(),
    beforeImage: '',
    afterImage: '',
    beforeLabel: createEmptyLang(),
    afterLabel: createEmptyLang(),
    showBeforeLabel: true,
    showAfterLabel: true,
    showArrow: true,
  };
}

interface BeforeAfterEditorProps {
  page: Page;
}

export default function BeforeAfterEditor({ page }: BeforeAfterEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as LangRecord & { translationStatus: Record<string, string> };
  const beforeLabelField = page.content.beforeLabel as LangRecord & { translationStatus: Record<string, string> };
  const afterLabelField = page.content.afterLabel as LangRecord & { translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const layoutMode = (page.content.layoutMode as string) || '2x2';
  const badgeBackgroundColor = (page.content.badgeBackgroundColor as string) || '#FBB931';
  const badgeTextColor = (page.content.badgeTextColor as string) || '#FFFFFF';
  const badgeFontSize = (page.content.badgeFontSize as string) || '11';
  const arrowColor = (page.content.arrowColor as string) || '#FBB931';
  const arrowSize = (page.content.arrowSize as string) || '41';
  const gapColor = (page.content.gapColor as string) || '#FFFFFF';
  const pairsDataRaw = (page.content.pairsData as string) || '[]';

  const [pairs, setPairs] = useState<PairData[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [pairImages, setPairImages] = useState<Record<string, { before: string | null; after: string | null }>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Parse pairs on mount
  useEffect(() => {
    try {
      const parsed = JSON.parse(pairsDataRaw);
      setPairs(parsed.length > 0 ? parsed : [createDefaultPair()]);
    } catch {
      setPairs([createDefaultPair()]);
    }
  }, []); // Only on mount

  // Load all pair images from IndexedDB
  useEffect(() => {
    if (pairs.length === 0) return;
    const loadAll = async () => {
      const map: Record<string, { before: string | null; after: string | null }> = {};
      for (const pair of pairs) {
        const [before, after] = await Promise.all([
          pair.beforeImage ? loadImage(pair.beforeImage) : Promise.resolve(null),
          pair.afterImage ? loadImage(pair.afterImage) : Promise.resolve(null),
        ]);
        map[pair.id] = { before, after };
      }
      setPairImages(map);
    };
    loadAll();
  }, [pairs]);

  const syncPairs = useCallback(
    (updated: PairData[]) => {
      setPairs(updated);
      updateStringField(page.id, 'pairsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  // Pair operations
  const addPair = useCallback(() => {
    if (pairs.length >= MAX_PAIRS) return;
    syncPairs([...pairs, createDefaultPair()]);
  }, [pairs, syncPairs]);

  const removePair = useCallback(
    (idx: number) => {
      if (pairs.length <= MIN_PAIRS) return;
      syncPairs(pairs.filter((_, i) => i !== idx));
    },
    [pairs, syncPairs]
  );

  const movePair = useCallback(
    (idx: number, direction: 'up' | 'down') => {
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= pairs.length) return;
      const updated = [...pairs];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncPairs(updated);
    },
    [pairs, syncPairs]
  );

  const updatePairField = useCallback(
    (idx: number, field: keyof PairData, value: unknown) => {
      const updated = [...pairs];
      updated[idx] = { ...updated[idx], [field]: value };
      syncPairs(updated);
    },
    [pairs, syncPairs]
  );

  const updatePairLabel = useCallback(
    (idx: number, field: 'beforeLabel' | 'afterLabel', lang: Language, value: string) => {
      const updated = [...pairs];
      updated[idx] = {
        ...updated[idx],
        [field]: { ...updated[idx][field], [lang]: value },
      };
      syncPairs(updated);
    },
    [pairs, syncPairs]
  );

  // Image upload
  const processImageFile = useCallback(
    async (file: File, pairIdx: number, slot: 'beforeImage' | 'afterImage') => {
      setImageError(null);
      if (file.size > IMAGE_MAX_SIZE) {
        setImageError('Image must be under 5MB');
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp|svg\+xml)$/)) {
        setImageError('Only JPG, PNG, WebP, or SVG');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        const key = `img-${crypto.randomUUID()}`;
        await saveImage(key, base64);
        const pair = pairs[pairIdx];
        setPairImages((prev) => ({
          ...prev,
          [pair.id]: {
            ...prev[pair.id],
            [slot === 'beforeImage' ? 'before' : 'after']: base64,
          },
        }));
        updatePairField(pairIdx, slot, key);
      } catch {
        setImageError('Upload failed. Try again.');
      }
    },
    [pairs, updatePairField]
  );

  const clearPairImage = useCallback(
    (pairIdx: number, slot: 'beforeImage' | 'afterImage') => {
      const pair = pairs[pairIdx];
      setPairImages((prev) => ({
        ...prev,
        [pair.id]: {
          ...prev[pair.id],
          [slot === 'beforeImage' ? 'before' : 'after']: null,
        },
      }));
      updatePairField(pairIdx, slot, '');
    },
    [pairs, updatePairField]
  );

  const setFileInputRef = useCallback((key: string, el: HTMLInputElement | null) => {
    fileInputRefs.current[key] = el;
  }, []);

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Before / After Grid
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'sectionLabel', lang, value)}
          placeholder="e.g. 02 | J Estate & Château Life"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={(e) => updateStringField(page.id, 'year', e.target.value)}
          placeholder="e.g. 2026"
          maxLength={10}
          className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A' }}
        />
      </fieldset>

      {/* Page number */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Page Number</label>
        {pageNumber ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pageNumber}
              onChange={(e) => updateStringField(page.id, 'pageNumber', e.target.value)}
              maxLength={4}
              className="w-24 px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
              style={{ color: '#1A1A1A' }}
            />
            <button
              onClick={() => updateStringField(page.id, 'pageNumber', '')}
              className="px-2 py-2 text-xs rounded border border-[#E5E5E5] hover:bg-red-50 hover:border-red-200 transition-colors"
              style={{ color: '#999' }}
              title="Remove page number"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => updateStringField(page.id, 'pageNumber', String(page.order + 1))}
            className="px-3 py-2 text-xs rounded border border-dashed border-[#CCCCCC] hover:border-[#FBB931] transition-colors"
            style={{ color: '#666' }}
          >
            + Add page number
          </button>
        )}
      </fieldset>

      <hr className="border-[#E5E5E5]" />

      {/* Layout mode */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Layout Mode</label>
        <div className="flex gap-1">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateStringField(page.id, 'layoutMode', opt.value)}
              className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors"
              style={{
                background: layoutMode === opt.value ? '#FBB931' : '#fff',
                color: layoutMode === opt.value ? '#1A1A1A' : '#666',
                border: `1px solid ${layoutMode === opt.value ? '#FBB931' : '#E5E5E5'}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <hr className="border-[#E5E5E5]" />

      {/* Global labels */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Default "Before" Label</label>
        <LanguageTabs
          field={beforeLabelField as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'beforeLabel', lang, value)}
          placeholder="Before"
        />
      </fieldset>

      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Default "After" Label</label>
        <LanguageTabs
          field={afterLabelField as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'afterLabel', lang, value)}
          placeholder="After"
        />
      </fieldset>

      <hr className="border-[#E5E5E5]" />

      {/* Colors */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-2">Colors</label>
        <div className="grid grid-cols-2 gap-3">
          <fieldset>
            <label className="block text-[10px] text-[#999] mb-1">Badge Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={badgeBackgroundColor}
                onChange={(e) => updateStringField(page.id, 'badgeBackgroundColor', e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
              />
              <input
                type="text"
                value={badgeBackgroundColor}
                onChange={(e) => updateStringField(page.id, 'badgeBackgroundColor', e.target.value)}
                maxLength={7}
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
          <fieldset>
            <label className="block text-[10px] text-[#999] mb-1">Badge Text</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={badgeTextColor}
                onChange={(e) => updateStringField(page.id, 'badgeTextColor', e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
              />
              <input
                type="text"
                value={badgeTextColor}
                onChange={(e) => updateStringField(page.id, 'badgeTextColor', e.target.value)}
                maxLength={7}
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
          <fieldset>
            <label className="block text-[10px] text-[#999] mb-1">Arrow</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={arrowColor}
                onChange={(e) => updateStringField(page.id, 'arrowColor', e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
              />
              <input
                type="text"
                value={arrowColor}
                onChange={(e) => updateStringField(page.id, 'arrowColor', e.target.value)}
                maxLength={7}
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
          <fieldset>
            <label className="block text-[10px] text-[#999] mb-1">Gap Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={gapColor}
                onChange={(e) => updateStringField(page.id, 'gapColor', e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
              />
              <input
                type="text"
                value={gapColor}
                onChange={(e) => updateStringField(page.id, 'gapColor', e.target.value)}
                maxLength={7}
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
        </div>
      </div>

      {/* Badge font size + Arrow size */}
      <div className="grid grid-cols-2 gap-3">
        <fieldset>
          <label className="block text-[10px] text-[#999] mb-1">Badge Font Size (px)</label>
          <input
            type="number"
            value={badgeFontSize}
            min={8}
            max={20}
            onChange={(e) => updateStringField(page.id, 'badgeFontSize', e.target.value)}
            className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
            style={{ color: '#1A1A1A' }}
          />
        </fieldset>
        <fieldset>
          <label className="block text-[10px] text-[#999] mb-1">Arrow Size (px)</label>
          <input
            type="number"
            value={arrowSize}
            min={16}
            max={80}
            onChange={(e) => updateStringField(page.id, 'arrowSize', e.target.value)}
            className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
            style={{ color: '#1A1A1A' }}
          />
        </fieldset>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* Pairs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Pairs ({pairs.length}/{MAX_PAIRS})
          </label>
          <button
            onClick={addPair}
            disabled={pairs.length >= MAX_PAIRS}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Pair
          </button>
        </div>

        <div className="space-y-4">
          {pairs.map((pair, pi) => {
            const images = pairImages[pair.id] || { before: null, after: null };
            const beforeInputKey = `${pair.id}-before`;
            const afterInputKey = `${pair.id}-after`;

            return (
              <div
                key={pair.id}
                className="border border-[#E5E5E5] rounded p-3 space-y-3"
                style={{ background: '#FAFAFA' }}
              >
                {/* Pair header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#999] uppercase">
                    Pair {pi + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => movePair(pi, 'up')}
                      disabled={pi === 0}
                      className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                      style={{ color: '#333' }}
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => movePair(pi, 'down')}
                      disabled={pi === pairs.length - 1}
                      className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                      style={{ color: '#333' }}
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => removePair(pi)}
                      disabled={pairs.length <= MIN_PAIRS}
                      className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                      style={{ color: '#999' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Before image */}
                <div>
                  <label className="block text-[10px] text-[#999] mb-1">Before Image</label>
                  {images.before ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={images.before}
                        alt=""
                        className="w-16 h-10 object-cover rounded border border-[#E5E5E5]"
                      />
                      <button
                        onClick={() => clearPairImage(pi, 'beforeImage')}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        ✕ remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRefs.current[beforeInputKey]?.click()}
                      className="flex items-center justify-center w-16 h-10 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
                      style={{ borderColor: '#CCCCCC' }}
                    >
                      <span className="text-[9px] text-[#999]">+ Upload</span>
                    </button>
                  )}
                  <input
                    ref={(el) => setFileInputRef(beforeInputKey, el)}
                    type="file"
                    accept={IMAGE_ACCEPTED}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file, pi, 'beforeImage');
                      e.target.value = '';
                    }}
                    className="hidden"
                    aria-label={`Upload before image for pair ${pi + 1}`}
                  />
                </div>

                {/* After image */}
                <div>
                  <label className="block text-[10px] text-[#999] mb-1">After Image</label>
                  {images.after ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={images.after}
                        alt=""
                        className="w-16 h-10 object-cover rounded border border-[#E5E5E5]"
                      />
                      <button
                        onClick={() => clearPairImage(pi, 'afterImage')}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        ✕ remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRefs.current[afterInputKey]?.click()}
                      className="flex items-center justify-center w-16 h-10 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
                      style={{ borderColor: '#CCCCCC' }}
                    >
                      <span className="text-[9px] text-[#999]">+ Upload</span>
                    </button>
                  )}
                  <input
                    ref={(el) => setFileInputRef(afterInputKey, el)}
                    type="file"
                    accept={IMAGE_ACCEPTED}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file, pi, 'afterImage');
                      e.target.value = '';
                    }}
                    className="hidden"
                    aria-label={`Upload after image for pair ${pi + 1}`}
                  />
                </div>

                {/* Per-pair label overrides */}
                <fieldset>
                  <label className="block text-[10px] text-[#999] mb-1">Before Label Override (optional)</label>
                  <LanguageTabs
                    field={asTranslatableField(pair.beforeLabel)}
                    onChange={(lang, value) => updatePairLabel(pi, 'beforeLabel', lang, value)}
                    placeholder="Override global label"
                  />
                </fieldset>

                <fieldset>
                  <label className="block text-[10px] text-[#999] mb-1">After Label Override (optional)</label>
                  <LanguageTabs
                    field={asTranslatableField(pair.afterLabel)}
                    onChange={(lang, value) => updatePairLabel(pi, 'afterLabel', lang, value)}
                    placeholder="Override global label"
                  />
                </fieldset>

                {/* Toggle checkboxes */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-[10px] text-[#999]">
                    <input
                      type="checkbox"
                      checked={pair.showBeforeLabel}
                      onChange={(e) => updatePairField(pi, 'showBeforeLabel', e.target.checked)}
                      className="rounded"
                    />
                    Before badge
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] text-[#999]">
                    <input
                      type="checkbox"
                      checked={pair.showAfterLabel}
                      onChange={(e) => updatePairField(pi, 'showAfterLabel', e.target.checked)}
                      className="rounded"
                    />
                    After badge
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] text-[#999]">
                    <input
                      type="checkbox"
                      checked={pair.showArrow}
                      onChange={(e) => updatePairField(pi, 'showArrow', e.target.checked)}
                      className="rounded"
                    />
                    Arrow
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {imageError && (
        <p className="text-[10px] text-red-500 mt-0.5">{imageError}</p>
      )}
    </div>
  );
}
