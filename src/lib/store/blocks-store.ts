import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReusableBlock, PageType } from '../../types/presentation';
import {
  createTranslatableField,
  createCoverPage,
  createValuePropositionPage,
  createDiagramPage,
  createIndexPage,
  createSectionDividerPage,
  createDisclaimerPage,
  createContactPage,
  createMultiCardGridPage,
  createTextChartPage,
  createDataTablePage,
  createComparisonTablePage,
  createTimelineImagePage,
  createTextImagesPage,
  createBeforeAfterPage,
  createMapTextPage,
  createThreeCirclesPage,
  createFlowChartPage,
  createPartnerProfilePage,
  createLogosTextTablePage,
  createPhotoGalleryPage,
  createLongFormTextPage,
  createTextNewsPage,
} from '../../types/presentation';

export function getDefaultContent(type: PageType): Record<string, import('../../types/presentation').TranslatableField | string> {
  const year = new Date().getFullYear().toString();
  switch (type) {
    case 'cover':           return createCoverPage(0).content;
    case 'value-proposition': return createValuePropositionPage(0).content;
    case 'diagram':         return createDiagramPage(0).content;
    case 'index':           return createIndexPage(0).content;
    case 'section-divider': return createSectionDividerPage(0).content;
    case 'disclaimer':      return createDisclaimerPage(0).content;
    case 'contact':         return createContactPage(0).content;
    case 'multi-card-grid': return createMultiCardGridPage(0).content;
    case 'text-chart':      return createTextChartPage(0).content;
    case 'data-table':      return createDataTablePage(0).content;
    case 'comparison-table': return createComparisonTablePage(0).content;
    case 'timeline-image':  return createTimelineImagePage(0).content;
    case 'text-images':     return createTextImagesPage(0).content;
    case 'before-after':    return createBeforeAfterPage(0).content;
    case 'map-text':        return createMapTextPage(0).content;
    case 'three-circles':   return createThreeCirclesPage(0).content;
    case 'flow-chart':      return createFlowChartPage(0).content;
    case 'partner-profile': return createPartnerProfilePage(0).content;
    case 'logos-text-table': return createLogosTextTablePage(0).content;
    case 'photo-gallery':   return createPhotoGalleryPage(0).content;
    case 'long-form-text': return createLongFormTextPage(0).content;
    case 'text-news':      return createTextNewsPage(0).content;
    default:
      return { sectionLabel: createTranslatableField(''), year };
  }
}

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  'cover':             'Cover',
  'value-proposition': 'Value Proposition',
  'diagram':           'Diagram / Branching',
  'index':             'Index / Table of Contents',
  'section-divider':   'Section Divider',
  'long-form-text':    'Long-form Text (2-col)',
  'timeline-image':    'Timeline + Image',
  'text-chart':        'Text + Chart',
  'multi-card-grid':   'Multi-card Grid',
  'map-text':          'Map + Text',
  'text-images':       'Text + Images',
  'before-after':      'Before / After Grid',
  'photo-gallery':     'Photo Gallery',
  'data-table':        'Data Table',
  'comparison-table':  'Comparison Table',
  'three-circles':     'Three Circles',
  'text-news':         'Text + News Clippings',
  'flow-chart':        'Flow Chart / Org Structure',
  'disclaimer':        'Disclaimer',
  'contact':           'Contact / Closing',
  'partner-profile':   'Partner Profile',
  'logos-text-table':  'Logos + Text + Table',
};

interface BlocksState {
  blocks: ReusableBlock[];
  createBlock: (name: string, type: PageType) => ReusableBlock;
  updateBlock: (id: string, name: string, content: Record<string, import('../../types/presentation').TranslatableField | string>) => void;
  deleteBlock: (id: string) => void;
  getBlock: (id: string) => ReusableBlock | undefined;
  addUsage: (blockId: string, presentationId: string) => void;
  removeUsage: (blockId: string, presentationId: string) => void;
}

export const useBlocksStore = create<BlocksState>()(
  persist(
    (set, get) => ({
      blocks: [],

      createBlock: (name, type) => {
        const block: ReusableBlock = {
          id: crypto.randomUUID(),
          name: name.trim() || 'Untitled Block',
          type,
          content: getDefaultContent(type),
          usedIn: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ blocks: [...state.blocks, block] }));
        return block;
      },

      updateBlock: (id, name, content) => {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id
              ? { ...b, name: name.trim() || b.name, content, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      deleteBlock: (id) => {
        set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) }));
      },

      getBlock: (id) => get().blocks.find((b) => b.id === id),

      addUsage: (blockId, presentationId) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === blockId && !b.usedIn.includes(presentationId)
              ? { ...b, usedIn: [...b.usedIn, presentationId] }
              : b
          ),
        })),

      removeUsage: (blockId, presentationId) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === blockId
              ? { ...b, usedIn: b.usedIn.filter((id) => id !== presentationId) }
              : b
          ),
        })),
    }),
    {
      name: 'deckflow-blocks',
    }
  )
);
