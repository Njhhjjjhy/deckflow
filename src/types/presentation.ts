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
  | 'contact'
  | 'partner-profile'
  | 'logos-text-table';

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

/** Helper to create a new comparison table page */
export function createComparisonTablePage(order: number): Page {
  const defaultRows = [
    {
      label: { en: 'Interest rate', 'zh-tw': '', 'zh-cn': '' },
      moreHarvestValue: { en: '1 to 1.5%', 'zh-tw': '', 'zh-cn': '' },
      competitorValue: { en: '2.3% to 3%', 'zh-tw': '', 'zh-cn': '' },
    },
    {
      label: { en: 'LTV ratio', 'zh-tw': '', 'zh-cn': '' },
      moreHarvestValue: { en: 'up to 80%', 'zh-tw': '', 'zh-cn': '' },
      competitorValue: { en: '40–70%', 'zh-tw': '', 'zh-cn': '' },
    },
    {
      label: { en: 'Loan term', 'zh-tw': '', 'zh-cn': '' },
      moreHarvestValue: { en: 'up to 35 years', 'zh-tw': '', 'zh-cn': '' },
      competitorValue: { en: '15–20 years', 'zh-tw': '', 'zh-cn': '' },
    },
    {
      label: { en: 'Property restrictions', 'zh-tw': '', 'zh-cn': '' },
      moreHarvestValue: { en: 'Our most commonly seen property construction materials are reinforced concrete and wood', 'zh-tw': '', 'zh-cn': '' },
      competitorValue: { en: 'Very old properties or wooden structures are generally difficult to get approved for a loan', 'zh-tw': '', 'zh-cn': '' },
    },
    {
      label: { en: 'Banking relations', 'zh-tw': '', 'zh-cn': '' },
      moreHarvestValue: { en: 'Long-term partnerships with leading local banks that specialize in real estate and mortgages', 'zh-tw': '', 'zh-cn': '' },
      competitorValue: { en: 'None', 'zh-tw': '', 'zh-cn': '' },
    },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'comparison-table',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '19',
      heading: createTranslatableField('Comparison of financing options: MoreHarvest vs. typical foreign investors'),
      competitorHeaderLabel: createTranslatableField('Typical foreign investor'),
      rowsData: JSON.stringify(defaultRows),
      sourceCitation: createTranslatableField('Source: https://www.tokyostarbank.co.jp/foreign/en/products/loan/homeloan_star/'),
    },
  };
}

/** Helper to create a new timeline + image page */
export function createTimelineImagePage(order: number): Page {
  const defaultEntries = [
    {
      id: crypto.randomUUID(),
      year: '2005',
      heading: { en: 'Company founded', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'Started operations in Tokyo with a focus on residential properties.', 'zh-tw': '', 'zh-cn': '' },
      ],
      yearColor: '#1A1A1A',
      headingColor: '#1A1A1A',
      bodyColor: '#333333',
    },
    {
      id: crypto.randomUUID(),
      year: '2015',
      heading: { en: 'Expanded to regional cities', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'Entered Osaka, Sapporo, and Kumamoto markets.', 'zh-tw': '', 'zh-cn': '' },
        { en: 'Established partnerships with local banks.', 'zh-tw': '', 'zh-cn': '' },
      ],
      yearColor: '#1A1A1A',
      headingColor: '#1A1A1A',
      bodyColor: '#333333',
    },
    {
      id: crypto.randomUUID(),
      year: '2023',
      heading: { en: 'Portfolio milestone', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'Over 500 properties under management.', 'zh-tw': '', 'zh-cn': '' },
      ],
      yearColor: '#1A1A1A',
      headingColor: '#1A1A1A',
      bodyColor: '#333333',
    },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'timeline-image',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '7',
      timelineLineColor: '#1A1A1A',
      bulletColor: '#333333',
      entriesData: JSON.stringify(defaultEntries),
      photo: '',
      caption: createTranslatableField(''),
      captionColor: '#333333',
    },
  };
}

/** Helper to create a new text + images page */
export function createTextImagesPage(order: number): Page {
  const defaultSections = [
    {
      id: crypto.randomUUID(),
      heading: { en: 'J Estate \u2013 Buying & leasing brokerage services', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'Investment management and real estate consulting for overseas investors.', 'zh-tw': '', 'zh-cn': '' },
      ],
    },
    {
      id: crypto.randomUUID(),
      heading: { en: 'Ch\u00e2teau Life \u2013 New-build supervision / value-add', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: '10b yen+ cumulative investment experience.', 'zh-tw': '', 'zh-cn': '' },
      ],
    },
    {
      id: crypto.randomUUID(),
      heading: { en: 'Concept', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'Fusion-European homes using imported materials, antique-style finishes, and modern layouts for safe, comfortable living.', 'zh-tw': '', 'zh-cn': '' },
      ],
    },
    {
      id: crypto.randomUUID(),
      heading: { en: 'Value', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'Investor-aligned developer delivering cost-efficient, high-quality assets with durable exteriors, refined interiors, practical equipment, and steady performance.', 'zh-tw': '', 'zh-cn': '' },
      ],
    },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'text-images',
    content: {
      sectionLabel: createTranslatableField('02 | J Estate & Ch\u00e2teau Life'),
      year: new Date().getFullYear().toString(),
      pageNumber: '13',
      sectionsData: JSON.stringify(defaultSections),
      headingColor: '#1A1A1A',
      bodyColor: '#1A1A1A',
      bulletColor: '#FBB931',
      captionColor: '#333333',
      logoImage: '',
      photo1: '',
      photo1ShowCaption: 'true',
      photo1Caption: createTranslatableField('Ch\u00e2teau Life Jiyugaoka 1'),
      photo2: '',
      photo2ShowCaption: 'true',
      photo2Caption: createTranslatableField('Ch\u00e2teau Life Sagamihara 2'),
    },
  };
}

/** Helper to create a new before/after grid page */
export function createBeforeAfterPage(order: number): Page {
  const defaultPairs = [
    {
      id: crypto.randomUUID(),
      beforeImage: '',
      afterImage: '',
      beforeLabel: { en: '', 'zh-tw': '', 'zh-cn': '' },
      afterLabel: { en: '', 'zh-tw': '', 'zh-cn': '' },
      showBeforeLabel: true,
      showAfterLabel: true,
      showArrow: true,
    },
    {
      id: crypto.randomUUID(),
      beforeImage: '',
      afterImage: '',
      beforeLabel: { en: '', 'zh-tw': '', 'zh-cn': '' },
      afterLabel: { en: '', 'zh-tw': '', 'zh-cn': '' },
      showBeforeLabel: true,
      showAfterLabel: true,
      showArrow: true,
    },
    {
      id: crypto.randomUUID(),
      beforeImage: '',
      afterImage: '',
      beforeLabel: { en: '', 'zh-tw': '', 'zh-cn': '' },
      afterLabel: { en: '', 'zh-tw': '', 'zh-cn': '' },
      showBeforeLabel: true,
      showAfterLabel: true,
      showArrow: true,
    },
    {
      id: crypto.randomUUID(),
      beforeImage: '',
      afterImage: '',
      beforeLabel: { en: '', 'zh-tw': '', 'zh-cn': '' },
      afterLabel: { en: '', 'zh-tw': '', 'zh-cn': '' },
      showBeforeLabel: true,
      showAfterLabel: true,
      showArrow: true,
    },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'before-after',
    content: {
      sectionLabel: createTranslatableField('02 | J Estate & Château Life'),
      year: new Date().getFullYear().toString(),
      pageNumber: '14',
      layoutMode: '2x2',
      beforeLabel: createTranslatableField('Before'),
      afterLabel: createTranslatableField('After'),
      badgeBackgroundColor: '#FBB931',
      badgeTextColor: '#FFFFFF',
      badgeFontSize: '11',
      arrowColor: '#FBB931',
      arrowSize: '41',
      gapColor: '#FFFFFF',
      pairsData: JSON.stringify(defaultPairs),
    },
  };
}

/** Helper to create a new map + text (Mode A) page */
export function createMapTextPage(order: number): Page {
  const defaultCards = [
    {
      id: crypto.randomUUID(),
      heading: { en: 'MoreHarvest Real Estate', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'Acquisitions and asset management.', 'zh-tw': '', 'zh-cn': '' },
        { en: 'Investor-focused strategy.', 'zh-tw': '', 'zh-cn': '' },
      ],
    },
    {
      id: crypto.randomUUID(),
      heading: { en: 'J Estate', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'Buying and leasing brokerage services.', 'zh-tw': '', 'zh-cn': '' },
      ],
    },
    {
      id: crypto.randomUUID(),
      heading: { en: 'Château Life', 'zh-tw': '', 'zh-cn': '' },
      bullets: [
        { en: 'New-build supervision and value-add.', 'zh-tw': '', 'zh-cn': '' },
      ],
    },
  ];

  const defaultArrows = [true, true]; // arrows between card 1-2 and 2-3

  // Mode B defaults
  const defaultLeftGroups = [
    {
      id: crypto.randomUUID(),
      label: { en: '', 'zh-tw': '', 'zh-cn': '' },
      items: [{ en: '', 'zh-tw': '', 'zh-cn': '' }],
    },
  ];
  const defaultRightGroups = [
    {
      id: crypto.randomUUID(),
      label: { en: '', 'zh-tw': '', 'zh-cn': '' },
      items: [{ en: '', 'zh-tw': '', 'zh-cn': '' }],
    },
  ];
  const defaultSummaryRows = [
    {
      label: { en: '', 'zh-tw': '', 'zh-cn': '' },
      value: { en: '', 'zh-tw': '', 'zh-cn': '' },
      subValue: { en: '', 'zh-tw': '', 'zh-cn': '' },
    },
    {
      label: { en: '', 'zh-tw': '', 'zh-cn': '' },
      value: { en: '', 'zh-tw': '', 'zh-cn': '' },
      subValue: { en: '', 'zh-tw': '', 'zh-cn': '' },
    },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'map-text',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '12',
      mapTextMode: 'A',
      mapImage: '',
      // Mode A fields
      cardsData: JSON.stringify(defaultCards),
      arrowsData: JSON.stringify(defaultArrows),
      // Mode B fields
      listHeading: createTranslatableField(''),
      leftColumnGroups: JSON.stringify(defaultLeftGroups),
      rightColumnGroups: JSON.stringify(defaultRightGroups),
      showSummaryTable: 'false',
      summaryRowsData: JSON.stringify(defaultSummaryRows),
      // Mode C fields
      calloutsData: JSON.stringify([]),
    },
  };
}

/** Helper to create a new three circles page */
export function createThreeCirclesPage(order: number): Page {
  return {
    id: crypto.randomUUID(),
    order,
    type: 'three-circles',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '22',
      heading: createTranslatableField(''),
      circle1Heading: createTranslatableField(''),
      circle1Body: createTranslatableField(''),
      circle2Heading: createTranslatableField(''),
      circle2Body: createTranslatableField(''),
      circle3Heading: createTranslatableField(''),
      circle3Body: createTranslatableField(''),
      circleBorderColor: '#FBB931',
    },
  };
}

/** Helper to create a new flow chart / org structure page */
export function createFlowChartPage(order: number): Page {
  const n1 = crypto.randomUUID();
  const n2 = crypto.randomUUID();
  const n3 = crypto.randomUUID();
  const n4 = crypto.randomUUID();
  const n5 = crypto.randomUUID();

  const el = () => ({ en: '', 'zh-tw': '', 'zh-cn': '' });

  const defaultNodes = [
    { id: n1, heading: { en: 'Overseas Investor', 'zh-tw': '', 'zh-cn': '' }, body: el(), fillColor: '#E8E8E8', x: 35, y: 2, width: 200, height: 48, borderRadius: 16 },
    { id: n2, heading: { en: 'Taiwan Holding Co.', 'zh-tw': '', 'zh-cn': '' }, body: { en: 'Investment vehicle', 'zh-tw': '', 'zh-cn': '' }, fillColor: '#D6E4F0', x: 5, y: 32, width: 180, height: 55, borderRadius: 16 },
    { id: n3, heading: { en: 'Japan GK (\u5408\u540C\u4F1A\u793E)', 'zh-tw': '', 'zh-cn': '' }, body: { en: 'Operating entity', 'zh-tw': '', 'zh-cn': '' }, fillColor: '#D4EDDA', x: 57, y: 32, width: 180, height: 55, borderRadius: 16 },
    { id: n4, heading: { en: 'MoreHarvest Real Estate', 'zh-tw': '', 'zh-cn': '' }, body: { en: 'Asset management', 'zh-tw': '', 'zh-cn': '' }, fillColor: '#FEF3C7', x: 5, y: 68, width: 180, height: 65, borderRadius: 16 },
    { id: n5, heading: { en: 'Property Portfolio', 'zh-tw': '', 'zh-cn': '' }, body: { en: 'Residential assets', 'zh-tw': '', 'zh-cn': '' }, fillColor: '#D4EDDA', x: 57, y: 68, width: 180, height: 65, borderRadius: 16 },
  ];

  const defaultArrows = [
    { id: crypto.randomUUID(), sourceId: n1, targetId: n2, bidirectional: false, label: { en: 'Capital', 'zh-tw': '', 'zh-cn': '' }, labelPosition: 'left' },
    { id: crypto.randomUUID(), sourceId: n1, targetId: n3, bidirectional: false, label: { en: 'Capital', 'zh-tw': '', 'zh-cn': '' }, labelPosition: 'right' },
    { id: crypto.randomUUID(), sourceId: n2, targetId: n4, bidirectional: false, label: { en: 'Ownership', 'zh-tw': '', 'zh-cn': '' }, labelPosition: 'left' },
    { id: crypto.randomUUID(), sourceId: n3, targetId: n5, bidirectional: false, label: { en: 'Management', 'zh-tw': '', 'zh-cn': '' }, labelPosition: 'right' },
    { id: crypto.randomUUID(), sourceId: n4, targetId: n5, bidirectional: true, label: { en: 'Services', 'zh-tw': '', 'zh-cn': '' }, labelPosition: 'below' },
  ];

  const defaultLegend = [
    { id: crypto.randomUUID(), color: '#D6E4F0', label: { en: 'Taiwan jurisdiction', 'zh-tw': '', 'zh-cn': '' } },
    { id: crypto.randomUUID(), color: '#D4EDDA', label: { en: 'Japan jurisdiction', 'zh-tw': '', 'zh-cn': '' } },
    { id: crypto.randomUUID(), color: '#E8E8E8', label: { en: 'Overseas', 'zh-tw': '', 'zh-cn': '' } },
  ];

  const defaultFootnotes = [
    { id: crypto.randomUUID(), text: { en: 'This structure is for illustrative purposes only. Actual legal structures may vary based on jurisdiction and investor requirements.', 'zh-tw': '', 'zh-cn': '' }, visible: true },
    { id: crypto.randomUUID(), text: { en: 'MoreHarvest provides end-to-end support for investment structuring and management.', 'zh-tw': '', 'zh-cn': '' }, visible: true },
    { id: crypto.randomUUID(), text: el(), visible: false },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'flow-chart',
    content: {
      sectionLabel: createTranslatableField('06 | Corporate Structure'),
      year: new Date().getFullYear().toString(),
      pageNumber: '28',
      arrowColor: '#1A1A1A',
      nodesData: JSON.stringify(defaultNodes),
      arrowsData: JSON.stringify(defaultArrows),
      legendData: JSON.stringify(defaultLegend),
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

/** Helper to create a new partner profile page */
export function createPartnerProfilePage(order: number): Page {
  return {
    id: crypto.randomUUID(),
    order,
    type: 'partner-profile',
    content: {
      partnerLogoImage: '',
      bodyParagraph: createTranslatableField(''),
      showLinks: 'false',
      linkLabel: createTranslatableField(''),
      linkUrl: createTranslatableField(''),
      contactLine1: createTranslatableField(''),
      contactLine2: createTranslatableField(''),
      contactLine3: createTranslatableField(''),
      contactLine4: createTranslatableField(''),
      contactLine5: createTranslatableField(''),
      bottomUrl: createTranslatableField(''),
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '32',
    },
  };
}

/** Helper to create a new photo gallery page */
export function createPhotoGalleryPage(order: number): Page {
  const defaultPhotos = [
    { id: crypto.randomUUID(), imageKey: '' },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'photo-gallery',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      photosData: JSON.stringify(defaultPhotos),
    },
  };
}

/** Helper to create a new logos + text + table image page */
export function createLogosTextTablePage(order: number): Page {
  const defaultEntries = [
    {
      id: crypto.randomUUID(),
      logoImage: '',
      heading: { en: '', 'zh-tw': '', 'zh-cn': '' },
      bullets: [{ en: '', 'zh-tw': '', 'zh-cn': '' }],
    },
  ];

  return {
    id: crypto.randomUUID(),
    order,
    type: 'logos-text-table',
    content: {
      sectionLabel: createTranslatableField(''),
      year: new Date().getFullYear().toString(),
      pageNumber: '20',
      entriesData: JSON.stringify(defaultEntries),
      tableTitle: createTranslatableField(''),
      tableImage: '',
      showFootnote: 'false',
      footnote: createTranslatableField(''),
      showSource: 'false',
      source: createTranslatableField(''),
    },
  };
}
