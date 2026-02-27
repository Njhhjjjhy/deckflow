export type Language = 'en' | 'zh-tw' | 'zh-cn';

export type TranslationStatus = 'auto-translated' | 'reviewed' | 'outdated' | 'empty';

export interface TranslatableField {
  en: string;
  'zh-tw': string;
  'zh-cn': string;
  translationStatus: {
    'zh-tw': TranslationStatus;
    'zh-cn': TranslationStatus;
  };
}

export type PageType =
  | 'cover'
  | 'value-proposition'
  | 'diagram'
  | 'index'
  | 'section-divider'
  | 'long-form-text'
  | 'timeline-image'
  | 'text-chart'
  | 'multi-card-grid'
  | 'map-text'
  | 'text-images'
  | 'before-after'
  | 'photo-gallery'
  | 'data-table'
  | 'comparison-table'
  | 'three-circles'
  | 'text-news'
  | 'flow-chart'
  | 'disclaimer'
  | 'contact';

export interface Page {
  id: string;
  order: number;
  type: PageType;
  content: Record<string, TranslatableField | string>;
  reusableBlockId?: string;
}

export interface GlossaryEntry {
  en: string;
  'zh-tw': string;
  'zh-cn': string;
}

export interface PresentationMetadata {
  createdAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: string;
  name: string;
  category: 'investor-deck' | 'partner-deck' | 'brochure';
  partnerName?: string;
  dimensions: { width: 960; height: 540 };
  pages: Page[];
  glossary: GlossaryEntry[];
  metadata: PresentationMetadata;
}

/** Helper to create a new empty TranslatableField */
export function createTranslatableField(en = ''): TranslatableField {
  return {
    en,
    'zh-tw': '',
    'zh-cn': '',
    translationStatus: {
      'zh-tw': 'empty',
      'zh-cn': 'empty',
    },
  };
}

/** Helper to create a new cover page */
export function createCoverPage(order: number): Page {
  return {
    id: crypto.randomUUID(),
    order,
    type: 'cover',
    content: {
      headline: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      heroImage: '',
    },
  };
}

/** Helper to create a new section divider page */
export function createSectionDividerPage(order: number): Page {
  return {
    id: crypto.randomUUID(),
    order,
    type: 'section-divider',
    content: {
      sectionLabel: createTranslatableField(''),
      sectionNumber: createTranslatableField(''),
      sectionTitle: createTranslatableField(''),
    },
  };
}

/** Helper to create a new disclaimer page */
export function createDisclaimerPage(order: number): Page {
  return {
    id: crypto.randomUUID(),
    order,
    type: 'disclaimer',
    content: {
      disclaimerText: createTranslatableField(''),
      sectionLabel: createTranslatableField('Disclaimer'),
      year: new Date().getFullYear().toString(),
    },
  };
}

/** Helper to create a new value proposition page */
export function createValuePropositionPage(order: number): Page {
  return {
    id: crypto.randomUUID(),
    order,
    type: 'value-proposition',
    content: {
      badge1Label: createTranslatableField(''),
      badge2Label: createTranslatableField(''),
      badge3Label: createTranslatableField(''),
      bodyText: createTranslatableField(''),
      badge1Icon: '',
      badge2Icon: '',
      badge3Icon: '',
      accentBarVisible: 'true',
      accentBarColor: '#FBB931',
    },
  };
}

/** Helper to create a new diagram/branching page */
export function createDiagramPage(order: number): Page {
  return {
    id: crypto.randomUUID(),
    order,
    type: 'diagram',
    content: {
      logoImage: '',
      branch1Heading: createTranslatableField(''),
      branch1Body: createTranslatableField(''),
      branch2Heading: createTranslatableField(''),
      branch2Body: createTranslatableField(''),
      branch3Heading: createTranslatableField(''),
      branch3Body: createTranslatableField(''),
    },
  };
}

/** Helper to create a new index/TOC page */
export function createIndexPage(order: number): Page {
  const defaultEntry = {
    id: crypto.randomUUID(),
    label: { en: '', 'zh-tw': '', 'zh-cn': '' },
    pageNumber: '',
  };
  const defaultSection = {
    id: crypto.randomUUID(),
    name: { en: '', 'zh-tw': '', 'zh-cn': '' },
    entries: [defaultEntry],
  };

  return {
    id: crypto.randomUUID(),
    order,
    type: 'index',
    content: {
      sectionLabel: createTranslatableField('00 | Index'),
      year: new Date().getFullYear().toString(),
      heroImage: '',
      tocData: JSON.stringify([defaultSection]),
    },
  };
}

/** Helper to create a new multi-card-grid page */
export function createMultiCardGridPage(order: number): Page {
  const defaultCards = [
    {
      id: crypto.randomUUID(),
      icon: '',
      heading: { en: 'Localized investment model', 'zh-tw': '', 'zh-cn': '' },
      bodyType: 'bullets' as const,
      bullets: [
        { en: 'Properties designed for long-term local living, ensuring stability.', 'zh-tw': '', 'zh-cn': '' },
        { en: 'Strong bank relationships offer low-interest financing.', 'zh-tw': '', 'zh-cn': '' },
        { en: 'Local construction partners optimize zoning and control costs.', 'zh-tw': '', 'zh-cn': '' },
      ],
      paragraph: { en: '', 'zh-tw': '', 'zh-cn': '' },
    },
    {
      id: crypto.randomUUID(),
      icon: '',
      heading: { en: 'Stable rental income and high occupancy', 'zh-tw': '', 'zh-cn': '' },
      bodyType: 'bullets' as const,
      bullets: [
        { en: 'Professional management maintains 96% occupancy rate.', 'zh-tw': '', 'zh-cn': '' },
        { en: 'Portfolios adjusted based on economic shifts to maximize returns.', 'zh-tw': '', 'zh-cn': '' },
      ],
      paragraph: { en: '', 'zh-tw': '', 'zh-cn': '' },
    },
    {
      id: crypto.randomUUID(),
      icon: '',
      heading: { en: 'Investor-focused strategy for returns and risk control', 'zh-tw': '', 'zh-cn': '' },
      bodyType: 'bullets' as const,
      bullets: [
        { en: 'Tight budget and quality management ensure stable returns.', 'zh-tw': '', 'zh-cn': '' },
        { en: 'Flexible exit timing and expansion to new markets.', 'zh-tw': '', 'zh-cn': '' },
      ],
      paragraph: { en: '', 'zh-tw': '', 'zh-cn': '' },
    },
    {
      id: crypto.randomUUID(),
      icon: '',
      heading: { en: 'MoreHarvest team and flexible investment model', 'zh-tw': '', 'zh-cn': '' },
      bodyType: 'bullets' as const,
      bullets: [
        { en: '20 years of real estate and fintech experience.', 'zh-tw': '', 'zh-cn': '' },
        { en: 'Long-term or short-to-mid-term plans (2–5 years) balancing security and growth.', 'zh-tw': '', 'zh-cn': '' },
      ],
      paragraph: { en: '', 'zh-tw': '', 'zh-cn': '' },
    },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'multi-card-grid',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '9',
      cardsData: JSON.stringify(defaultCards),
    },
  };
}

/** Helper to create a new text-chart page */
export function createTextChartPage(order: number): Page {
  const defaultBullets = [
    { en: 'We invest in prime locations like Tokyo, Osaka, Sapporo, and emerging areas like Kumamoto, balancing growth and cost for stable returns.', 'zh-tw': '', 'zh-cn': '' },
    { en: 'Our 20+ year experienced team provides local expertise in land sourcing, building development, and rental services.', 'zh-tw': '', 'zh-cn': '' },
    { en: 'We maintain over 96% occupancy rates with contingency plans if occupancy falls below 90%.', 'zh-tw': '', 'zh-cn': '' },
    { en: 'Properties align with local demand and market rents for rental stability and value.', 'zh-tw': '', 'zh-cn': '' },
  ];

  const defaultBars = [
    { label: '2020', value: 95 },
    { label: '2021', value: 96 },
    { label: '2022', value: 95 },
    { label: '2023', value: 95 },
    { label: '2024', value: 97 },
    { label: '2025', value: 94 },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'text-chart',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '8',
      heading: createTranslatableField('About MoreHarvest'),
      bulletsData: JSON.stringify(defaultBullets),
      chartMode: 'data',
      chartTitle: createTranslatableField('2020 - 2025 Average occupancy across properties'),
      xAxisLabel: createTranslatableField('Year'),
      yAxisLabel: createTranslatableField('Occupancy %'),
      yAxisUnit: '%',
      yAxisMax: '100',
      barsData: JSON.stringify(defaultBars),
      chartImage: '',
      chartImageCaption: createTranslatableField(''),
    },
  };
}

/** Helper to create a new data table page */
export function createDataTablePage(order: number): Page {
  const defaultColumns = [
    { label: { en: 'Area', 'zh-tw': '', 'zh-cn': '' }, widthPercent: 25 },
    { label: { en: 'Index 2025 Q2', 'zh-tw': '', 'zh-cn': '' }, widthPercent: 18.75 },
    { label: { en: 'QoQ Change %', 'zh-tw': '', 'zh-cn': '' }, widthPercent: 18.75 },
    { label: { en: 'YoY Change %', 'zh-tw': '', 'zh-cn': '' }, widthPercent: 18.75 },
    { label: { en: '2-Year Change %', 'zh-tw': '', 'zh-cn': '' }, widthPercent: 18.75 },
  ];

  const defaultRows = [
    { cells: [
      { value: { en: 'Kumamoto City', 'zh-tw': '', 'zh-cn': '' }, highlighted: true },
      { value: { en: '111.5', 'zh-tw': '', 'zh-cn': '' }, highlighted: true },
      { value: { en: '0.90', 'zh-tw': '', 'zh-cn': '' }, highlighted: true },
      { value: { en: '3.24', 'zh-tw': '', 'zh-cn': '' }, highlighted: true },
      { value: { en: '9.85', 'zh-tw': '', 'zh-cn': '' }, highlighted: true },
    ], highlighted: true },
    { cells: [
      { value: { en: 'Sapporo City', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '128.02', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '1.26', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '2.9', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '6.9', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
    ], highlighted: false },
    { cells: [
      { value: { en: 'Sendai City', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '124.89', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '\u20131.05', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '0.38', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '5.32', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
    ], highlighted: false },
    { cells: [
      { value: { en: 'Kyoto City', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '124.02', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '2.12', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '2.36', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '5.01', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
    ], highlighted: false },
    { cells: [
      { value: { en: 'Osaka City', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '136.64', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '\u20131.70', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '4.82', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '10.27', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
    ], highlighted: false },
    { cells: [
      { value: { en: 'Greater Osaka Area', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '120.41', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '\u20131.65', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '5.87', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '10.55', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
    ], highlighted: false },
    { cells: [
      { value: { en: 'Fukuoka City', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '125.58', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '0.43', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '5.69', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '9.93', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
    ], highlighted: false },
    { cells: [
      { value: { en: 'Tokyo 23 Wards', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '128.2', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '1.84', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '7.99', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
      { value: { en: '11.44', 'zh-tw': '', 'zh-cn': '' }, highlighted: false },
    ], highlighted: false },
  ];

  const defaultFootnotes = [
    { en: 'Kumamoto City values are derived from the rent price trend index, used as a proxy due to the absence of publicly available 2025 Q2 home price index data for the city.', 'zh-tw': '', 'zh-cn': '' },
    { en: 'Rent-based index reflects relative rental market dynamics and may differ from home sale price trends.', 'zh-tw': '', 'zh-cn': '' },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'data-table',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '17',
      heading: createTranslatableField('Overall Overview \u2014 Regional Cities'),
      subtitle: createTranslatableField('Current Rental Price Index'),
      columnsData: JSON.stringify(defaultColumns),
      rowsData: JSON.stringify(defaultRows),
      footnotesData: JSON.stringify(defaultFootnotes),
    },
  };
}

/** Helper to create a new contact/closing page */
export function createContactPage(order: number): Page {
  return {
    id: crypto.randomUUID(),
    order,
    type: 'contact',
    content: {
      companyName: createTranslatableField(''),
      phone: createTranslatableField(''),
      email: createTranslatableField(''),
      address: createTranslatableField(''),
      url: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      logoImage: '',
    },
  };
}
