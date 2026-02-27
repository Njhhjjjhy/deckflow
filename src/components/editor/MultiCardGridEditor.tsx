import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';

interface CardData {
  id: string;
  icon: string;
  heading: Record<string, string>;
  bodyType: 'bullets' | 'paragraph';
  bullets: Record<string, string>[];
  paragraph: Record<string, string>;
}

interface MultiCardGridEditorProps {
  page: Page;
}

const MAX_CARDS = 10;
const MIN_CARDS = 4;
const ICON_MAX_SIZE = 1 * 1024 * 1024; // 1MB
const ICON_ACCEPTED = '.png,.svg,.webp,.jpg,.jpeg';

function createEmptyLang(): Record<string, string> {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function createEmptyCard(): CardData {
  return {
    id: crypto.randomUUID(),
    icon: '',
    heading: createEmptyLang(),
    bodyType: 'bullets',
    bullets: [createEmptyLang()],
    paragraph: createEmptyLang(),
  };
}

/** Wraps a Record<string,string> as a TranslatableField shape for LanguageTabs */
function asTranslatableField(rec: Record<string, string>) {
  return {
    en: rec.en || '',
    'zh-tw': rec['zh-tw'] || '',
    'zh-cn': rec['zh-cn'] || '',
    translationStatus: {
      'zh-tw': 'empty' as const,
      'zh-cn': 'empty' as const,
    },
  };
}

export default function MultiCardGridEditor({ page }: MultiCardGridEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const cardsDataRaw = (page.content.cardsData as string) || '[]';

  // Parse cards from JSON
  const [cards, setCards] = useState<CardData[]>([]);
  const [iconDataMap, setIconDataMap] = useState<Record<string, string | null>>({});

  // Parse cards on mount / when cardsData changes from store
  useEffect(() => {
    try {
      const parsed = JSON.parse(cardsDataRaw) as CardData[];
      setCards(parsed);
      // Load icons
      parsed.forEach((card) => {
        if (card.icon) {
          loadImage(card.icon).then((data) => {
            setIconDataMap((prev) => ({ ...prev, [card.id]: data }));
          });
        }
      });
    } catch {
      setCards([]);
    }
  }, []);  // Only on mount — afterwards we manage locally and push to store

  // Sync cards to store
  const syncCards = useCallback(
    (updated: CardData[]) => {
      setCards(updated);
      updateStringField(page.id, 'cardsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const onSectionLabelChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'sectionLabel', lang, value);
    },
    [page.id, updateTranslatableField]
  );

  const onYearChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStringField(page.id, 'year', e.target.value);
    },
    [page.id, updateStringField]
  );

  const onPageNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStringField(page.id, 'pageNumber', e.target.value);
    },
    [page.id, updateStringField]
  );

  // Card operations
  const addCard = useCallback(() => {
    if (cards.length >= MAX_CARDS) return;
    syncCards([...cards, createEmptyCard()]);
  }, [cards, syncCards]);

  const removeCard = useCallback(
    (cardId: string) => {
      if (cards.length <= MIN_CARDS) return;
      syncCards(cards.filter((c) => c.id !== cardId));
    },
    [cards, syncCards]
  );

  const moveCard = useCallback(
    (cardId: string, direction: 'up' | 'down') => {
      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx === -1) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= cards.length) return;
      const updated = [...cards];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncCards(updated);
    },
    [cards, syncCards]
  );

  const updateCardHeading = useCallback(
    (cardId: string, lang: Language, value: string) => {
      const updated = cards.map((c) =>
        c.id === cardId ? { ...c, heading: { ...c.heading, [lang]: value } } : c
      );
      syncCards(updated);
    },
    [cards, syncCards]
  );

  const toggleBodyType = useCallback(
    (cardId: string) => {
      const updated = cards.map((c) =>
        c.id === cardId
          ? { ...c, bodyType: c.bodyType === 'bullets' ? 'paragraph' as const : 'bullets' as const }
          : c
      );
      syncCards(updated);
    },
    [cards, syncCards]
  );

  const updateBullet = useCallback(
    (cardId: string, bulletIdx: number, lang: Language, value: string) => {
      const updated = cards.map((c) => {
        if (c.id !== cardId) return c;
        const bullets = [...c.bullets];
        bullets[bulletIdx] = { ...bullets[bulletIdx], [lang]: value };
        return { ...c, bullets };
      });
      syncCards(updated);
    },
    [cards, syncCards]
  );

  const addBullet = useCallback(
    (cardId: string) => {
      const updated = cards.map((c) => {
        if (c.id !== cardId) return c;
        if (c.bullets.length >= 5) return c;
        return { ...c, bullets: [...c.bullets, createEmptyLang()] };
      });
      syncCards(updated);
    },
    [cards, syncCards]
  );

  const removeBullet = useCallback(
    (cardId: string, bulletIdx: number) => {
      const updated = cards.map((c) => {
        if (c.id !== cardId) return c;
        if (c.bullets.length <= 1) return c;
        return { ...c, bullets: c.bullets.filter((_, i) => i !== bulletIdx) };
      });
      syncCards(updated);
    },
    [cards, syncCards]
  );

  const moveBullet = useCallback(
    (cardId: string, bulletIdx: number, direction: 'up' | 'down') => {
      const updated = cards.map((c) => {
        if (c.id !== cardId) return c;
        const swapIdx = direction === 'up' ? bulletIdx - 1 : bulletIdx + 1;
        if (swapIdx < 0 || swapIdx >= c.bullets.length) return c;
        const bullets = [...c.bullets];
        [bullets[bulletIdx], bullets[swapIdx]] = [bullets[swapIdx], bullets[bulletIdx]];
        return { ...c, bullets };
      });
      syncCards(updated);
    },
    [cards, syncCards]
  );

  const updateParagraph = useCallback(
    (cardId: string, lang: Language, value: string) => {
      const updated = cards.map((c) =>
        c.id === cardId ? { ...c, paragraph: { ...c.paragraph, [lang]: value } } : c
      );
      syncCards(updated);
    },
    [cards, syncCards]
  );

  // Icon upload per card
  const iconInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [iconErrors, setIconErrors] = useState<Record<string, string | null>>({});

  const processIconFile = useCallback(
    async (cardId: string, file: File) => {
      setIconErrors((prev) => ({ ...prev, [cardId]: null }));
      if (file.size > ICON_MAX_SIZE) {
        setIconErrors((prev) => ({ ...prev, [cardId]: 'Icon must be under 1MB' }));
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp|svg\+xml)$/)) {
        setIconErrors((prev) => ({ ...prev, [cardId]: 'Only PNG, SVG, WebP, or JPG' }));
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        const key = `img-${crypto.randomUUID()}`;
        await saveImage(key, base64);
        setIconDataMap((prev) => ({ ...prev, [cardId]: base64 }));
        const updated = cards.map((c) =>
          c.id === cardId ? { ...c, icon: key } : c
        );
        syncCards(updated);
      } catch {
        setIconErrors((prev) => ({ ...prev, [cardId]: 'Upload failed. Try again.' }));
      }
    },
    [cards, syncCards]
  );

  const clearIcon = useCallback(
    (cardId: string) => {
      setIconDataMap((prev) => ({ ...prev, [cardId]: null }));
      const updated = cards.map((c) =>
        c.id === cardId ? { ...c, icon: '' } : c
      );
      syncCards(updated);
    },
    [cards, syncCards]
  );

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Multi-Card Grid
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={onSectionLabelChange}
          placeholder="e.g. 02 | Our Strengths"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={onYearChange}
          placeholder="e.g. 2026"
          maxLength={10}
          className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A' }}
        />
      </fieldset>

      {/* Page number */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Page Number</label>
        {pageNumber ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pageNumber}
              onChange={onPageNumberChange}
              maxLength={4}
              className="w-24 px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
              style={{ color: '#1A1A1A' }}
            />
            <button
              onClick={() => updateStringField(page.id, 'pageNumber', '')}
              className="px-2 py-2 text-xs rounded border border-[#E5E5E5] hover:bg-red-50 hover:border-red-200 transition-colors"
              style={{ color: '#999' }}
              title="Remove page number"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => updateStringField(page.id, 'pageNumber', String(page.order + 1))}
            className="px-3 py-2 text-xs rounded border border-dashed border-[#CCCCCC] hover:border-[#FBB931] transition-colors"
            style={{ color: '#666' }}
          >
            + Add page number
          </button>
        )}
      </fieldset>

      {/* Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Cards ({cards.length}/{MAX_CARDS})
          </label>
          <button
            onClick={addCard}
            disabled={cards.length >= MAX_CARDS}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Card
          </button>
        </div>

        <div className="space-y-4">
          {cards.map((card, cardIdx) => (
            <div
              key={card.id}
              className="border rounded p-3"
              style={{ borderColor: '#E5E5E5', background: '#FAFAFA' }}
            >
              {/* Card header with controls */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  Card {cardIdx + 1}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => moveCard(card.id, 'up')}
                    disabled={cardIdx === 0}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveCard(card.id, 'down')}
                    disabled={cardIdx === cards.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeCard(card.id)}
                    disabled={cards.length <= MIN_CARDS}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-red-100 disabled:opacity-25"
                    style={{ color: '#999' }}
                    title="Remove card"
                  >
                    ✕
                  </button>
                </span>
              </div>

              {/* Icon upload */}
              <div className="mb-2">
                <span className="block text-[10px] text-[#999] mb-1">Icon (optional)</span>
                {iconDataMap[card.id] ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={iconDataMap[card.id]!}
                      alt=""
                      className="w-8 h-8 object-contain rounded border border-[#E5E5E5]"
                    />
                    <button
                      onClick={() => clearIcon(card.id)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      ✕ remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => iconInputRefs.current[card.id]?.click()}
                    className="flex items-center justify-center w-8 h-8 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
                    style={{ borderColor: '#CCCCCC' }}
                    title="Upload icon"
                  >
                    <span className="text-xs text-[#999]">+</span>
                  </button>
                )}
                {iconErrors[card.id] && (
                  <p className="text-[10px] text-red-500 mt-0.5">{iconErrors[card.id]}</p>
                )}
                <input
                  ref={(el) => { iconInputRefs.current[card.id] = el; }}
                  type="file"
                  accept={ICON_ACCEPTED}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processIconFile(card.id, file);
                    e.target.value = '';
                  }}
                  className="hidden"
                  aria-label={`Upload icon for card ${cardIdx + 1}`}
                />
              </div>

              {/* Heading */}
              <fieldset className="mb-2">
                <label className="block text-[10px] text-[#999] mb-1">Heading</label>
                <LanguageTabs
                  field={asTranslatableField(card.heading)}
                  onChange={(lang, value) => updateCardHeading(card.id, lang, value)}
                  placeholder="Card heading"
                />
              </fieldset>

              {/* Body type toggle */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-[#999]">Body:</span>
                <button
                  onClick={() => card.bodyType !== 'bullets' && toggleBodyType(card.id)}
                  className="px-2 py-0.5 text-[10px] rounded transition-colors"
                  style={{
                    background: card.bodyType === 'bullets' ? '#FBB931' : 'transparent',
                    color: '#1A1A1A',
                    fontWeight: card.bodyType === 'bullets' ? 600 : 400,
                    border: '1px solid',
                    borderColor: card.bodyType === 'bullets' ? '#FBB931' : '#E5E5E5',
                  }}
                >
                  Bullets
                </button>
                <button
                  onClick={() => card.bodyType !== 'paragraph' && toggleBodyType(card.id)}
                  className="px-2 py-0.5 text-[10px] rounded transition-colors"
                  style={{
                    background: card.bodyType === 'paragraph' ? '#FBB931' : 'transparent',
                    color: '#1A1A1A',
                    fontWeight: card.bodyType === 'paragraph' ? 600 : 400,
                    border: '1px solid',
                    borderColor: card.bodyType === 'paragraph' ? '#FBB931' : '#E5E5E5',
                  }}
                >
                  Paragraph
                </button>
              </div>

              {/* Bullets editor */}
              {card.bodyType === 'bullets' && (
                <div className="space-y-2">
                  {card.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex gap-1">
                      <div className="flex-1">
                        <LanguageTabs
                          field={asTranslatableField(bullet)}
                          onChange={(lang, value) => updateBullet(card.id, bi, lang, value)}
                          placeholder={`Bullet ${bi + 1}`}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5 pt-5">
                        <button
                          onClick={() => moveBullet(card.id, bi, 'up')}
                          disabled={bi === 0}
                          className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                          style={{ color: '#333' }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveBullet(card.id, bi, 'down')}
                          disabled={bi === card.bullets.length - 1}
                          className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                          style={{ color: '#333' }}
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => removeBullet(card.id, bi)}
                          disabled={card.bullets.length <= 1}
                          className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                          style={{ color: '#999' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {card.bullets.length < 5 && (
                    <button
                      onClick={() => addBullet(card.id)}
                      className="text-[10px] text-[#666] hover:text-[#1A1A1A] transition-colors"
                    >
                      + Add bullet
                    </button>
                  )}
                </div>
              )}

              {/* Paragraph editor */}
              {card.bodyType === 'paragraph' && (
                <LanguageTabs
                  field={asTranslatableField(card.paragraph)}
                  onChange={(lang, value) => updateParagraph(card.id, lang, value)}
                  multiline
                  placeholder="Paragraph text"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
