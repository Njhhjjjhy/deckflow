import { useEffect, useState } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { loadImage } from '../../lib/images/imageStore';
import CoverPage from '../templates/CoverPage';
import SectionDividerPage from '../templates/SectionDividerPage';
import ContactPage from '../templates/ContactPage';

interface SlidePreviewProps {
  page: Page;
  language: Language;
}

export default function SlidePreview({ page, language }: SlidePreviewProps) {
  const [heroImageData, setHeroImageData] = useState<string | null>(null);
  const [logoImageData, setLogoImageData] = useState<string | null>(null);
  const heroImageKey = (page.content.heroImage as string) || '';
  const logoImageKey = (page.content.logoImage as string) || '';

  useEffect(() => {
    if (!heroImageKey) {
      setHeroImageData(null);
      return;
    }
    loadImage(heroImageKey).then((data) => setHeroImageData(data));
  }, [heroImageKey]);

  useEffect(() => {
    if (!logoImageKey) {
      setLogoImageData(null);
      return;
    }
    loadImage(logoImageKey).then((data) => setLogoImageData(data));
  }, [logoImageKey]);

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

  if (page.type === 'section-divider') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const sectionNumber = page.content.sectionNumber as TranslatableField;
    const sectionTitle = page.content.sectionTitle as TranslatableField;

    return (
      <SectionDividerPage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          sectionNumber: sectionNumber?.[language] || sectionNumber?.en || '',
          sectionTitle: sectionTitle?.[language] || sectionTitle?.en || '',
        }}
        language={language}
      />
    );
  }

  if (page.type === 'contact') {
    const companyName = page.content.companyName as TranslatableField;
    const phone = page.content.phone as TranslatableField;
    const email = page.content.email as TranslatableField;
    const address = page.content.address as TranslatableField;
    const url = page.content.url as TranslatableField;
    const year = (page.content.year as string) || '';
    const logoImageKey = (page.content.logoImage as string) || '';

    return (
      <ContactPage
        content={{
          companyName: companyName?.[language] || companyName?.en || '',
          phone: phone?.[language] || phone?.en || '',
          email: email?.[language] || email?.en || '',
          address: address?.[language] || address?.en || '',
          url: url?.[language] || url?.en || '',
          year,
          logoImage: logoImageKey ? (logoImageData ?? undefined) : undefined,
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
