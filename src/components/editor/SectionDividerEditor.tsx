import { useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import LanguageTabs from './LanguageTabs';

interface SectionDividerEditorProps {
  page: Page;
}

export default function SectionDividerEditor({ page }: SectionDividerEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);

  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const sectionNumber = page.content.sectionNumber as TranslatableField;
  const sectionTitle = page.content.sectionTitle as TranslatableField;

  const onLabelChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'sectionLabel', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onNumberChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'sectionNumber', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onTitleChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'sectionTitle', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Section Divider
      </h2>

      {/* Section Label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel}
          onChange={onLabelChange}
          placeholder="e.g. Section A"
        />
      </fieldset>

      {/* Section Number */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Number</label>
        <LanguageTabs
          field={sectionNumber}
          onChange={onNumberChange}
          placeholder="e.g. 01"
        />
      </fieldset>

      {/* Section Title */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Title</label>
        <LanguageTabs
          field={sectionTitle}
          onChange={onTitleChange}
          placeholder="e.g. Background story & track record"
        />
      </fieldset>
    </div>
  );
}
