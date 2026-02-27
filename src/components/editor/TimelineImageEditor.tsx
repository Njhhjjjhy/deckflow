import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';

type EntryBullet = Record<string, string>;

interface EntryData {
  id: string;
  year: string;
  heading: { en: string; 'zh-tw': string; 'zh-cn': string };
  bullets: EntryBullet[];
  yearColor: string;
  headingColor: string;
  bodyColor: string;
}

const MAX_ENTRIES = 6;
const MIN_ENTRIES = 2;
const MAX_BULLETS = 5;
const MIN_BULLETS = 0;
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_ACCEPTED = '.jpg,.jpeg,.png,.webp,.svg';

function createEmptyLang(): { en: string; 'zh-tw': string; 'zh-cn': string } {
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

function createDefaultEntry(): EntryData {
  return {
    id: crypto.randomUUID(),
    year: '',
    heading: createEmptyLang(),
    bullets: [createEmptyLang()],
    yearColor: '#1A1A1A',
    headingColor: '#1A1A1A',
    bodyColor: '#333333',
  };
}

interface TimelineImageEditorProps {
  page: Page;
}

export default function TimelineImageEditor({ page }: TimelineImageEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const caption = page.content.caption as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const timelineLineColor = (page.content.timelineLineColor as string) || '#1A1A1A';
  const bulletColor = (page.content.bulletColor as string) || '#333333';
  const captionColor = (page.content.captionColor as string) || '#333333';
  const entriesDataRaw = (page.content.entriesData as string) || '[]';
  const photoKey = (page.content.photo as string) || '';

  const [entries, setEntries] = useState<EntryData[]>([]);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(entriesDataRaw);
      setEntries(parsed.length > 0 ? parsed : [createDefaultEntry(), createDefaultEntry()]);
    } catch {
      setEntries([createDefaultEntry(), createDefaultEntry()]);
    }
  }, []); // Only on mount

  useEffect(() => {
    if (!photoKey) { setPhotoData(null); return; }
    loadImage(photoKey).then((data) => setPhotoData(data));
  }, [photoKey]);

  const syncEntries = useCallback(
    (updated: EntryData[]) => {
      setEntries(updated);
      updateStringField(page.id, 'entriesData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  // Entry operations
  const addEntry = useCallback(() => {
    if (entries.length >= MAX_ENTRIES) return;
    syncEntries([...entries, createDefaultEntry()]);
  }, [entries, syncEntries]);

  const removeEntry = useCallback(
    (idx: number) => {
      if (entries.length <= MIN_ENTRIES) return;
      syncEntries(entries.filter((_, i) => i !== idx));
    },
    [entries, syncEntries]
  );

  const moveEntry = useCallback(
    (idx: number, direction: 'up' | 'down') => {
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= entries.length) return;
      const updated = [...entries];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const updateEntryYear = useCallback(
    (idx: number, value: string) => {
      const updated = [...entries];
      updated[idx] = { ...updated[idx], year: value };
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const updateEntryHeading = useCallback(
    (idx: number, lang: Language, value: string) => {
      const updated = [...entries];
      updated[idx] = { ...updated[idx], heading: { ...updated[idx].heading, [lang]: value } };
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const updateEntryColor = useCallback(
    (idx: number, field: 'yearColor' | 'headingColor' | 'bodyColor', value: string) => {
      const updated = [...entries];
      updated[idx] = { ...updated[idx], [field]: value };
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  // Bullet operations within an entry
  const addBullet = useCallback(
    (entryIdx: number) => {
      const entry = entries[entryIdx];
      if (entry.bullets.length >= MAX_BULLETS) return;
      const updated = [...entries];
      updated[entryIdx] = { ...entry, bullets: [...entry.bullets, createEmptyLang()] };
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const removeBullet = useCallback(
    (entryIdx: number, bulletIdx: number) => {
      const entry = entries[entryIdx];
      if (entry.bullets.length <= MIN_BULLETS) return;
      const updated = [...entries];
      updated[entryIdx] = { ...entry, bullets: entry.bullets.filter((_, i) => i !== bulletIdx) };
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const updateBullet = useCallback(
    (entryIdx: number, bulletIdx: number, lang: Language, value: string) => {
      const updated = [...entries];
      const entry = { ...updated[entryIdx] };
      const bullets = [...entry.bullets];
      bullets[bulletIdx] = { ...bullets[bulletIdx], [lang]: value };
      entry.bullets = bullets;
      updated[entryIdx] = entry;
      syncEntries(updated);
    },
    [entries, syncEntries]
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
        setPhotoData(base64);
        updateStringField(page.id, 'photo', key);
      } catch {
        setImageError('Upload failed. Try again.');
      }
    },
    [page.id, updateStringField]
  );

  const clearImage = useCallback(() => {
    setPhotoData(null);
    updateStringField(page.id, 'photo', '');
  }, [page.id, updateStringField]);

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Timeline + Image
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'sectionLabel', lang, value)}
          placeholder="e.g. 02 | Our History"
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

      {/* Timeline colors */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-2">Timeline Colors</label>
        <div className="flex gap-3">
          <fieldset className="flex-1">
            <label className="block text-[10px] text-[#999] mb-1">Line & Nodes</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={timelineLineColor}
                onChange={(e) => updateStringField(page.id, 'timelineLineColor', e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
              />
              <input
                type="text"
                value={timelineLineColor}
                onChange={(e) => updateStringField(page.id, 'timelineLineColor', e.target.value)}
                maxLength={7}
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
          <fieldset className="flex-1">
            <label className="block text-[10px] text-[#999] mb-1">Bullet Dots</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bulletColor}
                onChange={(e) => updateStringField(page.id, 'bulletColor', e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
              />
              <input
                type="text"
                value={bulletColor}
                onChange={(e) => updateStringField(page.id, 'bulletColor', e.target.value)}
                maxLength={7}
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* Entries */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Timeline Entries ({entries.length}/{MAX_ENTRIES})
          </label>
          <button
            onClick={addEntry}
            disabled={entries.length >= MAX_ENTRIES}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Entry
          </button>
        </div>

        <div className="space-y-4">
          {entries.map((entry, ei) => (
            <div
              key={entry.id}
              className="border border-[#E5E5E5] rounded p-3 space-y-3"
              style={{ background: '#FAFAFA' }}
            >
              {/* Entry header with controls */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#999] uppercase">
                  Entry {ei + 1}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => moveEntry(ei, 'up')}
                    disabled={ei === 0}
                    className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveEntry(ei, 'down')}
                    disabled={ei === entries.length - 1}
                    className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeEntry(ei)}
                    disabled={entries.length <= MIN_ENTRIES}
                    className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                    style={{ color: '#999' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Year */}
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Year</label>
                <input
                  type="text"
                  value={entry.year}
                  onChange={(e) => updateEntryYear(ei, e.target.value)}
                  placeholder="e.g. 2020"
                  maxLength={20}
                  className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                />
              </fieldset>

              {/* Heading */}
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Heading</label>
                <LanguageTabs
                  field={asTranslatableField(entry.heading)}
                  onChange={(lang, value) => updateEntryHeading(ei, lang, value)}
                  placeholder="Entry heading"
                />
              </fieldset>

              {/* Bullets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] text-[#999]">
                    Bullets ({entry.bullets.length}/{MAX_BULLETS})
                  </label>
                  <button
                    onClick={() => addBullet(ei)}
                    disabled={entry.bullets.length >= MAX_BULLETS}
                    className="px-1.5 py-0.5 text-[9px] rounded transition-colors disabled:opacity-30"
                    style={{ background: '#FBB931', color: '#1A1A1A' }}
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-1.5">
                  {entry.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex gap-1">
                      <div className="flex-1">
                        <LanguageTabs
                          field={asTranslatableField(bullet)}
                          onChange={(lang, value) => updateBullet(ei, bi, lang, value)}
                          placeholder={`Bullet ${bi + 1}`}
                        />
                      </div>
                      <div className="flex flex-col pt-5">
                        <button
                          onClick={() => removeBullet(ei, bi)}
                          disabled={entry.bullets.length <= MIN_BULLETS}
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

              {/* Per-entry colors */}
              <div>
                <label className="block text-[10px] text-[#999] mb-1">Colors</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={entry.yearColor}
                      onChange={(e) => updateEntryColor(ei, 'yearColor', e.target.value)}
                      className="w-5 h-5 rounded border border-[#E5E5E5] cursor-pointer"
                      title="Year color"
                    />
                    <span className="text-[9px] text-[#999]">Year</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={entry.headingColor}
                      onChange={(e) => updateEntryColor(ei, 'headingColor', e.target.value)}
                      className="w-5 h-5 rounded border border-[#E5E5E5] cursor-pointer"
                      title="Heading color"
                    />
                    <span className="text-[9px] text-[#999]">Heading</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={entry.bodyColor}
                      onChange={(e) => updateEntryColor(ei, 'bodyColor', e.target.value)}
                      className="w-5 h-5 rounded border border-[#E5E5E5] cursor-pointer"
                      title="Body color"
                    />
                    <span className="text-[9px] text-[#999]">Body</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* Photo */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-1">Photo</label>
        {photoData ? (
          <div className="flex items-center gap-2">
            <img
              src={photoData}
              alt=""
              className="w-20 h-12 object-cover rounded border border-[#E5E5E5]"
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
            title="Upload photo"
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
          aria-label="Upload photo"
        />
      </div>

      {/* Caption */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Caption</label>
        <LanguageTabs
          field={caption as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'caption', lang, value)}
          placeholder="Photo caption"
        />
      </fieldset>

      {/* Caption color */}
      <fieldset>
        <label className="block text-[10px] text-[#999] mb-1">Caption Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={captionColor}
            onChange={(e) => updateStringField(page.id, 'captionColor', e.target.value)}
            className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
          />
          <input
            type="text"
            value={captionColor}
            onChange={(e) => updateStringField(page.id, 'captionColor', e.target.value)}
            maxLength={7}
            className="w-24 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
            style={{ color: '#1A1A1A' }}
          />
        </div>
      </fieldset>
    </div>
  );
}
