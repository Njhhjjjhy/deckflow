import { useState, useEffect, useCallback } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';
import ImageUpload from './ImageUpload';

interface DiagramPageEditorProps {
  page: Page;
}

export default function DiagramPageEditor({ page }: DiagramPageEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const branch1Heading = page.content.branch1Heading as TranslatableField;
  const branch1Body = page.content.branch1Body as TranslatableField;
  const branch2Heading = page.content.branch2Heading as TranslatableField;
  const branch2Body = page.content.branch2Body as TranslatableField;
  const branch3Heading = page.content.branch3Heading as TranslatableField;
  const branch3Body = page.content.branch3Body as TranslatableField;

  const logoImageKey = (page.content.logoImage as string) || '';
  const [logoImageData, setLogoImageData] = useState<string | null>(null);

  useEffect(() => {
    if (!logoImageKey) { setLogoImageData(null); return; }
    loadImage(logoImageKey).then((data) => setLogoImageData(data));
  }, [logoImageKey]);

  const onFieldChange = useCallback(
    (fieldKey: string) => (lang: Language, value: string) => {
      updateTranslatableField(page.id, fieldKey, lang, value);
    },
    [page.id, updateTranslatableField]
  );

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

  const branches = [
    { heading: branch1Heading, body: branch1Body, num: 1 },
    { heading: branch2Heading, body: branch2Body, num: 2 },
    { heading: branch3Heading, body: branch3Body, num: 3 },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Diagram / Branching
      </h2>

      {/* Logo image */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Logo Image</label>
        <ImageUpload
          value={logoImageKey}
          imageData={logoImageData}
          onUpload={onLogoUpload}
          onClear={onLogoClear}
        />
        <p className="text-[10px] text-[#999] mt-1">
          Displayed as a circle on the left side.
        </p>
      </fieldset>

      {/* Branches */}
      {branches.map((branch) => (
        <fieldset key={branch.num}>
          <label className="block text-xs font-medium text-[#333] mb-1">
            Branch {branch.num}
          </label>
          <div className="space-y-2">
            <LanguageTabs
              field={branch.heading}
              onChange={onFieldChange(`branch${branch.num}Heading`)}
              placeholder={`Branch ${branch.num} heading`}
            />
            <LanguageTabs
              field={branch.body}
              onChange={onFieldChange(`branch${branch.num}Body`)}
              multiline
              placeholder={`Branch ${branch.num} description. Use **bold** for emphasis.`}
            />
          </div>
        </fieldset>
      ))}

      <p className="text-[10px] text-[#999]">
        Leave a branch heading empty to hide it. Use **double asterisks** for bold in body text.
      </p>
    </div>
  );
}
