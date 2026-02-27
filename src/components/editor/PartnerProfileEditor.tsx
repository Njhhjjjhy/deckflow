import { useCallback, useEffect, useState } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';
import ImageUpload from './ImageUpload';

interface PartnerProfileEditorProps {
  page: Page;
}

export default function PartnerProfileEditor({ page }: PartnerProfileEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const partnerLogoKey = (page.content.partnerLogoImage as string) || '';
  const bodyParagraph = page.content.bodyParagraph as TranslatableField;
  const showLinks = (page.content.showLinks as string) === 'true';
  const linkLabel = page.content.linkLabel as TranslatableField;
  const linkUrl = page.content.linkUrl as TranslatableField;
  const contactLine1 = page.content.contactLine1 as TranslatableField;
  const contactLine2 = page.content.contactLine2 as TranslatableField;
  const contactLine3 = page.content.contactLine3 as TranslatableField;
  const contactLine4 = page.content.contactLine4 as TranslatableField;
  const contactLine5 = page.content.contactLine5 as TranslatableField;
  const bottomUrl = page.content.bottomUrl as TranslatableField;
  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const year = (page.content.year as string) || '';

  const [logoImageData, setLogoImageData] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerLogoKey) { setLogoImageData(null); return; }
    loadImage(partnerLogoKey).then((data) => setLogoImageData(data));
  }, [partnerLogoKey]);

  const onFieldChange = useCallback(
    (fieldKey: string) => (lang: Language, value: string) => {
      updateTranslatableField(page.id, fieldKey, lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onLogoUpload = useCallback(
    (imageKey: string, base64: string) => {
      updateStringField(page.id, 'partnerLogoImage', imageKey);
      setLogoImageData(base64);
    },
    [page.id, updateStringField]
  );

  const onLogoClear = useCallback(() => {
    updateStringField(page.id, 'partnerLogoImage', '');
    setLogoImageData(null);
  }, [page.id, updateStringField]);

  const contactLineFields = [
    { key: 'contactLine1', field: contactLine1, num: 1 },
    { key: 'contactLine2', field: contactLine2, num: 2 },
    { key: 'contactLine3', field: contactLine3, num: 3 },
    { key: 'contactLine4', field: contactLine4, num: 4 },
    { key: 'contactLine5', field: contactLine5, num: 5 },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Partner Profile
      </h2>

      {/* Partner Logo */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Partner Logo</label>
        <ImageUpload
          value={partnerLogoKey}
          imageData={logoImageData}
          onUpload={onLogoUpload}
          onClear={onLogoClear}
        />
      </fieldset>

      {/* Body Paragraph */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Body Paragraph</label>
        <LanguageTabs
          field={bodyParagraph}
          onChange={onFieldChange('bodyParagraph')}
          multiline
          placeholder="Partner description text..."
        />
        <p className="text-[10px] text-[#999] mt-1">
          Wrap text in **double asterisks** for bold.
        </p>
      </fieldset>

      {/* Labeled Link Section */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">
          Labeled Link Section
        </label>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => updateStringField(page.id, 'showLinks', showLinks ? 'false' : 'true')}
            className="px-3 py-1.5 text-xs rounded border transition-colors"
            style={{
              background: showLinks ? '#FBB931' : '#fff',
              borderColor: showLinks ? '#FBB931' : '#E5E5E5',
              color: '#1A1A1A',
              fontWeight: showLinks ? 600 : 400,
            }}
          >
            {showLinks ? 'Visible' : 'Hidden'}
          </button>
        </div>
        {showLinks && (
          <div className="space-y-2 pl-2 border-l-2 border-[#FBB931]">
            <div>
              <span className="block text-[10px] text-[#999] mb-1">Label (bold)</span>
              <LanguageTabs
                field={linkLabel}
                onChange={onFieldChange('linkLabel')}
                placeholder="e.g. For more information:"
              />
            </div>
            <div>
              <span className="block text-[10px] text-[#999] mb-1">URL</span>
              <LanguageTabs
                field={linkUrl}
                onChange={onFieldChange('linkUrl')}
                placeholder="e.g. https://example.com"
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Contact Block */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">
          Contact Block (bottom-left)
        </label>
        <div className="space-y-2 pl-2 border-l-2 border-[#FBB931]">
          {contactLineFields.map((cl) => (
            <div key={cl.key}>
              <span className="block text-[10px] text-[#999] mb-1">Line {cl.num}</span>
              <LanguageTabs
                field={cl.field}
                onChange={onFieldChange(cl.key)}
                placeholder={`Contact line ${cl.num}`}
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Bottom URL */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">URL (bottom-right)</label>
        <LanguageTabs
          field={bottomUrl}
          onChange={onFieldChange('bottomUrl')}
          placeholder="e.g. www.moreharvest.com"
        />
      </fieldset>

      {/* Section Label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel}
          onChange={onFieldChange('sectionLabel')}
          placeholder="e.g. 05 | Partners"
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
    </div>
  );
}
