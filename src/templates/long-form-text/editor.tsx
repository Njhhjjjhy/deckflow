import { useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentation-store';
import LanguageTabs from '../../components/language-tabs';

interface LongFormTextEditorProps {
  page: Page;
}

export default function LongFormTextEditor({ page }: LongFormTextEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const heading = page.content.heading as TranslatableField;
  const col1Body = page.content.col1Body as TranslatableField;
  const col2Body = page.content.col2Body as TranslatableField;
  const closingStatement = page.content.closingStatement as TranslatableField;
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';

  const onChange = useCallback(
    (field: string) => (lang: Language, value: string) => {
      updateTranslatableField(page.id, field, lang, value);
    },
    [page.id, updateTranslatableField]
  );

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Long-form Text
      </h2>

      {/* Section Label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel}
          onChange={onChange('sectionLabel')}
          placeholder="e.g. 01 | Overview"
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
          placeholder="6"
        />
      </fieldset>

      {/* Heading */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Page Heading</label>
        <LanguageTabs
          field={heading}
          onChange={onChange('heading')}
          placeholder="Page title"
        />
      </fieldset>

      {/* Left Column */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Left Column Body</label>
        <p className="text-xs text-[#5E5E5E] mb-1">Use **bold** for inline emphasis.</p>
        <LanguageTabs
          field={col1Body}
          onChange={onChange('col1Body')}
          placeholder="Left column text..."
          multiline
        />
      </fieldset>

      {/* Right Column */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Right Column Body</label>
        <p className="text-xs text-[#5E5E5E] mb-1">Use **bold** for inline emphasis.</p>
        <LanguageTabs
          field={col2Body}
          onChange={onChange('col2Body')}
          placeholder="Right column text..."
          multiline
        />
      </fieldset>

      {/* Closing Statement */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Closing Statement</label>
        <p className="text-xs text-[#5E5E5E] mb-1">Shown bold at the bottom of the page.</p>
        <LanguageTabs
          field={closingStatement}
          onChange={onChange('closingStatement')}
          placeholder="Closing statement..."
        />
      </fieldset>
    </div>
  );
}
