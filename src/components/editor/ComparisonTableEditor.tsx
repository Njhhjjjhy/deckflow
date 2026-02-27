import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import LanguageTabs from './LanguageTabs';

const MAX_ROWS = 10;
const MIN_ROWS = 1;

interface RowData {
  label: Record<string, string>;
  moreHarvestValue: Record<string, string>;
  competitorValue: Record<string, string>;
}

function createEmptyLang(): Record<string, string> {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
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

interface ComparisonTableEditorProps {
  page: Page;
}

export default function ComparisonTableEditor({ page }: ComparisonTableEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const heading = page.content.heading as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const competitorHeaderLabel = page.content.competitorHeaderLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const sourceCitation = page.content.sourceCitation as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const rowsDataRaw = (page.content.rowsData as string) || '[]';

  const [rows, setRows] = useState<RowData[]>([]);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [draggedRowIdx, setDraggedRowIdx] = useState<number | null>(null);
  const [dragOverRowIdx, setDragOverRowIdx] = useState<number | null>(null);
  const dragCounter = useRef(0);
  const [gridLang, setGridLang] = useState<Language>('en');

  useEffect(() => {
    try { setRows(JSON.parse(rowsDataRaw)); } catch { setRows([]); }
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const syncRows = useCallback(
    (updated: RowData[]) => {
      setRows(updated);
      updateStringField(page.id, 'rowsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  // Row operations
  const addRow = useCallback(() => {
    if (rows.length >= MAX_ROWS) return;
    const newRow: RowData = {
      label: createEmptyLang(),
      moreHarvestValue: createEmptyLang(),
      competitorValue: createEmptyLang(),
    };
    syncRows([...rows, newRow]);
  }, [rows, syncRows]);

  const removeRow = useCallback(
    (idx: number) => {
      if (rows.length <= MIN_ROWS) return;
      syncRows(rows.filter((_, i) => i !== idx));
    },
    [rows, syncRows]
  );

  const moveRow = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (fromIdx === toIdx || toIdx < 0 || toIdx >= rows.length) return;
      const updated = [...rows];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      syncRows(updated);
    },
    [rows, syncRows]
  );

  const updateCellValue = useCallback(
    (rowIdx: number, field: 'label' | 'moreHarvestValue' | 'competitorValue', lang: Language, value: string) => {
      const updated = [...rows];
      updated[rowIdx] = { ...updated[rowIdx], [field]: { ...updated[rowIdx][field], [lang]: value } };
      syncRows(updated);
    },
    [rows, syncRows]
  );

  // Paste from Excel
  const handlePaste = useCallback(() => {
    const lines = pasteText.trim().split('\n');
    const parsed = lines.map((line) => line.split('\t'));

    const mismatch = parsed.find((row) => row.length !== 3);
    if (mismatch) {
      setToast({
        message: `Column mismatch: each row must have exactly 3 columns (row label, MoreHarvest value, competitor value). Found a row with ${mismatch.length} column(s).`,
        type: 'error',
      });
      return;
    }

    if (parsed.length > MAX_ROWS) {
      setToast({
        message: `Too many rows: maximum is ${MAX_ROWS}, but pasted data has ${parsed.length}.`,
        type: 'error',
      });
      return;
    }

    const newRows: RowData[] = parsed.map((cells) => ({
      label: { en: cells[0].trim(), 'zh-tw': '', 'zh-cn': '' },
      moreHarvestValue: { en: cells[1].trim(), 'zh-tw': '', 'zh-cn': '' },
      competitorValue: { en: cells[2].trim(), 'zh-tw': '', 'zh-cn': '' },
    }));

    syncRows(newRows);
    setShowPasteModal(false);
    setPasteText('');
    setToast({ message: `${newRows.length} rows imported successfully.`, type: 'success' });
  }, [pasteText, syncRows]);

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Comparison Table
      </h2>

      {/* Toast */}
      {toast && (
        <div
          className="px-3 py-2 rounded text-xs"
          style={{
            background: toast.type === 'success' ? '#D4EDDA' : '#F8D7DA',
            color: toast.type === 'success' ? '#155724' : '#721C24',
            border: `1px solid ${toast.type === 'success' ? '#C3E6CB' : '#F5C6CB'}`,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'sectionLabel', lang, value)}
          placeholder="e.g. 04 | Financing"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={(e) => updateStringField(page.id, 'year', e.target.value)}
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
              onChange={(e) => updateStringField(page.id, 'pageNumber', e.target.value)}
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

      {/* Heading */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Heading</label>
        <LanguageTabs
          field={heading as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'heading', lang, value)}
          placeholder="e.g. Comparison of financing options"
        />
      </fieldset>

      {/* Competitor header label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Competitor Header Label</label>
        <LanguageTabs
          field={competitorHeaderLabel as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'competitorHeaderLabel', lang, value)}
          placeholder="e.g. Typical foreign investor"
        />
      </fieldset>

      <hr className="border-[#E5E5E5]" />

      {/* Table data grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Comparison Rows ({rows.length}/{MAX_ROWS})
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPasteModal(true)}
              className="px-2 py-1 text-[10px] rounded border border-[#E5E5E5] hover:border-[#FBB931] transition-colors"
              style={{ color: '#333' }}
            >
              Paste from Excel
            </button>
            <button
              onClick={addRow}
              disabled={rows.length >= MAX_ROWS}
              className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
              style={{ background: '#FBB931', color: '#1A1A1A' }}
            >
              + Add Row
            </button>
          </div>
        </div>

        {/* Grid language toggle */}
        <div className="flex gap-1 mb-2">
          {(['en', 'zh-tw', 'zh-cn'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setGridLang(lang)}
              className="px-2 py-0.5 text-[10px] rounded transition-colors"
              style={{
                background: gridLang === lang ? '#FBB931' : 'transparent',
                color: '#1A1A1A',
                fontWeight: gridLang === lang ? 600 : 400,
                border: '1px solid',
                borderColor: gridLang === lang ? '#FBB931' : '#E5E5E5',
              }}
            >
              {lang === 'en' ? 'EN' : lang === 'zh-tw' ? 'zh-TW' : 'zh-CN'}
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div className="mb-1 flex items-center gap-0.5" style={{ paddingLeft: 20 }}>
          <span className="text-[9px] text-[#999] truncate text-center" style={{ flex: 1, minWidth: 0 }}>
            Row Label
          </span>
          <span className="text-[9px] text-[#999] truncate text-center" style={{ flex: 2, minWidth: 0 }}>
            MoreHarvest
          </span>
          <span className="text-[9px] text-[#999] truncate text-center" style={{ flex: 2, minWidth: 0 }}>
            Competitor
          </span>
          <span className="w-[52px] flex-shrink-0" />
        </div>

        {/* Data rows */}
        <div className="space-y-0.5">
          {rows.map((row, ri) => (
            <div
              key={ri}
              draggable
              onDragStart={() => setDraggedRowIdx(ri)}
              onDragEnter={() => {
                dragCounter.current++;
                setDragOverRowIdx(ri);
              }}
              onDragLeave={() => {
                dragCounter.current--;
                if (dragCounter.current === 0) setDragOverRowIdx(null);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                dragCounter.current = 0;
                if (draggedRowIdx !== null && draggedRowIdx !== ri) {
                  moveRow(draggedRowIdx, ri);
                }
                setDraggedRowIdx(null);
                setDragOverRowIdx(null);
              }}
              onDragEnd={() => {
                dragCounter.current = 0;
                setDraggedRowIdx(null);
                setDragOverRowIdx(null);
              }}
              className="flex items-center gap-0.5 rounded"
              style={{
                opacity: draggedRowIdx === ri ? 0.4 : 1,
                borderTop: dragOverRowIdx === ri && draggedRowIdx !== ri ? '2px solid #FBB931' : '2px solid transparent',
                cursor: draggedRowIdx === ri ? 'grabbing' : 'grab',
              }}
            >
              {/* Row number */}
              <span
                className="w-5 flex-shrink-0 text-[9px] text-center select-none"
                style={{ color: '#999' }}
              >
                {ri + 1}
              </span>

              {/* Label cell */}
              <input
                type="text"
                value={row.label[gridLang] || ''}
                onChange={(e) => updateCellValue(ri, 'label', gridLang, e.target.value)}
                className="px-1.5 py-1 text-[11px] rounded border focus:outline-none focus:border-[#FBB931]"
                style={{ flex: 1, minWidth: 0, color: '#1A1A1A', background: '#fff', borderColor: '#E5E5E5' }}
                placeholder="Row label"
              />

              {/* MoreHarvest cell */}
              <input
                type="text"
                value={row.moreHarvestValue[gridLang] || ''}
                onChange={(e) => updateCellValue(ri, 'moreHarvestValue', gridLang, e.target.value)}
                className="px-1.5 py-1 text-[11px] rounded border focus:outline-none focus:border-[#FBB931]"
                style={{ flex: 2, minWidth: 0, color: '#1A1A1A', background: '#FDF3D0', borderColor: '#FBB931' }}
                placeholder="MoreHarvest value"
              />

              {/* Competitor cell */}
              <input
                type="text"
                value={row.competitorValue[gridLang] || ''}
                onChange={(e) => updateCellValue(ri, 'competitorValue', gridLang, e.target.value)}
                className="px-1.5 py-1 text-[11px] rounded border focus:outline-none focus:border-[#FBB931]"
                style={{ flex: 2, minWidth: 0, color: '#1A1A1A', background: '#fff', borderColor: '#E5E5E5' }}
                placeholder="Competitor value"
              />

              {/* Row actions */}
              <div className="flex items-center gap-0.5 w-[52px] flex-shrink-0 justify-end">
                <button
                  onClick={() => {
                    if (ri > 0) moveRow(ri, ri - 1);
                  }}
                  disabled={ri === 0}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => {
                    if (ri < rows.length - 1) moveRow(ri, ri + 1);
                  }}
                  disabled={ri === rows.length - 1}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                  title="Move down"
                >
                  ▼
                </button>
                <button
                  onClick={() => removeRow(ri)}
                  disabled={rows.length <= MIN_ROWS}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                  style={{ color: '#999' }}
                  title="Delete row"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="text-[10px] text-[#999] py-2 text-center">No rows yet. Add a row or paste from Excel.</p>
        )}
      </div>

      {/* Paste from Excel modal */}
      {showPasteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setShowPasteModal(false)}
        >
          <div
            className="rounded-lg shadow-lg p-4 w-80"
            style={{ background: '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Paste from Excel</h3>
            <p className="text-[11px] text-[#666] mb-2">
              Copy your three columns from Excel (row label, MoreHarvest value, competitor value) and paste here.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full h-32 px-2 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931] resize-none"
              style={{ color: '#1A1A1A', fontFamily: 'monospace' }}
              placeholder="Paste tab-separated data here..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setShowPasteModal(false); setPasteText(''); }}
                className="px-3 py-1.5 text-xs rounded border border-[#E5E5E5] transition-colors hover:bg-[#F2F2F2]"
                style={{ color: '#333' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePaste}
                disabled={!pasteText.trim()}
                className="px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-30"
                style={{ background: '#FBB931', color: '#1A1A1A' }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      <hr className="border-[#E5E5E5]" />

      {/* Source citation */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Source Citation</label>
        <LanguageTabs
          field={sourceCitation as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'sourceCitation', lang, value)}
          multiline
          placeholder="e.g. Source: https://..."
        />
      </fieldset>
    </div>
  );
}
