import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';
import MapTextListEditor from './MapTextListEditor';
import MapTextOverlayEditor from './MapTextOverlayEditor';

interface MapCardData {
  id: string;
  heading: Record<string, string>;
  bullets: Record<string, string>[];
}

interface MapTextCardEditorProps {
  page: Page;
}

const MAX_CARDS = 5;
const MIN_CARDS = 1;
const MAX_BULLETS = 6;
const MAP_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAP_ACCEPTED = '.png,.jpg,.jpeg,.webp,.svg';

function createEmptyLang(): Record<string, string> {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function createEmptyCard(): MapCardData {
  return {
    id: crypto.randomUUID(),
    heading: createEmptyLang(),
    bullets: [createEmptyLang()],
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

export default function MapTextCardEditor({ page }: MapTextCardEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const mapTextMode = (page.content.mapTextMode as string) || 'A';
  const cardsDataRaw = (page.content.cardsData as string) || '[]';
  const arrowsDataRaw = (page.content.arrowsData as string) || '[]';
  const mapImageKey = (page.content.mapImage as string) || '';

  // Local state
  const [cards, setCards] = useState<MapCardData[]>([]);
  const [arrows, setArrows] = useState<boolean[]>([]);
  const [mapImageData, setMapImageData] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

  // Parse cards and arrows on mount
  useEffect(() => {
    try {
      setCards(JSON.parse(cardsDataRaw) as MapCardData[]);
    } catch {
      setCards([]);
    }
    try {
      setArrows(JSON.parse(arrowsDataRaw) as boolean[]);
    } catch {
      setArrows([]);
    }
  }, []);

  // Load map image
  useEffect(() => {
    if (!mapImageKey) { setMapImageData(null); return; }
    loadImage(mapImageKey).then((data) => setMapImageData(data));
  }, [mapImageKey]);

  // Sync helpers
  const syncCards = useCallback(
    (updated: MapCardData[]) => {
      setCards(updated);
      updateStringField(page.id, 'cardsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const syncArrows = useCallback(
    (updated: boolean[]) => {
      setArrows(updated);
      updateStringField(page.id, 'arrowsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  // Field handlers
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

  // Map image upload
  const processMapFile = useCallback(
    async (file: File) => {
      setMapError(null);
      if (file.size > MAP_MAX_SIZE) {
        setMapError('Image must be under 5MB');
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp|svg\+xml)$/)) {
        setMapError('Only PNG, JPG, WebP, or SVG');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        const key = `img-${crypto.randomUUID()}`;
        await saveImage(key, base64);
        setMapImageData(base64);
        updateStringField(page.id, 'mapImage', key);
      } catch {
        setMapError('Upload failed. Try again.');
      }
    },
    [page.id, updateStringField]
  );

  const clearMap = useCallback(() => {
    setMapImageData(null);
    updateStringField(page.id, 'mapImage', '');
  }, [page.id, updateStringField]);

  // Card operations
  const addCard = useCallback(() => {
    if (cards.length >= MAX_CARDS) return;
    const updated = [...cards, createEmptyCard()];
    // Add an arrow for the new gap
    const updatedArrows = [...arrows, true];
    syncCards(updated);
    syncArrows(updatedArrows);
  }, [cards, arrows, syncCards, syncArrows]);

  const removeCard = useCallback(
    (cardId: string) => {
      if (cards.length <= MIN_CARDS) return;
      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx === -1) return;
      const updated = cards.filter((c) => c.id !== cardId);
      // Remove the arrow at this gap (remove from idx, or last if removing last card)
      const arrowIdx = Math.min(idx, arrows.length - 1);
      const updatedArrows = arrows.filter((_, i) => i !== arrowIdx);
      syncCards(updated);
      syncArrows(updatedArrows);
    },
    [cards, arrows, syncCards, syncArrows]
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

  // Bullet operations
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
        if (c.bullets.length >= MAX_BULLETS) return c;
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

  // Arrow toggle
  const toggleArrow = useCallback(
    (gapIdx: number) => {
      const updated = [...arrows];
      updated[gapIdx] = !updated[gapIdx];
      syncArrows(updated);
    },
    [arrows, syncArrows]
  );

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Map + Text
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={onSectionLabelChange}
          placeholder="e.g. 03 | Organization"
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

      {/* Mode selector */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-2">Layout Mode</label>
        <div className="flex gap-2">
          {([
            { value: 'A', label: 'A: Cards' },
            { value: 'B', label: 'B: Property List' },
            { value: 'C', label: 'C: Map Overlay' },
          ] as const).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer text-xs transition-colors"
              style={{
                background: mapTextMode === opt.value ? '#FBB931' : 'transparent',
                color: mapTextMode === opt.value ? '#1A1A1A' : '#666',
                border: '1px solid',
                borderColor: mapTextMode === opt.value ? '#FBB931' : '#E5E5E5',
                fontWeight: mapTextMode === opt.value ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name={`mapTextMode-${page.id}`}
                value={opt.value}
                checked={mapTextMode === opt.value}
                onChange={() => updateStringField(page.id, 'mapTextMode', opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Divider */}
      <hr style={{ borderColor: '#E5E5E5' }} />

      {/* Mode-specific content */}
      {mapTextMode === 'C' ? (
        <MapTextOverlayEditor page={page} />
      ) : mapTextMode === 'B' ? (
        <MapTextListEditor page={page} />
      ) : (
        <>
          {/* Map image */}
          <fieldset>
            <label className="block text-xs font-medium text-[#333] mb-1">Map Image</label>
            {mapImageData ? (
              <div className="space-y-2">
                <img
                  src={mapImageData}
                  alt="Map preview"
                  className="w-full max-h-40 object-contain rounded border border-[#E5E5E5]"
                />
                <button
                  onClick={clearMap}
                  className="text-[10px] text-red-500 hover:underline"
                >
                  ✕ Remove map
                </button>
              </div>
            ) : (
              <button
                onClick={() => mapInputRef.current?.click()}
                className="w-full py-6 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors flex flex-col items-center gap-1"
                style={{ borderColor: '#CCCCCC' }}
              >
                <span className="text-xs text-[#999]">Click to upload map image</span>
                <span className="text-[10px] text-[#CCC]">PNG, JPG, WebP, SVG — max 5MB</span>
              </button>
            )}
            {mapError && (
              <p className="text-[10px] text-red-500 mt-0.5">{mapError}</p>
            )}
            <input
              ref={mapInputRef}
              type="file"
              accept={MAP_ACCEPTED}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processMapFile(file);
                e.target.value = '';
              }}
              className="hidden"
              aria-label="Upload map image"
            />
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

            <div className="space-y-3">
              {cards.map((card, cardIdx) => (
                <div key={card.id}>
                  {/* Card editor */}
                  <div
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

                    {/* Heading */}
                    <fieldset className="mb-2">
                      <label className="block text-[10px] text-[#999] mb-1">Heading</label>
                      <LanguageTabs
                        field={asTranslatableField(card.heading)}
                        onChange={(lang, value) => updateCardHeading(card.id, lang, value)}
                        placeholder="Card heading"
                      />
                    </fieldset>

                    {/* Bullets */}
                    <div className="space-y-2">
                      <label className="block text-[10px] text-[#999]">Bullets</label>
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
                      {card.bullets.length < MAX_BULLETS && (
                        <button
                          onClick={() => addBullet(card.id)}
                          className="text-[10px] text-[#666] hover:text-[#1A1A1A] transition-colors"
                        >
                          + Add bullet
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Arrow toggle between this card and the next */}
                  {cardIdx < cards.length - 1 && (
                    <div className="flex items-center justify-center py-1">
                      <button
                        onClick={() => toggleArrow(cardIdx)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] transition-colors"
                        style={{
                          background: arrows[cardIdx] ? '#FBB931' : 'transparent',
                          color: arrows[cardIdx] ? '#1A1A1A' : '#999',
                          border: '1px solid',
                          borderColor: arrows[cardIdx] ? '#FBB931' : '#E5E5E5',
                        }}
                        title={arrows[cardIdx] ? 'Hide arrow' : 'Show arrow'}
                      >
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                          <path
                            d="M5 0 L5 8 M2 6 L5 10 L8 6"
                            stroke={arrows[cardIdx] ? '#1A1A1A' : '#999'}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {arrows[cardIdx] ? 'Arrow on' : 'Arrow off'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
