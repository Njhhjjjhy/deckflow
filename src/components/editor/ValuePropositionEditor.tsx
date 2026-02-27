import { useState, useEffect, useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';
import ImageUpload from './ImageUpload';

interface ValuePropositionEditorProps {
  page: Page;
}

export default function ValuePropositionEditor({ page }: ValuePropositionEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const badge1Label = page.content.badge1Label as TranslatableField;
  const badge2Label = page.content.badge2Label as TranslatableField;
  const badge3Label = page.content.badge3Label as TranslatableField;
  const bodyText = page.content.bodyText as TranslatableField;

  const badge1IconKey = (page.content.badge1Icon as string) || '';
  const badge2IconKey = (page.content.badge2Icon as string) || '';
  const badge3IconKey = (page.content.badge3Icon as string) || '';

  const accentBarVisible = (page.content.accentBarVisible as string) !== 'false';
  const accentBarColor = (page.content.accentBarColor as string) || '#FBB931';

  const [badge1IconData, setBadge1IconData] = useState<string | null>(null);
  const [badge2IconData, setBadge2IconData] = useState<string | null>(null);
  const [badge3IconData, setBadge3IconData] = useState<string | null>(null);

  useEffect(() => {
    if (!badge1IconKey) { setBadge1IconData(null); return; }
    loadImage(badge1IconKey).then((data) => setBadge1IconData(data));
  }, [badge1IconKey]);

  useEffect(() => {
    if (!badge2IconKey) { setBadge2IconData(null); return; }
    loadImage(badge2IconKey).then((data) => setBadge2IconData(data));
  }, [badge2IconKey]);

  useEffect(() => {
    if (!badge3IconKey) { setBadge3IconData(null); return; }
    loadImage(badge3IconKey).then((data) => setBadge3IconData(data));
  }, [badge3IconKey]);

  const onFieldChange = useCallback(
    (fieldKey: string) => (lang: Language, value: string) => {
      updateTranslatableField(page.id, fieldKey, lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onIconUpload = useCallback(
    (fieldKey: string, setData: (data: string | null) => void) =>
      (imageKey: string, base64: string) => {
        updateStringField(page.id, fieldKey, imageKey);
        setData(base64);
      },
    [page.id, updateStringField]
  );

  const onIconClear = useCallback(
    (fieldKey: string, setData: (data: string | null) => void) => () => {
      updateStringField(page.id, fieldKey, '');
      setData(null);
    },
    [page.id, updateStringField]
  );

  const onToggleAccentBar = useCallback(() => {
    updateStringField(page.id, 'accentBarVisible', accentBarVisible ? 'false' : 'true');
  }, [page.id, accentBarVisible, updateStringField]);

  const onAccentColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStringField(page.id, 'accentBarColor', e.target.value);
    },
    [page.id, updateStringField]
  );

  const badges = [
    { label: badge1Label, iconKey: badge1IconKey, iconData: badge1IconData, field: 'badge1', setData: setBadge1IconData },
    { label: badge2Label, iconKey: badge2IconKey, iconData: badge2IconData, field: 'badge2', setData: setBadge2IconData },
    { label: badge3Label, iconKey: badge3IconKey, iconData: badge3IconData, field: 'badge3', setData: setBadge3IconData },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Value Proposition
      </h2>

      {/* Accent bar controls */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Accent Bar</label>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAccentBar}
            className="px-3 py-1.5 text-xs rounded border transition-colors"
            style={{
              background: accentBarVisible ? '#FBB931' : '#fff',
              borderColor: accentBarVisible ? '#FBB931' : '#E5E5E5',
              color: '#1A1A1A',
              fontWeight: accentBarVisible ? 600 : 400,
            }}
          >
            {accentBarVisible ? 'Visible' : 'Hidden'}
          </button>
          {accentBarVisible && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentBarColor}
                onChange={onAccentColorChange}
                className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer p-0"
                title="Accent bar color"
              />
              <input
                type="text"
                value={accentBarColor}
                onChange={onAccentColorChange}
                maxLength={7}
                className="w-20 px-2 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931] font-mono"
                style={{ color: '#1A1A1A' }}
              />
            </div>
          )}
        </div>
      </fieldset>

      {/* Three badges */}
      {badges.map((badge, i) => (
        <fieldset key={i}>
          <label className="block text-xs font-medium text-[#333] mb-1">
            Badge {i + 1}
          </label>
          <div className="space-y-2">
            <LanguageTabs
              field={badge.label}
              onChange={onFieldChange(`badge${i + 1}Label`)}
              placeholder={`e.g. Badge ${i + 1} label`}
            />
            <div>
              <span className="block text-[10px] text-[#999] mb-1">Icon (optional — defaults to checkmark)</span>
              <ImageUpload
                value={badge.iconKey}
                imageData={badge.iconData}
                onUpload={onIconUpload(`badge${i + 1}Icon`, badge.setData)}
                onClear={onIconClear(`badge${i + 1}Icon`, badge.setData)}
              />
            </div>
          </div>
        </fieldset>
      ))}

      {/* Body text */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Body Text</label>
        <LanguageTabs
          field={bodyText}
          onChange={onFieldChange('bodyText')}
          multiline
          placeholder="Main paragraph text. Use **bold** for emphasis."
        />
        <p className="text-[10px] text-[#999] mt-1">
          Wrap text in **double asterisks** for bold.
        </p>
      </fieldset>
    </div>
  );
}
