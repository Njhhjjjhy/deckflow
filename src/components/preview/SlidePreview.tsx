import { useEffect, useState } from 'react';
import type { Page, Language, TranslatableField } from '../../types/presentation';
import { loadImage } from '../../lib/images/imageStore';
import CoverPage from '../templates/CoverPage';
import ValuePropositionPage from '../templates/ValuePropositionPage';
import SectionDividerPage from '../templates/SectionDividerPage';
import ContactPage from '../templates/ContactPage';
import DiagramPage from '../templates/DiagramPage';
import IndexTOCPage from '../templates/IndexTOCPage';
import DisclaimerPage from '../templates/DisclaimerPage';
import MultiCardGridPage from '../templates/MultiCardGridPage';
import TextChartPage from '../templates/TextChartPage';

interface SlidePreviewProps {
  page: Page;
  language: Language;
}

export default function SlidePreview({ page, language }: SlidePreviewProps) {
  const [heroImageData, setHeroImageData] = useState<string | null>(null);
  const [logoImageData, setLogoImageData] = useState<string | null>(null);
  const [badge1IconData, setBadge1IconData] = useState<string | null>(null);
  const [badge2IconData, setBadge2IconData] = useState<string | null>(null);
  const [badge3IconData, setBadge3IconData] = useState<string | null>(null);
  const [cardIconMap, setCardIconMap] = useState<Record<string, string | null>>({});
  const [chartImageData, setChartImageData] = useState<string | null>(null);
  const heroImageKey = (page.content.heroImage as string) || '';
  const logoImageKey = (page.content.logoImage as string) || '';
  const badge1IconKey = (page.content.badge1Icon as string) || '';
  const badge2IconKey = (page.content.badge2Icon as string) || '';
  const badge3IconKey = (page.content.badge3Icon as string) || '';
  const cardsDataRaw = (page.content.cardsData as string) || '[]';
  const chartImageKey = (page.content.chartImage as string) || '';

  useEffect(() => {
    if (!heroImageKey) { setHeroImageData(null); return; }
    loadImage(heroImageKey).then((data) => setHeroImageData(data));
  }, [heroImageKey]);

  useEffect(() => {
    if (!logoImageKey) { setLogoImageData(null); return; }
    loadImage(logoImageKey).then((data) => setLogoImageData(data));
  }, [logoImageKey]);

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

  // Load chart image for text-chart pages
  useEffect(() => {
    if (!chartImageKey) { setChartImageData(null); return; }
    loadImage(chartImageKey).then((data) => setChartImageData(data));
  }, [chartImageKey]);

  // Load card icons for multi-card-grid pages
  useEffect(() => {
    if (page.type !== 'multi-card-grid') { setCardIconMap({}); return; }
    let cardsRaw: { id: string; icon: string }[] = [];
    try { cardsRaw = JSON.parse(cardsDataRaw); } catch { /* ignore */ }
    const newMap: Record<string, string | null> = {};
    let pending = 0;
    cardsRaw.forEach((card) => {
      if (card.icon) {
        pending++;
        loadImage(card.icon).then((data) => {
          newMap[card.id] = data;
          pending--;
          if (pending === 0) setCardIconMap({ ...newMap });
        });
      }
    });
    if (pending === 0) setCardIconMap({});
  }, [cardsDataRaw, page.type]);

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

  if (page.type === 'value-proposition') {
    const badge1Label = page.content.badge1Label as TranslatableField;
    const badge2Label = page.content.badge2Label as TranslatableField;
    const badge3Label = page.content.badge3Label as TranslatableField;
    const bodyText = page.content.bodyText as TranslatableField;
    const accentBarVisible = (page.content.accentBarVisible as string) !== 'false';
    const accentBarColor = (page.content.accentBarColor as string) || '#FBB931';

    return (
      <ValuePropositionPage
        content={{
          badge1Label: badge1Label?.[language] || badge1Label?.en || '',
          badge2Label: badge2Label?.[language] || badge2Label?.en || '',
          badge3Label: badge3Label?.[language] || badge3Label?.en || '',
          bodyText: bodyText?.[language] || bodyText?.en || '',
          badge1Icon: badge1IconData || undefined,
          badge2Icon: badge2IconData || undefined,
          badge3Icon: badge3IconData || undefined,
          accentBarVisible,
          accentBarColor,
        }}
        language={language}
      />
    );
  }

  if (page.type === 'diagram') {
    const branch1Heading = page.content.branch1Heading as TranslatableField;
    const branch1Body = page.content.branch1Body as TranslatableField;
    const branch2Heading = page.content.branch2Heading as TranslatableField;
    const branch2Body = page.content.branch2Body as TranslatableField;
    const branch3Heading = page.content.branch3Heading as TranslatableField;
    const branch3Body = page.content.branch3Body as TranslatableField;

    return (
      <DiagramPage
        content={{
          logoImage: logoImageData || undefined,
          branches: [
            { heading: branch1Heading?.[language] || branch1Heading?.en || '', body: branch1Body?.[language] || branch1Body?.en || '' },
            { heading: branch2Heading?.[language] || branch2Heading?.en || '', body: branch2Body?.[language] || branch2Body?.en || '' },
            { heading: branch3Heading?.[language] || branch3Heading?.en || '', body: branch3Body?.[language] || branch3Body?.en || '' },
          ],
        }}
        language={language}
      />
    );
  }

  if (page.type === 'index') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const year = (page.content.year as string) || '';
    const tocDataRaw = (page.content.tocData as string) || '[]';

    let tocSections: { id: string; name: Record<string, string>; entries: { id: string; label: Record<string, string>; pageNumber: string }[] }[] = [];
    try { tocSections = JSON.parse(tocDataRaw); } catch { /* ignore */ }

    const resolvedSections = tocSections.map((s) => ({
      id: s.id,
      name: s.name?.[language] || s.name?.en || '',
      entries: (s.entries || []).map((e) => ({
        id: e.id,
        label: e.label?.[language] || e.label?.en || '',
        pageNumber: e.pageNumber || '',
      })),
    }));

    return (
      <IndexTOCPage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '00 | Index',
          year,
          heroImage: heroImageData || undefined,
          sections: resolvedSections,
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

  if (page.type === 'disclaimer') {
    const disclaimerText = page.content.disclaimerText as TranslatableField;
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const year = (page.content.year as string) || '';

    return (
      <DisclaimerPage
        content={{
          disclaimerText: disclaimerText?.[language] || disclaimerText?.en || '',
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || 'Disclaimer',
          year,
        }}
        language={language}
      />
    );
  }

  if (page.type === 'text-chart') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const heading = page.content.heading as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';
    const chartMode = (page.content.chartMode as string) || 'data';
    const chartTitle = page.content.chartTitle as TranslatableField;
    const xAxisLabelField = page.content.xAxisLabel as TranslatableField;
    const yAxisLabelField = page.content.yAxisLabel as TranslatableField;
    const yAxisUnit = (page.content.yAxisUnit as string) || '';
    const yAxisMax = (page.content.yAxisMax as string) || '';
    const chartImageCaption = page.content.chartImageCaption as TranslatableField;
    const bulletsDataRaw = (page.content.bulletsData as string) || '[]';
    const barsDataRaw = (page.content.barsData as string) || '[]';

    let bulletsRaw: Record<string, string>[] = [];
    try { bulletsRaw = JSON.parse(bulletsDataRaw); } catch { /* ignore */ }

    let barsRaw: { label: string; value: number }[] = [];
    try { barsRaw = JSON.parse(barsDataRaw); } catch { /* ignore */ }

    const resolvedBullets = bulletsRaw.map((b) => b?.[language] || b?.en || '');

    return (
      <TextChartPage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          heading: heading?.[language] || heading?.en || '',
          bullets: resolvedBullets,
          chartMode: chartMode as 'data' | 'image',
          chartTitle: chartTitle?.[language] || chartTitle?.en || '',
          xAxisLabel: xAxisLabelField?.[language] || xAxisLabelField?.en || '',
          yAxisLabel: yAxisLabelField?.[language] || yAxisLabelField?.en || '',
          yAxisUnit,
          yAxisMax: yAxisMax ? parseFloat(yAxisMax) : undefined,
          bars: barsRaw,
          chartImage: chartImageData,
          chartImageCaption: chartImageCaption?.[language] || chartImageCaption?.en || '',
        }}
        language={language}
      />
    );
  }

  if (page.type === 'multi-card-grid') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';

    let cardsRaw: { id: string; icon: string; heading: Record<string, string>; bodyType: 'bullets' | 'paragraph'; bullets: Record<string, string>[]; paragraph: Record<string, string> }[] = [];
    try { cardsRaw = JSON.parse(cardsDataRaw); } catch { /* ignore */ }

    const resolvedCards = cardsRaw.map((card) => ({
      icon: card.icon ? (cardIconMap[card.id] || null) : null,
      heading: card.heading?.[language] || card.heading?.en || '',
      bodyType: card.bodyType,
      bullets: card.bodyType === 'bullets'
        ? (card.bullets || []).map((b) => b?.[language] || b?.en || '')
        : undefined,
      paragraph: card.bodyType === 'paragraph'
        ? (card.paragraph?.[language] || card.paragraph?.en || '')
        : undefined,
    }));

    return (
      <MultiCardGridPage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          cards: resolvedCards,
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
