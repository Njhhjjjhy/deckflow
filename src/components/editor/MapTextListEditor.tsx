import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';

interface GroupData {
  id: string;
  label: Record<string, string>;
  items: Record<string, string>[];
}

interface SummaryRowData {
  label: Record<string, string>;
  value: Record<string, string>;
  subValue: Record<string, string>;
}

interface MapTextListEditorProps {
  page: Page;
}

const MAX_GROUPS = 8;
const MAX_ITEMS = 10;
const MAP_MAX_SIZE = 5 * 1024 * 1024;
const MAP_ACCEPTED = '.png,.jpg,.jpeg,.webp,.svg';

function createEmptyLang(): Record<string, string> {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function createEmptyGroup(): GroupData {
  return {
    id: crypto.randomUUID(),
    label: createEmptyLang(),
    items: [createEmptyLang()],
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

export default function MapTextListEditor({ page }: MapTextListEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const listHeading = page.content.listHeading as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const leftGroupsRaw = (page.content.leftColumnGroups as string) || '[]';
  const rightGroupsRaw = (page.content.rightColumnGroups as string) || '[]';
  const showSummaryTable = (page.content.showSummaryTable as string) === 'true';
  const summaryRowsRaw = (page.content.summaryRowsData as string) || '[]';
  const mapImageKey = (page.content.mapImage as string) || '';

  // Local state
  const [leftGroups, setLeftGroups] = useState<GroupData[]>([]);
  const [rightGroups, setRightGroups] = useState<GroupData[]>([]);
  const [summaryRows, setSummaryRows] = useState<SummaryRowData[]>([]);
  const [mapImageData, setMapImageData] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

  // Parse on mount
  useEffect(() => {
    try { setLeftGroups(JSON.parse(leftGroupsRaw)); } catch { setLeftGroups([]); }
    try { setRightGroups(JSON.parse(rightGroupsRaw)); } catch { setRightGroups([]); }
    try { setSummaryRows(JSON.parse(summaryRowsRaw)); } catch { setSummaryRows([]); }
  }, []);

  // Load map image
  useEffect(() => {
    if (!mapImageKey) { setMapImageData(null); return; }
    loadImage(mapImageKey).then((data) => setMapImageData(data));
  }, [mapImageKey]);

  // Sync helpers
  const syncLeftGroups = useCallback(
    (updated: GroupData[]) => {
      setLeftGroups(updated);
      updateStringField(page.id, 'leftColumnGroups', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const syncRightGroups = useCallback(
    (updated: GroupData[]) => {
      setRightGroups(updated);
      updateStringField(page.id, 'rightColumnGroups', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const syncSummaryRows = useCallback(
    (updated: SummaryRowData[]) => {
      setSummaryRows(updated);
      updateStringField(page.id, 'summaryRowsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  // Heading handler
  const onListHeadingChange = useCallback(
    (lang: Language, value: string) => {
      updateTranslatableField(page.id, 'listHeading', lang, value);
    },
    [page.id, updateTranslatableField]
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

  // Summary table toggle
  const toggleSummaryTable = useCallback(() => {
    updateStringField(page.id, 'showSummaryTable', showSummaryTable ? 'false' : 'true');
  }, [page.id, showSummaryTable, updateStringField]);

  // Generic group operations (reused for left/right)
  function makeGroupOps(
    groups: GroupData[],
    sync: (updated: GroupData[]) => void,
  ) {
    return {
      addGroup: () => {
        if (groups.length >= MAX_GROUPS) return;
        sync([...groups, createEmptyGroup()]);
      },
      removeGroup: (groupId: string) => {
        if (groups.length <= 1) return;
        sync(groups.filter((g) => g.id !== groupId));
      },
      moveGroup: (groupId: string, direction: 'up' | 'down') => {
        const idx = groups.findIndex((g) => g.id === groupId);
        if (idx === -1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= groups.length) return;
        const updated = [...groups];
        [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
        sync(updated);
      },
      updateGroupLabel: (groupId: string, lang: Language, value: string) => {
        sync(groups.map((g) =>
          g.id === groupId ? { ...g, label: { ...g.label, [lang]: value } } : g
        ));
      },
      addItem: (groupId: string) => {
        sync(groups.map((g) => {
          if (g.id !== groupId || g.items.length >= MAX_ITEMS) return g;
          return { ...g, items: [...g.items, createEmptyLang()] };
        }));
      },
      removeItem: (groupId: string, itemIdx: number) => {
        sync(groups.map((g) => {
          if (g.id !== groupId || g.items.length <= 1) return g;
          return { ...g, items: g.items.filter((_, i) => i !== itemIdx) };
        }));
      },
      moveItem: (groupId: string, itemIdx: number, direction: 'up' | 'down') => {
        sync(groups.map((g) => {
          if (g.id !== groupId) return g;
          const swapIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;
          if (swapIdx < 0 || swapIdx >= g.items.length) return g;
          const items = [...g.items];
          [items[itemIdx], items[swapIdx]] = [items[swapIdx], items[itemIdx]];
          return { ...g, items };
        }));
      },
      updateItem: (groupId: string, itemIdx: number, lang: Language, value: string) => {
        sync(groups.map((g) => {
          if (g.id !== groupId) return g;
          const items = [...g.items];
          items[itemIdx] = { ...items[itemIdx], [lang]: value };
          return { ...g, items };
        }));
      },
    };
  }

  const leftOps = makeGroupOps(leftGroups, syncLeftGroups);
  const rightOps = makeGroupOps(rightGroups, syncRightGroups);

  // Summary row updates
  const updateSummaryRow = useCallback(
    (rowIdx: number, field: 'label' | 'value' | 'subValue', lang: Language, value: string) => {
      const updated = summaryRows.map((row, i) => {
        if (i !== rowIdx) return row;
        return { ...row, [field]: { ...row[field], [lang]: value } };
      });
      syncSummaryRows(updated);
    },
    [summaryRows, syncSummaryRows]
  );

  // Render a column of groups
  function renderGroupColumn(
    label: string,
    groups: GroupData[],
    ops: ReturnType<typeof makeGroupOps>,
  ) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            {label} ({groups.length}/{MAX_GROUPS})
          </label>
          <button
            onClick={ops.addGroup}
            disabled={groups.length >= MAX_GROUPS}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Group
          </button>
        </div>

        <div className="space-y-3">
          {groups.map((group, gi) => (
            <div
              key={group.id}
              className="border rounded p-3"
              style={{ borderColor: '#E5E5E5', background: '#FAFAFA' }}
            >
              {/* Group header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  Group {gi + 1}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => ops.moveGroup(group.id, 'up')}
                    disabled={gi === 0}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => ops.moveGroup(group.id, 'down')}
                    disabled={gi === groups.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => ops.removeGroup(group.id)}
                    disabled={groups.length <= 1}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-red-100 disabled:opacity-25"
                    style={{ color: '#999' }}
                    title="Remove group"
                  >
                    ✕
                  </button>
                </span>
              </div>

              {/* Group label */}
              <fieldset className="mb-2">
                <label className="block text-[10px] text-[#999] mb-1">Label (bold underlined)</label>
                <LanguageTabs
                  field={asTranslatableField(group.label)}
                  onChange={(lang, value) => ops.updateGroupLabel(group.id, lang, value)}
                  placeholder="e.g. Property type"
                />
              </fieldset>

              {/* Items */}
              <div className="space-y-2">
                <label className="block text-[10px] text-[#999]">Items</label>
                {group.items.map((item, ii) => (
                  <div key={ii} className="flex gap-1">
                    <div className="flex-1">
                      <LanguageTabs
                        field={asTranslatableField(item)}
                        onChange={(lang, value) => ops.updateItem(group.id, ii, lang, value)}
                        placeholder={`Item ${ii + 1}`}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 pt-5">
                      <button
                        onClick={() => ops.moveItem(group.id, ii, 'up')}
                        disabled={ii === 0}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                        style={{ color: '#333' }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => ops.moveItem(group.id, ii, 'down')}
                        disabled={ii === group.items.length - 1}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                        style={{ color: '#333' }}
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => ops.removeItem(group.id, ii)}
                        disabled={group.items.length <= 1}
                        className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                        style={{ color: '#999' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {group.items.length < MAX_ITEMS && (
                  <button
                    onClick={() => ops.addItem(group.id)}
                    className="text-[10px] text-[#666] hover:text-[#1A1A1A] transition-colors"
                  >
                    + Add item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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

      {/* List heading */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Heading</label>
        <LanguageTabs
          field={listHeading as any}
          onChange={onListHeadingChange}
          placeholder="e.g. Property Details — Oakwater"
        />
      </fieldset>

      {/* Left column groups */}
      {renderGroupColumn('Left Column Groups', leftGroups, leftOps)}

      {/* Right column groups */}
      {renderGroupColumn('Right Column Groups', rightGroups, rightOps)}

      {/* Summary table toggle */}
      <fieldset>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSummaryTable}
            className="px-3 py-1.5 text-xs rounded transition-colors"
            style={{
              background: showSummaryTable ? '#FBB931' : 'transparent',
              color: showSummaryTable ? '#1A1A1A' : '#666',
              border: '1px solid',
              borderColor: showSummaryTable ? '#FBB931' : '#E5E5E5',
            }}
          >
            {showSummaryTable ? 'Summary Table ON' : 'Summary Table OFF'}
          </button>
        </div>
      </fieldset>

      {/* Summary rows (always 2 rows) */}
      {showSummaryTable && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[#333]">Summary Table Rows</label>
          {summaryRows.map((row, ri) => (
            <div
              key={ri}
              className="border rounded p-3"
              style={{ borderColor: '#E5E5E5', background: '#FAFAFA' }}
            >
              <span className="text-xs font-semibold text-[#1A1A1A] mb-2 block">
                Row {ri + 1}
              </span>
              <fieldset className="mb-2">
                <label className="block text-[10px] text-[#999] mb-1">Label</label>
                <LanguageTabs
                  field={asTranslatableField(row.label)}
                  onChange={(lang, value) => updateSummaryRow(ri, 'label', lang, value)}
                  placeholder="e.g. Total investment"
                />
              </fieldset>
              <fieldset className="mb-2">
                <label className="block text-[10px] text-[#999] mb-1">Value</label>
                <LanguageTabs
                  field={asTranslatableField(row.value)}
                  onChange={(lang, value) => updateSummaryRow(ri, 'value', lang, value)}
                  placeholder="e.g. ¥1.2B"
                />
              </fieldset>
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Sub-value (optional)</label>
                <LanguageTabs
                  field={asTranslatableField(row.subValue)}
                  onChange={(lang, value) => updateSummaryRow(ri, 'subValue', lang, value)}
                  placeholder="e.g. approx. US$8M"
                />
              </fieldset>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
