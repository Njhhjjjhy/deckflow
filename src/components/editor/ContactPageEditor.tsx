import { useState, useEffect, useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';
import ImageUpload from './ImageUpload';

interface ContactPageEditorProps {
  page: Page;
}

export default function ContactPageEditor({ page }: ContactPageEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const companyName = page.content.companyName as TranslatableField;
  const phone = page.content.phone as TranslatableField;
  const email = page.content.email as TranslatableField;
  const address = page.content.address as TranslatableField;
  const url = page.content.url as TranslatableField;
  const year = (page.content.year as string) || '';
  const logoImageKey = (page.content.logoImage as string) || '';

  const [logoImageData, setLogoImageData] = useState<string | null>(null);

  useEffect(() => {
    if (!logoImageKey) {
      setLogoImageData(null);
      return;
    }
    loadImage(logoImageKey).then((data) => setLogoImageData(data));
  }, [logoImageKey]);

  const onLogoUpload = useCallback(
    (imageKey: string, base64: string) => {
      updateStringField(page.id, 'logoImage', imageKey);
      setLogoImageData(base64);
    },
    [page.id, updateStringField]
  );

  const onLogoClear = useCallback(() => {
    updateStringField(page.id, 'logoImage', '');
    setLogoImageData(null);
  }, [page.id, updateStringField]);

  const onCompanyNameChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'companyName', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onPhoneChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'phone', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onEmailChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'email', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onAddressChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'address', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onUrlChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'url', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Contact / Closing
      </h2>

      {/* Logo Image */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Logo Image</label>
        <ImageUpload
          value={logoImageKey}
          imageData={logoImageData}
          onUpload={onLogoUpload}
          onClear={onLogoClear}
        />
        <span className="text-[10px] text-[#999] mt-0.5 block">
          Replaces the default MoreHarvest icon. Leave empty for default.
        </span>
      </fieldset>

      {/* Company Name */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Company Name</label>
        <LanguageTabs
          field={companyName}
          onChange={onCompanyNameChange}
          placeholder="e.g. MoreHarvest"
        />
      </fieldset>

      {/* Phone */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Phone</label>
        <LanguageTabs
          field={phone}
          onChange={onPhoneChange}
          placeholder="e.g. +81 3-1234-5678"
        />
      </fieldset>

      {/* Email */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Email</label>
        <LanguageTabs
          field={email}
          onChange={onEmailChange}
          placeholder="e.g. info@moreharvest.jp"
        />
      </fieldset>

      {/* Address */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Address</label>
        <LanguageTabs
          field={address}
          onChange={onAddressChange}
          placeholder="e.g. Tokyo, Japan"
          multiline
        />
      </fieldset>

      {/* URL */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">URL</label>
        <LanguageTabs
          field={url}
          onChange={onUrlChange}
          placeholder="e.g. www.moreharvest.jp"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={(e) => updateStringField(page.id, 'year', e.target.value)}
          placeholder={new Date().getFullYear().toString()}
          maxLength={10}
          className="w-full px-2 py-1.5 text-sm rounded border border-[#E5E5E5] focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A', background: '#fff' }}
        />
        <span className="text-[10px] text-[#999] mt-0.5 block">
          Defaults to current year if empty
        </span>
      </fieldset>
    </div>
  );
}
