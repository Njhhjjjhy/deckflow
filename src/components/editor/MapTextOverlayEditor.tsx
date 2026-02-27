import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';

interface CalloutData {
  id: string;
  label: Record<string, string>;
  x: number;
  y: number;
  color: string;
  visible: boolean;
}

interface MapTextOverlayEditorProps {
  page: Page;
}

const MAX_CALLOUTS = 20;
const MAP_MAX_SIZE = 5 * 1024 * 1024;
const MAP_ACCEPTED = '.png,.jpg,.jpeg,.webp,.svg';

function createEmptyLang(): Record<string, string> {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function createEmptyCallout(): CalloutData {
  return {
    id: crypto.randomUUID(),
    label: createEmptyLang(),
    x: 50,
    y: 50,
    color: '#FBB931',
    visible: true,
  };
}

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

export default function MapTextOverlayEditor({ page }: MapTextOverlayEditorProps) {
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const calloutsDataRaw = (page.content.calloutsData as string) || '[]';
  const mapImageKey = (page.content.mapImage as string) || '';

  const [callouts, setCallouts] = useState<CalloutData[]>([]);
  const [mapImageData, setMapImageData] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

  // Parse callouts on mount
  useEffect(() => {
    try {
      setCallouts(JSON.parse(calloutsDataRaw) as CalloutData[]);
    } catch {
      setCallouts([]);
    }
  }, []);

  // Load map image
  useEffect(() => {
    if (!mapImageKey) { setMapImageData(null); return; }
    loadImage(mapImageKey).then((data) => setMapImageData(data));
  }, [mapImageKey]);

  const syncCallouts = useCallback(
    (updated: CalloutData[]) => {
      setCallouts(updated);
      updateStringField(page.id, 'calloutsData', JSON.stringify(updated));
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

  // Callout operations
  const addCallout = useCallback(() => {
    if (callouts.length >= MAX_CALLOUTS) return;
    syncCallouts([...callouts, createEmptyCallout()]);
  }, [callouts, syncCallouts]);

  const removeCallout = useCallback(
    (calloutId: string) => {
      syncCallouts(callouts.filter((c) => c.id !== calloutId));
    },
    [callouts, syncCallouts]
  );

  const moveCallout = useCallback(
    (calloutId: string, direction: 'up' | 'down') => {
      const idx = callouts.findIndex((c) => c.id === calloutId);
      if (idx === -1) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= callouts.length) return;
      const updated = [...callouts];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncCallouts(updated);
    },
    [callouts, syncCallouts]
  );

  const updateCalloutLabel = useCallback(
    (calloutId: string, lang: Language, value: string) => {
      const updated = callouts.map((c) =>
        c.id === calloutId ? { ...c, label: { ...c.label, [lang]: value } } : c
      );
      syncCallouts(updated);
    },
    [callouts, syncCallouts]
  );

  const updateCalloutX = useCallback(
    (calloutId: string, value: number) => {
      const clamped = Math.max(0, Math.min(100, value));
      const updated = callouts.map((c) =>
        c.id === calloutId ? { ...c, x: clamped } : c
      );
      syncCallouts(updated);
    },
    [callouts, syncCallouts]
  );

  const updateCalloutY = useCallback(
    (calloutId: string, value: number) => {
      const clamped = Math.max(0, Math.min(100, value));
      const updated = callouts.map((c) =>
        c.id === calloutId ? { ...c, y: clamped } : c
      );
      syncCallouts(updated);
    },
    [callouts, syncCallouts]
  );

  const updateCalloutColor = useCallback(
    (calloutId: string, color: string) => {
      const updated = callouts.map((c) =>
        c.id === calloutId ? { ...c, color } : c
      );
      syncCallouts(updated);
    },
    [callouts, syncCallouts]
  );

  const toggleCalloutVisibility = useCallback(
    (calloutId: string) => {
      const updated = callouts.map((c) =>
        c.id === calloutId ? { ...c, visible: !c.visible } : c
      );
      syncCallouts(updated);
    },
    [callouts, syncCallouts]
  );

  return (
    <div className="space-y-4">
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
              Remove map
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

      {/* Callouts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Callouts ({callouts.length}/{MAX_CALLOUTS})
          </label>
          <button
            onClick={addCallout}
            disabled={callouts.length >= MAX_CALLOUTS}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Callout
          </button>
        </div>

        <div className="space-y-3">
          {callouts.map((callout, idx) => (
            <div
              key={callout.id}
              className="border rounded p-3"
              style={{
                borderColor: callout.visible ? '#E5E5E5' : '#F0F0F0',
                background: callout.visible ? '#FAFAFA' : '#F8F8F8',
                opacity: callout.visible ? 1 : 0.6,
              }}
            >
              {/* Callout header with controls */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  Callout {idx + 1}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => toggleCalloutVisibility(callout.id)}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5]"
                    style={{ color: callout.visible ? '#333' : '#CCC' }}
                    title={callout.visible ? 'Hide callout' : 'Show callout'}
                  >
                    {callout.visible ? '●' : '○'}
                  </button>
                  <button
                    onClick={() => moveCallout(callout.id, 'up')}
                    disabled={idx === 0}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveCallout(callout.id, 'down')}
                    disabled={idx === callouts.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeCallout(callout.id)}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-red-100"
                    style={{ color: '#999' }}
                    title="Remove callout"
                  >
                    ✕
                  </button>
                </span>
              </div>

              {/* Label */}
              <fieldset className="mb-2">
                <label className="block text-[10px] text-[#999] mb-1">Label</label>
                <LanguageTabs
                  field={asTranslatableField(callout.label)}
                  onChange={(lang, value) => updateCalloutLabel(callout.id, lang, value)}
                  placeholder="Callout label"
                />
              </fieldset>

              {/* Position and color */}
              <div className="flex gap-2 items-end">
                <fieldset className="flex-1">
                  <label className="block text-[10px] text-[#999] mb-1">X %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={callout.x}
                    onChange={(e) => updateCalloutX(callout.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
                    style={{ color: '#1A1A1A' }}
                  />
                </fieldset>
                <fieldset className="flex-1">
                  <label className="block text-[10px] text-[#999] mb-1">Y %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={callout.y}
                    onChange={(e) => updateCalloutY(callout.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
                    style={{ color: '#1A1A1A' }}
                  />
                </fieldset>
                <fieldset>
                  <label className="block text-[10px] text-[#999] mb-1">Color</label>
                  <input
                    type="color"
                    value={callout.color}
                    onChange={(e) => updateCalloutColor(callout.id, e.target.value)}
                    className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
                    style={{ padding: 1 }}
                    title="Marker color"
                  />
                </fieldset>
              </div>
            </div>
          ))}
        </div>

        {callouts.length === 0 && (
          <p className="text-[10px] text-[#CCC] text-center py-4">
            No callouts yet. Add one to label locations on the map.
          </p>
        )}
      </div>
    </div>
  );
}
