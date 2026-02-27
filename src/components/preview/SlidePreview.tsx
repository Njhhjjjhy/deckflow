import { useEffect, useState } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { loadImage } from '../../lib/images/imageStore';
import CoverPage from '../templates/CoverPage';

interface SlidePreviewProps {
  page: Page;
  language: Language;
}

export default function SlidePreview({ page, language }: SlidePreviewProps) {
  const [heroImageData, setHeroImageData] = useState<string | null>(null);
  const heroImageKey = (page.content.heroImage as string) || '';

  useEffect(() => {
    if (!heroImageKey) {
      setHeroImageData(null);
      return;
    }
    loadImage(heroImageKey).then((data) => setHeroImageData(data));
  }, [heroImageKey]);

  if (page.type === 'cover') {
    const headline = page.content.headline as TranslatableField;
    const headlineText = headline?.[language] || headline?.en || '';
    const year = (page.content.year as string) || '';

    return (
      <CoverPage
        content={{
          headline: headlineText,
          year,
          heroImage: heroImageData || undefined,
        }}
        language={language}
      />
    );
  }

  // Placeholder for other page types
  return (
    <div
      style={{
        width: 960,
        height: 540,
        background: '#F2F2F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: 14,
      }}
    >
      Preview not available for "{page.type}"
    </div>
  );
}
