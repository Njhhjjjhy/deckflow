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
