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
import DataTablePage from '../templates/DataTablePage';
import ComparisonTablePage from '../templates/ComparisonTablePage';
import TimelineImagePage from '../templates/TimelineImagePage';
import TextImagesPage from '../templates/TextImagesPage';
import BeforeAfterPage from '../templates/BeforeAfterPage';
import MapTextCardPage from '../templates/MapTextCardPage';
import MapTextListPage from '../templates/MapTextListPage';
import MapTextOverlayPage from '../templates/MapTextOverlayPage';
import ThreeCirclesPage from '../templates/ThreeCirclesPage';

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
  const [timelinePhotoData, setTimelinePhotoData] = useState<string | null>(null);
  const [tiLogoData, setTiLogoData] = useState<string | null>(null);
  const [tiPhoto1Data, setTiPhoto1Data] = useState<string | null>(null);
  const [tiPhoto2Data, setTiPhoto2Data] = useState<string | null>(null);
  const [baPairImages, setBaPairImages] = useState<Record<string, { before: string | null; after: string | null }>>({});
  const [mapImageData, setMapImageData] = useState<string | null>(null);
  const heroImageKey = (page.content.heroImage as string) || '';
  const logoImageKey = (page.content.logoImage as string) || '';
  const badge1IconKey = (page.content.badge1Icon as string) || '';
  const badge2IconKey = (page.content.badge2Icon as string) || '';
  const badge3IconKey = (page.content.badge3Icon as string) || '';
  const cardsDataRaw = (page.content.cardsData as string) || '[]';
  const chartImageKey = (page.content.chartImage as string) || '';
  const timelinePhotoKey = (page.content.photo as string) || '';
  const tiLogoKey = (page.content.logoImage as string) || '';
  const tiPhoto1Key = (page.content.photo1 as string) || '';
  const tiPhoto2Key = (page.content.photo2 as string) || '';
  const baPairsDataRaw = (page.content.pairsData as string) || '[]';
  const mapImageKey = page.type === 'map-text' ? ((page.content.mapImage as string) || '') : '';
  const mapCardsDataRaw = page.type === 'map-text' ? ((page.content.cardsData as string) || '[]') : '[]';
  const mapArrowsDataRaw = page.type === 'map-text' ? ((page.content.arrowsData as string) || '[]') : '[]';

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

  // Load timeline photo
  useEffect(() => {
    if (!timelinePhotoKey) { setTimelinePhotoData(null); return; }
    loadImage(timelinePhotoKey).then((data) => setTimelinePhotoData(data));
  }, [timelinePhotoKey]);

  // Load text-images page images
  useEffect(() => {
    if (page.type !== 'text-images') { setTiLogoData(null); return; }
    if (!tiLogoKey) { setTiLogoData(null); return; }
    loadImage(tiLogoKey).then((data) => setTiLogoData(data));
  }, [tiLogoKey, page.type]);

  useEffect(() => {
    if (page.type !== 'text-images') { setTiPhoto1Data(null); return; }
    if (!tiPhoto1Key) { setTiPhoto1Data(null); return; }
    loadImage(tiPhoto1Key).then((data) => setTiPhoto1Data(data));
  }, [tiPhoto1Key, page.type]);

  useEffect(() => {
    if (page.type !== 'text-images') { setTiPhoto2Data(null); return; }
    if (!tiPhoto2Key) { setTiPhoto2Data(null); return; }
    loadImage(tiPhoto2Key).then((data) => setTiPhoto2Data(data));
  }, [tiPhoto2Key, page.type]);

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

  // Load map image for map-text pages
  useEffect(() => {
    if (page.type !== 'map-text') { setMapImageData(null); return; }
    if (!mapImageKey) { setMapImageData(null); return; }
    loadImage(mapImageKey).then((data) => setMapImageData(data));
  }, [mapImageKey, page.type]);

  // Load before-after pair images
  useEffect(() => {
    if (page.type !== 'before-after') { setBaPairImages({}); return; }
    let pairsRaw: { id: string; beforeImage: string; afterImage: string }[] = [];
    try { pairsRaw = JSON.parse(baPairsDataRaw); } catch { /* ignore */ }
    const newMap: Record<string, { before: string | null; after: string | null }> = {};
    let pending = 0;
    pairsRaw.forEach((pair) => {
      newMap[pair.id] = { before: null, after: null };
      if (pair.beforeImage) {
        pending++;
        loadImage(pair.beforeImage).then((data) => {
          newMap[pair.id] = { ...newMap[pair.id], before: data };
          pending--;
          if (pending === 0) setBaPairImages({ ...newMap });
        });
      }
      if (pair.afterImage) {
        pending++;
        loadImage(pair.afterImage).then((data) => {
          newMap[pair.id] = { ...newMap[pair.id], after: data };
          pending--;
          if (pending === 0) setBaPairImages({ ...newMap });
        });
      }
    });
    if (pending === 0) setBaPairImages({ ...newMap });
  }, [baPairsDataRaw, page.type]);

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

  if (page.type === 'data-table') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const heading = page.content.heading as TranslatableField;
    const subtitle = page.content.subtitle as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';
    const columnsDataRaw = (page.content.columnsData as string) || '[]';
    const rowsDataRaw = (page.content.rowsData as string) || '[]';
    const footnotesDataRaw = (page.content.footnotesData as string) || '[]';

    let columnsRaw: { label: Record<string, string>; widthPercent: number }[] = [];
    try { columnsRaw = JSON.parse(columnsDataRaw); } catch { /* ignore */ }

    let rowsRaw: { cells: { value: Record<string, string>; highlighted: boolean }[]; highlighted: boolean }[] = [];
    try { rowsRaw = JSON.parse(rowsDataRaw); } catch { /* ignore */ }

    let footnotesRaw: Record<string, string>[] = [];
    try { footnotesRaw = JSON.parse(footnotesDataRaw); } catch { /* ignore */ }

    const resolvedColumns = columnsRaw.map((c) => ({
      label: c.label?.[language] || c.label?.en || '',
      widthPercent: c.widthPercent,
    }));

    const resolvedRows = rowsRaw.map((r) => ({
      cells: (r.cells || []).map((cell) => ({
        value: cell.value?.[language] || cell.value?.en || '',
        highlighted: cell.highlighted,
      })),
      highlighted: r.highlighted,
    }));

    const resolvedFootnotes = footnotesRaw.map((fn) => fn?.[language] || fn?.en || '');

    return (
      <DataTablePage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          heading: heading?.[language] || heading?.en || '',
          subtitle: subtitle?.[language] || subtitle?.en || '',
          columns: resolvedColumns,
          rows: resolvedRows,
          footnotes: resolvedFootnotes,
        }}
        language={language}
      />
    );
  }

  if (page.type === 'comparison-table') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const heading = page.content.heading as TranslatableField;
    const competitorHeaderLabel = page.content.competitorHeaderLabel as TranslatableField;
    const sourceCitation = page.content.sourceCitation as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';
    const rowsDataRaw = (page.content.rowsData as string) || '[]';

    let rowsRaw: { label: Record<string, string>; moreHarvestValue: Record<string, string>; competitorValue: Record<string, string> }[] = [];
    try { rowsRaw = JSON.parse(rowsDataRaw); } catch { /* ignore */ }

    const resolvedRows = rowsRaw.map((r) => ({
      label: r.label?.[language] || r.label?.en || '',
      moreHarvestValue: r.moreHarvestValue?.[language] || r.moreHarvestValue?.en || '',
      competitorValue: r.competitorValue?.[language] || r.competitorValue?.en || '',
    }));

    return (
      <ComparisonTablePage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          heading: heading?.[language] || heading?.en || '',
          competitorHeaderLabel: competitorHeaderLabel?.[language] || competitorHeaderLabel?.en || '',
          rows: resolvedRows,
          sourceCitation: sourceCitation?.[language] || sourceCitation?.en || '',
        }}
        language={language}
      />
    );
  }

  if (page.type === 'timeline-image') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const caption = page.content.caption as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';
    const timelineLineColor = (page.content.timelineLineColor as string) || '#1A1A1A';
    const bulletColor = (page.content.bulletColor as string) || '#333333';
    const captionColor = (page.content.captionColor as string) || '#333333';
    const entriesDataRaw = (page.content.entriesData as string) || '[]';

    let entriesRaw: { id: string; year: string; heading: Record<string, string>; bullets: Record<string, string>[]; yearColor: string; headingColor: string; bodyColor: string }[] = [];
    try { entriesRaw = JSON.parse(entriesDataRaw); } catch { /* ignore */ }

    const resolvedEntries = entriesRaw.map((entry) => ({
      year: entry.year || '',
      heading: entry.heading?.[language] || entry.heading?.en || '',
      bullets: (entry.bullets || []).map((b) => b?.[language] || b?.en || ''),
      yearColor: entry.yearColor || '#1A1A1A',
      headingColor: entry.headingColor || '#1A1A1A',
      bodyColor: entry.bodyColor || '#333333',
    }));

    return (
      <TimelineImagePage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          timelineLineColor,
          bulletColor,
          entries: resolvedEntries,
          photo: timelinePhotoData,
          caption: caption?.[language] || caption?.en || '',
          captionColor,
        }}
        language={language}
      />
    );
  }

  if (page.type === 'text-images') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const photo1Caption = page.content.photo1Caption as TranslatableField;
    const photo2Caption = page.content.photo2Caption as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';
    const headingColor = (page.content.headingColor as string) || '#1A1A1A';
    const bodyColor = (page.content.bodyColor as string) || '#1A1A1A';
    const bulletColor = (page.content.bulletColor as string) || '#FBB931';
    const captionColor = (page.content.captionColor as string) || '#333333';
    const photo1ShowCaption = (page.content.photo1ShowCaption as string) !== 'false';
    const photo2ShowCaption = (page.content.photo2ShowCaption as string) !== 'false';
    const sectionsDataRaw = (page.content.sectionsData as string) || '[]';

    let sectionsRaw: { id: string; heading: Record<string, string>; bullets: Record<string, string>[] }[] = [];
    try { sectionsRaw = JSON.parse(sectionsDataRaw); } catch { /* ignore */ }

    const resolvedSections = sectionsRaw.map((s) => ({
      heading: s.heading?.[language] || s.heading?.en || '',
      bullets: (s.bullets || []).map((b) => b?.[language] || b?.en || ''),
    }));

    return (
      <TextImagesPage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          sections: resolvedSections,
          headingColor,
          bodyColor,
          bulletColor,
          captionColor,
          logoImage: tiLogoData,
          photo1: tiPhoto1Data,
          photo1ShowCaption,
          photo1Caption: photo1Caption?.[language] || photo1Caption?.en || '',
          photo2: tiPhoto2Data,
          photo2ShowCaption,
          photo2Caption: photo2Caption?.[language] || photo2Caption?.en || '',
        }}
        language={language}
      />
    );
  }

  if (page.type === 'before-after') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const beforeLabel = page.content.beforeLabel as TranslatableField;
    const afterLabel = page.content.afterLabel as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';
    const layoutMode = (page.content.layoutMode as string) || '2x2';
    const badgeBackgroundColor = (page.content.badgeBackgroundColor as string) || '#FBB931';
    const badgeTextColor = (page.content.badgeTextColor as string) || '#FFFFFF';
    const badgeFontSize = parseInt((page.content.badgeFontSize as string) || '11', 10);
    const arrowColor = (page.content.arrowColor as string) || '#FBB931';
    const arrowSize = parseInt((page.content.arrowSize as string) || '41', 10);
    const gapColor = (page.content.gapColor as string) || '#FFFFFF';

    let pairsRaw: { id: string; beforeImage: string; afterImage: string; beforeLabel: Record<string, string>; afterLabel: Record<string, string>; showBeforeLabel: boolean; showAfterLabel: boolean; showArrow: boolean }[] = [];
    try { pairsRaw = JSON.parse(baPairsDataRaw); } catch { /* ignore */ }

    const resolvedPairs = pairsRaw.map((pair) => ({
      beforeImage: pair.beforeImage ? (baPairImages[pair.id]?.before || null) : null,
      afterImage: pair.afterImage ? (baPairImages[pair.id]?.after || null) : null,
      beforeLabel: pair.beforeLabel?.[language] || pair.beforeLabel?.en || '',
      afterLabel: pair.afterLabel?.[language] || pair.afterLabel?.en || '',
      showBeforeLabel: pair.showBeforeLabel !== false,
      showAfterLabel: pair.showAfterLabel !== false,
      showArrow: pair.showArrow !== false,
    }));

    return (
      <BeforeAfterPage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          layoutMode: layoutMode as '2x2' | '1x2' | '2x1' | 'freeform',
          beforeLabel: beforeLabel?.[language] || beforeLabel?.en || 'Before',
          afterLabel: afterLabel?.[language] || afterLabel?.en || 'After',
          badgeBackgroundColor,
          badgeTextColor,
          badgeFontSize,
          arrowColor,
          arrowSize,
          gapColor,
          pairs: resolvedPairs,
        }}
        language={language}
      />
    );
  }

  if (page.type === 'map-text') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';
    const mapTextMode = (page.content.mapTextMode as string) || 'A';

    if (mapTextMode === 'C') {
      const calloutsDataRaw = (page.content.calloutsData as string) || '[]';

      let calloutsRaw: { id: string; label: Record<string, string>; x: number; y: number; color: string; visible: boolean }[] = [];
      try { calloutsRaw = JSON.parse(calloutsDataRaw); } catch { /* ignore */ }

      const resolvedCallouts = calloutsRaw.map((c) => ({
        label: c.label?.[language] || c.label?.en || '',
        x: c.x,
        y: c.y,
        color: c.color,
        visible: c.visible !== false,
      }));

      return (
        <MapTextOverlayPage
          content={{
            sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
            year,
            pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
            mapImage: mapImageData,
            callouts: resolvedCallouts,
          }}
          language={language}
        />
      );
    }

    if (mapTextMode === 'B') {
      const listHeading = page.content.listHeading as TranslatableField;
      const leftGroupsRaw = (page.content.leftColumnGroups as string) || '[]';
      const rightGroupsRaw = (page.content.rightColumnGroups as string) || '[]';
      const showSummaryTable = (page.content.showSummaryTable as string) === 'true';
      const summaryRowsRaw = (page.content.summaryRowsData as string) || '[]';

      let leftGroups: { id: string; label: Record<string, string>; items: Record<string, string>[] }[] = [];
      try { leftGroups = JSON.parse(leftGroupsRaw); } catch { /* ignore */ }

      let rightGroups: { id: string; label: Record<string, string>; items: Record<string, string>[] }[] = [];
      try { rightGroups = JSON.parse(rightGroupsRaw); } catch { /* ignore */ }

      let summaryRowsData: { label: Record<string, string>; value: Record<string, string>; subValue: Record<string, string> }[] = [];
      try { summaryRowsData = JSON.parse(summaryRowsRaw); } catch { /* ignore */ }

      const resolvedLeftGroups = leftGroups.map((g) => ({
        label: g.label?.[language] || g.label?.en || '',
        items: (g.items || []).map((item) => item?.[language] || item?.en || ''),
      }));

      const resolvedRightGroups = rightGroups.map((g) => ({
        label: g.label?.[language] || g.label?.en || '',
        items: (g.items || []).map((item) => item?.[language] || item?.en || ''),
      }));

      const resolvedSummaryRows = summaryRowsData.map((row) => ({
        label: row.label?.[language] || row.label?.en || '',
        value: row.value?.[language] || row.value?.en || '',
        subValue: row.subValue?.[language] || row.subValue?.en || '',
      }));

      return (
        <MapTextListPage
          content={{
            sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
            year,
            pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
            mapImage: mapImageData,
            heading: listHeading?.[language] || listHeading?.en || '',
            leftGroups: resolvedLeftGroups,
            rightGroups: resolvedRightGroups,
            showSummaryTable,
            summaryRows: resolvedSummaryRows,
          }}
          language={language}
        />
      );
    }

    let mapCards: { id: string; heading: Record<string, string>; bullets: Record<string, string>[] }[] = [];
    try { mapCards = JSON.parse(mapCardsDataRaw); } catch { /* ignore */ }

    let mapArrows: boolean[] = [];
    try { mapArrows = JSON.parse(mapArrowsDataRaw); } catch { /* ignore */ }

    const resolvedCards = mapCards.map((card) => ({
      heading: card.heading?.[language] || card.heading?.en || '',
      bullets: (card.bullets || []).map((b) => b?.[language] || b?.en || ''),
    }));

    return (
      <MapTextCardPage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          mapImage: mapImageData,
          cards: resolvedCards,
          arrows: mapArrows,
        }}
        language={language}
      />
    );
  }

  if (page.type === 'three-circles') {
    const sectionLabel = page.content.sectionLabel as TranslatableField;
    const heading = page.content.heading as TranslatableField;
    const circle1Heading = page.content.circle1Heading as TranslatableField;
    const circle1Body = page.content.circle1Body as TranslatableField;
    const circle2Heading = page.content.circle2Heading as TranslatableField;
    const circle2Body = page.content.circle2Body as TranslatableField;
    const circle3Heading = page.content.circle3Heading as TranslatableField;
    const circle3Body = page.content.circle3Body as TranslatableField;
    const year = (page.content.year as string) || '';
    const pageNumber = (page.content.pageNumber as string) || '';
    const circleBorderColor = (page.content.circleBorderColor as string) || '#FBB931';

    return (
      <ThreeCirclesPage
        content={{
          sectionLabel: sectionLabel?.[language] || sectionLabel?.en || '',
          year,
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
          heading: heading?.[language] || heading?.en || '',
          circles: [
            {
              heading: circle1Heading?.[language] || circle1Heading?.en || '',
              body: circle1Body?.[language] || circle1Body?.en || '',
            },
            {
              heading: circle2Heading?.[language] || circle2Heading?.en || '',
              body: circle2Body?.[language] || circle2Body?.en || '',
            },
            {
              heading: circle3Heading?.[language] || circle3Heading?.en || '',
              body: circle3Body?.[language] || circle3Body?.en || '',
            },
          ],
          circleBorderColor,
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
