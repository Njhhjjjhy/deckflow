import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Presentation, Page, Language, TranslatableField } from '../../types/presentation';
import { createCoverPage, createValuePropositionPage, createDiagramPage, createIndexPage, createSectionDividerPage, createDisclaimerPage, createContactPage, createMultiCardGridPage, createTextChartPage, createDataTablePage, createComparisonTablePage, createTimelineImagePage, createTextImagesPage, createBeforeAfterPage } from '../../types/presentation';

function createDefaultPresentation(): Presentation {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Presentation',
    category: 'investor-deck',
    dimensions: { width: 960, height: 540 },
    pages: [createCoverPage(0)],
    glossary: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

interface PresentationState {
  presentation: Presentation;
  selectedPageId: string | null;
  previewLanguage: Language;

  // Page selection
  selectPage: (pageId: string) => void;

  // Language
  setPreviewLanguage: (lang: Language) => void;

  // Content updates
  updateTranslatableField: (pageId: string, fieldKey: string, language: Language, value: string) => void;
  updateStringField: (pageId: string, fieldKey: string, value: string) => void;

  // Page management
  addPage: (type: Page['type']) => void;
  deletePage: (pageId: string) => void;
  reorderPage: (pageId: string, direction: 'up' | 'down') => void;
  movePage: (pageId: string, toIndex: number) => void;

  // Presentation metadata
  setName: (name: string) => void;
}

export const usePresentationStore = create<PresentationState>()(
  persist(
    (set) => {
      const defaultPres = createDefaultPresentation();
      return {
        presentation: defaultPres,
        selectedPageId: defaultPres.pages[0]?.id ?? null,
        previewLanguage: 'en',

        selectPage: (pageId) => set({ selectedPageId: pageId }),

        setPreviewLanguage: (lang) => set({ previewLanguage: lang }),

        updateTranslatableField: (pageId, fieldKey, language, value) =>
          set((state) => {
            const pages = state.presentation.pages.map((page) => {
              if (page.id !== pageId) return page;
              const field = page.content[fieldKey] as TranslatableField;
              if (!field || typeof field === 'string') return page;

              const updatedField = { ...field, [language]: value };

              // If editing EN after Chinese was reviewed, mark Chinese as outdated
              if (language === 'en') {
                const status = { ...updatedField.translationStatus };
                if (status['zh-tw'] === 'reviewed') status['zh-tw'] = 'outdated';
                if (status['zh-cn'] === 'reviewed') status['zh-cn'] = 'outdated';
                updatedField.translationStatus = status;
              }

              return {
                ...page,
                content: { ...page.content, [fieldKey]: updatedField },
              };
            });

            return {
              presentation: {
                ...state.presentation,
                pages,
                metadata: { ...state.presentation.metadata, updatedAt: new Date().toISOString() },
              },
            };
          }),

        updateStringField: (pageId, fieldKey, value) =>
          set((state) => {
            const pages = state.presentation.pages.map((page) => {
              if (page.id !== pageId) return page;
              return { ...page, content: { ...page.content, [fieldKey]: value } };
            });
            return {
              presentation: {
                ...state.presentation,
                pages,
                metadata: { ...state.presentation.metadata, updatedAt: new Date().toISOString() },
              },
            };
          }),

        addPage: (type) =>
          set((state) => {
            const order = state.presentation.pages.length;
            const newPage =
              type === 'value-proposition'
                ? createValuePropositionPage(order)
                : type === 'diagram'
                  ? createDiagramPage(order)
                  : type === 'index'
                    ? createIndexPage(order)
                    : type === 'section-divider'
                      ? createSectionDividerPage(order)
                      : type === 'disclaimer'
                        ? createDisclaimerPage(order)
                        : type === 'contact'
                          ? createContactPage(order)
                          : type === 'multi-card-grid'
                            ? createMultiCardGridPage(order)
                            : type === 'text-chart'
                              ? createTextChartPage(order)
                              : type === 'data-table'
                                ? createDataTablePage(order)
                                : type === 'comparison-table'
                                  ? createComparisonTablePage(order)
                                  : type === 'timeline-image'
                                    ? createTimelineImagePage(order)
                                    : type === 'text-images'
                                      ? createTextImagesPage(order)
                                      : type === 'before-after'
                                        ? createBeforeAfterPage(order)
                                        : createCoverPage(order);
            newPage.type = type;
            return {
              presentation: {
                ...state.presentation,
                pages: [...state.presentation.pages, newPage],
              },
              selectedPageId: newPage.id,
            };
          }),

        deletePage: (pageId) =>
          set((state) => {
            const pages = state.presentation.pages
              .filter((p) => p.id !== pageId)
              .map((p, i) => ({ ...p, order: i }));
            const selectedPageId =
              state.selectedPageId === pageId ? (pages[0]?.id ?? null) : state.selectedPageId;
            return {
              presentation: {
                ...state.presentation,
                pages,
                metadata: { ...state.presentation.metadata, updatedAt: new Date().toISOString() },
              },
              selectedPageId,
            };
          }),

        reorderPage: (pageId, direction) =>
          set((state) => {
            const pages = [...state.presentation.pages];
            const idx = pages.findIndex((p) => p.id === pageId);
            if (idx === -1) return state;
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= pages.length) return state;
            [pages[idx], pages[swapIdx]] = [pages[swapIdx], pages[idx]];
            const reordered = pages.map((p, i) => ({ ...p, order: i }));
            return {
              presentation: {
                ...state.presentation,
                pages: reordered,
                metadata: { ...state.presentation.metadata, updatedAt: new Date().toISOString() },
              },
            };
          }),

        movePage: (pageId, toIndex) =>
          set((state) => {
            const pages = [...state.presentation.pages];
            const fromIndex = pages.findIndex((p) => p.id === pageId);
            if (fromIndex === -1 || fromIndex === toIndex) return state;
            const clamped = Math.max(0, Math.min(toIndex, pages.length - 1));
            const [moved] = pages.splice(fromIndex, 1);
            pages.splice(clamped, 0, moved);
            const reordered = pages.map((p, i) => ({ ...p, order: i }));
            return {
              presentation: {
                ...state.presentation,
                pages: reordered,
                metadata: { ...state.presentation.metadata, updatedAt: new Date().toISOString() },
              },
            };
          }),

        setName: (name) =>
          set((state) => ({
            presentation: {
              ...state.presentation,
              name,
              metadata: { ...state.presentation.metadata, updatedAt: new Date().toISOString() },
            },
          })),
      };
    },
    {
      name: 'deckflow-presentation',
      partialize: (state) => ({
        presentation: state.presentation,
        selectedPageId: state.selectedPageId,
        previewLanguage: state.previewLanguage,
      }),
    }
  )
);
