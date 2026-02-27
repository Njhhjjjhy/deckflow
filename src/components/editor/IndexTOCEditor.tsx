import { useState, useEffect, useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';
import ImageUpload from './ImageUpload';

/* ------------------------------------------------------------------ */
/*  Internal TOC data types (serialised as JSON in page.content.tocData)*/
/* ------------------------------------------------------------------ */

interface TrilingualText {
  en: string;
  'zh-tw': string;
  'zh-cn': string;
}

interface TocEntryData {
  id: string;
  label: TrilingualText;
  pageNumber: string;
}

interface TocSectionData {
  id: string;
  name: TrilingualText;
  entries: TocEntryData[];
}

function emptyTrilingualText(): TrilingualText {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function newEntry(): TocEntryData {
  return { id: crypto.randomUUID(), label: emptyTrilingualText(), pageNumber: '' };
}

function newSection(): TocSectionData {
  return { id: crypto.randomUUID(), name: emptyTrilingualText(), entries: [newEntry()] };
}

function parseTocData(raw: string): TocSectionData[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return [{ id: crypto.randomUUID(), name: emptyTrilingualText(), entries: [newEntry()] }];
}

/* ------------------------------------------------------------------ */
/*  Language tab bar (shared across TOC entry inputs)                  */
/* ------------------------------------------------------------------ */

const LANG_TABS: { key: Language; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'zh-tw', label: 'zh-TW' },
  { key: 'zh-cn', label: 'zh-CN' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface IndexTOCEditorProps {
  page: Page;
}

export default function IndexTOCEditor({ page }: IndexTOCEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const heroImageKey = (page.content.heroImage as string) || '';
  const year = (page.content.year as string) || '';

  const [heroImageData, setHeroImageData] = useState<string | null>(null);
  const [tocLang, setTocLang] = useState<Language>('en');

  useEffect(() => {
    if (!heroImageKey) { setHeroImageData(null); return; }
    loadImage(heroImageKey).then((data) => setHeroImageData(data));
  }, [heroImageKey]);

  const sections = parseTocData((page.content.tocData as string) || '[]');

  const updateTocData = useCallback(
    (newSections: TocSectionData[]) => {
      updateStringField(page.id, 'tocData', JSON.stringify(newSections));
    },
    [page.id, updateStringField],
  );

  /* --- Field callbacks --- */

  const onSectionLabelChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'sectionLabel', lang, value);
    },
    [page.id, updateTranslatableField],
  );

  const onYearChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStringField(page.id, 'year', e.target.value);
    },
    [page.id, updateStringField],
  );

  const onImageUpload = useCallback(
    (imageKey: string, base64: string) => {
      updateStringField(page.id, 'heroImage', imageKey);
      setHeroImageData(base64);
    },
    [page.id, updateStringField],
  );

  const onImageClear = useCallback(() => {
    updateStringField(page.id, 'heroImage', '');
    setHeroImageData(null);
  }, [page.id, updateStringField]);

  /* --- Section operations --- */

  const addSection = () => {
    updateTocData([...sections, newSection()]);
  };

  const removeSection = (sIdx: number) => {
    const next = sections.filter((_, i) => i !== sIdx);
    if (next.length === 0) next.push({ id: crypto.randomUUID(), name: emptyTrilingualText(), entries: [newEntry()] });
    updateTocData(next);
  };

  const moveSectionUp = (sIdx: number) => {
    if (sIdx === 0) return;
    const next = [...sections];
    [next[sIdx - 1], next[sIdx]] = [next[sIdx], next[sIdx - 1]];
    updateTocData(next);
  };

  const moveSectionDown = (sIdx: number) => {
    if (sIdx >= sections.length - 1) return;
    const next = [...sections];
    [next[sIdx], next[sIdx + 1]] = [next[sIdx + 1], next[sIdx]];
    updateTocData(next);
  };

  const updateSectionName = (sIdx: number, value: string) => {
    const next = sections.map((s, i) =>
      i === sIdx ? { ...s, name: { ...s.name, [tocLang]: value } } : s,
    );
    updateTocData(next);
  };

  /* --- Entry operations --- */

  const addEntry = (sIdx: number) => {
    const next = sections.map((s, i) =>
      i === sIdx ? { ...s, entries: [...s.entries, newEntry()] } : s,
    );
    updateTocData(next);
  };

  const removeEntry = (sIdx: number, eIdx: number) => {
    const next = sections.map((s, i) => {
      if (i !== sIdx) return s;
      const entries = s.entries.filter((_, j) => j !== eIdx);
      return { ...s, entries };
    });
    updateTocData(next);
  };

  const moveEntryUp = (sIdx: number, eIdx: number) => {
    if (eIdx === 0) return;
    const next = sections.map((s, i) => {
      if (i !== sIdx) return s;
      const entries = [...s.entries];
      [entries[eIdx - 1], entries[eIdx]] = [entries[eIdx], entries[eIdx - 1]];
      return { ...s, entries };
    });
    updateTocData(next);
  };

  const moveEntryDown = (sIdx: number, eIdx: number) => {
    const sec = sections[sIdx];
    if (eIdx >= sec.entries.length - 1) return;
    const next = sections.map((s, i) => {
      if (i !== sIdx) return s;
      const entries = [...s.entries];
      [entries[eIdx], entries[eIdx + 1]] = [entries[eIdx + 1], entries[eIdx]];
      return { ...s, entries };
    });
    updateTocData(next);
  };

  const updateEntryLabel = (sIdx: number, eIdx: number, value: string) => {
    const next = sections.map((s, i) => {
      if (i !== sIdx) return s;
      const entries = s.entries.map((e, j) =>
        j === eIdx ? { ...e, label: { ...e.label, [tocLang]: value } } : e,
      );
      return { ...s, entries };
    });
    updateTocData(next);
  };

  const updateEntryPage = (sIdx: number, eIdx: number, value: string) => {
    const next = sections.map((s, i) => {
      if (i !== sIdx) return s;
      const entries = s.entries.map((e, j) =>
        j === eIdx ? { ...e, pageNumber: value } : e,
      );
      return { ...s, entries };
    });
    updateTocData(next);
  };

  /* --- Determine flat vs sectioned --- */
  const hasSections = sections.length > 1 || (sections.length === 1 && sections[0].name.en.trim() !== '');

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Index / TOC
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel}
          onChange={onSectionLabelChange}
          placeholder="00 | Index"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={onYearChange}
          placeholder={new Date().getFullYear().toString()}
          maxLength={10}
          className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A' }}
        />
      </fieldset>

      {/* Hero image */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Hero Image</label>
        <ImageUpload
          value={heroImageKey}
          imageData={heroImageData}
          onUpload={onImageUpload}
          onClear={onImageClear}
        />
        <p className="text-[10px] text-[#999] mt-1">Oval crop on the right side of the slide.</p>
      </fieldset>

      {/* TOC entries */}
      <fieldset>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">Table of Contents</label>
          {/* Language selector for TOC inputs */}
          <div className="flex gap-0.5">
            {LANG_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTocLang(tab.key)}
                className="px-2 py-0.5 text-[10px] font-medium rounded transition-colors"
                style={{
                  background: tocLang === tab.key ? '#FBB931' : 'transparent',
                  color: tocLang === tab.key ? '#1A1A1A' : '#666',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {sections.map((section, sIdx) => (
          <div
            key={section.id}
            className="mb-3 rounded border border-[#E5E5E5] bg-[#FAFAFA] p-2"
          >
            {/* Section header (name + controls) */}
            {hasSections && (
              <div className="flex items-center gap-1 mb-2">
                <input
                  type="text"
                  value={section.name[tocLang]}
                  onChange={(e) => updateSectionName(sIdx, e.target.value)}
                  placeholder="Section name"
                  className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                />
                <button
                  onClick={() => moveSectionUp(sIdx)}
                  disabled={sIdx === 0}
                  className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                  title="Move section up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveSectionDown(sIdx)}
                  disabled={sIdx >= sections.length - 1}
                  className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                  title="Move section down"
                >
                  ▼
                </button>
                <button
                  onClick={() => removeSection(sIdx)}
                  className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-red-100"
                  style={{ color: '#999' }}
                  title="Remove section"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Entries */}
            {section.entries.map((entry, eIdx) => (
              <div key={entry.id} className="flex items-center gap-1 mb-1">
                <input
                  type="text"
                  value={entry.label[tocLang]}
                  onChange={(e) => updateEntryLabel(sIdx, eIdx, e.target.value)}
                  placeholder="Entry label"
                  className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                />
                <input
                  type="text"
                  value={entry.pageNumber}
                  onChange={(e) => updateEntryPage(sIdx, eIdx, e.target.value)}
                  placeholder="pg."
                  className="w-12 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white text-center focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                />
                <button
                  onClick={() => moveEntryUp(sIdx, eIdx)}
                  disabled={eIdx === 0}
                  className="w-5 h-5 flex items-center justify-center rounded text-[9px] hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveEntryDown(sIdx, eIdx)}
                  disabled={eIdx >= section.entries.length - 1}
                  className="w-5 h-5 flex items-center justify-center rounded text-[9px] hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                  title="Move down"
                >
                  ▼
                </button>
                <button
                  onClick={() => removeEntry(sIdx, eIdx)}
                  className="w-5 h-5 flex items-center justify-center rounded text-[9px] hover:bg-red-100"
                  style={{ color: '#999' }}
                  title="Remove entry"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Add entry */}
            <button
              onClick={() => addEntry(sIdx)}
              className="mt-1 px-2 py-0.5 text-[10px] font-medium rounded transition-colors hover:bg-[#E5E5E5]"
              style={{ color: '#666' }}
            >
              + Add entry
            </button>
          </div>
        ))}

        {/* Add section */}
        <button
          onClick={addSection}
          className="px-2 py-1 text-xs font-medium rounded transition-colors hover:bg-[#FBB93133]"
          style={{ color: '#1A1A1A', background: '#FBB93122' }}
        >
          + Add section
        </button>
      </fieldset>

      <p className="text-[10px] text-[#999]">
        Sections group entries under headings. Without sections, entries render as a flat list.
      </p>
    </div>
  );
}
