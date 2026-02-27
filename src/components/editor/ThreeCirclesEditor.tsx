import { useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import LanguageTabs from './LanguageTabs';

interface ThreeCirclesEditorProps {
  page: Page;
}

export default function ThreeCirclesEditor({ page }: ThreeCirclesEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const heading = page.content.heading as TranslatableField;
  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const circle1Heading = page.content.circle1Heading as TranslatableField;
  const circle1Body = page.content.circle1Body as TranslatableField;
  const circle2Heading = page.content.circle2Heading as TranslatableField;
  const circle2Body = page.content.circle2Body as TranslatableField;
  const circle3Heading = page.content.circle3Heading as TranslatableField;
  const circle3Body = page.content.circle3Body as TranslatableField;
  const year = (page.content.year as string) || '';
  const circleBorderColor = (page.content.circleBorderColor as string) || '#FBB931';

  const onFieldChange = useCallback(
    (fieldKey: string) => (lang: Language, value: string) => {
      updateTranslatableField(page.id, fieldKey, lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onYearChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStringField(page.id, 'year', e.target.value);
    },
    [page.id, updateStringField]
  );

  const onBorderColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStringField(page.id, 'circleBorderColor', e.target.value);
    },
    [page.id, updateStringField]
  );

  const circleFields = [
    { num: 1, heading: circle1Heading, body: circle1Body, hKey: 'circle1Heading', bKey: 'circle1Body' },
    { num: 2, heading: circle2Heading, body: circle2Body, hKey: 'circle2Heading', bKey: 'circle2Body' },
    { num: 3, heading: circle3Heading, body: circle3Body, hKey: 'circle3Heading', bKey: 'circle3Body' },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Three Circles
      </h2>

      {/* Page Heading */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Page Heading</label>
        <LanguageTabs
          field={heading}
          onChange={onFieldChange('heading')}
          placeholder="e.g. Our Three Pillars"
        />
      </fieldset>

      {/* Circle fields */}
      {circleFields.map((cf) => (
        <fieldset key={cf.num}>
          <label className="block text-xs font-medium text-[#333] mb-2">
            Circle {cf.num}
          </label>
          <div className="space-y-2 pl-2 border-l-2 border-[#FBB931]">
            <div>
              <span className="block text-[10px] text-[#999] mb-1">Heading</span>
              <LanguageTabs
                field={cf.heading}
                onChange={onFieldChange(cf.hKey)}
                placeholder={`Circle ${cf.num} heading`}
              />
            </div>
            <div>
              <span className="block text-[10px] text-[#999] mb-1">Body</span>
              <LanguageTabs
                field={cf.body}
                onChange={onFieldChange(cf.bKey)}
                multiline
                placeholder={`Circle ${cf.num} body text`}
              />
            </div>
          </div>
        </fieldset>
      ))}

      {/* Circle border color */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Circle Border Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={circleBorderColor}
            onChange={onBorderColorChange}
            className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer p-0"
            title="Circle border color"
          />
          <input
            type="text"
            value={circleBorderColor}
            onChange={onBorderColorChange}
            maxLength={7}
            className="w-20 px-2 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931] font-mono"
            style={{ color: '#1A1A1A' }}
          />
        </div>
      </fieldset>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel}
          onChange={onFieldChange('sectionLabel')}
          placeholder="e.g. 05 | Our Model"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={onYearChange}
          placeholder="e.g. 2025"
          className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A' }}
        />
      </fieldset>
    </div>
  );
}
