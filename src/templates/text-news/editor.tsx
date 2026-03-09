import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentation-store';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/image-store';
import LanguageTabs from '../../components/language-tabs';

interface NewsImageEntry {
  id: string;
  imageKey: string;
  caption: Record<string, string>; // { en, zh-tw, zh-cn }
}

interface BulletEntry {
  en: string;
  'zh-tw': string;
  'zh-cn': string;
}

const MAX_IMAGES = 4;
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_ACCEPTED = '.jpg,.jpeg,.png,.webp';

interface TextNewsEditorProps {
  page: Page;
}

export default function TextNewsEditor({ page }: TextNewsEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const heading = page.content.heading as TranslatableField;
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const bulletsDataRaw = (page.content.bulletsData as string) || '[]';
  const newsImagesDataRaw = (page.content.newsImagesData as string) || '[]';

  const [bullets, setBullets] = useState<BulletEntry[]>([]);
  const [newsImages, setNewsImages] = useState<NewsImageEntry[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, string | null>>({});
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Language>('en');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Parse bullets on mount
  useEffect(() => {
    try {
      const parsed: BulletEntry[] = JSON.parse(bulletsDataRaw);
      setBullets(parsed.length > 0 ? parsed : [{ en: '', 'zh-tw': '', 'zh-cn': '' }]);
    } catch {
      setBullets([{ en: '', 'zh-tw': '', 'zh-cn': '' }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Parse news images on mount
  useEffect(() => {
    try {
      const parsed: NewsImageEntry[] = JSON.parse(newsImagesDataRaw);
      setNewsImages(parsed.length > 0 ? parsed : [{ id: crypto.randomUUID(), imageKey: '', caption: { en: '', 'zh-tw': '', 'zh-cn': '' } }]);
    } catch {
      setNewsImages([{ id: crypto.randomUUID(), imageKey: '', caption: { en: '', 'zh-tw': '', 'zh-cn': '' } }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all news images from IndexedDB
  useEffect(() => {
    if (newsImages.length === 0) return;
    const loadAll = async () => {
      const map: Record<string, string | null> = {};
      for (const img of newsImages) {
        map[img.id] = img.imageKey ? await loadImage(img.imageKey) : null;
      }
      setImageMap(map);
    };
    loadAll();
  }, [newsImages]);

  // ── Bullets ──────────────────────────────────────────────────────────────────

  const syncBullets = useCallback(
    (updated: BulletEntry[]) => {
      setBullets(updated);
      updateStringField(page.id, 'bulletsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const addBullet = useCallback(() => {
    syncBullets([...bullets, { en: '', 'zh-tw': '', 'zh-cn': '' }]);
  }, [bullets, syncBullets]);

  const removeBullet = useCallback(
    (idx: number) => {
      if (bullets.length <= 1) return;
      syncBullets(bullets.filter((_, i) => i !== idx));
    },
    [bullets, syncBullets]
  );

  const updateBulletText = useCallback(
    (idx: number, lang: Language, value: string) => {
      const updated = bullets.map((b, i) => (i === idx ? { ...b, [lang]: value } : b));
      syncBullets(updated);
    },
    [bullets, syncBullets]
  );

  // ── News Images ───────────────────────────────────────────────────────────────

  const syncImages = useCallback(
    (updated: NewsImageEntry[]) => {
      setNewsImages(updated);
      updateStringField(page.id, 'newsImagesData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const addImage = useCallback(() => {
    if (newsImages.length >= MAX_IMAGES) return;
    syncImages([...newsImages, { id: crypto.randomUUID(), imageKey: '', caption: { en: '', 'zh-tw': '', 'zh-cn': '' } }]);
  }, [newsImages, syncImages]);

  const removeImage = useCallback(
    (idx: number) => {
      if (newsImages.length <= 1) return;
      syncImages(newsImages.filter((_, i) => i !== idx));
    },
    [newsImages, syncImages]
  );

  const handleImageUpload = useCallback(
    async (idx: number, file: File) => {
      setImageError(null);
      if (file.size > IMAGE_MAX_SIZE) {
        setImageError('Image too large (max 5 MB).');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        const key = `img-${crypto.randomUUID()}`;
        await saveImage(key, base64);
        const updated = newsImages.map((img, i) =>
          i === idx ? { ...img, imageKey: key } : img
        );
        syncImages(updated);
        setImageMap((m) => ({ ...m, [newsImages[idx].id]: base64 }));
      } catch {
        setImageError('Upload failed.');
      }
    },
    [newsImages, syncImages]
  );

  const updateCaption = useCallback(
    (idx: number, lang: Language, value: string) => {
      const updated = newsImages.map((img, i) =>
        i === idx ? { ...img, caption: { ...img.caption, [lang]: value } } : img
      );
      syncImages(updated);
    },
    [newsImages, syncImages]
  );

  const onChange = useCallback(
    (field: string) => (lang: Language, value: string) => {
      updateTranslatableField(page.id, field, lang, value);
    },
    [page.id, updateTranslatableField]
  );

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Text + News
      </h2>

      {/* Section Label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel}
          onChange={onChange('sectionLabel')}
          placeholder="e.g. 05 | Media"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={(e) => updateStringField(page.id, 'year', e.target.value)}
          className="w-full text-sm border border-[#C8C8C8] rounded px-2 py-1.5 bg-white text-[#1A1A1A]"
          placeholder="2026"
        />
      </fieldset>

      {/* Page Number */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Page Number</label>
        <input
          type="text"
          value={pageNumber}
          onChange={(e) => updateStringField(page.id, 'pageNumber', e.target.value)}
          className="w-full text-sm border border-[#C8C8C8] rounded px-2 py-1.5 bg-white text-[#1A1A1A]"
          placeholder="26"
        />
      </fieldset>

      {/* Heading */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Heading</label>
        <LanguageTabs
          field={heading}
          onChange={onChange('heading')}
          placeholder="Left column heading"
        />
      </fieldset>

      {/* Bullets */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-2">Bullets</label>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {(['en', 'zh-tw', 'zh-cn'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                borderRadius: 4,
                border: '1px solid #C8C8C8',
                background: activeLang === lang ? '#FBB931' : '#F2F2F2',
                fontWeight: activeLang === lang ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {lang === 'en' ? 'EN' : lang === 'zh-tw' ? 'zh-TW' : 'zh-CN'}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {bullets.map((bullet, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <input
                type="text"
                value={bullet[activeLang] || ''}
                onChange={(e) => updateBulletText(idx, activeLang, e.target.value)}
                className="flex-1 text-sm border border-[#C8C8C8] rounded px-2 py-1.5 bg-white text-[#1A1A1A]"
                placeholder={`Bullet ${idx + 1}`}
              />
              <button
                onClick={() => removeBullet(idx)}
                disabled={bullets.length <= 1}
                style={{
                  flexShrink: 0,
                  padding: '4px 8px',
                  fontSize: 12,
                  border: '1px solid #C8C8C8',
                  borderRadius: 4,
                  background: '#F2F2F2',
                  color: '#5E5E5E',
                  cursor: bullets.length <= 1 ? 'not-allowed' : 'pointer',
                  opacity: bullets.length <= 1 ? 0.4 : 1,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addBullet}
          style={{
            marginTop: 8,
            padding: '4px 12px',
            fontSize: 12,
            border: '1px solid #C8C8C8',
            borderRadius: 4,
            background: '#F2F2F2',
            color: '#1A1A1A',
            cursor: 'pointer',
          }}
        >
          + Add bullet
        </button>
      </fieldset>

      {/* News Images */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-2">
          News screenshots (up to {MAX_IMAGES})
        </label>
        {imageError && (
          <p style={{ fontSize: 11, color: '#D32F2F', marginBottom: 8 }}>{imageError}</p>
        )}
        <div className="space-y-4">
          {newsImages.map((img, idx) => (
            <div key={img.id} style={{ border: '1px solid #C8C8C8', borderRadius: 6, padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A' }}>
                  Image {idx + 1}
                </span>
                {newsImages.length > 1 && (
                  <button
                    onClick={() => removeImage(idx)}
                    style={{
                      fontSize: 11,
                      border: 'none',
                      background: 'none',
                      color: '#5E5E5E',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Image preview / upload */}
              {imageMap[img.id] ? (
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <img
                    src={imageMap[img.id]!}
                    alt=""
                    style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <button
                    onClick={() => {
                      if (fileInputRefs.current[img.id]) {
                        fileInputRefs.current[img.id]!.click();
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      padding: '2px 8px',
                      fontSize: 11,
                      border: 'none',
                      borderRadius: 4,
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (fileInputRefs.current[img.id]) {
                      fileInputRefs.current[img.id]!.click();
                    }
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '16px',
                    fontSize: 12,
                    border: '2px dashed #C8C8C8',
                    borderRadius: 6,
                    background: '#F2F2F2',
                    color: '#5E5E5E',
                    cursor: 'pointer',
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Click to upload screenshot
                </button>
              )}
              <input
                ref={(el) => { fileInputRefs.current[img.id] = el; }}
                type="file"
                accept={IMAGE_ACCEPTED}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(idx, file);
                  e.target.value = '';
                }}
              />

              {/* Caption */}
              <label style={{ fontSize: 11, color: '#5E5E5E', display: 'block', marginBottom: 4 }}>
                Caption (optional)
              </label>
              <LanguageTabs
                field={{
                  en: img.caption.en || '',
                  'zh-tw': img.caption['zh-tw'] || '',
                  'zh-cn': img.caption['zh-cn'] || '',
                  translationStatus: { 'zh-tw': 'empty', 'zh-cn': 'empty' },
                }}
                onChange={(lang, value) => updateCaption(idx, lang, value)}
                placeholder="Image caption"
              />
            </div>
          ))}
        </div>
        {newsImages.length < MAX_IMAGES && (
          <button
            onClick={addImage}
            style={{
              marginTop: 8,
              padding: '4px 12px',
              fontSize: 12,
              border: '1px solid #C8C8C8',
              borderRadius: 4,
              background: '#F2F2F2',
              color: '#1A1A1A',
              cursor: 'pointer',
            }}
          >
            + Add image
          </button>
        )}
      </fieldset>
    </div>
  );
}
