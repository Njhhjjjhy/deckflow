import { useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import LanguageTabs from './LanguageTabs';

interface DisclaimerPageEditorProps {
  page: Page;
}

export default function DisclaimerPageEditor({ page }: DisclaimerPageEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const disclaimerText = page.content.disclaimerText as TranslatableField;
  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const year = (page.content.year as string) || '';

  const onDisclaimerTextChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'disclaimerText', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onSectionLabelChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'sectionLabel', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Disclaimer
      </h2>

      {/* Disclaimer Text */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Disclaimer Text</label>
        <LanguageTabs
          field={disclaimerText}
          onChange={onDisclaimerTextChange}
          placeholder="Enter disclaimer / legal text…"
          multiline
        />
      </fieldset>

      {/* Section Label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel}
          onChange={onSectionLabelChange}
          placeholder="Disclaimer"
        />
        <span className="text-[10px] text-[#999] mt-0.5 block">
          Defaults to "Disclaimer" if empty
        </span>
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
