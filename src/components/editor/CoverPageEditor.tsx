import { useState, useEffect, useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';
import ImageUpload from './ImageUpload';

interface CoverPageEditorProps {
  page: Page;
}

export default function CoverPageEditor({ page }: CoverPageEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const headline = page.content.headline as TranslatableField;
  const year = (page.content.year as string) || '';
  const heroImageKey = (page.content.heroImage as string) || '';

  const [heroImageData, setHeroImageData] = useState<string | null>(null);

  // Load image from IndexedDB when key changes
  useEffect(() => {
    if (!heroImageKey) {
      setHeroImageData(null);
      return;
    }
    loadImage(heroImageKey).then((data) => setHeroImageData(data));
  }, [heroImageKey]);

  const onHeadlineChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'headline', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onYearChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStringField(page.id, 'year', e.target.value);
    },
    [page.id, updateStringField]
  );

  const onImageUpload = useCallback(
    (imageKey: string, base64: string) => {
      updateStringField(page.id, 'heroImage', imageKey);
      setHeroImageData(base64);
    },
    [page.id, updateStringField]
  );

  const onImageClear = useCallback(() => {
    updateStringField(page.id, 'heroImage', '');
    setHeroImageData(null);
  }, [page.id, updateStringField]);

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Cover Page
      </h2>

      {/* Headline */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Headline</label>
        <LanguageTabs
          field={headline}
          onChange={onHeadlineChange}
          multiline
          placeholder="e.g. Japanese\nproperty investment\n**made easy.**"
        />
        <p className="text-[10px] text-[#999] mt-1">
          Use \n for line breaks. Wrap text in **double asterisks** for bold.
        </p>
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={onYearChange}
          placeholder="2026"
          maxLength={10}
          className="w-24 px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
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
      </fieldset>
    </div>
  );
}
