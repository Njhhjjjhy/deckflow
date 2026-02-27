import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';

type LangRecord = { en: string; 'zh-tw': string; 'zh-cn': string };

interface SectionData {
  id: string;
  heading: LangRecord;
  bullets: LangRecord[];
}

const MAX_SECTIONS = 6;
const MIN_SECTIONS = 1;
const MAX_BULLETS = 8;
const MIN_BULLETS = 0;
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_ACCEPTED = '.jpg,.jpeg,.png,.webp,.svg';

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

function createDefaultSection(): SectionData {
  return {
    id: crypto.randomUUID(),
    heading: createEmptyLang(),
    bullets: [createEmptyLang()],
  };
}

interface TextImagesEditorProps {
  page: Page;
}

export default function TextImagesEditor({ page }: TextImagesEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as LangRecord & { translationStatus: Record<string, string> };
  const photo1Caption = page.content.photo1Caption as LangRecord & { translationStatus: Record<string, string> };
  const photo2Caption = page.content.photo2Caption as LangRecord & { translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const headingColor = (page.content.headingColor as string) || '#1A1A1A';
  const bodyColor = (page.content.bodyColor as string) || '#1A1A1A';
  const bulletColor = (page.content.bulletColor as string) || '#FBB931';
  const captionColor = (page.content.captionColor as string) || '#333333';
  const photo1ShowCaption = (page.content.photo1ShowCaption as string) !== 'false';
  const photo2ShowCaption = (page.content.photo2ShowCaption as string) !== 'false';
  const sectionsDataRaw = (page.content.sectionsData as string) || '[]';
  const logoImageKey = (page.content.logoImage as string) || '';
  const photo1Key = (page.content.photo1 as string) || '';
  const photo2Key = (page.content.photo2 as string) || '';

  const [sections, setSections] = useState<SectionData[]>([]);
  const [logoData, setLogoData] = useState<string | null>(null);
  const [photo1Data, setPhoto1Data] = useState<string | null>(null);
  const [photo2Data, setPhoto2Data] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photo1InputRef = useRef<HTMLInputElement>(null);
  const photo2InputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(sectionsDataRaw);
      setSections(parsed.length > 0 ? parsed : [createDefaultSection()]);
    } catch {
      setSections([createDefaultSection()]);
    }
  }, []); // Only on mount

  useEffect(() => {
    if (!logoImageKey) { setLogoData(null); return; }
    loadImage(logoImageKey).then((data) => setLogoData(data));
  }, [logoImageKey]);

  useEffect(() => {
    if (!photo1Key) { setPhoto1Data(null); return; }
    loadImage(photo1Key).then((data) => setPhoto1Data(data));
  }, [photo1Key]);

  useEffect(() => {
    if (!photo2Key) { setPhoto2Data(null); return; }
    loadImage(photo2Key).then((data) => setPhoto2Data(data));
  }, [photo2Key]);

  const syncSections = useCallback(
    (updated: SectionData[]) => {
      setSections(updated);
      updateStringField(page.id, 'sectionsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  // Section operations
  const addSection = useCallback(() => {
    if (sections.length >= MAX_SECTIONS) return;
    syncSections([...sections, createDefaultSection()]);
  }, [sections, syncSections]);

  const removeSection = useCallback(
    (idx: number) => {
      if (sections.length <= MIN_SECTIONS) return;
      syncSections(sections.filter((_, i) => i !== idx));
    },
    [sections, syncSections]
  );

  const moveSection = useCallback(
    (idx: number, direction: 'up' | 'down') => {
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sections.length) return;
      const updated = [...sections];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncSections(updated);
    },
    [sections, syncSections]
  );

  const updateSectionHeading = useCallback(
    (idx: number, lang: Language, value: string) => {
      const updated = [...sections];
      updated[idx] = { ...updated[idx], heading: { ...updated[idx].heading, [lang]: value } };
      syncSections(updated);
    },
    [sections, syncSections]
  );

  // Bullet operations
  const addBullet = useCallback(
    (sectionIdx: number) => {
      const section = sections[sectionIdx];
      if (section.bullets.length >= MAX_BULLETS) return;
      const updated = [...sections];
      updated[sectionIdx] = { ...section, bullets: [...section.bullets, createEmptyLang()] };
      syncSections(updated);
    },
    [sections, syncSections]
  );

  const removeBullet = useCallback(
    (sectionIdx: number, bulletIdx: number) => {
      const section = sections[sectionIdx];
      if (section.bullets.length <= MIN_BULLETS) return;
      const updated = [...sections];
      updated[sectionIdx] = { ...section, bullets: section.bullets.filter((_, i) => i !== bulletIdx) };
      syncSections(updated);
    },
    [sections, syncSections]
  );

  const updateBullet = useCallback(
    (sectionIdx: number, bulletIdx: number, lang: Language, value: string) => {
      const updated = [...sections];
      const section = { ...updated[sectionIdx] };
      const bullets = [...section.bullets];
      bullets[bulletIdx] = { ...bullets[bulletIdx], [lang]: value };
      section.bullets = bullets;
      updated[sectionIdx] = section;
      syncSections(updated);
    },
    [sections, syncSections]
  );

  // Image upload helper
  const processImageFile = useCallback(
    async (file: File, fieldKey: string, setData: (d: string | null) => void) => {
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
        setData(base64);
        updateStringField(page.id, fieldKey, key);
      } catch {
        setImageError('Upload failed. Try again.');
      }
    },
    [page.id, updateStringField]
  );

  const clearImage = useCallback(
    (fieldKey: string, setData: (d: string | null) => void) => {
      setData(null);
      updateStringField(page.id, fieldKey, '');
    },
    [page.id, updateStringField]
  );

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Text + Images
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

      {/* Colors */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-2">Colors</label>
        <div className="grid grid-cols-2 gap-3">
          <fieldset>
            <label className="block text-[10px] text-[#999] mb-1">Headings</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={headingColor}
                onChange={(e) => updateStringField(page.id, 'headingColor', e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
              />
              <input
                type="text"
                value={headingColor}
                onChange={(e) => updateStringField(page.id, 'headingColor', e.target.value)}
                maxLength={7}
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
          <fieldset>
            <label className="block text-[10px] text-[#999] mb-1">Body Text</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bodyColor}
                onChange={(e) => updateStringField(page.id, 'bodyColor', e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
              />
              <input
                type="text"
                value={bodyColor}
                onChange={(e) => updateStringField(page.id, 'bodyColor', e.target.value)}
                maxLength={7}
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
          <fieldset>
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
          <fieldset>
            <label className="block text-[10px] text-[#999] mb-1">Captions</label>
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
                className="flex-1 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          </fieldset>
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Sections ({sections.length}/{MAX_SECTIONS})
          </label>
          <button
            onClick={addSection}
            disabled={sections.length >= MAX_SECTIONS}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Section
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((section, si) => (
            <div
              key={section.id}
              className="border border-[#E5E5E5] rounded p-3 space-y-3"
              style={{ background: '#FAFAFA' }}
            >
              {/* Section header with controls */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#999] uppercase">
                  Section {si + 1}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => moveSection(si, 'up')}
                    disabled={si === 0}
                    className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveSection(si, 'down')}
                    disabled={si === sections.length - 1}
                    className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeSection(si)}
                    disabled={sections.length <= MIN_SECTIONS}
                    className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                    style={{ color: '#999' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Heading */}
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Heading</label>
                <LanguageTabs
                  field={asTranslatableField(section.heading)}
                  onChange={(lang, value) => updateSectionHeading(si, lang, value)}
                  placeholder="Section heading"
                />
              </fieldset>

              {/* Bullets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] text-[#999]">
                    Bullets ({section.bullets.length}/{MAX_BULLETS})
                  </label>
                  <button
                    onClick={() => addBullet(si)}
                    disabled={section.bullets.length >= MAX_BULLETS}
                    className="px-1.5 py-0.5 text-[9px] rounded transition-colors disabled:opacity-30"
                    style={{ background: '#FBB931', color: '#1A1A1A' }}
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-1.5">
                  {section.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex gap-1">
                      <div className="flex-1">
                        <LanguageTabs
                          field={asTranslatableField(bullet)}
                          onChange={(lang, value) => updateBullet(si, bi, lang, value)}
                          placeholder={`Bullet ${bi + 1}`}
                        />
                      </div>
                      <div className="flex flex-col pt-5">
                        <button
                          onClick={() => removeBullet(si, bi)}
                          disabled={section.bullets.length <= MIN_BULLETS}
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
          ))}
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* Logo image */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-1">Logo Image (optional)</label>
        {logoData ? (
          <div className="flex items-center gap-2">
            <img
              src={logoData}
              alt=""
              className="w-20 h-12 object-contain rounded border border-[#E5E5E5]"
            />
            <button
              onClick={() => clearImage('logoImage', setLogoData)}
              className="text-[10px] text-red-500 hover:underline"
            >
              ✕ remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            className="flex items-center justify-center w-20 h-12 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
            style={{ borderColor: '#CCCCCC' }}
            title="Upload logo"
          >
            <span className="text-xs text-[#999]">+ Upload</span>
          </button>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept={IMAGE_ACCEPTED}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processImageFile(file, 'logoImage', setLogoData);
            e.target.value = '';
          }}
          className="hidden"
          aria-label="Upload logo image"
        />
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* Photo 1 */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-1">Photo 1 (optional)</label>
        {photo1Data ? (
          <div className="flex items-center gap-2">
            <img
              src={photo1Data}
              alt=""
              className="w-20 h-12 object-cover rounded border border-[#E5E5E5]"
            />
            <button
              onClick={() => clearImage('photo1', setPhoto1Data)}
              className="text-[10px] text-red-500 hover:underline"
            >
              ✕ remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => photo1InputRef.current?.click()}
            className="flex items-center justify-center w-20 h-12 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
            style={{ borderColor: '#CCCCCC' }}
            title="Upload photo 1"
          >
            <span className="text-xs text-[#999]">+ Upload</span>
          </button>
        )}
        <input
          ref={photo1InputRef}
          type="file"
          accept={IMAGE_ACCEPTED}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processImageFile(file, 'photo1', setPhoto1Data);
            e.target.value = '';
          }}
          className="hidden"
          aria-label="Upload photo 1"
        />

        {/* Photo 1 caption toggle + field */}
        <div className="mt-2">
          <label className="flex items-center gap-2 text-[10px] text-[#999]">
            <input
              type="checkbox"
              checked={photo1ShowCaption}
              onChange={(e) => updateStringField(page.id, 'photo1ShowCaption', e.target.checked ? 'true' : 'false')}
              className="rounded"
            />
            Show caption
          </label>
          {photo1ShowCaption && (
            <div className="mt-1">
              <LanguageTabs
                field={photo1Caption as any}
                onChange={(lang, value) => updateTranslatableField(page.id, 'photo1Caption', lang, value)}
                placeholder="Photo 1 caption"
              />
            </div>
          )}
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* Photo 2 */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-1">Photo 2 (optional)</label>
        {photo2Data ? (
          <div className="flex items-center gap-2">
            <img
              src={photo2Data}
              alt=""
              className="w-20 h-12 object-cover rounded border border-[#E5E5E5]"
            />
            <button
              onClick={() => clearImage('photo2', setPhoto2Data)}
              className="text-[10px] text-red-500 hover:underline"
            >
              ✕ remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => photo2InputRef.current?.click()}
            className="flex items-center justify-center w-20 h-12 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
            style={{ borderColor: '#CCCCCC' }}
            title="Upload photo 2"
          >
            <span className="text-xs text-[#999]">+ Upload</span>
          </button>
        )}
        <input
          ref={photo2InputRef}
          type="file"
          accept={IMAGE_ACCEPTED}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processImageFile(file, 'photo2', setPhoto2Data);
            e.target.value = '';
          }}
          className="hidden"
          aria-label="Upload photo 2"
        />

        {/* Photo 2 caption toggle + field */}
        <div className="mt-2">
          <label className="flex items-center gap-2 text-[10px] text-[#999]">
            <input
              type="checkbox"
              checked={photo2ShowCaption}
              onChange={(e) => updateStringField(page.id, 'photo2ShowCaption', e.target.checked ? 'true' : 'false')}
              className="rounded"
            />
            Show caption
          </label>
          {photo2ShowCaption && (
            <div className="mt-1">
              <LanguageTabs
                field={photo2Caption as any}
                onChange={(lang, value) => updateTranslatableField(page.id, 'photo2Caption', lang, value)}
                placeholder="Photo 2 caption"
              />
            </div>
          )}
        </div>
      </div>

      {imageError && (
        <p className="text-[10px] text-red-500 mt-0.5">{imageError}</p>
      )}
    </div>
  );
}
