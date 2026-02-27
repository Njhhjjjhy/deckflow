import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';

interface BarData {
  label: string;
  value: number;
}

const MAX_BULLETS = 8;
const MIN_BULLETS = 1;
const MAX_BARS = 12;
const MIN_BARS = 1;
const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_ACCEPTED = '.jpg,.jpeg,.png,.webp,.svg';

function createEmptyLang(): Record<string, string> {
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

interface TextChartEditorProps {
  page: Page;
}

export default function TextChartEditor({ page }: TextChartEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const heading = page.content.heading as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const chartTitle = page.content.chartTitle as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const xAxisLabel = page.content.xAxisLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const yAxisLabel = page.content.yAxisLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const chartImageCaption = page.content.chartImageCaption as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const chartMode = (page.content.chartMode as string) || 'data';
  const yAxisUnit = (page.content.yAxisUnit as string) || '';
  const yAxisMax = (page.content.yAxisMax as string) || '';
  const bulletsDataRaw = (page.content.bulletsData as string) || '[]';
  const barsDataRaw = (page.content.barsData as string) || '[]';
  const chartImageKey = (page.content.chartImage as string) || '';

  // Parse bullets from JSON
  const [bullets, setBullets] = useState<Record<string, string>[]>([]);
  const [bars, setBars] = useState<BarData[]>([]);
  const [chartImageData, setChartImageData] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setBullets(JSON.parse(bulletsDataRaw)); } catch { setBullets([]); }
  }, []); // Only on mount

  useEffect(() => {
    try { setBars(JSON.parse(barsDataRaw)); } catch { setBars([]); }
  }, []); // Only on mount

  useEffect(() => {
    if (!chartImageKey) { setChartImageData(null); return; }
    loadImage(chartImageKey).then((data) => setChartImageData(data));
  }, [chartImageKey]);

  const syncBullets = useCallback(
    (updated: Record<string, string>[]) => {
      setBullets(updated);
      updateStringField(page.id, 'bulletsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const syncBars = useCallback(
    (updated: BarData[]) => {
      setBars(updated);
      updateStringField(page.id, 'barsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  // Bullet operations
  const addBullet = useCallback(() => {
    if (bullets.length >= MAX_BULLETS) return;
    syncBullets([...bullets, createEmptyLang()]);
  }, [bullets, syncBullets]);

  const removeBullet = useCallback(
    (idx: number) => {
      if (bullets.length <= MIN_BULLETS) return;
      syncBullets(bullets.filter((_, i) => i !== idx));
    },
    [bullets, syncBullets]
  );

  const moveBullet = useCallback(
    (idx: number, direction: 'up' | 'down') => {
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= bullets.length) return;
      const updated = [...bullets];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncBullets(updated);
    },
    [bullets, syncBullets]
  );

  const updateBullet = useCallback(
    (idx: number, lang: Language, value: string) => {
      const updated = [...bullets];
      updated[idx] = { ...updated[idx], [lang]: value };
      syncBullets(updated);
    },
    [bullets, syncBullets]
  );

  // Bar operations
  const addBar = useCallback(() => {
    if (bars.length >= MAX_BARS) return;
    syncBars([...bars, { label: '', value: 0 }]);
  }, [bars, syncBars]);

  const removeBar = useCallback(
    (idx: number) => {
      if (bars.length <= MIN_BARS) return;
      syncBars(bars.filter((_, i) => i !== idx));
    },
    [bars, syncBars]
  );

  const moveBar = useCallback(
    (idx: number, direction: 'up' | 'down') => {
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= bars.length) return;
      const updated = [...bars];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncBars(updated);
    },
    [bars, syncBars]
  );

  const updateBarLabel = useCallback(
    (idx: number, value: string) => {
      const updated = [...bars];
      updated[idx] = { ...updated[idx], label: value };
      syncBars(updated);
    },
    [bars, syncBars]
  );

  const updateBarValue = useCallback(
    (idx: number, value: string) => {
      const updated = [...bars];
      updated[idx] = { ...updated[idx], value: parseFloat(value) || 0 };
      syncBars(updated);
    },
    [bars, syncBars]
  );

  // Image upload
  const processImageFile = useCallback(
    async (file: File) => {
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
        setChartImageData(base64);
        updateStringField(page.id, 'chartImage', key);
      } catch {
        setImageError('Upload failed. Try again.');
      }
    },
    [page.id, updateStringField]
  );

  const clearImage = useCallback(() => {
    setChartImageData(null);
    updateStringField(page.id, 'chartImage', '');
  }, [page.id, updateStringField]);

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Text + Chart
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'sectionLabel', lang, value)}
          placeholder="e.g. 02 | About Us"
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

      {/* Heading */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Heading</label>
        <LanguageTabs
          field={heading as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'heading', lang, value)}
          placeholder="e.g. About MoreHarvest"
        />
      </fieldset>

      {/* Bullets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Bullets ({bullets.length}/{MAX_BULLETS})
          </label>
          <button
            onClick={addBullet}
            disabled={bullets.length >= MAX_BULLETS}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Bullet
          </button>
        </div>
        <div className="space-y-2">
          {bullets.map((bullet, bi) => (
            <div key={bi} className="flex gap-1">
              <div className="flex-1">
                <LanguageTabs
                  field={asTranslatableField(bullet)}
                  onChange={(lang, value) => updateBullet(bi, lang, value)}
                  placeholder={`Bullet ${bi + 1}`}
                />
              </div>
              <div className="flex flex-col gap-0.5 pt-5">
                <button
                  onClick={() => moveBullet(bi, 'up')}
                  disabled={bi === 0}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveBullet(bi, 'down')}
                  disabled={bi === bullets.length - 1}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                >
                  ▼
                </button>
                <button
                  onClick={() => removeBullet(bi)}
                  disabled={bullets.length <= MIN_BULLETS}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                  style={{ color: '#999' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#E5E5E5]" />

      {/* Chart mode toggle */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-2">Chart</label>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => chartMode !== 'data' && updateStringField(page.id, 'chartMode', 'data')}
            className="px-3 py-1 text-xs rounded transition-colors"
            style={{
              background: chartMode === 'data' ? '#FBB931' : 'transparent',
              color: '#1A1A1A',
              fontWeight: chartMode === 'data' ? 600 : 400,
              border: '1px solid',
              borderColor: chartMode === 'data' ? '#FBB931' : '#E5E5E5',
            }}
          >
            Data chart
          </button>
          <button
            onClick={() => chartMode !== 'image' && updateStringField(page.id, 'chartMode', 'image')}
            className="px-3 py-1 text-xs rounded transition-colors"
            style={{
              background: chartMode === 'image' ? '#FBB931' : 'transparent',
              color: '#1A1A1A',
              fontWeight: chartMode === 'image' ? 600 : 400,
              border: '1px solid',
              borderColor: chartMode === 'image' ? '#FBB931' : '#E5E5E5',
            }}
          >
            Image
          </button>
        </div>

        {chartMode === 'data' && (
          <div className="space-y-3">
            {/* Chart title */}
            <fieldset>
              <label className="block text-[10px] text-[#999] mb-1">Chart Title</label>
              <LanguageTabs
                field={chartTitle as any}
                onChange={(lang, value) => updateTranslatableField(page.id, 'chartTitle', lang, value)}
                placeholder="Chart title"
              />
            </fieldset>

            {/* X-axis label */}
            <fieldset>
              <label className="block text-[10px] text-[#999] mb-1">X-Axis Label</label>
              <LanguageTabs
                field={xAxisLabel as any}
                onChange={(lang, value) => updateTranslatableField(page.id, 'xAxisLabel', lang, value)}
                placeholder="X-axis label"
              />
            </fieldset>

            {/* Y-axis label */}
            <fieldset>
              <label className="block text-[10px] text-[#999] mb-1">Y-Axis Label</label>
              <LanguageTabs
                field={yAxisLabel as any}
                onChange={(lang, value) => updateTranslatableField(page.id, 'yAxisLabel', lang, value)}
                placeholder="Y-axis label"
              />
            </fieldset>

            {/* Y-axis unit + max */}
            <div className="flex gap-2">
              <fieldset className="flex-1">
                <label className="block text-[10px] text-[#999] mb-1">Y-Axis Unit</label>
                <input
                  type="text"
                  value={yAxisUnit}
                  onChange={(e) => updateStringField(page.id, 'yAxisUnit', e.target.value)}
                  placeholder='e.g. %'
                  maxLength={10}
                  className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                />
              </fieldset>
              <fieldset className="flex-1">
                <label className="block text-[10px] text-[#999] mb-1">Y-Axis Max</label>
                <input
                  type="number"
                  value={yAxisMax}
                  onChange={(e) => updateStringField(page.id, 'yAxisMax', e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                />
              </fieldset>
            </div>

            {/* Bars */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] text-[#999]">
                  Bars ({bars.length}/{MAX_BARS})
                </label>
                <button
                  onClick={addBar}
                  disabled={bars.length >= MAX_BARS}
                  className="px-2 py-0.5 text-[10px] rounded transition-colors disabled:opacity-30"
                  style={{ background: '#FBB931', color: '#1A1A1A' }}
                >
                  + Add
                </button>
              </div>

              {/* Column headers */}
              <div className="flex items-center gap-1 mb-1">
                <span className="flex-1 text-[9px] text-[#999] pl-1">Label</span>
                <span className="w-16 text-[9px] text-[#999] text-center">Value</span>
                <span className="w-12" />
              </div>

              <div className="space-y-1">
                {bars.map((bar, bi) => (
                  <div key={bi} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={bar.label}
                      onChange={(e) => updateBarLabel(bi, e.target.value)}
                      placeholder="Label"
                      maxLength={30}
                      className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                      style={{ color: '#1A1A1A' }}
                    />
                    <input
                      type="number"
                      value={bar.value}
                      onChange={(e) => updateBarValue(bi, e.target.value)}
                      className="w-16 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] text-center"
                      style={{ color: '#1A1A1A' }}
                    />
                    <div className="flex items-center gap-0.5 w-12 justify-end">
                      <button
                        onClick={() => moveBar(bi, 'up')}
                        disabled={bi === 0}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                        style={{ color: '#333' }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveBar(bi, 'down')}
                        disabled={bi === bars.length - 1}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                        style={{ color: '#333' }}
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeBar(bi)}
                        disabled={bars.length <= MIN_BARS}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                        style={{ color: '#999' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {chartMode === 'image' && (
          <div className="space-y-3">
            {/* Image upload */}
            <div>
              <label className="block text-[10px] text-[#999] mb-1">Chart Image</label>
              {chartImageData ? (
                <div className="flex items-center gap-2">
                  <img
                    src={chartImageData}
                    alt=""
                    className="w-20 h-12 object-contain rounded border border-[#E5E5E5]"
                  />
                  <button
                    onClick={clearImage}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    ✕ remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center justify-center w-20 h-12 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
                  style={{ borderColor: '#CCCCCC' }}
                  title="Upload chart image"
                >
                  <span className="text-xs text-[#999]">+ Upload</span>
                </button>
              )}
              {imageError && (
                <p className="text-[10px] text-red-500 mt-0.5">{imageError}</p>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept={IMAGE_ACCEPTED}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processImageFile(file);
                  e.target.value = '';
                }}
                className="hidden"
                aria-label="Upload chart image"
              />
            </div>

            {/* Caption */}
            <fieldset>
              <label className="block text-[10px] text-[#999] mb-1">Caption (optional)</label>
              <LanguageTabs
                field={chartImageCaption as any}
                onChange={(lang, value) => updateTranslatableField(page.id, 'chartImageCaption', lang, value)}
                placeholder="Image caption"
              />
            </fieldset>
          </div>
        )}
      </div>
    </div>
  );
}
