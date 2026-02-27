import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';
import ImageUpload from './ImageUpload';

interface EntryData {
  id: string;
  logoImage: string;
  heading: Record<string, string>;
  bullets: Record<string, string>[];
}

interface LogosTextTableEditorProps {
  page: Page;
}

const MAX_ENTRIES = 4;
const MIN_ENTRIES = 1;
const MAX_BULLETS = 6;
const LOGO_MAX_SIZE = 2 * 1024 * 1024;
const LOGO_ACCEPTED = '.png,.svg,.webp,.jpg,.jpeg';

function createEmptyLang(): Record<string, string> {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function createEmptyEntry(): EntryData {
  return {
    id: crypto.randomUUID(),
    logoImage: '',
    heading: createEmptyLang(),
    bullets: [createEmptyLang()],
  };
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

export default function LogosTextTableEditor({ page }: LogosTextTableEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const tableTitle = page.content.tableTitle as TranslatableField;
  const showFootnote = (page.content.showFootnote as string) === 'true';
  const footnote = page.content.footnote as TranslatableField;
  const showSource = (page.content.showSource as string) === 'true';
  const source = page.content.source as TranslatableField;
  const tableImageKey = (page.content.tableImage as string) || '';
  const entriesDataRaw = (page.content.entriesData as string) || '[]';

  const [entries, setEntries] = useState<EntryData[]>([]);
  const [logoDataMap, setLogoDataMap] = useState<Record<string, string | null>>({});
  const [tableImageData, setTableImageData] = useState<string | null>(null);

  // Parse entries on mount
  useEffect(() => {
    try {
      const parsed = JSON.parse(entriesDataRaw) as EntryData[];
      setEntries(parsed);
      parsed.forEach((entry) => {
        if (entry.logoImage) {
          loadImage(entry.logoImage).then((data) => {
            setLogoDataMap((prev) => ({ ...prev, [entry.id]: data }));
          });
        }
      });
    } catch {
      setEntries([createEmptyEntry()]);
    }
  }, []);

  // Load table image
  useEffect(() => {
    if (!tableImageKey) { setTableImageData(null); return; }
    loadImage(tableImageKey).then((data) => setTableImageData(data));
  }, [tableImageKey]);

  const syncEntries = useCallback(
    (updated: EntryData[]) => {
      setEntries(updated);
      updateStringField(page.id, 'entriesData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const onFieldChange = useCallback(
    (fieldKey: string) => (lang: Language, value: string) => {
      updateTranslatableField(page.id, fieldKey, lang, value);
    },
    [page.id, updateTranslatableField]
  );

  // Entry operations
  const addEntry = useCallback(() => {
    if (entries.length >= MAX_ENTRIES) return;
    syncEntries([...entries, createEmptyEntry()]);
  }, [entries, syncEntries]);

  const removeEntry = useCallback(
    (entryId: string) => {
      if (entries.length <= MIN_ENTRIES) return;
      syncEntries(entries.filter((e) => e.id !== entryId));
    },
    [entries, syncEntries]
  );

  const moveEntry = useCallback(
    (entryId: string, direction: 'up' | 'down') => {
      const idx = entries.findIndex((e) => e.id === entryId);
      if (idx === -1) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= entries.length) return;
      const updated = [...entries];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const updateEntryHeading = useCallback(
    (entryId: string, lang: Language, value: string) => {
      const updated = entries.map((e) =>
        e.id === entryId ? { ...e, heading: { ...e.heading, [lang]: value } } : e
      );
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  // Bullet operations
  const updateBullet = useCallback(
    (entryId: string, bulletIdx: number, lang: Language, value: string) => {
      const updated = entries.map((e) => {
        if (e.id !== entryId) return e;
        const bullets = [...e.bullets];
        bullets[bulletIdx] = { ...bullets[bulletIdx], [lang]: value };
        return { ...e, bullets };
      });
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const addBullet = useCallback(
    (entryId: string) => {
      const updated = entries.map((e) => {
        if (e.id !== entryId) return e;
        if (e.bullets.length >= MAX_BULLETS) return e;
        return { ...e, bullets: [...e.bullets, createEmptyLang()] };
      });
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const removeBullet = useCallback(
    (entryId: string, bulletIdx: number) => {
      const updated = entries.map((e) => {
        if (e.id !== entryId) return e;
        if (e.bullets.length <= 1) return e;
        return { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIdx) };
      });
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  const moveBullet = useCallback(
    (entryId: string, bulletIdx: number, direction: 'up' | 'down') => {
      const updated = entries.map((e) => {
        if (e.id !== entryId) return e;
        const swapIdx = direction === 'up' ? bulletIdx - 1 : bulletIdx + 1;
        if (swapIdx < 0 || swapIdx >= e.bullets.length) return e;
        const bullets = [...e.bullets];
        [bullets[bulletIdx], bullets[swapIdx]] = [bullets[swapIdx], bullets[bulletIdx]];
        return { ...e, bullets };
      });
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  // Logo upload per entry
  const logoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [logoErrors, setLogoErrors] = useState<Record<string, string | null>>({});

  const processLogoFile = useCallback(
    async (entryId: string, file: File) => {
      setLogoErrors((prev) => ({ ...prev, [entryId]: null }));
      if (file.size > LOGO_MAX_SIZE) {
        setLogoErrors((prev) => ({ ...prev, [entryId]: 'Logo must be under 2MB' }));
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp|svg\+xml)$/)) {
        setLogoErrors((prev) => ({ ...prev, [entryId]: 'Only PNG, SVG, WebP, or JPG' }));
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        const key = `img-${crypto.randomUUID()}`;
        await saveImage(key, base64);
        setLogoDataMap((prev) => ({ ...prev, [entryId]: base64 }));
        const updated = entries.map((e) =>
          e.id === entryId ? { ...e, logoImage: key } : e
        );
        syncEntries(updated);
      } catch {
        setLogoErrors((prev) => ({ ...prev, [entryId]: 'Upload failed. Try again.' }));
      }
    },
    [entries, syncEntries]
  );

  const clearLogo = useCallback(
    (entryId: string) => {
      setLogoDataMap((prev) => ({ ...prev, [entryId]: null }));
      const updated = entries.map((e) =>
        e.id === entryId ? { ...e, logoImage: '' } : e
      );
      syncEntries(updated);
    },
    [entries, syncEntries]
  );

  // Table image handlers
  const onTableImageUpload = useCallback(
    (imageKey: string, base64: string) => {
      updateStringField(page.id, 'tableImage', imageKey);
      setTableImageData(base64);
    },
    [page.id, updateStringField]
  );

  const onTableImageClear = useCallback(() => {
    updateStringField(page.id, 'tableImage', '');
    setTableImageData(null);
  }, [page.id, updateStringField]);

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Logos + Text + Table
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel}
          onChange={onFieldChange('sectionLabel')}
          placeholder="e.g. 03 | Partners"
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
          className="w-24 px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
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

      {/* Partner Entries */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Partner Entries ({entries.length}/{MAX_ENTRIES})
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
          {entries.map((entry, entryIdx) => (
            <div
              key={entry.id}
              className="border rounded p-3"
              style={{ borderColor: '#E5E5E5', background: '#FAFAFA' }}
            >
              {/* Entry header with controls */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  Entry {entryIdx + 1}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => moveEntry(entry.id, 'up')}
                    disabled={entryIdx === 0}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveEntry(entry.id, 'down')}
                    disabled={entryIdx === entries.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length <= MIN_ENTRIES}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-red-100 disabled:opacity-25"
                    style={{ color: '#999' }}
                    title="Remove entry"
                  >
                    ✕
                  </button>
                </span>
              </div>

              {/* Logo upload */}
              <div className="mb-2">
                <span className="block text-[10px] text-[#999] mb-1">Partner Logo</span>
                {logoDataMap[entry.id] ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={logoDataMap[entry.id]!}
                      alt=""
                      className="h-10 w-auto object-contain rounded border border-[#E5E5E5]"
                    />
                    <button
                      onClick={() => clearLogo(entry.id)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      ✕ remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => logoInputRefs.current[entry.id]?.click()}
                    className="flex items-center justify-center w-full h-10 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
                    style={{ borderColor: '#CCCCCC' }}
                    title="Upload partner logo"
                  >
                    <span className="text-xs text-[#999]">+ Upload logo</span>
                  </button>
                )}
                {logoErrors[entry.id] && (
                  <p className="text-[10px] text-red-500 mt-0.5">{logoErrors[entry.id]}</p>
                )}
                <input
                  ref={(el) => { logoInputRefs.current[entry.id] = el; }}
                  type="file"
                  accept={LOGO_ACCEPTED}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processLogoFile(entry.id, file);
                    e.target.value = '';
                  }}
                  className="hidden"
                  aria-label={`Upload logo for entry ${entryIdx + 1}`}
                />
              </div>

              {/* Heading */}
              <fieldset className="mb-2">
                <label className="block text-[10px] text-[#999] mb-1">Heading (bold)</label>
                <LanguageTabs
                  field={asTranslatableField(entry.heading)}
                  onChange={(lang, value) => updateEntryHeading(entry.id, lang, value)}
                  placeholder="Partner name or heading"
                />
              </fieldset>

              {/* Bullets */}
              <div className="space-y-2">
                <span className="block text-[10px] text-[#999]">Bullets</span>
                {entry.bullets.map((bullet, bi) => (
                  <div key={bi} className="flex gap-1">
                    <div className="flex-1">
                      <LanguageTabs
                        field={asTranslatableField(bullet)}
                        onChange={(lang, value) => updateBullet(entry.id, bi, lang, value)}
                        placeholder={`Bullet ${bi + 1}`}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 pt-5">
                      <button
                        onClick={() => moveBullet(entry.id, bi, 'up')}
                        disabled={bi === 0}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                        style={{ color: '#333' }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveBullet(entry.id, bi, 'down')}
                        disabled={bi === entry.bullets.length - 1}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                        style={{ color: '#333' }}
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeBullet(entry.id, bi)}
                        disabled={entry.bullets.length <= 1}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                        style={{ color: '#999' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {entry.bullets.length < MAX_BULLETS && (
                  <button
                    onClick={() => addBullet(entry.id)}
                    className="text-[10px] text-[#666] hover:text-[#1A1A1A] transition-colors"
                  >
                    + Add bullet
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#E5E5E5' }} />

      {/* Right Column: Table */}
      <h3 className="text-xs font-semibold text-[#333] uppercase tracking-wide">
        Right Column — Table
      </h3>

      {/* Table Title */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Table Title</label>
        <LanguageTabs
          field={tableTitle}
          onChange={onFieldChange('tableTitle')}
          placeholder="e.g. Key Investment Metrics"
        />
      </fieldset>

      {/* Table Image */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Table Image (screenshot)</label>
        <ImageUpload
          value={tableImageKey}
          imageData={tableImageData}
          onUpload={onTableImageUpload}
          onClear={onTableImageClear}
        />
      </fieldset>

      {/* Footnote */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Footnote</label>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => updateStringField(page.id, 'showFootnote', showFootnote ? 'false' : 'true')}
            className="px-3 py-1.5 text-xs rounded border transition-colors"
            style={{
              background: showFootnote ? '#FBB931' : '#fff',
              borderColor: showFootnote ? '#FBB931' : '#E5E5E5',
              color: '#1A1A1A',
              fontWeight: showFootnote ? 600 : 400,
            }}
          >
            {showFootnote ? 'Visible' : 'Hidden'}
          </button>
        </div>
        {showFootnote && (
          <LanguageTabs
            field={footnote}
            onChange={onFieldChange('footnote')}
            multiline
            placeholder="Footnote text..."
          />
        )}
      </fieldset>

      {/* Source */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Source</label>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => updateStringField(page.id, 'showSource', showSource ? 'false' : 'true')}
            className="px-3 py-1.5 text-xs rounded border transition-colors"
            style={{
              background: showSource ? '#FBB931' : '#fff',
              borderColor: showSource ? '#FBB931' : '#E5E5E5',
              color: '#1A1A1A',
              fontWeight: showSource ? 600 : 400,
            }}
          >
            {showSource ? 'Visible' : 'Hidden'}
          </button>
        </div>
        {showSource && (
          <LanguageTabs
            field={source}
            onChange={onFieldChange('source')}
            multiline
            placeholder="Source citation..."
          />
        )}
      </fieldset>
    </div>
  );
}
